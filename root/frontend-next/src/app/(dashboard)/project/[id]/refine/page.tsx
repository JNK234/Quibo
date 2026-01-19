// ABOUTME: Blog refinement page for generating title options and refining draft content
// ABOUTME: Displays compiled draft, title selection cards, and refined content

"use client"

import { use, useState, useCallback, useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { Loader2, Sparkles, ArrowRight, FileText, CheckCircle2 } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useRefineBlog } from "@/lib/queries/workflow-queries"
import { useResumeProject } from "@/lib/queries/workflow-queries"
import { TitleOption } from "@/types/workflow"

interface RefinePageProps {
  params: Promise<{ id: string }>
}

export default function RefinePage({ params }: RefinePageProps) {
  const { id } = use(params)
  const router = useRouter()
  const { data: resumeData, isLoading: isLoadingResume } = useResumeProject(id)
  const [selectedTitleIndex, setSelectedTitleIndex] = useState<number | null>(null)
  const [refinementData, setRefinementData] = useState<{
    refinedDraft: string
    titleOptions: TitleOption[]
    summary: string
  } | null>(null)

  const projectName = resumeData?.projectName || ""
  const refineBlogMutation = useRefineBlog(id, projectName)

  // Get compiled draft from resume data
  const compiledDraft = resumeData?.finalDraft || ""

  const handleRefineBlog = useCallback(async () => {
    if (!compiledDraft) {
      console.error("No compiled draft available")
      return
    }

    try {
      const result = await refineBlogMutation.mutateAsync({
        compiledDraft,
      })
      setRefinementData({
        refinedDraft: result.refinedDraft,
        titleOptions: result.titleOptions,
        summary: result.summary,
      })
    } catch (error) {
      console.error("Failed to refine blog:", error)
    }
  }, [compiledDraft, refineBlogMutation])

  const handleTitleSelect = useCallback((index: number) => {
    setSelectedTitleIndex(index)
  }, [])

  const handleContinueToSocial = useCallback(() => {
    if (selectedTitleIndex === null) {
      return
    }
    router.push(`/project/${id}/social`)
  }, [router, id, selectedTitleIndex])

  if (isLoadingResume) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <AnimatePresence mode="wait">
        {!refinementData ? (
          <motion.div
            key="draft-view"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            {/* Compiled Draft Display */}
            <Card>
              <CardHeader className="border-b">
                <div className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-primary" />
                  <CardTitle className="font-serif">Compiled Blog Draft</CardTitle>
                </div>
                <CardDescription>
                  Review your compiled draft before refinement. The refinement process will
                  generate title options and polish your content.
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                {compiledDraft ? (
                  <div className="prose prose-invert max-w-none">
                    <div className="p-6 rounded-lg bg-muted/50 border border-border">
                      <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed">
                        {compiledDraft}
                      </pre>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">
                      No compiled draft available. Please complete the draft stage first.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Refine Button */}
            {compiledDraft && (
              <div className="flex justify-end">
                <Button
                  onClick={handleRefineBlog}
                  disabled={refineBlogMutation.isPending}
                  size="lg"
                >
                  {refineBlogMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Refining...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 mr-2" />
                      Refine Blog
                    </>
                  )}
                </Button>
              </div>
            )}

            {/* Error Display */}
            {refineBlogMutation.isError && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 rounded-lg bg-destructive/10 border border-destructive/20"
              >
                <p className="text-sm text-destructive">
                  Failed to refine blog. Please try again.
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {refineBlogMutation.error?.message}
                </p>
              </motion.div>
            )}
          </motion.div>
        ) : (
          <motion.div
            key="refinement-view"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            {/* Summary Card */}
            <Card>
              <CardHeader className="border-b">
                <CardTitle className="font-serif">Blog Summary</CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <p className="text-muted-foreground leading-relaxed">
                  {refinementData.summary}
                </p>
              </CardContent>
            </Card>

            {/* Title Options */}
            <div className="space-y-4">
              <div>
                <h3 className="font-serif text-lg font-semibold mb-2">Select a Title</h3>
                <p className="text-sm text-muted-foreground">
                  Choose the title that best represents your blog post
                </p>
              </div>

              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {refinementData.titleOptions.map((option, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card
                      className={`cursor-pointer transition-all hover:border-primary/50 ${
                        selectedTitleIndex === index
                          ? "border-primary bg-primary/5"
                          : "border-border"
                      }`}
                      onClick={() => handleTitleSelect(index)}
                    >
                      <CardHeader>
                        <div className="flex items-start justify-between gap-2">
                          <CardTitle className="font-serif text-base leading-tight">
                            {option.title}
                          </CardTitle>
                          {selectedTitleIndex === index && (
                            <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0" />
                          )}
                        </div>
                        <CardDescription className="text-xs">
                          {option.style}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground">
                          {option.description}
                        </p>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Refined Draft */}
            <Card>
              <CardHeader className="border-b">
                <CardTitle className="font-serif">Refined Draft</CardTitle>
                <CardDescription>
                  Your polished blog post ready for social media promotion
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="prose prose-invert max-w-none">
                  <div className="p-6 rounded-lg bg-muted/50 border border-border">
                    <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed">
                      {refinementData.refinedDraft}
                    </pre>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="flex items-center justify-between">
              <Button variant="outline" onClick={() => setRefinementData(null)}>
                Regenerate Refinement
              </Button>
              <Button
                onClick={handleContinueToSocial}
                disabled={selectedTitleIndex === null}
                size="lg"
              >
                Continue to Social
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Loading Overlay */}
      <AnimatePresence>
        {refineBlogMutation.isPending && (
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
                Refining Your Blog
              </h3>
              <p className="text-sm text-muted-foreground">
                Generating title options and polishing your content...
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
