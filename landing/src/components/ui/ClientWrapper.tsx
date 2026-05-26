"use client";

import { useEffect, useState } from "react";
import Loader from "./Loader";
import SmoothScroll from "./SmoothScroll";

export default function ClientWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const handleLoad = () => setLoading(false);

    if (document.readyState === "complete") {
      setLoading(false);
    } else {
      window.addEventListener("load", handleLoad);
      return () => window.removeEventListener("load", handleLoad);
    }
  }, []);

  return <>{loading ? <Loader /> : <SmoothScroll>{children}</SmoothScroll>}</>;
}
