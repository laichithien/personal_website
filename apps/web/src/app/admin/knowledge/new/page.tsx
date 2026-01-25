"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useCreateKnowledgeDocument } from "@/hooks/use-admin-api";

export default function NewKnowledgePage() {
  const router = useRouter();
  const { mutate: createDocument, isPending } = useCreateKnowledgeDocument();

  const [formData, setFormData] = useState({
    title: "",
    content: "",
    source: "manual",
  });
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    createDocument(formData, {
      onSuccess: () => {
        router.push("/admin/knowledge");
      },
      onError: (err: unknown) => {
        if (err && typeof err === "object" && "response" in err) {
          const axiosError = err as { response?: { data?: { detail?: string } } };
          setError(axiosError.response?.data?.detail || "Failed to create document");
        } else {
          setError("Failed to create document");
        }
      },
    });
  };

  return (
    <div className="max-w-2xl">
      <div className="flex items-center gap-4 mb-6">
        <Link href="/admin/knowledge">
          <Button variant="ghost" size="icon-sm">
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </Link>
        <h1 className="text-2xl font-semibold">Create Document</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-1.5">
              Title
            </label>
            <Input
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Document title"
              required
              className="bg-zinc-800/50 border-zinc-700"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-1.5">
              Source
            </label>
            <Input
              value={formData.source}
              onChange={(e) => setFormData({ ...formData, source: e.target.value })}
              placeholder="manual, cv, project, etc."
              className="bg-zinc-800/50 border-zinc-700"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-1.5">
              Content
            </label>
            <Textarea
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              placeholder="Document content..."
              required
              rows={12}
              className="bg-zinc-800/50 border-zinc-700"
            />
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
              "Create Document"
            )}
          </Button>
          <Link href="/admin/knowledge">
            <Button type="button" variant="outline">
              Cancel
            </Button>
          </Link>
        </div>
      </form>
    </div>
  );
}
