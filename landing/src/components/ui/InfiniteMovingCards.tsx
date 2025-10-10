"use client";
import {
  motion,
  useAnimation,
  RepeatType,
  TargetAndTransition,
} from "framer-motion";
import { useEffect } from "react";
import { useTheme } from "next-themes";

type Testimonial = {
  quote: string;
  name: string;
  title: string;
};

interface InfiniteMovingCardsProps {
  items: Testimonial[];
  direction?: "left" | "right";
  speed?: "fast" | "normal" | "slow";
  pauseOnHover?: boolean;
  className?: string;
}

const speedMap = {
  fast: 20,
  normal: 40,
  slow: 60,
};

export function InfiniteMovingCards({
  items,
  direction = "left",
  speed = "normal",
  pauseOnHover = true,
  className = "",
}: InfiniteMovingCardsProps) {
  const controls = useAnimation();
  const duration = speedMap[speed] || speedMap.normal;

  const animationProps: TargetAndTransition = {
    x: direction === "left" ? ["0%", "-50%"] : ["-50%", "0%"],
    transition: {
      x: {
        repeat: Infinity,
        repeatType: "loop" as RepeatType,
        ease: "linear",
        duration,
      },
    },
  };

  useEffect(() => {
    controls.start(animationProps);
  }, [controls, direction, duration]);

  const { theme } = useTheme();
  const isDark = theme === "dark";

  return (
    <div
      className={`overflow-hidden mx-auto max-w-7xl py-6 relative ${className}`}
      style={{
        // horizontal fade on edges using mask-image
        WebkitMaskImage:
          "linear-gradient(to right, transparent 0%, black 40%, black 60%, transparent 100%)",
        maskImage:
          "linear-gradient(to right, transparent 0%, black 40%, black 60%, transparent 100%)",
      }}
    >
      <motion.div
        animate={controls}
        {...(pauseOnHover && {
          onHoverStart: () => controls.stop(),
          onHoverEnd: () => controls.start(animationProps),
        })}
        className="flex w-[150%]"
        style={{ willChange: "transform" }}
      >
        {[...items, ...items].map((item, idx) => (
          <div
            key={idx}
            className={`flex-shrink-0 rounded-xl flex flex-col items-center px-12 py-12 mx-2 min-w-[250px]
                        ${
                          isDark
                            ? "bg-slate-900 shadow-md"
                            : "bg-[var(--hover-light)] shadow-md"
                        }
            `}
          >
            <p
              className={`text-center  italic ${
                isDark ? "text-white" : "text-gray-800"
              }`}
            >
              ”{item.quote}”
            </p>
            <span
              className={`mt-3  font-bold ${
                isDark ? "text-white" : "text-gray-900"
              }`}
            >
              {item.name}
            </span>
            <span
              className={`text-xs  ${
                isDark ? "text-gray-200" : "text-gray-500"
              }`}
            >
              {item.title}
            </span>
          </div>
        ))}
      </motion.div>
    </div>
  );
}
