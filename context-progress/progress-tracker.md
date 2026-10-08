# Progress Tracker

Update this file whenever the current phase, active feature, or implementation state changes.

## Current Phase

- Feature 09 (share dialog) — completed

## Current Goal

- Continue with the next defined canvas feature after completing collaborator sharing.

## Completed

- The project has a working dark workspace shell and editor chrome foundation.
- Feature 04: editor home empty state, create/rename/delete project dialogs, live slug preview, and sidebar project actions for owned projects only.
- Feature 05: Prisma schema definitions, cached client singleton, and the initial project migration.
- Feature 06: project API routes (`GET`/`POST /api/projects`, `PATCH`/`DELETE /api/projects/[projectId]`) with Clerk auth, owner-only mutations, and `401`/`403`/`404`/`400` handling — verified with live HTTP tests and `npm run build`.
- Feature 07: editor home project API wiring — server-side fetch for owned/shared lists, sidebar-only actions for project owners, create/rename/delete mutations through the real API, and successful `npm run build` verification.
- Feature 08: authenticated `/editor/[roomId]` workspace shell with owner/collaborator access checks, an access-denied state, active-project sidebar navigation, and project-aware workspace URLs.
- Feature 09: workspace share dialog with Clerk-enriched collaborator list, owner-only invite/removal APIs, read-only collaborator access, and project link copying.

## In Progress

- None.

## Next Up

- Resolve the durable room ID to project ID mapping as part of the canvas and collaboration feature.

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

- Feature 09 uses the existing collaborator schema with no local user table or migration. The share dialog supports owner invites/removals, collaborator read-only listing, Clerk profile enrichment, and link copying; `npm run build` passes.

- Feature 06 was implemented backend-only and validated end to end: `401` on every unauthenticated request, `403` on non-owner mutations, cuid IDs, the `Untitled Project` default, and a clean `npm run build` that now includes all `src/app` routes.
- Clerk auth route fix: sign-in/sign-up public matchers now include nested paths required for Clerk's catch-all checks. Both nested probes return HTTP 200, browser initialization has no Clerk errors, and ESLint passes for `src/proxy.ts`; signed-in logout still needs an authenticated test session.
- Feature 08 adds Clerk identity and owner/collaborator access helpers, server-rendered access denial for missing or unauthorized projects, a project-aware workspace shell, active-project sidebar navigation, and project-ID workspace URLs. No canvas, AI chat, or sharing behavior was added. `npm run build` passes with `/editor/[roomId]` included.
