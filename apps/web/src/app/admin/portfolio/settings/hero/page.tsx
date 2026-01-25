"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2, User } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  usePortfolioSetting,
  useUpdatePortfolioSetting,
} from "@/hooks/use-admin-api";

interface HeroData {
  name: string;
  title: string;
  tagline: string;
  avatar: string;
  location: string;
}

const defaultHeroData: HeroData = {
  name: "",
  title: "",
  tagline: "",
  avatar: "",
  location: "",
};

export default function HeroSettingsPage() {
  const router = useRouter();
  const { data: setting, isLoading } = usePortfolioSetting("hero");
  const { mutate: updateSetting, isPending } = useUpdatePortfolioSetting();

  const [formData, setFormData] = useState<HeroData>(defaultHeroData);
  const [error, setError] = useState("");

  useEffect(() => {
    if (setting?.value) {
      const value = setting.value as unknown as HeroData;
      setFormData({
        name: value.name || "",
        title: value.title || "",
        tagline: value.tagline || "",
        avatar: value.avatar || "",
        location: value.location || "",
      });
    }
  }, [setting]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    updateSetting(
      { key: "hero", value: formData as unknown as Record<string, unknown> },
      {
        onSuccess: () => {
          router.push("/admin/portfolio");
        },
        onError: (err: unknown) => {
          if (err && typeof err === "object" && "response" in err) {
            const axiosError = err as {
              response?: { data?: { detail?: string } };
            };
            setError(
              axiosError.response?.data?.detail || "Failed to update hero settings"
            );
          } else {
            setError("Failed to update hero settings");
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

  return (
    <div className="max-w-2xl">
      <div className="flex items-center gap-4 mb-6">
        <Link href="/admin/portfolio">
          <Button variant="ghost" size="icon-sm">
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </Link>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center">
            <User className="w-5 h-5 text-cyan-400" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold">Hero Section</h1>
            <p className="text-sm text-zinc-500">
              Main introduction displayed on your portfolio
            </p>
          </div>
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
              placeholder="Your full name"
              required
              className="bg-zinc-800/50 border-zinc-700"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-1.5">
              Title
            </label>
            <Input
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g., AI Engineer @ Company"
              required
              className="bg-zinc-800/50 border-zinc-700"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-1.5">
              Tagline
            </label>
            <Textarea
              value={formData.tagline}
              onChange={(e) =>
                setFormData({ ...formData, tagline: e.target.value })
              }
              placeholder="A brief description of what you do"
              rows={3}
              className="bg-zinc-800/50 border-zinc-700"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-1.5">
              Avatar URL
            </label>
            <Input
              value={formData.avatar}
              onChange={(e) => setFormData({ ...formData, avatar: e.target.value })}
              placeholder="/images/avatar.jpg"
              className="bg-zinc-800/50 border-zinc-700"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-1.5">
              Location
            </label>
            <Input
              value={formData.location}
              onChange={(e) =>
                setFormData({ ...formData, location: e.target.value })
              }
              placeholder="e.g., Ho Chi Minh City, Vietnam"
              className="bg-zinc-800/50 border-zinc-700"
            />
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
          <Link href="/admin/portfolio">
            <Button type="button" variant="outline">
              Cancel
            </Button>
          </Link>
        </div>
      </form>
    </div>
  );
}
