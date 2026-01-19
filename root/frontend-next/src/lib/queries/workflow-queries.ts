// ABOUTME: React Query hooks for workflow operations (upload, process, outline)
// ABOUTME: Provides useUploadFiles, useProcessFiles, useGenerateOutline, useResumeProject hooks

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import {
  uploadFiles,
  processFiles,
  generateOutline,
  generateSection,
  compileDraft,
  refineBlog,
  generateSocialContent,
} from "@/lib/api/workflow"
import { resumeProject, getProjectStatus } from "@/lib/api/projects"
import {
  UploadFilesResponse,
  ProcessFilesRequest,
  ProcessFilesResponse,
  GenerateOutlineRequest,
  GenerateOutlineResponse,
  GenerateSectionResponse,
  CompileDraftResponse,
  ResumeProjectResponse,
  RefineBlogRequest,
  RefineBlogResponse,
  GenerateSocialContentResponse,
} from "@/types/workflow"
import { ProjectStatusResponse } from "@/types/project"
import { projectKeys } from "./project-queries"

// Query key factory for workflow operations
export const workflowKeys = {
  all: ["workflow"] as const,
  resume: () => [...workflowKeys.all, "resume"] as const,
  resumeProject: (id: string) => [...workflowKeys.resume(), id] as const,
  uploads: () => [...workflowKeys.all, "upload"] as const,
  upload: (projectId: string) => [...workflowKeys.uploads(), projectId] as const,
  outlines: () => [...workflowKeys.all, "outline"] as const,
  outline: (projectId: string) => [...workflowKeys.outlines(), projectId] as const,
  sections: () => [...workflowKeys.all, "section"] as const,
  section: (projectId: string, sectionIndex: number) =>
    [...workflowKeys.sections(), projectId, sectionIndex] as const,
  drafts: () => [...workflowKeys.all, "draft"] as const,
  draft: (projectId: string) => [...workflowKeys.drafts(), projectId] as const,
  refinements: () => [...workflowKeys.all, "refinement"] as const,
  refinement: (projectId: string) => [...workflowKeys.refinements(), projectId] as const,
  socialContent: () => [...workflowKeys.all, "social"] as const,
  social: (projectId: string) => [...workflowKeys.socialContent(), projectId] as const,
}

// Upload files mutation
export function useUploadFiles() {
  const queryClient = useQueryClient()

  return useMutation<
    UploadFilesResponse,
    Error,
    { projectName: string; files: File[]; modelName?: string; persona?: string }
  >({
    mutationFn: ({ projectName, files, modelName, persona }) =>
      uploadFiles(projectName, files, modelName, persona),
    onSuccess: (data) => {
      // Invalidate projects list as new project may have been created
      queryClient.invalidateQueries({ queryKey: projectKeys.lists() })
      // Cache the upload response for the project
      queryClient.setQueryData(workflowKeys.upload(data.projectId), data)
    },
  })
}

// Process files mutation
export function useProcessFiles(projectName: string) {
  const queryClient = useQueryClient()

  return useMutation<
    ProcessFilesResponse,
    Error,
    { modelName: string; filePaths: string[] }
  >({
    mutationFn: ({ modelName, filePaths }) => processFiles(projectName, modelName, filePaths),
    onSuccess: () => {
      // Invalidate project status as processing state changed
      queryClient.invalidateQueries({ queryKey: projectKeys.status(projectName) })
      // Invalidate project details
      queryClient.invalidateQueries({ queryKey: projectKeys.detail(projectName) })
    },
  })
}

// Generate outline mutation
export function useGenerateOutline(projectId: string, projectName: string) {
  const queryClient = useQueryClient()

  return useMutation<GenerateOutlineResponse, Error, GenerateOutlineRequest>({
    mutationFn: (data: GenerateOutlineRequest) => generateOutline(projectName, data),
    onSuccess: (data) => {
      // Cache the outline for this project
      queryClient.setQueryData(workflowKeys.outline(projectId), data)
      // Invalidate project status as outline was generated
      queryClient.invalidateQueries({ queryKey: projectKeys.status(projectId) })
      // Invalidate resume data as it may have changed
      queryClient.invalidateQueries({ queryKey: workflowKeys.resumeProject(projectId) })
    },
  })
}

// Resume project query for restoring workflow state
export function useResumeProject(id: string) {
  return useQuery<ResumeProjectResponse, Error>({
    queryKey: workflowKeys.resumeProject(id),
    queryFn: () => resumeProject(id),
    enabled: !!id,
    staleTime: 1000 * 60 * 5, // Consider data fresh for 5 minutes
  })
}

// Project status query for polling during draft generation
export function useProjectStatus(id: string, options?: { refetchInterval?: number }) {
  return useQuery<ProjectStatusResponse, Error>({
    queryKey: projectKeys.status(id),
    queryFn: () => getProjectStatus(id),
    enabled: !!id,
    refetchInterval: options?.refetchInterval,
    staleTime: 1000, // Consider stale after 1 second for status polling
  })
}

// Generate section mutation
export function useGenerateSection(projectId: string, projectName: string) {
  const queryClient = useQueryClient()

  return useMutation<
    GenerateSectionResponse,
    Error,
    { sectionIndex: number; options?: { maxIterations?: number; qualityThreshold?: number } }
  >({
    mutationFn: ({ sectionIndex, options }) => generateSection(projectName, sectionIndex, options),
    onSuccess: (data, variables) => {
      // Cache the generated section
      queryClient.setQueryData(
        workflowKeys.section(projectId, variables.sectionIndex),
        data
      )
      // Invalidate project status as section was generated
      queryClient.invalidateQueries({ queryKey: projectKeys.status(projectId) })
      // Invalidate resume data as it may have changed
      queryClient.invalidateQueries({ queryKey: workflowKeys.resumeProject(projectId) })
    },
  })
}

// Compile draft mutation
export function useCompileDraft(projectId: string, projectName: string) {
  const queryClient = useQueryClient()

  return useMutation<CompileDraftResponse, Error, void>({
    mutationFn: () => compileDraft(projectName, projectId),
    onSuccess: (data) => {
      // Cache the compiled draft for this project
      queryClient.setQueryData(workflowKeys.draft(projectId), data)
      // Invalidate project status as draft was compiled
      queryClient.invalidateQueries({ queryKey: projectKeys.status(projectId) })
      // Invalidate resume data as it may have changed
      queryClient.invalidateQueries({ queryKey: workflowKeys.resumeProject(projectId) })
    },
  })
}

// Refine blog mutation
export function useRefineBlog(projectId: string, projectName: string) {
  const queryClient = useQueryClient()

  return useMutation<RefineBlogResponse, Error, { compiledDraft: string; options?: RefineBlogRequest }>({
    mutationFn: ({ compiledDraft, options }) => refineBlog(projectName, projectId, compiledDraft, options),
    onSuccess: (data) => {
      // Cache the refinement for this project
      queryClient.setQueryData(workflowKeys.refinement(projectId), data)
      // Invalidate project status as refinement was generated
      queryClient.invalidateQueries({ queryKey: projectKeys.status(projectId) })
      // Invalidate resume data as it may have changed
      queryClient.invalidateQueries({ queryKey: workflowKeys.resumeProject(projectId) })
    },
  })
}

// Generate social content mutation
export function useGenerateSocialContent(projectId: string, projectName: string) {
  const queryClient = useQueryClient()

  return useMutation<GenerateSocialContentResponse, Error, void>({
    mutationFn: () => generateSocialContent(projectName),
    onSuccess: (data) => {
      // Cache the social content for this project
      queryClient.setQueryData(workflowKeys.social(projectId), data)
      // Invalidate project status as social content was generated
      queryClient.invalidateQueries({ queryKey: projectKeys.status(projectId) })
      // Invalidate resume data as it may have changed
      queryClient.invalidateQueries({ queryKey: workflowKeys.resumeProject(projectId) })
    },
  })
}
