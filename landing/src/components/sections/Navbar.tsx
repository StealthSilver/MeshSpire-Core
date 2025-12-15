"use client";

import { useState, useEffect } from "react";
import { Menu, X, Github } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import ThemeToggle from "../ui/ThemeToggle";
import { useTheme } from "next-themes";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [hovered, setHovered] = useState<string | null>(null);
  const { theme } = useTheme();

  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const toggleMenu = () => setIsOpen((v) => !v);

  const navItems = [
    { name: "Services", href: "#services" },
    { name: "Features", href: "#features" },
    { name: "Testimonial", href: "#testimonials" },
    { name: "Contact us", href: "#footer" },
  ];

  return (
    <nav
      className="
      w-full sticky top-0 z-50 px-4 sm:px-6 py-4
      border-b border-[var(--foreground)]/90
      bg-[var(--background)]/70 backdrop-blur-md
      text-[var(--color-font)]
      transition-colors duration-300
    "
    >
      <div className="flex items-center justify-between max-w-7xl mx-auto w-full">
        <Link href="/" className="flex items-center cursor-pointer">
          <motion.img
            key={mounted ? theme : "default"}
            src={
              !mounted
                ? "/logo_dark.svg"
                : theme === "dark"
                ? "/logo_dark.svg"
                : "/logo_light.svg"
            }
            alt="Meshspire logo"
            className="w-28 h-auto sm:w-32 md:w-36"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          />
        </Link>

        <div
          className="hidden md:flex items-center px-2 font-[var(--font-secondary)] relative gap-6"
          onMouseLeave={() => setHovered(null)}
        >
          {navItems.map((item) => (
            <div key={item.name} className="relative px-3 py-1.5 select-none">
              {hovered === item.name && (
                <motion.span
                  layoutId="hoverBg"
                  className="
                    absolute inset-0 rounded-full backdrop-blur-sm
                    bg-[var(--foreground)]/10 border border-[var(--foreground)]/20
                  "
                  transition={{
                    type: "spring",
                    stiffness: 500,
                    damping: 40,
                    mass: 0.6,
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
                  relative z-10 transition-colors
                  text-[var(--color-font)]/80 hover:text-[var(--color-font)]
                "
              >
                {item.name}
              </Link>
            </div>
          ))}
        </div>

        <div className="hidden md:flex items-center gap-6 font-mono">
          <ThemeToggle />

          <a
            href="https://meshspire-core.vercel.app/"
            className="font-[var(--font-secondary)]
  bg-[var(--color-primary)] text-[var(--background)] dark:text-[var(--foreground)] border border-transparent rounded-full px-6 py-1.5
  transition duration-300 hover:bg-[var(--background)] hover:text-[var(--color-font)] hover:border-[var(--foreground)]
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
            className="p-1.5 rounded-md"
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {isOpen && (
        <div
          className="
      md:hidden bg-[var(--background)]/95 backdrop-blur-md shadow-lg 
      border-t border-[var(--foreground)]/20 transition-colors duration-300
      font-[var(--font-secondary)]
    "
        >
          <div className="flex flex-col items-center space-y-5 py-10">
            {navItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="
            transition-colors text-[var(--color-font)] hover:text-[var(--foreground)]
          "
                onClick={() => setIsOpen(false)}
              >
                {item.name}
              </Link>
            ))}

            <a
              href="#footer"
              className="
          rounded-full border px-6 py-1.5 transition-colors
          bg-[var(--color-primary)] text-[var(--background)] dark:text-[var(--foreground)] border-[var(--color-primary)]
          hover:bg-[var(--background)] hover:text-[var(--color-font)] hover:border-[var(--foreground)]
          font-[var(--font-secondary)]
        "
              onClick={() => setIsOpen(false)}
            >
              Connect
            </a>
          </div>
        </div>
      )}
    </nav>
  );
}
