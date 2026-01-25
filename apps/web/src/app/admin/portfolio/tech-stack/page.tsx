"use client";

import { useState } from "react";
import Link from "next/link";
import { Code, Plus, Pencil, Trash2, GripVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  usePortfolioTechStack,
  useDeletePortfolioTechStack,
  useReorderPortfolioTechStack,
} from "@/hooks/use-admin-api";

const categoryColors: Record<string, string> = {
  language: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  ai: "bg-purple-500/10 text-purple-400 border-purple-500/20",
  backend: "bg-green-500/10 text-green-400 border-green-500/20",
  frontend: "bg-orange-500/10 text-orange-400 border-orange-500/20",
  database: "bg-red-500/10 text-red-400 border-red-500/20",
  devops: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
};

export default function TechStackPage() {
  const { data: techStack, isLoading } = usePortfolioTechStack();
  const { mutate: deleteTech, isPending: isDeleting } =
    useDeletePortfolioTechStack();
  const { mutate: reorderTechStack } = useReorderPortfolioTechStack();
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [draggedId, setDraggedId] = useState<number | null>(null);

  const handleDelete = (id: number, name: string) => {
    if (confirm(`Are you sure you want to delete "${name}"?`)) {
      setDeletingId(id);
      deleteTech(id, {
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
    if (!draggedId || draggedId === targetId || !techStack) return;

    const items = [...techStack];
    const draggedIndex = items.findIndex((item) => item.id === draggedId);
    const targetIndex = items.findIndex((item) => item.id === targetId);

    const [draggedItem] = items.splice(draggedIndex, 1);
    items.splice(targetIndex, 0, draggedItem);

    const newOrder = items.map((item) => item.id);
    reorderTechStack(newOrder);
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
            <h1 className="text-2xl font-semibold">Tech Stack</h1>
            <p className="text-sm text-zinc-500">
              Manage your technologies and skills
            </p>
          </div>
        </div>
        <Link href="/admin/portfolio/tech-stack/new">
          <Button className="bg-cyan-500 hover:bg-cyan-400 text-black">
            <Plus className="w-4 h-4" />
            Add Technology
          </Button>
        </Link>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-4 animate-pulse"
            >
              <div className="h-5 bg-zinc-800 rounded w-1/2 mb-2" />
              <div className="h-4 bg-zinc-800 rounded w-1/4" />
            </div>
          ))}
        </div>
      ) : techStack && techStack.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {techStack.map((tech) => (
            <div
              key={tech.id}
              draggable
              onDragStart={(e) => handleDragStart(e, tech.id)}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, tech.id)}
              className={`bg-zinc-900/50 border border-zinc-800 rounded-xl p-4 cursor-move ${
                draggedId === tech.id ? "opacity-50" : ""
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <GripVertical className="w-4 h-4 text-zinc-600" />
                  <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center">
                    <Code className="w-4 h-4 text-cyan-400" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium text-sm">{tech.name}</h3>
                      {!tech.is_active && (
                        <span className="text-xs px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-500">
                          Hidden
                        </span>
                      )}
                    </div>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full border ${
                        categoryColors[tech.category] || "bg-zinc-800 text-zinc-400"
                      }`}
                    >
                      {tech.category}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <Link href={`/admin/portfolio/tech-stack/${tech.id}`}>
                    <Button variant="ghost" size="icon-sm">
                      <Pencil className="w-3 h-3" />
                    </Button>
                  </Link>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => handleDelete(tech.id, tech.name)}
                    disabled={isDeleting && deletingId === tech.id}
                    className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-12 text-center">
          <Code className="w-12 h-12 text-zinc-600 mx-auto mb-4" />
          <h3 className="font-medium text-zinc-400">No technologies yet</h3>
          <p className="text-sm text-zinc-600 mt-1">
            Add your first technology to your stack.
          </p>
          <Link href="/admin/portfolio/tech-stack/new" className="inline-block mt-4">
            <Button className="bg-cyan-500 hover:bg-cyan-400 text-black">
              <Plus className="w-4 h-4" />
              Add Technology
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
}
