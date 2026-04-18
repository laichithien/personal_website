"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { LiquidGlass } from "@/components/ui/liquid-glass";
import { Button } from "@/components/ui/button";
import { GlassIconButton } from "@/components/ui/glass-icon-button";
import { ArrowDown, ArrowUpRight, Sparkles, Github, Linkedin, Mail } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import type { HeroSocialLinks } from "@/lib/types";

interface HeroBlogPost {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  tags: string[];
  published_at: string | null;
  created_at: string;
}

interface HeroData {
  name: string;
  title: string;
  tagline: string;
  avatar: string;
}

export function HeroSection({
  data,
  posts,
  social,
}: {
  data: HeroData;
  posts: HeroBlogPost[];
  social: HeroSocialLinks;
}) {
  const [avatarFailed, setAvatarFailed] = useState(false);
  const isInlineAvatar = data.avatar?.startsWith("data:image/") ?? false;
  const avatarSrc = avatarFailed || !data.avatar ? "/images/avatar.example.jpg" : data.avatar;

  const scrollToTech = () => {
    document.getElementById("tech")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className="w-full max-w-6xl"
    >
      <div className="grid grid-cols-1 xl:grid-cols-[2fr_1fr] gap-3 items-stretch">
        <LiquidGlass blur="xl" glow className="p-6 md:p-8 min-h-[420px] flex">
          <div className="flex flex-col md:flex-row items-center md:items-center gap-6 md:gap-8 w-full">
            {/* Avatar - Left side on desktop */}
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="relative flex-shrink-0 self-center md:self-center flex items-center"
            >
              <div className="relative">
                <div className="absolute -inset-4 bg-gradient-to-br from-cyan-500/20 to-sky-500/10 rounded-2xl blur-xl" />

                <div className="relative w-44 h-52 md:w-52 md:h-64 xl:w-56 xl:h-72 rounded-2xl overflow-hidden ring-2 ring-white/20 shadow-2xl">
                  {avatarSrc ? (
                    <Image
                      src={avatarSrc}
                      alt={data.name}
                      fill
                      sizes="(min-width: 1280px) 224px, (min-width: 768px) 208px, 176px"
                      className="object-cover object-top"
                      priority
                      unoptimized={isInlineAvatar}
                      onError={() => setAvatarFailed(true)}
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-cyan-500/20 to-sky-500/20 flex items-center justify-center">
                      <span className="text-6xl font-bold text-white/30">
                        {data.name?.charAt(0) || "?"}
                      </span>
                    </div>
                  )}
                </div>

                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                  className="absolute -inset-3 rounded-2xl border border-dashed border-cyan-500/30"
                />
              </div>
            </motion.div>

            <div className="flex flex-col items-center md:items-start text-center md:text-left gap-5 flex-1 justify-center self-center">
              <div className="space-y-4">
                <motion.h1
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                  className="text-4xl md:text-5xl xl:text-6xl font-bold text-gradient"
                >
                  {data.name}
                </motion.h1>

                <motion.p
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 }}
                  className="text-lg md:text-xl text-cyan-400 flex items-center gap-2"
                >
                  <Sparkles className="w-5 h-5" />
                  {data.title}
                </motion.p>

                <motion.p
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 }}
                  className="text-white/60 max-w-xl text-lg leading-8"
                >
                  {data.tagline}
                </motion.p>
              </div>

              <div className="w-full space-y-5">
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                  className="flex items-center gap-3 mt-2"
                >
                  {social.github && (
                    <GlassIconButton asChild size="sm">
                      <a href={social.github} target="_blank" rel="noopener noreferrer" aria-label="GitHub">
                        <Github className="w-5 h-5" />
                      </a>
                    </GlassIconButton>
                  )}
                  {social.linkedin && (
                    <GlassIconButton asChild size="sm">
                      <a href={social.linkedin} target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
                        <Linkedin className="w-5 h-5" />
                      </a>
                    </GlassIconButton>
                  )}
                  {social.email && (
                    <GlassIconButton asChild size="sm">
                      <a href={`mailto:${social.email}`} aria-label="Email">
                        <Mail className="w-5 h-5" />
                      </a>
                    </GlassIconButton>
                  )}
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 }}
                  className="flex flex-wrap items-center gap-3"
                >
                  <Button
                    onClick={scrollToTech}
                    variant="outline"
                    className="border-white/20 hover:bg-white/10"
                  >
                    <ArrowDown className="w-4 h-4 mr-2" />
                    Explore My Work
                  </Button>
                  <Link href="/blog">
                    <Button className="bg-white text-zinc-900 hover:bg-zinc-200">
                      Read My Blog
                      <ArrowUpRight className="w-4 h-4 ml-2" />
                    </Button>
                  </Link>
                </motion.div>
              </div>
            </div>
          </div>
        </LiquidGlass>

        <LiquidGlass
          blur="xl"
          glow
          className="hidden min-h-[420px] max-h-[420px] overflow-hidden bg-white/[0.06] p-5 md:p-6 xl:block [&>div:last-child]:flex [&>div:last-child]:h-full [&>div:last-child]:min-h-0 [&>div:last-child]:flex-col"
        >
          <div className="flex items-center justify-between gap-3 mb-5">
            <div>
              <p className="text-xs uppercase tracking-[0.24em] text-cyan-300/70 mb-2">
                Writing
              </p>
              <h2 className="text-2xl font-semibold text-white">Recent posts</h2>
            </div>
            <Link
              href="/blog"
              className="text-sm text-cyan-300 hover:text-cyan-200 transition-colors"
            >
              View all
            </Link>
          </div>
          {posts.length > 0 ? (
            <div className="min-h-0 flex-1 pr-1">
              <div className="flex flex-col gap-3">
                {posts.slice(0, 4).map((post, index) => (
                  <motion.div
                    key={post.id}
                    initial={{ opacity: 0, x: 16 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.25 + index * 0.08 }}
                    className="shrink-0"
                  >
                    <Link
                      href={`/blog/${post.slug}`}
                      className="block h-full rounded-2xl border border-white/10 bg-black/20 p-4 transition-colors hover:bg-white/[0.07]"
                    >
                      <div className="mb-3 flex flex-wrap gap-2">
                        {post.tags.slice(0, 2).map((tag) => (
                          <span
                            key={tag}
                            className="rounded-full border border-cyan-500/20 bg-cyan-500/10 px-2 py-1 text-[11px] text-cyan-300"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                      <h3 className="line-clamp-2 text-lg font-medium leading-7 text-white">
                        {post.title}
                      </h3>
                      <p className="mt-2 line-clamp-3 text-sm leading-6 text-zinc-400">
                        {post.excerpt || "Open the post to read the full write-up."}
                      </p>
                      <p className="mt-4 text-xs text-zinc-500">
                        {post.published_at
                          ? new Date(post.published_at).toLocaleDateString()
                          : new Date(post.created_at).toLocaleDateString()}
                      </p>
                    </Link>
                  </motion.div>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex-1 rounded-2xl border border-dashed border-white/10 bg-black/10 p-5 flex items-center">
              <p className="text-zinc-400 leading-7">
                The writing rail is in place. Publish your first post and it will show up here
                immediately from the homepage.
              </p>
            </div>
          )}
        </LiquidGlass>
      </div>
    </motion.div>
  );
}
