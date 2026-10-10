import { getProjectForCurrentIdentity } from "@/lib/project-access";
import { apiErrorResponse } from "@/lib/project-api";
import { prisma } from "../../../../../../lib/prisma";

type RouteContext = { params: Promise<{ projectId: string }> };

export async function GET(_request: Request, { params }: RouteContext) {
  const { projectId } = await params;
  const { identity, project } = await getProjectForCurrentIdentity(projectId);
  if (!identity.userId) return apiErrorResponse(401, "Unauthorized");
  if (!project) return apiErrorResponse(404, "Project not found");

  const specs = await prisma.projectSpec.findMany({
    where: { projectId: project.id },
    orderBy: { createdAt: "desc" },
    select: { id: true, filePath: true, createdAt: true },
  });

  return Response.json({
    specs: specs.map(({ id, filePath, createdAt }) => ({
      id,
      filename: filePath.split("/").at(-1) ?? `spec-${id}.md`,
      createdAt,
    })),
  });
}
