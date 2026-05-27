"use client";

import React from "react";

function roundSvg(n: number) {
  return Math.round(n * 1000) / 1000;
}

function srand(seed: number): number {
  const x = Math.sin(seed * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
}

const GRID_W = 520;
const GRID_H = 200;
const CELL_SIZE = 14;
const SQUARE_SIZE = 10;

const orangeShades = ["#FFA629", "#FFB84D", "#FF9500", "#FFCA70", "#E89420"];
const blueShades = ["#809FFF", "#99B3FF", "#6688FF", "#B3C6FF", "#5577EE"];

type Square = {
  x: number;
  y: number;
  size: number;
  peakOpacity: number;
  color: string;
  delay: number;
  duration: number;
};

/** Theme-agnostic layout so SSR and client markup always match. */
function buildSquares(): Square[] {
  const cols = Math.floor(GRID_W / CELL_SIZE);
  const rows = Math.floor(GRID_H / CELL_SIZE);
  const squares: Square[] = [];

  for (let c = 0; c < cols; c++) {
    for (let r = 0; r < rows; r++) {
      const seed = c * 173 + r * 397 + 53;
      const rand = srand(seed);

      let density = 0.38;
      density += Math.max(0, Math.sin(c * 0.5) * Math.cos(r * 0.4) * 0.1);

      if (rand < density) {
        const shadeIdx = Math.floor(srand(seed + 1234) * 5) % 5;
        const color =
          srand(seed + 999) < 0.55
            ? orangeShades[shadeIdx]
            : blueShades[shadeIdx];

        const peakOpacity = roundSvg(0.35 + srand(seed + 777) * 0.55);

        squares.push({
          x: roundSvg(c * CELL_SIZE + (srand(seed + 101) - 0.5) * 2),
          y: roundSvg(r * CELL_SIZE + (srand(seed + 202) - 0.5) * 2),
          size: SQUARE_SIZE,
          peakOpacity,
          color,
          delay: roundSvg(srand(seed + 301) * 1.8),
          duration: roundSvg(0.9 + srand(seed + 401) * 1.1),
        });
      }
    }
  }

  return squares;
}

const SQUARES = buildSquares();

export default function Loader() {
  return (
    <div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[var(--background)] transition-colors duration-300"
      aria-live="polite"
      aria-busy="true"
      role="status"
    >
      <p className="mb-10 font-[var(--font-inter)] text-lg font-thin tracking-[0.2em] uppercase text-[#0F172A] dark:text-[#F5F7FA]">
        Loading ...
      </p>

      <div
        className="relative w-[min(520px,90vw)] overflow-hidden rounded-lg border border-[#0F172A]/[0.06] dark:border-white/[0.08] bg-[var(--background)]"
        style={{ height: GRID_H }}
      >
        <svg
          width="100%"
          height="100%"
          viewBox={`0 0 ${GRID_W} ${GRID_H}`}
          className="block"
          aria-hidden="true"
          preserveAspectRatio="xMidYMid meet"
        >
          {SQUARES.map((sq, i) => (
            <rect
              key={i}
              className="loader-grid-square"
              x={sq.x}
              y={sq.y}
              width={sq.size}
              height={sq.size}
              rx={1}
              fill={sq.color}
              style={
                {
                  "--loader-peak": sq.peakOpacity,
                  animationDuration: `${sq.duration}s`,
                  animationDelay: `${sq.delay}s`,
                } as React.CSSProperties
              }
            />
          ))}
        </svg>
      </div>
    </div>
  );
}
