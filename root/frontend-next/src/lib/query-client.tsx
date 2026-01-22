// ABOUTME: QueryClient factory with error retry configuration
// ABOUTME: Retries server errors with exponential backoff, does NOT retry client errors (4xx)

import { QueryClient } from "@tanstack/react-query"
import { ApiClientError } from "@/types/api"

// HTTP status codes that should NOT be retried (client errors)
const HTTP_STATUS_TO_NOT_RETRY = [400, 401, 403, 404, 422]

/**
 * Creates a QueryClient with proper error retry configuration.
 *
 * Retry behavior:
 * - Retries up to 3 times with exponential backoff
 * - Does NOT retry client errors (4xx)
 * - Does NOT retry when offline
 * - Mutations never retry (to prevent duplicate side effects)
 */
export function createQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: (failureCount, error) => {
          // Max 3 retries
          if (failureCount >= 3) return false

          // Don't retry client errors (4xx)
          if (error instanceof ApiClientError) {
            if (HTTP_STATUS_TO_NOT_RETRY.includes(error.status)) return false
          }

          // Don't retry network errors if offline
          if (typeof navigator !== "undefined" && !navigator.onLine) return false

          return true
        },
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
        staleTime: 5 * 60 * 1000, // 5 minutes default
        refetchOnWindowFocus: false,
      },
      mutations: {
        retry: false, // Mutations should NOT auto-retry (side effects)
      },
    },
  })
}
