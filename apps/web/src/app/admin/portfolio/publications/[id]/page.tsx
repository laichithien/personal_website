"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  usePortfolioPublication,
  useUpdatePortfolioPublication,
} from "@/hooks/use-admin-api";

export default function EditPublicationPage() {
  const router = useRouter();
  const params = useParams();
  const publicationId = Number(params.id);

  const { data: publication, isLoading } = usePortfolioPublication(publicationId);
  const { mutate: updatePublication, isPending } = useUpdatePortfolioPublication();

  const [formData, setFormData] = useState({
    title: "",
    venue: "",
    doi: "",
    year: new Date().getFullYear(),
    is_active: true,
  });
  const [error, setError] = useState("");

  useEffect(() => {
    if (publication) {
      setFormData({
        title: publication.title,
        venue: publication.venue,
        doi: publication.doi || "",
        year: publication.year,
        is_active: publication.is_active,
      });
    }
  }, [publication]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    updatePublication(
      { id: publicationId, data: formData },
      {
        onSuccess: () => {
          router.push("/admin/portfolio/publications");
        },
        onError: (err: unknown) => {
          if (err && typeof err === "object" && "response" in err) {
            const axiosError = err as {
              response?: { data?: { detail?: string } };
            };
            setError(
              axiosError.response?.data?.detail || "Failed to update publication"
            );
          } else {
            setError("Failed to update publication");
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

  if (!publication) {
    return (
      <div className="text-center py-12">
        <p className="text-zinc-500">Publication not found</p>
        <Link
          href="/admin/portfolio/publications"
          className="text-cyan-400 hover:underline mt-2 inline-block"
        >
          Back to publications
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl">
      <div className="flex items-center gap-4 mb-6">
        <Link href="/admin/portfolio/publications">
          <Button variant="ghost" size="icon-sm">
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-semibold">Edit Publication</h1>
          <p className="text-sm text-zinc-500 line-clamp-1">{publication.title}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-1.5">
              Title
            </label>
            <Input
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              placeholder="Publication title"
              required
              className="bg-zinc-800/50 border-zinc-700"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-1.5">
              Venue
            </label>
            <Input
              value={formData.venue}
              onChange={(e) =>
                setFormData({ ...formData, venue: e.target.value })
              }
              placeholder="e.g., IEEE RIVF 2022"
              required
              className="bg-zinc-800/50 border-zinc-700"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-1.5">
                Year
              </label>
              <Input
                type="number"
                value={formData.year}
                onChange={(e) =>
                  setFormData({ ...formData, year: parseInt(e.target.value) })
                }
                min={1900}
                max={2100}
                required
                className="bg-zinc-800/50 border-zinc-700"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-1.5">
                DOI
              </label>
              <Input
                value={formData.doi}
                onChange={(e) =>
                  setFormData({ ...formData, doi: e.target.value })
                }
                placeholder="10.1109/XXXXX.2022.XXXXXXX"
                className="bg-zinc-800/50 border-zinc-700"
              />
            </div>
          </div>

          <div className="flex items-center pt-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.is_active}
                onChange={(e) =>
                  setFormData({ ...formData, is_active: e.target.checked })
                }
                className="w-4 h-4 rounded border-zinc-700 bg-zinc-800 text-cyan-500 focus:ring-cyan-500"
              />
              <span className="text-sm text-zinc-400">
                Show on portfolio (Active)
              </span>
            </label>
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
          <Link href="/admin/portfolio/publications">
            <Button type="button" variant="outline">
              Cancel
            </Button>
          </Link>
        </div>
      </form>
    </div>
  );
}
