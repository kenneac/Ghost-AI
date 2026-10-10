import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { generateText } from "ai";
import { logger, metadata, task } from "@trigger.dev/sdk";
import { put } from "@vercel/blob";
import { randomUUID } from "node:crypto";
import { z } from "zod";

import { aiStatusMessageSchema } from "../src/types/tasks";

const payloadSchema = z.object({
  projectId: z.string().min(1),
  roomId: z.string().min(1),
  chatHistory: z.array(z.unknown()),
  nodes: z.array(z.unknown()),
  edges: z.array(z.unknown()),
});

type GenerateSpecPayload = z.infer<typeof payloadSchema>;
const FEED_ID = "ai-status-feed";
const MODEL = "nvidia/nemotron-3.5-lightning:free";

function getOpenRouterClient() {
  const apiKey = process.env.OPEN_ROUTER_API_KEY;
  if (!apiKey) throw new Error("OPEN_ROUTER_API_KEY is not configured");
  return createOpenRouter({ apiKey });
}

async function publishStatus(
  roomId: string,
  status: "processing" | "complete" | "error",
  text: string,
) {
  const secret = process.env.LIVEBLOCKS_SECRET_KEY;
  if (!secret) throw new Error("LIVEBLOCKS_SECRET_KEY is not configured");
  const { Liveblocks } = await import("@liveblocks/node");
  const client = new Liveblocks({ secret });
  const data = aiStatusMessageSchema.parse({ status, taskType: "spec", text });

  try {
    await client.getFeed({ roomId, feedId: FEED_ID });
  } catch {
    await client.createFeed({ roomId, feedId: FEED_ID });
  }

  await client.createFeedMessage({ roomId, feedId: FEED_ID, data });
}

export const generateSpec = task({
  id: "generate-spec",
  retry: { maxAttempts: 3 },
  run: async (rawPayload: GenerateSpecPayload) => {
    const payload = payloadSchema.parse(rawPayload);
    try {
      metadata.set("status", "processing").set("taskType", "spec");
      logger.info("Spec generation started", { projectId: payload.projectId, roomId: payload.roomId });
      await publishStatus(payload.roomId, "processing", "Generating the technical specification.");

      const result = await generateText({
        model: getOpenRouterClient()(MODEL),
        system: "You are a senior software architect. Generate a clear, implementation-ready Markdown technical specification from the provided architecture canvas and project chat. Include overview, requirements, architecture, components, data flow, interfaces, data storage, security, reliability, deployment, and open questions where supported by context. Do not invent details; mark unknowns explicitly. Return only the Markdown document.",
        prompt: `Project ID: ${payload.projectId}\n\nCanvas nodes:\n${JSON.stringify(payload.nodes)}\n\nCanvas edges:\n${JSON.stringify(payload.edges)}\n\nProject chat history:\n${JSON.stringify(payload.chatHistory)}`,
      });

      if (!result.text.trim()) throw new Error("The model returned an empty specification");
      const specId = randomUUID();
      const blob = await put(
        `specs/${payload.projectId}/spec-${specId}.md`,
        result.text,
        {
          access: "private",
          addRandomSuffix: false,
          contentType: "text/markdown; charset=utf-8",
        },
      );
      const { prisma } = await import("../lib/prisma");
      await prisma.projectSpec.create({
        data: {
          id: specId,
          projectId: payload.projectId,
          filePath: blob.pathname,
        },
      });
      metadata.set("status", "complete");
      logger.info("Spec generation completed", { projectId: payload.projectId, specId });
      await publishStatus(payload.roomId, "complete", "The technical specification is ready.");
      return result.text;
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown spec generation error";
      metadata.set("status", "error");
      logger.error("Spec generation task failed", { projectId: payload.projectId, error });
      await publishStatus(payload.roomId, "error", `Spec generation failed: ${message}`).catch(() => undefined);
      throw error;
    }
  },
});
