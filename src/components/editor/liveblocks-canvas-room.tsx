"use client";

import { LiveblocksProvider, RoomProvider } from "@liveblocks/react/suspense";

import { CollaborativeCanvas } from "@/components/editor/collaborative-canvas";
import type { CanvasTemplate } from "@/components/editor/starter-templates";

export function LiveblocksCanvasRoom({
  roomId,
  onRegisterImport,
}: {
  roomId: string;
  onRegisterImport: (handler: (template: CanvasTemplate) => void) => void;
}) {
  return (
    <LiveblocksProvider authEndpoint="/api/liveblocks-auth">
      <RoomProvider
        id={roomId}
        initialPresence={{ cursor: null, isThinking: false }}
      >
        <CollaborativeCanvas roomId={roomId} onRegisterImport={onRegisterImport} />
      </RoomProvider>
    </LiveblocksProvider>
  );
}
