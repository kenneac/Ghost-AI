"use client";

import { useLiveblocksFlow } from "@liveblocks/react-flow";
import { ClientSideSuspense, useStatus } from "@liveblocks/react/suspense";
import {
  Background,
  BackgroundVariant,
  ConnectionMode,
  MiniMap,
  ReactFlow,
  ReactFlowProvider,
  useReactFlow,
} from "@xyflow/react";
import { useCallback } from "react";
import "@xyflow/react/dist/style.css";

import type { CanvasEdge, CanvasNode } from "@/types/canvas";
import { NODE_COLORS, NODE_SHAPES, type NodeShape } from "@/types/canvas";
import { CanvasNodeView } from "@/components/editor/canvas-node";
import { ShapePanel } from "@/components/editor/shape-panel";

const NODE_TYPES = { canvasNode: CanvasNodeView };
const SHAPE_DRAG_TYPE = "application/ghost-ai-shape";
let nodeCounter = 0;

interface ShapeDragPayload {
  shape: NodeShape;
  width: number;
  height: number;
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
    <div role="status" className="absolute left-4 top-4 z-10 rounded-xl border border-surface-border bg-surface px-3 py-2 text-xs text-copy-muted">
      {status === "connecting" || status === "reconnecting"
        ? "Reconnecting to the shared canvas…"
        : "Could not connect to the shared canvas. Check your connection and refresh."}
    </div>
  );
}

function FlowCanvasContent() {
  const { nodes, edges, onNodesChange, onEdgesChange, onConnect } =
    useLiveblocksFlow<CanvasNode, CanvasEdge>({
      nodes: { initial: [] },
      edges: { initial: [] },
      suspense: true,
    });
  const { screenToFlowPosition } = useReactFlow<CanvasNode, CanvasEdge>();

  const handleDrop = useCallback((event: React.DragEvent<HTMLDivElement>) => {
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
    ) return;

    const position = screenToFlowPosition({ x: event.clientX, y: event.clientY });
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
  }, [onNodesChange, screenToFlowPosition]);

  return (
    <div
      className="relative h-full w-full"
      onDragOver={(event) => {
        if (event.dataTransfer.types.includes(SHAPE_DRAG_TYPE)) {
          event.preventDefault();
          event.dataTransfer.dropEffect = "copy";
        }
      }}
      onDrop={handleDrop}
    >
      <CanvasConnectionState />
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={NODE_TYPES}
        connectionMode={ConnectionMode.Loose}
        fitView
      >
        <ShapePanel />
        <MiniMap />
        <Background variant={BackgroundVariant.Dots} />
      </ReactFlow>
    </div>
  );
}

function FlowCanvas() {
  return (
    <ReactFlowProvider>
      <FlowCanvasContent />
    </ReactFlowProvider>
  );
}

export function CollaborativeCanvas({ roomId }: { roomId: string }) {
  return (
    <ClientSideSuspense fallback={<CanvasLoading />}>
      <FlowCanvas key={roomId} />
    </ClientSideSuspense>
  );
}
