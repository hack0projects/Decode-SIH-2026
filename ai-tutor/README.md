# AI Tutor Pipeline — CodeSeekho

**Member:** Krishna
**Status:** ✅ Core pipeline complete and published (Dify)

---

## What This Is

This is the AI Tutor component of CodeSeekho — a Dify-based RAG (Retrieval-Augmented Generation) chatbot that answers student coding questions using NCERT-aligned textbook content. It supports 5 programming languages and follows a Socratic teaching method (guides students toward answers instead of giving direct solutions).

**Note:** The actual bot runs on Dify's cloud platform, not in this repo. This folder contains the source content and integration code for reference and version tracking.

---

## Supported Languages

| Language | Status | Knowledge File |
|---|---|---|
| Python | ✅ Live | `knowledge-base/flow_of_control_python.md` |
| C++ | ✅ Live | `knowledge-base/flow_of_control_cpp.md` |
| HTML/CSS | ✅ Live | `knowledge-base/html_css_structure.md` |
| JavaScript | ✅ Live | `knowledge-base/javascript_flow_of_control.md` |
| Java | ✅ Live | `knowledge-base/java_flow_of_control.md` |

---

## Folder Structure

```
ai-tutor/
├── README.md                          ← this file
├── knowledge-base/                    ← content uploaded to Dify's knowledge base
│   ├── flow_of_control_python.md
│   ├── flow_of_control_cpp.md
│   ├── html_css_structure.md
│   ├── javascript_flow_of_control.md
│   └── java_flow_of_control.md
├── system-prompt.md                   ← finalized LLM system prompt used in Dify
└── backend-integration/
    └── ask-tutor-route.js             ← Express route used by backend to call Dify
```

---

## How It Works (High-Level Flow)

```
Student question + language
        ↓
Backend (/ask-tutor route)
        ↓
Dify API (published workflow)
        ↓
Start node (captures query + language)
        ↓
Knowledge Retrieval (filtered by language metadata)
        ↓
LLM (Gemini) generates Socratic-style answer using ONLY retrieved content
        ↓
Answer + citation returned to backend → frontend
```

---

## API Integration Details

**Base URL:** `https://api.dify.ai/v1`
**Endpoint used by backend:** `/chat-messages`

### Request format (sent from backend to Dify)
```json
{
  "inputs": {
    "language": "python"
  },
  "query": "student's question here",
  "response_mode": "blocking",
  "conversation_id": "",
  "user": "student_id"
}
```

### Valid `language` values
`python`, `cpp`, `htmlcss`, `javascript`, `java`
*(lowercase, must match exactly — this is how content filtering works)*

### Response format (returned to backend)
```json
{
  "answer": "AI's response text",
  "conversation_id": "for maintaining chat context across turns"
}
```

---

## Work Completed

- [x] Wrote 5 complete "Flow of Control" (or equivalent) chapters, one per language
- [x] Set up Dify knowledge base with metadata-based language filtering
- [x] Fixed workflow: added required `language` input field, wired metadata filter condition correctly
- [x] Rewrote system prompt to be language-agnostic (previously hardcoded to Python-only) while preserving Socratic teaching rules
- [x] Resolved embedding model, rerank model, and LLM provider issues (switched to Gemini after free credits ran out on other providers)
- [x] Re-indexed all documents after embedding model change
- [x] Tested all 5 languages individually — confirmed correct content retrieval and Socratic behavior
- [x] Shared API key + Express route with backend developer
- [x] Published the Dify workflow (live endpoint, no longer draft-only)

## Work Pending / Next Steps

- [ ] Full end-to-end test with live backend (`/ask-tutor`) and frontend
- [ ] Confirm integration point for translation (Bhashini) — before or after AI Tutor response
- [ ] Clarify ISL (Indian Sign Language) support ownership — currently unassigned
- [ ] Add second-topic chapters per language (beyond Flow of Control) if demo requires deeper content
- [ ] Confirm "Explain Error" combined flow logic with frontend (chains `/run-code` + `/ask-tutor`)

---

## Team Contacts for This Component

| Area | Owner | Depends on this component? |
|---|---|---|
| Backend (`/ask-tutor` route, Supabase logging) | Kritika | Yes — calls this Dify API directly |
| Frontend (AI Mentor Lab UI, dashboard drawer) | Frontend Lead | Yes — via Kritika's backend |
| Translation (`/translate`) | Bhashini teammate | Possibly — TBD on integration order |
| ISL support | Unassigned | Possibly — TBD |

---

*Last updated: as of the most recent Dify publish.*
