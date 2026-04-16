export interface Project {
  id: string;
  title: string;
  description: string;
  tags: string[];
  image?: string;
  link?: string;
  github?: string;
}

export interface TechItem {
  name: string;
  icon: string;
  category: "language" | "frontend" | "backend" | "database" | "devops" | "data" | "ai";
}

export interface HeroData {
  name: string;
  title: string;
  tagline: string;
  avatar: string;
  location?: string;
}

export interface HeroSocialLinks {
  github?: string;
  linkedin?: string;
  email?: string;
}

export interface AboutData {
  summary: string;
  highlights: string[];
}

export interface ExperienceItem {
  company: string;
  role: string;
  period: string;
  highlights: string[];
}

export interface EducationData {
  school: string;
  degree: string;
  period: string;
  gpa: string;
  rank: string;
  coursework?: string[];
}

export interface PublicationItem {
  title: string;
  venue: string;
  doi: string;
  year: number;
}

export interface AchievementItem {
  title: string;
  event: string;
  organization: string;
  year: number;
}

export interface CourseItem {
  title: string;
  year: number;
  focus: string[];
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
  phone?: string;
}
