"use client";
import { useState, useRef, useEffect } from "react";

type Message = { role: "user" | "ai"; content: string };

const SESSION_ID = "session_" + Math.random().toString(36).slice(2);

export default function AssistantPage() {
  const [phase, setPhase] = useState<"upload" | "chat">("upload");
  const [files, setFiles] = useState<File[]>([]);
  const [drag, setDrag] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [docsInfo, setDocsInfo] = useState({ files: 0, chunks: 0 });
  const fileRef = useRef<HTMLInputElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleFiles = (incoming: FileList | null) => {
    if (!incoming) return;
    const pdfs = Array.from(incoming).filter(f => f.type === "application/pdf");
    setFiles(prev => [...prev, ...pdfs]);
  };

  const processDocuments = async () => {
    if (!files.length) return;
    setUploading(true);
    try {
      const formData = new FormData();
      files.forEach(f => formData.append("files", f));
      formData.append("session_id", SESSION_ID);
      const res = await fetch("${process.env.NEXT_PUBLIC_API_URL}/api/assistant/upload", {
        method: "POST", body: formData,
      });
      const data = await res.json();
      setDocsInfo({ files: data.files, chunks: data.chunks });
      setPhase("chat");
      setMessages([{ role: "ai", content: `I've processed ${data.files} document${data.files > 1 ? "s" : ""} (${data.chunks} chunks). Ask me anything from your materials!` }]);
    } catch {
      alert("Upload failed. Make sure backend is running.");
    } finally {
      setUploading(false);
    }
  };

  const sendMessage = async () => {
    if (!input.trim() || loading) return;
    const q = input.trim();
    setInput("");
    setMessages(prev => [...prev, { role: "user", content: q }]);
    setLoading(true);
    try {
      const res = await fetch("${process.env.NEXT_PUBLIC_API_URL}/api/assistant/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ session_id: SESSION_ID, question: q }),
      });
      const data = await res.json();
      setMessages(prev => [...prev, { role: "ai", content: data.answer }]);
    } catch {
      setMessages(prev => [...prev, { role: "ai", content: "Something went wrong. Please try again." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 780, margin: "0 auto" }}>
      <style>{`
        @keyframes fadeUp { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
        @keyframes msgIn { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
        @keyframes dotBounce {
          0%,80%,100% { transform:translateY(0); opacity:0.4; }
          40% { transform:translateY(-6px); opacity:1; }
        }
        .fade { animation: fadeUp 0.5s both; }
        .msg { animation: msgIn 0.3s both; }
        .dot { width:7px; height:7px; border-radius:50%; background:#FF6B6B; }
        .dot:nth-child(1){animation:dotBounce 1.2s 0s infinite;}
        .dot:nth-child(2){animation:dotBounce 1.2s 0.2s infinite;}
        .dot:nth-child(3){animation:dotBounce 1.2s 0.4s infinite;}

        .upload-zone {
          border: 1px dashed #2A3830; background: #0D1210;
          padding: 48px 32px; text-align: center; cursor: pointer;
          transition: all 0.2s; border-radius: 2px;
        }
        .upload-zone:hover, .upload-zone.drag {
          border-color: #FF6B6B; background: rgba(255,107,107,0.04);
        }
        .file-chip {
          display: inline-flex; align-items: center; gap: 8px;
          padding: 6px 12px; background: rgba(255,107,107,0.08);
          border: 1px solid rgba(255,107,107,0.2); border-radius: 2px;
          font-size: 12px; color: rgba(232,228,220,0.7); margin: 4px;
        }
        .remove-btn {
          background: none; border: none; color: rgba(232,228,220,0.4);
          cursor: pointer; font-size: 14px; line-height: 1; padding: 0;
          transition: color 0.2s;
        }
        .remove-btn:hover { color: #FF6B6B; }
        .btn-primary {
          background: #FF6B6B; color: #080C0A; border: none;
          padding: 14px 32px; font-family: 'Space Mono', monospace;
          font-size: 13px; font-weight: 700; letter-spacing: 0.06em;
          cursor: pointer; transition: all 0.2s; text-transform: uppercase; width: 100%;
        }
        .btn-primary:hover:not(:disabled) { background: #E8E4DC; transform: translateY(-1px); }
        .btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }
        .ai-bubble {
          background: #0D1210; border: 1px solid #1A2320;
          padding: 18px 20px; border-radius: 2px 12px 12px 12px;
          font-size: 14px; line-height: 1.8; color: rgba(232,228,220,0.88);
          max-width: 88%; white-space: pre-wrap;
        }
        .user-bubble {
          background: rgba(255,107,107,0.08); border: 1px solid rgba(255,107,107,0.2);
          padding: 16px 20px; border-radius: 12px 2px 12px 12px;
          font-size: 14px; line-height: 1.75; color: rgba(232,228,220,0.85);
          max-width: 88%; margin-left: auto;
        }
        .chat-input {
          flex: 1; background: #0D1210; border: 1px solid #1A2320;
          color: #E8E4DC; padding: 14px 16px; font-family: 'Sora', sans-serif;
          font-size: 14px; outline: none; transition: border-color 0.2s; border-radius: 2px;
        }
        .chat-input:focus { border-color: rgba(255,107,107,0.4); }
        .chat-input::placeholder { color: rgba(232,228,220,0.25); }
        .send-btn {
          background: #FF6B6B; color: #080C0A; border: none;
          width: 44px; height: 44px; cursor: pointer; transition: all 0.2s;
          display: flex; align-items: center; justify-content: center; flex-shrink: 0; border-radius: 2px;
          font-size: 16px;
        }
        .send-btn:hover:not(:disabled) { background: #E8E4DC; }
        .send-btn:disabled { opacity: 0.4; cursor: not-allowed; }
      `}</style>

      <div className="fade" style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: "clamp(22px, 4vw, 32px)", fontWeight: 800, letterSpacing: "-0.02em" }}>
          AI <span style={{ color: "#FF6B6B" }}>Assistant</span>
        </h1>
        <p style={{ marginTop: 8, fontSize: 14, color: "rgba(232,228,220,0.5)", lineHeight: 1.6 }}>
          Upload your notes, PDFs, or interview experiences. Ask anything. Get answers from your own materials.
        </p>
      </div>

      {phase === "upload" && (
        <div className="fade">
          <div
            className={`upload-zone ${drag ? "drag" : ""}`}
            onDragOver={e => { e.preventDefault(); setDrag(true); }}
            onDragLeave={() => setDrag(false)}
            onDrop={e => { e.preventDefault(); setDrag(false); handleFiles(e.dataTransfer.files); }}
            onClick={() => fileRef.current?.click()}
          >
            <input ref={fileRef} type="file" accept=".pdf" multiple style={{ display: "none" }}
              onChange={e => handleFiles(e.target.files)} />
            <div style={{ fontSize: 36, marginBottom: 14 }}>📚</div>
            <div style={{ fontSize: 15, fontWeight: 600, color: "#E8E4DC", marginBottom: 6 }}>
              Drop your study materials here
            </div>
            <div style={{ fontSize: 13, color: "rgba(232,228,220,0.4)" }}>
              PDF only · Multiple files supported · Click or drag and drop
            </div>
          </div>

          {files.length > 0 && (
            <div style={{ background: "#0D1210", border: "1px solid #1A2320", padding: "20px", marginTop: 2 }}>
              <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 10, letterSpacing: "0.12em", textTransform: "uppercase", color: "rgba(232,228,220,0.35)", marginBottom: 12 }}>
                {files.length} file{files.length > 1 ? "s" : ""} selected
              </div>
              <div style={{ display: "flex", flexWrap: "wrap" }}>
                {files.map((f, i) => (
                  <div key={i} className="file-chip">
                    <span>📄</span>
                    <span>{f.name.length > 28 ? f.name.slice(0, 28) + "…" : f.name}</span>
                    <button className="remove-btn" onClick={e => { e.stopPropagation(); setFiles(prev => prev.filter((_, j) => j !== i)); }}>×</button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div style={{ background: "rgba(255,107,107,0.04)", border: "1px solid rgba(255,107,107,0.12)", padding: "14px 18px", marginTop: 2, marginBottom: 2, display: "flex", gap: 10, alignItems: "flex-start" }}>
            <span style={{ fontSize: 15 }}>💡</span>
            <p style={{ fontSize: 13, color: "rgba(232,228,220,0.55)", lineHeight: 1.6 }}>
              <span style={{ color: "#E8E4DC", fontWeight: 600 }}>What to upload:</span>{" "}
              DBMS notes, OS PDFs, DSA sheets, previous interview experiences, company-specific prep — anything you've collected.
            </p>
          </div>

          <button className="btn-primary" onClick={processDocuments} disabled={uploading || !files.length}>
            {uploading ? "Processing Documents..." : `Process ${files.length || 0} Document${files.length !== 1 ? "s" : ""} →`}
          </button>
        </div>
      )}

      {phase === "chat" && (
        <div className="fade">
          {/* Docs info bar */}
          <div style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            background: "rgba(255,107,107,0.06)", border: "1px solid rgba(255,107,107,0.15)",
            padding: "10px 16px", marginBottom: 16,
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#FF6B6B" }} />
              <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 11, color: "#FF6B6B", letterSpacing: "0.08em" }}>
                {docsInfo.files} DOC{docsInfo.files > 1 ? "S" : ""} · {docsInfo.chunks} CHUNKS INDEXED
              </span>
            </div>
            <button onClick={() => { setPhase("upload"); setFiles([]); setMessages([]); }}
              style={{ background: "none", border: "none", color: "rgba(232,228,220,0.35)", cursor: "pointer", fontSize: 12, fontFamily: "'Space Mono', monospace" }}>
              + Add more
            </button>
          </div>

          {/* Messages */}
          <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 16, minHeight: 300 }}>
            {messages.map((m, i) => (
              <div key={i} className="msg">
                {m.role === "ai" ? (
                  <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                    <div style={{ width: 28, height: 28, background: "rgba(255,107,107,0.1)", border: "1px solid rgba(255,107,107,0.2)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, flexShrink: 0, marginTop: 2 }}>📚</div>
                    <div className="ai-bubble">{m.content}</div>
                  </div>
                ) : (
                  <div style={{ display: "flex", justifyContent: "flex-end" }}>
                    <div className="user-bubble">{m.content}</div>
                  </div>
                )}
              </div>
            ))}
            {loading && (
              <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                <div style={{ width: 28, height: 28, background: "rgba(255,107,107,0.1)", border: "1px solid rgba(255,107,107,0.2)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12 }}>📚</div>
                <div style={{ background: "#0D1210", border: "1px solid #1A2320", padding: "14px 20px", borderRadius: "2px 12px 12px 12px", display: "flex", gap: 6 }}>
                  <div className="dot" /><div className="dot" /><div className="dot" />
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Suggested questions */}
          {messages.length === 1 && (
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 12 }}>
              {["Explain this topic simply", "Give me 5 interview questions on this", "What are the key concepts I should know?", "Summarize the most important points"].map(q => (
                <button key={q} onClick={() => setInput(q)} style={{
                  background: "rgba(255,107,107,0.06)", border: "1px solid rgba(255,107,107,0.15)",
                  color: "rgba(232,228,220,0.6)", padding: "7px 14px", fontSize: 12,
                  cursor: "pointer", transition: "all 0.2s", borderRadius: "100px", fontFamily: "'Sora', sans-serif",
                }}>
                  {q}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <div style={{ display: "flex", gap: 8 }}>
            <input
              className="chat-input"
              placeholder="Ask anything from your uploaded documents..."
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter") sendMessage(); }}
            />
            <button className="send-btn" onClick={sendMessage} disabled={!input.trim() || loading}>
              →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
