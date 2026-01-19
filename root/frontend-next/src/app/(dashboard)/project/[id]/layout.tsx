// ABOUTME: Project layout with workflow tabs for navigation between stages
// ABOUTME: Wraps all project subpages with consistent header and tabs

"use client"

import { use } from "react"
import Link from "next/link"
import { useProject, useProjectStatus } from "@/lib/queries/project-queries"
import { WorkflowTabs, WorkflowProgress } from "@/components/project/workflow-tabs"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { ArrowLeft } from "lucide-react"

interface ProjectLayoutProps {
  children: React.ReactNode
  params: Promise<{ id: string }>
}

export default function ProjectLayout({ children, params }: ProjectLayoutProps) {
  const { id } = use(params)
  const { data: project, isLoading: projectLoading } = useProject(id)
  const { data: status } = useProjectStatus(id)

  const currentStage = status?.currentStage ?? project?.workflowStage ?? "upload"
  const completedSections = status?.completedSections ?? project?.completedSections ?? 0
  const totalSections = status?.totalSections ?? project?.sectionCount ?? 0

  return (
    <div className="min-h-screen flex flex-col">
      {/* Project Header */}
      <header className="border-b bg-card">
        <div className="container py-4">
          <div className="flex items-center gap-4">
            <Link href="/dashboard">
              <Button variant="ghost" size="icon-sm">
                <ArrowLeft className="w-4 h-4" />
              </Button>
            </Link>
            {projectLoading ? (
              <Skeleton className="h-7 w-48" />
            ) : (
              <div className="flex-1">
                <h1 className="font-serif text-xl font-semibold">{project?.name}</h1>
                {project?.description && (
                  <p className="text-sm text-muted-foreground">{project.description}</p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Progress Bar */}
        <div className="container pb-2">
          <WorkflowProgress
            currentStage={currentStage}
            completedSections={completedSections}
            totalSections={totalSections}
          />
        </div>

        {/* Workflow Tabs */}
        <WorkflowTabs projectId={id} currentStage={currentStage} />
      </header>

      {/* Page Content */}
      <main className="flex-1 container py-6">{children}</main>
    </div>
  )
}
