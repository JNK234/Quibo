// ABOUTME: Zustand store for workflow operation status tracking
// ABOUTME: Manages loading/error states for AI operations across the blog creation workflow

import { create } from "zustand"
import { OperationError, OperationStatus } from "@/types/workflow"

interface WorkflowState {
  // Operation tracking - keyed by operation name (e.g., "generateOutline", "generateSection-0")
  operations: Record<string, OperationStatus>

  // Actions
  setOperationLoading: (key: string, message: string) => void
  setOperationError: (key: string, error: OperationError) => void
  clearOperation: (key: string) => void
  incrementRetryCount: (key: string) => void

  // Selectors
  getOperation: (key: string) => OperationStatus | undefined
  isAnyLoading: () => boolean
}

const DEFAULT_OPERATION_STATUS: OperationStatus = {
  isLoading: false,
  loadingMessage: null,
  error: null,
  retryCount: 0,
}

export const useWorkflowStore = create<WorkflowState>((set, get) => ({
  operations: {},

  setOperationLoading: (key: string, message: string) =>
    set((state) => ({
      operations: {
        ...state.operations,
        [key]: {
          ...DEFAULT_OPERATION_STATUS,
          ...(state.operations[key] || {}),
          isLoading: true,
          loadingMessage: message,
          error: null,
        },
      },
    })),

  setOperationError: (key: string, error: OperationError) =>
    set((state) => ({
      operations: {
        ...state.operations,
        [key]: {
          ...DEFAULT_OPERATION_STATUS,
          ...(state.operations[key] || {}),
          isLoading: false,
          loadingMessage: null,
          error,
        },
      },
    })),

  clearOperation: (key: string) =>
    set((state) => {
      const { [key]: _, ...rest } = state.operations
      return { operations: rest }
    }),

  incrementRetryCount: (key: string) =>
    set((state) => {
      const currentOp = state.operations[key] || DEFAULT_OPERATION_STATUS
      return {
        operations: {
          ...state.operations,
          [key]: {
            ...currentOp,
            retryCount: currentOp.retryCount + 1,
          },
        },
      }
    }),

  getOperation: (key: string) => get().operations[key],

  isAnyLoading: () =>
    Object.values(get().operations).some((op) => op.isLoading),
}))
