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
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

import type { CanvasEdge, CanvasNode } from "@/types/canvas";

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

function FlowCanvas() {
  const { nodes, edges, onNodesChange, onEdgesChange, onConnect } =
    useLiveblocksFlow<CanvasNode, CanvasEdge>({
      nodes: { initial: [] },
      edges: { initial: [] },
      suspense: true,
    });

  return (
    <div className="relative h-full w-full">
      <ReactFlowProvider>
        <CanvasConnectionState />
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          connectionMode={ConnectionMode.Loose}
          fitView
        >
          <MiniMap />
          <Background variant={BackgroundVariant.Dots} />
        </ReactFlow>
      </ReactFlowProvider>
    </div>
  );
}

export function CollaborativeCanvas({ roomId }: { roomId: string }) {
  return (
    <ClientSideSuspense fallback={<CanvasLoading />}>
      <FlowCanvas key={roomId} />
    </ClientSideSuspense>
  );
}
