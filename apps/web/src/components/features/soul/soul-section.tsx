"use client";

import { motion } from "framer-motion";
import { ScrollButton } from "@/components/shared/scroll-button";
import { MusicWidget, RoutinesWidget } from "@/components/features/bento";
import {
  sectionGridReveal,
  sectionHeadingReveal,
  sectionItemReveal,
} from "@/lib/motion-presets";
import type { LifestyleData } from "@/lib/types";

interface SoulSectionProps {
  data: LifestyleData;
}

export function SoulSection({ data }: SoulSectionProps) {
  const instruments = data?.music?.instruments ?? [];
  const currentlyPlaying = data?.music?.currentlyPlaying ?? "";
  const routines = data?.routines ?? [];

  return (
    <div className="max-w-4xl mx-auto">
      <motion.h2 {...sectionHeadingReveal} className="text-3xl font-bold mb-8 text-center">
        The Soul Behind the Code
      </motion.h2>

      <motion.div
        variants={sectionGridReveal}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        className="grid grid-cols-1 md:grid-cols-2 gap-4"
      >
        <motion.div variants={sectionItemReveal}>
          <MusicWidget instruments={instruments} currentlyPlaying={currentlyPlaying} />
        </motion.div>

        <motion.div variants={sectionItemReveal}>
          <RoutinesWidget routines={routines} />
        </motion.div>
      </motion.div>

      <ScrollButton targetId="hero" isBackToTop />
    </div>
  );
}
