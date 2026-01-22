// ABOUTME: Hook for managing operation status with loading messages, errors, and cancellation
// ABOUTME: Bridges useWorkflowStore with React Query mutation states

import { useCallback, useEffect, useRef } from "react"
import { useWorkflowStore } from "@/store/workflow-store"
import { OperationError } from "@/types/workflow"
import { ApiClientError } from "@/types/api"

interface UseOperationStatusOptions {
  key: string // Unique operation key (e.g., "generateOutline")
  loadingMessage?: string // Message to show while loading
}

interface UseOperationStatusReturn {
  isLoading: boolean
  loadingMessage: string | null
  error: OperationError | null
  retryCount: number
  setLoading: (message?: string) => void
  setError: (error: Error | ApiClientError) => void
  clear: () => void
  // Cancel support (LOAD-03)
  abortController: AbortController | null
  cancel: () => void
  getSignal: () => AbortSignal
}

/**
 * Hook for managing operation status with loading, error, and cancel support.
 *
 * Bridges the workflow store with React Query mutation state, providing:
 * - Unified loading/error state management
 * - User-friendly error messages
 * - Cancel capability via AbortController (LOAD-03)
 *
 * @example
 * const { setLoading, setError, clear, getSignal, cancel } = useOperationStatus({
 *   key: "generateOutline",
 *   loadingMessage: "Generating outline..."
 * })
 *
 * // In mutation
 * mutate({ signal: getSignal() })
 *
 * // Cancel button
 * <button onClick={cancel}>Cancel</button>
 */
export function useOperationStatus(
  options: UseOperationStatusOptions
): UseOperationStatusReturn {
  const { key, loadingMessage: defaultMessage = "Processing..." } = options

  const store = useWorkflowStore()
  const operation = store.getOperation(key)

  // AbortController for cancellation (LOAD-03)
  const abortControllerRef = useRef<AbortController | null>(null)

  const setLoading = useCallback(
    (message?: string) => {
      // Create fresh AbortController when starting operation
      abortControllerRef.current = new AbortController()
      store.setOperationLoading(key, message ?? defaultMessage)
    },
    [key, defaultMessage, store]
  )

  const setError = useCallback(
    (error: Error | ApiClientError) => {
      const operationError: OperationError = {
        message: getUserFriendlyMessage(error),
        details: getErrorDetails(error),
        code: error instanceof ApiClientError ? String(error.status) : undefined,
        retryable: isRetryable(error),
      }
      store.setOperationError(key, operationError)
    },
    [key, store]
  )

  const clear = useCallback(() => {
    abortControllerRef.current = null
    store.clearOperation(key)
  }, [key, store])

  // Cancel the current operation (LOAD-03)
  const cancel = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
      abortControllerRef.current = null
    }
    store.clearOperation(key)
  }, [key, store])

  // Get AbortSignal for passing to fetch/mutation
  const getSignal = useCallback(() => {
    if (!abortControllerRef.current) {
      abortControllerRef.current = new AbortController()
    }
    return abortControllerRef.current.signal
  }, [])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
    }
  }, [])

  return {
    isLoading: operation?.isLoading ?? false,
    loadingMessage: operation?.loadingMessage ?? null,
    error: operation?.error ?? null,
    retryCount: operation?.retryCount ?? 0,
    setLoading,
    setError,
    clear,
    abortController: abortControllerRef.current,
    cancel,
    getSignal,
  }
}

// Helper functions

function getUserFriendlyMessage(error: Error | ApiClientError): string {
  // Check for abort/cancel
  if (error.name === "AbortError") return "Operation cancelled"

  if (error instanceof ApiClientError) {
    if (error.status === 401) return "Please sign in to continue"
    if (error.status === 403) return "You don't have permission for this action"
    if (error.status === 404) return "The requested resource was not found"
    if (error.status >= 500) return "Server error. Please try again later."
  }

  if (typeof navigator !== "undefined" && !navigator.onLine)
    return "No internet connection. Check your network."

  return "Something went wrong. Please try again."
}

function getErrorDetails(error: Error | ApiClientError): string {
  if (error instanceof ApiClientError && error.details) {
    return typeof error.details === "string"
      ? error.details
      : JSON.stringify(error.details, null, 2)
  }
  return error.message
}

function isRetryable(error: Error | ApiClientError): boolean {
  // Cancelled operations are not retryable (user intentionally cancelled)
  if (error.name === "AbortError") return false

  if (error instanceof ApiClientError) {
    return error.status >= 500 // Only server errors are retryable
  }

  return true // Assume network errors are retryable
}
