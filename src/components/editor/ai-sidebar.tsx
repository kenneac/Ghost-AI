"use client";

import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import { ArrowUp, Bot, Download, FileText, Sparkles, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

type AiTabValue = "architect" | "specs";
type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
};

const starterPrompts = [
  "Design an e-commerce backend",
  "Create a chat app architecture",
  "Build a CI/CD pipeline",
];

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
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const chatAreaRef = useRef<HTMLDivElement | null>(null);

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

  const handleSubmit = async () => {
    const trimmed = draft.trim();

    if (!trimmed || isSubmitting) {
      return;
    }

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      content: trimmed,
    };

    setMessages((current) => [...current, userMessage]);
    setDraft("");
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/ai/design", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: trimmed, projectId, roomId }),
      });
      const payload: unknown = await response.json();
      const message =
        payload && typeof payload === "object" && "error" in payload &&
        typeof payload.error === "string"
          ? payload.error
          : response.ok
            ? "Design task started. Ghost AI will update the shared canvas shortly."
            : "Could not start the design task. Please try again.";
      setMessages((current) => [
        ...current,
        { id: `assistant-${Date.now()}`, role: "assistant", content: message },
      ]);
    } catch {
      setMessages((current) => [
        ...current,
        {
          id: `assistant-${Date.now()}`,
          role: "assistant",
          content: "Could not reach Ghost AI. Please try again.",
        },
      ]);
    } finally {
      setIsSubmitting(false);
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
                      Describe the system you want to design.
                    </p>
                    <p className="mt-2 text-xs leading-relaxed text-copy-muted">
                      Outline the core flows, data, services, or infrastructure
                      to generate a canvas draft.
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
                        className={cn(
                          "max-w-[85%] rounded-2xl border px-3 py-2 text-sm leading-relaxed",
                          message.role === "user"
                            ? "ml-auto border-2 border-brand/50 bg-brand-dim text-copy-primary"
                            : "mr-auto border-surface-border bg-elevated text-ai-text",
                        )}
                      >
                        {message.content}
                      </div>
                    ))}
                  </div>
                )}

                <div className="mt-3 rounded-2xl border border-surface-border bg-elevated p-2">
                  <div className="flex items-end gap-2">
                    <Textarea
                      ref={textareaRef}
                      value={draft}
                      onChange={(event) => setDraft(event.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder="Describe your architecture..."
                      className="min-h-[72px] max-h-[160px] resize-none border-0 bg-transparent px-0 py-0 text-sm text-copy-primary placeholder:text-copy-muted focus-visible:ring-0"
                    />

                    <Button
                      type="button"
                      size="icon"
                      onClick={() => void handleSubmit()}
                      className="shrink-0 rounded-xl bg-brand text-white hover:bg-brand/90"
                      disabled={!draft.trim() || isSubmitting}
                    >
                      <ArrowUp className="h-4 w-4" />
                    </Button>
                  </div>
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
