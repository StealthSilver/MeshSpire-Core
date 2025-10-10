"use client";
import {
  useMotionValueEvent,
  useScroll,
  useTransform,
  motion,
} from "framer-motion";
import React, { useEffect, useRef, useState } from "react";
import { useTheme } from "next-themes";

interface TimelineEntry {
  title: string;
  content: React.ReactNode;
}

export const Timeline = ({
  data,
  hoverEffect,
  scaleOnHover,
}: {
  data: TimelineEntry[];
  hoverEffect?: boolean;
  scaleOnHover?: boolean;
}) => {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const ref = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState(0);

  useEffect(() => {
    if (ref.current) {
      const rect = ref.current.getBoundingClientRect();
      setHeight(rect.height);
    }
  }, [ref]);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start 40%", "end 40%"],
  });

  const heightTransform = useTransform(scrollYProgress, [0, 1], [0, height]);
  const opacityTransform = useTransform(scrollYProgress, [0, 0.1], [0, 1]);

  return (
    <div
      className="w-full font-[var(--font-primary)] md:px-10 relative"
      ref={containerRef}
    >
      <div ref={ref} className="relative max-w-7xl mx-auto pb-20">
        {data.map((item, index) => (
          <motion.div
            key={index}
            className={`flex flex-col pt-10 md:pt-40 gap-6 mb-20 relative transition-all duration-500 
              ${hoverEffect && isDark ? "hover:shadow-lg rounded-xl" : ""}
              ${scaleOnHover ? "hover:scale-[1.02]" : ""}
            `}
          >
            <div className="absolute left-3 md:left-3.5 flex items-center justify-center z-10">
              <motion.div
                initial={{ scale: 0 }}
                whileInView={{ scale: 0.8 }}
                transition={{ duration: 0.5, type: "spring" }}
                className={`h-10 w-10 rounded-full flex items-center justify-center transition-colors duration-500 ${
                  isDark ? "bg-black" : "bg-white"
                }`}
              >
                <div
                  className={`h-4 w-4 rounded-full border p-2 transition-colors duration-500 ${
                    isDark
                      ? "bg-neutral-800 border-neutral-700"
                      : "bg-neutral-200 border-neutral-300"
                  }`}
                />
              </motion.div>
            </div>

            <h3
              className={`text-xl md:text-4xl  pl-16 md:pl-20 transition-colors duration-500 ${
                isDark ? "text-neutral-300" : "text-neutral-700"
              }`}
            >
              {item.title}
            </h3>

            <div
              className={`pl-16 md:pl-20 pr-4 w-full text-[14px] md:text-lg leading-[1.8] transition-colors duration-500 font-[var(--font-secondary)]   ${
                isDark ? "text-neutral-400" : "text-neutral-700"
              }`}
            >
              {item.content}
            </div>
          </motion.div>
        ))}

        <div
          className="absolute md:left-8 left-6 top-0 w-[3px] rounded-full overflow-hidden"
          style={{ height: height + "px" }}
        >
          <div
            className={`absolute inset-x-0 top-0 w-full h-full rounded-full transition-colors duration-500 ${
              isDark ? "bg-neutral-700" : "bg-neutral-300"
            }`}
          />

          <motion.div
            style={{
              height: heightTransform,
              opacity: opacityTransform,
            }}
            className="absolute inset-x-0 top-0 w-full rounded-full bg-gradient-to-b from-purple-600 via-green-500 to-purple-700"
          />
        </div>
      </div>
    </div>
  );
};
