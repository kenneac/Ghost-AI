# Progress Tracker

## Current Phase

- Spec task runtime fix — OpenRouter is used for generation, and Prisma Client was regenerated from the configured multi-file schema so the ProjectSpec delegate exists. TypeScript and focused ESLint remain stalled without diagnostics.

## Current Goal

- Feature 26 is complete. The Liveblocks auth route ensures `ai-chat` exists before room access, and the AI composer keeps scrolled text clear of its bottom-right send button.

## Completed

- Feature 26 is implemented in the sidebar: prompt feed post, API trigger, scoped run subscription, active status strip, and shared completion/error messages. `git diff --check` passes; build, TypeScript, and focused ESLint commands stalled without diagnostics.
- Added the Trigger.dev v4 project scaffold: task directory, starter task, project config, package scripts, TypeScript inclusion, and local state ignore rule. SDK and build dependencies are declared; local installation and Trigger.dev account/project credentials remain before tasks can register or run.

- Canvas Delete/Backspace now removes selected graph elements through Liveblocks' dedicated onDelete mutation because the flow change callbacks ignore remove changes.

- Fixed the four current canvas/workspace issues: collaborative keyboard deletion, cursor-centered shape drops, no initial auto-fit on node insertion, and editor-home-only navbar UserButton.

- Shared project sidebar entries navigate to their project from both the editor home page and workspace. Selecting a shared project closes the sidebar.

- Replaced Gemini in the design agent with OpenRouter using `nvidia/nemotron-3.5-lightning:free`; updated the feature spec and removed the unused Google AI SDK dependency.

- Feature 24 implementation is underway: the sidebar now shares the Liveblocks room and reads validated status from `ai-status-feed`; the existing design task publishes the generic feed payload.

- Feature 24 is complete: the sidebar reads the latest validated shared status, disables prompt entry and shows loading while generation is active, and renders spinner indicators for thinking cursors. `git diff --check` passes; build, TypeScript, and focused lint commands stalled without diagnostics.
- Spec task persistence fix: `prisma.projectSpec.create` failed because the generated Prisma Client predated the ProjectSpec model. Running `npx prisma generate` against the configured `prisma/` directory generated the missing delegate. No Google AI SDK references or dependency remain; spec generation uses the existing OpenRouter provider/model.

## Open Questions

- None.

- Liveblocks collaborator avatar labels now fall back to the authenticated user's email when first and last name and username are unavailable, before using “Anonymous”.

- Composer/feed issue fix: Authenticated room setup now creates or confirms the `ai-chat` feed, including concurrent room joins. The composer button overlays the lower-right textarea with reserved padding for scrolling text.
- Sidebar prompts render immediately with optimistic state and deduplicate against the persisted `ai-chat` feed message.
