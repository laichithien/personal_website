"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { LiquidGlass } from "@/components/ui/liquid-glass";
import { ContainedScrollArea } from "@/components/ui/contained-scroll-area";
import { ScrollButton } from "@/components/shared/scroll-button";
import { ScrollUpButton } from "@/components/shared/scroll-up-button";

interface RecentPost {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  tags: string[];
  published_at: string | null;
  created_at: string;
}

interface RecentPostsSectionProps {
  posts: RecentPost[];
  nextSectionId?: string;
  previousSectionId?: string;
}

export function RecentPostsSection({
  posts,
  nextSectionId,
  previousSectionId,
}: RecentPostsSectionProps) {
  return (
    <div className="mx-auto w-full max-w-4xl">
      {previousSectionId ? <ScrollUpButton targetSection={previousSectionId} /> : null}

      <LiquidGlass
        blur="xl"
        glow
        className="min-h-[420px] overflow-hidden bg-white/[0.06] p-5 md:p-6 [&>div:last-child]:flex [&>div:last-child]:h-full [&>div:last-child]:min-h-0 [&>div:last-child]:flex-col"
      >
        <div className="mb-5 flex items-center justify-between gap-3">
          <div>
            <p className="mb-2 text-xs uppercase tracking-[0.24em] text-cyan-300/70">
              Writing
            </p>
            <h2 className="text-2xl font-semibold text-white">Recent posts</h2>
          </div>
          <Link
            href="/blog"
            className="text-sm text-cyan-300 transition-colors hover:text-cyan-200"
          >
            View all
          </Link>
        </div>

        {posts.length > 0 ? (
          <ContainedScrollArea
            className="min-h-0 max-h-[70vh] flex-1 pr-1"
            data-lock-horizontal-swipe="false"
          >
            <div className="flex flex-col gap-3">
              {posts.slice(0, 6).map((post, index) => (
                <motion.div
                  key={post.id}
                  initial={{ opacity: 0, x: 16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 + index * 0.08 }}
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
          </ContainedScrollArea>
        ) : (
          <div className="flex flex-1 items-center rounded-2xl border border-dashed border-white/10 bg-black/10 p-5">
            <p className="leading-7 text-zinc-400">
              The writing rail is in place. Publish your first post and it will show up here
              immediately from the homepage.
            </p>
          </div>
        )}
      </LiquidGlass>

      {nextSectionId ? <ScrollButton targetId={nextSectionId} /> : null}
    </div>
  );
}
