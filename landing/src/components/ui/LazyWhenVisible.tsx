"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

type LazyWhenVisibleProps = {
  children: ReactNode;
  rootMargin?: string;
  className?: string;
  placeholderClassName?: string;
};

/** Mount children only after the slot enters (or nears) the viewport. */
export default function LazyWhenVisible({
  children,
  rootMargin = "120px 0px",
  className,
  placeholderClassName,
}: LazyWhenVisibleProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || visible) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return;
        setVisible(true);
        observer.disconnect();
      },
      { rootMargin },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [visible, rootMargin]);

  return (
    <div ref={ref} className={className}>
      {visible ? (
        children
      ) : (
        <div
          className={placeholderClassName ?? "h-full w-full min-h-[inherit]"}
          aria-hidden
        />
      )}
    </div>
  );
}
