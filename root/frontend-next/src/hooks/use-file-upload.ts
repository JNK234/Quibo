// ABOUTME: Custom hook for file uploads with real-time progress tracking
// ABOUTME: Wraps uploadFilesWithProgress with React Query mutation and progress state

import { useState, useCallback } from "react"
import { useMutation } from "@tanstack/react-query"
import { uploadFilesWithProgress } from "@/lib/api/workflow"
import { UploadFilesResponse } from "@/types/workflow"

interface UseFileUploadOptions {
  projectName: string
  modelName?: string
  persona?: string
  onSuccess?: (response: UploadFilesResponse) => void
  onError?: (error: Error) => void
}

interface UseFileUploadReturn {
  upload: (files: File[]) => void
  isUploading: boolean
  progress: number
  error: Error | null
  isError: boolean
  isSuccess: boolean
  data: UploadFilesResponse | undefined
  reset: () => void
}

/**
 * Hook for uploading files with real-time progress tracking
 *
 * Uses XMLHttpRequest under the hood to access upload.onprogress events,
 * wrapped in React Query mutation for state management.
 *
 * @example
 * ```tsx
 * const { upload, progress, isUploading } = useFileUpload({
 *   projectName: "my-project",
 *   onSuccess: (response) => console.log("Uploaded:", response.files),
 * })
 *
 * // In JSX
 * <button onClick={() => upload(files)}>
 *   {isUploading ? `Uploading... ${progress}%` : "Upload"}
 * </button>
 * ```
 */
export function useFileUpload(options: UseFileUploadOptions): UseFileUploadReturn {
  const { projectName, modelName, persona, onSuccess, onError } = options
  const [progress, setProgress] = useState(0)

  const mutation = useMutation({
    mutationFn: async (files: File[]) => {
      // Reset progress at start
      setProgress(0)

      return uploadFilesWithProgress(
        projectName,
        files,
        (percent) => setProgress(percent),
        { modelName, persona }
      )
    },
    onSuccess: (response) => {
      // Ensure progress shows 100% on completion
      setProgress(100)
      onSuccess?.(response)
    },
    onError: (error: Error) => {
      // Reset progress on error
      setProgress(0)
      onError?.(error)
    },
  })

  const upload = useCallback(
    (files: File[]) => {
      mutation.mutate(files)
    },
    [mutation]
  )

  const reset = useCallback(() => {
    setProgress(0)
    mutation.reset()
  }, [mutation])

  return {
    upload,
    isUploading: mutation.isPending,
    progress,
    error: mutation.error,
    isError: mutation.isError,
    isSuccess: mutation.isSuccess,
    data: mutation.data,
    reset,
  }
}
