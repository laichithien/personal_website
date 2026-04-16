import Link from "next/link";
import type { PublicBlogPostPreview } from "@/lib/blog-api";

interface BlogPreviewSectionProps {
  posts: PublicBlogPostPreview[];
}

export function BlogPreviewSection({ posts }: BlogPreviewSectionProps) {
  if (posts.length === 0) {
    return (
      <div className="max-w-4xl mx-auto rounded-3xl border border-dashed border-white/10 bg-white/[0.03] p-10 text-center">
        <p className="text-sm uppercase tracking-[0.28em] text-cyan-300/70 mb-3">Writing</p>
        <h2 className="text-4xl font-semibold tracking-tight text-white">Blog section is ready.</h2>
        <p className="mt-4 text-zinc-400 leading-8">
          Publish the first post from the admin panel and it will appear here automatically.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-end justify-between gap-6 mb-10">
        <div className="max-w-2xl">
          <p className="text-sm uppercase tracking-[0.28em] text-cyan-300/70 mb-3">Writing</p>
          <h2 className="text-4xl md:text-5xl font-semibold tracking-tight text-white">
            Notes, essays, and build logs.
          </h2>
          <p className="mt-4 text-zinc-400 text-lg leading-8">
            A quieter place for longer thoughts: engineering notes, system design reflections,
            and things worth writing down properly.
          </p>
        </div>
        <Link
          href="/blog"
          className="text-sm text-cyan-300 hover:text-cyan-200 transition-colors whitespace-nowrap"
        >
          View all posts
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {posts.map((post) => (
          <Link
            key={post.id}
            href={`/blog/${post.slug}`}
            className="group rounded-3xl border border-white/10 bg-white/5 backdrop-blur-sm overflow-hidden hover:bg-white/[0.08] transition-colors"
          >
            {post.cover_image && (
              <div
                className="h-48 bg-cover bg-center"
                style={{ backgroundImage: `linear-gradient(rgba(0,0,0,.15), rgba(0,0,0,.45)), url(${post.cover_image})` }}
              />
            )}
            <div className="p-6">
              <div className="flex flex-wrap gap-2 mb-4">
                {post.tags.slice(0, 3).map((tag) => (
                  <span
                    key={tag}
                    className="px-2.5 py-1 rounded-full text-xs bg-cyan-500/10 text-cyan-300 border border-cyan-500/20"
                  >
                    {tag}
                  </span>
                ))}
              </div>
              <h3 className="text-2xl font-medium text-white group-hover:text-cyan-100 transition-colors">
                {post.title}
              </h3>
              <p className="mt-3 text-zinc-400 leading-7 line-clamp-4">
                {post.excerpt || "No excerpt yet."}
              </p>
              <p className="mt-6 text-sm text-zinc-500">
                {post.published_at
                  ? new Date(post.published_at).toLocaleDateString()
                  : new Date(post.created_at).toLocaleDateString()}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
