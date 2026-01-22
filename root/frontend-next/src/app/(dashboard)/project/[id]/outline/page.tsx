// ABOUTME: Outline generation page for configuring and generating blog outlines
// ABOUTME: Provides form inputs for guidelines, length, style and displays editable outline

"use client"

import { use, useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { Loader2, Sparkles, ArrowRight, Settings2 } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useGenerateOutline } from "@/lib/queries/workflow-queries"
import { useProject } from "@/lib/queries/project-queries"
import { OutlineEditor } from "@/components/project/outline-editor"
import { InlineError } from "@/components/shared/inline-error"
import { OutlineData, GenerateOutlineRequest } from "@/types/workflow"

interface OutlinePageProps {
  params: Promise<{ id: string }>
}

type LengthPreference = "auto" | "short" | "medium" | "long" | "custom"
type WritingStyle = "balanced" | "concise" | "comprehensive"

export default function OutlinePage({ params }: OutlinePageProps) {
  const { id } = use(params)
  const router = useRouter()
  const { data: project } = useProject(id)
  const projectName = project?.name || ""
  const generateOutlineMutation = useGenerateOutline(id, projectName)

  const [userGuidelines, setUserGuidelines] = useState("")
  const [lengthPreference, setLengthPreference] = useState<LengthPreference>("auto")
  const [customLength, setCustomLength] = useState<number>(2000)
  const [writingStyle, setWritingStyle] = useState<WritingStyle>("balanced")
  const [outline, setOutline] = useState<OutlineData | null>(null)

  const handleGenerateOutline = useCallback(async () => {
    const request: GenerateOutlineRequest = {
      modelName: "gpt-4o",
      userGuidelines: userGuidelines || undefined,
      lengthPreference,
      customLength: lengthPreference === "custom" ? customLength : undefined,
      writingStyle,
    }

    try {
      const result = await generateOutlineMutation.mutateAsync(request)
      setOutline(result.outline)
    } catch (error) {
      console.error("Failed to generate outline:", error)
    }
  }, [
    userGuidelines,
    lengthPreference,
    customLength,
    writingStyle,
    generateOutlineMutation,
  ])

  const handleOutlineChange = useCallback((updatedOutline: OutlineData) => {
    setOutline(updatedOutline)
  }, [])

  const handleContinueToDraft = useCallback(() => {
    router.push(`/project/${id}/draft`)
  }, [router, id])

  return (
    <div className="space-y-6">
      <AnimatePresence mode="wait">
        {!outline ? (
          <motion.div
            key="form"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <Card>
              <CardHeader className="border-b">
                <div className="flex items-center gap-2">
                  <Settings2 className="w-5 h-5 text-primary" />
                  <CardTitle className="font-serif">Outline Settings</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="pt-6 space-y-6">
                {/* User Guidelines */}
                <div className="space-y-2">
                  <Label htmlFor="guidelines">User Guidelines</Label>
                  <Textarea
                    id="guidelines"
                    placeholder="Enter any specific guidelines or instructions for generating the outline. For example: 'Focus on practical examples', 'Include code snippets for each section', 'Target beginner audience'..."
                    value={userGuidelines}
                    onChange={(e) => setUserGuidelines(e.target.value)}
                    rows={4}
                    className="resize-none"
                  />
                  <p className="text-xs text-muted-foreground">
                    Optional. Provide specific instructions to guide the outline generation.
                  </p>
                </div>

                {/* Length Preference and Custom Length */}
                <div className="grid gap-6 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="length">Length Preference</Label>
                    <Select
                      value={lengthPreference}
                      onValueChange={(value) =>
                        setLengthPreference(value as LengthPreference)
                      }
                    >
                      <SelectTrigger id="length" className="w-full">
                        <SelectValue placeholder="Select length" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="auto">Auto (Recommended)</SelectItem>
                        <SelectItem value="short">Short (~1,000 words)</SelectItem>
                        <SelectItem value="medium">Medium (~2,000 words)</SelectItem>
                        <SelectItem value="long">Long (~4,000 words)</SelectItem>
                        <SelectItem value="custom">Custom</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground">
                      Auto adjusts based on content complexity.
                    </p>
                  </div>

                  {/* Custom Length Input - Only shown when custom is selected */}
                  <AnimatePresence>
                    {lengthPreference === "custom" && (
                      <motion.div
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -10 }}
                        transition={{ duration: 0.2 }}
                        className="space-y-2"
                      >
                        <Label htmlFor="customLength">Custom Word Count</Label>
                        <Input
                          id="customLength"
                          type="number"
                          min={500}
                          max={10000}
                          step={100}
                          value={customLength}
                          onChange={(e) =>
                            setCustomLength(parseInt(e.target.value, 10) || 2000)
                          }
                          placeholder="Enter word count"
                        />
                        <p className="text-xs text-muted-foreground">
                          Target word count (500 - 10,000).
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Writing Style */}
                <div className="space-y-2">
                  <Label htmlFor="style">Writing Style</Label>
                  <Select
                    value={writingStyle}
                    onValueChange={(value) => setWritingStyle(value as WritingStyle)}
                  >
                    <SelectTrigger id="style" className="w-full sm:w-[300px]">
                      <SelectValue placeholder="Select style" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="balanced">
                        Balanced - Clear and engaging
                      </SelectItem>
                      <SelectItem value="concise">
                        Concise - Direct and to the point
                      </SelectItem>
                      <SelectItem value="comprehensive">
                        Comprehensive - Detailed and thorough
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    Choose the tone and depth of the generated content.
                  </p>
                </div>

                {/* Generate Button */}
                <div className="flex justify-end pt-4 border-t">
                  <Button
                    onClick={handleGenerateOutline}
                    disabled={generateOutlineMutation.isPending}
                    size="lg"
                  >
                    {generateOutlineMutation.isPending ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 mr-2" />
                        Generate Outline
                      </>
                    )}
                  </Button>
                </div>

                {/* Error Display */}
                {generateOutlineMutation.isError && (
                  <InlineError
                    message="Failed to generate outline. Please try again."
                    details={generateOutlineMutation.error?.message}
                    onRetry={handleGenerateOutline}
                    onDismiss={() => generateOutlineMutation.reset()}
                  />
                )}
              </CardContent>
            </Card>
          </motion.div>
        ) : (
          <motion.div
            key="outline"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            {/* Outline Editor */}
            <OutlineEditor outline={outline} onOutlineChange={handleOutlineChange} />

            {/* Action Buttons */}
            <div className="flex items-center justify-between">
              <Button
                variant="outline"
                onClick={() => setOutline(null)}
              >
                Regenerate Outline
              </Button>
              <Button onClick={handleContinueToDraft} size="lg">
                Continue to Draft
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Loading Overlay */}
      <AnimatePresence>
        {generateOutlineMutation.isPending && (
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
                Generating Outline
              </h3>
              <p className="text-sm text-muted-foreground">
                Analyzing your content and creating a structured outline...
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
