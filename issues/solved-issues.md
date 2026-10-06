# SOLVED ISSUE: GHOSTAI-STARTUP-COMMAND-001

## Issue Summary

The app failed to start because the developer ran `npx run dev` from the project root. In npm, `npx` treats the first argument as a package name to execute, not as a script alias, so npm tried to resolve a package called `run` and failed with:

> npm error could not determine executable to run

The relevant log confirmed the command was being executed as `npm exec run dev`.

## How issue was solved

The correct startup command was used instead:

- `npm run dev`
- or `npx next dev`

This launched the Next.js app successfully from the repository root. Fresh verification showed the app was ready and listening on:

- Local: http://localhost:3000
- Ready in 7.1s

This resolved the startup problem without requiring any app-code changes.
