"use client";
import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: "⬡" },
  { href: "/dashboard/resume", label: "Resume Analyzer", icon: "📄" },
  { href: "/dashboard/interview", label: "Mock Interview", icon: "🎤" },
  { href: "/dashboard/assistant", label: "AI Assistant", icon: "📚" },
  { href: "/dashboard/roadmap", label: "Roadmap", icon: "🗺️" },
];

const RocketIcon = () => (
  <svg width="18" height="18" viewBox="0 0 40 40" fill="none">
    <style>{`
      @keyframes rocketFloat2{0%,100%{transform:translateY(0)}50%{transform:translateY(-1px)}}
      .ri{animation:rocketFloat2 3s ease-in-out infinite;transform-origin:20px 20px;}
    `}</style>
    <g className="ri" transform="rotate(-45,20,20)">
      <path d="M20 6 C14 6 10 12 10 18 L10 26 L20 30 L30 26 L30 18 C30 12 26 6 20 6Z" fill="#00FF94" opacity="0.95"/>
      <path d="M20 4 L16 10 L24 10 Z" fill="#00FF94"/>
      <circle cx="20" cy="17" r="3.5" fill="#080C0A" opacity="0.7"/>
      <path d="M10 22 L6 30 L10 28 Z" fill="#00FF94" opacity="0.7"/>
      <path d="M30 22 L34 30 L30 28 Z" fill="#00FF94" opacity="0.7"/>
    </g>
    <path d="M17 30 L20 37 L23 30 Z" fill="#FFD166" opacity="0.9" transform="rotate(-45,20,20)"/>
  </svg>
);

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div style={{ display: "flex", minHeight: "100vh",background: "transparent", color: "#E8E4DC", fontFamily: "'Sora', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;600;700;800&family=Space+Mono:wght@400;700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 3px; }
        ::-webkit-scrollbar-track { background: #080C0A; }
        ::-webkit-scrollbar-thumb { background: #00FF94; border-radius: 2px; }

        .nav-item {
          display: flex; align-items: center; gap: 12px;
          padding: 10px 14px; border-radius: 4px;
          text-decoration: none; color: rgba(232,228,220,0.4);
          font-size: 13px; font-weight: 500;
          transition: all 0.2s; cursor: pointer; white-space: nowrap;
          border: 1px solid transparent;
        }
        .nav-item:hover { color: #E8E4DC; background: rgba(0,255,148,0.05); border-color: rgba(0,255,148,0.08); }
        .nav-item.active { color: #00FF94; background: rgba(0,255,148,0.08); border-color: rgba(0,255,148,0.18); }
        .nav-icon { font-size: 15px; flex-shrink: 0; width: 20px; text-align: center; }

        .collapse-btn {
          background: transparent; border: 1px solid #1A2320;
          color: rgba(232,228,220,0.35); cursor: pointer;
          width: 26px; height: 26px; display: flex; align-items: center;
          justify-content: center; border-radius: 4px; font-size: 11px;
          transition: all 0.2s; flex-shrink: 0;
        }
        .collapse-btn:hover { border-color: #00FF94; color: #00FF94; }
      `}</style>

      {/* SIDEBAR */}
      <aside style={{
        width: collapsed ? 60 : 232,
        minHeight: "100vh", background: "#0A0F0D",
        borderRight: "1px solid #1A2320",
        display: "flex", flexDirection: "column",
        transition: "width 0.3s ease",
        position: "fixed", top: 0, left: 0, zIndex: 50,
        overflow: "hidden",
      }}>
        {/* Logo */}
        <div style={{ padding: "18px 14px", borderBottom: "1px solid #1A2320", display: "flex", alignItems: "center", justifyContent: collapsed ? "center" : "space-between", gap: 8 }}>
          {!collapsed && (
            <Link href="/" style={{ display: "flex", alignItems: "center", gap: 8, textDecoration: "none" }}>
              <RocketIcon />
              <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 12, fontWeight: 700, letterSpacing: "0.08em", color: "#E8E4DC" }}>LAUNCHPAD</span>
            </Link>
          )}
          {collapsed && <Link href="/"><RocketIcon /></Link>}
          <button className="collapse-btn" onClick={() => setCollapsed(!collapsed)}>{collapsed ? "→" : "←"}</button>
        </div>

        {/* Nav */}
        <nav style={{ padding: "10px 8px", flex: 1, display: "flex", flexDirection: "column", gap: 2 }}>
          {NAV_ITEMS.map(item => (
            <Link key={item.href} href={item.href}
              className={`nav-item ${pathname === item.href ? "active" : ""}`}
              style={{ justifyContent: collapsed ? "center" : "flex-start" }}
              title={collapsed ? item.label : undefined}
            >
              <span className="nav-icon">{item.icon}</span>
              {!collapsed && <span>{item.label}</span>}
            </Link>
          ))}
        </nav>

        {/* User */}
        <div style={{ padding: "14px", borderTop: "1px solid #1A2320", display: "flex", alignItems: "center", gap: 10, justifyContent: collapsed ? "center" : "flex-start" }}>
          <div style={{ width: 28, height: 28, borderRadius: "50%", background: "linear-gradient(135deg,#00FF94,#00CC75)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, color: "#080C0A", flexShrink: 0 }}>U</div>
          {!collapsed && (
            <div>
              <div style={{ fontSize: 12, fontWeight: 600, color: "#E8E4DC" }}>User</div>
              <div style={{ fontSize: 10, color: "rgba(232,228,220,0.35)", fontFamily: "'Space Mono', monospace" }}>Free plan</div>
            </div>
          )}
        </div>
      </aside>

      {/* MAIN */}
      <main style={{ marginLeft: collapsed ? 60 : 232, flex: 1, minHeight: "100vh", transition: "margin-left 0.3s ease", display: "flex", flexDirection: "column" }}>
        {/* Topbar */}
        <header style={{ height: 58, borderBottom: "1px solid #1A2320", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 28px", background: "transparent", position: "sticky", top: 0, zIndex: 40 }}>
          <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 11, color: "rgba(232,228,220,0.28)", letterSpacing: "0.08em" }}>
            {NAV_ITEMS.find(n => n.href === pathname)?.label?.toUpperCase() || "DASHBOARD"}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 10, color: "#00FF94", background: "rgba(0,255,148,0.08)", border: "1px solid rgba(0,255,148,0.18)", padding: "4px 10px", letterSpacing: "0.08em" }}>
              ● LIVE
            </div>
            <Link href="/" style={{ fontFamily: "'Space Mono', monospace", fontSize: 10, color: "rgba(232,228,220,0.3)", letterSpacing: "0.06em", textDecoration: "none", transition: "color 0.2s" }}>
              ← Home
            </Link>
          </div>
        </header>

        <div style={{ flex: 1, padding: "28px" }}>
          {children}
        </div>
      </main>
    </div>
  );
}
