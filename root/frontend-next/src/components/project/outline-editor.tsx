// ABOUTME: Drag-and-drop outline editor for managing blog outline sections
// ABOUTME: Supports inline editing, reordering, adding/deleting sections and subsections

"use client"

import { useState, useCallback, useRef, useEffect } from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { GripVertical, Trash2, Plus, Edit2, Check, X } from "lucide-react"
import type { OutlineData, OutlineSectionData, OutlineSubsection } from "@/types/workflow"

interface OutlineEditorProps {
  outline: OutlineData
  onOutlineChange: (outline: OutlineData) => void
  disabled?: boolean
}

interface EditingState {
  type: "section" | "subsection"
  sectionId: string
  subsectionId?: string
  field: "title" | "description"
}

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

export function OutlineEditor({
  outline,
  onOutlineChange,
  disabled = false,
}: OutlineEditorProps) {
  const [draggedItem, setDraggedItem] = useState<{
    type: "section" | "subsection"
    sectionId: string
    subsectionId?: string
  } | null>(null)
  const [dragOverItem, setDragOverItem] = useState<{
    type: "section" | "subsection"
    sectionId: string
    subsectionId?: string
  } | null>(null)
  const [editing, setEditing] = useState<EditingState | null>(null)
  const [editValue, setEditValue] = useState("")
  const editInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (editing && editInputRef.current) {
      editInputRef.current.focus()
      editInputRef.current.select()
    }
  }, [editing])

  const updateOutline = useCallback(
    (newSections: OutlineSectionData[]) => {
      onOutlineChange({
        ...outline,
        sections: newSections,
      })
    },
    [outline, onOutlineChange]
  )

  const handleDragStart = useCallback(
    (
      e: React.DragEvent,
      type: "section" | "subsection",
      sectionId: string,
      subsectionId?: string
    ) => {
      if (disabled) return
      e.dataTransfer.effectAllowed = "move"
      setDraggedItem({ type, sectionId, subsectionId })
    },
    [disabled]
  )

  const handleDragOver = useCallback(
    (
      e: React.DragEvent,
      type: "section" | "subsection",
      sectionId: string,
      subsectionId?: string
    ) => {
      e.preventDefault()
      if (disabled || !draggedItem) return

      // Only allow dragging sections to section positions and subsections to subsection positions
      if (draggedItem.type !== type) return

      // For subsections, only allow reordering within the same section
      if (
        type === "subsection" &&
        draggedItem.sectionId !== sectionId
      ) {
        return
      }

      setDragOverItem({ type, sectionId, subsectionId })
    },
    [disabled, draggedItem]
  )

  const handleDragLeave = useCallback(() => {
    setDragOverItem(null)
  }, [])

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      if (disabled || !draggedItem || !dragOverItem) {
        setDraggedItem(null)
        setDragOverItem(null)
        return
      }

      if (draggedItem.type === "section") {
        const fromIndex = outline.sections.findIndex(
          (s) => s.id === draggedItem.sectionId
        )
        const toIndex = outline.sections.findIndex(
          (s) => s.id === dragOverItem.sectionId
        )

        if (fromIndex !== -1 && toIndex !== -1 && fromIndex !== toIndex) {
          const newSections = [...outline.sections]
          const [removed] = newSections.splice(fromIndex, 1)
          newSections.splice(toIndex, 0, removed)
          updateOutline(newSections)
        }
      } else if (draggedItem.type === "subsection") {
        const section = outline.sections.find(
          (s) => s.id === draggedItem.sectionId
        )
        if (!section?.subsections) {
          setDraggedItem(null)
          setDragOverItem(null)
          return
        }

        const fromIndex = section.subsections.findIndex(
          (s) => s.id === draggedItem.subsectionId
        )
        const toIndex = section.subsections.findIndex(
          (s) => s.id === dragOverItem.subsectionId
        )

        if (fromIndex !== -1 && toIndex !== -1 && fromIndex !== toIndex) {
          const newSubsections = [...section.subsections]
          const [removed] = newSubsections.splice(fromIndex, 1)
          newSubsections.splice(toIndex, 0, removed)

          const newSections = outline.sections.map((s) =>
            s.id === section.id ? { ...s, subsections: newSubsections } : s
          )
          updateOutline(newSections)
        }
      }

      setDraggedItem(null)
      setDragOverItem(null)
    },
    [disabled, draggedItem, dragOverItem, outline.sections, updateOutline]
  )

  const handleDragEnd = useCallback(() => {
    setDraggedItem(null)
    setDragOverItem(null)
  }, [])

  const startEditing = useCallback(
    (
      type: "section" | "subsection",
      sectionId: string,
      field: "title" | "description",
      currentValue: string,
      subsectionId?: string
    ) => {
      if (disabled) return
      setEditing({ type, sectionId, subsectionId, field })
      setEditValue(currentValue)
    },
    [disabled]
  )

  const cancelEditing = useCallback(() => {
    setEditing(null)
    setEditValue("")
  }, [])

  const saveEditing = useCallback(() => {
    if (!editing) return

    const trimmedValue = editValue.trim()
    if (!trimmedValue) {
      cancelEditing()
      return
    }

    if (editing.type === "section") {
      const newSections = outline.sections.map((s) =>
        s.id === editing.sectionId
          ? { ...s, [editing.field]: trimmedValue }
          : s
      )
      updateOutline(newSections)
    } else if (editing.type === "subsection" && editing.subsectionId) {
      const newSections = outline.sections.map((s) =>
        s.id === editing.sectionId
          ? {
              ...s,
              subsections: s.subsections?.map((sub) =>
                sub.id === editing.subsectionId
                  ? { ...sub, [editing.field]: trimmedValue }
                  : sub
              ),
            }
          : s
      )
      updateOutline(newSections)
    }

    cancelEditing()
  }, [editing, editValue, outline.sections, updateOutline, cancelEditing])

  const handleEditKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter") {
        e.preventDefault()
        saveEditing()
      } else if (e.key === "Escape") {
        cancelEditing()
      }
    },
    [saveEditing, cancelEditing]
  )

  const addSection = useCallback(() => {
    if (disabled) return

    const newSection: OutlineSectionData = {
      id: generateId(),
      title: "New Section",
      description: "Section description",
      subsections: [],
      order: outline.sections.length,
    }

    updateOutline([...outline.sections, newSection])
  }, [disabled, outline.sections, updateOutline])

  const deleteSection = useCallback(
    (sectionId: string) => {
      if (disabled) return
      updateOutline(outline.sections.filter((s) => s.id !== sectionId))
    },
    [disabled, outline.sections, updateOutline]
  )

  const addSubsection = useCallback(
    (sectionId: string) => {
      if (disabled) return

      const newSubsection: OutlineSubsection = {
        id: generateId(),
        title: "New Subsection",
        description: "Subsection description",
      }

      const newSections = outline.sections.map((s) =>
        s.id === sectionId
          ? { ...s, subsections: [...(s.subsections || []), newSubsection] }
          : s
      )
      updateOutline(newSections)
    },
    [disabled, outline.sections, updateOutline]
  )

  const deleteSubsection = useCallback(
    (sectionId: string, subsectionId: string) => {
      if (disabled) return

      const newSections = outline.sections.map((s) =>
        s.id === sectionId
          ? {
              ...s,
              subsections: s.subsections?.filter(
                (sub) => sub.id !== subsectionId
              ),
            }
          : s
      )
      updateOutline(newSections)
    },
    [disabled, outline.sections, updateOutline]
  )

  const isEditingItem = (
    type: "section" | "subsection",
    sectionId: string,
    field: "title" | "description",
    subsectionId?: string
  ) => {
    if (!editing) return false
    return (
      editing.type === type &&
      editing.sectionId === sectionId &&
      editing.field === field &&
      editing.subsectionId === subsectionId
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Outline Sections</h3>
        <Button
          variant="outline"
          size="sm"
          onClick={addSection}
          disabled={disabled}
        >
          <Plus className="h-4 w-4 mr-1" />
          Add Section
        </Button>
      </div>

      {outline.sections.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            No sections yet. Click &quot;Add Section&quot; to get started.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {outline.sections.map((section, sectionIndex) => (
            <Card
              key={section.id}
              className={cn(
                "transition-all",
                draggedItem?.type === "section" &&
                  draggedItem.sectionId === section.id &&
                  "opacity-50",
                dragOverItem?.type === "section" &&
                  dragOverItem.sectionId === section.id &&
                  "ring-2 ring-primary"
              )}
              draggable={!disabled && !editing}
              onDragStart={(e) => handleDragStart(e, "section", section.id)}
              onDragOver={(e) => handleDragOver(e, "section", section.id)}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onDragEnd={handleDragEnd}
            >
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div
                    className={cn(
                      "mt-1 cursor-grab text-muted-foreground hover:text-foreground",
                      disabled && "cursor-not-allowed opacity-50"
                    )}
                    aria-label="Drag to reorder"
                  >
                    <GripVertical className="h-5 w-5" />
                  </div>

                  <div className="flex-1 min-w-0 space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-muted-foreground">
                        {sectionIndex + 1}.
                      </span>
                      {isEditingItem("section", section.id, "title") ? (
                        <div className="flex items-center gap-1 flex-1">
                          <Input
                            ref={editInputRef}
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            onKeyDown={handleEditKeyDown}
                            onBlur={saveEditing}
                            className="h-8"
                          />
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            onClick={saveEditing}
                            aria-label="Save"
                          >
                            <Check className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            onClick={cancelEditing}
                            aria-label="Cancel"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ) : (
                        <button
                          className={cn(
                            "text-left font-semibold text-foreground hover:text-primary flex items-center gap-1 group",
                            disabled && "pointer-events-none"
                          )}
                          onClick={() =>
                            startEditing(
                              "section",
                              section.id,
                              "title",
                              section.title
                            )
                          }
                          disabled={disabled}
                        >
                          {section.title}
                          <Edit2 className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </button>
                      )}
                    </div>

                    {isEditingItem("section", section.id, "description") ? (
                      <div className="flex items-center gap-1">
                        <Input
                          ref={editInputRef}
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          onKeyDown={handleEditKeyDown}
                          onBlur={saveEditing}
                          className="h-8 text-sm"
                        />
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={saveEditing}
                          aria-label="Save"
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={cancelEditing}
                          aria-label="Cancel"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : (
                      <button
                        className={cn(
                          "text-left text-sm text-muted-foreground hover:text-foreground flex items-center gap-1 group",
                          disabled && "pointer-events-none"
                        )}
                        onClick={() =>
                          startEditing(
                            "section",
                            section.id,
                            "description",
                            section.description
                          )
                        }
                        disabled={disabled}
                      >
                        {section.description}
                        <Edit2 className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </button>
                    )}

                    {section.subsections && section.subsections.length > 0 && (
                      <div className="ml-4 mt-3 space-y-2 border-l-2 border-muted pl-4">
                        {section.subsections.map((subsection, subIndex) => (
                          <div
                            key={subsection.id}
                            className={cn(
                              "flex items-start gap-2 py-2 px-2 rounded-md transition-all",
                              draggedItem?.type === "subsection" &&
                                draggedItem.subsectionId === subsection.id &&
                                "opacity-50 bg-muted",
                              dragOverItem?.type === "subsection" &&
                                dragOverItem.subsectionId === subsection.id &&
                                "ring-2 ring-primary bg-primary/5"
                            )}
                            draggable={!disabled && !editing}
                            onDragStart={(e) =>
                              handleDragStart(
                                e,
                                "subsection",
                                section.id,
                                subsection.id
                              )
                            }
                            onDragOver={(e) =>
                              handleDragOver(
                                e,
                                "subsection",
                                section.id,
                                subsection.id
                              )
                            }
                            onDragLeave={handleDragLeave}
                            onDrop={handleDrop}
                            onDragEnd={handleDragEnd}
                          >
                            <div
                              className={cn(
                                "mt-0.5 cursor-grab text-muted-foreground hover:text-foreground",
                                disabled && "cursor-not-allowed opacity-50"
                              )}
                              aria-label="Drag to reorder"
                            >
                              <GripVertical className="h-4 w-4" />
                            </div>

                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-medium text-muted-foreground">
                                  {sectionIndex + 1}.{subIndex + 1}
                                </span>
                                {isEditingItem(
                                  "subsection",
                                  section.id,
                                  "title",
                                  subsection.id
                                ) ? (
                                  <div className="flex items-center gap-1 flex-1">
                                    <Input
                                      ref={editInputRef}
                                      value={editValue}
                                      onChange={(e) =>
                                        setEditValue(e.target.value)
                                      }
                                      onKeyDown={handleEditKeyDown}
                                      onBlur={saveEditing}
                                      className="h-7 text-sm"
                                    />
                                    <Button
                                      variant="ghost"
                                      size="icon-sm"
                                      onClick={saveEditing}
                                      aria-label="Save"
                                    >
                                      <Check className="h-3 w-3" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="icon-sm"
                                      onClick={cancelEditing}
                                      aria-label="Cancel"
                                    >
                                      <X className="h-3 w-3" />
                                    </Button>
                                  </div>
                                ) : (
                                  <button
                                    className={cn(
                                      "text-left text-sm font-medium text-foreground hover:text-primary flex items-center gap-1 group",
                                      disabled && "pointer-events-none"
                                    )}
                                    onClick={() =>
                                      startEditing(
                                        "subsection",
                                        section.id,
                                        "title",
                                        subsection.title,
                                        subsection.id
                                      )
                                    }
                                    disabled={disabled}
                                  >
                                    {subsection.title}
                                    <Edit2 className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                                  </button>
                                )}
                              </div>

                              {isEditingItem(
                                "subsection",
                                section.id,
                                "description",
                                subsection.id
                              ) ? (
                                <div className="flex items-center gap-1 mt-1">
                                  <Input
                                    ref={editInputRef}
                                    value={editValue}
                                    onChange={(e) =>
                                      setEditValue(e.target.value)
                                    }
                                    onKeyDown={handleEditKeyDown}
                                    onBlur={saveEditing}
                                    className="h-7 text-xs"
                                  />
                                  <Button
                                    variant="ghost"
                                    size="icon-sm"
                                    onClick={saveEditing}
                                    aria-label="Save"
                                  >
                                    <Check className="h-3 w-3" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon-sm"
                                    onClick={cancelEditing}
                                    aria-label="Cancel"
                                  >
                                    <X className="h-3 w-3" />
                                  </Button>
                                </div>
                              ) : (
                                <button
                                  className={cn(
                                    "text-left text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 group mt-0.5",
                                    disabled && "pointer-events-none"
                                  )}
                                  onClick={() =>
                                    startEditing(
                                      "subsection",
                                      section.id,
                                      "description",
                                      subsection.description,
                                      subsection.id
                                    )
                                  }
                                  disabled={disabled}
                                >
                                  {subsection.description}
                                  <Edit2 className="h-2.5 w-2.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                                </button>
                              )}
                            </div>

                            <Button
                              variant="ghost"
                              size="icon-sm"
                              onClick={() =>
                                deleteSubsection(section.id, subsection.id)
                              }
                              disabled={disabled}
                              className="text-muted-foreground hover:text-destructive"
                              aria-label={`Delete subsection ${subsection.title}`}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => addSubsection(section.id)}
                      disabled={disabled}
                      className="text-muted-foreground hover:text-foreground mt-2"
                    >
                      <Plus className="h-3 w-3 mr-1" />
                      Add Subsection
                    </Button>
                  </div>

                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => deleteSection(section.id)}
                    disabled={disabled}
                    className="text-muted-foreground hover:text-destructive"
                    aria-label={`Delete section ${section.title}`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
