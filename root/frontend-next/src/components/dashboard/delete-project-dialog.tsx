// ABOUTME: Confirmation dialog for deleting projects
// ABOUTME: Uses AlertDialog from shadcn with loading and error states

"use client"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { useUIStore } from "@/store/ui-store"
import { useDeleteProject } from "@/lib/queries/project-queries"
import { Loader2 } from "lucide-react"

export function DeleteProjectDialog() {
  const { deleteConfirmModal, closeDeleteConfirmModal } = useUIStore()
  const deleteProject = useDeleteProject()

  const handleDelete = async () => {
    if (!deleteConfirmModal.projectId) return

    try {
      await deleteProject.mutateAsync(deleteConfirmModal.projectId)
      closeDeleteConfirmModal()
    } catch {
      // Error handled by mutation state
    }
  }

  return (
    <AlertDialog
      open={deleteConfirmModal.open}
      onOpenChange={(open: boolean) => !open && closeDeleteConfirmModal()}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Project</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete{" "}
            <span className="font-medium text-foreground">
              {deleteConfirmModal.projectName}
            </span>
            ? This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>

        {deleteProject.isError && (
          <div className="p-3 rounded-md bg-destructive/10 text-destructive text-sm">
            Failed to delete project. Please try again.
          </div>
        )}

        <AlertDialogFooter>
          <AlertDialogCancel disabled={deleteProject.isPending}>
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={deleteProject.isPending}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {deleteProject.isPending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Deleting...
              </>
            ) : (
              "Delete"
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
