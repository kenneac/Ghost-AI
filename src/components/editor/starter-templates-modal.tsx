"use client";

import { ArrowRight, Layers3 } from "lucide-react";

import type { CanvasTemplate } from "@/components/editor/starter-templates";
import { CANVAS_TEMPLATES } from "@/components/editor/starter-templates";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { CanvasNode } from "@/types/canvas";

interface StarterTemplatesModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onImport: (template: CanvasTemplate) => void;
}

function shapeStyle(node: CanvasNode): React.CSSProperties {
  const base: React.CSSProperties = {
    backgroundColor: node.data.color,
    color: node.data.textColor ?? "#EDEDED",
    border: `1px solid ${node.data.textColor ?? "#EDEDED"}`,
    borderRadius: 4,
  };
  if (node.data.shape === "pill") base.borderRadius = 999;
  if (node.data.shape === "circle") base.borderRadius = "50%";
  if (node.data.shape === "diamond") base.clipPath = "polygon(50% 0, 100% 50%, 50% 100%, 0 50%)";
  if (node.data.shape === "hexagon") base.clipPath = "polygon(20% 0, 80% 0, 100% 50%, 80% 100%, 20% 100%, 0 50%)";
  if (node.data.shape === "cylinder") base.borderRadius = "50% / 16%";
  return base;
}

function TemplatePreview({ template }: { template: CanvasTemplate }) {
  const width = 320;
  const height = 150;
  const padding = 18;
  const bounds = template.nodes.reduce(
    (result, node) => ({
      minX: Math.min(result.minX, node.position.x),
      minY: Math.min(result.minY, node.position.y),
      maxX: Math.max(result.maxX, node.position.x + (node.width ?? 180)),
      maxY: Math.max(result.maxY, node.position.y + (node.height ?? 88)),
    }),
    { minX: Infinity, minY: Infinity, maxX: -Infinity, maxY: -Infinity },
  );
  const contentWidth = Math.max(bounds.maxX - bounds.minX, 1);
  const contentHeight = Math.max(bounds.maxY - bounds.minY, 1);
  const scale = Math.min((width - padding * 2) / contentWidth, (height - padding * 2) / contentHeight);
  const point = (node: CanvasNode) => ({
    x: padding + (node.position.x - bounds.minX) * scale,
    y: padding + (node.position.y - bounds.minY) * scale,
    width: (node.width ?? 180) * scale,
    height: (node.height ?? 88) * scale,
  });
  const nodeById = new Map(template.nodes.map((node) => [node.id, node]));

  return (
    <div className="overflow-hidden rounded-xl border border-surface-border bg-base p-2">
      <svg viewBox={`0 0 ${width} ${height}`} className="h-[150px] w-full" role="img" aria-label={`${template.name} diagram preview`}>
        {template.edges.map((edge) => {
          const source = nodeById.get(edge.source);
          const target = nodeById.get(edge.target);
          if (!source || !target) return null;
          const from = point(source);
          const to = point(target);
          return <line key={edge.id} x1={from.x + from.width / 2} y1={from.y + from.height / 2} x2={to.x + to.width / 2} y2={to.y + to.height / 2} stroke="var(--border-subtle)" strokeWidth="1.5" />;
        })}
        {template.nodes.map((node) => {
          const position = point(node);
          return (
            <g key={node.id}>
              <foreignObject x={position.x} y={position.y} width={position.width} height={position.height}>
                <div className="flex h-full w-full items-center justify-center overflow-hidden px-1 text-center text-[8px] leading-tight" style={shapeStyle(node)}>
                  {node.data.label}
                </div>
              </foreignObject>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

export function StarterTemplatesModal({ open, onOpenChange, onImport }: StarterTemplatesModalProps) {
  const importTemplate = (template: CanvasTemplate) => {
    onImport(template);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90dvh] overflow-hidden rounded-3xl border border-surface-border bg-surface text-copy-primary sm:max-w-4xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg"><Layers3 className="h-5 w-5 text-brand" />Starter templates</DialogTitle>
          <DialogDescription className="text-copy-muted">Choose a diagram to replace the current canvas.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 overflow-y-auto p-1 sm:grid-cols-2 lg:grid-cols-3">
          {CANVAS_TEMPLATES.map((template) => (
            <article key={template.id} className="flex flex-col gap-3 rounded-2xl border border-surface-border bg-elevated p-3">
              <TemplatePreview template={template} />
              <div className="flex-1">
                <h3 className="text-sm font-medium text-copy-primary">{template.name}</h3>
                <p className="mt-1 text-xs leading-relaxed text-copy-muted">{template.description}</p>
              </div>
              <Button type="button" size="sm" className="w-full gap-2" onClick={() => importTemplate(template)}>
                Import template <ArrowRight className="h-4 w-4" />
              </Button>
            </article>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
