import { currentUser } from "@clerk/nextjs/server";

import { apiErrorResponse, getAuthenticatedUserId } from "@/lib/project-api";
import { getProjectForCurrentIdentity } from "@/lib/project-access";
import { getCursorColor, liveblocks } from "@/lib/liveblocks";

const AI_CHAT_FEED_ID = "ai-chat";

async function ensureAiChatFeed(roomId: string) {
  try {
    await liveblocks.getFeed({ roomId, feedId: AI_CHAT_FEED_ID });
    return;
  } catch {
    try {
      await liveblocks.createFeed({ roomId, feedId: AI_CHAT_FEED_ID });
      return;
    } catch {
      // Another room join may have created the feed concurrently.
      await liveblocks.getFeed({ roomId, feedId: AI_CHAT_FEED_ID });
    }
  }
}

export async function POST(request: Request) {
  const userId = await getAuthenticatedUserId();

  if (!userId) {
    return apiErrorResponse(401, "Unauthorized");
  }

  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return apiErrorResponse(400, "Invalid request body");
  }

  if (
    body === null ||
    typeof body !== "object" ||
    !("room" in body) ||
    typeof body.room !== "string" ||
    !body.room.trim()
  ) {
    return apiErrorResponse(400, "A project ID is required");
  }

  const projectId = body.room.trim();
  const { project } = await getProjectForCurrentIdentity(projectId);

  if (!project) {
    return apiErrorResponse(403, "Forbidden");
  }

  const user = await currentUser();
  const name =
    [user?.firstName, user?.lastName].filter(Boolean).join(" ") ||
    user?.username ||
    user?.emailAddresses[0]?.emailAddress ||
    "Anonymous";
  const avatar = user?.imageUrl ?? "";
  const color = getCursorColor(userId);

  await liveblocks.getOrCreateRoom(projectId, { defaultAccesses: [] });
  await ensureAiChatFeed(projectId);

  const session = liveblocks.prepareSession(userId, {
    userInfo: { name, avatar, color },
  });
  session.allow(projectId, session.FULL_ACCESS);

  const { status, body: tokenBody } = await session.authorize();

  return new Response(tokenBody, {
    status,
    headers: { "Content-Type": "application/json" },
  });
}
