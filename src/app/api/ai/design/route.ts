import {
  apiErrorResponse,
  getAuthenticatedUserId,
  readJsonObject,
} from "@/lib/project-api";
import { getProjectForCurrentIdentity } from "@/lib/project-access";
import { prisma } from "../../../../../lib/prisma";
import { designAgent } from "../../../../../trigger/design-agent";

export async function POST(request: Request) {
  const userId = await getAuthenticatedUserId();

  if (!userId) {
    return apiErrorResponse(401, "Unauthorized");
  }

  const body = await readJsonObject(request);

  if (!body) {
    return apiErrorResponse(400, "Invalid request body");
  }

  const prompt = typeof body.prompt === "string" ? body.prompt.trim() : "";
  const roomId = typeof body.roomId === "string" ? body.roomId.trim() : "";
  const projectId =
    typeof body.projectId === "string" ? body.projectId.trim() : "";

  if (!projectId || !roomId || !prompt) {
    return apiErrorResponse(400, "prompt, roomId, and projectId are required");
  }

  const { project } = await getProjectForCurrentIdentity(projectId);

  if (!project) {
    return apiErrorResponse(403, "Forbidden");
  }

  const run = await designAgent.trigger(
    {
      prompt,
      roomId,
      projectId,
    },
    {
      tags: [`project:${projectId}`, `user:${userId}`],
    },
  );

  await prisma.taskRun.create({
    data: {
      runId: run.id,
      projectId: project.id,
      userId,
    },
  });

  return Response.json({ runId: run.id }, { status: 202 });
}
