"use client";

import { motion } from "framer-motion";
import { LiquidGlass } from "@/components/ui/liquid-glass";
import { Home, User, Award, Heart, Github, Linkedin, Mail, BookText } from "lucide-react";
import { useEffect, useMemo, useState, useRef } from "react";
import { navigateToSection } from "@/lib/navigation-events";

const desktopNavItems = [
  { icon: Home, href: "#hero", label: "Home", sectionId: "hero" },
  { icon: User, href: "#tech", label: "Tech", sectionId: "tech" },
  { icon: Award, href: "#credentials", label: "Credentials", sectionId: "credentials" },
  { icon: Heart, href: "#soul", label: "Soul", sectionId: "soul" },
];

const mobileNavItems = [
  { icon: Home, href: "#hero", label: "Home", sectionId: "hero" },
  { icon: BookText, href: "#writing", label: "Writing", sectionId: "writing" },
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
  const [isNavigating, setIsNavigating] = useState(false);
  const [isMobileLayout, setIsMobileLayout] = useState(false);
  const navigationTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const navItems = useMemo(
    () => (isMobileLayout ? mobileNavItems : desktopNavItems),
    [isMobileLayout]
  );
  const resolvedActiveSection = useMemo(
    () =>
      navItems.some((item) => item.sectionId === activeSection)
        ? activeSection
        : navItems[0]?.sectionId ?? "hero",
    [activeSection, navItems]
  );

  useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 767px), (pointer: coarse)");
    const updateLayout = () => setIsMobileLayout(mediaQuery.matches);

    updateLayout();
    mediaQuery.addEventListener("change", updateLayout);
    return () => mediaQuery.removeEventListener("change", updateLayout);
  }, []);

  // Listen for section change events from SmoothScrollContainer
  useEffect(() => {
    const handleSectionChange = (e: Event) => {
      if (isNavigating) return;

      const customEvent = e as CustomEvent<{ sectionId: string }>;
      const { sectionId } = customEvent.detail;

      setActiveSection(sectionId);
    };

    window.addEventListener("sectionChange", handleSectionChange);
    return () => window.removeEventListener("sectionChange", handleSectionChange);
  }, [isNavigating]);

  const scrollToSection = (sectionId: string) => {
    if (navigationTimeoutRef.current) {
      clearTimeout(navigationTimeoutRef.current);
    }

    setIsNavigating(true);
    setActiveSection(sectionId);
    navigateToSection(sectionId);

    navigationTimeoutRef.current = setTimeout(() => {
      setIsNavigating(false);
    }, 1500);
  };

  const openExternal = (href: string) => {
    window.open(href, "_blank");
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
        <nav className="flex items-center gap-1 relative">
          {/* Navigation */}
          {navItems.map(({ icon: Icon, href, label, sectionId }) => {
            const isActive = resolvedActiveSection === sectionId;
            return (
              <motion.button
                key={href}
                onClick={() => scrollToSection(sectionId)}
                className="relative p-3 rounded-xl transition-colors group z-10"
                aria-label={label}
                whileTap={{ scale: 0.95 }}
              >
                {isActive ? (
                  <motion.div
                    layoutId="floating-dock-indicator"
                    className="absolute inset-x-[-6px] inset-y-[-2px] rounded-2xl bg-white shadow-lg"
                    transition={{
                      type: "spring",
                      stiffness: 280,
                      damping: 28,
                    }}
                  />
                ) : null}

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
                  className="relative z-10"
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
              onClick={() => openExternal(href)}
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
