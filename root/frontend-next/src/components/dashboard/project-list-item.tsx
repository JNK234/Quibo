// ABOUTME: Individual project card component for the dashboard list
// ABOUTME: Premium glass morphism design with progress indicator and hover effects

"use client"

import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { formatDistanceToNow } from "date-fns"
import { Button } from "@/components/ui/button"
import { FileText, Trash2, ArrowUpRight, Clock } from "lucide-react"
import { Project, WorkflowStage } from "@/types/project"
import { useUIStore } from "@/store/ui-store"

const statusConfig: Record<WorkflowStage, { color: string; bgColor: string; label: string }> = {
  upload: { color: "text-slate-400", bgColor: "bg-slate-400/10", label: "Upload" },
  outline: { color: "text-blue-400", bgColor: "bg-blue-400/10", label: "Outline" },
  drafting: { color: "text-amber-400", bgColor: "bg-amber-400/10", label: "Drafting" },
  refining: { color: "text-purple-400", bgColor: "bg-purple-400/10", label: "Refining" },
  social: { color: "text-cyan-400", bgColor: "bg-cyan-400/10", label: "Social" },
  complete: { color: "text-emerald-400", bgColor: "bg-emerald-400/10", label: "Complete" },
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

  const status = statusConfig[project.workflowStage]

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, ease: [0.4, 0, 0.2, 1] }}
      className="group"
    >
      <div
        onClick={handleClick}
        className="project-card rounded-xl p-5 cursor-pointer relative overflow-hidden"
      >
        {/* Progress indicator bar at top */}
        {progress > 0 && (
          <div className="absolute top-0 left-0 right-0 h-0.5 bg-white/5">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ delay: index * 0.05 + 0.2, duration: 0.5 }}
              className="h-full bg-gradient-to-r from-amber-400 to-amber-500"
            />
          </div>
        )}

        <div className="flex items-start gap-4">
          {/* Icon */}
          <div className="w-11 h-11 rounded-lg bg-amber-500/10 flex items-center justify-center flex-shrink-0 border border-amber-500/20">
            <FileText className="w-5 h-5 text-amber-400" />
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1.5">
              <h3 className="font-medium text-[15px] truncate pr-2">{project.name}</h3>
              <ArrowUpRight className="w-4 h-4 text-muted-foreground/50 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
            </div>

            {/* Status badge */}
            <div className="flex items-center gap-2 mb-2">
              <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${status.bgColor} ${status.color}`}>
                {status.label}
              </span>
              {project.sectionCount > 0 && (
                <span className="text-xs text-muted-foreground">
                  {project.completedSections}/{project.sectionCount} sections
                </span>
              )}
            </div>

            {/* Timestamp */}
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground/70">
              <Clock className="w-3 h-3" />
              <span>Updated {formatDistanceToNow(new Date(project.updatedAt), { addSuffix: true })}</span>
            </div>
          </div>

          {/* Delete button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={handleDelete}
            className="opacity-0 group-hover:opacity-100 transition-all text-muted-foreground hover:text-red-400 hover:bg-red-400/10 h-8 w-8"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </motion.div>
  )
}
