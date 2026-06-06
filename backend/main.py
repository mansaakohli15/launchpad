from fastapi import FastAPI, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from typing import List
import tempfile, os, json, io
from groq import Groq
from dotenv import load_dotenv
import fitz

from langchain_community.document_loaders import PyMuPDFLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_community.vectorstores import Chroma
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_groq import ChatGroq
from langchain_core.messages import HumanMessage, SystemMessage

load_dotenv()
client = Groq(api_key=os.getenv("GROQ_API_KEY"))

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_methods=["*"],
    allow_headers=["*"],
)

vector_store_cache = {}

# ── HEALTH ───────────────────────────────────────────────
@app.get("/")
def root():
    return {"status": "AI Career Copilot API running"}


# ── RESUME UTILS ─────────────────────────────────────────
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

I will give you a resume and a job description.
Your job is to REWRITE the resume to maximize ATS score for this specific job.

Rules:
- Keep all real experience, education, and projects — do not invent anything
- Rewrite bullet points to use keywords from the job description naturally
- Add missing relevant keywords where they genuinely apply
- Make bullet points start with strong action verbs
- Add measurable impact where possible (e.g. "improved X by Y%")
- Keep the same sections and structure
- Make it ATS-friendly: no tables, no columns, no graphics

ORIGINAL RESUME:
{resume_text}

JOB DESCRIPTION:
{job_description}

Return ONLY the optimized resume text. No explanations, no commentary.
Use this exact structure:

[FULL NAME]
[Email] | [Phone] | [LinkedIn/GitHub]

SUMMARY
[2-3 sentence professional summary with JD keywords]

SKILLS
[Comma separated skills list including JD keywords]

EXPERIENCE
[Company] | [Role] | [Dates]
- [Rewritten bullet with action verb and impact]
- [Rewritten bullet with JD keywords]

EDUCATION
[Degree] | [University] | [Year]

PROJECTS
[Project Name] | [Tech Stack]
- [Description with relevant keywords]
"""
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
        from reportlab.lib.enums import TA_LEFT

        buffer = io.BytesIO()
        doc = SimpleDocTemplate(
            buffer, pagesize=A4,
            rightMargin=2*cm, leftMargin=2*cm,
            topMargin=2*cm, bottomMargin=2*cm
        )

        normal = ParagraphStyle('normal', fontName='Helvetica', fontSize=10, leading=15, spaceAfter=3)
        heading = ParagraphStyle('heading', fontName='Helvetica-Bold', fontSize=12, leading=16, spaceAfter=4, spaceBefore=10, borderPad=2)
        name_style = ParagraphStyle('name', fontName='Helvetica-Bold', fontSize=16, leading=22, spaceAfter=2)
        contact_style = ParagraphStyle('contact', fontName='Helvetica', fontSize=9, leading=14, spaceAfter=8, textColor='grey')

        story = []
        lines = optimized_text.split('\n')
        is_first = True

        for line in lines:
            line_stripped = line.strip()
            if not line_stripped:
                story.append(Spacer(1, 5))
                continue
            if is_first:
                story.append(Paragraph(line_stripped, name_style))
                is_first = False
            elif '|' in line_stripped and len(line_stripped) < 80 and story and len(story) <= 3:
                story.append(Paragraph(line_stripped, contact_style))
            elif line_stripped.isupper() and len(line_stripped) < 30:
                story.append(Spacer(1, 6))
                story.append(Paragraph(f'<u>{line_stripped}</u>', heading))
            elif line_stripped.startswith('- '):
                story.append(Paragraph(f"&bull;&nbsp;&nbsp;{line_stripped[2:]}", normal))
            else:
                story.append(Paragraph(line_stripped, normal))

        doc.build(story)
        buffer.seek(0)

        return StreamingResponse(
            buffer,
            media_type="application/pdf",
            headers={"Content-Disposition": "attachment; filename=optimized_resume.pdf"}
        )

    except ImportError:
        return StreamingResponse(
            io.BytesIO(optimized_text.encode()),
            media_type="text/plain",
            headers={"Content-Disposition": "attachment; filename=optimized_resume.txt"}
        )


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
    messages = [{"role": "system", "content": f"You are a strict but fair technical interviewer for a {req.role} position. Ask ONE interview question at a time. Questions should progress from basic to advanced. You are on question {req.question_num} of 5."}]
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


# ── RAG ASSISTANT ─────────────────────────────────────────
class ChatRequest(BaseModel):
    session_id: str
    question: str

@app.post("/api/assistant/upload")
async def upload_documents(files: List[UploadFile] = File(...), session_id: str = Form(...)):
    docs = []
    for uploaded_file in files:
        file_bytes = await uploaded_file.read()
        with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as tmp:
            tmp.write(file_bytes)
            tmp_path = tmp.name
        loader = PyMuPDFLoader(tmp_path)
        docs.extend(loader.load())
        os.unlink(tmp_path)

    splitter = RecursiveCharacterTextSplitter(chunk_size=500, chunk_overlap=50)
    chunks = splitter.split_documents(docs)
    embeddings = HuggingFaceEmbeddings(model_name="sentence-transformers/all-MiniLM-L6-v2")
    vector_store_cache[session_id] = Chroma.from_documents(chunks, embeddings)
    return {"status": "ok", "chunks": len(chunks), "files": len(files)}

@app.post("/api/assistant/chat")
async def chat_with_docs(req: ChatRequest):
    if req.session_id not in vector_store_cache:
        return {"answer": "No documents found. Please upload your study materials first."}
    vs = vector_store_cache[req.session_id]
    docs = vs.similarity_search(req.question, k=3)
    context = "\n\n".join([d.page_content for d in docs])
    llm = ChatGroq(api_key=os.getenv("GROQ_API_KEY"), model_name="llama-3.3-70b-versatile")
    messages = [
        SystemMessage(content="You are a helpful study assistant. Answer the user's question using ONLY the provided context from their uploaded documents. If the answer isn't in the context, say so honestly."),
        HumanMessage(content=f"Context from uploaded documents:\n{context}\n\nQuestion: {req.question}")
    ]
    response = llm.invoke(messages)
    return {"answer": response.content}


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
