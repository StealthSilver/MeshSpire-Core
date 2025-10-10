"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useTheme } from "next-themes";

const Hero = () => {
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  const isDark = theme === "dark";

  return (
    <section
      id="home"
      className={`
        relative w-full min-h-screen
        flex flex-col items-center justify-center
        overflow-hidden
        text-[var(--color-font)]
        ${
          isDark
            ? "bg-gradient-to-b from-slate-900 via-black to-black"
            : "bg-gradient-to-b from-purple-100 via-white to-white"
        }
      `}
    >
      <div className="mt-10 relative z-10 max-w-7xl mx-auto flex flex-col items-center justify-center pt-6 px-4">
        <button
          className="
            bg-[var(--background)] text-[var(--color-font)] border border-[var(--foreground)]
            hover:bg-[var(--hover-light)]
            dark:hover:bg-[var(--hover-dark)]
            font-small font-[var(--font-secondary)]
            px-6 md:px-10 py-1 text-sm md:text-base 
            transition-all duration-500 ease-in-out rounded-full mb-6 md:mb-0
          "
          style={{ borderWidth: "0.5px" }}
        >
          Launching Oct 2025
        </button>

        <div className="relative inline-block pt-4 md:pt-20 text-center">
          <h1 className="md:text-6xl text-4xl font-[var(--font-primary)] relative z-10">
            Fastest and most efficient
          </h1>
        </div>

        <h1 className="md:text-6xl text-4xl font-[var(--font-primary)] text-center">
          way to learn
        </h1>

        <p className="md:text-xl text-base font-[var(--font-secondary)] pt-10 text-center px-6">
          A super fast peer to peer learning platform
        </p>
        <p className="md:text-xl text-base font-[var(--font-secondary)] text-center px-6">
          Find the teacher which is most suited to your learning style
        </p>

        <div className="flex flex-col md:flex-row items-center justify-center pt-12 gap-4 md:gap-[120px]">
          <Link
            href="https://dev.dn03fv11bz1ey.amplifyapp.com/"
            className="
              rounded-full border px-18 py-1.5 transition-all duration-300
              bg-[var(--color-primary)] text-[var(--background)] dark:text-[var(--foreground)] border-[var(--color-primary)]
              hover:bg-[var(--background)] hover:text-[var(--color-font)] hover:border-[var(--foreground)]
            "
          >
            Login
          </Link>

          <Link
            href="#footer"
            className="
              bg-[var(--background)] text-[var(--color-font)] border border-[var(--foreground)]
              hover:bg-[var(--foreground)] hover:text-[var(--background)]
              font-[var(--font-secondary)] 
              px-10 py-2 md:px-14 rounded-full
              transition-all duration-300
              w-[160px] md:w-[200px] text-sm md:text-base text-center flex items-center justify-center
            "
          >
            Contact us
          </Link>
        </div>
      </div>

      <img
        src={isDark ? "/Dashboard-Dark.png" : "/Dashboard-Light.png"}
        alt="Dashboard"
        width={1280}
        height={750}
        className="max-w-5xl w-[90%] h-[60%] object-contain sticky top-0 right-0 border-[8px] mt-10 md:mt-[136px] border-slate-300 dark:border-gray-800  rounded-2xl z-10"
      />
    </section>
  );
};

export default Hero;
