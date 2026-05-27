"use client";

import React from "react";
import { useIsDark } from "@/hooks/useIsDark";
import { Star } from "lucide-react";

const testimonials = [
  {
    name: "Arjun Mehta",
    role: "JEE Aspirant",
    quote:
      "MeshSpire connected me with a physics teacher who finally made rotational dynamics click. I went from 40% to 92% in two months.",
    rating: 5,
    initials: "AM",
    color: "#FFA629",
  },
  {
    name: "Priya Sharma",
    role: "NEET Student",
    quote:
      "The flexibility is unreal. I study organic chemistry at 2 AM when my brain works best. No judgment, just great teaching.",
    rating: 5,
    initials: "PS",
    color: "#809FFF",
  },
  {
    name: "Rahul Verma",
    role: "Class 12, CBSE",
    quote:
      "My math tutor on MeshSpire explains things better than any coaching class I've been to. And it costs a fraction of what I used to pay.",
    rating: 5,
    initials: "RV",
    color: "#7DD3A0",
  },
  {
    name: "Sneha Iyer",
    role: "CAT Aspirant",
    quote:
      "I needed help with just DILR. MeshSpire let me find a specialist instead of paying for an entire course. Game changer.",
    rating: 5,
    initials: "SI",
    color: "#F472B6",
  },
  {
    name: "Karthik Nair",
    role: "B.Tech CSE",
    quote:
      "Found an incredible DSA tutor who helped me crack my dream placement. The personalized approach is worth every rupee.",
    rating: 5,
    initials: "KN",
    color: "#FFA629",
  },
  {
    name: "Ananya Das",
    role: "Class 10, ICSE",
    quote:
      "I was scared of board exams. My MeshSpire teacher made me actually enjoy studying. Got 95% overall!",
    rating: 5,
    initials: "AD",
    color: "#809FFF",
  },
];

const Testimonial = () => {
  const isDark = useIsDark();

  return (
    <section
      id="students"
      className="relative w-full py-32 overflow-hidden bg-[var(--background)] transition-colors duration-700"
    >
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-20">
          <span className="inline-block text-sm font-[var(--font-secondary)] font-medium tracking-widest uppercase text-[#F472B6] mb-6">
            Students
          </span>
          <h2 className="font-[var(--font-primary)] text-5xl font-thin tracking-tight leading-tight text-[#0F172A] dark:text-[#F5F7FA]">
            Loved by students everywhere
          </h2>
          <p className="mt-5 text-base font-[var(--font-secondary)] font-light text-[#0F172A]/55 dark:text-[#F5F7FA]/55 max-w-lg mx-auto">
            Real stories from real students who transformed their learning with MeshSpire.
          </p>
        </div>

        {/* Testimonial grid — 3 columns, 2 rows */}
        <div className="grid grid-cols-3 gap-6">
          {testimonials.map((testimonial) => (
            <div
              key={testimonial.name}
              className={`
                group relative p-8 rounded-2xl border transition-all duration-300
                ${isDark
                  ? "border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.04] hover:border-white/[0.12]"
                  : "border-[#0F172A]/[0.06] bg-[#0F172A]/[0.01] hover:bg-[#0F172A]/[0.03] hover:border-[#0F172A]/[0.12]"
                }
              `}
            >
              {/* Stars */}
              <div className="flex items-center gap-1 mb-5">
                {Array.from({ length: testimonial.rating }).map((_, i) => (
                  <Star
                    key={i}
                    size={14}
                    fill="#FFA629"
                    color="#FFA629"
                    strokeWidth={0}
                  />
                ))}
              </div>

              {/* Quote */}
              <p className="font-[var(--font-secondary)] text-sm font-light leading-relaxed text-[#0F172A]/70 dark:text-[#F5F7FA]/70 mb-8">
                &ldquo;{testimonial.quote}&rdquo;
              </p>

              {/* Author */}
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-xs font-[var(--font-secondary)] font-semibold text-white"
                  style={{ backgroundColor: testimonial.color }}
                >
                  {testimonial.initials}
                </div>
                <div>
                  <p className="font-[var(--font-secondary)] text-sm font-medium text-[#0F172A] dark:text-[#F5F7FA]">
                    {testimonial.name}
                  </p>
                  <p className="font-[var(--font-secondary)] text-xs font-light text-[#0F172A]/50 dark:text-[#F5F7FA]/50">
                    {testimonial.role}
                  </p>
                </div>
              </div>
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

export default Testimonial;
