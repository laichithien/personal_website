# Component Specifications

**Document:** Implementation Guide - UI Components
**Project:** The Transparent Core
**Design System:** Liquid Glass (Glassmorphism + Distortion)

---

## 1. Design System Overview

### 1.1. Visual Language

```
┌─────────────────────────────────────────────────────────────┐
│                     LIQUID GLASS LAYERS                      │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌─────────────────────────────────────────────────────┐    │
│  │  Layer 3: CONTENT (z-30)                            │    │
│  │  • Text, icons, interactive elements                │    │
│  │  • Full opacity, high contrast                      │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                              │
│  ┌─────────────────────────────────────────────────────┐    │
│  │  Layer 2: SURFACE (z-20)                            │    │
│  │  • Semi-transparent background (bg-white/5)         │    │
│  │  • Border (border-white/10)                         │    │
│  │  • Inner shadow for depth                           │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                              │
│  ┌─────────────────────────────────────────────────────┐    │
│  │  Layer 1: REFRACTION (z-10)                         │    │
│  │  • Backdrop blur effect                             │    │
│  │  • SVG distortion filter (optional)                 │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                              │
│  ┌─────────────────────────────────────────────────────┐    │
│  │  Layer 0: BACKGROUND (z-0)                          │    │
│  │  • Mesh gradient (animated)                         │    │
│  │  • Noise texture overlay                            │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### 1.2. Color Palette

```css
/* Base Colors */
--bg-primary: #09090b;        /* zinc-950 */
--bg-secondary: #18181b;      /* zinc-900 */

/* Glass Colors */
--glass-surface: rgba(255, 255, 255, 0.05);
--glass-border: rgba(255, 255, 255, 0.1);
--glass-highlight: rgba(255, 255, 255, 0.2);

/* Accent Colors */
--accent-cyan: #06b6d4;       /* cyan-500 */
--accent-purple: #a855f7;     /* purple-500 */
--accent-blue: #3b82f6;       /* blue-500 */

/* Text Colors */
--text-primary: rgba(255, 255, 255, 1);
--text-secondary: rgba(255, 255, 255, 0.6);
--text-muted: rgba(255, 255, 255, 0.4);
```

---

## 2. Core Components

### 2.1. LiquidGlass Card

**File:** `src/components/ui/liquid-glass.tsx`

#### Props Interface

```typescript
interface LiquidGlassProps extends HTMLMotionProps<"div"> {
  blur?: "sm" | "md" | "lg" | "xl";
  glow?: boolean;
  hoverable?: boolean;
  distortion?: boolean;
  children: React.ReactNode;
}
```

#### Implementation

```tsx
"use client";

import { motion, type HTMLMotionProps } from "framer-motion";
import { cn } from "@/lib/utils";
import { forwardRef } from "react";

const blurMap = {
  sm: "backdrop-blur-sm",
  md: "backdrop-blur-md",
  lg: "backdrop-blur-lg",
  xl: "backdrop-blur-xl",
};

export const LiquidGlass = forwardRef<HTMLDivElement, LiquidGlassProps>(
  (
    {
      className,
      blur = "md",
      glow = false,
      hoverable = false,
      distortion = false,
      children,
      ...props
    },
    ref
  ) => {
    return (
      <>
        {/* SVG Filter for distortion (optional) */}
        {distortion && (
          <svg className="absolute w-0 h-0">
            <defs>
              <filter id="liquid-distort">
                <feTurbulence
                  type="fractalNoise"
                  baseFrequency="0.01"
                  numOctaves="3"
                  result="noise"
                />
                <feDisplacementMap
                  in="SourceGraphic"
                  in2="noise"
                  scale="5"
                  xChannelSelector="R"
                  yChannelSelector="G"
                />
              </filter>
            </defs>
          </svg>
        )}

        <motion.div
          ref={ref}
          className={cn(
            // Base structure
            "relative rounded-2xl overflow-hidden",

            // Glass surface
            "bg-white/5",
            blurMap[blur],

            // Border
            "border border-white/10",

            // Shadows
            "shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)]",
            "shadow-xl shadow-black/20",

            // Glow effect
            glow && [
              "ring-1 ring-cyan-500/20",
              "shadow-[0_0_30px_rgba(6,182,212,0.15)]",
            ],

            // Hover state
            hoverable && [
              "transition-all duration-300",
              "hover:bg-white/10",
              "hover:border-white/20",
              "hover:shadow-[0_0_40px_rgba(6,182,212,0.2)]",
            ],

            // Distortion filter
            distortion && "filter-[url(#liquid-distort)]",

            className
          )}
          {...props}
        >
          {/* Top highlight line */}
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />

          {/* Content wrapper */}
          <div className="relative z-10">{children}</div>

          {/* Bottom fade (optional depth effect) */}
          <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
        </motion.div>
      </>
    );
  }
);

LiquidGlass.displayName = "LiquidGlass";
```

#### Usage Examples

```tsx
// Basic card
<LiquidGlass className="p-6">
  <h2>Hello World</h2>
</LiquidGlass>

// Hero card with glow
<LiquidGlass blur="xl" glow className="p-12">
  <HeroContent />
</LiquidGlass>

// Interactive project card
<LiquidGlass hoverable className="p-4 cursor-pointer">
  <ProjectPreview />
</LiquidGlass>
```

---

### 2.2. Mesh Background

**File:** `src/components/ui/mesh-background.tsx`

#### Implementation

```tsx
"use client";

import { motion } from "framer-motion";

interface MeshBlob {
  color: string;
  size: number;
  position: { top?: string; bottom?: string; left?: string; right?: string };
  animation: {
    scale: number[];
    x: number[];
    y: number[];
    duration: number;
  };
  blur: number;
}

const blobs: MeshBlob[] = [
  {
    color: "bg-purple-900/40",
    size: 500,
    position: { top: "-10%", left: "-10%" },
    animation: {
      scale: [1, 1.2, 1],
      x: [0, 100, 0],
      y: [0, 50, 0],
      duration: 20,
    },
    blur: 100,
  },
  {
    color: "bg-blue-900/30",
    size: 600,
    position: { bottom: "-10%", right: "-10%" },
    animation: {
      scale: [1, 1.5, 1],
      x: [0, -100, 0],
      y: [0, -50, 0],
      duration: 25,
    },
    blur: 120,
  },
  {
    color: "bg-cyan-500/10",
    size: 300,
    position: { top: "40%", left: "30%" },
    animation: {
      scale: [1, 1.1, 1],
      x: [0, 50, -50, 0],
      y: [0, 100, -100, 0],
      duration: 30,
    },
    blur: 80,
  },
];

export function MeshBackground() {
  return (
    <div className="fixed inset-0 z-0 overflow-hidden bg-zinc-950">
      {blobs.map((blob, index) => (
        <motion.div
          key={index}
          animate={{
            scale: blob.animation.scale,
            x: blob.animation.x,
            y: blob.animation.y,
          }}
          transition={{
            duration: blob.animation.duration,
            repeat: Infinity,
            repeatType: "reverse",
            ease: "easeInOut",
          }}
          className={cn(
            "absolute rounded-full",
            blob.color
          )}
          style={{
            width: blob.size,
            height: blob.size,
            filter: `blur(${blob.blur}px)`,
            ...blob.position,
          }}
        />
      ))}

      {/* Noise overlay */}
      <div className="absolute inset-0 bg-noise opacity-50" />
    </div>
  );
}
```

---

### 2.3. Floating Dock Navigation

**File:** `src/components/shared/floating-dock.tsx`

#### Implementation

```tsx
"use client";

import { motion } from "framer-motion";
import { LiquidGlass } from "@/components/ui/liquid-glass";
import { Home, Code, Heart, MessageCircle } from "lucide-react";

const navItems = [
  { id: "hero", icon: Home, label: "Home" },
  { id: "tech", icon: Code, label: "Tech" },
  { id: "soul", icon: Heart, label: "Soul" },
  { id: "contact", icon: MessageCircle, label: "Contact" },
];

export function FloatingDock() {
  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <motion.div
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 1, duration: 0.5 }}
      className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40"
    >
      <LiquidGlass blur="xl" className="px-2 py-2">
        <nav className="flex items-center gap-1">
          {navItems.map((item) => (
            <motion.button
              key={item.id}
              onClick={() => scrollTo(item.id)}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              className="p-3 rounded-xl hover:bg-white/10 transition-colors group"
            >
              <item.icon className="w-5 h-5 text-white/60 group-hover:text-cyan-400 transition-colors" />
              <span className="sr-only">{item.label}</span>
            </motion.button>
          ))}
        </nav>
      </LiquidGlass>
    </motion.div>
  );
}
```

---

### 2.4. Tech Stack Widget

**File:** `src/components/features/bento/tech-stack-widget.tsx`

#### Implementation

```tsx
"use client";

import { motion } from "framer-motion";
import { LiquidGlass } from "@/components/ui/liquid-glass";
import type { TechItem } from "@/lib/types";

interface TechStackWidgetProps {
  items: TechItem[];
}

export function TechStackWidget({ items }: TechStackWidgetProps) {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.05 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { opacity: 1, scale: 1 },
  };

  return (
    <LiquidGlass blur="lg" className="h-full p-6">
      <h3 className="text-lg font-semibold mb-4 text-white/80">
        The Arsenal
      </h3>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className="flex flex-wrap gap-3"
      >
        {items.map((tech) => (
          <motion.div
            key={tech.name}
            variants={itemVariants}
            whileHover={{
              scale: 1.05,
              y: -2,
            }}
            className="group"
          >
            <div className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 hover:border-cyan-500/30 hover:bg-white/10 transition-all cursor-default">
              <span className="text-sm text-white/70 group-hover:text-cyan-400 transition-colors">
                {tech.name}
              </span>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Floating icons animation */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {items.slice(0, 5).map((tech, i) => (
          <motion.div
            key={`float-${tech.name}`}
            animate={{
              y: [0, -20, 0],
              opacity: [0.1, 0.3, 0.1],
            }}
            transition={{
              duration: 3 + i,
              repeat: Infinity,
              delay: i * 0.5,
            }}
            className="absolute text-4xl opacity-10"
            style={{
              left: `${20 + i * 15}%`,
              top: `${30 + i * 10}%`,
            }}
          >
            {/* Icon placeholder */}
          </motion.div>
        ))}
      </div>
    </LiquidGlass>
  );
}
```

---

### 2.5. Project Card

**File:** `src/components/features/bento/project-card.tsx`

#### Implementation

```tsx
"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { LiquidGlass } from "@/components/ui/liquid-glass";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ExternalLink, Github } from "lucide-react";
import Image from "next/image";
import type { Project } from "@/lib/types";

interface ProjectCardProps {
  project: Project;
}

export function ProjectCard({ project }: ProjectCardProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <motion.div
        layoutId={`project-${project.id}`}
        onClick={() => setIsOpen(true)}
        className="cursor-pointer h-full"
      >
        <LiquidGlass hoverable className="h-full p-4">
          {/* Thumbnail */}
          <div className="relative aspect-video rounded-lg overflow-hidden mb-3 bg-white/5">
            <Image
              src={project.image}
              alt={project.title}
              fill
              className="object-cover"
            />
          </div>

          {/* Title */}
          <h4 className="font-medium text-white mb-1">{project.title}</h4>

          {/* Description */}
          <p className="text-sm text-white/60 line-clamp-2">
            {project.description}
          </p>

          {/* Tags */}
          <div className="flex flex-wrap gap-1 mt-3">
            {project.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="px-2 py-0.5 text-xs rounded-full bg-white/5 text-white/50"
              >
                {tag}
              </span>
            ))}
          </div>
        </LiquidGlass>
      </motion.div>

      {/* Detail Dialog */}
      <AnimatePresence>
        {isOpen && (
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogContent className="bg-zinc-900/95 backdrop-blur-xl border-white/10 max-w-2xl">
              <DialogHeader>
                <DialogTitle>{project.title}</DialogTitle>
              </DialogHeader>

              <motion.div
                layoutId={`project-${project.id}`}
                className="space-y-4"
              >
                {/* Large image */}
                <div className="relative aspect-video rounded-lg overflow-hidden">
                  <Image
                    src={project.image}
                    alt={project.title}
                    fill
                    className="object-cover"
                  />
                </div>

                {/* Full description */}
                <p className="text-white/70">{project.description}</p>

                {/* All tags */}
                <div className="flex flex-wrap gap-2">
                  {project.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-3 py-1 text-sm rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                {/* Links */}
                <div className="flex gap-3 pt-4">
                  {project.link && (
                    <a
                      href={project.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
                    >
                      <ExternalLink className="w-4 h-4" />
                      Live Demo
                    </a>
                  )}
                  {project.github && (
                    <a
                      href={project.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
                    >
                      <Github className="w-4 h-4" />
                      Source
                    </a>
                  )}
                </div>
              </motion.div>
            </DialogContent>
          </Dialog>
        )}
      </AnimatePresence>
    </>
  );
}
```

---

### 2.6. Music Player Widget

**File:** `src/components/features/soul/music-player.tsx`

#### Implementation

```tsx
"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { LiquidGlass } from "@/components/ui/liquid-glass";
import { Play, Pause, SkipBack, SkipForward, Volume2 } from "lucide-react";

interface Track {
  title: string;
  artist: string;
  cover?: string;
}

const mockTrack: Track = {
  title: "Midnight Lo-Fi",
  artist: "Chill Beats",
};

export function MusicPlayer() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(35); // Mock progress

  return (
    <LiquidGlass blur="lg" glow className="p-6">
      <div className="flex items-center gap-4">
        {/* Album art */}
        <motion.div
          animate={isPlaying ? { rotate: 360 } : { rotate: 0 }}
          transition={{
            duration: 3,
            repeat: isPlaying ? Infinity : 0,
            ease: "linear",
          }}
          className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center"
        >
          <div className="w-4 h-4 rounded-full bg-zinc-900" />
        </motion.div>

        {/* Track info */}
        <div className="flex-1 min-w-0">
          <p className="font-medium text-white truncate">{mockTrack.title}</p>
          <p className="text-sm text-white/60 truncate">{mockTrack.artist}</p>

          {/* Progress bar */}
          <div className="mt-2 h-1 rounded-full bg-white/10 overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-cyan-500 to-purple-500"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-4 mt-4">
        <button className="p-2 hover:bg-white/10 rounded-full transition-colors">
          <SkipBack className="w-4 h-4 text-white/60" />
        </button>

        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsPlaying(!isPlaying)}
          className="p-3 bg-white/10 hover:bg-white/20 rounded-full transition-colors"
        >
          {isPlaying ? (
            <Pause className="w-5 h-5 text-white" />
          ) : (
            <Play className="w-5 h-5 text-white ml-0.5" />
          )}
        </motion.button>

        <button className="p-2 hover:bg-white/10 rounded-full transition-colors">
          <SkipForward className="w-4 h-4 text-white/60" />
        </button>
      </div>

      {/* Visualizer bars (decorative) */}
      <div className="flex items-end justify-center gap-1 mt-4 h-8">
        {Array.from({ length: 12 }).map((_, i) => (
          <motion.div
            key={i}
            animate={
              isPlaying
                ? {
                    height: [8, 24, 8],
                  }
                : { height: 8 }
            }
            transition={{
              duration: 0.5,
              repeat: Infinity,
              delay: i * 0.05,
            }}
            className="w-1 rounded-full bg-gradient-to-t from-cyan-500 to-purple-500"
          />
        ))}
      </div>
    </LiquidGlass>
  );
}
```

---

### 2.7. Life Algorithm (Code Display)

**File:** `src/components/features/soul/life-algorithm.tsx`

#### Implementation

```tsx
"use client";

import { motion } from "framer-motion";
import { LiquidGlass } from "@/components/ui/liquid-glass";

const codeLines = [
  { type: "comment", content: "// Daily routine algorithm" },
  { type: "keyword", content: "function " },
  { type: "function", content: "dailyLife" },
  { type: "bracket", content: "() {" },
  { type: "indent", content: "  morning: " },
  { type: "string", content: '"Code & Coffee"' },
  { type: "indent", content: "  afternoon: " },
  { type: "string", content: '"Deep Work Mode"' },
  { type: "indent", content: "  evening: " },
  { type: "string", content: '"Music & Reading"' },
  { type: "indent", content: "  return " },
  { type: "variable", content: "happiness" },
  { type: "bracket", content: "}" },
];

const colorMap: Record<string, string> = {
  comment: "text-green-400",
  keyword: "text-purple-400",
  function: "text-cyan-400",
  bracket: "text-white/60",
  indent: "text-white/40",
  string: "text-amber-400",
  variable: "text-blue-400",
};

export function LifeAlgorithm() {
  return (
    <LiquidGlass blur="lg" className="p-6 font-mono text-sm">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-3 h-3 rounded-full bg-red-500" />
        <div className="w-3 h-3 rounded-full bg-yellow-500" />
        <div className="w-3 h-3 rounded-full bg-green-500" />
        <span className="ml-2 text-white/40 text-xs">life.ts</span>
      </div>

      <div className="space-y-1">
        {codeLines.map((line, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: -10 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            viewport={{ once: true }}
            className={colorMap[line.type]}
          >
            {line.content}
          </motion.div>
        ))}
      </div>

      {/* Blinking cursor */}
      <motion.span
        animate={{ opacity: [1, 0, 1] }}
        transition={{ duration: 1, repeat: Infinity }}
        className="inline-block w-2 h-4 bg-cyan-400 ml-1"
      />
    </LiquidGlass>
  );
}
```

---

## 3. Animation Patterns

### 3.1. Stagger Children

```tsx
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};
```

### 3.2. Shared Element Transition

```tsx
// Use layoutId for morph animations
<motion.div layoutId="messenger-container">
  {isOpen ? <ChatWindow /> : <ChatButton />}
</motion.div>
```

### 3.3. Scroll-Triggered Animation

```tsx
<motion.div
  initial={{ opacity: 0, y: 50 }}
  whileInView={{ opacity: 1, y: 0 }}
  viewport={{ once: true, margin: "-100px" }}
  transition={{ duration: 0.5 }}
>
  Content
</motion.div>
```

---

## 4. Responsive Guidelines

### 4.1. Breakpoints

```tsx
// Tailwind breakpoints
sm: 640px
md: 768px
lg: 1024px
xl: 1280px
2xl: 1536px

// Mobile-first approach
<div className="
  grid-cols-1       // Mobile: Stack
  md:grid-cols-2    // Tablet: 2 columns
  lg:grid-cols-4    // Desktop: 4 columns
">
```

### 4.2. Performance on Mobile

```tsx
// Reduce effects on mobile
const isMobile = useMediaQuery("(max-width: 768px)");

<LiquidGlass
  blur={isMobile ? "sm" : "xl"}
  distortion={!isMobile}
>
```

---

## 5. Accessibility

### 5.1. Focus States

```tsx
className="
  focus:outline-none
  focus-visible:ring-2
  focus-visible:ring-cyan-500
  focus-visible:ring-offset-2
  focus-visible:ring-offset-zinc-900
"
```

### 5.2. Screen Reader

```tsx
// Always include accessible labels
<button aria-label="Open chat">
  <MessageCircle className="w-5 h-5" />
  <span className="sr-only">Open chat messenger</span>
</button>
```

### 5.3. Reduced Motion

```tsx
// Respect user preferences
const prefersReducedMotion = useReducedMotion();

<motion.div
  animate={prefersReducedMotion ? {} : { y: [0, -10, 0] }}
>
```

---

## Next Steps

- **[05-api-specification.md](./05-api-specification.md)** - API documentation
