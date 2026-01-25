"use client";

import { motion } from "framer-motion";
import { TechStackWidget } from "./tech-stack-widget";
import { HomelabWidget } from "./homelab-widget";
import { ProjectCard } from "./project-card";
import { ScrollButton } from "@/components/shared/scroll-button";
import type { Project, TechItem } from "@/lib/types";

interface BentoGridProps {
  projects: Project[];
  techStack: TechItem[];
}

export function BentoGrid({ projects, techStack }: BentoGridProps) {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <div className="max-w-6xl mx-auto">
      <motion.h2
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        className="text-3xl font-bold mb-8 text-center"
      >
        The Engineer & Lab
      </motion.h2>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
      >
        {/* Tech Stack - Large cell */}
        <motion.div variants={itemVariants} className="md:col-span-2 lg:row-span-2">
          <TechStackWidget items={techStack} />
        </motion.div>

        {/* Homelab Status */}
        <motion.div variants={itemVariants} className="lg:col-span-2">
          <HomelabWidget />
        </motion.div>

        {/* Project Cards */}
        {projects.slice(0, 3).map((project) => (
          <motion.div key={project.id} variants={itemVariants}>
            <ProjectCard project={project} />
          </motion.div>
        ))}
      </motion.div>

      <ScrollButton targetId="credentials" />
    </div>
  );
}
