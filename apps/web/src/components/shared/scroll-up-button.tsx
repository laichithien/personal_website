"use client";

import { motion } from "framer-motion";
import { ChevronLeft, ChevronUp } from "lucide-react";
import { GlassIconButton } from "@/components/ui/glass-icon-button";
import { navigateToSection } from "@/lib/navigation-events";

interface ScrollUpButtonProps {
  targetSection: string;
}

export function ScrollUpButton({ targetSection }: ScrollUpButtonProps) {
  const scrollTo = () => navigateToSection(targetSection);

  return (
    <motion.div
      className="absolute top-6 left-1/2 z-20 -translate-x-1/2"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 }}
    >
      <GlassIconButton
        onClick={scrollTo}
        className="group backdrop-blur-sm"
        aria-label={`Go to previous section: ${targetSection}`}
      >
        <motion.div
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          animate={{ y: [0, -3, 0], x: [0, -3, 0] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
        >
          <ChevronLeft className="w-5 h-5 transition-colors md:hidden" />
          <ChevronUp className="hidden w-5 h-5 transition-colors md:block" />
        </motion.div>
      </GlassIconButton>
    </motion.div>
  );
}
