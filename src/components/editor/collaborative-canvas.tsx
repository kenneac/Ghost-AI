"use client";

import { useUser } from "@clerk/nextjs";
import {
  useCanRedo,
  useCanUndo,
  useMyPresence,
  useOthers,
  useRedo,
  useUndo,
} from "@liveblocks/react";
import { useLiveblocksFlow } from "@liveblocks/react-flow";
import { ClientSideSuspense, useStatus } from "@liveblocks/react/suspense";
import {
  Background,
  BackgroundVariant,
  ConnectionMode,
  MarkerType,
  ReactFlow,
  ReactFlowProvider,
  useReactFlow,
} from "@xyflow/react";
import { Minus, Plus, RotateCcw, RotateCw, ScanLine } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef } from "react";
import { UserButton } from "@clerk/nextjs";
import "@xyflow/react/dist/style.css";

import type { CanvasEdge, CanvasNode } from "@/types/canvas";
import { NODE_COLORS, NODE_SHAPES, type NodeShape } from "@/types/canvas";
import { CanvasEdgeView } from "@/components/editor/canvas-edge";
import { CanvasNodeView } from "@/components/editor/canvas-node";
import type { CanvasTemplate } from "@/components/editor/starter-templates";
import { ShapePanel } from "@/components/editor/shape-panel";
import { useKeyboardShortcuts } from "@/hooks/use-keyboard-shortcuts";

const NODE_TYPES = { canvasNode: CanvasNodeView };
const EDGE_TYPES = { canvasEdge: CanvasEdgeView };
const SHAPE_DRAG_TYPE = "application/ghost-ai-shape";
let nodeCounter = 0;

interface ShapeDragPayload {
  shape: NodeShape;
  width: number;
  height: number;
}

function getUserIdFromPresence(
  user:
    | { id?: string | null; info?: Record<string, unknown> | null }
    | null
    | undefined,
) {
  if (!user) return null;

  if (typeof user.id === "string" && user.id.length > 0) {
    return user.id;
  }

  if (user.info && typeof user.info === "object" && "id" in user.info) {
    const maybeId = user.info.id;
    if (typeof maybeId === "string" && maybeId.length > 0) {
      return maybeId;
    }
  }

  return null;
}

function getInitials(name: string) {
  return (
    name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() ?? "")
      .join("") || "?"
  );
}

function CanvasLoading() {
  return (
    <div className="flex h-full w-full items-center justify-center text-sm text-copy-muted">
      Connecting to shared canvas…
    </div>
  );
}

function CanvasConnectionState() {
  const status = useStatus();

  if (status === "connected") return null;

  return (
    <div
      role="status"
      className="absolute left-4 top-4 z-10 rounded-xl border border-surface-border bg-surface px-3 py-2 text-xs text-copy-muted"
    >
      {status === "connecting" || status === "reconnecting"
        ? "Reconnecting to the shared canvas…"
        : "Could not connect to the shared canvas. Check your connection and refresh."}
    </div>
  );
}

function ControlButton({
  label,
  title,
  onClick,
  disabled = false,
  children,
}: {
  label: string;
  title: string;
  onClick: () => void;
  disabled?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={title}
      onClick={onClick}
      disabled={disabled}
      className="flex h-8 w-8 items-center justify-center rounded-full text-copy-secondary transition-colors hover:bg-bg-subtle hover:text-brand disabled:cursor-not-allowed disabled:text-copy-muted disabled:hover:bg-transparent disabled:opacity-50"
    >
      {children}
    </button>
  );
}

function CanvasControls() {
  const reactFlow = useReactFlow<CanvasNode, CanvasEdge>();
  const undo = useUndo();
  const redo = useRedo();
  const canUndo = useCanUndo();
  const canRedo = useCanRedo();

  const handleZoomIn = useCallback(() => {
    reactFlow.zoomIn({ duration: 180 });
  }, [reactFlow]);

  const handleZoomOut = useCallback(() => {
    reactFlow.zoomOut({ duration: 180 });
  }, [reactFlow]);

  const handleFitView = useCallback(() => {
    reactFlow.fitView({ duration: 200, padding: 0.2 });
  }, [reactFlow]);

  const handleUndo = useCallback(() => {
    if (canUndo) {
      undo();
    }
  }, [canUndo, undo]);

  const handleRedo = useCallback(() => {
    if (canRedo) {
      redo();
    }
  }, [canRedo, redo]);

  useKeyboardShortcuts({
    reactFlow,
    undo: handleUndo,
    redo: handleRedo,
  });

  return (
    <div className="absolute bottom-28 left-4 z-20 flex items-center rounded-full border border-surface-border bg-surface/95 p-1 shadow-xl backdrop-blur-sm">
      <div className="flex items-center gap-1">
        <ControlButton
          label="Zoom out"
          title="Zoom out"
          onClick={handleZoomOut}
        >
          <Minus aria-hidden="true" className="h-4 w-4" />
        </ControlButton>
        <ControlButton
          label="Fit view"
          title="Fit view"
          onClick={handleFitView}
        >
          <ScanLine aria-hidden="true" className="h-4 w-4" />
        </ControlButton>
        <ControlButton label="Zoom in" title="Zoom in" onClick={handleZoomIn}>
          <Plus aria-hidden="true" className="h-4 w-4" />
        </ControlButton>
      </div>
      <div className="mx-1 h-7 w-px bg-surface-border" />
      <div className="flex items-center gap-1">
        <ControlButton
          label="Undo"
          title="Undo"
          onClick={handleUndo}
          disabled={!canUndo}
        >
          <RotateCcw aria-hidden="true" className="h-4 w-4" />
        </ControlButton>
        <ControlButton
          label="Redo"
          title="Redo"
          onClick={handleRedo}
          disabled={!canRedo}
        >
          <RotateCw aria-hidden="true" className="h-4 w-4" />
        </ControlButton>
      </div>
    </div>
  );
}

function CanvasPresenceStack() {
  const { user } = useUser();
  const others = useOthers();

  const collaborators = useMemo(
    () =>
      others.filter((other) => {
        const otherId = getUserIdFromPresence(other);
        return (
          otherId !== null && user?.id !== undefined && otherId !== user.id
        );
      }),
    [others, user?.id],
  );

  const visibleCollaborators = collaborators.slice(0, 5);
  const overflowCount = Math.max(
    collaborators.length - visibleCollaborators.length,
    0,
  );

  return (
    <div className="absolute right-4 top-4 z-20 flex items-center gap-3">
      {collaborators.length > 0 ? (
        <>
          <div className="flex items-center -space-x-2">
            {visibleCollaborators.map((member) => {
              const name = member.info?.name ?? "Collaborator";
              const avatar = member.info?.avatar;
              const color = member.info?.color ?? "#00c8d4";

              return (
                <div
                  key={member.connectionId}
                  className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full border-2 border-surface bg-surface ring-2 ring-surface shadow-sm"
                  aria-label={name}
                  title={name}
                  style={{ backgroundColor: avatar ? "transparent" : color }}
                >
                  {avatar ? (
                    <img
                      src={avatar}
                      alt={name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <span
                      className="text-[10px] font-medium text-copy-primary"
                      style={{ color: "rgba(8, 8, 9, 0.9)" }}
                    >
                      {getInitials(name)}
                    </span>
                  )}
                </div>
              );
            })}
            {overflowCount > 0 ? (
              <div className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-surface bg-subtle text-[10px] font-medium text-copy-secondary ring-2 ring-surface shadow-sm">
                +{overflowCount}
              </div>
            ) : null}
          </div>
          <div className="h-8 w-px bg-surface-border" />
        </>
      ) : null}

      <div className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full border border-surface-border bg-surface shadow-sm">
        <UserButton />
      </div>
    </div>
  );
}

function CanvasLiveCursors() {
  const others = useOthers();

  return (
    <div className="pointer-events-none absolute inset-0 z-30">
      {others.map((member) => {
        const cursor = member.presence?.cursor;
        const userId = getUserIdFromPresence(member);

        if (!cursor || !userId) {
          return null;
        }

        const color = member.info?.color ?? "#00c8d4";
        const name = member.info?.name ?? "Collaborator";

        return (
          <div
            key={member.connectionId}
            className="absolute"
            style={{
              left: cursor.x,
              top: cursor.y,
              transform: "translate(-2px, -2px)",
            }}
          >
            <div className="flex items-center gap-2">
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                aria-hidden="true"
                style={{ color }}
              >
                <path
                  d="M2 2L13 8L9 8.75L11 14L8.8 12.4L7.2 16L2 2Z"
                  fill="currentColor"
                />
              </svg>
              <span
                className="rounded-full border border-surface-border px-2 py-1 text-[10px] font-medium text-copy-primary shadow-sm"
                style={{ backgroundColor: color, color: "#080809" }}
              >
                {name}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function FlowCanvasContent({
  onRegisterImport,
}: {
  onRegisterImport: (
    importTemplate: (template: CanvasTemplate) => void,
  ) => void;
}) {
  const { nodes, edges, onNodesChange, onEdgesChange, onConnect } =
    useLiveblocksFlow<CanvasNode, CanvasEdge>({
      nodes: { initial: [] },
      edges: { initial: [] },
      suspense: true,
    });
  const { screenToFlowPosition } = useReactFlow<CanvasNode, CanvasEdge>();
  const reactFlow = useReactFlow<CanvasNode, CanvasEdge>();
  const [myPresence, updateMyPresence] = useMyPresence();
  const containerRef = useRef<HTMLDivElement | null>(null);

  const importTemplate = useCallback(
    (template: CanvasTemplate) => {
      if (nodes.length)
        onNodesChange(
          nodes.map((node) => ({ type: "remove" as const, id: node.id })),
        );
      if (edges.length)
        onEdgesChange(
          edges.map((edge) => ({ type: "remove" as const, id: edge.id })),
        );
      onNodesChange(
        template.nodes.map((node) => ({ type: "add" as const, item: node })),
      );
      onEdgesChange(
        template.edges.map((edge) => ({ type: "add" as const, item: edge })),
      );
      window.requestAnimationFrame(() =>
        reactFlow.fitView({ duration: 250, padding: 0.2 }),
      );
    },
    [edges, nodes, onEdgesChange, onNodesChange, reactFlow],
  );

  useEffect(
    () => onRegisterImport(importTemplate),
    [importTemplate, onRegisterImport],
  );

  const handleMouseMove = useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      const bounds = event.currentTarget.getBoundingClientRect();
      const cursor = {
        x: event.clientX - bounds.left,
        y: event.clientY - bounds.top,
      };

      updateMyPresence({
        cursor,
        thinking: myPresence?.thinking ?? false,
      });
    },
    [myPresence?.thinking, updateMyPresence],
  );

  const handleMouseLeave = useCallback(() => {
    updateMyPresence({
      cursor: null,
      thinking: myPresence?.thinking ?? false,
    });
  }, [myPresence?.thinking, updateMyPresence]);

  const handleDrop = useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      const rawPayload = event.dataTransfer.getData(SHAPE_DRAG_TYPE);
      if (!rawPayload) return;

      let payload: ShapeDragPayload;
      try {
        payload = JSON.parse(rawPayload) as ShapeDragPayload;
      } catch {
        return;
      }
      if (
        !NODE_SHAPES.includes(payload.shape) ||
        !Number.isFinite(payload.width) ||
        !Number.isFinite(payload.height)
      )
        return;

      const position = screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });
      nodeCounter += 1;
      const node: CanvasNode = {
        id: `${payload.shape}-${Date.now()}-${nodeCounter}`,
        type: "canvasNode",
        position,
        width: payload.width,
        height: payload.height,
        data: {
          label: "",
          color: NODE_COLORS[0].background,
          shape: payload.shape,
        },
      };
      onNodesChange([{ type: "add", item: node }]);
    },
    [onNodesChange, screenToFlowPosition],
  );

  return (
    <div
      ref={containerRef}
      className="relative h-full w-full"
      onDragOver={(event) => {
        if (event.dataTransfer.types.includes(SHAPE_DRAG_TYPE)) {
          event.preventDefault();
          event.dataTransfer.dropEffect = "copy";
        }
      }}
      onDrop={handleDrop}
    >
      <CanvasPresenceStack />
      <CanvasConnectionState />
      <CanvasControls />
      <CanvasLiveCursors />
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        nodeTypes={NODE_TYPES}
        edgeTypes={EDGE_TYPES}
        defaultEdgeOptions={{
          type: "canvasEdge",
          markerEnd: {
            type: MarkerType.ArrowClosed,
            width: 12,
            height: 12,
            color: "#f8fafc",
          },
          style: { stroke: "rgba(248, 250, 252, 0.8)", strokeWidth: 1.5 },
        }}
        connectionLineStyle={{
          stroke: "rgba(248, 250, 252, 0.8)",
          strokeWidth: 1.5,
        }}
        connectionMode={ConnectionMode.Loose}
        fitView
      >
        <ShapePanel />
        <Background variant={BackgroundVariant.Dots} />
      </ReactFlow>
    </div>
  );
}

function FlowCanvas({
  onRegisterImport,
}: {
  onRegisterImport: (
    importTemplate: (template: CanvasTemplate) => void,
  ) => void;
}) {
  return (
    <ReactFlowProvider>
      <FlowCanvasContent onRegisterImport={onRegisterImport} />
    </ReactFlowProvider>
  );
}

export function CollaborativeCanvas({
  roomId,
  onRegisterImport,
}: {
  roomId: string;
  onRegisterImport: (handler: (template: CanvasTemplate) => void) => void;
}) {
  return (
    <ClientSideSuspense fallback={<CanvasLoading />}>
      <FlowCanvas key={roomId} onRegisterImport={onRegisterImport} />
    </ClientSideSuspense>
  );
}
