"use client";

import { LiveblocksProvider, RoomProvider } from "@liveblocks/react/suspense";

import { CollaborativeCanvas } from "@/components/editor/collaborative-canvas";
import type { CanvasTemplate } from "@/components/editor/starter-templates";

export function LiveblocksCanvasRoom({
  roomId,
  onSaveStatusChange,
  onRegisterImport,
}: {
  roomId: string;
  onSaveStatusChange: (status: "saving" | "saved" | "error") => void;
  onRegisterImport: (handler: (template: CanvasTemplate) => void) => void;
}) {
  return (
    <LiveblocksProvider authEndpoint="/api/liveblocks-auth">
      <RoomProvider
        id={roomId}
        initialPresence={{ cursor: null, thinking: false }}
      >
        <CollaborativeCanvas
          roomId={roomId}
          onSaveStatusChange={onSaveStatusChange}
          onRegisterImport={onRegisterImport}
        />
      </RoomProvider>
    </LiveblocksProvider>
  );
}
