// ABOUTME: Individual project card component for the dashboard list
// ABOUTME: Displays project status, progress, and provides navigation/delete actions

"use client"

import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { formatDistanceToNow } from "date-fns"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { FileText, Trash2 } from "lucide-react"
import { Project, WorkflowStage } from "@/types/project"
import { useUIStore } from "@/store/ui-store"

const statusColors: Record<WorkflowStage, string> = {
  upload: "bg-gray-500",
  outline: "bg-blue-500",
  drafting: "bg-yellow-500",
  refining: "bg-purple-500",
  social: "bg-green-500",
  complete: "bg-emerald-500",
}

const statusLabels: Record<WorkflowStage, string> = {
  upload: "Upload",
  outline: "Outline",
  drafting: "Drafting",
  refining: "Refining",
  social: "Social",
  complete: "Complete",
}

interface ProjectListItemProps {
  project: Project
  index: number
}

export function ProjectListItem({ project, index }: ProjectListItemProps) {
  const router = useRouter()
  const { openDeleteConfirmModal } = useUIStore()

  const handleClick = () => {
    router.push(`/project/${project.id}`)
  }

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation()
    openDeleteConfirmModal(project.id, project.name)
  }

  const progress =
    project.sectionCount > 0
      ? Math.round((project.completedSections / project.sectionCount) * 100)
      : 0

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      whileHover={{ scale: 1.02 }}
      className="group"
    >
      <Card
        onClick={handleClick}
        className="cursor-pointer transition-all hover:shadow-lg hover:border-primary/50 relative"
      >
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
              <FileText className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-medium truncate">{project.name}</h3>
                <span
                  className={`w-2 h-2 rounded-full ${statusColors[project.workflowStage]}`}
                  title={statusLabels[project.workflowStage]}
                />
              </div>
              <p className="text-sm text-muted-foreground">
                {statusLabels[project.workflowStage]}
                {project.sectionCount > 0 && (
                  <span className="ml-2">
                    • {project.completedSections}/{project.sectionCount} sections
                    {progress > 0 && ` (${progress}%)`}
                  </span>
                )}
              </p>
              <p className="text-xs text-muted-foreground/70 mt-1">
                Updated {formatDistanceToNow(new Date(project.updatedAt), { addSuffix: true })}
              </p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleDelete}
              className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
