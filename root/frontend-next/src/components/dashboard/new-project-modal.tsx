// ABOUTME: Modal dialog for creating new projects with form validation
// ABOUTME: Uses react-hook-form with Zod schema and fetches models/personas from API

"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useUIStore } from "@/store/ui-store"
import { useCreateProject } from "@/lib/queries/project-queries"
import { useModels, usePersonas } from "@/lib/queries/config-queries"
import { Loader2 } from "lucide-react"

const schema = z.object({
  name: z.string().min(1, "Project name is required").max(100, "Name too long"),
  description: z.string().max(500, "Description too long").optional(),
  modelName: z.string().min(1, "Please select a model"),
  persona: z.string().min(1, "Please select a persona"),
})

type FormData = z.infer<typeof schema>

export function NewProjectModal() {
  const router = useRouter()
  const { newProjectModalOpen, closeNewProjectModal } = useUIStore()
  const createProject = useCreateProject()
  const { data: models, isLoading: modelsLoading } = useModels()
  const { data: personas, isLoading: personasLoading } = usePersonas()

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      description: "",
      modelName: "",
      persona: "",
    },
  })

  // Reset form when modal closes
  const resetMutation = createProject.reset
  useEffect(() => {
    if (!newProjectModalOpen) {
      reset()
      resetMutation()
    }
  }, [newProjectModalOpen, reset, resetMutation])

  const onSubmit = async (data: FormData) => {
    try {
      const project = await createProject.mutateAsync({
        name: data.name,
        description: data.description,
        model_name: data.modelName,
        persona: data.persona,
      })
      closeNewProjectModal()
      router.push(`/project/${project.id}/upload`)
    } catch {
      // Error handled by mutation state
    }
  }

  return (
    <Dialog open={newProjectModalOpen} onOpenChange={(open) => !open && closeNewProjectModal()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-serif text-xl">Create New Project</DialogTitle>
          <DialogDescription>
            Set up your blog project with a name and AI configuration.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Project Name</Label>
            <Input
              id="name"
              placeholder="My Blog Post"
              {...register("name")}
              className={errors.name ? "border-destructive" : ""}
            />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description (optional)</Label>
            <Textarea
              id="description"
              placeholder="Brief description of your blog post..."
              rows={3}
              {...register("description")}
              className={errors.description ? "border-destructive" : ""}
            />
            {errors.description && (
              <p className="text-sm text-destructive">{errors.description.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="model">AI Model</Label>
            <Select
              onValueChange={(value) => setValue("modelName", value)}
              disabled={modelsLoading}
            >
              <SelectTrigger className={errors.modelName ? "border-destructive" : ""}>
                <SelectValue placeholder={modelsLoading ? "Loading models..." : "Select a model"} />
              </SelectTrigger>
              <SelectContent>
                {models?.map((model) => (
                  <SelectItem key={model.id} value={model.id}>
                    {model.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.modelName && (
              <p className="text-sm text-destructive">{errors.modelName.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="persona">Writing Persona</Label>
            <Select
              onValueChange={(value) => setValue("persona", value)}
              disabled={personasLoading}
            >
              <SelectTrigger className={errors.persona ? "border-destructive" : ""}>
                <SelectValue placeholder={personasLoading ? "Loading personas..." : "Select a persona"} />
              </SelectTrigger>
              <SelectContent>
                {personas?.map((persona) => (
                  <SelectItem key={persona.id} value={persona.id}>
                    {persona.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.persona && (
              <p className="text-sm text-destructive">{errors.persona.message}</p>
            )}
          </div>

          {createProject.isError && (
            <div className="p-3 rounded-md bg-destructive/10 text-destructive text-sm">
              Failed to create project. Please try again.
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={closeNewProjectModal}
              disabled={createProject.isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={createProject.isPending}
              className="gradient-warm border-0 text-white hover:opacity-90"
            >
              {createProject.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create Project"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
