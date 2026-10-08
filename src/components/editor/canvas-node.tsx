"use client";

import { Handle, Position, type NodeProps } from "@xyflow/react";

import type { CanvasNode } from "@/types/canvas";

export function CanvasNodeView({ data }: NodeProps<CanvasNode>) {
  return (
    <div
      className="flex min-h-20 min-w-32 items-center justify-center rounded-xl border border-surface-border px-5 py-4 text-center text-sm text-copy-primary"
      style={{ backgroundColor: data.color }}
    >
      <Handle type="target" position={Position.Top} className="!h-2 !w-2 !border-0 !bg-white opacity-0 transition-opacity hover:opacity-100" />
      <span>{data.label}</span>
      <Handle type="source" position={Position.Bottom} className="!h-2 !w-2 !border-0 !bg-white opacity-0 transition-opacity hover:opacity-100" />
    </div>
  );
}
