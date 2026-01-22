// ABOUTME: Inline error display component with friendly message and expandable details
// ABOUTME: Includes retry and dismiss buttons for error recovery actions

"use client";

import { useState } from "react";
import {
  AlertCircle,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface InlineErrorProps {
  /** User-friendly error message */
  message: string;
  /** Technical details (shown when user expands) */
  details?: string;
  /** Called when user clicks retry button */
  onRetry?: () => void;
  /** Called when user clicks dismiss button */
  onDismiss?: () => void;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Inline error display component.
 *
 * Displays a friendly error message with:
 * - Warning icon (AlertCircle)
 * - Expandable technical details
 * - Optional retry button
 * - Optional dismiss button
 */
export function InlineError({
  message,
  details,
  onRetry,
  onDismiss,
  className,
}: InlineErrorProps) {
  const [showDetails, setShowDetails] = useState(false);

  return (
    <div
      className={cn(
        "rounded-lg border border-destructive/50 bg-destructive/10 p-4",
        className
      )}
      role="alert"
    >
      {/* Header row: icon + message */}
      <div className="flex items-start gap-3">
        <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-destructive" />
        <div className="flex-1 space-y-3">
          {/* Error message */}
          <p className="text-sm font-medium text-destructive">{message}</p>

          {/* Expandable details toggle */}
          {details && (
            <div>
              <button
                type="button"
                onClick={() => setShowDetails(!showDetails)}
                className="inline-flex items-center gap-1 text-xs text-muted-foreground transition-colors hover:text-foreground"
              >
                {showDetails ? (
                  <>
                    <ChevronUp className="h-3 w-3" />
                    Hide details
                  </>
                ) : (
                  <>
                    <ChevronDown className="h-3 w-3" />
                    Show details
                  </>
                )}
              </button>

              {/* Details content */}
              {showDetails && (
                <pre className="mt-2 overflow-x-auto rounded bg-muted p-2 text-xs text-muted-foreground">
                  {details}
                </pre>
              )}
            </div>
          )}

          {/* Action buttons */}
          {(onRetry || onDismiss) && (
            <div className="flex items-center gap-2">
              {onRetry && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onRetry}
                  className="gap-1.5"
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                  Retry
                </Button>
              )}
              {onDismiss && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onDismiss}
                  className="gap-1.5"
                >
                  <X className="h-3.5 w-3.5" />
                  Dismiss
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
