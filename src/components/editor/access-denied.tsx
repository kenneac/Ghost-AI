import Link from "next/link";
import { LockKeyhole } from "lucide-react";

export function AccessDenied() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-base px-6 text-copy-primary">
      <section className="flex max-w-md flex-col items-center text-center">
        <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl border border-surface-border bg-surface text-copy-muted">
          <LockKeyhole className="h-6 w-6" aria-hidden="true" />
        </div>
        <h1 className="text-xl font-semibold">Project unavailable</h1>
        <p className="mt-2 text-sm leading-6 text-copy-muted">
          This project does not exist or you do not have access to it.
        </p>
        <Link
          href="/editor"
          className="mt-6 rounded-xl border border-surface-border px-4 py-2 text-sm text-copy-primary transition-colors hover:bg-subtle"
        >
          Back to projects
        </Link>
      </section>
    </main>
  );
}
