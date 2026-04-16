import Link from "next/link";
import { MeshBackground } from "@/components/ui/mesh-background";
import { fetchBlogPosts } from "@/lib/blog-api";

export const dynamic = "force-dynamic";

export default async function BlogPage() {
  const posts = await fetchBlogPosts();

  return (
    <main className="relative min-h-screen bg-zinc-950 text-white">
      <MeshBackground />
      <div className="relative z-10 max-w-6xl mx-auto px-6 py-20">
        <div className="max-w-3xl mb-12">
          <Link href="/" className="text-sm text-cyan-300 hover:text-cyan-200 transition-colors">
            Back to home
          </Link>
          <p className="mt-8 text-sm uppercase tracking-[0.28em] text-cyan-300/70">Blog</p>
          <h1 className="mt-4 text-5xl md:text-6xl font-semibold tracking-tight">
            Writing with enough space to think.
          </h1>
          <p className="mt-6 text-lg text-zinc-400 leading-8">
            Longer notes on engineering, systems, AI, and the things that are easier to explain
            properly than compress into a chat bubble.
          </p>
        </div>

        <div className="space-y-6">
          {posts.map((post) => (
            <Link
              key={post.id}
              href={`/blog/${post.slug}`}
              className="block rounded-3xl border border-white/10 bg-white/5 hover:bg-white/[0.08] transition-colors overflow-hidden"
            >
              <div className="grid grid-cols-1 md:grid-cols-[220px_minmax(0,1fr)]">
                <div
                  className="aspect-square h-full min-h-[220px] bg-zinc-900 bg-cover bg-center"
                  style={
                    post.cover_image
                      ? { backgroundImage: `linear-gradient(rgba(0,0,0,.12), rgba(0,0,0,.45)), url(${post.cover_image})` }
                      : undefined
                  }
                />
                <div className="min-w-0 p-8">
                  <div className="flex flex-wrap gap-2 mb-4">
                    {post.tags.map((tag) => (
                      <span key={tag} className="px-2.5 py-1 rounded-full text-xs bg-white/5 border border-white/10 text-zinc-300">
                        {tag}
                      </span>
                    ))}
                  </div>
                  <h2 className="text-3xl font-medium">{post.title}</h2>
                  <p className="mt-4 text-zinc-400 leading-8">{post.excerpt}</p>
                  <p className="mt-6 text-sm text-zinc-500">
                    {post.published_at
                      ? new Date(post.published_at).toLocaleDateString()
                      : new Date(post.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
