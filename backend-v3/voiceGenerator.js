// =============================================================================
// voiceGenerator.js -- Smart TTS Fallback Engine for CodeSeekho
//
// Fallback chain (in order):
//   1. ElevenLabs API  -- Human-quality AI voice (10K chars/month free)
//   2. Google TTS API  -- Excellent quality (4M chars/month free)
//   3. edge-tts        -- Always free, unlimited (Microsoft Neural)
//
// Handles ALL error types:
//   - Rate limits (429)
//   - Auth / invalid key (401, 403)
//   - Quota exhausted (402, "quota" in message)
//   - Network errors (fetch failed, timeout)
//   - Any other unexpected error
//
// The pipeline NEVER breaks -- always produces an audio file.
// The output path is identical regardless of which engine ran.
// =============================================================================

import fs            from 'fs/promises';
import { existsSync } from 'fs';
import path           from 'path';
import { exec }       from 'child_process';
import { promisify }  from 'util';

const execAsync = promisify(exec);

// ── ElevenLabs config ─────────────────────────────────────────────────────────
const EL_VOICE_ID = 'pNInz6obpgDQGcFmaJgB';  // Adam -- clear male teacher
const EL_MODEL    = 'eleven_turbo_v2';         // Fastest model on free tier

// ── Google Cloud TTS config ───────────────────────────────────────────────────
const GCP_VOICE = { languageCode: 'en-US', name: 'en-US-Neural2-J', ssmlGender: 'MALE' };
const GCP_AUDIO = { audioEncoding: 'MP3', speakingRate: 0.95, pitch: 0 };

// ── edge-tts config ───────────────────────────────────────────────────────────
const EDGE_TTS_PATH = [
  'C:\\Users\\Sribendu Prasad\\AppData\\Local\\Packages\\PythonSoftwareFoundation.Python.3.13_qbz5n2kfra8p0\\LocalCache\\local-packages\\Python313\\Scripts\\edge-tts.exe',
].find(p => existsSync(p));
const TTS_CMD   = EDGE_TTS_PATH ?? 'edge-tts';
const TTS_VOICE = 'en-US-GuyNeural';  // Best free Microsoft Neural male voice

// =============================================================================
// generateSpeech
//
// @param {string} text        -- Text to convert to speech
// @param {string} outputPath  -- Absolute .mp3 output path
// @returns {{ engine, fallbackReason }}
//   engine         -- 'ElevenLabs' | 'Google TTS' | 'edge-tts'
//   fallbackReason -- why we fell back (null if primary succeeded)
// =============================================================================
export async function generateSpeech(text, outputPath, targetLanguage = 'English') {
  const dgKey  = process.env.DEEPGRAM_API_KEY?.trim();
  const elKey  = process.env.ELEVENLABS_API_KEY?.trim();
  const gcpKey = process.env.GOOGLE_TTS_API_KEY?.trim();

  const isEnglish = (targetLanguage === 'English');

  // ─────────────────────────────────────────────────────────────────────────
  // ATTEMPT 1: Deepgram Aura (English only)
  // ─────────────────────────────────────────────────────────────────────────
  if (isEnglish && dgKey && dgKey.length > 10) {
    try {
      console.log('   🎙️  [Voice] Trying Deepgram Aura...');
      await _deepgram(text, outputPath, dgKey);
      console.log('   ✅  [Voice] Deepgram succeeded');
      return { engine: 'Deepgram', fallbackReason: null };

    } catch (err) {
      const reason = classifyError(err, 'Deepgram');
      console.warn(`   ⚠️  [Voice] Deepgram FAILED — ${reason}`);
      console.warn(`   ↪️  Switching to next fallback...`);
      await safeDelete(outputPath);
    }
  } else if (isEnglish) {
    console.log('   ℹ️  [Voice] Deepgram key not set — skipping');
  }

  // ─────────────────────────────────────────────────────────────────────────
  // ATTEMPT 2: ElevenLabs (English only for our hardcoded voice, with rotation)
  // ─────────────────────────────────────────────────────────────────────────
  const elKeys = elKey ? elKey.split(',').map(k => k.trim()).filter(k => k.length > 10) : [];
  if (isEnglish && elKeys.length > 0) {
    let elSuccess = false;
    for (let i = 0; i < elKeys.length; i++) {
      try {
        console.log(`   🎙️  [Voice] Trying ElevenLabs (Key ${i+1}/${elKeys.length})...`);
        await _elevenLabs(text, outputPath, elKeys[i]);
        console.log('   ✅  [Voice] ElevenLabs succeeded');
        return { engine: 'ElevenLabs', fallbackReason: null };
      } catch (err) {
        const reason = classifyError(err, 'ElevenLabs');
        console.warn(`   ⚠️  [Voice] ElevenLabs Key ${i+1} FAILED — ${reason}`);
        await safeDelete(outputPath);
      }
    }
    console.warn(`   ↪️  All ElevenLabs keys exhausted. Switching to next fallback...`);
  } else if (isEnglish) {
    console.log('   ℹ️  [Voice] ElevenLabs keys not set — skipping');
  }

  // ─────────────────────────────────────────────────────────────────────────
  // ATTEMPT 3: Google Cloud TTS (English only for our hardcoded voice)
  // ─────────────────────────────────────────────────────────────────────────
  if (isEnglish && gcpKey && gcpKey.length > 10) {
    try {
      console.log('   🎙️  [Voice] Trying Google Cloud TTS...');
      await _googleTTS(text, outputPath, gcpKey);
      console.log('   ✅  [Voice] Google TTS succeeded');
      return { engine: 'Google TTS', fallbackReason: 'ElevenLabs failed' };

    } catch (err) {
      const reason = classifyError(err, 'Google TTS');
      console.warn(`   ⚠️  [Voice] Google TTS FAILED — ${reason}`);
      console.warn(`   ↪️  Falling back to edge-tts (always free)...`);
      await safeDelete(outputPath);
    }
  } else if (isEnglish) {
    console.log('   ℹ️  [Voice] Google TTS key not set — skipping');
  }

  // ─────────────────────────────────────────────────────────────────────────
  // ATTEMPT 4: edge-tts (ALWAYS works, supports all languages natively)
  // ─────────────────────────────────────────────────────────────────────────
  try {
    console.log(`   🎙️  [Voice] Using edge-tts (${targetLanguage})...`);
    await _edgeTTS(text, outputPath, targetLanguage);
    console.log('   ✅  [Voice] edge-tts succeeded');
    return {
      engine:         'edge-tts',
      fallbackReason: isEnglish ? 'Primary AI voices failed or not configured' : `Native ${targetLanguage} voice used`,
    };
  } catch (err) {
    // This should almost never happen
    throw new Error(`All TTS engines failed. Last error (edge-tts): ${err.message}`);
  }
}

// =============================================================================
// getVoiceStatus -- Used by /health endpoint
// =============================================================================
export function getVoiceStatus() {
  const dgActive = !!(process.env.DEEPGRAM_API_KEY?.trim().length > 10);
  const elActive  = !!(process.env.ELEVENLABS_API_KEY?.trim().length > 10);
  const gcpActive = !!(process.env.GOOGLE_TTS_API_KEY?.trim().length > 10);

  let activeEngine = 'edge-tts (fallback)';
  if (dgActive) activeEngine = 'Deepgram → ElevenLabs → edge-tts';
  else if (elActive && gcpActive)  activeEngine = 'ElevenLabs → Google TTS → edge-tts';
  else if (elActive)           activeEngine = 'ElevenLabs → edge-tts';
  else if (gcpActive)          activeEngine = 'Google TTS → edge-tts';

  return { deepgram: dgActive, elevenlabs: elActive, googleTTS: gcpActive, edgeTTS: true, activeEngine };
}

// =============================================================================
// _deepgram -- Deepgram Aura REST call
// =============================================================================
async function _deepgram(text, outputPath, apiKey) {
  let res;
  try {
    res = await fetch(
      'https://api.deepgram.com/v1/speak?model=aura-asteria-en',
      {
        method:  'POST',
        headers: {
          'Authorization': `Token ${apiKey}`,
          'Content-Type':  'application/json'
        },
        body: JSON.stringify({ text }),
        signal: AbortSignal.timeout(30_000),
      }
    );
  } catch (netErr) {
    throw new Error(`Network error: ${netErr.message}`);
  }

  if (!res.ok) {
    const errText = await res.text().catch(() => 'Unknown error');
    throw new Error(`HTTP ${res.status}: ${errText}`);
  }

  const arrayBuffer = await res.arrayBuffer();
  await fs.writeFile(outputPath, Buffer.from(arrayBuffer));
}

// =============================================================================
// _elevenLabs -- ElevenLabs REST call
// =============================================================================
async function _elevenLabs(text, outputPath, apiKey) {
  let res;
  try {
    res = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${EL_VOICE_ID}`,
      {
        method:  'POST',
        headers: {
          'xi-api-key':   apiKey,
          'Content-Type': 'application/json',
          'Accept':       'audio/mpeg',
        },
        body: JSON.stringify({
          text,
          model_id: EL_MODEL,
          voice_settings: {
            stability:         0.5,
            similarity_boost:  0.8,
            style:             0.2,
            use_speaker_boost: true,
          },
        }),
        signal: AbortSignal.timeout(30_000),  // 30s timeout
      }
    );
  } catch (netErr) {
    throw new Error(`Network error: ${netErr.message}`);
  }

  if (!res.ok) {
    let errMsg = `HTTP ${res.status}`;
    try {
      const body = await res.json();
      errMsg = body?.detail?.message ?? body?.detail ?? JSON.stringify(body);
    } catch { /* ignore parse errors */ }

    // Map status codes to meaningful errors
    if (res.status === 401) throw new Error(`Invalid API key (401)`);
    if (res.status === 402) throw new Error(`Quota exhausted / insufficient credits (402)`);
    if (res.status === 403) throw new Error(`Forbidden — check account plan (403)`);
    if (res.status === 429) throw new Error(`Rate limit exceeded (429) — ${errMsg}`);
    throw new Error(`ElevenLabs error: ${errMsg}`);
  }

  const buffer = Buffer.from(await res.arrayBuffer());
  if (buffer.length < 100) throw new Error('ElevenLabs returned empty audio');
  await fs.writeFile(outputPath, buffer);
}

// =============================================================================
// _googleTTS -- Google Cloud TTS REST call
// =============================================================================
async function _googleTTS(text, outputPath, apiKey) {
  let res;
  try {
    res = await fetch(
      `https://texttospeech.googleapis.com/v1/text:synthesize?key=${apiKey}`,
      {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ input: { text }, voice: GCP_VOICE, audioConfig: GCP_AUDIO }),
        signal: AbortSignal.timeout(30_000),
      }
    );
  } catch (netErr) {
    throw new Error(`Network error: ${netErr.message}`);
  }

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    const msg  = body?.error?.message ?? `HTTP ${res.status}`;
    if (res.status === 400) throw new Error(`Bad request: ${msg}`);
    if (res.status === 403) throw new Error(`API key invalid or billing not enabled: ${msg}`);
    if (res.status === 429) throw new Error(`Quota exceeded: ${msg}`);
    throw new Error(`Google TTS error: ${msg}`);
  }

  const data = await res.json();
  if (!data.audioContent) throw new Error('Google TTS returned no audio content');
  await fs.writeFile(outputPath, Buffer.from(data.audioContent, 'base64'));
}

// =============================================================================
// _edgeTTS -- Microsoft Neural TTS (free, always available)
// =============================================================================
function getEdgeVoice(lang) {
  const map = {
    'English': 'en-US-GuyNeural',
    'Hindi': 'hi-IN-MadhurNeural',
    'Hinglish': 'hi-IN-MadhurNeural',
    'Bengali': 'bn-IN-BashkarNeural',
    'Marathi': 'mr-IN-ManoharNeural',
    'Telugu': 'te-IN-MohanNeural',
    'Tamil': 'ta-IN-ValluvarNeural',
    'Gujarati': 'gu-IN-NiranjanNeural',
    'Kannada': 'kn-IN-GaganNeural',
    'Malayalam': 'ml-IN-MidhunNeural',
    'Punjabi': 'pa-IN-OjasNeural',
    'Urdu': 'ur-IN-SalmanNeural'
  };
  return map[lang] || 'en-US-GuyNeural';
}

async function _edgeTTS(text, outputPath, targetLanguage = 'English') {
  const voice = getEdgeVoice(targetLanguage);
  
  // Do NOT strip non-ASCII characters anymore, because other languages need them!
  const safeText = text
    .replace(/\n/g, ' ')
    .replace(/"/g, "'")
    .trim();

  const cmd = `"${TTS_CMD}" --voice "${voice}" --text "${safeText}" --write-media "${outputPath}"`;
  await execAsync(cmd, { timeout: 60_000 });
}

// =============================================================================
// Helpers
// =============================================================================

// Classify error into human-readable reason
function classifyError(err, service) {
  const msg = err.message.toLowerCase();
  if (msg.includes('quota') || msg.includes('402') || msg.includes('credit'))
    return `${service}: Monthly quota/credits exhausted`;
  if (msg.includes('401') || msg.includes('invalid api key') || msg.includes('invalid key'))
    return `${service}: Invalid API key`;
  if (msg.includes('429') || msg.includes('rate limit'))
    return `${service}: Rate limit hit`;
  if (msg.includes('403') || msg.includes('forbidden'))
    return `${service}: Forbidden / billing issue`;
  if (msg.includes('network') || msg.includes('fetch') || msg.includes('timeout'))
    return `${service}: Network/timeout error`;
  return `${service}: ${err.message.slice(0, 80)}`;
}

// Silently delete a file (used to clean up partial writes before retry)
async function safeDelete(filePath) {
  try { await fs.unlink(filePath); } catch { /* ignore */ }
}