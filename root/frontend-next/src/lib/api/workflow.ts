// ABOUTME: Workflow API functions for file upload, processing, and outline generation
// ABOUTME: Uses FormData for multipart requests with proper auth headers

import { createClient } from "@/lib/supabase/client"
import { ApiClientError } from "@/types/api"
import {
  UploadFilesResponse,
  ProcessFilesResponse,
  GenerateOutlineRequest,
  GenerateOutlineResponse,
  GenerateSectionResponse,
  CompileDraftResponse,
  RefineBlogRequest,
  RefineBlogResponse,
  GenerateSocialContentResponse,
} from "@/types/workflow"

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

/**
 * API client for FormData requests (multipart/form-data)
 * Does not set Content-Type header - browser sets it with boundary automatically
 */
async function apiFormData<T>(
  endpoint: string,
  formData: FormData,
  options: Omit<RequestInit, "body"> = {}
): Promise<T> {
  const config = getApiConfig()
  const supabase = createClient()
  const { data: { session } } = await supabase.auth.getSession()

  // Do NOT set Content-Type for FormData - browser sets it with boundary
  const headers: HeadersInit = {
    "X-API-Key": config.API_KEY,
    ...(session?.access_token && {
      Authorization: `Bearer ${session.access_token}`,
    }),
    ...options.headers,
  }

  const response = await fetch(`${config.API_BASE_URL}${endpoint}`, {
    method: "POST",
    ...options,
    headers,
    body: formData,
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

  if (response.status === 204) {
    return undefined as T
  }

  const data = await response.json()
  return transformKeys(data) as T
}

/**
 * Upload files to a project
 * POST /upload/{project_name} with multipart form data
 */
export async function uploadFiles(
  projectName: string,
  files: File[],
  modelName?: string,
  persona?: string
): Promise<UploadFilesResponse> {
  const formData = new FormData()

  for (const file of files) {
    formData.append("files", file)
  }

  if (modelName) {
    formData.append("model_name", modelName)
  }

  if (persona) {
    formData.append("persona", persona)
  }

  return apiFormData<UploadFilesResponse>(
    `/upload/${encodeURIComponent(projectName)}`,
    formData
  )
}

/**
 * Process uploaded files for a project
 * POST /process_files/{project_name} with form data
 */
export async function processFiles(
  projectName: string,
  modelName: string,
  filePaths: string[]
): Promise<ProcessFilesResponse> {
  const formData = new FormData()

  formData.append("model_name", modelName)

  for (const filePath of filePaths) {
    formData.append("file_paths", filePath)
  }

  return apiFormData<ProcessFilesResponse>(
    `/process_files/${encodeURIComponent(projectName)}`,
    formData
  )
}

/**
 * Generate an outline for a project
 * POST /generate_outline/{project_name} with form data
 */
export async function generateOutline(
  projectName: string,
  options: GenerateOutlineRequest
): Promise<GenerateOutlineResponse> {
  const formData = new FormData()

  formData.append("model_name", options.modelName)

  if (options.notebookHash) {
    formData.append("notebook_hash", options.notebookHash)
  }

  if (options.markdownHash) {
    formData.append("markdown_hash", options.markdownHash)
  }

  if (options.userGuidelines) {
    formData.append("user_guidelines", options.userGuidelines)
  }

  if (options.lengthPreference) {
    formData.append("length_preference", options.lengthPreference)
  }

  if (options.customLength !== undefined) {
    formData.append("custom_length", options.customLength.toString())
  }

  if (options.writingStyle) {
    formData.append("writing_style", options.writingStyle)
  }

  if (options.personaStyle) {
    formData.append("persona_style", options.personaStyle)
  }

  if (options.specificModel) {
    formData.append("specific_model", options.specificModel)
  }

  return apiFormData<GenerateOutlineResponse>(
    `/generate_outline/${encodeURIComponent(projectName)}`,
    formData
  )
}

/**
 * Generate a single section of the blog draft
 * POST /generate_section/{project_name} with form data
 */
export async function generateSection(
  projectName: string,
  sectionIndex: number,
  options?: {
    maxIterations?: number
    qualityThreshold?: number
  }
): Promise<GenerateSectionResponse> {
  const formData = new FormData()

  formData.append("section_index", sectionIndex.toString())

  if (options?.maxIterations !== undefined) {
    formData.append("max_iterations", options.maxIterations.toString())
  }

  if (options?.qualityThreshold !== undefined) {
    formData.append("quality_threshold", options.qualityThreshold.toString())
  }

  return apiFormData<GenerateSectionResponse>(
    `/generate_section/${encodeURIComponent(projectName)}`,
    formData
  )
}

/**
 * Compile the final draft from all generated sections
 * POST /compile_draft/{project_name} with form data
 */
export async function compileDraft(
  projectName: string,
  projectId: string
): Promise<CompileDraftResponse> {
  const formData = new FormData()

  formData.append("job_id", projectId)

  return apiFormData<CompileDraftResponse>(
    `/compile_draft/${encodeURIComponent(projectName)}`,
    formData
  )
}

/**
 * Refine blog draft with title generation
 * POST /refine_blog/{project_name} with form data
 */
export async function refineBlog(
  projectName: string,
  projectId: string,
  compiledDraft: string,
  options?: RefineBlogRequest
): Promise<RefineBlogResponse> {
  const formData = new FormData()

  formData.append("job_id", projectId)
  formData.append("compiled_draft", compiledDraft)

  if (options?.selectedTitleIndex !== undefined) {
    formData.append("selected_title_index", options.selectedTitleIndex.toString())
  }

  if (options?.customTitle) {
    formData.append("custom_title", options.customTitle)
  }

  return apiFormData<RefineBlogResponse>(
    `/refine_blog/${encodeURIComponent(projectName)}`,
    formData
  )
}

/**
 * Generate social media content for a blog post
 * POST /generate_social_content/{project_name}
 */
export async function generateSocialContent(
  projectName: string
): Promise<GenerateSocialContentResponse> {
  const formData = new FormData()

  return apiFormData<GenerateSocialContentResponse>(
    `/generate_social_content/${encodeURIComponent(projectName)}`,
    formData
  )
}
