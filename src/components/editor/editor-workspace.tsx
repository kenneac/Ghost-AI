"use client";

import { useEffect, useRef, useState } from "react";
import { Bot, Share2 } from "lucide-react";

import { EditorNavbar } from "@/components/editor/editor-navbar";
import { ProjectSidebar } from "@/components/editor/project-sidebar";
import { ShareDialog } from "@/components/editor/share-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useProjectDialogs } from "@/hooks/use-project-dialogs";
import { LiveblocksCanvasRoom } from "@/components/editor/liveblocks-canvas-room";
import type { ProjectListItem } from "@/lib/project-data";

type EditorWorkspaceProps = {
  project: ProjectListItem;
  ownedProjects: ProjectListItem[];
  sharedProjects: ProjectListItem[];
};

export function EditorWorkspace({
  project,
  ownedProjects,
  sharedProjects,
}: EditorWorkspaceProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isAiSidebarOpen, setIsAiSidebarOpen] = useState(false);
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false);
  const dialogRef = useRef<HTMLDivElement | null>(null);
  const lastFocusedTriggerRef = useRef<HTMLElement | null>(null);

  const {
    ownedProjects: currentOwnedProjects,
    sharedProjects: currentSharedProjects,
    dialogMode,
    activeProject,
    formValue,
    setFormValue,
    isSubmitting,
    slugPreview,
    openCreateDialog,
    openRenameDialog,
    openDeleteDialog,
    closeDialog,
    submitDialog,
  } = useProjectDialogs({ ownedProjects, sharedProjects });

  const isDeleteDialog = dialogMode === "delete";
  const isCreateDialog = dialogMode === "create";
  const isRenameDialog = dialogMode === "rename";

  const handleSubmit = async () => {
    await submitDialog();
  };

  useEffect(() => {
    if (!dialogMode || !dialogRef.current) {
      return;
    }

    const focusableSelector =
      'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';
    const dialogElement = dialogRef.current;
    const focusableItems = Array.from(
      dialogElement.querySelectorAll<HTMLElement>(focusableSelector),
    );

    const targetFocusable = isDeleteDialog
      ? (focusableItems[focusableItems.length - 1] ??
        focusableItems[0] ??
        dialogElement)
      : (focusableItems[0] ?? dialogElement);

    if (targetFocusable) {
      targetFocusable.focus();
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        closeDialog();
        return;
      }

      if (event.key !== "Tab" || focusableItems.length === 0) {
        return;
      }

      const firstElement = focusableItems[0];
      const lastElement = focusableItems[focusableItems.length - 1];
      const activeElement = document.activeElement as HTMLElement | null;

      if (event.shiftKey && activeElement === firstElement) {
        event.preventDefault();
        lastElement.focus();
      } else if (!event.shiftKey && activeElement === lastElement) {
        event.preventDefault();
        firstElement.focus();
      }
    };

    dialogElement.addEventListener("keydown", handleKeyDown);

    return () => {
      dialogElement.removeEventListener("keydown", handleKeyDown);
    };
  }, [dialogMode, isDeleteDialog, closeDialog]);

  useEffect(() => {
    if (!dialogMode && lastFocusedTriggerRef.current) {
      const trigger = lastFocusedTriggerRef.current;
      requestAnimationFrame(() => trigger.focus());
      lastFocusedTriggerRef.current = null;
    }
  }, [dialogMode]);

  return (
    <main className="flex h-dvh flex-col overflow-hidden bg-base text-copy-primary">
      <EditorNavbar
        isSidebarOpen={isSidebarOpen}
        onToggleSidebar={() => setIsSidebarOpen((open) => !open)}
        title={project.name}
        actions={
          <>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="gap-2"
              onClick={() => setIsShareDialogOpen(true)}
            >
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
      <ShareDialog
        projectId={project.id}
        open={isShareDialogOpen}
        onOpenChange={setIsShareDialogOpen}
      />
      <ProjectSidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        ownedProjects={currentOwnedProjects}
        sharedProjects={currentSharedProjects}
        onCreateProject={openCreateDialog}
        onRenameProject={openRenameDialog}
        onDeleteProject={(selectedProject, trigger) => {
          lastFocusedTriggerRef.current = trigger ?? null;
          openDeleteDialog(selectedProject);
        }}
        activeProjectId={project.id}
        workspaceNavigation
      />
      <div className="flex min-h-0 flex-1 pt-16">
        <section
          aria-label="Canvas workspace"
          className="relative flex min-w-0 flex-1 overflow-hidden bg-base"
        >
          <LiveblocksCanvasRoom roomId={project.id} />
        </section>
        <aside
          aria-label="AI assistant sidebar"
          className={`h-full shrink-0 overflow-hidden border-l border-surface-border bg-surface transition-[width] duration-200 ${isAiSidebarOpen ? "w-80" : "w-0 border-l-0"}`}
          aria-hidden={!isAiSidebarOpen}
        >
          {isAiSidebarOpen ? (
            <div className="w-80 p-5">
              <h2 className="text-sm font-semibold text-copy-primary">
                AI Assistant
              </h2>
              <p className="mt-2 text-sm text-copy-muted">
                AI chat will be available here.
              </p>
            </div>
          ) : null}
        </aside>
      </div>

      {dialogMode ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="workspace-project-dialog-title"
            className="w-full max-w-md rounded-3xl border border-surface-border bg-surface p-5 text-copy-primary shadow-2xl"
          >
            {isCreateDialog ? (
              <>
                <div className="mb-4">
                  <h2
                    id="workspace-project-dialog-title"
                    className="text-xl font-medium text-copy-primary"
                  >
                    Create project
                  </h2>
                </div>

                <div className="space-y-4">
                  <div>
                    <label
                      htmlFor="workspace-project-name"
                      className="mb-2 block text-sm text-copy-secondary"
                    >
                      Project name
                    </label>
                    <Input
                      id="workspace-project-name"
                      value={formValue}
                      onChange={(event) => setFormValue(event.target.value)}
                      placeholder="Architecture workspace"
                      onKeyDown={(event) => {
                        if (event.key === "Enter") {
                          event.preventDefault();
                          void handleSubmit();
                        }
                      }}
                      autoFocus
                    />
                  </div>

                  <div className="rounded-2xl border border-surface-border bg-base p-3">
                    <p className="text-xs uppercase tracking-[0.18em] text-copy-muted">
                      Slug preview
                    </p>
                    <p className="mt-2 text-sm text-copy-primary">
                      /{slugPreview}
                    </p>
                  </div>
                </div>
              </>
            ) : null}

            {isRenameDialog && activeProject ? (
              <>
                <div className="mb-4">
                  <h2
                    id="workspace-project-dialog-title"
                    className="text-xl font-medium text-copy-primary"
                  >
                    Rename project
                  </h2>
                  <p className="mt-2 text-sm text-copy-secondary">
                    Current project name: {activeProject.name}
                  </p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label
                      htmlFor="workspace-rename-project-name"
                      className="mb-2 block text-sm text-copy-secondary"
                    >
                      Project name
                    </label>
                    <Input
                      id="workspace-rename-project-name"
                      value={formValue}
                      onChange={(event) => setFormValue(event.target.value)}
                      autoFocus
                      onKeyDown={(event) => {
                        if (event.key === "Enter") {
                          event.preventDefault();
                          void handleSubmit();
                        }
                      }}
                    />
                  </div>
                </div>
              </>
            ) : null}

            {isDeleteDialog && activeProject ? (
              <>
                <div className="mb-4">
                  <h2
                    id="workspace-project-dialog-title"
                    className="text-xl font-medium text-copy-primary"
                  >
                    Delete project
                  </h2>
                  <p className="mt-3 text-sm text-copy-secondary">
                    This will permanently remove{" "}
                    <span className="font-medium text-copy-primary">
                      {activeProject.name}
                    </span>
                    .
                  </p>
                </div>

                <div className="mt-6 flex justify-end gap-3">
                  <Button type="button" variant="ghost" onClick={closeDialog}>
                    Cancel
                  </Button>
                  <Button
                    type="button"
                    variant="destructive"
                    onClick={() => void handleSubmit()}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Deleting..." : "Delete project"}
                  </Button>
                </div>
              </>
            ) : null}

            {isCreateDialog || isRenameDialog ? (
              <div className="mt-6 flex justify-end gap-3">
                <Button type="button" variant="ghost" onClick={closeDialog}>
                  Cancel
                </Button>
                <Button
                  type="button"
                  onClick={() => void handleSubmit()}
                  disabled={isSubmitting || !formValue.trim()}
                >
                  {isSubmitting
                    ? "Saving..."
                    : isCreateDialog
                      ? "Create project"
                      : "Save changes"}
                </Button>
              </div>
            ) : null}
          </div>
        </div>
      ) : null}
    </main>
  );
}
