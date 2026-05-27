"use client";

import React, { useMemo } from "react";
import { useTheme } from "next-themes";

function srand(seed: number): number {
  const x = Math.sin(seed * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
}

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
      "Fixed schedules don't care if you're a morning learner or a night owl. You adapt to the system not the other way around.",
  },
  {
    title: "No choice in what you learn",
    description:
      "You don't pick what you study or how you study it. The curriculum is set in stone your curiosity and interests don't matter.",
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

/* ─── Grid constants for transition illustration ─── */

const GRID_SQ = 10;
const GRID_CELL = 14;
const GRID_W = 900;
const GRID_H = 175;

/* ─── Main section ─── */

const StoryAnimation = () => {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const transitionSquares = useMemo(() => {
    const result: Array<{ x: number; y: number; opacity: number; color: string }> = [];
    const cols = Math.floor(GRID_W / GRID_CELL);
    const rows = Math.floor(GRID_H / GRID_CELL);
    const orangeShades = ["#FFA629", "#FFB84D", "#FF9500", "#FFCA70", "#E89420"];
    const blueShades = ["#809FFF", "#99B3FF", "#6688FF", "#B3C6FF", "#5577EE"];

    for (let c = 0; c < cols; c++) {
      for (let r = 0; r < rows; r++) {
        const seed = c * 173 + r * 397 + 53;
        const rand = srand(seed);
        const nx = c / cols;
        const ny = r / rows;

        let density: number;

        if (nx > 0.85) {
          density = 0.94;
        } else if (nx > 0.72) {
          density = 0.7 + srand(seed + 50) * 0.15;
        } else if (nx > 0.55) {
          density = 0.4 + srand(seed + 100) * 0.12;
        } else if (nx > 0.38) {
          density = 0.22 + srand(seed + 150) * 0.08;
        } else if (nx > 0.2) {
          density = 0.12 + srand(seed + 200) * 0.06;
        } else {
          density = 0.06 + srand(seed + 250) * 0.04;
        }

        if (nx > 0.7) {
          const edgeFade = ny < 0.08 ? ny / 0.08 : ny > 0.92 ? (1 - ny) / 0.08 : 1;
          density *= 0.6 + 0.4 * edgeFade;
        }

        if (nx < 0.4) {
          const scatter = Math.sin(c * 1.3 + r * 0.7) * 0.06;
          density += Math.max(0, scatter);
        }

        if (rand < density) {
          const shadeRand = srand(seed + 1234);
          const shadeIdx = Math.floor(shadeRand * 5);
          const colorPick = srand(seed + 999);
          const color = colorPick < 0.55 ? orangeShades[shadeIdx] : blueShades[shadeIdx];

          let snapX = c * GRID_CELL;
          let snapY = r * GRID_CELL;

          if (nx < 0.45) {
            const jitter = (1 - nx / 0.45) * GRID_CELL * 0.5;
            snapX += (srand(seed + 301) - 0.5) * jitter;
            snapY += (srand(seed + 401) - 0.5) * jitter;
          }

          result.push({
            x: snapX,
            y: snapY,
            opacity: 0.3 + srand(seed + 777) * 0.7,
            color,
          });
        }
      }
    }
    return result;
  }, []);

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

        <div className="mt-24 flex items-center">
          <h3 className="font-[var(--font-primary)] text-6xl font-thin tracking-tight leading-tight text-[#0F172A] dark:text-[#F5F7FA] shrink-0">
            The Inevitable<br />Transition
          </h3>
          <div className="flex-1 relative ml-7 overflow-hidden" style={{ height: "180px" }}>
            <svg
              className="absolute inset-0 w-full h-full"
              viewBox={`0 0 ${GRID_W} ${GRID_H}`}
              preserveAspectRatio="xMinYMid slice"
            >
              {transitionSquares.map((sq, i) => (
                <rect
                  key={i}
                  x={sq.x}
                  y={sq.y}
                  width={GRID_SQ}
                  height={GRID_SQ}
                  fill={sq.color}
                  opacity={sq.opacity * (isDark ? 0.22 : 0.55)}
                  rx={1}
                />
              ))}
            </svg>
          </div>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0">
        <hr className="border-t border-[var(--foreground)]/10" />
      </div>
    </section>
  );
};

export default StoryAnimation;
