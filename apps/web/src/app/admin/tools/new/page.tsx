"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useCreateTool } from "@/hooks/use-admin-api";

export default function NewToolPage() {
  const router = useRouter();
  const { mutate: createTool, isPending } = useCreateTool();

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    is_active: true,
  });
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    createTool(formData, {
      onSuccess: () => {
        router.push("/admin/tools");
      },
      onError: (err: unknown) => {
        if (err && typeof err === "object" && "response" in err) {
          const axiosError = err as { response?: { data?: { detail?: string } } };
          setError(axiosError.response?.data?.detail || "Failed to create tool");
        } else {
          setError("Failed to create tool");
        }
      },
    });
  };

  return (
    <div className="max-w-2xl">
      <div className="flex items-center gap-4 mb-6">
        <Link href="/admin/tools">
          <Button variant="ghost" size="icon-sm">
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </Link>
        <h1 className="text-2xl font-semibold">Create Tool</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-1.5">
              Name
            </label>
            <Input
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="search_knowledge"
              required
              className="bg-zinc-800/50 border-zinc-700"
            />
            <p className="text-xs text-zinc-600 mt-1">
              Must match the function name in code
            </p>
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
              placeholder="Search the knowledge base for relevant information..."
              required
              rows={4}
              className="bg-zinc-800/50 border-zinc-700"
            />
            <p className="text-xs text-zinc-600 mt-1">
              Help the AI understand when to use this tool
            </p>
          </div>

          <div className="flex items-center">
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
              "Create Tool"
            )}
          </Button>
          <Link href="/admin/tools">
            <Button type="button" variant="outline">
              Cancel
            </Button>
          </Link>
        </div>
      </form>
    </div>
  );
}
