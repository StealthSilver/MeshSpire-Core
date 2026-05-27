"use client";

import { useEffect, useState } from "react";
import Loader from "./Loader";
import SmoothScroll from "./SmoothScroll";

/** Show loader long enough for the ripple to read; cap so slow networks are not stuck */
const LOADER_MIN_MS = 1100;
const LOADER_MAX_MS = 2400;

export default function ClientWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let done = false;
    const started = Date.now();
    let minTimer = 0;
    let maxTimer = 0;

    const hide = () => {
      if (done) return;
      done = true;
      setLoading(false);
    };

    const scheduleHide = () => {
      const elapsed = Date.now() - started;
      const wait = Math.max(0, LOADER_MIN_MS - elapsed);
      window.clearTimeout(minTimer);
      minTimer = window.setTimeout(hide, wait);
    };

    maxTimer = window.setTimeout(hide, LOADER_MAX_MS);

    if (document.readyState !== "loading") {
      scheduleHide();
    } else {
      document.addEventListener("DOMContentLoaded", scheduleHide, { once: true });
    }

    return () => {
      window.clearTimeout(minTimer);
      window.clearTimeout(maxTimer);
      document.removeEventListener("DOMContentLoaded", scheduleHide);
    };
  }, []);

  return <>{loading ? <Loader /> : <SmoothScroll>{children}</SmoothScroll>}</>;
}
