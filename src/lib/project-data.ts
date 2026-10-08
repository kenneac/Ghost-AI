import { auth, currentUser } from "@clerk/nextjs/server";

import { prisma } from "../../lib/prisma";

export type ProjectListItem = {
  id: string;
  name: string;
  slug: string;
  isOwner: boolean;
};

function slugifyProjectName(value: string) {
  return (
    value
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 48) || "project"
  );
}

export async function getProjectListsForCurrentUser(): Promise<{
  ownedProjects: ProjectListItem[];
  sharedProjects: ProjectListItem[];
}> {
  const { userId } = await auth();

  if (!userId) {
    return { ownedProjects: [], sharedProjects: [] };
  }

  const user = await currentUser();
  const userEmail = user?.emailAddresses?.[0]?.emailAddress;

  const [ownedProjects, collaboratorProjects] = await Promise.all([
    prisma.project.findMany({
      where: { ownerId: userId },
      orderBy: { createdAt: "desc" },
    }),
    userEmail
      ? prisma.project.findMany({
          where: {
            ownerId: { not: userId },
            collaborators: {
              some: { email: userEmail },
            },
          },
          orderBy: { createdAt: "desc" },
        })
      : Promise.resolve([]),
  ]);

  return {
    ownedProjects: ownedProjects.map((project) => ({
      id: project.id,
      name: project.name,
      slug: slugifyProjectName(project.name),
      isOwner: true,
    })),
    sharedProjects: collaboratorProjects.map((project) => ({
      id: project.id,
      name: project.name,
      slug: slugifyProjectName(project.name),
      isOwner: false,
    })),
  };
}
