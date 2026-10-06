import { useMemo, useState } from "react";

export type ProjectItem = {
  id: string;
  name: string;
  slug: string;
  isOwner: boolean;
};

export type ProjectDialogMode = "create" | "rename" | "delete";

const initialProjects: ProjectItem[] = [
  {
    id: "project-1",
    name: "Platform Architecture",
    slug: "platform-architecture",
    isOwner: true,
  },
  {
    id: "project-2",
    name: "Operations Console",
    slug: "operations-console",
    isOwner: true,
  },
  {
    id: "project-3",
    name: "Shared Design Review",
    slug: "shared-design-review",
    isOwner: false,
  },
  {
    id: "project-4",
    name: "Partner Workspace",
    slug: "partner-workspace",
    isOwner: false,
  },
];

function slugifyProjectName(value: string) {
  return (
    value
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 48) || "project"
  );
}

export function useProjectDialogs() {
  const [projects, setProjects] = useState<ProjectItem[]>(initialProjects);
  const [dialogMode, setDialogMode] = useState<ProjectDialogMode | null>(null);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(
    null,
  );
  const [formValue, setFormValue] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const activeProject = useMemo(
    () => projects.find((project) => project.id === selectedProjectId) ?? null,
    [projects, selectedProjectId],
  );

  const slugPreview = useMemo(() => slugifyProjectName(formValue), [formValue]);

  const openCreateDialog = () => {
    setDialogMode("create");
    setSelectedProjectId(null);
    setFormValue("");
    setIsSubmitting(false);
  };

  const openRenameDialog = (project: ProjectItem) => {
    setDialogMode("rename");
    setSelectedProjectId(project.id);
    setFormValue(project.name);
    setIsSubmitting(false);
  };

  const openDeleteDialog = (project: ProjectItem) => {
    setDialogMode("delete");
    setSelectedProjectId(project.id);
    setFormValue("");
    setIsSubmitting(false);
  };

  const closeDialog = () => {
    setDialogMode(null);
    setSelectedProjectId(null);
    setFormValue("");
    setIsSubmitting(false);
  };

  const submitDialog = async () => {
    if (!dialogMode) {
      return;
    }

    const trimmedName = formValue.trim();

    if (dialogMode !== "delete" && !trimmedName) {
      return;
    }

    setIsSubmitting(true);

    await new Promise((resolve) => {
      window.setTimeout(resolve, 150);
    });

    if (dialogMode === "create") {
      const newProject: ProjectItem = {
        id: `project-${Date.now()}`,
        name: trimmedName,
        slug: slugifyProjectName(trimmedName),
        isOwner: true,
      };

      setProjects((currentProjects) => [newProject, ...currentProjects]);
    }

    if (dialogMode === "rename" && selectedProjectId) {
      setProjects((currentProjects) =>
        currentProjects.map((project) =>
          project.id === selectedProjectId
            ? {
                ...project,
                name: trimmedName,
                slug: slugifyProjectName(trimmedName),
              }
            : project,
        ),
      );
    }

    if (dialogMode === "delete" && selectedProjectId) {
      setProjects((currentProjects) =>
        currentProjects.filter((project) => project.id !== selectedProjectId),
      );
    }

    closeDialog();
  };

  return {
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
  };
}
