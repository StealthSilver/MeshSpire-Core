"use client";

import React, { useState, useMemo, useCallback, useEffect, useRef } from "react";
import { useIsDark } from "@/hooks/useIsDark";
import { useDrag } from "@/hooks/useDrag";

interface Subject {
  name: string;
  color: string;
  accent: string;
}

const SUBJECTS: Subject[] = [
  { name: "Mathematics",             color: "#809FFF", accent: "#FFA629" },
  { name: "Physics",                 color: "#FFA629", accent: "#809FFF" },
  { name: "Chemistry",               color: "#22C55E", accent: "#FFA629" },
  { name: "Biology",                 color: "#10B981", accent: "#A855F7" },
  { name: "Computer Science",        color: "#809FFF", accent: "#22C55E" },
  { name: "Information Technology",   color: "#6366F1", accent: "#0EA5E9" },
  { name: "Economics",               color: "#F59E0B", accent: "#22C55E" },
  { name: "Accountancy",             color: "#FFA629", accent: "#809FFF" },
  { name: "Business Studies",        color: "#0EA5E9", accent: "#FFA629" },
  { name: "Statistics",              color: "#809FFF", accent: "#F59E0B" },
  { name: "Geography",               color: "#22C55E", accent: "#0EA5E9" },
  { name: "History",                  color: "#B45309", accent: "#F59E0B" },
  { name: "Political Science",       color: "#DC2626", accent: "#F59E0B" },
  { name: "Psychology",              color: "#A855F7", accent: "#F59E0B" },
  { name: "Sociology",               color: "#0EA5E9", accent: "#A855F7" },
  { name: "Environmental Science",   color: "#22C55E", accent: "#F59E0B" },
  { name: "Astronomy",               color: "#6366F1", accent: "#F59E0B" },
  { name: "Biotechnology",           color: "#10B981", accent: "#809FFF" },
  { name: "Artificial Intelligence",  color: "#809FFF", accent: "#FFA629" },
  { name: "Engineering Graphics",    color: "#F59E0B", accent: "#809FFF" },
  { name: "Health Education",        color: "#EF4444", accent: "#22C55E" },
  { name: "Value Education",         color: "#F59E0B", accent: "#A855F7" },
  { name: "Agriculture",             color: "#22C55E", accent: "#B45309" },
  { name: "Mechanical Engineering",  color: "#64748B", accent: "#FFA629" },
  { name: "Civil Engineering",       color: "#F59E0B", accent: "#64748B" },
  { name: "Electrical Engineering",  color: "#FFA629", accent: "#0EA5E9" },
  { name: "Finance",                 color: "#22C55E", accent: "#F59E0B" },
  { name: "Marketing",               color: "#EC4899", accent: "#FFA629" },
  { name: "Entrepreneurship",        color: "#FFA629", accent: "#809FFF" },
  { name: "Philosophy",              color: "#A855F7", accent: "#809FFF" },
  { name: "Geology",                 color: "#B45309", accent: "#22C55E" },
  { name: "Anthropology",            color: "#DC2626", accent: "#F59E0B" },
  { name: "Archaeology",             color: "#B45309", accent: "#DC2626" },
  { name: "Criminology",             color: "#64748B", accent: "#DC2626" },
];

const CARD_W = 152;
const CARD_H = 200;
const FOLD = 20;
const CARD_RADIUS = 8; // matches rounded-lg
const MAX_CARD_ROTATION_DEG = 10; // subject tilt + stacked back paper

/** Extra space so rotated cards and borders are not clipped by overflow ancestors. */
function rotationPadding(w: number, h: number, deg: number) {
  const rad = (deg * Math.PI) / 180;
  const rw = Math.abs(w * Math.cos(rad)) + Math.abs(h * Math.sin(rad));
  const rh = Math.abs(w * Math.sin(rad)) + Math.abs(h * Math.cos(rad));
  return {
    x: Math.ceil((rw - w) / 2) + 2,
    y: Math.ceil((rh - h) / 2) + 2,
  };
}

const CARD_ROTATION_PAD = rotationPadding(
  CARD_W,
  CARD_H,
  MAX_CARD_ROTATION_DEG,
);
const CARD_LAYOUT_W = CARD_W + CARD_ROTATION_PAD.x * 2;
const CARD_LAYOUT_H = CARD_H + CARD_ROTATION_PAD.y * 2;
/** Furthest corner distance from card center after rotation (conservative). */
const CARD_ROTATED_RADIUS = Math.ceil(
  Math.hypot(CARD_W / 2 + CARD_ROTATION_PAD.x, CARD_H / 2 + CARD_ROTATION_PAD.y),
);

/** Inset of the draggable layer inside the hero so tilted corners stay inside overflow:hidden. */
const HERO_GRID_INSET = 40;

/** Inset SVG path tracing the folded paper shape (stable under rotation). */
function getCardOutlinePath(inset = 0.5): string {
  const w = CARD_W - inset;
  const h = CARD_H - inset;
  const r = CARD_RADIUS;
  const foldX = CARD_W - FOLD;
  const i = inset;

  return [
    `M ${r + i} ${i}`,
    `H ${foldX - i}`,
    `L ${w} ${FOLD + i}`,
    `V ${h - r}`,
    `Q ${w} ${h} ${w - r} ${h}`,
    `H ${r + i}`,
    `Q ${i} ${h} ${i} ${h - r}`,
    `V ${r + i}`,
    `Q ${i} ${i} ${r + i} ${i}`,
    "Z",
  ].join(" ");
}
const DOT_SPACING = 28;
const DOT_RADIUS = 1;
const ROTATIONS = SUBJECTS.map((_, i) => Math.round(Math.sin(i * 2.7) * 7));

function seededRng(seed: number) {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return s / 2147483647;
  };
}

/** Reference viewport at 100vh — caps how many cards fit on screen at once. */
const HERO_REF_VIEW_W = 1440;
const HERO_REF_VIEW_H = 900;
const HERO_MAX_VISIBLE = 26;

function computeHeroSpacing() {
  const slotArea = (HERO_REF_VIEW_W * HERO_REF_VIEW_H) / HERO_MAX_VISIBLE;
  const heroMinY = Math.ceil(Math.sqrt(slotArea * (CARD_H / CARD_W)));
  const heroMinX = Math.ceil(slotArea / heroMinY);
  return { heroMinX, heroMinY };
}

const { heroMinX: HERO_MIN_X, heroMinY: HERO_MIN_Y } = computeHeroSpacing();

function isInHeroViewport(
  p: { x: number; y: number },
  viewW = HERO_REF_VIEW_W,
  viewH = HERO_REF_VIEW_H,
) {
  const halfW = viewW / 2 - CARD_ROTATED_RADIUS - HERO_GRID_INSET;
  const halfH = viewH / 2 - CARD_ROTATED_RADIUS - HERO_GRID_INSET;
  return Math.abs(p.x) <= halfW && Math.abs(p.y) <= halfH;
}

function heroCardsOverlap(
  a: { x: number; y: number },
  b: { x: number; y: number },
) {
  return (
    Math.abs(a.x - b.x) < HERO_MIN_X &&
    Math.abs(a.y - b.y) < HERO_MIN_Y
  );
}

function isValidHeroPosition(
  candidate: { x: number; y: number },
  placed: { x: number; y: number }[],
) {
  return !placed.some((p) => heroCardsOverlap(candidate, p));
}

const SUBJECT_IDX = {
  Mathematics: 0,
  Chemistry: 2,
  Biology: 3,
  Finance: 26,
} as const;

const HERO_ANCHOR_INDICES = new Set<number>([
  SUBJECT_IDX.Chemistry,
  SUBJECT_IDX.Biology,
  SUBJECT_IDX.Finance,
]);

/** Viewport-center coordinates for the hero first paint (tuned ~1280–1600px wide). */
function getHeroInitialLayout() {
  const positions: Record<number, { x: number; y: number }> = {};

  // Chemistry — right side, just below the navbar Contact link
  positions[SUBJECT_IDX.Chemistry] = { x: 280, y: -250 };

  // Biology — just above the hero headline (bottom-left copy block)
  positions[SUBJECT_IDX.Biology] = { x: -300, y: 40 };

  // Finance — bottom-right, kept inside viewport with rotation padding
  positions[SUBJECT_IDX.Finance] = { x: 400, y: 280 };

  const occupied = Object.values(positions);
  const remaining = SUBJECTS.map((_, i) => i).filter((i) => !HERO_ANCHOR_INDICES.has(i));

  const rng = seededRng(9001);

  // Jittered lattice: minimum spacing HERO_MIN_* with uniform random offset per cell.
  const candidates: { x: number; y: number }[] = [];
  const gridRingsX = 10;
  const gridRingsY = 8;
  const jitterX = HERO_MIN_X * 0.42;
  const jitterY = HERO_MIN_Y * 0.42;
  for (let gy = -gridRingsY; gy <= gridRingsY; gy++) {
    for (let gx = -gridRingsX; gx <= gridRingsX; gx++) {
      candidates.push({
        x: gx * HERO_MIN_X + (rng() - 0.5) * 2 * jitterX,
        y: gy * HERO_MIN_Y + (rng() - 0.5) * 2 * jitterY,
      });
    }
  }

  for (let i = candidates.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [candidates[i], candidates[j]] = [candidates[j], candidates[i]];
  }

  for (let i = remaining.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [remaining[i], remaining[j]] = [remaining[j], remaining[i]];
  }

  let viewportCardCount = occupied.filter((p) => isInHeroViewport(p)).length;

  for (const subjectIndex of remaining) {
    const placedSoFar = Object.values(positions);
    let placed = false;
    const canPlaceInViewport = viewportCardCount < HERO_MAX_VISIBLE;

    for (let k = 0; k < candidates.length; k++) {
      const candidate = candidates[k];
      if (!canPlaceInViewport && isInHeroViewport(candidate)) continue;
      if (!isValidHeroPosition(candidate, [...occupied, ...placedSoFar])) {
        continue;
      }
      positions[subjectIndex] = candidate;
      candidates.splice(k, 1);
      if (isInHeroViewport(candidate)) viewportCardCount++;
      placed = true;
      break;
    }

    if (!placed) {
      throw new Error(
        "DraggableGrid: Unable to place all hero cards without overlap. Expand hero candidate bounds.",
      );
    }
  }

  const allHeroPositions = Object.values(positions);
  for (let i = 0; i < allHeroPositions.length; i++) {
    for (let j = i + 1; j < allHeroPositions.length; j++) {
      if (heroCardsOverlap(allHeroPositions[i], allHeroPositions[j])) {
        throw new Error("DraggableGrid: Hero layout contains overlapping cards.");
      }
    }
  }

  const initialVisible = allHeroPositions.filter((p) => isInHeroViewport(p)).length;
  if (initialVisible > HERO_MAX_VISIBLE) {
    throw new Error(
      `DraggableGrid: ${initialVisible} cards in initial viewport; max is ${HERO_MAX_VISIBLE}.`,
    );
  }

  const subjectOrder = [
    ...remaining,
    SUBJECT_IDX.Chemistry,
    SUBJECT_IDX.Biology,
    SUBJECT_IDX.Finance,
  ];

  const xs = allHeroPositions.map((p) => p.x);
  const ys = allHeroPositions.map((p) => p.y);
  const bounds = {
    minX: Math.min(...xs),
    maxX: Math.max(...xs),
    minY: Math.min(...ys),
    maxY: Math.max(...ys),
  };
  const tileW = bounds.maxX - bounds.minX + HERO_MIN_X;
  const tileH = bounds.maxY - bounds.minY + HERO_MIN_Y;

  return {
    offset: { x: 0, y: 0 },
    positions,
    subjectOrder,
    tileW,
    tileH,
    bounds,
  };
}

const HERO_INITIAL_LAYOUT = getHeroInitialLayout();

/* ── Sketch illustrations ───────────────────────────────────── */

const SketchSVG = React.memo(function SketchSVG({ name, color, accent }: Subject) {
  const c = color;
  const a = accent;

  switch (name) {

    case "Mathematics":
      return (
        <>
          {/* Graph paper style background lines */}
          {[16,24,32,40,48,56,64,72].map((y, i) => (
            <line
              key={`h-${i}`}
              x1="10"
              y1={y}
              x2="108"
              y2={y}
              stroke={c}
              strokeWidth=".6"
              opacity=".08"
            />
          ))}
    
          {[16,24,32,40,48,56,64,72,80,88,96].map((x, i) => (
            <line
              key={`v-${i}`}
              x1={x}
              y1="10"
              x2={x}
              y2="82"
              stroke={c}
              strokeWidth=".6"
              opacity=".08"
            />
          ))}
    
          {/* Main coordinate axes */}
          <line
            x1="18"
            y1="72"
            x2="102"
            y2="72"
            stroke={c}
            strokeWidth="2"
            strokeLinecap="round"
          />
          <line
            x1="24"
            y1="78"
            x2="24"
            y2="12"
            stroke={c}
            strokeWidth="2"
            strokeLinecap="round"
          />
    
          {/* Axis arrows */}
          <path
            d="M 102,72 L 97,69 L 97,75 Z"
            fill={c}
            opacity=".7"
          />
          <path
            d="M 24,12 L 21,17 L 27,17 Z"
            fill={c}
            opacity=".7"
          />
    
          {/* Hand-drawn parabola */}
          <path
            d="M 30,64 Q 48,28 72,42 Q 86,50 96,22"
            fill="none"
            stroke="#4F8EF7"
            strokeWidth="2.2"
            strokeLinecap="round"
          />
    
          {/* Sketch hatch lines on parabola */}
          <line x1="40" y1="54" x2="44" y2="50" stroke="#4F8EF7" strokeWidth=".8" opacity=".35" />
          <line x1="52" y1="42" x2="56" y2="38" stroke="#4F8EF7" strokeWidth=".8" opacity=".35" />
          <line x1="66" y1="40" x2="70" y2="36" stroke="#4F8EF7" strokeWidth=".8" opacity=".35" />
          <line x1="80" y1="42" x2="84" y2="38" stroke="#4F8EF7" strokeWidth=".8" opacity=".35" />
    
          {/* Sine wave */}
          <path
            d="M 18,58
               Q 26,48 34,58
               Q 42,68 50,58
               Q 58,48 66,58
               Q 74,68 82,58
               Q 90,48 98,58"
            fill="none"
            stroke="#FF8A3D"
            strokeWidth="1.8"
            opacity=".9"
            strokeLinecap="round"
          />
    
          {/* Geometry triangle */}
          <polygon
            points="70,16 96,34 78,52"
            fill="none"
            stroke="#7AC943"
            strokeWidth="1.8"
            strokeLinejoin="round"
          />
    
          {/* Triangle sketch strokes */}
          <line x1="74" y1="22" x2="88" y2="32" stroke="#7AC943" strokeWidth=".8" opacity=".35" />
          <line x1="76" y1="30" x2="84" y2="44" stroke="#7AC943" strokeWidth=".8" opacity=".35" />
          <line x1="82" y1="26" x2="92" y2="34" stroke="#7AC943" strokeWidth=".8" opacity=".35" />
    
          {/* Integral equation */}
          <text
            x="8"
            y="22"
            fontSize="14"
            fontFamily="serif"
            fill={c}
            opacity=".65"
          >
            ∫
          </text>
    
          <text
            x="15"
            y="22"
            fontSize="8"
            fontFamily="monospace"
            fill={c}
            opacity=".5"
          >
            x² dx
          </text>
    
          {/* Pi symbol */}
          <text
            x="50"
            y="20"
            fontSize="16"
            fontFamily="serif"
            fill="#B56CFF"
            opacity=".85"
            fontWeight="bold"
          >
            π
          </text>
    
          {/* Sigma symbol */}
          <text
            x="86"
            y="72"
            fontSize="18"
            fontFamily="serif"
            fill={c}
            opacity=".4"
            fontWeight="bold"
          >
            Σ
          </text>
    
          {/* Scatter plot points */}
          <circle cx="36" cy="52" r="2" fill="#FF8A3D" opacity=".7" />
          <circle cx="46" cy="46" r="2" fill="#FF8A3D" opacity=".7" />
          <circle cx="58" cy="40" r="2" fill="#FF8A3D" opacity=".7" />
          <circle cx="72" cy="38" r="2" fill="#FF8A3D" opacity=".7" />
          <circle cx="88" cy="28" r="2" fill="#FF8A3D" opacity=".7" />
    
          {/* Dashed trend line */}
          <path
            d="M 34,54 L 90,26"
            fill="none"
            stroke={c}
            strokeWidth="1"
            opacity=".25"
            strokeDasharray="3 3"
          />
    
          {/* Small formula doodles */}
          <text
            x="10"
            y="84"
            fontSize="7"
            fontFamily="monospace"
            fill={c}
            opacity=".45"
          >
            y = mx + c
          </text>
    
          <text
            x="72"
            y="12"
            fontSize="6"
            fontFamily="monospace"
            fill={c}
            opacity=".4"
          >
            a²+b²
          </text>
    
          {/* Tiny sketch circles */}
          <circle
            cx="104"
            cy="18"
            r="3"
            fill="none"
            stroke="#B56CFF"
            strokeWidth="1"
            opacity=".5"
          />
          <circle
            cx="110"
            cy="24"
            r="2"
            fill="none"
            stroke="#B56CFF"
            strokeWidth=".8"
            opacity=".4"
          />
    
          {/* Hand-drawn underline */}
          <path
            d="M 34,80 Q 50,84 66,80 Q 82,76 98,80"
            fill="none"
            stroke={a}
            strokeWidth="1.4"
            opacity=".45"
          />
        </>
      );

      case "Physics":
        return (
          <>
            {/* Top frame */}
            <line
              x1="20"
              y1="16"
              x2="92"
              y2="16"
              stroke={c}
              strokeWidth="2.2"
              strokeLinecap="round"
            />
      
            {/* Frame supports */}
            <line
              x1="28"
              y1="16"
              x2="20"
              y2="74"
              stroke={c}
              strokeWidth="2"
              opacity=".8"
            />
            <line
              x1="84"
              y1="16"
              x2="92"
              y2="74"
              stroke={c}
              strokeWidth="2"
              opacity=".8"
            />
      
            {/* Bottom stand */}
            <line
              x1="16"
              y1="74"
              x2="96"
              y2="74"
              stroke={c}
              strokeWidth="2.2"
              strokeLinecap="round"
            />
      
            {/* Hanging strings */}
            <line x1="36" y1="16" x2="36" y2="48" stroke={c} strokeWidth="1.4" opacity=".8" />
            <line x1="48" y1="16" x2="48" y2="48" stroke={c} strokeWidth="1.4" opacity=".8" />
            <line x1="60" y1="16" x2="60" y2="48" stroke={c} strokeWidth="1.4" opacity=".8" />
            <line x1="72" y1="16" x2="72" y2="48" stroke={c} strokeWidth="1.4" opacity=".8" />
      
            {/* Swinging left ball */}
            <line
              x1="24"
              y1="16"
              x2="32"
              y2="48"
              stroke="#4F8EF7"
              strokeWidth="1.5"
              opacity=".9"
            />
      
            {/* Swinging right ball */}
            <line
              x1="84"
              y1="16"
              x2="76"
              y2="48"
              stroke="#FF8A3D"
              strokeWidth="1.5"
              opacity=".9"
            />
      
            {/* Cradle balls */}
            <circle
              cx="32"
              cy="52"
              r="5"
              fill="none"
              stroke="#4F8EF7"
              strokeWidth="2"
            />
      
            <circle
              cx="36"
              cy="52"
              r="5"
              fill="none"
              stroke={c}
              strokeWidth="2"
            />
      
            <circle
              cx="48"
              cy="52"
              r="5"
              fill="none"
              stroke={c}
              strokeWidth="2"
            />
      
            <circle
              cx="60"
              cy="52"
              r="5"
              fill="none"
              stroke={c}
              strokeWidth="2"
            />
      
            <circle
              cx="72"
              cy="52"
              r="5"
              fill="none"
              stroke={c}
              strokeWidth="2"
            />
      
            <circle
              cx="76"
              cy="52"
              r="5"
              fill="none"
              stroke="#FF8A3D"
              strokeWidth="2"
            />
      
            {/* Sketch hatch lines inside balls */}
            <line x1="29" y1="49" x2="34" y2="54" stroke="#4F8EF7" strokeWidth=".7" opacity=".35" />
            <line x1="45" y1="49" x2="50" y2="54" stroke={c} strokeWidth=".7" opacity=".25" />
            <line x1="57" y1="49" x2="62" y2="54" stroke={c} strokeWidth=".7" opacity=".25" />
            <line x1="69" y1="49" x2="74" y2="54" stroke={c} strokeWidth=".7" opacity=".25" />
            <line x1="73" y1="49" x2="78" y2="54" stroke="#FF8A3D" strokeWidth=".7" opacity=".35" />
      
            {/* Motion arcs */}
            <path
              d="M 18,44 Q 22,30 32,24"
              fill="none"
              stroke="#4F8EF7"
              strokeWidth="1.4"
              opacity=".5"
              strokeDasharray="3 3"
            />
      
            <path
              d="M 76,24 Q 86,30 90,44"
              fill="none"
              stroke="#FF8A3D"
              strokeWidth="1.4"
              opacity=".5"
              strokeDasharray="3 3"
            />
      
            {/* Energy wave */}
            <path
              d="M 20,84
                 Q 28,76 36,84
                 Q 44,92 52,84
                 Q 60,76 68,84
                 Q 76,92 84,84
                 Q 92,76 100,84"
              fill="none"
              stroke={a}
              strokeWidth="1.5"
              opacity=".45"
            />
      
            {/* Tiny physics doodles */}
            <text
              x="6"
              y="18"
              fontSize="8"
              fontFamily="serif"
              fill={c}
              opacity=".5"
              fontStyle="italic"
            >
              F = ma
            </text>
      
            <text
              x="92"
              y="22"
              fontSize="8"
              fontFamily="serif"
              fill={a}
              opacity=".5"
              fontStyle="italic"
            >
              E
            </text>
      
            <text
              x="96"
              y="28"
              fontSize="5"
              fontFamily="serif"
              fill={a}
              opacity=".4"
            >
              k
            </text>
      
            {/* Atom doodle */}
            <ellipse
              cx="104"
              cy="58"
              rx="5"
              ry="2"
              fill="none"
              stroke="#B56CFF"
              strokeWidth="1"
              opacity=".45"
            />
      
            <ellipse
              cx="104"
              cy="58"
              rx="5"
              ry="2"
              fill="none"
              stroke="#B56CFF"
              strokeWidth="1"
              opacity=".35"
              transform="rotate(60,104,58)"
            />
      
            <circle
              cx="104"
              cy="58"
              r="1.5"
              fill="#B56CFF"
              opacity=".45"
            />
      
            {/* Hand-drawn sketch marks */}
            <path
              d="M 12,10 Q 16,6 20,10"
              fill="none"
              stroke={c}
              strokeWidth="1"
              opacity=".25"
            />
      
            <path
              d="M 14,14 Q 18,10 22,14"
              fill="none"
              stroke={c}
              strokeWidth="1"
              opacity=".2"
            />
      
            {/* Small spark lines */}
            <line x1="54" y1="6" x2="58" y2="10" stroke={a} strokeWidth="1" opacity=".35" />
            <line x1="58" y1="6" x2="54" y2="10" stroke={a} strokeWidth="1" opacity=".35" />
          </>
        );

      case "Chemistry":
        return (
          <>
            {/* Test tube rack */}
            <rect
              x="18"
              y="34"
              width="84"
              height="6"
              rx="1"
              fill="none"
              stroke={c}
              strokeWidth="2"
            />
            <rect
              x="18"
              y="76"
              width="84"
              height="6"
              rx="1"
              fill="none"
              stroke={c}
              strokeWidth="2"
            />
      
            {/* Rack supports */}
            <line x1="26" y1="40" x2="26" y2="76" stroke={c} strokeWidth="2" />
            <line x1="94" y1="40" x2="94" y2="76" stroke={c} strokeWidth="2" />
      
            {/* LEFT TEST TUBE */}
            <path
              d="M 30,18 L 30,62 Q 30,72 38,72 Q 46,72 46,62 L 46,18"
              fill="none"
              stroke="#2D9CFF"
              strokeWidth="2.2"
              strokeLinecap="round"
            />
            <ellipse
              cx="38"
              cy="18"
              rx="8"
              ry="3"
              fill="none"
              stroke="#2D9CFF"
              strokeWidth="2.2"
            />
      
            {/* Liquid */}
            <path
              d="M 32,52 Q 38,48 44,52 L 44,62 Q 44,68 38,68 Q 32,68 32,62 Z"
              fill="#2D9CFF"
              opacity=".16"
            />
            <path
              d="M 32,52 Q 38,48 44,52"
              fill="none"
              stroke="#2D9CFF"
              strokeWidth="1.3"
              opacity=".8"
            />
      
            {/* Bubbles */}
            <circle cx="36" cy="60" r="1.5" fill="none" stroke="#2D9CFF" strokeWidth="1" opacity=".7" />
            <circle cx="40" cy="56" r="1" fill="none" stroke="#2D9CFF" strokeWidth="1" opacity=".7" />
            <circle cx="35" cy="50" r="1" fill="none" stroke="#2D9CFF" strokeWidth="1" opacity=".5" />
      
            {/* Sketch lines */}
            <line x1="33" y1="24" x2="37" y2="30" stroke="#2D9CFF" strokeWidth=".8" opacity=".35" />
            <line x1="34" y1="34" x2="38" y2="40" stroke="#2D9CFF" strokeWidth=".8" opacity=".35" />
            <line x1="35" y1="44" x2="39" y2="50" stroke="#2D9CFF" strokeWidth=".8" opacity=".35" />
      
            {/* CENTER TEST TUBE */}
            <path
              d="M 56,18 L 56,62 Q 56,72 64,72 Q 72,72 72,62 L 72,18"
              fill="none"
              stroke="#7AC943"
              strokeWidth="2.2"
              strokeLinecap="round"
            />
            <ellipse
              cx="64"
              cy="18"
              rx="8"
              ry="3"
              fill="none"
              stroke="#7AC943"
              strokeWidth="2.2"
            />
      
            {/* Liquid */}
            <path
              d="M 58,50 Q 64,54 70,50 L 70,62 Q 70,68 64,68 Q 58,68 58,62 Z"
              fill="#7AC943"
              opacity=".16"
            />
            <path
              d="M 58,50 Q 64,54 70,50"
              fill="none"
              stroke="#7AC943"
              strokeWidth="1.3"
              opacity=".8"
            />
      
            {/* Bubbles */}
            <circle cx="62" cy="58" r="1.5" fill="none" stroke="#7AC943" strokeWidth="1" opacity=".7" />
            <circle cx="66" cy="54" r="1" fill="none" stroke="#7AC943" strokeWidth="1" opacity=".7" />
            <circle cx="64" cy="48" r="1" fill="none" stroke="#7AC943" strokeWidth="1" opacity=".5" />
      
            {/* Sketch lines */}
            <line x1="59" y1="24" x2="63" y2="30" stroke="#7AC943" strokeWidth=".8" opacity=".35" />
            <line x1="60" y1="34" x2="64" y2="40" stroke="#7AC943" strokeWidth=".8" opacity=".35" />
            <line x1="61" y1="44" x2="65" y2="50" stroke="#7AC943" strokeWidth=".8" opacity=".35" />
      
            {/* RIGHT TEST TUBE */}
            <path
              d="M 82,18 L 82,62 Q 82,72 90,72 Q 98,72 98,62 L 98,18"
              fill="none"
              stroke="#B56CFF"
              strokeWidth="2.2"
              strokeLinecap="round"
            />
            <ellipse
              cx="90"
              cy="18"
              rx="8"
              ry="3"
              fill="none"
              stroke="#B56CFF"
              strokeWidth="2.2"
            />
      
            {/* Liquid */}
            <path
              d="M 84,53 Q 90,49 96,53 L 96,62 Q 96,68 90,68 Q 84,68 84,62 Z"
              fill="#B56CFF"
              opacity=".16"
            />
            <path
              d="M 84,53 Q 90,49 96,53"
              fill="none"
              stroke="#B56CFF"
              strokeWidth="1.3"
              opacity=".8"
            />
      
            {/* Bubbles */}
            <circle cx="88" cy="60" r="1.5" fill="none" stroke="#B56CFF" strokeWidth="1" opacity=".7" />
            <circle cx="92" cy="56" r="1" fill="none" stroke="#B56CFF" strokeWidth="1" opacity=".7" />
            <circle cx="87" cy="50" r="1" fill="none" stroke="#B56CFF" strokeWidth="1" opacity=".5" />
      
            {/* Sketch lines */}
            <line x1="85" y1="24" x2="89" y2="30" stroke="#B56CFF" strokeWidth=".8" opacity=".35" />
            <line x1="86" y1="34" x2="90" y2="40" stroke="#B56CFF" strokeWidth=".8" opacity=".35" />
            <line x1="87" y1="44" x2="91" y2="50" stroke="#B56CFF" strokeWidth=".8" opacity=".35" />
      
            {/* Small chemistry spark doodles */}
            <circle cx="108" cy="20" r="4" fill="none" stroke={a} strokeWidth="1.3" opacity=".7" />
            <circle cx="116" cy="15" r="2.5" fill="none" stroke={a} strokeWidth="1" opacity=".6" />
            <circle cx="117" cy="25" r="2.5" fill="none" stroke={a} strokeWidth="1" opacity=".6" />
            <line x1="111" y1="18" x2="114" y2="16" stroke={a} strokeWidth="1" opacity=".6" />
            <line x1="111" y1="22" x2="114" y2="24" stroke={a} strokeWidth="1" opacity=".6" />
      
            {/* Hand-drawn notebook style mark */}
            <path
              d="M 10,12 Q 14,8 18,12"
              fill="none"
              stroke={c}
              strokeWidth="1"
              opacity=".35"
            />
            <path
              d="M 12,16 Q 16,12 20,16"
              fill="none"
              stroke={c}
              strokeWidth="1"
              opacity=".25"
            />
          </>
        );

        case "Biology":
          return (
            <>
              {/* Microscope base */}
              <path
                d="M 26,74 Q 40,66 54,74"
                fill="none"
                stroke={c}
                strokeWidth="2.4"
                strokeLinecap="round"
              />
        
              {/* Microscope stand */}
              <path
                d="M 42,72 Q 38,56 48,40 Q 56,28 66,20"
                fill="none"
                stroke={c}
                strokeWidth="3"
                strokeLinecap="round"
              />
        
              {/* Eyepiece */}
              <rect
                x="62"
                y="12"
                width="14"
                height="6"
                rx="1"
                fill="none"
                stroke={c}
                strokeWidth="2"
                transform="rotate(-18 62 12)"
              />
        
              {/* Tube */}
              <line
                x1="66"
                y1="18"
                x2="58"
                y2="30"
                stroke={c}
                strokeWidth="2.4"
                strokeLinecap="round"
              />
        
              {/* Objective lens */}
              <line
                x1="54"
                y1="32"
                x2="48"
                y2="40"
                stroke="#4F8EF7"
                strokeWidth="2"
                strokeLinecap="round"
              />
        
              {/* Stage */}
              <rect
                x="44"
                y="42"
                width="26"
                height="5"
                rx="1"
                fill="none"
                stroke={c}
                strokeWidth="2"
              />
        
              {/* Slide */}
              <rect
                x="50"
                y="39"
                width="14"
                height="4"
                rx=".8"
                fill="none"
                stroke="#7AC943"
                strokeWidth="1.4"
                opacity=".9"
              />
        
              {/* Green biology sample */}
              <path
                d="M 53,41
                   Q 55,38 57,41
                   Q 59,44 61,41"
                fill="none"
                stroke="#7AC943"
                strokeWidth="1"
                opacity=".8"
              />
        
              <circle
                cx="56"
                cy="41"
                r="1"
                fill="#7AC943"
                opacity=".7"
              />
        
              <circle
                cx="60"
                cy="41"
                r=".8"
                fill="#7AC943"
                opacity=".6"
              />
        
              {/* Focus knob */}
              <circle
                cx="40"
                cy="48"
                r="4"
                fill="none"
                stroke="#B56CFF"
                strokeWidth="1.8"
              />
        
              <circle
                cx="40"
                cy="48"
                r="1.2"
                fill="#B56CFF"
                opacity=".5"
              />
        
              {/* Arm support */}
              <path
                d="M 34,70 Q 30,54 36,40"
                fill="none"
                stroke={c}
                strokeWidth="2"
                opacity=".8"
              />
        
              {/* Sketch hatch marks */}
              <line x1="46" y1="48" x2="52" y2="54" stroke={c} strokeWidth=".8" opacity=".25" />
              <line x1="48" y1="56" x2="54" y2="62" stroke={c} strokeWidth=".8" opacity=".25" />
              <line x1="58" y1="24" x2="62" y2="28" stroke={c} strokeWidth=".8" opacity=".25" />
              <line x1="60" y1="18" x2="64" y2="22" stroke={c} strokeWidth=".8" opacity=".25" />
        
              {/* Petri dish doodle */}
              <ellipse
                cx="92"
                cy="58"
                rx="10"
                ry="4"
                fill="none"
                stroke="#7AC943"
                strokeWidth="1.4"
                opacity=".7"
              />
        
              <ellipse
                cx="92"
                cy="58"
                rx="7"
                ry="2"
                fill="#7AC943"
                opacity=".12"
              />
        
              {/* Cells / microbes */}
              <circle
                cx="88"
                cy="57"
                r="1"
                fill="#7AC943"
                opacity=".65"
              />
        
              <circle
                cx="92"
                cy="59"
                r="1"
                fill="#7AC943"
                opacity=".65"
              />
        
              <circle
                cx="95"
                cy="56"
                r=".8"
                fill="#7AC943"
                opacity=".6"
              />
        
              {/* DNA doodle */}
              <path
                d="M 98,14
                   Q 102,18 98,22
                   Q 94,26 98,30"
                fill="none"
                stroke={a}
                strokeWidth="1.4"
                opacity=".45"
              />
        
              <path
                d="M 106,14
                   Q 102,18 106,22
                   Q 110,26 106,30"
                fill="none"
                stroke={a}
                strokeWidth="1.4"
                opacity=".45"
              />
        
              <line x1="99" y1="18" x2="105" y2="18" stroke={a} strokeWidth=".9" opacity=".45" />
              <line x1="99" y1="22" x2="105" y2="22" stroke={a} strokeWidth=".9" opacity=".45" />
              <line x1="99" y1="26" x2="105" y2="26" stroke={a} strokeWidth=".9" opacity=".45" />
        
              {/* Tiny biology notes */}
              <text
                x="8"
                y="18"
                fontSize="7"
                fontFamily="monospace"
                fill={c}
                opacity=".45"
              >
                cell
              </text>
        
              <text
                x="84"
                y="18"
                fontSize="8"
                fontFamily="serif"
                fill="#7AC943"
                opacity=".55"
                fontStyle="italic"
              >
                DNA
              </text>
        
              {/* Organic sketch underline */}
              <path
                d="M 12,84
                   Q 24,78 36,84
                   Q 48,90 60,84
                   Q 72,78 84,84"
                fill="none"
                stroke={a}
                strokeWidth="1.3"
                opacity=".35"
              />
            </>
          );

    case "Computer Science":
      return (
        <>
          <rect x="8" y="4" width="88" height="58" rx="4" fill="none" stroke={c} strokeWidth="2" />
          <rect x="12" y="8" width="80" height="50" rx="2" fill={c} opacity=".06" />
          <line x1="14" y1="10" x2="22" y2="10" stroke={c} strokeWidth="1" opacity=".25" />
          <text x="16" y="20" fontSize="7" fontFamily="monospace" fill={a} opacity=".9">{"function(){"}</text>
          <text x="20" y="29" fontSize="7" fontFamily="monospace" fill={c} opacity=".75">{"  if (x > 0) {"}</text>
          <text x="24" y="38" fontSize="7" fontFamily="monospace" fill={a} opacity=".65">{"    return √n;"}</text>
          <text x="20" y="47" fontSize="7" fontFamily="monospace" fill={c} opacity=".6">{"  }"}</text>
          <text x="16" y="55" fontSize="7" fontFamily="monospace" fill={a} opacity=".75">{"}"}</text>
          <rect x="52" y="49" width="5" height="7" fill={a} opacity=".7" />
          <line x1="52" y1="62" x2="52" y2="72" stroke={c} strokeWidth="2" />
          <line x1="36" y1="72" x2="68" y2="72" stroke={c} strokeWidth="2.2" />
          {["1","0","1","1","0","0","1"].map((bit, i) => (
            <text key={i} x="88" y={12 + i * 9} fontSize="7" fontFamily="monospace" fill={a} opacity={0.15 + i * 0.09}>{bit}</text>
          ))}
          <circle cx="4" cy="30" r="2.5" fill={a} opacity=".35" />
          <line x1="6.5" y1="30" x2="8" y2="30" stroke={a} strokeWidth="1.2" opacity=".35" />
          <circle cx="4" cy="44" r="2.5" fill={c} opacity=".35" />
          <line x1="6.5" y1="44" x2="8" y2="44" stroke={c} strokeWidth="1.2" opacity=".35" />
        </>
      );

    case "Information Technology":
      return (
        <>
          <path d="M 38,22 Q 38,10 50,10 Q 55,4 64,6 Q 74,2 78,12 Q 88,12 88,22 Q 94,24 94,32 Q 94,40 86,40 L 28,40 Q 20,40 20,32 Q 20,24 28,22 Z"
            fill={c} opacity=".1" stroke={c} strokeWidth="1.8" />
          <line x1="32" y1="28" x2="50" y2="28" stroke={c} strokeWidth="1" opacity=".3" />
          <line x1="32" y1="34" x2="60" y2="34" stroke={c} strokeWidth="1" opacity=".3" />
          <line x1="40" y1="40" x2="22" y2="58" stroke={c} strokeWidth="1.5" opacity=".5" strokeDasharray="4 3" />
          <line x1="55" y1="40" x2="55" y2="60" stroke={a} strokeWidth="1.5" opacity=".5" strokeDasharray="4 3" />
          <line x1="70" y1="40" x2="88" y2="58" stroke={c} strokeWidth="1.5" opacity=".5" strokeDasharray="4 3" />
          <rect x="12" y="58" width="20" height="13" rx="2" fill="none" stroke={a} strokeWidth="1.5" />
          <line x1="10" y1="71" x2="34" y2="71" stroke={a} strokeWidth="1.5" />
          <line x1="16" y1="62" x2="28" y2="62" stroke={a} strokeWidth="0.8" opacity=".4" />
          <line x1="16" y1="65" x2="24" y2="65" stroke={a} strokeWidth="0.8" opacity=".4" />
          <rect x="48" y="60" width="14" height="18" rx="3" fill="none" stroke={a} strokeWidth="1.5" />
          <circle cx="55" cy="76" r="1.5" fill={a} opacity=".4" />
          <line x1="51" y1="64" x2="59" y2="64" stroke={a} strokeWidth="0.8" opacity=".4" />
          <line x1="51" y1="67" x2="57" y2="67" stroke={a} strokeWidth="0.8" opacity=".4" />
          <line x1="51" y1="70" x2="59" y2="70" stroke={a} strokeWidth="0.8" opacity=".4" />
          <rect x="78" y="57" width="22" height="15" rx="2" fill="none" stroke={a} strokeWidth="1.5" />
          <line x1="89" y1="72" x2="89" y2="77" stroke={a} strokeWidth="1.5" />
          <line x1="84" y1="77" x2="94" y2="77" stroke={a} strokeWidth="1.5" />
          <rect x="4" y="46" width="6" height="5" rx="1" fill={a} opacity=".3" stroke={a} strokeWidth="1" />
          <rect x="100" y="46" width="6" height="5" rx="1" fill={c} opacity=".3" stroke={c} strokeWidth="1" />
        </>
      );

    case "Economics":
      return (
        <>
          <line x1="14" y1="74" x2="106" y2="74" stroke={c} strokeWidth="1.8" />
          <line x1="14" y1="74" x2="14" y2="4" stroke={c} strokeWidth="1.8" />
          <polygon points="106,74 100,71 100,77" fill={c} />
          <polygon points="14,4 11,10 17,10" fill={c} />
          {[30,46,62,78,94].map(x => <line key={x} x1={x} y1="72" x2={x} y2="76" stroke={c} strokeWidth="1.2" />)}
          {[18,32,46,60].map(y => <line key={y} x1="12" y1={y} x2="16" y2={y} stroke={c} strokeWidth="1.2" />)}
          <path d="M 20,68 Q 48,55 72,28 Q 86,16 100,8"
            fill="none" stroke={c} strokeWidth="2" />
          <text x="96" y="7" fontSize="7" fontFamily="serif" fill={c} opacity=".7">S</text>
          <path d="M 20,10 Q 44,22 68,46 Q 82,60 100,70"
            fill="none" stroke={a} strokeWidth="2" />
          <text x="96" y="78" fontSize="7" fontFamily="serif" fill={a} opacity=".7">D</text>
          <circle cx="60" cy="40" r="4" fill="none" stroke={a} strokeWidth="1.8" />
          <circle cx="60" cy="40" r="1.5" fill={a} />
          <line x1="14" y1="40" x2="56" y2="40" stroke={a} strokeWidth="1" opacity=".45" strokeDasharray="3 2" />
          <line x1="60" y1="74" x2="60" y2="44" stroke={a} strokeWidth="1" opacity=".45" strokeDasharray="3 2" />
          <rect x="18" y="52" width="7" height="22" fill={c} opacity=".12" />
          <rect x="26" y="44" width="7" height="30" fill={c} opacity=".12" />
          <text x="82" y="58" fontSize="24" fontFamily="serif" fill={a} opacity=".08" fontWeight="bold">$</text>
        </>
      );

    case "Accountancy":
      return (
        <>
          <rect x="18" y="4" width="74" height="70" rx="4" fill="none" stroke={c} strokeWidth="2" />
          <line x1="36" y1="4" x2="36" y2="74" stroke={c} strokeWidth="1.2" opacity=".4" />
          <rect x="18" y="4" width="18" height="70" rx="4" fill={c} opacity=".07" />
          <rect x="40" y="10" width="48" height="10" rx="1" fill={c} opacity=".1" stroke={c} strokeWidth="1" />
          <text x="43" y="18" fontSize="6.5" fontFamily="monospace" fill={c} opacity=".6">DEBIT</text>
          <text x="68" y="18" fontSize="6.5" fontFamily="monospace" fill={a} opacity=".6">CREDIT</text>
          <line x1="64" y1="20" x2="64" y2="74" stroke={c} strokeWidth="1" opacity=".3" />
          {[
            ["Sales", "2,400", ""],
            ["Rent", "800", ""],
            ["Wages", "1,200", ""],
            ["Profit", "", "400"],
          ].map(([label, debit, credit], i) => (
            <g key={i}>
              <line x1="40" y1={24 + i * 11} x2="88" y2={24 + i * 11} stroke={c} strokeWidth="0.7" opacity=".2" />
              <text x="42" y={32 + i * 11} fontSize="6" fontFamily="monospace" fill={c} opacity=".65">{label}</text>
              {debit && <text x="63" y={32 + i * 11} fontSize="6.5" fontFamily="monospace" fill={c} opacity=".75" textAnchor="end">{debit}</text>}
              {credit && <text x="86" y={32 + i * 11} fontSize="6.5" fontFamily="monospace" fill={a} opacity=".85" textAnchor="end">{credit}</text>}
            </g>
          ))}
          <line x1="40" y1="68" x2="88" y2="68" stroke={c} strokeWidth="1.2" opacity=".5" />
          <line x1="40" y1="70" x2="88" y2="70" stroke={c} strokeWidth="0.7" opacity=".4" />
          <line x1="22" y1="8" x2="22" y2="30" stroke={a} strokeWidth="1.5" opacity=".5" />
          <line x1="16" y1="14" x2="28" y2="14" stroke={a} strokeWidth="1.5" opacity=".5" />
          <path d="M 16,14 L 13,22 L 19,22 Z" fill="none" stroke={a} strokeWidth="1.2" opacity=".5" />
          <path d="M 28,14 L 25,22 L 31,22 Z" fill="none" stroke={a} strokeWidth="1.2" opacity=".5" />
        </>
      );

    case "Business Studies":
      return (
        <>
          <rect x="30" y="30" width="50" height="44" fill={c} opacity=".08" stroke={c} strokeWidth="2" />
          <line x1="30" y1="30" x2="55" y2="10" stroke={c} strokeWidth="2" />
          <line x1="80" y1="30" x2="55" y2="10" stroke={c} strokeWidth="2" />
          {[[36,36],[48,36],[60,36],[72,36],
            [36,48],[48,48],[60,48],[72,48]].map(([x,y],i) => (
            <rect key={i} x={x} y={y} width="8" height="8" rx="1"
              fill={i%2===0 ? c : a} opacity=".15" stroke={c} strokeWidth="1" />
          ))}
          <rect x="48" y="60" width="14" height="14" rx="1" fill="none" stroke={a} strokeWidth="1.5" />
          <circle cx="59" cy="67" r="1.5" fill={a} opacity=".5" />
          <line x1="92" y1="72" x2="92" y2="20" stroke={a} strokeWidth="2" opacity=".6" />
          <polygon points="92,16 88,24 96,24" fill={a} opacity=".6" />
          <rect x="96" y="50" width="6" height="24" fill={a} opacity=".15" stroke={a} strokeWidth="1" />
          <rect x="103" y="40" width="6" height="34" fill={c} opacity=".15" stroke={c} strokeWidth="1" />
          <path d="M 4,50 Q 10,44 16,50 Q 20,54 16,58 Q 10,64 4,58 Q 0,54 4,50"
            fill="none" stroke={a} strokeWidth="1.4" opacity=".5" />
          <text x="3" y="70" fontSize="6.5" fontFamily="sans-serif" fill={c} opacity=".45">deal</text>
          <circle cx="15" cy="10" r="4" fill="none" stroke={c} strokeWidth="1.2" opacity=".45" />
          <line x1="15" y1="14" x2="15" y2="20" stroke={c} strokeWidth="1.2" opacity=".45" />
          <line x1="10" y1="20" x2="20" y2="20" stroke={c} strokeWidth="1.2" opacity=".45" />
          <circle cx="10" cy="24" r="3" fill="none" stroke={c} strokeWidth="1" opacity=".4" />
          <circle cx="20" cy="24" r="3" fill="none" stroke={c} strokeWidth="1" opacity=".4" />
          <line x1="10" y1="20" x2="10" y2="21" stroke={c} strokeWidth="1" opacity=".4" />
          <line x1="20" y1="20" x2="20" y2="21" stroke={c} strokeWidth="1" opacity=".4" />
        </>
      );

    case "Statistics":
      return (
        <>
          <line x1="10" y1="74" x2="106" y2="74" stroke={c} strokeWidth="1.8" />
          <line x1="10" y1="74" x2="10" y2="4" stroke={c} strokeWidth="1.8" />
          <path d="M 12,72 Q 22,70 32,58 Q 42,28 55,10 Q 68,28 78,58 Q 88,70 98,72"
            fill={c} opacity=".1" />
          <path d="M 12,72 Q 22,70 32,58 Q 42,28 55,10 Q 68,28 78,58 Q 88,70 98,72"
            fill="none" stroke={c} strokeWidth="2.2" />
          <line x1="55" y1="74" x2="55" y2="8" stroke={a} strokeWidth="1.6" strokeDasharray="4 3" opacity=".7" />
          <text x="56" y="8" fontSize="8" fill={a} fontFamily="serif" fontStyle="italic">μ</text>
          <line x1="35" y1="74" x2="35" y2="50" stroke={c} strokeWidth="1" opacity=".45" strokeDasharray="3 2" />
          <line x1="75" y1="74" x2="75" y2="50" stroke={c} strokeWidth="1" opacity=".45" strokeDasharray="3 2" />
          <text x="32" y="80" fontSize="7" fill={c} fontFamily="serif" opacity=".6">-σ</text>
          <text x="73" y="80" fontSize="7" fill={c} fontFamily="serif" opacity=".6">+σ</text>
          <path d="M 35,50 Q 42,28 55,10 Q 68,28 75,50 Q 65,44 55,40 Q 45,44 35,50 Z"
            fill={a} opacity=".1" />
          {[[16,60],[26,44],[36,24],[46,12],[56,8],[66,12],[76,24],[86,44],[96,60]].map(([x,h],i) => (
            <rect key={i} x={x-3} y={74-h} width="6" height={h}
              fill={c} opacity={i===4 ? 0.25 : 0.09} stroke={c} strokeWidth="0.6" />
          ))}
          <circle cx="20" cy="65" r="2" fill={a} opacity=".5" />
          <circle cx="42" cy="40" r="2" fill={a} opacity=".5" />
          <circle cx="70" cy="38" r="2" fill={a} opacity=".5" />
          <circle cx="90" cy="60" r="2" fill={a} opacity=".5" />
        </>
      );

    case "Geography":
      return (
        <>
          <circle cx="55" cy="38" r="34" fill={c} opacity=".07" stroke={c} strokeWidth="2" />
          <ellipse cx="55" cy="38" rx="34" ry="10" fill="none" stroke={c} strokeWidth="1" opacity=".3" />
          <ellipse cx="55" cy="24" rx="28" ry="8" fill="none" stroke={c} strokeWidth="0.8" opacity=".25" />
          <ellipse cx="55" cy="52" rx="28" ry="8" fill="none" stroke={c} strokeWidth="0.8" opacity=".25" />
          <ellipse cx="55" cy="38" rx="14" ry="34" fill="none" stroke={c} strokeWidth="0.8" opacity=".25" />
          <line x1="55" y1="4" x2="55" y2="72" stroke={c} strokeWidth="0.8" opacity=".25" />
          <path d="M 46,18 Q 52,14 60,16 Q 66,18 68,26 Q 64,32 58,30 Q 52,28 48,22 Z"
            fill={a} opacity=".25" stroke={a} strokeWidth="1" />
          <path d="M 34,30 Q 38,26 44,28 Q 48,34 44,40 Q 38,44 34,40 Q 30,36 34,30 Z"
            fill={c} opacity=".2" stroke={c} strokeWidth="1" />
          <path d="M 56,42 Q 62,38 68,42 Q 72,48 68,54 Q 62,58 56,54 Q 52,48 56,42 Z"
            fill={a} opacity=".2" stroke={a} strokeWidth="1" />
          <line x1="96" y1="10" x2="96" y2="24" stroke={a} strokeWidth="1.5" />
          <line x1="89" y1="17" x2="103" y2="17" stroke={a} strokeWidth="1.5" />
          <polygon points="96,8 94,14 98,14" fill={a} opacity=".8" />
          <text x="94" y="30" fontSize="6" fill={a} fontFamily="sans-serif" opacity=".6">S</text>
          <text x="104" y="19" fontSize="6" fill={a} fontFamily="sans-serif" opacity=".6">E</text>
          <text x="83" y="19" fontSize="6" fill={a} fontFamily="sans-serif" opacity=".6">W</text>
          <path d="M 18,56 Q 18,48 24,48 Q 30,48 30,56 Q 30,62 24,68 Q 18,62 18,56 Z"
            fill="none" stroke={a} strokeWidth="1.5" />
          <circle cx="24" cy="56" r="2.5" fill={a} opacity=".4" />
        </>
      );

    case "History":
      return (
        <>
          <rect x="10" y="18" width="12" height="52" fill={c} opacity=".1" stroke={c} strokeWidth="1.8" />
          <rect x="8" y="14" width="16" height="6" rx="1" fill={c} opacity=".15" stroke={c} strokeWidth="1.5" />
          <rect x="8" y="70" width="16" height="5" rx="1" fill={c} opacity=".15" stroke={c} strokeWidth="1.5" />
          {[13,16,19].map(x => <line key={x} x1={x} y1="20" x2={x} y2="70" stroke={c} strokeWidth="0.7" opacity=".3" />)}
          <rect x="88" y="18" width="12" height="52" fill={c} opacity=".1" stroke={c} strokeWidth="1.8" />
          <rect x="86" y="14" width="16" height="6" rx="1" fill={c} opacity=".15" stroke={c} strokeWidth="1.5" />
          <rect x="86" y="70" width="16" height="5" rx="1" fill={c} opacity=".15" stroke={c} strokeWidth="1.5" />
          {[91,94,97].map(x => <line key={x} x1={x} y1="20" x2={x} y2="70" stroke={c} strokeWidth="0.7" opacity=".3" />)}
          <path d="M 10,18 L 55,2 L 100,18" fill="none" stroke={c} strokeWidth="2" />
          <line x1="10" y1="14" x2="100" y2="14" stroke={c} strokeWidth="1" opacity=".3" />
          <rect x="30" y="28" width="50" height="38" rx="3" fill={a} opacity=".08" stroke={a} strokeWidth="1.5" />
          <path d="M 30,28 Q 26,28 26,47 Q 26,66 30,66" fill="none" stroke={a} strokeWidth="1.5" />
          <path d="M 80,28 Q 84,28 84,47 Q 84,66 80,66" fill="none" stroke={a} strokeWidth="1.5" />
          <line x1="35" y1="36" x2="75" y2="36" stroke={a} strokeWidth="1" opacity=".35" />
          <line x1="35" y1="42" x2="72" y2="42" stroke={a} strokeWidth="1" opacity=".35" />
          <line x1="35" y1="48" x2="75" y2="48" stroke={a} strokeWidth="1" opacity=".35" />
          <line x1="35" y1="54" x2="68" y2="54" stroke={a} strokeWidth="1" opacity=".35" />
          <line x1="35" y1="60" x2="72" y2="60" stroke={a} strokeWidth="1" opacity=".35" />
          <path d="M 70,30 Q 78,18 84,10 Q 80,22 72,38 Z" fill={c} opacity=".25" stroke={c} strokeWidth="1" />
          <line x1="72" y1="36" x2="68" y2="46" stroke={c} strokeWidth="1" opacity=".4" />
        </>
      );

    case "Political Science":
      return (
        <>
          <path d="M 25,50 Q 25,30 55,22 Q 85,30 85,50" fill={c} opacity=".1" stroke={c} strokeWidth="2" />
          <path d="M 38,36 Q 55,28 72,36" fill="none" stroke={c} strokeWidth="1" opacity=".35" />
          <path d="M 33,42 Q 55,32 77,42" fill="none" stroke={c} strokeWidth="1" opacity=".35" />
          <path d="M 30,48 Q 55,36 80,48" fill="none" stroke={c} strokeWidth="1" opacity=".35" />
          <line x1="55" y1="22" x2="55" y2="4" stroke={a} strokeWidth="2" />
          <rect x="55" y="4" width="16" height="10" rx="1" fill={a} opacity=".25" stroke={a} strokeWidth="1.3" />
          <line x1="55" y1="6" x2="71" y2="6" stroke={a} strokeWidth="0.8" opacity=".4" />
          <line x1="55" y1="8" x2="71" y2="8" stroke={a} strokeWidth="0.8" opacity=".4" />
          <line x1="55" y1="10" x2="71" y2="10" stroke={a} strokeWidth="0.8" opacity=".4" />
          {[30,38,46,54,62,70,78].map(x => (
            <line key={x} x1={x} y1="50" x2={x} y2="68" stroke={c} strokeWidth="1.8" opacity=".5" />
          ))}
          <rect x="20" y="68" width="70" height="6" rx="1" fill={c} opacity=".12" stroke={c} strokeWidth="1.5" />
          <line x1="16" y1="74" x2="94" y2="74" stroke={c} strokeWidth="1.5" />
          <line x1="96" y1="14" x2="96" y2="40" stroke={a} strokeWidth="1.5" opacity=".6" />
          <line x1="88" y1="22" x2="104" y2="22" stroke={a} strokeWidth="1.5" opacity=".6" />
          <circle cx="96" cy="22" r="2" fill={a} opacity=".5" />
          <path d="M 88,22 L 84,30 L 92,30 Z" fill="none" stroke={a} strokeWidth="1.2" opacity=".5" />
          <path d="M 104,22 L 100,30 L 108,30 Z" fill="none" stroke={a} strokeWidth="1.2" opacity=".5" />
          <rect x="4" y="52" width="14" height="18" rx="2" fill="none" stroke={a} strokeWidth="1.4" opacity=".5" />
          <line x1="8" y1="52" x2="14" y2="52" stroke={a} strokeWidth="2.5" opacity=".4" />
          <path d="M 9,44 L 11,52" stroke={a} strokeWidth="1.5" opacity=".5" />
        </>
      );

    case "Psychology":
      return (
        <>
          <path d="M 55,68 L 55,52 Q 26,52 20,34 Q 14,14 34,8 Q 48,4 55,16 Q 62,4 76,8 Q 96,14 90,34 Q 84,52 55,52"
            fill={c} opacity=".1" stroke={c} strokeWidth="2" />
          <path d="M 34,16 Q 40,22 36,30 Q 32,38 40,42" fill="none" stroke={c} strokeWidth="1.5" opacity=".45" />
          <path d="M 55,16 Q 50,24 52,34 Q 54,44 55,50" fill="none" stroke={c} strokeWidth="1.5" opacity=".4" />
          <path d="M 76,16 Q 70,22 72,30 Q 74,38 68,42" fill="none" stroke={c} strokeWidth="1.5" opacity=".45" />
          <path d="M 42,10 Q 48,16 44,26" fill="none" stroke={c} strokeWidth="1.2" opacity=".3" />
          <path d="M 68,10 Q 62,16 66,26" fill="none" stroke={c} strokeWidth="1.2" opacity=".3" />
          <path d="M 28,26 Q 36,30 32,40" fill="none" stroke={c} strokeWidth="1.2" opacity=".3" />
          <path d="M 82,26 Q 74,30 78,40" fill="none" stroke={c} strokeWidth="1.2" opacity=".3" />
          <path d="M 44,44 Q 55,40 66,44" fill="none" stroke={a} strokeWidth="1.4" opacity=".5" strokeDasharray="3 2" />
          <circle cx="84" cy="62" r="10" fill={a} opacity=".1" stroke={a} strokeWidth="1.5" />
          <text x="79" y="66" fontSize="10" fontFamily="serif" fill={a} opacity=".6">?</text>
          <circle cx="74" cy="72" r="3" fill="none" stroke={a} strokeWidth="1.2" opacity=".4" />
          <circle cx="67" cy="76" r="2" fill="none" stroke={a} strokeWidth="1" opacity=".3" />
          <line x1="4" y1="24" x2="16" y2="28" stroke={a} strokeWidth="1.5" opacity=".45" />
          <line x1="4" y1="36" x2="16" y2="32" stroke={a} strokeWidth="1.5" opacity=".45" />
          <circle cx="18" cy="30" r="3" fill={a} opacity=".3" stroke={a} strokeWidth="1.2" />
          <line x1="4" y1="18" x2="14" y2="24" stroke={a} strokeWidth="1.2" opacity=".35" />
          <path d="M 6,58 Q 6,50 12,50 Q 18,50 18,58 L 18,64 L 6,64 Z"
            fill="none" stroke={c} strokeWidth="1.3" opacity=".4" />
          <circle cx="12" cy="66" r="1.5" fill={c} opacity=".3" />
        </>
      );

    case "Sociology":
      return (
        <>
          <circle cx="55" cy="14" r="8" fill="none" stroke={c} strokeWidth="2" />
          <path d="M 40,28 Q 40,40 55,40 Q 70,40 70,28" fill="none" stroke={c} strokeWidth="2" />
          <line x1="55" y1="40" x2="55" y2="58" stroke={c} strokeWidth="1.5" opacity=".5" />
          <circle cx="20" cy="36" r="7" fill="none" stroke={a} strokeWidth="1.8" />
          <path d="M 8,50 Q 8,60 20,60 Q 32,60 32,50" fill="none" stroke={a} strokeWidth="1.8" />
          <circle cx="90" cy="36" r="7" fill="none" stroke={a} strokeWidth="1.8" />
          <path d="M 78,50 Q 78,60 90,60 Q 102,60 102,50" fill="none" stroke={a} strokeWidth="1.8" />
          <circle cx="30" cy="62" r="5.5" fill="none" stroke={c} strokeWidth="1.4" opacity=".6" />
          <path d="M 22,72 Q 22,78 30,78 Q 38,78 38,72" fill="none" stroke={c} strokeWidth="1.4" opacity=".6" />
          <circle cx="80" cy="62" r="5.5" fill="none" stroke={c} strokeWidth="1.4" opacity=".6" />
          <path d="M 72,72 Q 72,78 80,78 Q 88,78 88,72" fill="none" stroke={c} strokeWidth="1.4" opacity=".6" />
          <line x1="32" y1="42" x2="44" y2="30" stroke={c} strokeWidth="1.3" opacity=".4" strokeDasharray="3 3" />
          <line x1="78" y1="42" x2="66" y2="30" stroke={c} strokeWidth="1.3" opacity=".4" strokeDasharray="3 3" />
          <line x1="32" y1="54" x2="78" y2="54" stroke={a} strokeWidth="1" opacity=".3" strokeDasharray="3 3" />
          <line x1="36" y1="66" x2="74" y2="66" stroke={a} strokeWidth="1" opacity=".25" strokeDasharray="3 3" />
          <circle cx="55" cy="45" r="32" fill="none" stroke={c} strokeWidth="1" opacity=".15" strokeDasharray="4 3" />
        </>
      );

    case "Environmental Science":
      return (
        <>
          <line x1="55" y1="42" x2="55" y2="76" stroke={c} strokeWidth="3" />
          <line x1="55" y1="54" x2="36" y2="40" stroke={c} strokeWidth="2" />
          <line x1="36" y1="40" x2="26" y2="30" stroke={c} strokeWidth="1.5" />
          <line x1="36" y1="40" x2="32" y2="28" stroke={c} strokeWidth="1.2" />
          <line x1="55" y1="50" x2="74" y2="36" stroke={c} strokeWidth="2" />
          <line x1="74" y1="36" x2="84" y2="26" stroke={c} strokeWidth="1.5" />
          <line x1="74" y1="36" x2="78" y2="24" stroke={c} strokeWidth="1.2" />
          <circle cx="55" cy="24" r="20" fill={a} opacity=".14" stroke={a} strokeWidth="1.8" />
          <circle cx="38" cy="26" r="12" fill={c} opacity=".1" stroke={c} strokeWidth="1.4" />
          <circle cx="72" cy="24" r="13" fill={c} opacity=".1" stroke={c} strokeWidth="1.4" />
          <path d="M 52,76 Q 44,80 36,78" fill="none" stroke={c} strokeWidth="1.4" opacity=".5" />
          <path d="M 55,76 Q 52,82 48,84" fill="none" stroke={c} strokeWidth="1.4" opacity=".5" />
          <path d="M 58,76 Q 66,80 74,78" fill="none" stroke={c} strokeWidth="1.4" opacity=".5" />
          <circle cx="14" cy="12" r="8" fill={a} opacity=".2" stroke={a} strokeWidth="1.5" />
          {[0,45,90,135,180,225,270,315].map(d => (
            <line key={d}
              x1={14 + 10*Math.cos(d*Math.PI/180)} y1={12 + 10*Math.sin(d*Math.PI/180)}
              x2={14 + 13*Math.cos(d*Math.PI/180)} y2={12 + 13*Math.sin(d*Math.PI/180)}
              stroke={a} strokeWidth="1.3" opacity=".55" />
          ))}
          <path d="M 88,55 Q 96,48 96,62 Q 96,72 88,68" fill="none" stroke={a} strokeWidth="1.4" opacity=".5" />
          <polygon points="88,55 84,60 92,60" fill={a} opacity=".4" />
          <text x="86" y="64" fontSize="6" fontFamily="sans-serif" fill={a} opacity=".5">CO₂</text>
          <path d="M 2,76 Q 20,72 40,76 Q 60,80 80,76 Q 96,72 108,76"
            fill="none" stroke={c} strokeWidth="1.5" opacity=".45" />
        </>
      );

    case "Astronomy":
      return (
        <>
          <rect x="0" y="0" width="110" height="80" fill={c} opacity=".03" />
          <circle cx="44" cy="42" r="22" fill={c} opacity=".12" stroke={c} strokeWidth="2" />
          <path d="M 25,36 Q 44,32 63,36" fill="none" stroke={c} strokeWidth="1" opacity=".3" />
          <path d="M 23,42 Q 44,38 65,42" fill="none" stroke={c} strokeWidth="1.2" opacity=".35" />
          <path d="M 25,48 Q 44,44 63,48" fill="none" stroke={c} strokeWidth="1" opacity=".3" />
          <ellipse cx="36" cy="38" rx="6" ry="4" fill={c} opacity=".12" />
          <ellipse cx="52" cy="46" rx="4" ry="3" fill={c} opacity=".1" />
          <ellipse cx="44" cy="42" rx="36" ry="9" fill="none" stroke={a} strokeWidth="2" opacity=".6" />
          <ellipse cx="44" cy="42" rx="30" ry="7" fill="none" stroke={a} strokeWidth="1" opacity=".4" />
          {[[8,6],[18,14],[95,8],[100,22],[88,16],[6,28],[102,50],[8,58],[96,64]].map(([x,y],i) => (
            <polygon key={i}
              points={`${x},${y-3} ${x+1},${y-1} ${x+3},${y-1} ${x+1.5},${y+0.5} ${x+2},${y+3} ${x},${y+1.5} ${x-2},${y+3} ${x-1.5},${y+0.5} ${x-3},${y-1} ${x-1},${y-1}`}
              fill={a} opacity={0.4 + (i%3)*0.15} />
          ))}
          <circle cx="90" cy="32" r="4" fill={a} opacity=".35" stroke={a} strokeWidth="1.2" />
          <path d="M 86,30 Q 78,24 66,14" fill="none" stroke={a} strokeWidth="2" opacity=".3" />
          <path d="M 86,32 Q 76,28 62,18" fill="none" stroke={a} strokeWidth="1.2" opacity=".2" />
          <path d="M 87,34 Q 78,32 66,24" fill="none" stroke={a} strokeWidth="1" opacity=".15" />
          <circle cx="86" cy="62" r="8" fill="none" stroke={c} strokeWidth="1.5" />
          <circle cx="82" cy="60" r="2" fill="none" stroke={c} strokeWidth="0.8" opacity=".5" />
          <circle cx="88" cy="65" r="1.5" fill="none" stroke={c} strokeWidth="0.8" opacity=".4" />
          <line x1="4" y1="70" x2="18" y2="54" stroke={c} strokeWidth="2" opacity=".5" />
          <ellipse cx="10" cy="62" rx="5" ry="2.5" fill="none" stroke={c} strokeWidth="1.5" opacity=".5" transform="rotate(-35,10,62)" />
          <line x1="4" y1="74" x2="22" y2="74" stroke={c} strokeWidth="1.5" opacity=".4" />
        </>
      );

    case "Biotechnology":
      return (
        <>
          <path d="M 12,4 Q 22,14 12,24 Q 2,34 12,44 Q 22,54 12,64 Q 2,74 12,84"
            fill="none" stroke={c} strokeWidth="2" />
          <path d="M 28,4 Q 18,14 28,24 Q 38,34 28,44 Q 18,54 28,64 Q 38,74 28,84"
            fill="none" stroke={a} strokeWidth="2" />
          {[14,24,34,44,54,64,74].map((y,i) => (
            <line key={i} x1="12" y1={y} x2="28" y2={y} stroke={i%2===0?c:a} strokeWidth="1.5" opacity=".55" />
          ))}
          <rect x="54" y="36" width="18" height="10" rx="2" fill="none" stroke={c} strokeWidth="1.5" />
          <line x1="63" y1="36" x2="63" y2="22" stroke={c} strokeWidth="2" />
          <rect x="56" y="20" width="14" height="4" rx="1" fill="none" stroke={c} strokeWidth="1.5" />
          <circle cx="63" cy="16" r="5" fill="none" stroke={a} strokeWidth="1.5" />
          <line x1="60" y1="46" x2="56" y2="58" stroke={c} strokeWidth="2" />
          <line x1="66" y1="46" x2="70" y2="58" stroke={c} strokeWidth="2" />
          <line x1="50" y1="58" x2="80" y2="58" stroke={c} strokeWidth="1.5" />
          <ellipse cx="88" cy="22" rx="14" ry="8" fill={a} opacity=".1" stroke={a} strokeWidth="1.5" />
          <ellipse cx="88" cy="22" rx="10" ry="5" fill="none" stroke={a} strokeWidth="0.8" opacity=".4" />
          <circle cx="84" cy="20" r="2" fill={a} opacity=".3" />
          <circle cx="91" cy="24" r="1.5" fill={a} opacity=".25" />
          <circle cx="86" cy="25" r="1" fill={c} opacity=".3" />
          <path d="M 76,50 Q 84,56 80,64" fill="none" stroke={a} strokeWidth="1.5" opacity=".5" />
          <path d="M 76,50 Q 68,56 72,64" fill="none" stroke={a} strokeWidth="1.5" opacity=".5" />
          <circle cx="76" cy="50" r="3" fill="none" stroke={a} strokeWidth="1.2" opacity=".5" />
          <circle cx="98" cy="48" r="7" fill="none" stroke={c} strokeWidth="1.3" opacity=".45" />
          <circle cx="98" cy="62" r="7" fill="none" stroke={c} strokeWidth="1.3" opacity=".45" />
          <line x1="98" y1="55" x2="98" y2="55" stroke={c} strokeWidth="1.5" opacity=".4" strokeDasharray="2 1" />
        </>
      );

    case "Artificial Intelligence":
      return (
        <>
          <rect x="28" y="16" width="54" height="46" rx="10" fill={c} opacity=".1" stroke={c} strokeWidth="2" />
          <rect x="34" y="10" width="42" height="8" rx="3" fill="none" stroke={c} strokeWidth="1.5" />
          <line x1="55" y1="10" x2="55" y2="4" stroke={c} strokeWidth="2" />
          <circle cx="55" cy="3" r="2.5" fill={a} opacity=".6" />
          <circle cx="42" cy="34" r="8" fill={a} opacity=".12" stroke={a} strokeWidth="2" />
          <circle cx="42" cy="34" r="4" fill={a} opacity=".25" />
          <circle cx="42" cy="34" r="1.5" fill={a} />
          <circle cx="68" cy="34" r="8" fill={c} opacity=".12" stroke={c} strokeWidth="2" />
          <circle cx="68" cy="34" r="4" fill={c} opacity=".25" />
          <circle cx="68" cy="34" r="1.5" fill={c} />
          <path d="M 40,50 Q 55,60 70,50" fill="none" stroke={a} strokeWidth="2" />
          <path d="M 46,8 Q 55,2 64,8" fill="none" stroke={a} strokeWidth="1.2" opacity=".4" />
          <path d="M 42,10 Q 55,-1 68,10" fill="none" stroke={a} strokeWidth="1" opacity=".25" />
          <line x1="28" y1="32" x2="18" y2="28" stroke={c} strokeWidth="1.5" />
          <line x1="82" y1="32" x2="92" y2="28" stroke={c} strokeWidth="1.5" />
          <line x1="28" y1="42" x2="18" y2="46" stroke={a} strokeWidth="1.5" />
          <line x1="82" y1="42" x2="92" y2="46" stroke={a} strokeWidth="1.5" />
          <circle cx="16" cy="28" r="3" fill={c} opacity=".3" />
          <circle cx="94" cy="28" r="3" fill={a} opacity=".3" />
          {[[30,72],[44,68],[55,72],[66,68],[80,72]].map(([x,y],i) => (
            <circle key={i} cx={x} cy={y} r="3" fill="none" stroke={i%2===0?c:a} strokeWidth="1.2" opacity=".5" />
          ))}
          {[[30,72],[44,68],[55,72],[66,68],[80,72]].map(([x,y],i,arr) => i < arr.length-1 ? (
            <line key={`l${i}`} x1={x} y1={y} x2={arr[i+1][0]} y2={arr[i+1][1]} stroke={c} strokeWidth="0.8" opacity=".3" />
          ) : null)}
          <line x1="44" y1="62" x2="44" y2="68" stroke={a} strokeWidth="1" opacity=".35" />
          <line x1="66" y1="62" x2="66" y2="68" stroke={a} strokeWidth="1" opacity=".35" />
        </>
      );

    case "Engineering Graphics":
      return (
        <>
          <rect x="4" y="4" width="102" height="72" rx="2" fill="none" stroke={c} strokeWidth="1" opacity=".2" />
          <rect x="10" y="16" width="34" height="26" fill={c} opacity=".08" stroke={c} strokeWidth="1.8" />
          <line x1="10" y1="26" x2="44" y2="26" stroke={c} strokeWidth="0.8" opacity=".3" strokeDasharray="4 2" />
          <line x1="10" y1="36" x2="44" y2="36" stroke={c} strokeWidth="0.8" opacity=".3" strokeDasharray="4 2" />
          <rect x="10" y="50" width="34" height="20" fill={c} opacity=".06" stroke={c} strokeWidth="1.5" />
          <line x1="18" y1="50" x2="18" y2="70" stroke={c} strokeWidth="0.8" opacity=".3" strokeDasharray="4 2" />
          <line x1="36" y1="50" x2="36" y2="70" stroke={c} strokeWidth="0.8" opacity=".3" strokeDasharray="4 2" />
          <rect x="52" y="16" width="22" height="26" fill={c} opacity=".06" stroke={c} strokeWidth="1.5" />
          <path d="M 72,46 L 96,36 L 96,60 L 72,70 Z" fill={a} opacity=".1" stroke={a} strokeWidth="1.8" />
          <path d="M 72,46 L 96,36 L 80,28 L 56,38 Z" fill={a} opacity=".14" stroke={a} strokeWidth="1.8" />
          <path d="M 72,46 L 56,38 L 56,62 L 72,70 Z" fill={c} opacity=".12" stroke={c} strokeWidth="1.8" />
          <line x1="72" y1="46" x2="72" y2="28" stroke={a} strokeWidth="1" opacity=".3" strokeDasharray="3 2" />
          <line x1="10" y1="74" x2="44" y2="74" stroke={a} strokeWidth="1.2" />
          <polygon points="10,74 14,72 14,76" fill={a} />
          <polygon points="44,74 40,72 40,76" fill={a} />
          <text x="22" y="79" fontSize="7" fontFamily="monospace" fill={a} opacity=".65">34mm</text>
          <line x1="4" y1="12" x2="106" y2="12" stroke={a} strokeWidth="1.2" opacity=".3" />
          <line x1="4" y1="8" x2="4" y2="16" stroke={a} strokeWidth="2" opacity=".3" />
        </>
      );

    case "Health Education":
      return (
        <>
          <path d="M 55,68 Q 22,48 22,28 Q 22,10 38,10 Q 48,10 55,22 Q 62,10 72,10 Q 88,10 88,28 Q 88,48 55,68 Z"
            fill={c} opacity=".12" stroke={c} strokeWidth="2" />
          <path d="M 30,36 L 38,36 L 42,24 L 46,48 L 50,30 L 54,36 L 80,36"
            fill="none" stroke={a} strokeWidth="1.8" opacity=".7" />
          <rect x="48" y="32" width="14" height="14" rx="2" fill="none" stroke={a} strokeWidth="2" opacity=".6" />
          <line x1="55" y1="34" x2="55" y2="44" stroke={a} strokeWidth="2" opacity=".6" />
          <line x1="50" y1="39" x2="60" y2="39" stroke={a} strokeWidth="2" opacity=".6" />
          <path d="M 8,16 Q 8,26 16,28 Q 24,30 26,38 Q 28,46 22,50"
            fill="none" stroke={c} strokeWidth="1.8" opacity=".6" />
          <circle cx="20" cy="52" r="5" fill="none" stroke={c} strokeWidth="1.5" opacity=".6" />
          <line x1="8" y1="16" x2="14" y2="16" stroke={c} strokeWidth="2" opacity=".6" />
          <circle cx="6" cy="14" r="2.5" fill="none" stroke={c} strokeWidth="1.5" opacity=".6" />
          <circle cx="14" cy="14" r="2.5" fill="none" stroke={c} strokeWidth="1.5" opacity=".6" />
          <path d="M 88,60 Q 94,54 90,48 Q 86,42 92,36 Q 98,30 94,24"
            fill="none" stroke={a} strokeWidth="1.4" opacity=".45" />
          <path d="M 96,60 Q 90,54 94,48 Q 98,42 92,36 Q 86,30 90,24"
            fill="none" stroke={c} strokeWidth="1.4" opacity=".45" />
          {[48,36,24].map((y,i) => <line key={i} x1="88" y1={y+12} x2="96" y2={y+12} stroke={i%2===0?c:a} strokeWidth="1.2" opacity=".4" />)}
          <path d="M 96,68 Q 94,62 98,60 Q 104,58 106,64 Q 108,70 104,74 Q 100,78 96,74 Z"
            fill="none" stroke={c} strokeWidth="1.3" opacity=".4" />
          <path d="M 100,58 Q 100,54 104,52" fill="none" stroke={c} strokeWidth="1" opacity=".35" />
        </>
      );

    case "Value Education":
      return (
        <>
          <polygon points="55,4 62,26 86,26 68,40 74,64 55,50 36,64 42,40 24,26 48,26"
            fill={c} opacity=".1" stroke={c} strokeWidth="2" />
          <line x1="55" y1="4" x2="55" y2="50" stroke={c} strokeWidth="1" opacity=".25" />
          <line x1="24" y1="26" x2="74" y2="64" stroke={c} strokeWidth="1" opacity=".25" />
          <line x1="86" y1="26" x2="36" y2="64" stroke={c} strokeWidth="1" opacity=".25" />
          <path d="M 30,68 Q 26,60 32,56 Q 38,52 44,56 L 44,66"
            fill="none" stroke={a} strokeWidth="1.8" opacity=".6" />
          <path d="M 80,68 Q 84,60 78,56 Q 72,52 66,56 L 66,66"
            fill="none" stroke={a} strokeWidth="1.8" opacity=".6" />
          <path d="M 30,68 Q 42,74 55,74 Q 68,74 80,68"
            fill="none" stroke={a} strokeWidth="1.8" opacity=".6" />
          <path d="M 48,32 Q 44,26 48,22 Q 54,18 58,24 Q 64,18 68,24 Q 62,32 55,36 Q 48,32 48,32 Z"
            fill="none" stroke={a} strokeWidth="1.5" opacity=".5" />
          <path d="M 55,36 L 52,44" fill="none" stroke={a} strokeWidth="1.2" opacity=".4" />
          <path d="M 52,44 L 48,46 L 55,42 L 62,46 L 58,44 L 55,44" fill="none" stroke={a} strokeWidth="1" opacity=".35" />
          <circle cx="55" cy="35" r="5" fill="none" stroke={a} strokeWidth="1" opacity=".35" />
          <circle cx="55" cy="35" r="1.5" fill={a} opacity=".4" />
          {[0,36,72,108,144,180,216,252,288,324].map(d => (
            <line key={d}
              x1={55 + 6*Math.cos(d*Math.PI/180)} y1={34 + 6*Math.sin(d*Math.PI/180)}
              x2={55 + 14*Math.cos(d*Math.PI/180)} y2={34 + 14*Math.sin(d*Math.PI/180)}
              stroke={a} strokeWidth="0.8" opacity=".25" />
          ))}
        </>
      );

    case "Agriculture":
      return (
        <>
          <path d="M 0,62 Q 20,58 40,62 Q 60,66 80,62 Q 100,58 110,62 L 110,80 L 0,80 Z"
            fill={c} opacity=".1" stroke={c} strokeWidth="1.5" />
          {[8,18,28,38,48,58,68,78,88,98].map(x => (
            <line key={x} x1={x} y1="66" x2={x+4} y2="70" stroke={c} strokeWidth="0.8" opacity=".2" />
          ))}
          <line x1="55" y1="62" x2="55" y2="22" stroke={c} strokeWidth="2.5" />
          <path d="M 55,42 Q 38,34 28,40 Q 38,46 55,42 Z" fill={a} opacity=".2" stroke={a} strokeWidth="1.5" />
          <path d="M 55,32 Q 72,24 82,30 Q 72,36 55,32 Z" fill={a} opacity=".2" stroke={a} strokeWidth="1.5" />
          <path d="M 55,50 Q 40,44 32,50 Q 40,56 55,50 Z" fill={c} opacity=".15" stroke={c} strokeWidth="1.2" />
          <line x1="55" y1="42" x2="36" y2="40" stroke={a} strokeWidth="0.8" opacity=".4" />
          <line x1="55" y1="32" x2="74" y2="30" stroke={a} strokeWidth="0.8" opacity=".4" />
          <line x1="22" y1="62" x2="22" y2="30" stroke={c} strokeWidth="1.5" opacity=".6" />
          <ellipse cx="22" cy="26" rx="3" ry="6" fill={a} opacity=".2" stroke={a} strokeWidth="1" />
          <line x1="16" y1="62" x2="16" y2="34" stroke={c} strokeWidth="1.5" opacity=".5" />
          <ellipse cx="16" cy="30" rx="2.5" ry="5" fill={a} opacity=".18" stroke={a} strokeWidth="1" />
          <line x1="88" y1="62" x2="88" y2="28" stroke={c} strokeWidth="1.5" opacity=".6" />
          <ellipse cx="88" cy="24" rx="3" ry="6" fill={a} opacity=".2" stroke={a} strokeWidth="1" />
          <line x1="94" y1="62" x2="94" y2="32" stroke={c} strokeWidth="1.5" opacity=".5" />
          <ellipse cx="94" cy="28" rx="2.5" ry="5" fill={a} opacity=".18" stroke={a} strokeWidth="1" />
          <circle cx="14" cy="12" r="7" fill={a} opacity=".2" stroke={a} strokeWidth="1.5" />
          {[0,60,120,180,240,300].map(d => (
            <line key={d}
              x1={14+9*Math.cos(d*Math.PI/180)} y1={12+9*Math.sin(d*Math.PI/180)}
              x2={14+12*Math.cos(d*Math.PI/180)} y2={12+12*Math.sin(d*Math.PI/180)}
              stroke={a} strokeWidth="1.3" opacity=".5" />
          ))}
          <path d="M 100,16 Q 100,10 104,12 Q 108,14 106,18 Q 104,22 100,16 Z"
            fill="none" stroke={c} strokeWidth="1.2" opacity=".5" />
          <path d="M 94,22 Q 94,16 98,18 Q 102,20 100,24 Q 98,28 94,22 Z"
            fill="none" stroke={c} strokeWidth="1.2" opacity=".4" />
        </>
      );

    case "Mechanical Engineering":
      return (
        <>
          <circle cx="36" cy="42" r="22" fill="none" stroke={c} strokeWidth="2" />
          <circle cx="36" cy="42" r="14" fill={c} opacity=".08" stroke={c} strokeWidth="1.5" />
          <circle cx="36" cy="42" r="5" fill="none" stroke={c} strokeWidth="2" />
          {[0,30,60,90,120,150,180,210,240,270,300,330].map(d => (
            <rect key={d}
              x={36 + 20*Math.cos(d*Math.PI/180) - 3}
              y={42 + 20*Math.sin(d*Math.PI/180) - 4}
              width="6" height="8"
              transform={`rotate(${d}, ${36 + 20*Math.cos(d*Math.PI/180)}, ${42 + 20*Math.sin(d*Math.PI/180)})`}
              fill={c} opacity=".2" stroke={c} strokeWidth="1" />
          ))}
          {[0,60,120,180,240,300].map(d => (
            <line key={d}
              x1={36+6*Math.cos(d*Math.PI/180)} y1={42+6*Math.sin(d*Math.PI/180)}
              x2={36+13*Math.cos(d*Math.PI/180)} y2={42+13*Math.sin(d*Math.PI/180)}
              stroke={c} strokeWidth="2.5" />
          ))}
          <circle cx="82" cy="28" r="13" fill="none" stroke={a} strokeWidth="1.8" />
          <circle cx="82" cy="28" r="8" fill={a} opacity=".08" stroke={a} strokeWidth="1.2" />
          <circle cx="82" cy="28" r="3" fill="none" stroke={a} strokeWidth="1.5" />
          {[0,45,90,135,180,225,270,315].map(d => (
            <rect key={d}
              x={82 + 12*Math.cos(d*Math.PI/180) - 2}
              y={28 + 12*Math.sin(d*Math.PI/180) - 3}
              width="4" height="6"
              transform={`rotate(${d}, ${82 + 12*Math.cos(d*Math.PI/180)}, ${28 + 12*Math.sin(d*Math.PI/180)})`}
              fill={a} opacity=".2" stroke={a} strokeWidth="0.8" />
          ))}
          <circle cx="60" cy="42" r="3" fill={c} opacity=".2" />
          <path d="M 72,62 Q 68,56 72,52 Q 78,48 84,52 L 80,56 Q 76,52 74,56 Q 72,60 76,64 Q 80,68 84,64 L 88,68 Q 84,74 78,72 Q 70,68 72,62 Z"
            fill="none" stroke={a} strokeWidth="1.5" opacity=".55" />
          <line x1="84" y1="64" x2="96" y2="76" stroke={a} strokeWidth="2.5" opacity=".55" />
        </>
      );

    case "Civil Engineering":
      return (
        <>
          <rect x="14" y="24" width="12" height="50" fill={c} opacity=".1" stroke={c} strokeWidth="2" />
          <rect x="84" y="24" width="12" height="50" fill={c} opacity=".1" stroke={c} strokeWidth="2" />
          {[28,36,44,52,60,68].map(y => (
            <line key={`l${y}`} x1="14" y1={y} x2="26" y2={y} stroke={c} strokeWidth="0.7" opacity=".25" />
          ))}
          {[28,36,44,52,60,68].map(y => (
            <line key={`r${y}`} x1="84" y1={y} x2="96" y2={y} stroke={c} strokeWidth="0.7" opacity=".25" />
          ))}
          <path d="M 14,24 Q 55,52 96,24" fill="none" stroke={a} strokeWidth="2.2" />
          <path d="M 14,24 Q 55,44 96,24" fill="none" stroke={a} strokeWidth="1" opacity=".3" />
          {[22,30,38,46,54,62,70,78,86].map((x, i) => {
            const sagY = 24 + 28*Math.sin(((x-14)/82)*Math.PI);
            return <line key={i} x1={x} y1={sagY} x2={x} y2="74" stroke={a} strokeWidth="1.2" opacity=".4" />;
          })}
          <line x1="6" y1="74" x2="104" y2="74" stroke={c} strokeWidth="2.5" />
          <line x1="6" y1="70" x2="104" y2="70" stroke={c} strokeWidth="0.8" opacity=".3" />
          <line x1="0" y1="76" x2="110" y2="76" stroke={c} strokeWidth="1.5" opacity=".4" />
          <rect x="0" y="0" width="110" height="80" fill="none" stroke={a} strokeWidth="0.4" opacity=".1" />
          {[20,40,60,80,100].map(x => <line key={x} x1={x} y1="0" x2={x} y2="80" stroke={a} strokeWidth="0.4" opacity=".1" />)}
          {[16,32,48,64].map(y => <line key={y} x1="0" y1={y} x2="110" y2={y} stroke={a} strokeWidth="0.4" opacity=".1" />)}
        </>
      );

    case "Electrical Engineering":
      return (
        <>
          <rect x="4" y="4" width="102" height="72" rx="3" fill={c} opacity=".05" stroke={c} strokeWidth="1" />
          <polyline points="10,20 30,20 30,40 60,40" fill="none" stroke={c} strokeWidth="1.5" opacity=".4" />
          <polyline points="10,50 20,50 20,60 50,60 50,40" fill="none" stroke={c} strokeWidth="1.5" opacity=".4" />
          <polyline points="80,40 100,40 100,20 90,20" fill="none" stroke={a} strokeWidth="1.5" opacity=".45" />
          <polyline points="60,40 80,40 80,60 100,60" fill="none" stroke={a} strokeWidth="1.5" opacity=".4" />
          <rect x="26" y="17" width="8" height="6" fill={c} opacity=".2" stroke={c} strokeWidth="1.2" />
          <rect x="46" y="56" width="8" height="7" fill={c} opacity=".2" stroke={c} strokeWidth="1.2" />
          <rect x="86" y="17" width="8" height="6" fill={a} opacity=".2" stroke={a} strokeWidth="1.2" />
          <line x1="68" y1="34" x2="68" y2="46" stroke={c} strokeWidth="2" />
          <line x1="64" y1="36" x2="72" y2="36" stroke={c} strokeWidth="2" />
          <line x1="64" y1="44" x2="72" y2="44" stroke={c} strokeWidth="2" />
          <path d="M 52,8 L 44,32 L 56,32 L 42,64 L 52,40 L 40,40 Z"
            fill={a} opacity=".2" stroke={a} strokeWidth="2" />
          <circle cx="88" cy="50" r="8" fill={a} opacity=".1" stroke={a} strokeWidth="1.5" />
          <line x1="84" y1="58" x2="92" y2="58" stroke={a} strokeWidth="1.5" />
          {[315,0,45].map(d => (
            <line key={d}
              x1={88+10*Math.cos(d*Math.PI/180)} y1={50+10*Math.sin(d*Math.PI/180)}
              x2={88+14*Math.cos(d*Math.PI/180)} y2={50+14*Math.sin(d*Math.PI/180)}
              stroke={a} strokeWidth="1" opacity=".4" />
          ))}
          <rect x="12" y="58" width="18" height="14" rx="1" fill={c} opacity=".12" stroke={c} strokeWidth="1.5" />
          {[60,64,68].map(y => <line key={`l${y}`} x1="8" y1={y} x2="12" y2={y} stroke={c} strokeWidth="1.2" opacity=".5" />)}
          {[60,64,68].map(y => <line key={`r${y}`} x1="30" y1={y} x2="34" y2={y} stroke={c} strokeWidth="1.2" opacity=".5" />)}
        </>
      );

    case "Finance":
      return (
        <>
          <line x1="10" y1="74" x2="106" y2="74" stroke={c} strokeWidth="1.5" />
          <line x1="10" y1="74" x2="10" y2="4" stroke={c} strokeWidth="1.5" />
          {[
            [18, 40, 60, 34, 64, true],
            [28, 34, 50, 28, 56, false],
            [38, 28, 48, 22, 52, true],
            [48, 22, 42, 18, 46, true],
            [58, 42, 54, 36, 58, false],
            [68, 36, 52, 28, 58, true],
            [78, 28, 44, 22, 50, true],
            [88, 24, 38, 18, 42, true],
          ].map(([x, top, bot, wickT, wickB, bull], i) => (
            <g key={i}>
              <line x1={x as number} y1={wickT as number} x2={x as number} y2={wickB as number} stroke={bull ? a : c} strokeWidth="1.2" />
              <rect x={(x as number)-4} y={top as number} width="8" height={(bot as number)-(top as number)}
                fill={bull ? a : c} opacity={bull ? 0.3 : 0.15} stroke={bull ? a : c} strokeWidth="1.2" />
            </g>
          ))}
          <path d="M 14,62 Q 28,54 38,46 Q 52,38 68,32 Q 80,26 96,20"
            fill="none" stroke={a} strokeWidth="1.8" strokeDasharray="5 3" opacity=".6" />
          <text x="75" y="68" fontSize="28" fontFamily="serif" fill={c} opacity=".07" fontWeight="bold">$</text>
          {[18,28,38,48,58,68,78,88].map((x,i) => (
            <rect key={i} x={x-3} y={74-[8,12,6,10,5,14,9,16][i]} width="6" height={[8,12,6,10,5,14,9,16][i]}
              fill={i%2===0?c:a} opacity=".15" />
          ))}
        </>
      );

    case "Marketing":
      return (
        <>
          <path d="M 12,30 L 12,50 L 36,58 L 36,22 Z"
            fill={c} opacity=".12" stroke={c} strokeWidth="2" />
          <rect x="6" y="30" width="8" height="20" rx="2" fill="none" stroke={c} strokeWidth="1.8" />
          <path d="M 36,22 Q 56,14 72,12 L 72,68 Q 56,66 36,58" fill={c} opacity=".08" stroke={c} strokeWidth="1.5" />
          <ellipse cx="72" cy="40" rx="10" ry="28" fill="none" stroke={c} strokeWidth="2" />
          <path d="M 82,30 Q 92,40 82,50" fill="none" stroke={a} strokeWidth="1.8" opacity=".6" />
          <path d="M 86,22 Q 100,40 86,58" fill="none" stroke={a} strokeWidth="1.5" opacity=".45" />
          <path d="M 90,16 Q 108,40 90,64" fill="none" stroke={a} strokeWidth="1.2" opacity=".3" />
          <path d="M 20,8 Q 20,4 24,6 Q 28,4 28,8 Q 28,12 24,16 Q 20,12 20,8 Z"
            fill="none" stroke={a} strokeWidth="1.3" opacity=".6" />
          <polygon points="50,6 51.5,10 56,10 52.5,12.5 54,16.5 50,14 46,16.5 47.5,12.5 44,10 48.5,10"
            fill="none" stroke={a} strokeWidth="1.2" opacity=".55" />
          <path d="M 16,72 L 16,62 Q 20,58 24,60 L 28,60 Q 32,58 32,62 L 30,72 Z"
            fill="none" stroke={a} strokeWidth="1.2" opacity=".5" />
          <line x1="16" y1="64" x2="20" y2="58" stroke={a} strokeWidth="1" opacity=".4" />
          <rect x="42" y="64" width="6" height="10" fill={a} opacity=".2" stroke={a} strokeWidth="1" />
          <rect x="50" y="58" width="6" height="16" fill={a} opacity=".2" stroke={a} strokeWidth="1" />
          <rect x="58" y="54" width="6" height="20" fill={a} opacity=".2" stroke={a} strokeWidth="1" />
          <line x1="40" y1="74" x2="66" y2="74" stroke={a} strokeWidth="1.2" opacity=".4" />
        </>
      );

    case "Entrepreneurship":
      return (
        <>
          <path d="M 55,4 Q 44,10 40,24 L 40,50 L 55,58 L 70,50 L 70,24 Q 66,10 55,4 Z"
            fill={c} opacity=".12" stroke={c} strokeWidth="2" />
          <circle cx="55" cy="28" r="8" fill={a} opacity=".15" stroke={a} strokeWidth="1.8" />
          <circle cx="55" cy="28" r="4" fill={a} opacity=".15" />
          <path d="M 40,44 L 30,56 L 40,52 Z" fill={c} opacity=".15" stroke={c} strokeWidth="1.5" />
          <path d="M 70,44 L 80,56 L 70,52 Z" fill={c} opacity=".15" stroke={c} strokeWidth="1.5" />
          <path d="M 46,58 Q 48,66 44,72 Q 50,64 55,68 Q 60,64 66,72 Q 62,66 64,58"
            fill={a} opacity=".3" stroke={a} strokeWidth="1.5" />
          <path d="M 50,58 Q 52,64 55,70 Q 58,64 60,58"
            fill={a} opacity=".2" />
          <circle cx="12" cy="10" r="1.5" fill={a} opacity=".5" />
          <circle cx="22" cy="6" r="1" fill={a} opacity=".4" />
          <circle cx="8" cy="24" r="1" fill={c} opacity=".4" />
          <circle cx="98" cy="8" r="1.5" fill={a} opacity=".5" />
          <circle cx="104" cy="20" r="1" fill={a} opacity=".4" />
          <circle cx="90" cy="4" r="1" fill={c} opacity=".4" />
          <line x1="10" y1="78" x2="100" y2="78" stroke={c} strokeWidth="1.5" />
          <path d="M 14,76 L 28,70 L 42,66 L 56,60 L 70,52 L 84,44 L 98,36"
            fill="none" stroke={a} strokeWidth="2" opacity=".5" />
          <polygon points="98,36 94,38 96,42" fill={a} opacity=".5" />
          <circle cx="100" cy="62" r="7" fill={a} opacity=".12" stroke={a} strokeWidth="1.4" />
          <line x1="97" y1="69" x2="103" y2="69" stroke={a} strokeWidth="1.4" opacity=".5" />
          <line x1="98" y1="72" x2="102" y2="72" stroke={a} strokeWidth="1.4" opacity=".4" />
        </>
      );

    case "Philosophy":
      return (
        <>
          <circle cx="55" cy="22" r="18" fill={c} opacity=".08" stroke={c} strokeWidth="2" />
          <path d="M 44,16 Q 48,12 52,14" fill="none" stroke={c} strokeWidth="1.2" opacity=".35" />
          <path d="M 58,12 Q 62,10 65,14" fill="none" stroke={c} strokeWidth="1.2" opacity=".35" />
          <ellipse cx="50" cy="22" rx="4" ry="3" fill="none" stroke={c} strokeWidth="1.2" opacity=".45" />
          <circle cx="51" cy="22" r="1.5" fill={c} opacity=".4" />
          <path d="M 40,36 Q 36,42 38,50 Q 40,54 44,52 Q 46,50 44,46" fill="none" stroke={c} strokeWidth="1.5" opacity=".5" />
          <path d="M 44,46 Q 46,38 55,40" fill="none" stroke={c} strokeWidth="1.5" opacity=".5" />
          <circle cx="76" cy="14" r="12" fill={a} opacity=".08" stroke={a} strokeWidth="1.5" />
          <text x="70" y="18" fontSize="12" fontFamily="serif" fill={a} opacity=".6">?</text>
          <circle cx="92" cy="28" r="8" fill={a} opacity=".06" stroke={a} strokeWidth="1.2" />
          <text x="88" y="32" fontSize="10" fontFamily="serif" fill={a} opacity=".5">!</text>
          <circle cx="72" cy="30" r="3" fill="none" stroke={a} strokeWidth="1" opacity=".4" />
          <path d="M 20,56 Q 20,44 30,44 Q 40,44 40,52 Q 40,60 32,60 Q 24,60 24,52 Q 24,48 28,50"
            fill="none" stroke={a} strokeWidth="1.5" opacity=".5" />
          <polygon points="24,50 22,46 26,46" fill={a} opacity=".5" />
          <line x1="55" y1="48" x2="55" y2="62" stroke={c} strokeWidth="1.5" opacity=".5" />
          <line x1="44" y1="54" x2="66" y2="54" stroke={c} strokeWidth="1.5" opacity=".5" />
          <circle cx="55" cy="54" r="2" fill={c} opacity=".4" />
          <path d="M 44,54 L 40,62 L 48,62 Z" fill="none" stroke={c} strokeWidth="1.2" opacity=".5" />
          <path d="M 66,54 L 62,64 L 70,64 Z" fill="none" stroke={a} strokeWidth="1.2" opacity=".5" />
          <text x="4" y="74" fontSize="32" fontFamily="serif" fill={c} opacity=".07">&ldquo;</text>
          <text x="88" y="76" fontSize="32" fontFamily="serif" fill={c} opacity=".07">&rdquo;</text>
          <line x1="10" y1="78" x2="100" y2="78" stroke={a} strokeWidth="1.5" opacity=".4" />
          {[20,40,60,80].map(x => <circle key={x} cx={x} cy="78" r="2" fill={a} opacity=".35" />)}
        </>
      );

    case "Geology":
      return (
        <>
          <path d="M 0,72 Q 18,68 36,72 Q 54,76 72,72 Q 90,68 110,72 L 110,80 L 0,80 Z"
            fill={c} opacity=".18" stroke={c} strokeWidth="1.5" />
          <path d="M 0,62 Q 22,56 44,62 Q 66,68 88,62 Q 100,58 110,62 L 110,72 Q 90,68 72,72 Q 54,76 36,72 Q 18,68 0,72 Z"
            fill={a} opacity=".12" stroke={a} strokeWidth="1.2" />
          <path d="M 0,52 Q 16,46 36,52 Q 56,58 76,52 Q 96,46 110,52 L 110,62 Q 100,58 88,62 Q 66,68 44,62 Q 22,56 0,62 Z"
            fill={c} opacity=".1" stroke={c} strokeWidth="1" />
          <path d="M 0,40 Q 20,34 42,40 Q 64,46 86,40 Q 100,36 110,40 L 110,52 Q 96,46 76,52 Q 56,58 36,52 Q 16,46 0,52 Z"
            fill={a} opacity=".08" stroke={a} strokeWidth="1" />
          <path d="M 4,52 L 22,20 L 40,52" fill={c} opacity=".1" stroke={c} strokeWidth="1.8" />
          <path d="M 18,20 Q 22,14 26,20" fill="none" stroke={a} strokeWidth="1.8" />
          <path d="M 20,18 Q 18,10 20,4" fill="none" stroke={a} strokeWidth="1.5" opacity=".6" />
          <path d="M 22,18 Q 26,8 28,2" fill="none" stroke={a} strokeWidth="1.5" opacity=".5" />
          <path d="M 24,18 Q 30,12 34,6" fill="none" stroke={a} strokeWidth="1.2" opacity=".4" />
          <polygon points="70,60 66,44 74,44" fill="none" stroke={a} strokeWidth="1.5" opacity=".6" />
          <polygon points="76,58 72,44 80,42" fill="none" stroke={a} strokeWidth="1.5" opacity=".5" />
          <polygon points="82,60 79,46 86,44" fill="none" stroke={a} strokeWidth="1.5" opacity=".45" />
          <path d="M 90,24 Q 90,10 100,10 Q 108,10 108,18 Q 108,24 102,26 Q 96,28 96,22 Q 96,18 100,18 Q 102,18 102,20"
            fill="none" stroke={c} strokeWidth="1.5" opacity=".55" />
          <path d="M 0,40 Q 30,36 55,38" fill="none" stroke={c} strokeWidth="2" opacity=".3" />
          <path d="M 55,38 Q 80,40 110,36" fill="none" stroke={a} strokeWidth="2" opacity=".3" />
          <line x1="55" y1="34" x2="55" y2="42" stroke={a} strokeWidth="2.5" opacity=".25" />
        </>
      );

    case "Anthropology":
      return (
        <>
          <circle cx="14" cy="18" r="7" fill="none" stroke={c} strokeWidth="1.5" opacity=".6" />
          <path d="M 14,25 L 14,42" stroke={c} strokeWidth="1.5" opacity=".6" />
          <path d="M 14,42 L 8,56" stroke={c} strokeWidth="1.5" opacity=".6" />
          <path d="M 14,42 L 20,56" stroke={c} strokeWidth="1.5" opacity=".6" />
          <path d="M 6,30 L 22,30" stroke={c} strokeWidth="1.5" opacity=".6" />
          <path d="M 6,30 L 4,44" stroke={c} strokeWidth="0.8" opacity=".4" />
          <path d="M 22,30 L 24,44" stroke={c} strokeWidth="0.8" opacity=".4" />
          <line x1="26" y1="36" x2="34" y2="36" stroke={c} strokeWidth="1.2" opacity=".4" />
          <polygon points="34,36 30,34 30,38" fill={c} opacity=".4" />
          <circle cx="44" cy="18" r="7" fill="none" stroke={c} strokeWidth="1.5" opacity=".65" />
          <path d="M 44,25 L 44,44" stroke={c} strokeWidth="1.8" opacity=".65" />
          <path d="M 44,44 L 38,56" stroke={c} strokeWidth="1.8" opacity=".65" />
          <path d="M 44,44 L 50,56" stroke={c} strokeWidth="1.8" opacity=".65" />
          <path d="M 34,32 L 54,32" stroke={c} strokeWidth="1.5" opacity=".65" />
          <line x1="56" y1="36" x2="64" y2="36" stroke={c} strokeWidth="1.2" opacity=".4" />
          <polygon points="64,36 60,34 60,38" fill={c} opacity=".4" />
          <circle cx="76" cy="14" r="8" fill="none" stroke={a} strokeWidth="2" />
          <path d="M 76,22 L 76,46" stroke={a} strokeWidth="2" />
          <path d="M 76,46 L 68,60" stroke={a} strokeWidth="2" />
          <path d="M 76,46 L 84,60" stroke={a} strokeWidth="2" />
          <path d="M 62,30 L 90,30" stroke={a} strokeWidth="2" />
          <path d="M 94,50 Q 90,44 90,56 Q 90,66 100,68 Q 110,66 110,56 Q 110,44 106,50"
            fill="none" stroke={a} strokeWidth="1.5" opacity=".55" />
          <line x1="92" y1="52" x2="108" y2="52" stroke={a} strokeWidth="1" opacity=".35" />
          <line x1="94" y1="58" x2="106" y2="58" stroke={a} strokeWidth="1" opacity=".35" />
          <line x1="0" y1="60" x2="110" y2="60" stroke={c} strokeWidth="1.2" opacity=".25" strokeDasharray="4 3" />
          <rect x="0" y="72" width="110" height="8" rx="1" fill="none" stroke={c} strokeWidth="1" opacity=".3" />
          {[14,28,42,56,70,84,98].map(x => <line key={x} x1={x} y1="72" x2={x} y2="80" stroke={c} strokeWidth="0.8" opacity=".25" />)}
        </>
      );

    case "Archaeology":
      return (
        <>
          <path d="M 4,72 L 20,40 L 90,40 L 106,72 Z"
            fill={c} opacity=".07" stroke={c} strokeWidth="2" />
          <line x1="22" y1="52" x2="88" y2="52" stroke={c} strokeWidth="1" opacity=".25" strokeDasharray="4 2" />
          <line x1="24" y1="62" x2="86" y2="62" stroke={c} strokeWidth="1" opacity=".2" strokeDasharray="4 2" />
          <line x1="36" y1="40" x2="36" y2="72" stroke={a} strokeWidth="0.8" opacity=".35" />
          <line x1="55" y1="40" x2="55" y2="72" stroke={a} strokeWidth="0.8" opacity=".35" />
          <line x1="74" y1="40" x2="74" y2="72" stroke={a} strokeWidth="0.8" opacity=".35" />
          <path d="M 42,58 Q 40,52 44,50 Q 50,48 52,54 Q 54,60 50,62 Q 46,64 42,58 Z"
            fill="none" stroke={a} strokeWidth="1.5" opacity=".6" />
          <line x1="42" y1="55" x2="52" y2="57" stroke={a} strokeWidth="0.8" opacity=".4" />
          <line x1="43" y1="59" x2="51" y2="60" stroke={a} strokeWidth="0.8" opacity=".4" />
          <path d="M 62,66 L 76,58" stroke={c} strokeWidth="2.5" opacity=".5" />
          <circle cx="60" cy="67" r="3" fill="none" stroke={c} strokeWidth="1.5" opacity=".5" />
          <circle cx="78" cy="57" r="3" fill="none" stroke={c} strokeWidth="1.5" opacity=".5" />
          <path d="M 4,36 Q 10,30 14,34 L 20,40" fill="none" stroke={a} strokeWidth="2" opacity=".6" />
          <path d="M 8,32 L 12,36 L 14,34 L 10,30 Z" fill={a} opacity=".25" stroke={a} strokeWidth="1" />
          <rect x="20" y="36" width="70" height="5" fill="none" stroke={c} strokeWidth="1" opacity=".35" />
          {[30,40,50,60,70,80].map(x => <line key={x} x1={x} y1="36" x2={x} y2="41" stroke={c} strokeWidth="0.8" opacity=".35" />)}
          <path d="M 72,6 L 60,26 L 84,26 Z" fill="none" stroke={c} strokeWidth="1.5" opacity=".35" />
          <line x1="62" y1="26" x2="64" y2="22" stroke={c} strokeWidth="0.8" opacity=".25" />
          <line x1="66" y1="26" x2="68" y2="18" stroke={c} strokeWidth="0.8" opacity=".25" />
          <line x1="70" y1="26" x2="72" y2="14" stroke={c} strokeWidth="0.8" opacity=".25" />
          <line x1="74" y1="26" x2="72" y2="14" stroke={c} strokeWidth="0.8" opacity=".25" />
          <line x1="78" y1="26" x2="76" y2="18" stroke={c} strokeWidth="0.8" opacity=".25" />
          <line x1="82" y1="26" x2="80" y2="22" stroke={c} strokeWidth="0.8" opacity=".25" />
          <polygon points="94,12 95.5,17 100,17 96.5,19.5 98,24.5 94,22 90,24.5 91.5,19.5 88,17 92.5,17"
            fill="none" stroke={a} strokeWidth="1.2" opacity=".45" />
        </>
      );

    case "Criminology":
      return (
        <>
          <circle cx="55" cy="38" r="28" fill={c} opacity=".06" stroke={c} strokeWidth="2" />
          {[4,9,14,19,24].map((r,i) => (
            <ellipse key={i} cx="55" cy="38" rx={r} ry={r*0.8}
              fill="none" stroke={c} strokeWidth="1.2" opacity={0.25 + i*0.07} />
          ))}
          {[10,16,22,28].map((r,i) => (
            <path key={i}
              d={`M ${55-r},${38} Q ${55-r*0.8},${38-r} ${55},${38-r*1.1} Q ${55+r*0.8},${38-r} ${55+r},${38}`}
              fill="none" stroke={c} strokeWidth="1" opacity={0.35 - i*0.04} />
          ))}
          <circle cx="70" cy="24" r="14" fill="none" stroke={a} strokeWidth="2" />
          <circle cx="70" cy="24" r="10" fill={a} opacity=".06" />
          <line x1="80" y1="34" x2="90" y2="44" stroke={a} strokeWidth="3.5" opacity=".6" />
          <line x1="81" y1="33" x2="89" y2="41" stroke={a} strokeWidth="1" opacity=".2" />
          <path d="M 8,10 L 16,6 L 24,10 L 24,22 Q 24,28 16,30 Q 8,28 8,22 Z"
            fill="none" stroke={a} strokeWidth="1.5" opacity=".55" />
          <line x1="12" y1="18" x2="20" y2="18" stroke={a} strokeWidth="1" opacity=".4" />
          <circle cx="16" cy="18" r="3" fill="none" stroke={a} strokeWidth="1" opacity=".45" />
          <rect x="5" y="56" width="20" height="14" rx="2" fill="none" stroke={c} strokeWidth="1.3" opacity=".5" />
          <circle cx="6" cy="56" r="2" fill="none" stroke={c} strokeWidth="1" opacity=".4" />
          <line x1="8" y1="60" x2="22" y2="60" stroke={c} strokeWidth="0.8" opacity=".35" />
          <line x1="8" y1="63" x2="20" y2="63" stroke={c} strokeWidth="0.8" opacity=".35" />
          <line x1="8" y1="66" x2="16" y2="66" stroke={c} strokeWidth="0.8" opacity=".35" />
          <path d="M 32,72 L 48,68 L 64,72 L 80,68 L 96,72"
            fill="none" stroke={a} strokeWidth="2.5" opacity=".35" />
          <circle cx="38" cy="60" r="2" fill={a} opacity=".4" />
          <circle cx="52" cy="58" r="2" fill={a} opacity=".4" />
          <line x1="38" y1="60" x2="52" y2="58" stroke={a} strokeWidth="0.8" opacity=".3" strokeDasharray="2 2" />
        </>
      );

    default:
      return (
        <>
          <rect x="18" y="12" width="74" height="56" rx="6" fill={c} opacity=".1" stroke={c} strokeWidth="2" />
          <path d="M 74,12 L 92,28 L 92,68 L 18,68 L 18,12 Z" fill="none" stroke={c} strokeWidth="2" />
          <path d="M 74,12 L 74,28 L 92,28" fill="none" stroke={c} strokeWidth="1.5" opacity=".4" />
          <line x1="28" y1="36" x2="80" y2="36" stroke={c} strokeWidth="1.5" opacity=".4" />
          <line x1="28" y1="44" x2="76" y2="44" stroke={a} strokeWidth="1.5" opacity=".4" />
          <line x1="28" y1="52" x2="68" y2="52" stroke={c} strokeWidth="1.5" opacity=".4" />
          <line x1="28" y1="28" x2="65" y2="28" stroke={a} strokeWidth="1.5" opacity=".35" />
        </>
      );
  }
});

/* ── Paper card ──────────────────────────────────────────────── */

interface SubjectCardProps {
  subject: Subject;
  style: React.CSSProperties;
  rotation: number;
  isDark: boolean;
  reduceMotion: boolean;
  entering?: boolean;
  enterDelay?: number;
}

const SubjectCard = React.memo(function SubjectCard({
  subject,
  style,
  rotation,
  isDark,
  reduceMotion,
  entering = false,
  enterDelay = 0,
}: SubjectCardProps) {
  return (
    <div
      className="group absolute select-none pointer-events-auto"
      style={{
        ...style,
        width: CARD_LAYOUT_W,
        height: CARD_LAYOUT_H,
        overflow: "visible",
      }}
    >
      <div
        className={`relative flex items-center justify-center${entering ? " hero-card-paste" : ""}`}
        style={{
          width: CARD_LAYOUT_W,
          height: CARD_LAYOUT_H,
          ...(entering ? { animationDelay: `${enterDelay}ms` } : {}),
        }}
      >
        <div
          className="relative"
          style={{
            width: CARD_W,
            height: CARD_H,
            transform: `rotate(${rotation}deg)`,
            transformOrigin: "center center",
          }}
        >
        {/* Back paper (stacked effect) */}
        <div
          className={`absolute rounded-[3px] ${isDark ? "bg-[#0A0C0F]" : "bg-[#F1F5F9]"}`}
          style={{
            inset: 0,
            transform: `rotate(${rotation > 0 ? 3 : -3}deg)`,
            transformOrigin: "center center",
          }}
        />

        {/* Main paper — no overflow-hidden so rotated outline strokes stay visible */}
        <div
          className={`
            relative h-full rounded-lg
            ${reduceMotion ? "" : "transition-all duration-300"}
            ${isDark ? "bg-[#0A0C0F]" : `bg-[#F1F5F9] ${reduceMotion ? "" : "hover:shadow-lg"}`}
          `}
        >
          <div
            className="relative h-full"
            style={{
              clipPath: `polygon(0 0, calc(100% - ${FOLD}px) 0, 100% ${FOLD}px, 100% 100%, 0 100%)`,
            }}
          >
            <div className="px-3.5 pt-4 pb-2 h-full flex flex-col">
              <p
                className="
                  font-[var(--font-primary)] font-semibold text-[13px] leading-tight
                  text-[#1e293b] dark:text-[#e2e8f0]
                "
              >
                {subject.name}
              </p>

              <div className="mt-3 flex-1 flex items-start justify-center">
                <svg
                  viewBox="0 0 110 80"
                  className="w-full h-auto"
                  aria-hidden="true"
                >
                  <g strokeLinecap="round" strokeLinejoin="round">
                    <SketchSVG {...subject} />
                  </g>
                </svg>
              </div>
            </div>
          </div>

          {/* Fold triangle */}
          <div
            className="
              absolute top-0 right-0 pointer-events-none
              bg-[linear-gradient(225deg,transparent_50%,#E2E8F0_50%)]
              dark:bg-[linear-gradient(225deg,transparent_50%,#141619_50%)]
            "
            style={{ width: FOLD, height: FOLD }}
          />

        </div>

        {/* Outline outside clipped inner content so tilt never crops the border */}
        <svg
          className="absolute inset-0 z-20 pointer-events-none"
          width={CARD_W}
          height={CARD_H}
          viewBox={`0 0 ${CARD_W} ${CARD_H}`}
          fill="none"
          aria-hidden="true"
        >
          <path
            d={getCardOutlinePath()}
            strokeWidth={1}
            strokeLinejoin="round"
            vectorEffect="non-scaling-stroke"
            className={`
              transition-colors duration-300
              ${
                isDark
                  ? "stroke-white/[0.06] group-hover:stroke-white/[0.12]"
                  : "stroke-[#0F172A]/[0.06] group-hover:stroke-[#0F172A]/[0.12]"
              }
            `}
          />
        </svg>
        </div>
      </div>
    </div>
  );
});

/* ── Main grid ───────────────────────────────────────────────── */

type CardInstance = {
  key: string;
  subjectIndex: number;
  x: number;
  y: number;
};

/** Tile copy range for infinite drag — one cell buffer beyond the visible viewport. */
function getHeroInstanceWindow(
  offsetX: number,
  offsetY: number,
  bounds: { minX: number; maxX: number; minY: number; maxY: number },
  tileW: number,
  tileH: number,
  viewW: number,
  viewH: number,
) {
  const marginX = viewW / 2 + CARD_ROTATED_RADIUS + HERO_MIN_X;
  const marginY = viewH / 2 + CARD_ROTATED_RADIUS + HERO_MIN_Y;
  const TILE_PAD = 1;

  return {
    colMin:
      Math.floor((-marginX - offsetX - bounds.maxX) / tileW) - TILE_PAD,
    colMax:
      Math.ceil((marginX - offsetX - bounds.minX) / tileW) + TILE_PAD,
    rowMin:
      Math.floor((-marginY - offsetY - bounds.maxY) / tileH) - TILE_PAD,
    rowMax:
      Math.ceil((marginY - offsetY - bounds.minY) / tileH) + TILE_PAD,
  };
}

function buildCardInstances(
  subjectOrder: number[],
  heroBasePositions: Record<number, { x: number; y: number }>,
  bounds: { minX: number; maxX: number; minY: number; maxY: number },
  offsetX: number,
  offsetY: number,
  tileW: number,
  tileH: number,
  viewW: number,
  viewH: number,
): CardInstance[] {
  const { colMin, colMax, rowMin, rowMax } = getHeroInstanceWindow(
    offsetX,
    offsetY,
    bounds,
    tileW,
    tileH,
    viewW,
    viewH,
  );

  const instances: CardInstance[] = [];

  for (const subjectIndex of subjectOrder) {
    const base = heroBasePositions[subjectIndex];
    const subject = SUBJECTS[subjectIndex];

    for (let col = colMin; col <= colMax; col++) {
      for (let row = rowMin; row <= rowMax; row++) {
        instances.push({
          key: `${subject.name}-${col}-${row}`,
          subjectIndex,
          x: base.x + col * tileW,
          y: base.y + row * tileH,
        });
      }
    }
  }

  return instances;
}

function tileOffsetForInstance(
  instance: CardInstance,
  heroBasePositions: Record<number, { x: number; y: number }>,
  tileW: number,
  tileH: number,
) {
  const base = heroBasePositions[instance.subjectIndex];
  return {
    col: Math.round((instance.x - base.x) / tileW),
    row: Math.round((instance.y - base.y) / tileH),
  };
}

type DraggableGridProps = {
  /** When false, only the dotted grid is shown (hero entry sequence). */
  showCards?: boolean;
  /** Staggered paste-in animation when cards first mount. */
  cardsEntering?: boolean;
};

export default function DraggableGrid({
  showCards = true,
  cardsEntering = false,
}: DraggableGridProps) {
  const [subjectOrder] = useState<number[]>(HERO_INITIAL_LAYOUT.subjectOrder);
  const heroBasePositions = HERO_INITIAL_LAYOUT.positions;
  const heroTileW = HERO_INITIAL_LAYOUT.tileW;
  const heroTileH = HERO_INITIAL_LAYOUT.tileH;
  const heroBounds = HERO_INITIAL_LAYOUT.bounds;
  const [viewport, setViewport] = useState({ w: 1600, h: 900 });
  const [isDraggingUi, setIsDraggingUi] = useState(false);
  const isDark = useIsDark();

  const cardsLayerRef = useRef<HTMLDivElement>(null);
  const dotPatternRef = useRef<SVGPatternElement>(null);
  const offsetRef = useRef(HERO_INITIAL_LAYOUT.offset);
  const instanceWindowRef = useRef(
    getHeroInstanceWindow(
      0,
      0,
      heroBounds,
      heroTileW,
      heroTileH,
      1600,
      900,
    ),
  );
  const hasDraggedRef = useRef(false);
  const [instanceRevision, setInstanceRevision] = useState(0);

  useEffect(() => {
    const update = () =>
      setViewport({ w: window.innerWidth, h: window.innerHeight });
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  useEffect(() => {
    const o = offsetRef.current;
    instanceWindowRef.current = getHeroInstanceWindow(
      o.x,
      o.y,
      heroBounds,
      heroTileW,
      heroTileH,
      viewport.w,
      viewport.h,
    );
    setInstanceRevision((n) => n + 1);
  }, [heroBounds, heroTileW, heroTileH, viewport.w, viewport.h]);

  const applyVisualOffset = useCallback((o: { x: number; y: number }) => {
    const layer = cardsLayerRef.current;
    if (layer) {
      layer.style.transform = `translate3d(${o.x}px, ${o.y}px, 0)`;
    }
    const pattern = dotPatternRef.current;
    if (pattern) {
      pattern.setAttribute(
        "x",
        String(((o.x % DOT_SPACING) + DOT_SPACING) % DOT_SPACING),
      );
      pattern.setAttribute(
        "y",
        String(((o.y % DOT_SPACING) + DOT_SPACING) % DOT_SPACING),
      );
    }
  }, []);

  useEffect(() => {
    applyVisualOffset(HERO_INITIAL_LAYOUT.offset);
  }, [applyVisualOffset]);

  const syncCardInstances = useCallback(
    (o: { x: number; y: number }) => {
      const next = getHeroInstanceWindow(
        o.x,
        o.y,
        heroBounds,
        heroTileW,
        heroTileH,
        viewport.w,
        viewport.h,
      );
      const prev = instanceWindowRef.current;
      if (
        next.colMin !== prev.colMin ||
        next.colMax !== prev.colMax ||
        next.rowMin !== prev.rowMin ||
        next.rowMax !== prev.rowMax
      ) {
        instanceWindowRef.current = next;
        setInstanceRevision((n) => n + 1);
      }
    },
    [heroBounds, heroTileW, heroTileH, viewport.w, viewport.h],
  );

  const handleOffsetChange = useCallback(
    (newOffset: { x: number; y: number }) => {
      offsetRef.current = newOffset;
      applyVisualOffset(newOffset);
      syncCardInstances(newOffset);
    },
    [applyVisualOffset, syncCardInstances],
  );

  const { isDragging, handlers } = useDrag({ onOffsetChange: handleOffsetChange });

  const cardInstances = useMemo(
    () =>
      buildCardInstances(
        subjectOrder,
        heroBasePositions,
        heroBounds,
        offsetRef.current.x,
        offsetRef.current.y,
        heroTileW,
        heroTileH,
        viewport.w,
        viewport.h,
      ),
    [
      instanceRevision,
      subjectOrder,
      heroBasePositions,
      heroBounds,
      heroTileW,
      heroTileH,
      viewport.w,
      viewport.h,
    ],
  );

  const onPointerDown = useCallback(
    (e: React.PointerEvent) => {
      hasDraggedRef.current = true;
      setIsDraggingUi(true);
      handlers.onPointerDown(e);
    },
    [handlers],
  );

  const onPointerUp = useCallback(() => {
    handlers.onPointerUp();
    setIsDraggingUi(false);
  }, [handlers]);

  return (
    <div
      className="absolute touch-none"
      style={{
        cursor: isDragging.current ? "grabbing" : "grab",
        inset: HERO_GRID_INSET,
      }}
      onPointerDown={onPointerDown}
      onPointerMove={handlers.onPointerMove}
      onPointerUp={onPointerUp}
      onPointerLeave={onPointerUp}
    >
      {/* Dot grid — clipped; cards layer stays overflow-visible */}
      <svg
        className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none"
        aria-hidden="true"
      >
        <defs>
          <pattern
            ref={dotPatternRef}
            id="dot-grid"
            x={0}
            y={0}
            width={DOT_SPACING}
            height={DOT_SPACING}
            patternUnits="userSpaceOnUse"
          >
            <circle
              cx={DOT_RADIUS}
              cy={DOT_RADIUS}
              r={DOT_RADIUS}
              className="fill-[#CBD5E1] dark:fill-[#1A1D24]"
            />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#dot-grid)" />
      </svg>

      {/* Cards — GPU layer pans smoothly; tile copies refresh at tile boundaries */}
      <div
        ref={cardsLayerRef}
        className="absolute inset-0 overflow-visible"
        style={{ willChange: "transform" }}
      >
        {showCards &&
          cardInstances.map((instance) => {
            const subject = SUBJECTS[instance.subjectIndex];
            const { col, row } = tileOffsetForInstance(
              instance,
              heroBasePositions,
              heroTileW,
              heroTileH,
            );
            const isCenterTile = col === 0 && row === 0;
            const shouldEnter =
              cardsEntering && isCenterTile && !hasDraggedRef.current;
            const enterDelay = shouldEnter
              ? (instance.subjectIndex * 37 + Math.abs(col * 11 + row * 17)) % 120
              : 0;

            return (
              <SubjectCard
                key={instance.key}
                subject={subject}
                isDark={isDark}
                reduceMotion={isDraggingUi}
                entering={shouldEnter}
                enterDelay={enterDelay}
                rotation={ROTATIONS[instance.subjectIndex]}
                style={{
                  left: "50%",
                  top: "50%",
                  transform: `translate3d(${instance.x - CARD_LAYOUT_W / 2}px, ${instance.y - CARD_LAYOUT_H / 2}px, 0)`,
                }}
              />
            );
          })}
      </div>
    </div>
  );
}
