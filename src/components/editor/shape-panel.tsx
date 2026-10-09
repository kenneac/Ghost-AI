"use client";

import {
  Circle,
  Cylinder,
  Diamond,
  Hexagon,
  RectangleHorizontal,
  Scan,
} from "lucide-react";
import { useState } from "react";

import { NODE_SHAPES, type NodeShape } from "@/types/canvas";
import { CanvasNodeShape } from "@/components/editor/canvas-node";

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
  const [preview, setPreview] = useState<{ shape: NodeShape; x: number; y: number } | null>(null);
  const previewSize = preview ? SHAPE_SIZES[preview.shape] : null;

  return (
    <>
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
                const bounds = event.currentTarget.getBoundingClientRect();
                event.dataTransfer.setData(
                  "application/ghost-ai-shape",
                  JSON.stringify({
                    shape,
                    ...SHAPE_SIZES[shape],
                    grabOffsetX: event.clientX - bounds.left,
                    grabOffsetY: event.clientY - bounds.top,
                  }),
                );
                event.dataTransfer.effectAllowed = "copy";
                setPreview({ shape, x: event.clientX, y: event.clientY });
              }}
              onDrag={(event) => {
                if (event.clientX || event.clientY) {
                  setPreview((current) => current ? { ...current, x: event.clientX, y: event.clientY } : current);
                }
              }}
              onDragEnd={() => setPreview(null)}
              className="flex h-10 w-10 cursor-grab items-center justify-center rounded-full text-copy-secondary transition-colors hover:bg-bg-subtle hover:text-brand active:cursor-grabbing"
            >
              <Icon aria-hidden="true" className="h-5 w-5" />
            </button>
          );
        })}
      </div>
      {preview && previewSize ? (
        <div
          aria-hidden="true"
          className="pointer-events-none fixed z-[100] opacity-60"
          style={{
            left: preview.x,
            top: preview.y,
            width: previewSize.width,
            height: previewSize.height,
            transform: "translate(-50%, -50%)",
          }}
        >
          <CanvasNodeShape
            shape={preview.shape}
            selected={false}
            width={previewSize.width}
            height={previewSize.height}
            color="#1F1F1F"
            textColor="#EDEDED"
            label=""
          />
        </div>
      ) : null}
    </>
  );
}
