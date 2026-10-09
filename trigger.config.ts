import { defineConfig } from "@trigger.dev/sdk";

export default defineConfig({
  // Replace this with the project ref from your Trigger.dev dashboard.
  project: "proj_replace_with_your_project_ref",
  runtime: "node",
  dirs: ["./trigger"],
  maxDuration: 3600,
  retries: {
    enabledInDev: false,
    default: {
      maxAttempts: 3,
      factor: 2,
      minTimeoutInMs: 1_000,
      maxTimeoutInMs: 10_000,
      randomize: true,
    },
  },
});
