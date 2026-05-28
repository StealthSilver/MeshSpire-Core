"use client";

import { useEffect, useState } from "react";
import DraggableGrid from "@/components/DraggableGrid";

const Hero = () => {
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReduceMotion(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  const textEnter = !reduceMotion;

  return (
    <section
      id="home"
      className="
        relative w-full min-h-screen
        flex flex-col items-start justify-end
        overflow-hidden
        text-[var(--color-font)]
        transition-colors duration-700
      "
    >
      <DraggableGrid cardsEntering={textEnter} />

      <div className="relative z-20 w-full max-w-7xl mx-auto flex flex-col items-start justify-end pb-32 px-6 text-left pointer-events-none">
        <h1
          className={`font-[var(--font-primary)] text-7xl font-extralight tracking-tight leading-tight
          text-[#0F172A] dark:text-[#F5F7FA] max-w-3xl${textEnter ? " hero-text-fade" : ""}`}
        >
          The Most Personalis<span className="text-[#0F172A] dark:text-[#F5F7FA]">ed</span>
          <br />
          Learning Platform
        </h1>
        <p
          className={`mt-6 max-w-2xl text-base font-[var(--font-primary)] font-extralight leading-relaxed
          text-[#0F172A]/60 dark:text-[#F5F7FA]${
            textEnter ? " hero-text-fade hero-text-fade--delayed" : ""
          }`}
        >
          Learn from your chosen teachers, at your own pace, whenever you want, whatever you want,
          however you want.
        </p>
      </div>

      <div className="pointer-events-none absolute right-8 bottom-10 z-20 flex items-center gap-2 text-xs uppercase tracking-[0.16em] text-[#0F172A]/65 dark:text-[#F5F7FA]/70">
        <span className="font-[var(--font-primary)]">Drag The Page</span>
        <span className="hero-drag-hint-arrows" aria-hidden="true">
          &gt;&gt;
        </span>
      </div>

      <div className="absolute bottom-0 left-0 right-0 z-10">
        <hr className="border-t border-[var(--foreground)]/10" />
      </div>
    </section>
  );
};

export default Hero;
