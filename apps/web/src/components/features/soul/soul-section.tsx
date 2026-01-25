"use client";

import { motion } from "framer-motion";
import { ScrollButton } from "@/components/shared/scroll-button";
import { MusicWidget, RoutinesWidget } from "@/components/features/bento";
import type { LifestyleData } from "@/lib/types";

interface SoulSectionProps {
  data: LifestyleData;
}

export function SoulSection({ data }: SoulSectionProps) {
  // Safely access nested properties with fallbacks
  const instruments = data?.music?.instruments ?? [];
  const currentlyPlaying = data?.music?.currentlyPlaying ?? "";
  const routines = data?.routines ?? [];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <div className="max-w-4xl mx-auto">
      <motion.h2
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        className="text-3xl font-bold mb-8 text-center"
      >
        The Soul Behind the Code
      </motion.h2>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        className="grid grid-cols-1 md:grid-cols-2 gap-4"
      >
        {/* Music Card */}
        <motion.div variants={itemVariants}>
          <MusicWidget instruments={instruments} currentlyPlaying={currentlyPlaying} />
        </motion.div>

        {/* Daily Routines Card */}
        <motion.div variants={itemVariants}>
          <RoutinesWidget routines={routines} />
        </motion.div>
      </motion.div>

      <ScrollButton targetId="hero" isBackToTop />
    </div>
  );
}
