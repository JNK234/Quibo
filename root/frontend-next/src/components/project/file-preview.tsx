// ABOUTME: Standalone file preview component with collapsible content preview
// ABOUTME: Supports text files (.md, .py, .txt) with truncation and notebooks (.ipynb) with cell count summary

"use client"

import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { File, FileCode, FileText, Eye, EyeOff, X, Loader2 } from "lucide-react"

const MAX_PREVIEW_SIZE = 1024 * 1024 // 1MB
const TRUNCATE_LENGTH = 500

interface FilePreviewProps {
  file: File
  onRemove?: () => void
  disabled?: boolean
  className?: string
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

function formatNotebookSummary(content: string): string {
  try {
    const notebook = JSON.parse(content)
    const cells = notebook.cells || []
    const codeCells = cells.filter((c: { cell_type: string }) => c.cell_type === "code").length
    const markdownCells = cells.filter((c: { cell_type: string }) => c.cell_type === "markdown").length
    const rawCells = cells.filter((c: { cell_type: string }) => c.cell_type === "raw").length

    const parts = [`${cells.length} cells total`]
    if (codeCells > 0) parts.push(`${codeCells} code`)
    if (markdownCells > 0) parts.push(`${markdownCells} markdown`)
    if (rawCells > 0) parts.push(`${rawCells} raw`)

    return parts.join(" | ")
  } catch {
    return "Unable to parse notebook"
  }
}

export function FilePreview({
  file,
  onRemove,
  disabled = false,
  className,
}: FilePreviewProps) {
  const [showPreview, setShowPreview] = useState(false)
  const [previewContent, setPreviewContent] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const ext = file.name.toLowerCase().slice(file.name.lastIndexOf("."))
  const isNotebook = ext === ".ipynb"

  useEffect(() => {
    if (!showPreview) {
      setPreviewContent(null)
      return
    }

    // Check file size
    if (file.size > MAX_PREVIEW_SIZE) {
      setPreviewContent("File too large to preview")
      return
    }

    setIsLoading(true)

    const reader = new FileReader()
    reader.onload = (e) => {
      const text = e.target?.result as string

      if (isNotebook) {
        setPreviewContent(formatNotebookSummary(text))
      } else {
        // Text files: truncate if needed
        if (text.length > TRUNCATE_LENGTH) {
          setPreviewContent(text.slice(0, TRUNCATE_LENGTH) + "...")
        } else {
          setPreviewContent(text)
        }
      }
      setIsLoading(false)
    }
    reader.onerror = () => {
      setPreviewContent("Error reading file")
      setIsLoading(false)
    }
    reader.readAsText(file)

    return () => {
      reader.abort()
    }
  }, [showPreview, file, isNotebook])

  const fileSizeKB = (file.size / 1024).toFixed(1)

  return (
    <div className={cn("rounded-md border bg-card overflow-hidden", className)}>
      {/* Header row */}
      <div className="flex items-center justify-between px-3 py-2">
        <div className="flex items-center gap-2 min-w-0 flex-1">
          {getFileIcon(file.name)}
          <span className="text-sm truncate">{file.name}</span>
          <span className="text-xs text-muted-foreground flex-shrink-0">
            ({fileSizeKB} KB)
          </span>
        </div>
        <div className="flex items-center gap-1 flex-shrink-0">
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => setShowPreview(!showPreview)}
            aria-label={showPreview ? "Hide preview" : "Show preview"}
            disabled={disabled}
          >
            {showPreview ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </Button>
          {onRemove && (
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={onRemove}
              disabled={disabled}
              aria-label={`Remove ${file.name}`}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Collapsible preview area */}
      {showPreview && (
        <div className="border-t bg-muted/50 px-3 py-2">
          {isLoading ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Loading preview...</span>
            </div>
          ) : (
            <pre className="text-xs whitespace-pre-wrap break-words max-h-48 overflow-y-auto font-mono">
              {previewContent}
            </pre>
          )}
        </div>
      )}
    </div>
  )
}
