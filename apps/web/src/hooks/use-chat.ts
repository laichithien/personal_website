"use client";

import { useState, useCallback, useEffect } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { chatApi, type ChatMessage } from "@/lib/api-client";

const SESSION_ID_KEY = "chat_session_id";

export function useChat() {
  // Load sessionId from localStorage on mount
  const [sessionId, setSessionIdState] = useState<string | undefined>(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem(SESSION_ID_KEY) || undefined;
    }
    return undefined;
  });

  // Persist sessionId to localStorage whenever it changes
  useEffect(() => {
    if (sessionId) {
      localStorage.setItem(SESSION_ID_KEY, sessionId);
    } else {
      localStorage.removeItem(SESSION_ID_KEY);
    }
  }, [sessionId]);

  // Initialize messages state
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [historyLoaded, setHistoryLoaded] = useState(false);

  // Load history when sessionId exists (only once, when messages are empty)
  const { data: historyData, isLoading: isLoadingHistory } = useQuery({
    queryKey: ["chat-history", sessionId],
    queryFn: () => chatApi.getHistory(sessionId!),
    enabled: !!sessionId && !historyLoaded && messages.length === 0,
    staleTime: 0, // Always fetch fresh history when component mounts
  });

  // Update messages when history is loaded (only if messages are still empty)
  useEffect(() => {
    if (historyData?.messages && !historyLoaded && messages.length === 0) {
      const formattedMessages: ChatMessage[] = historyData.messages.map(
        (msg) => ({
          role: msg.role as "user" | "assistant",
          content: msg.content,
        })
      );
      setMessages(formattedMessages);
      setHistoryLoaded(true);
    }
  }, [historyData, historyLoaded, messages.length]);

  const mutation = useMutation({
    mutationFn: chatApi.sendMessage,
    onSuccess: (data) => {
      setSessionIdState(data.session_id);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.response },
      ]);
    },
  });

  const sendMessage = useCallback(
    (content: string) => {
      // Add user message immediately
      setMessages((prev) => [...prev, { role: "user", content }]);

      // Send to API
      mutation.mutate({
        message: content,
        session_id: sessionId,
      });
    },
    [mutation, sessionId]
  );

  const clearMessages = useCallback(() => {
    setMessages([]);
    setSessionIdState(undefined);
    setHistoryLoaded(false);
  }, []);

  return {
    messages,
    sendMessage,
    clearMessages,
    isLoading: mutation.isPending,
    isLoadingHistory: isLoadingHistory && !!sessionId && !historyLoaded,
    error: mutation.error,
  };
}
