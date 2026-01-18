// ABOUTME: Configuration API service for models and personas
// ABOUTME: Fetches available LLM models and writing personas from backend

import { apiClient } from "./client"

export interface Model {
  id: string
  name: string
  provider: string
  description?: string
}

export interface Persona {
  id: string
  name: string
  description: string
}

// API response types
interface ModelsApiResponse {
  providers: {
    [providerKey: string]: {
      name: string
      models: Array<{
        id: string
        name: string
        description?: string
      }>
    }
  }
}

interface PersonasApiResponse {
  [personaId: string]: {
    name: string
    description: string
  }
}

export async function getModels(): Promise<Model[]> {
  const response = await apiClient<ModelsApiResponse>("/models")

  // Flatten the nested provider structure into a flat array
  const models: Model[] = []
  for (const [providerKey, provider] of Object.entries(response.providers)) {
    for (const model of provider.models) {
      models.push({
        id: model.id,
        name: `${model.name} (${provider.name})`,
        provider: providerKey,
        description: model.description,
      })
    }
  }
  return models
}

export async function getPersonas(): Promise<Persona[]> {
  const response = await apiClient<PersonasApiResponse>("/personas")

  // Convert object to array format
  return Object.entries(response).map(([id, persona]) => ({
    id,
    name: persona.name,
    description: persona.description,
  }))
}
