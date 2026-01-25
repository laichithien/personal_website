"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2, GraduationCap, Plus, X } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  usePortfolioSetting,
  useUpdatePortfolioSetting,
} from "@/hooks/use-admin-api";

interface EducationData {
  school: string;
  degree: string;
  period: string;
  gpa: string;
  rank: string;
  coursework: string[];
}

const defaultEducationData: EducationData = {
  school: "",
  degree: "",
  period: "",
  gpa: "",
  rank: "",
  coursework: [],
};

export default function EducationSettingsPage() {
  const router = useRouter();
  const { data: setting, isLoading } = usePortfolioSetting("education");
  const { mutate: updateSetting, isPending } = useUpdatePortfolioSetting();

  const [formData, setFormData] = useState<EducationData>(defaultEducationData);
  const [newCourse, setNewCourse] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (setting?.value) {
      const value = setting.value as unknown as EducationData;
      setFormData({
        school: value.school || "",
        degree: value.degree || "",
        period: value.period || "",
        gpa: value.gpa || "",
        rank: value.rank || "",
        coursework: value.coursework || [],
      });
    }
  }, [setting]);

  const addCourse = () => {
    if (newCourse.trim()) {
      setFormData({
        ...formData,
        coursework: [...formData.coursework, newCourse.trim()],
      });
      setNewCourse("");
    }
  };

  const removeCourse = (index: number) => {
    setFormData({
      ...formData,
      coursework: formData.coursework.filter((_, i) => i !== index),
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    updateSetting(
      { key: "education", value: formData as unknown as Record<string, unknown> },
      {
        onSuccess: () => {
          router.push("/admin/portfolio");
        },
        onError: (err: unknown) => {
          if (err && typeof err === "object" && "response" in err) {
            const axiosError = err as {
              response?: { data?: { detail?: string } };
            };
            setError(
              axiosError.response?.data?.detail ||
                "Failed to update education settings"
            );
          } else {
            setError("Failed to update education settings");
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

  return (
    <div className="max-w-2xl">
      <div className="flex items-center gap-4 mb-6">
        <Link href="/admin/portfolio">
          <Button variant="ghost" size="icon-sm">
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </Link>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center">
            <GraduationCap className="w-5 h-5 text-cyan-400" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold">Education</h1>
            <p className="text-sm text-zinc-500">
              Your educational background
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-1.5">
              School
            </label>
            <Input
              value={formData.school}
              onChange={(e) =>
                setFormData({ ...formData, school: e.target.value })
              }
              placeholder="University or institution name"
              required
              className="bg-zinc-800/50 border-zinc-700"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-1.5">
              Degree
            </label>
            <Input
              value={formData.degree}
              onChange={(e) =>
                setFormData({ ...formData, degree: e.target.value })
              }
              placeholder="e.g., BS in Computer Science"
              required
              className="bg-zinc-800/50 border-zinc-700"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-1.5">
                Period
              </label>
              <Input
                value={formData.period}
                onChange={(e) =>
                  setFormData({ ...formData, period: e.target.value })
                }
                placeholder="e.g., 2020 - 2024"
                className="bg-zinc-800/50 border-zinc-700"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-1.5">
                GPA
              </label>
              <Input
                value={formData.gpa}
                onChange={(e) => setFormData({ ...formData, gpa: e.target.value })}
                placeholder="e.g., 8.42/10"
                className="bg-zinc-800/50 border-zinc-700"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-1.5">
              Rank/Achievement
            </label>
            <Input
              value={formData.rank}
              onChange={(e) => setFormData({ ...formData, rank: e.target.value })}
              placeholder="e.g., Top 10/32 graduating students"
              className="bg-zinc-800/50 border-zinc-700"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-1.5">
              Relevant Coursework
            </label>
            <div className="space-y-2">
              <div className="flex flex-wrap gap-2">
                {formData.coursework.map((course, index) => (
                  <span
                    key={index}
                    className="flex items-center gap-1 bg-zinc-800 border border-zinc-700 rounded-full px-3 py-1 text-sm"
                  >
                    {course}
                    <button
                      type="button"
                      onClick={() => removeCourse(index)}
                      className="text-zinc-500 hover:text-red-400 transition-colors"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex items-center gap-2">
                <Input
                  value={newCourse}
                  onChange={(e) => setNewCourse(e.target.value)}
                  placeholder="Add a course"
                  className="bg-zinc-800/50 border-zinc-700"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addCourse();
                    }
                  }}
                />
                <Button
                  type="button"
                  onClick={addCourse}
                  variant="outline"
                  size="icon"
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </div>
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
          <Link href="/admin/portfolio">
            <Button type="button" variant="outline">
              Cancel
            </Button>
          </Link>
        </div>
      </form>
    </div>
  );
}
