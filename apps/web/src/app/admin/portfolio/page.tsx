"use client";

import Link from "next/link";
import {
  Award,
  BookOpen,
  Briefcase,
  Code,
  FolderKanban,
  GraduationCap,
  Heart,
  Settings,
  Share2,
  User,
} from "lucide-react";
import {
  usePortfolioSettings,
  usePortfolioExperiences,
  usePortfolioTechStack,
  usePortfolioProjects,
  usePortfolioPublications,
  usePortfolioAchievements,
  usePortfolioCourses,
} from "@/hooks/use-admin-api";
import { cn } from "@/lib/utils";

interface SectionCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  href: string;
  count?: number;
  isLoading?: boolean;
}

function SectionCard({
  title,
  description,
  icon,
  href,
  count,
  isLoading,
}: SectionCardProps) {
  return (
    <Link
      href={href}
      className={cn(
        "flex items-start gap-4 p-4 rounded-lg border border-zinc-800 bg-zinc-900/50",
        "hover:bg-zinc-800/50 hover:border-zinc-700 transition-colors"
      )}
    >
      <div className="w-10 h-10 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h3 className="font-medium">{title}</h3>
          {count !== undefined && (
            <span className="px-2 py-0.5 text-xs rounded-full bg-zinc-800 text-zinc-400">
              {isLoading ? "..." : count}
            </span>
          )}
        </div>
        <p className="text-sm text-zinc-500 mt-0.5">{description}</p>
      </div>
    </Link>
  );
}

export default function PortfolioPage() {
  const { data: settings, isLoading: settingsLoading } = usePortfolioSettings();
  const { data: experiences, isLoading: experiencesLoading } = usePortfolioExperiences();
  const { data: techStack, isLoading: techStackLoading } = usePortfolioTechStack();
  const { data: projects, isLoading: projectsLoading } = usePortfolioProjects();
  const { data: publications, isLoading: publicationsLoading } = usePortfolioPublications();
  const { data: achievements, isLoading: achievementsLoading } = usePortfolioAchievements();
  const { data: courses, isLoading: coursesLoading } = usePortfolioCourses();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Portfolio Content</h1>
        <p className="text-zinc-400 mt-1">
          Manage all content displayed on your portfolio website
        </p>
      </div>

      {/* Settings Section */}
      <div>
        <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
          <Settings className="w-5 h-5 text-cyan-400" />
          Profile Settings
        </h2>
        <p className="text-sm text-zinc-500 mb-4">
          Single-instance data like hero section, about, education, social links, and lifestyle
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <SectionCard
            title="Hero Section"
            description="Name, title, tagline, avatar"
            icon={<User className="w-5 h-5" />}
            href="/admin/portfolio/settings/hero"
            count={settings?.find((s) => s.key === "hero") ? 1 : 0}
            isLoading={settingsLoading}
          />
          <SectionCard
            title="About"
            description="Summary and highlights"
            icon={<User className="w-5 h-5" />}
            href="/admin/portfolio/settings/about"
            count={settings?.find((s) => s.key === "about") ? 1 : 0}
            isLoading={settingsLoading}
          />
          <SectionCard
            title="Education"
            description="School, degree, coursework"
            icon={<GraduationCap className="w-5 h-5" />}
            href="/admin/portfolio/settings/education"
            count={settings?.find((s) => s.key === "education") ? 1 : 0}
            isLoading={settingsLoading}
          />
          <SectionCard
            title="Lifestyle"
            description="Music and daily routines"
            icon={<Heart className="w-5 h-5" />}
            href="/admin/portfolio/settings/lifestyle"
            count={settings?.find((s) => s.key === "lifestyle") ? 1 : 0}
            isLoading={settingsLoading}
          />
          <SectionCard
            title="Social Links"
            description="GitHub, LinkedIn, email, phone"
            icon={<Share2 className="w-5 h-5" />}
            href="/admin/portfolio/settings/social"
            count={settings?.find((s) => s.key === "social") ? 1 : 0}
            isLoading={settingsLoading}
          />
        </div>
      </div>

      {/* Collections Section */}
      <div>
        <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
          <FolderKanban className="w-5 h-5 text-cyan-400" />
          Collections
        </h2>
        <p className="text-sm text-zinc-500 mb-4">
          Lists of items that can be added, edited, reordered, or removed
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <SectionCard
            title="Experience"
            description="Work history and roles"
            icon={<Briefcase className="w-5 h-5" />}
            href="/admin/portfolio/experience"
            count={experiences?.length}
            isLoading={experiencesLoading}
          />
          <SectionCard
            title="Tech Stack"
            description="Technologies and skills"
            icon={<Code className="w-5 h-5" />}
            href="/admin/portfolio/tech-stack"
            count={techStack?.length}
            isLoading={techStackLoading}
          />
          <SectionCard
            title="Projects"
            description="Portfolio projects"
            icon={<FolderKanban className="w-5 h-5" />}
            href="/admin/portfolio/projects"
            count={projects?.length}
            isLoading={projectsLoading}
          />
          <SectionCard
            title="Publications"
            description="Academic publications"
            icon={<BookOpen className="w-5 h-5" />}
            href="/admin/portfolio/publications"
            count={publications?.length}
            isLoading={publicationsLoading}
          />
          <SectionCard
            title="Achievements"
            description="Awards and recognitions"
            icon={<Award className="w-5 h-5" />}
            href="/admin/portfolio/achievements"
            count={achievements?.length}
            isLoading={achievementsLoading}
          />
          <SectionCard
            title="Courses"
            description="Professional courses"
            icon={<GraduationCap className="w-5 h-5" />}
            href="/admin/portfolio/courses"
            count={courses?.length}
            isLoading={coursesLoading}
          />
        </div>
      </div>
    </div>
  );
}
