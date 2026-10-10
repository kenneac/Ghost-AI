import { get } from "@vercel/blob";

import { getProjectForCurrentIdentity } from "@/lib/project-access";
import { apiErrorResponse } from "@/lib/project-api";
import { prisma } from "../../../../../../../lib/prisma";

type RouteContext = { params: Promise<{ projectId: string; specId: string }> };

export async function GET(_request: Request, { params }: RouteContext) {
  const { projectId, specId } = await params;
  const { identity, project } = await getProjectForCurrentIdentity(projectId);
  if (!identity.userId) return apiErrorResponse(401, "Unauthorized");
  if (!project) return apiErrorResponse(404, "Project not found");

  const spec = await prisma.projectSpec.findFirst({ where: { id: specId, projectId } });
  if (!spec) return apiErrorResponse(404, "Specification not found");

  try {
    const result = await get(spec.filePath, { access: "private" });
    if (!result || result.statusCode !== 200) {
      return apiErrorResponse(404, "Specification content not found");
    }

    return new Response(result.stream, {
      headers: {
        "Content-Type": "text/markdown; charset=utf-8",
        "Cache-Control": "private, no-store",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (error) {
    console.error("Private spec preview failed", {
      projectId,
      specId,
      error: error instanceof Error ? error.message : String(error),
    });
    return apiErrorResponse(502, "Could not load specification");
  }
}
