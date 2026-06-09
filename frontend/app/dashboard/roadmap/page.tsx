"use client";
import { useState } from "react";
import { RoadAnimation } from "./RoadAnimation";

const GOALS = [
  "Software Engineering Internship",
  "Data Science Internship",
  "Machine Learning Internship",
  "Frontend Development Role",
  "Backend Development Role",
  "Full Stack Development Role",
];
const TIMEFRAMES = ["2 weeks", "1 month", "2 months", "3 months", "6 months"];

type WeekPlan = { week: string; focus: string; tasks: string[] };
type Resource = { title: string; type: string; url: string };
type Project = { title: string; desc: string; difficulty: string };
type Roadmap = {
  weekly_plan: WeekPlan[];
  must_learn: string[];
  resources: Resource[];
  projects: Project[];
  final_tip: string;
};

const diffColor = (d: string) =>
  d === "Beginner" ? "#00FF94" : d === "Intermediate" ? "#FFD166" : "#FF6B6B";

export default function RoadmapPage() {
  const [goal, setGoal] = useState(GOALS[0]);
  const [timeframe, setTimeframe] = useState(TIMEFRAMES[2]);
  const [skills, setSkills] = useState("");
  const [loading, setLoading] = useState(false);
  const [roadmap, setRoadmap] = useState<Roadmap | null>(null);
  const [error, setError] = useState("");
  const [activeWeek, setActiveWeek] = useState(0);

  const generate = async () => {
    if (!skills.trim()) { setError("Please enter your current skills."); return; }
    setLoading(true); setError(""); setRoadmap(null);
    try {
      const res = await fetch("${process.env.NEXT_PUBLIC_API_URL}/api/roadmap", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ goal, timeframe, current_skills: skills }),
      });
      const data = await res.json();
      if (data.error) { setError(data.error); return; }
      setRoadmap(data);
      setActiveWeek(0);
    } catch {
      setError("Something went wrong. Make sure the backend is running.");
    } finally { setLoading(false); }
  };

  return (
    <div style={{ maxWidth: 920, margin: "0 auto" }}>
      <style>{`
        @keyframes fadeUp { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:translateY(0)} }
        @keyframes spin { to{transform:rotate(360deg)} }
        @keyframes slideIn { from{opacity:0;transform:translateX(10px)} to{opacity:1;transform:translateX(0)} }
        .fade  { animation: fadeUp 0.5s both; }
        .fade2 { animation: fadeUp 0.5s 0.1s both; }
        .fade3 { animation: fadeUp 0.5s 0.15s both; }
        .slide { animation: slideIn 0.3s both; }

        .sel-btn {
          padding: 9px 16px; background: #0D1210; border: 1px solid #1A2320;
          color: rgba(232,228,220,0.45); font-family:'Sora',sans-serif; font-size:13px;
          cursor:pointer; transition:all 0.2s; border-radius:2px;
        }
        .sel-btn:hover { border-color:rgba(167,139,250,0.4); color:#E8E4DC; }
        .sel-btn.active { border-color:#A78BFA; color:#A78BFA; background:rgba(167,139,250,0.06); }

        .btn-primary {
          background:#A78BFA; color:#080C0A; border:none;
          padding:14px 32px; font-family:'Space Mono',monospace;
          font-size:13px; font-weight:700; letter-spacing:0.06em;
          cursor:pointer; transition:all 0.2s; text-transform:uppercase; width:100%;
        }
        .btn-primary:hover:not(:disabled) { background:#E8E4DC; transform:translateY(-1px); }
        .btn-primary:disabled { opacity:0.5; cursor:not-allowed; }

        .card { background:#0D1210; border:1px solid #1A2320; padding:24px; border-radius:2px; }
        .card-label { font-family:'Space Mono',monospace; font-size:10px; letter-spacing:0.14em; text-transform:uppercase; margin-bottom:16px; }

        .skill-chip {
          display:inline-flex; align-items:center; gap:6px;
          padding:6px 14px; background:rgba(167,139,250,0.08);
          border:1px solid rgba(167,139,250,0.2); border-radius:100px;
          font-size:13px; color:#A78BFA; margin:4px;
        }
        input[type="text"] {
          width:100%; background:#0D1210; border:1px solid #1A2320;
          color:#E8E4DC; padding:14px 16px; font-family:'Sora',sans-serif;
          font-size:14px; outline:none; transition:border-color 0.2s; border-radius:2px;
        }
        input[type="text"]:focus { border-color:rgba(167,139,250,0.4); }
        input[type="text"]::placeholder { color:rgba(232,228,220,0.25); }

        .spinner { width:16px; height:16px; border:2px solid rgba(8,12,10,0.3); border-top-color:#080C0A; border-radius:50%; animation:spin 0.7s linear infinite; display:inline-block; }

        .week-nav-btn {
          background:transparent; border:1px solid #1A2320;
          color:rgba(232,228,220,0.45); padding:8px 16px;
          cursor:pointer; font-family:'Space Mono',monospace; font-size:11px;
          transition:all 0.2s; letter-spacing:0.04em;
        }
        .week-nav-btn:hover { border-color:rgba(167,139,250,0.4); color:#A78BFA; }
        .week-nav-btn.next { background:rgba(167,139,250,0.08); border-color:rgba(167,139,250,0.25); color:#A78BFA; }
      `}</style>

      {/* Header */}
      <div className="fade" style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: "clamp(22px,4vw,32px)", fontWeight: 800, letterSpacing: "-0.02em" }}>
          Learning <span style={{ color: "#A78BFA" }}>Roadmap</span>
        </h1>
        <p style={{ marginTop: 8, fontSize: 14, color: "rgba(232,228,220,0.55)", lineHeight: 1.6 }}>
          Tell us your goal and timeline. Get a week-by-week personalized prep plan — no guesswork.
        </p>
      </div>

      {/* Setup form */}
      {!roadmap && (
        <div className="fade2">
          <div className="card" style={{ marginBottom: 2 }}>
            <div className="card-label" style={{ color:"rgba(232,228,220,0.35)" }}>Your target role</div>
            <div style={{ display:"flex", flexWrap:"wrap", gap:8 }}>
              {GOALS.map(g => (
                <button key={g} className={`sel-btn ${goal === g ? "active" : ""}`} onClick={() => setGoal(g)}>{g}</button>
              ))}
            </div>
          </div>

          <div className="card" style={{ marginBottom: 2 }}>
            <div className="card-label" style={{ color:"rgba(232,228,220,0.35)" }}>How much time do you have?</div>
            <div style={{ display:"flex", flexWrap:"wrap", gap:8 }}>
              {TIMEFRAMES.map(t => (
                <button key={t} className={`sel-btn ${timeframe === t ? "active" : ""}`} onClick={() => setTimeframe(t)}>{t}</button>
              ))}
            </div>
          </div>

          <div className="card" style={{ marginBottom: 2 }}>
            <div className="card-label" style={{ color:"rgba(232,228,220,0.35)" }}>What do you already know?</div>
            <input type="text"
              placeholder="e.g. Python, basic HTML, some React, data structures..."
              value={skills}
              onChange={e => setSkills(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter") generate(); }}
            />
          </div>

          {error && (
            <div style={{ padding:"12px 16px", background:"rgba(255,107,107,0.08)", border:"1px solid rgba(255,107,107,0.2)", color:"#FF6B6B", fontSize:13, marginBottom:2 }}>
              {error}
            </div>
          )}

          <button className="btn-primary" onClick={generate} disabled={loading}>
            {loading
              ? <span style={{ display:"flex",alignItems:"center",justifyContent:"center",gap:10 }}>
                  <span className="spinner"/> Generating your roadmap...
                </span>
              : "Generate My Roadmap →"}
          </button>
        </div>
      )}

      {/* Roadmap result */}
      {roadmap && (
        <div className="fade3">

          {/* Road animation card */}
          <div className="card" style={{ marginBottom: 2 }}>
            <div className="card-label" style={{ color:"#A78BFA" }}>🛣️ Your Learning Journey</div>
            <p style={{ fontSize:12, color:"rgba(232,228,220,0.4)", marginBottom:16 }}>
              Click any stop on the road to see that week's plan.
            </p>

            <RoadAnimation
              plan={roadmap.weekly_plan}
              onSelect={setActiveWeek}
              active={activeWeek}
            />

            {/* Active week detail */}
            {roadmap.weekly_plan[activeWeek] && (
              <div className="slide" key={activeWeek}
                style={{ marginTop:24, paddingTop:20, borderTop:"1px solid #1A2320" }}>
                <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:16 }}>
                  <span style={{ fontFamily:"'Space Mono',monospace", fontSize:11, color:"#A78BFA", background:"rgba(167,139,250,0.1)", border:"1px solid rgba(167,139,250,0.2)", padding:"4px 10px" }}>
                    {roadmap.weekly_plan[activeWeek].week}
                  </span>
                  <span style={{ fontSize:16, fontWeight:700, color:"#E8E4DC" }}>
                    {roadmap.weekly_plan[activeWeek].focus}
                  </span>
                </div>

                <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
                  {roadmap.weekly_plan[activeWeek].tasks.map((task, i) => (
                    <div key={i} style={{ display:"flex", gap:14, alignItems:"flex-start", padding:"10px 14px", background:"#0A0F0D", border:"1px solid #1A2320" }}>
                      <span style={{ color:"#A78BFA", fontFamily:"'Space Mono',monospace", fontSize:11, minWidth:20, paddingTop:1, flexShrink:0 }}>0{i+1}</span>
                      <p style={{ fontSize:14, color:"rgba(232,228,220,0.78)", lineHeight:1.7 }}>{task}</p>
                    </div>
                  ))}
                </div>

                <div style={{ display:"flex", gap:8, marginTop:16 }}>
                  {activeWeek > 0 && (
                    <button className="week-nav-btn" onClick={() => setActiveWeek(p => p - 1)}>← Prev Week</button>
                  )}
                  {activeWeek < roadmap.weekly_plan.length - 1 && (
                    <button className="week-nav-btn next" onClick={() => setActiveWeek(p => p + 1)}>Next Week →</button>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Must learn + Projects */}
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:2, marginBottom:2 }}>
            <div className="card">
              <div className="card-label" style={{ color:"rgba(232,228,220,0.35)" }}>🎯 Must Learn</div>
              <div style={{ display:"flex", flexWrap:"wrap" }}>
                {roadmap.must_learn.map((s,i) => (
                  <span key={i} className="skill-chip">✦ {s}</span>
                ))}
              </div>
            </div>
            <div className="card">
              <div className="card-label" style={{ color:"rgba(232,228,220,0.35)" }}>🛠 Projects to Build</div>
              {roadmap.projects.map((p,i) => (
                <div key={i} style={{ marginBottom:14, paddingBottom:14, borderBottom: i < roadmap.projects.length-1 ? "1px solid #1A2320" : "none" }}>
                  <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:4 }}>
                    <span style={{ fontSize:13, fontWeight:700, color:"#E8E4DC" }}>{p.title}</span>
                    <span style={{ fontFamily:"'Space Mono',monospace", fontSize:9, color:diffColor(p.difficulty), background:diffColor(p.difficulty)+"18", border:`1px solid ${diffColor(p.difficulty)}30`, padding:"2px 7px" }}>
                      {p.difficulty}
                    </span>
                  </div>
                  <p style={{ fontSize:12, color:"rgba(232,228,220,0.55)", lineHeight:1.6 }}>{p.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Resources */}
          <div className="card" style={{ marginBottom:2 }}>
            <div className="card-label" style={{ color:"rgba(232,228,220,0.35)" }}>📖 Recommended Resources</div>
            {roadmap.resources.map((r,i) => (
              <div key={i} style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"12px 0", borderBottom: i < roadmap.resources.length-1 ? "1px solid #1A2320" : "none" }}>
                <div>
                  <div style={{ fontSize:14, fontWeight:600, color:"#E8E4DC" }}>{r.title}</div>
                  <div style={{ fontSize:11, color:"rgba(232,228,220,0.4)", marginTop:2, fontFamily:"'Space Mono',monospace" }}>{r.type}</div>
                </div>
                {r.url && (
                  <a href={r.url} target="_blank" rel="noopener noreferrer"
                    style={{ fontSize:12, color:"#A78BFA", fontFamily:"'Space Mono',monospace" }}>
                    Visit →
                  </a>
                )}
              </div>
            ))}
          </div>

          {/* Final tip */}
          <div style={{ background:"rgba(167,139,250,0.06)", border:"1px solid rgba(167,139,250,0.2)", padding:"20px 24px", marginBottom:2, display:"flex", gap:12, alignItems:"flex-start" }}>
            <span style={{ fontSize:18, flexShrink:0 }}>💜</span>
            <p style={{ fontSize:14, color:"rgba(232,228,220,0.78)", lineHeight:1.75, fontStyle:"italic" }}>
              "{roadmap.final_tip}"
            </p>
          </div>

          <button className="btn-primary" onClick={() => { setRoadmap(null); setSkills(""); }}>
            ← Generate Another Roadmap
          </button>
        </div>
      )}
    </div>
  );
}
