"use client";

import React, { useMemo } from "react";
import { ArrowRight } from "lucide-react";
import { useTheme } from "next-themes";

function srand(seed: number): number {
  const x = Math.sin(seed * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
}

const SQUARE_SIZE = 10;
const CELL_SIZE = 14;
const PATTERN_W = 1240;
const PATTERN_H = 500;

const orangeShades = ["#FFA629", "#FFB84D", "#FF9500", "#FFCA70", "#E89420"];
const blueShades = ["#809FFF", "#99B3FF", "#6688FF", "#B3C6FF", "#5577EE"];

const CTA = () => {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const squares = useMemo(() => {
    const result: Array<{ x: number; y: number; opacity: number; color: string }> = [];
    const cols = Math.floor(PATTERN_W / CELL_SIZE);
    const rows = Math.floor(PATTERN_H / CELL_SIZE);
    const halfCols = Math.ceil(cols / 2);

    for (let c = 0; c < halfCols; c++) {
      for (let r = 0; r < rows; r++) {
        const seed = c * 137 + r * 311 + 7919;
        const rand = srand(seed);
        const nx = c / halfCols;
        const ny = r / rows;

        const distFromEdgeX = nx;
        const distFromEdgeY = Math.min(ny, 1 - ny);

        let density = 0.03;

        if (distFromEdgeX < 0.12) density += 0.45;
        else if (distFromEdgeX < 0.22) density += 0.25;
        else if (distFromEdgeX < 0.35) density += 0.12;

        if (distFromEdgeY < 0.15) density += 0.3;
        else if (distFromEdgeY < 0.25) density += 0.15;

        if (distFromEdgeX < 0.2 && distFromEdgeY < 0.2) density += 0.25;

        if (distFromEdgeX > 0.4 && distFromEdgeY > 0.3) {
          density *= 0.3;
        }

        const wave = Math.sin(c * 0.5) * Math.cos(r * 0.4) * 0.05;
        density += Math.max(0, wave);

        if (rand < density) {
          const colorRand = srand(seed + 999);
          const shadeRand = srand(seed + 1234);
          const shadeIdx = Math.floor(shadeRand * 5);
          const color =
            colorRand < 0.55
              ? orangeShades[shadeIdx]
              : blueShades[shadeIdx];

          const opacity = 0.35 + srand(seed + 777) * 0.65;
          const leftX = c * CELL_SIZE;
          const mirrorX = PATTERN_W - c * CELL_SIZE - SQUARE_SIZE;
          const y = r * CELL_SIZE;

          result.push({ x: leftX, y, opacity, color });

          if (leftX !== mirrorX) {
            result.push({ x: mirrorX, y, opacity, color });
          }
        }
      }
    }
    return result;
  }, []);

  return (
    <section
      id="cta"
      className="relative w-full py-40 overflow-hidden bg-[var(--background)] transition-colors duration-700"
    >
      <svg
        className="absolute inset-0 w-full h-full"
        viewBox={`0 0 ${PATTERN_W} ${PATTERN_H}`}
        preserveAspectRatio="xMidYMid slice"
      >
        {squares.map((sq, i) => (
          <rect
            key={i}
            x={sq.x}
            y={sq.y}
            width={SQUARE_SIZE}
            height={SQUARE_SIZE}
            fill={sq.color}
            opacity={sq.opacity * (isDark ? 0.25 : 0.6)}
            rx={1}
          />
        ))}
      </svg>

      <div className="relative z-10 max-w-7xl mx-auto px-6">
        <div className="flex flex-col items-center text-center">
          <h2 className="font-[var(--font-primary)] text-5xl md:text-6xl font-extralight tracking-tight leading-tight text-[#0F172A] dark:text-[#F5F7FA] max-w-2xl">
            Start with your first lesson
          </h2>

          <div className="mt-12">
            <div className="group relative flex items-center" style={{ filter: "url(#gooey-cta)" }}>
              <a
                href="https://meshspire-core.vercel.app/"
                className="relative flex items-center font-[var(--font-secondary)] text-base font-normal
                  bg-[#FFA629] text-[#0F172A] dark:text-[#F5F7FA] rounded-full px-8 py-3
                  transition-colors duration-300 hover:bg-[#F09520]"
              >
                Get Started
              </a>
              <a
                href="https://meshspire-core.vercel.app/"
                className="absolute -right-2 flex items-center justify-center
                  w-11 h-11 rounded-full bg-[#FFA629] group-hover:bg-[#F09520]
                  text-[#0F172A] dark:text-[#F5F7FA]
                  transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)]
                  translate-x-0 scale-0 opacity-0
                  group-hover:translate-x-[105%] group-hover:scale-100 group-hover:opacity-100"
              >
                <ArrowRight size={17} strokeWidth={2.5} />
              </a>
            </div>
            <svg className="absolute w-0 h-0" aria-hidden="true">
              <defs>
                <filter id="gooey-cta">
                  <feGaussianBlur in="SourceGraphic" stdDeviation="5" result="blur" />
                  <feColorMatrix in="blur" mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 20 -10" result="gooey" />
                  <feComposite in="SourceGraphic" in2="gooey" operator="atop" />
                </filter>
              </defs>
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

export default CTA;
