"use client";
import { useState, useRef } from "react";

type AnalysisResult = {
  match_score: number;
  strong_points: string[];
  missing_keywords: string[];
  weak_sections: string[];
  improvement_suggestions: string[];
  final_verdict: string;
};

type Tab = "analyze" | "optimize";

export default function ResumePage() {
  const [tab, setTab] = useState<Tab>("analyze");

  // Analyze state
  const [file, setFile] = useState<File | null>(null);
  const [jd, setJd] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState("");
  const [drag, setDrag] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  // Optimize state
  const [optFile, setOptFile] = useState<File | null>(null);
  const [optJd, setOptJd] = useState("");
  const [optLoading, setOptLoading] = useState(false);
  const [optError, setOptError] = useState("");
  const [optDone, setOptDone] = useState(false);
  const [optDrag, setOptDrag] = useState(false);
  const optFileRef = useRef<HTMLInputElement>(null);

  const handleFile = (f: File) => {
    if (f.type !== "application/pdf") { setError("Please upload a PDF file."); return; }
    setFile(f); setError("");
  };

  const handleOptFile = (f: File) => {
    if (f.type !== "application/pdf") { setOptError("Please upload a PDF file."); return; }
    setOptFile(f); setOptError("");
  };

  const handleSubmit = async () => {
    if (!file) { setError("Please upload your resume."); return; }
    if (!jd.trim()) { setError("Please paste the job description."); return; }
    setLoading(true); setError(""); setResult(null);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("job_description", jd);
      const res = await fetch("${process.env.NEXT_PUBLIC_API_URL}/api/analyze-resume", { method: "POST", body: formData });
      if (!res.ok) throw new Error();
      setResult(await res.json());
    } catch {
      setError("Something went wrong. Make sure the backend is running.");
    } finally { setLoading(false); }
  };

  const handleOptimize = async () => {
    if (!optFile) { setOptError("Please upload your resume."); return; }
    if (!optJd.trim()) { setOptError("Please paste the job description."); return; }
    setOptLoading(true); setOptError(""); setOptDone(false);
    try {
      const formData = new FormData();
      formData.append("file", optFile);
      formData.append("job_description", optJd);
      const res = await fetch("${process.env.NEXT_PUBLIC_API_URL}/api/optimize-resume", { method: "POST", body: formData });
      if (!res.ok) throw new Error();
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "optimized_resume.pdf";
      a.click();
      window.URL.revokeObjectURL(url);
      setOptDone(true);
    } catch {
      setOptError("Something went wrong. Make sure the backend is running.");
    } finally { setOptLoading(false); }
  };

  const scoreColor = result
    ? result.match_score >= 75 ? "#00FF94" : result.match_score >= 50 ? "#FFD166" : "#FF6B6B"
    : "#00FF94";
  const circumference = 2 * Math.PI * 54;
  const offset = result ? circumference - (result.match_score / 100) * circumference : circumference;

  return (
    <div style={{ maxWidth: 900, margin: "0 auto" }}>
      <style>{`
        @keyframes fadeUp { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
        @keyframes spin { to{transform:rotate(360deg)} }
        @keyframes ringFill {
          from { stroke-dashoffset: ${circumference}; }
          to { stroke-dashoffset: ${offset}; }
        }
        .fade { animation: fadeUp 0.5s both; }
        .fade2 { animation: fadeUp 0.5s 0.1s both; }
        .fade3 { animation: fadeUp 0.5s 0.2s both; }

        .tab-btn {
          padding: 10px 24px; background: transparent;
          border: 1px solid #1A2320; color: rgba(232,228,220,0.4);
          font-family: 'Space Mono', monospace; font-size: 11px;
          letter-spacing: 0.08em; text-transform: uppercase;
          cursor: pointer; transition: all 0.2s;
        }
        .tab-btn:hover { color: #E8E4DC; border-color: #2A3830; }
        .tab-btn.active { color: #00FF94; border-color: #00FF94; background: rgba(0,255,148,0.06); }

        .upload-zone {
          border: 1px dashed #2A3830; background: #0D1210;
          padding: 36px; text-align: center; cursor: pointer;
          transition: all 0.2s; border-radius: 2px;
        }
        .upload-zone:hover, .upload-zone.drag { border-color: #00FF94; background: rgba(0,255,148,0.04); }

        .chip {
          display: inline-flex; align-items: center; gap: 6px;
          padding: 5px 12px; border-radius: 100px; font-size: 12px;
          font-weight: 500; border: 1px solid; margin: 4px;
        }
        .card { background: #0D1210; border: 1px solid #1A2320; padding: 24px; border-radius: 2px; margin-bottom: 2px; }
        .card-label { font-family:'Space Mono',monospace; font-size:10px; letter-spacing:0.14em; text-transform:uppercase; margin-bottom:16px; }

        .btn-primary {
          background: #00FF94; color: #080C0A; border: none;
          padding: 14px 32px; font-family:'Space Mono',monospace;
          font-size: 13px; font-weight: 700; letter-spacing: 0.06em;
          cursor: pointer; transition: all 0.2s; text-transform: uppercase; width: 100%;
        }
        .btn-primary:hover:not(:disabled) { background: #E8E4DC; transform: translateY(-1px); box-shadow: 0 8px 32px rgba(0,255,148,0.2); }
        .btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }

        .btn-purple {
          background: #A78BFA; color: #080C0A; border: none;
          padding: 14px 32px; font-family:'Space Mono',monospace;
          font-size: 13px; font-weight: 700; letter-spacing: 0.06em;
          cursor: pointer; transition: all 0.2s; text-transform: uppercase; width: 100%;
        }
        .btn-purple:hover:not(:disabled) { background: #E8E4DC; transform: translateY(-1px); }
        .btn-purple:disabled { opacity: 0.5; cursor: not-allowed; }

        .spinner { width:18px; height:18px; border:2px solid rgba(8,12,10,0.3); border-top-color:#080C0A; border-radius:50%; animation:spin 0.7s linear infinite; display:inline-block; }
        .ring-circle {
          stroke-dasharray: ${circumference};
          stroke-dashoffset: ${offset};
          animation: ringFill 1.2s 0.3s cubic-bezier(.4,0,.2,1) both;
          transform: rotate(-90deg); transform-origin: 64px 64px;
        }
        textarea {
          width:100%; background:#0D1210; border:1px solid #1A2320;
          color:#E8E4DC; padding:16px; font-family:'Sora',sans-serif;
          font-size:14px; line-height:1.7; resize:vertical;
          outline:none; transition:border-color 0.2s; border-radius:2px;
        }
        textarea:focus { border-color:rgba(0,255,148,0.4); }
        textarea::placeholder { color:rgba(232,228,220,0.25); }
      `}</style>

      {/* Header */}
      <div className="fade" style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: "clamp(22px,4vw,32px)", fontWeight: 800, letterSpacing: "-0.02em" }}>
          Resume <span style={{ color: "#00FF94" }}>Tools</span>
        </h1>
        <p style={{ marginTop: 8, fontSize: 14, color: "rgba(232,228,220,0.55)", lineHeight: 1.6 }}>
          Analyze your resume against a JD — or let AI rewrite it to maximize your ATS score.
        </p>
      </div>

      {/* Tabs */}
      <div className="fade" style={{ display: "flex", gap: 2, marginBottom: 24 }}>
        <button className={`tab-btn ${tab === "analyze" ? "active" : ""}`} onClick={() => setTab("analyze")}>
          📄 Analyze Resume
        </button>
        <button className={`tab-btn ${tab === "optimize" ? "active" : ""}`} onClick={() => setTab("optimize")}>
          ✨ AI Optimize + Download PDF
        </button>
      </div>

      {/* ANALYZE TAB */}
      {tab === "analyze" && (
        <div className="fade2">
          {!result ? (
            <>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2, marginBottom: 2 }}>
                <div className={`upload-zone ${drag ? "drag" : ""}`}
                  onDragOver={e => { e.preventDefault(); setDrag(true); }}
                  onDragLeave={() => setDrag(false)}
                  onDrop={e => { e.preventDefault(); setDrag(false); e.dataTransfer.files[0] && handleFile(e.dataTransfer.files[0]); }}
                  onClick={() => fileRef.current?.click()}
                >
                  <input ref={fileRef} type="file" accept=".pdf" style={{ display: "none" }} onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])} />
                  {file ? (
                    <>
                      <div style={{ fontSize: 28, marginBottom: 10 }}>📄</div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: "#00FF94", marginBottom: 4 }}>{file.name}</div>
                      <div style={{ fontSize: 11, color: "rgba(232,228,220,0.4)" }}>{(file.size / 1024).toFixed(0)} KB · Click to change</div>
                    </>
                  ) : (
                    <>
                      <div style={{ fontSize: 28, marginBottom: 10 }}>⬆</div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: "#E8E4DC", marginBottom: 6 }}>Drop your resume here</div>
                      <div style={{ fontSize: 11, color: "rgba(232,228,220,0.4)" }}>PDF only · Click or drag and drop</div>
                    </>
                  )}
                </div>
                <div style={{ background: "#0D1210", border: "1px solid #1A2320", padding: 18, display: "flex", flexDirection: "column" }}>
                  <div style={{ fontFamily: "'Space Mono',monospace", fontSize: 10, letterSpacing: "0.14em", textTransform: "uppercase", color: "rgba(232,228,220,0.4)", marginBottom: 10 }}>Job Description</div>
                  <textarea rows={7} placeholder="Paste the full job description here..." value={jd} onChange={e => setJd(e.target.value)} style={{ flex: 1 }} />
                </div>
              </div>
              {error && <div style={{ padding: "12px 16px", background: "rgba(255,107,107,0.08)", border: "1px solid rgba(255,107,107,0.2)", color: "#FF6B6B", fontSize: 13, marginBottom: 2 }}>{error}</div>}
              <button className="btn-primary" onClick={handleSubmit} disabled={loading}>
                {loading ? <span style={{ display:"flex",alignItems:"center",justifyContent:"center",gap:10 }}><span className="spinner"/>Analyzing...</span> : "Analyze My Resume →"}
              </button>
            </>
          ) : (
            <div className="fade3">
              <div style={{ display: "grid", gridTemplateColumns: "auto 1fr", gap: 2, marginBottom: 2 }}>
                <div className="card" style={{ display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",minWidth:160 }}>
                  <div className="card-label" style={{ color:"rgba(232,228,220,0.4)" }}>ATS Score</div>
                  <div style={{ position:"relative",width:128,height:128 }}>
                    <svg width="128" height="128" viewBox="0 0 128 128">
                      <circle cx="64" cy="64" r="54" fill="none" stroke="#1A2320" strokeWidth="8"/>
                      <circle cx="64" cy="64" r="54" fill="none" stroke={scoreColor} strokeWidth="8" strokeLinecap="round" className="ring-circle"/>
                    </svg>
                    <div style={{ position:"absolute",inset:0,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center" }}>
                      <span style={{ fontFamily:"'Space Mono',monospace",fontSize:28,fontWeight:700,color:scoreColor,lineHeight:1 }}>{result.match_score}</span>
                      <span style={{ fontSize:11,color:"rgba(232,228,220,0.4)",marginTop:2 }}>/100</span>
                    </div>
                  </div>
                  <div style={{ marginTop:10,fontSize:12,color:scoreColor,fontFamily:"'Space Mono',monospace",textAlign:"center" }}>
                    {result.match_score >= 75 ? "Strong match" : result.match_score >= 50 ? "Needs work" : "Major gaps"}
                  </div>
                </div>
                <div className="card">
                  <div className="card-label" style={{ color:"rgba(232,228,220,0.4)" }}>Final Verdict</div>
                  <p style={{ fontSize:15,color:"rgba(232,228,220,0.85)",lineHeight:1.8 }}>{result.final_verdict}</p>
                  {result.match_score < 80 && (
                    <button onClick={() => setTab("optimize")} style={{ marginTop:16,background:"rgba(167,139,250,0.1)",border:"1px solid rgba(167,139,250,0.3)",color:"#A78BFA",padding:"10px 18px",cursor:"pointer",fontFamily:"'Space Mono',monospace",fontSize:11,letterSpacing:"0.06em",transition:"all 0.2s" }}>
                      ✨ Auto-Optimize This Resume →
                    </button>
                  )}
                </div>
              </div>
              <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:2,marginBottom:2 }}>
                <div className="card">
                  <div className="card-label" style={{ color:"#00FF94" }}>✓ Strong Points</div>
                  {result.strong_points.map((p,i) => <div key={i} className="chip" style={{ borderColor:"rgba(0,255,148,0.25)",color:"#00FF94",background:"rgba(0,255,148,0.06)" }}><span>✓</span>{p}</div>)}
                </div>
                <div className="card">
                  <div className="card-label" style={{ color:"#FF6B6B" }}>✗ Missing Keywords</div>
                  {result.missing_keywords.map((k,i) => <div key={i} className="chip" style={{ borderColor:"rgba(255,107,107,0.25)",color:"#FF6B6B",background:"rgba(255,107,107,0.06)" }}><span>✗</span>{k}</div>)}
                </div>
              </div>
              <div className="card" style={{ marginBottom:2 }}>
                <div className="card-label" style={{ color:"#FFD166" }}>⚠ Weak Sections</div>
                <div style={{ display:"flex",flexWrap:"wrap" }}>
                  {result.weak_sections.map((s,i) => <div key={i} className="chip" style={{ borderColor:"rgba(255,209,102,0.25)",color:"#FFD166",background:"rgba(255,209,102,0.06)" }}>⚠ {s}</div>)}
                </div>
              </div>
              <div className="card" style={{ marginBottom:2 }}>
                <div className="card-label" style={{ color:"rgba(232,228,220,0.4)" }}>💡 Improvement Suggestions</div>
                {result.improvement_suggestions.map((s,i) => (
                  <div key={i} style={{ display:"flex",gap:14,padding:"12px 0",borderBottom:i<result.improvement_suggestions.length-1?"1px solid #1A2320":"none" }}>
                    <span style={{ fontFamily:"'Space Mono',monospace",fontSize:11,color:"#00FF94",minWidth:24,paddingTop:2 }}>0{i+1}</span>
                    <p style={{ fontSize:14,color:"rgba(232,228,220,0.75)",lineHeight:1.7 }}>{s}</p>
                  </div>
                ))}
              </div>
              <button className="btn-primary" onClick={() => { setResult(null); setFile(null); setJd(""); }}>← Analyze Another Resume</button>
            </div>
          )}
        </div>
      )}

      {/* OPTIMIZE TAB */}
      {tab === "optimize" && (
        <div className="fade2">
          <div style={{ background:"rgba(167,139,250,0.06)",border:"1px solid rgba(167,139,250,0.2)",padding:"16px 20px",marginBottom:16,display:"flex",gap:12,alignItems:"flex-start" }}>
            <span style={{ fontSize:20,flexShrink:0 }}>✨</span>
            <div>
              <div style={{ fontSize:14,fontWeight:700,color:"#A78BFA",marginBottom:4 }}>AI Resume Optimizer</div>
              <p style={{ fontSize:13,color:"rgba(232,228,220,0.6)",lineHeight:1.7 }}>
                Upload your resume + paste a job description. Our AI rewrites your resume to maximize ATS score — adding missing keywords, strengthening bullet points, and adding measurable impact. Downloads as a clean PDF ready to submit.
              </p>
            </div>
          </div>

          {!optDone ? (
            <>
              <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:2,marginBottom:2 }}>
                <div className={`upload-zone ${optDrag ? "drag" : ""}`}
                  onDragOver={e => { e.preventDefault(); setOptDrag(true); }}
                  onDragLeave={() => setOptDrag(false)}
                  onDrop={e => { e.preventDefault(); setOptDrag(false); e.dataTransfer.files[0] && handleOptFile(e.dataTransfer.files[0]); }}
                  onClick={() => optFileRef.current?.click()}
                >
                  <input ref={optFileRef} type="file" accept=".pdf" style={{ display:"none" }} onChange={e => e.target.files?.[0] && handleOptFile(e.target.files[0])} />
                  {optFile ? (
                    <>
                      <div style={{ fontSize:28,marginBottom:10 }}>📄</div>
                      <div style={{ fontSize:13,fontWeight:600,color:"#A78BFA",marginBottom:4 }}>{optFile.name}</div>
                      <div style={{ fontSize:11,color:"rgba(232,228,220,0.4)" }}>{(optFile.size/1024).toFixed(0)} KB · Click to change</div>
                    </>
                  ) : (
                    <>
                      <div style={{ fontSize:28,marginBottom:10 }}>⬆</div>
                      <div style={{ fontSize:13,fontWeight:600,color:"#E8E4DC",marginBottom:6 }}>Drop your resume here</div>
                      <div style={{ fontSize:11,color:"rgba(232,228,220,0.4)" }}>PDF only · Click or drag and drop</div>
                    </>
                  )}
                </div>
                <div style={{ background:"#0D1210",border:"1px solid #1A2320",padding:18,display:"flex",flexDirection:"column" }}>
                  <div style={{ fontFamily:"'Space Mono',monospace",fontSize:10,letterSpacing:"0.14em",textTransform:"uppercase",color:"rgba(232,228,220,0.4)",marginBottom:10 }}>Target Job Description</div>
                  <textarea rows={7} placeholder="Paste the job description you want to optimize for..." value={optJd} onChange={e => setOptJd(e.target.value)} style={{ flex:1 }} />
                </div>
              </div>

              <div style={{ background:"rgba(255,209,102,0.04)",border:"1px solid rgba(255,209,102,0.12)",padding:"12px 16px",marginBottom:2,display:"flex",gap:10 }}>
                <span style={{ fontSize:14 }}>⚡</span>
                <p style={{ fontSize:12,color:"rgba(232,228,220,0.55)",lineHeight:1.6 }}>
                  <span style={{ color:"#E8E4DC",fontWeight:600 }}>Note:</span> The AI rewrites your bullet points to include JD keywords naturally. Your experience, education, and projects stay real — only the wording gets optimized.
                </p>
              </div>

              {optError && <div style={{ padding:"12px 16px",background:"rgba(255,107,107,0.08)",border:"1px solid rgba(255,107,107,0.2)",color:"#FF6B6B",fontSize:13,marginBottom:2 }}>{optError}</div>}

              <button className="btn-purple" onClick={handleOptimize} disabled={optLoading}>
                {optLoading
                  ? <span style={{ display:"flex",alignItems:"center",justifyContent:"center",gap:10 }}><span className="spinner"/>AI is rewriting your resume...</span>
                  : "✨ Optimize + Download PDF →"}
              </button>
            </>
          ) : (
            <div className="fade3" style={{ textAlign:"center",padding:"48px 24px" }}>
              <div style={{ fontSize:52,marginBottom:16 }}>🎉</div>
              <h2 style={{ fontSize:24,fontWeight:800,letterSpacing:"-0.02em",marginBottom:10 }}>
                Your optimized resume is <span style={{ color:"#00FF94" }}>downloading!</span>
              </h2>
              <p style={{ fontSize:14,color:"rgba(232,228,220,0.55)",lineHeight:1.7,maxWidth:420,margin:"0 auto 32px" }}>
                Your resume has been rewritten with ATS-optimized keywords, stronger bullet points, and measurable impact statements.
              </p>
              <div style={{ display:"flex",gap:10,justifyContent:"center",flexWrap:"wrap" }}>
                <button className="btn-purple" style={{ width:"auto",padding:"12px 28px" }} onClick={() => { setOptDone(false); setOptFile(null); setOptJd(""); }}>
                  Optimize Another →
                </button>
                <button onClick={() => setTab("analyze")} style={{ background:"transparent",border:"1px solid #1A2320",color:"rgba(232,228,220,0.5)",padding:"12px 28px",cursor:"pointer",fontFamily:"'Space Mono',monospace",fontSize:11,letterSpacing:"0.06em",transition:"all 0.2s" }}>
                  Analyze This Resume
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
