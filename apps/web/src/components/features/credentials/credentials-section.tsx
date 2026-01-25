"use client";

import { motion } from "framer-motion";
import { ScrollButton } from "@/components/shared/scroll-button";
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
    <div className="max-w-6xl mx-auto">
      <motion.h2
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        className="text-3xl font-bold mb-8 text-center"
      >
        Credentials & Achievements
      </motion.h2>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        className="grid grid-cols-1 md:grid-cols-2 gap-4"
      >
        {/* Education Card */}
        <motion.div variants={itemVariants}>
          <EducationWidget education={education} />
        </motion.div>

        {/* Publications Card */}
        <motion.div variants={itemVariants}>
          <PublicationsWidget publications={publications} />
        </motion.div>

        {/* Achievements Card */}
        <motion.div variants={itemVariants}>
          <AchievementsWidget achievements={achievements} />
        </motion.div>

        {/* Courses Card */}
        <motion.div variants={itemVariants}>
          <CoursesWidget courses={courses} />
        </motion.div>
      </motion.div>

      <ScrollButton targetId="soul" />
    </div>
  );
}
