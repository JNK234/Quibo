// ABOUTME: Client component for dashboard content with premium animations
// ABOUTME: Shows welcome message, stats, project list, and modals with billion-dollar aesthetic

"use client"

import { motion } from "framer-motion"
import { User } from "@supabase/supabase-js"
import { Plus, FileText, CheckCircle2, Calendar, FolderOpen } from "lucide-react"
import { ProjectList } from "@/components/dashboard/project-list"
import { NewProjectModal } from "@/components/dashboard/new-project-modal"
import { DeleteProjectDialog } from "@/components/dashboard/delete-project-dialog"
import { Button } from "@/components/ui/button"
import { getUserDisplayName } from "@/hooks/use-auth"
import { useProjects } from "@/lib/queries/project-queries"
import { useUIStore } from "@/store/ui-store"

interface DashboardContentProps {
  user: User
}

export function DashboardContent({ user }: DashboardContentProps) {
  const displayName = getUserDisplayName(user)
  const firstName = displayName.split(" ")[0]
  const { data: projects } = useProjects()
  const { openNewProjectModal } = useUIStore()

  // Calculate stats from projects
  const totalProjects = projects?.length ?? 0
  const drafts = projects?.filter((p) =>
    ["upload", "outline", "drafting", "refining"].includes(p.workflowStage)
  ).length ?? 0
  const published = projects?.filter((p) => p.workflowStage === "complete").length ?? 0

  // Get current month's projects
  const now = new Date()
  const thisMonth = projects?.filter((p) => {
    const created = new Date(p.createdAt)
    return created.getMonth() === now.getMonth() && created.getFullYear() === now.getFullYear()
  }).length ?? 0

  const stats = [
    { label: "Projects", value: String(totalProjects), icon: FolderOpen, color: "text-blue-400" },
    { label: "Drafts", value: String(drafts), icon: FileText, color: "text-amber-400" },
    { label: "Published", value: String(published), icon: CheckCircle2, color: "text-emerald-400" },
    { label: "This Month", value: String(thisMonth), icon: Calendar, color: "text-purple-400" },
  ]

  return (
    <div className="space-y-10">
      {/* Welcome Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
        className="flex flex-col sm:flex-row sm:items-end justify-between gap-4"
      >
        <div className="space-y-2">
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-sm font-medium text-muted-foreground tracking-wide uppercase"
          >
            Welcome back
          </motion.p>
          <h1 className="font-serif text-4xl md:text-5xl font-semibold tracking-tight">
            {firstName}
          </h1>
          <p className="text-muted-foreground text-lg">
            Your AI-powered blogging workspace
          </p>
        </div>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
        >
          <Button
            onClick={openNewProjectModal}
            size="lg"
            className="gradient-warm border-0 text-white hover:opacity-90 btn-shine shadow-lg shadow-amber-500/20"
          >
            <Plus className="w-5 h-5 mr-2" />
            New Project
          </Button>
        </motion.div>
      </motion.div>

      {/* Quick Stats - Premium Glass Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15, duration: 0.5 }}
        className="grid grid-cols-2 lg:grid-cols-4 gap-4"
      >
        {stats.map((stat, i) => {
          const Icon = stat.icon
          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + i * 0.08, duration: 0.4 }}
              whileHover={{ scale: 1.02 }}
              className="stat-card p-5 rounded-xl cursor-default"
            >
              <div className="flex items-start justify-between mb-3">
                <div className={`p-2 rounded-lg bg-white/5 ${stat.color}`}>
                  <Icon className="w-5 h-5" />
                </div>
              </div>
              <p className="text-3xl font-semibold tracking-tight mb-1">{stat.value}</p>
              <p className="text-sm text-muted-foreground font-medium">{stat.label}</p>
            </motion.div>
          )
        })}
      </motion.div>

      {/* Projects Section */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4, duration: 0.5 }}
        className="space-y-6"
      >
        <div className="flex items-center justify-between">
          <h2 className="font-serif text-2xl font-medium tracking-tight">Your Projects</h2>
          <p className="text-sm text-muted-foreground">
            {totalProjects} {totalProjects === 1 ? 'project' : 'projects'}
          </p>
        </div>

        <ProjectList />
      </motion.div>

      {/* Modals */}
      <NewProjectModal />
      <DeleteProjectDialog />
    </div>
  )
}
