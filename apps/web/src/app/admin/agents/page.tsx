"use client";

import { useState } from "react";
import Link from "next/link";
import { Bot, Plus, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAgents, useDeleteAgent } from "@/hooks/use-admin-api";

export default function AgentsPage() {
  const { data: agents, isLoading } = useAgents();
  const { mutate: deleteAgent, isPending: isDeleting } = useDeleteAgent();
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const handleDelete = (id: number, name: string) => {
    if (confirm(`Are you sure you want to delete "${name}"?`)) {
      setDeletingId(id);
      deleteAgent(id, {
        onSettled: () => setDeletingId(null),
      });
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">Agents</h1>
        <Link href="/admin/agents/new">
          <Button className="bg-cyan-500 hover:bg-cyan-400 text-black">
            <Plus className="w-4 h-4" />
            New Agent
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
      ) : agents && agents.length > 0 ? (
        <div className="space-y-4">
          {agents.map((agent) => (
            <div
              key={agent.id}
              className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center">
                    <Bot className="w-5 h-5 text-cyan-400" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium">{agent.name}</h3>
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full ${
                          agent.is_active
                            ? "bg-green-500/10 text-green-400 border border-green-500/20"
                            : "bg-zinc-800 text-zinc-500"
                        }`}
                      >
                        {agent.is_active ? "Active" : "Inactive"}
                      </span>
                    </div>
                    <p className="text-sm text-zinc-500 mt-1">
                      Slug: {agent.slug} • Model: {agent.model_name}
                    </p>
                    <p className="text-sm text-zinc-600 mt-2 line-clamp-2">
                      {agent.system_prompt}
                    </p>
                    <div className="flex items-center gap-4 mt-3 text-xs text-zinc-500">
                      <span>Tools: {agent.tool_count}</span>
                      <span>Temp: {agent.temperature}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Link href={`/admin/agents/${agent.id}`}>
                    <Button variant="ghost" size="icon-sm">
                      <Pencil className="w-4 h-4" />
                    </Button>
                  </Link>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => handleDelete(agent.id, agent.name)}
                    disabled={isDeleting && deletingId === agent.id}
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
          <Bot className="w-12 h-12 text-zinc-600 mx-auto mb-4" />
          <h3 className="font-medium text-zinc-400">No agents yet</h3>
          <p className="text-sm text-zinc-600 mt-1">
            Create your first AI agent to get started.
          </p>
          <Link href="/admin/agents/new" className="inline-block mt-4">
            <Button className="bg-cyan-500 hover:bg-cyan-400 text-black">
              <Plus className="w-4 h-4" />
              Create Agent
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
}
