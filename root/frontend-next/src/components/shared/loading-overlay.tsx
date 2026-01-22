// ABOUTME: Loading overlay component for AI operations with spinner and stage messages
// ABOUTME: Supports inline mode (content area) and full-screen mode with backdrop blur

"use client";

import { Loader2 } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/utils";

/**
 * Predefined stage messages for common AI operation phases.
 * Use these for consistent UX across the application.
 */
export const STAGE_MESSAGES = {
  parsing: {
    message: "Parsing your files...",
    description: "Reading and extracting content",
  },
  analyzing: {
    message: "Analyzing content...",
    description: "Understanding structure and context",
  },
  generating: {
    message: "Generating content...",
    description: "Creating your blog content",
  },
  compiling: {
    message: "Compiling draft...",
    description: "Assembling sections into final draft",
  },
  refining: {
    message: "Refining content...",
    description: "Polishing and improving quality",
  },
} as const;

export type StageKey = keyof typeof STAGE_MESSAGES;

interface LoadingOverlayProps {
  /** Whether the loading state is active */
  isLoading: boolean;
  /** Primary status message (e.g., "Generating outline...") */
  message: string;
  /** Secondary description (e.g., "Analyzing content structure") */
  description?: string;
  /** true = inline in content area, false = full screen with backdrop */
  inline?: boolean;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Loading overlay component for AI operations.
 *
 * - Inline mode (default): Renders in content flow with spinner + text
 * - Full-screen mode: Fixed overlay with backdrop blur and centered card
 */
export function LoadingOverlay({
  isLoading,
  message,
  description,
  inline = true,
  className,
}: LoadingOverlayProps) {
  if (!isLoading) {
    return null;
  }

  // Inline mode: simple spinner with text in content flow
  if (inline) {
    return (
      <div
        className={cn(
          "flex items-center gap-3 py-4",
          className
        )}
        role="status"
        aria-live="polite"
      >
        <Loader2 className="h-5 w-5 animate-spin text-primary" />
        <div className="flex flex-col gap-0.5">
          <span className="text-sm font-medium text-foreground">
            {message}
          </span>
          {description && (
            <span className="text-xs text-muted-foreground">
              {description}
            </span>
          )}
        </div>
      </div>
    );
  }

  // Full-screen mode: overlay with backdrop blur and animated card
  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className={cn(
            "fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm",
            className
          )}
          role="status"
          aria-live="polite"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="flex flex-col items-center gap-4 rounded-xl border border-white/10 bg-card/95 p-8 shadow-2xl backdrop-blur-xl"
          >
            {/* Spinner container with subtle glow */}
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
              <Loader2 className="h-7 w-7 animate-spin text-primary" />
            </div>

            {/* Text content */}
            <div className="flex flex-col items-center gap-1 text-center">
              <span className="text-base font-medium text-foreground">
                {message}
              </span>
              {description && (
                <span className="text-sm text-muted-foreground">
                  {description}
                </span>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
