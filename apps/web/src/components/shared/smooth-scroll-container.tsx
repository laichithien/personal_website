"use client";

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { NAVIGATE_TO_SECTION_EVENT } from "@/lib/navigation-events";

interface SmoothScrollContainerProps {
  children: ReactNode;
  className?: string;
  duration?: number;
}

export const SECTION_CHANGE_EVENT = "sectionChange";

export function SmoothScrollContainer({
  children,
  className = "",
  duration = 720,
}: SmoothScrollContainerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const sectionsRef = useRef<HTMLElement[]>([]);
  const [currentSection, setCurrentSection] = useState(0);
  const [isMobileLayout, setIsMobileLayout] = useState(false);
  const currentSectionRef = useRef(currentSection);
  const scrollFrameRef = useRef<number | null>(null);
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);

  const isHorizontalMobile = useCallback(
    () => window.matchMedia("(max-width: 767px), (pointer: coarse)").matches,
    []
  );

  useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 767px), (pointer: coarse)");
    const updateLayout = () => setIsMobileLayout(mediaQuery.matches);

    updateLayout();
    mediaQuery.addEventListener("change", updateLayout);
    return () => mediaQuery.removeEventListener("change", updateLayout);
  }, []);

  useEffect(() => {
    currentSectionRef.current = currentSection;
  }, [currentSection]);

  const dispatchSectionChange = useCallback((sectionId: string, index: number) => {
    window.dispatchEvent(
      new CustomEvent(SECTION_CHANGE_EVENT, {
        detail: { sectionId, index },
      })
    );
  }, []);

  const scrollToSection = useCallback(
    (sectionId: string) => {
      const container = containerRef.current;
      const sections = sectionsRef.current;
      if (!container || sections.length === 0) return;

      const targetIndex = sections.findIndex((section) => section.id === sectionId);
      if (targetIndex === -1) return;

      const targetSection = sections[targetIndex];
      if (!targetSection) return;

      setCurrentSection(targetIndex);
      dispatchSectionChange(targetSection.id, targetIndex);

      container.scrollTo({
        top: isHorizontalMobile() ? 0 : targetSection.offsetTop,
        left: isHorizontalMobile() ? targetSection.offsetLeft : 0,
        behavior: "smooth",
      });
    },
    [dispatchSectionChange, isHorizontalMobile]
  );

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let observer: IntersectionObserver | null = null;

    const collectVisibleSections = () =>
      Array.from(container.querySelectorAll("section[id]")).filter(
        (section) => section.getClientRects().length > 0
      );

    const findClosestSectionIndex = (sections: HTMLElement[]) => {
      if (sections.length === 0) return -1;

      const containerPosition = isMobileLayout ? container.scrollLeft : container.scrollTop;
      let closestIndex = 0;
      let closestDistance = Number.POSITIVE_INFINITY;

      sections.forEach((section, index) => {
        const sectionPosition = isMobileLayout ? section.offsetLeft : section.offsetTop;
        const distance = Math.abs(sectionPosition - containerPosition);

        if (distance < closestDistance) {
          closestDistance = distance;
          closestIndex = index;
        }
      });

      return closestIndex;
    };

    const syncActiveSectionFromScroll = () => {
      const sections = sectionsRef.current;
      if (sections.length === 0) return;

      const activeIndex = findClosestSectionIndex(sections);
      if (activeIndex === -1 || activeIndex === currentSectionRef.current) return;

      const activeSection = sections[activeIndex];
      if (!activeSection) return;

      setCurrentSection(activeIndex);
      dispatchSectionChange(activeSection.id, activeIndex);
    };

    const syncSections = () => {
      observer?.disconnect();

      sectionsRef.current = collectVisibleSections();
      const sections = sectionsRef.current;
      if (sections.length === 0) return;

      const activeIndex = findClosestSectionIndex(sections);
      const activeSection = sections[activeIndex];
      if (activeSection) {
        setCurrentSection(activeIndex);
        dispatchSectionChange(activeSection.id, activeIndex);
      }

      observer = new IntersectionObserver(
        (entries) => {
          const visibleEntry = entries
            .filter((entry) => entry.isIntersecting)
            .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

          if (!visibleEntry) return;

          const index = sections.findIndex((section) => section.id === visibleEntry.target.id);
          if (index === -1 || index === currentSectionRef.current) return;

          setCurrentSection(index);
          dispatchSectionChange(visibleEntry.target.id, index);
        },
        {
          root: container,
          threshold: [0.4, 0.6, 0.8],
        }
      );

      sections.forEach((section) => observer?.observe(section));
    };

    const handleScroll = () => {
      if (scrollFrameRef.current !== null) return;

      scrollFrameRef.current = window.requestAnimationFrame(() => {
        scrollFrameRef.current = null;
        console.log("[GESTURE][root-carousel] scroll", {
          left: container.scrollLeft,
          top: container.scrollTop,
          isMobileLayout,
        });
        syncActiveSectionFromScroll();
      });
    };

    const handleTouchStart = (event: TouchEvent) => {
      const touch = event.touches[0];
      if (!touch) return;

      touchStartRef.current = {
        x: touch.clientX,
        y: touch.clientY,
      };
    };

    const handleTouchMove = (event: TouchEvent) => {
      if (!isMobileLayout || !touchStartRef.current) return;

      const touch = event.touches[0];
      if (!touch) return;

      const deltaX = touch.clientX - touchStartRef.current.x;
      const deltaY = touch.clientY - touchStartRef.current.y;

      if (Math.abs(deltaX) > Math.abs(deltaY) * 1.15) {
        event.preventDefault();
      }
    };

    const handleTouchEnd = (event: TouchEvent) => {
      if (!isMobileLayout || !touchStartRef.current) {
        touchStartRef.current = null;
        return;
      }

      const touch = event.changedTouches[0];
      if (!touch) {
        touchStartRef.current = null;
        return;
      }

      const deltaX = touch.clientX - touchStartRef.current.x;
      const deltaY = touch.clientY - touchStartRef.current.y;
      touchStartRef.current = null;

      if (Math.abs(deltaX) < 72 || Math.abs(deltaX) <= Math.abs(deltaY) * 1.15) return;

      const sections = sectionsRef.current;
      if (sections.length === 0) return;

      const direction = deltaX < 0 ? 1 : -1;
      const targetIndex = Math.min(
        sections.length - 1,
        Math.max(0, currentSectionRef.current + direction)
      );

      if (targetIndex === currentSectionRef.current) return;

      const targetSection = sections[targetIndex];
      if (!targetSection) return;

      scrollToSection(targetSection.id);
      window.history.pushState(null, "", `#${targetSection.id}`);
    };

    syncSections();
    container.addEventListener("scroll", handleScroll, { passive: true });
    container.addEventListener("touchstart", handleTouchStart, { passive: true });
    container.addEventListener("touchmove", handleTouchMove, { passive: false });
    container.addEventListener("touchend", handleTouchEnd, { passive: true });
    window.addEventListener("resize", syncSections);

    return () => {
      if (scrollFrameRef.current !== null) {
        window.cancelAnimationFrame(scrollFrameRef.current);
      }
      container.removeEventListener("scroll", handleScroll);
      container.removeEventListener("touchstart", handleTouchStart);
      container.removeEventListener("touchmove", handleTouchMove);
      container.removeEventListener("touchend", handleTouchEnd);
      window.removeEventListener("resize", syncSections);
      observer?.disconnect();
    };
  }, [dispatchSectionChange, isMobileLayout, scrollToSection]);

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.slice(1);
      if (hash) {
        scrollToSection(hash);
      }
    };

    const handleNavigate = (event: Event) => {
      const customEvent = event as CustomEvent<{ sectionId: string }>;
      scrollToSection(customEvent.detail.sectionId);
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      const horizontalMode = isHorizontalMobile();
      const validKeys = horizontalMode
        ? ["ArrowLeft", "ArrowRight"]
        : ["ArrowDown", "PageDown", "ArrowUp", "PageUp"];

      if (!validKeys.includes(event.key)) return;

      const sections = sectionsRef.current;
      if (sections.length === 0) return;

      event.preventDefault();

      const direction =
        event.key === "ArrowDown" ||
        event.key === "PageDown" ||
        event.key === "ArrowRight"
          ? 1
          : -1;
      const targetIndex = Math.min(
        sections.length - 1,
        Math.max(0, currentSectionRef.current + direction)
      );

      const targetSection = sections[targetIndex];
      if (!targetSection) return;

      scrollToSection(targetSection.id);
      window.history.pushState(null, "", `#${targetSection.id}`);
    };

    window.addEventListener("hashchange", handleHashChange);
    window.addEventListener(NAVIGATE_TO_SECTION_EVENT, handleNavigate);
    window.addEventListener("keydown", handleKeyDown);

    if (window.location.hash) {
      handleHashChange();
    }

    return () => {
      window.removeEventListener("hashchange", handleHashChange);
      window.removeEventListener(NAVIGATE_TO_SECTION_EVENT, handleNavigate);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [duration, isHorizontalMobile, scrollToSection]);

  return (
    <div
      ref={containerRef}
      className={`h-screen overflow-x-auto overflow-y-hidden snap-x snap-mandatory scroll-smooth md:overflow-y-auto md:overflow-x-hidden md:snap-y ${className}`}
      style={{
        scrollBehavior: "smooth",
        scrollSnapType: isMobileLayout ? "x mandatory" : "y mandatory",
        overscrollBehaviorX: "contain",
        overscrollBehaviorY: "none",
        touchAction: isMobileLayout ? "pan-x pinch-zoom" : "pan-y pinch-zoom",
      }}
    >
      {children}
    </div>
  );
}
