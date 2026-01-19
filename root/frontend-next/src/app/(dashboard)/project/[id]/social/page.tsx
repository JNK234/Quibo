// ABOUTME: Social media content generation page for creating platform-specific posts
// ABOUTME: Generates LinkedIn posts, Twitter threads, and newsletter content with copy functionality

"use client"

import { use, useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { Loader2, Sparkles, CheckCircle2, Linkedin, Twitter, Mail, Copy, Check } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useGenerateSocialContent } from "@/lib/queries/workflow-queries"
import { SocialContentData } from "@/types/workflow"

interface SocialPageProps {
  params: Promise<{ id: string }>
}

export default function SocialPage({ params }: SocialPageProps) {
  const { id } = use(params)
  const router = useRouter()
  const generateSocialMutation = useGenerateSocialContent(id, id)

  const [socialContent, setSocialContent] = useState<SocialContentData | null>(null)
  const [copiedStates, setCopiedStates] = useState<Record<string, boolean>>({})

  const handleGenerate = useCallback(async () => {
    try {
      const result = await generateSocialMutation.mutateAsync()
      setSocialContent(result.socialContent)
    } catch (error) {
      console.error("Failed to generate social content:", error)
    }
  }, [generateSocialMutation])

  const handleCopy = useCallback(async (key: string, text: string) => {
    await navigator.clipboard.writeText(text)
    setCopiedStates((prev) => ({ ...prev, [key]: true }))
    setTimeout(() => {
      setCopiedStates((prev) => ({ ...prev, [key]: false }))
    }, 2000)
  }, [])

  const handleCopyAll = useCallback(async () => {
    if (!socialContent) return

    const allContent = `
=== LINKEDIN POST ===

${socialContent.linkedin}

=== TWITTER THREAD ===

${socialContent.twitter.map((tweet, i) => `${i + 1}/${socialContent.twitter.length}\n${tweet}`).join("\n\n")}

=== NEWSLETTER CONTENT ===

${socialContent.newsletter}
    `.trim()

    await navigator.clipboard.writeText(allContent)
    setCopiedStates({ all: true })
    setTimeout(() => {
      setCopiedStates({})
    }, 2000)
  }, [socialContent])

  const handleCompleteProject = useCallback(() => {
    router.push(`/project/${id}`)
  }, [router, id])

  return (
    <div className="space-y-6">
      <AnimatePresence mode="wait">
        {!socialContent ? (
          <motion.div
            key="generate"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <Card>
              <CardHeader className="border-b">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-primary" />
                  <CardTitle className="font-serif">Social Media Content</CardTitle>
                </div>
                <CardDescription>
                  Generate platform-optimized content for LinkedIn, Twitter/X, and newsletters
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-6">
                  <div className="grid gap-4 sm:grid-cols-3">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-full bg-[#0A66C2]/10 flex items-center justify-center flex-shrink-0">
                        <Linkedin className="w-5 h-5 text-[#0A66C2]" />
                      </div>
                      <div>
                        <h3 className="font-medium text-sm mb-1">LinkedIn</h3>
                        <p className="text-xs text-muted-foreground">
                          Professional post optimized for engagement
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-full bg-[#1DA1F2]/10 flex items-center justify-center flex-shrink-0">
                        <Twitter className="w-5 h-5 text-[#1DA1F2]" />
                      </div>
                      <div>
                        <h3 className="font-medium text-sm mb-1">Twitter/X</h3>
                        <p className="text-xs text-muted-foreground">
                          Thread formatted for maximum reach
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <Mail className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-medium text-sm mb-1">Newsletter</h3>
                        <p className="text-xs text-muted-foreground">
                          Email-ready summary with hooks
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-center pt-4 border-t">
                    <Button
                      onClick={handleGenerate}
                      disabled={generateSocialMutation.isPending}
                      size="lg"
                    >
                      {generateSocialMutation.isPending ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Generating...
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4 mr-2" />
                          Generate Social Content
                        </>
                      )}
                    </Button>
                  </div>

                  {generateSocialMutation.isError && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-4 rounded-lg bg-destructive/10 border border-destructive/20"
                    >
                      <p className="text-sm text-destructive">
                        Failed to generate social content. Please try again.
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {generateSocialMutation.error?.message}
                      </p>
                    </motion.div>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ) : (
          <motion.div
            key="content"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            <Card>
              <CardHeader className="border-b">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-primary" />
                    <CardTitle className="font-serif">Social Content Generated</CardTitle>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCopyAll}
                  >
                    {copiedStates.all ? (
                      <>
                        <Check className="w-4 h-4 mr-2" />
                        Copied All
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4 mr-2" />
                        Copy All
                      </>
                    )}
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                <Tabs defaultValue="linkedin" className="w-full">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="linkedin" className="gap-2">
                      <Linkedin className="w-4 h-4" />
                      LinkedIn
                    </TabsTrigger>
                    <TabsTrigger value="twitter" className="gap-2">
                      <Twitter className="w-4 h-4" />
                      Twitter/X
                    </TabsTrigger>
                    <TabsTrigger value="newsletter" className="gap-2">
                      <Mail className="w-4 h-4" />
                      Newsletter
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="linkedin" className="space-y-4">
                    <div className="relative">
                      <div className="absolute top-4 right-4 z-10">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleCopy("linkedin", socialContent.linkedin)}
                        >
                          {copiedStates.linkedin ? (
                            <>
                              <Check className="w-4 h-4 mr-2" />
                              Copied
                            </>
                          ) : (
                            <>
                              <Copy className="w-4 h-4 mr-2" />
                              Copy
                            </>
                          )}
                        </Button>
                      </div>
                      <div className="p-6 rounded-lg border bg-card">
                        <div className="flex items-center gap-2 mb-4 pb-4 border-b">
                          <div className="w-8 h-8 rounded-full bg-[#0A66C2]/10 flex items-center justify-center">
                            <Linkedin className="w-4 h-4 text-[#0A66C2]" />
                          </div>
                          <span className="font-medium text-sm">LinkedIn Post</span>
                        </div>
                        <div className="prose prose-sm dark:prose-invert max-w-none whitespace-pre-wrap">
                          {socialContent.linkedin}
                        </div>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="twitter" className="space-y-4">
                    <div className="space-y-3">
                      {socialContent.twitter.map((tweet, index) => (
                        <div key={index} className="relative">
                          <div className="absolute top-4 right-4 z-10">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleCopy(`twitter-${index}`, tweet)}
                            >
                              {copiedStates[`twitter-${index}`] ? (
                                <>
                                  <Check className="w-4 h-4 mr-2" />
                                  Copied
                                </>
                              ) : (
                                <>
                                  <Copy className="w-4 h-4 mr-2" />
                                  Copy
                                </>
                              )}
                            </Button>
                          </div>
                          <div className="p-6 rounded-lg border bg-card">
                            <div className="flex items-center gap-2 mb-4 pb-4 border-b">
                              <div className="w-8 h-8 rounded-full bg-[#1DA1F2]/10 flex items-center justify-center">
                                <Twitter className="w-4 h-4 text-[#1DA1F2]" />
                              </div>
                              <span className="font-medium text-sm">
                                Tweet {index + 1} of {socialContent.twitter.length}
                              </span>
                            </div>
                            <div className="prose prose-sm dark:prose-invert max-w-none whitespace-pre-wrap">
                              {tweet}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </TabsContent>

                  <TabsContent value="newsletter" className="space-y-4">
                    <div className="relative">
                      <div className="absolute top-4 right-4 z-10">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleCopy("newsletter", socialContent.newsletter)}
                        >
                          {copiedStates.newsletter ? (
                            <>
                              <Check className="w-4 h-4 mr-2" />
                              Copied
                            </>
                          ) : (
                            <>
                              <Copy className="w-4 h-4 mr-2" />
                              Copy
                            </>
                          )}
                        </Button>
                      </div>
                      <div className="p-6 rounded-lg border bg-card">
                        <div className="flex items-center gap-2 mb-4 pb-4 border-b">
                          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                            <Mail className="w-4 h-4 text-primary" />
                          </div>
                          <span className="font-medium text-sm">Newsletter Content</span>
                        </div>
                        <div className="prose prose-sm dark:prose-invert max-w-none whitespace-pre-wrap">
                          {socialContent.newsletter}
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>

            <div className="flex items-center justify-between">
              <Button
                variant="outline"
                onClick={() => setSocialContent(null)}
              >
                Regenerate
              </Button>
              <Button onClick={handleCompleteProject} size="lg">
                <CheckCircle2 className="w-4 h-4 mr-2" />
                Complete Project
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Loading Overlay */}
      <AnimatePresence>
        {generateSocialMutation.isPending && (
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
                Generating Social Content
              </h3>
              <p className="text-sm text-muted-foreground">
                Creating platform-optimized content for LinkedIn, Twitter/X, and newsletters...
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
