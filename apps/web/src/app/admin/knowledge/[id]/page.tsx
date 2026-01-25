"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useKnowledgeDocument, useUpdateKnowledgeDocument } from "@/hooks/use-admin-api";

export default function EditKnowledgePage() {
  const router = useRouter();
  const params = useParams();
  const docId = Number(params.id);

  const { data: document, isLoading } = useKnowledgeDocument(docId);
  const { mutate: updateDocument, isPending } = useUpdateKnowledgeDocument();

  const [formData, setFormData] = useState({
    title: "",
    content: "",
    source: "",
  });
  const [error, setError] = useState("");

  useEffect(() => {
    if (document) {
      setFormData({
        title: document.title,
        content: document.content,
        source: document.source,
      });
    }
  }, [document]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    updateDocument(
      { id: docId, data: formData },
      {
        onSuccess: () => {
          router.push("/admin/knowledge");
        },
        onError: (err: unknown) => {
          if (err && typeof err === "object" && "response" in err) {
            const axiosError = err as { response?: { data?: { detail?: string } } };
            setError(axiosError.response?.data?.detail || "Failed to update document");
          } else {
            setError("Failed to update document");
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

  if (!document) {
    return (
      <div className="text-center py-12">
        <p className="text-zinc-500">Document not found</p>
        <Link href="/admin/knowledge" className="text-cyan-400 hover:underline mt-2 inline-block">
          Back to knowledge base
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl">
      <div className="flex items-center gap-4 mb-6">
        <Link href="/admin/knowledge">
          <Button variant="ghost" size="icon-sm">
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </Link>
        <h1 className="text-2xl font-semibold">Edit Document</h1>
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
              required
              rows={12}
              className="bg-zinc-800/50 border-zinc-700"
            />
          </div>

          <div className="text-xs text-zinc-500">
            Chunks: {document.chunk_count} • Created:{" "}
            {new Date(document.created_at).toLocaleDateString()}
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
