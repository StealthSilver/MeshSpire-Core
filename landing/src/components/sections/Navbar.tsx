"use client";

import { useState, useEffect } from "react";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useTheme } from "next-themes";

export default function Navbar() {
  const [hovered, setHovered] = useState<string | null>(null);
  const [scrolled, setScrolled] = useState(false);
  const { theme } = useTheme();

  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const navItems = [
    { name: "Transition", href: "#transition" },
    { name: "Platform", href: "#platform" },
    { name: "Features", href: "#features" },
    { name: "Students", href: "#students" },
    { name: "Contact", href: "#contact" },
  ];

  return (
    <>
    <svg className="absolute w-0 h-0" aria-hidden="true">
      <defs>
        <filter id="gooey">
          <feGaussianBlur in="SourceGraphic" stdDeviation="5" result="blur" />
          <feColorMatrix
            in="blur"
            mode="matrix"
            values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 25 -12"
            result="goo"
          />
          <feComposite in="SourceGraphic" in2="goo" operator="atop" />
        </filter>
      </defs>
    </svg>
    <nav
      className={`
        w-full fixed top-0 z-50 px-6 py-3
        bg-transparent backdrop-blur-none
        text-[#0F172A] dark:text-[#9CA3AF]
        transition-all duration-500
        ${scrolled ? "border-b border-[var(--foreground)]/10 shadow-[0_1px_20px_rgba(0,0,0,0.06)]" : "border-b border-transparent"}
      `}
    >
      <div className="flex items-center justify-between max-w-7xl mx-auto w-full">
        <Link href="/" className="flex items-center cursor-pointer group">
          <motion.img
            key={mounted ? theme : "default"}
            src={
              !mounted
                ? "/logos/ms_dark.svg"
                : theme === "dark"
                  ? "/logos/ms_dark.svg"
                  : "/logos/ms_light.svg"
            }
            alt="Meshspire logo"
            className="w-36 h-auto transition-opacity duration-300 group-hover:opacity-80"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
          />
        </Link>

        <div
          className="flex items-center font-[var(--font-secondary)] relative gap-1 rounded-full bg-[var(--foreground)]/[0.04] dark:bg-[#111418] px-1.5 py-1.5"
          onMouseLeave={() => setHovered(null)}
        >
          {navItems.map((item) => (
            <div key={item.name} className="relative px-4 py-1.5 select-none">
              {hovered === item.name && (
                <motion.span
                  layoutId="navHover"
                  className="absolute inset-0 rounded-full bg-[#F4F7FF] dark:bg-[#1F2530]"
                  transition={{
                    type: "spring",
                    stiffness: 400,
                    damping: 30,
                  }}
                  initial={false}
                />
              )}

              <Link
                href={item.href}
                onMouseEnter={() => setHovered(item.name)}
                onFocus={() => setHovered(item.name)}
                className="
                  font-[var(--font-secondary)]
                  relative z-10 text-sm font-light
                  text-[#0F172A]/70 hover:text-[#0F172A] dark:text-[#9CA3AF] dark:hover:text-[#F5F7FA]
                  transition-colors duration-300
                "
              >
                {item.name}
              </Link>
            </div>
          ))}
        </div>

        <div className="flex items-center gap-4">
          <div className="group relative flex items-center" style={{ filter: "url(#gooey)" }}>
            <a
              href="https://meshspire-core.vercel.app/"
              className="relative flex items-center font-[var(--font-secondary)] text-sm font-normal
                bg-[#FFA629] text-[#0F172A] dark:text-[#F5F7FA] rounded-full px-6 py-2
                transition-colors duration-300 hover:bg-[#F09520]"
            >
              Get Started
            </a>
            <a
              href="https://meshspire-core.vercel.app/"
              className="absolute -right-2 flex items-center justify-center
                w-9 h-9 rounded-full bg-[#FFA629] group-hover:bg-[#F09520]
                text-[#0F172A] dark:text-[#F5F7FA]
                transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)]
                translate-x-0 scale-0 opacity-0
                group-hover:translate-x-[105%] group-hover:scale-100 group-hover:opacity-100"
            >
              <ArrowRight size={15} strokeWidth={2.5} />
            </a>
          </div>
        </div>
      </div>
    </nav>
    </>
  );
}
