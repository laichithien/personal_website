"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2, Plus, X } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCreatePortfolioCourse } from "@/hooks/use-admin-api";

export default function NewCoursePage() {
  const router = useRouter();
  const { mutate: createCourse, isPending } = useCreatePortfolioCourse();

  const [formData, setFormData] = useState({
    title: "",
    year: new Date().getFullYear(),
    focus: [] as string[],
    is_active: true,
  });
  const [newFocus, setNewFocus] = useState("");
  const [error, setError] = useState("");

  const addFocus = () => {
    if (newFocus.trim() && !formData.focus.includes(newFocus.trim())) {
      setFormData({
        ...formData,
        focus: [...formData.focus, newFocus.trim()],
      });
      setNewFocus("");
    }
  };

  const removeFocus = (index: number) => {
    setFormData({
      ...formData,
      focus: formData.focus.filter((_, i) => i !== index),
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    createCourse(formData, {
      onSuccess: () => {
        router.push("/admin/portfolio/courses");
      },
      onError: (err: unknown) => {
        if (err && typeof err === "object" && "response" in err) {
          const axiosError = err as {
            response?: { data?: { detail?: string } };
          };
          setError(
            axiosError.response?.data?.detail || "Failed to create course"
          );
        } else {
          setError("Failed to create course");
        }
      },
    });
  };

  return (
    <div className="max-w-2xl">
      <div className="flex items-center gap-4 mb-6">
        <Link href="/admin/portfolio/courses">
          <Button variant="ghost" size="icon-sm">
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-semibold">Add Course</h1>
          <p className="text-sm text-zinc-500">Add a new professional course</p>
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
              placeholder="e.g., Machine Learning Engineer K3"
              required
              className="bg-zinc-800/50 border-zinc-700"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-1.5">
              Year
            </label>
            <Input
              type="number"
              value={formData.year}
              onChange={(e) =>
                setFormData({ ...formData, year: parseInt(e.target.value) })
              }
              min={1900}
              max={2100}
              required
              className="bg-zinc-800/50 border-zinc-700"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-1.5">
              Focus Areas
            </label>
            <div className="space-y-2">
              <div className="flex flex-wrap gap-2">
                {formData.focus.map((item, index) => (
                  <span
                    key={index}
                    className="flex items-center gap-1 bg-zinc-800 border border-zinc-700 rounded-full px-3 py-1 text-sm"
                  >
                    {item}
                    <button
                      type="button"
                      onClick={() => removeFocus(index)}
                      className="text-zinc-500 hover:text-red-400 transition-colors"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex items-center gap-2">
                <Input
                  value={newFocus}
                  onChange={(e) => setNewFocus(e.target.value)}
                  placeholder="Add a focus area"
                  className="bg-zinc-800/50 border-zinc-700"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addFocus();
                    }
                  }}
                />
                <Button
                  type="button"
                  onClick={addFocus}
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
                Creating...
              </>
            ) : (
              "Create Course"
            )}
          </Button>
          <Link href="/admin/portfolio/courses">
            <Button type="button" variant="outline">
              Cancel
            </Button>
          </Link>
        </div>
      </form>
    </div>
  );
}
