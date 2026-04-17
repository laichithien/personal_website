"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BlogPostForm } from "@/components/admin/blog-post-form";
import { useCreateBlogPost } from "@/hooks/use-admin-api";
import type { BlogPostCreate, BlogPostUpdate } from "@/lib/admin-api";

export default function NewBlogPostPage() {
  const router = useRouter();
  const { mutateAsync, isPending } = useCreateBlogPost();

  const handleSave = async (data: BlogPostCreate | BlogPostUpdate) => {
    const response = await mutateAsync(data as BlogPostCreate);
    router.push(`/admin/blog/${response.data.id}`);
  };

  return (
    <div>
      <div className="flex items-center gap-4 mb-6">
        <Link href="/admin/blog">
          <Button variant="ghost" size="icon-sm">
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </Link>
        <h1 className="text-2xl font-semibold">New Blog Post</h1>
      </div>
      <BlogPostForm onSave={handleSave} isSaving={isPending} />
    </div>
  );
}
