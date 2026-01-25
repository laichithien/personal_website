"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft, Loader2, Plus, X } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  usePortfolioExperience,
  useUpdatePortfolioExperience,
} from "@/hooks/use-admin-api";

export default function EditExperiencePage() {
  const router = useRouter();
  const params = useParams();
  const experienceId = Number(params.id);

  const { data: experience, isLoading } = usePortfolioExperience(experienceId);
  const { mutate: updateExperience, isPending } = useUpdatePortfolioExperience();

  const [formData, setFormData] = useState({
    company: "",
    role: "",
    period: "",
    highlights: [] as string[],
    is_active: true,
  });
  const [newHighlight, setNewHighlight] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (experience) {
      setFormData({
        company: experience.company,
        role: experience.role,
        period: experience.period,
        highlights: experience.highlights || [],
        is_active: experience.is_active,
      });
    }
  }, [experience]);

  const addHighlight = () => {
    if (newHighlight.trim()) {
      setFormData({
        ...formData,
        highlights: [...formData.highlights, newHighlight.trim()],
      });
      setNewHighlight("");
    }
  };

  const removeHighlight = (index: number) => {
    setFormData({
      ...formData,
      highlights: formData.highlights.filter((_, i) => i !== index),
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    updateExperience(
      { id: experienceId, data: formData },
      {
        onSuccess: () => {
          router.push("/admin/portfolio/experience");
        },
        onError: (err: unknown) => {
          if (err && typeof err === "object" && "response" in err) {
            const axiosError = err as {
              response?: { data?: { detail?: string } };
            };
            setError(
              axiosError.response?.data?.detail || "Failed to update experience"
            );
          } else {
            setError("Failed to update experience");
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

  if (!experience) {
    return (
      <div className="text-center py-12">
        <p className="text-zinc-500">Experience not found</p>
        <Link
          href="/admin/portfolio/experience"
          className="text-cyan-400 hover:underline mt-2 inline-block"
        >
          Back to experience list
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl">
      <div className="flex items-center gap-4 mb-6">
        <Link href="/admin/portfolio/experience">
          <Button variant="ghost" size="icon-sm">
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-semibold">Edit Experience</h1>
          <p className="text-sm text-zinc-500">{experience.company}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-1.5">
              Company
            </label>
            <Input
              value={formData.company}
              onChange={(e) =>
                setFormData({ ...formData, company: e.target.value })
              }
              placeholder="Company name"
              required
              className="bg-zinc-800/50 border-zinc-700"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-1.5">
              Role
            </label>
            <Input
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              placeholder="e.g., AI Engineer"
              required
              className="bg-zinc-800/50 border-zinc-700"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-1.5">
              Period
            </label>
            <Input
              value={formData.period}
              onChange={(e) =>
                setFormData({ ...formData, period: e.target.value })
              }
              placeholder="e.g., Jun 2025 - Present"
              required
              className="bg-zinc-800/50 border-zinc-700"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-1.5">
              Highlights
            </label>
            <div className="space-y-2">
              {formData.highlights.map((highlight, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2 bg-zinc-800/50 border border-zinc-700 rounded-lg px-3 py-2"
                >
                  <span className="flex-1 text-sm">{highlight}</span>
                  <button
                    type="button"
                    onClick={() => removeHighlight(index)}
                    className="text-zinc-500 hover:text-red-400 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
              <div className="flex items-center gap-2">
                <Input
                  value={newHighlight}
                  onChange={(e) => setNewHighlight(e.target.value)}
                  placeholder="Add a highlight"
                  className="bg-zinc-800/50 border-zinc-700"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addHighlight();
                    }
                  }}
                />
                <Button
                  type="button"
                  onClick={addHighlight}
                  variant="outline"
                  size="icon"
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>

          <div className="flex items-center pt-2">
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
          <Link href="/admin/portfolio/experience">
            <Button type="button" variant="outline">
              Cancel
            </Button>
          </Link>
        </div>
      </form>
    </div>
  );
}
