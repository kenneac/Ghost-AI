import { Liveblocks } from "@liveblocks/node";

const globalForLiveblocks = globalThis as typeof globalThis & {
  liveblocksClient?: Liveblocks;
};

function createLiveblocksClient() {
  const secret = process.env.LIVEBLOCKS_SECRET_KEY;

  if (!secret) {
    throw new Error("LIVEBLOCKS_SECRET_KEY is not configured");
  }

  return new Liveblocks({ secret });
}

export const liveblocks =
  globalForLiveblocks.liveblocksClient ?? createLiveblocksClient();

if (process.env.NODE_ENV !== "production") {
  globalForLiveblocks.liveblocksClient = liveblocks;
}

const CURSOR_COLORS = [
  "#00C8D4",
  "#6457F9",
  "#34D399",
  "#FBBF24",
  "#FF4D4F",
  "#F75F8F",
  "#52A8FF",
  "#BF7AF0",
] as const;

export function getCursorColor(userId: string): string {
  let hash = 2166136261;

  for (let index = 0; index < userId.length; index += 1) {
    hash ^= userId.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }

  return CURSOR_COLORS[(hash >>> 0) % CURSOR_COLORS.length];
}
