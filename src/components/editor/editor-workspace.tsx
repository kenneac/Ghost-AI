"use client";

import { useState } from "react";
import { Bot, Share2 } from "lucide-react";

import { EditorNavbar } from "@/components/editor/editor-navbar";
import { ProjectSidebar } from "@/components/editor/project-sidebar";
import { Button } from "@/components/ui/button";
import { ShareDialog } from "@/components/editor/share-dialog";
import type { ProjectListItem } from "@/lib/project-data";

type EditorWorkspaceProps = {
  project: ProjectListItem;
  ownedProjects: ProjectListItem[];
  sharedProjects: ProjectListItem[];
};

export function EditorWorkspace({ project, ownedProjects, sharedProjects }: EditorWorkspaceProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isAiSidebarOpen, setIsAiSidebarOpen] = useState(false);
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false);

  return (
    <main className="flex h-dvh flex-col overflow-hidden bg-base text-copy-primary">
      <EditorNavbar
        isSidebarOpen={isSidebarOpen}
        onToggleSidebar={() => setIsSidebarOpen((open) => !open)}
        title={project.name}
        actions={
          <>
            <Button type="button" variant="outline" size="sm" className="gap-2" onClick={() => setIsShareDialogOpen(true)}>
              <Share2 className="h-4 w-4" />
              Share
            </Button>
            <Button
              type="button"
              variant={isAiSidebarOpen ? "secondary" : "outline"}
              size="sm"
              className="gap-2"
              aria-pressed={isAiSidebarOpen}
              onClick={() => setIsAiSidebarOpen((open) => !open)}
            >
              <Bot className="h-4 w-4" />
              AI
            </Button>
          </>
        }
      />
      <ShareDialog projectId={project.id} open={isShareDialogOpen} onOpenChange={setIsShareDialogOpen} />
      <ProjectSidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        ownedProjects={ownedProjects}
        sharedProjects={sharedProjects}
        onCreateProject={() => undefined}
        onRenameProject={() => undefined}
        onDeleteProject={() => undefined}
        activeProjectId={project.id}
        workspaceNavigation
      />
      <div className="flex min-h-0 flex-1 pt-16">
        <section
          aria-label="Canvas workspace"
          className="relative flex min-w-0 flex-1 items-center justify-center overflow-hidden bg-base"
        >
          <div className="text-center">
            <p className="text-sm font-medium text-copy-secondary">Canvas workspace</p>
            <p className="mt-1 text-xs text-copy-muted">Your system design canvas will appear here.</p>
          </div>
        </section>
        <aside
          aria-label="AI assistant sidebar"
          className={`h-full shrink-0 overflow-hidden border-l border-surface-border bg-surface transition-[width] duration-200 ${isAiSidebarOpen ? "w-80" : "w-0 border-l-0"}`}
          aria-hidden={!isAiSidebarOpen}
        >
          {isAiSidebarOpen ? (
            <div className="w-80 p-5">
              <h2 className="text-sm font-semibold text-copy-primary">AI Assistant</h2>
              <p className="mt-2 text-sm text-copy-muted">AI chat will be available here.</p>
            </div>
          ) : null}
        </aside>
      </div>
    </main>
  );
}
