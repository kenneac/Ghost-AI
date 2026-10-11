## Summary

Ghost AI is a web workspace for creating system architecture canvases collaboratively, generating canvas changes with AI, and producing downloadable Markdown specifications. Its backend is implemented with Next.js App Router route handlers and Trigger.dev tasks. No mobile application or mobile source tree was found in this repository.

`Next.js, React, React DOM, TypeScript, JavaScript, Node.js, PostgreSQL, Prisma ORM, prisma, @prisma/client, @prisma/adapter-pg, @prisma/extension-accelerate, pg, Clerk, @clerk/nextjs, @clerk/themes, Liveblocks, @liveblocks/client, @liveblocks/node, @liveblocks/react, @liveblocks/react-flow, React Flow, @xyflow/react, Trigger.dev, @trigger.dev/sdk, @trigger.dev/react-hooks, @trigger.dev/build, OpenRouter, @openrouter/ai-sdk-provider, AI SDK, ai, Zod, Vercel Blob, @vercel/blob, Tailwind CSS, tailwindcss, @tailwindcss/postcss, shadcn, Base UI, @base-ui/react, Lucide React, lucide-react, class-variance-authority, clsx, cn, tailwind-merge, tw-animate-css, ESLint, eslint-config-next, PostCSS, Babel React Compiler, dotenv, tsx, @types/node, @types/pg, @types/react`

## Functions / Features

- 🔐 Clerk sign-in/sign-up and protected workspace pages.
- 📁 Create, rename, delete, and list architecture projects.
- 👥 Invite and remove project collaborators by email; project access is shared with collaborators.
- 🧩 Edit a shared system-design canvas with React Flow and Liveblocks, including presence and cursors.
- 🗂️ Import built-in starter canvas templates.
- ✨ Ask an OpenRouter-backed Trigger.dev task to add or update nodes and edges in the shared canvas.
- 📝 Generate Markdown technical specifications from canvas data and project chat context.
- ⬇️ Persist specifications and canvas snapshots in private Vercel Blob storage, with authenticated preview/download routes.
- 📱 No mobile app implementation is present in the inspected repository.

## Technologies and Their Functions

Versions below are the resolved versions recorded in `package-lock.json`.
| TypeScript / JavaScript | 5.9.3 (lockfile-resolved); JavaScript is also used by some app/config files. | Application and task implementation languages. |
| PostCSS | 8.5.29 | CSS transformation pipeline used by the Tailwind PostCSS plugin. |

| Technology                                                                                           | Version                                                                                | Function in this project                                                                                                                                       |
| ---------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Next.js                                                                                              | 16.3.8                                                                                 | App Router UI, server rendering, middleware proxy, and API route handlers.                                                                                     |
| React / React DOM                                                                                    | 19.2.8                                                                                 | Interactive editor and server/client component rendering.                                                                                                      |
| TypeScript / JavaScript                                                                              | TypeScript configured in `tsconfig.json`; JavaScript is used by some app/config files. | Application and task implementation languages.                                                                                                                 |
| Node.js                                                                                              | Trigger runtime is configured as `node`; a project-wide Node version is not specified. | Runtime for Trigger.dev tasks and server-side packages.                                                                                                        |
| Clerk (`@clerk/nextjs`)                                                                              | 7.9.11                                                                                 | User identity, sign-in UI, current-user lookup, and server authentication.                                                                                     |
| Clerk themes (`@clerk/themes`)                                                                       | 2.4.57                                                                                 | Dark appearance configuration for Clerk UI.                                                                                                                    |
| Liveblocks (`@liveblocks/client`, `@liveblocks/node`, `@liveblocks/react`, `@liveblocks/react-flow`) | 3.24.3                                                                                 | Shared room storage, presence, room authorization, feeds, and collaboration bindings.                                                                          |
| React Flow (`@xyflow/react`)                                                                         | 12.12.0                                                                                | Canvas nodes, edges, and graph interaction.                                                                                                                    |
| Trigger.dev (`@trigger.dev/sdk`, `@trigger.dev/react-hooks`, `@trigger.dev/build`)                   | 4.7.3                                                                                  | Durable design/spec tasks, task deployment tooling, and live run subscriptions in the UI.                                                                      |
| OpenRouter provider (`@openrouter/ai-sdk-provider`)                                                  | 3.1.0                                                                                  | Connects the AI SDK to the configured OpenRouter model.                                                                                                        |
| AI SDK (`ai`)                                                                                        | 7.0.136                                                                                | Structured design output and generated specification text.                                                                                                     |
| Zod                                                                                                  | 4.6.5 (lockfile-resolved transitive package)                                           | Validates AI task payloads, generated design actions, and selected API request bodies. It is imported by source but is not a direct `package.json` dependency. |
| Prisma CLI / Client                                                                                  | 7.10.0                                                                                 | Defines and accesses PostgreSQL project, collaborator, task-run, and specification records.                                                                    |
| Prisma PostgreSQL adapter (`@prisma/adapter-pg`)                                                     | 7.10.0                                                                                 | Connects Prisma Client to PostgreSQL through the `pg` driver.                                                                                                  |
| Prisma Accelerate extension (`@prisma/extension-accelerate`)                                         | 3.0.1                                                                                  | Supports Prisma Accelerate connection URLs in the Prisma client factory.                                                                                       |
| PostgreSQL driver (`pg`)                                                                             | 8.23.1                                                                                 | PostgreSQL driver used by the Prisma adapter.                                                                                                                  |
| Vercel Blob (`@vercel/blob`)                                                                         | 2.8.1                                                                                  | Stores private canvas snapshots and generated Markdown artifacts.                                                                                              |
| Tailwind CSS                                                                                         | 4.3.3                                                                                  | Utility styling for the application UI.                                                                                                                        |
| shadcn                                                                                               | 4.21.2                                                                                 | UI component tooling; project components are under `src/components/ui`.                                                                                        |
| Base UI (`@base-ui/react`)                                                                           | 1.8.0                                                                                  | Primitives used by the local button, dialog, input, scroll-area, and tabs components.                                                                          |
| Lucide React                                                                                         | 1.52.0                                                                                 | Interface icons.                                                                                                                                               |
| class-variance-authority / clsx / cn / tailwind-merge                                                | 0.7.1 / 2.1.1 / 0.4.0 / 3.7.0                                                          | Component variants, conditional class composition, and Tailwind class merging.                                                                                 |
| tw-animate-css                                                                                       | 1.4.0                                                                                  | CSS animation utilities imported by the global stylesheet.                                                                                                     |
| PostCSS Tailwind plugin (`@tailwindcss/postcss`)                                                     | 4.3.3                                                                                  | Tailwind CSS processing in `postcss.config.mjs`.                                                                                                               |
| ESLint / eslint-config-next                                                                          | 9.39.5 / 16.3.8                                                                        | Linting and Next.js lint rules.                                                                                                                                |
| Babel React Compiler plugin                                                                          | 1.0.0                                                                                  | React Compiler integration enabled by `next.config.mjs`.                                                                                                       |
| dotenv                                                                                               | 18.0.6                                                                                 | Loads environment variables for `prisma7.config.ts`.                                                                                                           |
| tsx                                                                                                  | 4.23.15                                                                                | Installed TypeScript execution utility; no package script currently invokes it.                                                                                |
| Type packages (`@types/node`, `@types/pg`, `@types/react`)                                           | 26.6.4 / 8.23.1 / 19.3.0                                                               | Development-time TypeScript definitions.                                                                                                                       |

### Data and integrations

- PostgreSQL holds relational metadata. `Project` relates to `ProjectCollaborator`, `TaskRun`, and `ProjectSpec` records.
- Vercel Blob holds the canvas JSON and Markdown specification content; Prisma stores the Blob pathname/reference.
- Clerk user IDs own projects; collaborator access is resolved using the current user's email.
- Liveblocks is used for shared canvas state, presence, cursors, and AI status/chat feeds.
- Trigger.dev runs `design-agent` and `generate-spec`; both use the OpenRouter model `nvidia/nemotron-3.5-lightning:free`.

### Commands declared in `package.json`

- `npm run dev` starts the Next.js development server.
- `npm run build` builds the Next.js application; `npm run start` starts the production server.
- `npm run lint` runs ESLint.
- `npm run trigger:dev` and `npm run trigger:deploy` start and deploy Trigger.dev tasks.

### Environment configuration

The checked-in `env.copy` lists Clerk, Blob, Trigger.dev, OpenRouter, database, and Liveblocks keys. Source directly reads `DATABASE_URL`, `LIVEBLOCKS_SECRET_KEY`, and `OPEN_ROUTER_API_KEY`; Clerk and Vercel Blob use their SDK environment configuration. `trigger.config.ts` currently contains a placeholder project reference. `GEMINI_API_KEY` and `TRIGGER_PROJECT_REF` appear in `env.copy` but are not read by application source in this repository.

## 📁 Simplified Project Structure

```text
.
├── backend/
│   └── documentation/
│       └── backend_api_documentation.html  # Interactive backend architecture guide
├── context/                                # Product, architecture, UI, and feature specifications
├── lib/
│   └── prisma.ts                           # Prisma Client and PostgreSQL adapter setup
├── prisma/
│   ├── models/project.prisma               # Project, collaborator, run, and spec models
│   ├── migrations/                         # PostgreSQL migrations
│   └── generated/                          # Generated Prisma Client
├── src/
│   ├── app/
│   │   ├── api/                            # Next.js route-handler API
│   │   ├── editor/                         # Project list and workspace pages
│   │   ├── sign-in/ and sign-up/            # Clerk authentication pages
│   │   ├── globals.css                     # Application styles and theme tokens
│   │   └── layout.js                       # Root layout and Clerk provider
│   ├── components/editor/                  # Canvas, collaboration, dialogs, AI/spec UI
│   ├── components/ui/                      # Reusable Base UI/shadcn-style components
│   ├── hooks/                              # Canvas autosave and editor interaction hooks
│   ├── lib/                                # Project access, API helpers, and Liveblocks setup
│   ├── proxy.ts                            # Clerk page protection and API bypass matcher
│   └── types/                              # Canvas and task payload types
├── trigger/                                # Durable AI design and spec tasks
├── package.json                            # Dependencies and scripts
├── package-lock.json                       # Resolved npm dependency versions
├── prisma7.config.ts                       # Prisma schema, migrations, and datasource config
└── trigger.config.ts                       # Trigger.dev project/task configuration
```

The backend has no separate Express server, controller directory, or service directory. API logic is implemented in `src/app/api/**/route.ts`; shared auth, validation, and project-access helpers live in `src/lib`.

### API route groups

- Projects: `GET/POST /api/projects`, `PATCH/DELETE /api/projects/{projectId}`, and collaborator management under `/api/projects/{projectId}/collaborators`.
- Canvas: `PUT /api/projects/{projectId}/canvas` saves a private snapshot; `GET /api/canvas/{projectId}` streams it to an authorized user.
- Collaboration: `POST /api/liveblocks-auth` verifies project access and issues a room token.
- AI: `POST /api/ai/design` and `/api/ai/spec` trigger background tasks; matching `/token` routes issue restricted run-read tokens.
- Specifications: project-scoped list, preview, and download routes under `/api/projects/{projectId}/specs`.

Full endpoint, request-flow, middleware, authentication, and data-model diagrams are in [backend_api_documentation.html](backend/documentation/backend_api_documentation.html).
