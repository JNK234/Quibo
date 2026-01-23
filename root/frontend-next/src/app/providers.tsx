// ABOUTME: React Query provider wrapper for the application
// ABOUTME: Uses createQueryClient with error retry configuration from query-client.tsx

"use client"

import { QueryClientProvider } from "@tanstack/react-query"
import { useState } from "react"
import { createQueryClient } from "@/lib/query-client"
import { Toaster } from "@/components/ui/sonner"

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => createQueryClient())

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <Toaster />
    </QueryClientProvider>
  )
}
