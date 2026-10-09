import { clerkClient } from "@clerk/nextjs/server";

import {
  apiErrorResponse,
  getAuthenticatedUserId,
  readJsonObject,
  requireOwnedProject,
} from "@/lib/project-api";
import { prisma } from "../../../../../../lib/prisma";

interface CollaboratorsRouteContext {
  params: Promise<{ projectId: string }>;
}

export async function GET(
  _request: Request,
  { params }: CollaboratorsRouteContext,
) {
  try {
    const userId = await getAuthenticatedUserId();
    if (!userId) return apiErrorResponse(401, "Unauthorized");

    const { projectId } = await params;
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: { collaborators: { orderBy: { createdAt: "asc" } } },
    });

    if (!project) return apiErrorResponse(404, "Project not found");

    if (project.ownerId !== userId) {
      const { currentUser } = await import("@clerk/nextjs/server");
      const user = await currentUser();
      const primaryEmail = user?.emailAddresses
        .find((address) => address.id === user.primaryEmailAddressId)
        ?.emailAddress.toLowerCase();

      if (
        !primaryEmail ||
        !project.collaborators.some(
          (item) => item.email.toLowerCase() === primaryEmail,
        )
      ) {
        return apiErrorResponse(403, "Forbidden");
      }
    }

    const client = await clerkClient();
    const profiles = project.collaborators.length
      ? await client.users.getUserList({
          emailAddress: project.collaborators.map((item) => item.email),
          limit: 100,
        })
      : { data: [] };
    const profileByEmail = new Map<
      string,
      { name: string | null; imageUrl: string }
    >();

    for (const profile of profiles.data) {
      for (const address of profile.emailAddresses) {
        profileByEmail.set(address.emailAddress.toLowerCase(), {
          name:
            [profile.firstName, profile.lastName].filter(Boolean).join(" ") ||
            null,
          imageUrl: profile.imageUrl,
        });
      }
    }

    return Response.json({
      collaborators: project.collaborators.map((collaborator) => ({
        id: collaborator.id,
        email: collaborator.email,
        ...(profileByEmail.get(collaborator.email.toLowerCase()) ?? {}),
      })),
      isOwner: project.ownerId === userId,
    });
  } catch (error) {
    console.error("Failed to load collaborators", error);
    return apiErrorResponse(500, "Could not load collaborators");
  }
}

export async function POST(
  request: Request,
  { params }: CollaboratorsRouteContext,
) {
  try {
    const userId = await getAuthenticatedUserId();
    if (!userId) return apiErrorResponse(401, "Unauthorized");

    const { projectId } = await params;
    const project = await requireOwnedProject(projectId, userId);
    if (project instanceof Response) return project;

    const body = await readJsonObject(request);
    if (!body || typeof body.email !== "string") {
      return apiErrorResponse(400, "A valid email is required");
    }

    const email = body.email.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return apiErrorResponse(400, "A valid email is required");
    }

    const owner = await (await clerkClient()).users.getUser(userId);
    if (
      owner.emailAddresses.some(
        (address) => address.emailAddress.toLowerCase() === email,
      )
    ) {
      return apiErrorResponse(400, "The project owner already has access");
    }

    const collaborator = await prisma.projectCollaborator.upsert({
      where: { projectId_email: { projectId, email } },
      create: { projectId, email },
      update: {},
    });

    return Response.json({ collaborator }, { status: 201 });
  } catch (error) {
    console.error("Failed to invite collaborator", error);
    return apiErrorResponse(500, "Could not invite collaborator");
  }
}

export async function DELETE(
  request: Request,
  { params }: CollaboratorsRouteContext,
) {
  try {
    const userId = await getAuthenticatedUserId();
    if (!userId) return apiErrorResponse(401, "Unauthorized");

    const { projectId } = await params;
    const project = await requireOwnedProject(projectId, userId);
    if (project instanceof Response) return project;

    const body = await readJsonObject(request);
    if (!body || typeof body.email !== "string") {
      return apiErrorResponse(400, "A valid email is required");
    }

    const email = body.email.trim().toLowerCase();
    const result = await prisma.projectCollaborator.deleteMany({
      where: { projectId, email },
    });

    if (!result.count) return apiErrorResponse(404, "Collaborator not found");
    return Response.json({ success: true });
  } catch (error) {
    console.error("Failed to remove collaborator", error);
    return apiErrorResponse(500, "Could not remove collaborator");
  }
}
