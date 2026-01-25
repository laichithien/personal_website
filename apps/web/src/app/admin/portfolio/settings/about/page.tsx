"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2, User, Plus, X } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  usePortfolioSetting,
  useUpdatePortfolioSetting,
} from "@/hooks/use-admin-api";

interface AboutData {
  summary: string;
  highlights: string[];
}

const defaultAboutData: AboutData = {
  summary: "",
  highlights: [],
};

export default function AboutSettingsPage() {
  const router = useRouter();
  const { data: setting, isLoading } = usePortfolioSetting("about");
  const { mutate: updateSetting, isPending } = useUpdatePortfolioSetting();

  const [formData, setFormData] = useState<AboutData>(defaultAboutData);
  const [newHighlight, setNewHighlight] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (setting?.value) {
      const value = setting.value as unknown as AboutData;
      setFormData({
        summary: value.summary || "",
        highlights: value.highlights || [],
      });
    }
  }, [setting]);

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

    updateSetting(
      { key: "about", value: formData as unknown as Record<string, unknown> },
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
              axiosError.response?.data?.detail || "Failed to update about settings"
            );
          } else {
            setError("Failed to update about settings");
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
            <User className="w-5 h-5 text-cyan-400" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold">About Section</h1>
            <p className="text-sm text-zinc-500">
              Summary and highlights about yourself
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-1.5">
              Summary
            </label>
            <Textarea
              value={formData.summary}
              onChange={(e) =>
                setFormData({ ...formData, summary: e.target.value })
              }
              placeholder="A brief professional summary about yourself"
              rows={4}
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
