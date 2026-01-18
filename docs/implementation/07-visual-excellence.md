# Visual Excellence & Animation Guide

**Document:** Production Visual Guide
**Project:** The Transparent Core
**Design Language:** Liquid Glass - Premium Glassmorphism with Organic Motion

---

## 1. Design Philosophy

### 1.1. Visual Principles

```
┌─────────────────────────────────────────────────────────────┐
│                    LIQUID GLASS IDENTITY                     │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  💧 FLUIDITY                                                 │
│  └─ Motion feels organic, never mechanical                  │
│  └─ Elements respond like water - flowing, rippling         │
│  └─ Transitions have weight and momentum                    │
│                                                              │
│  🔮 DEPTH                                                    │
│  └─ Multiple visual layers create z-depth illusion          │
│  └─ Light interacts realistically with surfaces             │
│  └─ Shadows suggest floating elevation                      │
│                                                              │
│  ✨ POLISH                                                   │
│  └─ Every interaction has feedback                          │
│  └─ Micro-animations delight without distracting            │
│  └─ Attention to details that most won't notice             │
│                                                              │
│  🌊 BREATHING                                                │
│  └─ Subtle ambient animations give life                     │
│  └─ Elements feel alive even when not interacting           │
│  └─ Slow, calming motion creates mood                       │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### 1.2. Motion Values

| Property | Value | Rationale |
|----------|-------|-----------|
| Primary Duration | 300-500ms | Perceptible but not slow |
| Micro-interaction | 100-200ms | Responsive feedback |
| Page Transition | 400-600ms | Smooth but not sluggish |
| Background Animation | 15-30s | Ambient, non-distracting |
| Spring Stiffness | 100-200 | Organic, not bouncy |
| Spring Damping | 15-25 | Controlled settling |

---

## 2. Advanced Liquid Glass System

### 2.1. Multi-Layer Glass Component

> **⚠️ CRITICAL: Hydration Safety**
>
> Never use `Math.random()` directly in JSX - it causes hydration errors!
> Server renders one value, client renders another → Next.js throws errors.
> Use `useState` + `useEffect` for any random values.

```tsx
// shared/components/ui/liquid-glass/liquid-glass.tsx
'use client';

import { forwardRef, useId, useState, useEffect } from 'react';
import { motion, type HTMLMotionProps, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { cn } from '@/shared/lib/utils';

// ============================================
// Types
// ============================================

type BlurLevel = 'none' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
type GlowColor = 'cyan' | 'purple' | 'blue' | 'none';

interface LiquidGlassProps extends Omit<HTMLMotionProps<'div'>, 'style'> {
  /** Backdrop blur intensity */
  blur?: BlurLevel;
  /** Glow color accent */
  glow?: GlowColor;
  /** Enable SVG distortion effect */
  distortion?: boolean;
  /** Distortion intensity (1-10) */
  distortionIntensity?: number;
  /** Enable 3D tilt on hover */
  tilt?: boolean;
  /** Enable inner light reflection */
  innerLight?: boolean;
  /** Enable mouse-following spotlight */
  spotlight?: boolean;
  children: React.ReactNode;
}

// ============================================
// Constants
// ============================================

const BLUR_MAP: Record<BlurLevel, string> = {
  none: '',
  sm: 'backdrop-blur-sm',
  md: 'backdrop-blur-md',
  lg: 'backdrop-blur-lg',
  xl: 'backdrop-blur-xl',
  '2xl': 'backdrop-blur-2xl',
};

const GLOW_MAP: Record<GlowColor, string> = {
  none: '',
  cyan: 'shadow-[0_0_40px_rgba(6,182,212,0.15)] ring-1 ring-cyan-500/20',
  purple: 'shadow-[0_0_40px_rgba(168,85,247,0.15)] ring-1 ring-purple-500/20',
  blue: 'shadow-[0_0_40px_rgba(59,130,246,0.15)] ring-1 ring-blue-500/20',
};

// ============================================
// Component
// ============================================

export const LiquidGlass = forwardRef<HTMLDivElement, LiquidGlassProps>(
  (
    {
      blur = 'md',
      glow = 'none',
      distortion = false,
      distortionIntensity = 3,
      tilt = false,
      innerLight = true,
      spotlight = false,
      className,
      children,
      ...props
    },
    ref
  ) => {
    const filterId = useId();

    // HYDRATION FIX: Generate random seed after mount only
    const [seed, setSeed] = useState(0);
    useEffect(() => {
      setSeed(Math.floor(Math.random() * 100));
    }, []);

    // Mouse tracking for spotlight & tilt
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);

    // Smooth spring for tilt
    const springConfig = { stiffness: 150, damping: 15, mass: 0.1 };
    const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [5, -5]), springConfig);
    const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-5, 5]), springConfig);

    // Spotlight position
    const spotlightX = useSpring(useTransform(mouseX, [-0.5, 0.5], [0, 100]), springConfig);
    const spotlightY = useSpring(useTransform(mouseY, [-0.5, 0.5], [0, 100]), springConfig);

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
      if (!tilt && !spotlight) return;

      const rect = e.currentTarget.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;

      mouseX.set(x);
      mouseY.set(y);
    };

    const handleMouseLeave = () => {
      mouseX.set(0);
      mouseY.set(0);
    };

    return (
      <>
        {/* SVG Distortion Filter */}
        {distortion && (
          <svg className="absolute w-0 h-0" aria-hidden="true">
            <defs>
              <filter id={filterId}>
                <feTurbulence
                  type="fractalNoise"
                  baseFrequency="0.015"
                  numOctaves="2"
                  result="noise"
                  seed={seed} // Uses state to avoid hydration mismatch
                >
                  <animate
                    attributeName="baseFrequency"
                    values="0.015;0.02;0.015"
                    dur="10s"
                    repeatCount="indefinite"
                  />
                </feTurbulence>
                <feDisplacementMap
                  in="SourceGraphic"
                  in2="noise"
                  scale={distortionIntensity}
                  xChannelSelector="R"
                  yChannelSelector="G"
                />
              </filter>
            </defs>
          </svg>
        )}

        <motion.div
          ref={ref}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          style={{
            rotateX: tilt ? rotateX : 0,
            rotateY: tilt ? rotateY : 0,
            transformStyle: 'preserve-3d',
            filter: distortion ? `url(#${filterId})` : undefined,
          }}
          className={cn(
            // Base structure
            'relative rounded-2xl overflow-hidden',
            'transform-gpu', // GPU acceleration

            // Glass surface
            'bg-gradient-to-br from-white/[0.08] to-white/[0.02]',
            BLUR_MAP[blur],

            // Border with gradient
            'border border-white/[0.08]',

            // Shadows for depth
            'shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)]',
            'shadow-xl shadow-black/30',

            // Glow effect
            GLOW_MAP[glow],

            className
          )}
          {...props}
        >
          {/* Top edge highlight */}
          <div
            className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent"
            aria-hidden="true"
          />

          {/* Left edge highlight */}
          <div
            className="absolute inset-y-0 left-0 w-px bg-gradient-to-b from-white/20 via-transparent to-transparent"
            aria-hidden="true"
          />

          {/* Inner light reflection */}
          {innerLight && (
            <div
              className="absolute top-0 left-0 w-1/2 h-1/3 bg-gradient-to-br from-white/[0.07] to-transparent rounded-tl-2xl pointer-events-none"
              aria-hidden="true"
            />
          )}

          {/* Mouse-following spotlight */}
          {spotlight && (
            <motion.div
              className="absolute w-40 h-40 rounded-full bg-white/10 blur-3xl pointer-events-none"
              style={{
                left: spotlightX,
                top: spotlightY,
                x: '-50%',
                y: '-50%',
              }}
              aria-hidden="true"
            />
          )}

          {/* Content */}
          <div className="relative z-10">{children}</div>

          {/* Bottom gradient fade */}
          <div
            className="absolute inset-x-0 bottom-0 h-1/4 bg-gradient-to-t from-black/20 to-transparent pointer-events-none"
            aria-hidden="true"
          />
        </motion.div>
      </>
    );
  }
);

LiquidGlass.displayName = 'LiquidGlass';
```

### 2.1.1. Production Optimization: Global SVG Filter

> **🚀 PERFORMANCE: Shared SVG Filters**
>
> If your page has many LiquidGlass cards with distortion, each renders its own
> SVG filter. 50 cards = 50 SVG filters = browser performance hit.
>
> **Solution:** Define ONE global filter in `layout.tsx` and reference it everywhere.

```tsx
// app/layout.tsx - Add this inside the <body> tag
<svg className="absolute w-0 h-0" aria-hidden="true">
  <defs>
    {/* Global distortion filter - one for all components */}
    <filter id="global-liquid-distort">
      <feTurbulence
        type="fractalNoise"
        baseFrequency="0.015"
        numOctaves="2"
        result="noise"
        seed={42} // Fixed seed for consistency
      >
        <animate
          attributeName="baseFrequency"
          values="0.015;0.02;0.015"
          dur="10s"
          repeatCount="indefinite"
        />
      </feTurbulence>
      <feDisplacementMap
        in="SourceGraphic"
        in2="noise"
        scale={3}
        xChannelSelector="R"
        yChannelSelector="G"
      />
    </filter>
  </defs>
</svg>
```

```tsx
// In LiquidGlass - reference global filter instead of inline
<motion.div
  style={{
    filter: distortion ? 'url(#global-liquid-distort)' : undefined,
    // ... other styles
  }}
>
```

**When to use which approach:**
| Scenario | Approach |
|----------|----------|
| Few cards (< 10) with unique distortion | Inline filter (current) |
| Many cards with same distortion | Global filter |
| Hero card only needs distortion | Inline for hero, disable for others |

### 2.2. Advanced Mesh Background

```tsx
// shared/components/layout/mesh-background.tsx
'use client';

import { useRef, useEffect } from 'react';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';

interface GradientOrb {
  id: string;
  color: string;
  size: number;
  position: { x: string; y: string };
  animation: {
    x: number[];
    y: number[];
    scale: number[];
    duration: number;
  };
  blur: number;
}

const GRADIENT_ORBS: GradientOrb[] = [
  {
    id: 'orb-purple',
    color: 'bg-purple-600',
    size: 600,
    position: { x: '-10%', y: '-10%' },
    animation: {
      x: [0, 150, 50, 0],
      y: [0, 80, 120, 0],
      scale: [1, 1.2, 0.9, 1],
      duration: 25,
    },
    blur: 120,
  },
  {
    id: 'orb-blue',
    color: 'bg-blue-600',
    size: 500,
    position: { x: '70%', y: '60%' },
    animation: {
      x: [0, -100, -50, 0],
      y: [0, -60, 40, 0],
      scale: [1, 1.3, 1.1, 1],
      duration: 30,
    },
    blur: 100,
  },
  {
    id: 'orb-cyan',
    color: 'bg-cyan-500',
    size: 350,
    position: { x: '30%', y: '70%' },
    animation: {
      x: [0, 80, -40, 0],
      y: [0, -80, 60, 0],
      scale: [1, 1.1, 1.2, 1],
      duration: 20,
    },
    blur: 80,
  },
  {
    id: 'orb-pink',
    color: 'bg-pink-500',
    size: 300,
    position: { x: '80%', y: '10%' },
    animation: {
      x: [0, -60, 30, 0],
      y: [0, 100, 50, 0],
      scale: [1, 0.9, 1.1, 1],
      duration: 22,
    },
    blur: 90,
  },
];

export function MeshBackground() {
  const containerRef = useRef<HTMLDivElement>(null);

  // Parallax on scroll
  const { scrollYProgress } = useScroll();
  const parallaxY = useTransform(scrollYProgress, [0, 1], [0, -200]);
  const smoothParallax = useSpring(parallaxY, { stiffness: 50, damping: 20 });

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-0 overflow-hidden"
      aria-hidden="true"
    >
      {/* Base gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-zinc-950 via-zinc-900 to-zinc-950" />

      {/* Animated orbs */}
      <motion.div style={{ y: smoothParallax }} className="absolute inset-0">
        {GRADIENT_ORBS.map((orb) => (
          <motion.div
            key={orb.id}
            animate={{
              x: orb.animation.x,
              y: orb.animation.y,
              scale: orb.animation.scale,
            }}
            transition={{
              duration: orb.animation.duration,
              repeat: Infinity,
              repeatType: 'reverse',
              ease: 'easeInOut',
            }}
            className={`absolute rounded-full ${orb.color} opacity-30`}
            style={{
              width: orb.size,
              height: orb.size,
              left: orb.position.x,
              top: orb.position.y,
              filter: `blur(${orb.blur}px)`,
            }}
          />
        ))}
      </motion.div>

      {/* Grain/noise overlay */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Vignette */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(0,0,0,0.4)_100%)]" />

      {/* Subtle grid pattern */}
      <div
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                           linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
          backgroundSize: '100px 100px',
        }}
      />
    </div>
  );
}
```

---

## 3. Micro-Interactions Catalog

### 3.1. Button Interactions

```tsx
// shared/components/ui/button/button.tsx
'use client';

import { forwardRef } from 'react';
import { motion, type HTMLMotionProps } from 'framer-motion';
import { cn } from '@/shared/lib/utils';

interface ButtonProps extends HTMLMotionProps<'button'> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'glass';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
}

const variants = {
  primary: 'bg-cyan-500 hover:bg-cyan-400 text-zinc-900 font-medium',
  secondary: 'bg-white/10 hover:bg-white/20 text-white',
  ghost: 'bg-transparent hover:bg-white/5 text-white/70 hover:text-white',
  glass: 'bg-white/5 backdrop-blur-md border border-white/10 hover:bg-white/10 text-white',
};

const sizes = {
  sm: 'px-3 py-1.5 text-sm rounded-lg',
  md: 'px-4 py-2 text-sm rounded-xl',
  lg: 'px-6 py-3 text-base rounded-xl',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', loading, className, children, ...props }, ref) => {
    return (
      <motion.button
        ref={ref}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        transition={{ type: 'spring', stiffness: 400, damping: 17 }}
        className={cn(
          'relative inline-flex items-center justify-center gap-2',
          'transition-colors duration-200',
          'focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-900',
          'disabled:opacity-50 disabled:pointer-events-none',
          variants[variant],
          sizes[size],
          className
        )}
        disabled={loading}
        {...props}
      >
        {/* Shine effect on hover */}
        <motion.span
          className="absolute inset-0 rounded-inherit overflow-hidden"
          initial={false}
          whileHover={{
            background: [
              'linear-gradient(90deg, transparent 0%, transparent 100%)',
              'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.1) 50%, transparent 100%)',
              'linear-gradient(90deg, transparent 0%, transparent 100%)',
            ],
          }}
          transition={{ duration: 0.6 }}
        />

        {/* Loading spinner */}
        {loading && (
          <motion.span
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            className="w-4 h-4 border-2 border-current border-t-transparent rounded-full"
          />
        )}

        <span className="relative z-10">{children}</span>
      </motion.button>
    );
  }
);

Button.displayName = 'Button';
```

### 3.2. Card Hover Effects

```tsx
// Magnetic card that follows cursor slightly
'use client';

import { useRef } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';

interface MagneticCardProps {
  children: React.ReactNode;
  className?: string;
  intensity?: number;
}

export function MagneticCard({ children, className, intensity = 0.1 }: MagneticCardProps) {
  const ref = useRef<HTMLDivElement>(null);

  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const springConfig = { stiffness: 150, damping: 15 };
  const springX = useSpring(x, springConfig);
  const springY = useSpring(y, springConfig);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!ref.current) return;

    const rect = ref.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const deltaX = (e.clientX - centerX) * intensity;
    const deltaY = (e.clientY - centerY) * intensity;

    x.set(deltaX);
    y.set(deltaY);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ x: springX, y: springY }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
```

### 3.3. Text Reveal Animation

> **♿ ACCESSIBILITY: Screen Reader Support**
>
> When splitting text into animated `<span>` elements, screen readers may read
> character-by-character instead of the full sentence. Fix this with:
> - `aria-label` on container for the full text
> - `aria-hidden="true"` on decorative animated spans

```tsx
// Smooth text reveal with character stagger
'use client';

import { motion, type Variants } from 'framer-motion';

interface TextRevealProps {
  text: string;
  className?: string;
  delay?: number;
  stagger?: number;
  /** HTML tag for the container */
  as?: 'span' | 'p' | 'h1' | 'h2' | 'h3';
}

export function TextReveal({
  text,
  className,
  delay = 0,
  stagger = 0.03,
  as: Component = 'span'
}: TextRevealProps) {
  const words = text.split(' ');

  const containerVariants: Variants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: stagger,
        delayChildren: delay,
      },
    },
  };

  const wordVariants: Variants = {
    hidden: {
      opacity: 0,
      y: 20,
      rotateX: -90,
    },
    visible: {
      opacity: 1,
      y: 0,
      rotateX: 0,
      transition: {
        type: 'spring',
        stiffness: 100,
        damping: 12,
      },
    },
  };

  const MotionComponent = motion[Component];

  return (
    <MotionComponent
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-50px' }}
      className={className}
      style={{ perspective: 1000 }}
      aria-label={text} // Screen readers read the full text
    >
      {words.map((word, i) => (
        <motion.span
          key={i}
          variants={wordVariants}
          className="inline-block mr-[0.25em] origin-bottom"
          aria-hidden="true" // Hide individual words from screen readers
          style={{ transformStyle: 'preserve-3d' }}
        >
          {word}
        </motion.span>
      ))}
    </motion.span>
  );
}
```

---

## 4. Page Transitions

### 4.1. Shared Element Transitions

```tsx
// Messenger morph animation
'use client';

import { AnimatePresence, motion, type Variants } from 'framer-motion';

const messengerVariants: Variants = {
  collapsed: {
    width: 56,
    height: 56,
    borderRadius: 28,
  },
  expanded: {
    width: 380,
    height: 560,
    borderRadius: 24,
  },
};

export function MessengerContainer({ isOpen, children }: { isOpen: boolean; children: React.ReactNode }) {
  return (
    <motion.div
      layout
      layoutId="messenger-morph"
      initial={false}
      animate={isOpen ? 'expanded' : 'collapsed'}
      variants={messengerVariants}
      transition={{
        type: 'spring',
        stiffness: 200,
        damping: 25,
        mass: 0.8,
      }}
      className="fixed bottom-6 right-6 z-50 bg-zinc-900/95 backdrop-blur-xl border border-white/10 overflow-hidden shadow-2xl"
    >
      <AnimatePresence mode="wait">
        {children}
      </AnimatePresence>
    </motion.div>
  );
}
```

### 4.2. Section Transitions

```tsx
// Scroll-triggered section animation
'use client';

import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';

interface SectionProps {
  id: string;
  children: React.ReactNode;
}

export function AnimatedSection({ id, children }: SectionProps) {
  const ref = useRef<HTMLElement>(null);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  });

  // Parallax and fade based on scroll
  const opacity = useTransform(scrollYProgress, [0, 0.3, 0.7, 1], [0, 1, 1, 0]);
  const y = useTransform(scrollYProgress, [0, 0.3, 0.7, 1], [100, 0, 0, -100]);
  const scale = useTransform(scrollYProgress, [0, 0.3, 0.7, 1], [0.95, 1, 1, 0.95]);

  return (
    <motion.section
      ref={ref}
      id={id}
      style={{ opacity, y, scale }}
      className="min-h-screen py-20"
    >
      {children}
    </motion.section>
  );
}
```

---

## 5. Loading States

### 5.1. Skeleton Components

```tsx
// shared/components/feedback/skeleton.tsx
'use client';

import { motion } from 'framer-motion';
import { cn } from '@/shared/lib/utils';

interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'circular' | 'rectangular';
}

export function Skeleton({ className, variant = 'rectangular' }: SkeletonProps) {
  const baseStyles = {
    text: 'h-4 rounded',
    circular: 'rounded-full',
    rectangular: 'rounded-xl',
  };

  return (
    <div
      className={cn(
        'relative overflow-hidden bg-white/5',
        baseStyles[variant],
        className
      )}
    >
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
        animate={{ x: ['-100%', '100%'] }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
    </div>
  );
}

// Usage example: Card skeleton
export function CardSkeleton() {
  return (
    <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
      <Skeleton className="w-full h-40 mb-4" />
      <Skeleton variant="text" className="w-3/4 mb-2" />
      <Skeleton variant="text" className="w-1/2" />
    </div>
  );
}
```

### 5.2. Content Loading Animation

```tsx
// Typewriter effect for chat responses
'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface TypewriterProps {
  text: string;
  speed?: number;
  onComplete?: () => void;
}

export function Typewriter({ text, speed = 30, onComplete }: TypewriterProps) {
  const [displayedText, setDisplayedText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (currentIndex < text.length) {
      const timeout = setTimeout(() => {
        setDisplayedText(prev => prev + text[currentIndex]);
        setCurrentIndex(prev => prev + 1);
      }, speed);

      return () => clearTimeout(timeout);
    } else {
      onComplete?.();
    }
  }, [currentIndex, text, speed, onComplete]);

  return (
    <span>
      {displayedText}
      <motion.span
        animate={{ opacity: [1, 0] }}
        transition={{ duration: 0.5, repeat: Infinity }}
        className="inline-block w-0.5 h-5 bg-cyan-400 ml-0.5"
      />
    </span>
  );
}
```

---

## 6. Ambient Animations

### 6.1. Floating Elements

```tsx
// Subtle floating animation for decorative elements
'use client';

import { motion, type Variants } from 'framer-motion';

interface FloatingProps {
  children: React.ReactNode;
  duration?: number;
  distance?: number;
  delay?: number;
}

export function Floating({
  children,
  duration = 6,
  distance = 10,
  delay = 0,
}: FloatingProps) {
  const variants: Variants = {
    float: {
      y: [-distance / 2, distance / 2, -distance / 2],
      rotate: [-1, 1, -1],
      transition: {
        y: {
          duration,
          repeat: Infinity,
          ease: 'easeInOut',
        },
        rotate: {
          duration: duration * 1.5,
          repeat: Infinity,
          ease: 'easeInOut',
        },
        delay,
      },
    },
  };

  return (
    <motion.div
      variants={variants}
      animate="float"
      className="will-change-transform"
    >
      {children}
    </motion.div>
  );
}
```

### 6.2. Pulse Glow

```tsx
// Breathing glow effect
'use client';

import { motion } from 'framer-motion';

interface PulseGlowProps {
  color?: 'cyan' | 'purple' | 'blue';
  size?: number;
  className?: string;
}

const colorMap = {
  cyan: 'bg-cyan-500',
  purple: 'bg-purple-500',
  blue: 'bg-blue-500',
};

export function PulseGlow({ color = 'cyan', size = 200, className }: PulseGlowProps) {
  return (
    <motion.div
      animate={{
        scale: [1, 1.2, 1],
        opacity: [0.3, 0.5, 0.3],
      }}
      transition={{
        duration: 4,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
      className={`absolute rounded-full blur-3xl pointer-events-none ${colorMap[color]} ${className}`}
      style={{
        width: size,
        height: size,
      }}
    />
  );
}
```

---

## 7. Performance Optimizations

### 7.1. Animation Best Practices

```tsx
// ✅ GOOD: Use transform properties (GPU accelerated)
animate={{ x: 100, scale: 1.1, rotate: 45 }}

// ❌ BAD: Avoid animating layout properties
animate={{ width: 200, height: 200, left: 100 }}

// ✅ GOOD: Use will-change for complex animations
<motion.div className="will-change-transform" />

// ✅ GOOD: Reduce motion for accessibility
import { useReducedMotion } from '@/shared/hooks';

function AnimatedComponent() {
  const prefersReducedMotion = useReducedMotion();

  return (
    <motion.div
      animate={prefersReducedMotion ? {} : { y: [0, -10, 0] }}
    />
  );
}

// ✅ GOOD: Lazy load heavy animation components
import dynamic from 'next/dynamic';

const HeavyAnimation = dynamic(
  () => import('./heavy-animation'),
  { ssr: false }
);
```

### 7.2. Conditional Complexity

```tsx
// Reduce effects on lower-end devices
'use client';

import { useEffect, useState } from 'react';

function useDevicePerformance() {
  const [tier, setTier] = useState<'low' | 'medium' | 'high'>('high');

  useEffect(() => {
    // Check for reduced motion preference
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setTier('low');
      return;
    }

    // Check hardware concurrency (CPU cores)
    const cores = navigator.hardwareConcurrency || 4;
    if (cores <= 2) {
      setTier('low');
    } else if (cores <= 4) {
      setTier('medium');
    }

    // Check device memory if available
    const memory = (navigator as any).deviceMemory;
    if (memory && memory < 4) {
      setTier('low');
    }
  }, []);

  return tier;
}

// Usage
function AdaptiveBackground() {
  const tier = useDevicePerformance();

  if (tier === 'low') {
    return <div className="fixed inset-0 bg-zinc-950" />;
  }

  if (tier === 'medium') {
    return <MeshBackground orbCount={2} />;
  }

  return <MeshBackground orbCount={4} distortion />;
}
```

---

## 8. Next Steps

Continue to:
- **[08-performance-polish.md](./08-performance-polish.md)** - Lighthouse optimization, SEO, accessibility
- **[09-testing-strategy.md](./09-testing-strategy.md)** - Visual regression, animation testing
