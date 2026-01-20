// ABOUTME: Project detail page that redirects based on workflow stage
// ABOUTME: Fetches project status and routes to appropriate workflow tab

import { redirect } from "next/navigation"
import { getProjectStatusServer, getProjectServer } from "@/lib/api/projects-server"

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

  // Try to get project status first for accurate stage
  let path = "upload"

  try {
    const status = await getProjectStatusServer(id)
    path = STAGE_TO_PATH[status.currentStage] ?? "upload"
  } catch {
    // Status endpoint failed, try project data
    try {
      const project = await getProjectServer(id)
      path = STAGE_TO_PATH[project.workflowStage] ?? "upload"
    } catch {
      // Default to upload if all else fails
      path = "upload"
    }
  }

  redirect(`/project/${id}/${path}`)
}
