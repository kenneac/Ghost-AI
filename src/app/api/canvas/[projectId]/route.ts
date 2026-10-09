import { get } from "@vercel/blob";

import { apiErrorResponse } from "@/lib/project-api";
import { getProjectForCurrentIdentity } from "@/lib/project-access";

type RouteContext = { params: Promise<{ projectId: string }> };

export async function GET(_request: Request, { params }: RouteContext) {
  const { projectId } = await params;
  const { identity, project } = await getProjectForCurrentIdentity(projectId);

  if (!identity.userId) return apiErrorResponse(401, "Unauthorized");
  if (!project) return apiErrorResponse(404, "Project not found");
  if (!project.canvasBlobPath) return apiErrorResponse(404, "Canvas not found");

  try {
    const result = await get(project.canvasBlobPath, { access: "private" });
    if (!result || result.statusCode !== 200) {
      return apiErrorResponse(404, "Canvas not found");
    }

    return new Response(result.stream, {
      headers: {
        "Content-Type": result.blob.contentType,
        "Cache-Control": "private, no-store",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (error) {
    console.error("Private canvas download failed", {
      projectId,
      error: error instanceof Error ? error.message : String(error),
    });
    return apiErrorResponse(502, "Could not load canvas");
  }
}
