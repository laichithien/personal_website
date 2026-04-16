/**
 * React Query hooks for admin API
 */
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  agentsApi,
  authApi,
  blogAdminApi,
  dashboardApi,
  knowledgeApi,
  portfolioApi,
  sessionsApi,
  systemSettingsApi,
  toolsApi,
  type AgentConfigCreate,
  type AgentConfigUpdate,
  type BlogPostCreate,
  type BlogPostUpdate,
  type KnowledgeDocumentCreate,
  type KnowledgeDocumentUpdate,
  type PortfolioAchievementCreate,
  type PortfolioAchievementUpdate,
  type PortfolioCourseCreate,
  type PortfolioCourseUpdate,
  type PortfolioExperienceCreate,
  type PortfolioExperienceUpdate,
  type PortfolioProjectCreate,
  type PortfolioProjectUpdate,
  type PortfolioPublicationCreate,
  type PortfolioPublicationUpdate,
  type PortfolioTechStackCreate,
  type PortfolioTechStackUpdate,
  type SystemSettingUpdate,
  type ToolDefinitionCreate,
  type ToolDefinitionUpdate,
} from "@/lib/admin-api";
import { useAuthStore } from "@/stores/auth-store";

// ==========================================
// Auth Hooks
// ==========================================

export function useMe(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: ["admin", "me"],
    queryFn: () => authApi.me().then((res) => res.data),
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: options?.enabled ?? true,
  });
}

export function useLogin() {
  const queryClient = useQueryClient();
  const setAuthenticated = useAuthStore((s) => s.setAuthenticated);

  return useMutation({
    mutationFn: ({ username, password }: { username: string; password: string }) =>
      authApi.login({ username, password }),
    onSuccess: (_, variables) => {
      setAuthenticated(variables.username);
      queryClient.invalidateQueries({ queryKey: ["admin"] });
    },
  });
}

export function useLogout() {
  const queryClient = useQueryClient();
  const logout = useAuthStore((s) => s.logout);

  return useMutation({
    mutationFn: () => authApi.logout(),
    onSuccess: () => {
      logout();
      queryClient.clear();
    },
  });
}

export function useChangePassword() {
  return useMutation({
    mutationFn: ({ currentPassword, newPassword }: { currentPassword: string; newPassword: string }) =>
      authApi.changePassword({ current_password: currentPassword, new_password: newPassword }),
  });
}

// ==========================================
// Agent Hooks
// ==========================================

export function useAgents() {
  return useQuery({
    queryKey: ["admin", "agents"],
    queryFn: () => agentsApi.list().then((res) => res.data),
  });
}

export function useAgent(id: number) {
  return useQuery({
    queryKey: ["admin", "agents", id],
    queryFn: () => agentsApi.get(id).then((res) => res.data),
    enabled: !!id,
  });
}

export function useCreateAgent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: AgentConfigCreate) => agentsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "agents"] });
    },
  });
}

export function useUpdateAgent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: AgentConfigUpdate }) =>
      agentsApi.update(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["admin", "agents"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "agents", id] });
    },
  });
}

export function useDeleteAgent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => agentsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "agents"] });
    },
  });
}

export function useLinkAgentTools() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, toolIds }: { id: number; toolIds: number[] }) =>
      agentsApi.linkTools(id, toolIds),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["admin", "agents"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "agents", id] });
    },
  });
}

// ==========================================
// Tool Hooks
// ==========================================

export function useTools() {
  return useQuery({
    queryKey: ["admin", "tools"],
    queryFn: () => toolsApi.list().then((res) => res.data),
  });
}

export function useTool(id: number) {
  return useQuery({
    queryKey: ["admin", "tools", id],
    queryFn: () => toolsApi.get(id).then((res) => res.data),
    enabled: !!id,
  });
}

export function useCreateTool() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: ToolDefinitionCreate) => toolsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "tools"] });
    },
  });
}

export function useUpdateTool() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: ToolDefinitionUpdate }) =>
      toolsApi.update(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["admin", "tools"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "tools", id] });
    },
  });
}

export function useDeleteTool() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => toolsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "tools"] });
    },
  });
}

// ==========================================
// Knowledge Hooks
// ==========================================

export function useKnowledgeDocuments() {
  return useQuery({
    queryKey: ["admin", "knowledge"],
    queryFn: () => knowledgeApi.list().then((res) => res.data),
  });
}

export function useKnowledgeDocument(id: number) {
  return useQuery({
    queryKey: ["admin", "knowledge", id],
    queryFn: () => knowledgeApi.get(id).then((res) => res.data),
    enabled: !!id,
  });
}

export function useCreateKnowledgeDocument() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: KnowledgeDocumentCreate) => knowledgeApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "knowledge"] });
    },
  });
}

export function useUploadKnowledgeDocument() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      file,
      title,
      source,
    }: {
      file: File;
      title?: string;
      source?: string;
    }) => knowledgeApi.upload(file, title, source),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "knowledge"] });
    },
  });
}

export function useUpdateKnowledgeDocument() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: KnowledgeDocumentUpdate }) =>
      knowledgeApi.update(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["admin", "knowledge"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "knowledge", id] });
    },
  });
}

export function useDeleteKnowledgeDocument() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => knowledgeApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "knowledge"] });
    },
  });
}

// ==========================================
// Blog Hooks
// ==========================================

export function useBlogPosts() {
  return useQuery({
    queryKey: ["admin", "blog"],
    queryFn: () => blogAdminApi.list().then((res) => res.data),
  });
}

export function useBlogPost(id: number) {
  return useQuery({
    queryKey: ["admin", "blog", id],
    queryFn: () => blogAdminApi.get(id).then((res) => res.data),
    enabled: !!id,
  });
}

export function useCreateBlogPost() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: BlogPostCreate) => blogAdminApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "blog"] });
    },
  });
}

export function useUpdateBlogPost() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: BlogPostUpdate }) =>
      blogAdminApi.update(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["admin", "blog"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "blog", id] });
    },
  });
}

export function useDeleteBlogPost() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => blogAdminApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "blog"] });
    },
  });
}

export function useReindexKnowledgeDocument() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => knowledgeApi.reindex(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ["admin", "knowledge", id] });
    },
  });
}

// ==========================================
// Session Hooks
// ==========================================

export function useSessions(page = 1, perPage = 20) {
  return useQuery({
    queryKey: ["admin", "sessions", page, perPage],
    queryFn: () => sessionsApi.list(page, perPage).then((res) => res.data),
  });
}

export function useSession(id: number) {
  return useQuery({
    queryKey: ["admin", "sessions", id],
    queryFn: () => sessionsApi.get(id).then((res) => res.data),
    enabled: !!id,
  });
}

export function useDeleteSession() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => sessionsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "sessions"] });
    },
  });
}

export function useBulkDeleteSessions() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (ids: number[]) => sessionsApi.bulkDelete(ids),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "sessions"] });
    },
  });
}

// ==========================================
// Dashboard Hooks
// ==========================================

export function useDashboardStats() {
  return useQuery({
    queryKey: ["admin", "dashboard", "stats"],
    queryFn: () => dashboardApi.stats().then((res) => res.data),
  });
}

export function useRecentActivity() {
  return useQuery({
    queryKey: ["admin", "dashboard", "recent-activity"],
    queryFn: () => dashboardApi.recentActivity().then((res) => res.data),
  });
}

// ==========================================
// Portfolio Hooks - Settings
// ==========================================

export function usePortfolioSettings() {
  return useQuery({
    queryKey: ["admin", "portfolio", "settings"],
    queryFn: () => portfolioApi.listSettings().then((res) => res.data),
  });
}

export function usePortfolioSetting(key: string) {
  return useQuery({
    queryKey: ["admin", "portfolio", "settings", key],
    queryFn: () => portfolioApi.getSetting(key).then((res) => res.data),
    enabled: !!key,
  });
}

export function useUpdatePortfolioSetting() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ key, value }: { key: string; value: Record<string, unknown> }) =>
      portfolioApi.updateSetting(key, value),
    onSuccess: (_, { key }) => {
      queryClient.invalidateQueries({ queryKey: ["admin", "portfolio", "settings"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "portfolio", "settings", key] });
    },
  });
}

// ==========================================
// Portfolio Hooks - Experience
// ==========================================

export function usePortfolioExperiences() {
  return useQuery({
    queryKey: ["admin", "portfolio", "experiences"],
    queryFn: () => portfolioApi.listExperiences().then((res) => res.data),
  });
}

export function usePortfolioExperience(id: number) {
  return useQuery({
    queryKey: ["admin", "portfolio", "experiences", id],
    queryFn: () => portfolioApi.getExperience(id).then((res) => res.data),
    enabled: !!id,
  });
}

export function useCreatePortfolioExperience() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: PortfolioExperienceCreate) => portfolioApi.createExperience(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "portfolio", "experiences"] });
    },
  });
}

export function useUpdatePortfolioExperience() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: PortfolioExperienceUpdate }) =>
      portfolioApi.updateExperience(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["admin", "portfolio", "experiences"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "portfolio", "experiences", id] });
    },
  });
}

export function useDeletePortfolioExperience() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => portfolioApi.deleteExperience(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "portfolio", "experiences"] });
    },
  });
}

export function useReorderPortfolioExperiences() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (ids: number[]) => portfolioApi.reorderExperiences(ids),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "portfolio", "experiences"] });
    },
  });
}

// ==========================================
// Portfolio Hooks - Tech Stack
// ==========================================

export function usePortfolioTechStack() {
  return useQuery({
    queryKey: ["admin", "portfolio", "tech-stack"],
    queryFn: () => portfolioApi.listTechStack().then((res) => res.data),
  });
}

export function usePortfolioTechStackItem(id: number) {
  return useQuery({
    queryKey: ["admin", "portfolio", "tech-stack", id],
    queryFn: () => portfolioApi.getTechStack(id).then((res) => res.data),
    enabled: !!id,
  });
}

export function useCreatePortfolioTechStack() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: PortfolioTechStackCreate) => portfolioApi.createTechStack(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "portfolio", "tech-stack"] });
    },
  });
}

export function useUpdatePortfolioTechStack() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: PortfolioTechStackUpdate }) =>
      portfolioApi.updateTechStack(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["admin", "portfolio", "tech-stack"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "portfolio", "tech-stack", id] });
    },
  });
}

export function useDeletePortfolioTechStack() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => portfolioApi.deleteTechStack(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "portfolio", "tech-stack"] });
    },
  });
}

export function useReorderPortfolioTechStack() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (ids: number[]) => portfolioApi.reorderTechStack(ids),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "portfolio", "tech-stack"] });
    },
  });
}

// ==========================================
// Portfolio Hooks - Projects
// ==========================================

export function usePortfolioProjects() {
  return useQuery({
    queryKey: ["admin", "portfolio", "projects"],
    queryFn: () => portfolioApi.listProjects().then((res) => res.data),
  });
}

export function usePortfolioProject(id: number) {
  return useQuery({
    queryKey: ["admin", "portfolio", "projects", id],
    queryFn: () => portfolioApi.getProject(id).then((res) => res.data),
    enabled: !!id,
  });
}

export function useCreatePortfolioProject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: PortfolioProjectCreate) => portfolioApi.createProject(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "portfolio", "projects"] });
    },
  });
}

export function useUpdatePortfolioProject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: PortfolioProjectUpdate }) =>
      portfolioApi.updateProject(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["admin", "portfolio", "projects"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "portfolio", "projects", id] });
    },
  });
}

export function useDeletePortfolioProject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => portfolioApi.deleteProject(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "portfolio", "projects"] });
    },
  });
}

export function useReorderPortfolioProjects() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (ids: number[]) => portfolioApi.reorderProjects(ids),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "portfolio", "projects"] });
    },
  });
}

// ==========================================
// Portfolio Hooks - Publications
// ==========================================

export function usePortfolioPublications() {
  return useQuery({
    queryKey: ["admin", "portfolio", "publications"],
    queryFn: () => portfolioApi.listPublications().then((res) => res.data),
  });
}

export function usePortfolioPublication(id: number) {
  return useQuery({
    queryKey: ["admin", "portfolio", "publications", id],
    queryFn: () => portfolioApi.getPublication(id).then((res) => res.data),
    enabled: !!id,
  });
}

export function useCreatePortfolioPublication() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: PortfolioPublicationCreate) => portfolioApi.createPublication(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "portfolio", "publications"] });
    },
  });
}

export function useUpdatePortfolioPublication() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: PortfolioPublicationUpdate }) =>
      portfolioApi.updatePublication(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["admin", "portfolio", "publications"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "portfolio", "publications", id] });
    },
  });
}

export function useDeletePortfolioPublication() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => portfolioApi.deletePublication(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "portfolio", "publications"] });
    },
  });
}

export function useReorderPortfolioPublications() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (ids: number[]) => portfolioApi.reorderPublications(ids),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "portfolio", "publications"] });
    },
  });
}

// ==========================================
// Portfolio Hooks - Achievements
// ==========================================

export function usePortfolioAchievements() {
  return useQuery({
    queryKey: ["admin", "portfolio", "achievements"],
    queryFn: () => portfolioApi.listAchievements().then((res) => res.data),
  });
}

export function usePortfolioAchievement(id: number) {
  return useQuery({
    queryKey: ["admin", "portfolio", "achievements", id],
    queryFn: () => portfolioApi.getAchievement(id).then((res) => res.data),
    enabled: !!id,
  });
}

export function useCreatePortfolioAchievement() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: PortfolioAchievementCreate) => portfolioApi.createAchievement(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "portfolio", "achievements"] });
    },
  });
}

export function useUpdatePortfolioAchievement() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: PortfolioAchievementUpdate }) =>
      portfolioApi.updateAchievement(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["admin", "portfolio", "achievements"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "portfolio", "achievements", id] });
    },
  });
}

export function useDeletePortfolioAchievement() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => portfolioApi.deleteAchievement(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "portfolio", "achievements"] });
    },
  });
}

export function useReorderPortfolioAchievements() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (ids: number[]) => portfolioApi.reorderAchievements(ids),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "portfolio", "achievements"] });
    },
  });
}

// ==========================================
// Portfolio Hooks - Courses
// ==========================================

export function usePortfolioCourses() {
  return useQuery({
    queryKey: ["admin", "portfolio", "courses"],
    queryFn: () => portfolioApi.listCourses().then((res) => res.data),
  });
}

export function usePortfolioCourse(id: number) {
  return useQuery({
    queryKey: ["admin", "portfolio", "courses", id],
    queryFn: () => portfolioApi.getCourse(id).then((res) => res.data),
    enabled: !!id,
  });
}

export function useCreatePortfolioCourse() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: PortfolioCourseCreate) => portfolioApi.createCourse(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "portfolio", "courses"] });
    },
  });
}

export function useUpdatePortfolioCourse() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: PortfolioCourseUpdate }) =>
      portfolioApi.updateCourse(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["admin", "portfolio", "courses"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "portfolio", "courses", id] });
    },
  });
}

export function useDeletePortfolioCourse() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => portfolioApi.deleteCourse(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "portfolio", "courses"] });
    },
  });
}

export function useReorderPortfolioCourses() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (ids: number[]) => portfolioApi.reorderCourses(ids),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "portfolio", "courses"] });
    },
  });
}

// ==========================================
// System Settings Hooks
// ==========================================

export function useSystemSettings() {
  return useQuery({
    queryKey: ["admin", "system-settings"],
    queryFn: () => systemSettingsApi.list().then((res) => res.data),
  });
}

export function useSystemSetting(key: string) {
  return useQuery({
    queryKey: ["admin", "system-settings", key],
    queryFn: () => systemSettingsApi.get(key).then((res) => res.data),
    enabled: !!key,
  });
}

export function useUpdateSystemSetting() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ key, data }: { key: string; data: SystemSettingUpdate }) =>
      systemSettingsApi.update(key, data),
    onSuccess: (_, { key }) => {
      queryClient.invalidateQueries({ queryKey: ["admin", "system-settings"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "system-settings", key] });
    },
  });
}
