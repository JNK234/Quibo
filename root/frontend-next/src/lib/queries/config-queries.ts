// ABOUTME: React Query hooks for configuration data
// ABOUTME: Provides useModels and usePersonas hooks with caching

import { useQuery } from "@tanstack/react-query"
import { getModels, getPersonas } from "@/lib/api/config"

export const configKeys = {
  all: ["config"] as const,
  models: () => [...configKeys.all, "models"] as const,
  personas: () => [...configKeys.all, "personas"] as const,
}

export function useModels() {
  return useQuery({
    queryKey: configKeys.models(),
    queryFn: getModels,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

export function usePersonas() {
  return useQuery({
    queryKey: configKeys.personas(),
    queryFn: getPersonas,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}
