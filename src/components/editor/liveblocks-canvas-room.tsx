"use client";

import { LiveblocksProvider, RoomProvider } from "@liveblocks/react/suspense";
import { LiveMap, LiveObject, type Lson } from "@liveblocks/client";
import type { ReactNode } from "react";

import { CollaborativeCanvas } from "@/components/editor/collaborative-canvas";
import type { CanvasTemplate } from "@/components/editor/starter-templates";

export function LiveblocksCanvasRoom({
  roomId,
  onSaveStatusChange,
  onRegisterImport,
  children,
}: {
  roomId: string;
  onSaveStatusChange: (status: "saving" | "saved" | "error") => void;
  onRegisterImport: (handler: (template: CanvasTemplate) => void) => void;
  children: ReactNode;
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
        <div className="flex min-h-0 min-w-0 flex-1 overflow-hidden">
          <section
            aria-label="Canvas workspace"
            className="relative flex min-h-0 min-w-0 flex-1 overflow-hidden bg-base"
          >
            <CollaborativeCanvas
              roomId={roomId}
              onSaveStatusChange={onSaveStatusChange}
              onRegisterImport={onRegisterImport}
            />
          </section>
          {children}
        </div>
      </RoomProvider>
    </LiveblocksProvider>
  );
}
