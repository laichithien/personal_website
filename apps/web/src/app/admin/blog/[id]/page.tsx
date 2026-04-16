"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BlogPostForm } from "@/components/admin/blog-post-form";
import { useBlogPost, useUpdateBlogPost } from "@/hooks/use-admin-api";
import type { BlogPostUpdate } from "@/lib/admin-api";

export default function EditBlogPostPage() {
  const params = useParams();
  const postId = Number(params.id);
  const { data: post, isLoading } = useBlogPost(postId);
  const { mutateAsync, isPending } = useUpdateBlogPost();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-6 h-6 animate-spin text-zinc-500" />
      </div>
    );
  }

  if (!post) {
    return <div className="text-zinc-500">Post not found.</div>;
  }

  const handleSave = async (data: BlogPostUpdate) => {
    await mutateAsync({ id: postId, data });
  };

  return (
    <div>
      <div className="flex items-center gap-4 mb-6">
        <Link href="/admin/blog">
          <Button variant="ghost" size="icon-sm">
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </Link>
        <h1 className="text-2xl font-semibold">Edit Blog Post</h1>
      </div>
      <BlogPostForm initialData={post} onSave={handleSave} isSaving={isPending} />
    </div>
  );
}
