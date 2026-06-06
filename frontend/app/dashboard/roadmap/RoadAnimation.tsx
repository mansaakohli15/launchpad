"use client";
import { useEffect, useRef, useState } from "react";

type WeekPlan = { week: string; focus: string; tasks: string[] };

export function RoadAnimation({ plan, onSelect, active }: {
  plan: WeekPlan[];
  onSelect: (i: number) => void;
  active: number;
}) {
  const [progress, setProgress] = useState(0);
  const animRef = useRef<number | null>(null);

  useEffect(() => {
    setProgress(0);
    let start: number;
    const animate = (ts: number) => {
      if (!start) start = ts;
      const p = Math.min((ts - start) / 2000, 1);
      setProgress(p);
      if (p < 1) animRef.current = requestAnimationFrame(animate);
    };
    animRef.current = requestAnimationFrame(animate);
    return () => { if (animRef.current) cancelAnimationFrame(animRef.current); };
  }, [plan]);

  const W = 720;
  const TOP_LABEL = 60;        // space above top nodes
  const NODE_TOP = TOP_LABEL + 16;
  const NODE_BOT = NODE_TOP + 110; // 110px gap between rows
  const BOT_LABEL = 60;        // space below bottom nodes
  const SVG_H = NODE_BOT + BOT_LABEL + 8;

  const pts = plan.map((_, i) => ({
    x: 60 + (i / Math.max(plan.length - 1, 1)) * (W - 120),
    y: i % 2 === 0 ? NODE_TOP : NODE_BOT,
  }));

  const buildPath = () => {
    if (pts.length < 2) return pts.length === 1 ? `M ${pts[0].x} ${pts[0].y}` : "";
    let d = `M ${pts[0].x} ${pts[0].y}`;
    for (let i = 1; i < pts.length; i++) {
      const p = pts[i - 1], c = pts[i];
      const mx = (p.x + c.x) / 2;
      d += ` C ${mx} ${p.y} ${mx} ${c.y} ${c.x} ${c.y}`;
    }
    return d;
  };

  const pathStr = buildPath();
  const totalLen = (W - 120) * 1.15;
  const drawnLen = totalLen * progress;

  return (
    <div style={{ width: "100%", overflowX: "auto", padding: "4px 0" }}>
      <svg width="100%" viewBox={`0 0 ${W} ${SVG_H}`}
        style={{ minWidth: 420, display: "block" }}>

        {/* Road layers */}
        <path d={pathStr} fill="none" stroke="#040605" strokeWidth="30" strokeLinecap="round"/>
        <path d={pathStr} fill="none" stroke="#1A2320" strokeWidth="24" strokeLinecap="round"/>
        <path d={pathStr} fill="none" stroke="#111815" strokeWidth="20" strokeLinecap="round"/>
        {/* Center dashes */}
        <path d={pathStr} fill="none" stroke="#243028" strokeWidth="1.5"
          strokeLinecap="round" strokeDasharray="16 13"/>

        {/* Progress glow */}
        <path d={pathStr} fill="none" stroke="rgba(0,255,148,0.12)" strokeWidth="22"
          strokeLinecap="round"
          strokeDasharray={`${drawnLen} ${totalLen + 200}`}/>
        {/* Progress line */}
        <path d={pathStr} fill="none" stroke="#00FF94" strokeWidth="2.5"
          strokeLinecap="round" opacity="0.85"
          strokeDasharray={`${drawnLen} ${totalLen + 200}`}/>

        {pts.map((p, i) => {
          const isActive = i === active;
          const isPassed = progress > 0.05 && i <= Math.round(progress * (plan.length - 1));
          const isTop = p.y === NODE_TOP;

          // Labels: top nodes → labels go UP, bottom nodes → labels go DOWN
          // Generous offsets so there's clear space between node and label
          const weekY    = isTop ? p.y - 32 : p.y + 36;
          const focusY   = isTop ? p.y - 14 : p.y + 54;

          const weekText  = plan[i].week.replace("Weeks", "W").replace("Week ", "W");
          const focusRaw  = plan[i].focus;
          const focusText = focusRaw.length > 14 ? focusRaw.slice(0, 14) + "…" : focusRaw;
          const focusW    = Math.max(focusText.length * 7.2, 56);

          return (
            <g key={i} style={{ cursor: "pointer" }} onClick={() => onSelect(i)}>

              {/* Active glow rings */}
              {isActive && (
                <>
                  <circle cx={p.x} cy={p.y} r={30}
                    fill="rgba(0,255,148,0.05)"
                    stroke="rgba(0,255,148,0.15)" strokeWidth="1"/>
                  <circle cx={p.x} cy={p.y} r={21}
                    fill="rgba(0,255,148,0.08)"
                    stroke="rgba(0,255,148,0.25)" strokeWidth="1.5"/>
                </>
              )}

              {/* Node */}
              <circle cx={p.x} cy={p.y} r={14}
                fill={isActive ? "#00FF94" : isPassed ? "#0E2018" : "#0D1210"}
                stroke={isActive ? "#00FF94" : isPassed ? "#00FF9450" : "#243028"}
                strokeWidth={isActive ? 2.5 : 1.5}/>

              {/* Node content */}
              {isActive
                ? <text x={p.x} y={p.y + 1} textAnchor="middle"
                    dominantBaseline="middle" fontSize="13">🚀</text>
                : <text x={p.x} y={p.y} textAnchor="middle"
                    dominantBaseline="middle"
                    fill={isPassed ? "#00FF94" : "rgba(232,228,220,0.4)"}
                    fontSize="10" fontFamily="'Space Mono',monospace" fontWeight="700">
                    {i + 1}
                  </text>
              }

              {/* Connector line from node to week label */}
              <line
                x1={p.x} y1={isTop ? p.y - 15 : p.y + 15}
                x2={p.x} y2={isTop ? weekY + 10 : weekY - 10}
                stroke={isActive ? "rgba(0,255,148,0.3)" : "rgba(232,228,220,0.08)"}
                strokeWidth="1" strokeDasharray="3 3"
              />

              {/* Week pill */}
              <rect x={p.x - 22} y={weekY - 11} width={44} height={18} rx={4}
                fill={isActive ? "rgba(0,255,148,0.2)" : "#0C110E"}
                stroke={isActive ? "rgba(0,255,148,0.5)" : "#1E2C22"}
                strokeWidth="1"/>
              <text x={p.x} y={weekY} textAnchor="middle" dominantBaseline="middle"
                fill={isActive ? "#00FF94" : "rgba(232,228,220,0.7)"}
                fontSize="9" fontFamily="'Space Mono',monospace"
                fontWeight="700" letterSpacing="0.05em">
                {weekText}
              </text>

              {/* Focus label */}
              <rect x={p.x - focusW / 2} y={focusY - 10} width={focusW} height={16} rx={3}
                fill="#080C0A" stroke="#161E18" strokeWidth="1"/>
              <text x={p.x} y={focusY} textAnchor="middle" dominantBaseline="middle"
                fill={isActive ? "rgba(232,228,220,0.95)" : "rgba(232,228,220,0.45)"}
                fontSize="9" fontFamily="'Sora',sans-serif">
                {focusText}
              </text>

            </g>
          );
        })}
      </svg>
    </div>
  );
}
