"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Bot, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useLogin } from "@/hooks/use-admin-api";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") || "/admin/dashboard";

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const { mutate: login, isPending } = useLogin();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    login(
      { username, password },
      {
        onSuccess: () => {
          router.push(redirect);
        },
        onError: (err: unknown) => {
          if (err && typeof err === "object" && "response" in err) {
            const axiosError = err as { response?: { data?: { detail?: string } } };
            setError(axiosError.response?.data?.detail || "Login failed");
          } else {
            setError("Login failed");
          }
        },
      }
    );
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-950 px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center">
              <Bot className="w-6 h-6 text-cyan-400" />
            </div>
            <div>
              <h1 className="text-xl font-semibold">Admin Panel</h1>
              <p className="text-sm text-zinc-500">The Transparent Core</p>
            </div>
          </div>
        </div>

        {/* Login Form */}
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6">
          <h2 className="text-lg font-medium mb-6">Sign in to continue</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="username"
                className="block text-sm font-medium text-zinc-400 mb-1.5"
              >
                Username
              </label>
              <Input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter username"
                required
                autoComplete="username"
                className="bg-zinc-800/50 border-zinc-700"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-zinc-400 mb-1.5"
              >
                Password
              </label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                required
                autoComplete="current-password"
                className="bg-zinc-800/50 border-zinc-700"
              />
            </div>

            {error && (
              <div className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
                {error}
              </div>
            )}

            <Button
              type="submit"
              disabled={isPending}
              className="w-full bg-cyan-500 hover:bg-cyan-400 text-black font-medium"
            >
              {isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                "Sign in"
              )}
            </Button>
          </form>
        </div>

        {/* Back link */}
        <div className="mt-6 text-center">
          <a
            href="/"
            className="text-sm text-zinc-500 hover:text-zinc-400 transition-colors"
          >
            ← Back to website
          </a>
        </div>
      </div>
    </div>
  );
}

function LoginFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-950 px-4">
      <div className="w-full max-w-sm">
        <div className="flex justify-center mb-8">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center">
              <Bot className="w-6 h-6 text-cyan-400" />
            </div>
            <div>
              <h1 className="text-xl font-semibold">Admin Panel</h1>
              <p className="text-sm text-zinc-500">The Transparent Core</p>
            </div>
          </div>
        </div>
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6 flex items-center justify-center">
          <Loader2 className="w-6 h-6 animate-spin text-cyan-400" />
        </div>
      </div>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense fallback={<LoginFallback />}>
      <LoginForm />
    </Suspense>
  );
}
