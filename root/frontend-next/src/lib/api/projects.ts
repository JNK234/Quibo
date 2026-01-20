// ABOUTME: Project API service for CRUD operations
// ABOUTME: Wraps apiClient with typed project endpoints and data transformation

import { apiClient } from "./client"
import { Project, CreateProjectRequest, ProjectStatusResponse, WorkflowStage } from "@/types/project"
import { ResumeProjectResponse } from "@/types/workflow"

// API response shape (after camelCase transformation by apiClient)
// Note: progress can be number (list endpoint) or object (single project endpoint)
interface APIProject {
  id: string
  name: string
  status: "active" | "archived" | "deleted"
  createdAt: string
  updatedAt: string
  archivedAt: string | null
  completedAt: string | null
  metadata: {
    persona?: string
    modelName?: string
    uploadedFiles?: string[]
    uploadDirectory?: string
    costSummary?: Record<string, unknown>
  } | null
  progress: number | { percentage: number; milestones?: Record<string, unknown>; sections?: { completed: number; total: number } }
  totalCost: number
}

interface GetProjectResponse {
  status: string
  project: APIProject
}

// Map progress percentage to workflow stage
function getWorkflowStage(progress: number, completedAt: string | null): WorkflowStage {
  if (completedAt) return "complete"
  if (progress >= 80) return "social"
  if (progress >= 60) return "refining"
  if (progress >= 40) return "drafting"
  if (progress >= 20) return "outline"
  return "upload"
}

// Extract progress percentage from API response (handles both number and object formats)
function getProgressPercentage(progress: APIProject["progress"]): number {
  if (typeof progress === "number") return progress
  return progress?.percentage ?? 0
}

// Transform API response to frontend Project type
function transformProject(apiProject: APIProject): Project {
  const progress = getProgressPercentage(apiProject.progress)
  const sections = typeof apiProject.progress === "object" ? apiProject.progress?.sections : null
  const now = new Date().toISOString()
  return {
    id: apiProject.id,
    name: apiProject.name,
    description: null,
    status: apiProject.status,
    workflowStage: getWorkflowStage(progress, apiProject.completedAt),
    sectionCount: sections?.total ?? 0,
    completedSections: sections?.completed ?? 0,
    createdAt: apiProject.createdAt || now,
    updatedAt: apiProject.updatedAt || now,
    userId: "",
  }
}

export async function createProject(data: CreateProjectRequest): Promise<Project> {
  const response = await apiClient<APIProject>("/api/v2/projects", {
    method: "POST",
    body: JSON.stringify(data),
  })
  return transformProject(response)
}

interface GetProjectsResponse {
  status: string
  projects: APIProject[]
  count?: number
}

export async function getProjects(): Promise<Project[]> {
  const response = await apiClient<GetProjectsResponse>("/api/v2/projects")
  return response.projects.map(transformProject)
}

export async function getProject(id: string): Promise<Project> {
  const response = await apiClient<GetProjectResponse>(`/api/v2/projects/${id}`)
  return transformProject(response.project)
}

export async function deleteProject(id: string): Promise<void> {
  return apiClient<void>(`/api/v2/projects/${id}`, {
    method: "DELETE",
  })
}

export async function getProjectStatus(id: string): Promise<ProjectStatusResponse> {
  return apiClient<ProjectStatusResponse>(`/project_status/${id}`)
}

export async function resumeProject(id: string): Promise<ResumeProjectResponse> {
  return apiClient<ResumeProjectResponse>(`/resume/${id}`)
}
