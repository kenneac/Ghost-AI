import { auth as triggerAuth } from "@trigger.dev/sdk";
import { z } from "zod";

import {
  apiErrorResponse,
  getAuthenticatedUserId,
  readJsonObject,
} from "@/lib/project-api";
import { prisma } from "../../../../../../lib/prisma";

const requestSchema = z.object({ runId: z.string().trim().min(1) });

export async function POST(request: Request) {
  const userId = await getAuthenticatedUserId();
  if (!userId) return apiErrorResponse(401, "Unauthorized");

  const body = await readJsonObject(request);
  const parsed = requestSchema.safeParse(body);
  if (!parsed.success) return apiErrorResponse(400, "runId is required");
  const { runId } = parsed.data;

  const taskRun = await prisma.taskRun.findUnique({ where: { runId } });
  if (!taskRun) return apiErrorResponse(404, "Run not found");
  if (taskRun.userId !== userId) return apiErrorResponse(403, "Forbidden");

  const token = await triggerAuth.createPublicToken({
    scopes: { read: { runs: [runId] } },
    expirationTime: "1h",
  });

  return Response.json({ token });
}
