"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2, Heart, Plus, X } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  usePortfolioSetting,
  useUpdatePortfolioSetting,
} from "@/hooks/use-admin-api";

interface LifestyleData {
  music: {
    instruments: string[];
    currentlyPlaying: string;
  };
  routines: string[];
}

const defaultLifestyleData: LifestyleData = {
  music: {
    instruments: [],
    currentlyPlaying: "",
  },
  routines: [],
};

export default function LifestyleSettingsPage() {
  const router = useRouter();
  const { data: setting, isLoading } = usePortfolioSetting("lifestyle");
  const { mutate: updateSetting, isPending } = useUpdatePortfolioSetting();

  const [formData, setFormData] = useState<LifestyleData>(defaultLifestyleData);
  const [newInstrument, setNewInstrument] = useState("");
  const [newRoutine, setNewRoutine] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (setting?.value) {
      const value = setting.value as unknown as LifestyleData;
      setFormData({
        music: {
          instruments: value.music?.instruments || [],
          currentlyPlaying: value.music?.currentlyPlaying || "",
        },
        routines: value.routines || [],
      });
    }
  }, [setting]);

  const addInstrument = () => {
    if (newInstrument.trim()) {
      setFormData({
        ...formData,
        music: {
          ...formData.music,
          instruments: [...formData.music.instruments, newInstrument.trim()],
        },
      });
      setNewInstrument("");
    }
  };

  const removeInstrument = (index: number) => {
    setFormData({
      ...formData,
      music: {
        ...formData.music,
        instruments: formData.music.instruments.filter((_, i) => i !== index),
      },
    });
  };

  const addRoutine = () => {
    if (newRoutine.trim()) {
      setFormData({
        ...formData,
        routines: [...formData.routines, newRoutine.trim()],
      });
      setNewRoutine("");
    }
  };

  const removeRoutine = (index: number) => {
    setFormData({
      ...formData,
      routines: formData.routines.filter((_, i) => i !== index),
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    updateSetting(
      { key: "lifestyle", value: formData as unknown as Record<string, unknown> },
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
                "Failed to update lifestyle settings"
            );
          } else {
            setError("Failed to update lifestyle settings");
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
            <Heart className="w-5 h-5 text-cyan-400" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold">Lifestyle</h1>
            <p className="text-sm text-zinc-500">
              Music and daily routines
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6 space-y-6">
          {/* Music Section */}
          <div>
            <h3 className="text-sm font-medium text-zinc-300 mb-4">Music</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-1.5">
                  Currently Playing
                </label>
                <Input
                  value={formData.music.currentlyPlaying}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      music: { ...formData.music, currentlyPlaying: e.target.value },
                    })
                  }
                  placeholder="e.g., Lo-fi Beats"
                  className="bg-zinc-800/50 border-zinc-700"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-1.5">
                  Instruments
                </label>
                <div className="space-y-2">
                  <div className="flex flex-wrap gap-2">
                    {formData.music.instruments.map((instrument, index) => (
                      <span
                        key={index}
                        className="flex items-center gap-1 bg-zinc-800 border border-zinc-700 rounded-full px-3 py-1 text-sm"
                      >
                        {instrument}
                        <button
                          type="button"
                          onClick={() => removeInstrument(index)}
                          className="text-zinc-500 hover:text-red-400 transition-colors"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                  <div className="flex items-center gap-2">
                    <Input
                      value={newInstrument}
                      onChange={(e) => setNewInstrument(e.target.value)}
                      placeholder="Add an instrument"
                      className="bg-zinc-800/50 border-zinc-700"
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          addInstrument();
                        }
                      }}
                    />
                    <Button
                      type="button"
                      onClick={addInstrument}
                      variant="outline"
                      size="icon"
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Routines Section */}
          <div>
            <h3 className="text-sm font-medium text-zinc-300 mb-4">Daily Routines</h3>
            <div className="space-y-2">
              {formData.routines.map((routine, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2 bg-zinc-800/50 border border-zinc-700 rounded-lg px-3 py-2"
                >
                  <span className="flex-1 text-sm">{routine}</span>
                  <button
                    type="button"
                    onClick={() => removeRoutine(index)}
                    className="text-zinc-500 hover:text-red-400 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
              <div className="flex items-center gap-2">
                <Input
                  value={newRoutine}
                  onChange={(e) => setNewRoutine(e.target.value)}
                  placeholder="e.g., Morning: Code & Coffee"
                  className="bg-zinc-800/50 border-zinc-700"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addRoutine();
                    }
                  }}
                />
                <Button
                  type="button"
                  onClick={addRoutine}
                  variant="outline"
                  size="icon"
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
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
