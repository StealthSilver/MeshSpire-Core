"use client";

import { useSyncExternalStore } from "react";
import { useIsDark } from "@/hooks/useIsDark";

export default function ThemeHeadIcons() {
  const isDark = useIsDark();
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );

  if (!mounted) return null;

  const icon = isDark ? "/logos/logo_l.svg" : "/logos/logo_d.svg";

  return (
    <>
      <link rel="icon" href={icon} />
      <link rel="apple-touch-icon" href={icon} />
    </>
  );
}
