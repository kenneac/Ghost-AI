"use client";

import {
  Circle,
  Cylinder,
  Diamond,
  Hexagon,
  RectangleHorizontal,
  Scan,
} from "lucide-react";

import { NODE_SHAPES, type NodeShape } from "@/types/canvas";

const SHAPE_SIZES: Record<NodeShape, { width: number; height: number }> = {
  rectangle: { width: 180, height: 100 },
  diamond: { width: 150, height: 150 },
  circle: { width: 120, height: 120 },
  pill: { width: 180, height: 80 },
  cylinder: { width: 140, height: 120 },
  hexagon: { width: 160, height: 110 },
};

const SHAPE_ICONS = {
  rectangle: RectangleHorizontal,
  diamond: Diamond,
  circle: Circle,
  pill: Scan,
  cylinder: Cylinder,
  hexagon: Hexagon,
} satisfies Record<NodeShape, typeof Circle>;

export function ShapePanel() {
  return (
    <div
      aria-label="Add a shape to the canvas"
      className="absolute bottom-6 left-1/2 z-10 flex -translate-x-1/2 items-center gap-1 rounded-full border border-surface-border bg-surface/95 p-2 shadow-xl backdrop-blur"
    >
      {NODE_SHAPES.map((shape) => {
        const Icon = SHAPE_ICONS[shape];
        return (
          <button
            key={shape}
            type="button"
            draggable
            aria-label={`Drag ${shape} onto the canvas`}
            title={shape}
            onDragStart={(event) => {
              event.dataTransfer.setData(
                "application/ghost-ai-shape",
                JSON.stringify({ shape, ...SHAPE_SIZES[shape] }),
              );
              event.dataTransfer.effectAllowed = "copy";
            }}
            className="flex h-10 w-10 cursor-grab items-center justify-center rounded-full text-copy-secondary transition-colors hover:bg-bg-subtle hover:text-brand active:cursor-grabbing"
          >
            <Icon aria-hidden="true" className="h-5 w-5" />
          </button>
        );
      })}
    </div>
  );
}
