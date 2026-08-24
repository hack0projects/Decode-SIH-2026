# 🚀 CodeSeekho V3 — AI Avatar Video & Study Generation System

CodeSeekho V3 is an advanced educational AI pipeline that instantly transforms unstructured text, PDFs, PPTs, or markdown into **fully animated, lip-synced educational avatar videos** and **deep NotebookLM-style study summaries** — in 11+ Indian regional languages.

---

## 🏗️ System Architecture

The project follows a decoupled client-server architecture built around **Remotion** for programmatic video rendering.

| Layer | Technology | Role |
|---|---|---|
| **Frontend** | React + Remotion | UI, video player, scene definitions |
| **Backend** | Node.js + Express | File parsing, AI orchestration, audio synthesis, Remotion CLI |
| **Database** | Supabase (PostgreSQL) | Job metadata, script JSONs |
| **Storage** | Supabase Storage | Compressed `.mp4` video files |
| **Video Engine** | Remotion CLI + FFmpeg | Frame rendering, audio sync, video compression |

---

## 🔄 The 5-Phase Video Pipeline

When a user submits a file or text prompt for video generation, the backend (`backend-v3/server.js`) triggers a robust 5-phase `runPipeline`:

### Phase 1 — LLM Scripting & Translation
- **Input:** Raw text / uploaded file + target language selection
- **Process:** The `buildVideoPrompt()` engine sends a carefully engineered prompt to the LLM rotation chain. Generates a balanced 10-12 scene script designed for a 4-5 minute video.
- **Output:** Structured JSON with scene types (`intro`, `explainer`, `comparison`, `flowchart`, `code`) — narration, bullets, headings all in the **native script** of the selected language.

### Phase 2 — AI Voice Synthesis (TTS)
- **Process:** `voiceGenerator.js` converts each scene's narration into speech.
- **Redundancy:** Smart fallback chain runs automatically:
  1. **Deepgram Aura** — Fastest, ultra-realistic voice (English)
  2. **ElevenLabs** — Premium AI voice, auto-rotates across multiple API keys
  3. **Google Cloud TTS** — High quality fallback
  4. **Edge-TTS (Microsoft Neural)** — Always-free, unlimited; primary engine for all 11 Indian regional languages
- **Output:** Per-scene `.mp3` files saved to `out/audio/`

### Phase 3 — Avatar Generation
- **Process:** Lip-syncs a static avatar image to the generated audio using **SadTalker** (or Remotion native animated avatar as fallback).

### Phase 4 — Remotion Video Rendering
- **Process:** `npx remotion render` is invoked with the structured JSON + audio paths as dynamic props. React components render every frame: subtitles, scene graphics, avatar overlay — all synced to audio duration via `ffprobe`.
- **Output:** Raw uncompressed `.mp4`

### Phase 5 — Compression & Cloud Upload
- **Process:** FFmpeg compresses to 720p (CRF 28), reducing file size 60-80% (from ~60MB → ~15MB).
- **Upload:** Pushed to Supabase Storage bucket. Public URL saved to the database and returned to the client.

---

## 🧠 Fully Automated AI Model Rotation (`llmRotation.js`)

The system **never breaks** due to API quota exhaustion. When one model runs out of tokens or fails, the next one kicks in automatically — zero user intervention needed.

### LLM Fallback Chain (in order)

```
1. Gemini 3.5 Flash Lite     → 20 req/day (free)
         ↓ (fails/quota)
2. Groq Llama 3.1 8B Instant → 14,400 tokens/min (free)
         ↓ (fails/quota)
3. Cloudflare Llama 3.1      → 10,000 req/day (free)
         ↓ (fails/quota)
4. OpenRouter Nemotron 120B  → Free tier
         ↓ (fails/quota)
5. OpenRouter Nemotron Nano  → Free tier
         ↓ (fails/quota)
6. OpenRouter Qwen 3.6 27B   → Free tier
```

Each model failure is caught and the next model is tried seamlessly. The `extractJson()` function also auto-repairs common LLM JSON errors (trailing commas, unescaped characters, missing brackets) before giving up.

### TTS Key Rotation (`voiceGenerator.js`)

ElevenLabs has a per-key character limit. The system accepts **multiple comma-separated keys** in `.env` and rotates through them automatically:

```
ELEVENLABS_API_KEY=key1,key2,key3   # ~30,000 chars/month combined
```

If `key1` hits quota mid-generation → instantly switches to `key2` → then `key3` → then falls back to Edge-TTS. The video render **never fails** due to a voice API limit.

---

## 📚 NotebookLM-Style Script Summary

Users can generate a deep educational **Script Summary** completely independent of video generation. This hits the LLM with an exhaustive, unlimited-scene prompt.

The `scriptToMarkdown()` engine converts the JSON into a rich Markdown document with:

- **📋 Index / Table of Contents** — auto-generated from all scene topics
- **🎯 Overview** — 3-4 sentence summary of entire content
- **🔑 Key Terms Glossary** — every important term defined
- **📖 Topic Breakdowns** — code blocks, comparison tables, flowcharts, and 5-6 sentence narrative explanations per topic

---

## 🌍 Full Native Script Multilingual Support

All content — including **on-screen headings, bullet points, flowchart steps, and narration audio** — is translated and rendered in the **native script** of the selected language:

| Language | Script | Voice Engine |
|---|---|---|
| English | Latin | Deepgram → ElevenLabs → Edge-TTS |
| Hindi | Devanagari (हिंदी) | Edge-TTS (hi-IN-MadhurNeural) |
| Hinglish | Devanagari | Edge-TTS |
| Bengali | Bengali (বাংলা) | Edge-TTS (bn-IN-BashkarNeural) |
| Marathi | Devanagari (मराठी) | Edge-TTS (mr-IN-AarohiNeural) |
| Telugu | Telugu (తెలుగు) | Edge-TTS (te-IN-MohanNeural) |
| Tamil | Tamil (தமிழ்) | Edge-TTS (ta-IN-PallaviNeural) |
| Gujarati | Gujarati (ગુજરાતી) | Edge-TTS (gu-IN-NiranjanNeural) |
| Kannada | Kannada (ಕನ್ನಡ) | Edge-TTS (kn-IN-GaganNeural) |
| Malayalam | Malayalam (മലയാളം) | Edge-TTS (ml-IN-MidhunNeural) |
| Punjabi | Gurmukhi (ਪੰਜਾਬੀ) | Edge-TTS (pa-IN-OjasNeural) |
| Urdu | Nastaliq (اردو) | Edge-TTS (ur-IN-SalmanNeural) |

> Code syntax always stays in English. Only the **code comments** are translated into the selected language.

---

## 💳 Live AI Credits Panel

The UI includes a real-time **AI Credits & Status** dashboard (`/credits` endpoint) that:
- Pings every API individually using a lightweight health check
- Aggregates ElevenLabs quota across all rotating keys
- Shows remaining tokens, quota used, and connection status
- Color-codes: 🟢 Green (healthy), 🟠 Orange (near limit), 🔴 Red (failed/exhausted)

---

## ⚙️ Environment Variables

The system relies on a `.env` file in `backend-v3/`. **Never commit this file to Git.**

```env
PORT=3003
REMOTION_PROJECT_PATH=../

# Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your_supabase_key

# LLM Rotation (all free tier)
GEMINI_API_KEY=...
GROQ_API_KEY=...
OPENROUTER_API_KEY=...
CLOUDFLARE_API_KEY=...
CLOUDFLARE_ACCOUNT_ID=...

# Voice TTS — comma-separate ElevenLabs keys for auto-rotation
ELEVENLABS_API_KEY=key1,key2,key3
DEEPGRAM_API_KEY=...
FISH_AUDIO_API_KEY=...
PLAYHT_API_KEY=...

# Video / Other
KLING_API_KEY=...
HAILUO_API_KEY=...
HUGGINGFACE_API_KEY=...
```

---

## 🗂️ Project Structure

```
SIH VIDEO GENERATION/
├── backend-v3/
│   ├── server.js           # Main Express API + pipeline orchestrator
│   ├── llmRotation.js      # Automated LLM fallback chain (6 models)
│   ├── voiceGenerator.js   # Smart TTS fallback + multi-key ElevenLabs rotation
│   ├── fileProcessor.js    # PDF/PPT/TXT text extraction
│   ├── public/
│   │   └── index.html      # UI — Upload, Type Text, My Videos, AI Credits tabs
│   └── out/
│       ├── audio/          # Per-scene .mp3 files
│       ├── video/          # Rendered .mp4 files
│       └── uploads/        # Uploaded source files
├── src/
│   ├── Root.jsx            # Remotion root
│   └── scenes/             # Remotion React scene components
├── DOCUMENTATION.md        # This file
└── package.json
```

---

## 🔁 Changelog

| Version | Date | Changes |
|---|---|---|
| V3.0 | Aug 2026 | Initial V3: NotebookLM summary, split video/summary pipeline |
| V3.1 | Aug 2026 | Added 11 Indian regional languages with native TTS voices |
| V3.2 | Aug 2026 | Script Index/TOC, "Topic N" labels, deep markdown formatting |
| V3.3 | Aug 2026 | ElevenLabs multi-key rotation, Deepgram key update |
| V3.4 | Aug 2026 | Full native script translation (headings, bullets, all UI text) |
| V3.5 | Aug 2026 | Fixed Groq model name, full automated token-completion rotation |
