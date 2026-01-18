// ABOUTME: React Query hooks for project data fetching and mutations
// ABOUTME: Provides useProjects, useProject, useCreateProject, useDeleteProject hooks

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import {
  getProjects,
  getProject,
  createProject,
  deleteProject,
  getProjectStatus,
} from "@/lib/api/projects"
import { CreateProjectRequest, Project } from "@/types/project"

// Query key factory
export const projectKeys = {
  all: ["projects"] as const,
  lists: () => [...projectKeys.all, "list"] as const,
  details: () => [...projectKeys.all, "detail"] as const,
  detail: (id: string) => [...projectKeys.details(), id] as const,
  statuses: () => [...projectKeys.all, "status"] as const,
  status: (id: string) => [...projectKeys.statuses(), id] as const,
}

// List all projects
export function useProjects() {
  return useQuery({
    queryKey: projectKeys.lists(),
    queryFn: getProjects,
  })
}

// Get single project
export function useProject(id: string) {
  return useQuery({
    queryKey: projectKeys.detail(id),
    queryFn: () => getProject(id),
    enabled: !!id,
  })
}

// Get project status with polling when in progress
export function useProjectStatus(id: string, polling = false) {
  return useQuery({
    queryKey: projectKeys.status(id),
    queryFn: () => getProjectStatus(id),
    enabled: !!id,
    refetchInterval: polling ? 5000 : false,
  })
}

// Create project mutation
export function useCreateProject() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateProjectRequest) => createProject(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: projectKeys.lists() })
    },
  })
}

// Delete project mutation with optimistic update
export function useDeleteProject() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => deleteProject(id),
    onMutate: async (deletedId) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: projectKeys.lists() })

      // Snapshot the previous value
      const previousProjects = queryClient.getQueryData<Project[]>(
        projectKeys.lists()
      )

      // Optimistically update by removing the project
      if (previousProjects) {
        queryClient.setQueryData<Project[]>(
          projectKeys.lists(),
          previousProjects.filter((p) => p.id !== deletedId)
        )
      }

      return { previousProjects }
    },
    onError: (_err, _deletedId, context) => {
      // Rollback on error
      if (context?.previousProjects) {
        queryClient.setQueryData(projectKeys.lists(), context.previousProjects)
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: projectKeys.lists() })
    },
  })
}
