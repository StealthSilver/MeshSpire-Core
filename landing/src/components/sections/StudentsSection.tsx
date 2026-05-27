"use client";

import React, { useMemo, useRef, useState, useEffect } from "react";
import PolaroidCard from "@/components/PolaroidCard";
import {
  TESTIMONIALS,
  getInitialPosition,
} from "@/data/testimonials";

const StudentsSection: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerSize, setContainerSize] = useState({ w: 1200, h: 600 });

  useEffect(() => {
    const measure = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setContainerSize({ w: rect.width, h: rect.height });
      }
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  const CARD_WIDTH = 240;
  const CARD_HEIGHT = 340;

  const positions = useMemo(
    () =>
      TESTIMONIALS.map((_, i) =>
        getInitialPosition(i, TESTIMONIALS.length, containerSize.w, containerSize.h)
      ),
    [containerSize.w, containerSize.h]
  );

  const bounds = useMemo(
    () => ({
      minX: 0,
      maxX: containerSize.w - CARD_WIDTH,
      minY: 0,
      maxY: containerSize.h - CARD_HEIGHT,
    }),
    [containerSize.w, containerSize.h]
  );

  return (
    <section
      id="students"
      className="relative w-full py-24 overflow-hidden bg-[var(--background)] transition-colors duration-700"
    >
      {/* Header */}
      <div className="max-w-7xl mx-auto px-6 mb-16 text-center">
        <span className="inline-block text-sm font-[var(--font-secondary)] font-medium tracking-widest uppercase text-[#809FFF] mb-6">
          Testimonials
        </span>
        <h2 className="font-[var(--font-primary)] text-5xl font-thin tracking-tight leading-tight text-[#0F172A] dark:text-[#F5F7FA]">
          What the students say
        </h2>
      </div>

      {/* Draggable card field */}
      <div
        ref={containerRef}
        className="relative max-w-7xl mx-auto px-6 h-[760px]"
      >
        {positions.length > 0 &&
          TESTIMONIALS.map((t, i) => (
            <PolaroidCard
              key={t.id}
              testimonial={t}
              index={i}
              initialPos={positions[i]}
              rotation={0}
              bounds={bounds}
            />
          ))}
      </div>

      {/* Subtle divider */}
      <div className="absolute bottom-0 left-0 right-0">
        <hr className="border-t border-[var(--foreground)]/10" />
      </div>
    </section>
  );
};

export default StudentsSection;
