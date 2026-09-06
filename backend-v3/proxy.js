// =============================================================================
// CodeSeekho Proxy Server — Port 5000
// Features: Proxy to main pipeline + Flashcards & Worksheets AI Generator
// =============================================================================
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import multer from 'multer';
import fs from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { v4 as uuidv4 } from 'uuid';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { createClient } from '@supabase/supabase-js';
import { extractText } from './fileProcessor.js';
import { generateScriptWithRotation } from './llmRotation.js';

dotenv.config();
const __dirname = path.dirname(fileURLToPath(import.meta.url));

const PORT = 5000;
const MAIN_BACKEND = `http://localhost:${process.env.PORT ?? 3010}`;
const UPLOADS_DIR = path.join(__dirname, 'out', 'uploads');
if (!existsSync(UPLOADS_DIR)) await fs.mkdir(UPLOADS_DIR, { recursive: true });

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

const ALLOWED_EXTS = new Set(['.pptx', '.ppt', '.pdf', '.txt', '.md', '.docx']);
const upload = multer({
  storage: multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, UPLOADS_DIR),
    filename:    (_req, file, cb) => { const ext = path.extname(file.originalname).toLowerCase(); cb(null, `${uuidv4()}${ext}`); }
  }),
  fileFilter: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (ALLOWED_EXTS.has(ext)) cb(null, true);
    else cb(new Error(`Unsupported type: "${ext}"`));
  },
  limits: { fileSize: 50 * 1024 * 1024 }
});

const app = express();
app.use(cors());
app.use(express.json({ limit: '5mb' }));
app.use(express.static(path.join(__dirname, 'public5000')));

// =============================================================================
// AI HELPER — Call Gemini with rotation fallback to OpenRouter
// =============================================================================
// Remove the broken genAI client — we use llmRotation.js instead
// const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// AI helper — wraps llmRotation which already handles Gemini → Groq → Cloudflare → OpenRouter
async function callAI(prompt) {
  // generateScriptWithRotation expects the prompt to generate JSON with scenes[]
  // For flashcards/worksheets we need raw text output, so we wrap it:
  const dummyEmit = () => {};
  // Use the rotation engine but get raw text before JSON parsing
  const rawText = await callRawAI(prompt);
  return rawText;
}

async function callRawAI(prompt) {
  // ✅ 0. Gemini 2.5 Flash — NOW WORKING AND BEST FOR LARGE FILES
  for (const modelName of ['gemini-2.5-flash', 'gemini-2.0-flash', 'gemini-1.5-flash']) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${process.env.GEMINI_API_KEY}`;
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        // Send a large chunk for Gemini since it supports it!
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt.slice(0, 60000) }] }] })
      });
      if (!res.ok) { const err = await res.text(); throw new Error(`Gemini HTTP ${res.status}`); }
      const data = await res.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (text) { console.log(`[Proxy AI] ✅ ${modelName}`); return text; }
    } catch(e) { console.warn(`[Proxy AI] ❌ ${modelName}:`, e.message?.slice(0,80)); }
  }

  // ✅ 1. Cloudflare Llama 3.1
  try {
    const url = `https://api.cloudflare.com/client/v4/accounts/${process.env.CLOUDFLARE_ACCOUNT_ID}/ai/run/@cf/meta/llama-3.1-8b-instruct`;
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${process.env.CLOUDFLARE_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages: [{ role: 'user', content: prompt.slice(0, 5000) }] })
    });
    if (!res.ok) throw new Error('Cloudflare HTTP ' + res.status);
    const data = await res.json();
    if (data.success && data.result?.response) { console.log('[Proxy AI] ✅ Cloudflare Llama'); return data.result.response; }
    throw new Error('Cloudflare empty');
  } catch(e) { console.warn('[Proxy AI] ❌ Cloudflare Llama:', e.message?.slice(0,80)); }

  // ✅ 2. Cloudflare Mistral — CONFIRMED WORKING from diagnostic
  try {
    const url = `https://api.cloudflare.com/client/v4/accounts/${process.env.CLOUDFLARE_ACCOUNT_ID}/ai/run/@cf/mistral/mistral-7b-instruct-v0.1`;
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${process.env.CLOUDFLARE_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages: [{ role: 'user', content: prompt.slice(0, 4000) }] })
    });
    if (!res.ok) throw new Error('CF Mistral HTTP ' + res.status);
    const data = await res.json();
    if (data.success && data.result?.response) { console.log('[Proxy AI] ✅ Cloudflare Mistral'); return data.result.response; }
    throw new Error('CF Mistral empty');
  } catch(e) { console.warn('[Proxy AI] ❌ Cloudflare Mistral:', e.message?.slice(0,80)); }

  // 3. Groq — updated model names
  for (const model of ['llama-3.3-70b-versatile', 'llama-3.1-8b-instant']) {
    try {
      const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${process.env.GROQ_API_KEY}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ model, messages: [{ role: 'user', content: prompt.slice(0, 6000) }], temperature: 0.7, max_tokens: 4096 })
      });
      if (!res.ok) { const t = await res.text(); throw new Error(`HTTP ${res.status}: ${t.slice(0,80)}`); }
      const data = await res.json();
      if (data.choices?.[0]?.message?.content) { console.log(`[Proxy AI] ✅ Groq ${model}`); return data.choices[0].message.content; }
    } catch(e) { console.warn(`[Proxy AI] ❌ Groq ${model}:`, e.message?.slice(0,80)); }
  }

  // 4. OpenRouter — updated to current free models
  for (const model of ['google/gemma-2-9b-it:free', 'microsoft/phi-3-mini-128k-instruct:free', 'deepseek/deepseek-r1:free']) {
    try {
      const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`, 'Content-Type': 'application/json', 'HTTP-Referer': 'https://codeseekho.app' },
        body: JSON.stringify({ model, messages: [{ role: 'user', content: prompt.slice(0, 7000) }], temperature: 0.7 })
      });
      if (!res.ok) { const t = await res.text(); throw new Error(`HTTP ${res.status}: ${t.slice(0,80)}`); }
      const data = await res.json();
      if (data.choices?.[0]?.message?.content) { console.log(`[Proxy AI] ✅ OpenRouter ${model}`); return data.choices[0].message.content; }
    } catch(e) { console.warn(`[Proxy AI] ❌ OpenRouter ${model}:`, e.message?.slice(0,80)); }
  }

  throw new Error('All AI models failed. Only Cloudflare is confirmed working — check CLOUDFLARE_API_KEY and CLOUDFLARE_ACCOUNT_ID in .env');
}

function extractJson(text) {
  let cleaned = text.replace(/```json/gi, '').replace(/```/g, '').trim();
  cleaned = cleaned.replace(/,\s*([}\]])/g, '$1');
  try { return JSON.parse(cleaned); } catch (_) {}
  const s = cleaned.indexOf('{'); const e = cleaned.lastIndexOf('}');
  if (s !== -1 && e !== -1 && e > s) return JSON.parse(cleaned.slice(s, e + 1));
  throw new Error('Could not extract JSON');
}

// =============================================================================
// PROXY ROUTES — Forward to main backend at port 3010
// =============================================================================
async function proxyRequest(req, res, targetPath, method = 'GET', body = null) {
  try {
    const opts = {
      method,
      headers: { 'Content-Type': 'application/json' }
    };
    if (body) opts.body = JSON.stringify(body);
    const upstream = await fetch(`${MAIN_BACKEND}${targetPath}`, opts);
    const data = await upstream.json();
    return res.status(upstream.status).json(data);
  } catch(e) {
    return res.status(502).json({ success: false, error: `Proxy error: ${e.message}. Is main backend running?` });
  }
}

app.get('/proxy/health', (req, res) => proxyRequest(req, res, '/health'));
app.get('/proxy/jobs',   (req, res) => proxyRequest(req, res, '/jobs'));
app.get('/proxy/jobs/:id', (req, res) => proxyRequest(req, res, `/jobs/${req.params.id}`));
app.get('/proxy/credits', (req, res) => proxyRequest(req, res, '/credits'));

// =============================================================================
// FLASHCARDS — POST /flashcards  (raw_text) or /flashcards-from-file (file upload)
// =============================================================================
function buildFlashcardPrompt(rawText, language = 'English') {
  return `You are an expert educator. From the provided study material, create a comprehensive set of FLASHCARDS.

TARGET LANGUAGE: ${language}
CRITICAL: Write ALL flashcard content in ${language}. Use native script if regional (e.g., Devanagari for Hindi).

Generate 15-25 flashcards covering ALL important concepts, terms, definitions, and key facts.

Output ONLY valid JSON in this exact structure:
{
  "title": "Topic name",
  "language": "${language}",
  "total": <number>,
  "cards": [
    {
      "id": 1,
      "front": "Question or term (concise, clear)",
      "back": "Answer or definition (detailed, informative, 2-4 sentences)",
      "category": "Definition | Concept | Formula | Example | Comparison",
      "difficulty": "Easy | Medium | Hard"
    }
  ]
}

RULES:
1. Front = clear question or term to recall.
2. Back = complete, informative answer (not just 1 word).
3. Cover every major concept from the input.
4. Mix different difficulty levels.
5. Categories help students identify what type of knowledge is being tested.

INPUT TEXT:
"""${rawText.slice(0, 12000)}"""

JSON ONLY:`;
}

function buildWorksheetPrompt(rawText, language = 'English') {
  return `You are an expert educator. From the provided study material, create a comprehensive WORKSHEET for students.

TARGET LANGUAGE: ${language}
CRITICAL: Write ALL content in ${language}. Use native script if regional (e.g., Devanagari for Hindi).

Output ONLY valid JSON:
{
  "title": "Worksheet title",
  "subject": "Subject/topic name",
  "language": "${language}",
  "instructions": "General instructions for the student",
  "sections": [
    {
      "type": "mcq",
      "title": "Section A: Multiple Choice Questions",
      "questions": [
        {
          "id": 1,
          "question": "Question text",
          "options": ["A. ...", "B. ...", "C. ...", "D. ..."],
          "answer": "A"
        }
      ]
    },
    {
      "type": "fill_blank",
      "title": "Section B: Fill in the Blanks",
      "questions": [
        { "id": 1, "question": "The _____ is used to ...", "answer": "correct word" }
      ]
    },
    {
      "type": "short_answer",
      "title": "Section C: Short Answer Questions",
      "questions": [
        { "id": 1, "question": "Explain in 2-3 lines...", "answer": "Model answer..." }
      ]
    },
    {
      "type": "true_false",
      "title": "Section D: True or False",
      "questions": [
        { "id": 1, "question": "Statement here.", "answer": "True" }
      ]
    },
    {
      "type": "long_answer",
      "title": "Section E: Long Answer Questions",
      "questions": [
        { "id": 1, "question": "Describe in detail...", "answer": "Detailed model answer..." }
      ]
    }
  ]
}

RULES:
1. MCQ section: Minimum 10 questions.
2. Fill in the blank: Minimum 8 questions.
3. Short answer: Minimum 5 questions.
4. True/False: Minimum 8 questions.
5. Long answer: Minimum 3 questions.
6. Questions must cover ALL major topics from the input.
7. Include model answers for everything.

INPUT TEXT:
"""${rawText.slice(0, 12000)}"""

JSON ONLY:`;
}

// Flashcards from raw text
app.post('/flashcards', async (req, res) => {
  const { raw_text, language = 'English' } = req.body;
  if (!raw_text?.trim() || raw_text.trim().length < 20)
    return res.status(400).json({ error: 'raw_text must be at least 20 characters.' });
  try {
    const prompt = buildFlashcardPrompt(raw_text.trim(), language);
    const rawOut = await callAI(prompt);
    const flashcards = extractJson(rawOut);
    // Save to Supabase
    const id = uuidv4();
    await supabase.from('study_tools').insert({
      tool_id: id, type: 'flashcard', title: flashcards.title,
      language, data: flashcards, created_at: new Date().toISOString()
    }).catch(() => {}); // silent fail if table doesn't exist yet
    return res.json({ success: true, id, flashcards });
  } catch(e) {
    return res.status(500).json({ success: false, error: e.message });
  }
});

// Flashcards from file
app.post('/flashcards-from-file', upload.single('file'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded.' });
  const language = req.body.language || 'English';
  try {
    const rawText = await extractText(req.file.path, req.file.mimetype, req.file.originalname);
    await fs.unlink(req.file.path).catch(() => {});
    if (rawText.trim().length < 20) return res.status(422).json({ error: 'Text too short.' });
    const prompt = buildFlashcardPrompt(rawText, language);
    const rawOut = await callAI(prompt);
    const flashcards = extractJson(rawOut);
    const id = uuidv4();
    await supabase.from('study_tools').insert({
      tool_id: id, type: 'flashcard', title: flashcards.title,
      language, data: flashcards, created_at: new Date().toISOString()
    }).catch(() => {});
    return res.json({ success: true, id, flashcards });
  } catch(e) {
    await fs.unlink(req.file?.path).catch(() => {});
    return res.status(500).json({ success: false, error: e.message });
  }
});

// Worksheets from raw text
app.post('/worksheet', async (req, res) => {
  const { raw_text, language = 'English' } = req.body;
  if (!raw_text?.trim() || raw_text.trim().length < 20)
    return res.status(400).json({ error: 'raw_text must be at least 20 characters.' });
  try {
    const prompt = buildWorksheetPrompt(raw_text.trim(), language);
    const rawOut = await callAI(prompt);
    const worksheet = extractJson(rawOut);
    const id = uuidv4();
    await supabase.from('study_tools').insert({
      tool_id: id, type: 'worksheet', title: worksheet.title,
      language, data: worksheet, created_at: new Date().toISOString()
    }).catch(() => {});
    return res.json({ success: true, id, worksheet });
  } catch(e) {
    return res.status(500).json({ success: false, error: e.message });
  }
});

// Worksheets from file
app.post('/worksheet-from-file', upload.single('file'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded.' });
  const language = req.body.language || 'English';
  try {
    const rawText = await extractText(req.file.path, req.file.mimetype, req.file.originalname);
    await fs.unlink(req.file.path).catch(() => {});
    if (rawText.trim().length < 20) return res.status(422).json({ error: 'Text too short.' });
    const prompt = buildWorksheetPrompt(rawText, language);
    const rawOut = await callAI(prompt);
    const worksheet = extractJson(rawOut);
    const id = uuidv4();
    await supabase.from('study_tools').insert({
      tool_id: id, type: 'worksheet', title: worksheet.title,
      language, data: worksheet, created_at: new Date().toISOString()
    }).catch(() => {});
    return res.json({ success: true, id, worksheet });
  } catch(e) {
    await fs.unlink(req.file?.path).catch(() => {});
    return res.status(500).json({ success: false, error: e.message });
  }
});

// Health
app.get('/health', (_req, res) => res.json({ status: 'ok', service: 'CodeSeekho Proxy', port: PORT, mainBackend: MAIN_BACKEND }));

app.listen(PORT, () => {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`  CodeSeekho PROXY SERVER`);
  console.log(`  http://localhost:${PORT}`);
  console.log(`  Flashcards  : POST /flashcards | /flashcards-from-file`);
  console.log(`  Worksheets  : POST /worksheet  | /worksheet-from-file`);
  console.log(`  Proxy       : GET  /proxy/jobs | /proxy/credits | /proxy/health`);
  console.log(`${'='.repeat(60)}\n`);
});
