"use client";

import React, { useState } from "react";
import { useTheme } from "next-themes";

const faqs = [
  {
    question: "How does MeshSpire match me with the right tutor?",
    answer:
      "Our algorithm analyzes your learning style, academic goals, preferred pace, and subject needs to find tutors who genuinely fit the way you learn — not just whoever is available.",
  },
  {
    question: "Can I switch tutors if the match doesn't feel right?",
    answer:
      "Absolutely. You can request a new match at any time, no questions asked. We'll use your feedback to refine the next recommendation so every switch gets you closer to the perfect fit.",
  },
  {
    question: "What subjects are available on the platform?",
    answer:
      "We cover mathematics, sciences, languages, humanities, arts, and computer science — from school-level foundations to advanced university coursework. New subjects are added regularly based on demand.",
  },
  {
    question: "How flexible is the scheduling?",
    answer:
      "Completely flexible. You choose the day, time, and duration that works for you. Morning or midnight, weekday or weekend — sessions adapt to your life, not the other way around.",
  },
  {
    question: "Is there a free trial or demo available?",
    answer:
      "Yes. Every new student gets a complimentary introductory session so you can experience the platform, meet a tutor, and decide if MeshSpire is right for you before committing.",
  },
  {
    question: "How are tutors vetted before joining MeshSpire?",
    answer:
      "Every tutor goes through a multi-step verification process including credential checks, subject proficiency assessments, and a trial teaching evaluation. Only qualified educators make it onto the platform.",
  },
];

const ChevronIcon = ({ open }: { open: boolean }) => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 20 20"
    fill="none"
    className={`shrink-0 transition-transform duration-300 ${open ? "rotate-180" : ""}`}
  >
    <path
      d="M5 7.5L10 12.5L15 7.5"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const FAQ = () => {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const cardBg = isDark ? "#0A0C0F" : "#F1F5F9";
  const cardBorder = isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)";
  const textPrimary = isDark ? "#F5F7FA" : "#0F172A";
  const textSecondary = isDark ? "rgba(255,255,255,0.45)" : "rgba(0,0,0,0.45)";
  const hoverBorder = isDark ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.12)";

  const toggle = (i: number) => setOpenIndex(openIndex === i ? null : i);

  return (
    <section
      id="faq"
      className="relative w-full py-32 overflow-hidden bg-[var(--background)] transition-colors duration-700"
    >
      <div className="max-w-3xl mx-auto px-6">
        <div className="text-center mb-20">
          <span className="inline-block text-sm font-[var(--font-secondary)] font-medium tracking-widest uppercase text-[#FFA629] mb-6">
            FAQ
          </span>
          <h2 className="font-[var(--font-primary)] text-5xl font-thin tracking-tight leading-tight text-[#0F172A] dark:text-[#F5F7FA]">
            Questions? Answered.
          </h2>
        </div>

        <div className="flex flex-col gap-3">
          {faqs.map((faq, i) => {
            const isOpen = openIndex === i;
            return (
              <div
                key={i}
                className="rounded-xl overflow-hidden transition-all duration-300"
                style={{
                  background: cardBg,
                  border: `1px solid ${isOpen ? hoverBorder : cardBorder}`,
                }}
              >
                <button
                  onClick={() => toggle(i)}
                  className="w-full flex items-center justify-between gap-4 px-7 py-5 text-left cursor-pointer"
                >
                  <span
                    className="font-[var(--font-primary)] text-base font-normal"
                    style={{ color: textPrimary }}
                  >
                    {faq.question}
                  </span>
                  <span style={{ color: textSecondary }}>
                    <ChevronIcon open={isOpen} />
                  </span>
                </button>

                <div
                  className="grid transition-all duration-300 ease-in-out"
                  style={{
                    gridTemplateRows: isOpen ? "1fr" : "0fr",
                  }}
                >
                  <div className="overflow-hidden">
                    <p
                      className="px-7 pb-6 font-[var(--font-secondary)] text-sm font-light leading-relaxed"
                      style={{ color: textSecondary }}
                    >
                      {faq.answer}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0">
        <hr className="border-t border-[var(--foreground)]/10" />
      </div>
    </section>
  );
};

export default FAQ;
