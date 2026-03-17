"use client";

import { motion } from "framer-motion";
import { LiquidGlass } from "@/components/ui/liquid-glass";
import { Home, User, Award, Heart, Github, Linkedin, Mail } from "lucide-react";
import { useEffect, useState, useRef } from "react";

const navItems = [
  { icon: Home, href: "#hero", label: "Home", sectionId: "hero" },
  { icon: User, href: "#tech", label: "Tech", sectionId: "tech" },
  { icon: Award, href: "#credentials", label: "Credentials", sectionId: "credentials" },
  { icon: Heart, href: "#soul", label: "Soul", sectionId: "soul" },
];

const socialItems = [
  { icon: Github, href: "https://github.com/yourusername", label: "GitHub" },
  { icon: Linkedin, href: "https://www.linkedin.com/in/yourprofile/", label: "LinkedIn" },
  { icon: Mail, href: "mailto:contact@yourdomain.com", label: "Email" },
];

export function FloatingDock() {
  const [activeSection, setActiveSection] = useState("hero");
  const [activeIndex, setActiveIndex] = useState(0);
  const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 44 });
  const [isMounted, setIsMounted] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);
  const navRef = useRef<HTMLDivElement>(null);
  const buttonRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const navigationTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  // Listen for section change events from SmoothScrollContainer
  useEffect(() => {
    const handleSectionChange = (e: Event) => {
      // Skip if we're navigating via click (we already set the state)
      if (isNavigating) return;

      const customEvent = e as CustomEvent<{ sectionId: string; index: number }>;
      const { sectionId, index } = customEvent.detail;

      setActiveSection(sectionId);
      setActiveIndex(index);
    };

    window.addEventListener("sectionChange", handleSectionChange);
    return () => window.removeEventListener("sectionChange", handleSectionChange);
  }, [isNavigating]);

  // Calculate and update indicator position
  useEffect(() => {
    const updateIndicatorPosition = () => {
      const button = buttonRefs.current[activeIndex];
      if (!button || !navRef.current) return;

      const navRect = navRef.current.getBoundingClientRect();
      const buttonRect = button.getBoundingClientRect();

      setIndicatorStyle({
        left: buttonRect.left - navRect.left - 6,
        width: buttonRect.width + 12,
      });
    };

    // Wait for layout to settle
    const timeoutId = setTimeout(updateIndicatorPosition, 50);
    setIsMounted(true);

    window.addEventListener("resize", updateIndicatorPosition);
    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener("resize", updateIndicatorPosition);
    };
  }, [activeIndex]);

  const scrollTo = (href: string, sectionId?: string, index?: number) => {
    if (href.startsWith("#")) {
      // Clear any existing navigation timeout
      if (navigationTimeoutRef.current) {
        clearTimeout(navigationTimeoutRef.current);
      }

      // Immediately update to target section (skip intermediate sections)
      if (sectionId !== undefined && index !== undefined) {
        setIsNavigating(true);
        setActiveSection(sectionId);
        setActiveIndex(index);

        // Dispatch custom event for smooth scroll navigation
        window.dispatchEvent(
          new CustomEvent("navigateToSection", {
            detail: { sectionId },
          })
        );
        // Also update hash for URL consistency
        window.history.pushState(null, "", href);
      }

      // Re-enable observer after scroll completes
      navigationTimeoutRef.current = setTimeout(() => {
        setIsNavigating(false);
      }, 1500);
    } else {
      window.open(href, "_blank");
    }
  };

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (navigationTimeoutRef.current) {
        clearTimeout(navigationTimeoutRef.current);
      }
    };
  }, []);

  return (
    <motion.div
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 1, duration: 0.5 }}
      className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40"
    >
      <LiquidGlass blur="xl" className="px-4 py-2">
        <nav ref={navRef} className="flex items-center gap-1 relative">
          {/* Animated indicator background - liquid blob effect */}
          {isMounted && (
            <motion.div
              key={`indicator-${activeIndex}`}
              className="absolute h-[calc(100%+4px)] -top-[2px] rounded-2xl bg-white shadow-lg origin-center"
              initial={{
                opacity: 0,
                scale: 0.8,
                left: indicatorStyle.left,
                width: indicatorStyle.width,
              }}
              animate={{
                opacity: 1,
                left: indicatorStyle.left,
                width: indicatorStyle.width,
                scaleX: [1, 1.25, 1.3, 1.1, 0.95, 1],
                scaleY: [1, 1.15, 1.2, 1.05, 0.97, 1],
              }}
              transition={{
                opacity: { duration: 0.15 },
                left: { type: "spring", stiffness: 250, damping: 22 },
                width: { type: "spring", stiffness: 250, damping: 22 },
                scaleX: {
                  duration: 0.6,
                  times: [0, 0.2, 0.5, 0.7, 0.85, 1],
                  ease: "easeOut"
                },
                scaleY: {
                  duration: 0.6,
                  times: [0, 0.2, 0.5, 0.7, 0.85, 1],
                  ease: "easeOut"
                },
              }}
            />
          )}

          {/* Navigation */}
          {navItems.map(({ icon: Icon, href, label, sectionId }, index) => {
            const isActive = activeSection === sectionId;
            return (
              <motion.button
                key={href}
                ref={(el) => { buttonRefs.current[index] = el; }}
                onClick={() => scrollTo(href, sectionId, index)}
                className="relative p-3 rounded-xl transition-colors group z-10"
                aria-label={label}
                whileTap={{ scale: 0.95 }}
              >
                <motion.div
                  key={`icon-${sectionId}-${isActive}`}
                  initial={false}
                  animate={isActive ? {
                    y: [0, -3, 0],
                    scale: [1, 1.1, 1],
                  } : { y: 0, scale: 1 }}
                  transition={{
                    duration: 0.4,
                    ease: "easeOut",
                  }}
                >
                  <Icon
                    className={`w-5 h-5 transition-colors duration-200 ${
                      isActive
                        ? "text-gray-800"
                        : "text-white/60 group-hover:text-white"
                    }`}
                  />
                </motion.div>
              </motion.button>
            );
          })}

          {/* Divider */}
          <div className="w-px h-6 bg-white/10 mx-2" />

          {/* Social Links */}
          {socialItems.map(({ icon: Icon, href, label }) => (
            <motion.button
              key={href}
              onClick={() => scrollTo(href)}
              className="p-3 rounded-xl hover:bg-white/10 transition-colors group"
              aria-label={label}
              whileTap={{ scale: 0.95 }}
            >
              <Icon className="w-5 h-5 text-white/60 group-hover:text-cyan-400 transition-colors" />
            </motion.button>
          ))}
        </nav>
      </LiquidGlass>
    </motion.div>
  );
}
