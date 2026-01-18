// ABOUTME: Project list component for dashboard with loading and error states
// ABOUTME: Shows user's blog projects or prompts to create first one

"use client"

import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { FileText, Plus, Sparkles, RefreshCw } from "lucide-react"
import { useProjects } from "@/lib/queries/project-queries"
import { useUIStore } from "@/store/ui-store"
import { ProjectListItem } from "./project-list-item"

export function ProjectList() {
  const { data: projects, isLoading, isError, refetch } = useProjects()
  const { openNewProjectModal } = useUIStore()

  if (isLoading) {
    return <LoadingState />
  }

  if (isError) {
    return <ErrorState onRetry={() => refetch()} />
  }

  if (!projects || projects.length === 0) {
    return <EmptyState onCreateClick={openNewProjectModal} />
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {projects.map((project, index) => (
        <ProjectListItem key={project.id} project={project} index={index} />
      ))}
    </div>
  )
}

function LoadingState() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {[0, 1, 2].map((i) => (
        <Card key={i}>
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <Skeleton className="w-10 h-10 rounded-lg" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-3 w-1/3" />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

function ErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center justify-center py-16"
    >
      <Card className="max-w-md w-full">
        <CardContent className="flex flex-col items-center text-center p-8">
          <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
            <RefreshCw className="w-8 h-8 text-destructive" />
          </div>
          <h2 className="font-serif text-xl font-semibold mb-2">
            Failed to Load Projects
          </h2>
          <p className="text-muted-foreground text-sm mb-6">
            We couldn&apos;t load your projects. Please try again.
          </p>
          <Button onClick={onRetry} variant="outline">
            <RefreshCw className="w-4 h-4 mr-2" />
            Retry
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  )
}

interface EmptyStateProps {
  onCreateClick: () => void
}

function EmptyState({ onCreateClick }: EmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col items-center justify-center py-16"
    >
      <Card className="max-w-md w-full border-dashed border-2 bg-card/50">
        <CardContent className="flex flex-col items-center text-center p-8">
          {/* Decorative illustration */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1, duration: 0.4 }}
            className="relative mb-6"
          >
            <div className="w-20 h-20 rounded-2xl gradient-warm flex items-center justify-center">
              <Sparkles className="w-10 h-10 text-white" />
            </div>
            {/* Floating decorative elements */}
            <motion.div
              animate={{
                y: [-2, 2, -2],
                rotate: [-5, 5, -5],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="absolute -top-2 -right-2 w-6 h-6 rounded-lg bg-accent flex items-center justify-center"
            >
              <FileText className="w-3 h-3 text-accent-foreground" />
            </motion.div>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="font-serif text-2xl font-semibold mb-2"
          >
            Create Your First Post
          </motion.h2>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-muted-foreground text-sm mb-6 max-w-xs"
          >
            Upload a Jupyter notebook or Markdown file and let AI help you craft
            a compelling blog post.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Button
              size="lg"
              onClick={onCreateClick}
              className="gradient-warm border-0 text-white hover:opacity-90"
            >
              <Plus className="w-4 h-4 mr-2" />
              New Project
            </Button>
          </motion.div>

          {/* Supported formats hint */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="flex items-center gap-2 mt-6 text-xs text-muted-foreground"
          >
            <span>Supports:</span>
            <code className="px-1.5 py-0.5 rounded bg-muted">.ipynb</code>
            <code className="px-1.5 py-0.5 rounded bg-muted">.md</code>
            <code className="px-1.5 py-0.5 rounded bg-muted">.py</code>
          </motion.div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
