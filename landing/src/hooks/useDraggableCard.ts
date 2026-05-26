"use client";

import { useState, useRef, useEffect, useCallback } from "react";

interface Position {
  x: number;
  y: number;
}

interface Bounds {
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
}

export function useDraggableCard(initialPos: Position, bounds?: Bounds) {
  const [pos, setPos] = useState<Position>(initialPos);
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef({ mx: 0, my: 0, cx: 0, cy: 0 });
  const dragDelta = useRef({ dx: 0, dy: 0 });
  const boundsRef = useRef(bounds);
  boundsRef.current = bounds;

  const clamp = useCallback((newPos: Position): Position => {
    const b = boundsRef.current;
    if (!b) return newPos;
    return {
      x: Math.max(b.minX, Math.min(b.maxX, newPos.x)),
      y: Math.max(b.minY, Math.min(b.maxY, newPos.y)),
    };
  }, []);

  const onPointerDown = useCallback(
    (e: React.PointerEvent) => {
      e.preventDefault();
      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
      setIsDragging(true);
      dragStart.current = {
        mx: e.clientX,
        my: e.clientY,
        cx: pos.x,
        cy: pos.y,
      };
      dragDelta.current = { dx: 0, dy: 0 };
    },
    [pos.x, pos.y]
  );

  useEffect(() => {
    if (!isDragging) return;

    const onMove = (e: PointerEvent) => {
      const dx = e.clientX - dragStart.current.mx;
      const dy = e.clientY - dragStart.current.my;
      dragDelta.current = { dx, dy };
      const raw = {
        x: dragStart.current.cx + dx,
        y: dragStart.current.cy + dy,
      };
      setPos(clamp(raw));
    };

    const onUp = () => setIsDragging(false);

    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };
  }, [isDragging, clamp]);

  const wasClick = useCallback(
    () =>
      Math.abs(dragDelta.current.dx) < 5 &&
      Math.abs(dragDelta.current.dy) < 5,
    []
  );

  return { pos, isDragging, onPointerDown, wasClick };
}
