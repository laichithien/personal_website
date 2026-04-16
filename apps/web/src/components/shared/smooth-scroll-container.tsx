"use client";

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";

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
  const currentSectionRef = useRef(currentSection);

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
        top: targetSection.offsetTop,
        behavior: "smooth",
      });
    },
    [dispatchSectionChange]
  );

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    sectionsRef.current = Array.from(container.querySelectorAll("section[id]"));
    const sections = sectionsRef.current;
    if (sections.length === 0) return;

    dispatchSectionChange(sections[0].id, 0);

    const observer = new IntersectionObserver(
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

    sections.forEach((section) => observer.observe(section));

    return () => observer.disconnect();
  }, [dispatchSectionChange]);

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
      if (!["ArrowDown", "PageDown", "ArrowUp", "PageUp"].includes(event.key)) return;

      const sections = sectionsRef.current;
      if (sections.length === 0) return;

      event.preventDefault();

      const direction = event.key === "ArrowDown" || event.key === "PageDown" ? 1 : -1;
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
    window.addEventListener("navigateToSection", handleNavigate);
    window.addEventListener("keydown", handleKeyDown);

    if (window.location.hash) {
      handleHashChange();
    }

    return () => {
      window.removeEventListener("hashchange", handleHashChange);
      window.removeEventListener("navigateToSection", handleNavigate);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [scrollToSection, duration]);

  return (
    <div
      ref={containerRef}
      className={`h-screen overflow-y-auto overflow-x-hidden snap-y snap-mandatory scroll-smooth ${className}`}
      style={{ scrollBehavior: "smooth", scrollSnapType: "y mandatory" }}
    >
      {children}
    </div>
  );
}
