import { MeshBackground } from "@/components/ui/mesh-background";
import { HeroSection } from "@/components/features/hero/hero-section";
import { BentoGrid } from "@/components/features/bento/bento-grid";
import { CredentialsSection } from "@/components/features/credentials/credentials-section";
import { SoulSection } from "@/components/features/soul/soul-section";
import { MessengerButton } from "@/components/features/chat/messenger-button";
import { FloatingDock } from "@/components/shared/floating-dock";
import { SmoothScrollContainer } from "@/components/shared/smooth-scroll-container";
import { ScrollUpButton } from "@/components/shared/scroll-up-button";
import { fetchPortfolio } from "@/lib/portfolio-api";
import { portfolioConfig } from "@/config/portfolio";

// Force dynamic rendering - API not available during build
export const dynamic = "force-dynamic";
import type {
  Project,
  TechItem,
  HeroData,
  EducationData,
  PublicationItem,
  AchievementItem,
  CourseItem,
  LifestyleData,
} from "@/lib/types";

interface TransformedData {
  hero: HeroData;
  education: EducationData;
  projects: Project[];
  techStack: TechItem[];
  publications: PublicationItem[];
  achievements: AchievementItem[];
  courses: CourseItem[];
  lifestyle: LifestyleData;
}

async function getPortfolioData(): Promise<TransformedData> {
  try {
    const data = await fetchPortfolio();

    // Transform API data to match component types
    return {
      hero: data.hero,
      education: data.education,
      projects: data.projects.map((p) => ({
        id: String(p.id),
        title: p.title,
        description: p.description,
        tags: p.tags,
        image: p.image,
        link: p.link,
        github: p.github,
      })),
      techStack: data.techStack.map((t) => ({
        name: t.name,
        icon: t.icon,
        category: t.category as TechItem["category"],
      })),
      publications: data.publications.map((p) => ({
        title: p.title,
        venue: p.venue,
        doi: p.doi || "",
        year: p.year,
      })),
      achievements: data.achievements.map((a) => ({
        title: a.title,
        event: a.event,
        organization: a.organization,
        year: a.year,
      })),
      courses: data.courses.map((c) => ({
        title: c.title,
        year: c.year,
        focus: c.focus,
      })),
      lifestyle: data.lifestyle,
    };
  } catch (error) {
    console.error("Failed to fetch portfolio from API, using fallback:", error);
    // Fallback to static config if API fails
    return {
      hero: portfolioConfig.hero,
      education: portfolioConfig.education,
      projects: portfolioConfig.projects.map((project) => ({
        id: project.id,
        title: project.title,
        description: project.description,
        tags: project.tags,
      })),
      techStack: portfolioConfig.techStack,
      publications: portfolioConfig.publications,
      achievements: portfolioConfig.achievements,
      courses: portfolioConfig.courses,
      lifestyle: portfolioConfig.lifestyle,
    };
  }
}

export default async function Home() {
  const data = await getPortfolioData();

  return (
    <SmoothScrollContainer duration={1200} className="relative">
      {/* Background Layer */}
      <MeshBackground />

      {/* Content Layer */}
      <div className="relative z-10">
        {/* Hero Section */}
        <section id="hero" className="min-h-screen flex items-center justify-center px-4">
          <HeroSection data={data.hero} />
        </section>

        {/* Tech & Lab Section */}
        <section id="tech" className="relative min-h-screen py-20 px-4">
          <ScrollUpButton targetSection="hero" />
          <BentoGrid
            projects={data.projects}
            techStack={data.techStack}
          />
        </section>

        {/* Credentials Section */}
        <section id="credentials" className="relative min-h-screen py-20 px-4">
          <ScrollUpButton targetSection="tech" />
          <CredentialsSection
            education={data.education}
            publications={data.publications}
            achievements={data.achievements}
            courses={data.courses}
          />
        </section>

        {/* Soul Section */}
        <section id="soul" className="relative min-h-screen py-20 px-4">
          <ScrollUpButton targetSection="credentials" />
          <SoulSection data={data.lifestyle} />
        </section>
      </div>

      {/* Floating Elements */}
      <FloatingDock />
      <MessengerButton />
    </SmoothScrollContainer>
  );
}
