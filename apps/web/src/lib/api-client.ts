import axios from "axios";

const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3334",
  headers: {
    "Content-Type": "application/json",
  },
});

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export interface ChatRequest {
  message: string;
  session_id?: string;
}

export interface ChatResponse {
  response: string;
  session_id: string;
}

export interface ChatHistoryItem {
  role: string;
  content: string;
  timestamp: string;
}

export interface ChatHistoryResponse {
  session_id: string;
  messages: ChatHistoryItem[];
}

export const chatApi = {
  sendMessage: async (request: ChatRequest): Promise<ChatResponse> => {
    const { data } = await apiClient.post<ChatResponse>(
      "/api/chat/portfolio-assistant",
      request
    );
    return data;
  },
  getHistory: async (sessionId: string): Promise<ChatHistoryResponse> => {
    const { data } = await apiClient.get<ChatHistoryResponse>(
      `/api/chat/portfolio-assistant/history/${sessionId}`
    );
    return data;
  },
};

export default apiClient;
