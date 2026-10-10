import { auth as triggerAuth } from "@trigger.dev/sdk";

import {
  apiErrorResponse,
  getAuthenticatedUserId,
  readJsonObject,
} from "@/lib/project-api";
import { getProjectForCurrentIdentity } from "@/lib/project-access";
import { prisma } from "../../../../../../lib/prisma";

export async function POST(request: Request) {
  const userId = await getAuthenticatedUserId();

  if (!userId) {
    return apiErrorResponse(401, "Unauthorized");
  }

  const body = await readJsonObject(request);

  if (!body) {
    return apiErrorResponse(400, "Invalid request body");
  }

  const runId = typeof body.runId === "string" ? body.runId.trim() : "";

  if (!runId) {
    return apiErrorResponse(400, "runId is required");
  }

  const taskRun = await prisma.taskRun.findUnique({
    where: { runId },
  });

  if (!taskRun) {
    return apiErrorResponse(404, "Run not found");
  }

  if (taskRun.userId !== userId) {
    return apiErrorResponse(403, "Forbidden");
  }

  const { project } = await getProjectForCurrentIdentity(taskRun.projectId);

  if (!project) {
    return apiErrorResponse(403, "Forbidden");
  }

  const token = await triggerAuth.createPublicToken({
    scopes: {
      read: {
        runs: [runId],
      },
    },
    expirationTime: "24h",
  });

  return Response.json({ token });
}
