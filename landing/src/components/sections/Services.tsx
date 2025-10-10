"use client";

import React, { useRef, useEffect, useState } from "react";
import { useTheme } from "next-themes";

import { Icon } from "@/components/ui/Icon";
import { Timeline } from "@/components/ui/Timeline";
import AnimatedFlowSVG from "../ui/AnimatedFlow";

const timelineData = () => [
  {
    title: "Signup and create account",
    content: (
      <p
        className="
          text-base md:text-lg leading-relaxed max-w-md
          transition-colors duration-500
          text-[var(--color-font)]/90
          font-[var(--font-secondary)]
        "
      >
        Signup and create a student profile to find the best tutors for you. No
        payments, free signup. Access all the topics you want to learn.
      </p>
    ),
  },
  {
    title: "Enter the topic you want to learn",
    content: (
      <p
        className="
          text-base md:text-lg leading-relaxed max-w-md
          transition-colors duration-500
          text-[var(--color-font)]/90
          font-[var(--font-secondary)]
        "
      >
        Select the tutor you want to learn from. We have wide range of tutors
        which will match your learning style.
      </p>
    ),
  },
  {
    title: "Connect to your tutor instantly",
    content: (
      <p
        className="
          text-base md:text-lg leading-relaxed max-w-md
          transition-colors duration-500
          text-[var(--color-font)]/90
          font-[var(--font-secondary)]
        "
      >
        Instantly connect to your tutor and learn. You getting it right is our
        responsibility. Solve instant assignments, give tests and a lot more.
      </p>
    ),
  },
];

const Content = () => {
  const { theme } = useTheme();
  const [timelineHeight, setTimelineHeight] = useState<number>(0);
  const timelineRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const updateHeight = () => {
      if (timelineRef.current)
        setTimelineHeight(timelineRef.current.offsetHeight);
    };
    updateHeight();
    window.addEventListener("resize", updateHeight);
    return () => window.removeEventListener("resize", updateHeight);
  }, []);

  return (
    <section
      id="services"
      className="
        py-20 md:py-22 px-6 md:mt-32 flex flex-col items-center justify-center mx-4 
        gap-10 md:gap-24 overflow-x-hidden 
        transition-colors duration-700
        bg-[var(--background)] text-[var(--color-font)] 
      "
    >
      <div className="flex flex-col items-center justify-center gap-4 w-full">
        <div
          className="
            border-2 flex flex-col items-center md:items-start mx-auto p-4
            max-w-xs md:max-w-none relative transition-all duration-700 
            border-[var(--foreground)]/20 bg-[var(--background)]/60
          "
        >
          <Icon className="absolute h-6 w-6 -top-4 -left-4 text-[var(--color-font)]/70 transition-colors" />
          <Icon className="absolute h-6 w-6 -bottom-4 -left-4 text-[var(--color-font)]/70 transition-colors" />
          <Icon className="absolute h-6 w-6 -top-4 -right-4 text-[var(--color-font)]/70 transition-colors" />
          <Icon className="absolute h-6 w-6 -bottom-4 -right-4 text-[var(--color-font)]/70 transition-colors" />

          <h2
            className="
              text-2xl md:text-2xl lg:text-3xl font-[var(--font-primary)] 
               text-center md:text-left transition-colors 
              text-[var(--color-font)]
            "
          >
            Learning made easy
          </h2>
        </div>
      </div>

      <div className="flex flex-col md:flex-row items-center justify-center gap-10 md:gap-14 w-full max-w-7xl font-[var(--font-primary)] ">
        <div ref={timelineRef} className="hidden md:flex w-full md:w-1/2 mt-10">
          <Timeline data={timelineData()} hoverEffect />
        </div>

        <div
          className="hidden md:flex w-full md:w-1/2 justify-center items-start relative font-[var(--font-primary)] "
          style={{
            height: timelineHeight ? `${timelineHeight - 250}px` : "400px",
          }}
        >
          <div
            style={{
              height: timelineHeight ? `${timelineHeight - 250}px` : "400px",
              width: "100%",
            }}
            className="animate-float transition-transform duration-700"
          >
            <AnimatedFlowSVG />
          </div>
        </div>

        <div className="flex md:hidden flex-col gap-12 w-full">
          <Timeline data={timelineData()} hoverEffect />
        </div>
      </div>
    </section>
  );
};

export default Content;
