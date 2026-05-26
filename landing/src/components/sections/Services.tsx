"use client";

import React from "react";
import { useTheme } from "next-themes";

const steps = [
  {
    number: "01",
    title: "Create your profile",
    description:
      "Sign up in seconds. Tell us your subjects, goals, and preferred learning style. No payments needed to get started.",
    accent: "#FFA629",
  },
  {
    number: "02",
    title: "Choose your teacher",
    description:
      "Browse verified tutors matched to your needs. Watch intro videos, check reviews, and pick the one that resonates with you.",
    accent: "#809FFF",
  },
  {
    number: "03",
    title: "Start learning instantly",
    description:
      "Connect with your tutor in real-time. Learn through live sessions, interactive assignments, and personalized feedback loops.",
    accent: "#7DD3A0",
  },
];

const Services = () => {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  return (
    <section
      id="platform"
      className="relative w-full py-32 overflow-hidden bg-[var(--background)] transition-colors duration-700"
    >
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-20">
          <span className="inline-block text-sm font-[var(--font-secondary)] font-medium tracking-widest uppercase text-[#809FFF] mb-6">
            How it works
          </span>
          <h2 className="font-[var(--font-primary)] text-5xl font-thin tracking-tight leading-tight text-[#0F172A] dark:text-[#F5F7FA]">
            Three steps to better learning
          </h2>
          <p className="mt-5 text-base font-[var(--font-secondary)] font-light text-[#0F172A]/55 dark:text-[#F5F7FA]/55 max-w-lg mx-auto">
            No complicated onboarding. No hidden fees. Just a clean path from sign-up to your first lesson.
          </p>
        </div>

        {/* Steps */}
        <div className="flex items-stretch gap-8">
          {steps.map((step, index) => (
            <div
              key={step.number}
              className={`
                group relative flex-1 p-10 rounded-3xl border transition-all duration-300
                ${isDark
                  ? "border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.04]"
                  : "border-[#0F172A]/[0.06] bg-[#0F172A]/[0.01] hover:bg-[#0F172A]/[0.03]"
                }
              `}
            >
              {/* Step number */}
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center mb-8 font-[var(--font-secondary)] text-sm font-semibold"
                style={{
                  backgroundColor: `${step.accent}15`,
                  color: step.accent,
                }}
              >
                {step.number}
              </div>

              <h3 className="font-[var(--font-primary)] text-2xl font-normal text-[#0F172A] dark:text-[#F5F7FA] mb-4">
                {step.title}
              </h3>

              <p className="font-[var(--font-secondary)] text-sm font-light leading-relaxed text-[#0F172A]/55 dark:text-[#F5F7FA]/55">
                {step.description}
              </p>

              {/* Connector line between cards */}
              {index < steps.length - 1 && (
                <div className="absolute top-1/2 -right-4 w-8 h-[1px] bg-[var(--foreground)]/10" />
              )}
            </div>
          ))}
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
