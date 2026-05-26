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
    const dots: Array<{ cx: number; cy: number; r: number; opacity: number }> = [];
    const R = 78;
    const cx = 110;
    const cy = 110;

    for (let lat = -75; lat <= 75; lat += 12) {
      for (let lon = -170; lon < 180; lon += 15) {
        const theta = (lat * Math.PI) / 180;
        const phi = (lon * Math.PI) / 180;
        const x = Math.cos(theta) * Math.sin(phi);
        const y = Math.sin(theta);
        const z = Math.cos(theta) * Math.cos(phi);

        if (z < 0.08) continue;
        dots.push({
          cx: cx + R * x,
          cy: cy - R * y,
          r: 1 + z * 0.8,
          opacity: 0.15 + z * 0.55,
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
  const cardBg = isDark ? "#1C1F26" : "#FFFFFF";
  const cardBorder = isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)";
  const cardShadow = isDark
    ? "0 25px 60px rgba(0,0,0,0.4), 0 10px 24px rgba(0,0,0,0.28)"
    : "0 25px 60px rgba(0,0,0,0.08), 0 10px 24px rgba(0,0,0,0.04)";
  const badgeBorder = isDark ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.12)";
  const hrColor = isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)";
  const dotColor = isDark ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.15)";
  const labelColor = isDark ? "rgba(255,255,255,0.13)" : "rgba(0,0,0,0.13)";

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
          <h2 className="font-[var(--font-primary)] text-5xl font-thin tracking-tight leading-tight text-[#0F172A] dark:text-[#F5F7FA]">
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

          {/* Squiggly line decoration — top center */}
          <svg
            className="absolute"
            style={{ top: "-12px", left: "48%", width: "80px", height: "30px" }}
            viewBox="0 0 80 30"
          >
            <path
              d="M2 15 Q6 15 10 15 L15 15 L18 6 L22 24 L26 10 L30 19 L34 13 L38 15 Q44 15 50 15 L55 15 L58 7 L62 22 L66 12 Q72 15 78 15"
              fill="none"
              stroke={accent}
              strokeWidth="1.8"
              opacity="0.55"
            />
          </svg>

          {/* Secondary squiggly line */}
          <svg
            className="absolute"
            style={{
              top: "195px",
              left: "36%",
              width: "65px",
              height: "18px",
            }}
            viewBox="0 0 65 18"
          >
            <path
              d="M0 9 Q4 9 8 9 L12 5 L16 14 L20 7 L24 11 L28 9 Q34 9 42 9 L46 9 L50 5 L54 13 L58 9 L62 9"
              fill="none"
              stroke={accent}
              strokeWidth="1.4"
              opacity="0.4"
            />
          </svg>

          {/* Radar / spider chart decoration — bottom left */}
          <svg
            className="absolute"
            style={{ bottom: "100px", left: "110px", opacity: 0.4 }}
            width="130"
            height="130"
            viewBox="0 0 130 130"
          >
            {[45, 33, 22].map((r, i) => {
              const pts = Array.from({ length: 5 }, (_, j) => {
                const angle = ((j * 72 - 90) * Math.PI) / 180;
                return `${65 + r * Math.cos(angle)},${65 + r * Math.sin(angle)}`;
              }).join(" ");
              return (
                <polygon
                  key={i}
                  points={pts}
                  fill="none"
                  stroke={accent}
                  strokeWidth={1.2 - i * 0.2}
                  opacity={0.45 + i * 0.15}
                />
              );
            })}
            <polygon
              points={(() => {
                const radii = [38, 26, 15, 42, 30];
                return radii
                  .map((r, j) => {
                    const angle = ((j * 72 - 90) * Math.PI) / 180;
                    return `${65 + r * Math.cos(angle)},${65 + r * Math.sin(angle)}`;
                  })
                  .join(" ");
              })()}
              fill={`${accent}08`}
              stroke={accent}
              strokeWidth="1"
              opacity="0.35"
            />
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

          {/* ========== CARD 1: Subjects / Profile ========== */}
          <div
            className="absolute rounded-xl"
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
            {/* Subject 1 */}
            <div style={{ marginBottom: "18px" }}>
              <div className="flex items-center gap-2" style={{ marginBottom: "6px" }}>
                <span
                  className="font-semibold"
                  style={{ fontSize: "15px", color: textPrimary }}
                >
                  mathematics
                </span>
                <span
                  className="rounded-full"
                  style={{
                    fontSize: "10px",
                    padding: "2px 8px",
                    border: `1px solid ${badgeBorder}`,
                    color: muted,
                  }}
                >
                  Available
                </span>
              </div>
              <p style={{ fontSize: "12px", color: textSecondary, marginBottom: "10px" }}>
                Calculus, Linear Algebra, Statistics &amp; Probability for all levels
              </p>
              <div
                className="flex items-center"
                style={{ gap: "14px", fontSize: "11px", color: mutedLight }}
              >
                <span className="flex items-center" style={{ gap: "5px" }}>
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
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 16 16"
                    fill="currentColor"
                  >
                    <path d="M8 .25a.75.75 0 01.673.418l1.882 3.815 4.21.612a.75.75 0 01.416 1.279l-3.046 2.97.719 4.192a.75.75 0 01-1.088.791L8 12.347l-3.766 1.98a.75.75 0 01-1.088-.79l.72-4.194L.818 6.374a.75.75 0 01.416-1.28l4.21-.611L7.327.668A.75.75 0 018 .25z" />
                  </svg>
                  2
                </span>
                <span className="flex items-center" style={{ gap: "4px" }}>
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 16 16"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M5 3.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm0 2.122a2.25 2.25 0 10-1.5 0v.878A2.25 2.25 0 005.75 8.5h1.5v2.128a2.251 2.251 0 101.5 0V8.5h1.5a2.25 2.25 0 002.25-2.25v-.878a2.25 2.25 0 10-1.5 0v.878a.75.75 0 01-.75.75h-4.5A.75.75 0 015 6.25v-.878zm3.75 7.378a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm3-8.75a.75.75 0 100-1.5.75.75 0 000 1.5z"
                    />
                  </svg>
                  0
                </span>
                <span className="flex items-center" style={{ gap: "4px" }}>
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 16 16"
                    fill="currentColor"
                  >
                    <path d="M8 9.5a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" />
                    <path
                      fillRule="evenodd"
                      d="M8 0a8 8 0 100 16A8 8 0 008 0zM1.5 8a6.5 6.5 0 1113 0 6.5 6.5 0 01-13 0z"
                    />
                  </svg>
                  0
                </span>
                <span className="flex items-center" style={{ gap: "4px" }}>
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 16 16"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10.5 5a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0zm.061 3.073a4 4 0 10-5.123 0 6.004 6.004 0 00-3.431 5.142.75.75 0 001.498.07 4.5 4.5 0 018.99 0 .75.75 0 101.498-.07 6.005 6.005 0 00-3.432-5.142z"
                    />
                  </svg>
                  2
                </span>
              </div>
            </div>

            <hr style={{ borderColor: hrColor, marginBottom: "18px" }} />

            {/* Subject 2 */}
            <div>
              <div className="flex items-center gap-2" style={{ marginBottom: "6px" }}>
                <span
                  className="font-semibold"
                  style={{ fontSize: "15px", color: textPrimary }}
                >
                  computer-science
                </span>
                <span
                  className="rounded-full"
                  style={{
                    fontSize: "10px",
                    padding: "2px 8px",
                    border: `1px solid ${badgeBorder}`,
                    color: muted,
                  }}
                >
                  Popular
                </span>
              </div>
              <p style={{ fontSize: "12px", color: textSecondary, marginBottom: "10px" }}>
                Data Structures, Algorithms, Web Development &amp; Machine Learning
              </p>
              <div
                className="flex items-center"
                style={{ gap: "14px", fontSize: "11px", color: mutedLight }}
              >
                <span className="flex items-center" style={{ gap: "5px" }}>
                  <span
                    className="rounded-full"
                    style={{
                      width: "7px",
                      height: "7px",
                      backgroundColor: "#EF4444",
                      display: "inline-block",
                    }}
                  />
                  All Levels
                </span>
                <span className="flex items-center" style={{ gap: "4px" }}>
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 16 16"
                    fill="currentColor"
                  >
                    <path d="M8 .25a.75.75 0 01.673.418l1.882 3.815 4.21.612a.75.75 0 01.416 1.279l-3.046 2.97.719 4.192a.75.75 0 01-1.088.791L8 12.347l-3.766 1.98a.75.75 0 01-1.088-.79l.72-4.194L.818 6.374a.75.75 0 01.416-1.28l4.21-.611L7.327.668A.75.75 0 018 .25z" />
                  </svg>
                  1
                </span>
                <span className="flex items-center" style={{ gap: "4px" }}>
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 16 16"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M5 3.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm0 2.122a2.25 2.25 0 10-1.5 0v.878A2.25 2.25 0 005.75 8.5h1.5v2.128a2.251 2.251 0 101.5 0V8.5h1.5a2.25 2.25 0 002.25-2.25v-.878a2.25 2.25 0 10-1.5 0v.878a.75.75 0 01-.75.75h-4.5A.75.75 0 015 6.25v-.878zm3.75 7.378a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm3-8.75a.75.75 0 100-1.5.75.75 0 000 1.5z"
                    />
                  </svg>
                  0
                </span>
                <span className="flex items-center" style={{ gap: "4px" }}>
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 16 16"
                    fill="currentColor"
                  >
                    <path d="M8 9.5a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" />
                    <path
                      fillRule="evenodd"
                      d="M8 0a8 8 0 100 16A8 8 0 008 0zM1.5 8a6.5 6.5 0 1113 0 6.5 6.5 0 01-13 0z"
                    />
                  </svg>
                  0
                </span>
                <span className="flex items-center" style={{ gap: "4px" }}>
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 16 16"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10.5 5a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0zm.061 3.073a4 4 0 10-5.123 0 6.004 6.004 0 00-3.431 5.142.75.75 0 001.498.07 4.5 4.5 0 018.99 0 .75.75 0 101.498-.07 6.005 6.005 0 00-3.432-5.142z"
                    />
                  </svg>
                  1
                </span>
              </div>
            </div>
          </div>

          {/* ========== CARD 2: Matching Engine / Globe ========== */}
          <div
            className="absolute rounded-xl"
            style={{
              width: "380px",
              top: "5px",
              left: "420px",
              transform: "rotate(4deg)",
              zIndex: 3,
              padding: "22px 24px",
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
            <div
              style={{
                fontSize: "10px",
                letterSpacing: "0.2em",
                fontWeight: 500,
                color: muted,
                marginBottom: "8px",
              }}
            >
              MATCHING ENGINE
            </div>

            {/* Globe area */}
            <div className="relative flex justify-center">
              <svg width="220" height="220" viewBox="0 0 220 220">
                {/* Main circle */}
                <circle
                  cx="110"
                  cy="110"
                  r="85"
                  fill="none"
                  stroke={lineColorStrong}
                  strokeWidth="0.8"
                />
                {/* Latitude ellipses */}
                <ellipse
                  cx="110"
                  cy="68"
                  rx="78"
                  ry="16"
                  fill="none"
                  stroke={lineColor}
                  strokeWidth="0.6"
                />
                <ellipse
                  cx="110"
                  cy="110"
                  rx="85"
                  ry="34"
                  fill="none"
                  stroke={lineColor}
                  strokeWidth="0.6"
                />
                <ellipse
                  cx="110"
                  cy="152"
                  rx="68"
                  ry="13"
                  fill="none"
                  stroke={lineColor}
                  strokeWidth="0.6"
                />
                {/* Longitude ellipses */}
                <ellipse
                  cx="110"
                  cy="110"
                  rx="28"
                  ry="85"
                  fill="none"
                  stroke={lineColor}
                  strokeWidth="0.6"
                />
                <ellipse
                  cx="110"
                  cy="110"
                  rx="58"
                  ry="85"
                  fill="none"
                  stroke={lineColor}
                  strokeWidth="0.6"
                />
                {/* Central axes */}
                <line
                  x1="110"
                  y1="25"
                  x2="110"
                  y2="195"
                  stroke={lineColor}
                  strokeWidth="0.5"
                />
                <line
                  x1="25"
                  y1="110"
                  x2="195"
                  y2="110"
                  stroke={lineColor}
                  strokeWidth="0.5"
                />

                {/* Dot grid on sphere surface */}
                {globeDots.map((dot, i) => (
                  <circle
                    key={i}
                    cx={dot.cx}
                    cy={dot.cy}
                    r={dot.r}
                    fill={dotColor}
                    opacity={dot.opacity}
                  />
                ))}

                {/* Annotation connector lines */}
                <line
                  x1="172"
                  y1="48"
                  x2="210"
                  y2="18"
                  stroke={accent}
                  strokeWidth="1"
                  opacity="0.5"
                />
                <circle cx="210" cy="18" r="2" fill={accent} opacity="0.5" />

                <line
                  x1="42"
                  y1="118"
                  x2="8"
                  y2="130"
                  stroke={accent}
                  strokeWidth="1"
                  opacity="0.5"
                />
                <circle cx="8" cy="130" r="2" fill={accent} opacity="0.5" />

                <line
                  x1="172"
                  y1="168"
                  x2="208"
                  y2="200"
                  stroke={accent}
                  strokeWidth="1"
                  opacity="0.5"
                />
                <circle cx="208" cy="200" r="2" fill={accent} opacity="0.5" />
              </svg>

              {/* Corner labels */}
              <span
                className="absolute"
                style={{
                  fontSize: "9px",
                  letterSpacing: "0.15em",
                  fontWeight: 500,
                  top: "-2px",
                  right: "4px",
                  color: muted,
                }}
              >
                SUBJECT
              </span>
              <span
                className="absolute"
                style={{
                  fontSize: "9px",
                  letterSpacing: "0.15em",
                  fontWeight: 500,
                  top: "52%",
                  left: "-8px",
                  color: muted,
                }}
              >
                STYLE
              </span>
              <span
                className="absolute"
                style={{
                  fontSize: "9px",
                  letterSpacing: "0.15em",
                  fontWeight: 500,
                  bottom: "-4px",
                  right: "4px",
                  color: muted,
                }}
              >
                GOALS
              </span>
            </div>
          </div>

          {/* ========== CARD 3: Top Tutors ========== */}
          <div
            className="absolute rounded-xl"
            style={{
              width: "390px",
              top: "240px",
              left: "240px",
              transform: "rotate(-2deg)",
              zIndex: 4,
              padding: "24px 26px",
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
            <div
              style={{
                fontSize: "10px",
                letterSpacing: "0.2em",
                fontWeight: 500,
                color: muted,
                marginBottom: "18px",
              }}
            >
              TOP TUTORS
            </div>

            {[
              {
                initials: "SC",
                username: "drchen",
                name: "Dr. Sarah Chen",
                color: "#3B82F6",
              },
              {
                initials: "JM",
                username: "j_miller",
                name: "James Miller",
                color: "#EF4444",
              },
              {
                initials: "EW",
                username: "emmaw",
                name: "Emma Wilson",
                color: "#8B5CF6",
              },
              {
                initials: "DP",
                username: "davidpark",
                name: "David Park",
                color: "#10B981",
              },
            ].map((tutor, i) => (
              <div
                key={tutor.username}
                className="flex items-center"
                style={{ gap: "12px", marginBottom: i < 3 ? "14px" : 0 }}
              >
                <div
                  className="rounded-full flex items-center justify-center text-white shrink-0"
                  style={{
                    width: "32px",
                    height: "32px",
                    fontSize: "10px",
                    fontWeight: 600,
                    backgroundColor: tutor.color,
                  }}
                >
                  {tutor.initials}
                </div>
                <div className="flex items-center" style={{ gap: "8px" }}>
                  <span
                    className="font-bold"
                    style={{
                      fontSize: "13px",
                      color: isDark
                        ? "rgba(255,255,255,0.55)"
                        : "rgba(0,0,0,0.5)",
                    }}
                  >
                    {tutor.username}
                  </span>
                  <span style={{ fontSize: "13px", color: textPrimary }}>
                    {tutor.name}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* ========== HANDWRITTEN LABELS ========== */}
          <span
            className="absolute font-[var(--font-handwritten)] uppercase"
            style={{
              fontSize: "13px",
              letterSpacing: "0.12em",
              bottom: "150px",
              left: "65px",
              transform: "rotate(-10deg)",
              color: labelColor,
            }}
          >
            Personalized Learning
          </span>
          <span
            className="absolute font-[var(--font-handwritten)] uppercase"
            style={{
              fontSize: "13px",
              letterSpacing: "0.12em",
              top: "265px",
              left: "38%",
              transform: "rotate(2deg)",
              color: labelColor,
            }}
          >
            Expert Matching
          </span>
          <span
            className="absolute font-[var(--font-handwritten)] uppercase"
            style={{
              fontSize: "13px",
              letterSpacing: "0.12em",
              bottom: "205px",
              left: "155px",
              transform: "rotate(-5deg)",
              color: labelColor,
            }}
          >
            Flexibility
          </span>
          <span
            className="absolute font-[var(--font-handwritten)] uppercase"
            style={{
              fontSize: "12px",
              letterSpacing: "0.12em",
              bottom: "55px",
              left: "32%",
              transform: "rotate(1deg)",
              color: labelColor,
            }}
          >
            Endless
          </span>
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
