# Progress Tracker

Update this file whenever the current phase, active feature, or implementation state changes.

## Current Phase

- Feature 07 (editor home API wiring) — completed

## Current Goal

- Wire the editor home to the real project API and keep the sidebar, create/rename/delete flows, and workspace navigation aligned with the authenticated project data.

## Completed

- The project has a working dark workspace shell and editor chrome foundation.
- Feature 04: editor home empty state, create/rename/delete project dialogs, live slug preview, and sidebar project actions for owned projects only.
- Feature 05: Prisma schema definitions, cached client singleton, and the initial project migration.
- Feature 06: project API routes (`GET`/`POST /api/projects`, `PATCH`/`DELETE /api/projects/[projectId]`) with Clerk auth, owner-only mutations, and `401`/`403`/`404`/`400` handling — verified with live HTTP tests and `npm run build`.
- Feature 07: editor home project API wiring — server-side fetch for owned/shared lists, sidebar-only actions for project owners, create/rename/delete mutations through the real API, and successful `npm run build` verification.

## In Progress

- None.

## Next Up

- Continue with the next feature once the editor API flow is expanded beyond the project list, create, rename, and delete flow.

## Open Questions

- None at this stage.

## Architecture Decisions

- Project metadata will live in PostgreSQL via Prisma, while the canvas JSON and generated specs remain stored outside the relational schema.
- `/api` routes perform their own Clerk auth check and return `401` directly, so `proxy.ts` skips `auth.protect()` for API paths — Clerk middleware would otherwise answer unauthenticated API requests with its default `404`.
- Project API response shapes: `{ projects }` for list, `{ project }` for create/rename, `{ success: true }` for delete, and `{ error }` for every failure.
- `ownerId` always comes from the authenticated Clerk user ID; rename/delete are owner-only (`403` for non-owners, `404` for missing projects).
- The Prisma client output lives at `prisma/generated` instead of `app/generated/prisma`, because a root-level `app/` directory takes precedence over `src/app` in Next.js and silently disabled every route.
- The Feature 05 migration is applied to the configured database with `prisma migrate deploy`.

## Session Notes

- Feature 06 was implemented backend-only and validated end to end: `401` on every unauthenticated request, `403` on non-owner mutations, cuid IDs, the `Untitled Project` default, and a clean `npm run build` that now includes all `src/app` routes.
