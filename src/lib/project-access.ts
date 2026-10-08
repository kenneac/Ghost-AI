import { auth, currentUser } from "@clerk/nextjs/server";

import { prisma } from "../../lib/prisma";

export interface CurrentIdentity {
  userId: string | null;
  primaryEmail: string | null;
}

export async function getCurrentIdentity(): Promise<CurrentIdentity> {
  const { userId } = await auth();

  if (!userId) {
    return { userId: null, primaryEmail: null };
  }

  const user = await currentUser();
  const primaryEmailId = user?.primaryEmailAddressId;
  const primaryEmail = user?.emailAddresses.find(
    (email) => email.id === primaryEmailId,
  )?.emailAddress;

  return { userId, primaryEmail: primaryEmail ?? null };
}

export async function getProjectForCurrentIdentity(projectId: string) {
  const identity = await getCurrentIdentity();

  if (!identity.userId) {
    return { identity, project: null };
  }

  const project = await prisma.project.findFirst({
    where: {
      id: projectId,
      OR: [
        { ownerId: identity.userId },
        ...(identity.primaryEmail
          ? [{ collaborators: { some: { email: identity.primaryEmail } } }]
          : []),
      ],
    },
  });

  return { identity, project };
}
