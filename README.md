<div align="center">

# 🚀 Launchpad

### AI-powered career preparation platform for students chasing placements

[![Next.js](https://img.shields.io/badge/Next.js-16-black?style=flat-square&logo=next.js)](https://nextjs.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.100+-009688?style=flat-square&logo=fastapi)](https://fastapi.tiangolo.com)
[![Groq](https://img.shields.io/badge/Groq-LLaMA_3.3_70B-orange?style=flat-square)](https://groq.com)
[![LangChain](https://img.shields.io/badge/LangChain-RAG-green?style=flat-square)](https://langchain.com)
[![License](https://img.shields.io/badge/License-MIT-blue?style=flat-square)](LICENSE)

[Live Demo](https://launchpad-smoky-ten.vercel.app) · [Report Bug](https://github.com/mansaakohli15/launchpad/issues) · [Request Feature](https://github.com/mansaakohli15/launchpad/issues)

</div>

---

## 📸 Preview

> Resume Analyzer · Mock Interview · RAG Assistant · Learning Roadmap

---
## 🌐 Live Demo

- **Frontend:** https://launchpad-smoky-ten.vercel.app
- **Backend API:** https://launchpad-production-2461.up.railway.app


## 🎯 What is Launchpad?

Most students struggle with weak resumes, no interview guidance, scattered preparation, and generic AI tools. Launchpad solves this with:

- **AI Resume Analyzer** — ATS match scoring, missing keywords, and exact improvement suggestions
- **AI Resume Optimizer** — Rewrites your resume for a specific JD and downloads as PDF
- **Mock Interview Engine** — Adaptive 5-round interviews with per-answer scoring and voice input
- **RAG Knowledge Assistant** — Upload your notes and PDFs, ask anything, get answers from your own materials
- **Learning Roadmap** — Week-by-week personalized prep plan with an interactive road animation

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 16 + Tailwind CSS |
| Backend | FastAPI (Python) |
| AI Model | LLaMA 3.3 70B via Groq API |
| RAG Pipeline | LangChain + ChromaDB + HuggingFace Embeddings |
| PDF Parsing | PyMuPDF |
| PDF Generation | ReportLab |
| Deployment | Vercel (frontend) + Render (backend) |

---

## 🚀 Running Locally

### Prerequisites
- Node.js 18+
- Python 3.10+
- Groq API key (free at [console.groq.com](https://console.groq.com))

### Backend Setup

```bash
cd backend
python -m venv venv

# Windows
venv\Scripts\activate

# Mac/Linux
source venv/bin/activate

pip install fastapi uvicorn groq pymupdf python-dotenv \
  langchain langchain-community langchain-core langchain-groq \
  langchain-huggingface chromadb sentence-transformers \
  python-multipart reportlab
```

Create `backend/.env`:
```
GROQ_API_KEY=your_groq_api_key_here
```

Start backend:
```bash
uvicorn main:app --reload
# Running on ${process.env.NEXT_PUBLIC_API_URL}
```

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
# Running on http://localhost:3000
```

---

## 📁 Project Structure

```
launchpad/
├── frontend/                    # Next.js app
│   └── app/
│       ├── page.tsx             # Landing page
│       └── dashboard/
│           ├── layout.tsx       # Sidebar layout
│           ├── page.tsx         # Dashboard home
│           ├── resume/          # Resume analyzer + optimizer
│           ├── interview/       # Mock interview engine
│           ├── assistant/       # RAG knowledge assistant
│           └── roadmap/         # Learning roadmap
│
└── backend/                     # FastAPI server
    └── main.py                  # All API endpoints
```

---

## 🔌 API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/analyze-resume` | ATS analysis against job description |
| POST | `/api/optimize-resume` | AI rewrite + PDF download |
| POST | `/api/interview/question` | Get adaptive interview question |
| POST | `/api/interview/evaluate` | Score and evaluate answer |
| POST | `/api/assistant/upload` | Upload + embed PDF documents |
| POST | `/api/assistant/chat` | RAG-based Q&A from documents |
| POST | `/api/roadmap` | Generate personalized learning plan |

---

## 🌟 Key Features

### Resume Analyzer
Upload your resume PDF and paste any job description. Get an ATS match score out of 100, missing keywords highlighted, weak sections identified, and specific improvement suggestions.

### AI Resume Optimizer
The AI rewrites your resume bullet points to include JD keywords naturally — without inventing experience. Downloads as a clean, ATS-friendly PDF.

### Mock Interview Engine
Choose your target role (SWE, ML, DSA, HR, Frontend, Backend). Answer 5 adaptive questions with voice input support. Get scored on every answer with feedback on what was good, what was missing, and ideal answer hints.

### RAG Knowledge Assistant
Upload multiple PDFs — DBMS notes, OS concepts, interview prep materials. Ask questions in plain English. The system retrieves relevant chunks using semantic search and answers from your own materials.

### Learning Roadmap
Enter your goal, timeline, and current skills. Get a week-by-week plan with an interactive SVG road animation, must-learn skills, projects to build, and curated resources.

---

## 🚢 Deployment

### Frontend → Vercel
```bash
cd frontend
npx vercel --prod
```

### Backend → Railway
1. Push to GitHub
2. New Web Service on [railway.com](https://railway.com)
3. Build command: `pip install -r requirements.txt`
4. Start command: `uvicorn main:app --host 0.0.0.0 --port 10000`
5. Add environment variable: `GROQ_API_KEY`

---

## 👩‍💻 Author

Built by a student, for students chasing placements.

**Mansaa Kohli** — [GitHub](https://github.com/mansaakohli15)

---

## 📄 License

MIT License — feel free to use, modify, and distribute.

---

<div align="center">
Made with 🚀 and way too much caffeine
</div>
