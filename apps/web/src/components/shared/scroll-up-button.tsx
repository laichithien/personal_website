"use client";

import { motion } from "framer-motion";
import { ChevronUp } from "lucide-react";

interface ScrollUpButtonProps {
  targetSection: string;
}

export function ScrollUpButton({ targetSection }: ScrollUpButtonProps) {
  const scrollTo = () => {
    // Dispatch custom event for smooth scroll navigation
    window.dispatchEvent(
      new CustomEvent("navigateToSection", {
        detail: { sectionId: targetSection },
      })
    );
    // Also update hash for URL consistency
    window.history.pushState(null, "", `#${targetSection}`);
  };

  return (
    <motion.button
      onClick={scrollTo}
      className="absolute top-6 left-1/2 -translate-x-1/2 z-20 p-3 rounded-full bg-white/5 backdrop-blur-md border border-white/10 hover:bg-white/10 transition-colors group"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 }}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
      aria-label={`Scroll to ${targetSection}`}
    >
      <motion.div
        animate={{ y: [0, -3, 0] }}
        transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
      >
        <ChevronUp className="w-5 h-5 text-white/60 group-hover:text-white transition-colors" />
      </motion.div>
    </motion.button>
  );
}
