"use client";

import {
  EdgeLabelRenderer,
  getSmoothStepPath,
  useReactFlow,
  type EdgeProps,
} from "@xyflow/react";
import { useCallback, useEffect, useState } from "react";

import type { CanvasEdge, CanvasNode } from "@/types/canvas";

export function CanvasEdgeView({
  id,
  data,
  markerEnd,
  selected,
  sourcePosition,
  sourceX,
  sourceY,
  targetPosition,
  targetX,
  targetY,
}: EdgeProps<CanvasEdge>) {
  const { setEdges } = useReactFlow<CanvasNode, CanvasEdge>();
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState(data?.label ?? "");
  const [isHovered, setIsHovered] = useState(false);

  const [path, labelX, labelY] = getSmoothStepPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
    borderRadius: 14,
  });

  useEffect(() => {
    setDraft(data?.label ?? "");
  }, [data?.label]);

  const commitLabel = useCallback(() => {
    const nextValue = draft.trim();
    setIsEditing(false);

    if (nextValue === (data?.label ?? "")) {
      setDraft(data?.label ?? "");
      return;
    }

    setEdges((currentEdges) =>
      currentEdges.map((edge) =>
        edge.id === id
          ? {
              ...edge,
              data: { ...edge.data, label: nextValue || undefined },
            }
          : edge,
      ),
    );
  }, [data?.label, draft, id, setEdges]);

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLInputElement>) => {
      if (event.key === "Enter") {
        event.preventDefault();
        event.stopPropagation();
        commitLabel();
        return;
      }

      if (event.key === "Escape") {
        event.preventDefault();
        event.stopPropagation();
        setDraft(data?.label ?? "");
        setIsEditing(false);
      }
    },
    [commitLabel, data?.label],
  );

  const strokeColor =
    selected || isHovered
      ? "var(--accent-primary)"
      : "rgba(226, 232, 240, 0.72)";
  const showHint = (selected || isHovered) && !data?.label && !isEditing;

  return (
    <>
      <path
        d={path}
        fill="none"
        stroke="transparent"
        strokeWidth={16}
        strokeLinecap="round"
        strokeLinejoin="round"
        className="cursor-pointer"
        onDoubleClick={(event) => {
          event.preventDefault();
          event.stopPropagation();
          setIsEditing(true);
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onMouseDown={(event) => event.stopPropagation()}
      />
      <path
        d={path}
        fill="none"
        stroke={strokeColor}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity={selected || isHovered ? 1 : 0.7}
        markerEnd={markerEnd}
        className="transition-all duration-150"
        onDoubleClick={(event) => {
          event.preventDefault();
          event.stopPropagation();
          setIsEditing(true);
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onMouseDown={(event) => event.stopPropagation()}
      />

      <EdgeLabelRenderer>
        <div
          className="nodrag nopan pointer-events-auto"
          style={{
            position: "absolute",
            left: labelX,
            top: labelY,
            transform: "translate(-50%, -50%)",
            pointerEvents: "all",
          }}
          onMouseDown={(event) => {
            event.preventDefault();
            event.stopPropagation();
          }}
          onPointerDown={(event) => {
            event.preventDefault();
            event.stopPropagation();
          }}
        >
          {isEditing ? (
            <input
              autoFocus
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              onBlur={commitLabel}
              onKeyDown={handleKeyDown}
              onMouseDown={(event) => {
                event.preventDefault();
                event.stopPropagation();
              }}
              onPointerDown={(event) => {
                event.preventDefault();
                event.stopPropagation();
              }}
              className="nodrag nopan rounded-full border border-surface-border bg-surface/95 px-2 py-1 text-[10px] leading-none text-copy-primary shadow-lg outline-none ring-0"
              style={{
                width: `${Math.max(72, draft.length * 7 + 20)}px`,
                minWidth: "72px",
                maxWidth: "180px",
                color: "var(--text-primary)",
              }}
            />
          ) : data?.label ? (
            <div className="rounded-full border border-surface-border bg-surface/90 px-2 py-1 text-[10px] leading-none text-copy-secondary shadow-sm backdrop-blur-sm">
              {data.label}
            </div>
          ) : showHint ? (
            <div className="rounded-full border border-dashed border-surface-border/80 bg-surface/70 px-2 py-1 text-[10px] leading-none text-copy-muted shadow-sm backdrop-blur-sm">
              Label
            </div>
          ) : null}
        </div>
      </EdgeLabelRenderer>
    </>
  );
}
