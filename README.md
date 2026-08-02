<div align="center">

# 🧑‍💻 CodeSeekho AI

### Inclusive, AI-powered coding education — in your language, in sign language, through real projects.

*Built for above-primary school students who've been left out of India's coding-education boom.*

</div>

---

## 📖 Overview

**CodeSeekho AI** *(working name)* is a CS/coding-specific inclusive learning platform for above-primary school students. It's built around **project-based, gamified lessons** — inspired by the "build something visible, get instant feedback" model — and teaches **real, industry-standard programming languages**, not an invented teaching syntax.

Unlike generic AI tutors, we focus specifically on **coding education**, and we remove two barriers that no existing product addresses *together*:

| Barrier | How we solve it |
|---|---|
| 🌐 **Language** | AI explanations & content in regional Indian languages, grounded in the official **NCERT / state-board CS curriculum** via a RAG pipeline — not generic translation |
| 🤟 **Hearing impairment** | **Indian Sign Language (ISL)** video/visual support built *directly into coding lessons* — a gap even India's best deaf-education platforms haven't filled, since they cover general STEM, not programming specifically |

> Learning happens through **creation**, not memorization.

---

## ❗ The Problem

Coding education in India today faces several barriers:

- Most resources are **English-centric**
- Beginners struggle with **abstract CS concepts** taught theory-first
- Learning is **theory-heavy** instead of project-based
- AI tools explain **syntax**, but rarely teach **concepts**
- Accessibility support is **inadequate**, especially for programming specifically
- Teachers can't easily see **where students are struggling**

---

## ✨ Our USP

> No existing product solves the **language barrier** and the **hearing-impairment barrier** together — specifically for coding education.

- 🗣️ **Regional-language, curriculum-grounded explanations** — powered by RAG over NCERT/state-board CS content, not raw translation
- 🤟 **ISL integrated into coding lessons themselves** — not just general STEM
- 💻 **Real programming languages**, WhiteHat Jr–style instant visible feedback
- 🏫 **Classroom-deployable**, with a teacher/school dashboard — not just a student-facing demo
- ⚙️ **Realistic build scope** — powered by LLM APIs + off-the-shelf speech/OCR APIs + a Blockly-or-simplified code editor, no custom ML required

---

## 🚀 Features

### Core
- **AI Coding Mentor** — explains concepts & errors in simple language, adapts to student level
- **Regional Language Support** — multilingual UI + AI explanations, NCERT/Bhashini-grounded
- **Project-Based Learning** — Calculator, Quiz App, Tic Tac Toe, Portfolio Website, Mini Games
- **ISL Accessibility Support** — sign-language video support woven into lessons

### Supporting
- **Personalized Learning Path** — tracks mastery, adjusts difficulty, generates practice
- **Spaced Revision Engine** — remembers repeated mistakes and resurfaces weak concepts until mastered
- **Teacher Dashboard** — student progress, weak concepts, class analytics, learning reports
- **Offline Mode** — downloadable lecture PDFs, cached AI-tutor conversations, local SQLite question bank

---

## 🏗️ Tech Stack

| Layer | Choice |
|---|---|
| Frontend | React.js |
| Code Editor | Blockly and/or Monaco Editor |
| Backend | Node.js (Express) or Python (FastAPI) |
| AI / LLM Layer | LLM API (Claude / GPT / Gemini) |
| Curriculum Grounding | RAG pipeline + Vector DB (FAISS / Pinecone) |
| Regional Language | Bhashini API / LLM translation |
| ISL Support | Pre-recorded ISL video library or ISL avatar API |
| Speech / OCR | Off-the-shelf Speech-to-Text & OCR APIs |
| Database (cloud) | PostgreSQL / Firebase |
| Database (offline) | SQLite |
| Auth | Firebase Auth / OAuth |
| Dashboard Analytics | Recharts / Chart.js |
| Hosting | Vercel/Netlify (frontend) + Render/Railway (backend) |

> We deliberately avoid custom ML training — all AI capability comes from existing LLM/speech/OCR/translation APIs, so the team can focus on integration and UX within the hackathon timeframe.

---

## 🔄 How It Works

```
Student App (React)
      │
      ▼
 Backend API ──► LLM API (grounded via RAG on NCERT/state-board content)
      │                     │
      │           regional language? ──► Bhashini/LLM translation
      │                     │
      │           ISL mode?  ──► matched ISL video clip
      ▼
Progress Database ──► Personalized Learning Path + Teacher Dashboard
      │
      ▼
Spaced Revision Engine (resurfaces weak concepts)

Offline: falls back to local SQLite question bank + cached tutor chats/PDFs,
         syncs to cloud once back online.
```

---

## 🗺️ Development Roadmap

| Phase | Focus | Key Deliverables |
|---|---|---|
| **0 — Setup** | Repo, architecture, design | Repo scaffolding, wireframes, API keys ready |
| **1 — Core Loop** | AI Mentor + Code Editor | End-to-end flow for one project (e.g. Calculator) |
| **2 — Inclusion Layer** | Regional language + ISL | RAG live, language toggle, ISL clips for module 1 |
| **3 — Progress & Teacher View** | Personalization + dashboard | Mastery tracking, weak-topic flags, class analytics |
| **4 — Retention Features** | Spaced revision + offline mode | Revision engine, offline PDFs, cached chats, SQLite bank |
| **5 — Polish & Demo** | QA, UX, pitch prep | Bug fixes, polished demos, pitch deck, backup recording |

**Scope-cutting rule:** always keep one working end-to-end demo (one project, one language, one accessibility mode) functional before adding breadth.

---

## 🎯 Target Audience

- Middle school to college students (preferably Class 8+)
- Beginner programmers
- Regional-language learners & students facing language barriers
- Students with accessibility needs (initial focus: hearing-impaired learners)
- Schools and colleges introducing coding under **NEP 2020**

---

## 📌 Open Decisions

- [ ] Backend language — Node.js vs Python/FastAPI (based on team skillset)
- [ ] Which NCERT/state-board CS chapters to embed first for the demo
- [ ] ISL content approach — pre-recorded clip library vs. live ISL-avatar API

---

## 📄 License

_TBD_

## 🤝 Contributing

This is an active hackathon project — issues and PRs from the team are welcome as the codebase comes together.

---

<div align="center">
Made with ❤️ to make coding education actually inclusive.
</div>