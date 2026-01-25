"use client";

import { useState } from "react";
import Link from "next/link";
import { BookOpen, Plus, Pencil, Trash2, GripVertical, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  usePortfolioPublications,
  useDeletePortfolioPublication,
  useReorderPortfolioPublications,
} from "@/hooks/use-admin-api";

export default function PublicationsPage() {
  const { data: publications, isLoading } = usePortfolioPublications();
  const { mutate: deletePublication, isPending: isDeleting } =
    useDeletePortfolioPublication();
  const { mutate: reorderPublications } = useReorderPortfolioPublications();
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [draggedId, setDraggedId] = useState<number | null>(null);

  const handleDelete = (id: number, title: string) => {
    if (confirm(`Are you sure you want to delete "${title}"?`)) {
      setDeletingId(id);
      deletePublication(id, {
        onSettled: () => setDeletingId(null),
      });
    }
  };

  const handleDragStart = (e: React.DragEvent, id: number) => {
    setDraggedId(id);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = (e: React.DragEvent, targetId: number) => {
    e.preventDefault();
    if (!draggedId || draggedId === targetId || !publications) return;

    const items = [...publications];
    const draggedIndex = items.findIndex((item) => item.id === draggedId);
    const targetIndex = items.findIndex((item) => item.id === targetId);

    const [draggedItem] = items.splice(draggedIndex, 1);
    items.splice(targetIndex, 0, draggedItem);

    const newOrder = items.map((item) => item.id);
    reorderPublications(newOrder);
    setDraggedId(null);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Link href="/admin/portfolio">
            <Button variant="ghost" size="sm">
              &larr; Back
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-semibold">Publications</h1>
            <p className="text-sm text-zinc-500">
              Manage your academic publications
            </p>
          </div>
        </div>
        <Link href="/admin/portfolio/publications/new">
          <Button className="bg-cyan-500 hover:bg-cyan-400 text-black">
            <Plus className="w-4 h-4" />
            Add Publication
          </Button>
        </Link>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2].map((i) => (
            <div
              key={i}
              className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6 animate-pulse"
            >
              <div className="h-5 bg-zinc-800 rounded w-3/4 mb-2" />
              <div className="h-4 bg-zinc-800 rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : publications && publications.length > 0 ? (
        <div className="space-y-4">
          {publications.map((pub) => (
            <div
              key={pub.id}
              draggable
              onDragStart={(e) => handleDragStart(e, pub.id)}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, pub.id)}
              className={`bg-zinc-900/50 border border-zinc-800 rounded-xl p-6 cursor-move ${
                draggedId === pub.id ? "opacity-50" : ""
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <div className="flex items-center gap-2">
                    <GripVertical className="w-5 h-5 text-zinc-600" />
                    <div className="w-10 h-10 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center">
                      <BookOpen className="w-5 h-5 text-cyan-400" />
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium">{pub.title}</h3>
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full ${
                          pub.is_active
                            ? "bg-green-500/10 text-green-400 border border-green-500/20"
                            : "bg-zinc-800 text-zinc-500"
                        }`}
                      >
                        {pub.is_active ? "Active" : "Hidden"}
                      </span>
                    </div>
                    <p className="text-sm text-zinc-400 mt-1">
                      {pub.venue} • {pub.year}
                    </p>
                    {pub.doi && (
                      <a
                        href={`https://doi.org/${pub.doi}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-xs text-cyan-400 hover:underline mt-2"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <ExternalLink className="w-3 h-3" />
                        DOI: {pub.doi}
                      </a>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Link href={`/admin/portfolio/publications/${pub.id}`}>
                    <Button variant="ghost" size="icon-sm">
                      <Pencil className="w-4 h-4" />
                    </Button>
                  </Link>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => handleDelete(pub.id, pub.title)}
                    disabled={isDeleting && deletingId === pub.id}
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
          <BookOpen className="w-12 h-12 text-zinc-600 mx-auto mb-4" />
          <h3 className="font-medium text-zinc-400">No publications yet</h3>
          <p className="text-sm text-zinc-600 mt-1">
            Add your first academic publication.
          </p>
          <Link href="/admin/portfolio/publications/new" className="inline-block mt-4">
            <Button className="bg-cyan-500 hover:bg-cyan-400 text-black">
              <Plus className="w-4 h-4" />
              Add Publication
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
}
