// ABOUTME: Client component for dashboard content with animations
// ABOUTME: Shows welcome message, stats, project list, and modals

"use client"

import { motion } from "framer-motion"
import { User } from "@supabase/supabase-js"
import { Plus } from "lucide-react"
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
    { label: "Projects", value: String(totalProjects) },
    { label: "Drafts", value: String(drafts) },
    { label: "Published", value: String(published) },
    { label: "This Month", value: String(thisMonth) },
  ]

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex items-center justify-between"
      >
        <div className="space-y-1">
          <h1 className="font-serif text-3xl md:text-4xl font-semibold tracking-tight">
            Welcome back, {firstName}
          </h1>
          <p className="text-muted-foreground">
            Your AI-powered blogging workspace
          </p>
        </div>
        <Button
          onClick={openNewProjectModal}
          className="gradient-warm border-0 text-white hover:opacity-90"
        >
          <Plus className="w-4 h-4 mr-2" />
          New Project
        </Button>
      </motion.div>

      {/* Quick Stats */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.4 }}
        className="grid grid-cols-2 md:grid-cols-4 gap-4"
      >
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 + i * 0.05, duration: 0.3 }}
            className="p-4 rounded-lg bg-card border border-border/50"
          >
            <p className="text-2xl font-serif font-semibold">{stat.value}</p>
            <p className="text-sm text-muted-foreground">{stat.label}</p>
          </motion.div>
        ))}
      </motion.div>

      {/* Projects Section */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.4 }}
        className="space-y-4"
      >
        <div className="flex items-center justify-between">
          <h2 className="font-serif text-xl font-medium">Your Projects</h2>
        </div>

        <ProjectList />
      </motion.div>

      {/* Modals */}
      <NewProjectModal />
      <DeleteProjectDialog />
    </div>
  )
}
