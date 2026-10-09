import type { CanvasEdge, CanvasNode, NodeShape } from "@/types/canvas";
import { NODE_COLORS } from "@/types/canvas";

export interface CanvasTemplate {
  id: string;
  name: string;
  description: string;
  nodes: CanvasNode[];
  edges: CanvasEdge[];
}

function makeNode(
  id: string,
  label: string,
  x: number,
  y: number,
  shape: NodeShape,
  colorIndex: number,
): CanvasNode {
  const color = NODE_COLORS[colorIndex % NODE_COLORS.length];
  return {
    id,
    type: "canvasNode",
    position: { x, y },
    width: 180,
    height: 88,
    data: { label, shape, color: color.background, textColor: color.text },
  };
}

function makeEdge(id: string, source: string, target: string): CanvasEdge {
  return { id, source, target, type: "canvasEdge" };
}

export const CANVAS_TEMPLATES: CanvasTemplate[] = [
  {
    id: "microservices",
    name: "Microservices",
    description: "A gateway routes requests to independently deployed services and their data stores.",
    nodes: [
      makeNode("gateway", "API Gateway", 0, 120, "hexagon", 1),
      makeNode("users", "User Service", 280, 0, "pill", 2),
      makeNode("orders", "Order Service", 280, 120, "pill", 3),
      makeNode("catalog", "Catalog Service", 280, 240, "pill", 4),
      makeNode("user-db", "User DB", 560, 0, "cylinder", 5),
      makeNode("order-db", "Order DB", 560, 120, "cylinder", 6),
      makeNode("catalog-db", "Catalog DB", 560, 240, "cylinder", 7),
    ],
    edges: [
      makeEdge("gateway-users", "gateway", "users"),
      makeEdge("gateway-orders", "gateway", "orders"),
      makeEdge("gateway-catalog", "gateway", "catalog"),
      makeEdge("users-db", "users", "user-db"),
      makeEdge("orders-db", "orders", "order-db"),
      makeEdge("catalog-db", "catalog", "catalog-db"),
    ],
  },
  {
    id: "cicd-pipeline",
    name: "CI/CD Pipeline",
    description: "Code changes move through automated build, test, and deployment stages.",
    nodes: [
      makeNode("source", "Git Repository", 0, 100, "cylinder", 1),
      makeNode("build", "Build", 250, 100, "pill", 2),
      makeNode("tests", "Automated Tests", 500, 100, "diamond", 3),
      makeNode("staging", "Staging", 750, 100, "rectangle", 4),
      makeNode("production", "Production", 1000, 100, "rectangle", 6),
    ],
    edges: [
      makeEdge("source-build", "source", "build"),
      makeEdge("build-tests", "build", "tests"),
      makeEdge("tests-staging", "tests", "staging"),
      makeEdge("staging-production", "staging", "production"),
    ],
  },
  {
    id: "event-driven",
    name: "Event-Driven System",
    description: "Producers publish events to a broker that fans out to consumers and storage.",
    nodes: [
      makeNode("producer", "Order API", 0, 120, "pill", 1),
      makeNode("broker", "Event Broker", 280, 120, "hexagon", 3),
      makeNode("email", "Email Worker", 600, 0, "pill", 2),
      makeNode("inventory", "Inventory Worker", 600, 120, "pill", 4),
      makeNode("analytics", "Analytics", 600, 240, "pill", 5),
      makeNode("event-store", "Event Store", 900, 120, "cylinder", 7),
    ],
    edges: [
      makeEdge("producer-broker", "producer", "broker"),
      makeEdge("broker-email", "broker", "email"),
      makeEdge("broker-inventory", "broker", "inventory"),
      makeEdge("broker-analytics", "broker", "analytics"),
      makeEdge("broker-store", "broker", "event-store"),
    ],
  },
];
