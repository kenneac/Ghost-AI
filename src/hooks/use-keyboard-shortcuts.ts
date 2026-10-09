"use client";

import { useEffect } from "react";
import type { ReactFlowInstance } from "@xyflow/react";

import type { CanvasEdge, CanvasNode } from "@/types/canvas";

function isEditableTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) {
    return false;
  }

  return Boolean(
    target.closest(
      "input, textarea, select, [contenteditable='true'], [contenteditable=''], [role='textbox']",
    ),
  );
}

export function useKeyboardShortcuts({
  reactFlow,
  undo,
  redo,
}: {
  reactFlow: ReactFlowInstance<CanvasNode, CanvasEdge> | null;
  undo: () => void;
  redo: () => void;
}) {
  useEffect(() => {
    if (!reactFlow) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (isEditableTarget(event.target)) {
        return;
      }

      const isModifierPressed = event.metaKey || event.ctrlKey;

      if (event.key === "+" || event.key === "=") {
        event.preventDefault();
        reactFlow.zoomIn({ duration: 150 });
        return;
      }

      if (event.key === "-") {
        event.preventDefault();
        reactFlow.zoomOut({ duration: 150 });
        return;
      }

      if (isModifierPressed && event.key.toLowerCase() === "z") {
        event.preventDefault();
        if (event.shiftKey) {
          redo();
        } else {
          undo();
        }
        return;
      }

      if (isModifierPressed && event.key.toLowerCase() === "y") {
        event.preventDefault();
        redo();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [reactFlow, redo, undo]);
}
