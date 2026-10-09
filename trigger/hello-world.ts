import { task } from "@trigger.dev/sdk";

export const helloWorld = task({
  id: "hello-world",
  run: async (payload: { name: string }) => ({
    message: `Hello ${payload.name}!`,
  }),
});
