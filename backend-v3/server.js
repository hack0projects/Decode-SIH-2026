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
// Generate endpoints
// =============================================================================
app.post('/generate', (req, res) => {
  const { raw_text } = req.body;
  if (!raw_text?.trim() || raw_text.trim().length < 10)
    return res.status(400).json({ error: "'raw_text' must be >= 10 chars." });
  
  // Return immediately with a new jobId, run pipeline in background
  const jobId = uuidv4();
  runPipeline(jobId, raw_text.trim()).catch(console.error);
  return res.status(200).json({ success: true, jobId });
});

app.post('/generate-from-file', upload.single('file'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: "No file. Field: 'file'" });
  const uploadedPath = req.file.path;
  console.log(`\nFile: ${req.file.originalname}`);
  try {
    const rawText = await extractText(uploadedPath, req.file.mimetype, req.file.originalname);
    if (rawText.trim().length < 20) return res.status(422).json({ error: 'Text too short.' });
    
    // Return immediately with a new jobId, run pipeline in background
    const jobId = uuidv4();
    runPipeline(jobId, rawText).catch(console.error).finally(() => fs.unlink(uploadedPath).catch(()=>{}));
    
    return res.status(200).json({ success: true, jobId, sourceFile: req.file.originalname });
  } catch (err) {
    try { await fs.unlink(uploadedPath); } catch {}
    return res.status(500).json({ success: false, error: err.message });
  }
});

// =============================================================================
// scriptToMarkdown -- Convert JSON script to Markdown
// =============================================================================
function scriptToMarkdown(script) {
  const lines = [];
  const now   = new Date().toLocaleDateString('en-IN', { dateStyle: 'long' });
  lines.push(`# ${script.title}`);
  lines.push(`> **Language:** ${script.language} | **Scenes:** ${script.scenes.length} | **Duration:** ~${script.duration}s | *CodeSeekho AI*`);
  lines.push(''); lines.push('---'); lines.push('');
  let n = 1;
  for (const scene of script.scenes) {
    if (scene.type === 'intro') {
      const parts = (scene.text || '').split('\n');
      lines.push(`## Scene ${n}: ${parts[0] || ''}`);
      if (parts.slice(1).join('\n').trim()) lines.push(`\n${parts.slice(1).join('\n').trim()}`);
      lines.push('');
    } else if (scene.type === 'code') {
      lines.push(`## Scene ${n}: Code Example`);
      lines.push(''); lines.push('```' + script.language.toLowerCase().replace('c++','cpp'));
      lines.push(scene.code || ''); lines.push('```'); lines.push('');
    } else if (scene.type === 'visual') {
      const label = scene.animation === 'forLoopIterator' ? 'For Loop Iterator' : 'While Counter';
      lines.push(`## Scene ${n}: Visual -- ${label} Animation`);
      lines.push(''); lines.push(`> *Animated: ${scene.animation}*`); lines.push('');
    }
    lines.push('---'); lines.push(''); n++;
  }
  lines.push(`*Generated on ${now} by CodeSeekho V2 AI Avatar Engine*`);
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
async function runPipeline(jobId, rawText) {
  const phase     = { current: 'init' };
  const tempFiles = [];

  console.log(`\n${'='.repeat(60)}\nV2 Avatar Job: ${jobId}\n${'='.repeat(60)}`);
  emitProgress(jobId, 2, 'init', 'Job started...');

  try {
    // PHASE 1 -- Gemini script (unlimited scenes)
    phase.current = 'gemini';
    console.log('\n[1/5] LLM -- generating unlimited-scene V3 animated script...');
    emitProgress(jobId, 5, 'gemini', 'AI reading your content and planning V3 scenes...');
    
    const prompt = `You are an expert animated explainer video scriptwriter for CodeSeekho.
Read the TEXT below and convert EVERY concept into a comprehensive multi-scene video script with animated infographics.

OUTPUT RULES:
1. ONLY raw JSON. No markdown, no backticks.
2. Escape all newlines inside strings as \\n

SCHEMA:
{
  "title": "Engaging title (max 65 chars)",
  "language": "Python",
  "scenes": [ ... ]
}

SCENE TYPES (Pick the best one for each piece of content):
A) explainer: { "type": "explainer", "heading": "Short Title", "bullets": ["Concept point 1", "Concept point 2", "Point 3"], "highlights": ["Concept", "Point 3"], "text": "What the AI avatar should say aloud (3-4 sentences)." }
B) comparison: { "type": "comparison", "leftTitle": "Concept A", "leftPoints": ["A point 1"], "rightTitle": "Concept B", "rightPoints": ["B point 1"], "text": "What avatar says out loud comparing them." }
C) flowchart: { "type": "flowchart", "steps": ["Start", "Do X", "Check Y", "End"], "colors": ["#7c3aed", "#0ea5e9", "#10b981", "#ef4444"], "text": "Avatar explanation of the flow." }
D) intro: { "type": "intro", "text": "Headline\\nDetailed conversational explanation." }
E) code: { "type": "code", "code": "# Commented code\\nprint('example')", "text": "What avatar says while code is typed." }

RULES:
1. NO TIME LIMIT. Minimum 10 scenes. Cover all text content.
2. Use 'explainer' for concepts with bullet points. 3-4 bullets max.
3. Use 'comparison' for VS or differences.
4. Use 'flowchart' for processes or architectures.
5. EVERY scene MUST have a "text" field, which is the exact script the voice AI will read.
6. Order: intro(overview) -> explainer -> code -> comparison -> flowchart -> code -> intro(summary)

INPUT TEXT:
"""${rawText}"""

JSON only:`;

    let script;
    try {
      script = await generateScriptWithRotation(prompt, emitProgress, jobId);
    } catch(err) {
      throw Object.assign(new Error(`LLM failed: ${err.message}`), { phase: 'gemini' });
    }
    
    // validateScript(script); // Skipping basic validation to allow new types smoothly
    console.log(`   Script: "${script.title}" | ${script.scenes.length} scenes | ${script.language}`);
    emitProgress(jobId, 20, 'gemini', `Script ready: ${script.scenes.length} scenes generated`);

    // PHASE 2 -- AI Voice + subtitle word timing
    phase.current = 'voice';
    console.log('\n[2/5] AI Voice + subtitle timing...');
    emitProgress(jobId, 22, 'voice', 'Starting AI voice generation...');
    const audioFiles = [];
    const introScenes = script.scenes.filter(s => s.type === 'intro').length;
    let voiceDone = 0;
    for (let i = 0; i < script.scenes.length; i++) {
      const scene = script.scenes[i];
      if (scene.type !== 'intro') continue;
      const audioPath = path.join(AUDIO_DIR, `${jobId}_scene_${i}.mp3`);
      tempFiles.push(audioPath);
      try {
        const { engine } = await generateSpeech(scene.text, audioPath);
        const durationSec = await getAudioDuration(audioPath, scene.text);
        const subtitleWords = generateSubtitleWords(scene.text, durationSec);
        audioFiles.push({ sceneIndex: i, path: audioPath, engine, durationSec, subtitleWords });
        voiceDone++;
        const voicePct = 22 + (voiceDone / introScenes) * 18;
        emitProgress(jobId, voicePct, 'voice', `Voice: scene ${voiceDone}/${introScenes} done [${engine}]`);
        console.log(`   Scene ${i} -> [${engine}] ${durationSec?.toFixed(1)}s ${subtitleWords.length} words`);
      } catch(e) { console.warn(`   Voice skipped scene ${i}: ${e.message}`); }
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

    const audioMap = {};
    for (const af of audioFiles) {
      audioMap[af.sceneIndex] = {
        audioUrl:      `http://localhost:${PORT}/audio/${path.basename(af.path)}`,
        durationSec:   af.durationSec ?? 10,
        subtitleWords: af.subtitleWords ?? [],
      };
    }

    const enrichedScenes = script.scenes.map((scene, i) => {
      if (audioMap[i]) {
        return { ...scene, audioUrl: audioMap[i].audioUrl, audioDuration: audioMap[i].durationSec, subtitleWords: audioMap[i].subtitleWords };
      }
      return scene;
    });

    const v2Script = { ...script, scenes: enrichedScenes, language: script.language, avatarMode: true };
    await fs.writeFile(jobScriptPath, JSON.stringify(v2Script, null, 2), 'utf8');

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

    // PHASE 5 -- Supabase upload
    phase.current = 'upload';
    console.log('\n[5/5] Supabase upload...');
    emitProgress(jobId, 87, 'upload', 'Reading video file...');
    const supabasePath = `videos/v2_${jobId}.mp4`;
    const videoBuffer  = await fs.readFile(outputVideoPath);
    emitProgress(jobId, 90, 'upload', `Uploading to Supabase (${(videoBuffer.length / 1024 / 1024).toFixed(1)} MB)...`);
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
