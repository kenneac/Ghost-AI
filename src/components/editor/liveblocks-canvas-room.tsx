"use client";

import { LiveblocksProvider, RoomProvider } from "@liveblocks/react/suspense";
import { LiveMap, LiveObject, type Lson } from "@liveblocks/client";

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
        initialStorage={new LiveObject({
          flow: new LiveObject({
            nodes: new LiveMap<string, Lson>([]),
            edges: new LiveMap<string, Lson>([]),
          }),
        })}
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
