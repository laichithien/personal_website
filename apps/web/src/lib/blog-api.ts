function getApiBaseUrl(): string {
  if (typeof window === "undefined") {
    return process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:3344";
  }
  return process.env.NEXT_PUBLIC_API_URL || "http://localhost:3344";
}

export interface PublicBlogPostPreview {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  cover_image: string | null;
  tags: string[];
  published_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface PublicBlogPost extends PublicBlogPostPreview {
  content_markdown: string;
}

export async function fetchBlogPosts(): Promise<PublicBlogPostPreview[]> {
  const res = await fetch(`${getApiBaseUrl()}/api/blog`, {
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error("Failed to fetch blog posts");
  }

  return res.json();
}

export async function fetchBlogPost(slug: string): Promise<PublicBlogPost> {
  const res = await fetch(`${getApiBaseUrl()}/api/blog/${slug}`, {
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error("Failed to fetch blog post");
  }

  return res.json();
}
