"use client";

import { motion } from "framer-motion";
import { ChevronDown, ArrowUpToLine } from "lucide-react";

interface ScrollButtonProps {
  targetId: string;
  isBackToTop?: boolean;
}

export function ScrollButton({ targetId, isBackToTop = false }: ScrollButtonProps) {
  const scrollTo = () => {
    // Dispatch custom event for smooth scroll navigation
    window.dispatchEvent(
      new CustomEvent("navigateToSection", {
        detail: { sectionId: targetId },
      })
    );
    // Also update hash for URL consistency
    window.history.pushState(null, "", `#${targetId}`);
  };

  const Icon = isBackToTop ? ArrowUpToLine : ChevronDown;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="flex justify-center mt-12"
    >
      <button
        onClick={scrollTo}
        className="w-12 h-12 rounded-full border border-white/20 hover:bg-white/10 hover:border-white/40 transition-all flex items-center justify-center group"
        aria-label={isBackToTop ? "Back to top" : "Scroll to next section"}
      >
        <Icon className="w-6 h-6 text-white/60 group-hover:text-white transition-colors" />
      </button>
    </motion.div>
  );
}
