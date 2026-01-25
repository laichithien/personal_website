"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft, Loader2, Plus, X } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  usePortfolioProject,
  useUpdatePortfolioProject,
} from "@/hooks/use-admin-api";

export default function EditProjectPage() {
  const router = useRouter();
  const params = useParams();
  const projectId = Number(params.id);

  const { data: project, isLoading } = usePortfolioProject(projectId);
  const { mutate: updateProject, isPending } = useUpdatePortfolioProject();

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    tags: [] as string[],
    image: "",
    link: "",
    github: "",
    is_featured: false,
    is_active: true,
  });
  const [newTag, setNewTag] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (project) {
      setFormData({
        title: project.title,
        description: project.description,
        tags: project.tags || [],
        image: project.image || "",
        link: project.link || "",
        github: project.github || "",
        is_featured: project.is_featured,
        is_active: project.is_active,
      });
    }
  }, [project]);

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData({
        ...formData,
        tags: [...formData.tags, newTag.trim()],
      });
      setNewTag("");
    }
  };

  const removeTag = (index: number) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter((_, i) => i !== index),
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    updateProject(
      { id: projectId, data: formData },
      {
        onSuccess: () => {
          router.push("/admin/portfolio/projects");
        },
        onError: (err: unknown) => {
          if (err && typeof err === "object" && "response" in err) {
            const axiosError = err as {
              response?: { data?: { detail?: string } };
            };
            setError(
              axiosError.response?.data?.detail || "Failed to update project"
            );
          } else {
            setError("Failed to update project");
          }
        },
      }
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-6 h-6 animate-spin text-zinc-500" />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="text-center py-12">
        <p className="text-zinc-500">Project not found</p>
        <Link
          href="/admin/portfolio/projects"
          className="text-cyan-400 hover:underline mt-2 inline-block"
        >
          Back to projects
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl">
      <div className="flex items-center gap-4 mb-6">
        <Link href="/admin/portfolio/projects">
          <Button variant="ghost" size="icon-sm">
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-semibold">Edit Project</h1>
          <p className="text-sm text-zinc-500">{project.title}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-1.5">
              Title
            </label>
            <Input
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              placeholder="Project title"
              required
              className="bg-zinc-800/50 border-zinc-700"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-1.5">
              Description
            </label>
            <Textarea
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              placeholder="Brief description of the project"
              rows={3}
              required
              className="bg-zinc-800/50 border-zinc-700"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-1.5">
              Tags
            </label>
            <div className="space-y-2">
              <div className="flex flex-wrap gap-2">
                {formData.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="flex items-center gap-1 bg-zinc-800 border border-zinc-700 rounded-full px-3 py-1 text-sm"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeTag(index)}
                      className="text-zinc-500 hover:text-red-400 transition-colors"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex items-center gap-2">
                <Input
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  placeholder="Add a tag"
                  className="bg-zinc-800/50 border-zinc-700"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addTag();
                    }
                  }}
                />
                <Button
                  type="button"
                  onClick={addTag}
                  variant="outline"
                  size="icon"
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-1.5">
              Image URL
            </label>
            <Input
              value={formData.image}
              onChange={(e) =>
                setFormData({ ...formData, image: e.target.value })
              }
              placeholder="/images/project.jpg"
              className="bg-zinc-800/50 border-zinc-700"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-1.5">
                Live Link
              </label>
              <Input
                value={formData.link}
                onChange={(e) =>
                  setFormData({ ...formData, link: e.target.value })
                }
                placeholder="https://project.com"
                type="url"
                className="bg-zinc-800/50 border-zinc-700"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-1.5">
                GitHub URL
              </label>
              <Input
                value={formData.github}
                onChange={(e) =>
                  setFormData({ ...formData, github: e.target.value })
                }
                placeholder="https://github.com/..."
                type="url"
                className="bg-zinc-800/50 border-zinc-700"
              />
            </div>
          </div>

          <div className="flex items-center gap-6 pt-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.is_featured}
                onChange={(e) =>
                  setFormData({ ...formData, is_featured: e.target.checked })
                }
                className="w-4 h-4 rounded border-zinc-700 bg-zinc-800 text-cyan-500 focus:ring-cyan-500"
              />
              <span className="text-sm text-zinc-400">Featured Project</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.is_active}
                onChange={(e) =>
                  setFormData({ ...formData, is_active: e.target.checked })
                }
                className="w-4 h-4 rounded border-zinc-700 bg-zinc-800 text-cyan-500 focus:ring-cyan-500"
              />
              <span className="text-sm text-zinc-400">
                Show on portfolio (Active)
              </span>
            </label>
          </div>
        </div>

        {error && (
          <div className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3">
            {error}
          </div>
        )}

        <div className="flex items-center gap-3">
          <Button
            type="submit"
            disabled={isPending}
            className="bg-cyan-500 hover:bg-cyan-400 text-black"
          >
            {isPending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Saving...
              </>
            ) : (
              "Save Changes"
            )}
          </Button>
          <Link href="/admin/portfolio/projects">
            <Button type="button" variant="outline">
              Cancel
            </Button>
          </Link>
        </div>
      </form>
    </div>
  );
}
