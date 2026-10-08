"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";

export type ProjectItem = {
  id: string;
  name: string;
  slug: string;
  isOwner: boolean;
};

export type ProjectDialogMode = "create" | "rename" | "delete";

export type UseProjectDialogsOptions = {
  ownedProjects: ProjectItem[];
  sharedProjects: ProjectItem[];
};

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

function createRoomSuffix() {
  return Math.random().toString(36).slice(2, 8);
}

function getActiveProjectIdFromLocation() {
  if (typeof window === "undefined") {
    return null;
  }

  return new URLSearchParams(window.location.search).get("projectId");
}

export function useProjectDialogs({
  ownedProjects,
  sharedProjects,
}: UseProjectDialogsOptions) {
  const router = useRouter();
  const [projects, setProjects] = useState<ProjectItem[]>([
    ...ownedProjects,
    ...sharedProjects,
  ]);
  const [dialogMode, setDialogMode] = useState<ProjectDialogMode | null>(null);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(
    null,
  );
  const [formValue, setFormValue] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isSubmittingRef = useRef(false);
  const activeSubmissionRef = useRef(0);

  useEffect(() => {
    setProjects([...ownedProjects, ...sharedProjects]);
  }, [ownedProjects, sharedProjects]);

  const activeProject = useMemo(
    () => projects.find((project) => project.id === selectedProjectId) ?? null,
    [projects, selectedProjectId],
  );

  const slugPreview = useMemo(() => slugifyProjectName(formValue), [formValue]);
  const ownedProjectsList = useMemo(
    () => projects.filter((project) => project.isOwner),
    [projects],
  );
  const sharedProjectsList = useMemo(
    () => projects.filter((project) => !project.isOwner),
    [projects],
  );

  const invalidatePendingSubmission = () => {
    activeSubmissionRef.current += 1;
    isSubmittingRef.current = false;
    setIsSubmitting(false);
  };

  const setProjectLists = (nextProjects: ProjectItem[]) => {
    setProjects(nextProjects);
  };

  const openCreateDialog = () => {
    invalidatePendingSubmission();
    setDialogMode("create");
    setSelectedProjectId(null);
    setFormValue("");
  };

  const openRenameDialog = (project: ProjectItem) => {
    invalidatePendingSubmission();
    setDialogMode("rename");
    setSelectedProjectId(project.id);
    setFormValue(project.name);
  };

  const openDeleteDialog = (project: ProjectItem) => {
    invalidatePendingSubmission();
    setDialogMode("delete");
    setSelectedProjectId(project.id);
    setFormValue("");
  };

  const closeDialog = () => {
    invalidatePendingSubmission();
    setDialogMode(null);
    setSelectedProjectId(null);
    setFormValue("");
  };

  const submitDialog = async () => {
    if (!dialogMode || isSubmittingRef.current) {
      return;
    }

    const trimmedName = formValue.trim();

    if (dialogMode !== "delete" && !trimmedName) {
      return;
    }

    const submissionId = activeSubmissionRef.current + 1;
    activeSubmissionRef.current = submissionId;
    isSubmittingRef.current = true;
    setIsSubmitting(true);

    try {
      if (dialogMode === "create") {
        const response = await fetch("/api/projects", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: trimmedName }),
        });

        const payload = await response.json();

        if (!response.ok) {
          throw new Error(payload.error ?? "Unable to create project");
        }

        const createdProject = payload.project as ProjectItem;
        const roomId = `${slugifyProjectName(trimmedName)}-${createRoomSuffix()}`;

        setProjectLists([
          {
            ...createdProject,
            slug: slugifyProjectName(trimmedName),
            isOwner: true,
          },
          ...projects,
        ]);

        closeDialog();
        router.push(
          `/editor?projectId=${encodeURIComponent(createdProject.id)}&roomId=${encodeURIComponent(roomId)}`,
        );
        return;
      }

      if (dialogMode === "rename" && selectedProjectId) {
        const response = await fetch(`/api/projects/${selectedProjectId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: trimmedName }),
        });

        const payload = await response.json();

        if (!response.ok) {
          throw new Error(payload.error ?? "Unable to rename project");
        }

        const updatedProject = payload.project as ProjectItem;

        setProjectLists(
          projects.map((project) =>
            project.id === selectedProjectId
              ? {
                  ...project,
                  name: updatedProject.name,
                  slug: slugifyProjectName(updatedProject.name),
                }
              : project,
          ),
        );

        closeDialog();
        router.refresh();
        return;
      }

      if (dialogMode === "delete" && selectedProjectId) {
        const response = await fetch(`/api/projects/${selectedProjectId}`, {
          method: "DELETE",
        });

        const payload = await response.json();

        if (!response.ok) {
          throw new Error(payload.error ?? "Unable to delete project");
        }

        setProjectLists(
          projects.filter((project) => project.id !== selectedProjectId),
        );

        closeDialog();

        if (getActiveProjectIdFromLocation() === selectedProjectId) {
          router.push("/editor");
          return;
        }

        router.refresh();
      }
    } catch (error) {
      console.error(error);
    } finally {
      if (activeSubmissionRef.current === submissionId) {
        activeSubmissionRef.current += 1;
        isSubmittingRef.current = false;
        setIsSubmitting(false);
      }
    }
  };

  return {
    projects,
    ownedProjects: ownedProjectsList,
    sharedProjects: sharedProjectsList,
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
