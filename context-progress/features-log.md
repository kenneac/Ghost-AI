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

### Feature 4: Editor workspace shell

**Date:** 2026-10-08

**Description:** Added the authenticated `/editor/[roomId]` workspace shell with server-side owner and collaborator access checks, a dedicated access-denied state, project context in the navbar, current-project sidebar navigation, a canvas placeholder, and an AI sidebar placeholder. Project creation now navigates to the project-scoped workspace URL.

#### New Files

- `src/app/editor/[roomId]/page.tsx`
  - Resolves the project from the route segment, redirects signed-out users, and renders access denied for missing or unauthorized projects.
- `src/components/editor/access-denied.tsx`
  - Shows a centered lock state and a link back to `/editor`.
- `src/components/editor/editor-workspace.tsx`
  - Composes the workspace navbar, project sidebar, canvas placeholder, and toggleable AI sidebar placeholder.
- `src/lib/project-access.ts`
  - Resolves Clerk identity and checks project access by owner ID or primary email collaborator membership.

#### Updated Files

- `src/components/editor/editor-navbar.tsx`
  - Adds optional project title and workspace action slots for Share and AI controls.
- `src/components/editor/project-sidebar.tsx`
  - Adds active-project highlighting and workspace navigation links.
- `src/hooks/use-project-dialogs.ts`
  - Routes created projects to `/editor/{projectId}` and detects the active project from the path when deleting.
- `context-progress/progress-tracker.md`
  - Marks Feature 08 complete and records the room-to-project mapping decision and remaining open question.

---

### Feature 5: Share dialog and collaborator management

**Date:** 2026-10-08

**Description:** Added project sharing from the editor workspace. Owners can invite and remove collaborators, while project members can view the collaborator list; Clerk profiles enrich collaborator emails when available, and users can copy the project link.

#### New Files

- `src/app/api/projects/[projectId]/collaborators/route.ts`
  - Lists collaborators for project members and enriches matching emails with Clerk names and avatars.
  - Adds owner-only invite and removal handlers with input validation.
- `src/components/editor/share-dialog.tsx`
  - Renders collaborator profiles and owner-only invite/removal controls.
  - Copies the workspace URL and shows temporary `Copied!` feedback.

#### Updated Files

- `context/feature-specs/09-share-dialog.md`
  - Tracks the feature status as completed.
- `context-progress/progress-tracker.md`
  - Marks Feature 09 completed and records the implementation and build verification.
- `src/components/editor/editor-workspace.tsx`
  - Opens the Share dialog from the workspace navbar button.

---

### Feature 6: Sidebar project navigation fix

**Date:** 2026-10-08

**Description:** Fixed the editor home sidebar so existing projects can be opened immediately. Project names now link to their project workspace from both the home page and workspace sidebar.

#### New Files

- None.

#### Updated Files

- `src/components/editor/project-sidebar.tsx`
  - Renders project names as workspace links in both sidebar contexts.
  - Closes the sidebar after selection and marks the active workspace link.
- `context-progress/progress-tracker.md`
  - Records the confirmed cause and completed navigation fix.

---
### Feature 10: Liveblocks setup

**Date:** 2026-10-08

**Description:** Added the typed Liveblocks presence and user metadata contract, a cached server client, deterministic per-user cursor colors, and an authenticated endpoint that checks project access before creating a private project room and issuing a session token.

#### New Files

- `lib/liveblocks.ts`
  - Caches the Liveblocks node client and deterministically maps Clerk user IDs to a fixed cursor-color palette.
- `src/app/api/liveblocks-auth/route.ts`
  - Authenticates callers, validates the requested project room, checks owner/collaborator access, ensures a private room exists, and returns a token with name, avatar, and cursor color.

#### Updated Files

- `liveblocks.config.ts`
  - Defines cursor position and `isThinking` presence plus user ID, display name, avatar URL, and cursor color metadata.
- `context-progress/progress-tracker.md`
  - Records Feature 10 implementation and the outstanding dependency/build verification blocker.

#### Verification

- `npm run build` and `npx tsc --noEmit` did not complete in this environment.
- `@liveblocks/node` is absent from the installed dependencies; `npm install @liveblocks/node` stalled because npm registry access is unavailable. Re-run installation and build verification with registry access.

---
