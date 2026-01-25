/**
 * Admin API client with cookie-based authentication
 */
import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";

// Admin API client with credentials support
const adminApi = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3334",
  withCredentials: true, // Important for cookies
  headers: {
    "Content-Type": "application/json",
  },
});

// Flag to prevent multiple refresh attempts
let isRefreshing = false;

// Response interceptor for automatic token refresh
adminApi.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    if (
      error.response?.status === 401 &&
      originalRequest &&
      !originalRequest._retry &&
      !isRefreshing
    ) {
      originalRequest._retry = true;
      isRefreshing = true;

      try {
        await adminApi.post("/api/admin/auth/refresh");
        isRefreshing = false;
        return adminApi(originalRequest);
      } catch {
        isRefreshing = false;
        // Redirect to login on refresh failure (client-side only)
        if (typeof window !== "undefined") {
          window.location.href = "/admin/login";
        }
        return Promise.reject(error);
      }
    }

    return Promise.reject(error);
  }
);

// ==========================================
// Types
// ==========================================

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  message: string;
}

export interface AdminInfo {
  id: number;
  username: string;
  authenticated_at: string;
  last_login: string | null;
}

export interface ChangePasswordRequest {
  current_password: string;
  new_password: string;
}

export interface ChangePasswordResponse {
  success: boolean;
  message: string;
}

export interface AgentConfig {
  id: number;
  slug: string;
  name: string;
  model_provider: string;
  model_name: string;
  system_prompt: string;
  temperature: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  tool_count: number;
}

export interface AgentConfigCreate {
  slug: string;
  name: string;
  system_prompt: string;
  model_provider?: string;
  model_name?: string;
  temperature?: number;
  is_active?: boolean;
}

export interface AgentConfigUpdate {
  name?: string;
  system_prompt?: string;
  model_provider?: string;
  model_name?: string;
  temperature?: number;
  is_active?: boolean;
}

export interface ToolDefinition {
  id: number;
  name: string;
  description: string;
  is_active: boolean;
  created_at: string;
  agent_count: number;
}

export interface ToolDefinitionCreate {
  name: string;
  description: string;
  is_active?: boolean;
}

export interface ToolDefinitionUpdate {
  name?: string;
  description?: string;
  is_active?: boolean;
}

export interface KnowledgeDocument {
  id: number;
  title: string;
  content: string;
  source: string;
  doc_metadata: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
  chunk_count: number;
}

export interface KnowledgeDocumentCreate {
  title: string;
  content: string;
  source?: string;
  doc_metadata?: Record<string, unknown>;
}

export interface KnowledgeDocumentUpdate {
  title?: string;
  content?: string;
  source?: string;
  doc_metadata?: Record<string, unknown>;
}

export interface ChatSession {
  id: number;
  session_id: string;
  agent_slug: string;
  user_identifier: string | null;
  message_count: number;
  created_at: string;
  last_activity: string | null;
}

export interface ChatMessage {
  id: number;
  role: string;
  content: string;
  tool_calls: string[] | null;
  created_at: string;
}

export interface ChatSessionDetail extends ChatSession {
  messages: ChatMessage[];
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  per_page: number;
  total_pages: number;
}

export interface DashboardStats {
  total_agents: number;
  active_agents: number;
  total_tools: number;
  total_documents: number;
  total_sessions: number;
  total_messages: number;
  sessions_today: number;
  messages_today: number;
}

export interface RecentActivity {
  type: string;
  description: string;
  timestamp: string;
}

// Portfolio Types
export interface PortfolioSetting {
  id: number;
  key: string;
  value: Record<string, unknown>;
  updated_at: string;
}

export interface PortfolioExperience {
  id: number;
  company: string;
  role: string;
  period: string;
  highlights: string[];
  display_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface PortfolioExperienceCreate {
  company: string;
  role: string;
  period: string;
  highlights?: string[];
  display_order?: number;
  is_active?: boolean;
}

export interface PortfolioExperienceUpdate {
  company?: string;
  role?: string;
  period?: string;
  highlights?: string[];
  display_order?: number;
  is_active?: boolean;
}

export interface PortfolioTechStack {
  id: number;
  name: string;
  icon: string;
  category: string;
  display_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface PortfolioTechStackCreate {
  name: string;
  icon: string;
  category: string;
  display_order?: number;
  is_active?: boolean;
}

export interface PortfolioTechStackUpdate {
  name?: string;
  icon?: string;
  category?: string;
  display_order?: number;
  is_active?: boolean;
}

export interface PortfolioProject {
  id: number;
  title: string;
  description: string;
  tags: string[];
  image: string | null;
  link: string | null;
  github: string | null;
  is_featured: boolean;
  display_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface PortfolioProjectCreate {
  title: string;
  description: string;
  tags?: string[];
  image?: string;
  link?: string;
  github?: string;
  is_featured?: boolean;
  display_order?: number;
  is_active?: boolean;
}

export interface PortfolioProjectUpdate {
  title?: string;
  description?: string;
  tags?: string[];
  image?: string | null;
  link?: string | null;
  github?: string | null;
  is_featured?: boolean;
  display_order?: number;
  is_active?: boolean;
}

export interface PortfolioPublication {
  id: number;
  title: string;
  venue: string;
  doi: string | null;
  year: number;
  display_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface PortfolioPublicationCreate {
  title: string;
  venue: string;
  doi?: string;
  year: number;
  display_order?: number;
  is_active?: boolean;
}

export interface PortfolioPublicationUpdate {
  title?: string;
  venue?: string;
  doi?: string | null;
  year?: number;
  display_order?: number;
  is_active?: boolean;
}

export interface PortfolioAchievement {
  id: number;
  title: string;
  event: string;
  organization: string;
  year: number;
  display_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface PortfolioAchievementCreate {
  title: string;
  event: string;
  organization: string;
  year: number;
  display_order?: number;
  is_active?: boolean;
}

export interface PortfolioAchievementUpdate {
  title?: string;
  event?: string;
  organization?: string;
  year?: number;
  display_order?: number;
  is_active?: boolean;
}

export interface PortfolioCourse {
  id: number;
  title: string;
  year: number;
  focus: string[];
  display_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface PortfolioCourseCreate {
  title: string;
  year: number;
  focus?: string[];
  display_order?: number;
  is_active?: boolean;
}

export interface PortfolioCourseUpdate {
  title?: string;
  year?: number;
  focus?: string[];
  display_order?: number;
  is_active?: boolean;
}

// ==========================================
// API Functions
// ==========================================

// Auth API
export const authApi = {
  login: (data: LoginRequest) =>
    adminApi.post<LoginResponse>("/api/admin/auth/login", data),
  logout: () => adminApi.post<LoginResponse>("/api/admin/auth/logout"),
  refresh: () => adminApi.post<LoginResponse>("/api/admin/auth/refresh"),
  me: () => adminApi.get<AdminInfo>("/api/admin/auth/me"),
  changePassword: (data: ChangePasswordRequest) =>
    adminApi.post<ChangePasswordResponse>("/api/admin/auth/change-password", data),
};

// Agents API
export const agentsApi = {
  list: () => adminApi.get<AgentConfig[]>("/api/admin/agents"),
  get: (id: number) => adminApi.get<AgentConfig>(`/api/admin/agents/${id}`),
  create: (data: AgentConfigCreate) =>
    adminApi.post<AgentConfig>("/api/admin/agents", data),
  update: (id: number, data: AgentConfigUpdate) =>
    adminApi.put<AgentConfig>(`/api/admin/agents/${id}`, data),
  delete: (id: number) => adminApi.delete(`/api/admin/agents/${id}`),
  linkTools: (id: number, toolIds: number[]) =>
    adminApi.post<AgentConfig>(`/api/admin/agents/${id}/tools`, {
      tool_ids: toolIds,
    }),
};

// Tools API
export const toolsApi = {
  list: () => adminApi.get<ToolDefinition[]>("/api/admin/tools"),
  get: (id: number) => adminApi.get<ToolDefinition>(`/api/admin/tools/${id}`),
  create: (data: ToolDefinitionCreate) =>
    adminApi.post<ToolDefinition>("/api/admin/tools", data),
  update: (id: number, data: ToolDefinitionUpdate) =>
    adminApi.put<ToolDefinition>(`/api/admin/tools/${id}`, data),
  delete: (id: number) => adminApi.delete(`/api/admin/tools/${id}`),
};

// Knowledge API
export const knowledgeApi = {
  list: () => adminApi.get<KnowledgeDocument[]>("/api/admin/knowledge"),
  get: (id: number) =>
    adminApi.get<KnowledgeDocument>(`/api/admin/knowledge/${id}`),
  create: (data: KnowledgeDocumentCreate) =>
    adminApi.post<KnowledgeDocument>("/api/admin/knowledge", data),
  upload: (file: File, title?: string, source?: string) => {
    const formData = new FormData();
    formData.append("file", file);
    if (title) formData.append("title", title);
    if (source) formData.append("source", source);
    return adminApi.post<KnowledgeDocument>(
      "/api/admin/knowledge/upload",
      formData,
      {
        headers: { "Content-Type": "multipart/form-data" },
      }
    );
  },
  update: (id: number, data: KnowledgeDocumentUpdate) =>
    adminApi.put<KnowledgeDocument>(`/api/admin/knowledge/${id}`, data),
  delete: (id: number) => adminApi.delete(`/api/admin/knowledge/${id}`),
  reindex: (id: number) =>
    adminApi.post(`/api/admin/knowledge/${id}/reindex`),
};

// Sessions API
export const sessionsApi = {
  list: (page = 1, perPage = 20) =>
    adminApi.get<PaginatedResponse<ChatSession>>("/api/admin/sessions", {
      params: { page, per_page: perPage },
    }),
  get: (id: number) =>
    adminApi.get<ChatSessionDetail>(`/api/admin/sessions/${id}`),
  delete: (id: number) => adminApi.delete(`/api/admin/sessions/${id}`),
  bulkDelete: (ids: number[]) =>
    adminApi.delete("/api/admin/sessions/bulk", { data: { ids } }),
};

// Dashboard API
export const dashboardApi = {
  stats: () => adminApi.get<DashboardStats>("/api/admin/dashboard/stats"),
  recentActivity: () =>
    adminApi.get<RecentActivity[]>("/api/admin/dashboard/recent-activity"),
};

// Portfolio API
export const portfolioApi = {
  // Settings
  listSettings: () =>
    adminApi.get<PortfolioSetting[]>("/api/admin/portfolio/settings"),
  getSetting: (key: string) =>
    adminApi.get<PortfolioSetting>(`/api/admin/portfolio/settings/${key}`),
  updateSetting: (key: string, value: Record<string, unknown>) =>
    adminApi.put<PortfolioSetting>(`/api/admin/portfolio/settings/${key}`, value),

  // Experience
  listExperiences: () =>
    adminApi.get<PortfolioExperience[]>("/api/admin/portfolio/experiences"),
  getExperience: (id: number) =>
    adminApi.get<PortfolioExperience>(`/api/admin/portfolio/experiences/${id}`),
  createExperience: (data: PortfolioExperienceCreate) =>
    adminApi.post<PortfolioExperience>("/api/admin/portfolio/experiences", data),
  updateExperience: (id: number, data: PortfolioExperienceUpdate) =>
    adminApi.put<PortfolioExperience>(`/api/admin/portfolio/experiences/${id}`, data),
  deleteExperience: (id: number) =>
    adminApi.delete(`/api/admin/portfolio/experiences/${id}`),
  reorderExperiences: (ids: number[]) =>
    adminApi.put("/api/admin/portfolio/experiences/reorder", { ids }),

  // Tech Stack
  listTechStack: () =>
    adminApi.get<PortfolioTechStack[]>("/api/admin/portfolio/tech-stack"),
  getTechStack: (id: number) =>
    adminApi.get<PortfolioTechStack>(`/api/admin/portfolio/tech-stack/${id}`),
  createTechStack: (data: PortfolioTechStackCreate) =>
    adminApi.post<PortfolioTechStack>("/api/admin/portfolio/tech-stack", data),
  updateTechStack: (id: number, data: PortfolioTechStackUpdate) =>
    adminApi.put<PortfolioTechStack>(`/api/admin/portfolio/tech-stack/${id}`, data),
  deleteTechStack: (id: number) =>
    adminApi.delete(`/api/admin/portfolio/tech-stack/${id}`),
  reorderTechStack: (ids: number[]) =>
    adminApi.put("/api/admin/portfolio/tech-stack/reorder", { ids }),

  // Projects
  listProjects: () =>
    adminApi.get<PortfolioProject[]>("/api/admin/portfolio/projects"),
  getProject: (id: number) =>
    adminApi.get<PortfolioProject>(`/api/admin/portfolio/projects/${id}`),
  createProject: (data: PortfolioProjectCreate) =>
    adminApi.post<PortfolioProject>("/api/admin/portfolio/projects", data),
  updateProject: (id: number, data: PortfolioProjectUpdate) =>
    adminApi.put<PortfolioProject>(`/api/admin/portfolio/projects/${id}`, data),
  deleteProject: (id: number) =>
    adminApi.delete(`/api/admin/portfolio/projects/${id}`),
  reorderProjects: (ids: number[]) =>
    adminApi.put("/api/admin/portfolio/projects/reorder", { ids }),

  // Publications
  listPublications: () =>
    adminApi.get<PortfolioPublication[]>("/api/admin/portfolio/publications"),
  getPublication: (id: number) =>
    adminApi.get<PortfolioPublication>(`/api/admin/portfolio/publications/${id}`),
  createPublication: (data: PortfolioPublicationCreate) =>
    adminApi.post<PortfolioPublication>("/api/admin/portfolio/publications", data),
  updatePublication: (id: number, data: PortfolioPublicationUpdate) =>
    adminApi.put<PortfolioPublication>(`/api/admin/portfolio/publications/${id}`, data),
  deletePublication: (id: number) =>
    adminApi.delete(`/api/admin/portfolio/publications/${id}`),
  reorderPublications: (ids: number[]) =>
    adminApi.put("/api/admin/portfolio/publications/reorder", { ids }),

  // Achievements
  listAchievements: () =>
    adminApi.get<PortfolioAchievement[]>("/api/admin/portfolio/achievements"),
  getAchievement: (id: number) =>
    adminApi.get<PortfolioAchievement>(`/api/admin/portfolio/achievements/${id}`),
  createAchievement: (data: PortfolioAchievementCreate) =>
    adminApi.post<PortfolioAchievement>("/api/admin/portfolio/achievements", data),
  updateAchievement: (id: number, data: PortfolioAchievementUpdate) =>
    adminApi.put<PortfolioAchievement>(`/api/admin/portfolio/achievements/${id}`, data),
  deleteAchievement: (id: number) =>
    adminApi.delete(`/api/admin/portfolio/achievements/${id}`),
  reorderAchievements: (ids: number[]) =>
    adminApi.put("/api/admin/portfolio/achievements/reorder", { ids }),

  // Courses
  listCourses: () =>
    adminApi.get<PortfolioCourse[]>("/api/admin/portfolio/courses"),
  getCourse: (id: number) =>
    adminApi.get<PortfolioCourse>(`/api/admin/portfolio/courses/${id}`),
  createCourse: (data: PortfolioCourseCreate) =>
    adminApi.post<PortfolioCourse>("/api/admin/portfolio/courses", data),
  updateCourse: (id: number, data: PortfolioCourseUpdate) =>
    adminApi.put<PortfolioCourse>(`/api/admin/portfolio/courses/${id}`, data),
  deleteCourse: (id: number) =>
    adminApi.delete(`/api/admin/portfolio/courses/${id}`),
  reorderCourses: (ids: number[]) =>
    adminApi.put("/api/admin/portfolio/courses/reorder", { ids }),
};

// System Settings Types
export interface SystemSetting {
  id: number;
  key: string;
  value: string;
  description: string;
  is_sensitive: boolean;
  updated_at: string;
}

export interface SystemSettingUpdate {
  value?: string;
  description?: string;
  is_sensitive?: boolean;
}

// System Settings API
export const systemSettingsApi = {
  list: () => adminApi.get<SystemSetting[]>("/api/admin/settings"),
  get: (key: string) =>
    adminApi.get<SystemSetting>(`/api/admin/settings/${key}`),
  update: (key: string, data: SystemSettingUpdate) =>
    adminApi.put<SystemSetting>(`/api/admin/settings/${key}`, data),
};

export default adminApi;
