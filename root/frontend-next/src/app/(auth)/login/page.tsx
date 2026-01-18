// ABOUTME: Login page with distinctive editorial design
// ABOUTME: Google OAuth button with Playfair Display headings and amber accents

import { Suspense } from "react";
import { LoginContent } from "./login-content";
import { Skeleton } from "@/components/ui/skeleton";

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="space-y-4">
          <Skeleton className="h-[400px] w-full rounded-lg" />
        </div>
      }
    >
      <LoginContent />
    </Suspense>
  );
}
