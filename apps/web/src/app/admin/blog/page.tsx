"use client";

import Link from "next/link";
import { BookText, Pencil, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useBlogPosts, useDeleteBlogPost } from "@/hooks/use-admin-api";

export default function BlogAdminPage() {
  const { data: posts, isLoading } = useBlogPosts();
  const { mutate: deletePost, isPending: isDeleting } = useDeleteBlogPost();

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">Blog</h1>
        <Link href="/admin/blog/new">
          <Button className="bg-cyan-500 hover:bg-cyan-400 text-black">
            <Plus className="w-4 h-4" />
            New Post
          </Button>
        </Link>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6 animate-pulse">
              <div className="h-5 bg-zinc-800 rounded w-1/4 mb-2" />
              <div className="h-4 bg-zinc-800 rounded w-3/4" />
            </div>
          ))}
        </div>
      ) : posts && posts.length > 0 ? (
        <div className="space-y-4">
          {posts.map((post) => (
            <div key={post.id} className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6">
              <div className="flex items-start justify-between gap-4">
                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center">
                    <BookText className="w-5 h-5 text-cyan-400" />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium text-lg">{post.title}</h3>
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full border ${
                          post.is_published
                            ? "bg-green-500/10 text-green-400 border-green-500/20"
                            : "bg-zinc-800 text-zinc-400 border-zinc-700"
                        }`}
                      >
                        {post.is_published ? "Published" : "Draft"}
                      </span>
                    </div>
                    <p className="text-sm text-zinc-500">/{post.slug}</p>
                    <p className="text-sm text-zinc-400 line-clamp-2">{post.excerpt || "No excerpt yet."}</p>
                    <div className="flex flex-wrap gap-2">
                      {post.tags.map((tag) => (
                        <span key={tag} className="text-xs px-2 py-0.5 rounded-full bg-white/5 text-zinc-400 border border-white/10">
                          {tag}
                        </span>
                      ))}
                    </div>
                    <p className="text-xs text-zinc-600">
                      Updated {new Date(post.updated_at).toLocaleString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Link href={`/admin/blog/${post.id}`}>
                    <Button variant="ghost" size="icon-sm">
                      <Pencil className="w-4 h-4" />
                    </Button>
                  </Link>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    disabled={isDeleting}
                    onClick={() => {
                      if (confirm(`Delete "${post.title}"?`)) {
                        deletePost(post.id);
                      }
                    }}
                    className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-12 text-center">
          <BookText className="w-12 h-12 text-zinc-600 mx-auto mb-4" />
          <h3 className="font-medium text-zinc-400">No posts yet</h3>
          <p className="text-sm text-zinc-600 mt-1">Start your writing section with the first post.</p>
        </div>
      )}
    </div>
  );
}
