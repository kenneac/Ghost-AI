"use client";

import { Handle, NodeResizer, Position, useReactFlow, type NodeProps } from "@xyflow/react";
import { Check } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

import { NODE_COLORS, type CanvasNode } from "@/types/canvas";

interface CanvasNodeShapeProps {
  shape: string;
  selected: boolean;
  width: number;
  height: number;
  color: string;
  textColor: string;
  label: string;
}

export function CanvasNodeShape({
  shape,
  selected,
  width,
  height,
  color,
  textColor,
  label,
}: CanvasNodeShapeProps) {
  const borderColor = selected ? "var(--accent-primary)" : "var(--border-default)";
  const shapeStyle = {
    width: "100%",
    height: "100%",
    fill: color,
    stroke: borderColor,
    strokeWidth: selected ? 2 : 1,
    vectorEffect: "non-scaling-stroke" as const,
  };

  let visual: React.ReactNode;

  switch (shape) {
    case "diamond":
      visual = (
        <svg aria-hidden="true" className="absolute inset-0" viewBox="0 0 100 100" preserveAspectRatio="none">
          <polygon points="50,1 99,50 50,99 1,50" style={shapeStyle} />
        </svg>
      );
      break;
    case "hexagon":
      visual = (
        <svg aria-hidden="true" className="absolute inset-0" viewBox="0 0 100 100" preserveAspectRatio="none">
          <polygon points="25,1 75,1 99,50 75,99 25,99 1,50" style={shapeStyle} />
        </svg>
      );
      break;
    case "cylinder":
      visual = (
        <svg aria-hidden="true" className="absolute inset-0" viewBox="0 0 100 100" preserveAspectRatio="none">
          <path d="M1 12 C1 2 99 2 99 12 L99 88 C99 98 1 98 1 88 Z" style={shapeStyle} />
          <path d="M1 12 C1 22 99 22 99 12" fill="none" stroke={borderColor} strokeWidth={selected ? 2 : 1} vectorEffect="non-scaling-stroke" />
        </svg>
      );
      break;
    default:
      break;
  }

  const cssShape = shape === "circle" ? "rounded-full" : shape === "pill" ? "rounded-full" : "rounded-xl";
  const usesSvg = shape === "diamond" || shape === "hexagon" || shape === "cylinder";

  return (
    <div
      className={`relative flex h-full w-full items-center justify-center px-5 py-4 text-center text-sm text-copy-primary ${
        usesSvg ? "" : `border ${cssShape}`
      }`}
      style={{
        width,
        height,
        backgroundColor: usesSvg ? "transparent" : color,
        borderColor: usesSvg ? undefined : borderColor,
        borderWidth: usesSvg ? undefined : selected ? 2 : 1,
      }}
    >
      {visual}
      <span className="relative z-[1] max-w-full overflow-hidden text-ellipsis" style={{ color: textColor }}>{label}</span>
    </div>
  );
}

export function CanvasNodeView({ data, selected, width, height, id }: NodeProps<CanvasNode>) {
  const { updateNodeData } = useReactFlow<CanvasNode>();
  const [isEditing, setIsEditing] = useState(false);
  const [label, setLabel] = useState(data.label);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => setLabel(data.label), [data.label]);
  useEffect(() => {
    if (isEditing) textareaRef.current?.focus();
  }, [isEditing]);

  const commitLabel = useCallback(() => {
    setIsEditing(false);
    if (label !== data.label) updateNodeData(id, { label });
  }, [data.label, id, label, updateNodeData]);

  return (
    <div className="group relative" style={{ width, height }}>
      <NodeResizer
        isVisible={selected}
        minWidth={80}
        minHeight={60}
        color="var(--accent-primary)"
        handleClassName="!h-2 !w-2 !rounded-sm !border !border-surface-border !bg-elevated"
        lineClassName="!border-brand/50"
      />
      <Handle type="target" position={Position.Top} className="!h-2 !w-2 !border-0 !bg-white opacity-0 transition-opacity group-hover:opacity-100" />
      <Handle type="target" position={Position.Left} className="!h-2 !w-2 !border-0 !bg-white opacity-0 transition-opacity group-hover:opacity-100" />
      <CanvasNodeShape
        shape={data.shape}
        selected={selected}
        width={width ?? 180}
        height={height ?? 100}
        color={data.color}
        textColor={data.textColor ?? NODE_COLORS[0].text}
        label={label}
      />
      {selected && !isEditing ? (
        <div
          aria-label="Node color themes"
          role="toolbar"
          className="nodrag nopan absolute bottom-full left-1/2 z-30 mb-3 flex -translate-x-1/2 items-center gap-1.5 rounded-full border border-surface-border bg-surface/95 p-1.5 shadow-lg backdrop-blur"
          onMouseDown={(event) => event.stopPropagation()}
          onClick={(event) => event.stopPropagation()}
        >
          {NODE_COLORS.map((colorPair, index) => {
            const isActive = data.color === colorPair.background && (data.textColor ?? NODE_COLORS[0].text) === colorPair.text;
            return (
              <button
                key={colorPair.background}
                type="button"
                aria-label={`Set node color theme ${index + 1}`}
                aria-pressed={isActive}
                title={`Color theme ${index + 1}`}
                onClick={() => updateNodeData(id, { color: colorPair.background, textColor: colorPair.text })}
                className={`flex h-6 w-6 items-center justify-center rounded-full border transition-shadow hover:shadow-[0_0_7px_1px_var(--swatch-glow)] ${isActive ? "border-copy-primary ring-2 ring-brand/60" : "border-surface-border"}`}
                style={{
                  backgroundColor: colorPair.background,
                  ["--swatch-glow" as string]: colorPair.text,
                }}
              >
                {isActive ? <Check aria-hidden="true" className="h-3 w-3" style={{ color: colorPair.text }} /> : null}
              </button>
            );
          })}
        </div>
      ) : null}
      {isEditing ? (
        <textarea
          ref={textareaRef}
          aria-label="Edit node label"
          value={label}
          onChange={(event) => {
            setLabel(event.target.value);
            updateNodeData(id, { label: event.target.value });
          }}
          onBlur={commitLabel}
          onKeyDown={(event) => {
            event.stopPropagation();
            if (event.key === "Escape") {
              setLabel(data.label);
              setIsEditing(false);
            }
          }}
          onMouseDown={(event) => event.stopPropagation()}
          onClick={(event) => event.stopPropagation()}
          className="nodrag nopan absolute inset-0 z-20 m-auto h-10 w-[calc(100%-2rem)] resize-none overflow-hidden border-0 bg-transparent px-2 py-2 text-center text-sm leading-5 outline-none placeholder:text-copy-muted"
          style={{ color: data.textColor ?? NODE_COLORS[0].text }}
        />
      ) : (
        <button
          type="button"
          aria-label={label ? `Edit label: ${label}` : "Edit node label"}
          onDoubleClick={(event) => {
            event.stopPropagation();
            setIsEditing(true);
          }}
          onMouseDown={(event) => event.stopPropagation()}
          onClick={(event) => event.stopPropagation()}
          className="nodrag nopan absolute inset-0 z-10 flex items-center justify-center bg-transparent text-sm text-copy-muted"
        >
          {!label ? <span className="pointer-events-none">Double-click to add label</span> : null}
        </button>
      )}
      <Handle type="source" position={Position.Right} className="!h-2 !w-2 !border-0 !bg-white opacity-0 transition-opacity group-hover:opacity-100" />
      <Handle type="source" position={Position.Bottom} className="!h-2 !w-2 !border-0 !bg-white opacity-0 transition-opacity group-hover:opacity-100" />
    </div>
  );
}
