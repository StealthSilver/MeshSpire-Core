"use client";

import { useEffect, useState } from "react";

export default function ThemeHeadIcons() {
  const [mounted, setMounted] = useState(false);
  const [theme, setTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    setMounted(true);

    const html = document.documentElement;

    setTheme(html.classList.contains("dark") ? "dark" : "light");

    const observer = new MutationObserver(() => {
      setTheme(html.classList.contains("dark") ? "dark" : "light");
    });

    observer.observe(html, { attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, []);

  if (!mounted) return null;

  const icon = theme === "dark" ? "/logos/logo_l.svg" : "/logos/logo_d.svg";

  return (
    <>
      <link rel="icon" href={icon} />
      <link rel="apple-touch-icon" href={icon} />
    </>
  );
}
