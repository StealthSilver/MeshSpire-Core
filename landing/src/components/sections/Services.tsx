"use client";

import React, { useMemo } from "react";
import { useTheme } from "next-themes";

function srand(seed: number): number {
  const x = Math.sin(seed * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
}

const SQUARE_SIZE = 10;
const CELL_SIZE = 14;
const PATTERN_W = 1240;
const PATTERN_H = 600;

const Services = () => {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const orangeShades = ["#FFA629", "#FFB84D", "#FF9500", "#FFCA70", "#E89420"];
  const blueShades = ["#809FFF", "#99B3FF", "#6688FF", "#B3C6FF", "#5577EE"];

  const squares = useMemo(() => {
    const result: Array<{ x: number; y: number; opacity: number; color: string }> = [];
    const cols = Math.floor(PATTERN_W / CELL_SIZE);
    const rows = Math.floor(PATTERN_H / CELL_SIZE);

    for (let c = 0; c < cols; c++) {
      for (let r = 0; r < rows; r++) {
        const seed = c * 137 + r * 311 + 42;
        const rand = srand(seed);
        const nx = c / cols;
        const ny = r / rows;

        let density = 0.04;

        if (nx > 0.9) density += 0.6;
        else if (nx > 0.84) density += 0.4;
        else if (nx > 0.78) density += 0.2;

        if (nx > 0.68 && ny > 0.68) density += 0.5;
        if (nx > 0.58 && ny > 0.82) density += 0.35;

        if (nx > 0.65 && ny < 0.22) density += 0.22;

        if (nx > 0.55 && ny > 0.38 && ny < 0.52) density += 0.15;

        if (nx < 0.08) density += 0.06;

        if (ny > 0.88) density += 0.18;

        if (ny < 0.1 && nx > 0.3 && nx < 0.6) density += 0.08;

        if (nx > 0.04 && nx < 0.72 && ny > 0.04 && ny < 0.88) {
          density *= 0.35;
        }

        const wave = Math.sin(c * 0.45) * Math.cos(r * 0.35) * 0.06;
        density += Math.max(0, wave);

        if (rand < density) {
          const colorRand = srand(seed + 999);
          const shadeRand = srand(seed + 1234);
          const shadeIdx = Math.floor(shadeRand * 5);
          const color =
            colorRand < 0.55
              ? orangeShades[shadeIdx]
              : blueShades[shadeIdx];

          result.push({
            x: c * CELL_SIZE,
            y: r * CELL_SIZE,
            opacity: 0.35 + srand(seed + 777) * 0.65,
            color,
          });
        }
      }
    }
    return result;
  }, []);


  const globeDots = useMemo(() => {
    const dots: Array<{ cx: number; cy: number; r: number; opacity: number; color: string }> = [];
    const R = 78;
    const cx = 110;
    const cy = 110;

    const pins = [
      { px: 148, py: 58, color: "#3B82F6" },
      { px: 62, py: 120, color: "#8B5CF6" },
      { px: 155, py: 155, color: "#10B981" },
    ];

    for (let lat = -75; lat <= 75; lat += 12) {
      for (let lon = -170; lon < 180; lon += 15) {
        const theta = (lat * Math.PI) / 180;
        const phi = (lon * Math.PI) / 180;
        const x = Math.cos(theta) * Math.sin(phi);
        const y = Math.sin(theta);
        const z = Math.cos(theta) * Math.cos(phi);

        if (z < 0.08) continue;

        const dotCx = cx + R * x;
        const dotCy = cy - R * y;

        let nearest = pins[0];
        let minDist = Infinity;
        for (const pin of pins) {
          const d = Math.hypot(dotCx - pin.px, dotCy - pin.py);
          if (d < minDist) { minDist = d; nearest = pin; }
        }

        dots.push({
          cx: dotCx,
          cy: dotCy,
          r: 1 + z * 0.8,
          opacity: 0.15 + z * 0.55,
          color: nearest.color,
        });
      }
    }
    return dots;
  }, []);

  const accent = isDark ? "#809FFF" : "#E8622A";
  const lineColor = isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.07)";
  const lineColorStrong = isDark ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.1)";


  const muted = isDark ? "rgba(255,255,255,0.4)" : "rgba(0,0,0,0.4)";
  const mutedLight = isDark ? "rgba(255,255,255,0.35)" : "rgba(0,0,0,0.35)";
  const textPrimary = isDark ? "#F5F7FA" : "#0F172A";
  const textSecondary = isDark ? "rgba(255,255,255,0.45)" : "rgba(0,0,0,0.45)";
  const cardBg = isDark ? "#0A0C0F" : "#F1F5F9";
  const cardBorder = isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)";
  const cardShadow = isDark
    ? "0 25px 60px rgba(0,0,0,0.4), 0 10px 24px rgba(0,0,0,0.28)"
    : "0 25px 60px rgba(0,0,0,0.08), 0 10px 24px rgba(0,0,0,0.04)";
  const badgeBorder = isDark ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.12)";
  const hrColor = isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)";



  return (
    <section
      id="platform"
      className="relative w-full py-32 overflow-hidden bg-[var(--background)] transition-colors duration-700"
    >
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-16">
          <span className="inline-block text-sm font-[var(--font-secondary)] font-medium tracking-widest uppercase text-[#809FFF] mb-6">
            How it works
          </span>
          <h2 className="font-[var(--font-primary)] text-5xl font-extralight tracking-tight leading-tight text-[#0F172A] dark:text-[#F5F7FA]">
            Three steps to better learning
          </h2>
        </div>

        {/* Visual composition */}
        <div className="relative" style={{ height: "620px" }}>
          {/* Square pattern background */}
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

          {/* Blueprint grid — bottom right decorative element */}
          <svg
            className="absolute"
            style={{
              bottom: "10px",
              right: "180px",
              opacity: isDark ? 0.06 : 0.08,
            }}
            width="160"
            height="120"
            viewBox="0 0 160 120"
          >
            {Array.from({ length: 9 }, (_, i) => (
              <line
                key={`h${i}`}
                x1="0"
                y1={i * 15}
                x2="160"
                y2={i * 15}
                stroke={textPrimary}
                strokeWidth="0.5"
              />
            ))}
            {Array.from({ length: 12 }, (_, i) => (
              <line
                key={`v${i}`}
                x1={i * 15}
                y1="0"
                x2={i * 15}
                y2="120"
                stroke={textPrimary}
                strokeWidth="0.5"
              />
            ))}
            <rect
              x="15"
              y="15"
              width="60"
              height="45"
              fill="none"
              stroke={textPrimary}
              strokeWidth="1"
            />
            <rect
              x="90"
              y="30"
              width="45"
              height="60"
              fill="none"
              stroke={textPrimary}
              strokeWidth="1"
            />
            <line
              x1="45"
              y1="15"
              x2="45"
              y2="60"
              stroke={textPrimary}
              strokeWidth="0.7"
            />
          </svg>

          {/* ========== CARD 1: Plan Your Lessons ========== */}
          <div
            className="absolute rounded-lg"
            style={{
              width: "370px",
              top: "35px",
              left: "50px",
              transform: "rotate(-6deg)",
              zIndex: 2,
              padding: "26px 28px",
              background: cardBg,
              border: `1px solid ${cardBorder}`,
              boxShadow: cardShadow,
            }}
          >
            <div
              className="absolute flex items-center justify-center rounded-full font-[var(--font-primary)] font-medium"
              style={{
                width: "28px",
                height: "28px",
                top: "-12px",
                left: "-10px",
                fontSize: "13px",
                backgroundColor: "#FFA629",
                color: "#fff",
                boxShadow: "0 2px 8px rgba(255,166,41,0.4)",
              }}
            >
              1
            </div>

            <h3
              className="font-[var(--font-primary)] font-semibold"
              style={{ fontSize: "16px", color: textPrimary, marginBottom: "20px" }}
            >
              Plan Your Lessons
            </h3>

            {/* Lesson 1 — Mathematics */}
            <div style={{ marginBottom: "18px" }}>
              <div className="flex items-center justify-between" style={{ marginBottom: "6px" }}>
                <span
                  className="font-semibold"
                  style={{ fontSize: "15px", color: textPrimary }}
                >
                  Mathematics
                </span>
                <span style={{ fontSize: "11px", color: muted }}>
                  Dr. Sarah Chen
                </span>
              </div>
              <p style={{ fontSize: "12px", color: textSecondary, marginBottom: "10px" }}>
                Calculus, Linear Algebra, Statistics &amp; Probability for all levels
              </p>
              <div
                className="flex items-center flex-wrap"
                style={{ gap: "12px", fontSize: "11px", color: mutedLight }}
              >
                <span
                  className="flex items-center"
                  style={{ gap: "5px" }}
                >
                  <span
                    className="rounded-full"
                    style={{
                      width: "7px",
                      height: "7px",
                      backgroundColor: "#3B82F6",
                      display: "inline-block",
                    }}
                  />
                  Advanced
                </span>
                <span className="flex items-center" style={{ gap: "4px" }}>
                  <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor">
                    <path d="M4.75 0a.75.75 0 01.75.75V2h5V.75a.75.75 0 011.5 0V2h1.25c.966 0 1.75.784 1.75 1.75v10.5A1.75 1.75 0 0113.25 16H2.75A1.75 1.75 0 011 14.25V3.75C1 2.784 1.784 2 2.75 2H4V.75A.75.75 0 014.75 0zM2.5 7v7.25c0 .138.112.25.25.25h10.5a.25.25 0 00.25-.25V7h-11z" />
                  </svg>
                  Jun 2
                </span>
                <span className="flex items-center" style={{ gap: "4px" }}>
                  <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor">
                    <path fillRule="evenodd" d="M8 0a8 8 0 100 16A8 8 0 008 0zM1.5 8a6.5 6.5 0 1113 0 6.5 6.5 0 01-13 0zm7.25-3.25a.75.75 0 00-1.5 0v2.5h-2a.75.75 0 000 1.5h2.75a.75.75 0 00.75-.75v-3.25z" />
                  </svg>
                  10:00 AM
                </span>
                <span className="flex items-center" style={{ gap: "4px" }}>
                  <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor">
                    <path d="M8 .25a.75.75 0 01.673.418l1.882 3.815 4.21.612a.75.75 0 01.416 1.279l-3.046 2.97.719 4.192a.75.75 0 01-1.088.791L8 12.347l-3.766 1.98a.75.75 0 01-1.088-.79l.72-4.194L.818 6.374a.75.75 0 01.416-1.28l4.21-.611L7.327.668A.75.75 0 018 .25z" />
                  </svg>
                  4.8
                </span>
                <span className="flex items-center" style={{ gap: "4px" }}>
                  <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor">
                    <path fillRule="evenodd" d="M5 3.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm0 2.122a2.25 2.25 0 10-1.5 0v.878A2.25 2.25 0 005.75 8.5h1.5v2.128a2.251 2.251 0 101.5 0V8.5h1.5a2.25 2.25 0 002.25-2.25v-.878a2.25 2.25 0 10-1.5 0v.878a.75.75 0 01-.75.75h-4.5A.75.75 0 015 6.25v-.878zm3.75 7.378a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm3-8.75a.75.75 0 100-1.5.75.75 0 000 1.5z" />
                  </svg>
                  3
                </span>
              </div>
            </div>

            <hr style={{ borderColor: hrColor, marginBottom: "18px" }} />

            {/* Lesson 2 — Chemistry */}
            <div>
              <div className="flex items-center justify-between" style={{ marginBottom: "6px" }}>
                <span
                  className="font-semibold"
                  style={{ fontSize: "15px", color: textPrimary }}
                >
                  Chemistry
                </span>
                <span style={{ fontSize: "11px", color: muted }}>
                  James Miller
                </span>
              </div>
              <p style={{ fontSize: "12px", color: textSecondary, marginBottom: "10px" }}>
                Organic &amp; Inorganic Chemistry, Thermodynamics &amp; Chemical Bonding
              </p>
              <div
                className="flex items-center flex-wrap"
                style={{ gap: "12px", fontSize: "11px", color: mutedLight }}
              >
                <span
                  className="flex items-center"
                  style={{ gap: "5px" }}
                >
                  <span
                    className="rounded-full"
                    style={{
                      width: "7px",
                      height: "7px",
                      backgroundColor: "#8B5CF6",
                      display: "inline-block",
                    }}
                  />
                  Advanced
                </span>
                <span className="flex items-center" style={{ gap: "4px" }}>
                  <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor">
                    <path d="M4.75 0a.75.75 0 01.75.75V2h5V.75a.75.75 0 011.5 0V2h1.25c.966 0 1.75.784 1.75 1.75v10.5A1.75 1.75 0 0113.25 16H2.75A1.75 1.75 0 011 14.25V3.75C1 2.784 1.784 2 2.75 2H4V.75A.75.75 0 014.75 0zM2.5 7v7.25c0 .138.112.25.25.25h10.5a.25.25 0 00.25-.25V7h-11z" />
                  </svg>
                  Jun 4
                </span>
                <span className="flex items-center" style={{ gap: "4px" }}>
                  <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor">
                    <path fillRule="evenodd" d="M8 0a8 8 0 100 16A8 8 0 008 0zM1.5 8a6.5 6.5 0 1113 0 6.5 6.5 0 01-13 0zm7.25-3.25a.75.75 0 00-1.5 0v2.5h-2a.75.75 0 000 1.5h2.75a.75.75 0 00.75-.75v-3.25z" />
                  </svg>
                  2:30 PM
                </span>
                <span className="flex items-center" style={{ gap: "4px" }}>
                  <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor">
                    <path d="M8 .25a.75.75 0 01.673.418l1.882 3.815 4.21.612a.75.75 0 01.416 1.279l-3.046 2.97.719 4.192a.75.75 0 01-1.088.791L8 12.347l-3.766 1.98a.75.75 0 01-1.088-.79l.72-4.194L.818 6.374a.75.75 0 01.416-1.28l4.21-.611L7.327.668A.75.75 0 018 .25z" />
                  </svg>
                  4.6
                </span>
                <span className="flex items-center" style={{ gap: "4px" }}>
                  <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor">
                    <path fillRule="evenodd" d="M5 3.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm0 2.122a2.25 2.25 0 10-1.5 0v.878A2.25 2.25 0 005.75 8.5h1.5v2.128a2.251 2.251 0 101.5 0V8.5h1.5a2.25 2.25 0 002.25-2.25v-.878a2.25 2.25 0 10-1.5 0v.878a.75.75 0 01-.75.75h-4.5A.75.75 0 015 6.25v-.878zm3.75 7.378a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm3-8.75a.75.75 0 100-1.5.75.75 0 000 1.5z" />
                  </svg>
                  5
                </span>
              </div>
            </div>
          </div>

          {/* ========== CARD 2: Get Better Matches ========== */}
          <div
            className="absolute rounded-lg"
            style={{
              width: "370px",
              top: "5px",
              left: "420px",
              transform: "rotate(4deg)",
              zIndex: 3,
              padding: "26px 28px",
              background: cardBg,
              border: `1px solid ${cardBorder}`,
              boxShadow: cardShadow,
            }}
          >
            <div
              className="absolute flex items-center justify-center rounded-full font-[var(--font-primary)] font-medium"
              style={{
                width: "28px",
                height: "28px",
                top: "-12px",
                left: "-10px",
                fontSize: "13px",
                backgroundColor: "#FFA629",
                color: "#fff",
                boxShadow: "0 2px 8px rgba(255,166,41,0.4)",
              }}
            >
              2
            </div>

            <h3
              className="font-[var(--font-primary)] font-semibold"
              style={{ fontSize: "16px", color: textPrimary, marginBottom: "20px" }}
            >
              Get Better Matches
            </h3>

            {/* Match 1 */}
            <div style={{ marginBottom: "18px" }}>
              <div className="flex items-center" style={{ gap: "12px", marginBottom: "10px" }}>
                <div
                  className="rounded-full flex items-center justify-center text-white shrink-0"
                  style={{
                    width: "36px",
                    height: "36px",
                    fontSize: "11px",
                    fontWeight: 600,
                    backgroundColor: "#3B82F6",
                  }}
                >
                  SC
                </div>
                <div style={{ flex: 1 }}>
                  <div className="flex items-center justify-between">
                    <span className="font-semibold" style={{ fontSize: "14px", color: textPrimary }}>
                      Dr. Sarah Chen
                    </span>
                    <span
                      className="rounded-full font-medium"
                      style={{
                        fontSize: "10px",
                        padding: "2px 10px",
                        backgroundColor: isDark ? "rgba(16,185,129,0.15)" : "rgba(16,185,129,0.1)",
                        color: "#10B981",
                      }}
                    >
                      98% Match
                    </span>
                  </div>
                  <p style={{ fontSize: "12px", color: textSecondary, marginTop: "2px" }}>
                    Mathematics &middot; Calculus &amp; Linear Algebra
                  </p>
                </div>
              </div>
              <div
                className="flex items-center flex-wrap"
                style={{ gap: "12px", fontSize: "11px", color: mutedLight, paddingLeft: "48px" }}
              >
                <span className="flex items-center" style={{ gap: "4px" }}>
                  <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor">
                    <path d="M8 .25a.75.75 0 01.673.418l1.882 3.815 4.21.612a.75.75 0 01.416 1.279l-3.046 2.97.719 4.192a.75.75 0 01-1.088.791L8 12.347l-3.766 1.98a.75.75 0 01-1.088-.79l.72-4.194L.818 6.374a.75.75 0 01.416-1.28l4.21-.611L7.327.668A.75.75 0 018 .25z" />
                  </svg>
                  4.9
                </span>
                <span className="flex items-center" style={{ gap: "4px" }}>
                  <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor">
                    <path fillRule="evenodd" d="M8 0a8 8 0 100 16A8 8 0 008 0zM1.5 8a6.5 6.5 0 1113 0 6.5 6.5 0 01-13 0zm7.25-3.25a.75.75 0 00-1.5 0v2.5h-2a.75.75 0 000 1.5h2.75a.75.75 0 00.75-.75v-3.25z" />
                  </svg>
                  8 yrs exp
                </span>
                <span className="flex items-center" style={{ gap: "4px" }}>
                  <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor">
                    <path fillRule="evenodd" d="M10.5 5a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0zm.061 3.073a4 4 0 10-5.123 0 6.004 6.004 0 00-3.431 5.142.75.75 0 001.498.07 4.5 4.5 0 018.99 0 .75.75 0 101.498-.07 6.005 6.005 0 00-3.432-5.142z" />
                  </svg>
                  142 students
                </span>
              </div>
            </div>

            <hr style={{ borderColor: hrColor, marginBottom: "18px" }} />

            {/* Match 2 */}
            <div style={{ marginBottom: "18px" }}>
              <div className="flex items-center" style={{ gap: "12px", marginBottom: "10px" }}>
                <div
                  className="rounded-full flex items-center justify-center text-white shrink-0"
                  style={{
                    width: "36px",
                    height: "36px",
                    fontSize: "11px",
                    fontWeight: 600,
                    backgroundColor: "#8B5CF6",
                  }}
                >
                  EW
                </div>
                <div style={{ flex: 1 }}>
                  <div className="flex items-center justify-between">
                    <span className="font-semibold" style={{ fontSize: "14px", color: textPrimary }}>
                      Emma Wilson
                    </span>
                    <span
                      className="rounded-full font-medium"
                      style={{
                        fontSize: "10px",
                        padding: "2px 10px",
                        backgroundColor: isDark ? "rgba(16,185,129,0.15)" : "rgba(16,185,129,0.1)",
                        color: "#10B981",
                      }}
                    >
                      94% Match
                    </span>
                  </div>
                  <p style={{ fontSize: "12px", color: textSecondary, marginTop: "2px" }}>
                    Chemistry &middot; Organic &amp; Thermodynamics
                  </p>
                </div>
              </div>
              <div
                className="flex items-center flex-wrap"
                style={{ gap: "12px", fontSize: "11px", color: mutedLight, paddingLeft: "48px" }}
              >
                <span className="flex items-center" style={{ gap: "4px" }}>
                  <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor">
                    <path d="M8 .25a.75.75 0 01.673.418l1.882 3.815 4.21.612a.75.75 0 01.416 1.279l-3.046 2.97.719 4.192a.75.75 0 01-1.088.791L8 12.347l-3.766 1.98a.75.75 0 01-1.088-.79l.72-4.194L.818 6.374a.75.75 0 01.416-1.28l4.21-.611L7.327.668A.75.75 0 018 .25z" />
                  </svg>
                  4.7
                </span>
                <span className="flex items-center" style={{ gap: "4px" }}>
                  <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor">
                    <path fillRule="evenodd" d="M8 0a8 8 0 100 16A8 8 0 008 0zM1.5 8a6.5 6.5 0 1113 0 6.5 6.5 0 01-13 0zm7.25-3.25a.75.75 0 00-1.5 0v2.5h-2a.75.75 0 000 1.5h2.75a.75.75 0 00.75-.75v-3.25z" />
                  </svg>
                  5 yrs exp
                </span>
                <span className="flex items-center" style={{ gap: "4px" }}>
                  <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor">
                    <path fillRule="evenodd" d="M10.5 5a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0zm.061 3.073a4 4 0 10-5.123 0 6.004 6.004 0 00-3.431 5.142.75.75 0 001.498.07 4.5 4.5 0 018.99 0 .75.75 0 101.498-.07 6.005 6.005 0 00-3.432-5.142z" />
                  </svg>
                  89 students
                </span>
              </div>
            </div>

            <hr style={{ borderColor: hrColor, marginBottom: "18px" }} />

            {/* Match 3 */}
            <div>
              <div className="flex items-center" style={{ gap: "12px", marginBottom: "10px" }}>
                <div
                  className="rounded-full flex items-center justify-center text-white shrink-0"
                  style={{
                    width: "36px",
                    height: "36px",
                    fontSize: "11px",
                    fontWeight: 600,
                    backgroundColor: "#EF4444",
                  }}
                >
                  JM
                </div>
                <div style={{ flex: 1 }}>
                  <div className="flex items-center justify-between">
                    <span className="font-semibold" style={{ fontSize: "14px", color: textPrimary }}>
                      James Miller
                    </span>
                    <span
                      className="rounded-full font-medium"
                      style={{
                        fontSize: "10px",
                        padding: "2px 10px",
                        backgroundColor: isDark ? "rgba(16,185,129,0.15)" : "rgba(16,185,129,0.1)",
                        color: "#10B981",
                      }}
                    >
                      91% Match
                    </span>
                  </div>
                  <p style={{ fontSize: "12px", color: textSecondary, marginTop: "2px" }}>
                    Mathematics &middot; Statistics &amp; Probability
                  </p>
                </div>
              </div>
              <div
                className="flex items-center flex-wrap"
                style={{ gap: "12px", fontSize: "11px", color: mutedLight, paddingLeft: "48px" }}
              >
                <span className="flex items-center" style={{ gap: "4px" }}>
                  <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor">
                    <path d="M8 .25a.75.75 0 01.673.418l1.882 3.815 4.21.612a.75.75 0 01.416 1.279l-3.046 2.97.719 4.192a.75.75 0 01-1.088.791L8 12.347l-3.766 1.98a.75.75 0 01-1.088-.79l.72-4.194L.818 6.374a.75.75 0 01.416-1.28l4.21-.611L7.327.668A.75.75 0 018 .25z" />
                  </svg>
                  4.8
                </span>
                <span className="flex items-center" style={{ gap: "4px" }}>
                  <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor">
                    <path fillRule="evenodd" d="M8 0a8 8 0 100 16A8 8 0 008 0zM1.5 8a6.5 6.5 0 1113 0 6.5 6.5 0 01-13 0zm7.25-3.25a.75.75 0 00-1.5 0v2.5h-2a.75.75 0 000 1.5h2.75a.75.75 0 00.75-.75v-3.25z" />
                  </svg>
                  6 yrs exp
                </span>
                <span className="flex items-center" style={{ gap: "4px" }}>
                  <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor">
                    <path fillRule="evenodd" d="M10.5 5a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0zm.061 3.073a4 4 0 10-5.123 0 6.004 6.004 0 00-3.431 5.142.75.75 0 001.498.07 4.5 4.5 0 018.99 0 .75.75 0 101.498-.07 6.005 6.005 0 00-3.432-5.142z" />
                  </svg>
                  113 students
                </span>
              </div>
            </div>
          </div>

          {/* ========== CARD 3: Better Learning Experience ========== */}
          <div
            className="absolute rounded-lg"
            style={{
              width: "370px",
              top: "240px",
              left: "240px",
              transform: "rotate(-2deg)",
              zIndex: 4,
              padding: "26px 28px",
              background: cardBg,
              border: `1px solid ${cardBorder}`,
              boxShadow: cardShadow,
            }}
          >
            <div
              className="absolute flex items-center justify-center rounded-full font-[var(--font-primary)] font-medium"
              style={{
                width: "28px",
                height: "28px",
                top: "-12px",
                left: "-10px",
                fontSize: "13px",
                backgroundColor: "#FFA629",
                color: "#fff",
                boxShadow: "0 2px 8px rgba(255,166,41,0.4)",
              }}
            >
              3
            </div>

            <h3
              className="font-[var(--font-primary)] font-semibold"
              style={{ fontSize: "16px", color: textPrimary, marginBottom: "16px" }}
            >
              Better Learning Experience
            </h3>

            {/* Globe illustration */}
            <div className="relative flex justify-center" style={{ marginBottom: "16px" }}>
              <svg width="180" height="180" viewBox="0 0 220 220">
                <circle
                  cx="110"
                  cy="110"
                  r="85"
                  fill="none"
                  stroke={lineColorStrong}
                  strokeWidth="0.8"
                />
                <ellipse cx="110" cy="68" rx="78" ry="16" fill="none" stroke={lineColor} strokeWidth="0.6" />
                <ellipse cx="110" cy="110" rx="85" ry="34" fill="none" stroke={lineColor} strokeWidth="0.6" />
                <ellipse cx="110" cy="152" rx="68" ry="13" fill="none" stroke={lineColor} strokeWidth="0.6" />
                <ellipse cx="110" cy="110" rx="28" ry="85" fill="none" stroke={lineColor} strokeWidth="0.6" />
                <ellipse cx="110" cy="110" rx="58" ry="85" fill="none" stroke={lineColor} strokeWidth="0.6" />
                <line x1="110" y1="25" x2="110" y2="195" stroke={lineColor} strokeWidth="0.5" />
                <line x1="25" y1="110" x2="195" y2="110" stroke={lineColor} strokeWidth="0.5" />

                {globeDots.map((dot, i) => (
                  <circle
                    key={i}
                    cx={dot.cx}
                    cy={dot.cy}
                    r={dot.r}
                    fill={dot.color}
                    opacity={dot.opacity}
                  />
                ))}

                {/* Highlight nodes */}
                <circle cx="148" cy="58" r="6" fill="#3B82F6" opacity="0.7" />
                <circle cx="62" cy="120" r="6" fill="#8B5CF6" opacity="0.7" />
                <circle cx="155" cy="155" r="6" fill="#10B981" opacity="0.7" />

                {/* Connector lines to labels */}
                <line x1="154" y1="56" x2="195" y2="36" stroke="#3B82F6" strokeWidth="1" opacity="0.5" />
                <line x1="56" y1="120" x2="12" y2="120" stroke="#8B5CF6" strokeWidth="1" opacity="0.5" />
                <line x1="160" y1="158" x2="198" y2="185" stroke="#10B981" strokeWidth="1" opacity="0.5" />
              </svg>

              {/* Labels around the globe */}
              <span
                className="absolute"
                style={{ fontSize: "9px", letterSpacing: "0.12em", fontWeight: 600, top: "8px", right: "12px", color: "#3B82F6" }}
              >
                PACE
              </span>
              <span
                className="absolute"
                style={{ fontSize: "9px", letterSpacing: "0.12em", fontWeight: 600, top: "46%", left: "-4px", color: "#8B5CF6" }}
              >
                DEPTH
              </span>
              <span
                className="absolute"
                style={{ fontSize: "9px", letterSpacing: "0.12em", fontWeight: 600, bottom: "2px", right: "6px", color: "#10B981" }}
              >
                TRANSITION
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Subtle divider */}
      <div className="absolute bottom-0 left-0 right-0">
        <hr className="border-t border-[var(--foreground)]/10" />
      </div>
    </section>
  );
};

export default Services;
