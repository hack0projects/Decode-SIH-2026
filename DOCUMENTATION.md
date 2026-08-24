# 🚀 CodeSeekho V3 — AI Avatar Video & Study Generation System

CodeSeekho V3 is an advanced educational AI pipeline that instantly transforms unstructured text, PDFs, PPTs, or markdown into **fully animated, lip-synced educational avatar videos** and **deep NotebookLM-style study summaries**.

---

## 🏗️ System Architecture

The project follows a decoupled client-server architecture built around **Remotion** for programmatic video rendering.

*   **Frontend:** React + Remotion. (Handles UI, video player, and scene definitions).
*   **Backend:** Node.js + Express. (Handles file parsing, AI orchestration, audio synthesis, and the Remotion CLI render engine).
*   **Database & Storage:** Supabase (Stores job metadata, script JSONs, and compressed `.mp4` video files).
*   **Video Engine:** Remotion CLI + FFmpeg (Programmatically maps JSON scenes to React components, aligns word-level audio, and compresses outputs).

---

## 🔄 The 5-Phase Video Pipeline

When a user submits a file or text prompt for a video, the backend (`backend-v3/server.js`) triggers a robust 5-Phase `runPipeline`:

### Phase 1: LLM Scripting & Translation
*   **Input:** Raw text/file and a target language (e.g., Hindi, English, Bengali).
*   **Process:** An AI model is prompted using the `buildVideoPrompt` engine. It generates a balanced 10-12 scene script designed for a 4-5 minute engaging video.
*   **Output:** A structured JSON object defining Scene Types (`intro`, `explainer`, `comparison`, `flowchart`, `code`), complete with 3-4 sentences of narration, bullet points, and key terms translated into the target language.

### Phase 2: AI Voice Synthesis (TTS)
*   **Process:** The `voiceGenerator.js` processes each scene's narration text.
*   **Redundancy:** It runs through a smart fallback chain:
    1.  **Deepgram Aura:** Extremely fast human-like voice (English).
    2.  **ElevenLabs:** Premium conversational AI voice (Rotating keys support).
    3.  **Google Cloud TTS:** Reliable high-quality fallback.
    4.  **Edge-TTS (Microsoft Neural):** Unlimited free fallback, explicitly used for **11+ Indian Regional Languages**.
*   **Output:** `.mp3` audio files for each scene saved to `public/audio/`.

### Phase 3: Avatar Generation
*   **Process:** Generates the talking head. Configured to integrate with **SadTalker** (or D-ID/Remotion native fallbacks) to sync the generated `.mp3` audio with a static avatar image, producing a lip-synced overlay video.

### Phase 4: Remotion Video Rendering
*   **Process:** The backend invokes the Remotion CLI (`npx remotion render`). It passes the structured JSON script and audio paths as dynamic props. React renders the frames (Subtitles, Scene Graphics, Avatar overlay) synced exactly to the audio durations via `ffprobe`.
*   **Output:** A raw, uncompressed `.mp4` video.

### Phase 5: Compression & Cloud Upload
*   **Process:** Raw videos can exceed 60MB. The backend uses `FFmpeg` to compress the video to 720p (CRF 28), reducing the file size by 60-80% (typically 10-15MB).
*   **Upload:** Pushed to a Supabase Storage bucket. The resulting Public URL is saved to the PostgreSQL database and returned to the client.

---

## 🧠 AI Model Rotation & Redundancy

To ensure 100% uptime and bypass API rate limits or quota exhaustion, CodeSeekho V3 implements custom **Smart Rotation Engines**:

### 1. LLM Rotator (`llmRotation.js`)
If the primary LLM fails, hallucinates, or outputs invalid JSON, the system immediately catches the error and falls back to the next model in the chain:
1.  **Gemini 3.5 Flash Lite** (Primary - fast & large context)
2.  **Groq Compound Mini** 
3.  **Cloudflare Llama 3.1**
4.  **OpenRouter Nemotron 120B**
5.  **OpenRouter Nano / Qwen**

### 2. TTS Key Rotation (`voiceGenerator.js`)
API keys for premium services (like ElevenLabs) run out of characters quickly. The backend parses multiple comma-separated keys from the `.env` file and **auto-rotates** through them seamlessly during a single video generation if a `401/402 Quota Exceeded` error occurs.

---

## 📚 NotebookLM-Style Script Summary

Independent of the Video Generation, users can generate a "Script Summary". 
This bypasses the short 4-minute video limits and asks the LLM to generate an exhaustive, unlimited-scene JSON. 

The backend's `scriptToMarkdown` engine then parses this into a beautiful Markdown document featuring:
*   **📋 Table of Contents / Index:** Clickable topic tracking.
*   **🎯 Topic Overview:** High-level summary.
*   **🔑 Key Terms Glossary:** Important definitions.
*   **📖 Detailed Breakdowns:** Code blocks, comparison tables, flowchart steps, and full narrative explanations.

---

## 🌍 Multilingual Indian Regional Support

CodeSeekho breaks language barriers by mapping user UI selections directly to native Neural TTS voices. Content can be instantly translated and narrated in:
*   English
*   Hindi, Hinglish
*   Bengali, Marathi, Telugu, Tamil, Gujarati, Kannada, Malayalam, Punjabi, Urdu

*(Non-English requests bypass English-only APIs like Deepgram/ElevenLabs and route directly to Microsoft's native regional Neural voices).*

---

## ⚙️ Environment Variables Setup

The system relies on a `.env` file located in `backend-v3/`. 

```env
# Supabase Database & Storage
SUPABASE_URL=...
SUPABASE_KEY=...

# AI Text Models (Rotation)
GEMINI_API_KEY=...
GROQ_API_KEY=...
OPENROUTER_API_KEY=...

# AI Voice Models (Rotation)
# Comma-separate keys for auto-rotation
ELEVENLABS_API_KEY=key1,key2
DEEPGRAM_API_KEY=...
FISH_AUDIO_API_KEY=...

# Video / Other
KLING_API_KEY=...
HAILUO_API_KEY=...
CLOUDFLARE_API_KEY=...
```
