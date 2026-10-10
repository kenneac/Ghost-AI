"use client";

import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import { useCreateFeedMessage, useFeedMessages, useSelf } from "@liveblocks/react";
import { useRealtimeRun } from "@trigger.dev/react-hooks";
import { ArrowUp, Bot, Download, FileText, LoaderCircle, Sparkles, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { SpecMarkdown } from "@/components/editor/spec-markdown";
import { cn } from "@/lib/utils";
import {
  aiChatMessageSchema,
  aiStatusMessageSchema,
  type AiChatMessage,
  type AiStatusMessage,
} from "@/types/tasks";

type AiTabValue = "architect" | "specs";
type ChatMessage = AiChatMessage & {
  id: string;
};

interface ProjectSpecSummary {
  id: string;
  filename: string;
  createdAt: string;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function parseSpecSummaries(value: unknown): ProjectSpecSummary[] {
  if (!isRecord(value) || !Array.isArray(value.specs)) return [];
  return value.specs.flatMap((item) => {
    if (!isRecord(item) || typeof item.id !== "string" || typeof item.filename !== "string" || typeof item.createdAt !== "string") return [];
    return [{ id: item.id, filename: item.filename, createdAt: item.createdAt }];
  });
}

const starterPrompts = [
  "Design an e-commerce backend",
  "Create a chat app architecture",
  "Build a CI/CD pipeline",
];

const AI_STATUS_FEED_ID = "ai-status-feed";
const AI_CHAT_FEED_ID = "ai-chat";

export function AiSidebar({
  isOpen,
  onClose,
  projectId,
  roomId,
}: {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
  roomId: string;
}) {
  const [activeTab, setActiveTab] = useState<AiTabValue>("architect");
  const [draft, setDraft] = useState("");
  const [optimisticMessages, setOptimisticMessages] = useState<ChatMessage[]>([]);
  const [sendError, setSendError] = useState<string | null>(null);
  const [runId, setRunId] = useState<string>();
  const [publicToken, setPublicToken] = useState<string>();
  const [runType, setRunType] = useState<"design" | "spec">("design");
  const [isStartingRun, setIsStartingRun] = useState(false);
  const [isGeneratingSpec, setIsGeneratingSpec] = useState(false);
  const [specs, setSpecs] = useState<ProjectSpecSummary[]>([]);
  const [specListError, setSpecListError] = useState<string | null>(null);
  const [specNotice, setSpecNotice] = useState<string | null>(null);
  const [specReloadKey, setSpecReloadKey] = useState(0);
  const [selectedSpec, setSelectedSpec] = useState<ProjectSpecSummary | null>(null);
  const [specContent, setSpecContent] = useState<string | null>(null);
  const [specContentError, setSpecContentError] = useState<string | null>(null);
  const [isLoadingSpecContent, setIsLoadingSpecContent] = useState(false);
  const createFeedMessage = useCreateFeedMessage();
  const self = useSelf();
  const { run, error: realtimeError } = useRealtimeRun(runId, {
    accessToken: publicToken,
    enabled: Boolean(runId && publicToken),
  });
  const { messages: feedMessages } = useFeedMessages(AI_STATUS_FEED_ID, { limit: 20 });
  const { messages: chatFeedMessages } = useFeedMessages(AI_CHAT_FEED_ID, { limit: 100 });
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const chatAreaRef = useRef<HTMLDivElement | null>(null);
  const completedRunRef = useRef<string | null>(null);
  const latestStatus = feedMessages
    ?.slice()
    .sort((left, right) => left.createdAt - right.createdAt)
    .reduce<AiStatusMessage | undefined>((latest, feedMessage) => {
      const parsed = aiStatusMessageSchema.safeParse(feedMessage.data);
      return parsed.success ? parsed.data : latest;
    }, undefined);
  const terminalStatuses = ["COMPLETED", "FAILED", "CANCELED", "CRASHED", "EXPIRED", "TIMED_OUT", "SYSTEM_FAILURE"];
  const isRunActive = Boolean(runId && (!run || !terminalStatuses.includes(run.status)));
  const isBusy = isStartingRun || isGeneratingSpec || isRunActive;
  const persistedMessages = (chatFeedMessages ?? [])
    .map((feedMessage) => {
      const parsed = aiChatMessageSchema.safeParse(feedMessage.data);
      return parsed.success
        ? { ...parsed.data, id: feedMessage.id }
        : null;
    })
    .filter((message): message is ChatMessage => message !== null)
  const persistedMessageIds = new Set(persistedMessages.map((message) => message.id));
  const messages = [...persistedMessages, ...optimisticMessages.filter((message) => !persistedMessageIds.has(message.id))]
    .sort((left, right) => left.timestamp - right.timestamp || left.id.localeCompare(right.id));

  useEffect(() => {
    const controller = new AbortController();
    const loadSpecs = async () => {
      setSpecListError(null);
      try {
        const response = await fetch(`/api/projects/${projectId}/specs`, { signal: controller.signal });
        const result: unknown = await response.json();
        if (!response.ok) throw new Error(isRecord(result) && typeof result.error === "string" ? result.error : "Could not load specifications.");
        setSpecs(parseSpecSummaries(result));
      } catch (error) {
        if (!controller.signal.aborted) setSpecListError(error instanceof Error ? error.message : "Could not load specifications.");
      }
    };
    void loadSpecs();
    return () => controller.abort();
  }, [projectId, specReloadKey]);

  useEffect(() => {
    if (!selectedSpec) {
      setSpecContent(null);
      setSpecContentError(null);
      return;
    }
    const controller = new AbortController();
    const loadContent = async () => {
      setIsLoadingSpecContent(true);
      setSpecContentError(null);
      try {
        const response = await fetch(`/api/projects/${projectId}/specs/${selectedSpec.id}`, { signal: controller.signal });
        if (!response.ok) {
          const result: unknown = await response.json().catch(() => null);
          throw new Error(isRecord(result) && typeof result.error === "string" ? result.error : "Could not load specification content.");
        }
        setSpecContent(await response.text());
      } catch (error) {
        if (!controller.signal.aborted) setSpecContentError(error instanceof Error ? error.message : "Could not load specification content.");
      } finally {
        if (!controller.signal.aborted) setIsLoadingSpecContent(false);
      }
    };
    void loadContent();
    return () => controller.abort();
  }, [projectId, selectedSpec]);

  useEffect(() => {
    if (!textareaRef.current) {
      return;
    }

    textareaRef.current.style.height = "auto";
    textareaRef.current.style.height = `${Math.min(
      Math.max(textareaRef.current.scrollHeight, 72),
      160,
    )}px`;
  }, [draft]);

  useEffect(() => {
    chatAreaRef.current?.scrollTo({
      top: chatAreaRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages]);

  useEffect(() => {
    if (realtimeError && runId && completedRunRef.current !== runId) {
      completedRunRef.current = runId;
      if (runType === "spec") {
        setSpecNotice("Could not track spec generation. Please try again.");
        setIsGeneratingSpec(false);
        setRunId(undefined);
        setPublicToken(undefined);
        return;
      }
      void createFeedMessage(AI_CHAT_FEED_ID, {
        sender: "Ghost AI",
        role: "assistant",
        content: "Ghost AI could not track this design run. Please try again.",
        timestamp: Date.now(),
      }).catch(() => undefined);
      setRunId(undefined);
      setPublicToken(undefined);
    }
  }, [createFeedMessage, realtimeError, runId, runType]);

  useEffect(() => {
    if (!run || !runId || isRunActive || completedRunRef.current === runId) return;
    completedRunRef.current = runId;
    if (runType === "spec") {
      const succeeded = run.status === "COMPLETED";
      setSpecNotice(succeeded ? "Specification generated." : `Spec generation ${run.status.toLowerCase().replaceAll("_", " ")}.`);
      setIsGeneratingSpec(false);
      if (succeeded) setSpecReloadKey((current) => current + 1);
      setRunId(undefined);
      setPublicToken(undefined);
      return;
    }
    const output = run.output;
    const taskFailed = Boolean(
      output && typeof output === "object" && "ok" in output && output.ok === false,
    );
    const outputError =
      output && typeof output === "object" && "error" in output && typeof output.error === "string"
        ? output.error
        : undefined;
    void createFeedMessage(AI_CHAT_FEED_ID, {
      sender: "Ghost AI",
      role: "assistant",
      content: run.status === "COMPLETED" && !taskFailed
        ? "Design complete. The shared canvas has been updated."
        : outputError ?? `Design run ${run.status.toLowerCase().replaceAll("_", " ")}. Please try again.`,
      timestamp: Date.now(),
    }).catch(() => undefined);
    setRunId(undefined);
    setPublicToken(undefined);
  }, [createFeedMessage, isRunActive, run, runId, runType]);

  const handleSubmit = async () => {
    const trimmed = draft.trim();

    if (!trimmed || isBusy) {
      return;
    }

    const sender = self?.info.name.trim();
    if (!sender) {
      setSendError("Your room profile is still loading. Please try again.");
      return;
    }

    const message: AiChatMessage = {
      sender,
      role: "user",
      content: trimmed,
      timestamp: Date.now(),
    };

    setIsStartingRun(true);
    setSendError(null);
    const messageId = crypto.randomUUID();
    let messagePersisted = false;
    setOptimisticMessages((current) => [...current, { ...message, id: messageId }]);

    try {
      await createFeedMessage(AI_CHAT_FEED_ID, message, { id: messageId });
      messagePersisted = true;
      setDraft("");
      const response = await fetch("/api/ai/design", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: trimmed, roomId, projectId }),
      });
      const result: unknown = await response.json();
      if (!response.ok || !result || typeof result !== "object" || !("runId" in result) || typeof result.runId !== "string") {
        throw new Error(result && typeof result === "object" && "error" in result && typeof result.error === "string"
          ? result.error
          : "Could not start the design run.");
      }

      const tokenResponse = await fetch("/api/ai/design/token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ runId: result.runId }),
      });
      const tokenResult: unknown = await tokenResponse.json();
      if (!tokenResponse.ok || !tokenResult || typeof tokenResult !== "object" || !("token" in tokenResult) || typeof tokenResult.token !== "string") {
        throw new Error("Could not connect to the design run.");
      }

      completedRunRef.current = null;
      setRunType("design");
      setRunId(result.runId);
      setPublicToken(tokenResult.token);
    } catch (error) {
      if (!messagePersisted) {
        setOptimisticMessages((current) => current.filter((item) => item.id !== messageId));
      }
      const errorMessage = error instanceof Error ? error.message : "Design request failed. Please try again.";
      await createFeedMessage(AI_CHAT_FEED_ID, {
        sender: "Ghost AI",
        role: "assistant",
        content: errorMessage,
        timestamp: Date.now(),
      }).catch(() => undefined);
      setSendError(errorMessage);
    } finally {
      setIsStartingRun(false);
    }
  };

  const handleGenerateSpec = async () => {
    if (isBusy) return;
    setIsGeneratingSpec(true);
    setSpecNotice(null);
    setSpecListError(null);

    try {
      const canvasResponse = await fetch(`/api/canvas/${projectId}`);
      const canvas: unknown = await canvasResponse.json();
      if (!canvasResponse.ok || !isRecord(canvas) || !Array.isArray(canvas.nodes) || !Array.isArray(canvas.edges)) {
        throw new Error("Could not load the current canvas for spec generation.");
      }

      const response = await fetch("/api/ai/spec", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          roomId,
          chatHistory: messages.map(({ role, content, timestamp }) => ({ role, content, timestamp })),
          nodes: canvas.nodes,
          edges: canvas.edges,
        }),
      });
      const result: unknown = await response.json();
      if (!response.ok || !isRecord(result) || typeof result.runId !== "string") {
        throw new Error(isRecord(result) && typeof result.error === "string" ? result.error : "Could not start spec generation.");
      }

      const tokenResponse = await fetch("/api/ai/spec/token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ runId: result.runId }),
      });
      const tokenResult: unknown = await tokenResponse.json();
      if (!tokenResponse.ok || !isRecord(tokenResult) || typeof tokenResult.token !== "string") {
        throw new Error("Could not connect to the spec generation run.");
      }

      completedRunRef.current = null;
      setRunType("spec");
      setRunId(result.runId);
      setPublicToken(tokenResult.token);
    } catch (error) {
      setIsGeneratingSpec(false);
      setSpecNotice(error instanceof Error ? error.message : "Spec generation failed. Please try again.");
    }
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      void handleSubmit();
    }
  };

  return (
    <aside
      aria-label="AI assistant sidebar"
      className={cn(
        "h-full shrink-0 overflow-hidden border-l border-surface-border bg-base/95 shadow-[-12px_0_24px_rgba(0,0,0,0.2)] transition-[width] duration-200 ease-out",
        isOpen ? "w-80" : "w-0 border-l-0",
      )}
      aria-hidden={!isOpen}
    >
      {isOpen ? (
        <div className="flex h-full w-80 flex-col">
          <div className="flex items-center justify-between gap-3 border-b border-surface-border px-4 py-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl border border-surface-border bg-subtle text-brand">
                <Bot className="h-4 w-4" />
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-copy-primary">
                  AI Workspace
                </p>
                <p className="truncate text-xs text-copy-muted">
                  Collaborate with Ghost AI
                </p>
              </div>
            </div>

            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              onClick={onClose}
              className="text-copy-primary hover:bg-subtle"
              aria-label="Close AI sidebar"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex min-h-0 flex-1 flex-col px-4 pb-4 pt-3">
            <Tabs
              value={activeTab}
              onValueChange={(value) => setActiveTab(value as AiTabValue)}
              className="flex h-full flex-col"
            >
              <TabsList className="grid w-full grid-cols-2 bg-subtle">
                <TabsTrigger
                  value="architect"
                  className="text-copy-muted data-active:bg-brand data-active:text-white"
                >
                  AI Architect
                </TabsTrigger>
                <TabsTrigger
                  value="specs"
                  className="text-copy-muted data-active:bg-brand data-active:text-white"
                >
                  Specs
                </TabsTrigger>
              </TabsList>

              <TabsContent
                value="architect"
                className="mt-3 flex min-h-0 flex-1 flex-col"
              >
                {messages.length === 0 ? (
                  <div className="flex flex-1 flex-col justify-center rounded-2xl border border-dashed border-surface-border bg-base px-4 py-5 text-center">
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl border border-surface-border bg-subtle text-brand">
                      <Sparkles className="h-5 w-5" />
                    </div>
                    <p className="mt-4 text-sm text-copy-primary">
                      Describe the system you want Ghost AI to design.
                    </p>
                    <p className="mt-2 text-xs leading-relaxed text-copy-muted">
                      Your prompt and the result are shared with everyone in this room.
                    </p>

                    <div className="mt-4 flex flex-wrap justify-center gap-2">
                      {starterPrompts.map((prompt) => (
                        <button
                          key={prompt}
                          type="button"
                          onClick={() => setDraft(prompt)}
                          className="rounded-full border border-surface-border bg-subtle px-3 py-1.5 text-xs text-ai-text transition-colors hover:border-brand/50 hover:text-brand"
                        >
                          {prompt}
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div ref={chatAreaRef} className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto pr-1">
                    {messages.map((message) => (
                      <div
                        key={message.id}
                        title={`${message.sender} · ${new Date(message.timestamp).toLocaleString()}`}
                        className={cn(
                          "max-w-[85%] rounded-2xl border px-3 py-2 text-sm leading-relaxed",
                          message.role === "user"
                            ? "ml-auto border-2 border-state-success/50 bg-state-success text-base"
                            : "mr-auto border-surface-border bg-elevated text-ai-text",
                        )}
                      >
                        <p className="mb-1 text-[10px] text-copy-muted">{message.sender} · {new Date(message.timestamp).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}</p>
                        <p className="whitespace-pre-wrap break-words">{message.content}</p>
                      </div>
                    ))}
                  </div>
                )}

                <div className="mt-3 rounded-2xl border border-surface-border bg-elevated p-2">
                  <div className="relative">
                    <Textarea
                      ref={textareaRef}
                      value={draft}
                      onChange={(event) => setDraft(event.target.value)}
                      onKeyDown={handleKeyDown}
                      disabled={isBusy}
                      placeholder="Describe your architecture..."
                      className="min-h-[104px] max-h-[192px] resize-none overflow-y-auto border-0 bg-transparent px-0 py-0 pr-12 pb-12 text-sm text-copy-primary placeholder:text-copy-muted focus-visible:ring-0"
                    />

                    <Button
                      type="button"
                      size="icon"
                      onClick={() => void handleSubmit()}
                      className="absolute bottom-2 right-2 rounded-xl bg-state-success text-base hover:bg-state-success/90 disabled:opacity-40"
                      disabled={!draft.trim() || isBusy}
                      aria-label={isBusy ? "Ghost AI is working" : "Send design prompt"}
                    >
                      {isBusy ? (
                        <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" />
                      ) : (
                        <ArrowUp className="h-4 w-4" aria-hidden="true" />
                      )}
                    </Button>
                  </div>
                  {isRunActive ? (
                    <div className="mt-2 flex items-center gap-2 rounded-xl border border-state-success/30 bg-base px-3 py-2 text-xs text-state-success" role="status" aria-live="polite">
                      <LoaderCircle className="h-3.5 w-3.5 shrink-0 animate-spin" aria-hidden="true" />
                      <span className="min-w-0 truncate">{latestStatus?.text ?? "Ghost AI is designing your system..."}</span>
                    </div>
                  ) : null}
                  {sendError ? <p role="alert" className="mt-2 px-1 text-xs text-state-error">{sendError}</p> : null}
                </div>
              </TabsContent>

              <TabsContent
                value="specs"
                className="mt-3 flex min-h-0 flex-1 flex-col"
              >
                <div className="flex justify-end">
                  <Button
                    type="button"
                    onClick={() => void handleGenerateSpec()}
                    disabled={isBusy}
                    className="bg-brand text-white hover:bg-brand/90"
                  >
                    {isGeneratingSpec || (isRunActive && runType === "spec") ? <LoaderCircle className="animate-spin" /> : null}
                    {isGeneratingSpec || (isRunActive && runType === "spec") ? "Generating..." : "Generate Spec"}
                  </Button>
                </div>
                {specNotice ? <p className="mt-2 text-xs text-copy-muted" role="status" aria-live="polite">{specNotice}</p> : null}
                {specListError ? <p className="mt-2 text-xs text-state-error" role="alert">{specListError}</p> : null}
                <ScrollArea className="mt-3 min-h-0 flex-1">
                  <div className="space-y-2 pr-2">
                    {specs.map((spec) => (
                      <div key={spec.id} className="flex items-center gap-1 rounded-2xl border border-surface-border bg-elevated p-2">
                        <button type="button" onClick={() => setSelectedSpec(spec)} className="flex min-w-0 flex-1 items-start gap-2 rounded-xl p-1 text-left hover:bg-subtle focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand">
                          <FileText className="mt-0.5 h-4 w-4 shrink-0 text-brand" />
                          <span className="min-w-0 flex-1">
                            <span className="block truncate text-sm font-medium text-copy-primary">{spec.filename}</span>
                            <span className="mt-1 block text-xs text-copy-muted">{new Date(spec.createdAt).toLocaleString()}</span>
                          </span>
                        </button>
                        <Button type="button" variant="ghost" size="icon-sm" className="text-copy-muted hover:text-brand" aria-label={`Download ${spec.filename}`} onClick={() => window.location.assign(`/api/projects/${projectId}/specs/${spec.id}/download`)}>
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                    {!specs.length && !specListError ? <p className="rounded-2xl border border-dashed border-surface-border px-3 py-5 text-center text-xs text-copy-muted">No specifications yet. Generate one from the current canvas.</p> : null}
                  </div>
                </ScrollArea>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      ) : null}
      <Dialog open={selectedSpec !== null} onOpenChange={(open) => { if (!open) setSelectedSpec(null); }}>
        <DialogContent showCloseButton={false} className="flex h-[90dvh] max-h-[90dvh] min-h-0 flex-col overflow-hidden rounded-3xl border border-surface-border bg-surface text-copy-primary sm:max-w-3xl">
          <DialogHeader className="shrink-0">
            <DialogTitle className="truncate pr-8 text-lg">{selectedSpec?.filename ?? "Specification"}</DialogTitle>
            <DialogDescription className="text-copy-muted">
              {selectedSpec ? new Date(selectedSpec.createdAt).toLocaleString() : ""}
            </DialogDescription>
          </DialogHeader>
          <div role="region" aria-label="Specification preview" className="min-h-0 flex-1 overflow-y-auto overscroll-contain rounded-2xl border border-surface-border bg-elevated p-4">
            {isLoadingSpecContent ? <p className="text-sm text-copy-muted" role="status">Loading specification…</p> : null}
            {specContentError ? <p className="text-sm text-state-error" role="alert">{specContentError}</p> : null}
            {specContent !== null && !isLoadingSpecContent ? <SpecMarkdown content={specContent} /> : null}
          </div>
          <div className="flex shrink-0 justify-end gap-2 pt-2">
            {selectedSpec ? <Button nativeButton={false} variant="outline" render={<a href={`/api/projects/${projectId}/specs/${selectedSpec.id}/download`} download={selectedSpec.filename} />}><Download />Download</Button> : null}
            <DialogClose render={<Button type="button" variant="ghost" />}>Close</DialogClose>
          </div>
        </DialogContent>
      </Dialog>
    </aside>
  );
}
