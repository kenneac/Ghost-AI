import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { ArrowRight, Sparkles, Wand2 } from "lucide-react";

export default function Home() {
  return (
    <main className={cn("min-h-screen bg-base px-6 py-10 text-copy-primary")}>
      <div className="mx-auto flex max-w-6xl flex-col gap-6">
        <header className="flex items-center justify-between rounded-3xl border border-surface-border bg-surface px-5 py-4 shadow-[0_0_0_1px_rgba(255,255,255,0.02)]">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-brand-dim text-brand">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm uppercase tracking-[0.18em] text-copy-muted">
                Ghost AI
              </p>
              <h1 className="text-lg font-medium text-copy-primary">
                Design system
              </h1>
            </div>
          </div>

          <Button
            variant="outline"
            className="gap-2 border-surface-border bg-transparent"
          >
            <Wand2 className="h-4 w-4" />
            New prompt
          </Button>
        </header>

        <div className="grid gap-6 xl:grid-cols-[1.3fr_0.7fr]">
          <Card className="border-surface-border bg-surface">
            <CardHeader>
              <CardTitle>System prompt</CardTitle>
              <CardDescription>
                Define the architecture you want the AI agent to generate.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-copy-secondary">
                  Project name
                </label>
                <Input
                  placeholder="Payments platform"
                  className="border-surface-border bg-subtle text-copy-primary placeholder:text-copy-muted"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-copy-secondary">
                  Prompt
                </label>
                <Textarea
                  placeholder="Build a multi-region payments system with fraud detection and a webhook event bus."
                  className="min-h-28 border-surface-border bg-subtle text-copy-primary placeholder:text-copy-muted"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <Button className="gap-2 bg-brand text-primary-foreground hover:bg-brand/90">
                  Generate architecture
                  <ArrowRight className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  className="border-surface-border bg-transparent text-copy-primary"
                >
                  Draft later
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="border-surface-border bg-surface">
            <CardHeader>
              <CardTitle>Workspace tabs</CardTitle>
              <CardDescription>Core design system primitives.</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="canvas" className="w-full">
                <TabsList className="grid w-full grid-cols-3 bg-subtle">
                  <TabsTrigger value="canvas">Canvas</TabsTrigger>
                  <TabsTrigger value="spec">Spec</TabsTrigger>
                  <TabsTrigger value="agents">Agents</TabsTrigger>
                </TabsList>
                <TabsContent
                  value="canvas"
                  className="mt-4 rounded-2xl border border-surface-border bg-subtle p-4 text-copy-secondary"
                >
                  Shared editor, collaborative review, and live diagram updates.
                </TabsContent>
                <TabsContent
                  value="spec"
                  className="mt-4 rounded-2xl border border-surface-border bg-subtle p-4 text-copy-secondary"
                >
                  Generate technical documentation from the active node graph.
                </TabsContent>
                <TabsContent
                  value="agents"
                  className="mt-4 rounded-2xl border border-surface-border bg-subtle p-4 text-copy-secondary"
                >
                  AI-driven system generation and prompt-driven refinement
                  flows.
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>

        <Card className="border-surface-border bg-surface">
          <CardHeader>
            <div className="flex items-center justify-between gap-4">
              <div>
                <CardTitle>Generated system map</CardTitle>
                <CardDescription>Preview list and editor feed.</CardDescription>
              </div>
              <Dialog>
                <DialogTrigger asChild>
                  <Button
                    variant="outline"
                    className="border-surface-border bg-transparent text-copy-primary"
                  >
                    Open preview
                  </Button>
                </DialogTrigger>
                <DialogContent className="border border-surface-border bg-surface text-copy-primary sm:max-w-lg">
                  <DialogHeader>
                    <DialogTitle>Architecture preview</DialogTitle>
                    <DialogDescription>
                      This modal confirms the design system primitives are
                      rendering in the dark app theme.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="rounded-2xl border border-surface-border bg-subtle p-4 text-copy-secondary">
                    Monolith boundary, event bus, payment service, fraud
                    detector, and analytics worker.
                  </div>
                  <DialogFooter>
                    <Button
                      variant="outline"
                      className="border-surface-border bg-transparent text-copy-primary"
                    >
                      Cancel
                    </Button>
                    <Button className="bg-brand text-primary-foreground hover:bg-brand/90">
                      Continue
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-52 rounded-2xl border border-surface-border bg-subtle p-3">
              <div className="space-y-2">
                {[
                  "User gateway",
                  "Auth service",
                  "Payments API",
                  "Fraud detector",
                  "Event bus",
                  "Report aggregator",
                ].map((item) => (
                  <div
                    key={item}
                    className="flex items-center justify-between rounded-xl border border-surface-border bg-bg-surface px-3 py-2 text-sm text-copy-secondary"
                  >
                    <span>{item}</span>
                    <span className="rounded-full bg-brand-dim px-2 py-0.5 text-xs text-brand">
                      Ready
                    </span>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
