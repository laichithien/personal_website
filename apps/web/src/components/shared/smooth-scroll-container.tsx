"use client";

import { useEffect, useRef, useState, useCallback, type ReactNode } from "react";

interface SmoothScrollContainerProps {
  children: ReactNode;
  className?: string;
  duration?: number; // scroll duration in ms
}

// Custom event for section change
export const SECTION_CHANGE_EVENT = "sectionChange";

export function SmoothScrollContainer({
  children,
  className = "",
  duration = 1200,
}: SmoothScrollContainerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isScrolling, setIsScrolling] = useState(false);
  const [currentSection, setCurrentSection] = useState(0);
  const [isScrollDisabled, setIsScrollDisabled] = useState(false);
  const currentSectionRef = useRef(currentSection);
  const isScrollingRef = useRef(isScrolling);
  const isScrollDisabledRef = useRef(isScrollDisabled);
  const sectionsRef = useRef<HTMLElement[]>([]);

  // Keep refs in sync
  useEffect(() => {
    currentSectionRef.current = currentSection;
  }, [currentSection]);

  useEffect(() => {
    isScrollingRef.current = isScrolling;
  }, [isScrolling]);

  useEffect(() => {
    isScrollDisabledRef.current = isScrollDisabled;
  }, [isScrollDisabled]);

  // Listen for widget expand state changes to disable/enable scrolling
  useEffect(() => {
    const handleWidgetExpandState = (e: Event) => {
      const customEvent = e as CustomEvent<{ expanded: boolean }>;
      setIsScrollDisabled(customEvent.detail.expanded);
    };

    window.addEventListener("widgetExpandStateChange", handleWidgetExpandState);
    return () => window.removeEventListener("widgetExpandStateChange", handleWidgetExpandState);
  }, []);

  // Dispatch custom event when section changes
  const dispatchSectionChange = useCallback((sectionId: string, index: number) => {
    window.dispatchEvent(
      new CustomEvent(SECTION_CHANGE_EVENT, {
        detail: { sectionId, index },
      })
    );
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Get all section elements
    sectionsRef.current = Array.from(container.querySelectorAll("section[id]"));
    const sections = sectionsRef.current;
    const totalSections = sections.length;

    let lastScrollTime = 0;
    const scrollCooldown = duration + 100; // Prevent rapid scrolling

    const smoothScrollTo = (targetSection: number) => {
      if (isScrolling || targetSection < 0 || targetSection >= totalSections) return;

      const target = sections[targetSection];
      if (!target) return;

      setIsScrolling(true);
      setCurrentSection(targetSection);

      // Dispatch section change event
      dispatchSectionChange(target.id, targetSection);

      const start = container.scrollTop;
      const end = target.offsetTop;
      const distance = end - start;
      const startTime = performance.now();

      const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);

      const animateScroll = (currentTime: number) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const eased = easeOutCubic(progress);

        container.scrollTop = start + distance * eased;

        if (progress < 1) {
          requestAnimationFrame(animateScroll);
        } else {
          setIsScrolling(false);
        }
      };

      requestAnimationFrame(animateScroll);
    };

    const handleWheel = (e: WheelEvent) => {
      // Don't prevent default if widget is expanded (allow scrolling inside modal)
      if (isScrollDisabledRef.current) return;

      e.preventDefault();

      const now = Date.now();
      if (now - lastScrollTime < scrollCooldown) return;
      lastScrollTime = now;

      const direction = e.deltaY > 0 ? 1 : -1;
      const nextSection = currentSection + direction;
      smoothScrollTo(nextSection);
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't handle keyboard navigation when widget is expanded
      if (isScrollDisabledRef.current) return;

      const now = Date.now();
      if (now - lastScrollTime < scrollCooldown) return;

      if (e.key === "ArrowDown" || e.key === "PageDown") {
        e.preventDefault();
        lastScrollTime = now;
        smoothScrollTo(currentSection + 1);
      } else if (e.key === "ArrowUp" || e.key === "PageUp") {
        e.preventDefault();
        lastScrollTime = now;
        smoothScrollTo(currentSection - 1);
      }
    };

    // Touch handling for mobile
    let touchStartY = 0;
    const handleTouchStart = (e: TouchEvent) => {
      // Don't track touch when widget is expanded
      if (isScrollDisabledRef.current) return;
      touchStartY = e.touches[0].clientY;
    };

    const handleTouchEnd = (e: TouchEvent) => {
      // Don't handle touch when widget is expanded
      if (isScrollDisabledRef.current) return;

      const now = Date.now();
      if (now - lastScrollTime < scrollCooldown) return;

      const touchEndY = e.changedTouches[0].clientY;
      const diff = touchStartY - touchEndY;

      if (Math.abs(diff) > 50) {
        lastScrollTime = now;
        const direction = diff > 0 ? 1 : -1;
        smoothScrollTo(currentSection + direction);
      }
    };

    container.addEventListener("wheel", handleWheel, { passive: false });
    container.addEventListener("touchstart", handleTouchStart, { passive: true });
    container.addEventListener("touchend", handleTouchEnd, { passive: true });
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      container.removeEventListener("wheel", handleWheel);
      container.removeEventListener("touchstart", handleTouchStart);
      container.removeEventListener("touchend", handleTouchEnd);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [currentSection, duration, isScrolling, dispatchSectionChange]);

  // Dispatch initial section on mount
  useEffect(() => {
    const sections = sectionsRef.current;
    if (sections.length > 0 && sections[0]) {
      dispatchSectionChange(sections[0].id, 0);
    }
  }, [dispatchSectionChange]);

  // Expose scrollToSection for external navigation (floating dock, scroll buttons)
  useEffect(() => {
    const animateToSection = (index: number) => {
      if (isScrollingRef.current) return;

      const sections = sectionsRef.current;
      const container = containerRef.current;
      const target = sections[index];

      if (!container || !target) return;

      setIsScrolling(true);
      setCurrentSection(index);
      dispatchSectionChange(target.id, index);

      const start = container.scrollTop;
      const end = target.offsetTop;
      const distance = end - start;
      const startTime = performance.now();

      const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);

      const animateScroll = (currentTime: number) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const eased = easeOutCubic(progress);

        container.scrollTop = start + distance * eased;

        if (progress < 1) {
          requestAnimationFrame(animateScroll);
        } else {
          setIsScrolling(false);
        }
      };

      requestAnimationFrame(animateScroll);
    };

    const handleHashChange = () => {
      const hash = window.location.hash.slice(1);
      const sections = sectionsRef.current;
      const index = sections.findIndex((s) => s.id === hash);

      if (index !== -1 && index !== currentSectionRef.current) {
        animateToSection(index);
      }
    };

    // Also handle direct navigation calls via custom event
    const handleNavigate = (e: Event) => {
      const customEvent = e as CustomEvent<{ sectionId: string }>;
      const { sectionId } = customEvent.detail;
      const sections = sectionsRef.current;
      const index = sections.findIndex((s) => s.id === sectionId);

      if (index !== -1) {
        animateToSection(index);
      }
    };

    window.addEventListener("hashchange", handleHashChange);
    window.addEventListener("navigateToSection", handleNavigate);

    return () => {
      window.removeEventListener("hashchange", handleHashChange);
      window.removeEventListener("navigateToSection", handleNavigate);
    };
  }, [duration, dispatchSectionChange]);

  return (
    <div
      ref={containerRef}
      className={`h-screen overflow-hidden ${className}`}
    >
      {children}
    </div>
  );
}
