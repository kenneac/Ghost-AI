# Progress Tracker

## Completed

- Added the Trigger.dev v4 project scaffold: task directory, starter task, project config, package scripts, TypeScript inclusion, and local state ignore rule. SDK and build dependencies are declared; local installation and Trigger.dev account/project credentials remain before tasks can register or run.

- Canvas Delete/Backspace now removes selected graph elements through Liveblocks' dedicated onDelete mutation because the flow change callbacks ignore remove changes.

- Fixed the four current canvas/workspace issues: collaborative keyboard deletion, cursor-centered shape drops, no initial auto-fit on node insertion, and editor-home-only navbar UserButton.

- Shared project sidebar entries navigate to their project from both the editor home page and workspace. Selecting a shared project closes the sidebar.

## Open Questions

- None.

- Liveblocks collaborator avatar labels now fall back to the authenticated user's email when first and last name and username are unavailable, before using “Anonymous”.


