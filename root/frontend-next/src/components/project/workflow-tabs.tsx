// ABOUTME: Workflow navigation tabs showing the 5 stages of blog creation
// ABOUTME: Provides visual progress indicators and stage navigation

"use client"

import { useRouter, usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { WorkflowStage } from "@/types/project"
import { CheckCircle2, Circle, Upload, FileText, Edit3, Sparkles, Share2 } from "lucide-react"

interface WorkflowTabsProps {
  projectId: string
  currentStage: WorkflowStage
  className?: string
}

interface TabConfig {
  id: WorkflowStage
  label: string
  icon: React.ComponentType<{ className?: string }>
  path: string
}

const WORKFLOW_TABS: TabConfig[] = [
  { id: "upload", label: "Upload", icon: Upload, path: "upload" },
  { id: "outline", label: "Outline", icon: FileText, path: "outline" },
  { id: "drafting", label: "Draft", icon: Edit3, path: "draft" },
  { id: "refining", label: "Refine", icon: Sparkles, path: "refine" },
  { id: "social", label: "Social", icon: Share2, path: "social" },
]

const STAGE_ORDER: WorkflowStage[] = ["upload", "outline", "drafting", "refining", "social", "complete"]

function getStageIndex(stage: WorkflowStage): number {
  return STAGE_ORDER.indexOf(stage)
}

function isStageComplete(tabStage: WorkflowStage, currentStage: WorkflowStage): boolean {
  return getStageIndex(tabStage) < getStageIndex(currentStage)
}

function isStageAccessible(tabStage: WorkflowStage, currentStage: WorkflowStage): boolean {
  return getStageIndex(tabStage) <= getStageIndex(currentStage)
}

export function WorkflowTabs({ projectId, currentStage, className }: WorkflowTabsProps) {
  const router = useRouter()
  const pathname = usePathname()

  const handleTabClick = (tab: TabConfig) => {
    if (!isStageAccessible(tab.id, currentStage)) {
      return
    }
    router.push(`/project/${projectId}/${tab.path}`)
  }

  return (
    <div className={cn("border-b bg-card", className)}>
      <nav className="flex space-x-1 px-4" aria-label="Workflow stages">
        {WORKFLOW_TABS.map((tab, index) => {
          const isComplete = isStageComplete(tab.id, currentStage)
          const isActive = pathname?.includes(`/${tab.path}`)
          const isCurrent = tab.id === currentStage
          const isAccessible = isStageAccessible(tab.id, currentStage)
          const Icon = tab.icon

          return (
            <button
              key={tab.id}
              onClick={() => handleTabClick(tab)}
              disabled={!isAccessible}
              className={cn(
                "relative flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors",
                "border-b-2 -mb-[2px]",
                isActive
                  ? "border-primary text-primary"
                  : isComplete
                  ? "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
                  : isCurrent
                  ? "border-primary/50 text-foreground"
                  : "border-transparent text-muted-foreground/50 cursor-not-allowed"
              )}
              aria-current={isActive ? "page" : undefined}
            >
              <span className="relative flex items-center justify-center">
                {isComplete ? (
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                ) : (
                  <Icon className={cn("h-4 w-4", isAccessible ? "" : "opacity-50")} />
                )}
              </span>
              <span className={cn(!isAccessible && "opacity-50")}>{tab.label}</span>
              {index < WORKFLOW_TABS.length - 1 && (
                <span
                  className={cn(
                    "absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 h-px w-4",
                    isComplete ? "bg-green-500" : "bg-border"
                  )}
                />
              )}
            </button>
          )
        })}
      </nav>
    </div>
  )
}

export function WorkflowProgress({
  currentStage,
  completedSections,
  totalSections,
}: {
  currentStage: WorkflowStage
  completedSections: number
  totalSections: number
}) {
  const stageIndex = getStageIndex(currentStage)
  const totalStages = WORKFLOW_TABS.length
  const baseProgress = (stageIndex / totalStages) * 100

  // Add section progress for drafting stage
  let sectionProgress = 0
  if (currentStage === "drafting" && totalSections > 0) {
    sectionProgress = ((completedSections / totalSections) * 100) / totalStages
  }

  const totalProgress = Math.min(baseProgress + sectionProgress, 100)

  return (
    <div className="w-full bg-muted rounded-full h-2">
      <div
        className="bg-primary h-2 rounded-full transition-all duration-300"
        style={{ width: `${totalProgress}%` }}
      />
    </div>
  )
}
