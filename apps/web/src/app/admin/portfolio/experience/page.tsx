"use client";

import { useState } from "react";
import Link from "next/link";
import { Briefcase, Plus, Pencil, Trash2, GripVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  usePortfolioExperiences,
  useDeletePortfolioExperience,
  useReorderPortfolioExperiences,
} from "@/hooks/use-admin-api";

export default function ExperiencePage() {
  const { data: experiences, isLoading } = usePortfolioExperiences();
  const { mutate: deleteExperience, isPending: isDeleting } =
    useDeletePortfolioExperience();
  const { mutate: reorderExperiences } = useReorderPortfolioExperiences();
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [draggedId, setDraggedId] = useState<number | null>(null);

  const handleDelete = (id: number, company: string) => {
    if (confirm(`Are you sure you want to delete "${company}"?`)) {
      setDeletingId(id);
      deleteExperience(id, {
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
    if (!draggedId || draggedId === targetId || !experiences) return;

    const items = [...experiences];
    const draggedIndex = items.findIndex((item) => item.id === draggedId);
    const targetIndex = items.findIndex((item) => item.id === targetId);

    const [draggedItem] = items.splice(draggedIndex, 1);
    items.splice(targetIndex, 0, draggedItem);

    const newOrder = items.map((item) => item.id);
    reorderExperiences(newOrder);
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
            <h1 className="text-2xl font-semibold">Experience</h1>
            <p className="text-sm text-zinc-500">
              Manage your work history and roles
            </p>
          </div>
        </div>
        <Link href="/admin/portfolio/experience/new">
          <Button className="bg-cyan-500 hover:bg-cyan-400 text-black">
            <Plus className="w-4 h-4" />
            Add Experience
          </Button>
        </Link>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6 animate-pulse"
            >
              <div className="h-5 bg-zinc-800 rounded w-1/4 mb-2" />
              <div className="h-4 bg-zinc-800 rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : experiences && experiences.length > 0 ? (
        <div className="space-y-4">
          {experiences.map((exp) => (
            <div
              key={exp.id}
              draggable
              onDragStart={(e) => handleDragStart(e, exp.id)}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, exp.id)}
              className={`bg-zinc-900/50 border border-zinc-800 rounded-xl p-6 cursor-move ${
                draggedId === exp.id ? "opacity-50" : ""
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <div className="flex items-center gap-2">
                    <GripVertical className="w-5 h-5 text-zinc-600" />
                    <div className="w-10 h-10 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center">
                      <Briefcase className="w-5 h-5 text-cyan-400" />
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium">{exp.company}</h3>
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full ${
                          exp.is_active
                            ? "bg-green-500/10 text-green-400 border border-green-500/20"
                            : "bg-zinc-800 text-zinc-500"
                        }`}
                      >
                        {exp.is_active ? "Active" : "Hidden"}
                      </span>
                    </div>
                    <p className="text-sm text-zinc-400 mt-0.5">
                      {exp.role} • {exp.period}
                    </p>
                    <ul className="text-sm text-zinc-500 mt-2 space-y-1">
                      {exp.highlights.slice(0, 2).map((highlight, i) => (
                        <li key={i} className="line-clamp-1">
                          • {highlight}
                        </li>
                      ))}
                      {exp.highlights.length > 2 && (
                        <li className="text-zinc-600">
                          +{exp.highlights.length - 2} more
                        </li>
                      )}
                    </ul>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Link href={`/admin/portfolio/experience/${exp.id}`}>
                    <Button variant="ghost" size="icon-sm">
                      <Pencil className="w-4 h-4" />
                    </Button>
                  </Link>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => handleDelete(exp.id, exp.company)}
                    disabled={isDeleting && deletingId === exp.id}
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
          <Briefcase className="w-12 h-12 text-zinc-600 mx-auto mb-4" />
          <h3 className="font-medium text-zinc-400">No experience yet</h3>
          <p className="text-sm text-zinc-600 mt-1">
            Add your first work experience to get started.
          </p>
          <Link href="/admin/portfolio/experience/new" className="inline-block mt-4">
            <Button className="bg-cyan-500 hover:bg-cyan-400 text-black">
              <Plus className="w-4 h-4" />
              Add Experience
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
}
