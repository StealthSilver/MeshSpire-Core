"use client";

import React, { useState } from "react";
import { useDraggableCard } from "@/hooks/useDraggableCard";
import { Testimonial } from "@/data/testimonials";

const O = "#FFA629";
const O2 = "#FFB84D";
const O3 = "#CC8520";
const B = "#809FFF";
const B2 = "#A3B8FF";
const B3 = "#5C7FE6";

const CircleArt = ({ id }: { id: number }) => {
  const idx = ((id - 1) % 10);
  const size = 120;
  const c = size / 2;

  const patterns: Record<number, React.ReactNode> = {
    0: (
      <>
        <circle cx={c} cy={c} r={50} fill="none" stroke={O} strokeWidth="2" opacity="0.6" />
        <circle cx={c} cy={c} r={36} fill="none" stroke={B} strokeWidth="1.5" opacity="0.5" />
        <circle cx={c} cy={c} r={22} fill="none" stroke={O2} strokeWidth="1.5" opacity="0.7" />
        <circle cx={c} cy={c} r={10} fill={B} opacity="0.35" />
        {[0, 60, 120, 180, 240, 300].map((a) => (
          <circle key={a} cx={c + 42 * Math.cos((a * Math.PI) / 180)} cy={c + 42 * Math.sin((a * Math.PI) / 180)} r={4} fill={O} opacity="0.5" />
        ))}
      </>
    ),
    1: (
      <>
        <circle cx={c} cy={c} r={50} fill="none" stroke={B} strokeWidth="2" opacity="0.5" />
        {[0, 45, 90, 135, 180, 225, 270, 315].map((a) => (
          <line key={a} x1={c} y1={c} x2={c + 48 * Math.cos((a * Math.PI) / 180)} y2={c + 48 * Math.sin((a * Math.PI) / 180)} stroke={a % 90 === 0 ? O : B2} strokeWidth="1" opacity="0.4" />
        ))}
        <circle cx={c} cy={c} r={18} fill={O} opacity="0.2" />
        <circle cx={c} cy={c} r={8} fill={B} opacity="0.4" />
        {[0, 90, 180, 270].map((a) => (
          <circle key={`o-${a}`} cx={c + 32 * Math.cos((a * Math.PI) / 180)} cy={c + 32 * Math.sin((a * Math.PI) / 180)} r={6} fill="none" stroke={O2} strokeWidth="1.2" opacity="0.5" />
        ))}
      </>
    ),
    2: (
      <>
        {[50, 40, 30, 20].map((r, i) => (
          <circle key={r} cx={c} cy={c} r={r} fill="none" stroke={i % 2 === 0 ? B3 : O} strokeWidth="1" opacity={0.3 + i * 0.1} strokeDasharray={i % 2 === 0 ? "4,4" : "none"} />
        ))}
        <circle cx={c} cy={c} r={10} fill={O} opacity="0.3" />
        {[30, 150, 270].map((a) => (
          <circle key={a} cx={c + 44 * Math.cos((a * Math.PI) / 180)} cy={c + 44 * Math.sin((a * Math.PI) / 180)} r={7} fill={B} opacity="0.25" />
        ))}
        {[90, 210, 330].map((a) => (
          <circle key={`s-${a}`} cx={c + 35 * Math.cos((a * Math.PI) / 180)} cy={c + 35 * Math.sin((a * Math.PI) / 180)} r={3} fill={O2} opacity="0.5" />
        ))}
      </>
    ),
    3: (
      <>
        <circle cx={c} cy={c} r={50} fill="none" stroke={O3} strokeWidth="1.5" opacity="0.4" />
        {[0, 1, 2, 3, 4, 5].map((i) => {
          const a1 = (i * 60 * Math.PI) / 180;
          const a2 = ((i + 1) * 60 * Math.PI) / 180;
          return (
            <path key={i} d={`M ${c} ${c} L ${c + 46 * Math.cos(a1)} ${c + 46 * Math.sin(a1)} A 46 46 0 0 1 ${c + 46 * Math.cos(a2)} ${c + 46 * Math.sin(a2)} Z`} fill={i % 2 === 0 ? O : B} opacity="0.12" />
          );
        })}
        <circle cx={c} cy={c} r={20} fill="none" stroke={B2} strokeWidth="1.5" opacity="0.5" />
        <circle cx={c} cy={c} r={7} fill={O} opacity="0.4" />
      </>
    ),
    4: (
      <>
        <circle cx={c} cy={c} r={50} fill="none" stroke={B} strokeWidth="1.5" opacity="0.35" />
        {[0, 72, 144, 216, 288].map((a) => {
          const x = c + 36 * Math.cos((a * Math.PI) / 180);
          const y = c + 36 * Math.sin((a * Math.PI) / 180);
          return <circle key={a} cx={x} cy={y} r={14} fill="none" stroke={O} strokeWidth="1.2" opacity="0.4" />;
        })}
        {[36, 108, 180, 252, 324].map((a) => {
          const x = c + 22 * Math.cos((a * Math.PI) / 180);
          const y = c + 22 * Math.sin((a * Math.PI) / 180);
          return <circle key={a} cx={x} cy={y} r={4} fill={B2} opacity="0.4" />;
        })}
        <circle cx={c} cy={c} r={6} fill={O} opacity="0.35" />
      </>
    ),
    5: (
      <>
        <circle cx={c} cy={c} r={50} fill="none" stroke={O} strokeWidth="1" opacity="0.3" strokeDasharray="6,3" />
        <circle cx={c} cy={c} r={38} fill="none" stroke={B} strokeWidth="1" opacity="0.3" strokeDasharray="3,6" />
        {Array.from({ length: 12 }, (_, i) => {
          const a = (i * 30 * Math.PI) / 180;
          const r = i % 2 === 0 ? 44 : 32;
          return <circle key={i} cx={c + r * Math.cos(a)} cy={c + r * Math.sin(a)} r={i % 3 === 0 ? 5 : 3} fill={i % 2 === 0 ? O2 : B3} opacity="0.35" />;
        })}
        <circle cx={c} cy={c} r={14} fill={B} opacity="0.15" />
        <circle cx={c} cy={c} r={6} fill={O} opacity="0.4" />
      </>
    ),
    6: (
      <>
        <circle cx={c} cy={c} r={50} fill="none" stroke={B3} strokeWidth="2" opacity="0.4" />
        <ellipse cx={c} cy={c} rx={48} ry={24} fill="none" stroke={O} strokeWidth="1" opacity="0.3" />
        <ellipse cx={c} cy={c} rx={24} ry={48} fill="none" stroke={O} strokeWidth="1" opacity="0.3" />
        <ellipse cx={c} cy={c} rx={48} ry={24} fill="none" stroke={B2} strokeWidth="1" opacity="0.25" transform={`rotate(45 ${c} ${c})`} />
        <ellipse cx={c} cy={c} rx={48} ry={24} fill="none" stroke={B2} strokeWidth="1" opacity="0.25" transform={`rotate(-45 ${c} ${c})`} />
        <circle cx={c} cy={c} r={8} fill={O} opacity="0.35" />
      </>
    ),
    7: (
      <>
        <circle cx={c} cy={c} r={50} fill="none" stroke={O2} strokeWidth="1.5" opacity="0.35" />
        {[0, 120, 240].map((a) => {
          const x = c + 28 * Math.cos((a * Math.PI) / 180);
          const y = c + 28 * Math.sin((a * Math.PI) / 180);
          return <circle key={a} cx={x} cy={y} r={18} fill={B} opacity="0.12" stroke={B} strokeWidth="1" />;
        })}
        {[60, 180, 300].map((a) => {
          const x = c + 28 * Math.cos((a * Math.PI) / 180);
          const y = c + 28 * Math.sin((a * Math.PI) / 180);
          return <circle key={a} cx={x} cy={y} r={10} fill={O} opacity="0.15" stroke={O} strokeWidth="0.8" />;
        })}
        <circle cx={c} cy={c} r={10} fill="none" stroke={B3} strokeWidth="1.5" opacity="0.5" />
      </>
    ),
    8: (
      <>
        <circle cx={c} cy={c} r={50} fill="none" stroke={B} strokeWidth="1.5" opacity="0.3" />
        {Array.from({ length: 6 }, (_, i) => {
          const a = (i * 60 * Math.PI) / 180;
          return (
            <g key={i}>
              <circle cx={c + 38 * Math.cos(a)} cy={c + 38 * Math.sin(a)} r={10} fill="none" stroke={O} strokeWidth="1" opacity="0.4" />
              <circle cx={c + 38 * Math.cos(a)} cy={c + 38 * Math.sin(a)} r={4} fill={O2} opacity="0.35" />
              <line x1={c + 20 * Math.cos(a)} y1={c + 20 * Math.sin(a)} x2={c + 28 * Math.cos(a)} y2={c + 28 * Math.sin(a)} stroke={B2} strokeWidth="1" opacity="0.35" />
            </g>
          );
        })}
        <circle cx={c} cy={c} r={16} fill={B} opacity="0.12" />
        <circle cx={c} cy={c} r={5} fill={O} opacity="0.45" />
      </>
    ),
    9: (
      <>
        <circle cx={c} cy={c} r={50} fill="none" stroke={O} strokeWidth="1.5" opacity="0.35" />
        {[0, 40, 80, 120, 160, 200, 240, 280, 320].map((a) => {
          const inner = c + 20 * Math.cos((a * Math.PI) / 180);
          const innerY = c + 20 * Math.sin((a * Math.PI) / 180);
          const outer = c + 46 * Math.cos((a * Math.PI) / 180);
          const outerY = c + 46 * Math.sin((a * Math.PI) / 180);
          return <line key={a} x1={inner} y1={innerY} x2={outer} y2={outerY} stroke={a % 80 === 0 ? B : O2} strokeWidth="1" opacity="0.3" />;
        })}
        <circle cx={c} cy={c} r={20} fill="none" stroke={B3} strokeWidth="1.5" opacity="0.4" strokeDasharray="3,3" />
        <circle cx={c} cy={c} r={8} fill={B} opacity="0.3" />
        {[0, 120, 240].map((a) => (
          <circle key={`d-${a}`} cx={c + 34 * Math.cos((a * Math.PI) / 180)} cy={c + 34 * Math.sin((a * Math.PI) / 180)} r={6} fill={O} opacity="0.2" />
        ))}
      </>
    ),
  };

  return (
    <svg viewBox={`0 0 ${size} ${size}`} width={size} height={size}>
      {patterns[idx]}
    </svg>
  );
};

interface PolaroidCardProps {
  testimonial: Testimonial;
  index: number;
  initialPos: { x: number; y: number };
  rotation: number;
  bounds?: { minX: number; maxX: number; minY: number; maxY: number };
}

const PolaroidCard: React.FC<PolaroidCardProps> = ({
  testimonial,
  index,
  initialPos,
  rotation,
  bounds,
}) => {
  const { pos, isDragging, onPointerDown, wasClick } =
    useDraggableCard(initialPos, bounds);
  const [flipped, setFlipped] = useState(false);
  const [zIndex, setZIndex] = useState(index);

  const handlePointerUp = () => {
    if (wasClick()) {
      setFlipped((f) => !f);
    }
  };

  const handlePointerDown = (e: React.PointerEvent) => {
    setZIndex(Date.now());
    onPointerDown(e);
  };

  return (
    <div
      className="absolute select-none touch-none"
      style={{
        left: pos.x,
        top: pos.y,
        zIndex: isDragging ? 40 : Math.min(zIndex % 30, 30),
        cursor: isDragging ? "grabbing" : "grab",
        transform: `rotate(${rotation}deg) ${isDragging ? "scale(1.04)" : "scale(1)"}`,
        transition: isDragging ? "none" : "transform 0.15s ease, box-shadow 0.2s ease",
      }}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
    >
      <div
        className="w-[180px]"
        style={{ perspective: "800px" }}
      >
        <div
          className="relative w-full transition-transform duration-500"
          style={{
            transformStyle: "preserve-3d",
            transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)",
            transitionTimingFunction: "cubic-bezier(0.4, 0, 0.2, 1)",
          }}
        >
          {/* Front Face */}
          <div
            className={`
              w-full rounded-lg
              bg-[#0A0C0F]
              p-3 pb-9
              ${isDragging ? "shadow-[0_16px_48px_rgba(0,0,0,0.22)]" : "shadow-[0_4px_20px_rgba(0,0,0,0.12),0_1px_4px_rgba(0,0,0,0.08)]"}
            `}
            style={{ backfaceVisibility: "hidden", WebkitBackfaceVisibility: "hidden" }}
          >
            <div className="w-full aspect-square rounded-[2px] overflow-hidden bg-[#0B0D10] flex items-center justify-center">
              <CircleArt id={testimonial.id} />
            </div>

            <div className="mt-2.5 text-center" style={{ fontFamily: "var(--font-handwritten)" }}>
              <p className="text-[13px] text-[#E5E7EB] leading-[1.4]">
                {testimonial.name}
              </p>
              <p className="text-[11px] text-[#6B7280]">
                {testimonial.classCity}
              </p>
            </div>
          </div>

          {/* Back Face */}
          <div
            className={`
              absolute top-0 left-0 w-full rounded-lg
              bg-[#0A0C0F]
              p-3 pb-9
              ${isDragging ? "shadow-[0_16px_48px_rgba(0,0,0,0.22)]" : "shadow-[0_4px_20px_rgba(0,0,0,0.12),0_1px_4px_rgba(0,0,0,0.08)]"}
            `}
            style={{
              backfaceVisibility: "hidden",
              WebkitBackfaceVisibility: "hidden",
              transform: "rotateY(180deg)",
            }}
          >
            <div className="w-full aspect-square rounded-[2px] overflow-hidden bg-[#07080A] flex flex-col items-center justify-center p-4">
              <div className="flex items-center gap-0.5 mb-3">
                {[1, 2, 3, 4, 5].map((s) => (
                  <svg
                    key={s}
                    className="w-3.5 h-3.5"
                    viewBox="0 0 20 20"
                    fill={s <= testimonial.rating ? "#FFA629" : "#374151"}
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>

              <p
                className="text-[11px] leading-[1.5] text-[#D1D5DB] text-center italic"
                style={{ fontFamily: "var(--font-handwritten)", fontSize: "13px" }}
              >
                &ldquo;{testimonial.text}&rdquo;
              </p>
            </div>

            <div className="mt-2.5 text-center" style={{ fontFamily: "var(--font-handwritten)" }}>
              <p className="text-[11px] text-[#6B7280]">
                tap to flip back
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PolaroidCard;
