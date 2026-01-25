"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  usePortfolioTechStackItem,
  useUpdatePortfolioTechStack,
} from "@/hooks/use-admin-api";

const categories = ["language", "ai", "backend", "frontend", "database", "devops"];

export default function EditTechStackPage() {
  const router = useRouter();
  const params = useParams();
  const techId = Number(params.id);

  const { data: tech, isLoading } = usePortfolioTechStackItem(techId);
  const { mutate: updateTech, isPending } = useUpdatePortfolioTechStack();

  const [formData, setFormData] = useState({
    name: "",
    icon: "",
    category: "language",
    is_active: true,
  });
  const [error, setError] = useState("");

  useEffect(() => {
    if (tech) {
      setFormData({
        name: tech.name,
        icon: tech.icon || "",
        category: tech.category,
        is_active: tech.is_active,
      });
    }
  }, [tech]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    updateTech(
      { id: techId, data: formData },
      {
        onSuccess: () => {
          router.push("/admin/portfolio/tech-stack");
        },
        onError: (err: unknown) => {
          if (err && typeof err === "object" && "response" in err) {
            const axiosError = err as {
              response?: { data?: { detail?: string } };
            };
            setError(
              axiosError.response?.data?.detail || "Failed to update technology"
            );
          } else {
            setError("Failed to update technology");
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

  if (!tech) {
    return (
      <div className="text-center py-12">
        <p className="text-zinc-500">Technology not found</p>
        <Link
          href="/admin/portfolio/tech-stack"
          className="text-cyan-400 hover:underline mt-2 inline-block"
        >
          Back to tech stack
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl">
      <div className="flex items-center gap-4 mb-6">
        <Link href="/admin/portfolio/tech-stack">
          <Button variant="ghost" size="icon-sm">
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-semibold">Edit Technology</h1>
          <p className="text-sm text-zinc-500">{tech.name}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-1.5">
              Name
            </label>
            <Input
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              placeholder="e.g., Python, TypeScript, Docker"
              required
              className="bg-zinc-800/50 border-zinc-700"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-1.5">
              Icon
            </label>
            <Input
              value={formData.icon}
              onChange={(e) =>
                setFormData({ ...formData, icon: e.target.value })
              }
              placeholder="e.g., python, typescript, docker"
              className="bg-zinc-800/50 border-zinc-700"
            />
            <p className="text-xs text-zinc-600 mt-1">
              Icon identifier for display purposes
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-1.5">
              Category
            </label>
            <select
              value={formData.category}
              onChange={(e) =>
                setFormData({ ...formData, category: e.target.value })
              }
              className="w-full px-3 py-2 bg-zinc-800/50 border border-zinc-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat.charAt(0).toUpperCase() + cat.slice(1)}
                </option>
              ))}
            </select>
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
          <Link href="/admin/portfolio/tech-stack">
            <Button type="button" variant="outline">
              Cancel
            </Button>
          </Link>
        </div>
      </form>
    </div>
  );
}
