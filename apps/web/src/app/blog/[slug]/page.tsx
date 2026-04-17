import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MeshBackground } from "@/components/ui/mesh-background";
import { Markdown } from "@/components/shared/markdown";
import { fetchBlogPost } from "@/lib/blog-api";

export const dynamic = "force-dynamic";

interface BlogDetailPageProps {
  params: Promise<{ slug: string }>;
}

export default async function BlogDetailPage({ params }: BlogDetailPageProps) {
  const { slug } = await params;
  const post = await fetchBlogPost(slug).catch(() => null);

  if (!post) {
    notFound();
  }

  return (
    <main className="relative min-h-screen bg-zinc-950 text-white">
      <MeshBackground />
      <div className="relative z-10 max-w-4xl mx-auto px-6 py-16">
        <Link href="/blog" className="text-sm text-cyan-300 hover:text-cyan-200 transition-colors">
          Back to blog
        </Link>

        <article className="mt-10">
          <header className="mb-12">
            <div className="flex flex-wrap gap-2 mb-5">
              {post.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-2.5 py-1 rounded-full text-xs bg-cyan-500/10 text-cyan-300 border border-cyan-500/20"
                >
                  {tag}
                </span>
              ))}
            </div>
            <h1 className="text-5xl md:text-6xl font-semibold tracking-tight">{post.title}</h1>
            {post.excerpt && (
              <p className="mt-6 text-xl text-zinc-400 leading-9">{post.excerpt}</p>
            )}
            <p className="mt-6 text-sm text-zinc-500">
              {post.published_at
                ? new Date(post.published_at).toLocaleString()
                : new Date(post.created_at).toLocaleString()}
            </p>
          </header>

          {post.cover_image && (
            <div className="relative mb-12 h-[340px] overflow-hidden rounded-3xl border border-white/10 md:h-[420px]">
              <Image
                src={post.cover_image}
                alt={post.title}
                fill
                sizes="(min-width: 768px) 896px, 100vw"
                className="object-cover"
              />
            </div>
          )}

          <div className="rounded-3xl border border-white/10 bg-white/5 p-8 md:p-10">
            <div className="prose prose-invert max-w-none prose-headings:scroll-mt-24 prose-p:text-zinc-300 prose-li:text-zinc-300 prose-strong:text-white prose-a:text-cyan-300">
              <Markdown content={post.content_markdown} />
            </div>
          </div>
        </article>
      </div>
    </main>
  );
}
