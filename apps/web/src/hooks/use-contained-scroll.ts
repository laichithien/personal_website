"use client";

import { RefObject, useEffect, useRef } from "react";

function isScrollable(element: HTMLElement) {
  return element.scrollHeight > element.clientHeight;
}

export function useContainedScroll<T extends HTMLElement>(containerRef: RefObject<T | null>) {
  const lastTouchYRef = useRef<number | null>(null);
  const targetScrollTopRef = useRef<number | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const stopAnimation = () => {
      if (animationFrameRef.current != null) {
        window.cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
    };

    const animateScroll = () => {
      const target = targetScrollTopRef.current;
      if (target == null) {
        animationFrameRef.current = null;
        return;
      }

      const distance = target - container.scrollTop;
      if (Math.abs(distance) < 0.5) {
        container.scrollTop = target;
        targetScrollTopRef.current = null;
        animationFrameRef.current = null;
        return;
      }

      container.scrollTop += distance * 0.18;
      animationFrameRef.current = window.requestAnimationFrame(animateScroll);
    };

    const queueSmoothScroll = (deltaY: number) => {
      const maxScrollTop = Math.max(0, container.scrollHeight - container.clientHeight);
      const currentTarget = targetScrollTopRef.current ?? container.scrollTop;
      targetScrollTopRef.current = Math.min(maxScrollTop, Math.max(0, currentTarget + deltaY));

      if (animationFrameRef.current == null) {
        animationFrameRef.current = window.requestAnimationFrame(animateScroll);
      }
    };

    const handleWheel = (event: WheelEvent) => {
      if (!isScrollable(container)) return;

      const isAtTop = container.scrollTop <= 0;
      const isAtBottom = container.scrollTop + container.clientHeight >= container.scrollHeight - 1;
      const scrollingUp = event.deltaY < 0;
      const scrollingDown = event.deltaY > 0;

      if ((isAtTop && scrollingUp) || (isAtBottom && scrollingDown)) {
        event.preventDefault();
        event.stopPropagation();
        return;
      }

      event.preventDefault();
      event.stopPropagation();
      queueSmoothScroll(event.deltaY);
    };

    const handleTouchStart = (event: TouchEvent) => {
      stopAnimation();
      targetScrollTopRef.current = null;
      lastTouchYRef.current = event.touches[0]?.clientY ?? null;
    };

    const handleTouchMove = (event: TouchEvent) => {
      const currentY = event.touches[0]?.clientY;
      if (currentY == null || lastTouchYRef.current == null) return;

      const deltaY = lastTouchYRef.current - currentY;
      lastTouchYRef.current = currentY;

      if (!isScrollable(container)) {
        event.preventDefault();
        return;
      }

      const isAtTop = container.scrollTop <= 0;
      const isAtBottom = container.scrollTop + container.clientHeight >= container.scrollHeight - 1;
      const scrollingUp = deltaY < 0;
      const scrollingDown = deltaY > 0;

      if ((isAtTop && scrollingUp) || (isAtBottom && scrollingDown)) {
        event.preventDefault();
        event.stopPropagation();
        return;
      }

      event.stopPropagation();
    };

    container.addEventListener("wheel", handleWheel, { passive: false });
    container.addEventListener("touchstart", handleTouchStart, { passive: true });
    container.addEventListener("touchmove", handleTouchMove, { passive: false });

    return () => {
      stopAnimation();
      container.removeEventListener("wheel", handleWheel);
      container.removeEventListener("touchstart", handleTouchStart);
      container.removeEventListener("touchmove", handleTouchMove);
    };
  }, [containerRef]);
}
