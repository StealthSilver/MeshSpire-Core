"use client";

import { useRef, useCallback, useEffect } from "react";

interface Offset {
  x: number;
  y: number;
}

interface UseDragOptions {
  onOffsetChange: (offset: Offset) => void;
  friction?: number;
  minVelocity?: number;
}

export function useDrag({ onOffsetChange, friction = 0.92, minVelocity = 0.5 }: UseDragOptions) {
  const isDragging = useRef(false);
  const lastPos = useRef({ x: 0, y: 0 });
  const offset = useRef<Offset>({ x: 0, y: 0 });
  const velocity = useRef({ x: 0, y: 0 });
  const rafId = useRef<number | null>(null);
  const lastTime = useRef(0);

  const pendingFrame = useRef<number | null>(null);

  const stopMomentum = useCallback(() => {
    if (rafId.current !== null) {
      cancelAnimationFrame(rafId.current);
      rafId.current = null;
    }
  }, []);

  const flushOffset = useCallback(() => {
    pendingFrame.current = null;
    onOffsetChange({ ...offset.current });
  }, [onOffsetChange]);

  const scheduleOffsetFlush = useCallback(() => {
    if (pendingFrame.current !== null) return;
    pendingFrame.current = requestAnimationFrame(flushOffset);
  }, [flushOffset]);

  const startMomentum = useCallback(() => {
    stopMomentum();

    const tick = () => {
      velocity.current.x *= friction;
      velocity.current.y *= friction;

      if (Math.abs(velocity.current.x) < minVelocity && Math.abs(velocity.current.y) < minVelocity) {
        rafId.current = null;
        flushOffset();
        return;
      }

      offset.current.x += velocity.current.x;
      offset.current.y += velocity.current.y;
      scheduleOffsetFlush();

      rafId.current = requestAnimationFrame(tick);
    };

    rafId.current = requestAnimationFrame(tick);
  }, [friction, minVelocity, flushOffset, scheduleOffsetFlush, stopMomentum]);

  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      stopMomentum();
      isDragging.current = true;
      lastPos.current = { x: e.clientX, y: e.clientY };
      lastTime.current = performance.now();
      velocity.current = { x: 0, y: 0 };
      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    },
    [stopMomentum],
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!isDragging.current) return;

      const now = performance.now();
      const dt = Math.max(now - lastTime.current, 1);
      const dx = e.clientX - lastPos.current.x;
      const dy = e.clientY - lastPos.current.y;

      const smoothing = 0.4;
      velocity.current.x = velocity.current.x * (1 - smoothing) + (dx / dt) * 16 * smoothing;
      velocity.current.y = velocity.current.y * (1 - smoothing) + (dy / dt) * 16 * smoothing;

      offset.current.x += dx;
      offset.current.y += dy;
      scheduleOffsetFlush();

      lastPos.current = { x: e.clientX, y: e.clientY };
      lastTime.current = now;
    },
    [scheduleOffsetFlush],
  );

  const handlePointerUp = useCallback(() => {
    if (!isDragging.current) return;
    isDragging.current = false;
    startMomentum();
  }, [startMomentum]);

  useEffect(() => {
    return () => {
      stopMomentum();
      if (pendingFrame.current !== null) {
        cancelAnimationFrame(pendingFrame.current);
      }
    };
  }, [stopMomentum]);

  return {
    isDragging,
    handlers: {
      onPointerDown: handlePointerDown,
      onPointerMove: handlePointerMove,
      onPointerUp: handlePointerUp,
      onPointerLeave: handlePointerUp,
    },
  };
}
