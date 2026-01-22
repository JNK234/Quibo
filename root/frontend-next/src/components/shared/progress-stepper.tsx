// ABOUTME: Horizontal progress stepper component for workflow visualization
// ABOUTME: Shows step markers with labels and a filling progress bar - no checkmark icons per design spec

"use client"

import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

interface ProgressStepperProps {
  steps: { id: string; label: string }[]
  currentStep: number // 0-indexed, which step user is on
  onStepClick?: (stepIndex: number) => void
  className?: string
}

export function ProgressStepper({
  steps,
  currentStep,
  onStepClick,
  className,
}: ProgressStepperProps) {
  // Calculate progress percentage based on current step
  // Progress fills between step markers: 0% at step 0, 100% at last step
  const progressPercent =
    steps.length > 1 ? (currentStep / (steps.length - 1)) * 100 : 0

  const handleStepClick = (stepIndex: number) => {
    // Only allow clicking completed steps (before current step)
    if (stepIndex < currentStep && onStepClick) {
      onStepClick(stepIndex)
    }
  }

  const getStepState = (
    stepIndex: number
  ): "completed" | "current" | "future" => {
    if (stepIndex < currentStep) return "completed"
    if (stepIndex === currentStep) return "current"
    return "future"
  }

  const getAriaLabel = (step: { label: string }, stepIndex: number): string => {
    const state = getStepState(stepIndex)
    const stateLabel =
      state === "completed"
        ? "(completed)"
        : state === "current"
          ? "(current)"
          : "(not available)"
    return `Step ${stepIndex + 1}: ${step.label} ${stateLabel}`
  }

  return (
    <div className={cn("w-full px-4 py-4", className)}>
      {/* Progress bar container */}
      <div className="relative">
        {/* Background track */}
        <div className="absolute top-1/2 left-0 right-0 h-2 -translate-y-1/2 bg-muted rounded-full" />

        {/* Filled progress bar */}
        <motion.div
          className="absolute top-1/2 left-0 h-2 -translate-y-1/2 bg-primary rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${progressPercent}%` }}
          transition={{ duration: 0.4, ease: "easeOut" }}
        />

        {/* Step markers positioned along the bar */}
        <div className="relative flex justify-between">
          {steps.map((step, index) => {
            const state = getStepState(index)
            const isClickable = state === "completed"

            return (
              <div key={step.id} className="flex flex-col items-center">
                {/* Step marker button */}
                <button
                  type="button"
                  onClick={() => handleStepClick(index)}
                  disabled={!isClickable}
                  aria-label={getAriaLabel(step, index)}
                  className={cn(
                    "relative z-10 flex h-8 w-8 items-center justify-center rounded-full border-2 transition-all duration-200",
                    // Completed: filled with primary color
                    state === "completed" &&
                      "border-primary bg-primary text-primary-foreground cursor-pointer hover:ring-2 hover:ring-primary/30 hover:ring-offset-2",
                    // Current: highlighted with pulsing animation
                    state === "current" &&
                      "border-primary bg-background text-primary cursor-default",
                    // Future: muted/disabled
                    state === "future" &&
                      "border-muted-foreground/30 bg-background text-muted-foreground/30 cursor-not-allowed"
                  )}
                >
                  {/* Step number inside marker */}
                  <span
                    className={cn(
                      "text-sm font-medium",
                      state === "completed" && "text-primary-foreground",
                      state === "current" && "text-primary",
                      state === "future" && "text-muted-foreground/30"
                    )}
                  >
                    {index + 1}
                  </span>

                  {/* Pulsing ring for current step */}
                  {state === "current" && (
                    <motion.span
                      className="absolute inset-0 rounded-full border-2 border-primary"
                      initial={{ opacity: 0.6, scale: 1 }}
                      animate={{
                        opacity: [0.6, 0],
                        scale: [1, 1.4],
                      }}
                      transition={{
                        duration: 1.5,
                        repeat: Infinity,
                        ease: "easeOut",
                      }}
                    />
                  )}
                </button>

                {/* Step label below marker */}
                <span
                  className={cn(
                    "mt-2 text-xs font-medium text-center max-w-[80px] transition-colors duration-200",
                    state === "completed" && "text-foreground",
                    state === "current" && "text-primary font-semibold",
                    state === "future" && "text-muted-foreground/50"
                  )}
                >
                  {step.label}
                </span>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
