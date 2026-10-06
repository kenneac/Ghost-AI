import { PanelLeftClose, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

type ProjectSidebarProps = {
  isOpen: boolean;
  onClose: () => void;
};

export function ProjectSidebar({ isOpen, onClose }: ProjectSidebarProps) {
  return (
    <>
      {isOpen ? (
        <button
          type="button"
          aria-label="Close project sidebar"
          className="fixed inset-0 z-20 bg-black/35"
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

          <div className="flex-1 px-3 py-3">
            <Tabs defaultValue="my-projects" className="w-full">
              <TabsList className="grid w-full grid-cols-2 bg-subtle">
                <TabsTrigger value="my-projects">My Projects</TabsTrigger>
                <TabsTrigger value="shared">Shared</TabsTrigger>
              </TabsList>

              <TabsContent
                value="my-projects"
                className="mt-4 flex min-h-[220px] items-center justify-center rounded-2xl border border-dashed border-surface-border bg-base text-sm text-copy-muted"
              >
                No projects yet
              </TabsContent>

              <TabsContent
                value="shared"
                className="mt-4 flex min-h-[220px] items-center justify-center rounded-2xl border border-dashed border-surface-border bg-base text-sm text-copy-muted"
              >
                No shared projects
              </TabsContent>
            </Tabs>
          </div>

          <div className="border-t border-surface-border p-3">
            <Button
              type="button"
              className="w-full gap-2 bg-brand text-primary-foreground hover:bg-brand/90"
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
