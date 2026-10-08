# Feature Log

> ## 🤖 AGENT: READ THIS FIRST
>
> **When the user says "update feature-log.md" (or anything similar), it means: log the feature you just built in this file. Follow the steps below exactly. Do not ask the user for details you can work out yourself.**
>
> ### Steps
>
> 1. **Identify the feature.** Use the work you just did in this conversation. If it's unclear which files were touched, check `git status` and `git diff` to see what was created or modified.
> 2. **Find the last entry.** Scroll to the end of this file and note the last feature number. Your entry is the next number. If there are no entries yet, you are writing **Feature 1**.
> 3. **Append a new entry at the very END of this file**, below the previous feature, using the template in the next section. Never insert it at the top or in the middle.
> 4. **Never edit, reorder, or delete earlier entries.** If a later feature changes files from an earlier one, record that under the **new** feature's "Updated Files".
> 5. **Fill in every section.** Use `None` where nothing applies (for example, no existing files were modified).
> 6. **Reply with one line** confirming which feature you logged, for example: "Logged Feature 3: Password reset flow."
>
> ### Rules for the entry
>
> - **New Files** = files you created for this feature. Give the full path from the project root, then bullet points on what each file does.
> - **Updated Files** = existing files you modified. Give the full path, then bullet points on **what changed** and **why**.
> - List only files that were really created or changed. No guessing, no filler.
> - Keep each bullet to one short line. Be specific.
> - If you built several separate features since the last update, add **one entry per feature**, in the order you built them.
> - If you haven't built or changed anything since the last entry, tell the user there is nothing new to log. Do not invent an entry.

---

## Entry Template

Copy this structure for every new feature:

```md
### Feature N: <Feature Name>

**Date:** YYYY-MM-DD

**Description:** One or two sentences on what the feature does.

#### New Files

- `path/to/new-file.ext`
  - What this file does
  - Any key detail worth knowing

#### Updated Files

- `path/to/existing-file.ext`
  - What was modified
  - Why it was modified

---
```

---

# Features

### Feature 1: Prisma project metadata foundation

**Date:** 2026-10-07

**Description:** Added the initial project and collaborator schema, cached Prisma client singleton, and first migration for project ownership and collaborator access.

#### New Files

- `prisma/models/project.prisma`
  - Defines the `ProjectStatus` enum, `Project`, and `ProjectCollaborator` models with the required relations and indexes.
  - Keeps the project metadata aligned with the owner-ID and collaborator access model.

- `lib/prisma.ts`
  - Creates a cached Prisma client singleton with a `DATABASE_URL` branch for `prisma+postgres://` Accelerate URLs and direct Postgres adapters otherwise.
  - Uses the project’s generated Prisma client and keeps hot-reload caching in development.

- `prisma/migrations/20261007221316_add_project_models/migration.sql`
  - Applies the initial migration for the projects and project_collaborators tables.

#### Updated Files

- `prisma/schema.prisma`
  - Keeps the Prisma v7 schema root and ensures the schema is valid with the project models in the Prisma folder.

- `package.json`
  - Adds `@prisma/extension-accelerate` required for the Prisma Postgres Accelerate branch.

- `context-progress/progress-tracker.md`
  - Marks the Prisma feature as in progress and updates the active goal and session notes for the current implementation step.

---

### Feature 2: Project API routes

**Date:** 2026-10-08

**Description:** Added authenticated REST endpoints for listing, creating, renaming, and deleting projects with Clerk auth, owner-only mutations, and consistent `401`/`403`/`404`/`400` error responses. Also applied the pending Feature 05 project migration to the configured database.

#### New Files

- `src/app/api/projects/route.ts`
  - `GET` lists the signed-in user's projects; `POST` creates a project with the Clerk user ID as `ownerId`.
  - Defaults a missing or blank name to `Untitled Project`, returns `201`, and relies on the schema's cuid ID strategy.
- `src/app/api/projects/[projectId]/route.ts`
  - `PATCH` renames and `DELETE` removes a project after the owner check.
  - Returns `403` for non-owners, `404` for missing projects, and `400` for invalid input.
- `src/lib/project-api.ts`
  - Shared helpers: Clerk auth resolution, JSON body parsing, error responses, and owner-only project lookup.

#### Updated Files

- `src/proxy.ts`
  - Skips `auth.protect()` for `/api` routes so handlers return JSON `401` instead of Clerk's default `404` for unauthenticated API requests.
- `lib/prisma.ts`
  - Types the singleton as the static `PrismaClient` (cast on the Accelerate branch) so both connection branches stay callable; import moved to the new generated path.
- `prisma/schema.prisma`
  - Moves the generated client output from `app/generated/prisma` to `prisma/generated`.
  - Why: a root-level `app/` directory wins over `src/app` in Next.js and was silently excluding every route from the build.
- `.gitignore`
  - Ignores the new `/prisma/generated/` output and retains the old `app` path.
- `context-progress/progress-tracker.md`
  - Marks Feature 06 in progress, then completed, and records the API security and layout decisions.

---

### Feature 3: Editor home API wiring

**Date:** 2026-10-08

**Description:** Wired the editor home to real project data by moving the initial project list to a server-side fetch, updating the sidebar to separate owned and shared projects, and connecting create, rename, and delete flows to the authenticated project API with workspace navigation and refresh handling.

#### New Files

- `src/lib/project-data.ts`
  - Fetches the signed-in user’s owned projects and collaborator-shared projects server-side.
  - Derives the sidebar project list without doing client-side fetches on initial load.
- `src/hooks/use-project-dialogs.ts`
  - Centralizes project dialog state, form state, mutation calls, and navigation logic.
  - Creates a unique room suffix for create flows and keeps the project and room navigation behavior aligned.
- `src/components/editor/editor-home.tsx`
  - Composes the editor shell, sidebar, empty-state home content, and API-backed dialog interactions.
  - Keeps the create/rename/delete dialogs consistent with the feature spec and dark editor styling.

#### Updated Files

- `src/app/editor/page.tsx`
  - Converts the editor page to a server component that loads the real project lists before rendering the client editor shell.
  - Why: the spec requires server-side fetching for the initial project list.
- `src/components/editor/project-sidebar.tsx`
  - Accepts separate `ownedProjects` and `sharedProjects` arrays and only shows action buttons for owned entries.
  - Why: the sidebar must distinguish owner-only actions from collaborator-only views.
- `src/components/editor/use-project-dialogs.ts`
  - Replaced the mock implementation with a compatibility re-export of the real hook.
  - Why: the editor home and existing imports now resolve to the API-backed hook path.
- `context-progress/progress-tracker.md`
  - Marks Feature 07 as completed and records the final implementation and verification status.

---
