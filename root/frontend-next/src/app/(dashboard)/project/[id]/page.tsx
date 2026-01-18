// ABOUTME: Project detail page that redirects based on workflow stage
// ABOUTME: Currently redirects all projects to upload page

import { redirect } from "next/navigation"

interface ProjectPageProps {
  params: Promise<{ id: string }>
}

export default async function ProjectPage({ params }: ProjectPageProps) {
  const { id } = await params
  // For now, redirect to upload page
  // Later: check milestone and redirect to appropriate tab
  redirect(`/project/${id}/upload`)
}
