"use client";
import { useState, useRef, useEffect } from "react";

const ROLES = [
  "Software Engineering Intern",
  "Data Science Intern",
  "Machine Learning Intern",
  "Frontend Developer",
  "Backend Developer",
  "Full Stack Developer",
];

type Message = { role: "ai" | "user"; content: string; score?: number };
type Evaluation = {
  score: number;
  what_was_good: string;
  what_was_missing: string;
  ideal_answer_hint: string;
};

const TOTAL_QUESTIONS = 5;

export default function InterviewPage() {
  const [phase, setPhase] = useState<"setup" | "interview" | "results">("setup");
  const [role, setRole] = useState(ROLES[0]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);
  const [currentQ, setCurrentQ] = useState("");
  const [qNum, setQNum] = useState(1);
  const [scores, setScores] = useState<number[]>([]);
  const [evaluation, setEvaluation] = useState<Evaluation | null>(null);
  const [history, setHistory] = useState<{ role: string; content: string }[]>([]);
  const [listening, setListening] = useState(false);
  const [micSupported, setMicSupported] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    // Check if browser supports Web Speech API
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      setMicSupported(true);
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = "en-US";

      recognition.onresult = (event: any) => {
        let transcript = "";
        for (let i = 0; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        setAnswer(transcript);
      };

      recognition.onend = () => {
        setListening(false);
      };

      recognition.onerror = () => {
        setListening(false);
      };

      recognitionRef.current = recognition;
    }
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, evaluation]);

  const toggleMic = () => {
    if (!recognitionRef.current) return;
    if (listening) {
      recognitionRef.current.stop();
      setListening(false);
    } else {
      setAnswer("");
      recognitionRef.current.start();
      setListening(true);
    }
  };

  const startInterview = async () => {
    setLoading(true);
    setMessages([]);
    setScores([]);
    setHistory([]);
    setQNum(1);
    setEvaluation(null);
    try {
      const res = await fetch("${process.env.NEXT_PUBLIC_API_URL}/api/interview/question", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role, question_num: 1, history: [] }),
      });
      const data = await res.json();
      setCurrentQ(data.question);
      setMessages([{ role: "ai", content: data.question }]);
      setHistory([{ role: "assistant", content: data.question }]);
      setPhase("interview");
    } catch {
      alert("Backend not reachable. Make sure FastAPI is running.");
    } finally {
      setLoading(false);
    }
  };

  const submitAnswer = async () => {
    if (!answer.trim()) return;
    if (listening) { recognitionRef.current?.stop(); setListening(false); }
    setLoading(true);
    const userMsg: Message = { role: "user", content: answer };
    setMessages(prev => [...prev, userMsg]);
    setAnswer("");

    try {
      const evalRes = await fetch("${process.env.NEXT_PUBLIC_API_URL}/api/interview/evaluate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role, question: currentQ, answer }),
      });
      const evalData: Evaluation = await evalRes.json();
      setEvaluation(evalData);
      setScores(prev => [...prev, evalData.score]);

      const newHistory = [...history, { role: "user", content: answer }];

      if (qNum < TOTAL_QUESTIONS) {
        const nextQ = qNum + 1;
        const qRes = await fetch("${process.env.NEXT_PUBLIC_API_URL}/api/interview/question", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ role, question_num: nextQ, history: newHistory }),
        });
        const qData = await qRes.json();
        setCurrentQ(qData.question);
        setHistory([...newHistory, { role: "assistant", content: qData.question }]);
        setQNum(nextQ);
        setMessages(prev => [...prev, { role: "ai", content: qData.question, score: evalData.score }]);
        setEvaluation(null);
      } else {
        setPhase("results");
      }
    } catch {
      alert("Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const avg = scores.length ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;
  const avgColor = avg >= 7 ? "#00FF94" : avg >= 5 ? "#FFD166" : "#FF6B6B";

  return (
    <div style={{ maxWidth: 780, margin: "0 auto" }}>
      <style>{`
        @keyframes fadeUp { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
        @keyframes spin { to{transform:rotate(360deg)} }
        @keyframes msgIn { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
        @keyframes pulse {
          0%,100% { box-shadow: 0 0 0 0 rgba(255,107,107,0.5); }
          50% { box-shadow: 0 0 0 8px rgba(255,107,107,0); }
        }
        @keyframes ripple {
          0% { transform: scale(1); opacity: 0.6; }
          100% { transform: scale(2.2); opacity: 0; }
        }
        @keyframes dotBounce {
          0%,80%,100% { transform: translateY(0); opacity:0.4; }
          40% { transform: translateY(-6px); opacity:1; }
        }

        .fade { animation: fadeUp 0.5s both; }
        .msg { animation: msgIn 0.35s both; }

        .role-btn {
          padding: 10px 18px; background: #0D1210; border: 1px solid #1A2320;
          color: rgba(232,228,220,0.5); font-family: 'Sora', sans-serif; font-size: 13px;
          cursor: pointer; transition: all 0.2s; border-radius: 2px;
        }
        .role-btn:hover { border-color: rgba(0,255,148,0.3); color: #E8E4DC; }
        .role-btn.selected { border-color: #00FF94; color: #00FF94; background: rgba(0,255,148,0.06); }

        .btn-primary {
          background: #00FF94; color: #080C0A; border: none;
          padding: 14px 32px; font-family: 'Space Mono', monospace;
          font-size: 13px; font-weight: 700; letter-spacing: 0.06em;
          cursor: pointer; transition: all 0.2s; text-transform: uppercase;
        }
        .btn-primary:hover:not(:disabled) { background: #E8E4DC; transform: translateY(-1px); box-shadow: 0 8px 32px rgba(0,255,148,0.2); }
        .btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }

        .btn-ghost {
          background: transparent; color: #E8E4DC; border: 1px solid rgba(255,255,255,0.15);
          padding: 14px 32px; font-family: 'Space Mono', monospace; font-size: 13px;
          cursor: pointer; transition: all 0.2s; text-transform: uppercase; letter-spacing: 0.06em;
        }
        .btn-ghost:hover { border-color: rgba(255,255,255,0.4); }

        .mic-btn {
          position: relative;
          width: 44px; height: 44px; border-radius: 50%;
          border: 1px solid #1A2320;
          background: #0D1210;
          cursor: pointer; transition: all 0.2s;
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
        }
        .mic-btn:hover { border-color: rgba(255,107,107,0.5); background: rgba(255,107,107,0.06); }
        .mic-btn.active {
          border-color: #FF6B6B;
          background: rgba(255,107,107,0.12);
          animation: pulse 1.5s ease-in-out infinite;
        }
        .mic-btn .ripple {
          position: absolute; inset: -1px; border-radius: 50%;
          border: 1px solid #FF6B6B;
          animation: ripple 1.5s ease-out infinite;
        }

        .ai-bubble {
          background: #0D1210; border: 1px solid #1A2320;
          padding: 18px 20px; border-radius: 2px 12px 12px 12px;
          font-size: 15px; line-height: 1.75; color: rgba(232,228,220,0.9);
          max-width: 85%;
        }
        .user-bubble {
          background: rgba(0,255,148,0.08); border: 1px solid rgba(0,255,148,0.2);
          padding: 18px 20px; border-radius: 12px 2px 12px 12px;
          font-size: 15px; line-height: 1.75; color: rgba(232,228,220,0.85);
          max-width: 85%; margin-left: auto;
        }
        .eval-card {
          background: #0A0F0D; border: 1px solid #1A2320;
          padding: 20px; margin: 8px 0; border-radius: 2px;
        }
        textarea {
          flex: 1; background: #0D1210; border: 1px solid #1A2320;
          color: #E8E4DC; padding: 14px 16px; font-family: 'Sora', sans-serif;
          font-size: 14px; line-height: 1.7; resize: none; outline: none;
          transition: border-color 0.2s; border-radius: 2px; min-height: 90px;
        }
        textarea:focus { border-color: rgba(0,255,148,0.4); }
        textarea::placeholder { color: rgba(232,228,220,0.25); }

        .dot { width:7px; height:7px; border-radius:50%; background:#00FF94; }
        .dot:nth-child(1) { animation: dotBounce 1.2s 0s infinite; }
        .dot:nth-child(2) { animation: dotBounce 1.2s 0.2s infinite; }
        .dot:nth-child(3) { animation: dotBounce 1.2s 0.4s infinite; }
      `}</style>

      {/* SETUP */}
      {phase === "setup" && (
        <div className="fade">
          <div style={{ marginBottom: 32 }}>
            <h1 style={{ fontSize: "clamp(22px, 4vw, 32px)", fontWeight: 800, letterSpacing: "-0.02em" }}>
              Mock <span style={{ color: "#FFD166" }}>Interview</span>
            </h1>
            <p style={{ marginTop: 8, fontSize: 14, color: "rgba(232,228,220,0.5)", lineHeight: 1.6 }}>
              5 adaptive questions. Every answer scored. Real feedback, not generic tips.
            </p>
          </div>

          <div style={{ background: "#0D1210", border: "1px solid #1A2320", padding: 28, marginBottom: 2 }}>
            <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 10, letterSpacing: "0.14em", textTransform: "uppercase", color: "rgba(232,228,220,0.35)", marginBottom: 16 }}>
              Select your interview type
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {ROLES.map(r => (
                <button key={r} className={`role-btn ${role === r ? "selected" : ""}`} onClick={() => setRole(r)}>
                  {r}
                </button>
              ))}
            </div>
          </div>

          {/* Mic support note */}
          {micSupported && (
            <div style={{ background: "rgba(255,107,107,0.04)", border: "1px solid rgba(255,107,107,0.15)", padding: "14px 18px", marginBottom: 2, display: "flex", gap: 10, alignItems: "center" }}>
              <span style={{ fontSize: 16 }}>🎤</span>
              <p style={{ fontSize: 13, color: "rgba(232,228,220,0.55)", lineHeight: 1.5 }}>
                <span style={{ color: "#E8E4DC", fontWeight: 600 }}>Voice input available.</span>{" "}
                Click the mic button while answering to speak your response.
              </p>
            </div>
          )}

          <div style={{ background: "rgba(255,209,102,0.04)", border: "1px solid rgba(255,209,102,0.15)", padding: "14px 18px", marginBottom: 2, display: "flex", gap: 10, alignItems: "center" }}>
            <span style={{ fontSize: 16 }}>⚡</span>
            <p style={{ fontSize: 13, color: "rgba(232,228,220,0.55)", lineHeight: 1.5 }}>
              <span style={{ color: "#E8E4DC", fontWeight: 600 }}>Tip:</span>{" "}
              Answer as if it's a real interview. The AI adapts difficulty and scores communication quality too.
            </p>
          </div>

          <button className="btn-primary" style={{ width: "100%", marginTop: 2 }} onClick={startInterview} disabled={loading}>
            {loading
              ? <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}><span style={{ width: 16, height: 16, border: "2px solid rgba(8,12,10,0.3)", borderTopColor: "#080C0A", borderRadius: "50%", animation: "spin 0.7s linear infinite", display: "inline-block" }} /> Starting...</span>
              : `Start ${role} Interview →`}
          </button>
        </div>
      )}

      {/* INTERVIEW */}
      {phase === "interview" && (
        <div className="fade">
          {/* Progress */}
          <div style={{ marginBottom: 28 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
              <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 11, color: "rgba(232,228,220,0.4)", letterSpacing: "0.08em" }}>
                {role.toUpperCase()}
              </div>
              <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 11, color: "#00FF94" }}>
                {Math.min(qNum, TOTAL_QUESTIONS)} / {TOTAL_QUESTIONS}
              </div>
            </div>
            <div style={{ height: 3, background: "#1A2320", borderRadius: 2 }}>
              <div style={{
                height: "100%", background: "#00FF94", borderRadius: 2,
                width: `${(Math.min(qNum, TOTAL_QUESTIONS) / TOTAL_QUESTIONS) * 100}%`,
                transition: "width 0.5s ease",
              }} />
            </div>
          </div>

          {/* Chat */}
          <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 16, minHeight: 200 }}>
            {messages.map((m, i) => (
              <div key={i} className="msg">
                {m.role === "ai" ? (
                  <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                    <div style={{ width: 28, height: 28, background: "rgba(0,255,148,0.1)", border: "1px solid rgba(0,255,148,0.2)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, flexShrink: 0, marginTop: 2 }}>🤖</div>
                    <div>
                      <div className="ai-bubble">{m.content}</div>
                      {m.score !== undefined && (
                        <div style={{ marginTop: 6, fontFamily: "'Space Mono', monospace", fontSize: 10, color: m.score >= 7 ? "#00FF94" : m.score >= 5 ? "#FFD166" : "#FF6B6B", letterSpacing: "0.08em" }}>
                          PREV SCORE: {m.score}/10
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div style={{ display: "flex", justifyContent: "flex-end" }}>
                    <div className="user-bubble">{m.content}</div>
                  </div>
                )}
              </div>
            ))}

            {evaluation && (
              <div className="msg eval-card">
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
                  <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 22, fontWeight: 700, color: evaluation.score >= 7 ? "#00FF94" : evaluation.score >= 5 ? "#FFD166" : "#FF6B6B" }}>
                    {evaluation.score}/10
                  </div>
                  <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 10, color: "rgba(232,228,220,0.35)", letterSpacing: "0.1em", textTransform: "uppercase" }}>Answer Score</div>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 10 }}>
                  <div style={{ padding: "12px 14px", background: "rgba(0,255,148,0.05)", border: "1px solid rgba(0,255,148,0.15)" }}>
                    <div style={{ fontSize: 10, color: "#00FF94", fontFamily: "'Space Mono', monospace", letterSpacing: "0.1em", marginBottom: 6 }}>WHAT WAS GOOD</div>
                    <p style={{ fontSize: 13, color: "rgba(232,228,220,0.7)", lineHeight: 1.6 }}>{evaluation.what_was_good}</p>
                  </div>
                  <div style={{ padding: "12px 14px", background: "rgba(255,107,107,0.05)", border: "1px solid rgba(255,107,107,0.15)" }}>
                    <div style={{ fontSize: 10, color: "#FF6B6B", fontFamily: "'Space Mono', monospace", letterSpacing: "0.1em", marginBottom: 6 }}>WHAT WAS MISSING</div>
                    <p style={{ fontSize: 13, color: "rgba(232,228,220,0.7)", lineHeight: 1.6 }}>{evaluation.what_was_missing}</p>
                  </div>
                </div>
                <div style={{ padding: "12px 14px", background: "rgba(255,209,102,0.05)", border: "1px solid rgba(255,209,102,0.15)" }}>
                  <div style={{ fontSize: 10, color: "#FFD166", fontFamily: "'Space Mono', monospace", letterSpacing: "0.1em", marginBottom: 6 }}>IDEAL ANSWER HINT</div>
                  <p style={{ fontSize: 13, color: "rgba(232,228,220,0.7)", lineHeight: 1.6 }}>{evaluation.ideal_answer_hint}</p>
                </div>
              </div>
            )}

            {loading && (
              <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                <div style={{ width: 28, height: 28, background: "rgba(0,255,148,0.1)", border: "1px solid rgba(0,255,148,0.2)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12 }}>🤖</div>
                <div style={{ background: "#0D1210", border: "1px solid #1A2320", padding: "14px 20px", borderRadius: "2px 12px 12px 12px", display: "flex", gap: 6, alignItems: "center" }}>
                  <div className="dot" /><div className="dot" /><div className="dot" />
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input area with mic */}
          {!loading && (
            <div>
              <div style={{ display: "flex", gap: 8, alignItems: "flex-end" }}>
                <textarea
                  placeholder={listening ? "🎤 Listening... speak your answer" : "Type your answer or use the mic..."}
                  value={answer}
                  onChange={e => setAnswer(e.target.value)}
                  onKeyDown={e => { if (e.key === "Enter" && e.ctrlKey) submitAnswer(); }}
                  style={{ border: listening ? "1px solid rgba(255,107,107,0.5)" : undefined }}
                />

                {/* Mic button */}
                {micSupported && (
                  <button
                    className={`mic-btn ${listening ? "active" : ""}`}
                    onClick={toggleMic}
                    title={listening ? "Stop recording" : "Start voice input"}
                    style={{ alignSelf: "flex-end", marginBottom: 0 }}
                  >
                    {listening && <span className="ripple" />}
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                      <rect x="9" y="2" width="6" height="12" rx="3"
                        fill={listening ? "#FF6B6B" : "rgba(232,228,220,0.5)"}
                        style={{ transition: "fill 0.2s" }}
                      />
                      <path d="M5 10a7 7 0 0 0 14 0" stroke={listening ? "#FF6B6B" : "rgba(232,228,220,0.5)"} strokeWidth="2" strokeLinecap="round" style={{ transition: "stroke 0.2s" }} />
                      <line x1="12" y1="17" x2="12" y2="21" stroke={listening ? "#FF6B6B" : "rgba(232,228,220,0.5)"} strokeWidth="2" strokeLinecap="round" style={{ transition: "stroke 0.2s" }} />
                      <line x1="9" y1="21" x2="15" y2="21" stroke={listening ? "#FF6B6B" : "rgba(232,228,220,0.5)"} strokeWidth="2" strokeLinecap="round" style={{ transition: "stroke 0.2s" }} />
                    </svg>
                  </button>
                )}
              </div>

              {/* Live transcript indicator */}
              {listening && (
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 8 }}>
                  <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#FF6B6B", animation: "pulse 1s infinite" }} />
                  <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 10, color: "#FF6B6B", letterSpacing: "0.08em" }}>
                    RECORDING — CLICK MIC TO STOP
                  </span>
                </div>
              )}

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 10 }}>
                <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 10, color: "rgba(232,228,220,0.2)", letterSpacing: "0.06em" }}>
                  CTRL+ENTER TO SUBMIT
                </span>
                <button className="btn-primary" onClick={submitAnswer} disabled={!answer.trim() || loading} style={{ padding: "12px 28px" }}>
                  Submit Answer →
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* RESULTS */}
      {phase === "results" && (
        <div className="fade">
          <div style={{ textAlign: "center", padding: "40px 0", marginBottom: 32 }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>🎯</div>
            <h1 style={{ fontSize: "clamp(24px, 4vw, 36px)", fontWeight: 800, letterSpacing: "-0.02em", marginBottom: 8 }}>
              Interview Complete
            </h1>
            <p style={{ fontSize: 14, color: "rgba(232,228,220,0.5)" }}>Here's how you performed across all 5 questions.</p>
          </div>

          <div style={{ background: "#0D1210", border: `1px solid ${avgColor}33`, padding: "32px", textAlign: "center", marginBottom: 2 }}>
            <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 56, fontWeight: 700, color: avgColor, lineHeight: 1 }}>
              {avg.toFixed(1)}
            </div>
            <div style={{ fontSize: 14, color: "rgba(232,228,220,0.45)", marginTop: 8, fontFamily: "'Space Mono', monospace", letterSpacing: "0.06em" }}>
              AVERAGE SCORE / 10
            </div>
            <div style={{ marginTop: 12, fontSize: 14, color: avgColor }}>
              {avg >= 7 ? "Strong performance 🔥" : avg >= 5 ? "Good effort, room to improve 📈" : "Keep practicing, you'll get there 💪"}
            </div>
          </div>

          <div style={{ background: "#0D1210", border: "1px solid #1A2320", padding: "24px", marginBottom: 2 }}>
            <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 10, letterSpacing: "0.14em", textTransform: "uppercase", color: "rgba(232,228,220,0.35)", marginBottom: 16 }}>
              Question Breakdown
            </div>
            {scores.map((s, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 12 }}>
                <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 11, color: "rgba(232,228,220,0.4)", minWidth: 24 }}>Q{i + 1}</span>
                <div style={{ flex: 1, height: 6, background: "#1A2320", borderRadius: 3 }}>
                  <div style={{ height: "100%", borderRadius: 3, background: s >= 7 ? "#00FF94" : s >= 5 ? "#FFD166" : "#FF6B6B", width: `${s * 10}%`, transition: "width 0.8s ease" }} />
                </div>
                <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 12, color: s >= 7 ? "#00FF94" : s >= 5 ? "#FFD166" : "#FF6B6B", minWidth: 32, textAlign: "right" }}>
                  {s}/10
                </span>
              </div>
            ))}
          </div>

          <div style={{ display: "flex", gap: 2, marginTop: 2 }}>
            <button className="btn-primary" style={{ flex: 1 }} onClick={() => { setPhase("setup"); setMessages([]); setScores([]); }}>
              Try Another Interview →
            </button>
            <button className="btn-ghost" style={{ flex: 1 }} onClick={() => window.location.href = "/dashboard/resume"}>
              Fix Resume Gaps
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
