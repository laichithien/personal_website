"use client";

import { RefObject, useEffect, useRef } from "react";

export function useContainedScroll<T extends HTMLElement>(containerRef: RefObject<T | null>) {
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const shouldLockHorizontalSwipe = container.dataset.lockHorizontalSwipe !== "false";

    const previousOverscrollBehaviorY = container.style.overscrollBehaviorY;
    const previousTouchAction = container.style.touchAction;
    const previousWebkitOverflowScrolling = (container.style as any).webkitOverflowScrolling;

    // Native scrolling is smoother and avoids wheel/touch hijacking.
    container.style.overscrollBehaviorY = "contain";
    container.style.touchAction = shouldLockHorizontalSwipe ? "pan-y" : "pan-x pan-y";
    (container.style as any).webkitOverflowScrolling = "touch";

    const handleTouchStart = (event: TouchEvent) => {
      const touch = event.touches[0];
      if (!touch) return;

      touchStartRef.current = {
        x: touch.clientX,
        y: touch.clientY,
      };
    };

    const handleTouchMove = (event: TouchEvent) => {
      if (!touchStartRef.current) return;

      const touch = event.touches[0];
      if (!touch) return;

      const deltaX = touch.clientX - touchStartRef.current.x;
      const deltaY = touch.clientY - touchStartRef.current.y;
      const isHorizontalGesture = Math.abs(deltaX) > Math.abs(deltaY) * 1.1;

      // Nested scroll areas should own touch interactions.
      // Vertical gestures scroll naturally inside the area.
      // Horizontal gestures should not leak to the parent section carousel.
      if (shouldLockHorizontalSwipe && isHorizontalGesture) {
        event.preventDefault();
        event.stopPropagation();
        return;
      }

      if (!shouldLockHorizontalSwipe && isHorizontalGesture) {
        return;
      }

      event.stopPropagation();
    };

    const handleTouchEnd = () => {
      touchStartRef.current = null;
    };

    container.addEventListener("touchstart", handleTouchStart, { passive: true });
    container.addEventListener("touchmove", handleTouchMove, { passive: false });
    container.addEventListener("touchend", handleTouchEnd, { passive: true });
    container.addEventListener("touchcancel", handleTouchEnd, { passive: true });

    return () => {
      container.style.overscrollBehaviorY = previousOverscrollBehaviorY;
      container.style.touchAction = previousTouchAction;
      (container.style as any).webkitOverflowScrolling = previousWebkitOverflowScrolling;
      container.removeEventListener("touchstart", handleTouchStart);
      container.removeEventListener("touchmove", handleTouchMove);
      container.removeEventListener("touchend", handleTouchEnd);
      container.removeEventListener("touchcancel", handleTouchEnd);
    };
  }, [containerRef]);
}
