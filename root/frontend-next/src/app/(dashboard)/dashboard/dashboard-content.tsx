// ABOUTME: Client component for dashboard content with animations
// ABOUTME: Shows welcome message and project list with staggered entrance

"use client";

import { motion } from "framer-motion";
import { User } from "@supabase/supabase-js";
import { ProjectList } from "@/components/dashboard/project-list";
import { getUserDisplayName } from "@/hooks/use-auth";

interface DashboardContentProps {
  user: User;
}

export function DashboardContent({ user }: DashboardContentProps) {
  const displayName = getUserDisplayName(user);
  const firstName = displayName.split(" ")[0];

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="space-y-1"
      >
        <h1 className="font-serif text-3xl md:text-4xl font-semibold tracking-tight">
          Welcome back, {firstName}
        </h1>
        <p className="text-muted-foreground">
          Your AI-powered blogging workspace
        </p>
      </motion.div>

      {/* Quick Stats */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.4 }}
        className="grid grid-cols-2 md:grid-cols-4 gap-4"
      >
        {[
          { label: "Projects", value: "0" },
          { label: "Drafts", value: "0" },
          { label: "Published", value: "0" },
          { label: "This Month", value: "0" },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 + i * 0.05, duration: 0.3 }}
            className="p-4 rounded-lg bg-card border border-border/50"
          >
            <p className="text-2xl font-serif font-semibold">{stat.value}</p>
            <p className="text-sm text-muted-foreground">{stat.label}</p>
          </motion.div>
        ))}
      </motion.div>

      {/* Projects Section */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.4 }}
        className="space-y-4"
      >
        <div className="flex items-center justify-between">
          <h2 className="font-serif text-xl font-medium">Your Projects</h2>
        </div>

        <ProjectList projects={[]} />
      </motion.div>
    </div>
  );
}
