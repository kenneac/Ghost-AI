import type { Edge, Node } from "@xyflow/react";

export type CanvasNodeData = {
  label: string;
  color: string;
  textColor?: string;
  shape: string;
};

export type CanvasEdgeData = {
  label?: string;
};

export type CanvasNode = Node<CanvasNodeData, "canvasNode">;
export type CanvasEdge = Edge<CanvasEdgeData, "canvasEdge">;

export const NODE_COLORS = [
  { background: "#1F1F1F", text: "#EDEDED" },
  { background: "#10233D", text: "#52A8FF" },
  { background: "#2E1938", text: "#BF7AF0" },
  { background: "#331B00", text: "#FF990A" },
  { background: "#3C1618", text: "#FF6166" },
  { background: "#3A1726", text: "#F75F8F" },
  { background: "#0F2E18", text: "#62C073" },
  { background: "#062822", text: "#0AC7B4" },
] as const;

export const NODE_SHAPES = [
  "rectangle",
  "diamond",
  "circle",
  "pill",
  "cylinder",
  "hexagon",
] as const;

export type NodeShape = (typeof NODE_SHAPES)[number];
