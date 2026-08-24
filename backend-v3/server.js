// =============================================================================
// CodeSeekho V2 -- AI Avatar Video Pipeline | server.js | Port 3002
// Features: Unlimited scenes, full content coverage, audio-subtitle sync
// =============================================================================
import express           from 'express';
import cors              from 'cors';
import dotenv            from 'dotenv';
import { exec }          from 'child_process';
import { promisify }     from 'util';
import fs                from 'fs/promises';
import { existsSync }    from 'fs';
import path              from 'path';
import { fileURLToPath } from 'url';
import { v4 as uuidv4 }  from 'uuid';
import multer            from 'multer';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { createClient }  from '@supabase/supabase-js';
import { extractText }   from './fileProcessor.js';
import { generateSpeech, getVoiceStatus } from './voiceGenerator.js';
import { generateScriptWithRotation } from './llmRotation.js';

dotenv.config();
const execAsync = promisify(exec);
const __dirname = path.dirname(fileURLToPath(import.meta.url));

const REQUIRED_ENV = ['GEMINI_API_KEY', 'SUPABASE_URL', 'SUPABASE_KEY'];
const missingEnv   = REQUIRED_ENV.filter(k => !process.env[k]);
if (missingEnv.length > 0) { console.error(`Missing env: ${missingEnv.join(', ')}`); process.exit(1); }

const PORT          = parseInt(process.env.PORT ?? '3002', 10);
const REMOTION_ROOT = process.env.REMOTION_PROJECT_PATH ?? path.join(__dirname, '..');
const AUDIO_DIR     = path.join(__dirname, 'out', 'audio');
const VIDEO_DIR     = path.join(__dirname, 'out', 'video');
const UPLOADS_DIR   = path.join(__dirname, 'out', 'uploads');
const SUPABASE_BUCKET = 'sih_videos';
const SUPABASE_TABLE  = 'videos';
const ALLOWED_SCENE_TYPES       = new Set(['intro', 'code', 'visual']);
const ALLOWED_VISUAL_ANIMATIONS = new Set(['forLoopIterator', 'whileCounter']);
const DID_API_KEY = process.env.DID_API_KEY?.trim();
const HF_API_KEY  = process.env.HUGGINGFACE_API_KEY?.trim();

const genAI    = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

for (const dir of [AUDIO_DIR, VIDEO_DIR, UPLOADS_DIR]) {
  if (!existsSync(dir)) await fs.mkdir(dir, { recursive: true });
}

const ALLOWED_EXTS = new Set(['.pptx', '.ppt', '.pdf', '.txt', '.md', '.odp']);
const upload = multer({
  storage: multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, UPLOADS_DIR),
    filename:    (_req, file, cb) => cb(null, `${uuidv4()}${path.extname(file.originalname).toLowerCase()}`),
  }),
  fileFilter: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    ALLOWED_EXTS.has(ext) ? cb(null, true) : cb(new Error(`Unsupported: ${ext}`));
  },
  limits: { fileSize: 50 * 1024 * 1024 },
});

const app = express();
app.use(cors());
app.use(express.json({ limit: '2mb' }));
app.use(express.static(path.join(__dirname, 'public')));
app.use('/audio', express.static(AUDIO_DIR));

// =============================================================================
// SSE Progress System
// Each job stores: { pct, phase, message, done, error }
// Connected clients stored per jobId for real-time push
// =============================================================================
const jobProgress  = new Map();   // jobId -> { pct, phase, message, done, error }
const sseClients   = new Map();   // jobId -> Set of res objects

function emitProgress(jobId, pct, phase, message, isError = false) {
  const state = { pct: Math.min(100, Math.round(pct)), phase, message, done: pct >= 100 || isError, isError };
  jobProgress.set(jobId, state);
  const clients = sseClients.get(jobId);
  if (clients) {
    const data = `data: ${JSON.stringify(state)}\n\n`;
    for (const res of clients) {
      try { res.write(data); } catch {}
    }
    if (state.done) {
      setTimeout(() => { jobProgress.delete(jobId); sseClients.delete(jobId); }, 30000);
    }
  }
  console.log(`   [${Math.round(pct)}%] ${phase} -- ${message}`);
}

// SSE endpoint: GET /progress/:jobId
app.get('/progress/:jobId', (req, res) => {
  const { jobId } = req.params;
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    'Access-Control-Allow-Origin': '*'
  });
  res.write('\n'); // flush headers

  // Send current state immediately if available
  const current = jobProgress.get(jobId);
  if (current) res.write(`data: ${JSON.stringify(current)}\n\n`);

  // Register client
  if (!sseClients.has(jobId)) sseClients.set(jobId, new Set());
  sseClients.get(jobId).add(res);

  // Keep-alive heartbeat every 15s to prevent timeouts
  const heartbeat = setInterval(() => {
    res.write(': heartbeat\n\n');
  }, 15000);

  req.on('close', () => {
    clearInterval(heartbeat);
    const s = sseClients.get(jobId);
    if (s) { s.delete(res); if (s.size === 0) sseClients.delete(jobId); }
  });
});

// =============================================================================
// Health check
// =============================================================================
app.get('/health', (_req, res) => {
  const voice = getVoiceStatus();
  res.json({
    status: 'ok', service: 'CodeSeekho V2 -- AI Avatar', port: PORT,
    avatar: {
      did:           DID_API_KEY ? 'Active' : 'No key',
      sadtalker:     HF_API_KEY  ? 'Active (HuggingFace)' : 'No HF key',
      remotionAvatar:'Always active',
      using: DID_API_KEY ? 'D-ID -> SadTalker -> Remotion Avatar'
           : HF_API_KEY  ? 'SadTalker -> Remotion Avatar'
           : 'Remotion Avatar (animated)',
    },
    voices: { using: voice.activeEngine, elevenlabs: voice.elevenlabs, edgeTTS: true },
    timestamp: new Date().toISOString(),
  });
});

// =============================================================================
// GET /credits  — Live credit/quota status for all AI APIs
// =============================================================================
app.get('/credits', async (_req, res) => {
  const results = [];

  // 1. Gemini — check via a tiny prompt, read quota headers
  try {
    const { GoogleGenerativeAI } = await import('@google/generative-ai');
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-3.5-flash-lite' });
    await model.generateContent('say ok');
    results.push({ name: 'Gemini 3.5 Flash Lite', status: 'ok', info: 'Responding normally', limit: '20 req/day (free)', color: 'green' });
  } catch(e) {
    const is429 = e.message?.includes('429') || e.message?.includes('quota');
    results.push({ name: 'Gemini 3.5 Flash Lite', status: is429 ? 'rate_limited' : 'error', info: is429 ? 'Daily quota hit (20/day free limit)' : e.message?.slice(0,80), limit: '20 req/day (free)', color: is429 ? 'orange' : 'red' });
  }

  // 2. Groq — check via models list (fast, no quota cost)
  try {
    const gr = await fetch('https://api.groq.com/openai/v1/models', { headers: { Authorization: 'Bearer ' + process.env.GROQ_API_KEY } });
    if (gr.ok) {
      const d = await gr.json();
      results.push({ name: 'Groq (Qwen 3.6)', status: 'ok', info: d.data?.length + ' models available', limit: '14,400 tok/min (free)', color: 'green' });
    } else {
      results.push({ name: 'Groq (Qwen 3.6)', status: 'error', info: 'API returned ' + gr.status, limit: '14,400 tok/min (free)', color: 'red' });
    }
  } catch(e) {
    results.push({ name: 'Groq (Qwen 3.6)', status: 'error', info: e.message?.slice(0,60), limit: '14,400 tok/min (free)', color: 'red' });
  }

  // 3. Cloudflare — check via a tiny prompt
  try {
    const cf = await fetch(`https://api.cloudflare.com/client/v4/accounts/${process.env.CLOUDFLARE_ACCOUNT_ID}/ai/run/@cf/meta/llama-3.1-8b-instruct`, {
      method: 'POST',
      headers: { Authorization: 'Bearer ' + process.env.CLOUDFLARE_API_KEY, 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages: [{ role: 'user', content: 'hello' }] })
    });
    if (cf.ok) {
      results.push({ name: 'Cloudflare (Llama 3.1)', status: 'ok', info: 'Responding normally', limit: '10,000 req/day (free)', color: 'green' });
    } else {
      results.push({ name: 'Cloudflare (Llama 3.1)', status: 'error', info: 'API returned ' + cf.status, limit: '10,000 req/day (free)', color: 'red' });
    }
  } catch(e) {
    results.push({ name: 'Cloudflare (Llama 3.1)', status: 'error', info: e.message?.slice(0,60), limit: '10,000 req/day (free)', color: 'red' });
  }

  // 4. OpenRouter — check key info + usage
  try {
    const or = await fetch('https://openrouter.ai/api/v1/auth/key', { headers: { Authorization: 'Bearer ' + process.env.OPENROUTER_API_KEY } });
    if (or.ok) {
      const d = await or.json();
      const usage = d.data?.usage_monthly ?? 0;
      const limit = d.data?.limit;
      const remaining = limit ? (limit - usage).toFixed(4) : 'Unlimited';
      results.push({ name: 'OpenRouter (Gemma 4)', status: 'ok', info: 'Monthly used: $' + usage.toFixed(4) + ' | Remaining: ' + remaining, limit: 'Free tier (50+ models)', color: 'green' });
    } else {
      results.push({ name: 'OpenRouter (Gemma 4)', status: 'error', info: 'API returned ' + or.status, limit: 'Free tier', color: 'red' });
    }
  } catch(e) {
    results.push({ name: 'OpenRouter (Gemma 4)', status: 'error', info: e.message?.slice(0,60), limit: 'Free tier', color: 'red' });
  }

  // 5. Deepgram (Voice) — check via project usage
  try {
    const dg = await fetch('https://api.deepgram.com/v1/projects', { headers: { Authorization: 'Token ' + process.env.DEEPGRAM_API_KEY } });
    if (dg.ok) {
      results.push({ name: 'Deepgram (Voice)', status: 'ok', info: 'Active & Responding', limit: '$200 Free Credit', color: 'green' });
    } else {
      results.push({ name: 'Deepgram (Voice)', status: 'error', info: 'API returned ' + dg.status, limit: '$200 Free Credit', color: 'red' });
    }
  } catch(e) {
    results.push({ name: 'Deepgram (Voice)', status: 'error', info: e.message?.slice(0,60), limit: '$200 Free Credit', color: 'red' });
  }

  // 6. ElevenLabs — check subscription (supports comma-separated multi-keys)
  try {
    const elKeys = (process.env.ELEVENLABS_API_KEY || '').split(',').map(k => k.trim()).filter(k => k.length > 10);
    if (elKeys.length > 0) {
      let totalUsed = 0;
      let totalLimit = 0;
      let anyOk = false;
      let lastStatus = null;
      
      for (const key of elKeys) {
        const el = await fetch('https://api.elevenlabs.io/v1/user/subscription', { headers: { 'xi-api-key': key } });
        if (el.ok) {
          anyOk = true;
          const d = await el.json();
          totalUsed += (d.character_count ?? 0);
          totalLimit += (d.character_limit ?? 10000);
        } else {
          lastStatus = el.status;
        }
      }

      if (anyOk) {
        const pct = ((totalUsed / totalLimit) * 100).toFixed(1);
        results.push({ name: 'ElevenLabs (Voice)', status: pct > 90 ? 'warning' : 'ok', info: totalUsed.toLocaleString() + ' / ' + totalLimit.toLocaleString() + ' chars used (' + pct + '%)', limit: totalLimit.toLocaleString() + ' chars/month', color: pct > 90 ? 'orange' : 'green', used: totalUsed, total: totalLimit, pct: parseFloat(pct) });
      } else {
        results.push({ name: 'ElevenLabs (Voice)', status: 'error', info: 'All keys failed (Last API returned ' + lastStatus + ')', limit: (elKeys.length * 10000).toLocaleString() + ' chars/month', color: 'red' });
      }
    } else {
      results.push({ name: 'ElevenLabs (Voice)', status: 'error', info: 'No valid API keys found in .env', limit: '10,000 chars/month', color: 'red' });
    }
  } catch(e) {
    results.push({ name: 'ElevenLabs (Voice)', status: 'error', info: e.message?.slice(0,60), limit: '10,000 chars/month', color: 'red' });
  }

  // 6. Edge TTS — always free
  results.push({ name: 'Edge TTS (Voice Backup)', status: 'ok', info: 'Local system TTS — always available', limit: 'Unlimited', color: 'green' });

  res.json({ credits: results, timestamp: new Date().toISOString() });
});


// =============================================================================
// Prompt Builder Helper — NotebookLM-style deep educational script
// =============================================================================
function buildScriptPrompt(rawText, targetLanguage) {
  return `You are an expert educational content creator, like NotebookLM, specializing in animated explainer videos for CodeSeekho.

Your job is to READ the full INPUT TEXT thoroughly and convert it into a deeply rich, comprehensive educational video script that:
- Covers EVERY important term, concept, keyword, and idea from the input
- Defines EVERY technical term clearly (assume the viewer is a student encountering this for the first time)
- Uses real-world analogies and examples to explain abstract concepts
- Structures content progressively (simple → complex → application)

CRITICAL TRANSLATION RULE:
The ENTIRE script (including "title", "summary", "keyTerms", "heading", "bullets", "steps", "points", and "text" narration) MUST be written in the native script of **${targetLanguage}**.
- If ${targetLanguage} is Hindi, write EVERYTHING in Devanagari script.
- If ${targetLanguage} is Bengali, write EVERYTHING in Bengali script.
- Do NOT use English letters for regional languages (e.g. no Hinglish/Romanized text unless explicitly requested).
- Code blocks (the programming syntax) stay in English, but the comments inside the code MUST be translated to ${targetLanguage}.

OUTPUT RULES:
1. ONLY raw JSON. No markdown, no backticks, no explanation.
2. Escape ALL newlines inside strings as \\n
3. Escape ALL double-quotes inside strings as \\"

SCHEMA:
{
  "title": "Descriptive educational title (max 70 chars)",
  "language": "Python",
  "summary": "A 3-4 sentence overview of the entire topic covered in this script.",
  "keyTerms": ["Term1", "Term2", "Term3", "Term4", "Term5"],
  "scenes": [ ...scene objects... ]
}

SCENE TYPES — use the most appropriate type for each concept:

A) explainer — For concepts, definitions, properties:
{ "type": "explainer", "heading": "Concept Name", "bullets": ["Point 1 with detail", "Point 2 with detail", "Point 3 with detail", "Point 4 with detail", "Point 5 with detail"], "highlights": ["Key Term 1", "Key Term 2"], "text": "Detailed 5-6 sentence narration defining the concept, explaining WHY it matters, giving a real-world analogy, and connecting it to other concepts." }

B) comparison — For comparing two approaches, technologies, concepts:
{ "type": "comparison", "leftTitle": "Concept A", "leftPoints": ["Point 1", "Point 2", "Point 3", "Point 4"], "rightTitle": "Concept B", "rightPoints": ["Point 1", "Point 2", "Point 3", "Point 4"], "text": "Detailed 5-6 sentence narration explaining the differences, when to use each, trade-offs and practical implications." }

C) flowchart — For processes, algorithms, workflows:
{ "type": "flowchart", "steps": ["Step 1: Description", "Step 2: Description", "Step 3: Description", "Step 4: Description", "Step 5: Description"], "colors": ["#7c3aed", "#0ea5e9", "#10b981", "#ef4444", "#f59e0b"], "text": "Detailed 5-6 sentence narration walking through every step, explaining what happens at each stage and why." }

D) intro — For topic overviews and summaries:
{ "type": "intro", "text": "Engaging Title\\nDetailed 6-8 sentence introduction/summary covering the full scope of what's being taught, all major themes, and why this topic is important for students." }

E) code — For programming examples:
{ "type": "code", "code": "# Detailed commented code showing the concept\\n# Each line commented\\ncode here", "text": "Detailed 5-6 sentence narration explaining what the code does line by line, what output it produces, and how it illustrates the concept." }

MANDATORY RULES — follow ALL of these:
1. MINIMUM 15 scenes. If the content is rich, generate 20-25 scenes. Cover EVERY sub-topic.
2. Every scene's "text" must be AT LEAST 4-6 sentences long — no one-liners.
3. For EVERY important term/keyword in the input: dedicate at least one bullet point or an entire scene to defining it.
4. "bullets" array must have 4-6 items per explainer scene — each bullet must be a complete thought (not just a word).
5. For code scenes: include REAL working code with comments on EVERY line.
6. Scene order: intro → concept explainer → key terms → deep dive → comparisons → code examples → flowcharts → advanced concepts → real-world applications → summary
7. The "summary" field in the root JSON must be a 3-4 sentence paragraph covering the entire topic.
8. The "keyTerms" array must list ALL important vocabulary/technical terms found in the input (minimum 8 terms).
9. Do NOT skip any section of the input text — convert EVERYTHING.
10. Text fields must use conversational, teaching-style language — like a professor explaining to students.

INPUT TEXT TO CONVERT:
"""${rawText}"""

JSON ONLY (no other text):`;
}

// =============================================================================
// Video Prompt Builder — Balanced 4-5 min, covers all key topics (10-12 scenes)
// =============================================================================
function buildVideoPrompt(rawText, targetLanguage) {
  return `You are an expert educational video scriptwriter for CodeSeekho.

GOAL: Create a BALANCED, comprehensive animated explainer video that is 4-5 minutes long.
- Cover ALL important terms, concepts, and topics from the input
- Each scene explains ONE concept clearly with enough depth that a student understands it
- Like a perfect college lecture summary — not too brief, not too long

CRITICAL TRANSLATION RULE:
The ENTIRE script (including "title", "heading", "bullets", "steps", "points", and "text" narration) MUST be written in the native script of **${targetLanguage}**.
- If ${targetLanguage} is Hindi, write EVERYTHING in Devanagari script.
- If ${targetLanguage} is Bengali, write EVERYTHING in Bengali script.
- Do NOT use English letters for regional languages (e.g. no Hinglish/Romanized text unless explicitly requested).
- Code blocks (the programming syntax) stay in English, but the comments inside the code MUST be translated to ${targetLanguage}.

OUTPUT RULES:
1. ONLY raw JSON. No markdown, no backticks, no explanation.
2. Escape ALL newlines inside strings as \\n

SCHEMA:
{
  "title": "Clear descriptive title (max 65 chars)",
  "language": "Python",
  "scenes": [ ...scene objects... ]
}

SCENE TYPES — pick the best fit for each concept:

A) intro — Opening hook + topic overview:
{ "type": "intro", "text": "Engaging Title\\n3-4 sentence opening that hooks the viewer, clearly states WHAT will be covered, and WHY this topic matters. Name all the major topics." }

B) explainer — For concepts, definitions, properties:
{ "type": "explainer", "heading": "Concept Name", "bullets": ["Point 1 — brief explanation", "Point 2 — brief explanation", "Point 3 — brief explanation", "Point 4 — brief explanation"], "highlights": ["Key Term 1", "Key Term 2"], "text": "3-4 sentence narration: define the concept, explain why it matters, give ONE real-world example or analogy, and connect it to the bigger picture." }

C) comparison — For VS / trade-offs:
{ "type": "comparison", "leftTitle": "Concept A", "leftPoints": ["Point 1", "Point 2", "Point 3", "Point 4"], "rightTitle": "Concept B", "rightPoints": ["Point 1", "Point 2", "Point 3", "Point 4"], "text": "3-4 sentences: explain the key differences, trade-offs, and when to use each option." }

D) flowchart — For processes, algorithms, steps:
{ "type": "flowchart", "steps": ["Step 1: What happens", "Step 2: What happens", "Step 3: What happens", "Step 4: What happens", "Step 5: What happens"], "colors": ["#7c3aed","#0ea5e9","#10b981","#ef4444","#f59e0b"], "text": "3-4 sentences walking through the process logically, explaining what happens at each stage." }

E) code — For programming examples:
{ "type": "code", "code": "# Commented code\\n# Each important line commented\\nactual_code_here", "text": "3-4 sentences explaining what this code does, what output it produces, and the key concept it demonstrates." }

MANDATORY RULES:
1. Generate EXACTLY 10-12 scenes. Not less, not more.
2. Scene order: 1 intro → 6-8 explainer/comparison/flowchart scenes covering ALL key topics → 1-2 code scenes → 1 summary intro
3. EVERY important term/keyword from the input MUST appear in at least one scene's bullets or heading.
4. "text" narration = 3-4 sentences per scene — detailed enough to teach, concise enough to keep pace.
5. "bullets" = 4 items per explainer scene. Each bullet is a complete thought, not just a word.
6. Do NOT skip any topic from the input — all major concepts must be covered.
7. The last scene MUST be a summary "intro" type recapping all topics covered.
8. Use conversational teaching language — like a professor explaining to students.

INPUT TEXT (cover ALL important concepts from this):
"""${rawText}"""

JSON ONLY:`;
}

// =============================================================================
// Generate endpoints
// =============================================================================
app.post('/generate', (req, res) => {
  const { raw_text, script_language } = req.body;
  if (!raw_text?.trim() || raw_text.trim().length < 10)
    return res.status(400).json({ error: "'raw_text' must be >= 10 chars." });
  
  const jobId = uuidv4();
  runPipeline(jobId, raw_text.trim(), script_language || 'English').catch(console.error);
  return res.status(200).json({ success: true, jobId });
});

app.post('/generate-from-file', upload.single('file'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: "No file. Field: 'file'" });
  const uploadedPath = req.file.path;
  const script_language = req.body.script_language || 'English';
  console.log(`\nFile: ${req.file.originalname} | Target Language: ${script_language}`);
  try {
    const rawText = await extractText(uploadedPath, req.file.mimetype, req.file.originalname);
    if (rawText.trim().length < 20) return res.status(422).json({ error: 'Text too short.' });
    
    const jobId = uuidv4();
    runPipeline(jobId, rawText, script_language).catch(console.error).finally(() => fs.unlink(uploadedPath).catch(()=>{}));
    
    return res.status(200).json({ success: true, jobId, sourceFile: req.file.originalname });
  } catch (err) {
    try { await fs.unlink(uploadedPath); } catch {}
    return res.status(500).json({ success: false, error: err.message });
  }
});

// =============================================================================
// Script-Only (Summary) endpoints
// =============================================================================
app.post('/generate-script', async (req, res) => {
  const { raw_text, script_language } = req.body;
  if (!raw_text?.trim() || raw_text.trim().length < 10)
    return res.status(400).json({ error: "'raw_text' must be >= 10 chars." });
  
  try {
    const prompt = buildScriptPrompt(raw_text.trim(), script_language || 'English');
    // Using a dummy jobId for logging, we don't emit progress to the UI here since it's a blocking await
    const script = await generateScriptWithRotation(prompt, () => {}, 'script-only');
    const markdown = scriptToMarkdown(script);
    return res.status(200).json({ success: true, markdown });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/generate-script-from-file', upload.single('file'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: "No file. Field: 'file'" });
  const uploadedPath = req.file.path;
  const script_language = req.body.script_language || 'English';
  try {
    const rawText = await extractText(uploadedPath, req.file.mimetype, req.file.originalname);
    if (rawText.trim().length < 20) return res.status(422).json({ error: 'Text too short.' });
    
    const prompt = buildScriptPrompt(rawText, script_language);
    const script = await generateScriptWithRotation(prompt, () => {}, 'script-only');
    const markdown = scriptToMarkdown(script);
  } catch (err) {
    try { await fs.unlink(uploadedPath); } catch {}
    return res.status(500).json({ success: false, error: err.message });
  }
});

// =============================================================================
// scriptToMarkdown -- NotebookLM-style rich educational summary with Index
// =============================================================================
function scriptToMarkdown(script) {
  const lines = [];
  const now   = new Date().toLocaleDateString('en-IN', { dateStyle: 'long' });

  // ── Helper: get topic title for each scene ─────────────────────────────────
  function getTopicTitle(scene, idx) {
    if (scene.type === 'intro') {
      const first = (scene.text || '').split('\\n')[0] || (scene.text || '').split(/\\n/)[0] || '';
      return first.trim() || (idx === 0 ? 'Introduction' : 'Summary');
    }
    if (scene.type === 'explainer')  return scene.heading || 'Concept Explanation';
    if (scene.type === 'comparison') return `${scene.leftTitle || 'A'} vs ${scene.rightTitle || 'B'}`;
    if (scene.type === 'flowchart')  return scene.steps?.[0]?.replace(/^step \d+[:\s]*/i,'') ? `Process: ${(scene.steps[0]||'').replace(/^Step \d+[:\s]*/i,'')}` : 'Process Flow';
    if (scene.type === 'code')       return 'Code Example';
    return `Topic ${idx + 1}`;
  }

  // Pre-build topic titles list for index
  const topicTitles = script.scenes.map((s, i) => getTopicTitle(s, i));

  // ── Header ────────────────────────────────────────────────────────────────
  lines.push(`# 📚 ${script.title}`);
  lines.push(`> **Generated:** ${now} | **Topics:** ${script.scenes.length} | **Language:** ${script.language || 'General'} | *CodeSeekho AI*`);
  lines.push('');

  // ── Topic Overview ─────────────────────────────────────────────────────────
  if (script.summary) {
    lines.push('## 🎯 Overview');
    lines.push('');
    lines.push(script.summary);
    lines.push('');
    lines.push('---');
    lines.push('');
  }

  // ── 📋 INDEX / Table of Contents ──────────────────────────────────────────
  lines.push('## 📋 Index — Topics Covered');
  lines.push('');
  topicTitles.forEach((title, i) => {
    const icon = (() => {
      const t = script.scenes[i].type;
      if (t === 'intro')      return i === 0 ? '🚀' : '🏁';
      if (t === 'explainer')  return '📘';
      if (t === 'comparison') return '⚖️';
      if (t === 'flowchart')  return '🔄';
      if (t === 'code')       return '💻';
      return '📌';
    })();
    lines.push(`${i + 1}. ${icon} **${title}**`);
  });
  lines.push('');
  lines.push('---');
  lines.push('');

  // ── Key Terms Glossary ─────────────────────────────────────────────────────
  if (script.keyTerms?.length) {
    lines.push('## 🔑 Key Terms & Vocabulary');
    lines.push('');
    script.keyTerms.forEach(term => lines.push(`- **${term}**`));
    lines.push('');
    lines.push('---');
    lines.push('');
  }

  // ── Topic-by-Topic Content ─────────────────────────────────────────────────
  lines.push('## 📖 Detailed Topic Breakdown');
  lines.push('');

  script.scenes.forEach((scene, idx) => {
    const n = idx + 1;
    const topicLabel = `Topic ${n}`;
    const topicTitle = topicTitles[idx];

    if (scene.type === 'intro') {
      const parts = (scene.text || '').split(/\\n|\\\\n/);
      lines.push(`### ${topicLabel}: ${topicTitle}`);
      lines.push('');
      const body = parts.slice(1).join(' ').trim();
      if (body) lines.push(body);
      else if (scene.text) lines.push(scene.text.replace(/\\\\n/g, ' ').replace(/\\n/g, ' '));
      lines.push('');

    } else if (scene.type === 'explainer') {
      lines.push(`### ${topicLabel}: ${topicTitle}`);
      lines.push('');
      if (scene.bullets?.length) {
        scene.bullets.forEach(b => lines.push(`- ${b}`));
        lines.push('');
      }
      if (scene.text) {
        lines.push('**📢 Explanation:**');
        lines.push('');
        lines.push('> ' + scene.text.replace(/\\\\n/g, ' ').replace(/\\n/g, ' '));
        lines.push('');
      }
      if (scene.highlights?.length) {
        lines.push(`**🏷️ Key Terms:** ${scene.highlights.map(h => `\`${h}\``).join(' · ')}`);
        lines.push('');
      }

    } else if (scene.type === 'comparison') {
      lines.push(`### ${topicLabel}: ${topicTitle}`);
      lines.push('');
      const leftPts  = scene.leftPoints  || [];
      const rightPts = scene.rightPoints || [];
      const maxRows  = Math.max(leftPts.length, rightPts.length);
      lines.push(`| **${scene.leftTitle || 'Option A'}** | **${scene.rightTitle || 'Option B'}** |`);
      lines.push('|---|---|');
      for (let i = 0; i < maxRows; i++) {
        lines.push(`| ${leftPts[i] || ''} | ${rightPts[i] || ''} |`);
      }
      lines.push('');
      if (scene.text) {
        lines.push('**📢 Explanation:**');
        lines.push('');
        lines.push('> ' + scene.text.replace(/\\\\n/g, ' ').replace(/\\n/g, ' '));
        lines.push('');
      }

    } else if (scene.type === 'flowchart') {
      lines.push(`### ${topicLabel}: ${topicTitle}`);
      lines.push('');
      if (scene.steps?.length) {
        scene.steps.forEach((step, i) => lines.push(`${i + 1}. **${step}**`));
        lines.push('');
      }
      if (scene.text) {
        lines.push('**📢 Explanation:**');
        lines.push('');
        lines.push('> ' + scene.text.replace(/\\\\n/g, ' ').replace(/\\n/g, ' '));
        lines.push('');
      }

    } else if (scene.type === 'code') {
      lines.push(`### ${topicLabel}: ${topicTitle}`);
      lines.push('');
      if (scene.code) {
        const lang = (script.language || 'python').toLowerCase().replace('c++', 'cpp').replace('c#', 'csharp');
        lines.push('```' + lang);
        lines.push(scene.code.replace(/\\\\n/g, '\n').replace(/\\n/g, '\n'));
        lines.push('```');
        lines.push('');
      }
      if (scene.text) {
        lines.push('**📢 Explanation:**');
        lines.push('');
        lines.push('> ' + scene.text.replace(/\\\\n/g, ' ').replace(/\\n/g, ' '));
        lines.push('');
      }
    }

    lines.push('---');
    lines.push('');
  });

  lines.push(`*📅 Generated on ${now} by CodeSeekho AI — Powered by NotebookLM-style deep educational scripting*`);
  return lines.join('\n');
}

app.get('/script/:jobId/markdown', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from(SUPABASE_TABLE).select('*').eq('job_id', req.params.jobId).single();
    if (error || !data) return res.status(404).json({ error: 'Job not found' });
    const script = data.script_json;
    const md     = scriptToMarkdown(script);
    const fname  = (script.title || 'script').replace(/[^a-z0-9]/gi, '_').toLowerCase();
    res.setHeader('Content-Type', 'text/markdown; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${fname}.md"`);
    return res.send(md);
  } catch(err) { return res.status(500).json({ error: err.message }); }
});

// =============================================================================
// extractJSON -- Robust Gemini response cleaner
// =============================================================================
function extractJSON(raw) {
  let text = raw
    .replace(/^\uFEFF/, '')
    .replace(/^```(?:json)?\s*/im, '')
    .replace(/\s*```\s*$/m, '')
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u201C\u201D]/g, '"')
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g, '')
    .trim();

  try { return JSON.parse(text); } catch (_) {}

  const start = text.indexOf('{');
  const end   = text.lastIndexOf('}');
  if (start !== -1 && end !== -1 && end > start) {
    try { return JSON.parse(text.slice(start, end + 1)); } catch (_) {}
  }

  const cleaned = text.replace(/,\s*([}\]])/g, '$1');
  try { return JSON.parse(cleaned); } catch (_) {}

  const s2 = cleaned.indexOf('{');
  const e2 = cleaned.lastIndexOf('}');
  if (s2 !== -1 && e2 !== -1 && e2 > s2) {
    return JSON.parse(cleaned.slice(s2, e2 + 1));
  }

  throw new Error('Could not extract valid JSON from Gemini response');
}

// =============================================================================
// generateSubtitleWords -- Create word-level subtitle timing from text
// Calculates when each word should appear based on audio duration (FPS=30)
// =============================================================================
function generateSubtitleWords(text, audioDurationSec, fps = 30) {
  const words = text.split(/\s+/).filter(Boolean);
  if (words.length === 0) return [];
  const totalFrames  = Math.round(audioDurationSec * fps);
  const framesPerWord = totalFrames / words.length;
  return words.map((word, i) => ({
    word,
    startFrame: Math.round(i * framesPerWord),
    endFrame:   Math.round((i + 1) * framesPerWord),
  }));
}

// Get audio duration in seconds using ffprobe if available, else estimate by word count
async function getAudioDuration(audioPath, text) {
  try {
    const { stdout } = await execAsync(
      `ffprobe -v quiet -print_format json -show_streams "${audioPath}"`,
      { timeout: 10000 }
    );
    const info = JSON.parse(stdout);
    const dur  = parseFloat(info?.streams?.[0]?.duration ?? 0);
    if (dur > 0) return dur;
    throw new Error('Invalid duration from ffprobe');
  } catch {
    // ffprobe not available -- estimate from word count (~2.5 words / sec)
    const wordCount = text.split(/\s+/).filter(Boolean).length;
    return Math.max((wordCount / 2.5), 3); // minimum 3 seconds
  }
}

// =============================================================================
// runPipeline -- 5-Phase AI Avatar Pipeline
// =============================================================================
async function runPipeline(jobId, rawText, targetLanguage = 'English') {
  const phase     = { current: 'init' };
  const tempFiles = [];

  console.log(`\n${'='.repeat(60)}\nV2 Avatar Job: ${jobId} | Target Language: ${targetLanguage}\n${'='.repeat(60)}`);
  emitProgress(jobId, 2, 'init', `Job started... Target language: ${targetLanguage}`);

  try {
    // PHASE 1 -- Fast video script (max 8 scenes, short narration)
    phase.current = 'gemini';
    console.log('\n[1/5] LLM -- generating SHORT video script (max 8 scenes)...');
    emitProgress(jobId, 5, 'gemini', `AI writing concise video script in ${targetLanguage}...`);
    
    const prompt = buildVideoPrompt(rawText, targetLanguage);

    let script;
    try {
      script = await generateScriptWithRotation(prompt, emitProgress, jobId);
    } catch(err) {
      throw Object.assign(new Error(`LLM failed: ${err.message}`), { phase: 'gemini' });
    }
    
    // validateScript(script); // Skipping basic validation to allow new types smoothly
    console.log(`   Script: "${script.title}" | ${script.scenes.length} scenes | ${script.language}`);
    emitProgress(jobId, 20, 'gemini', `Script ready: ${script.scenes.length} scenes generated`);

    // PHASE 2 -- AI Voice + subtitle word timing for ALL scenes
    phase.current = 'voice';
    console.log('\n[2/5] AI Voice + subtitle timing...');
    emitProgress(jobId, 22, 'voice', 'Starting AI voice generation...');
    const audioFiles = [];
    const totalScenes = script.scenes.length;
    let voiceDone = 0;
    for (let i = 0; i < script.scenes.length; i++) {
      const scene = script.scenes[i];
      const voiceText = scene.text || scene.heading || scene.steps?.join('. ') || 'Scene ' + (i + 1);
      if (!voiceText?.trim()) { voiceDone++; continue; }
      const audioPath = path.join(AUDIO_DIR, `${jobId}_scene_${i}.mp3`);
      tempFiles.push(audioPath);
      try {
        const { engine } = await generateSpeech(voiceText, audioPath);
        const durationSec = await getAudioDuration(audioPath, voiceText);
        const subtitleWords = generateSubtitleWords(voiceText, durationSec);
        audioFiles.push({ sceneIndex: i, path: audioPath, engine, durationSec, subtitleWords });
        voiceDone++;
        const voicePct = 22 + (voiceDone / totalScenes) * 18;
        emitProgress(jobId, voicePct, 'voice', `Voice: scene ${voiceDone}/${totalScenes} done [${engine}]`);
        console.log(`   Scene ${i} [${scene.type}] -> [${engine}] ${durationSec?.toFixed(1)}s ${subtitleWords.length} words`);
      } catch(e) { console.warn(`   Voice skipped scene ${i}: ${e.message}`); voiceDone++; }
    }
    emitProgress(jobId, 40, 'voice', `Voice complete: ${audioFiles.length} audio files`);
    console.log(`   Voice: ${audioFiles.length} audio files`);

    // PHASE 3 -- Avatar generation
    phase.current = 'avatar';
    console.log('\n[3/5] Avatar generation...');
    emitProgress(jobId, 42, 'avatar', 'Starting avatar generation...');
    const avatarResults = [];
    for (let ai = 0; ai < audioFiles.length; ai++) {
      const af = audioFiles[ai];
      const avatarVideoPath = path.join(AUDIO_DIR, `${jobId}_avatar_${af.sceneIndex}.mp4`);
      tempFiles.push(avatarVideoPath);
      const result = await generateAvatar(af.path, avatarVideoPath);
      avatarResults.push({ ...af, avatarPath: result.path, avatarEngine: result.engine });
      const avatarPct = 42 + ((ai + 1) / audioFiles.length) * 13;
      emitProgress(jobId, avatarPct, 'avatar', `Avatar: scene ${ai + 1}/${audioFiles.length} [${result.engine}]`);
      console.log(`   Scene ${af.sceneIndex} avatar -> [${result.engine}]`);
    }
    emitProgress(jobId, 55, 'avatar', `Avatar complete: ${avatarResults[0]?.avatarEngine ?? 'Remotion-Avatar'}`);

    // PHASE 4 -- Remotion render with enriched props
    phase.current = 'render';
    console.log('\n[4/5] Remotion render...');
    emitProgress(jobId, 57, 'render', 'Preparing scene data for render...');
    const jobScriptPath   = path.join(__dirname, `temp_v2_${jobId}.json`);
    const outputVideoPath = path.join(VIDEO_DIR, `${jobId}.mp4`);
    tempFiles.push(jobScriptPath, outputVideoPath);

    // Copy audio files to Remotion's public/audio folder so they're accessible during render
    const remotionPublicAudio = path.join(REMOTION_ROOT, 'public', 'audio');
    await fs.mkdir(remotionPublicAudio, { recursive: true });

    const remotionAudioFiles = [];
    for (const [idx, af] of audioFiles.entries()) {
      const audioFilename = `${jobId}_scene_${af.sceneIndex ?? idx}.mp3`;
      const destPath = path.join(remotionPublicAudio, audioFilename);
      await fs.copyFile(af.path, destPath);
      tempFiles.push(destPath);   // clean up after render
      remotionAudioFiles.push({
        sceneIndex:    af.sceneIndex ?? idx,
        path:          `/audio/${audioFilename}`,  // Remotion's staticFile path (relative to public/)
        durationSec:   af.durationSec ?? 10,
        subtitleWords: af.subtitleWords ?? [],
      });
    }

    // Root.jsx V3VideoEngine expects: { script: { scenes, language, ... }, audioFiles: [...], avatarEngine }
    const remotionProps = {
      script: { ...script },
      audioFiles: remotionAudioFiles,
      avatarEngine: avatarResults[0]?.avatarEngine ?? 'Remotion-Avatar',
    };
    await fs.writeFile(jobScriptPath, JSON.stringify(remotionProps, null, 2), 'utf8');

    emitProgress(jobId, 60, 'render', `Rendering ${script.scenes.length} scenes via Remotion...`);
    const propsArg  = jobScriptPath.replace(/\\/g, '/');
    const outputArg = outputVideoPath.replace(/\\/g, '/');
    const renderCmd = `npx remotion render src/Root.jsx CodeSeekho-Avatar "${outputArg}" --props="${propsArg}" --log=verbose`;
    console.log(`   ${renderCmd}`);

    // Stream render progress by parsing Remotion output
    const renderProc = exec(renderCmd, { cwd: REMOTION_ROOT, maxBuffer: 100*1024*1024 });
    await new Promise((resolve, reject) => {
      renderProc.stdout?.on('data', (data) => {
        const s = data.toString();
        const m = s.match(/Rendered (\d+)\/(\d+)/);
        if (m) {
          const done = parseInt(m[1]), total = parseInt(m[2]);
          const renderPct = 60 + (done / total) * 25;
          emitProgress(jobId, renderPct, 'render', `Rendering frame ${done}/${total} (${Math.round(done/total*100)}%)`);
        }
      });
      renderProc.on('close', code => code === 0 ? resolve() : reject(new Error(`Remotion exit ${code}`)));
      renderProc.on('error', reject);
    });
    emitProgress(jobId, 85, 'render', 'Render complete!');
    console.log(`   Rendered: ${path.basename(outputVideoPath)}`);

    // PHASE 5 -- Compress + Supabase upload
    phase.current = 'upload';
    console.log('\n[5/5] Compressing + Supabase upload...');
    emitProgress(jobId, 85, 'upload', 'Compressing video for fast upload...');

    // Compress with ffmpeg: CRF 28, 720p max, reduce size by ~60%
    const compressedPath = outputVideoPath.replace('.mp4', '_compressed.mp4');
    let uploadPath = outputVideoPath;
    try {
      const ffmpegCmd = `ffmpeg -y -i "${outputVideoPath}" -vf "scale=trunc(min(iw\\,1280)/2)*2:trunc(min(ih\\,720)/2)*2" -c:v libx264 -crf 28 -preset fast -c:a aac -b:a 96k "${compressedPath}"`;
      await execAsync(ffmpegCmd, { timeout: 300_000 });
      const origSize = (await fs.stat(outputVideoPath)).size;
      const compSize = (await fs.stat(compressedPath)).size;
      console.log(`   Compressed: ${(origSize/1024/1024).toFixed(1)} MB → ${(compSize/1024/1024).toFixed(1)} MB`);
      uploadPath = compressedPath;
      tempFiles.push(compressedPath);
    } catch (ffmpegErr) {
      console.warn(`   ⚠️ Compression failed (${ffmpegErr.message}), uploading original...`);
      uploadPath = outputVideoPath;
    }

    const supabasePath = `videos/v2_${jobId}.mp4`;
    const videoBuffer  = await fs.readFile(uploadPath);
    const sizeMB = (videoBuffer.length / 1024 / 1024).toFixed(1);
    emitProgress(jobId, 90, 'upload', `Uploading to Supabase (${sizeMB} MB)...`);
    const { error: uploadErr } = await supabase.storage.from(SUPABASE_BUCKET)
      .upload(supabasePath, videoBuffer, { contentType: 'video/mp4', upsert: false });
    if (uploadErr) throw Object.assign(new Error(`Upload: ${uploadErr.message}`), { phase: 'upload' });
    emitProgress(jobId, 96, 'upload', 'Upload done! Saving to database...');

    const { data: urlData } = supabase.storage.from(SUPABASE_BUCKET).getPublicUrl(supabasePath);
    const publicUrl = urlData.publicUrl;
    console.log(`   URL: ${publicUrl}`);

    await supabase.from(SUPABASE_TABLE).insert({
      job_id: jobId, title: script.title, language: script.language,
      scene_count: script.scenes.length, script_json: script,
      video_url: publicUrl, storage_path: supabasePath,
      status: 'completed', created_at: new Date().toISOString(),
    });

    console.log(`\nV2 Job ${jobId} complete! ${script.scenes.length} scenes`);
    emitProgress(jobId, 100, 'done', 'Video ready! Redirecting...');
    // Clean up SSE after 30s
    setTimeout(() => { jobProgress.delete(jobId); sseClients.delete(jobId); }, 30000);

    return {
      success: true, jobId, videoUrl: publicUrl,
      title: script.title, language: script.language,
      sceneCount: script.scenes.length,
      audioCount: audioFiles.length,
      avatarEngine: avatarResults[0]?.avatarEngine ?? 'Remotion-Avatar',
      version: 'v2-avatar', timestamp: new Date().toISOString(),
    };

  } catch(err) {
    err.phase = err.phase ?? phase.current;
    console.error(`\nV2 FAILED [${err.phase}]: ${err.message}`);
    emitProgress(jobId, phase.current === 'init' ? 0 : 50, err.phase, `Error: ${err.message}`, true);
    throw err;
  } finally {
    for (const f of tempFiles) { try { await fs.unlink(f); } catch {} }
  }
}

// =============================================================================
// generateAvatar -- D-ID -> SadTalker -> Remotion fallback
// =============================================================================
async function generateAvatar(audioPath, outputPath) {
  if (DID_API_KEY) {
    try { await generateWithDID(audioPath, outputPath); return { path: outputPath, engine: 'D-ID' }; }
    catch(e) { console.warn(`   D-ID failed: ${e.message.slice(0,60)}`); }
  }
  if (HF_API_KEY) {
    try { await generateWithSadTalker(audioPath, outputPath); return { path: outputPath, engine: 'SadTalker' }; }
    catch(e) { console.warn(`   SadTalker failed: ${e.message.slice(0,60)}`); }
  }
  return { path: null, engine: 'Remotion-Avatar' };
}

async function generateWithDID(audioPath, outputPath) {
  const audioBase64 = (await fs.readFile(audioPath)).toString('base64');
  const createRes = await fetch('https://api.d-id.com/talks', {
    method: 'POST',
    headers: { 'Authorization': `Basic ${DID_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      source_url: 'https://create-images-results.d-id.com/DefaultPresenters/Nicola_f/image.jpeg',
      script: { type: 'audio', audio_url: `data:audio/mpeg;base64,${audioBase64}` },
      config: { stitch: true },
    }),
  });
  if (!createRes.ok) throw new Error(`D-ID HTTP ${createRes.status}`);
  const { id } = await createRes.json();
  for (let i = 0; i < 24; i++) {
    await new Promise(r => setTimeout(r, 5000));
    const s = await (await fetch(`https://api.d-id.com/talks/${id}`, { headers: { 'Authorization': `Basic ${DID_API_KEY}` } })).json();
    if (s.status === 'done' && s.result_url) {
      await fs.writeFile(outputPath, Buffer.from(await (await fetch(s.result_url)).arrayBuffer()));
      return;
    }
    if (s.status === 'error') throw new Error(`D-ID: ${s.error?.description}`);
  }
  throw new Error('D-ID timeout');
}

async function generateWithSadTalker(audioPath, outputPath) {
  const res = await fetch('https://api-inference.huggingface.co/models/vinthony/SadTalker', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${HF_API_KEY}`, 'Content-Type': 'application/octet-stream' },
    body: await fs.readFile(audioPath),
    signal: AbortSignal.timeout(120_000),
  });
  if (!res.ok) throw new Error(`SadTalker HTTP ${res.status}`);
  const buf = Buffer.from(await res.arrayBuffer());
  if (buf.length < 1000) throw new Error('Empty response');
  await fs.writeFile(outputPath, buf);
}

// =============================================================================
// validateScript
// =============================================================================
function validateScript(script) {
  if (!script?.title?.trim()) throw new Error("'title' required");
  if (typeof script.duration !== 'number') throw new Error("'duration' must be number");
  if (!['Python','C++'].includes(script.language)) throw new Error("'language' must be Python or C++");
  if (!Array.isArray(script.scenes) || script.scenes.length < 2) throw new Error("Need >= 2 scenes");
  for (let i = 0; i < script.scenes.length; i++) {
    const s = script.scenes[i];
    if (!ALLOWED_SCENE_TYPES.has(s.type)) throw new Error(`scenes[${i}].type invalid: '${s.type}'`);
    if (s.type === 'intro'  && !s.text?.trim()) throw new Error(`scenes[${i}] intro needs text`);
    if (s.type === 'code'   && !s.code?.trim()) throw new Error(`scenes[${i}] code needs code`);
    if (s.type === 'visual' && !ALLOWED_VISUAL_ANIMATIONS.has(s.animation))
      throw new Error(`scenes[${i}] animation must be forLoopIterator|whileCounter, got '${s.animation}'`);
  }
}

// =============================================================================
// Jobs endpoints
// =============================================================================
app.get('/jobs/:jobId', async (req, res) => {
  const { data, error } = await supabase.from(SUPABASE_TABLE).select('*').eq('job_id', req.params.jobId).single();
  if (error || !data) return res.status(404).json({ error: 'Not found' });
  return res.json({ success: true, job: data });
});

app.get('/jobs', async (_req, res) => {
  const { data, error } = await supabase.from(SUPABASE_TABLE)
    .select('job_id,title,language,scene_count,video_url,created_at')
    .order('created_at', { ascending: false }).limit(50);
  if (error) return res.status(500).json({ error: error.message });
  return res.json({ success: true, count: data.length, jobs: data });
});

app.use((_req, res) => res.status(404).json({ error: 'Route not found' }));
app.use((err, _req, res, _next) => res.status(500).json({ error: err.message }));

app.listen(PORT, () => {
  console.log(`\n${'='.repeat(64)}`);
  console.log(`  CodeSeekho V2 -- AI Avatar Pipeline`);
  console.log(`  http://localhost:${PORT}`);
  console.log(`  Scenes: UNLIMITED (covers all content)`);
  console.log(`  Avatar: ${DID_API_KEY ? 'D-ID' : HF_API_KEY ? 'SadTalker' : 'Remotion Animated'}`);
  console.log(`  Voice : ${process.env.ELEVENLABS_API_KEY ? 'ElevenLabs + edge-tts' : 'edge-tts'}`);
  console.log(`  Subtitles: Word-level sync enabled`);
  console.log(`${'='.repeat(64)}\n`);
});
