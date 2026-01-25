"use client";

import { useParams } from "next/navigation";
import { ArrowLeft, Loader2, User, Bot } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useSession } from "@/hooks/use-admin-api";

export default function SessionDetailPage() {
  const params = useParams();
  const sessionId = Number(params.id);

  const { data: session, isLoading } = useSession(sessionId);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-6 h-6 animate-spin text-zinc-500" />
      </div>
    );
  }

  if (!session) {
    return (
      <div className="text-center py-12">
        <p className="text-zinc-500">Session not found</p>
        <Link
          href="/admin/sessions"
          className="text-cyan-400 hover:underline mt-2 inline-block"
        >
          Back to sessions
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center gap-4 mb-6">
        <Link href="/admin/sessions">
          <Button variant="ghost" size="icon-sm">
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-semibold">Session Details</h1>
          <p className="text-sm text-zinc-500">
            Agent: {session.agent_slug} • {session.message_count} messages
          </p>
        </div>
      </div>

      {/* Session info */}
      <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6 mb-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <p className="text-zinc-500">Session ID</p>
            <p className="font-mono text-xs mt-1">{session.session_id}</p>
          </div>
          <div>
            <p className="text-zinc-500">User</p>
            <p className="mt-1">{session.user_identifier || "Anonymous"}</p>
          </div>
          <div>
            <p className="text-zinc-500">Created</p>
            <p className="mt-1">
              {new Date(session.created_at).toLocaleString()}
            </p>
          </div>
          <div>
            <p className="text-zinc-500">Last Activity</p>
            <p className="mt-1">
              {session.last_activity
                ? new Date(session.last_activity).toLocaleString()
                : "-"}
            </p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6">
        <h2 className="font-medium mb-4">Messages</h2>

        {session.messages && session.messages.length > 0 ? (
          <div className="space-y-4">
            {session.messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-3 ${
                  message.role === "user" ? "" : "flex-row-reverse"
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                    message.role === "user"
                      ? "bg-zinc-800"
                      : "bg-cyan-500/10 border border-cyan-500/20"
                  }`}
                >
                  {message.role === "user" ? (
                    <User className="w-4 h-4 text-zinc-400" />
                  ) : (
                    <Bot className="w-4 h-4 text-cyan-400" />
                  )}
                </div>
                <div
                  className={`flex-1 ${
                    message.role === "user" ? "text-left" : "text-right"
                  }`}
                >
                  <div
                    className={`inline-block max-w-[80%] rounded-lg px-4 py-2 ${
                      message.role === "user"
                        ? "bg-zinc-800 text-left"
                        : "bg-cyan-500/10 border border-cyan-500/20 text-left"
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap">
                      {message.content}
                    </p>
                    {message.tool_calls && message.tool_calls.length > 0 && (
                      <div className="mt-2 pt-2 border-t border-zinc-700">
                        <p className="text-xs text-zinc-500">
                          Tools: {message.tool_calls.join(", ")}
                        </p>
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-zinc-600 mt-1">
                    {new Date(message.created_at).toLocaleTimeString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-zinc-500 text-sm">No messages in this session</p>
        )}
      </div>
    </div>
  );
}
