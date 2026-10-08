"use client";

import { LiveblocksProvider, RoomProvider } from "@liveblocks/react/suspense";

import { CollaborativeCanvas } from "@/components/editor/collaborative-canvas";

export function LiveblocksCanvasRoom({ roomId }: { roomId: string }) {
  return (
    <LiveblocksProvider authEndpoint="/api/liveblocks-auth">
      <RoomProvider
        id={roomId}
        initialPresence={{ cursor: null, isThinking: false }}
      >
        <CollaborativeCanvas roomId={roomId} />
      </RoomProvider>
    </LiveblocksProvider>
  );
}
