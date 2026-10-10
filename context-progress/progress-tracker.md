# Progress Tracker

Update this file whenever the current phase, active feature, or implementation state changes.

## Current Phase

- Feature 26: design agent frontend — implementation complete; build, TypeScript, and focused ESLint checks stalled without diagnostics.

- Feature 25: sidebar chat feed — implementation complete; `npm run build` stalled without diagnostics.
## Current Goal

- Feature 26 also ensures `ai-chat` exists during authenticated room setup, preventing feed writes from failing on new rooms; the composer send control overlays the lower-right corner with reserved scroll padding.

## Completed

- Feature 26: Connected the sidebar prompt flow to the authenticated design API and realtime run subscription, posts AI outcomes to the shared chat feed, and shows active status from `ai-status-feed` only while the run is active. Verification commands stalled without diagnostics.
- Feature 22: design-agent API flow — added `POST /api/ai/design`, persisted Trigger.dev `runId` records in Prisma, added the ownership-checked `POST /api/ai/design/token` route, and created the minimal `trigger/design-agent.ts` task.
- Feature 25: Added validated room-scoped sidebar chat through the separate `ai-chat` Liveblocks feed, with sender/timestamp rendering and send failure feedback. `git diff --check` passes; `npm run build` stalled without diagnostics and was interrupted.
- The project has a working dark workspace shell and editor chrome foundation.
- Feature 04: editor home empty state, create/rename/delete project dialogs, live slug preview, and sidebar project actions for owned projects only.
- Feature 05: Prisma schema definitions, cached client singleton, and the initial project migration.
- Feature 06: project API routes (`GET`/`POST /api/projects`, `PATCH`/`DELETE /api/projects/[projectId]`) with Clerk auth, owner-only mutations, and `401`/`403`/`404`/`400` handling — verified with live HTTP tests and `npm run build`.
- Feature 07: editor home project API wiring — server-side fetch for owned/shared lists, sidebar-only actions for project owners, create/rename/delete mutations through the real API, and successful `npm run build` verification.
- Feature 08: authenticated `/editor/[roomId]` workspace shell with owner/collaborator access checks, an access-denied state, active-project sidebar navigation, and project-aware workspace URLs.
- Feature 09: workspace share dialog with Clerk-enriched collaborator list, owner-only invite/removal APIs, read-only collaborator access, and project link copying.
- Feature 16: custom canvas edge behavior with subtle node handles, default arrowed canvas edges, custom smooth-step edge rendering, and inline label editing that updates through the collaborative edge flow.
- Issue 1 fix: inline node label editing no longer renders a duplicate static label underneath the textarea; the editor now keeps a single crisp text layer while typing and remains synced through React Flow node state.
- Sidebar project navigation fix: project names now link to their workspace from both the editor home and workspace sidebar.
- Feature 19: predefined starter template library with canvas previews and collaborative canvas replacement.
- Feature 20: canvas-only presence avatars with Clerk user filtering, live collaborator overflow stack, and Liveblocks-driven cursor tracking for other participants.
- Feature 21: authenticated Vercel Blob canvas persistence, debounced autosave, empty-room restore, and editor save status indicator; TypeScript and diff checks passed.
- Feature 22: private Vercel Blob access — private uploads persist the pathname, and authenticated project members stream canvas data through `/api/canvas/[projectId]`.
- Feature 24: the AI sidebar now subscribes to the latest validated `ai-status-feed` message inside the room provider, reflects shared processing status, disables the prompt input and shows send-button loading state, and adds thinking spinners to live cursor badges. The existing design task publishes the generic feed payload.

## In Progress

- None.

## Next Up

- Re-run `npm run build`, `npx tsc --noEmit`, and focused ESLint when the environment allows child processes to complete; prior attempts stalled without diagnostics. The known stale generated Prisma `TaskRun` delegate issue remains an existing verification concern.

## Open Questions

- Feature 08 uses `/editor/[roomId]`, but no room-to-project mapping exists yet. The current route uses the project ID as the segment; canvas/collaboration work must define the durable room ID contract.

## Architecture Decisions

- Until a room mapping is defined, `/editor/[roomId]` resolves the segment as a project ID. Project creation and sidebar navigation use that same ID so access checks remain project-scoped.

- Project metadata will live in PostgreSQL via Prisma, while the canvas JSON and generated specs remain stored outside the relational schema.
- `/api` routes perform their own Clerk auth check and return `401` directly, so `proxy.ts` skips `auth.protect()` for API paths — Clerk middleware would otherwise answer unauthenticated API requests with its default `404`.
- Project API response shapes: `{ projects }` for list, `{ project }` for create/rename, `{ success: true }` for delete, and `{ error }` for every failure.
- `ownerId` always comes from the authenticated Clerk user ID; rename/delete are owner-only (`403` for non-owners, `404` for missing projects).
- The Prisma client output lives at `prisma/generated` instead of `app/generated/prisma`, because a root-level `app/` directory takes precedence over `src/app` in Next.js and silently disabled every route.
- The Feature 05 migration is applied to the configured database with `prisma migrate deploy`.

## Session Notes

- Feature 23 uses OpenRouter (`nvidia/nemotron-3.5-lightning:free`). Feature 24 aligns its status producer with the shared `ai-status-feed` and validated status payload contract.
- Feature 23 uses OpenRouter (`nvidia/nemotron-3.5-lightning:free`) to generate validated design actions and applies node/edge operations through existing Liveblocks storage. The AI sidebar submits through the design API; the task publishes status in `ai-status-feed` and sets a cursor/thinking presence that clears when the task exits. Build and type checks remain unconfirmed in this environment because they stall without diagnostics.

- Feature 22 sets the canvas upload to private, persists `blob.pathname` in the existing mapped Prisma column, and adds an authenticated stream route that resolves the pathname only from the accessible project record. The editor now loads through that route. `@vercel/blob` 2.8.1 already meets the 2.3 requirement. Prisma Client generation, `npx tsc --noEmit`, and `git diff --check` passed; no database migration or environment edits were needed.

- Feature 21 adds `PUT`/`GET /api/projects/[projectId]/canvas`, reuses `canvasJsonPath`, stores snapshots in Vercel Blob, debounces collaborative node/edge saves, and restores state only into an empty connected Liveblocks room. Project membership is checked for reads and writes. `npx tsc --noEmit` and `git diff --check` passed; `npm run build` did not report completion after optimized compilation.

- Feature 20 AI sidebar shell is implemented in src/components/editor/ai-sidebar.tsx: preserved parent-controlled visibility and the floating width transition, added the tabbed Architect/Specs UI, starter prompts, local demo chat messages, auto-resizing input, auto-scroll, and static spec card. Existing theme tokens are used; this feature adds no backend or Liveblocks behavior. `npm run build` and `npx tsc --noEmit` both stalled without diagnostics during compilation/checking and were interrupted; verification remains open.

- Canvas selection fix: the full-node label overlay stopped `mousedown` and `click` propagation, preventing React Flow from selecting nodes on a single click. Removed those stops while retaining `nodrag`/`nopan` and double-click label editing. `npx tsc --noEmit` and `npm run build` pass; focused ESLint reports the existing `setState`-in-effect violation in `canvas-node.tsx`.
- Feature 16 adds custom canvas edges with a right-angle smooth-step path, hover and selection emphasis, arrow markers, and a live inline label editor backed by `ReactFlow` edge state. The feature uses all four node sides with dual source/target handles, keeps default handles subtle until hover, and passes a production `npm run build` check.
- Feature 15 adds a selected-node toolbar using the existing eight canvas color pairs. Swatch changes update both background and text colors through the collaborative node state. `npx tsc --noEmit` and `git diff --check` pass; the production build exits after optimized compilation starts without a completion summary.
- Feature 14 adds minimum-bounded resize handles and centered inline label editing to the collaborative node renderer. Label edits use React Flow's provider-scoped node update API and remain synchronized through Liveblocks.
- Feature 13 implementation is complete: six shape variants and a cursor-attached ghost preview are connected to the existing collaborative canvas and drag/drop flow.
- Feature 19 adds three predefined architecture templates, a lightweight scaled SVG preview grid, and a navbar import action that removes current collaborative nodes/edges before loading the selected template and fitting the view. `npm run build`, `npx tsc --noEmit`, and `git diff --check` pass.
- Feature 20 adds a canvas-only collaborator stack anchored in the top-right of the editor room, filters the current Clerk user out of Liveblocks presence, and broadcasts live cursor positions from React Flow mouse events while rendering other participants as colored cursor badges and avatars. `npm run build` passed.

- Feature 10 adds typed `cursor`/`isThinking` presence, user name/avatar/color metadata, a cached Liveblocks node client, stable hash-based cursor color assignment, and `POST /api/liveblocks-auth` with project membership checks and private room creation.
- Feature 11 adds the client room wrapper, synchronized React Flow nodes/edges, connection status feedback, and shared canvas types.
- Feature 12 adds a floating six-shape drag panel, typed size/shape payloads, screen-to-flow drop positioning, timestamp/counter IDs, and a basic custom node renderer. `npx tsc --noEmit` passes. `npm run build` stalled during optimized compilation and was interrupted; build verification remains open.
- Canvas provider issue: split the canvas into a `ReactFlowProvider` wrapper and descendant hook consumer, so `useReactFlow()` and the flow share the same provider context. `npx tsc --noEmit` and `git diff --check` pass. `npm run build` again stalled during optimized compilation and was interrupted.
- The user installed `@liveblocks/node` and configured Liveblocks public/secret keys. Fixed TypeScript module resolution by locating shared modules under `src`, and changed React Flow loose connection mode to `ConnectionMode.Loose`. `npx tsc --noEmit` passes. `npm run build` compiles and finishes TypeScript, then stalls during page-data collection and was stopped.

- Feature 09 uses the existing collaborator schema with no local user table or migration. The share dialog supports owner invites/removals, collaborator read-only listing, Clerk profile enrichment, and link copying; `npm run build` passes.
- Sidebar project navigation issue confirmed: the editor home rendered project names as plain text because workspace navigation was disabled. Project names now link to `/editor/{projectId}` in both sidebar contexts.

- Feature 06 was implemented backend-only and validated end to end: `401` on every unauthenticated request, `403` on non-owner mutations, cuid IDs, the `Untitled Project` default, and a clean `npm run build` that now includes all `src/app` routes.
- Clerk auth route fix: sign-in/sign-up public matchers now include nested paths required for Clerk's catch-all checks. Both nested probes return HTTP 200, browser initialization has no Clerk errors, and ESLint passes for `src/proxy.ts`; signed-in logout still needs an authenticated test session.
- Feature 08 adds Clerk identity and owner/collaborator access helpers, server-rendered access denial for missing or unauthorized projects, a project-aware workspace shell, active-project sidebar navigation, and project-ID workspace URLs. No canvas, AI chat, or sharing behavior was added. `npm run build` passes with `/editor/[roomId]` included.

- Issue fix: Create `ai-chat` before room authorization, handle concurrent feed creation, and reserve the composer textarea bottom/right area so scrolled content remains visible around the send button. `git diff --check` passes.
- Chat display fix: show the sender's prompt optimistically and deduplicate it against the persisted Liveblocks message using the same ID.
