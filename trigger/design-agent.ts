import { task } from "@trigger.dev/sdk";

export type DesignAgentPayload = {
  prompt: string;
  roomId: string;
  projectId?: string;
};

export const designAgent = task({
  id: "design-agent",
  run: async (payload: DesignAgentPayload) => {
    console.log("Design agent task received payload", payload);

    return {
      ok: true,
      prompt: payload.prompt,
      roomId: payload.roomId,
      projectId: payload.projectId,
    };
  },
});
