"use client";

import { motion } from "framer-motion";
import { TechStackWidget } from "./tech-stack-widget";
import { HomelabWidget } from "./homelab-widget";
import { ProjectCard } from "./project-card";
import { ScrollButton } from "@/components/shared/scroll-button";
import {
  sectionGridReveal,
  sectionHeadingReveal,
  sectionItemReveal,
} from "@/lib/motion-presets";
import type { Project, TechItem } from "@/lib/types";

interface BentoGridProps {
  projects: Project[];
  techStack: TechItem[];
}

export function BentoGrid({ projects, techStack }: BentoGridProps) {
  return (
    <div className="max-w-6xl mx-auto">
      <motion.h2 {...sectionHeadingReveal} className="text-3xl font-bold mb-8 text-center">
        The Engineer & Lab
      </motion.h2>

      <motion.div
        variants={sectionGridReveal}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
      >
        <motion.div variants={sectionItemReveal} className="md:col-span-2 lg:row-span-2">
          <TechStackWidget items={techStack} />
        </motion.div>

        <motion.div variants={sectionItemReveal} className="lg:col-span-2">
          <HomelabWidget />
        </motion.div>

        {projects.slice(0, 3).map((project) => (
          <motion.div key={project.id} variants={sectionItemReveal}>
            <ProjectCard project={project} />
          </motion.div>
        ))}
      </motion.div>

      <ScrollButton targetId="credentials" />
    </div>
  );
}
