"use client";

import React from "react";
import { useIsDark } from "@/hooks/useIsDark";

const ORANGE = "#FFA629";
const BLUE = "#809FFF";
const PURPLE = "#8B5CF6";
const GREEN = "#7DD3A0";

/* ─── Matching Illustration ─── */

const MatchingIllustration = ({ isDark }: { isDark: boolean }) => {
  const muted = isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.05)";
  const center = { x: 75, y: 75 };
  const nodes = [
    { x: 28, y: 32, match: true },
    { x: 125, y: 28, match: true },
    { x: 22, y: 120, match: false },
    { x: 130, y: 118, match: false },
    { x: 75, y: 22, match: true },
  ];

  return (
    <svg viewBox="0 0 150 150" className="w-full h-full" preserveAspectRatio="xMidYMid meet">
      {nodes.map((n, i) => (
        <line key={`l-${i}`} x1={center.x} y1={center.y} x2={n.x} y2={n.y} stroke={n.match ? ORANGE : muted} strokeWidth={n.match ? 1 : 0.5} strokeDasharray={n.match ? "none" : "3,2"} opacity={n.match ? 0.5 : 0.4} />
      ))}
      {nodes.map((n, i) => (
        <g key={`n-${i}`}>
          <circle cx={n.x} cy={n.y} r="10" fill={n.match ? `${BLUE}12` : muted} stroke={n.match ? BLUE : muted} strokeWidth="0.8" />
          <circle cx={n.x} cy={n.y} r="2.5" fill={n.match ? BLUE : (isDark ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.08)")} />
        </g>
      ))}
      <circle cx={center.x} cy={center.y} r="18" fill={`${ORANGE}10`} stroke={ORANGE} strokeWidth="1.2" />
      <circle cx={center.x} cy={center.y} r="4" fill={ORANGE} />
      <circle cx={center.x} cy={center.y} r="28" fill="none" stroke={ORANGE} strokeWidth="0.4" opacity="0.2" strokeDasharray="2,2" />
    </svg>
  );
};

/* ─── Schedule Illustration ─── */

const ScheduleIllustration = ({ isDark }: { isDark: boolean }) => {
  const muted = isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.04)";
  const blocks = [
    { x: 15, y: 30, w: 40, h: 18, color: ORANGE },
    { x: 65, y: 55, w: 35, h: 25, color: BLUE },
    { x: 110, y: 28, w: 30, h: 20, color: ORANGE },
    { x: 20, y: 80, w: 38, h: 16, color: BLUE },
    { x: 70, y: 95, w: 42, h: 22, color: ORANGE },
    { x: 115, y: 70, w: 28, h: 18, color: BLUE },
  ];

  return (
    <svg viewBox="0 0 155 130" className="w-full h-full" preserveAspectRatio="xMidYMid meet">
      {[30, 55, 80, 105].map((y, i) => (
        <line key={`g-${i}`} x1="10" y1={y} x2="145" y2={y} stroke={muted} strokeWidth="0.4" />
      ))}
      {blocks.map((b, i) => (
        <g key={`b-${i}`}>
          <rect x={b.x} y={b.y} width={b.w} height={b.h} rx="3" fill={b.color} opacity={isDark ? 0.12 : 0.08} />
          <rect x={b.x} y={b.y} width={b.w} height={b.h} rx="3" fill="none" stroke={b.color} strokeWidth="0.7" opacity="0.45" />
        </g>
      ))}
      <line x1="10" y1="68" x2="145" y2="68" stroke={ORANGE} strokeWidth="0.8" opacity="0.35" strokeDasharray="3,2" />
      <circle cx="8" cy="68" r="2" fill={ORANGE} opacity="0.6" />
    </svg>
  );
};

/* ─── Progress Illustration ─── */

const ProgressIllustration = ({ isDark }: { isDark: boolean }) => {
  const muted = isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.03)";
  const pts = [
    { x: 15, y: 110 },
    { x: 40, y: 95 },
    { x: 65, y: 82 },
    { x: 90, y: 62 },
    { x: 115, y: 42 },
    { x: 140, y: 25 },
  ];

  const pathD = pts.map((p, i) => {
    if (i === 0) return `M ${p.x} ${p.y}`;
    const prev = pts[i - 1];
    const cpx1 = prev.x + (p.x - prev.x) * 0.5;
    const cpx2 = p.x - (p.x - prev.x) * 0.5;
    return `C ${cpx1} ${prev.y}, ${cpx2} ${p.y}, ${p.x} ${p.y}`;
  }).join(" ");

  return (
    <svg viewBox="0 0 155 130" className="w-full h-full" preserveAspectRatio="xMidYMid meet">
      {[30, 55, 80, 105].map((y, i) => (
        <line key={`g-${i}`} x1="15" y1={y} x2="140" y2={y} stroke={muted} strokeWidth="0.4" />
      ))}
      <defs>
        <linearGradient id="prog-fill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={ORANGE} stopOpacity={isDark ? 0.1 : 0.06} />
          <stop offset="100%" stopColor={ORANGE} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={`${pathD} L 140 120 L 15 120 Z`} fill="url(#prog-fill)" />
      <path d={pathD} fill="none" stroke={ORANGE} strokeWidth="1.5" strokeLinecap="round" />
      {pts.map((p, i) => (
        <circle key={`p-${i}`} cx={p.x} cy={p.y} r="2.5" fill={isDark ? "#0B0D10" : "#F8FAFC"} stroke={ORANGE} strokeWidth="1" />
      ))}
    </svg>
  );
};

/* ─── Subjects Illustration ─── */

const SubjectsIllustration = ({ isDark }: { isDark: boolean }) => {
  const tags = [
    { x: 10, y: 20, label: "Math", color: ORANGE },
    { x: 70, y: 18, label: "Physics", color: BLUE },
    { x: 15, y: 55, label: "Chem", color: BLUE },
    { x: 75, y: 52, label: "English", color: ORANGE },
    { x: 10, y: 90, label: "Art", color: ORANGE },
    { x: 60, y: 88, label: "History", color: BLUE },
    { x: 110, y: 55, label: "Bio", color: ORANGE },
  ];

  return (
    <svg viewBox="0 0 155 120" className="w-full h-full" preserveAspectRatio="xMidYMid meet">
      {tags.map((t, i) => {
        const w = t.label.length * 6.5 + 16;
        return (
          <g key={`t-${i}`}>
            <rect x={t.x} y={t.y} width={w} height="22" rx="11" fill={t.color} opacity={isDark ? 0.08 : 0.06} />
            <rect x={t.x} y={t.y} width={w} height="22" rx="11" fill="none" stroke={t.color} strokeWidth="0.6" opacity="0.4" />
            <text x={t.x + w / 2} y={t.y + 12} textAnchor="middle" dominantBaseline="middle" fontSize="8" fontWeight="500" fill={t.color} opacity="0.75">{t.label}</text>
          </g>
        );
      })}
    </svg>
  );
};

/* ─── Verified Tutors Illustration ─── */

const VerifiedIllustration = ({ isDark }: { isDark: boolean }) => {
  const muted = isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.04)";

  return (
    <svg viewBox="0 0 150 130" className="w-full h-full" preserveAspectRatio="xMidYMid meet">
      <path
        d="M75 18 L105 32 L105 65 C105 88 75 102 75 102 C75 102 45 88 45 65 L45 32 Z"
        fill={`${BLUE}${isDark ? "0c" : "08"}`} stroke={BLUE} strokeWidth="1" opacity="0.5"
      />
      <polyline points="62,60 72,70 90,50" fill="none" stroke={ORANGE} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" opacity="0.7" />
      {[{ x: 25, y: 45 }, { x: 25, y: 62 }, { x: 25, y: 79 }, { x: 125, y: 45 }, { x: 125, y: 62 }, { x: 125, y: 79 }].map((p, i) => (
        <g key={`c-${i}`}>
          <line x1={p.x - 8} y1={p.y} x2={p.x + 8} y2={p.y} stroke={muted} strokeWidth="3" strokeLinecap="round" />
          <circle cx={p.x + 13} cy={p.y} r="2.5" fill={i < 4 ? GREEN : muted} opacity={i < 4 ? 0.5 : 0.3} />
        </g>
      ))}
    </svg>
  );
};

/* ─── Instant Connect Illustration ─── */

const ConnectIllustration = ({ isDark }: { isDark: boolean }) => (
  <svg viewBox="0 0 150 130" className="w-full h-full" preserveAspectRatio="xMidYMid meet">
    <rect x="20" y="30" width="60" height="38" rx="6" fill={`${BLUE}${isDark ? "10" : "07"}`} stroke={BLUE} strokeWidth="0.8" opacity="0.5" />
    <polygon points="35,68 35,78 48,68" fill={BLUE} opacity="0.25" />
    {[38, 48, 58].map((y, i) => (
      <line key={`ml-${i}`} x1="30" y1={y} x2={62 - i * 6} y2={y} stroke={BLUE} strokeWidth="1.5" strokeLinecap="round" opacity="0.2" />
    ))}
    <rect x="70" y="55" width="55" height="32" rx="6" fill={`${ORANGE}${isDark ? "10" : "07"}`} stroke={ORANGE} strokeWidth="0.8" opacity="0.5" />
    <polygon points="105,87 112,87 105,96" fill={ORANGE} opacity="0.25" />
    {[63, 73].map((y, i) => (
      <line key={`mr-${i}`} x1="80" y1={y} x2={108 - i * 8} y2={y} stroke={ORANGE} strokeWidth="1.5" strokeLinecap="round" opacity="0.2" />
    ))}
    <path d="M130 28 L125 42 L131 42 L126 56" fill="none" stroke={ORANGE} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" opacity="0.5" />
  </svg>
);

/* ─── Multi-Device Illustration ─── */

const DevicesIllustration = ({ isDark }: { isDark: boolean }) => {
  const muted = isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.04)";

  return (
    <svg viewBox="0 0 155 125" className="w-full h-full" preserveAspectRatio="xMidYMid meet">
      <rect x="25" y="25" width="75" height="52" rx="3" fill="none" stroke={BLUE} strokeWidth="1" opacity="0.45" />
      <rect x="25" y="72" width="75" height="5" rx="1.5" fill={BLUE} opacity={isDark ? 0.06 : 0.04} />
      <line x1="35" y1="38" x2="85" y2="38" stroke={muted} strokeWidth="1.2" />
      <line x1="35" y1="48" x2="75" y2="48" stroke={muted} strokeWidth="1.2" />
      <line x1="35" y1="58" x2="80" y2="58" stroke={muted} strokeWidth="1.2" />
      <circle cx="82" cy="38" r="2" fill={ORANGE} opacity="0.45" />

      <rect x="108" y="35" width="32" height="55" rx="4" fill="none" stroke={ORANGE} strokeWidth="1" opacity="0.45" />
      <line x1="114" y1="50" x2="134" y2="50" stroke={muted} strokeWidth="1.2" />
      <line x1="114" y1="58" x2="130" y2="58" stroke={muted} strokeWidth="1.2" />
      <circle cx="124" cy="82" r="2.5" fill="none" stroke={ORANGE} strokeWidth="0.6" opacity="0.3" />

      <path d="M62 25 C62 16, 124 16, 124 33" fill="none" stroke={PURPLE} strokeWidth="0.5" opacity="0.25" strokeDasharray="2,2" />
      <circle cx="93" cy="18" r="1.5" fill={PURPLE} opacity="0.25" />
    </svg>
  );
};

/* ─── Session Resources Illustration ─── */

const ResourcesIllustration = ({ isDark }: { isDark: boolean }) => {
  const muted = isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.04)";

  return (
    <svg viewBox="0 0 150 130" className="w-full h-full" preserveAspectRatio="xMidYMid meet">
      <rect x="30" y="25" width="50" height="65" rx="3" fill="none" stroke={BLUE} strokeWidth="0.8" opacity="0.4" />
      <line x1="38" y1="38" x2="72" y2="38" stroke={muted} strokeWidth="1.5" />
      <line x1="38" y1="48" x2="68" y2="48" stroke={muted} strokeWidth="1.5" />
      <line x1="38" y1="58" x2="70" y2="58" stroke={muted} strokeWidth="1.5" />
      <line x1="38" y1="68" x2="62" y2="68" stroke={muted} strokeWidth="1.5" />
      <line x1="38" y1="78" x2="66" y2="78" stroke={muted} strokeWidth="1.5" />

      <rect x="70" y="40" width="50" height="65" rx="3" fill="none" stroke={ORANGE} strokeWidth="0.8" opacity="0.4" />
      <circle cx="95" cy="62" r="12" fill={ORANGE} opacity={isDark ? 0.08 : 0.05} stroke={ORANGE} strokeWidth="0.5" />
      <polygon points="92,57 92,67 100,62" fill={ORANGE} opacity="0.4" />
      <line x1="78" y1="82" x2="112" y2="82" stroke={muted} strokeWidth="1.5" />
      <line x1="78" y1="92" x2="105" y2="92" stroke={muted} strokeWidth="1.5" />

      <path d="M55 25 L55 18 L95 18 L95 40" fill="none" stroke={BLUE} strokeWidth="0.5" opacity="0.2" strokeDasharray="2,2" />
    </svg>
  );
};

/* ─── Affordable Pricing Illustration ─── */

const PricingIllustration = ({ isDark }: { isDark: boolean }) => {
  const muted = isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.04)";

  return (
    <svg viewBox="0 0 150 130" className="w-full h-full" preserveAspectRatio="xMidYMid meet">
      <circle cx="75" cy="65" r="38" fill="none" stroke={ORANGE} strokeWidth="0.8" opacity="0.3" />
      <circle cx="75" cy="65" r="28" fill={`${ORANGE}${isDark ? "0a" : "06"}`} stroke={ORANGE} strokeWidth="1" opacity="0.4" />

      <text x="75" y="60" textAnchor="middle" dominantBaseline="middle" fontSize="18" fontWeight="300" fill={ORANGE} opacity="0.7">$</text>
      <line x1="65" y1="74" x2="85" y2="74" stroke={ORANGE} strokeWidth="0.6" opacity="0.3" />

      {[{ x: 28, y: 30 }, { x: 122, y: 30 }, { x: 28, y: 100 }, { x: 122, y: 100 }].map((p, i) => (
        <g key={`t-${i}`}>
          <circle cx={p.x} cy={p.y} r="5" fill="none" stroke={BLUE} strokeWidth="0.5" opacity="0.25" />
          <line x1={p.x} y1={p.y} x2={75} y2={65} stroke={muted} strokeWidth="0.4" strokeDasharray="2,2" />
        </g>
      ))}

      <circle cx="75" cy="65" r="45" fill="none" stroke={BLUE} strokeWidth="0.3" opacity="0.1" strokeDasharray="3,3" />
    </svg>
  );
};

/* ─── Features Section ─── */

const features = [
  {
    key: "matching",
    title: "Intelligent Matching",
    description: "Algorithm-powered pairing based on your learning style and goals.",
    Illustration: MatchingIllustration,
  },
  {
    key: "schedule",
    title: "Flexible Scheduling",
    description: "Book sessions when you're sharpest — morning or midnight.",
    Illustration: ScheduleIllustration,
  },
  {
    key: "progress",
    title: "Track Your Growth",
    description: "Visual analytics for every session, every milestone tracked.",
    Illustration: ProgressIllustration,
  },
  {
    key: "subjects",
    title: "Every Subject Covered",
    description: "Specialized tutors for math, sciences, languages, arts — all here.",
    Illustration: SubjectsIllustration,
  },
  {
    key: "verified",
    title: "Verified & Vetted Tutors",
    description: "Rigorous background checks and teaching assessments for every tutor.",
    Illustration: VerifiedIllustration,
  },
  {
    key: "connect",
    title: "Instant Connect",
    description: "Message your tutor and get answers between sessions instantly.",
    Illustration: ConnectIllustration,
  },
  {
    key: "devices",
    title: "Learn From Anywhere",
    description: "Sessions and progress sync seamlessly across all your devices.",
    Illustration: DevicesIllustration,
  },
  {
    key: "resources",
    title: "Session Recordings",
    description: "Every session recorded and available with shared notes and resources.",
    Illustration: ResourcesIllustration,
  },
  {
    key: "pricing",
    title: "Transparent Pricing",
    description: "No hidden fees — clear, affordable rates for every session.",
    Illustration: PricingIllustration,
  },
];

const Features = () => {
  const isDark = useIsDark();

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

        <div className="grid grid-cols-3 gap-8">
          {features.map((feat) => {
            const Ill = feat.Illustration;
            return (
              <div
                key={feat.key}
                className={`
                  group relative rounded-lg border overflow-hidden transition-all duration-300
                  ${
                    isDark
                      ? "border-white/[0.06] bg-[#0A0C0F] hover:border-white/[0.12]"
                      : "border-[#0F172A]/[0.06] bg-[#F1F5F9] hover:border-[#0F172A]/[0.12] hover:shadow-lg"
                  }
                `}
              >
                <div className="flex items-center justify-center py-12 px-6">
                  <div className="w-44 h-44">
                    <Ill isDark={isDark} />
                  </div>
                </div>
                <div className="px-8 pb-8">
                  <h3 className="font-[var(--font-primary)] text-xl font-normal text-[#0F172A] dark:text-[#F5F7FA] mb-3">
                    {feat.title}
                  </h3>
                  <p className="font-[var(--font-secondary)] text-sm font-light leading-relaxed text-[#0F172A]/55 dark:text-[#F5F7FA]/55">
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
