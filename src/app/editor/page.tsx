import { EditorHome } from "@/components/editor/editor-home";
import { getProjectListsForCurrentUser } from "@/lib/project-data";

export default async function EditorPage() {
  const { ownedProjects, sharedProjects } = await getProjectListsForCurrentUser();

  return (
    <EditorHome
      ownedProjects={ownedProjects}
      sharedProjects={sharedProjects}
    />
  );
}
