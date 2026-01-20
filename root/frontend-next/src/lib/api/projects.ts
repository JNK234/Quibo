// ABOUTME: Project API service for CRUD operations
// ABOUTME: Wraps apiClient with typed project endpoints and data transformation

import { apiClient } from "./client"
import { Project, CreateProjectRequest, ProjectStatusResponse, WorkflowStage } from "@/types/project"
import { ResumeProjectResponse } from "@/types/workflow"

// API response shape (snake_case from backend)
interface APIProject {
  id: string
  name: string
  status: "active" | "archived" | "deleted"
  created_at: string
  updated_at: string
  archived_at: string | null
  completed_at: string | null
  metadata: {
    persona?: string
    model_name?: string
    uploaded_files?: string[]
    upload_directory?: string
    cost_summary?: Record<string, unknown>
    progress?: number
  } | null
  progress: number
  total_cost: number
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

// Transform API response to frontend Project type
function transformProject(apiProject: APIProject): Project {
  const progress = apiProject.progress ?? 0
  const now = new Date().toISOString()
  return {
    id: apiProject.id,
    name: apiProject.name,
    description: null,
    status: apiProject.status,
    workflowStage: getWorkflowStage(progress, apiProject.completed_at),
    sectionCount: 0,
    completedSections: 0,
    createdAt: apiProject.created_at || now,
    updatedAt: apiProject.updated_at || now,
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
  const response = await apiClient<APIProject>(`/api/v2/projects/${id}`)
  return transformProject(response)
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
