"use client";
import Link from "next/link";

const TOOLS = [
  {
    href: "/dashboard/resume",
    icon: "📄",
    label: "Resume Analyzer",
    desc: "Upload your resume and a JD. Get ATS score, missing keywords, and exact fixes.",
    accent: "#00FF94",
    tag: "Start here",
  },
  {
    href: "/dashboard/interview",
    icon: "🎤",
    label: "Mock Interview",
    desc: "5-round adaptive interview. Get scored on every answer with ideal answer hints.",
    accent: "#FFD166",
    tag: "Most popular",
  },
  {
    href: "/dashboard/assistant",
    icon: "📚",
    label: "AI Assistant",
    desc: "Upload your notes and PDFs. Ask anything. Get answers from your own materials.",
    accent: "#FF6B6B",
    tag: "RAG-powered",
  },
  {
    href: "/dashboard/roadmap",
    icon: "🗺️",
    label: "Learning Roadmap",
    desc: "Tell us your goal and timeline. Get a week-by-week personalized prep plan.",
    accent: "#A78BFA",
    tag: "Personalized",
  },
];

const STATS = [
  { label: "Resume Score", value: "—", sub: "No resume analyzed yet", accent: "#00FF94" },
  { label: "Interviews Done", value: "0", sub: "Start your first session", accent: "#FFD166" },
  { label: "Avg Interview Score", value: "—", sub: "Complete an interview", accent: "#FF6B6B" },
  { label: "Docs Uploaded", value: "0", sub: "Upload study materials", accent: "#A78BFA" },
];

export default function DashboardPage() {
  return (
    <div style={{ maxWidth: 1000, margin: "0 auto" }}>
      <style>{`
        .tool-card {
          background: #0D1210; border: 1px solid #1A2320;
          padding: 28px; text-decoration: none; color: inherit;
          display: block; transition: all 0.25s; position: relative; overflow: hidden;
          border-radius: 2px;
        }
        .tool-card::after {
          content: ''; position: absolute; bottom: 0; left: 0; right: 0; height: 2px;
          background: var(--accent); transform: scaleX(0); transform-origin: left;
          transition: transform 0.35s ease;
        }
        .tool-card:hover { background: #111915; border-color: #243028; transform: translateY(-2px); }
        .tool-card:hover::after { transform: scaleX(1); }

        .stat-card {
          background: #0D1210; border: 1px solid #1A2320;
          padding: 24px; border-radius: 2px;
        }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .fade-1 { animation: fadeUp 0.5s 0.05s both; }
        .fade-2 { animation: fadeUp 0.5s 0.1s both; }
        .fade-3 { animation: fadeUp 0.5s 0.15s both; }
        .fade-4 { animation: fadeUp 0.5s 0.2s both; }
      `}</style>

      {/* Welcome */}
      <div className="fade-1" style={{ marginBottom: 40 }}>
        <h1 style={{ fontSize: "clamp(24px, 4vw, 36px)", fontWeight: 800, letterSpacing: "-0.02em", lineHeight: 1.1 }}>
          Good to have you back.<br />
          <span style={{ color: "#00FF94" }}>Let's get you hired.</span>
        </h1>
        <p style={{ marginTop: 12, fontSize: 14, color: "rgba(232,228,220,0.55)", lineHeight: 1.7 }}>
          Pick up where you left off or start a new session below.
        </p>
      </div>

      {/* Stats row */}
      <div className="fade-2" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 2, marginBottom: 40 }}>
        {STATS.map(s => (
          <div key={s.label} className="stat-card">
            <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 28, fontWeight: 700, color: s.accent, lineHeight: 1 }}>{s.value}</div>
            <div style={{ fontSize: 13, fontWeight: 600, color: "#E8E4DC", marginTop: 8 }}>{s.label}</div>
            <div style={{ fontSize: 11, color: "rgba(232,228,220,0.4)", marginTop: 4 }}>{s.sub}</div>
          </div>
        ))}
      </div>

      {/* Tools grid */}
      <div className="fade-3" style={{ marginBottom: 12 }}>
        <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 10, letterSpacing: "0.14em", color: "rgba(232,228,220,0.35)", textTransform: "uppercase", marginBottom: 16 }}>
          Tools
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 2 }}>
          {TOOLS.map(t => (
            <Link
              key={t.href}
              href={t.href}
              className="tool-card"
              style={{ "--accent": t.accent } as React.CSSProperties}
            >
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 16 }}>
                <span style={{ fontSize: 28 }}>{t.icon}</span>
                <span style={{
                  fontFamily: "'Space Mono', monospace", fontSize: 9,
                  letterSpacing: "0.12em", textTransform: "uppercase",
                  color: t.accent, background: t.accent + "15",
                  border: `1px solid ${t.accent}30`, padding: "3px 8px",
                }}>{t.tag}</span>
              </div>
              <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 8, color: "#E8E4DC" }}>{t.label}</div>
              <div style={{ fontSize: 13, color: "rgba(232,228,220,0.55)", lineHeight: 1.7 }}>{t.desc}</div>
              <div style={{ marginTop: 20, fontSize: 12, color: t.accent, fontFamily: "'Space Mono', monospace", display: "flex", alignItems: "center", gap: 6 }}>
                Open → 
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Tip bar */}
      <div className="fade-4" style={{
        marginTop: 32, padding: "16px 20px",
        background: "rgba(0,255,148,0.04)", border: "1px solid rgba(0,255,148,0.12)",
        display: "flex", alignItems: "center", gap: 12,
      }}>
        <span style={{ color: "#00FF94", fontSize: 14 }}>💡</span>
        <p style={{ fontSize: 13, color: "rgba(232,228,220,0.6)", lineHeight: 1.6 }}>
          <span style={{ color: "#E8E4DC", fontWeight: 600 }}>Start with the Resume Analyzer.</span>{" "}
          Upload your resume + a job description you want. Fix what it finds. Then practice those gaps in the Mock Interview.
        </p>
      </div>
    </div>
  );
}
