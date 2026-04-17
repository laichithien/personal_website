"use client";

import { motion } from "framer-motion";
import { ScrollButton } from "@/components/shared/scroll-button";
import {
  sectionGridReveal,
  sectionHeadingReveal,
  sectionItemReveal,
} from "@/lib/motion-presets";
import {
  EducationWidget,
  PublicationsWidget,
  AchievementsWidget,
  CoursesWidget,
} from "@/components/features/bento";
import type {
  EducationData,
  PublicationItem,
  AchievementItem,
  CourseItem,
} from "@/lib/types";

interface CredentialsSectionProps {
  education: EducationData;
  publications: PublicationItem[];
  achievements: AchievementItem[];
  courses: CourseItem[];
}

export function CredentialsSection({
  education,
  publications,
  achievements,
  courses,
}: CredentialsSectionProps) {
  return (
    <div className="max-w-6xl mx-auto">
      <motion.h2 {...sectionHeadingReveal} className="text-3xl font-bold mb-8 text-center">
        Credentials & Achievements
      </motion.h2>

      <motion.div
        variants={sectionGridReveal}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        className="grid grid-cols-1 md:grid-cols-2 gap-4"
      >
        <motion.div variants={sectionItemReveal}>
          <EducationWidget education={education} />
        </motion.div>

        <motion.div variants={sectionItemReveal}>
          <PublicationsWidget publications={publications} />
        </motion.div>

        <motion.div variants={sectionItemReveal}>
          <AchievementsWidget achievements={achievements} />
        </motion.div>

        <motion.div variants={sectionItemReveal}>
          <CoursesWidget courses={courses} />
        </motion.div>
      </motion.div>

      <ScrollButton targetId="soul" />
    </div>
  );
}
