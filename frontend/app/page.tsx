"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const FEATURES = [
  { icon: "📄", tag: "ATS Intelligence", title: "Resume Analyzer", desc: "Upload your resume + JD. Get ATS match score, missing keywords, weak bullet points, and exact rewrites — in seconds.", accent: "#00FF94", stat: "89% of resumes fail ATS filters" },
  { icon: "🎤", tag: "Adaptive AI", title: "Mock Interview", desc: "5-round adaptive interviews for SWE, ML, DSA, and HR. Every answer scored. Voice input supported.", accent: "#FFD166", stat: "Practice makes permanent" },
  { icon: "📚", tag: "RAG-Powered", title: "Knowledge Assistant", desc: "Upload your DBMS notes, OS PDFs, interview experiences. Ask anything. AI answers from your own materials.", accent: "#FF6B6B", stat: "Your notes, supercharged" },
  { icon: "🗺️", tag: "Personalized", title: "Learning Roadmap", desc: "Tell us your goal and timeline. Get a week-by-week plan with resources, projects, and milestones.", accent: "#A78BFA", stat: "Structure beats motivation" },
];

const TESTIMONIALS = [
  { text: "Uploaded my resume, pasted the Flipkart JD, got 61/100. Found 8 missing keywords. Fixed them, reapplied, got the interview.", name: "Arjun S.", role: "CS, IIT Bombay → Flipkart Intern" },
  { text: "The mock interview caught that I kept saying 'basically' in written answers. My communication score jumped next round.", name: "Priya M.", role: "ECE, BITS Pilani → ML Intern" },
  { text: "Uploaded 3 months of DBMS notes as PDFs. Asked it to explain normalization like I'm 10. Actually worked.", name: "Rohit K.", role: "MCA, NIT Trichy → SWE Intern" },
];

const RocketLogo = ({ size = 32 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 40 40" fill="none">
    <style>{`
      @keyframes rocketFloat {
        0%,100%{transform:translateY(0)} 50%{transform:translateY(-2px)}
      }
      @keyframes flamePulse {
        0%,100%{opacity:0.9;transform:scaleY(1)} 50%{opacity:0.5;transform:scaleY(0.7)}
      }
      .rocket-body { animation: rocketFloat 3s ease-in-out infinite; transform-origin: 20px 20px; }
      .flame { animation: flamePulse 0.5s ease-in-out infinite; transform-origin: 20px 28px; }
    `}</style>
    <g className="rocket-body" transform="rotate(-45, 20, 20)">
      {/* Body */}
      <path d="M20 6 C14 6 10 12 10 18 L10 26 L20 30 L30 26 L30 18 C30 12 26 6 20 6Z" fill="#00FF94" opacity="0.95"/>
      {/* Nose */}
      <path d="M20 4 L16 10 L24 10 Z" fill="#00FF94"/>
      {/* Window */}
      <circle cx="20" cy="17" r="3.5" fill="#080C0A" opacity="0.7"/>
      <circle cx="20" cy="17" r="2" fill="#00FF94" opacity="0.3"/>
      {/* Left fin */}
      <path d="M10 22 L6 30 L10 28 Z" fill="#00FF94" opacity="0.7"/>
      {/* Right fin */}
      <path d="M30 22 L34 30 L30 28 Z" fill="#00FF94" opacity="0.7"/>
    </g>
    {/* Flame */}
    <g className="flame" transform="rotate(-45, 20, 20)">
      <path d="M17 30 L20 37 L23 30 Z" fill="#FFD166" opacity="0.9"/>
      <path d="M18.5 30 L20 34 L21.5 30 Z" fill="#fff" opacity="0.6"/>
    </g>
  </svg>
);

export default function Home() {
  const [scrolled, setScrolled] = useState(false);
  const [activeFeature, setActiveFeature] = useState(0);
  const [activeTestimonial, setActiveTestimonial] = useState(0);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const router = useRouter();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const onMouse = (e: MouseEvent) => setMousePos({ x: e.clientX, y: e.clientY });
    window.addEventListener("mousemove", onMouse);
    return () => window.removeEventListener("mousemove", onMouse);
  }, []);

  useEffect(() => {
    const t = setInterval(() => setActiveFeature(p => (p + 1) % FEATURES.length), 3500);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    const t = setInterval(() => setActiveTestimonial(p => (p + 1) % TESTIMONIALS.length), 4000);
    return () => clearInterval(t);
  }, []);

  return (
    <main style={{ background: "#080C0A", color: "#E8E4DC", fontFamily: "'Sora', sans-serif", overflowX: "hidden" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;600;700;800&family=Space+Mono:wght@400;700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 3px; }
        ::-webkit-scrollbar-track { background: #080C0A; }
        ::-webkit-scrollbar-thumb { background: #00FF94; border-radius: 2px; }

        .btn-primary {
          background: #00FF94; color: #080C0A; border: none; padding: 15px 36px;
          font-family: 'Space Mono', monospace; font-size: 13px; font-weight: 700;
          letter-spacing: 0.06em; cursor: pointer; transition: all 0.2s;
          text-transform: uppercase; display: inline-flex; align-items: center; gap: 8px;
        }
        .btn-primary:hover { background: #E8E4DC; transform: translateY(-2px); box-shadow: 0 12px 40px rgba(0,255,148,0.25); }

        .btn-ghost {
          background: transparent; color: #E8E4DC;
          border: 1px solid rgba(255,255,255,0.18); padding: 15px 36px;
          font-family: 'Space Mono', monospace; font-size: 13px;
          cursor: pointer; transition: all 0.2s; text-transform: uppercase; letter-spacing: 0.06em;
          display: inline-flex; align-items: center; gap: 8px;
        }
        .btn-ghost:hover { border-color: rgba(255,255,255,0.45); color: #fff; }

        .tag {
          font-family: 'Space Mono', monospace; font-size: 10px;
          letter-spacing: 0.14em; text-transform: uppercase; padding: 5px 12px;
          border: 1px solid; display: inline-block; margin-bottom: 16px;
        }

        .feature-card {
          padding: 32px; cursor: pointer; transition: all 0.35s;
          position: relative; overflow: hidden; background: #0D1210;
          border: 1px solid #1A2320;
        }
        .feature-card.active { background: #111915; border-color: #243028; }
        .feature-card::after {
          content: ''; position: absolute; bottom: 0; left: 0; right: 0; height: 2px;
          background: var(--accent); transform: scaleX(0); transform-origin: left;
          transition: transform 0.4s ease;
        }
        .feature-card.active::after { transform: scaleX(1); }

        .testimonial-card {
          background: #0D1210; border: 1px solid #1A2320;
          padding: 32px; transition: all 0.5s; opacity: 0.38; transform: scale(0.97);
          cursor: pointer;
        }
        .testimonial-card.active { opacity: 1; transform: scale(1); border-color: #2A3830; }

        @keyframes fadeUp { from{opacity:0;transform:translateY(28px)} to{opacity:1;transform:translateY(0)} }
        @keyframes scroll-x { from{transform:translateX(0)} to{transform:translateX(-50%)} }
        @keyframes glowPulse { 0%,100%{opacity:0.06} 50%{opacity:0.12} }

        .anim-1 { animation: fadeUp 0.7s 0.1s both; }
        .anim-2 { animation: fadeUp 0.7s 0.2s both; }
        .anim-3 { animation: fadeUp 0.7s 0.35s both; }
        .anim-4 { animation: fadeUp 0.7s 0.5s both; }
        .anim-5 { animation: fadeUp 0.7s 0.65s both; }

        .marquee-inner { display: inline-flex; animation: scroll-x 30s linear infinite; }
        .marquee-inner:hover { animation-play-state: paused; }
        .divider { width: 100%; height: 1px; background: #1A2320; }

        a { color: inherit; text-decoration: none; }
        .nav-link { color: rgba(232,228,220,0.45); font-size: 12px; letter-spacing: 0.1em; text-transform: uppercase; transition: color 0.2s; }
        .nav-link:hover { color: #E8E4DC; }

        .mockup-card {
          background: #0D1210; border: 1px solid #1A2320;
          border-radius: 4px; overflow: hidden;
          box-shadow: 0 32px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(0,255,148,0.05);
        }
        .mockup-bar {
          background: #0A0F0D; border-bottom: 1px solid #1A2320;
          padding: 10px 16px; display: flex; align-items: center; gap: 6px;
        }
        .mockup-dot { width: 8px; height: 8px; border-radius: 50%; }

        .cursor-glow {
          position: fixed; pointer-events: none; z-index: 9999;
          width: 300px; height: 300px; border-radius: 50%;
          background: radial-gradient(circle, rgba(0,255,148,0.06) 0%, transparent 70%);
          transform: translate(-50%, -50%);
          transition: left 0.1s ease, top 0.1s ease;
        }
      `}</style>

      {/* Cursor glow */}
      <div className="cursor-glow" style={{ left: mousePos.x, top: mousePos.y }} />

      {/* NAV */}
      <nav style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
        padding: "0 48px", height: 64,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        background: scrolled ? "rgba(8,12,10,0.92)" : "transparent",
        backdropFilter: scrolled ? "blur(16px)" : "none",
        borderBottom: scrolled ? "1px solid #1A2320" : "none",
        transition: "all 0.4s",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }} onClick={() => router.push("/")}>
          <RocketLogo size={28} />
          <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 13, fontWeight: 700, letterSpacing: "0.08em", color: "#E8E4DC" }}>
            LAUNCHPAD
          </span>
        </div>
        <div style={{ display: "flex", gap: 48 }}>
          {["Features", "How It Works", "Reviews"].map(l => (
            <a key={l} href={`#${l.toLowerCase().replace(/\s/g, "-")}`} className="nav-link">{l}</a>
          ))}
        </div>
        <button className="btn-primary" style={{ padding: "10px 22px", fontSize: 11 }} onClick={() => router.push("/dashboard")}>
          Launch App →
        </button>
      </nav>

      {/* HERO */}
      <section style={{
        minHeight: "100vh", display: "flex", alignItems: "center",
        padding: "120px 48px 80px", position: "relative",
        background: "radial-gradient(ellipse 70% 60% at 20% 50%, rgba(0,255,148,0.07) 0%, transparent 60%)",
      }}>
        <div style={{
          position: "absolute", inset: 0, pointerEvents: "none",
          backgroundImage: "linear-gradient(rgba(0,255,148,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(0,255,148,0.025) 1px, transparent 1px)",
          backgroundSize: "64px 64px",
        }} />

        <div style={{ maxWidth: 1200, margin: "0 auto", width: "100%", position: "relative", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 80, alignItems: "center" }}>
          {/* Left */}
          <div>
            <div className="anim-1" style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
              <RocketLogo size={40} />
              <span className="tag" style={{ borderColor: "rgba(0,255,148,0.35)", color: "#00FF94", marginBottom: 0 }}>
                Built for students chasing placements
              </span>
            </div>

            <h1 className="anim-2" style={{
              fontSize: "clamp(44px, 6vw, 80px)", fontWeight: 800,
              lineHeight: 0.95, letterSpacing: "-0.035em",
            }}>
              Your resume<br />
              is{" "}
              <span style={{ color: "transparent", WebkitTextStroke: "2px #00FF94" }}>losing</span>
              <br />
              <span style={{ color: "#00FF94" }}>before</span> you apply
            </h1>

            <p className="anim-3" style={{
              marginTop: 32, maxWidth: 460, fontSize: 17, lineHeight: 1.8,
              color: "rgba(232,228,220,0.72)", fontWeight: 300,
            }}>
              Most resumes fail ATS filters before a human ever reads them.
              Launchpad finds every gap — and helps you fix it before it costs you the offer.
            </p>

            <div className="anim-4" style={{ display: "flex", gap: 12, marginTop: 40, flexWrap: "wrap" }}>
              <button className="btn-primary" onClick={() => router.push("/dashboard")}>Launch App →</button>
              <button className="btn-ghost" onClick={() => document.getElementById("how-it-works")?.scrollIntoView({ behavior: "smooth" })}>
                See How It Works
              </button>
            </div>

            <div className="anim-5" style={{
              display: "flex", gap: 40, marginTop: 56,
              paddingTop: 36, borderTop: "1px solid #1A2320", flexWrap: "wrap",
            }}>
              {[
                { num: "89%", label: "Resumes rejected by ATS" },
                { num: "3×", label: "More interviews after optimization" },
                { num: "Free", label: "No credit card required" },
              ].map(s => (
                <div key={s.label}>
                  <div style={{ fontFamily: "'Space Mono', monospace", fontSize: "clamp(24px,3vw,36px)", fontWeight: 700, color: "#00FF94", lineHeight: 1 }}>{s.num}</div>
                  <div style={{ fontSize: 12, color: "rgba(232,228,220,0.55)", marginTop: 5, lineHeight: 1.5 }}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Right — Product mockup */}
          <div className="anim-3" style={{ position: "relative" }}>
            {/* Glow behind mockup */}
            <div style={{
              position: "absolute", inset: -40, borderRadius: "50%",
              background: "radial-gradient(ellipse at center, rgba(0,255,148,0.1) 0%, transparent 70%)",
              animation: "glowPulse 3s ease-in-out infinite",
              pointerEvents: "none",
            }} />

            <div className="mockup-card" style={{ transform: "perspective(1000px) rotateY(-5deg) rotateX(2deg)" }}>
              <div className="mockup-bar">
                <div className="mockup-dot" style={{ background: "#FF6B6B" }} />
                <div className="mockup-dot" style={{ background: "#FFD166" }} />
                <div className="mockup-dot" style={{ background: "#00FF94" }} />
                <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 10, color: "rgba(232,228,220,0.3)", marginLeft: 8, letterSpacing: "0.06em" }}>launchpad.app/dashboard/resume</span>
              </div>
              <div style={{ padding: 24 }}>
                {/* Fake score ring */}
                <div style={{ display: "flex", gap: 16, alignItems: "center", marginBottom: 20 }}>
                  <div style={{ position: "relative", width: 80, height: 80, flexShrink: 0 }}>
                    <svg width="80" height="80" viewBox="0 0 80 80">
                      <circle cx="40" cy="40" r="32" fill="none" stroke="#1A2320" strokeWidth="6"/>
                      <circle cx="40" cy="40" r="32" fill="none" stroke="#00FF94" strokeWidth="6"
                        strokeLinecap="round" strokeDasharray="201" strokeDashoffset="50"
                        transform="rotate(-90 40 40)"/>
                    </svg>
                    <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                      <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 18, fontWeight: 700, color: "#00FF94" }}>76</span>
                      <span style={{ fontSize: 9, color: "rgba(232,228,220,0.4)" }}>/100</span>
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: "#E8E4DC", marginBottom: 4 }}>ATS Match Score</div>
                    <div style={{ fontSize: 11, color: "rgba(232,228,220,0.5)", lineHeight: 1.6 }}>Strong match — 3 keywords missing,<br/>2 sections need improvement</div>
                  </div>
                </div>
                {/* Fake chips */}
                <div style={{ marginBottom: 14 }}>
                  <div style={{ fontSize: 10, fontFamily: "'Space Mono', monospace", color: "#00FF94", letterSpacing: "0.1em", marginBottom: 8 }}>✓ STRONG POINTS</div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                    {["React.js", "Python", "REST APIs", "Git"].map(k => (
                      <span key={k} style={{ padding: "3px 10px", background: "rgba(0,255,148,0.08)", border: "1px solid rgba(0,255,148,0.2)", borderRadius: "100px", fontSize: 11, color: "#00FF94" }}>{k}</span>
                    ))}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: 10, fontFamily: "'Space Mono', monospace", color: "#FF6B6B", letterSpacing: "0.1em", marginBottom: 8 }}>✗ MISSING KEYWORDS</div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                    {["TypeScript", "Docker", "SQL"].map(k => (
                      <span key={k} style={{ padding: "3px 10px", background: "rgba(255,107,107,0.08)", border: "1px solid rgba(255,107,107,0.2)", borderRadius: "100px", fontSize: 11, color: "#FF6B6B" }}>{k}</span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Floating badge */}
            <div style={{
              position: "absolute", bottom: -16, right: -16,
              background: "#0D1210", border: "1px solid rgba(255,209,102,0.3)",
              padding: "10px 16px", borderRadius: 4,
              display: "flex", alignItems: "center", gap: 8,
              boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
            }}>
              <span style={{ fontSize: 16 }}>🎤</span>
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, color: "#FFD166" }}>Interview Score</div>
                <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 13, color: "#E8E4DC" }}>8.4 / 10</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* MARQUEE */}
      <div style={{ overflow: "hidden", borderTop: "1px solid #1A2320", borderBottom: "1px solid #1A2320", padding: "14px 0", background: "#0A0F0D" }}>
        <div className="marquee-inner">
          {[...Array(2)].flatMap((_, ai) =>
            ["Resume Analysis", "ATS Scoring", "Mock Interviews", "Voice Input", "RAG Knowledge Base", "Learning Roadmaps", "Groq LLaMA 3.3", "LangChain", "ChromaDB", "FastAPI", "Next.js"].map((item, i) => (
              <span key={`${ai}-${i}`} style={{ display: "inline-block", margin: "0 36px", fontFamily: "'Space Mono', monospace", fontSize: 11, letterSpacing: "0.12em", color: "rgba(232,228,220,0.28)", textTransform: "uppercase" }}>
                <span style={{ color: "#00FF94", marginRight: 10 }}>✦</span>{item}
              </span>
            ))
          )}
        </div>
      </div>

      {/* FEATURES */}
      <section id="features" style={{ padding: "120px 48px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ marginBottom: 56 }}>
            <span className="tag" style={{ borderColor: "#1A2320", color: "rgba(232,228,220,0.4)" }}>What it does</span>
            <h2 style={{ fontSize: "clamp(32px,5vw,54px)", fontWeight: 800, lineHeight: 1.08, letterSpacing: "-0.025em" }}>
              Four tools.<br />
              <span style={{ color: "rgba(232,228,220,0.28)" }}>One mission: get you hired.</span>
            </h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 2 }}>
            {FEATURES.map((f, i) => (
              <div key={f.title} className={`feature-card ${activeFeature === i ? "active" : ""}`}
                style={{ "--accent": f.accent } as React.CSSProperties}
                onMouseEnter={() => setActiveFeature(i)}
                onClick={() => router.push("/dashboard")}
              >
                <span className="tag" style={{ borderColor: f.accent + "33", color: activeFeature === i ? f.accent : "rgba(232,228,220,0.35)", transition: "color 0.3s", marginBottom: 12 }}>{f.tag}</span>
                <div style={{ fontSize: 28, margin: "4px 0 14px" }}>{f.icon}</div>
                <h3 style={{ fontSize: 19, fontWeight: 700, marginBottom: 10, color: "#E8E4DC" }}>{f.title}</h3>
                <p style={{ fontSize: 13, color: "rgba(232,228,220,0.6)", lineHeight: 1.78 }}>{f.desc}</p>
                <div style={{ marginTop: 20, paddingTop: 16, borderTop: "1px solid #1A2320", fontFamily: "'Space Mono', monospace", fontSize: 10, color: f.accent, opacity: activeFeature === i ? 0.85 : 0.25, transition: "opacity 0.3s" }}>{f.stat}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="divider" />

      {/* HOW IT WORKS */}
      <section id="how-it-works" style={{ padding: "120px 48px", background: "#0A0F0D" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ marginBottom: 64 }}>
            <span className="tag" style={{ borderColor: "#1A2320", color: "rgba(232,228,220,0.4)" }}>Process</span>
            <h2 style={{ fontSize: "clamp(32px,5vw,54px)", fontWeight: 800, lineHeight: 1.08, letterSpacing: "-0.025em" }}>
              Resume to offer.<br />
              <span style={{ color: "rgba(232,228,220,0.28)" }}>Here's how.</span>
            </h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 48 }}>
            {[
              { num: "01", title: "Upload your resume", desc: "Drop your PDF. We extract and parse every line — projects, skills, experience, everything." },
              { num: "02", title: "Paste the job description", desc: "Give us the JD. We cross-reference every keyword, skill, and requirement against your resume." },
              { num: "03", title: "Get your gap report", desc: "ATS score, missing keywords, weak sections, and exact rewrites. Not vague advice — specific fixes." },
              { num: "04", title: "Practice and close gaps", desc: "Use mock interviews and the RAG knowledge assistant to actually fix what's missing." },
            ].map((s) => (
              <div key={s.num}>
                <div style={{ width: 42, height: 42, border: "1px solid #00FF94", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Space Mono', monospace", fontSize: 11, color: "#00FF94", marginBottom: 24 }}>{s.num}</div>
                <h3 style={{ fontSize: 17, fontWeight: 700, marginBottom: 10, color: "#E8E4DC" }}>{s.title}</h3>
                <p style={{ fontSize: 14, color: "rgba(232,228,220,0.55)", lineHeight: 1.78 }}>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="divider" />

      {/* TESTIMONIALS */}
      <section id="reviews" style={{ padding: "120px 48px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ marginBottom: 56 }}>
            <span className="tag" style={{ borderColor: "#1A2320", color: "rgba(232,228,220,0.4)" }}>From students</span>
            <h2 style={{ fontSize: "clamp(32px,5vw,54px)", fontWeight: 800, lineHeight: 1.08, letterSpacing: "-0.025em" }}>
              Real results.<br />
              <span style={{ color: "rgba(232,228,220,0.28)" }}>Not marketing copy.</span>
            </h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 2 }}>
            {TESTIMONIALS.map((t, i) => (
              <div key={t.name} className={`testimonial-card ${activeTestimonial === i ? "active" : ""}`} onMouseEnter={() => setActiveTestimonial(i)}>
                <div style={{ fontSize: 28, color: "#00FF94", fontFamily: "'Space Mono', monospace", lineHeight: 1, marginBottom: 18, opacity: 0.4 }}>"</div>
                <p style={{ fontSize: 14, color: "rgba(232,228,220,0.78)", lineHeight: 1.82, marginBottom: 24 }}>{t.text}</p>
                <div style={{ borderTop: "1px solid #1A2320", paddingTop: 18 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "#E8E4DC" }}>{t.name}</div>
                  <div style={{ fontSize: 11, color: "rgba(232,228,220,0.4)", marginTop: 3, fontFamily: "'Space Mono', monospace" }}>{t.role}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="divider" />

      {/* CTA */}
      <section style={{ padding: "120px 48px", textAlign: "center", background: "radial-gradient(ellipse 60% 100% at 50% 100%, rgba(0,255,148,0.06) 0%, transparent 70%)" }}>
        <div style={{ maxWidth: 620, margin: "0 auto" }}>
          <div style={{ display: "flex", justifyContent: "center", marginBottom: 24 }}>
            <RocketLogo size={56} />
          </div>
          <h2 style={{ fontSize: "clamp(36px,6vw,68px)", fontWeight: 800, lineHeight: 1.0, letterSpacing: "-0.03em", margin: "0 0 20px" }}>
            Your resume has gaps.<br />
            <span style={{ color: "#00FF94" }}>Find them now.</span>
          </h2>
          <p style={{ color: "rgba(232,228,220,0.6)", fontSize: 16, lineHeight: 1.78, marginBottom: 40 }}>
            Upload your resume, paste a job description, and see exactly why you're not getting callbacks — in under 60 seconds.
          </p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <button className="btn-primary" style={{ fontSize: 14, padding: "18px 44px" }} onClick={() => router.push("/dashboard")}>
              Launch Launchpad →
            </button>
            <button className="btn-ghost" style={{ fontSize: 14, padding: "18px 44px" }} onClick={() => router.push("/dashboard/interview")}>
              Start Mock Interview
            </button>
          </div>
          <p style={{ marginTop: 20, fontSize: 11, color: "rgba(232,228,220,0.25)", fontFamily: "'Space Mono', monospace" }}>
            No signup required · Groq + LangChain + ChromaDB + FastAPI
          </p>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ borderTop: "1px solid #1A2320", padding: "28px 48px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12, background: "#0A0F0D" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <RocketLogo size={20} />
          <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 11, color: "rgba(232,228,220,0.3)", letterSpacing: "0.08em" }}>LAUNCHPAD</span>
        </div>
        <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 11, color: "rgba(232,228,220,0.18)" }}>
          Made by a student, for students chasing placements.
        </span>
      </footer>
    </main>
  );
}
