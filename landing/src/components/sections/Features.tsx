"use client";

import React from "react";
import { useTheme } from "next-themes";

const hash = (n: number) => {
  const x = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};

/* ─── Matching Mesh Illustration ─── */

const MatchingIllustration = ({ isDark }: { isDark: boolean }) => {
  const gridStroke = isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.04)";
  const mutedText = isDark ? "rgba(255,255,255,0.3)" : "rgba(0,0,0,0.25)";

  const student = { x: 240, y: 115 };
  const tutors = [
    { x: 80, y: 48, initials: "SC", match: 98, color: "#3B82F6" },
    { x: 420, y: 40, initials: "EW", match: 94, color: "#8B5CF6" },
    { x: 60, y: 185, initials: "JM", match: 87, color: "#10B981" },
    { x: 400, y: 190, initials: "AR", match: 82, color: "#F59E0B" },
    { x: 460, y: 110, initials: "LK", match: 76, color: "#EF4444" },
  ];

  const secondaryNodes = [
    { x: 160, y: 35, r: 3 },
    { x: 340, y: 25, r: 2.5 },
    { x: 130, y: 130, r: 2.5 },
    { x: 360, y: 145, r: 3 },
    { x: 200, y: 200, r: 2 },
    { x: 310, y: 195, r: 2.5 },
    { x: 500, y: 60, r: 2 },
    { x: 30, y: 120, r: 2 },
  ];

  return (
    <svg viewBox="0 0 540 230" className="w-full h-full" preserveAspectRatio="xMidYMid meet">
      {Array.from({ length: 17 }, (_, i) => (
        <line key={`gh${i}`} x1="0" y1={i * 14} x2="540" y2={i * 14} stroke={gridStroke} strokeWidth="0.5" />
      ))}
      {Array.from({ length: 39 }, (_, i) => (
        <line key={`gv${i}`} x1={i * 14} y1="0" x2={i * 14} y2="230" stroke={gridStroke} strokeWidth="0.5" />
      ))}

      {secondaryNodes.map((n, i) => (
        <g key={`sec-${i}`}>
          <line
            x1={student.x} y1={student.y} x2={n.x} y2={n.y}
            stroke={isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.04)"}
            strokeWidth="0.5"
          />
          <circle cx={n.x} cy={n.y} r={n.r} fill={isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)"} />
        </g>
      ))}

      {tutors.map((t, i) => {
        const opacity = 0.12 + (t.match / 100) * 0.4;
        const midX = (student.x + t.x) / 2;
        const midY = (student.y + t.y) / 2;
        const offset = i % 2 === 0 ? -20 : 20;

        return (
          <g key={`conn-${i}`}>
            <path
              d={`M ${student.x} ${student.y} Q ${midX + offset} ${midY + offset}, ${t.x} ${t.y}`}
              fill="none"
              stroke={t.color}
              strokeWidth={t.match > 90 ? 1.5 : 0.8}
              opacity={opacity}
              strokeDasharray={t.match > 85 ? "none" : "3,3"}
            />
            {t.match > 85 && (
              <g>
                <rect
                  x={midX + offset / 2 - 18}
                  y={midY + offset / 2 - 9}
                  width="36" height="18" rx="9"
                  fill={isDark ? "#0B0D10" : "#F8FAFC"}
                  stroke={t.color}
                  strokeWidth="0.8"
                  opacity="0.9"
                />
                <text
                  x={midX + offset / 2}
                  y={midY + offset / 2 + 1}
                  textAnchor="middle" dominantBaseline="middle"
                  fontSize="8" fontWeight="600"
                  fill={t.color}
                >
                  {t.match}%
                </text>
              </g>
            )}
          </g>
        );
      })}

      {tutors.map((t, i) => (
        <g key={`tutor-${i}`}>
          <circle cx={t.x} cy={t.y} r="22" fill={`${t.color}${isDark ? "15" : "0c"}`} stroke={t.color} strokeWidth="1" opacity="0.8" />
          <text x={t.x} y={t.y - 2} textAnchor="middle" dominantBaseline="middle" fontSize="10" fontWeight="600" fill={t.color}>
            {t.initials}
          </text>
          <text x={t.x} y={t.y + 10} textAnchor="middle" fontSize="6" fill={mutedText}>
            Tutor
          </text>
        </g>
      ))}

      <circle cx={student.x} cy={student.y} r="42" fill="none" stroke="#FFA629" strokeWidth="0.5" opacity="0.2" strokeDasharray="3,3" />
      <circle cx={student.x} cy={student.y} r="30" fill={`#FFA629${isDark ? "18" : "10"}`} stroke="#FFA629" strokeWidth="1.5" />
      <text x={student.x} y={student.y - 4} textAnchor="middle" dominantBaseline="middle" fontSize="11" fontWeight="700" fill="#FFA629">YOU</text>
      <text x={student.x} y={student.y + 9} textAnchor="middle" fontSize="7" fill={mutedText}>Student</text>

      {Array.from({ length: 35 }, (_, i) => {
        const x = hash(i * 7 + 100) * 540;
        const y = hash(i * 11 + 200) * 230;
        const color = hash(i * 13) > 0.5 ? "#FFA629" : "#809FFF";
        return (
          <circle key={`dot-${i}`} cx={x} cy={y} r={0.6 + hash(i * 17) * 1.2} fill={color} opacity={0.08 + hash(i * 19) * 0.12} />
        );
      })}
    </svg>
  );
};

/* ─── Schedule Grid Illustration ─── */

const ScheduleIllustration = ({ isDark }: { isDark: boolean }) => {
  const gridStroke = isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)";
  const labelColor = isDark ? "rgba(255,255,255,0.28)" : "rgba(0,0,0,0.28)";

  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const hours = ["9am", "10", "11", "12p", "1", "2", "3", "4p"];

  const sessions = [
    { day: 0, start: 1, dur: 2, color: "#3B82F6", label: "Math" },
    { day: 2, start: 3, dur: 1, color: "#8B5CF6", label: "Chem" },
    { day: 3, start: 0, dur: 2, color: "#10B981", label: "Phys" },
    { day: 5, start: 2, dur: 3, color: "#FFA629", label: "Eng" },
    { day: 1, start: 5, dur: 2, color: "#F472B6", label: "Bio" },
    { day: 4, start: 4, dur: 2, color: "#809FFF", label: "Hist" },
    { day: 6, start: 1, dur: 1, color: "#7DD3A0", label: "Art" },
  ];

  const cW = 42;
  const cH = 26;
  const hdrH = 22;
  const leftW = 28;
  const w = leftW + 7 * cW;
  const h = hdrH + 8 * cH;

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-full" preserveAspectRatio="xMidYMid meet">
      {days.map((d, i) => (
        <text key={d} x={leftW + i * cW + cW / 2} y={13} textAnchor="middle" fontSize="7.5" fontWeight="500" fill={labelColor}>
          {d}
        </text>
      ))}
      {hours.map((hr, i) => (
        <text key={hr} x={leftW - 4} y={hdrH + i * cH + cH / 2 + 1} textAnchor="end" fontSize="6.5" fill={labelColor}>
          {hr}
        </text>
      ))}

      {Array.from({ length: 9 }, (_, i) => (
        <line key={`sh${i}`} x1={leftW} y1={hdrH + i * cH} x2={leftW + 7 * cW} y2={hdrH + i * cH} stroke={gridStroke} strokeWidth="0.5" />
      ))}
      {Array.from({ length: 8 }, (_, i) => (
        <line key={`sv${i}`} x1={leftW + i * cW} y1={hdrH} x2={leftW + i * cW} y2={hdrH + 8 * cH} stroke={gridStroke} strokeWidth="0.5" />
      ))}

      {sessions.map((s, i) => {
        const x = leftW + s.day * cW + 3;
        const y = hdrH + s.start * cH + 2;
        const sw = cW - 6;
        const sh = s.dur * cH - 4;
        return (
          <g key={`sess-${i}`}>
            <rect x={x} y={y} width={sw} height={sh} rx="4" fill={s.color} opacity={isDark ? 0.18 : 0.12} />
            <rect x={x} y={y} width={sw} height={sh} rx="4" fill="none" stroke={s.color} strokeWidth="0.8" opacity="0.45" />
            <text
              x={x + sw / 2} y={y + sh / 2 + 1}
              textAnchor="middle" dominantBaseline="middle"
              fontSize="7" fontWeight="600" fill={s.color}
            >
              {s.label}
            </text>
          </g>
        );
      })}

      <line x1={leftW} y1={hdrH + 3.5 * cH} x2={leftW + 7 * cW} y2={hdrH + 3.5 * cH} stroke="#FFA629" strokeWidth="1" opacity="0.35" strokeDasharray="4,2" />
      <circle cx={leftW - 1} cy={hdrH + 3.5 * cH} r="2.5" fill="#FFA629" opacity="0.6" />
      <text x={leftW + 7 * cW + 2} y={hdrH + 3.5 * cH + 1} fontSize="6" fontWeight="500" fill="#FFA629" opacity="0.6">now</text>
    </svg>
  );
};

/* ─── Progress Chart Illustration ─── */

const ProgressIllustration = ({ isDark }: { isDark: boolean }) => {
  const gridStroke = isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)";
  const labelColor = isDark ? "rgba(255,255,255,0.25)" : "rgba(0,0,0,0.25)";

  const w = 360;
  const h = 220;
  const pL = 36;
  const pR = 20;
  const pT = 18;
  const pB = 28;
  const cW = w - pL - pR;
  const cH = h - pT - pB;

  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul"];
  const data = [18, 32, 38, 52, 61, 74, 88];

  const pts = data.map((v, i) => ({
    x: pL + (i / (data.length - 1)) * cW,
    y: pT + cH - (v / 100) * cH,
  }));

  const pathD = pts.map((p, i) => {
    if (i === 0) return `M ${p.x} ${p.y}`;
    const prev = pts[i - 1];
    const cpx1 = prev.x + (p.x - prev.x) * 0.4;
    const cpx2 = p.x - (p.x - prev.x) * 0.4;
    return `C ${cpx1} ${prev.y}, ${cpx2} ${p.y}, ${p.x} ${p.y}`;
  }).join(" ");

  const areaD = `${pathD} L ${pts[pts.length - 1].x} ${pT + cH} L ${pL} ${pT + cH} Z`;

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-full" preserveAspectRatio="xMidYMid meet">
      {[0, 25, 50, 75, 100].map((v) => {
        const y = pT + cH - (v / 100) * cH;
        return (
          <g key={v}>
            <line x1={pL} y1={y} x2={pL + cW} y2={y} stroke={gridStroke} strokeWidth="0.5" />
            <text x={pL - 6} y={y + 1} textAnchor="end" fontSize="6.5" fill={labelColor}>{v}%</text>
          </g>
        );
      })}

      {months.map((m, i) => (
        <text key={m} x={pL + (i / (months.length - 1)) * cW} y={h - 6} textAnchor="middle" fontSize="6.5" fill={labelColor}>{m}</text>
      ))}

      <defs>
        <linearGradient id="feat-prog-grad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#7DD3A0" stopOpacity={isDark ? 0.14 : 0.1} />
          <stop offset="100%" stopColor="#7DD3A0" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={areaD} fill="url(#feat-prog-grad)" />
      <path d={pathD} fill="none" stroke="#7DD3A0" strokeWidth="2" strokeLinecap="round" />

      {pts.map((p, i) => (
        <g key={`pt-${i}`}>
          <circle cx={p.x} cy={p.y} r="4" fill={isDark ? "#0B0D10" : "#F8FAFC"} stroke="#7DD3A0" strokeWidth="1.5" />
          <circle cx={p.x} cy={p.y} r="1.5" fill="#7DD3A0" />
        </g>
      ))}

      <circle cx={pts[pts.length - 1].x} cy={pts[pts.length - 1].y} r="10" fill="#7DD3A0" opacity="0.08" />
      <rect
        x={pts[pts.length - 1].x - 20} y={pts[pts.length - 1].y - 22}
        width="40" height="16" rx="8"
        fill={isDark ? "#0B0D10" : "#F8FAFC"}
        stroke="#7DD3A0" strokeWidth="0.8"
      />
      <text
        x={pts[pts.length - 1].x} y={pts[pts.length - 1].y - 13}
        textAnchor="middle" dominantBaseline="middle"
        fontSize="8" fontWeight="700" fill="#7DD3A0"
      >
        88%
      </text>

      {data.length > 1 && (
        <g>
          <line
            x1={pts[0].x} y1={pts[0].y}
            x2={pts[pts.length - 1].x} y2={pts[pts.length - 1].y}
            stroke="#7DD3A0" strokeWidth="0.5" opacity="0.2" strokeDasharray="4,3"
          />
        </g>
      )}
    </svg>
  );
};

/* ─── Subject Bubbles Illustration ─── */

const SubjectsIllustration = ({ isDark }: { isDark: boolean }) => {
  const subjects = [
    { x: 110, y: 70, r: 40, label: "Math", color: "#3B82F6" },
    { x: 250, y: 55, r: 34, label: "Science", color: "#8B5CF6" },
    { x: 180, y: 145, r: 36, label: "English", color: "#FFA629" },
    { x: 370, y: 50, r: 28, label: "History", color: "#10B981" },
    { x: 340, y: 150, r: 32, label: "Art", color: "#F472B6" },
    { x: 60, y: 165, r: 26, label: "Music", color: "#809FFF" },
    { x: 440, y: 110, r: 24, label: "Code", color: "#EF4444" },
    { x: 470, y: 45, r: 20, label: "Lang", color: "#7DD3A0" },
  ];

  const links: [number, number][] = [
    [0, 1], [0, 2], [1, 2], [1, 3], [1, 4], [2, 5], [3, 6], [4, 6], [3, 7], [0, 5], [2, 4],
  ];

  return (
    <svg viewBox="0 0 540 210" className="w-full h-full" preserveAspectRatio="xMidYMid meet">
      {links.map(([a, b], i) => {
        const sa = subjects[a];
        const sb = subjects[b];
        const midX = (sa.x + sb.x) / 2;
        const midY = (sa.y + sb.y) / 2;
        const off = i % 2 === 0 ? 12 : -12;
        return (
          <path
            key={`link-${i}`}
            d={`M ${sa.x} ${sa.y} Q ${midX} ${midY + off}, ${sb.x} ${sb.y}`}
            fill="none"
            stroke={isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.05)"}
            strokeWidth="0.8"
          />
        );
      })}

      {subjects.map((s, i) => (
        <g key={`subj-${i}`}>
          <circle cx={s.x} cy={s.y} r={s.r + 6} fill="none" stroke={s.color} strokeWidth="0.4" opacity="0.15" strokeDasharray="2,2" />
          <circle cx={s.x} cy={s.y} r={s.r} fill={`${s.color}${isDark ? "14" : "0a"}`} stroke={s.color} strokeWidth="0.8" opacity="0.7" />
          <text
            x={s.x} y={s.y + 1}
            textAnchor="middle" dominantBaseline="middle"
            fontSize={s.r > 30 ? "10" : "8"} fontWeight="500" fill={s.color}
          >
            {s.label}
          </text>
        </g>
      ))}

      {Array.from({ length: 25 }, (_, i) => {
        const x = hash(i * 31 + 400) * 540;
        const y = hash(i * 37 + 500) * 210;
        const color = subjects[Math.floor(hash(i * 41 + 600) * subjects.length)].color;
        return (
          <circle key={`sdot-${i}`} cx={x} cy={y} r={0.5 + hash(i * 43 + 700) * 1.2} fill={color} opacity={0.1 + hash(i * 47 + 800) * 0.15} />
        );
      })}
    </svg>
  );
};

/* ─── Features Section ─── */

const features = [
  {
    key: "matching",
    title: "Intelligent Matching",
    description:
      "Our algorithm analyzes your learning style, academic goals, and preferences to connect you with the perfect tutor — not just any available one.",
    accent: "#3B82F6",
    Illustration: MatchingIllustration,
  },
  {
    key: "schedule",
    title: "Your Schedule, Your Rules",
    description:
      "Book sessions when you're at your sharpest. Morning or midnight, weekday or weekend — learning fits around your life.",
    accent: "#FFA629",
    Illustration: ScheduleIllustration,
  },
  {
    key: "progress",
    title: "Track Your Growth",
    description:
      "Visual analytics show exactly how far you've come and where you're heading — every session, every milestone counted.",
    accent: "#7DD3A0",
    Illustration: ProgressIllustration,
  },
  {
    key: "subjects",
    title: "Every Subject, One Place",
    description:
      "Mathematics, sciences, languages, arts — specialized tutors for every subject, all under one roof.",
    accent: "#8B5CF6",
    Illustration: SubjectsIllustration,
  },
];

const Features = () => {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const cardBg = isDark ? "#0A0C0F" : "#F1F5F9";
  const cardBorder = isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)";
  const textPrimary = isDark ? "#F5F7FA" : "#0F172A";
  const textSecondary = isDark ? "rgba(255,255,255,0.45)" : "rgba(0,0,0,0.45)";

  const colSpans = [7, 5, 5, 7];
  const illustrationHeights = ["260px", "250px", "240px", "220px"];

  return (
    <section
      id="features"
      className="relative w-full py-32 overflow-hidden bg-[var(--background)] transition-colors duration-700"
    >
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-20">
          <span className="inline-block text-sm font-[var(--font-secondary)] font-medium tracking-widest uppercase text-[#FFA629] mb-6">
            Features
          </span>
          <h2 className="font-[var(--font-primary)] text-5xl font-thin tracking-tight leading-tight text-[#0F172A] dark:text-[#F5F7FA]">
            Built for how you learn
          </h2>
        </div>

        <div className="grid grid-cols-12 gap-5">
          {features.map((feat, idx) => {
            const Ill = feat.Illustration;
            const span = colSpans[idx];
            return (
              <div
                key={feat.key}
                className="rounded-xl overflow-hidden"
                style={{
                  gridColumn: `span ${span}`,
                  background: cardBg,
                  border: `1px solid ${cardBorder}`,
                }}
              >
                {/* Illustration */}
                <div
                  className="px-6 pt-6"
                  style={{ height: illustrationHeights[idx] }}
                >
                  <Ill isDark={isDark} />
                </div>

                {/* Text */}
                <div className="px-8 pt-5 pb-8">
                  <h3
                    className="font-[var(--font-primary)] text-xl font-normal mb-2"
                    style={{ color: textPrimary }}
                  >
                    {feat.title}
                  </h3>
                  <p
                    className="font-[var(--font-secondary)] text-sm font-light leading-relaxed"
                    style={{ color: textSecondary }}
                  >
                    {feat.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0">
        <hr className="border-t border-[var(--foreground)]/10" />
      </div>
    </section>
  );
};

export default Features;
