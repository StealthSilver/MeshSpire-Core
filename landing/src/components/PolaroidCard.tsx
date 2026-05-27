"use client";

import React, { useState } from "react";
import { useDraggableCard } from "@/hooks/useDraggableCard";
import { Testimonial } from "@/data/testimonials";
import Avatar1 from "./avatars/Avatar1";
import Avatar2 from "./avatars/Avatar2";
import Avatar3 from "./avatars/Avatar3";
import Avatar4 from "./avatars/Avatar4";
import Avatar5 from "./avatars/Avatar5";
import Avatar6 from "./avatars/Avatar6";

const AVATARS = [Avatar1, Avatar2, Avatar3, Avatar4, Avatar5, Avatar6];

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

  const AvatarComponent = AVATARS[testimonial.avatarIndex % AVATARS.length];

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
        style={{
          perspective: "800px",
        }}
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
              bg-[#F1F5F9] dark:bg-[#0A0C0F]
              p-3 pb-9
              ${isDragging ? "shadow-[0_16px_48px_rgba(0,0,0,0.22)]" : "shadow-[0_4px_20px_rgba(0,0,0,0.12),0_1px_4px_rgba(0,0,0,0.08)] hover:shadow-[0_8px_32px_rgba(0,0,0,0.18)]"}
            `}
            style={{ backfaceVisibility: "hidden", WebkitBackfaceVisibility: "hidden" }}
          >
            {/* Photo area */}
            <div className="relative w-full aspect-square rounded-[2px] overflow-hidden bg-[#ECEEF2] dark:bg-[#0B0D10] flex items-center justify-center">
              <AvatarComponent width={100} height={100} />
              {/* Film grain overlay */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-[0.06]">
                <filter id={`grain-${testimonial.id}`}>
                  <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="3" stitchTiles="stitch" />
                  <feColorMatrix type="saturate" values="0" />
                </filter>
                <rect width="100%" height="100%" filter={`url(#grain-${testimonial.id})`} />
              </svg>
            </div>

            {/* Caption */}
            <div className="mt-2.5 text-center" style={{ fontFamily: "var(--font-handwritten)" }}>
              <p className="text-[13px] text-[#374151] dark:text-[#E5E7EB] leading-[1.4]">
                {testimonial.name}
              </p>
              <p className="text-[11px] text-[#9CA3AF] dark:text-[#6B7280]">
                {testimonial.classCity}
              </p>
            </div>
          </div>

          {/* Back Face */}
          <div
            className={`
              absolute top-0 left-0 w-full rounded-lg
              bg-[#F1F5F9] dark:bg-[#0A0C0F]
              p-3 pb-9
              ${isDragging ? "shadow-[0_16px_48px_rgba(0,0,0,0.22)]" : "shadow-[0_4px_20px_rgba(0,0,0,0.12),0_1px_4px_rgba(0,0,0,0.08)]"}
            `}
            style={{
              backfaceVisibility: "hidden",
              WebkitBackfaceVisibility: "hidden",
              transform: "rotateY(180deg)",
            }}
          >
            <div className="w-full aspect-square rounded-[2px] overflow-hidden bg-[#F8FAFC] dark:bg-[#07080A] flex flex-col items-center justify-center p-4">
              {/* Stars */}
              <div className="flex items-center gap-0.5 mb-3">
                {[1, 2, 3, 4, 5].map((s) => (
                  <svg
                    key={s}
                    className="w-3.5 h-3.5"
                    viewBox="0 0 20 20"
                    fill={s <= testimonial.rating ? "#FFA629" : "#D1D5DB"}
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>

              {/* Quote */}
              <p
                className="text-[11px] leading-[1.5] text-[#374151] dark:text-[#D1D5DB] text-center italic"
                style={{ fontFamily: "var(--font-handwritten)", fontSize: "13px" }}
              >
                &ldquo;{testimonial.text}&rdquo;
              </p>
            </div>

            {/* Tap hint */}
            <div className="mt-2.5 text-center" style={{ fontFamily: "var(--font-handwritten)" }}>
              <p className="text-[11px] text-[#9CA3AF] dark:text-[#6B7280]">
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
