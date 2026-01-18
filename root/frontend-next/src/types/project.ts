// ABOUTME: Project domain types for Quibo frontend
// ABOUTME: Defines project workflow stages and API response shapes

export type WorkflowStage = "upload" | "outline" | "drafting" | "refining" | "social" | "complete"

export interface Project {
  id: string
  name: string
  description: string | null
  status: "active" | "archived" | "deleted"
  workflowStage: WorkflowStage
  sectionCount: number
  completedSections: number
  createdAt: string
  updatedAt: string
  userId: string
}

export interface CreateProjectRequest {
  name: string
  description?: string
  model_name: string
  persona: string
}

export interface OutlineSection {
  id: string
  title: string
  description: string
  order: number
}

export interface ProjectStatusResponse {
  projectId: string
  projectName: string
  hasOutline: boolean
  totalSections: number
  completedSections: number
  currentStage: WorkflowStage
  outline?: OutlineSection[]
}
