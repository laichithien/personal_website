"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2, Upload, X, FileText } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useUploadKnowledgeDocument } from "@/hooks/use-admin-api";

export default function UploadKnowledgePage() {
  const router = useRouter();
  const { mutate: uploadDocument, isPending } = useUploadKnowledgeDocument();

  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [source, setSource] = useState("upload");
  const [error, setError] = useState("");
  const [dragActive, setDragActive] = useState(false);

  const allowedTypes = [".pdf", ".txt", ".md", ".json", ".csv"];

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    setError("");

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      validateAndSetFile(droppedFile);
    }
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError("");
    if (e.target.files && e.target.files[0]) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const validateAndSetFile = (selectedFile: File) => {
    const ext = "." + selectedFile.name.split(".").pop()?.toLowerCase();
    if (!allowedTypes.includes(ext)) {
      setError(`Invalid file type. Allowed: ${allowedTypes.join(", ")}`);
      return;
    }
    if (selectedFile.size > 10 * 1024 * 1024) {
      setError("File too large. Maximum size: 10MB");
      return;
    }
    setFile(selectedFile);
    if (!title) {
      setTitle(selectedFile.name.replace(/\.[^/.]+$/, ""));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!file) {
      setError("Please select a file");
      return;
    }

    uploadDocument(
      { file, title: title || undefined, source },
      {
        onSuccess: () => {
          router.push("/admin/knowledge");
        },
        onError: (err: unknown) => {
          if (err && typeof err === "object" && "response" in err) {
            const axiosError = err as { response?: { data?: { detail?: string } } };
            setError(axiosError.response?.data?.detail || "Failed to upload document");
          } else {
            setError("Failed to upload document");
          }
        },
      }
    );
  };

  return (
    <div className="max-w-2xl">
      <div className="flex items-center gap-4 mb-6">
        <Link href="/admin/knowledge">
          <Button variant="ghost" size="icon-sm">
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </Link>
        <h1 className="text-2xl font-semibold">Upload Document</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6 space-y-4">
          {/* Drop zone */}
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
              dragActive
                ? "border-cyan-500 bg-cyan-500/5"
                : "border-zinc-700 hover:border-zinc-600"
            }`}
          >
            <input
              type="file"
              onChange={handleFileChange}
              accept={allowedTypes.join(",")}
              className="hidden"
              id="file-upload"
            />
            <label htmlFor="file-upload" className="cursor-pointer">
              <Upload className="w-12 h-12 text-zinc-500 mx-auto mb-4" />
              {dragActive ? (
                <p className="text-cyan-400">Drop the file here...</p>
              ) : (
                <div>
                  <p className="text-zinc-300">
                    Drag & drop a file here, or click to select
                  </p>
                  <p className="text-sm text-zinc-500 mt-1">
                    Supported: {allowedTypes.join(", ")} (max 10MB)
                  </p>
                </div>
              )}
            </label>
          </div>

          {/* Selected file */}
          {file && (
            <div className="flex items-center justify-between p-3 bg-zinc-800/50 rounded-lg">
              <div className="flex items-center gap-3">
                <FileText className="w-5 h-5 text-zinc-400" />
                <div>
                  <p className="text-sm font-medium">{file.name}</p>
                  <p className="text-xs text-zinc-500">
                    {(file.size / 1024).toFixed(1)} KB
                  </p>
                </div>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                onClick={() => setFile(null)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-1.5">
              Title (optional)
            </label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Document title"
              className="bg-zinc-800/50 border-zinc-700"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-1.5">
              Source
            </label>
            <Input
              value={source}
              onChange={(e) => setSource(e.target.value)}
              placeholder="upload, cv, project, etc."
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
            disabled={isPending || !file}
            className="bg-cyan-500 hover:bg-cyan-400 text-black"
          >
            {isPending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="w-4 h-4" />
                Upload
              </>
            )}
          </Button>
          <Link href="/admin/knowledge">
            <Button type="button" variant="outline">
              Cancel
            </Button>
          </Link>
        </div>
      </form>
    </div>
  );
}
