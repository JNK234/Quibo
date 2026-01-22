// ABOUTME: Upload page for project file uploads with drag-and-drop support
// ABOUTME: Handles file selection, upload, and processing workflow steps

"use client"

import { use, useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Upload, Loader2, CheckCircle } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useProject } from "@/lib/queries/project-queries"
import { useUploadFiles, useProcessFiles } from "@/lib/queries/workflow-queries"
import { FileUploader } from "@/components/project/file-uploader"
import { InlineError } from "@/components/shared/inline-error"

interface UploadPageProps {
  params: Promise<{ id: string }>
}

export default function UploadPage({ params }: UploadPageProps) {
  const { id } = use(params)
  const router = useRouter()
  const { data: project } = useProject(id)

  // Local state for tracking workflow
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [uploadedFilePaths, setUploadedFilePaths] = useState<string[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [lastFailedOperation, setLastFailedOperation] = useState<"upload" | "process" | null>(null)

  // Mutations
  const uploadMutation = useUploadFiles()
  const processMutation = useProcessFiles(project?.name || "")

  const handleFilesSelected = (files: File[]) => {
    setSelectedFiles(files)
    setError(null)
  }

  const handleUploadFiles = async () => {
    if (selectedFiles.length === 0 || !project?.name) return

    setIsUploading(true)
    setError(null)

    try {
      const response = await uploadMutation.mutateAsync({
        projectName: project.name,
        files: selectedFiles,
        modelName: "gpt-4o-mini",
      })
      setUploadedFilePaths(response.files)
      setSelectedFiles([])
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to upload files. Please try again.")
      setLastFailedOperation("upload")
    } finally {
      setIsUploading(false)
    }
  }

  const handleProcessFiles = async () => {
    if (uploadedFilePaths.length === 0) return

    setIsProcessing(true)
    setError(null)

    try {
      await processMutation.mutateAsync({
        modelName: "gpt-4o-mini",
        filePaths: uploadedFilePaths,
      })
      router.push(`/project/${id}/outline`)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to process files. Please try again.")
      setLastFailedOperation("process")
      setIsProcessing(false)
    }
  }

  const isFilesUploaded = uploadedFilePaths.length > 0
  const canUpload = selectedFiles.length > 0 && !isUploading && !isFilesUploaded
  const canProcess = isFilesUploaded && !isProcessing

  return (
    <div className="space-y-6">
      {/* File Uploader */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <FileUploader
          onFilesSelected={handleFilesSelected}
          disabled={isUploading || isProcessing || isFilesUploaded}
          existingFiles={uploadedFilePaths.map((path) =>
            path.split("/").pop() || path
          )}
        />
      </motion.div>

      {/* Error Message */}
      {error && (
        <InlineError
          message={lastFailedOperation === "upload" ? "Failed to upload files" : "Failed to process files"}
          details={error}
          onRetry={() => {
            setError(null)
            if (lastFailedOperation === "upload") {
              handleUploadFiles()
            } else {
              handleProcessFiles()
            }
          }}
          onDismiss={() => {
            setError(null)
            setLastFailedOperation(null)
          }}
        />
      )}

      {/* Upload Success Message */}
      {isFilesUploaded && !isProcessing && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2 text-green-600 text-sm p-3 rounded-md bg-green-50 dark:bg-green-950/20"
        >
          <CheckCircle className="h-4 w-4 flex-shrink-0" />
          <span>
            {uploadedFilePaths.length} file{uploadedFilePaths.length > 1 ? "s" : ""} uploaded
            successfully. Click "Process Files" to continue.
          </span>
        </motion.div>
      )}

      {/* Action Buttons */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="flex items-center justify-end gap-3"
      >
        {!isFilesUploaded ? (
          <Button
            onClick={handleUploadFiles}
            disabled={!canUpload}
            className="min-w-[140px]"
          >
            {isUploading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="h-4 w-4 mr-2" />
                Upload Files
              </>
            )}
          </Button>
        ) : (
          <Button
            onClick={handleProcessFiles}
            disabled={!canProcess}
            className="min-w-[140px]"
          >
            {isProcessing ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              "Process Files"
            )}
          </Button>
        )}
      </motion.div>

      {/* Processing Status */}
      {isProcessing && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="border-primary/20 bg-primary/5">
            <CardContent className="flex items-center justify-center py-8">
              <div className="flex flex-col items-center gap-3 text-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <div>
                  <p className="font-medium">Processing your files...</p>
                  <p className="text-sm text-muted-foreground">
                    This may take a few moments while we analyze your content.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  )
}
