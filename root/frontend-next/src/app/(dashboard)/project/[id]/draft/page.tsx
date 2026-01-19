// ABOUTME: Draft generation page for generating blog sections and compiling final draft
// ABOUTME: Displays outline sections with generate buttons and shows generated content

"use client"

import { use, useState, useCallback, useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { Loader2, Sparkles, CheckCircle2, Clock, FileText, ArrowRight } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"
import {
  useGenerateSection,
  useCompileDraft,
  useProjectStatus,
} from "@/lib/queries/workflow-queries"
import { useProject } from "@/lib/queries/project-queries"

interface DraftPageProps {
  params: Promise<{ id: string }>
}

type SectionStatus = "pending" | "generating" | "completed"

interface SectionState {
  index: number
  title: string
  status: SectionStatus
  content?: string
}

export default function DraftPage({ params }: DraftPageProps) {
  const { id } = use(params)
  const router = useRouter()
  const { data: project } = useProject(id)
  const projectName = project?.name || ""

  const { data: projectStatus, refetch: refetchStatus } = useProjectStatus(id)
  const generateSectionMutation = useGenerateSection(id, projectName)
  const compileDraftMutation = useCompileDraft(id, projectName)

  const [sections, setSections] = useState<SectionState[]>([])
  const [generatingSectionIndex, setGeneratingSectionIndex] = useState<number | null>(null)

  // Initialize sections from project status
  useEffect(() => {
    if (projectStatus?.outline && sections.length === 0) {
      const initialSections: SectionState[] = projectStatus.outline.map((section, index) => ({
        index,
        title: section.title,
        status: projectStatus.completedSections > index ? "completed" : "pending",
      }))
      setSections(initialSections)
    }
  }, [projectStatus, sections.length])

  const handleGenerateSection = useCallback(
    async (sectionIndex: number) => {
      setGeneratingSectionIndex(sectionIndex)
      setSections((prev) =>
        prev.map((s) => (s.index === sectionIndex ? { ...s, status: "generating" } : s))
      )

      try {
        const result = await generateSectionMutation.mutateAsync({
          sectionIndex,
          options: {
            maxIterations: 3,
            qualityThreshold: 0.7,
          },
        })

        setSections((prev) =>
          prev.map((s) =>
            s.index === sectionIndex
              ? { ...s, status: "completed", content: result.section.content }
              : s
          )
        )

        await refetchStatus()
      } catch (error) {
        console.error("Failed to generate section:", error)
        setSections((prev) =>
          prev.map((s) => (s.index === sectionIndex ? { ...s, status: "pending" } : s))
        )
      } finally {
        setGeneratingSectionIndex(null)
      }
    },
    [generateSectionMutation, refetchStatus]
  )

  const handleCompileDraft = useCallback(async () => {
    try {
      await compileDraftMutation.mutateAsync()
      router.push(`/project/${id}/refine`)
    } catch (error) {
      console.error("Failed to compile draft:", error)
    }
  }, [compileDraftMutation, router, id])

  const allSectionsCompleted = sections.length > 0 && sections.every((s) => s.status === "completed")
  const completedCount = sections.filter((s) => s.status === "completed").length
  const progressPercentage = sections.length > 0 ? (completedCount / sections.length) * 100 : 0

  if (!projectStatus || sections.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto" />
          <p className="text-muted-foreground">Loading project outline...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Progress Header */}
      <Card>
        <CardHeader className="border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary" />
              <CardTitle className="font-serif">Draft Generation</CardTitle>
            </div>
            <div className="text-sm text-muted-foreground">
              {completedCount} of {sections.length} sections completed
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="space-y-2">
            <Progress value={progressPercentage} className="h-2" />
            <p className="text-xs text-muted-foreground text-center">
              Generate each section to build your blog post
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Sections List */}
      <div className="space-y-4">
        {sections.map((section, idx) => (
          <motion.div
            key={section.index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: idx * 0.05 }}
          >
            <Card
              className={cn(
                "transition-all",
                section.status === "generating" && "ring-2 ring-primary",
                section.status === "completed" && "border-green-500/20 bg-green-500/5"
              )}
            >
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  {/* Status Icon */}
                  <div className="flex-shrink-0 mt-1">
                    {section.status === "completed" && (
                      <CheckCircle2 className="w-6 h-6 text-green-500" />
                    )}
                    {section.status === "generating" && (
                      <Loader2 className="w-6 h-6 text-primary animate-spin" />
                    )}
                    {section.status === "pending" && (
                      <Clock className="w-6 h-6 text-muted-foreground" />
                    )}
                  </div>

                  {/* Section Content */}
                  <div className="flex-1 min-w-0 space-y-3">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-muted-foreground">
                            Section {section.index + 1}
                          </span>
                          {section.status === "completed" && (
                            <span className="text-xs px-2 py-0.5 rounded-full bg-green-500/10 text-green-600 font-medium">
                              Complete
                            </span>
                          )}
                          {section.status === "generating" && (
                            <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">
                              Generating...
                            </span>
                          )}
                        </div>
                        <h3 className="text-lg font-semibold mt-1">{section.title}</h3>
                      </div>

                      {section.status === "pending" && (
                        <Button
                          onClick={() => handleGenerateSection(section.index)}
                          disabled={generatingSectionIndex !== null}
                          size="sm"
                        >
                          <Sparkles className="w-4 h-4 mr-2" />
                          Generate
                        </Button>
                      )}
                    </div>

                    {/* Generated Content Preview */}
                    {section.content && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        transition={{ duration: 0.3 }}
                        className="mt-4 p-4 rounded-lg bg-muted/30 border"
                      >
                        <p className="text-sm text-muted-foreground line-clamp-3">
                          {section.content}
                        </p>
                      </motion.div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Compile Draft Button */}
      <AnimatePresence>
        {allSectionsCompleted && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="border-primary/20 bg-primary/5">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-lg mb-1">All sections completed!</h3>
                    <p className="text-sm text-muted-foreground">
                      Compile your draft to combine all sections into a final blog post.
                    </p>
                  </div>
                  <Button
                    onClick={handleCompileDraft}
                    disabled={compileDraftMutation.isPending}
                    size="lg"
                  >
                    {compileDraftMutation.isPending ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Compiling...
                      </>
                    ) : (
                      <>
                        Compile Draft
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Loading Overlay */}
      <AnimatePresence>
        {generatingSectionIndex !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-card border rounded-xl p-8 shadow-lg text-center max-w-sm"
            >
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Loader2 className="w-8 h-8 text-primary animate-spin" />
              </div>
              <h3 className="font-serif text-lg font-semibold mb-2">
                Generating Section {(generatingSectionIndex ?? 0) + 1}
              </h3>
              <p className="text-sm text-muted-foreground">
                Analyzing content and crafting your blog section...
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Compile Loading Overlay */}
      <AnimatePresence>
        {compileDraftMutation.isPending && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-card border rounded-xl p-8 shadow-lg text-center max-w-sm"
            >
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Loader2 className="w-8 h-8 text-primary animate-spin" />
              </div>
              <h3 className="font-serif text-lg font-semibold mb-2">Compiling Draft</h3>
              <p className="text-sm text-muted-foreground">
                Combining all sections into your final blog post...
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
