import {
  apiErrorResponse,
  getAuthenticatedUserId,
  readJsonObject,
} from "@/lib/project-api";
import { prisma } from "../../../../lib/prisma";

const DEFAULT_PROJECT_NAME = "Untitled Project";

export async function GET() {
  const userId = await getAuthenticatedUserId();

  if (!userId) {
    return apiErrorResponse(401, "Unauthorized");
  }

  const projects = await prisma.project.findMany({
    where: { ownerId: userId },
    orderBy: { createdAt: "desc" },
  });

  return Response.json({ projects });
}

export async function POST(request: Request) {
  const userId = await getAuthenticatedUserId();

  if (!userId) {
    return apiErrorResponse(401, "Unauthorized");
  }

  const body = await readJsonObject(request);

  if (!body) {
    return apiErrorResponse(400, "Invalid request body");
  }

  const requestedName = body.name;
  const name =
    typeof requestedName === "string" && requestedName.trim()
      ? requestedName.trim()
      : DEFAULT_PROJECT_NAME;

  const project = await prisma.project.create({
    data: {
      ownerId: userId,
      name,
    },
  });

  return Response.json({ project }, { status: 201 });
}
