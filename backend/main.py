from fastapi import FastAPI, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from typing import List
import os, json, io, re
from groq import Groq
from dotenv import load_dotenv
import fitz
from langchain_text_splitters import RecursiveCharacterTextSplitter

load_dotenv()
client = Groq(api_key=os.getenv("GROQ_API_KEY"))

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "https://launchpad-ai.vercel.app",
        os.getenv("FRONTEND_URL", ""),
    ],
    allow_methods=["*"],
    allow_headers=["*"],
)

# In-memory document store (lightweight RAG)
doc_store: dict = {}

# ── HEALTH ────────────────────────────────────────────────
@app.get("/")
def root():
    return {"status": "Launchpad API running"}


# ── PDF UTILS ─────────────────────────────────────────────
def extract_text_from_pdf(file_bytes: bytes) -> str:
    doc = fitz.open(stream=file_bytes, filetype="pdf")
    return "".join(page.get_text() for page in doc)

def parse_resume_result(result: str) -> dict:
    sections = {
        "match_score": 0, "strong_points": [], "missing_keywords": [],
        "weak_sections": [], "improvement_suggestions": [], "final_verdict": ""
    }
    current = None
    for line in result.split('\n'):
        line = line.strip()
        if line.startswith("MATCH_SCORE:"):
            try: sections["match_score"] = int(''.join(filter(str.isdigit, line.split(":")[1])))
            except: pass
        elif line == "STRONG_POINTS:": current = "strong_points"
        elif line == "MISSING_KEYWORDS:": current = "missing_keywords"
        elif line == "WEAK_SECTIONS:": current = "weak_sections"
        elif line == "IMPROVEMENT_SUGGESTIONS:": current = "improvement_suggestions"
        elif line == "FINAL_VERDICT:": current = "final_verdict"
        elif line.startswith("- ") and current in ["strong_points","missing_keywords","weak_sections","improvement_suggestions"]:
            sections[current].append(line[2:])
        elif current == "final_verdict" and line:
            sections["final_verdict"] += line + " "
    return sections


# ── RESUME ANALYZE ────────────────────────────────────────
@app.post("/api/analyze-resume")
async def analyze_resume_endpoint(file: UploadFile = File(...), job_description: str = Form(...)):
    file_bytes = await file.read()
    resume_text = extract_text_from_pdf(file_bytes)
    prompt = f"""You are an expert resume coach and ATS specialist.
Analyze this resume against the job description below.

RESUME:
{resume_text}

JOB DESCRIPTION:
{job_description}

Give a detailed analysis in EXACTLY this format:

MATCH_SCORE: [number between 0-100]

STRONG_POINTS:
- [point 1]
- [point 2]
- [point 3]

MISSING_KEYWORDS:
- [keyword 1]
- [keyword 2]
- [keyword 3]

WEAK_SECTIONS:
- [section 1]
- [section 2]

IMPROVEMENT_SUGGESTIONS:
- [suggestion 1]
- [suggestion 2]
- [suggestion 3]

FINAL_VERDICT:
[2-3 sentences on whether they should apply and what to fix first]"""
    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[{"role": "user", "content": prompt}]
    )
    return parse_resume_result(response.choices[0].message.content)


# ── RESUME OPTIMIZE ───────────────────────────────────────
@app.post("/api/optimize-resume")
async def optimize_resume(file: UploadFile = File(...), job_description: str = Form(...)):
    file_bytes = await file.read()
    resume_text = extract_text_from_pdf(file_bytes)
    prompt = f"""You are an expert ATS resume writer.
Rewrite this resume to maximize ATS score for the job description below.

Rules:
- Keep all real experience, education, and projects — do not invent anything
- Rewrite bullet points to use keywords from the job description naturally
- Make bullet points start with strong action verbs
- Add measurable impact where possible
- Make it ATS-friendly: no tables, no columns

ORIGINAL RESUME:
{resume_text}

JOB DESCRIPTION:
{job_description}

Return ONLY the optimized resume text. No explanations.
Use this structure:

[FULL NAME]
[Email] | [Phone] | [LinkedIn/GitHub]

SUMMARY
[2-3 sentence summary with JD keywords]

SKILLS
[Comma separated skills]

EXPERIENCE
[Company] | [Role] | [Dates]
- [Rewritten bullet]

EDUCATION
[Degree] | [University] | [Year]

PROJECTS
[Project Name] | [Tech Stack]
- [Description]"""

    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[{"role": "user", "content": prompt}]
    )
    optimized_text = response.choices[0].message.content

    try:
        from reportlab.lib.pagesizes import A4
        from reportlab.lib.styles import ParagraphStyle
        from reportlab.lib.units import cm
        from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer

        buffer = io.BytesIO()
        doc = SimpleDocTemplate(buffer, pagesize=A4,
            rightMargin=2*cm, leftMargin=2*cm, topMargin=2*cm, bottomMargin=2*cm)

        normal = ParagraphStyle('normal', fontName='Helvetica', fontSize=10, leading=15, spaceAfter=3)
        heading = ParagraphStyle('heading', fontName='Helvetica-Bold', fontSize=12, leading=16, spaceAfter=4, spaceBefore=10)
        name_style = ParagraphStyle('name', fontName='Helvetica-Bold', fontSize=16, leading=22, spaceAfter=2)

        story = []
        is_first = True
        for line in optimized_text.split('\n'):
            line = line.strip()
            if not line:
                story.append(Spacer(1, 5))
                continue
            if is_first:
                story.append(Paragraph(line, name_style))
                is_first = False
            elif line.isupper() and len(line) < 30:
                story.append(Paragraph(f'<u>{line}</u>', heading))
            elif line.startswith('- '):
                story.append(Paragraph(f"• {line[2:]}", normal))
            else:
                story.append(Paragraph(line, normal))

        doc.build(story)
        buffer.seek(0)
        return StreamingResponse(buffer, media_type="application/pdf",
            headers={"Content-Disposition": "attachment; filename=optimized_resume.pdf"})
    except ImportError:
        return StreamingResponse(io.BytesIO(optimized_text.encode()),
            media_type="text/plain",
            headers={"Content-Disposition": "attachment; filename=optimized_resume.txt"})


# ── INTERVIEW ─────────────────────────────────────────────
class Message(BaseModel):
    role: str
    content: str

class QuestionRequest(BaseModel):
    role: str
    question_num: int
    history: List[Message]

class EvaluateRequest(BaseModel):
    role: str
    question: str
    answer: str

def parse_evaluation(evaluation: str) -> dict:
    result = {"score": 0, "what_was_good": "", "what_was_missing": "", "ideal_answer_hint": ""}
    current = None
    for line in evaluation.split('\n'):
        line = line.strip()
        if line.startswith("SCORE:"):
            try: result["score"] = int(''.join(filter(str.isdigit, line.split(":")[1])))
            except: pass
        elif line == "WHAT_WAS_GOOD:": current = "what_was_good"
        elif line == "WHAT_WAS_MISSING:": current = "what_was_missing"
        elif line == "IDEAL_ANSWER_HINT:": current = "ideal_answer_hint"
        elif current and line: result[current] += line + " "
    return result

@app.post("/api/interview/question")
async def get_question(req: QuestionRequest):
    messages = [{"role": "system", "content": f"You are a strict but fair technical interviewer for a {req.role} position. Ask ONE interview question at a time. Progress from basic to advanced. You are on question {req.question_num} of 5."}]
    for m in req.history:
        messages.append({"role": m.role, "content": m.content})
    messages.append({"role": "user", "content": "Ask the next interview question."})
    response = client.chat.completions.create(model="llama-3.3-70b-versatile", messages=messages)
    return {"question": response.choices[0].message.content}

@app.post("/api/interview/evaluate")
async def evaluate_answer(req: EvaluateRequest):
    prompt = f"""You are evaluating a candidate's answer in a {req.role} interview.
Question: {req.question}
Candidate's Answer: {req.answer}

Evaluate in EXACTLY this format:

SCORE: [number 0-10]

WHAT_WAS_GOOD:
[1-2 sentences]

WHAT_WAS_MISSING:
[1-2 sentences]

IDEAL_ANSWER_HINT:
[2-3 sentences]"""
    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[{"role": "user", "content": prompt}]
    )
    return parse_evaluation(response.choices[0].message.content)


# ── RAG ASSISTANT (lightweight — no torch) ────────────────
def simple_chunk_text(text: str, chunk_size: int = 400) -> list:
    splitter = RecursiveCharacterTextSplitter(chunk_size=chunk_size, chunk_overlap=40)
    return splitter.split_text(text)

def keyword_search(query: str, docs: list, k: int = 4) -> list:
    query_words = set(re.findall(r'\w+', query.lower()))
    scores = []
    for i, doc in enumerate(docs):
        doc_words = set(re.findall(r'\w+', doc.lower()))
        overlap = len(query_words & doc_words)
        scores.append((i, overlap))
    scores.sort(key=lambda x: x[1], reverse=True)
    return [docs[i] for i, _ in scores[:k] if _ > 0]

class ChatRequest(BaseModel):
    session_id: str
    question: str

@app.post("/api/assistant/upload")
async def upload_documents(files: List[UploadFile] = File(...), session_id: str = Form(...)):
    all_chunks = []
    file_count = 0
    for uploaded_file in files:
        file_bytes = await uploaded_file.read()
        text = extract_text_from_pdf(file_bytes)
        chunks = simple_chunk_text(text)
        all_chunks.extend(chunks)
        file_count += 1
    doc_store[session_id] = all_chunks
    return {"status": "ok", "chunks": len(all_chunks), "files": file_count}

@app.post("/api/assistant/chat")
async def chat_with_docs(req: ChatRequest):
    if req.session_id not in doc_store or not doc_store[req.session_id]:
        return {"answer": "No documents found. Please upload your study materials first."}

    relevant = keyword_search(req.question, doc_store[req.session_id], k=4)
    if not relevant:
        relevant = doc_store[req.session_id][:3]

    context = "\n\n".join(relevant)
    prompt = f"""You are a helpful study assistant. Answer using ONLY the context below from the user's uploaded documents. If the answer isn't in the context, say so.

Context:
{context}

Question: {req.question}

Answer:"""

    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[{"role": "user", "content": prompt}]
    )
    return {"answer": response.choices[0].message.content}


# ── ROADMAP ───────────────────────────────────────────────
class RoadmapRequest(BaseModel):
    goal: str
    timeframe: str
    current_skills: str

@app.post("/api/roadmap")
async def generate_roadmap(req: RoadmapRequest):
    prompt = f"""You are an expert career coach. Generate a personalized learning roadmap.

Goal: {req.goal}
Timeframe: {req.timeframe}
Current Skills: {req.current_skills}

Respond in EXACTLY this JSON format (no extra text, no markdown, just valid JSON):
{{
  "weekly_plan": [
    {{"week": "Week 1-2", "focus": "topic name", "tasks": ["task1", "task2", "task3"]}}
  ],
  "must_learn": ["skill1", "skill2", "skill3", "skill4", "skill5"],
  "resources": [
    {{"title": "resource name", "type": "Course/Book/Practice", "url": ""}}
  ],
  "projects": [
    {{"title": "project name", "desc": "one line description", "difficulty": "Beginner"}}
  ],
  "final_tip": "one powerful motivating tip"
}}"""
    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[{"role": "user", "content": prompt}]
    )
    text = response.choices[0].message.content.strip()
    text = text.replace("```json", "").replace("```", "").strip()
    try:
        return json.loads(text)
    except:
        return {"error": "Failed to parse roadmap. Please try again."}