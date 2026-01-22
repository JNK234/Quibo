// ABOUTME: Workflow-related types for upload, outline, and draft generation
// ABOUTME: Defines API request/response shapes for the blog creation workflow

import { OutlineSection, WorkflowStage } from "./project"

// --- Resume Types ---

export interface ResumeProjectResponse {
  projectId: string
  projectName: string
  modelName: string
  persona: string | null
  specificModel: string | null
  outline: OutlineData | null
  outlineHash: string | null
  finalDraft: string | null
  refinedDraft: string | null
  summary: string | null
  titleOptions: string[] | null
  socialContent: SocialContentData | null
  generatedSections: Record<string, GeneratedSection>
  costSummary: CostSummary | null
}

// --- Upload Types ---

export interface UploadFilesResponse {
  message: string
  projectName: string
  projectId: string
  jobId: string
  files: string[]
}

export interface ProcessFilesRequest {
  modelName: string
  filePaths: string[]
}

export interface ProcessFilesResponse {
  message: string
  project: string
  fileHashes: Record<string, string>
  durationSeconds: number
}

// --- Outline Types ---

export interface OutlineSubsection {
  id: string
  title: string
  description: string
}

export interface OutlineData {
  title: string
  sections: OutlineSectionData[]
  prerequisites?: string[]
  learningGoals?: string[]
  estimatedReadTime?: string
}

export interface OutlineSectionData {
  id: string
  title: string
  description: string
  subsections?: OutlineSubsection[]
  order?: number
}

export interface GenerateOutlineRequest {
  modelName: string
  notebookHash?: string
  markdownHash?: string
  userGuidelines?: string
  lengthPreference?: "auto" | "short" | "medium" | "long" | "custom"
  customLength?: number
  writingStyle?: "balanced" | "concise" | "comprehensive"
  personaStyle?: string
  specificModel?: string
}

export interface GenerateOutlineResponse {
  outline: OutlineData
  projectName: string
  wasCached: boolean
  outlineHash: string
  costSummary?: CostSummary
}

// --- Draft Generation Types ---

export interface GenerateSectionRequest {
  sectionIndex: number
  maxIterations?: number
  qualityThreshold?: number
}

export interface GeneratedSection {
  index: number
  title: string
  content: string
  qualityScore?: number
  iterations?: number
  generatedAt: string
}

export interface GenerateSectionResponse {
  section: GeneratedSection
  sectionIndex: number
  totalSections: number
  costSummary?: CostSummary
}

export interface CompileDraftResponse {
  finalDraft: string
  sectionCount: number
  totalWordCount: number
  costSummary?: CostSummary
}

// --- Refinement Types ---

export interface TitleOption {
  title: string
  description: string
  style: string
}

export interface RefineBlogRequest {
  selectedTitleIndex?: number
  customTitle?: string
}

export interface RefineBlogResponse {
  refinedDraft: string
  titleOptions: TitleOption[]
  selectedTitle?: string
  summary: string
  costSummary?: CostSummary
}

// --- Social Content Types ---

export interface SocialContentData {
  linkedin: string
  twitter: string[]
  newsletter: string
}

export interface GenerateSocialContentResponse {
  socialContent: SocialContentData
  costSummary?: CostSummary
}

// --- Cost Tracking Types ---

export interface CostSummary {
  totalCost: number
  totalTokens: number
  inputTokens: number
  outputTokens: number
  callHistory?: CostRecord[]
}

export interface CostRecord {
  operation: string
  model: string
  inputTokens: number
  outputTokens: number
  cost: number
  timestamp: string
}

// --- Workflow Status Types ---

export interface WorkflowStatusResponse {
  projectId: string
  projectName: string
  currentStage: WorkflowStage
  hasOutline: boolean
  totalSections: number
  completedSections: number
  outline?: OutlineSection[]
  isProcessing: boolean
}

// --- Upload Progress Types ---

export interface FileUploadProgress {
  fileName: string
  progress: number
  status: "pending" | "uploading" | "complete" | "error"
  error?: string
}

export interface UploadedFile {
  name: string
  path: string
  size: number
  type: string
}

// --- Operation Status Types ---

export interface OperationError {
  message: string // User-friendly message
  details?: string // Technical details (expandable)
  code?: string // Error code for categorization
  retryable: boolean // Whether retry makes sense
}

export interface OperationStatus {
  isLoading: boolean
  loadingMessage: string | null
  error: OperationError | null
  retryCount: number
}
