// ABOUTME: Project detail page that redirects based on workflow stage
// ABOUTME: Fetches project status and routes to appropriate workflow tab

import { redirect } from "next/navigation"
import { getProjectStatus, getProject } from "@/lib/api/projects"

interface ProjectPageProps {
  params: Promise<{ id: string }>
}

const STAGE_TO_PATH: Record<string, string> = {
  upload: "upload",
  outline: "outline",
  drafting: "draft",
  refining: "refine",
  social: "social",
  complete: "social",
}

export default async function ProjectPage({ params }: ProjectPageProps) {
  const { id } = await params

  try {
    // Try to get project status first for accurate stage
    const status = await getProjectStatus(id)
    const path = STAGE_TO_PATH[status.currentStage] ?? "upload"
    redirect(`/project/${id}/${path}`)
  } catch {
    // Fall back to project data if status fails
    try {
      const project = await getProject(id)
      const path = STAGE_TO_PATH[project.workflowStage] ?? "upload"
      redirect(`/project/${id}/${path}`)
    } catch {
      // Default to upload if all else fails
      redirect(`/project/${id}/upload`)
    }
  }
}
