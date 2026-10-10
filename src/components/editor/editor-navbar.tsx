"use client";

import Link from "next/link";
import { UserButton } from "@clerk/nextjs";
import { PanelLeftClose, PanelLeftOpen } from "lucide-react";

import { Button } from "@/components/ui/button";
import type { ReactNode } from "react";

type EditorNavbarProps = {
  isSidebarOpen: boolean;
  onToggleSidebar: () => void;
  title?: string;
  actions?: ReactNode;
  showUserButton?: boolean;
};

export function EditorNavbar({
  isSidebarOpen,
  onToggleSidebar,
  title,
  actions,
  showUserButton = false,
}: EditorNavbarProps) {
  return (
    <header className="fixed inset-x-0 top-0 z-40 h-16 border-b border-surface-border bg-surface/95 backdrop-blur-sm">
      <div className="flex h-full items-center justify-between gap-4 px-4">
        <div className="flex min-w-0 flex-1 items-center gap-2">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={onToggleSidebar}
            className="shrink-0 text-copy-primary hover:bg-subtle"
            aria-label={isSidebarOpen ? "Close sidebar" : "Open sidebar"}
          >
            {isSidebarOpen ? <PanelLeftClose className="h-5 w-5" /> : <PanelLeftOpen className="h-5 w-5" />}
          </Button>
          {title ? (
            <>
              <Link href="/editor" className="hidden text-sm text-copy-muted hover:text-copy-primary sm:inline">Projects</Link>
              <span className="hidden text-copy-faint sm:inline">/</span>
              <h1 className="truncate text-sm font-medium text-copy-primary">{title}</h1>
            </>
          ) : null}
        </div>
        <div className="flex shrink-0 items-center justify-end gap-2">
          {actions}
          {showUserButton ? <UserButton /> : null}
        </div>
      </div>
    </header>
  );
}
