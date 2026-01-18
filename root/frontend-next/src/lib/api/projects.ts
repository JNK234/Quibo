// ABOUTME: Project API service for CRUD operations
// ABOUTME: Wraps apiClient with typed project endpoints

import { apiClient } from "./client"
import { Project, CreateProjectRequest, ProjectStatusResponse } from "@/types/project"

export async function createProject(data: CreateProjectRequest): Promise<Project> {
  return apiClient<Project>("/api/v2/projects", {
    method: "POST",
    body: JSON.stringify(data),
  })
}

interface GetProjectsResponse {
  status: string
  projects: Project[]
  count: number
}

export async function getProjects(): Promise<Project[]> {
  const response = await apiClient<GetProjectsResponse>("/api/v2/projects")
  return response.projects
}

export async function getProject(id: string): Promise<Project> {
  return apiClient<Project>(`/api/v2/projects/${id}`)
}

export async function deleteProject(id: string): Promise<void> {
  return apiClient<void>(`/api/v2/projects/${id}`, {
    method: "DELETE",
  })
}

export async function getProjectStatus(id: string): Promise<ProjectStatusResponse> {
  return apiClient<ProjectStatusResponse>(`/project_status/${id}`)
}
