"use client";

import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import ThemeToggle from "../ui/ThemeToggle";
import { useTheme } from "next-themes";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
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

  const toggleMenu = () => setIsOpen((v) => !v);

  const navItems = [
    { name: "Services", href: "#services" },
    { name: "Features", href: "#features" },
    { name: "Testimonial", href: "#testimonials" },
    { name: "Contact us", href: "#footer" },
  ];

  return (
    <nav
      className={`
        w-full sticky top-0 z-50 px-4 sm:px-6 py-3
        bg-[var(--background)]/70 backdrop-blur-xl
        text-[var(--color-font)]
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
            className="w-28 h-auto sm:w-32 md:w-36 transition-opacity duration-300 group-hover:opacity-80"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
          />
        </Link>

        <div
          className="hidden md:flex items-center font-[var(--font-secondary)] relative gap-1 rounded-full bg-[var(--foreground)]/[0.04] px-1.5 py-1.5"
          onMouseLeave={() => setHovered(null)}
        >
          {navItems.map((item) => (
            <div key={item.name} className="relative px-4 py-1.5 select-none">
              {hovered === item.name && (
                <motion.span
                  layoutId="navHover"
                  className="absolute inset-0 rounded-full bg-[var(--foreground)]/[0.08]"
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
                  relative z-10 text-sm
                  text-[var(--color-font)]/70 hover:text-[var(--color-font)]
                  transition-colors duration-300
                "
              >
                {item.name}
              </Link>
            </div>
          ))}
        </div>

        <div className="hidden md:flex items-center gap-4">
          <ThemeToggle />

          <a
            href="https://meshspire-core.vercel.app/"
            className="
              font-[var(--font-secondary)] text-sm font-medium
              bg-[#FFA629] text-[#0F172A]
              rounded-full px-6 py-2
              transition-all duration-300
              hover:brightness-110 hover:shadow-[0_4px_20px_rgba(255,166,41,0.35)]
            "
          >
            Get Started
          </a>
        </div>

        <div className="md:hidden flex items-center gap-3">
          <div className="scale-90">
            <ThemeToggle />
          </div>

          <button
            onClick={toggleMenu}
            aria-label={isOpen ? "Close menu" : "Open menu"}
            className="p-2 rounded-xl hover:bg-[var(--foreground)]/[0.06] transition-colors duration-200"
          >
            {isOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="md:hidden overflow-hidden"
          >
            <div
              className="
                mt-3 pt-4 pb-6
                border-t border-[var(--foreground)]/10
                font-[var(--font-secondary)]
              "
            >
              <div className="flex flex-col items-center gap-1">
                {navItems.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className="
                      w-full text-center py-3 px-6 rounded-xl
                      text-[var(--color-font)]/70
                      text-sm
                      hover:bg-[var(--foreground)]/[0.06] hover:text-[var(--color-font)]
                      transition-all duration-200
                    "
                    onClick={() => setIsOpen(false)}
                  >
                    {item.name}
                  </Link>
                ))}

                <a
                  href="https://meshspire-core.vercel.app/"
                  className="
                    mt-3 rounded-full px-8 py-2.5 text-sm font-medium
                    bg-[#FFA629] text-[#0F172A]
                    transition-all duration-300
                    hover:brightness-110 hover:shadow-[0_4px_20px_rgba(255,166,41,0.35)]
                    font-[var(--font-secondary)]
                  "
                  onClick={() => setIsOpen(false)}
                >
                  Get Started
                </a>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
