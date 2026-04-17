"use client";

import { motion } from "framer-motion";
import { ArrowLeftToLine, ArrowUpToLine, ChevronDown, ChevronRight } from "lucide-react";
import { GlassIconButton } from "@/components/ui/glass-icon-button";
import { navigateToSection } from "@/lib/navigation-events";

interface ScrollButtonProps {
  targetId: string;
  isBackToTop?: boolean;
}

export function ScrollButton({ targetId, isBackToTop = false }: ScrollButtonProps) {
  const scrollTo = () => navigateToSection(targetId);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="flex justify-center mt-12"
    >
      <GlassIconButton
        onClick={scrollTo}
        size="lg"
        className="border-white/20 group hover:border-white/40"
        aria-label={isBackToTop ? "Go to first section" : "Go to next section"}
      >
        {isBackToTop ? (
          <>
            <ArrowLeftToLine className="w-6 h-6 transition-colors md:hidden" />
            <ArrowUpToLine className="hidden w-6 h-6 transition-colors md:block" />
          </>
        ) : (
          <>
            <ChevronRight className="w-6 h-6 transition-colors md:hidden" />
            <ChevronDown className="hidden w-6 h-6 transition-colors md:block" />
          </>
        )}
      </GlassIconButton>
    </motion.div>
  );
}
