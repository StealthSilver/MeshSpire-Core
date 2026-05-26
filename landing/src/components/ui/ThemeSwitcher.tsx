"use client"

import type { JSX } from "react"
import { useSyncExternalStore } from "react"
import { motion } from "framer-motion"
import { useTheme } from "next-themes"
import { MonitorIcon, SunIcon, MoonIcon } from "lucide-react"

function ThemeOption({
  icon,
  value,
  isActive,
  onClick,
}: {
  icon: JSX.Element
  value: string
  isActive?: boolean
  onClick: (value: string) => void
}) {
  return (
    <button
      data-active={isActive}
      className={`
        relative flex size-8 items-center justify-center rounded-full
        transition-[color] duration-200
        [&_svg]:size-4
        ${isActive
          ? "text-[#0F172A] dark:text-[#F5F7FA]"
          : "text-[#0F172A]/40 dark:text-[#F5F7FA]/40 hover:text-[#0F172A]/70 dark:hover:text-[#F5F7FA]/70"
        }
      `}
      role="radio"
      aria-checked={isActive}
      aria-label={`Switch to ${value} theme`}
      onClick={() => onClick(value)}
    >
      {icon}

      {isActive && (
        <motion.span
          layoutId="theme-option"
          transition={{ type: "spring", bounce: 0.3, duration: 0.6 }}
          className="absolute inset-0 rounded-full border border-[var(--foreground)]/20"
        />
      )}
    </button>
  )
}

const THEME_OPTIONS = [
  {
    icon: <MonitorIcon />,
    value: "system",
  },
  {
    icon: <SunIcon />,
    value: "light",
  },
  {
    icon: <MoonIcon />,
    value: "dark",
  },
]

function ThemeSwitcher() {
  const { theme, setTheme } = useTheme()

  const isMounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  )

  if (!isMounted) {
    return <div className="flex h-8 w-24" />
  }

  return (
    <motion.div
      key={String(isMounted)}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="inline-flex items-center overflow-hidden rounded-full bg-[var(--background)] ring-1 ring-[var(--foreground)]/15"
      role="radiogroup"
    >
      {THEME_OPTIONS.map((option) => (
        <ThemeOption
          key={option.value}
          icon={option.icon}
          value={option.value}
          isActive={theme === option.value}
          onClick={setTheme}
        />
      ))}
    </motion.div>
  )
}

export { ThemeSwitcher }
