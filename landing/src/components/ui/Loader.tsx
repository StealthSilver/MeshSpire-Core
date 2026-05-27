"use client";

import React, { useMemo } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { useTheme } from "next-themes";

function srand(seed: number): number {
  // Deterministic pseudo-random in [0,1)
  const x = Math.sin(seed * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
}

const GRID_W = 900;
const GRID_H = 420;
const CELL_SIZE = 16;
const SQUARE_SIZE = 10;

const orangeShades = ["#FFA629", "#FFB84D", "#FF9500", "#FFCA70", "#E89420"];
const blueShades = ["#809FFF", "#99B3FF", "#6688FF", "#B3C6FF", "#5577EE"];

type Square = {
  x: number;
  y: number;
  size: number;
  opacity: number;
  color: string;
};

function buildSquares(dark: boolean): Square[] {
  const cols = Math.floor(GRID_W / CELL_SIZE);
  const rows = Math.floor(GRID_H / CELL_SIZE);

  const centerX = cols / 2;
  const centerY = rows / 2;
  const maxD = Math.hypot(centerX, centerY);

  const squares: Square[] = [];

  for (let c = 0; c < cols; c++) {
    for (let r = 0; r < rows; r++) {
      const seed = c * 173 + r * 397 + 53;
      const rand = srand(seed);

      const dx = c - centerX;
      const dy = r - centerY;
      const d = Math.hypot(dx, dy);
      const dn = d / maxD; // [0..~1]

      // Portal-like density: more squares near center, fewer on edges.
      let density = 0.32 * Math.pow(1 - dn, 1.35);

      // Add subtle wave / “spark” texture.
      density += Math.max(
        0,
        Math.sin(c * 0.45) * Math.cos(r * 0.35) * 0.08 +
          Math.sin((c + r) * 0.18) * 0.05,
      );

      // Slight bias to create an “upper-left to lower-right” structure.
      const diag = (c / cols) * 0.7 + (r / rows) * 0.3;
      density *= 0.55 + 0.45 * diag;

      // Dark theme needs slightly higher density for legibility.
      if (dark) density *= 1.08;

      if (rand < density) {
        const shadeRand = srand(seed + 1234);
        const colorRand = srand(seed + 999);
        const shadeIdx = Math.floor(shadeRand * 5) % 5;
        const color = colorRand < 0.55 ? orangeShades[shadeIdx] : blueShades[shadeIdx];

        const alpha = 0.25 + srand(seed + 777) * (dark ? 0.35 : 0.45);

        // Slight offset so the grid feels less “perfect”.
        const jitter = (1 - dn) * 2.2;
        const jx = (srand(seed + 101) - 0.5) * jitter;
        const jy = (srand(seed + 202) - 0.5) * jitter;

        squares.push({
          x: c * CELL_SIZE + jx + 8,
          y: r * CELL_SIZE + jy + 10,
          size: SQUARE_SIZE,
          opacity: alpha,
          color,
        });
      }
    }
  }

  return squares;
}

export default function Loader() {
  const { theme, resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark" || theme === "dark";
  const reduceMotion = useReducedMotion();

  const squares = useMemo(() => buildSquares(isDark), [isDark]);

  const overlayBg = isDark ? "rgba(11,13,16,0.92)" : "rgba(248,250,252,0.92)";
  const border = isDark ? "rgba(255,255,255,0.10)" : "rgba(15,23,42,0.10)";
  const glow = isDark ? "rgba(186,127,252,0.18)" : "rgba(186,127,252,0.12)";
  const text = isDark ? "#F5F7FA" : "#0F172A";
  const subtext = isDark ? "rgba(245,247,250,0.55)" : "rgba(15,23,42,0.55)";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden"
      style={{
        background: overlayBg,
        color: text,
      }}
      aria-live="polite"
      aria-busy="true"
      role="status"
    >
      <div className="absolute inset-0">
        {/* Ambient glows to match the site’s accent style */}
        <div
          className="absolute -top-24 -left-24 w-[420px] h-[420px] rounded-full blur-3xl"
          style={{
            background: "rgba(128,159,255,0.22)",
          }}
        />
        <div
          className="absolute -bottom-28 -right-28 w-[460px] h-[460px] rounded-full blur-3xl"
          style={{
            background: "rgba(255,166,41,0.18)",
          }}
        />
        <div
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[520px] h-[520px] rounded-full blur-3xl"
          style={{
            background: glow,
          }}
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 10, scale: 0.99 }}
        animate={{
          opacity: 1,
          y: 0,
          scale: reduceMotion ? 1 : [1, 1.02, 1],
        }}
        transition={{ duration: reduceMotion ? 0.2 : 0.6, ease: "easeOut" }}
        className="relative z-10"
      >
        <div
          className="rounded-2xl backdrop-blur-md"
          style={{
            border: `1px solid ${border}`,
            background: isDark ? "rgba(10,12,15,0.45)" : "rgba(241,245,249,0.55)",
            boxShadow: isDark
              ? "0 30px 90px rgba(0,0,0,0.55), 0 10px 30px rgba(0,0,0,0.28)"
              : "0 30px 90px rgba(2,6,23,0.10), 0 10px 30px rgba(2,6,23,0.06)",
          }}
        >
          <div className="p-8 md:p-10">
            <div className="relative">
              <svg
                width="860"
                height="400"
                viewBox={`0 0 ${GRID_W} ${GRID_H}`}
                className="block w-[min(860px,92vw)] h-auto"
                aria-hidden="true"
              >
                <defs>
                  <linearGradient id="panelGrad" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor={isDark ? "#11151A" : "#F8FAFC"} stopOpacity="1" />
                    <stop offset="50%" stopColor={isDark ? "#0B0D10" : "#EEF2F7"} stopOpacity="1" />
                    <stop
                      offset="100%"
                      stopColor={isDark ? "#0E1117" : "#E6EAF2"}
                      stopOpacity="1"
                    />
                  </linearGradient>

                  <mask id="revealMask" maskUnits="userSpaceOnUse">
                    <rect x="0" y="0" width={GRID_W} height={GRID_H} fill="black" />
                    <g transform={`rotate(22 ${GRID_W / 2} ${GRID_H / 2})`}>
                      <motion.rect
                        x={-650}
                        y={-120}
                        width={650}
                        height={GRID_H + 240}
                        fill="white"
                        initial={false}
                        animate={
                          reduceMotion
                            ? { x: -650, opacity: 1 }
                            : { x: 950, opacity: [0.8, 1, 0.85] }
                        }
                        transition={
                          reduceMotion
                            ? { duration: 0 }
                            : {
                                duration: 1.5,
                                repeat: Infinity,
                                repeatType: "loop",
                                ease: "easeInOut",
                              }
                        }
                      />
                    </g>
                  </mask>
                </defs>

                {/* Subtle base panel */}
                <rect
                  x="10"
                  y="10"
                  width={GRID_W - 20}
                  height={GRID_H - 20}
                  rx="22"
                  fill="url(#panelGrad)"
                  opacity={isDark ? 0.9 : 0.95}
                />

                {/* Static background dots */}
                <g opacity={isDark ? 0.55 : 0.8}>
                  {squares
                    .filter((_, i) => i % 3 !== 0)
                    .map((sq, i) => (
                      <rect
                        key={`bg-${i}`}
                        x={sq.x}
                        y={sq.y}
                        width={sq.size}
                        height={sq.size}
                        rx="1"
                        fill={sq.color}
                        opacity={sq.opacity * (isDark ? 0.65 : 0.45)}
                      />
                    ))}
                </g>

                {/* Revealed grid */}
                <motion.g
                  mask="url(#revealMask)"
                  animate={
                    reduceMotion
                      ? { opacity: 1 }
                      : { opacity: [0.95, 1, 0.97] }
                  }
                  transition={
                    reduceMotion
                      ? { duration: 0 }
                      : { duration: 1.2, repeat: Infinity, repeatType: "reverse" }
                  }
                >
                  {squares.map((sq, i) => (
                    <rect
                      key={`sq-${i}`}
                      x={sq.x}
                      y={sq.y}
                      width={sq.size}
                      height={sq.size}
                      rx="1"
                      fill={sq.color}
                      opacity={sq.opacity * (isDark ? 0.9 : 0.75)}
                    />
                  ))}
                </motion.g>
              </svg>

              {/* Center label */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="text-center">
                  <div
                    className="inline-flex items-center justify-center rounded-full px-4 py-2 mb-4 border"
                    style={{
                      background: isDark ? "rgba(10,12,15,0.35)" : "rgba(248,250,252,0.55)",
                      borderColor: isDark ? "rgba(255,255,255,0.12)" : "rgba(15,23,42,0.12)",
                    }}
                  >
                    <span
                      className="text-sm font-[var(--font-secondary)] font-medium tracking-wide"
                      style={{ color: subtext }}
                    >
                      Meshspire Loading
                    </span>
                  </div>
                  <h2
                    className="text-3xl md:text-4xl font-extralight tracking-tight leading-tight"
                    style={{ color: text }}
                  >
                    Building Your Platform
                  </h2>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
