import type { LiveMap, LiveObject, Lson, LsonObject } from "@liveblocks/client";

declare global {
  interface Liveblocks {
    Presence: {
      cursor: { x: number; y: number } | null;
      thinking: boolean;
    };

    Storage: Record<string, Lson>;

    UserMeta: {
      id: string;
      info: {
        name: string;
        avatar: string;
        color: string;
      };
    };

    ThreadMetadata: {};
    RoomInfo: {};
  }
}

export {};
