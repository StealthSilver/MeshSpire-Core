"use client";

import React, { useState, useMemo, useCallback } from "react";
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
const REPEAT_W = 4200;
const REPEAT_H = 3200;
const DOT_SPACING = 28;
const DOT_RADIUS = 1;
const PAD_X = 40;
const PAD_Y = 40;
const SLOT_W = CARD_W + PAD_X;
const SLOT_H = CARD_H + PAD_Y;

const ROTATIONS = SUBJECTS.map((_, i) => Math.round(Math.sin(i * 2.7) * 7));

function seededRng(seed: number) {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return s / 2147483647;
  };
}

function rectsOverlap(
  a: { x: number; y: number },
  b: { x: number; y: number },
) {
  return (
    Math.abs(a.x - b.x) < SLOT_W &&
    Math.abs(a.y - b.y) < SLOT_H
  );
}

function seededPositions(): { x: number; y: number }[] {
  const rng = seededRng(42);
  const positions: { x: number; y: number }[] = [];

  for (let i = 0; i < SUBJECTS.length; i++) {
    let placed = false;
    for (let attempt = 0; attempt < 500; attempt++) {
      const x = rng() * REPEAT_W;
      const y = rng() * REPEAT_H;

      let overlapping = false;
      for (const prev of positions) {
        if (rectsOverlap({ x, y }, prev)) {
          overlapping = true;
          break;
        }
      }
      if (!overlapping) {
        positions.push({ x, y });
        placed = true;
        break;
      }
    }
    if (!placed) {
      positions.push({ x: rng() * REPEAT_W, y: rng() * REPEAT_H });
    }
  }
  return positions;
}

const BASE_POSITIONS = seededPositions();

/* ── Sketch illustrations ───────────────────────────────────── */

function SketchSVG({ name, color, accent }: Subject) {
  const c = color;
  const a = accent;

  switch (name) {

    case "Mathematics":
      return (
        <>
          <text x="4" y="68" fontSize="62" fontFamily="serif" fill={c} opacity=".06" fontWeight="bold">Σ</text>
          <polygon points="18,74 58,8 98,74" fill="none" stroke={c} strokeWidth="2" />
          {[14,20,26,32,38,44,50,56,62].map((y, i) => {
            const leftX = 18 + (i * (40/9));
            const rightX = 98 - (i * (40/9));
            return <line key={i} x1={leftX} y1={y + 8} x2={rightX} y2={y + 8} stroke={c} strokeWidth="0.8" opacity=".3" />;
          })}
          <path d="M 26,74 A 12,12 0 0,1 18,64" fill="none" stroke={a} strokeWidth="1.8" />
          <text x="22" y="64" fontSize="7" fill={a} fontFamily="serif">α</text>
          <path d="M 5,78 Q 15,70 25,78 Q 35,86 45,78 Q 55,70 65,78 Q 75,86 85,78 Q 95,70 105,78"
            fill="none" stroke={a} strokeWidth="1.4" opacity=".7" />
          <text x="78" y="22" fontSize="18" fontFamily="serif" fill={a} fontWeight="bold" opacity=".85">π</text>
          <path d="M 68,44 Q 72,38 78,40 Q 84,42 84,47 Q 84,52 78,54 Q 72,56 68,50 Q 64,44 58,42 Q 52,40 52,45 Q 52,50 58,52 Q 64,54 68,50"
            fill="none" stroke={c} strokeWidth="1.5" opacity=".6" />
          <text x="5" y="18" fontSize="9" fontFamily="serif" fill={c} opacity=".55">dy/dx</text>
          <line x1="90" y1="55" x2="104" y2="72" stroke={c} strokeWidth="1.5" opacity=".5" />
          <line x1="86" y1="52" x2="104" y2="72" stroke={c} strokeWidth="1.5" opacity=".5" />
          <circle cx="104" cy="72" r="2" fill={c} opacity=".4" />
        </>
      );

    case "Physics":
      return (
        <>
          <circle cx="55" cy="40" r="6" fill={c} opacity=".25" stroke={c} strokeWidth="2" />
          <circle cx="53" cy="38" r="1.5" fill={a} />
          <circle cx="57" cy="42" r="1.5" fill={c} />
          <ellipse cx="55" cy="40" rx="38" ry="13" fill="none" stroke={c} strokeWidth="1.6" opacity=".75" />
          <ellipse cx="55" cy="40" rx="38" ry="13" fill="none" stroke={a} strokeWidth="1.6" opacity=".7" transform="rotate(60,55,40)" />
          <ellipse cx="55" cy="40" rx="38" ry="13" fill="none" stroke={c} strokeWidth="1.6" opacity=".55" transform="rotate(120,55,40)" />
          <circle cx="93" cy="40" r="3" fill={a} />
          <circle cx="36" cy="20" r="3" fill={a} />
          <circle cx="36" cy="60" r="3" fill={c} />
          <path d="M 5,8 Q 12,2 19,8 Q 26,14 33,8 Q 40,2 47,8 Q 54,14 61,8 Q 68,2 75,8"
            fill="none" stroke={a} strokeWidth="1.4" opacity=".55" />
          <line x1="75" y1="8" x2="82" y2="8" stroke={a} strokeWidth="1.4" opacity=".55" markerEnd="url(#arrow)" />
          <text x="78" y="12" fontSize="7.5" fontFamily="serif" fill={a} opacity=".65" fontStyle="italic">c</text>
          <line x1="8" y1="5" x2="8" y2="30" stroke={c} strokeWidth="1.4" opacity=".5" />
          <circle cx="8" cy="33" r="4" fill="none" stroke={c} strokeWidth="1.4" opacity=".5" />
          <path d="M 4,5 Q 8,18 14,28" fill="none" stroke={c} strokeWidth="1" opacity=".3" strokeDasharray="2 2" />
          <text x="4" y="74" fontSize="8" fontFamily="serif" fill={c} opacity=".5" fontStyle="italic">F=ma</text>
          <path d="M 88,58 Q 90,54 92,58 Q 94,62 96,58 Q 98,54 100,58 Q 102,62 104,58"
            fill="none" stroke={a} strokeWidth="1.5" opacity=".5" />
          <line x1="86" y1="58" x2="88" y2="58" stroke={a} strokeWidth="1.5" opacity=".5" />
          <line x1="104" y1="58" x2="107" y2="58" stroke={a} strokeWidth="1.5" opacity=".5" />
          <circle cx="107" cy="62" r="3" fill={a} opacity=".3" stroke={a} strokeWidth="1" />
        </>
      );

    case "Chemistry":
      return (
        <>
          <path d="M 42,6 L 42,30 L 16,68 Q 13,76 22,76 L 88,76 Q 97,76 94,68 L 68,30 L 68,6"
            fill="none" stroke={c} strokeWidth="2" />
          <line x1="36" y1="6" x2="74" y2="6" stroke={c} strokeWidth="2.2" />
          <line x1="39" y1="10" x2="71" y2="10" stroke={c} strokeWidth="1" opacity=".4" />
          <path d="M 24,56 Q 30,48 38,52 Q 48,46 55,50 Q 65,44 72,50 Q 80,54 86,56 L 94,68 Q 97,76 88,76 L 22,76 Q 13,76 16,68 Z"
            fill={a} opacity=".14" />
          <path d="M 24,56 Q 30,48 38,52 Q 48,46 55,50 Q 65,44 72,50 Q 80,54 86,56"
            fill="none" stroke={a} strokeWidth="1.6" />
          <circle cx="35" cy="64" r="3.5" fill="none" stroke={c} strokeWidth="1.2" opacity=".5" />
          <circle cx="50" cy="60" r="2.5" fill="none" stroke={c} strokeWidth="1.2" opacity=".5" />
          <circle cx="65" cy="65" r="3" fill="none" stroke={c} strokeWidth="1.2" opacity=".5" />
          <circle cx="75" cy="60" r="2" fill="none" stroke={c} strokeWidth="1.2" opacity=".5" />
          <path d="M 47,2 Q 44,-2 47,-6 Q 50,-10 47,-14" fill="none" stroke={c} strokeWidth="1.3" opacity=".4" />
          <path d="M 55,0 Q 52,-4 55,-8 Q 58,-12 55,-16" fill="none" stroke={c} strokeWidth="1.3" opacity=".4" />
          <path d="M 63,2 Q 60,-2 63,-6 Q 66,-10 63,-14" fill="none" stroke={c} strokeWidth="1.3" opacity=".4" />
          <circle cx="96" cy="20" r="5" fill="none" stroke={a} strokeWidth="1.5" opacity=".7" />
          <circle cx="106" cy="14" r="3.5" fill="none" stroke={a} strokeWidth="1.2" opacity=".6" />
          <circle cx="108" cy="26" r="3.5" fill="none" stroke={a} strokeWidth="1.2" opacity=".6" />
          <line x1="101" y1="17" x2="103" y2="15" stroke={a} strokeWidth="1.2" opacity=".6" />
          <line x1="101" y1="23" x2="104" y2="24" stroke={a} strokeWidth="1.2" opacity=".6" />
          <rect x="4" y="4" width="14" height="14" rx="1" fill="none" stroke={c} strokeWidth="1" opacity=".45" />
          <text x="7" y="15" fontSize="9" fontFamily="monospace" fill={c} opacity=".55" fontWeight="bold">H</text>
          <text x="5" y="8" fontSize="5" fontFamily="monospace" fill={c} opacity=".45">1</text>
        </>
      );

    case "Biology":
      return (
        <>
          <path d="M 28,4 Q 38,14 28,24 Q 18,34 28,44 Q 38,54 28,64 Q 18,74 28,84"
            fill="none" stroke={c} strokeWidth="2" />
          <path d="M 48,4 Q 38,14 48,24 Q 58,34 48,44 Q 38,54 48,64 Q 58,74 48,84"
            fill="none" stroke={a} strokeWidth="2" />
          <line x1="28" y1="14" x2="48" y2="14" stroke={c} strokeWidth="1.5" opacity=".55" />
          <line x1="26" y1="24" x2="46" y2="24" stroke={a} strokeWidth="1.5" opacity=".55" />
          <line x1="28" y1="34" x2="48" y2="34" stroke={c} strokeWidth="1.5" opacity=".55" />
          <line x1="26" y1="44" x2="46" y2="44" stroke={a} strokeWidth="1.5" opacity=".55" />
          <line x1="28" y1="54" x2="48" y2="54" stroke={c} strokeWidth="1.5" opacity=".55" />
          <line x1="26" y1="64" x2="46" y2="64" stroke={a} strokeWidth="1.5" opacity=".55" />
          <line x1="28" y1="74" x2="48" y2="74" stroke={c} strokeWidth="1.5" opacity=".55" />
          <ellipse cx="80" cy="40" rx="26" ry="32" fill="none" stroke={c} strokeWidth="2" />
          <ellipse cx="80" cy="40" rx="22" ry="28" fill="none" stroke={c} strokeWidth="0.8" opacity=".3" strokeDasharray="3 2" />
          <ellipse cx="78" cy="38" rx="10" ry="8" fill={c} opacity=".12" stroke={c} strokeWidth="1.5" />
          <circle cx="78" cy="37" r="3" fill={a} opacity=".3" />
          <ellipse cx="94" cy="52" rx="6" ry="3" fill="none" stroke={a} strokeWidth="1.2" opacity=".6" transform="rotate(-30,94,52)" />
          <path d="M 91,49 Q 93,52 91,55" fill="none" stroke={a} strokeWidth="1" opacity=".5" />
          <circle cx="68" cy="52" r="5" fill="none" stroke={c} strokeWidth="1.2" opacity=".45" />
          <circle cx="90" cy="34" r="1.5" fill={a} opacity=".5" />
          <circle cx="86" cy="28" r="1.5" fill={a} opacity=".5" />
          <circle cx="72" cy="26" r="1.5" fill={a} opacity=".5" />
          <circle cx="66" cy="44" r="1.5" fill={c} opacity=".5" />
          <ellipse cx="86" cy="46" rx="4" ry="2.5" fill={a} opacity=".15" stroke={a} strokeWidth="1" />
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
}

/* ── Paper card ──────────────────────────────────────────────── */

interface SubjectCardProps {
  subject: Subject;
  style: React.CSSProperties;
  rotation: number;
}

const SubjectCard = React.memo(function SubjectCard({
  subject,
  style,
  rotation,
}: SubjectCardProps) {
  return (
    <div
      className="absolute select-none pointer-events-none"
      style={style}
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
          className="absolute rounded-[3px] bg-[#ededed] dark:bg-[#14171c]"
          style={{
            inset: 0,
            transform: `rotate(${rotation > 0 ? 3 : -3}deg)`,
            transformOrigin: "center center",
          }}
        />

        {/* Main paper */}
        <div
          className="
            relative h-full
            bg-white dark:bg-[#181C22]
          "
          style={{
            clipPath: `polygon(0 0, calc(100% - ${FOLD}px) 0, 100% ${FOLD}px, 100% 100%, 0 100%)`,
            boxShadow: "0 2px 10px rgba(0,0,0,0.07), 0 1px 3px rgba(0,0,0,0.04)",
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
            absolute top-0 right-0
            bg-[linear-gradient(225deg,transparent_50%,#ddd_50%)]
            dark:bg-[linear-gradient(225deg,transparent_50%,#252A33_50%)]
          "
          style={{ width: FOLD, height: FOLD }}
        />
      </div>
    </div>
  );
});

/* ── Main grid ───────────────────────────────────────────────── */

export default function DraggableGrid() {
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  const handleOffsetChange = useCallback(
    (newOffset: { x: number; y: number }) => setOffset(newOffset),
    [],
  );

  const { isDragging, handlers } = useDrag({ onOffsetChange: handleOffsetChange });

  const patternOffsetX = ((offset.x % DOT_SPACING) + DOT_SPACING) % DOT_SPACING;
  const patternOffsetY = ((offset.y % DOT_SPACING) + DOT_SPACING) % DOT_SPACING;

  const cardPositions = useMemo(
    () =>
      BASE_POSITIONS.map((base) => ({
        x: ((base.x + offset.x) % REPEAT_W + REPEAT_W) % REPEAT_W - REPEAT_W / 2,
        y: ((base.y + offset.y) % REPEAT_H + REPEAT_H) % REPEAT_H - REPEAT_H / 2,
      })),
    [offset.x, offset.y],
  );

  return (
    <div
      className="absolute inset-0 overflow-hidden touch-none"
      style={{ cursor: isDragging.current ? "grabbing" : "grab" }}
      onPointerDown={handlers.onPointerDown}
      onPointerMove={handlers.onPointerMove}
      onPointerUp={handlers.onPointerUp}
      onPointerLeave={handlers.onPointerLeave}
    >
      {/* Dot grid */}
      <svg className="absolute inset-0 w-full h-full" aria-hidden="true">
        <defs>
          <pattern
            id="dot-grid"
            x={patternOffsetX}
            y={patternOffsetY}
            width={DOT_SPACING}
            height={DOT_SPACING}
            patternUnits="userSpaceOnUse"
          >
            <circle
              cx={DOT_RADIUS}
              cy={DOT_RADIUS}
              r={DOT_RADIUS}
              className="fill-[#CBD5E1] dark:fill-[#252A33]"
            />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#dot-grid)" />
      </svg>

      {/* Cards */}
      <div className="absolute inset-0" style={{ willChange: "transform" }}>
        {SUBJECTS.map((subject, i) => {
          const pos = cardPositions[i];
          return (
            <SubjectCard
              key={subject.name}
              subject={subject}
              rotation={ROTATIONS[i]}
              style={{
                left: "50%",
                top: "50%",
                transform: `translate3d(${pos.x - CARD_W / 2}px, ${pos.y - CARD_H / 2}px, 0)`,
              }}
            />
          );
        })}
      </div>
    </div>
  );
}
