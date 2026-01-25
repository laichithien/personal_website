"use client";

import { useState } from "react";
import Link from "next/link";
import { FolderKanban, Plus, Pencil, Trash2, GripVertical, Star, ExternalLink, Github } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  usePortfolioProjects,
  useDeletePortfolioProject,
  useReorderPortfolioProjects,
} from "@/hooks/use-admin-api";

export default function ProjectsPage() {
  const { data: projects, isLoading } = usePortfolioProjects();
  const { mutate: deleteProject, isPending: isDeleting } =
    useDeletePortfolioProject();
  const { mutate: reorderProjects } = useReorderPortfolioProjects();
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [draggedId, setDraggedId] = useState<number | null>(null);

  const handleDelete = (id: number, title: string) => {
    if (confirm(`Are you sure you want to delete "${title}"?`)) {
      setDeletingId(id);
      deleteProject(id, {
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
    if (!draggedId || draggedId === targetId || !projects) return;

    const items = [...projects];
    const draggedIndex = items.findIndex((item) => item.id === draggedId);
    const targetIndex = items.findIndex((item) => item.id === targetId);

    const [draggedItem] = items.splice(draggedIndex, 1);
    items.splice(targetIndex, 0, draggedItem);

    const newOrder = items.map((item) => item.id);
    reorderProjects(newOrder);
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
            <h1 className="text-2xl font-semibold">Projects</h1>
            <p className="text-sm text-zinc-500">
              Manage your portfolio projects
            </p>
          </div>
        </div>
        <Link href="/admin/portfolio/projects/new">
          <Button className="bg-cyan-500 hover:bg-cyan-400 text-black">
            <Plus className="w-4 h-4" />
            Add Project
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
      ) : projects && projects.length > 0 ? (
        <div className="space-y-4">
          {projects.map((project) => (
            <div
              key={project.id}
              draggable
              onDragStart={(e) => handleDragStart(e, project.id)}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, project.id)}
              className={`bg-zinc-900/50 border border-zinc-800 rounded-xl p-6 cursor-move ${
                draggedId === project.id ? "opacity-50" : ""
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <div className="flex items-center gap-2">
                    <GripVertical className="w-5 h-5 text-zinc-600" />
                    <div className="w-10 h-10 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center">
                      <FolderKanban className="w-5 h-5 text-cyan-400" />
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium">{project.title}</h3>
                      {project.is_featured && (
                        <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                      )}
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full ${
                          project.is_active
                            ? "bg-green-500/10 text-green-400 border border-green-500/20"
                            : "bg-zinc-800 text-zinc-500"
                        }`}
                      >
                        {project.is_active ? "Active" : "Hidden"}
                      </span>
                    </div>
                    <p className="text-sm text-zinc-500 mt-1 line-clamp-2">
                      {project.description}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      {project.tags.map((tag, i) => (
                        <span
                          key={i}
                          className="text-xs px-2 py-0.5 rounded bg-zinc-800 text-zinc-400"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                    <div className="flex items-center gap-3 mt-2 text-xs text-zinc-600">
                      {project.link && (
                        <span className="flex items-center gap-1">
                          <ExternalLink className="w-3 h-3" />
                          Link
                        </span>
                      )}
                      {project.github && (
                        <span className="flex items-center gap-1">
                          <Github className="w-3 h-3" />
                          GitHub
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Link href={`/admin/portfolio/projects/${project.id}`}>
                    <Button variant="ghost" size="icon-sm">
                      <Pencil className="w-4 h-4" />
                    </Button>
                  </Link>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => handleDelete(project.id, project.title)}
                    disabled={isDeleting && deletingId === project.id}
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
          <FolderKanban className="w-12 h-12 text-zinc-600 mx-auto mb-4" />
          <h3 className="font-medium text-zinc-400">No projects yet</h3>
          <p className="text-sm text-zinc-600 mt-1">
            Add your first project to showcase your work.
          </p>
          <Link href="/admin/portfolio/projects/new" className="inline-block mt-4">
            <Button className="bg-cyan-500 hover:bg-cyan-400 text-black">
              <Plus className="w-4 h-4" />
              Add Project
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
}
