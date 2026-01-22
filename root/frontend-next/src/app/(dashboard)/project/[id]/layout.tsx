// ABOUTME: Project layout with horizontal progress stepper for workflow navigation
// ABOUTME: Wraps all project subpages with consistent header and progress indicator

"use client"

import { use } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useProject, useProjectStatus } from "@/lib/queries/project-queries"
import { ProgressStepper } from "@/components/shared/progress-stepper"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { ArrowLeft } from "lucide-react"
import { WorkflowStage } from "@/types/project"

interface ProjectLayoutProps {
  children: React.ReactNode
  params: Promise<{ id: string }>
}

// Workflow steps configuration for ProgressStepper
const WORKFLOW_STEPS = [
  { id: "upload", label: "Upload" },
  { id: "outline", label: "Outline" },
  { id: "drafting", label: "Draft" },
  { id: "refining", label: "Refine" },
  { id: "social", label: "Social" },
]

// Stage order for calculating current step index
const STAGE_ORDER: WorkflowStage[] = [
  "upload",
  "outline",
  "drafting",
  "refining",
  "social",
  "complete",
]

// Map step IDs to URL paths
function getStepPath(stepId: string): string {
  switch (stepId) {
    case "drafting":
      return "draft"
    case "refining":
      return "refine"
    default:
      return stepId
  }
}

export default function ProjectLayout({ children, params }: ProjectLayoutProps) {
  const { id } = use(params)
  const router = useRouter()
  const { data: project, isLoading: projectLoading } = useProject(id)
  const { data: status } = useProjectStatus(id)

  const currentStage = status?.currentStage ?? project?.workflowStage ?? "upload"

  // Calculate current step index from currentStage
  const currentStepIndex = STAGE_ORDER.indexOf(currentStage)
  // Clamp to valid step range (0-4 for the 5 visible steps)
  const displayStepIndex = Math.min(currentStepIndex, WORKFLOW_STEPS.length - 1)

  // Handle step click navigation - only allow clicking completed steps
  const handleStepClick = (stepIndex: number) => {
    if (stepIndex < currentStepIndex) {
      const step = WORKFLOW_STEPS[stepIndex]
      const path = getStepPath(step.id)
      router.push(`/project/${id}/${path}`)
    }
  }

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

        {/* Progress Stepper - replaces WorkflowTabs per CONTEXT.md design decision */}
        <ProgressStepper
          steps={WORKFLOW_STEPS}
          currentStep={displayStepIndex}
          onStepClick={handleStepClick}
          className="border-t"
        />
      </header>

      {/* Page Content */}
      <main className="flex-1 container py-6">{children}</main>
    </div>
  )
}
