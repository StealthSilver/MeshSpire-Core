"use client";

import { useEffect, useState, useCallback } from "react";
import { useTheme } from "next-themes";
import { Sun, Moon } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import soundManager from "@/lib/SoundManagement";

export default function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const handleToggle = useCallback(() => {
    soundManager.playClick();
    setTheme(resolvedTheme === "dark" ? "light" : "dark");
  }, [resolvedTheme, setTheme]);

  if (!mounted) {
    return (
      <button
        aria-label="Toggle theme"
        className="rounded-full border px-2 py-2 opacity-70 cursor-wait bg-[var(--background)] border-[var(--foreground)]"
        disabled
      >
        <Moon size={16} className="text-[var(--color-font)]" />
      </button>
    );
  }

  const isDark = resolvedTheme === "dark";

  return (
    <button
      onClick={handleToggle}
      aria-label={`Switch to ${isDark ? "light" : "dark"} theme`}
      title={`Switch to ${isDark ? "light" : "dark"} theme`}
      className="
    relative inline-flex items-center justify-center gap-2 rounded-full border px-2 py-2 text-sm font-mono
    transition-colors
    bg-[var(--background)] text-[var(--color-font)] border-[var(--foreground)]
    hover:bg-[var(--foreground)] hover:text-[var(--background)]
  "
    >
      <AnimatePresence mode="wait" initial={false}>
        {isDark ? (
          <motion.span className="inline-flex items-center gap-2">
            <Moon size={16} />
          </motion.span>
        ) : (
          <motion.span key="sun" className="inline-flex items-center gap-2">
            <Sun size={16} />
          </motion.span>
        )}
      </AnimatePresence>
    </button>
  );
}
