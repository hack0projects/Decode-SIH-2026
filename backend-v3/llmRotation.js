import { GoogleGenerativeAI } from '@google/generative-ai';

const extractJson = (text) => {
  const cleaned = text.replace(/,\s*([}\]])/g, '$1');
  try { return JSON.parse(cleaned); } catch (_) {}
  const s = cleaned.indexOf('{');
  const e = cleaned.lastIndexOf('}');
  if (s !== -1 && e !== -1 && e > s) return JSON.parse(cleaned.slice(s, e + 1));
  throw new Error('Could not extract JSON');
};

const callGemini = async (prompt) => {
  if (!process.env.GEMINI_API_KEY) throw new Error('No Gemini key');
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  // User context explicitly notes that gemini-1.5 returns 404, must use gemini-3.6-flash
  const model = genAI.getGenerativeModel({ model: 'gemini-3.6-flash' });
  const result = await model.generateContent(prompt);
  return result.response.text();
};

const callOpenAICompatible = async (url, apiKey, modelName, prompt) => {
  if (!apiKey) throw new Error("No API key for " + url);
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': 'Bearer ' + apiKey,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: modelName,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
      response_format: { type: 'json_object' }
    }),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error("API Error " + res.status + ": " + err);
  }
  const data = await res.json();
  return data.choices[0].message.content;
};

const callGroq = (prompt) => callOpenAICompatible(
  'https://api.groq.com/openai/v1/chat/completions',
  process.env.GROQ_API_KEY,
  'llama-3.1-70b-versatile',
  prompt
);

const callCerebras = (prompt) => callOpenAICompatible(
  'https://api.cerebras.ai/v1/chat/completions',
  process.env.CEREBRAS_API_KEY,
  'llama3.1-8b',
  prompt
);

const callOpenRouter = (prompt) => callOpenAICompatible(
  'https://openrouter.ai/api/v1/chat/completions',
  process.env.OPENROUTER_API_KEY,
  'google/gemma-2-9b-it:free',
  prompt
);

export async function generateScriptWithRotation(prompt, emitProgress, jobId) {
  const models = [
    { name: 'Gemini 3.6 Flash', fn: callGemini },
    { name: 'Groq Llama 3.3', fn: callGroq },
    { name: 'Cerebras Llama 3.3', fn: callCerebras },
    { name: 'OpenRouter Free', fn: callOpenRouter },
  ];

  for (const model of models) {
    try {
      emitProgress?.(jobId, 6, 'gemini', 'Generating script via ' + model.name + '...');
      console.log('[LLM] Trying ' + model.name + '...');
      
      let rawText = await model.fn(prompt);
      const json = extractJson(rawText);
      
      console.log('[LLM] ' + model.name + ' Succeeded!');
      return json;
    } catch (err) {
      console.warn('[LLM] ' + model.name + ' Failed: ' + err.message);
      emitProgress?.(jobId, 6, 'gemini', model.name + ' failed, switching to backup...');
    }
  }
  throw new Error('All AI Models in the rotation failed or exhausted tokens.');
}