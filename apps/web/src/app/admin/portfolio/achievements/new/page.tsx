"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCreatePortfolioAchievement } from "@/hooks/use-admin-api";

export default function NewAchievementPage() {
  const router = useRouter();
  const { mutate: createAchievement, isPending } = useCreatePortfolioAchievement();

  const [formData, setFormData] = useState({
    title: "",
    event: "",
    organization: "",
    year: new Date().getFullYear(),
    is_active: true,
  });
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    createAchievement(formData, {
      onSuccess: () => {
        router.push("/admin/portfolio/achievements");
      },
      onError: (err: unknown) => {
        if (err && typeof err === "object" && "response" in err) {
          const axiosError = err as {
            response?: { data?: { detail?: string } };
          };
          setError(
            axiosError.response?.data?.detail || "Failed to create achievement"
          );
        } else {
          setError("Failed to create achievement");
        }
      },
    });
  };

  return (
    <div className="max-w-2xl">
      <div className="flex items-center gap-4 mb-6">
        <Link href="/admin/portfolio/achievements">
          <Button variant="ghost" size="icon-sm">
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-semibold">Add Achievement</h1>
          <p className="text-sm text-zinc-500">Add a new award or recognition</p>
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
              placeholder="e.g., Innovation Award"
              required
              className="bg-zinc-800/50 border-zinc-700"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-1.5">
              Event
            </label>
            <Input
              value={formData.event}
              onChange={(e) =>
                setFormData({ ...formData, event: e.target.value })
              }
              placeholder="e.g., AI Tempo Run Competition"
              required
              className="bg-zinc-800/50 border-zinc-700"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-1.5">
                Organization
              </label>
              <Input
                value={formData.organization}
                onChange={(e) =>
                  setFormData({ ...formData, organization: e.target.value })
                }
                placeholder="e.g., UIT AI Club"
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
              "Create Achievement"
            )}
          </Button>
          <Link href="/admin/portfolio/achievements">
            <Button type="button" variant="outline">
              Cancel
            </Button>
          </Link>
        </div>
      </form>
    </div>
  );
}
