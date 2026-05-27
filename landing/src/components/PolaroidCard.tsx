"use client";

import React, { useState } from "react";
import { useTheme } from "next-themes";
import { useDraggableCard } from "@/hooks/useDraggableCard";
import { Testimonial } from "@/data/testimonials";

const sunsetColors = [
  "#2D0A04", "#3A1007", "#47160A", "#541C0D", "#612210",
  "#6E2813", "#7B2E16", "#883419", "#953A1C", "#A2401F",
  "#AF4622", "#B95028", "#C35A2E", "#CD6434", "#D76E3A",
  "#DF7840", "#E78246", "#EF8C4C", "#F59652", "#F9A058",
  "#FCAA5E", "#FEB464", "#FFBE6A", "#FFC870", "#FFD276",
];

const STRIPE_COUNT = 25;
const STRIPE_H = 3;
const STRIPE_GAP = 4;
const CIRC_R = 70;
const CIRC_CX = 80;
const STRIPE_START = CIRC_CX - CIRC_R;

const cardRotations = [0, 45, 90, -45, 30, -30, 60, -60, 135, 15];

const StripedCircle = ({ id, isDark }: { id: number; isDark: boolean }) => {
  const rotation = cardRotations[(id - 1) % cardRotations.length];
  const rotateTransform = rotation !== 0 ? `rotate(${rotation}, ${CIRC_CX}, ${CIRC_CX})` : undefined;
  const grayFill = isDark ? "#555" : "#999";

  return (
    <div className="relative w-full h-full">
      <svg viewBox="0 0 160 160" className="absolute inset-0 w-full h-full transition-opacity duration-500 ease-in-out group-hover:opacity-0">
        <defs><clipPath id={`sg-${id}`}><circle cx={CIRC_CX} cy={CIRC_CX} r={CIRC_R} /></clipPath></defs>
        <g clipPath={`url(#sg-${id})`} transform={rotateTransform}>
          {Array.from({ length: STRIPE_COUNT }, (_, i) => (
            <rect key={i} x={-40} y={STRIPE_START + i * (STRIPE_H + STRIPE_GAP)} width={240} height={STRIPE_H} fill={grayFill} />
          ))}
        </g>
      </svg>
      <svg viewBox="0 0 160 160" className="absolute inset-0 w-full h-full opacity-0 transition-opacity duration-500 ease-in-out group-hover:opacity-100">
        <defs><clipPath id={`sc-${id}`}><circle cx={CIRC_CX} cy={CIRC_CX} r={CIRC_R} /></clipPath></defs>
        <g clipPath={`url(#sc-${id})`} transform={rotateTransform}>
          {Array.from({ length: STRIPE_COUNT }, (_, i) => (
            <rect key={i} x={-40} y={STRIPE_START + i * (STRIPE_H + STRIPE_GAP)} width={240} height={STRIPE_H} fill={sunsetColors[i] || sunsetColors[sunsetColors.length - 1]} />
          ))}
        </g>
      </svg>
    </div>
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
  const { theme } = useTheme();
  const isDark = theme === "dark";
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
      className="group absolute select-none touch-none"
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
        className="w-[240px]"
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
              w-full rounded-lg border overflow-hidden transition-all duration-300 p-3 pb-9
              ${isDark
                ? "bg-[#0A0C0F] border-white/[0.06] group-hover:border-white/[0.12]"
                : "bg-[#F1F5F9] border-[#0F172A]/[0.06] group-hover:border-[#0F172A]/[0.12] group-hover:shadow-lg"
              }
              ${isDragging ? "shadow-[0_16px_48px_rgba(0,0,0,0.4)]" : "shadow-[0_4px_20px_rgba(0,0,0,0.12),0_1px_4px_rgba(0,0,0,0.08)]"}
            `}
            style={{ backfaceVisibility: "hidden", WebkitBackfaceVisibility: "hidden" }}
          >
            <div className={`w-full aspect-square rounded-[2px] overflow-hidden flex items-center justify-center p-4 ${isDark ? "bg-[#0A0C0F]" : "bg-[#F1F5F9]"}`}>
              <StripedCircle id={testimonial.id} isDark={isDark} />
            </div>

            <div className="mt-2.5 text-center" style={{ fontFamily: "var(--font-handwritten)" }}>
              <p className={`text-[13px] leading-[1.4] ${isDark ? "text-[#E5E7EB]" : "text-[#0F172A]"}`}>
                {testimonial.name}
              </p>
              <p className={`text-[11px] ${isDark ? "text-[#6B7280]" : "text-[#0F172A]/50"}`}>
                {testimonial.classCity}
              </p>
            </div>
          </div>

          {/* Back Face */}
          <div
            className={`
              absolute top-0 left-0 w-full rounded-lg border overflow-hidden transition-all duration-300 p-3 pb-9
              ${isDark
                ? "bg-[#0A0C0F] border-white/[0.06] group-hover:border-white/[0.12]"
                : "bg-[#F1F5F9] border-[#0F172A]/[0.06] group-hover:border-[#0F172A]/[0.12] group-hover:shadow-lg"
              }
              ${isDragging ? "shadow-[0_16px_48px_rgba(0,0,0,0.4)]" : "shadow-[0_4px_20px_rgba(0,0,0,0.12),0_1px_4px_rgba(0,0,0,0.08)]"}
            `}
            style={{
              backfaceVisibility: "hidden",
              WebkitBackfaceVisibility: "hidden",
              transform: "rotateY(180deg)",
            }}
          >
            <div className={`w-full aspect-square rounded-[2px] overflow-hidden flex flex-col items-center justify-center p-4 ${isDark ? "bg-[#0A0C0F]" : "bg-[#F1F5F9]"}`}>
              <div className="flex items-center gap-0.5 mb-3">
                {[1, 2, 3, 4, 5].map((s) => (
                  <svg
                    key={s}
                    className="w-3.5 h-3.5"
                    viewBox="0 0 20 20"
                    fill={s <= testimonial.rating ? "#FFA629" : isDark ? "#374151" : "#D1D5DB"}
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>

              <p
                className={`text-[11px] leading-[1.5] text-center italic ${isDark ? "text-[#D1D5DB]" : "text-[#0F172A]/70"}`}
                style={{ fontFamily: "var(--font-handwritten)", fontSize: "13px" }}
              >
                &ldquo;{testimonial.text}&rdquo;
              </p>
            </div>

            <div className="mt-2.5 text-center" style={{ fontFamily: "var(--font-handwritten)" }}>
              <p className={`text-[11px] ${isDark ? "text-[#6B7280]" : "text-[#0F172A]/40"}`}>
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
