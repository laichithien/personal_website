# Performance & Polish Guide

**Document:** Production Quality Standards
**Project:** The Transparent Core
**Target:** Lighthouse 100, WCAG 2.1 AA, Core Web Vitals Green

---

## 1. Performance Targets

### 1.1. Core Web Vitals

| Metric | Target | Description |
|--------|--------|-------------|
| **LCP** | < 2.5s | Largest Contentful Paint |
| **FID** | < 100ms | First Input Delay |
| **CLS** | < 0.1 | Cumulative Layout Shift |
| **FCP** | < 1.8s | First Contentful Paint |
| **TTFB** | < 800ms | Time to First Byte |
| **INP** | < 200ms | Interaction to Next Paint |

### 1.2. Lighthouse Targets

| Category | Target | Priority |
|----------|--------|----------|
| Performance | 95-100 | Critical |
| Accessibility | 100 | Critical |
| Best Practices | 100 | High |
| SEO | 100 | High |

---

## 2. Image Optimization

### 2.1. Next.js Image Configuration

```typescript
// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60 * 60 * 24 * 365, // 1 year

    // Remote patterns for external images
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
    ],
  },

  // Strict mode for better dev experience
  reactStrictMode: true,

  // Output for Docker
  output: 'standalone',

  // Compression
  compress: true,

  // Headers for caching
  async headers() {
    return [
      {
        source: '/:all*(svg|jpg|png|webp|avif)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/:all*(js|css)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
```

### 2.2. Optimized Image Component

```tsx
// shared/components/ui/optimized-image.tsx
'use client';

import Image, { type ImageProps } from 'next/image';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/shared/lib/utils';

interface OptimizedImageProps extends Omit<ImageProps, 'onLoad'> {
  fallback?: string;
}

export function OptimizedImage({
  className,
  fallback = '/images/placeholder.svg',
  alt,
  ...props
}: OptimizedImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  return (
    <div className={cn('relative overflow-hidden', className)}>
      {/* Blur placeholder */}
      {!isLoaded && (
        <div className="absolute inset-0 bg-white/5 animate-pulse" />
      )}

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: isLoaded ? 1 : 0 }}
        transition={{ duration: 0.3 }}
      >
        <Image
          {...props}
          alt={alt}
          src={hasError ? fallback : props.src}
          onLoad={() => setIsLoaded(true)}
          onError={() => setHasError(true)}
          loading="lazy"
          sizes={props.sizes || '(max-width: 768px) 100vw, 50vw'}
        />
      </motion.div>
    </div>
  );
}
```

---

## 3. Code Splitting & Lazy Loading

### 3.1. Dynamic Imports

```tsx
// app/page.tsx
import dynamic from 'next/dynamic';
import { Suspense } from 'react';
import { HeroSection } from '@/features/hero';
import { SectionSkeleton } from '@/shared/components/feedback';

// Static import for above-the-fold
// Dynamic imports for below-the-fold

const BentoGrid = dynamic(
  () => import('@/features/bento').then(mod => ({ default: mod.BentoGrid })),
  {
    loading: () => <SectionSkeleton />,
    ssr: true,
  }
);

const SoulSection = dynamic(
  () => import('@/features/soul').then(mod => ({ default: mod.SoulSection })),
  {
    loading: () => <SectionSkeleton />,
    ssr: true,
  }
);

// Heavy components - client only, lazy loaded
const MessengerButton = dynamic(
  () => import('@/features/messenger').then(mod => ({ default: mod.MessengerButton })),
  {
    ssr: false, // Client only - not needed for initial render
  }
);

export default function Home() {
  return (
    <main>
      {/* Critical - static import */}
      <HeroSection />

      {/* Below fold - dynamic with SSR */}
      <Suspense fallback={<SectionSkeleton />}>
        <BentoGrid />
      </Suspense>

      <Suspense fallback={<SectionSkeleton />}>
        <SoulSection />
      </Suspense>

      {/* Interactive - client only */}
      <MessengerButton />
    </main>
  );
}
```

### 3.2. Route-Based Splitting

```tsx
// Automatic code splitting with App Router
// Each route segment is automatically code-split

app/
├── page.tsx            // Bundle: main page
├── blog/
│   ├── page.tsx        // Bundle: blog list (separate)
│   └── [slug]/
│       └── page.tsx    // Bundle: blog post (separate)
└── api/                // Not bundled to client
```

---

## 4. Font Optimization

### 4.1. Font Loading Strategy

```tsx
// app/layout.tsx
import { Inter, JetBrains_Mono } from 'next/font/google';

// Primary font - preloaded
const inter = Inter({
  subsets: ['latin', 'vietnamese'],
  display: 'swap',
  variable: '--font-inter',
  preload: true,
});

// Mono font - loaded when needed
const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-mono',
  preload: false, // Load on demand
});

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi" className={`${inter.variable} ${jetbrainsMono.variable}`}>
      <body className="font-sans">{children}</body>
    </html>
  );
}
```

### 4.2. Tailwind Font Configuration

```typescript
// tailwind.config.ts
export default {
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-mono)', 'Menlo', 'monospace'],
      },
    },
  },
};
```

---

## 5. Accessibility (WCAG 2.1 AA)

### 5.1. Focus Management

```tsx
// shared/hooks/use-focus-trap.ts
'use client';

import { useEffect, useRef } from 'react';

export function useFocusTrap<T extends HTMLElement>(isActive: boolean) {
  const containerRef = useRef<T>(null);

  useEffect(() => {
    if (!isActive || !containerRef.current) return;

    const container = containerRef.current;
    const focusableElements = container.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    // Focus first element
    firstElement?.focus();

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement?.focus();
        }
      } else {
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement?.focus();
        }
      }
    };

    container.addEventListener('keydown', handleKeyDown);
    return () => container.removeEventListener('keydown', handleKeyDown);
  }, [isActive]);

  return containerRef;
}
```

### 5.2. Skip Links

```tsx
// shared/components/layout/skip-links.tsx
export function SkipLinks() {
  return (
    <div className="sr-only focus-within:not-sr-only">
      <a
        href="#main-content"
        className="fixed top-4 left-4 z-[100] px-4 py-2 bg-cyan-500 text-zinc-900 rounded-lg font-medium focus:outline-none focus:ring-2 focus:ring-cyan-400"
      >
        Skip to main content
      </a>
      <a
        href="#navigation"
        className="fixed top-4 left-48 z-[100] px-4 py-2 bg-cyan-500 text-zinc-900 rounded-lg font-medium focus:outline-none focus:ring-2 focus:ring-cyan-400"
      >
        Skip to navigation
      </a>
    </div>
  );
}
```

### 5.3. ARIA Labels & Roles

```tsx
// Accessible dialog example
// features/messenger/components/messenger-window.tsx
'use client';

import { useId, useEffect, useRef } from 'react';
import { useFocusTrap } from '@/shared/hooks';

interface MessengerWindowProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MessengerWindow({ isOpen, onClose }: MessengerWindowProps) {
  const titleId = useId();
  const descId = useId();
  const containerRef = useFocusTrap<HTMLDivElement>(isOpen);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  // Store and restore focus
  useEffect(() => {
    if (isOpen) {
      previousFocusRef.current = document.activeElement as HTMLElement;
    } else {
      previousFocusRef.current?.focus();
    }
  }, [isOpen]);

  // Close on Escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      ref={containerRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      aria-describedby={descId}
      className="fixed bottom-6 right-6 z-50 w-[380px] h-[560px] rounded-2xl bg-zinc-900/95 backdrop-blur-xl border border-white/10"
    >
      <header className="flex items-center justify-between p-4 border-b border-white/10">
        <h2 id={titleId} className="font-semibold">
          Liquid Messenger
        </h2>
        <button
          onClick={onClose}
          aria-label="Close messenger"
          className="w-8 h-8 rounded-full hover:bg-white/10 flex items-center justify-center transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500"
        >
          <span aria-hidden="true">×</span>
        </button>
      </header>

      <p id={descId} className="sr-only">
        Chat with AI assistant or send a contact message
      </p>

      {/* Content */}
    </div>
  );
}
```

### 5.4. Color Contrast

```css
/* globals.css - Ensure WCAG AA contrast ratios */

:root {
  /* Text on dark backgrounds - minimum 4.5:1 for normal text */
  --text-primary: rgba(255, 255, 255, 1);      /* 21:1 on #09090b */
  --text-secondary: rgba(255, 255, 255, 0.7);  /* 12:1 on #09090b */
  --text-muted: rgba(255, 255, 255, 0.5);      /* 7:1 on #09090b - use for large text only */

  /* Interactive elements - minimum 3:1 */
  --accent-cyan: #22d3ee;  /* Lighter cyan for better contrast */

  /* Glass surfaces - ensure content remains readable */
  --glass-bg: rgba(255, 255, 255, 0.08);
}

/* High contrast mode support */
@media (prefers-contrast: high) {
  :root {
    --text-secondary: rgba(255, 255, 255, 0.9);
    --text-muted: rgba(255, 255, 255, 0.8);
    --glass-bg: rgba(255, 255, 255, 0.15);
  }
}
```

### 5.5. Reduced Motion

```tsx
// shared/hooks/use-reduced-motion.ts
'use client';

import { useEffect, useState } from 'react';

export function useReducedMotion(): boolean {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const handler = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
    };

    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  return prefersReducedMotion;
}

// Usage in components
function AnimatedSection({ children }: { children: React.ReactNode }) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <motion.div
      initial={prefersReducedMotion ? false : { opacity: 0, y: 20 }}
      whileInView={prefersReducedMotion ? {} : { opacity: 1, y: 0 }}
      transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.5 }}
    >
      {children}
    </motion.div>
  );
}
```

---

## 6. SEO Optimization

### 6.1. Metadata Configuration

```tsx
// app/layout.tsx
import type { Metadata, Viewport } from 'next';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: [
    { media: '(prefers-color-scheme: dark)', color: '#09090b' },
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
  ],
};

export const metadata: Metadata = {
  metadataBase: new URL('https://yourdomain.com'),

  title: {
    default: 'Thiện | AI Engineer',
    template: '%s | Thiện',
  },

  description: 'The Transparent Core - Digital identity of an AI Engineer specializing in intelligent systems, data engineering, and full-stack development.',

  keywords: [
    'AI Engineer',
    'Machine Learning',
    'Full Stack Developer',
    'Python',
    'TypeScript',
    'Homelab',
    'Portfolio',
  ],

  authors: [{ name: 'Thiện', url: 'https://yourdomain.com' }],
  creator: 'Thiện',

  openGraph: {
    type: 'website',
    locale: 'vi_VN',
    alternateLocale: 'en_US',
    url: 'https://yourdomain.com',
    siteName: 'The Transparent Core',
    title: 'Thiện | AI Engineer',
    description: 'Digital identity of an AI Engineer',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Thiện - AI Engineer Portfolio',
      },
    ],
  },

  twitter: {
    card: 'summary_large_image',
    title: 'Thiện | AI Engineer',
    description: 'Digital identity of an AI Engineer',
    images: ['/og-image.png'],
    creator: '@chithien',
  },

  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },

  icons: {
    icon: [
      { url: '/favicon.ico', sizes: '32x32' },
      { url: '/icon.svg', type: 'image/svg+xml' },
    ],
    apple: '/apple-touch-icon.png',
  },

  manifest: '/manifest.json',

  alternates: {
    canonical: 'https://yourdomain.com',
  },
};
```

### 6.2. Structured Data (JSON-LD)

```tsx
// app/layout.tsx
export default function RootLayout({ children }: { children: React.ReactNode }) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: 'Thiện',
    jobTitle: 'AI Engineer',
    url: 'https://yourdomain.com',
    sameAs: [
      'https://github.com/chithien',
      'https://linkedin.com/in/chithien',
    ],
    knowsAbout: [
      'Artificial Intelligence',
      'Machine Learning',
      'Python',
      'TypeScript',
      'Data Engineering',
    ],
    worksFor: {
      '@type': 'Organization',
      name: 'Vexere',
    },
  };

  return (
    <html lang="vi">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
```

### 6.3. Semantic HTML

```tsx
// Proper semantic structure
<main id="main-content">
  <article>
    <header>
      <h1>Thiện</h1>
      <p>AI Engineer @ Vexere</p>
    </header>

    <section id="tech" aria-labelledby="tech-heading">
      <h2 id="tech-heading">The Engineer & Lab</h2>
      {/* Content */}
    </section>

    <section id="projects" aria-labelledby="projects-heading">
      <h2 id="projects-heading">Projects</h2>
      <ul role="list">
        {projects.map(project => (
          <li key={project.id}>
            <article>
              <h3>{project.title}</h3>
              <p>{project.description}</p>
            </article>
          </li>
        ))}
      </ul>
    </section>
  </article>
</main>

<nav id="navigation" aria-label="Main navigation">
  {/* Navigation */}
</nav>

<aside aria-label="Chat assistant">
  {/* Messenger */}
</aside>
```

---

## 7. Error Handling

### 7.1. Error Boundary UI

```tsx
// shared/components/feedback/error-fallback.tsx
'use client';

import { motion } from 'framer-motion';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { LiquidGlass } from '@/shared/components/ui';
import { Button } from '@/shared/components/ui';

interface ErrorFallbackProps {
  error: Error;
  onReset?: () => void;
  title?: string;
  description?: string;
}

export function ErrorFallback({
  error,
  onReset,
  title = 'Something went wrong',
  description = "We're sorry, but something unexpected happened.",
}: ErrorFallbackProps) {
  return (
    <div className="min-h-[400px] flex items-center justify-center p-8">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
      >
        <LiquidGlass blur="lg" className="max-w-md p-8 text-center">
          <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-red-500/10 flex items-center justify-center">
            <AlertCircle className="w-8 h-8 text-red-400" />
          </div>

          <h2 className="text-xl font-semibold mb-2">{title}</h2>
          <p className="text-white/60 mb-6">{description}</p>

          {process.env.NODE_ENV === 'development' && (
            <pre className="text-left text-xs text-red-400 bg-red-500/10 rounded-lg p-4 mb-6 overflow-auto max-h-32">
              {error.message}
            </pre>
          )}

          {onReset && (
            <Button onClick={onReset} variant="secondary">
              <RefreshCw className="w-4 h-4 mr-2" />
              Try again
            </Button>
          )}
        </LiquidGlass>
      </motion.div>
    </div>
  );
}
```

### 7.2. API Error Handling

```tsx
// shared/lib/api-client.ts
import axios, { AxiosError } from 'axios';

export class ApiError extends Error {
  constructor(
    message: string,
    public code: string,
    public status: number,
    public details?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  timeout: 10000,
});

// Response interceptor for error handling
apiClient.interceptors.response.use(
  response => response,
  (error: AxiosError<{ error: { code: string; message: string; details?: any } }>) => {
    if (error.response?.data?.error) {
      const { code, message, details } = error.response.data.error;
      throw new ApiError(message, code, error.response.status, details);
    }

    // Network error
    if (!error.response) {
      throw new ApiError(
        'Unable to connect to the server. Please check your connection.',
        'NETWORK_ERROR',
        0
      );
    }

    // Generic error
    throw new ApiError(
      'An unexpected error occurred.',
      'UNKNOWN_ERROR',
      error.response.status
    );
  }
);

export default apiClient;
```

### 7.3. Form Error States

```tsx
// features/messenger/components/contact-form.tsx
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion, AnimatePresence } from 'framer-motion';

const schema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email'),
  message: z.string().min(10, 'Message must be at least 10 characters'),
});

type FormData = z.infer<typeof schema>;

export function ContactForm() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label htmlFor="name" className="block text-sm text-white/70 mb-1">
          Name
        </label>
        <input
          id="name"
          {...register('name')}
          aria-invalid={errors.name ? 'true' : 'false'}
          aria-describedby={errors.name ? 'name-error' : undefined}
          className={cn(
            'w-full px-4 py-2 rounded-lg bg-white/5 border transition-colors',
            errors.name
              ? 'border-red-500 focus:border-red-400'
              : 'border-white/10 focus:border-cyan-500'
          )}
        />
        <AnimatePresence>
          {errors.name && (
            <motion.p
              id="name-error"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="text-sm text-red-400 mt-1"
              role="alert"
            >
              {errors.name.message}
            </motion.p>
          )}
        </AnimatePresence>
      </div>

      {/* More fields... */}

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full py-2 rounded-lg bg-cyan-500 text-zinc-900 font-medium disabled:opacity-50"
      >
        {isSubmitting ? 'Sending...' : 'Send Message'}
      </button>
    </form>
  );
}
```

---

## 8. Loading States

### 8.1. Suspense Boundaries

```tsx
// app/page.tsx
import { Suspense } from 'react';

// Loading component for each section
function HeroSkeleton() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-full max-w-2xl p-8 rounded-2xl bg-white/5 animate-pulse">
        <div className="flex flex-col items-center gap-6">
          <div className="w-32 h-32 rounded-full bg-white/10" />
          <div className="h-10 w-48 rounded bg-white/10" />
          <div className="h-6 w-64 rounded bg-white/10" />
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <main>
      <Suspense fallback={<HeroSkeleton />}>
        <HeroSection />
      </Suspense>

      <Suspense fallback={<BentoSkeleton />}>
        <BentoGrid />
      </Suspense>
    </main>
  );
}
```

### 8.2. Streaming with Loading UI

```tsx
// app/loading.tsx - Route-level loading
export default function Loading() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950">
      <motion.div
        animate={{
          scale: [1, 1.1, 1],
          opacity: [0.5, 1, 0.5],
        }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
        }}
        className="w-16 h-16 rounded-full bg-gradient-to-r from-cyan-500 to-purple-500 blur-xl"
      />
    </div>
  );
}
```

---

## 9. Performance Monitoring

### 9.1. Web Vitals Reporting

```tsx
// app/layout.tsx
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi">
      <body>
        {children}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
```

### 9.2. Custom Performance Metrics

```tsx
// shared/lib/performance.ts
export function reportWebVitals(metric: {
  id: string;
  name: string;
  value: number;
  label: 'web-vital' | 'custom';
}) {
  // Send to analytics
  if (process.env.NODE_ENV === 'production') {
    console.log('[Performance]', metric.name, metric.value);

    // Example: Send to custom endpoint
    fetch('/api/metrics', {
      method: 'POST',
      body: JSON.stringify(metric),
      headers: { 'Content-Type': 'application/json' },
    }).catch(() => {});
  }
}
```

---

## 10. Production Checklist

### Pre-Launch

- [ ] Lighthouse scores: All 95+
- [ ] Core Web Vitals: All green
- [ ] WCAG 2.1 AA compliance verified
- [ ] All images optimized (WebP/AVIF)
- [ ] Fonts preloaded, display: swap
- [ ] Critical CSS inlined
- [ ] JavaScript bundle analyzed
- [ ] Error boundaries in place
- [ ] 404/500 pages styled
- [ ] Loading states for all async content
- [ ] Forms have validation feedback
- [ ] Skip links work correctly
- [ ] Keyboard navigation complete
- [ ] Screen reader tested
- [ ] Color contrast verified
- [ ] Reduced motion respected
- [ ] SEO metadata complete
- [ ] Open Graph images generated
- [ ] Structured data validated
- [ ] Sitemap generated
- [ ] robots.txt configured

---

## Next Steps

- **[09-testing-strategy.md](./09-testing-strategy.md)** - Comprehensive testing approach
