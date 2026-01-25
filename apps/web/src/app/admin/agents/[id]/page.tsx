"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useAgent, useUpdateAgent } from "@/hooks/use-admin-api";

export default function EditAgentPage() {
  const router = useRouter();
  const params = useParams();
  const agentId = Number(params.id);

  const { data: agent, isLoading } = useAgent(agentId);
  const { mutate: updateAgent, isPending } = useUpdateAgent();

  const [formData, setFormData] = useState({
    name: "",
    system_prompt: "",
    model_provider: "",
    model_name: "",
    temperature: 0.7,
    is_active: true,
  });
  const [error, setError] = useState("");

  useEffect(() => {
    if (agent) {
      setFormData({
        name: agent.name,
        system_prompt: agent.system_prompt,
        model_provider: agent.model_provider,
        model_name: agent.model_name,
        temperature: agent.temperature,
        is_active: agent.is_active,
      });
    }
  }, [agent]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    updateAgent(
      { id: agentId, data: formData },
      {
        onSuccess: () => {
          router.push("/admin/agents");
        },
        onError: (err: unknown) => {
          if (err && typeof err === "object" && "response" in err) {
            const axiosError = err as { response?: { data?: { detail?: string } } };
            setError(axiosError.response?.data?.detail || "Failed to update agent");
          } else {
            setError("Failed to update agent");
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

  if (!agent) {
    return (
      <div className="text-center py-12">
        <p className="text-zinc-500">Agent not found</p>
        <Link href="/admin/agents" className="text-cyan-400 hover:underline mt-2 inline-block">
          Back to agents
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl">
      <div className="flex items-center gap-4 mb-6">
        <Link href="/admin/agents">
          <Button variant="ghost" size="icon-sm">
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-semibold">Edit Agent</h1>
          <p className="text-sm text-zinc-500">Slug: {agent.slug}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-1.5">
              Name
            </label>
            <Input
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              className="bg-zinc-800/50 border-zinc-700"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-1.5">
              System Prompt
            </label>
            <Textarea
              value={formData.system_prompt}
              onChange={(e) =>
                setFormData({ ...formData, system_prompt: e.target.value })
              }
              required
              rows={6}
              className="bg-zinc-800/50 border-zinc-700"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-1.5">
                Model Provider
              </label>
              <Input
                value={formData.model_provider}
                onChange={(e) =>
                  setFormData({ ...formData, model_provider: e.target.value })
                }
                className="bg-zinc-800/50 border-zinc-700"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-1.5">
                Model Name
              </label>
              <Input
                value={formData.model_name}
                onChange={(e) =>
                  setFormData({ ...formData, model_name: e.target.value })
                }
                className="bg-zinc-800/50 border-zinc-700"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-1.5">
                Temperature
              </label>
              <Input
                type="number"
                step="0.1"
                min="0"
                max="2"
                value={formData.temperature}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    temperature: parseFloat(e.target.value),
                  })
                }
                className="bg-zinc-800/50 border-zinc-700"
              />
            </div>
            <div className="flex items-center pt-7">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.is_active}
                  onChange={(e) =>
                    setFormData({ ...formData, is_active: e.target.checked })
                  }
                  className="w-4 h-4 rounded border-zinc-700 bg-zinc-800 text-cyan-500 focus:ring-cyan-500"
                />
                <span className="text-sm text-zinc-400">Active</span>
              </label>
            </div>
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
          <Link href="/admin/agents">
            <Button type="button" variant="outline">
              Cancel
            </Button>
          </Link>
        </div>
      </form>
    </div>
  );
}
