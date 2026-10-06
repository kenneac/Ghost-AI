"use client";

import { Plus } from "lucide-react";
import { useState } from "react";

import { EditorNavbar } from "@/components/editor/editor-navbar";
import { ProjectSidebar } from "@/components/editor/project-sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useProjectDialogs } from "@/components/editor/use-project-dialogs";

export default function EditorPage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const {
    projects,
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
  } = useProjectDialogs();

  const isDeleteDialog = dialogMode === "delete";
  const isCreateDialog = dialogMode === "create";
  const isRenameDialog = dialogMode === "rename";

  const handleSubmit = async () => {
    await submitDialog();
  };

  return (
    <main className="min-h-screen bg-base text-copy-primary">
      <EditorNavbar
        isSidebarOpen={isSidebarOpen}
        onToggleSidebar={() => setIsSidebarOpen((current) => !current)}
      />

      <ProjectSidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        projects={projects}
        onCreateProject={openCreateDialog}
        onRenameProject={openRenameDialog}
        onDeleteProject={openDeleteDialog}
      />

      <div className="pt-16">
        <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-4xl items-center justify-center px-6 py-12">
          <div className="w-full max-w-2xl text-center">
            <h1 className="text-3xl font-medium tracking-tight text-copy-primary md:text-4xl">
              Create a project or open an existing one
            </h1>
            <p className="mt-3 text-base text-copy-secondary md:text-lg">
              Start a new architecture workspace, or choose a project from the
              sidebar.
            </p>

            <div className="mt-8 flex justify-center">
              <Button
                type="button"
                size="lg"
                className="gap-2 bg-brand text-primary-foreground hover:bg-brand/90"
                onClick={openCreateDialog}
              >
                <Plus className="h-4 w-4" />
                New Project
              </Button>
            </div>
          </div>
        </div>
      </div>

      {dialogMode ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl border border-surface-border bg-surface p-5 text-copy-primary shadow-2xl">
            {isCreateDialog ? (
              <>
                <div className="mb-4">
                  <h2 className="text-xl font-medium text-copy-primary">
                    Create project
                  </h2>
                </div>

                <div className="space-y-4">
                  <div>
                    <label
                      htmlFor="project-name"
                      className="mb-2 block text-sm text-copy-secondary"
                    >
                      Project name
                    </label>
                    <Input
                      id="project-name"
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
                  <h2 className="text-xl font-medium text-copy-primary">
                    Rename project
                  </h2>
                  <p className="mt-2 text-sm text-copy-secondary">
                    Current project name: {activeProject.name}
                  </p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label
                      htmlFor="rename-project-name"
                      className="mb-2 block text-sm text-copy-secondary"
                    >
                      Project name
                    </label>
                    <Input
                      id="rename-project-name"
                      value={formValue}
                      onChange={(event) => setFormValue(event.target.value)}
                      onKeyDown={(event) => {
                        if (event.key === "Enter") {
                          event.preventDefault();
                          void handleSubmit();
                        }
                      }}
                      autoFocus
                    />
                  </div>
                </div>
              </>
            ) : null}

            {isDeleteDialog && activeProject ? (
              <>
                <div className="mb-4">
                  <h2 className="text-xl font-medium text-copy-primary">
                    Delete project
                  </h2>
                  <p className="mt-2 text-sm text-copy-secondary">
                    This action cannot be undone. Delete {activeProject.name}?
                  </p>
                </div>
              </>
            ) : null}

            <div className="mt-6 flex justify-end gap-3">
              <Button type="button" variant="ghost" onClick={closeDialog}>
                Cancel
              </Button>

              {isDeleteDialog && activeProject ? (
                <Button
                  type="button"
                  variant="destructive"
                  onClick={() => void handleSubmit()}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Deleting..." : "Delete project"}
                </Button>
              ) : (
                <Button
                  type="button"
                  className="bg-brand text-primary-foreground hover:bg-brand/90"
                  onClick={() => void handleSubmit()}
                  disabled={
                    isSubmitting ||
                    (!isDeleteDialog && formValue.trim().length === 0)
                  }
                >
                  {isSubmitting
                    ? "Saving..."
                    : isCreateDialog
                      ? "Create project"
                      : "Save changes"}
                </Button>
              )}
            </div>
          </div>
        </div>
      ) : null}
    </main>
  );
}
