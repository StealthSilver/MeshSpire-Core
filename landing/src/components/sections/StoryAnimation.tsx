"use client";

import { useTheme } from "next-themes";

const problems = [
  {
    number: "01",
    title: "One-size-fits-all teaching",
    description:
      "Traditional classrooms force every student into the same mold. Different learning speeds, styles, and goals are ignored entirely.",
  },
  {
    number: "02",
    title: "No flexibility in timing",
    description:
      "Fixed schedules don't care if you're a morning learner or a night owl. You adapt to the system — not the other way around.",
  },
  {
    number: "03",
    title: "Disconnected from great teachers",
    description:
      "The best teachers are scattered across the world. Geography and cost make them inaccessible to most students.",
  },
];

const StoryAnimation = () => {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  return (
    <section
      id="transition"
      className="relative w-full py-32 overflow-hidden bg-[var(--background)] transition-colors duration-700"
    >
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-start justify-between gap-20">
          {/* Left — narrative */}
          <div className="w-[480px] shrink-0">
            <span className="inline-block text-sm font-[var(--font-secondary)] font-medium tracking-widest uppercase text-[#FFA629] mb-6">
              The Problem
            </span>
            <h2 className="font-[var(--font-primary)] text-5xl font-thin tracking-tight leading-tight text-[#0F172A] dark:text-[#F5F7FA]">
              Learning was never<br />designed for <span className="italic">you</span>
            </h2>
            <p className="mt-6 text-base font-[var(--font-secondary)] font-light leading-relaxed text-[#0F172A]/60 dark:text-[#F5F7FA]/60 max-w-md">
              We built MeshSpire because education deserved better. A platform where every student
              gets the teacher they deserve, on the schedule that fits their life.
            </p>

            <div className="mt-12 flex items-center gap-4">
              <div className="w-12 h-[1px] bg-[#FFA629]" />
              <span className="text-sm font-[var(--font-secondary)] text-[#0F172A]/50 dark:text-[#F5F7FA]/50">
                That&apos;s why we exist
              </span>
            </div>
          </div>

          {/* Right — problem cards */}
          <div className="flex-1 flex flex-col gap-6">
            {problems.map((problem) => (
              <div
                key={problem.number}
                className={`
                  group relative p-8 rounded-2xl border transition-all duration-300
                  ${isDark
                    ? "border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.04] hover:border-white/[0.12]"
                    : "border-[#0F172A]/[0.06] bg-[#0F172A]/[0.01] hover:bg-[#0F172A]/[0.03] hover:border-[#0F172A]/[0.12]"
                  }
                `}
              >
                <div className="flex items-start gap-6">
                  <span className="font-[var(--font-secondary)] text-sm font-medium text-[#FFA629] mt-1">
                    {problem.number}
                  </span>
                  <div>
                    <h3 className="font-[var(--font-primary)] text-xl font-normal text-[#0F172A] dark:text-[#F5F7FA] mb-2">
                      {problem.title}
                    </h3>
                    <p className="font-[var(--font-secondary)] text-sm font-light leading-relaxed text-[#0F172A]/55 dark:text-[#F5F7FA]/55">
                      {problem.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Subtle divider */}
      <div className="absolute bottom-0 left-0 right-0">
        <hr className="border-t border-[var(--foreground)]/10" />
      </div>
    </section>
  );
};

export default StoryAnimation;
