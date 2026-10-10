import { z } from "zod";

import {
  apiErrorResponse,
  getAuthenticatedUserId,
  readJsonObject,
} from "@/lib/project-api";
import { getProjectForCurrentIdentity } from "@/lib/project-access";
import { prisma } from "../../../../../lib/prisma";
import { generateSpec } from "../../../../../trigger/generate-spec";

const requestSchema = z.object({
  roomId: z.string().trim().min(1),
  chatHistory: z.array(z.unknown()),
  nodes: z.array(z.unknown()),
  edges: z.array(z.unknown()),
});

export async function POST(request: Request) {
  const userId = await getAuthenticatedUserId();
  if (!userId) return apiErrorResponse(401, "Unauthorized");

  const body = await readJsonObject(request);
  const parsed = requestSchema.safeParse(body);
  if (!parsed.success) return apiErrorResponse(400, "Invalid spec generation input");

  // The existing workspace contract uses the project ID as its Liveblocks room ID.
  const { project } = await getProjectForCurrentIdentity(parsed.data.roomId);
  if (!project) return apiErrorResponse(403, "Forbidden");

  const run = await generateSpec.trigger(
    { ...parsed.data, projectId: project.id },
    { tags: [`project:${project.id}`, `user:${userId}`] },
  );

  await prisma.taskRun.create({
    data: { runId: run.id, projectId: project.id, userId },
  });

  return Response.json({ runId: run.id }, { status: 202 });
}
