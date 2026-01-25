"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2, Share2 } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  usePortfolioSetting,
  useUpdatePortfolioSetting,
} from "@/hooks/use-admin-api";

interface SocialData {
  github: string;
  linkedin: string;
  email: string;
  phone: string;
}

const defaultSocialData: SocialData = {
  github: "",
  linkedin: "",
  email: "",
  phone: "",
};

export default function SocialSettingsPage() {
  const router = useRouter();
  const { data: setting, isLoading } = usePortfolioSetting("social");
  const { mutate: updateSetting, isPending } = useUpdatePortfolioSetting();

  const [formData, setFormData] = useState<SocialData>(defaultSocialData);
  const [error, setError] = useState("");

  useEffect(() => {
    if (setting?.value) {
      const value = setting.value as unknown as SocialData;
      setFormData({
        github: value.github || "",
        linkedin: value.linkedin || "",
        email: value.email || "",
        phone: value.phone || "",
      });
    }
  }, [setting]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    updateSetting(
      { key: "social", value: formData as unknown as Record<string, unknown> },
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
              axiosError.response?.data?.detail ||
                "Failed to update social settings"
            );
          } else {
            setError("Failed to update social settings");
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
            <Share2 className="w-5 h-5 text-cyan-400" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold">Social Links</h1>
            <p className="text-sm text-zinc-500">
              Contact information and social profiles
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-1.5">
              GitHub URL
            </label>
            <Input
              value={formData.github}
              onChange={(e) =>
                setFormData({ ...formData, github: e.target.value })
              }
              placeholder="https://github.com/username"
              type="url"
              className="bg-zinc-800/50 border-zinc-700"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-1.5">
              LinkedIn URL
            </label>
            <Input
              value={formData.linkedin}
              onChange={(e) =>
                setFormData({ ...formData, linkedin: e.target.value })
              }
              placeholder="https://linkedin.com/in/username"
              type="url"
              className="bg-zinc-800/50 border-zinc-700"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-1.5">
              Email
            </label>
            <Input
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              placeholder="your@email.com"
              type="email"
              className="bg-zinc-800/50 border-zinc-700"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-1.5">
              Phone
            </label>
            <Input
              value={formData.phone}
              onChange={(e) =>
                setFormData({ ...formData, phone: e.target.value })
              }
              placeholder="+84 xxx xxx xxx"
              type="tel"
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
