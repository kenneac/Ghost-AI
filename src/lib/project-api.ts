import { auth } from "@clerk/nextjs/server";
import type { Project } from "../../prisma/generated/client";
import { prisma } from "../../lib/prisma";

export function apiErrorResponse(status: number, error: string): Response {
  return Response.json({ error }, { status });
}

export async function getAuthenticatedUserId(): Promise<string | null> {
  const { isAuthenticated, userId } = await auth();

  if (!isAuthenticated || !userId) {
    return null;
  }

  return userId;
}

export async function readJsonObject(
  request: Request,
): Promise<Record<string, unknown> | null> {
  const text = await request.text();

  if (!text.trim()) {
    return {};
  }

  try {
    const parsed: unknown = JSON.parse(text);

    if (parsed === null || typeof parsed !== "object" || Array.isArray(parsed)) {
      return null;
    }

    return parsed as Record<string, unknown>;
  } catch {
    return null;
  }
}

export async function requireOwnedProject(
  projectId: string,
  userId: string,
): Promise<Project | Response> {
  const project = await prisma.project.findUnique({ where: { id: projectId } });

  if (!project) {
    return apiErrorResponse(404, "Project not found");
  }

  if (project.ownerId !== userId) {
    return apiErrorResponse(403, "Forbidden");
  }

  return project;
}
