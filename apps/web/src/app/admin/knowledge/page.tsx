"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus, Pencil, Trash2, FileText, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useKnowledgeDocuments, useDeleteKnowledgeDocument } from "@/hooks/use-admin-api";

export default function KnowledgePage() {
  const { data: documents, isLoading } = useKnowledgeDocuments();
  const { mutate: deleteDocument, isPending: isDeleting } = useDeleteKnowledgeDocument();
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const handleDelete = (id: number, title: string) => {
    if (confirm(`Are you sure you want to delete "${title}"?`)) {
      setDeletingId(id);
      deleteDocument(id, {
        onSettled: () => setDeletingId(null),
      });
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">Knowledge Base</h1>
        <div className="flex items-center gap-2">
          <Link href="/admin/knowledge/upload">
            <Button variant="outline">
              <Upload className="w-4 h-4" />
              Upload File
            </Button>
          </Link>
          <Link href="/admin/knowledge/new">
            <Button className="bg-cyan-500 hover:bg-cyan-400 text-black">
              <Plus className="w-4 h-4" />
              New Document
            </Button>
          </Link>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6 animate-pulse"
            >
              <div className="h-5 bg-zinc-800 rounded w-1/4 mb-2" />
              <div className="h-4 bg-zinc-800 rounded w-3/4" />
            </div>
          ))}
        </div>
      ) : documents && documents.length > 0 ? (
        <div className="space-y-4">
          {documents.map((doc) => (
            <div
              key={doc.id}
              className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center">
                    <FileText className="w-5 h-5 text-cyan-400" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium">{doc.title}</h3>
                    <p className="text-sm text-zinc-500 mt-1">
                      Source: {doc.source} • Chunks: {doc.chunk_count}
                    </p>
                    <p className="text-sm text-zinc-600 mt-2 line-clamp-2">
                      {doc.content}
                    </p>
                    <p className="text-xs text-zinc-600 mt-2">
                      Updated: {new Date(doc.updated_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Link href={`/admin/knowledge/${doc.id}`}>
                    <Button variant="ghost" size="icon-sm">
                      <Pencil className="w-4 h-4" />
                    </Button>
                  </Link>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => handleDelete(doc.id, doc.title)}
                    disabled={isDeleting && deletingId === doc.id}
                    className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-12 text-center">
          <FileText className="w-12 h-12 text-zinc-600 mx-auto mb-4" />
          <h3 className="font-medium text-zinc-400">No documents yet</h3>
          <p className="text-sm text-zinc-600 mt-1">
            Add documents to build your knowledge base.
          </p>
          <div className="flex items-center justify-center gap-2 mt-4">
            <Link href="/admin/knowledge/upload">
              <Button variant="outline">
                <Upload className="w-4 h-4" />
                Upload File
              </Button>
            </Link>
            <Link href="/admin/knowledge/new">
              <Button className="bg-cyan-500 hover:bg-cyan-400 text-black">
                <Plus className="w-4 h-4" />
                Create Document
              </Button>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
