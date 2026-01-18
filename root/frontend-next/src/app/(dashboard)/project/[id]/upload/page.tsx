// ABOUTME: Upload page placeholder for project file uploads
// ABOUTME: Will be implemented in Piece 3

"use client"

import { use } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { ArrowLeft, Upload } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useProject } from "@/lib/queries/project-queries"
import { Skeleton } from "@/components/ui/skeleton"

interface UploadPageProps {
  params: Promise<{ id: string }>
}

export default function UploadPage({ params }: UploadPageProps) {
  const { id } = use(params)
  const { data: project, isLoading } = useProject(id)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/dashboard">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </Link>
        {isLoading ? (
          <Skeleton className="h-8 w-48" />
        ) : (
          <h1 className="font-serif text-2xl font-semibold">{project?.name}</h1>
        )}
      </div>

      {/* Upload Placeholder */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <Card className="border-dashed border-2">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <Upload className="w-8 h-8 text-primary" />
            </div>
            <h2 className="font-serif text-xl font-semibold mb-2">
              Upload Your Content
            </h2>
            <p className="text-muted-foreground text-sm max-w-md mb-6">
              Drop your Jupyter notebook, Markdown, or Python file here to get started.
              This feature is coming in Piece 3.
            </p>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span>Supports:</span>
              <code className="px-1.5 py-0.5 rounded bg-muted">.ipynb</code>
              <code className="px-1.5 py-0.5 rounded bg-muted">.md</code>
              <code className="px-1.5 py-0.5 rounded bg-muted">.py</code>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
