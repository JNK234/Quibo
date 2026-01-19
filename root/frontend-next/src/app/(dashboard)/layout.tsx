// ABOUTME: Premium dashboard layout with ambient background effects
// ABOUTME: Protected route wrapper with glass morphism design system

import { Header } from "@/components/shared/header";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col bg-background relative overflow-hidden">
      {/* Ambient gradient orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 -left-40 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 right-1/4 w-80 h-80 bg-purple-500/5 rounded-full blur-3xl" />
      </div>

      {/* Noise texture overlay */}
      <div className="fixed inset-0 noise-bg pointer-events-none opacity-50" />

      {/* Content */}
      <div className="relative z-10 flex flex-col min-h-screen">
        <Header />
        <main className="flex-1 container px-4 md:px-8 py-10">{children}</main>
      </div>
    </div>
  );
}
