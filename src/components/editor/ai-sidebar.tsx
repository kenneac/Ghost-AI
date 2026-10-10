"use client";

import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import { useCreateFeedMessage, useFeedMessages, useSelf } from "@liveblocks/react";
import { useRealtimeRun } from "@trigger.dev/react-hooks";
import { ArrowUp, Bot, Download, FileText, LoaderCircle, Sparkles, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
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
  const [isStartingRun, setIsStartingRun] = useState(false);
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
  const isBusy = isStartingRun || isRunActive;
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
      void createFeedMessage(AI_CHAT_FEED_ID, {
        sender: "Ghost AI",
        role: "assistant",
        content: "Ghost AI could not track this design run. Please try again.",
        timestamp: Date.now(),
      }).catch(() => undefined);
      setRunId(undefined);
      setPublicToken(undefined);
    }
  }, [createFeedMessage, realtimeError, runId]);

  useEffect(() => {
    if (!run || !runId || isRunActive || completedRunRef.current === runId) return;
    completedRunRef.current = runId;
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
  }, [createFeedMessage, isRunActive, run, runId]);

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
                    className="bg-brand text-white hover:bg-brand/90"
                  >
                    Generate Spec
                  </Button>
                </div>

                <div className="mt-4 rounded-2xl border border-surface-border bg-elevated p-3 shadow-sm">
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 flex h-8 w-8 items-center justify-center rounded-xl border border-surface-border bg-subtle text-brand">
                      <FileText className="h-4 w-4" />
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-copy-primary">
                        Product Architecture Spec
                      </p>
                      <p className="mt-1 line-clamp-3 text-xs leading-relaxed text-copy-muted">
                        Service boundaries, deployment model, data flow,
                        resilience requirements, and key integration contracts
                        for the current canvas.
                      </p>
                    </div>

                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      disabled
                      className="text-copy-muted"
                      aria-label="Download specification"
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      ) : null}
    </aside>
  );
}
