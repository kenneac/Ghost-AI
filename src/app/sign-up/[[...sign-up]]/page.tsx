import { SignUp } from "@clerk/nextjs";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export default async function SignUpPage() {
  const user = await currentUser();

  if (user) {
    redirect("/editor");
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-base p-4 text-copy-primary sm:p-8">
      <div className="w-full max-w-5xl overflow-hidden rounded-[2rem] border border-surface-border bg-surface">
        <div className="grid min-h-[640px] md:grid-cols-[1.05fr_1fr]">
          <div className="flex flex-col justify-between border-b border-surface-border p-6 md:border-b-0 md:border-r md:p-10">
            <div>
              <div className="mb-8 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-surface-border bg-subtle text-sm font-medium text-copy-primary">
                  G
                </div>
                <div>
                  <p className="text-sm uppercase tracking-[0.18em] text-copy-muted">
                    Ghost AI
                  </p>
                </div>
              </div>

              <p className="text-xs uppercase tracking-[0.2em] text-copy-muted">
                Start building
              </p>
              <h1 className="mt-5 max-w-md text-3xl font-medium leading-tight text-copy-primary">
                Bring your system design work into one collaborative workspace.
              </h1>
            </div>

            <ul className="mt-10 space-y-4 text-sm text-copy-secondary">
              <li className="flex items-center gap-3">
                <span
                  className="h-2.5 w-2.5 rounded-full bg-brand"
                  aria-hidden="true"
                />
                Create projects with a clear structure from day one
              </li>
              <li className="flex items-center gap-3">
                <span
                  className="h-2.5 w-2.5 rounded-full bg-brand"
                  aria-hidden="true"
                />
                Capture architecture insights with AI-assisted refinement
              </li>
              <li className="flex items-center gap-3">
                <span
                  className="h-2.5 w-2.5 rounded-full bg-brand"
                  aria-hidden="true"
                />
                Generate polished technical specs from your shared canvas
              </li>
            </ul>
          </div>

          <div className="flex items-center justify-center p-6 md:p-10">
            <div className="w-full max-w-md">
              <SignUp routing="path" path="/sign-up" signInUrl="/sign-in" />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
