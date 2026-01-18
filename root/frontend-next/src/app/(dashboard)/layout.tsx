// ABOUTME: Dashboard layout with header and main content area
// ABOUTME: Protected route wrapper for authenticated pages

import { Header } from "@/components/shared/header";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="noise-bg min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1 container px-4 md:px-8 py-8">{children}</main>
    </div>
  );
}
