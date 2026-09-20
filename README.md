<p align="center">
  <img src="src/logo.svg" alt="Lingocare Logo" width="64" />
</p>

<h1 align="center">Lingocare Curriculum Engine</h1>

<p align="center">
  <strong>AI-powered curriculum creation tool for nursing education</strong>
  <br />
  Build structured course content manually or generate entire curricula from PDF uploads.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-16-black?logo=next.js" alt="Next.js 16" />
  <img src="https://img.shields.io/badge/React-19-61dafb?logo=react" alt="React 19" />
  <img src="https://img.shields.io/badge/TypeScript-5-3178c6?logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Tailwind-4-38bdf8?logo=tailwindcss&logoColor=white" alt="Tailwind CSS 4" />
  <img src="https://img.shields.io/badge/AI-Groq%20API-f55036" alt="Groq API" />
</p>

---

## ✨ What It Does

A single-page curriculum creation tool with two approaches:

1. **Manual Creation** — Click to add Modules, Topics, and Lessons. Inline edit titles and descriptions Notion-style. No modals, no separate screens.

2. **AI-Powered Generation** — Upload a PDF document (e.g. a nursing syllabus), and the AI extracts the structure, identifies Modules/Topics/Lessons, infers missing content, and renders everything in the same editable hierarchy.

Both flows produce the same fully editable `Curriculum → Module → Topic → Lesson` tree.

---

## 🧩 Key Features

| Feature | Description |
|---|---|
| **Inline Editing** | Click any title or description to edit in place. Enter saves, Esc cancels. |
| **Nested Hierarchy** | Curriculum → Module → Topic → Lesson with visually distinct card nesting. |
| **Auto-Numbering** | `MODULE 1 —`, `Topic 1 —`, `Lesson 1.1 –` labels for structural clarity. |
| **AI PDF Upload** | Upload a curriculum PDF → AI parses structure → Review before import. |
| **Origin Tracking** | Every item shows its provenance: `FROM PDF`, `AI INFERRED`, or `EDITED`. |
| **Review Before Import** | AI-generated content shows a summary panel before replacing the editor. |
| **Processing Overlay** | Multi-step progress: Upload → Extract → Understand → Validate. |
| **Undo Delete** | No confirmation dialogs. Deletes instantly with a 5-second undo toast. |
| **Expand / Collapse All** | Toolbar buttons to expand or collapse the entire tree. |
| **Collapsed Summaries** | Collapsed nodes show `"3 topics · 7 lessons"` at a glance. |
| **Local Persistence** | Curriculum auto-saves to `localStorage` — survives page refresh. |
| **Brand Accent** | Uses Lingocare's official `#EC8601` orange throughout the interface. |

---

## 🏗️ Architecture

```
src/
├── app/
│   ├── api/parse-pdf/
│   │   └── route.ts            # Serverless API: PDF → text → LLM → JSON
│   ├── layout.tsx              # Root layout with Geist font + metadata
│   ├── page.tsx                # Main page: Toolbar + Tree + Toast + Overlays
│   ├── globals.css             # Design tokens, brand colors, base styles
│   └── icon.svg                # Favicon (Lingocare logo)
│
├── components/
│   ├── NodeRenderer.tsx        # Recursive tree renderer (cards, numbering, badges)
│   ├── InlineEdit.tsx          # Notion-style click-to-edit for titles/descriptions
│   ├── OriginBadge.tsx         # FROM PDF / AI INFERRED / EDITED provenance badge
│   ├── AiReviewPanel.tsx       # Review AI output before importing into editor
│   ├── ProcessingOverlay.tsx   # Multi-step progress during PDF processing
│   └── Toast.tsx               # Slide-up undo toast (replaces window.confirm)
│
├── context/
│   └── CurriculumContext.tsx   # Central state: useReducer + localStorage persistence
│
├── lib/
│   ├── pdf.ts                  # PDF text extraction via pdf-parse child process
│   ├── prompts.ts              # LLM system/user prompts with origin tracking
│   ├── validate.ts             # Schema validation & sanitization of LLM output
│   └── utils.ts                # cn() helper (clsx + tailwind-merge)
│
├── types/
│   └── curriculum.ts           # CurriculumNode type, NodeOrigin, factory functions
│
└── utils/
    └── treeMutations.ts        # Immutable tree operations (add, delete, edit, expand)
```

### Data Flow

```
┌──────────────────────────────────────────────────────────────────────┐
│                          MANUAL FLOW                                │
│  User clicks "Add Module" → dispatch(ADD_CHILD) → tree re-renders  │
│  User clicks title → InlineEdit → dispatch(UPDATE_TITLE) → saved   │
└──────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────┐
│                            AI FLOW                                  │
│  PDF Upload → /api/parse-pdf                                        │
│    → extractTextFromPDF (pdf-parse in child process)                │
│    → callLLM (Groq API with structured prompt)                      │
│    → validateAndSanitize (schema enforcement + origin tracking)     │
│    → Response JSON                                                  │
│  Frontend receives → AiReviewPanel (summary + stats)                │
│    → User clicks "Import" → dispatch(REPLACE_TREE) → tree renders  │
│  All AI-generated items are immediately editable inline.            │
└──────────────────────────────────────────────────────────────────────┘
```

---Below is the verified end-to-end architecture---

```
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│                                    BROWSER (CLIENT)                                     │
│                                                                                         │
│   ┌─────────────────────────────────────────────────────────────────────────────────┐   │
│   │                                 src/app/page.tsx                                │   │
│   │ ┌───────────────────────┐ ┌───────────────────────────┐ ┌─────────────────────┐ │   │
│   │ │        Toolbar        │ │       NodeRenderer        │ │    UndoToast        │ │   │
│   │ └───────────┬───────────┘ └─────────────▲─────────────┘ └─────────────────────┘ │   │
│   └─────────────┼───────────────────────────┼───────────────────────────────────────┘   │
│                 │                           │                                           │
│   ┌─────────────▼───────────────────────────┴───────────────────────────────────────┐   │
│   │                   STATE LAYER: src/context/CurriculumContext.tsx                    │  
│   │  useReducer(curriculumReducer)  <───>  localStorage ("lingocare_curriculum_state")  │
│   └─────────────┬───────────────────────────────────────────────────────────────────┘   │
└─────────────────┼───────────────────────────────────────────────────────────────────────┘
                  │ HTTP POST (FormData)
                  ▼
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│                                NEXT.JS SERVER (BACKEND)                                 │
│                                                                                         │
│   ┌─────────────────────────────────────────────────────────────────────────────────┐   │
│   │                        src/app/api/parse-pdf/route.ts                           │   │
│   │                                                                                 │   │
│   │  1. Receive file Buffer  ──>  src/lib/pdf.ts (pdf2json coordinate parser)       │   │
│   │  2. Extract Text Lines & Raw Text                                               │   │
│   │                                                                                 │   │
│   │  ─── TIER 1: Regex Parser (src/lib/parse-structure.ts) ───────────────────────  │   │
│   │       Has explicit hierarchy headers?  ──YES──> [Validate & Return]             │   │
│   │       │ NO                                                                      │   │
│   │       ▼                                                                         │   │
│   │  ─── TIER 2: LLM Parser (Groq SDK) ───────────────────────────────────────────  │   │
│   │       Calls groq.chat.completions.create(model: 'openai/gpt-oss-120b')          │   │
│   │       │ Failed / Rate-limited?                                                  │   │
│   │       ▼                                                                         │   │
│   │  ─── TIER 3: Intelligent Fallback (src/lib/fallback.ts) ─────────────────────── │   │
│   │       Generate structured nodes from raw lines                                  │   │
│   │                                                                                 │   │
│   │  3. Sanitize & Enforce Schema  ──>  src/lib/validate.ts (validateAndSanitize)   │   │
│   └────────────────────────────────────────┬────────────────────────────────────────┘   │
└────────────────────────────────────────────┼────────────────────────────────────────────┘
                                             │ JSON Response: { curriculum: ... }
                                             ▼
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│                                 BROWSER REVIEW GATE                                     │
│                                                                                         │
│   User sees src/components/AiReviewPanel.tsx (Shows Stats & Inferred vs Source breakdown)│
│   User clicks "Import" ──> dispatch({ type: 'REPLACE_TREE' }) ──> Tree Renders          │
└─────────────────────────────────────────────────────────────────────────────────────────┘

```

## 🧠 AI Integration Design

The AI layer is designed around **transparency and control**:

- **Prompt Design** — The LLM receives a structured system prompt that mandates JSON output with the exact `Curriculum → Module → Topic → Lesson` schema. Each item must include an `origin` field (`"source"` for directly extracted content, `"inferred"` for AI-generated content).

- **Missing Content Inference** — If a PDF has modules but no topics/lessons, the AI generates contextually appropriate ones and marks them as `inferred`.

- **Review Before Import** — AI output is never automatically applied. The user sees a summary panel showing module/topic/lesson counts and source vs. inferred breakdown before deciding to import.

- **Origin Tracking** — Every item shows its provenance via color-coded badges. When a user edits AI-generated content, the badge changes to `EDITED`. This creates a clear audit trail.

- **Fallback Handling** — If the LLM fails or the PDF has no recognizable structure, a fallback curriculum is created with appropriate labeling.

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** v18+
- **Groq API Key** — Get one free at [console.groq.com](https://console.groq.com)

### Installation

```bash
# Clone the repository
git clone <your-repo-url>
cd lingocare-curriculum

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local and add your Groq API key:
# GROQ_API_KEY=gsk_your_key_here
```

### Run Locally

```bash
# Development (hot reload)
npm run dev

# Production build
npm run build && npm start
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🌐 Deployment (Vercel)

This project is optimized for [Vercel](https://vercel.com) deployment:

1. Push the code to a GitHub repository.
2. Import the repository in the Vercel dashboard.
3. Add the `GROQ_API_KEY` environment variable in Vercel project settings.
4. Deploy — Vercel auto-detects Next.js and handles the build.

The AI-powered PDF parsing runs as a **Vercel Serverless Function** (`/api/parse-pdf`), so no additional backend infrastructure is needed.

---

## 🛠️ Tech Stack

| Layer | Technology | Purpose |
|---|---|---|
| Framework | Next.js 16 (App Router) | SSR, routing, API routes |
| UI | React 19 | Component rendering |
| Language | TypeScript 5 | Type safety |
| Styling | Tailwind CSS 4 | Utility-first styling |
| AI | Groq API (`openai/gpt-oss-120b`) | Curriculum generation from PDF text |
| PDF | pdf-parse 1.1.1 | Text extraction from uploaded PDFs |
| State | React useReducer + Context | Centralized, immutable state management |
| Persistence | localStorage | Draft auto-save (no database required) |
| Icons | Heroicons 2 | UI iconography |
| Font | Geist (via next/font) | Modern sans-serif typography |

---

## 📋 Design Decisions

1. **No modals for editing** — Inline editing (Notion-style) keeps the user in flow. Clicking a title or description switches it to an editable field in place.

2. **Delete without confirmation** — `window.confirm()` breaks the user's flow. Instead, items delete instantly and show a 5-second undo toast. This is how modern apps (Gmail, Notion, Slack) handle destructive actions.

3. **AI review gate** — AI-generated content could overwrite hours of manual work. The review panel acts as a deliberate checkpoint, showing what was generated before the user decides to import.

4. **Origin badges** — A teacher should always know what came from the document, what the AI inferred, and what they personally edited. This builds trust in the AI workflow.

5. **Card-based nesting** — Modules have bordered cards, Topics have lighter nested cards inside them. This matches the visual language of Lingocare's platform and makes hierarchy unambiguous at any nesting depth.

6. **localStorage persistence** — The brief specifies no database. `localStorage` ensures the teacher never loses work on accidental refresh while keeping the architecture simple.

---

## 📄 License

Built as a technical task submission for [Lingocare](https://lingocare.ai).
