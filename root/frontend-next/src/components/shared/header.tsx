// ABOUTME: App header component with logo and user menu
// ABOUTME: Consistent navigation element across all dashboard pages

"use client";

import Link from "next/link";
import { Sparkles } from "lucide-react";
import { UserMenu } from "@/components/dashboard/user-menu";

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-4 md:px-8">
        {/* Logo */}
        <Link href="/dashboard" className="flex items-center gap-2 group">
          <div className="w-8 h-8 rounded-lg gradient-warm flex items-center justify-center transition-transform group-hover:scale-105">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <span className="font-serif text-xl font-bold tracking-tight">
            Quibo
          </span>
        </Link>

        {/* User Menu */}
        <UserMenu />
      </div>
    </header>
  );
}
