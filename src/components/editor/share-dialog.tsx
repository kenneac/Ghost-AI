"use client";

import { useEffect, useState } from "react";
import { Check, Copy, LoaderCircle, Mail, Trash2, Users } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface Collaborator {
  id: string;
  email: string;
  name?: string | null;
  imageUrl?: string;
}

interface CollaboratorsResponse {
  collaborators: Collaborator[];
  isOwner: boolean;
}

interface ShareDialogProps {
  projectId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

async function readJsonResponse<T>(response: Response): Promise<T> {
  const text = await response.text();

  if (!text) {
    throw new Error("The server returned an empty response.");
  }

  try {
    return JSON.parse(text) as T;
  } catch {
    const snippet = text.replace(/\s+/g, " ").slice(0, 180);
    throw new Error(
      snippet
        ? `The server returned an invalid response: ${snippet}`
        : "The server returned an invalid response.",
    );
  }
}

export function ShareDialog({
  projectId,
  open,
  onOpenChange,
}: ShareDialogProps) {
  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
  const [isOwner, setIsOwner] = useState(false);
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [copied, setCopied] = useState(false);

  async function loadCollaborators() {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/projects/${projectId}/collaborators`);
      const result = await readJsonResponse<
        CollaboratorsResponse | { error?: string }
      >(response);
      if (!response.ok || !("collaborators" in result)) {
        throw new Error(
          "error" in result ? result.error : "Could not load collaborators",
        );
      }
      setCollaborators(result.collaborators);
      setIsOwner(result.isOwner);
    } catch (cause) {
      setError(
        cause instanceof Error ? cause.message : "Could not load collaborators",
      );
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    if (open) void loadCollaborators();
  }, [open, projectId]);

  useEffect(() => {
    if (!copied) return;
    const timeout = window.setTimeout(() => setCopied(false), 1800);
    return () => window.clearTimeout(timeout);
  }, [copied]);

  async function inviteCollaborator(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);
    try {
      const response = await fetch(`/api/projects/${projectId}/collaborators`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const result = await readJsonResponse<{ error?: string }>(response);
      if (!response.ok)
        throw new Error(result.error ?? "Could not invite collaborator");
      setEmail("");
      await loadCollaborators();
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : "Could not invite collaborator",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  async function removeCollaborator(collaboratorEmail: string) {
    setError(null);
    try {
      const response = await fetch(`/api/projects/${projectId}/collaborators`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: collaboratorEmail }),
      });
      const result = await readJsonResponse<{ error?: string }>(response);
      if (!response.ok)
        throw new Error(result.error ?? "Could not remove collaborator");
      setCollaborators((current) =>
        current.filter((item) => item.email !== collaboratorEmail),
      );
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : "Could not remove collaborator",
      );
    }
  }

  async function copyProjectLink() {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
    } catch {
      setError("Could not copy the project link");
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-3xl border border-surface-border bg-surface text-copy-primary sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg">
            <Users className="h-5 w-5 text-brand" />
            Share project
          </DialogTitle>
          <DialogDescription className="text-copy-muted">
            {isOwner
              ? "Invite people to collaborate on this system design."
              : "People with access to this project."}
          </DialogDescription>
        </DialogHeader>

        {isOwner ? (
          <form onSubmit={inviteCollaborator} className="flex gap-2">
            <label className="sr-only" htmlFor="collaborator-email">
              Collaborator email
            </label>
            <input
              id="collaborator-email"
              type="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="name@example.com"
              className="h-10 min-w-0 flex-1 rounded-xl border border-surface-border bg-elevated px-3 text-sm outline-none placeholder:text-copy-muted focus:border-brand"
            />
            <Button type="submit" disabled={isSubmitting} className="gap-2">
              {isSubmitting ? (
                <LoaderCircle className="h-4 w-4 animate-spin" />
              ) : (
                <Mail className="h-4 w-4" />
              )}
              Invite
            </Button>
          </form>
        ) : null}

        <div>
          <h3 className="mb-3 text-xs font-medium uppercase tracking-wide text-copy-muted">
            Collaborators ({collaborators.length})
          </h3>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <LoaderCircle className="h-5 w-5 animate-spin text-copy-muted" />
            </div>
          ) : collaborators.length ? (
            <ul className="max-h-64 space-y-1 overflow-y-auto">
              {collaborators.map((collaborator) => (
                <li
                  key={collaborator.id}
                  className="flex items-center gap-3 rounded-xl px-2 py-2"
                >
                  {collaborator.imageUrl ? (
                    // Clerk-hosted profile image for the matched collaborator email.
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={collaborator.imageUrl}
                      alt=""
                      className="h-9 w-9 rounded-full object-cover"
                    />
                  ) : (
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-subtle text-sm text-copy-muted">
                      {(collaborator.name ?? collaborator.email)
                        .slice(0, 1)
                        .toUpperCase()}
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">
                      {collaborator.name ?? collaborator.email}
                    </p>
                    {collaborator.name ? (
                      <p className="truncate text-xs text-copy-muted">
                        {collaborator.email}
                      </p>
                    ) : null}
                  </div>
                  {isOwner ? (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      aria-label={`Remove ${collaborator.email}`}
                      onClick={() =>
                        void removeCollaborator(collaborator.email)
                      }
                      className="shrink-0 text-copy-muted hover:text-state-error"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  ) : null}
                </li>
              ))}
            </ul>
          ) : (
            <p className="py-5 text-center text-sm text-copy-muted">
              No collaborators yet.
            </p>
          )}
        </div>

        {error ? (
          <p role="alert" className="text-sm text-state-error">
            {error}
          </p>
        ) : null}

        <div className="flex items-center justify-between gap-3 border-t border-surface-border pt-4">
          <p className="text-xs text-copy-muted">
            Anyone with the project link still needs access.
          </p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => void copyProjectLink()}
            className="shrink-0 gap-2"
          >
            {copied ? (
              <Check className="h-4 w-4" />
            ) : (
              <Copy className="h-4 w-4" />
            )}
            {copied ? "Copied!" : "Copy link"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
