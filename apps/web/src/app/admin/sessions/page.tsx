"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MessageSquare,
  Trash2,
  ChevronDown,
  ChevronRight,
  User,
  Bot,
  Loader2,
  Calendar,
  Hash,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  useSessions,
  useSession,
  useDeleteSession,
  useBulkDeleteSessions,
} from "@/hooks/use-admin-api";

interface ExpandedSession {
  id: number;
  isLoading: boolean;
}

export default function SessionsPage() {
  const [page, setPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [expandedSessions, setExpandedSessions] = useState<Map<number, boolean>>(new Map());
  const { data: response, isLoading } = useSessions(page, 20);
  const { mutate: deleteSession, isPending: isDeleting } = useDeleteSession();
  const { mutate: bulkDelete, isPending: isBulkDeleting } = useBulkDeleteSessions();

  // Infinite scroll ref
  const loadMoreRef = useRef<HTMLDivElement>(null);

  const handleDelete = (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm("Are you sure you want to delete this session?")) {
      deleteSession(id);
      // Remove from expanded if was expanded
      setExpandedSessions((prev) => {
        const next = new Map(prev);
        next.delete(id);
        return next;
      });
    }
  };

  const handleBulkDelete = () => {
    if (selectedIds.length === 0) return;
    if (confirm(`Are you sure you want to delete ${selectedIds.length} session(s)?`)) {
      bulkDelete(selectedIds, {
        onSuccess: () => {
          setSelectedIds([]);
          // Clear expanded states for deleted sessions
          setExpandedSessions((prev) => {
            const next = new Map(prev);
            selectedIds.forEach((id) => next.delete(id));
            return next;
          });
        },
      });
    }
  };

  const toggleSelect = (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (!response?.items) return;
    if (selectedIds.length === response.items.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(response.items.map((s) => s.id));
    }
  };

  const toggleExpand = (id: number) => {
    setExpandedSessions((prev) => {
      const next = new Map(prev);
      next.set(id, !prev.get(id));
      return next;
    });
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">Chat Sessions</h1>
        {selectedIds.length > 0 && (
          <Button
            variant="destructive"
            onClick={handleBulkDelete}
            disabled={isBulkDeleting}
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Delete {selectedIds.length} selected
          </Button>
        )}
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
      ) : response && response.items.length > 0 ? (
        <>
          {/* Select all */}
          <div className="flex items-center gap-2 mb-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={
                  response.items.length > 0 &&
                  selectedIds.length === response.items.length
                }
                onChange={toggleSelectAll}
                className="w-4 h-4 rounded border-zinc-700 bg-zinc-800 text-cyan-500 focus:ring-cyan-500"
              />
              <span className="text-sm text-zinc-400">Select all</span>
            </label>
            <span className="text-sm text-zinc-600">
              ({response.total} total sessions)
            </span>
          </div>

          <div className="space-y-3">
            {response.items.map((session) => (
              <SessionCard
                key={session.id}
                session={session}
                isSelected={selectedIds.includes(session.id)}
                isExpanded={expandedSessions.get(session.id) || false}
                onToggleSelect={(e) => toggleSelect(session.id, e)}
                onToggleExpand={() => toggleExpand(session.id)}
                onDelete={(e) => handleDelete(session.id, e)}
                isDeleting={isDeleting}
              />
            ))}
          </div>

          {/* Pagination */}
          {response.total_pages > 1 && (
            <div className="flex items-center justify-center gap-4 mt-6">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                Previous
              </Button>
              <span className="text-sm text-zinc-500">
                Page {page} of {response.total_pages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.min(response.total_pages, p + 1))}
                disabled={page === response.total_pages}
              >
                Next
              </Button>
            </div>
          )}
        </>
      ) : (
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-12 text-center">
          <MessageSquare className="w-12 h-12 text-zinc-600 mx-auto mb-4" />
          <h3 className="font-medium text-zinc-400">No sessions yet</h3>
          <p className="text-sm text-zinc-600 mt-1">
            Chat sessions will appear here when users interact with your agents.
          </p>
        </div>
      )}
    </div>
  );
}

// Session Card Component with expandable messages
interface SessionCardProps {
  session: {
    id: number;
    session_id: string;
    agent_slug: string;
    user_identifier: string | null;
    message_count: number;
    created_at: string;
    last_activity: string | null;
  };
  isSelected: boolean;
  isExpanded: boolean;
  onToggleSelect: (e: React.MouseEvent) => void;
  onToggleExpand: () => void;
  onDelete: (e: React.MouseEvent) => void;
  isDeleting: boolean;
}

function SessionCard({
  session,
  isSelected,
  isExpanded,
  onToggleSelect,
  onToggleExpand,
  onDelete,
  isDeleting,
}: SessionCardProps) {
  return (
    <div
      className={`bg-zinc-900/50 border rounded-xl overflow-hidden transition-colors ${
        isSelected ? "border-cyan-500/50" : "border-zinc-800"
      }`}
    >
      {/* Header - Always visible */}
      <div
        className="p-4 cursor-pointer hover:bg-zinc-800/30 transition-colors"
        onClick={onToggleExpand}
      >
        <div className="flex items-center gap-4">
          {/* Checkbox */}
          <input
            type="checkbox"
            checked={isSelected}
            onChange={() => {}}
            onClick={onToggleSelect}
            className="w-4 h-4 rounded border-zinc-700 bg-zinc-800 text-cyan-500 focus:ring-cyan-500"
          />

          {/* Expand icon */}
          <motion.div
            animate={{ rotate: isExpanded ? 90 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <ChevronRight className="w-5 h-5 text-zinc-500" />
          </motion.div>

          {/* Icon */}
          <div className="w-10 h-10 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center flex-shrink-0">
            <MessageSquare className="w-5 h-5 text-cyan-400" />
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="font-medium truncate">
                {session.agent_slug}
              </h3>
              <span className="px-2 py-0.5 rounded-full text-xs bg-zinc-800 text-zinc-400">
                {session.message_count} messages
              </span>
            </div>
            <div className="flex items-center gap-4 mt-1 text-sm text-zinc-500">
              <span className="flex items-center gap-1">
                <User className="w-3 h-3" />
                {session.user_identifier || "Anonymous"}
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {new Date(session.created_at).toLocaleDateString()}
              </span>
              <span className="flex items-center gap-1 text-xs text-zinc-600">
                <Hash className="w-3 h-3" />
                {session.session_id.slice(0, 8)}...
              </span>
            </div>
          </div>

          {/* Delete button */}
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={onDelete}
            disabled={isDeleting}
            className="text-red-400 hover:text-red-300 hover:bg-red-500/10 flex-shrink-0"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Expandable Messages Section */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
          >
            <SessionMessages sessionId={session.id} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Lazy-loaded messages component
function SessionMessages({ sessionId }: { sessionId: number }) {
  const { data: session, isLoading } = useSession(sessionId);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const [visibleCount, setVisibleCount] = useState(10);

  // Load more messages on scroll
  const handleScroll = useCallback(() => {
    const container = messagesContainerRef.current;
    if (!container || !session?.messages) return;

    const { scrollTop, scrollHeight, clientHeight } = container;
    if (scrollHeight - scrollTop - clientHeight < 100) {
      setVisibleCount((prev) => Math.min(prev + 10, session.messages.length));
    }
  }, [session?.messages]);

  // Prevent wheel events from scrolling the page when inside message container
  const handleWheel = useCallback((e: React.WheelEvent<HTMLDivElement>) => {
    const container = messagesContainerRef.current;
    if (!container) return;

    const { scrollTop, scrollHeight, clientHeight } = container;
    const isScrollable = scrollHeight > clientHeight;

    if (!isScrollable) return;

    const isAtTop = scrollTop === 0;
    const isAtBottom = Math.abs(scrollHeight - clientHeight - scrollTop) < 1;
    const scrollingUp = e.deltaY < 0;
    const scrollingDown = e.deltaY > 0;

    // Only allow page scroll if at boundary and scrolling past it
    if ((isAtTop && scrollingUp) || (isAtBottom && scrollingDown)) {
      return;
    }

    // Prevent page scroll and handle container scroll
    e.preventDefault();
    e.stopPropagation();
    container.scrollTop += e.deltaY;
  }, []);

  useEffect(() => {
    const container = messagesContainerRef.current;
    if (container) {
      container.addEventListener("scroll", handleScroll);
      return () => container.removeEventListener("scroll", handleScroll);
    }
  }, [handleScroll]);

  if (isLoading) {
    return (
      <div className="border-t border-zinc-800 p-6 flex items-center justify-center">
        <Loader2 className="w-5 h-5 animate-spin text-cyan-400" />
        <span className="ml-2 text-sm text-zinc-500">Loading messages...</span>
      </div>
    );
  }

  if (!session?.messages || session.messages.length === 0) {
    return (
      <div className="border-t border-zinc-800 p-6 text-center text-zinc-500 text-sm">
        No messages in this session
      </div>
    );
  }

  const visibleMessages = session.messages.slice(0, visibleCount);

  return (
    <div className="border-t border-zinc-800">
      <div
        ref={messagesContainerRef}
        onWheel={handleWheel}
        className="max-h-96 overflow-y-auto p-4 space-y-3"
      >
        {visibleMessages.map((message, index) => (
          <motion.div
            key={message.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.03, duration: 0.2 }}
            className={`flex gap-3 ${
              message.role === "user" ? "justify-end" : "justify-start"
            }`}
          >
            {message.role !== "user" && (
              <div className="w-8 h-8 rounded-full bg-cyan-500/20 flex items-center justify-center flex-shrink-0">
                <Bot className="w-4 h-4 text-cyan-400" />
              </div>
            )}
            <div
              className={`max-w-[80%] rounded-xl px-4 py-2 ${
                message.role === "user"
                  ? "bg-cyan-500/20 text-white"
                  : "bg-zinc-800 text-zinc-200"
              }`}
            >
              <p className="text-sm whitespace-pre-wrap break-words">
                {message.content}
              </p>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs text-zinc-500">
                  {new Date(message.created_at).toLocaleTimeString()}
                </span>
                {message.tool_calls && message.tool_calls.length > 0 && (
                  <span className="text-xs px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300">
                    {message.tool_calls.length} tool{message.tool_calls.length > 1 ? "s" : ""}
                  </span>
                )}
              </div>
            </div>
            {message.role === "user" && (
              <div className="w-8 h-8 rounded-full bg-zinc-700 flex items-center justify-center flex-shrink-0">
                <User className="w-4 h-4 text-zinc-400" />
              </div>
            )}
          </motion.div>
        ))}

        {/* Load more indicator */}
        {visibleCount < session.messages.length && (
          <div className="text-center py-2">
            <span className="text-xs text-zinc-500">
              Scroll for more ({session.messages.length - visibleCount} remaining)
            </span>
          </div>
        )}
      </div>

      {/* Footer with stats */}
      <div className="border-t border-zinc-800 px-4 py-2 flex items-center justify-between text-xs text-zinc-500">
        <span>
          Showing {visibleCount} of {session.messages.length} messages
        </span>
        {session.last_activity && (
          <span>
            Last activity: {new Date(session.last_activity).toLocaleString()}
          </span>
        )}
      </div>
    </div>
  );
}
