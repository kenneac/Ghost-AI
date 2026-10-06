"use client";

import { useState } from "react";

import { EditorNavbar } from "@/components/editor/editor-navbar";
import { ProjectSidebar } from "@/components/editor/project-sidebar";

export default function EditorPage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  return (
    <main className="min-h-screen bg-base text-copy-primary">
      <EditorNavbar
        isSidebarOpen={isSidebarOpen}
        onToggleSidebar={() => setIsSidebarOpen((current) => !current)}
      />

      <ProjectSidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      <div className="pt-16">
        <div className="mx-auto max-w-6xl px-6 py-10">
          <div className="rounded-3xl border border-surface-border bg-surface p-6">
            <div className="mb-6 flex items-center justify-between gap-4">
              <div>
                <p className="text-sm uppercase tracking-[0.18em] text-copy-muted">
                  Workspace
                </p>
                <h1 className="text-2xl font-medium text-copy-primary">
                  Project canvas
                </h1>
              </div>
            </div>

            <div className="h-[520px] rounded-2xl border border-dashed border-surface-border bg-base" />
          </div>
        </div>
      </div>
    </main>
  );
}
