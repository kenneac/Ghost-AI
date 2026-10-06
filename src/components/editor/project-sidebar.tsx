"use client";

import { PanelLeftClose, PencilLine, Plus, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import type { ProjectItem } from "@/components/editor/use-project-dialogs";

type ProjectSidebarProps = {
  isOpen: boolean;
  onClose: () => void;
  projects: ProjectItem[];
  onCreateProject: () => void;
  onRenameProject: (project: ProjectItem) => void;
  onDeleteProject: (project: ProjectItem) => void;
};

export function ProjectSidebar({
  isOpen,
  onClose,
  projects,
  onCreateProject,
  onRenameProject,
  onDeleteProject,
}: ProjectSidebarProps) {
  const ownedProjects = projects.filter((project) => project.isOwner);
  const sharedProjects = projects.filter((project) => !project.isOwner);

  return (
    <>
      {isOpen ? (
        <button
          type="button"
          aria-label="Close project sidebar"
          className="fixed inset-0 z-20 bg-black/35 md:hidden"
          onClick={onClose}
        />
      ) : null}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-30 w-[320px] transform border-r border-surface-border bg-surface/95 shadow-2xl transition-transform duration-200 ease-out backdrop-blur-sm",
          isOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex h-full flex-col">
          <div className="flex items-center justify-between border-b border-surface-border px-4 py-3">
            <h2 className="text-base font-medium text-copy-primary">
              Projects
            </h2>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="text-copy-primary hover:bg-subtle"
              aria-label="Close projects sidebar"
            >
              <PanelLeftClose className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex min-h-0 flex-1 px-3 py-3">
            <Tabs defaultValue="my-projects" className="flex h-full w-full flex-col">
              <TabsList className="grid w-full shrink-0 grid-cols-2 bg-subtle">
                <TabsTrigger value="my-projects">My Projects</TabsTrigger>
                <TabsTrigger value="shared">Shared</TabsTrigger>
              </TabsList>

              <TabsContent
                value="my-projects"
                className="mt-4 min-h-0 flex-1 space-y-3 overflow-y-auto pr-1"
              >
                {ownedProjects.length === 0 ? (
                  <div className="flex min-h-[220px] items-center justify-center rounded-2xl border border-dashed border-surface-border bg-base text-sm text-copy-muted">
                    No projects yet
                  </div>
                ) : (
                  ownedProjects.map((project) => (
                    <div
                      key={project.id}
                      className="flex items-center justify-between gap-3 rounded-2xl border border-surface-border bg-subtle px-3 py-3"
                    >
                      <div className="min-w-0">
                        <div className="truncate text-sm font-medium text-copy-primary">
                          {project.name}
                        </div>
                        <div className="truncate text-xs text-copy-muted">
                          {project.slug}
                        </div>
                      </div>

                      <div className="flex items-center gap-1">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon-sm"
                          className="text-copy-primary hover:bg-base"
                          aria-label={`Rename ${project.name}`}
                          onClick={() => onRenameProject(project)}
                        >
                          <PencilLine className="h-4 w-4" />
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon-sm"
                          className="text-copy-primary hover:bg-base"
                          aria-label={`Delete ${project.name}`}
                          onClick={() => onDeleteProject(project)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </TabsContent>

              <TabsContent
                value="shared"
                className="mt-4 min-h-0 flex-1 space-y-3 overflow-y-auto pr-1"
              >
                {sharedProjects.length === 0 ? (
                  <div className="flex min-h-[220px] items-center justify-center rounded-2xl border border-dashed border-surface-border bg-base text-sm text-copy-muted">
                    No shared projects
                  </div>
                ) : (
                  sharedProjects.map((project) => (
                    <div
                      key={project.id}
                      className="flex items-center justify-between gap-3 rounded-2xl border border-surface-border bg-subtle px-3 py-3"
                    >
                      <div className="min-w-0">
                        <div className="truncate text-sm font-medium text-copy-primary">
                          {project.name}
                        </div>
                        <div className="truncate text-xs text-copy-muted">
                          {project.slug}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </TabsContent>
            </Tabs>
          </div>

          <div className="border-t border-surface-border p-3">
            <Button
              type="button"
              className="w-full gap-2 bg-brand text-primary-foreground hover:bg-brand/90"
              onClick={onCreateProject}
            >
              <Plus className="h-4 w-4" />
              New Project
            </Button>
          </div>
        </div>
      </aside>
    </>
  );
}
