"use client";

import { useTheme } from "next-themes";

const sunsetColors = [
  "#2D0A04", "#3A1007", "#47160A", "#541C0D", "#612210",
  "#6E2813", "#7B2E16", "#883419", "#953A1C", "#A2401F",
  "#AF4622", "#B95028", "#C35A2E", "#CD6434", "#D76E3A",
  "#DF7840", "#E78246", "#EF8C4C", "#F59652", "#F9A058",
  "#FCAA5E", "#FEB464", "#FFBE6A", "#FFC870", "#FFD276",
];

const problems = [
  {
    title: "One-size-fits-all teaching",
    description:
      "Traditional classrooms force every student into the same mold. Different learning speeds, styles, and goals are ignored entirely.",
  },
  {
    title: "No flexibility in timing",
    description:
      "Fixed schedules don't care if you're a morning learner or a night owl. You adapt to the system — not the other way around.",
  },
  {
    title: "No choice in what you learn",
    description:
      "You don't pick what you study or how you study it. The curriculum is set in stone — your curiosity and interests don't matter.",
  },
];

/* ─── Striped circle for cards ─── */

const LINE_COUNT = 25;
const LINE_HEIGHT = 3;
const LINE_GAP = 4;
const RADIUS = 85;
const CX = 100;
const START_Y = CX - RADIUS;

const StripedCircle = ({ id, isDark, rotation = 0 }: { id: string; isDark: boolean; rotation?: number }) => {
  const grayFill = isDark ? "#555" : "#999";
  const rotateTransform = rotation !== 0 ? `rotate(${rotation}, ${CX}, ${CX})` : undefined;
  return (
    <div className="relative w-44 h-44 mx-auto">
      <svg viewBox="0 0 200 200" className="absolute inset-0 w-full h-full transition-opacity duration-500 ease-in-out group-hover:opacity-0">
        <defs><clipPath id={`g-${id}`}><circle cx={CX} cy={CX} r={RADIUS} /></clipPath></defs>
        <g clipPath={`url(#g-${id})`} transform={rotateTransform}>
          {Array.from({ length: LINE_COUNT }, (_, i) => (
            <rect key={i} x={-50} y={START_Y + i * (LINE_HEIGHT + LINE_GAP)} width={300} height={LINE_HEIGHT} fill={grayFill} />
          ))}
        </g>
      </svg>
      <svg viewBox="0 0 200 200" className="absolute inset-0 w-full h-full opacity-0 transition-opacity duration-500 ease-in-out group-hover:opacity-100">
        <defs><clipPath id={`c-${id}`}><circle cx={CX} cy={CX} r={RADIUS} /></clipPath></defs>
        <g clipPath={`url(#c-${id})`} transform={rotateTransform}>
          {Array.from({ length: LINE_COUNT }, (_, i) => (
            <rect key={i} x={-50} y={START_Y + i * (LINE_HEIGHT + LINE_GAP)} width={300} height={LINE_HEIGHT} fill={sunsetColors[i] || sunsetColors[sunsetColors.length - 1]} />
          ))}
        </g>
      </svg>
    </div>
  );
};

/* ─── Chaos-to-order transition illustration ─── */

const hash = (n: number) => {
  const x = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};

const IW = 1400;
const IH = 340;
const GC = 32;
const GR = 12;
const CW = 34;
const CH = 26;
const GX = IW - GC * CW - 30;
const GY = (IH - GR * CH) / 2;

interface Dot { x: number; y: number; s: number; o: number; c: 0 | 1; round: boolean }
interface Line { x1: number; y1: number; x2: number; y2: number; o: number }
interface Block { x: number; y: number; w: number; h: number; o: number; c: 0 | 1 }

const illDots: Dot[] = [];
const illLines: Line[] = [];
const illBlocks: Block[] = [];

// Grid particles: left columns scatter as round dots toward bottom-left,
// right columns lock into square grid positions
for (let c = 0; c < GC; c++) {
  for (let r = 0; r < GR; r++) {
    const i = c * GR + r;
    const order = Math.pow(c / (GC - 1), 1.3);

    const gx = GX + c * CW + CW / 2;
    const gy = GY + r * CH + CH / 2;
    const rx = hash(i * 2) * IW * 0.44;
    const ry = IH * 0.35 + hash(i * 2 + 1) * IH * 0.65;

    illDots.push({
      x: gx * order + rx * (1 - order),
      y: gy * order + ry * (1 - order),
      s: (3 + hash(i * 7) * 5) * order + (1 + hash(i * 3) * 3.5) * (1 - order),
      o: (0.2 + hash(i * 4) * 0.3) * (0.3 + order * 0.7),
      c: hash(i * 5) > 0.42 ? 1 : 0,
      round: order < 0.55,
    });
  }
}

// Dense dust dots concentrated in bottom-left
for (let i = 0; i < 200; i++) {
  const x = hash(i * 11 + 500) * IW * 0.38;
  const y = IH * 0.3 + hash(i * 13 + 700) * IH * 0.7;
  illDots.push({
    x, y,
    s: 0.5 + hash(i * 17 + 900) * 2.5,
    o: 0.06 + hash(i * 19 + 1100) * 0.25,
    c: hash(i * 23 + 1300) > 0.42 ? 1 : 0,
    round: true,
  });
}

// Medium scattered dots in bottom-left and center-bottom
for (let i = 0; i < 60; i++) {
  const x = hash(i * 29 + 1500) * IW * 0.5;
  const y = IH * 0.25 + hash(i * 31 + 1700) * IH * 0.75;
  illDots.push({
    x, y,
    s: 2 + hash(i * 33 + 1900) * 5,
    o: 0.08 + hash(i * 37 + 2100) * 0.2,
    c: hash(i * 41 + 2300) > 0.42 ? 1 : 0,
    round: true,
  });
}

// Larger accent dots in bottom-left area
for (let i = 0; i < 25; i++) {
  const x = hash(i * 43 + 3500) * IW * 0.5;
  const y = IH * 0.3 + hash(i * 47 + 3700) * IH * 0.7;
  illDots.push({
    x, y,
    s: 7 + hash(i * 51 + 3900) * 12,
    o: 0.05 + hash(i * 53 + 4100) * 0.1,
    c: hash(i * 59 + 4300) > 0.42 ? 1 : 0,
    round: true,
  });
}

// Grid lines on the right side
const lineStartCol = Math.floor(GC * 0.38);
for (let c = lineStartCol; c < GC; c++) {
  for (let r = 0; r < GR; r++) {
    const x = GX + c * CW + CW / 2;
    const y = GY + r * CH + CH / 2;
    const p = (c - lineStartCol) / (GC - lineStartCol);
    const o = Math.pow(p, 1.8) * 0.22;
    if (c < GC - 1) illLines.push({ x1: x, y1: y, x2: x + CW, y2: y, o });
    if (r < GR - 1) illLines.push({ x1: x, y1: y, x2: x, y2: y + CH, o });
  }
}

// Extended vertical connectors above the grid
for (let c = Math.floor(GC * 0.65); c < GC; c += 2) {
  const x = GX + c * CW + CW / 2;
  const topY = GY;
  const ext = topY - 15 - hash(c + 5000) * 35;
  const o = 0.08 + hash(c + 5100) * 0.1;
  illLines.push({ x1: x, y1: topY, x2: x, y2: ext, o });
  illDots.push({ x, y: ext, s: 2 + hash(c + 5200) * 2.5, o: o + 0.08, c: hash(c + 5300) > 0.5 ? 1 : 0, round: false });
}

// Filled block overlays on the right grid
for (let c = Math.floor(GC * 0.5); c < GC - 1; c++) {
  for (let r = 0; r < GR - 1; r++) {
    const seed = c * GR + r;
    if (hash(seed + 6000) > 0.72) {
      const spanC = 1 + Math.floor(hash(seed + 6100) * 2.5);
      const spanR = 1 + Math.floor(hash(seed + 6200) * 2.5);
      illBlocks.push({
        x: GX + c * CW,
        y: GY + r * CH,
        w: Math.min(spanC, GC - c) * CW,
        h: Math.min(spanR, GR - r) * CH,
        o: 0.03 + hash(seed + 6300) * 0.09,
        c: hash(seed + 6400) > 0.42 ? 1 : 0,
      });
    }
  }
}

const TransitionIllustration = ({ isDark }: { isDark: boolean }) => {
  const c0 = "#FFA629";
  const c1 = "#818CF8";
  const pick = (idx: 0 | 1) => (idx === 0 ? c0 : c1);
  const lineStroke = isDark ? "#F5F7FA" : "#0F172A";

  return (
    <svg viewBox={`0 0 ${IW} ${IH}`} className="w-full h-auto" preserveAspectRatio="xMidYMid meet">
      {illLines.map((l, i) => (
        <line key={`l${i}`} x1={l.x1} y1={l.y1} x2={l.x2} y2={l.y2} stroke={lineStroke} strokeWidth={0.5} opacity={l.o} />
      ))}
      {illBlocks.map((b, i) => (
        <rect key={`b${i}`} x={b.x} y={b.y} width={b.w} height={b.h} fill={pick(b.c)} opacity={b.o} rx={1} />
      ))}
      {illDots.map((d, i) =>
        d.round ? (
          <circle key={`d${i}`} cx={d.x} cy={d.y} r={d.s / 2} fill={pick(d.c)} opacity={d.o} />
        ) : (
          <rect key={`d${i}`} x={d.x - d.s / 2} y={d.y - d.s / 2} width={d.s} height={d.s} fill={pick(d.c)} opacity={d.o} />
        )
      )}
    </svg>
  );
};

/* ─── Main section ─── */

const StoryAnimation = () => {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  return (
    <section
      id="transition"
      className="relative w-full py-32 overflow-hidden bg-[var(--background)] transition-colors duration-700"
    >
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-20">
          <span className="inline-block text-sm font-[var(--font-secondary)] font-medium tracking-widest uppercase text-[#FFA629] mb-6">
            The Problem
          </span>
          <h2 className="font-[var(--font-primary)] text-5xl font-extralight tracking-tight leading-tight text-[#0F172A] dark:text-[#F5F7FA]">
            Current Teaching Structure is Broken.
          </h2>
        </div>

        <div className="grid grid-cols-3 gap-8">
          {problems.map((problem, index) => (
            <div
              key={index}
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
                <StripedCircle id={`card-${index}`} isDark={isDark} rotation={index === 0 ? -45 : index === 2 ? 45 : 0} />
              </div>
              <div className="px-8 pb-8">
                <h3 className="font-[var(--font-primary)] text-xl font-normal text-[#0F172A] dark:text-[#F5F7FA] mb-3">
                  {problem.title}
                </h3>
                <p className="font-[var(--font-secondary)] text-sm font-light leading-relaxed text-[#0F172A]/55 dark:text-[#F5F7FA]/55">
                  {problem.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-24 relative">
          <h3 className="absolute top-6 left-6 z-10 font-[var(--font-primary)] text-6xl font-thin tracking-tight leading-tight text-[#0F172A] dark:text-[#F5F7FA]">
            The Inevitable<br />Transition
          </h3>
          <TransitionIllustration isDark={isDark} />
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0">
        <hr className="border-t border-[var(--foreground)]/10" />
      </div>
    </section>
  );
};

export default StoryAnimation;
