// ABOUTME: Premium glass header with refined logo and user menu
// ABOUTME: Sleek navigation with subtle backdrop blur and border glow on hover

"use client";

import Link from "next/link";
import { Sparkles } from "lucide-react";
import { UserMenu } from "@/components/dashboard/user-menu";

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/5 bg-background/80 backdrop-blur-xl">
      <div className="container flex h-16 items-center justify-between px-4 md:px-8">
        {/* Logo */}
        <Link href="/dashboard" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-xl gradient-warm flex items-center justify-center transition-all duration-300 group-hover:shadow-lg group-hover:shadow-amber-500/25 group-hover:scale-105">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <span className="font-serif text-xl font-bold tracking-tight bg-gradient-to-r from-white to-white/80 bg-clip-text">
            Quibo
          </span>
        </Link>

        {/* User Menu */}
        <UserMenu />
      </div>
    </header>
  );
}
