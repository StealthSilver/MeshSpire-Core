"use client";

import { useEffect, useState } from "react";
import Loader from "./Loader";
import SmoothScroll from "./SmoothScroll";

const LOADER_MAX_MS = 650;

export default function ClientWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let done = false;
    const finish = () => {
      if (done) return;
      done = true;
      setLoading(false);
    };

    const cap = window.setTimeout(finish, LOADER_MAX_MS);

    if (document.readyState !== "loading") {
      requestAnimationFrame(finish);
    } else {
      document.addEventListener("DOMContentLoaded", finish, { once: true });
    }

    return () => {
      window.clearTimeout(cap);
      document.removeEventListener("DOMContentLoaded", finish);
    };
  }, []);

  return <>{loading ? <Loader /> : <SmoothScroll>{children}</SmoothScroll>}</>;
}
