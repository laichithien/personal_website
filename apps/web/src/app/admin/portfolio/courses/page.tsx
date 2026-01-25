"use client";

import { useState } from "react";
import Link from "next/link";
import { GraduationCap, Plus, Pencil, Trash2, GripVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  usePortfolioCourses,
  useDeletePortfolioCourse,
  useReorderPortfolioCourses,
} from "@/hooks/use-admin-api";

export default function CoursesPage() {
  const { data: courses, isLoading } = usePortfolioCourses();
  const { mutate: deleteCourse, isPending: isDeleting } =
    useDeletePortfolioCourse();
  const { mutate: reorderCourses } = useReorderPortfolioCourses();
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [draggedId, setDraggedId] = useState<number | null>(null);

  const handleDelete = (id: number, title: string) => {
    if (confirm(`Are you sure you want to delete "${title}"?`)) {
      setDeletingId(id);
      deleteCourse(id, {
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
    if (!draggedId || draggedId === targetId || !courses) return;

    const items = [...courses];
    const draggedIndex = items.findIndex((item) => item.id === draggedId);
    const targetIndex = items.findIndex((item) => item.id === targetId);

    const [draggedItem] = items.splice(draggedIndex, 1);
    items.splice(targetIndex, 0, draggedItem);

    const newOrder = items.map((item) => item.id);
    reorderCourses(newOrder);
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
            <h1 className="text-2xl font-semibold">Courses</h1>
            <p className="text-sm text-zinc-500">
              Manage your professional courses
            </p>
          </div>
        </div>
        <Link href="/admin/portfolio/courses/new">
          <Button className="bg-cyan-500 hover:bg-cyan-400 text-black">
            <Plus className="w-4 h-4" />
            Add Course
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
              <div className="h-5 bg-zinc-800 rounded w-1/4 mb-2" />
              <div className="h-4 bg-zinc-800 rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : courses && courses.length > 0 ? (
        <div className="space-y-4">
          {courses.map((course) => (
            <div
              key={course.id}
              draggable
              onDragStart={(e) => handleDragStart(e, course.id)}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, course.id)}
              className={`bg-zinc-900/50 border border-zinc-800 rounded-xl p-6 cursor-move ${
                draggedId === course.id ? "opacity-50" : ""
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <div className="flex items-center gap-2">
                    <GripVertical className="w-5 h-5 text-zinc-600" />
                    <div className="w-10 h-10 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center">
                      <GraduationCap className="w-5 h-5 text-cyan-400" />
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium">{course.title}</h3>
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full ${
                          course.is_active
                            ? "bg-green-500/10 text-green-400 border border-green-500/20"
                            : "bg-zinc-800 text-zinc-500"
                        }`}
                      >
                        {course.is_active ? "Active" : "Hidden"}
                      </span>
                    </div>
                    <p className="text-sm text-zinc-400 mt-1">Year: {course.year}</p>
                    {course.focus && course.focus.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {course.focus.map((item, i) => (
                          <span
                            key={i}
                            className="text-xs px-2 py-0.5 rounded bg-zinc-800 text-zinc-400"
                          >
                            {item}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Link href={`/admin/portfolio/courses/${course.id}`}>
                    <Button variant="ghost" size="icon-sm">
                      <Pencil className="w-4 h-4" />
                    </Button>
                  </Link>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => handleDelete(course.id, course.title)}
                    disabled={isDeleting && deletingId === course.id}
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
          <GraduationCap className="w-12 h-12 text-zinc-600 mx-auto mb-4" />
          <h3 className="font-medium text-zinc-400">No courses yet</h3>
          <p className="text-sm text-zinc-600 mt-1">
            Add your first professional course.
          </p>
          <Link href="/admin/portfolio/courses/new" className="inline-block mt-4">
            <Button className="bg-cyan-500 hover:bg-cyan-400 text-black">
              <Plus className="w-4 h-4" />
              Add Course
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
}
