// ABOUTME: Zustand store for UI state management
// ABOUTME: Manages modal visibility states for new project and delete confirmation

import { create } from "zustand"

interface DeleteConfirmModal {
  open: boolean
  projectId: string | null
  projectName: string | null
}

interface UIState {
  newProjectModalOpen: boolean
  deleteConfirmModal: DeleteConfirmModal
  openNewProjectModal: () => void
  closeNewProjectModal: () => void
  openDeleteConfirmModal: (id: string, name: string) => void
  closeDeleteConfirmModal: () => void
}

export const useUIStore = create<UIState>((set) => ({
  newProjectModalOpen: false,
  deleteConfirmModal: {
    open: false,
    projectId: null,
    projectName: null,
  },
  openNewProjectModal: () => set({ newProjectModalOpen: true }),
  closeNewProjectModal: () => set({ newProjectModalOpen: false }),
  openDeleteConfirmModal: (id: string, name: string) =>
    set({
      deleteConfirmModal: {
        open: true,
        projectId: id,
        projectName: name,
      },
    }),
  closeDeleteConfirmModal: () =>
    set({
      deleteConfirmModal: {
        open: false,
        projectId: null,
        projectName: null,
      },
    }),
}))
