"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus, Pencil, Trash2, Wrench } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTools, useDeleteTool } from "@/hooks/use-admin-api";

export default function ToolsPage() {
  const { data: tools, isLoading } = useTools();
  const { mutate: deleteTool, isPending: isDeleting } = useDeleteTool();
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const handleDelete = (id: number, name: string) => {
    if (confirm(`Are you sure you want to delete "${name}"?`)) {
      setDeletingId(id);
      deleteTool(id, {
        onSettled: () => setDeletingId(null),
      });
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">Tools</h1>
        <Link href="/admin/tools/new">
          <Button className="bg-cyan-500 hover:bg-cyan-400 text-black">
            <Plus className="w-4 h-4" />
            New Tool
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
      ) : tools && tools.length > 0 ? (
        <div className="space-y-4">
          {tools.map((tool) => (
            <div
              key={tool.id}
              className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center">
                    <Wrench className="w-5 h-5 text-cyan-400" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium">{tool.name}</h3>
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full ${
                          tool.is_active
                            ? "bg-green-500/10 text-green-400 border border-green-500/20"
                            : "bg-zinc-800 text-zinc-500"
                        }`}
                      >
                        {tool.is_active ? "Active" : "Inactive"}
                      </span>
                    </div>
                    <p className="text-sm text-zinc-500 mt-1">
                      {tool.description}
                    </p>
                    <p className="text-xs text-zinc-600 mt-2">
                      Used by {tool.agent_count} agent(s)
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Link href={`/admin/tools/${tool.id}`}>
                    <Button variant="ghost" size="icon-sm">
                      <Pencil className="w-4 h-4" />
                    </Button>
                  </Link>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => handleDelete(tool.id, tool.name)}
                    disabled={isDeleting && deletingId === tool.id}
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
          <Wrench className="w-12 h-12 text-zinc-600 mx-auto mb-4" />
          <h3 className="font-medium text-zinc-400">No tools yet</h3>
          <p className="text-sm text-zinc-600 mt-1">
            Create tools that agents can use.
          </p>
          <Link href="/admin/tools/new" className="inline-block mt-4">
            <Button className="bg-cyan-500 hover:bg-cyan-400 text-black">
              <Plus className="w-4 h-4" />
              Create Tool
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
}
