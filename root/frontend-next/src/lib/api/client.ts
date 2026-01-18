// ABOUTME: Base API client with authentication headers
// ABOUTME: Handles Supabase token injection and snake_case to camelCase transformation

import { createClient } from "@/lib/supabase/client"
import { ApiClientError } from "@/types/api"

// Validate required environment variables at module load
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL
const API_KEY = process.env.NEXT_PUBLIC_QUIBO_API_KEY

function getApiConfig() {
  if (!API_BASE_URL) {
    throw new Error("Missing required environment variable: NEXT_PUBLIC_API_BASE_URL")
  }
  if (!API_KEY) {
    throw new Error("Missing required environment variable: NEXT_PUBLIC_QUIBO_API_KEY")
  }
  return { API_BASE_URL, API_KEY }
}

// Snake case to camel case converter
function toCamelCase(str: string): string {
  return str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase())
}

function transformKeys(obj: unknown): unknown {
  if (Array.isArray(obj)) {
    return obj.map(transformKeys)
  }
  if (obj !== null && typeof obj === "object") {
    return Object.entries(obj as Record<string, unknown>).reduce(
      (acc, [key, value]) => {
        acc[toCamelCase(key)] = transformKeys(value)
        return acc
      },
      {} as Record<string, unknown>
    )
  }
  return obj
}

export async function apiClient<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const config = getApiConfig()
  const supabase = createClient()
  const { data: { session } } = await supabase.auth.getSession()

  const headers: HeadersInit = {
    "Content-Type": "application/json",
    "X-API-Key": config.API_KEY,
    ...(session?.access_token && {
      Authorization: `Bearer ${session.access_token}`,
    }),
    ...options.headers,
  }

  const response = await fetch(`${config.API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  })

  if (!response.ok) {
    let details: unknown
    try {
      details = await response.json()
    } catch {
      details = await response.text()
    }
    throw new ApiClientError(response.status, `API error: ${response.statusText}`, details)
  }

  // Handle 204 No Content
  if (response.status === 204) {
    return undefined as T
  }

  const data = await response.json()
  return transformKeys(data) as T
}
