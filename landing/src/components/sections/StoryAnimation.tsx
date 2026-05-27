"use client";

import { useTheme } from "next-themes";

const sunsetColors = [
  "#2D0A04", "#3A1007", "#47160A", "#541C0D", "#612210",
  "#6E2813", "#7B2E16", "#883419", "#953A1C", "#A2401F",
  "#AF4622", "#B95028", "#C35A2E", "#CD6434", "#D76E3A",
  "#DF7840", "#E78246", "#EF8C4C", "#F59652", "#F9A058",
  "#FCAA5E", "#FEB464", "#FFBE6A", "#FFC870", "#FFD276",
];

const problems = [
  {
    title: "One-size-fits-all teaching",
    description:
      "Traditional classrooms force every student into the same mold. Different learning speeds, styles, and goals are ignored entirely.",
  },
  {
    title: "No flexibility in timing",
    description:
      "Fixed schedules don't care if you're a morning learner or a night owl. You adapt to the system — not the other way around.",
  },
  {
    title: "Students can't decide what or how to learn",
    description:
      "Rigid curricula strip students of agency. They have no say in what they study or the methods used to teach them — killing curiosity and motivation.",
  },
];

const LINE_COUNT = 25;
const LINE_HEIGHT = 3;
const GAP = 4;
const RADIUS = 85;
const CENTER = 100;
const START_Y = CENTER - RADIUS;

const StripedCircle = ({
  id,
  isDark,
}: {
  id: string;
  isDark: boolean;
}) => {
  const grayFill = isDark ? "#555" : "#999";

  return (
    <div className="relative w-44 h-44 mx-auto">
      <svg
        viewBox="0 0 200 200"
        className="absolute inset-0 w-full h-full transition-opacity duration-500 ease-in-out group-hover:opacity-0"
      >
        <defs>
          <clipPath id={`g-${id}`}>
            <circle cx={CENTER} cy={CENTER} r={RADIUS} />
          </clipPath>
        </defs>
        <g clipPath={`url(#g-${id})`}>
          {Array.from({ length: LINE_COUNT }, (_, i) => (
            <rect
              key={i}
              x={0}
              y={START_Y + i * (LINE_HEIGHT + GAP)}
              width={200}
              height={LINE_HEIGHT}
              fill={grayFill}
            />
          ))}
        </g>
      </svg>

      <svg
        viewBox="0 0 200 200"
        className="absolute inset-0 w-full h-full opacity-0 transition-opacity duration-500 ease-in-out group-hover:opacity-100"
      >
        <defs>
          <clipPath id={`c-${id}`}>
            <circle cx={CENTER} cy={CENTER} r={RADIUS} />
          </clipPath>
        </defs>
        <g clipPath={`url(#c-${id})`}>
          {Array.from({ length: LINE_COUNT }, (_, i) => (
            <rect
              key={i}
              x={0}
              y={START_Y + i * (LINE_HEIGHT + GAP)}
              width={200}
              height={LINE_HEIGHT}
              fill={sunsetColors[i] || sunsetColors[sunsetColors.length - 1]}
            />
          ))}
        </g>
      </svg>
    </div>
  );
};

const StoryAnimation = () => {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  return (
    <section
      id="transition"
      className="relative w-full py-32 overflow-hidden bg-[var(--background)] transition-colors duration-700"
    >
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-20">
          <span className="inline-block text-sm font-[var(--font-secondary)] font-medium tracking-widest uppercase text-[#FFA629] mb-6">
            The Problem
          </span>
          <h2 className="font-[var(--font-primary)] text-5xl font-extralight tracking-tight leading-tight text-[#0F172A] dark:text-[#F5F7FA]">
            Current Teaching Structure is Broken.
          </h2>
        </div>

        <div className="grid grid-cols-3 gap-8">
          {problems.map((problem, index) => (
            <div
              key={index}
              className={`
                group relative rounded-lg border overflow-hidden transition-all duration-300
                ${
                  isDark
                    ? "border-white/[0.06] bg-[#111418] hover:border-white/[0.12]"
                    : "border-[#0F172A]/[0.06] bg-[#F1F5F9] hover:border-[#0F172A]/[0.12] hover:shadow-lg"
                }
              `}
            >
              <div className="flex items-center justify-center py-12 px-6">
                <StripedCircle
                  id={`card-${index}`}
                  isDark={isDark}
                />
              </div>

              <div className="px-8 pb-8">
                <h3 className="font-[var(--font-primary)] text-xl font-normal text-[#0F172A] dark:text-[#F5F7FA] mb-3">
                  {problem.title}
                </h3>
                <p className="font-[var(--font-secondary)] text-sm font-light leading-relaxed text-[#0F172A]/55 dark:text-[#F5F7FA]/55">
                  {problem.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0">
        <hr className="border-t border-[var(--foreground)]/10" />
      </div>
    </section>
  );
};

export default StoryAnimation;
