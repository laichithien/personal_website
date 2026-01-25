"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useChat } from "@/hooks/use-chat";
import { cn } from "@/lib/utils";
import { Markdown } from "@/components/shared/markdown";

export function ChatTab() {
  const [input, setInput] = useState("");
  const { messages, sendMessage, isLoading, isLoadingHistory } = useChat();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Scroll to bottom when messages change
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    sendMessage(input.trim());
    setInput("");
  };

  return (
    <>
      {/* Messages - scrollable area */}
      <div className="flex-1 overflow-y-auto overscroll-contain p-4">
        <div className="space-y-4">
          {isLoadingHistory && (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-5 h-5 animate-spin text-cyan-400" />
              <span className="ml-2 text-white/40 text-sm">Loading chat history...</span>
            </div>
          )}
          {!isLoadingHistory && messages.length === 0 && (
            <p className="text-center text-white/40 text-sm py-8">
              Ask me anything about Thiện&apos;s work, skills, or projects!
            </p>
          )}
          {messages.map((message, index) => (
            <div
              key={index}
              className={cn(
                "flex",
                message.role === "user" ? "justify-end" : "justify-start"
              )}
            >
              <div
                className={cn(
                  "max-w-[90%] rounded-2xl px-3 py-2 text-sm",
                  message.role === "user"
                    ? "bg-cyan-500/20 text-white whitespace-pre-wrap"
                    : "bg-white/10 text-white/90"
                )}
              >
                {message.role === "assistant" ? (
                  <Markdown content={message.content} />
                ) : (
                  message.content
                )}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-white/10 rounded-2xl px-4 py-2">
                <Loader2 className="w-4 h-4 animate-spin" />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input - fixed at bottom */}
      <form onSubmit={handleSubmit} className="shrink-0 p-4 border-t border-white/10 bg-black/20">
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 bg-white/5 border-white/10"
            disabled={isLoading}
          />
          <Button
            type="submit"
            size="icon"
            disabled={isLoading || !input.trim()}
            className="bg-cyan-500 hover:bg-cyan-400"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </form>
    </>
  );
}
