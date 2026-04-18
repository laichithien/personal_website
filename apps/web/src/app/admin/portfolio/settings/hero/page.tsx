"use client";

import { useState, useEffect, ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2, Upload, User, X } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
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

const MAX_AVATAR_FILE_SIZE = 2 * 1024 * 1024;
const SUPPORTED_AVATAR_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);

export default function HeroSettingsPage() {
  const router = useRouter();
  const { data: setting, isLoading } = usePortfolioSetting("hero");
  const { mutate: updateSetting, isPending } = useUpdatePortfolioSetting();

  const [formData, setFormData] = useState<HeroData>(defaultHeroData);
  const [error, setError] = useState("");
  const [avatarInputMode, setAvatarInputMode] = useState<"upload" | "url">("upload");
  const [isReadingAvatar, setIsReadingAvatar] = useState(false);

  useEffect(() => {
    if (setting?.value) {
      const value = setting.value as unknown as HeroData;
      const avatar = value.avatar || "";
      setFormData({
        name: value.name || "",
        title: value.title || "",
        tagline: value.tagline || "",
        avatar,
        location: value.location || "",
      });
      setAvatarInputMode(avatar.startsWith("data:image/") ? "upload" : "url");
    }
  }, [setting]);

  const updateAvatar = (avatar: string) => {
    setFormData((current) => ({ ...current, avatar }));
  };

  const clearAvatar = () => {
    updateAvatar("");
  };

  const handleAvatarFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setError("");

    if (!SUPPORTED_AVATAR_TYPES.has(file.type)) {
      setError("Avatar phải là JPG, PNG, WEBP hoặc GIF.");
      event.target.value = "";
      return;
    }

    if (file.size > MAX_AVATAR_FILE_SIZE) {
      setError("Avatar quá lớn. Giữ file dưới 2MB để tránh nặng DB và payload.");
      event.target.value = "";
      return;
    }

    setIsReadingAvatar(true);

    try {
      const dataUrl = await readFileAsDataUrl(file);
      updateAvatar(dataUrl);
      setAvatarInputMode("upload");
    } catch {
      setError("Không đọc được file avatar.");
    } finally {
      setIsReadingAvatar(false);
      event.target.value = "";
    }
  };

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

          <div className="space-y-3">
            <div className="flex items-center justify-between gap-3">
              <label className="block text-sm font-medium text-zinc-400">
                Avatar
              </label>
              <div className="inline-flex rounded-lg border border-zinc-700 bg-zinc-800/60 p-1 text-xs">
                <button
                  type="button"
                  onClick={() => setAvatarInputMode("upload")}
                  className={`rounded-md px-3 py-1.5 transition-colors ${
                    avatarInputMode === "upload"
                      ? "bg-cyan-500/20 text-cyan-300"
                      : "text-zinc-400 hover:text-zinc-200"
                  }`}
                >
                  Upload
                </button>
                <button
                  type="button"
                  onClick={() => setAvatarInputMode("url")}
                  className={`rounded-md px-3 py-1.5 transition-colors ${
                    avatarInputMode === "url"
                      ? "bg-cyan-500/20 text-cyan-300"
                      : "text-zinc-400 hover:text-zinc-200"
                  }`}
                >
                  URL
                </button>
              </div>
            </div>

            {formData.avatar ? (
              <div className="flex items-center gap-4 rounded-xl border border-zinc-800 bg-zinc-950/40 p-4">
                <div className="relative h-20 w-20 overflow-hidden rounded-xl border border-white/10 bg-zinc-900">
                  <Image
                    src={formData.avatar}
                    alt="Avatar preview"
                    fill
                    unoptimized={formData.avatar.startsWith("data:")}
                    sizes="80px"
                    className="object-cover object-top"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-white">Avatar preview</p>
                  <p className="mt-1 text-xs text-zinc-500 break-all line-clamp-2">
                    {formData.avatar.startsWith("data:image/")
                      ? "Stored as base64 data URL in DB"
                      : formData.avatar}
                  </p>
                </div>
                <Button type="button" variant="outline" size="sm" onClick={clearAvatar}>
                  <X className="w-4 h-4" />
                  Clear
                </Button>
              </div>
            ) : null}

            {avatarInputMode === "upload" ? (
              <div className="rounded-xl border border-dashed border-zinc-700 bg-zinc-800/30 p-4 space-y-3">
                <div className="flex items-center gap-2 text-sm text-zinc-400">
                  <Upload className="w-4 h-4" />
                  Upload avatar and store it directly in DB as base64
                </div>
                <Input
                  type="file"
                  accept="image/png,image/jpeg,image/webp,image/gif"
                  onChange={handleAvatarFileChange}
                  className="bg-zinc-800/50 border-zinc-700"
                  disabled={isReadingAvatar}
                />
                <p className="text-xs text-zinc-500">
                  Recommended: square-ish image, under 2MB.
                </p>
              </div>
            ) : (
              <div>
                <Input
                  value={formData.avatar}
                  onChange={(e) => updateAvatar(e.target.value)}
                  placeholder="https://... hoặc data:image/..."
                  className="bg-zinc-800/50 border-zinc-700"
                />
                <p className="mt-2 text-xs text-zinc-500">
                  Bạn vẫn có thể paste URL hoặc data URL nếu muốn.
                </p>
              </div>
            )}
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
            disabled={isPending || isReadingAvatar}
            className="bg-cyan-500 hover:bg-cyan-400 text-black"
          >
            {isPending || isReadingAvatar ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                {isReadingAvatar ? "Reading avatar..." : "Saving..."}
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

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        resolve(reader.result);
        return;
      }
      reject(new Error("Invalid file result"));
    };
    reader.onerror = () => reject(reader.error ?? new Error("Failed to read file"));
    reader.readAsDataURL(file);
  });
}
