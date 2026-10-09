"use client";

import { useEffect, useRef, useState } from "react";

import type { CanvasEdge, CanvasNode } from "@/types/canvas";

export type CanvasSaveStatus = "saving" | "saved" | "error";

export function useCanvasAutosave({
  projectId,
  nodes,
  edges,
  enabled,
}: {
  projectId: string;
  nodes: CanvasNode[];
  edges: CanvasEdge[];
  enabled: boolean;
}) {
  const [status, setStatus] = useState<CanvasSaveStatus>("saved");
  const initialSaveSkipped = useRef(false);

  useEffect(() => {
    if (!enabled) return;
    if (!initialSaveSkipped.current) {
      initialSaveSkipped.current = true;
      return;
    }

    setStatus("saving");
    const controller = new AbortController();
    const timeout = window.setTimeout(async () => {
      try {
        const response = await fetch(`/api/projects/${projectId}/canvas`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ nodes, edges }),
          signal: controller.signal,
        });
        if (!response.ok) throw new Error("Canvas save failed");
        setStatus("saved");
      } catch {
        if (!controller.signal.aborted) setStatus("error");
      }
    }, 800);

    return () => {
      window.clearTimeout(timeout);
      controller.abort();
    };
  }, [edges, enabled, nodes, projectId]);

  return status;
}
