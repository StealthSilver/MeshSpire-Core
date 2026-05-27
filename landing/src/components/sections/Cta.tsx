"use client";

import React, { useMemo } from "react";
import { useTheme } from "next-themes";

const hash = (n: number) => {
  const x = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};

const MeshPattern = ({ isDark }: { isDark: boolean }) => {
  const nodes = useMemo(() => {
    const pts: Array<{ x: number; y: number; r: number; color: string; opacity: number }> = [];
    const colors = ["#FFA629", "#809FFF"];

    for (let i = 0; i < 80; i++) {
      const angle = hash(i * 7 + 42) * Math.PI * 2;
      const dist = 60 + hash(i * 13 + 99) * 340;
      pts.push({
        x: 500 + Math.cos(angle) * dist,
        y: 200 + Math.sin(angle) * dist * 0.5,
        r: 1 + hash(i * 17 + 200) * 3,
        color: colors[hash(i * 23 + 300) > 0.45 ? 1 : 0],
        opacity: 0.08 + hash(i * 29 + 400) * 0.18,
      });
    }
    return pts;
  }, []);

  const lines = useMemo(() => {
    const result: Array<{ x1: number; y1: number; x2: number; y2: number; opacity: number }> = [];
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const dx = nodes[i].x - nodes[j].x;
        const dy = nodes[i].y - nodes[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 120 && hash(i * 31 + j * 37) > 0.55) {
          result.push({
            x1: nodes[i].x,
            y1: nodes[i].y,
            x2: nodes[j].x,
            y2: nodes[j].y,
            opacity: 0.03 + (1 - dist / 120) * 0.06,
          });
        }
      }
    }
    return result;
  }, [nodes]);

  const ringStroke = isDark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.03)";

  return (
    <svg
      viewBox="0 0 1000 400"
      className="absolute inset-0 w-full h-full"
      preserveAspectRatio="xMidYMid slice"
    >
      {[100, 180, 270, 360].map((r, i) => (
        <ellipse
          key={i}
          cx="500"
          cy="200"
          rx={r}
          ry={r * 0.5}
          fill="none"
          stroke={ringStroke}
          strokeWidth="0.8"
          strokeDasharray={i % 2 === 0 ? "4,6" : "none"}
        />
      ))}

      {lines.map((l, i) => (
        <line
          key={`l-${i}`}
          x1={l.x1}
          y1={l.y1}
          x2={l.x2}
          y2={l.y2}
          stroke={isDark ? "#F5F7FA" : "#0F172A"}
          strokeWidth="0.4"
          opacity={l.opacity}
        />
      ))}

      {nodes.map((n, i) => (
        <circle
          key={`n-${i}`}
          cx={n.x}
          cy={n.y}
          r={n.r}
          fill={n.color}
          opacity={n.opacity}
        />
      ))}
    </svg>
  );
};

const CTA = () => {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const cardBg = isDark ? "#0A0C0F" : "#F1F5F9";
  const cardBorder = isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)";

  return (
    <section
      id="cta"
      className="relative w-full py-32 overflow-hidden bg-[var(--background)] transition-colors duration-700"
    >
      <div className="max-w-7xl mx-auto px-6">
        <div
          className="relative rounded-2xl overflow-hidden"
          style={{
            background: cardBg,
            border: `1px solid ${cardBorder}`,
          }}
        >
          <MeshPattern isDark={isDark} />

          <div className="relative z-10 flex flex-col items-center text-center py-28 px-8">
            <span className="inline-block text-sm font-[var(--font-secondary)] font-medium tracking-widest uppercase text-[#809FFF] mb-6">
              Get Started
            </span>

            <h2 className="font-[var(--font-primary)] text-5xl md:text-6xl font-extralight tracking-tight leading-tight text-[#0F172A] dark:text-[#F5F7FA] max-w-2xl">
              Your best learning<br />starts here
            </h2>

            <p className="mt-6 max-w-lg font-[var(--font-secondary)] text-base font-light leading-relaxed text-[#0F172A]/50 dark:text-[#F5F7FA]/50">
              Join thousands of students already learning smarter. Find your perfect tutor, set your own schedule, and start growing today.
            </p>

            <div className="flex items-center gap-4 mt-10">
              <a
                href="#"
                className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full font-[var(--font-primary)] text-sm font-medium text-white transition-all duration-300 hover:scale-[1.03] active:scale-[0.98]"
                style={{
                  backgroundColor: "#FFA629",
                  boxShadow: "0 4px 20px rgba(255,166,41,0.35)",
                }}
              >
                Start Learning
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M3.5 8H12.5M12.5 8L8.5 4M12.5 8L8.5 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </a>

              <a
                href="#platform"
                className="inline-flex items-center px-8 py-3.5 rounded-full font-[var(--font-primary)] text-sm font-medium transition-all duration-300 hover:scale-[1.03] active:scale-[0.98] text-[#0F172A] dark:text-[#F5F7FA]"
                style={{
                  border: `1px solid ${isDark ? "rgba(255,255,255,0.15)" : "rgba(0,0,0,0.12)"}`,
                }}
              >
                See How It Works
              </a>
            </div>
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
