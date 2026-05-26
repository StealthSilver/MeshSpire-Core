"use client";

import React from "react";
import { useTheme } from "next-themes";
import {
  Zap,
  Shield,
  Clock,
  Heart,
  CreditCard,
  DollarSign,
  GraduationCap,
  Layers,
} from "lucide-react";

const features = [
  {
    icon: Zap,
    title: "Ease of use",
    description: "It's as easy as using an Apple, but not as expensive as buying one.",
    accent: "#FFA629",
  },
  {
    icon: Shield,
    title: "100% uptime",
    description: "We can't be taken down by anyone. Your learning never stops.",
    accent: "#809FFF",
  },
  {
    icon: Clock,
    title: "The fastest",
    description: "We will connect you to your tutors in seconds, not hours.",
    accent: "#7DD3A0",
  },
  {
    icon: Heart,
    title: "Student first",
    description: "Students are the priority, always and every time.",
    accent: "#F472B6",
  },
  {
    icon: CreditCard,
    title: "Money back",
    description: "If we can't serve you, you don't pay. Simple as that.",
    accent: "#FFA629",
  },
  {
    icon: DollarSign,
    title: "Best pricing",
    description: "Lowest learning prices. We don't overcharge for quality.",
    accent: "#7DD3A0",
  },
  {
    icon: GraduationCap,
    title: "Quality tutors",
    description: "We will match you to the best quality tutors available.",
    accent: "#809FFF",
  },
  {
    icon: Layers,
    title: "Learning cluster",
    description: "You just need one app for all your learning needs.",
    accent: "#F472B6",
  },
];

const Features = () => {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  return (
    <section
      id="features"
      className="relative w-full py-32 overflow-hidden bg-[var(--background)] transition-colors duration-700"
    >
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-20">
          <span className="inline-block text-sm font-[var(--font-secondary)] font-medium tracking-widest uppercase text-[#7DD3A0] mb-6">
            Features
          </span>
          <h2 className="font-[var(--font-primary)] text-5xl font-thin tracking-tight leading-tight text-[#0F172A] dark:text-[#F5F7FA]">
            Why MeshSpire?
          </h2>
          <p className="mt-5 text-base font-[var(--font-secondary)] font-light text-[#0F172A]/55 dark:text-[#F5F7FA]/55 max-w-lg mx-auto">
            Built from the ground up for students who want more from their education.
          </p>
        </div>

        {/* Feature grid — 4 columns, 2 rows */}
        <div className="grid grid-cols-4 gap-6">
          {features.map((feature) => {
            const IconComp = feature.icon;
            return (
              <div
                key={feature.title}
                className={`
                  group relative p-8 rounded-2xl border transition-all duration-300
                  ${isDark
                    ? "border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.05] hover:border-white/[0.12]"
                    : "border-[#0F172A]/[0.06] bg-[#0F172A]/[0.01] hover:bg-[#0F172A]/[0.03] hover:border-[#0F172A]/[0.12]"
                  }
                `}
              >
                {/* Icon */}
                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center mb-6 transition-transform duration-300 group-hover:scale-110"
                  style={{
                    backgroundColor: `${feature.accent}12`,
                  }}
                >
                  <IconComp
                    size={20}
                    strokeWidth={1.5}
                    style={{ color: feature.accent }}
                  />
                </div>

                <h3 className="font-[var(--font-primary)] text-lg font-normal text-[#0F172A] dark:text-[#F5F7FA] mb-2">
                  {feature.title}
                </h3>

                <p className="font-[var(--font-secondary)] text-sm font-light leading-relaxed text-[#0F172A]/55 dark:text-[#F5F7FA]/55">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Subtle divider */}
      <div className="absolute bottom-0 left-0 right-0">
        <hr className="border-t border-[var(--foreground)]/10" />
      </div>
    </section>
  );
};

export default Features;
