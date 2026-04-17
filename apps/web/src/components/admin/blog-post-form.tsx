"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Loader2, Save, WandSparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Markdown } from "@/components/shared/markdown";
import type { BlogPost, BlogPostCreate, BlogPostUpdate } from "@/lib/admin-api";

const AUTOSAVE_ENABLED_KEY = "blog_autosave_enabled";
const AUTOSAVE_INTERVAL_KEY = "blog_autosave_interval_seconds";

function slugify(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "d")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

interface BlogPostFormProps {
  initialData?: BlogPost | null;
  isSaving?: boolean;
  onSave: (data: BlogPostCreate | BlogPostUpdate) => Promise<void> | void;
}

export function BlogPostForm({ initialData, isSaving = false, onSave }: BlogPostFormProps) {
  const isEditMode = !!initialData;
  const [formData, setFormData] = useState({
    title: initialData?.title || "",
    slug: initialData?.slug || "",
    excerpt: initialData?.excerpt || "",
    cover_image: initialData?.cover_image || "",
    content_markdown: initialData?.content_markdown || "",
    tags: (initialData?.tags || []).join(", "),
    is_published: initialData?.is_published || false,
  });
  const [error, setError] = useState("");
  const [status, setStatus] = useState<string>("");
  const [autosaveEnabled, setAutosaveEnabled] = useState(false);
  const [autosaveInterval, setAutosaveInterval] = useState(20);
  const [isAutosaving, setIsAutosaving] = useState(false);
  const [lastSavedAt, setLastSavedAt] = useState<string>("");
  const hasInitializedSettings = useRef(false);
  const lastSavedSnapshot = useRef("");

  useEffect(() => {
    setFormData({
      title: initialData?.title || "",
      slug: initialData?.slug || "",
      excerpt: initialData?.excerpt || "",
      cover_image: initialData?.cover_image || "",
      content_markdown: initialData?.content_markdown || "",
      tags: (initialData?.tags || []).join(", "),
      is_published: initialData?.is_published || false,
    });
  }, [initialData]);

  useEffect(() => {
    if (hasInitializedSettings.current || typeof window === "undefined") return;
    hasInitializedSettings.current = true;

    const storedEnabled = window.localStorage.getItem(AUTOSAVE_ENABLED_KEY);
    const storedInterval = window.localStorage.getItem(AUTOSAVE_INTERVAL_KEY);
    setAutosaveEnabled(storedEnabled === "true");
    if (storedInterval) {
      const parsed = Number(storedInterval);
      if (!Number.isNaN(parsed) && parsed >= 5) {
        setAutosaveInterval(parsed);
      }
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(AUTOSAVE_ENABLED_KEY, String(autosaveEnabled));
  }, [autosaveEnabled]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(AUTOSAVE_INTERVAL_KEY, String(autosaveInterval));
  }, [autosaveInterval]);

  const normalizedPayload = useMemo(
    () => ({
      title: formData.title.trim(),
      slug: formData.slug.trim(),
      excerpt: formData.excerpt.trim(),
      cover_image: formData.cover_image.trim() || null,
      content_markdown: formData.content_markdown,
      tags: formData.tags
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean),
      is_published: formData.is_published,
      published_at: formData.is_published
        ? initialData?.published_at || new Date().toISOString()
        : null,
    }),
    [formData, initialData?.published_at]
  );

  const initialSnapshot = useMemo(
    () =>
      JSON.stringify({
        title: initialData?.title?.trim() || "",
        slug: initialData?.slug?.trim() || "",
        excerpt: initialData?.excerpt?.trim() || "",
        cover_image: initialData?.cover_image || null,
        content_markdown: initialData?.content_markdown || "",
        tags: initialData?.tags || [],
        is_published: initialData?.is_published || false,
        published_at: initialData?.is_published ? initialData?.published_at || null : null,
      }),
    [initialData]
  );

  useEffect(() => {
    lastSavedSnapshot.current = initialSnapshot;
  }, [initialSnapshot]); // reset baseline when entity changes

  const isDirty = JSON.stringify(normalizedPayload) !== lastSavedSnapshot.current;

  const save = async (reason: "manual" | "autosave") => {
    setError("");
    setStatus("");

    if (!normalizedPayload.title || !normalizedPayload.slug || !normalizedPayload.content_markdown.trim()) {
      setError("Title, slug, and content are required.");
      return;
    }

    try {
      if (reason === "autosave") setIsAutosaving(true);
      await onSave(normalizedPayload);
      lastSavedSnapshot.current = JSON.stringify(normalizedPayload);
      const now = new Date().toLocaleTimeString();
      setLastSavedAt(now);
      setStatus(reason === "autosave" ? `Autosaved at ${now}` : `Saved at ${now}`);
    } catch {
      setError(reason === "autosave" ? "Autosave failed." : "Save failed.");
    } finally {
      if (reason === "autosave") setIsAutosaving(false);
    }
  };

  const sectionsRef = useRef<HTMLElement[]>([]);

  const collectVisibleSections = () => {
    if (typeof document === 'undefined') return [];
    return Array.from(document.querySelectorAll("h1, h2, h3")) as HTMLElement[];
  };

  useEffect(() => {
    if (!isEditMode || !autosaveEnabled || !isDirty || isSaving || isAutosaving) return;

    const timer = window.setTimeout(() => {
      sectionsRef.current = collectVisibleSections();
      void save("autosave");
    }, Math.max(5, autosaveInterval) * 1000);

    return () => window.clearTimeout(timer);
  }, [autosaveEnabled, autosaveInterval, isDirty, isEditMode, isSaving, isAutosaving, collectVisibleSections]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        void save("manual");
      }}
      className="space-y-6"
    >
      <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-1.5">Title</label>
            <Input
              value={formData.title}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  title: e.target.value,
                  slug: prev.slug || slugify(e.target.value),
                }))
              }
              placeholder="What I learned from building..."
              className="bg-zinc-800/50 border-zinc-700"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-1.5">Slug</label>
            <div className="flex gap-2">
              <Input
                value={formData.slug}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    slug: slugify(e.target.value),
                  }))
                }
                placeholder="what-i-learned-from-building"
                className="bg-zinc-800/50 border-zinc-700"
              />
              <Button
                type="button"
                variant="outline"
                className="border-white/15 bg-white/5 hover:bg-white/10"
                onClick={() =>
                  setFormData((prev) => ({
                    ...prev,
                    slug: slugify(prev.title),
                  }))
                }
              >
                <WandSparkles className="w-4 h-4" />
                Generate
              </Button>
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-zinc-400 mb-1.5">Excerpt</label>
          <Textarea
            value={formData.excerpt}
            onChange={(e) => setFormData((prev) => ({ ...prev, excerpt: e.target.value }))}
            placeholder="Short summary shown in blog cards and metadata."
            rows={3}
            className="bg-zinc-800/50 border-zinc-700"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-1.5">Cover Image URL</label>
            <Input
              value={formData.cover_image}
              onChange={(e) => setFormData((prev) => ({ ...prev, cover_image: e.target.value }))}
              placeholder="https://..."
              className="bg-zinc-800/50 border-zinc-700"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-1.5">Tags</label>
            <Input
              value={formData.tags}
              onChange={(e) => setFormData((prev) => ({ ...prev, tags: e.target.value }))}
              placeholder="ai, systems, notes"
              className="bg-zinc-800/50 border-zinc-700"
            />
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-4 text-sm text-zinc-400">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.is_published}
              onChange={(e) => setFormData((prev) => ({ ...prev, is_published: e.target.checked }))}
              className="w-4 h-4 rounded border-zinc-700 bg-zinc-800 text-cyan-500"
            />
            Published
          </label>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={autosaveEnabled}
              onChange={(e) => setAutosaveEnabled(e.target.checked)}
              disabled={!isEditMode}
              className="w-4 h-4 rounded border-zinc-700 bg-zinc-800 text-cyan-500"
            />
            Autosave
          </label>

          <div className="flex items-center gap-2">
            <span>Interval</span>
            <Input
              type="number"
              min="5"
              value={autosaveInterval}
              disabled={!isEditMode || !autosaveEnabled}
              onChange={(e) => setAutosaveInterval(Math.max(5, Number(e.target.value) || 5))}
              className="w-24 bg-zinc-800/50 border-zinc-700"
            />
            <span>seconds</span>
          </div>

          {!isEditMode && (
            <span className="text-zinc-500">Autosave becomes available after the first save.</span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="bg-zinc-950/70 border border-zinc-800 rounded-xl overflow-hidden">
          <div className="px-4 py-3 border-b border-zinc-800 text-sm text-zinc-400">
            Markdown Source
          </div>
          <Textarea
            value={formData.content_markdown}
            onChange={(e) => setFormData((prev) => ({ ...prev, content_markdown: e.target.value }))}
            placeholder="# Start writing&#10;&#10;Write markdown here."
            rows={28}
            className="vibe-scrollbar min-h-[720px] resize-none border-0 rounded-none bg-transparent font-mono text-sm leading-7"
          />
        </div>

        <div className="bg-zinc-900/40 border border-zinc-800 rounded-xl overflow-hidden">
          <div className="px-4 py-3 border-b border-zinc-800 text-sm text-zinc-400">
            Live Preview
          </div>
          <div className="vibe-scrollbar p-6 min-h-[720px] overflow-auto">
            <article className="max-w-none">
              <header className="mb-8 space-y-4">
                <div className="flex flex-wrap gap-2">
                  {normalizedPayload.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-2.5 py-1 rounded-full text-xs bg-cyan-500/10 text-cyan-300 border border-cyan-500/20"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
                <h1 className="text-4xl font-semibold tracking-tight text-white">
                  {normalizedPayload.title || "Untitled post"}
                </h1>
                {normalizedPayload.excerpt && (
                  <p className="text-lg text-zinc-400 leading-8">{normalizedPayload.excerpt}</p>
                )}
              </header>
              <div className="prose prose-invert max-w-none prose-headings:scroll-mt-24">
                <Markdown content={normalizedPayload.content_markdown || "_Nothing to preview yet._"} />
              </div>
            </article>
          </div>
        </div>
      </div>

      {(error || status || lastSavedAt) && (
        <div className="text-sm">
          {error && (
            <div className="text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3">
              {error}
            </div>
          )}
          {!error && (status || lastSavedAt) && (
            <div className="text-zinc-400 bg-zinc-900/60 border border-zinc-800 rounded-lg px-4 py-3">
              {status || `Saved at ${lastSavedAt}`}
            </div>
          )}
        </div>
      )}

      <div className="flex items-center gap-3">
        <Button type="submit" disabled={isSaving || isAutosaving} className="bg-cyan-500 hover:bg-cyan-400 text-black">
          {isSaving ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              Save
            </>
          )}
        </Button>
        {isAutosaving && (
          <span className="text-sm text-zinc-400 flex items-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin" />
            Autosaving...
          </span>
        )}
      </div>
    </form>
  );
}
