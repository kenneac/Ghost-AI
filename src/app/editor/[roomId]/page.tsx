import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

import { AccessDenied } from "@/components/editor/access-denied";
import { EditorWorkspace } from "@/components/editor/editor-workspace";
import { getProjectForCurrentIdentity } from "@/lib/project-access";
import { getProjectListsForCurrentUser } from "@/lib/project-data";

export default async function EditorWorkspacePage({
  params,
}: { params: Promise<{ roomId: string }> }) {
  const { roomId } = await params;
  const { isAuthenticated } = await auth();

  if (!isAuthenticated) {
    redirect("/sign-in");
  }

  const { identity, project } = await getProjectForCurrentIdentity(roomId);

  if (!project) {
    return <AccessDenied />;
  }

  const { ownedProjects, sharedProjects } = await getProjectListsForCurrentUser();

  return (
    <EditorWorkspace
      project={{
        id: project.id,
        name: project.name,
        slug: project.name,
        isOwner: project.ownerId === identity.userId,
      }}
      ownedProjects={ownedProjects}
      sharedProjects={sharedProjects}
    />
  );
}


