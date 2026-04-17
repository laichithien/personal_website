/**
 * Public Portfolio API client
 * Fetches portfolio data from the backend for the public website
 */
import { getApiBaseUrl } from "@/lib/api-base";

export interface HeroData {
  name: string;
  title: string;
  tagline: string;
  avatar: string;
  location: string;
}

export interface AboutData {
  summary: string;
  highlights: string[];
}

export interface EducationData {
  school: string;
  degree: string;
  period: string;
  gpa: string;
  rank: string;
  coursework: string[];
}

export interface LifestyleData {
  music: {
    instruments: string[];
    currentlyPlaying: string;
  };
  routines: string[];
}

export interface SocialData {
  github: string;
  linkedin: string;
  email: string;
  phone: string;
}

export interface Experience {
  id: number;
  company: string;
  role: string;
  period: string;
  highlights: string[];
}

export interface TechStackItem {
  id: number;
  name: string;
  icon: string;
  category: string;
}

export interface Project {
  id: number;
  title: string;
  description: string;
  tags: string[];
  image?: string;
  link?: string;
  github?: string;
  is_featured: boolean;
}

export interface Publication {
  id: number;
  title: string;
  venue: string;
  doi?: string;
  year: number;
}

export interface Achievement {
  id: number;
  title: string;
  event: string;
  organization: string;
  year: number;
}

export interface Course {
  id: number;
  title: string;
  year: number;
  focus: string[];
}

export interface PortfolioData {
  hero: HeroData;
  about: AboutData;
  education: EducationData;
  experience: Experience[];
  techStack: TechStackItem[];
  projects: Project[];
  publications: Publication[];
  achievements: Achievement[];
  courses: Course[];
  lifestyle: LifestyleData;
  social: SocialData;
}

/**
 * Fetch complete portfolio data from the API
 */
export async function fetchPortfolio(): Promise<PortfolioData> {
  const res = await fetch(`${getApiBaseUrl()}/api/portfolio`, {
    next: { revalidate: 60 }, // Revalidate every 60 seconds
  });

  if (!res.ok) {
    throw new Error("Failed to fetch portfolio data");
  }

  return res.json();
}

/**
 * Fetch individual portfolio sections
 */
export async function fetchHero(): Promise<HeroData> {
  const res = await fetch(`${getApiBaseUrl()}/api/portfolio/hero`, {
    next: { revalidate: 60 },
  });
  if (!res.ok) throw new Error("Failed to fetch hero data");
  return res.json();
}

export async function fetchAbout(): Promise<AboutData> {
  const res = await fetch(`${getApiBaseUrl()}/api/portfolio/about`, {
    next: { revalidate: 60 },
  });
  if (!res.ok) throw new Error("Failed to fetch about data");
  return res.json();
}

export async function fetchEducation(): Promise<EducationData> {
  const res = await fetch(`${getApiBaseUrl()}/api/portfolio/education`, {
    next: { revalidate: 60 },
  });
  if (!res.ok) throw new Error("Failed to fetch education data");
  return res.json();
}

export async function fetchExperience(): Promise<Experience[]> {
  const res = await fetch(`${getApiBaseUrl()}/api/portfolio/experience`, {
    next: { revalidate: 60 },
  });
  if (!res.ok) throw new Error("Failed to fetch experience data");
  return res.json();
}

export async function fetchTechStack(): Promise<TechStackItem[]> {
  const res = await fetch(`${getApiBaseUrl()}/api/portfolio/tech-stack`, {
    next: { revalidate: 60 },
  });
  if (!res.ok) throw new Error("Failed to fetch tech stack data");
  return res.json();
}

export async function fetchProjects(): Promise<Project[]> {
  const res = await fetch(`${getApiBaseUrl()}/api/portfolio/projects`, {
    next: { revalidate: 60 },
  });
  if (!res.ok) throw new Error("Failed to fetch projects data");
  return res.json();
}

export async function fetchPublications(): Promise<Publication[]> {
  const res = await fetch(`${getApiBaseUrl()}/api/portfolio/publications`, {
    next: { revalidate: 60 },
  });
  if (!res.ok) throw new Error("Failed to fetch publications data");
  return res.json();
}

export async function fetchAchievements(): Promise<Achievement[]> {
  const res = await fetch(`${getApiBaseUrl()}/api/portfolio/achievements`, {
    next: { revalidate: 60 },
  });
  if (!res.ok) throw new Error("Failed to fetch achievements data");
  return res.json();
}

export async function fetchCourses(): Promise<Course[]> {
  const res = await fetch(`${getApiBaseUrl()}/api/portfolio/courses`, {
    next: { revalidate: 60 },
  });
  if (!res.ok) throw new Error("Failed to fetch courses data");
  return res.json();
}

export async function fetchLifestyle(): Promise<LifestyleData> {
  const res = await fetch(`${getApiBaseUrl()}/api/portfolio/lifestyle`, {
    next: { revalidate: 60 },
  });
  if (!res.ok) throw new Error("Failed to fetch lifestyle data");
  return res.json();
}

export async function fetchSocial(): Promise<SocialData> {
  const res = await fetch(`${getApiBaseUrl()}/api/portfolio/social`, {
    next: { revalidate: 60 },
  });
  if (!res.ok) throw new Error("Failed to fetch social data");
  return res.json();
}
