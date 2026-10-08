import {
  apiErrorResponse,
  getAuthenticatedUserId,
  readJsonObject,
  requireOwnedProject,
} from "@/lib/project-api";
import { prisma } from "../../../../../lib/prisma";

interface ProjectRouteContext {
  params: Promise<{ projectId: string }>;
}

export async function PATCH(
  request: Request,
  { params }: ProjectRouteContext,
) {
  const userId = await getAuthenticatedUserId();

  if (!userId) {
    return apiErrorResponse(401, "Unauthorized");
  }

  const { projectId } = await params;

  const project = await requireOwnedProject(projectId, userId);

  if (project instanceof Response) {
    return project;
  }

  const body = await readJsonObject(request);

  if (!body) {
    return apiErrorResponse(400, "Invalid request body");
  }

  const requestedName = body.name;

  if (typeof requestedName !== "string" || !requestedName.trim()) {
    return apiErrorResponse(400, "Project name must be a non-empty string");
  }

  const updatedProject = await prisma.project.update({
    where: { id: project.id },
    data: { name: requestedName.trim() },
  });

  return Response.json({ project: updatedProject });
}

export async function DELETE(
  _request: Request,
  { params }: ProjectRouteContext,
) {
  const userId = await getAuthenticatedUserId();

  if (!userId) {
    return apiErrorResponse(401, "Unauthorized");
  }

  const { projectId } = await params;

  const project = await requireOwnedProject(projectId, userId);

  if (project instanceof Response) {
    return project;
  }

  await prisma.project.delete({ where: { id: project.id } });

  return Response.json({ success: true });
}
