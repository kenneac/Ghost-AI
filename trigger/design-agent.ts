import { google } from "@ai-sdk/google";
import { generateObject } from "ai";
import { LiveMap, LiveObject, type JsonObject, type LsonObject } from "@liveblocks/core";
import { Liveblocks } from "@liveblocks/node";
import { task } from "@trigger.dev/sdk";
import { z } from "zod";

import { NODE_COLORS, NODE_SHAPES } from "../src/types/canvas";

export type DesignAgentPayload = {
  prompt: string;
  roomId: string;
  projectId?: string;
};

const nodeSchema = z.object({
  id: z.string().min(1),
  label: z.string().min(1).max(100),
  shape: z.enum(NODE_SHAPES),
  colorIndex: z.number().int().min(0).max(NODE_COLORS.length - 1),
  x: z.number().finite(),
  y: z.number().finite(),
  width: z.number().finite().min(80).max(600),
  height: z.number().finite().min(60).max(400),
});

const actionSchema = z.discriminatedUnion("type", [
  z.object({ type: z.literal("addNode"), node: nodeSchema }),
  z.object({
    type: z.literal("moveNode"),
    nodeId: z.string().min(1),
    x: z.number().finite(),
    y: z.number().finite(),
  }),
  z.object({
    type: z.literal("resizeNode"),
    nodeId: z.string().min(1),
    width: z.number().finite().min(80).max(1000),
    height: z.number().finite().min(60).max(800),
  }),
  z.object({
    type: z.literal("updateNodeData"),
    nodeId: z.string().min(1),
    label: z.string().min(1).max(100).optional(),
    shape: z.enum(NODE_SHAPES).optional(),
    colorIndex: z.number().int().min(0).max(NODE_COLORS.length - 1).optional(),
  }),
  z.object({ type: z.literal("deleteNode"), nodeId: z.string().min(1) }),
  z.object({
    type: z.literal("addEdge"),
    id: z.string().min(1),
    source: z.string().min(1),
    target: z.string().min(1),
    label: z.string().max(100).optional(),
  }),
  z.object({ type: z.literal("deleteEdge"), edgeId: z.string().min(1) }),
]);

const designSchema = z.object({
  summary: z.string().min(1).max(300),
  actions: z.array(actionSchema).min(1).max(40),
});

type DesignAction = z.infer<typeof actionSchema>;
type JsonRecord = Record<string, unknown>;

const AI_USER_ID = "ghost-ai-agent";
const AI_USER_INFO = {
  name: "Ghost AI",
  color: "#8b82ff",
};
const FEED_ID = "ai-activity";
const STATUS_EVENT = "ai-status";

function getLiveblocksClient() {
  const secret = process.env.LIVEBLOCKS_SECRET_KEY;
  if (!secret) throw new Error("LIVEBLOCKS_SECRET_KEY is not configured");
  return new Liveblocks({ secret });
}

async function publishStatus(
  client: Liveblocks,
  roomId: string,
  status: "processing" | "complete" | "error",
  message: string,
) {
  const timestamp = new Date().toISOString();
  await client.broadcastEvent(roomId, {
    type: STATUS_EVENT,
    status,
    message,
    timestamp,
  });

  try {
    await client.getFeed({ roomId, feedId: FEED_ID });
  } catch {
    await client.createFeed({ roomId, feedId: FEED_ID });
  }

  try {
    await client.createFeedMessage({
      roomId,
      feedId: FEED_ID,
      data: {
        type: STATUS_EVENT,
        status,
        message,
        timestamp,
      },
    });
  } catch (error) {
    console.warn("Could not append AI status to the Liveblocks feed", error);
  }
}

function asRecord(value: unknown): JsonRecord | undefined {
  return value !== null && typeof value === "object"
    ? (value as JsonRecord)
    : undefined;
}

function updateActions(
  actions: DesignAction[],
  root: LiveObject<LsonObject>,
) {
  const flow = root.get("flow");
  if (!(flow instanceof LiveObject)) {
    throw new Error("Canvas storage is not initialized for this room");
  }

  const nodesValue = flow.get("nodes");
  const edgesValue = flow.get("edges");
  if (!(nodesValue instanceof LiveMap) || !(edgesValue instanceof LiveMap)) {
    throw new Error("Canvas node and edge maps are missing");
  }

  const nodes = nodesValue as LiveMap<string, LiveObject<LsonObject>>;
  const edges = edgesValue as LiveMap<string, LiveObject<LsonObject>>;

  for (const action of actions) {
    if (action.type === "addNode") {
      const color = NODE_COLORS[action.node.colorIndex];
      nodes.set(action.node.id, LiveObject.from({
        id: action.node.id,
        type: "canvasNode",
        position: { x: action.node.x, y: action.node.y },
        width: action.node.width,
        height: action.node.height,
        data: {
          label: action.node.label,
          shape: action.node.shape,
          color: color.background,
          textColor: color.text,
        },
      }) as LiveObject<LsonObject>);
      continue;
    }

    if (action.type === "addEdge") {
      if (!nodes.has(action.source) || !nodes.has(action.target)) {
        throw new Error(`Cannot connect missing node: ${action.source} → ${action.target}`);
      }
      edges.set(action.id, LiveObject.from({
        id: action.id,
        type: "canvasEdge",
        source: action.source,
        target: action.target,
        data: action.label ? { label: action.label } : {},
      }) as LiveObject<LsonObject>);
      continue;
    }

    if (action.type === "deleteEdge") {
      edges.delete(action.edgeId);
      continue;
    }

    if (action.type === "deleteNode") {
      nodes.delete(action.nodeId);
      for (const [edgeId, edge] of edges.entries()) {
        const edgeData = edge.toJSON() as JsonRecord;
        if (edgeData.source === action.nodeId || edgeData.target === action.nodeId) {
          edges.delete(edgeId);
        }
      }
      continue;
    }

    const node = nodes.get(action.nodeId);
    if (!node) throw new Error(`Cannot update missing node: ${action.nodeId}`);

    if (action.type === "moveNode") {
      node.set("position", { x: action.x, y: action.y });
      continue;
    }

    if (action.type === "resizeNode") {
      node.set("width", action.width);
      node.set("height", action.height);
      continue;
    }

    const dataValue = node.get("data");
    const data = dataValue instanceof LiveObject
      ? dataValue
      : asRecord(dataValue)
        ? LiveObject.from(asRecord(dataValue) as JsonObject)
        : undefined;
    if (!data) throw new Error(`Node data is missing: ${action.nodeId}`);
    if (dataValue !== data) node.set("data", data);
    if (action.label !== undefined) data.set("label", action.label);
    if (action.shape !== undefined) data.set("shape", action.shape);
    if (action.colorIndex !== undefined) {
      const color = NODE_COLORS[action.colorIndex];
      data.set("color", color.background);
      data.set("textColor", color.text);
    }
  }
}

function layoutCursor(index: number) {
  return { x: 72 + (index % 4) * 30, y: 90 + Math.floor(index / 4) * 30 };
}

export const designAgent = task({
  id: "design-agent",
  run: async (payload: DesignAgentPayload) => {
    let client: Liveblocks | undefined;
    let presenceStarted = false;

    try {
      if (!payload.prompt.trim() || !payload.roomId.trim()) {
        throw new Error("A prompt and room ID are required");
      }
      if (!process.env.GEMINI_API_KEY) throw new Error("GEMINI_API_KEY is not configured");

      client = getLiveblocksClient();
      await client.setPresence(payload.roomId, {
        userId: AI_USER_ID,
        userInfo: AI_USER_INFO,
        data: { cursor: layoutCursor(0), thinking: true },
        ttl: 120,
      });
      presenceStarted = true;
      await publishStatus(client, payload.roomId, "processing", "Ghost AI started designing the system.");
      await publishStatus(client, payload.roomId, "processing", "Analyzing your prompt and current canvas.");

      const currentCanvas = await client.getStorageDocument(payload.roomId, "json");
      const root = asRecord(currentCanvas);
      const flow = asRecord(root?.flow);
      const currentNodes = asRecord(flow?.nodes) ?? {};
      const currentEdges = asRecord(flow?.edges) ?? {};
      const result = await generateObject({
        model: google("gemini-2.5-flash"),
        schema: designSchema,
        system: `You are Ghost AI, a collaborative system design agent. Interpret the user's request as a sequence of canvas operations. Respect existing node and edge IDs when modifying the current design. New node IDs and edge IDs must be unique, stable, simple slugs. Use only allowed shapes and colorIndex values 0 through ${NODE_COLORS.length - 1}. Place new nodes in a readable grid with at least 220px horizontal and 140px vertical spacing, starting near x=0,y=0 or extending the current graph. Keep dimensions near 180x100. Add edges only between existing or newly added IDs. For an initial design, add nodes and edges that fully represent the requested architecture. Return actions in dependency-safe order: nodes before edges, and edge deletions before node deletion.`,
        prompt: `User request:\n${payload.prompt}\n\nCurrent canvas nodes:\n${JSON.stringify(currentNodes)}\n\nCurrent canvas edges:\n${JSON.stringify(currentEdges)}\n\nReturn concise status summary and operations.`,
      });

      await publishStatus(client, payload.roomId, "processing", result.object.summary);
      for (let index = 0; index < result.object.actions.length; index += 1) {
        const action = result.object.actions[index];
        await client.setPresence(payload.roomId, {
          userId: AI_USER_ID,
          userInfo: AI_USER_INFO,
          data: { cursor: layoutCursor(index + 1), thinking: true },
          ttl: 120,
        });
        await client.mutateStorage(payload.roomId, ({ root: storageRoot }) => {
          updateActions([action], storageRoot);
        });
      }

      await publishStatus(client, payload.roomId, "complete", "Ghost AI finished updating the canvas.");
      return {
        ok: true,
        roomId: payload.roomId,
        projectId: payload.projectId,
        actionCount: result.object.actions.length,
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown design agent error";
      if (client) {
        await publishStatus(client, payload.roomId, "error", `Ghost AI could not finish: ${message}`).catch(() => undefined);
      }
      return { ok: false, roomId: payload.roomId, error: message };
    } finally {
      if (client && presenceStarted) {
        await client.setPresence(payload.roomId, {
          userId: AI_USER_ID,
          userInfo: AI_USER_INFO,
          data: { cursor: null, thinking: false },
          ttl: 2,
        }).catch(() => undefined);
      }
    }
  },
});
