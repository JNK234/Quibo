// ABOUTME: Drag-and-drop file uploader for uploading .ipynb, .md, .py, and .txt files
// ABOUTME: Displays selected files with type icons, validates size (10MB), and shows toast errors

"use client"

import { useState, useCallback, useRef } from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Upload, File, FileCode, X, FileText } from "lucide-react"
import { toast } from "sonner"

const ACCEPTED_EXTENSIONS = [".ipynb", ".md", ".py", ".txt"]
const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB
const ACCEPTED_MIME_TYPES = [
  "application/x-ipynb+json",
  "application/json",
  "text/markdown",
  "text/x-python",
  "text/plain",
]

interface FileUploaderProps {
  onFilesSelected: (files: File[]) => void
  disabled?: boolean
  existingFiles?: string[]
}

function getFileIcon(filename: string) {
  const ext = filename.toLowerCase().slice(filename.lastIndexOf("."))
  switch (ext) {
    case ".ipynb":
      return <FileCode className="h-4 w-4 text-orange-500" />
    case ".md":
      return <FileText className="h-4 w-4 text-blue-500" />
    case ".py":
      return <FileCode className="h-4 w-4 text-green-500" />
    case ".txt":
      return <FileText className="h-4 w-4 text-gray-500" />
    default:
      return <File className="h-4 w-4 text-muted-foreground" />
  }
}

interface ValidationResult {
  valid: boolean
  reason?: string
}

function validateFile(file: File): ValidationResult {
  const ext = file.name.toLowerCase().slice(file.name.lastIndexOf("."))

  if (!ACCEPTED_EXTENSIONS.includes(ext)) {
    return { valid: false, reason: "Invalid file type. Accepted: .ipynb, .md, .py, .txt" }
  }

  if (file.size > MAX_FILE_SIZE) {
    return { valid: false, reason: "File too large. Maximum size: 10MB" }
  }

  return { valid: true }
}

export function FileUploader({
  onFilesSelected,
  disabled = false,
  existingFiles = [],
}: FileUploaderProps) {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [isDragOver, setIsDragOver] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFiles = useCallback(
    (files: FileList | null) => {
      if (!files || disabled) return

      const validFiles: File[] = []

      Array.from(files).forEach((file) => {
        const result = validateFile(file)
        if (result.valid) {
          validFiles.push(file)
        } else if (result.reason) {
          toast.error(result.reason)
        }
      })

      if (validFiles.length === 0) return

      const newFiles = [...selectedFiles, ...validFiles]
      setSelectedFiles(newFiles)
      onFilesSelected(newFiles)
    },
    [selectedFiles, onFilesSelected, disabled]
  )

  const handleDragOver = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault()
      e.stopPropagation()
      if (!disabled) {
        setIsDragOver(true)
      }
    },
    [disabled]
  )

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragOver(false)
  }, [])

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault()
      e.stopPropagation()
      setIsDragOver(false)
      handleFiles(e.dataTransfer.files)
    },
    [handleFiles]
  )

  const handleFileInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      handleFiles(e.target.files)
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    },
    [handleFiles]
  )

  const handleRemoveFile = useCallback(
    (index: number) => {
      const newFiles = selectedFiles.filter((_, i) => i !== index)
      setSelectedFiles(newFiles)
      onFilesSelected(newFiles)
    },
    [selectedFiles, onFilesSelected]
  )

  const handleBrowseClick = useCallback(() => {
    fileInputRef.current?.click()
  }, [])

  const allFiles = [...existingFiles, ...selectedFiles.map((f) => f.name)]

  return (
    <div className="space-y-4">
      <Card
        className={cn(
          "border-2 border-dashed transition-colors",
          isDragOver && !disabled
            ? "border-primary bg-primary/5"
            : "border-muted-foreground/25 hover:border-muted-foreground/50",
          disabled && "opacity-50 cursor-not-allowed"
        )}
      >
        <CardContent className="p-0">
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={cn(
              "flex flex-col items-center justify-center py-10 px-6 text-center",
              !disabled && "cursor-pointer"
            )}
            onClick={disabled ? undefined : handleBrowseClick}
            role="button"
            tabIndex={disabled ? -1 : 0}
            onKeyDown={(e) => {
              if (!disabled && (e.key === "Enter" || e.key === " ")) {
                e.preventDefault()
                handleBrowseClick()
              }
            }}
            aria-label="Upload files"
          >
            <div
              className={cn(
                "rounded-full p-3 mb-4 transition-colors",
                isDragOver && !disabled
                  ? "bg-primary/10 text-primary"
                  : "bg-muted text-muted-foreground"
              )}
            >
              <Upload className="h-6 w-6" />
            </div>
            <p className="text-sm font-medium text-foreground mb-1">
              {isDragOver ? "Drop files here" : "Drag and drop files here"}
            </p>
            <p className="text-xs text-muted-foreground mb-3">
              or click to browse
            </p>
            <p className="text-xs text-muted-foreground">
              Accepted formats: .ipynb, .md, .py, .txt
            </p>
            <p className="text-xs text-muted-foreground">
              Max 10MB per file
            </p>
          </div>
        </CardContent>
      </Card>

      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept={ACCEPTED_EXTENSIONS.join(",")}
        onChange={handleFileInputChange}
        className="hidden"
        disabled={disabled}
        aria-hidden="true"
      />

      {allFiles.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-medium text-foreground">
            Selected files ({allFiles.length})
          </p>
          <ul className="space-y-1">
            {existingFiles.map((filename, index) => (
              <li
                key={`existing-${index}`}
                className="flex items-center justify-between rounded-md border bg-muted/50 px-3 py-2"
              >
                <div className="flex items-center gap-2 min-w-0">
                  {getFileIcon(filename)}
                  <span className="text-sm truncate">{filename}</span>
                  <span className="text-xs text-muted-foreground">(uploaded)</span>
                </div>
              </li>
            ))}
            {selectedFiles.map((file, index) => (
              <li
                key={`new-${index}`}
                className="flex items-center justify-between rounded-md border bg-card px-3 py-2"
              >
                <div className="flex items-center gap-2 min-w-0">
                  {getFileIcon(file.name)}
                  <span className="text-sm truncate">{file.name}</span>
                  <span className="text-xs text-muted-foreground">
                    ({(file.size / 1024).toFixed(1)} KB)
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => handleRemoveFile(index)}
                  disabled={disabled}
                  aria-label={`Remove ${file.name}`}
                >
                  <X className="h-4 w-4" />
                </Button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
