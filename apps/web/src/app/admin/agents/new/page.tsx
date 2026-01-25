"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useCreateAgent } from "@/hooks/use-admin-api";

export default function NewAgentPage() {
  const router = useRouter();
  const { mutate: createAgent, isPending } = useCreateAgent();

  const [formData, setFormData] = useState({
    slug: "",
    name: "",
    system_prompt: "",
    model_provider: "openai",
    model_name: "xiaomi/mimo-v2-flash:free",
    temperature: 0.7,
    is_active: true,
  });
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    createAgent(formData, {
      onSuccess: () => {
        router.push("/admin/agents");
      },
      onError: (err: unknown) => {
        if (err && typeof err === "object" && "response" in err) {
          const axiosError = err as { response?: { data?: { detail?: string } } };
          setError(axiosError.response?.data?.detail || "Failed to create agent");
        } else {
          setError("Failed to create agent");
        }
      },
    });
  };

  return (
    <div className="max-w-2xl">
      <div className="flex items-center gap-4 mb-6">
        <Link href="/admin/agents">
          <Button variant="ghost" size="icon-sm">
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </Link>
        <h1 className="text-2xl font-semibold">Create Agent</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-1.5">
                Slug
              </label>
              <Input
                value={formData.slug}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-"),
                  })
                }
                placeholder="portfolio-assistant"
                required
                className="bg-zinc-800/50 border-zinc-700"
              />
              <p className="text-xs text-zinc-600 mt-1">
                URL-safe identifier (lowercase, hyphens only)
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-1.5">
                Name
              </label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Portfolio Assistant"
                required
                className="bg-zinc-800/50 border-zinc-700"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-1.5">
              System Prompt
            </label>
            <Textarea
              value={formData.system_prompt}
              onChange={(e) =>
                setFormData({ ...formData, system_prompt: e.target.value })
              }
              placeholder="You are a helpful assistant..."
              required
              rows={6}
              className="bg-zinc-800/50 border-zinc-700"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-1.5">
                Model Provider
              </label>
              <Input
                value={formData.model_provider}
                onChange={(e) =>
                  setFormData({ ...formData, model_provider: e.target.value })
                }
                placeholder="openai"
                className="bg-zinc-800/50 border-zinc-700"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-1.5">
                Model Name
              </label>
              <Input
                value={formData.model_name}
                onChange={(e) =>
                  setFormData({ ...formData, model_name: e.target.value })
                }
                placeholder="xiaomi/mimo-v2-flash:free"
                className="bg-zinc-800/50 border-zinc-700"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-1.5">
                Temperature
              </label>
              <Input
                type="number"
                step="0.1"
                min="0"
                max="2"
                value={formData.temperature}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    temperature: parseFloat(e.target.value),
                  })
                }
                className="bg-zinc-800/50 border-zinc-700"
              />
            </div>
            <div className="flex items-center pt-7">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.is_active}
                  onChange={(e) =>
                    setFormData({ ...formData, is_active: e.target.checked })
                  }
                  className="w-4 h-4 rounded border-zinc-700 bg-zinc-800 text-cyan-500 focus:ring-cyan-500"
                />
                <span className="text-sm text-zinc-400">Active</span>
              </label>
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
                Creating...
              </>
            ) : (
              "Create Agent"
            )}
          </Button>
          <Link href="/admin/agents">
            <Button type="button" variant="outline">
              Cancel
            </Button>
          </Link>
        </div>
      </form>
    </div>
  );
}
