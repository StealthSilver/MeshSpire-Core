"use client";

import React from "react";

function roundSvg(n: number) {
  return Math.round(n * 1000) / 1000;
}

function srand(seed: number): number {
  const x = Math.sin(seed * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
}

const GRID_W = 720;
const GRID_H = 340;
const CELL_SIZE = 18;
const SQUARE_SIZE = 15;
const GRID_CENTER_X = GRID_W / 2;
const GRID_CENTER_Y = GRID_H / 2;
/** Tight hole so squares hug the label on all sides */
const CENTER_CLEAR_W = 200;
const CENTER_CLEAR_H = 52;
/** Extra squares in the band just outside the label */
const RING_BOOST = 0.28;
const RING_DEPTH = 56;

const orangeShades = ["#FFA629", "#FFB84D", "#FF9500", "#FFCA70", "#E89420"];
const blueShades = ["#809FFF", "#99B3FF", "#6688FF", "#B3C6FF", "#5577EE"];

type Square = {
  x: number;
  y: number;
  size: number;
  peakOpacity: number;
  color: string;
  rippleDelay: number;
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

      let density = 0.42;
      density += Math.max(0, Math.sin(c * 0.5) * Math.cos(r * 0.4) * 0.1);

      const px = c * CELL_SIZE + SQUARE_SIZE / 2;
      const py = r * CELL_SIZE + SQUARE_SIZE / 2;
      const dx = Math.abs(px - GRID_CENTER_X) - CENTER_CLEAR_W / 2;
      const dy = Math.abs(py - GRID_CENTER_Y) - CENTER_CLEAR_H / 2;
      const inCenterClearZone = dx < 0 && dy < 0;
      const inLabelRing =
        !inCenterClearZone &&
        dx < RING_DEPTH &&
        dy < RING_DEPTH &&
        (dx >= 0 || dy >= 0);

      if (inLabelRing) {
        density += RING_BOOST;
      }

      if (rand < density && !inCenterClearZone) {
        const shadeIdx = Math.floor(srand(seed + 1234) * 5) % 5;
        const color =
          srand(seed + 999) < 0.55
            ? orangeShades[shadeIdx]
            : blueShades[shadeIdx];

        const peakOpacity = roundSvg(0.4 + srand(seed + 777) * 0.55);
        const dist = Math.hypot(px - GRID_CENTER_X, py - GRID_CENTER_Y);
        const rippleDelay = roundSvg(dist * 0.011 + srand(seed + 301) * 0.12);

        squares.push({
          x: roundSvg(c * CELL_SIZE + (srand(seed + 101) - 0.5) * 2),
          y: roundSvg(r * CELL_SIZE + (srand(seed + 202) - 0.5) * 2),
          size: SQUARE_SIZE,
          peakOpacity,
          color,
          rippleDelay,
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
      className="loader-screen fixed inset-0 z-50 flex flex-col items-center justify-center bg-[var(--background)] transition-colors duration-300"
      aria-live="polite"
      aria-busy="true"
      role="status"
    >
      <div className="loader-grid-frame relative w-[min(720px,94vw)]" style={{ height: GRID_H }}>
        <div
          className="loader-grid-panel relative h-full overflow-hidden rounded-xl border border-[#0F172A]/[0.07] bg-[var(--background)] dark:border-white/[0.09]"
        >
          <svg
            width="100%"
            height="100%"
            viewBox={`0 0 ${GRID_W} ${GRID_H}`}
            className="relative z-[1] block"
            aria-hidden="true"
            preserveAspectRatio="xMidYMid meet"
          >
            <defs>
              <pattern
                id="loader-dot-bg"
                width={CELL_SIZE}
                height={CELL_SIZE}
                patternUnits="userSpaceOnUse"
              >
                <circle
                  cx="1.2"
                  cy="1.2"
                  r="0.85"
                  className="fill-[#CBD5E1] dark:fill-[#1A1D24]"
                />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#loader-dot-bg)" />
            {SQUARES.map((sq, i) => (
              <rect
                key={i}
                className="loader-grid-square"
                x={sq.x}
                y={sq.y}
                width={sq.size}
                height={sq.size}
                rx={2}
                fill={sq.color}
                style={
                  {
                    "--loader-peak": sq.peakOpacity,
                    animationDelay: `${sq.rippleDelay}s`,
                  } as React.CSSProperties
                }
              />
            ))}
          </svg>

          <div className="pointer-events-none absolute inset-0 z-[2] flex items-center justify-center">
            <p className="loader-label rounded-md px-5 py-3 font-[var(--font-inter)] text-lg font-extralight tracking-[0.28em] uppercase text-[#0F172A] dark:text-[#F5F7FA]">
              Loading
              <span className="loader-ellipsis" aria-hidden="true">
                <span>.</span>
                <span>.</span>
                <span>.</span>
              </span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
