"use client";

import { useTheme } from "next-themes";
import { useSyncExternalStore } from "react";

function subscribeToHtmlClass(callback: () => void) {
  const observer = new MutationObserver(callback);
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["class"],
  });
  return () => observer.disconnect();
}

function getDarkFromDocument(): boolean {
  return document.documentElement.classList.contains("dark");
}

/**
 * True when the active appearance is dark.
 * Uses resolvedTheme (handles "system") and falls back to the html `.dark` class.
 */
export function useIsDark(): boolean {
  const { resolvedTheme } = useTheme();

  const domIsDark = useSyncExternalStore(
    subscribeToHtmlClass,
    getDarkFromDocument,
    () => false,
  );

  if (resolvedTheme === "dark") return true;
  if (resolvedTheme === "light") return false;
  return domIsDark;
}
