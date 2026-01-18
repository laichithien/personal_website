# Frontend Implementation Guide

**Document:** Implementation Guide - Next.js Frontend
**Project:** The Transparent Core
**Stack:** Next.js 14, Tailwind CSS, Framer Motion, shadcn/ui

---

## 1. Project Structure

```bash
apps/web/src/
├── app/
│   ├── layout.tsx              # Root layout with providers
│   ├── page.tsx                # Main SPA entry
│   ├── globals.css             # Tailwind + custom styles
│   └── api/
│       └── chat/
│           └── route.ts        # Proxy to AI service
│
├── components/
│   ├── ui/                     # Base UI components
│   │   ├── button.tsx          # shadcn/ui
│   │   ├── dialog.tsx          # shadcn/ui
│   │   ├── liquid-glass.tsx    # Custom: Glass card
│   │   └── mesh-background.tsx # Custom: Animated background
│   │
│   ├── features/
│   │   ├── hero/
│   │   │   ├── hero-section.tsx
│   │   │   └── hero-card.tsx
│   │   ├── bento/
│   │   │   ├── bento-grid.tsx
│   │   │   ├── tech-stack-widget.tsx
│   │   │   ├── homelab-widget.tsx
│   │   │   └── project-card.tsx
│   │   ├── soul/
│   │   │   ├── soul-section.tsx
│   │   │   ├── music-player.tsx
│   │   │   └── life-algorithm.tsx
│   │   └── chat/
│   │       ├── messenger-button.tsx
│   │       ├── messenger-window.tsx
│   │       ├── chat-tab.tsx
│   │       └── contact-tab.tsx
│   │
│   └── shared/
│       ├── navbar.tsx
│       ├── floating-dock.tsx
│       └── section-wrapper.tsx
│
├── lib/
│   ├── utils.ts                # cn() helper
│   ├── api-client.ts           # Axios instance
│   └── types.ts                # TypeScript interfaces
│
├── config/
│   └── portfolio.ts            # Static content data
│
└── hooks/
    ├── use-chat.ts             # Chat state management
    └── use-messenger.ts        # Messenger open/close state
```

---

## 2. Root Layout Setup

### 2.1. Layout with Providers

```tsx
// src/app/layout.tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { QueryProvider } from "@/components/providers/query-provider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Thiện | AI Engineer",
  description: "The Transparent Core - Digital Identity of an AI Engineer",
  keywords: ["AI Engineer", "Portfolio", "Homelab", "Full Stack"],
  authors: [{ name: "Thiện" }],
  openGraph: {
    title: "Thiện | AI Engineer",
    description: "The Transparent Core",
    type: "website",
    locale: "vi_VN",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi" className="dark">
      <body className={`${inter.className} bg-zinc-950 text-white antialiased`}>
        <QueryProvider>
          {children}
        </QueryProvider>
      </body>
    </html>
  );
}
```

### 2.2. Query Provider

```tsx
// src/components/providers/query-provider.tsx
"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";

export function QueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000, // 1 minute
            refetchOnWindowFocus: false,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}
```

### 2.3. Global Styles

```css
/* src/app/globals.css */
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --background: 240 10% 3.9%; /* zinc-950 */
    --foreground: 0 0% 98%;

    /* shadcn/ui color tokens */
    --card: 240 10% 3.9%;
    --card-foreground: 0 0% 98%;
    --popover: 240 10% 3.9%;
    --popover-foreground: 0 0% 98%;
    --primary: 0 0% 98%;
    --primary-foreground: 240 5.9% 10%;
    --secondary: 240 3.7% 15.9%;
    --secondary-foreground: 0 0% 98%;
    --muted: 240 3.7% 15.9%;
    --muted-foreground: 240 5% 64.9%;
    --accent: 240 3.7% 15.9%;
    --accent-foreground: 0 0% 98%;
    --destructive: 0 62.8% 30.6%;
    --destructive-foreground: 0 0% 98%;
    --border: 240 3.7% 15.9%;
    --input: 240 3.7% 15.9%;
    --ring: 240 4.9% 83.9%;
    --radius: 0.75rem;
  }
}

@layer utilities {
  /* Noise texture overlay for glass effect */
  .bg-noise {
    position: relative;
    isolation: isolate;
  }

  .bg-noise::before {
    content: "";
    position: absolute;
    inset: 0;
    z-index: 10;
    pointer-events: none;
    opacity: 0.05; /* Adjust grain visibility here */
    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E");
  }

  /* Text gradient utility */
  .text-gradient {
    @apply bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent;
  }

  /* Glass highlight line */
  .glass-highlight {
    @apply absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent;
  }
}
```

### 2.4. Tailwind Configuration

```ts
// tailwind.config.ts
import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      animation: {
        "spin-slow": "spin 8s linear infinite",
        "spin-slower": "spin 12s linear infinite",
        "float": "float 6s ease-in-out infinite",
        "float-delayed": "float 6s ease-in-out 3s infinite",
        "pulse-glow": "pulse-glow 2s ease-in-out infinite",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-20px)" },
        },
        "pulse-glow": {
          "0%, 100%": { opacity: "0.5", transform: "scale(1)" },
          "50%": { opacity: "1", transform: "scale(1.05)" },
        },
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
```

---

## 3. Main Page Structure

```tsx
// src/app/page.tsx
import { MeshBackground } from "@/components/ui/mesh-background";
import { HeroSection } from "@/components/features/hero/hero-section";
import { BentoGrid } from "@/components/features/bento/bento-grid";
import { SoulSection } from "@/components/features/soul/soul-section";
import { MessengerButton } from "@/components/features/chat/messenger-button";
import { FloatingDock } from "@/components/shared/floating-dock";
import { portfolioConfig } from "@/config/portfolio";

export default function Home() {
  return (
    <main className="relative min-h-screen">
      {/* Background Layer */}
      <MeshBackground />

      {/* Content Layer */}
      <div className="relative z-10">
        {/* Hero Section */}
        <section id="hero" className="min-h-screen flex items-center justify-center px-4">
          <HeroSection data={portfolioConfig.hero} />
        </section>

        {/* Tech & Lab Section */}
        <section id="tech" className="min-h-screen py-20 px-4">
          <BentoGrid
            projects={portfolioConfig.projects}
            techStack={portfolioConfig.techStack}
          />
        </section>

        {/* Soul Section */}
        <section id="soul" className="min-h-screen py-20 px-4">
          <SoulSection data={portfolioConfig.lifestyle} />
        </section>
      </div>

      {/* Floating Elements */}
      <FloatingDock />
      <MessengerButton />
    </main>
  );
}
```

---

## 4. Core UI Components

### 4.1. Liquid Glass Card

```tsx
// src/components/ui/liquid-glass.tsx
"use client";

import { motion, type HTMLMotionProps } from "framer-motion";
import { cn } from "@/lib/utils";
import { forwardRef } from "react";

interface LiquidGlassProps extends HTMLMotionProps<"div"> {
  blur?: "sm" | "md" | "lg" | "xl";
  glow?: boolean;
  hoverable?: boolean;
}

const blurMap = {
  sm: "backdrop-blur-sm",
  md: "backdrop-blur-md",
  lg: "backdrop-blur-lg",
  xl: "backdrop-blur-xl",
};

export const LiquidGlass = forwardRef<HTMLDivElement, LiquidGlassProps>(
  ({ className, blur = "md", glow = false, hoverable = false, children, ...props }, ref) => {
    return (
      <motion.div
        ref={ref}
        className={cn(
          // Base glass styles
          "relative rounded-2xl",
          "bg-white/5",
          blurMap[blur],
          "border border-white/10",

          // Inner shadow for depth
          "shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)]",

          // Outer shadow
          "shadow-xl shadow-black/20",

          // Glow effect
          glow && "ring-1 ring-cyan-500/20 shadow-[0_0_30px_rgba(6,182,212,0.15)]",

          // Hover state
          hoverable && "transition-all duration-300 hover:bg-white/10 hover:border-white/20",

          className
        )}
        {...props}
      >
        {/* Top highlight gradient */}
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />

        {/* Content */}
        <div className="relative z-10">{children}</div>
      </motion.div>
    );
  }
);

LiquidGlass.displayName = "LiquidGlass";
```

### 4.2. Mesh Background

```tsx
// src/components/ui/mesh-background.tsx
"use client";

import { motion } from "framer-motion";

export function MeshBackground() {
  return (
    <div className="fixed inset-0 z-0 overflow-hidden bg-zinc-950">
      {/* Purple blob - Top left */}
      <motion.div
        animate={{
          scale: [1, 1.2, 1],
          x: [0, 100, 0],
          y: [0, 50, 0],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          repeatType: "reverse",
          ease: "easeInOut",
        }}
        className="absolute -top-[10%] -left-[10%] h-[500px] w-[500px] rounded-full bg-purple-900/40 blur-[100px]"
      />

      {/* Blue blob - Bottom right */}
      <motion.div
        animate={{
          scale: [1, 1.5, 1],
          x: [0, -100, 0],
          y: [0, -50, 0],
        }}
        transition={{
          duration: 25,
          repeat: Infinity,
          repeatType: "reverse",
          ease: "easeInOut",
        }}
        className="absolute -bottom-[10%] -right-[10%] h-[600px] w-[600px] rounded-full bg-blue-900/30 blur-[120px]"
      />

      {/* Cyan accent - Center */}
      <motion.div
        animate={{
          scale: [1, 1.1, 1],
          x: [0, 50, -50, 0],
          y: [0, 100, -100, 0],
        }}
        transition={{
          duration: 30,
          repeat: Infinity,
          repeatType: "reverse",
          ease: "easeInOut",
        }}
        className="absolute top-[40%] left-[30%] h-[300px] w-[300px] rounded-full bg-cyan-500/10 blur-[80px]"
      />

      {/* Noise overlay */}
      <div className="absolute inset-0 bg-noise opacity-50" />
    </div>
  );
}
```

---

## 5. Feature Components

### 5.1. Hero Section

```tsx
// src/components/features/hero/hero-section.tsx
"use client";

import { motion } from "framer-motion";
import { LiquidGlass } from "@/components/ui/liquid-glass";
import { Button } from "@/components/ui/button";
import { ArrowDown, Sparkles } from "lucide-react";
import Image from "next/image";

interface HeroData {
  name: string;
  title: string;
  tagline: string;
  avatar: string;
}

export function HeroSection({ data }: { data: HeroData }) {
  const scrollToTech = () => {
    document.getElementById("tech")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className="w-full max-w-2xl"
    >
      <LiquidGlass blur="xl" glow className="p-8 md:p-12">
        <div className="flex flex-col items-center text-center gap-6">
          {/* Avatar */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="relative"
          >
            <div className="w-32 h-32 rounded-full overflow-hidden ring-2 ring-white/20">
              <Image
                src={data.avatar}
                alt={data.name}
                width={128}
                height={128}
                className="object-cover"
              />
            </div>
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              className="absolute -inset-2 rounded-full border border-dashed border-cyan-500/30"
            />
          </motion.div>

          {/* Text */}
          <div className="space-y-2">
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">
              {data.name}
            </h1>
            <p className="text-xl text-cyan-400 flex items-center justify-center gap-2">
              <Sparkles className="w-5 h-5" />
              {data.title}
            </p>
            <p className="text-white/60 max-w-md">{data.tagline}</p>
          </div>

          {/* CTA */}
          <Button
            onClick={scrollToTech}
            variant="outline"
            className="mt-4 border-white/20 hover:bg-white/10"
          >
            <ArrowDown className="w-4 h-4 mr-2" />
            Explore
          </Button>
        </div>
      </LiquidGlass>
    </motion.div>
  );
}
```

### 5.2. Bento Grid

```tsx
// src/components/features/bento/bento-grid.tsx
"use client";

import { motion } from "framer-motion";
import { LiquidGlass } from "@/components/ui/liquid-glass";
import { TechStackWidget } from "./tech-stack-widget";
import { HomelabWidget } from "./homelab-widget";
import { ProjectCard } from "./project-card";
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
    </div>
  );
}
```

---

## 6. Chat Messenger Component

### 6.1. Messenger Button & Window

```tsx
// src/components/features/chat/messenger-button.tsx
"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, X } from "lucide-react";
import { MessengerWindow } from "./messenger-window";

export function MessengerButton() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Floating Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            layoutId="messenger-container"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            onClick={() => setIsOpen(true)}
            className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-cyan-500 text-white shadow-lg shadow-cyan-500/30 flex items-center justify-center hover:bg-cyan-400 transition-colors"
          >
            <MessageCircle className="w-6 h-6" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <MessengerWindow onClose={() => setIsOpen(false)} />
        )}
      </AnimatePresence>
    </>
  );
}
```

### 6.2. Messenger Window

```tsx
// src/components/features/chat/messenger-window.tsx
"use client";

import { motion } from "framer-motion";
import { X } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LiquidGlass } from "@/components/ui/liquid-glass";
import { ChatTab } from "./chat-tab";
import { ContactTab } from "./contact-tab";

interface MessengerWindowProps {
  onClose: () => void;
}

export function MessengerWindow({ onClose }: MessengerWindowProps) {
  return (
    <motion.div
      layoutId="messenger-container"
      className="fixed bottom-6 right-6 z-50 w-[350px] h-[500px]"
    >
      {/* Use LiquidGlass for consistent design system */}
      <LiquidGlass
        blur="xl"
        glow
        className="h-full w-full flex flex-col overflow-hidden bg-black/60"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            <h3 className="font-semibold">Liquid Messenger</h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-white/10 flex items-center justify-center transition-colors"
            aria-label="Close messenger"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="chat" className="flex-1 flex flex-col">
          <TabsList className="w-full rounded-none border-b border-white/10 bg-transparent">
            <TabsTrigger value="chat" className="flex-1">
              Chat AI
            </TabsTrigger>
            <TabsTrigger value="contact" className="flex-1">
              Email Me
            </TabsTrigger>
          </TabsList>

          <TabsContent value="chat" className="flex-1 m-0">
            <ChatTab />
          </TabsContent>

          <TabsContent value="contact" className="flex-1 m-0 p-4">
            <ContactTab />
          </TabsContent>
        </Tabs>
      </LiquidGlass>
    </motion.div>
  );
}
```

---

## 7. Data Fetching & API

### 7.1. API Client

```tsx
// src/lib/api-client.ts
import axios from "axios";

const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3334",
  headers: {
    "Content-Type": "application/json",
  },
});

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export interface ChatRequest {
  message: string;
  session_id?: string;
}

export interface ChatResponse {
  response: string;
  session_id: string;
}

export const chatApi = {
  sendMessage: async (request: ChatRequest): Promise<ChatResponse> => {
    const { data } = await apiClient.post<ChatResponse>(
      "/api/chat/portfolio-assistant",
      request
    );
    return data;
  },
};

export default apiClient;
```

### 7.2. Chat Hook

```tsx
// src/hooks/use-chat.ts
"use client";

import { useState, useCallback } from "react";
import { useMutation } from "@tanstack/react-query";
import { chatApi, type ChatMessage } from "@/lib/api-client";

export function useChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [sessionId, setSessionId] = useState<string | undefined>();

  const mutation = useMutation({
    mutationFn: chatApi.sendMessage,
    onSuccess: (data) => {
      setSessionId(data.session_id);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.response },
      ]);
    },
  });

  const sendMessage = useCallback(
    (content: string) => {
      // Add user message immediately
      setMessages((prev) => [...prev, { role: "user", content }]);

      // Send to API
      mutation.mutate({
        message: content,
        session_id: sessionId,
      });
    },
    [mutation, sessionId]
  );

  return {
    messages,
    sendMessage,
    isLoading: mutation.isPending,
    error: mutation.error,
  };
}
```

---

## 8. Static Content Configuration

```tsx
// src/config/portfolio.ts
export const portfolioConfig = {
  hero: {
    name: "Thiện",
    title: "AI Engineer @ Vexere",
    tagline: "Building intelligent systems that understand and assist humans.",
    avatar: "/images/avatar.jpg",
  },

  techStack: [
    { name: "Python", icon: "python", category: "language" },
    { name: "TypeScript", icon: "typescript", category: "language" },
    { name: "PySpark", icon: "spark", category: "data" },
    { name: "FastAPI", icon: "fastapi", category: "backend" },
    { name: "Next.js", icon: "nextjs", category: "frontend" },
    { name: "PostgreSQL", icon: "postgres", category: "database" },
    { name: "Docker", icon: "docker", category: "devops" },
    { name: "Kubernetes", icon: "k8s", category: "devops" },
  ],

  projects: [
    {
      id: "1",
      title: "AI Agent Platform",
      description: "Multi-agent system for automated workflows",
      tags: ["Python", "Pydantic-AI", "RAG"],
      image: "/images/projects/agent.png",
    },
    {
      id: "2",
      title: "Homelab Infrastructure",
      description: "Self-hosted services on Kubernetes",
      tags: ["Docker", "K8s", "Terraform"],
      image: "/images/projects/homelab.png",
    },
    {
      id: "3",
      title: "Healing Game",
      description: "8-bit relaxation game with procedural music",
      tags: ["Godot", "GDScript", "Pixel Art"],
      image: "/images/projects/game.png",
    },
  ],

  lifestyle: {
    music: {
      instruments: ["Guitar", "Piano"],
      currentlyPlaying: "Lo-fi Beats",
    },
    routines: [
      "Morning: Code & Coffee",
      "Afternoon: Deep Work",
      "Evening: Music & Reading",
    ],
  },

  social: {
    github: "https://github.com/chithien",
    linkedin: "https://linkedin.com/in/chithien",
    email: "contact@yourdomain.com",
  },
};

export type PortfolioConfig = typeof portfolioConfig;
```

---

## 9. Type Definitions

```tsx
// src/lib/types.ts
export interface Project {
  id: string;
  title: string;
  description: string;
  tags: string[];
  image: string;
  link?: string;
  github?: string;
}

export interface TechItem {
  name: string;
  icon: string;
  category: "language" | "frontend" | "backend" | "database" | "devops" | "data";
}

export interface HeroData {
  name: string;
  title: string;
  tagline: string;
  avatar: string;
}

export interface LifestyleData {
  music: {
    instruments: string[];
    currentlyPlaying: string;
  };
  routines: string[];
}
```

---

## 10. Dockerfile

```dockerfile
# apps/web/Dockerfile
FROM node:20-alpine AS base

# Dependencies stage
FROM base AS deps
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci

# Development stage
FROM base AS development
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
EXPOSE 3000
CMD ["npm", "run", "dev"]

# Builder stage
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED 1
RUN npm run build

# Production stage
FROM base AS runner
WORKDIR /app
ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
EXPOSE 3000
ENV PORT 3000
CMD ["node", "server.js"]
```

---

## Next Steps

- **[02-backend-implementation.md](./02-backend-implementation.md)** - FastAPI & Agent implementation
- **[04-component-specs.md](./04-component-specs.md)** - Detailed component specifications
