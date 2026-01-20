// ABOUTME: Server-side project API functions for server components
// ABOUTME: Uses serverApiClient for proper session handling on server

import { serverApiClient } from "./server-client"
import { Project, ProjectStatusResponse, WorkflowStage } from "@/types/project"

// API response shape (after camelCase transformation by serverApiClient)
// Note: Single project endpoint returns progress as sibling of project, not nested
interface APIProjectBase {
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
}

interface APIProgress {
  percentage: number
  milestones?: Record<string, unknown>
  sections?: { completed: number; total: number }
}

interface GetProjectResponse {
  status: string
  project: APIProjectBase
  progress: APIProgress
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
function transformProject(apiProject: APIProjectBase, progress: APIProgress): Project {
  const progressPercent = progress?.percentage ?? 0
  const now = new Date().toISOString()
  return {
    id: apiProject.id,
    name: apiProject.name,
    description: null,
    status: apiProject.status,
    workflowStage: getWorkflowStage(progressPercent, apiProject.completedAt),
    sectionCount: progress?.sections?.total ?? 0,
    completedSections: progress?.sections?.completed ?? 0,
    createdAt: apiProject.createdAt || now,
    updatedAt: apiProject.updatedAt || now,
    userId: "",
  }
}

export async function getProjectServer(id: string): Promise<Project> {
  const response = await serverApiClient<GetProjectResponse>(`/api/v2/projects/${id}`)
  return transformProject(response.project, response.progress)
}

export async function getProjectStatusServer(id: string): Promise<ProjectStatusResponse> {
  return serverApiClient<ProjectStatusResponse>(`/project_status/${id}`)
}
