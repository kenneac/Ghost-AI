import { put } from "@vercel/blob";

import { getProjectForCurrentIdentity } from "@/lib/project-access";
import {
  apiErrorResponse,
  getAuthenticatedUserId,
  readJsonObject,
} from "@/lib/project-api";
import { prisma } from "../../../../../../lib/prisma";

type RouteContext = { params: Promise<{ projectId: string }> };

export async function PUT(request: Request, { params }: RouteContext) {
  const userId = await getAuthenticatedUserId();
  if (!userId) return apiErrorResponse(401, "Unauthorized");

  const { projectId } = await params;
  const { project } = await getProjectForCurrentIdentity(projectId);
  if (!project) return apiErrorResponse(404, "Project not found");

  const body = await readJsonObject(request);
  if (!body || !Array.isArray(body.nodes) || !Array.isArray(body.edges)) {
    return apiErrorResponse(400, "Canvas must include nodes and edges arrays");
  }

  let blob: Awaited<ReturnType<typeof put>>;
  try {
    blob = await put(
      `canvas/${projectId}.json`,
      JSON.stringify({ nodes: body.nodes, edges: body.edges }),
      {
        access: "private",
        addRandomSuffix: true,
        contentType: "application/json",
        allowOverwrite: false,
      },
    );
  } catch (error) {
    console.error("Canvas Blob upload failed", {
      projectId,
      error: error instanceof Error ? error.message : String(error),
    });
    return apiErrorResponse(502, "Could not save canvas to blob storage");
  }

  try {
    await prisma.project.update({
      where: { id: projectId },
      data: { canvasBlobPath: blob.pathname },
    });
  } catch {
    console.error("Canvas pathname database update failed", { projectId });
    return apiErrorResponse(500, "Could not update canvas reference");
  }

  return Response.json({ success: true });
}
