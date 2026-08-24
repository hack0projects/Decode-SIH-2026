import { GoogleGenerativeAI } from "@google/generative-ai";

const extractJson = (text) => {
  // Remove markdown code fences
  let cleaned = text.replace(/```json/gi, "").replace(/```/g, "").trim();
  // Remove trailing commas before } or ]
  cleaned = cleaned.replace(/,\s*([}\]])/g, "$1");
  try { return JSON.parse(cleaned); } catch (_) {}
  const s = cleaned.indexOf("{");
  const e = cleaned.lastIndexOf("}");
  if (s !== -1 && e !== -1 && e > s) return JSON.parse(cleaned.slice(s, e + 1));
  throw new Error("Could not extract JSON from response");
};

const callGemini = async (prompt) => {
  if (!process.env.GEMINI_API_KEY) throw new Error("No Gemini key");
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({ model: "gemini-3.5-flash-lite" });
  const result = await model.generateContent(prompt);
  return result.response.text();
};

const callOpenAICompatible = async (url, apiKey, modelName, prompt, truncateChars) => {
  if (!apiKey) throw new Error("No API key for " + url);
  
  // For models with small TPM limits, truncate the input text portion of the prompt
  let finalPrompt = prompt;
  if (truncateChars && prompt.length > truncateChars) {
    // Keep the instructions, truncate only the content between triple quotes
    const inputStart = prompt.indexOf('"""');
    const inputEnd = prompt.lastIndexOf('"""');
    if (inputStart !== -1 && inputEnd !== -1 && inputEnd > inputStart) {
      const instructions = prompt.slice(0, inputStart);
      const content = prompt.slice(inputStart + 3, inputEnd);
      const truncated = content.slice(0, truncateChars);
      finalPrompt = instructions + '"""' + truncated + '...(content truncated for token limit)"""\n\nJSON only:';
    }
  }
  
  const body = { model: modelName, messages: [{ role: "user", content: finalPrompt }], temperature: 0.7, max_tokens: 8192 };
  const headers = { "Authorization": "Bearer " + apiKey, "Content-Type": "application/json", "HTTP-Referer": "https://codeseekho.app", "X-Title": "CodeSeekho" };

  const doFetch = async () => fetch(url, { method: "POST", headers, body: JSON.stringify(body) });

  let res = await doFetch();
  if (res.status === 429) {
    await new Promise(r => setTimeout(r, 10000)); // wait 10s
    res = await doFetch();
  }
  if (!res.ok) {
    const err = await res.text();
    throw new Error("API Error " + res.status + ": " + err.slice(0, 300));
  }
  const data = await res.json();
  return data.choices?.[0]?.message?.content ?? "";
};

// Groq: use compound-mini (131K context) — truncate input to 6000 chars to stay within 8K TPM
const callGroq = (prompt) => callOpenAICompatible(
  "https://api.groq.com/openai/v1/chat/completions",
  process.env.GROQ_API_KEY,
  "groq/compound-mini",
  prompt,
  6000
);

// Cerebras: removed — needs payment (402)

// OpenRouter option 1: NVIDIA Nemotron 120B (free, large)
const callOpenRouterNemotron = (prompt) => callOpenAICompatible(
  "https://openrouter.ai/api/v1/chat/completions",
  process.env.OPENROUTER_API_KEY,
  "nvidia/nemotron-3-super-120b-a12b:free",
  prompt,
  8000
);

// OpenRouter option 2: NVIDIA Nemotron nano (free, smaller = faster)
const callOpenRouterNano = (prompt) => callOpenAICompatible(
  "https://openrouter.ai/api/v1/chat/completions",
  process.env.OPENROUTER_API_KEY,
  "nvidia/nemotron-nano-12b-v2:free",
  prompt,
  8000
);

// OpenRouter option 3: Qwen 3.6 27B (free)
const callOpenRouterQwen = (prompt) => callOpenAICompatible(
  "https://openrouter.ai/api/v1/chat/completions",
  process.env.OPENROUTER_API_KEY,
  "qwen/qwen3.6-27b:free",
  prompt,
  6000
);

// Cloudflare AI: Llama 3.1 8B Instruct (Free tier)
const callCloudflare = async (prompt) => {
  const url = `https://api.cloudflare.com/client/v4/accounts/${process.env.CLOUDFLARE_ACCOUNT_ID}/ai/run/@cf/meta/llama-3.1-8b-instruct`;
  
  let finalPrompt = prompt;
  if (prompt.length > 5000) {
    const inputStart = prompt.indexOf('"""');
    const inputEnd = prompt.lastIndexOf('"""');
    if (inputStart !== -1 && inputEnd !== -1 && inputEnd > inputStart) {
      const instructions = prompt.slice(0, inputStart);
      const content = prompt.slice(inputStart + 3, inputEnd);
      finalPrompt = instructions + '"""' + content.slice(0, 5000) + '...(truncated)"""\n\nJSON only:';
    }
  }

  const res = await fetch(url, {
    method: "POST",
    headers: { "Authorization": "Bearer " + process.env.CLOUDFLARE_API_KEY, "Content-Type": "application/json" },
    body: JSON.stringify({ messages: [{ role: "user", content: finalPrompt }] })
  });
  
  if (!res.ok) throw new Error("Cloudflare Error " + res.status);
  const data = await res.json();
  if (!data.success) throw new Error("Cloudflare failed: " + JSON.stringify(data.errors));
  return data.result.response;
};

export async function generateScriptWithRotation(prompt, emitProgress, jobId) {
  const models = [
    { name: "Gemini 3.5 Flash Lite", fn: callGemini },
    { name: "Groq Compound Mini", fn: callGroq },
    { name: "Cloudflare Llama 3.1", fn: callCloudflare },
    { name: "OpenRouter Nemotron 120B", fn: callOpenRouterNemotron },
    { name: "OpenRouter Nemotron Nano", fn: callOpenRouterNano },
    { name: "OpenRouter Qwen 3.6", fn: callOpenRouterQwen },
  ];

  for (const model of models) {
    try {
      emitProgress?.(jobId, 6, "gemini", "Generating script via " + model.name + "...");
      console.log("[LLM] Trying " + model.name + "...");
      const rawText = await model.fn(prompt);
      const json = extractJson(rawText);
      if (!json.scenes || !Array.isArray(json.scenes) || json.scenes.length === 0) {
        throw new Error("Empty or invalid scenes array in response");
      }
      console.log("[LLM] " + model.name + " Succeeded! " + json.scenes.length + " scenes");
      emitProgress?.(jobId, 20, "gemini", "Script ready: " + json.scenes.length + " scenes (" + model.name + ")");
      return json;
    } catch (err) {
      console.warn("[LLM] " + model.name + " Failed: " + err.message?.slice(0, 150));
      emitProgress?.(jobId, 6, "gemini", model.name + " failed, switching to backup...");
    }
  }
  throw new Error("All AI Models in the rotation failed or exhausted tokens.");
}