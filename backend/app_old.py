import streamlit as st
from groq import Groq
import fitz
import os
from dotenv import load_dotenv
from langchain_community.document_loaders import PyMuPDFLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_community.vectorstores import Chroma
from langchain_huggingface import HuggingFaceEmbeddings
from langchain.chains import RetrievalQA
from langchain_groq import ChatGroq
import tempfile

load_dotenv()
client = Groq(api_key=os.getenv("GROQ_API_KEY"))

# ---- FUNCTIONS ----

def extract_text_from_pdf(uploaded_file):
    pdf_bytes = uploaded_file.read()
    doc = fitz.open(stream=pdf_bytes, filetype="pdf")
    text = ""
    for page in doc:
        text += page.get_text()
    return text

def analyze_resume(resume_text, job_description):
    prompt = f"""
You are an expert resume coach and ATS specialist.
Analyze this resume against the job description below.

RESUME:
{resume_text}

JOB DESCRIPTION:
{job_description}

Give a detailed analysis in EXACTLY this format, do not deviate:

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
[2-3 sentences on whether they should apply and what to fix first]

Be specific, honest, and helpful.
"""
    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[{"role": "user", "content": prompt}]
    )
    return response.choices[0].message.content

def parse_result(result):
    sections = {
        "match_score": 0,
        "strong_points": [],
        "missing_keywords": [],
        "weak_sections": [],
        "improvement_suggestions": [],
        "final_verdict": ""
    }
    lines = result.split('\n')
    current_section = None
    for line in lines:
        line = line.strip()
        if line.startswith("MATCH_SCORE:"):
            try:
                sections["match_score"] = int(''.join(filter(str.isdigit, line.split(":")[1])))
            except:
                sections["match_score"] = 0
        elif line == "STRONG_POINTS:":
            current_section = "strong_points"
        elif line == "MISSING_KEYWORDS:":
            current_section = "missing_keywords"
        elif line == "WEAK_SECTIONS:":
            current_section = "weak_sections"
        elif line == "IMPROVEMENT_SUGGESTIONS:":
            current_section = "improvement_suggestions"
        elif line == "FINAL_VERDICT:":
            current_section = "final_verdict"
        elif line.startswith("- ") and current_section in ["strong_points", "missing_keywords", "weak_sections", "improvement_suggestions"]:
            sections[current_section].append(line[2:])
        elif current_section == "final_verdict" and line:
            sections["final_verdict"] += line + " "
    return sections

def get_interview_question(role, question_num, conversation_history):
    system_prompt = f"""You are a strict but fair technical interviewer for a {role} position.
Ask ONE interview question at a time.
Questions should progress from basic to advanced.
Keep questions concise and clear.
You are on question number {question_num} of 5."""
    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[
            {"role": "system", "content": system_prompt},
            *conversation_history,
            {"role": "user", "content": "Ask the next interview question."}
        ]
    )
    return response.choices[0].message.content

def evaluate_answer(role, question, answer):
    prompt = f"""You are evaluating a candidate's answer in a {role} interview.

Question: {question}
Candidate's Answer: {answer}

Evaluate in EXACTLY this format:

SCORE: [number 0-10]

WHAT_WAS_GOOD:
[1-2 sentences on what was good]

WHAT_WAS_MISSING:
[1-2 sentences on what was missing]

IDEAL_ANSWER_HINT:
[2-3 sentences giving hints about the ideal answer]
"""
    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[{"role": "user", "content": prompt}]
    )
    return response.choices[0].message.content

def parse_evaluation(evaluation):
    result = {
        "score": 0,
        "what_was_good": "",
        "what_was_missing": "",
        "ideal_answer_hint": ""
    }
    lines = evaluation.split('\n')
    current_section = None
    for line in lines:
        line = line.strip()
        if line.startswith("SCORE:"):
            try:
                result["score"] = int(''.join(filter(str.isdigit, line.split(":")[1])))
            except:
                result["score"] = 0
        elif line == "WHAT_WAS_GOOD:":
            current_section = "what_was_good"
        elif line == "WHAT_WAS_MISSING:":
            current_section = "what_was_missing"
        elif line == "IDEAL_ANSWER_HINT:":
            current_section = "ideal_answer_hint"
        elif current_section and line:
            result[current_section] += line + " "
    return result

def process_uploaded_pdfs(uploaded_files):
    docs = []
    for uploaded_file in uploaded_files:
        with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as tmp_file:
            tmp_file.write(uploaded_file.read())
            tmp_path = tmp_file.name
        loader = PyMuPDFLoader(tmp_path)
        docs.extend(loader.load())
    text_splitter = RecursiveCharacterTextSplitter(
        chunk_size=500,
        chunk_overlap=50
    )
    chunks = text_splitter.split_documents(docs)
    return chunks

def create_vector_store(chunks):
    embeddings = HuggingFaceEmbeddings(
        model_name="sentence-transformers/all-MiniLM-L6-v2"
    )
    vector_store = Chroma.from_documents(chunks, embeddings)
    return vector_store

def answer_question(vector_store, question):
    llm = ChatGroq(
        api_key=os.getenv("GROQ_API_KEY"),
        model_name="llama-3.3-70b-versatile"
    )
    retriever = vector_store.as_retriever(search_kwargs={"k": 3})
    qa_chain = RetrievalQA.from_chain_type(
        llm=llm,
        chain_type="stuff",
        retriever=retriever
    )
    result = qa_chain.invoke({"query": question})
    return result["result"]

def generate_roadmap(goal, timeframe, current_skills):
    prompt = f"""You are an expert career coach.

Generate a personalized learning roadmap for:
Goal: {goal}
Timeframe: {timeframe}
Current Skills: {current_skills}

Format EXACTLY like this:

WEEK_BY_WEEK_PLAN:
[Provide a week by week breakdown]

MUST_LEARN_SKILLS:
- [skill 1]
- [skill 2]
- [skill 3]
- [skill 4]
- [skill 5]

RECOMMENDED_RESOURCES:
- [resource 1]
- [resource 2]
- [resource 3]

PROJECTS_TO_BUILD:
- [project 1]
- [project 2]
- [project 3]

FINAL_TIP:
[One powerful motivating tip]
"""
    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[{"role": "user", "content": prompt}]
    )
    return response.choices[0].message.content

# ---- UI ----
st.set_page_config(page_title="AI Career Copilot", page_icon="🚀", layout="wide")
st.title("🚀 AI Career Copilot")
st.write("Your AI-powered platform for resume analysis, mock interviews, and personalized learning.")

tab1, tab2, tab3, tab4 = st.tabs(["📄 Resume Analyzer", "🎤 Mock Interview", "🗺️ Learning Roadmap", "📚 Knowledge Assistant"])

# ---- TAB 1: Resume Analyzer ----
with tab1:
    st.header("📄 AI Resume Analyzer")
    col1, col2 = st.columns(2)
    with col1:
        resume_file = st.file_uploader("Upload your Resume (PDF)", type=["pdf"])
    with col2:
        job_description = st.text_area("Paste the Job Description here", height=200)

    if st.button("🔍 Analyze My Resume", use_container_width=True):
        if resume_file is None:
            st.warning("Please upload your resume.")
        elif job_description.strip() == "":
            st.warning("Please paste the job description.")
        else:
            with st.spinner("Analyzing your resume..."):
                resume_text = extract_text_from_pdf(resume_file)
                result = analyze_resume(resume_text, job_description)
                parsed = parse_result(result)
            st.success("Analysis Complete!")
            st.divider()
            score = parsed["match_score"]
            st.subheader("📊 Match Score")
            color = "green" if score >= 75 else "orange" if score >= 50 else "red"
            st.markdown(f"### :{color}[{score}/100]")
            st.progress(score/100)
            st.divider()
            col1, col2, col3 = st.columns(3)
            with col1:
                st.subheader("✅ Strong Points")
                for point in parsed["strong_points"]:
                    st.success(point)
            with col2:
                st.subheader("❌ Missing Keywords")
                for keyword in parsed["missing_keywords"]:
                    st.error(keyword)
            with col3:
                st.subheader("⚠️ Weak Sections")
                for section in parsed["weak_sections"]:
                    st.warning(section)
            st.divider()
            st.subheader("💡 Improvement Suggestions")
            for i, suggestion in enumerate(parsed["improvement_suggestions"], 1):
                st.info(f"{i}. {suggestion}")
            st.divider()
            st.subheader("🎯 Final Verdict")
            st.markdown(f"> {parsed['final_verdict']}")

# ---- TAB 2: Mock Interview ----
with tab2:
    st.header("🎤 AI Mock Interview")
    st.write("Practice real interview questions with AI feedback on every answer.")

    if "interview_active" not in st.session_state:
        st.session_state.interview_active = False
    if "question_num" not in st.session_state:
        st.session_state.question_num = 1
    if "conversation_history" not in st.session_state:
        st.session_state.conversation_history = []
    if "current_question" not in st.session_state:
        st.session_state.current_question = ""
    if "scores" not in st.session_state:
        st.session_state.scores = []
    if "interview_role" not in st.session_state:
        st.session_state.interview_role = ""

    if not st.session_state.interview_active:
        role = st.selectbox("Select Interview Type", [
            "Software Engineering Intern",
            "Data Science Intern",
            "Machine Learning Intern",
            "Frontend Developer",
            "Backend Developer",
            "Product Manager"
        ])
        if st.button("🚀 Start Interview", use_container_width=True):
            st.session_state.interview_active = True
            st.session_state.question_num = 1
            st.session_state.conversation_history = []
            st.session_state.scores = []
            st.session_state.interview_role = role
            with st.spinner("Preparing your first question..."):
                question = get_interview_question(role, 1, [])
                st.session_state.current_question = question
                st.session_state.conversation_history.append({"role": "assistant", "content": question})
            st.rerun()
    else:
        st.info(f"**Interview Role:** {st.session_state.interview_role} | **Question {st.session_state.question_num} of 5**")
        st.progress(st.session_state.question_num / 5)
        st.divider()

        if st.session_state.question_num <= 5:
            st.subheader(f"Question {st.session_state.question_num}:")
            st.markdown(f"**{st.session_state.current_question}**")
            answer = st.text_area("Your Answer:", height=150, key=f"answer_{st.session_state.question_num}")
            if st.button("Submit Answer ➡️", use_container_width=True):
                if answer.strip() == "":
                    st.warning("Please write your answer first.")
                else:
                    with st.spinner("Evaluating your answer..."):
                        evaluation = evaluate_answer(
                            st.session_state.interview_role,
                            st.session_state.current_question,
                            answer
                        )
                        parsed_eval = parse_evaluation(evaluation)
                        st.session_state.scores.append(parsed_eval["score"])
                    st.divider()
                    score_color = "green" if parsed_eval["score"] >= 7 else "orange" if parsed_eval["score"] >= 5 else "red"
                    st.markdown(f"### Score: :{score_color}[{parsed_eval['score']}/10]")
                    col1, col2 = st.columns(2)
                    with col1:
                        st.success(f"✅ **What was good:** {parsed_eval['what_was_good']}")
                    with col2:
                        st.error(f"❌ **What was missing:** {parsed_eval['what_was_missing']}")
                    st.info(f"💡 **Hint:** {parsed_eval['ideal_answer_hint']}")
                    st.divider()
                    st.session_state.conversation_history.append({"role": "user", "content": answer})
                    if st.session_state.question_num < 5:
                        st.session_state.question_num += 1
                        with st.spinner("Getting next question..."):
                            next_question = get_interview_question(
                                st.session_state.interview_role,
                                st.session_state.question_num,
                                st.session_state.conversation_history
                            )
                            st.session_state.current_question = next_question
                            st.session_state.conversation_history.append({"role": "assistant", "content": next_question})
                        st.rerun()
                    else:
                        st.session_state.question_num = 6
                        st.rerun()
        else:
            avg_score = sum(st.session_state.scores) / len(st.session_state.scores) if st.session_state.scores else 0
            st.balloons()
            st.success("🎉 Interview Complete!")
            st.subheader("📊 Your Final Results")
            color = "green" if avg_score >= 7 else "orange" if avg_score >= 5 else "red"
            st.markdown(f"## Average Score: :{color}[{avg_score:.1f}/10]")
            for i, score in enumerate(st.session_state.scores, 1):
                st.write(f"Question {i}: {score}/10")
            if st.button("🔄 Start New Interview", use_container_width=True):
                st.session_state.interview_active = False
                st.session_state.question_num = 1
                st.session_state.conversation_history = []
                st.session_state.scores = []
                st.session_state.current_question = ""
                st.rerun()

# ---- TAB 3: Learning Roadmap ----
with tab3:
    st.header("🗺️ Personalized Learning Roadmap")
    st.write("Tell us your goal and we'll generate a custom preparation plan.")
    goal = st.selectbox("What's your target?", [
        "Software Engineering Internship",
        "Data Science Internship",
        "Machine Learning Internship",
        "Frontend Development Role",
        "Backend Development Role",
        "Full Stack Development Role"
    ])
    timeframe = st.selectbox("How much time do you have?", [
        "2 weeks",
        "1 month",
        "2 months",
        "3 months",
        "6 months"
    ])
    current_skills = st.text_input("What skills do you already have? (e.g. Python, basic HTML)")
    if st.button("🗺️ Generate My Roadmap", use_container_width=True):
        if current_skills.strip() == "":
            st.warning("Please enter your current skills.")
        else:
            with st.spinner("Generating your personalized roadmap..."):
                roadmap = generate_roadmap(goal, timeframe, current_skills)
            st.success("Your Roadmap is Ready!")
            st.divider()
            st.markdown(roadmap)

# ---- TAB 4: Knowledge Assistant ----
with tab4:
    st.header("📚 RAG Knowledge Assistant")
    st.write("Upload your notes, PDFs, or interview experiences and chat with them using AI.")

    if "vector_store" not in st.session_state:
        st.session_state.vector_store = None
    if "chat_history" not in st.session_state:
        st.session_state.chat_history = []

    uploaded_pdfs = st.file_uploader(
        "Upload your study materials (PDFs)",
        type=["pdf"],
        accept_multiple_files=True
    )

    if st.button("📥 Process Documents", use_container_width=True):
        if not uploaded_pdfs:
            st.warning("Please upload at least one PDF.")
        else:
            with st.spinner("Processing your documents..."):
                chunks = process_uploaded_pdfs(uploaded_pdfs)
                st.session_state.vector_store = create_vector_store(chunks)
            st.success(f"✅ {len(uploaded_pdfs)} document(s) processed! You can now ask questions.")

    if st.session_state.vector_store is not None:
        st.divider()
        st.subheader("💬 Chat with your documents")

        for message in st.session_state.chat_history:
            if message["role"] == "user":
                st.chat_message("user").write(message["content"])
            else:
                st.chat_message("assistant").write(message["content"])

        question = st.chat_input("Ask anything from your uploaded documents...")
        if question:
            st.session_state.chat_history.append({"role": "user", "content": question})
            st.chat_message("user").write(question)
            with st.spinner("Searching your documents..."):
                answer = answer_question(st.session_state.vector_store, question)
            st.session_state.chat_history.append({"role": "assistant", "content": answer})
            st.chat_message("assistant").write(answer)
    else:
        st.info("👆 Upload and process your documents first to start chatting.")