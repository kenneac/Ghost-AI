import type { ReactNode } from "react";

function inlineMarkdown(text: string): ReactNode[] {
  const pattern = /(\[[^\]]+\]\([^)]+\)|`[^`]+`|\*\*[^*]+\*\*|\*[^*]+\*)/g;
  return text.split(pattern).filter(Boolean).map((part, index) => {
    const link = /^\[([^\]]+)\]\(([^)]+)\)$/.exec(part);
    if (link) {
      let href: string | undefined;
      try {
        const parsed = new URL(link[2], "https://ghost-ai.invalid");
        if (["https:", "http:"].includes(parsed.protocol)) href = link[2];
      } catch {
        href = undefined;
      }
      return href
        ? <a key={index} href={href} target="_blank" rel="noreferrer" className="text-brand underline underline-offset-2">{link[1]}</a>
        : <span key={index}>{link[1]}</span>;
    }
    if (part.startsWith("**") && part.endsWith("**")) return <strong key={index}>{part.slice(2, -2)}</strong>;
    if (part.startsWith("*") && part.endsWith("*")) return <em key={index}>{part.slice(1, -1)}</em>;
    if (part.startsWith("`") && part.endsWith("`")) return <code key={index} className="rounded bg-subtle px-1 py-0.5 font-mono text-xs">{part.slice(1, -1)}</code>;
    return <span key={index}>{part}</span>;
  });
}

export function SpecMarkdown({ content }: { content: string }) {
  const lines = content.split(/\r?\n/);
  const blocks: ReactNode[] = [];
  let paragraph: string[] = [];
  let list: string[] = [];
  let orderedList = false;
  let code: string[] | null = null;

  const flushParagraph = () => {
    if (!paragraph.length) return;
    blocks.push(<p key={`p-${blocks.length}`} className="leading-6 text-copy-secondary">{inlineMarkdown(paragraph.join(" "))}</p>);
    paragraph = [];
  };
  const flushList = () => {
    if (!list.length) return;
    const List = orderedList ? "ol" : "ul";
    blocks.push(<List key={`list-${blocks.length}`} className={orderedList ? "list-decimal space-y-1 pl-5" : "list-disc space-y-1 pl-5"}>{list.map((item, index) => <li key={index}>{inlineMarkdown(item)}</li>)}</List>);
    list = [];
  };

  for (const line of lines) {
    if (line.trimStart().startsWith("```")) {
      flushParagraph();
      flushList();
      if (code) {
        blocks.push(<pre key={`code-${blocks.length}`} className="overflow-x-auto rounded-xl border border-surface-border bg-base p-3 font-mono text-xs leading-5 text-copy-secondary"><code>{code.join("\n")}</code></pre>);
        code = null;
      } else code = [];
      continue;
    }
    if (code) {
      code.push(line);
      continue;
    }
    const heading = /^(#{1,6})\s+(.+)$/.exec(line);
    const item = /^\s*(?:[-*+]\s+|(\d+)\.\s+)(.+)$/.exec(line);
    if (heading) {
      flushParagraph();
      flushList();
      const level = heading[1].length;
      const className = level <= 2 ? "text-lg font-semibold text-copy-primary" : "text-base font-semibold text-copy-primary";
      blocks.push(<h3 key={`h-${blocks.length}`} className={className}>{inlineMarkdown(heading[2])}</h3>);
    } else if (item) {
      flushParagraph();
      const nextOrdered = Boolean(item[1]);
      if (list.length && orderedList !== nextOrdered) flushList();
      orderedList = nextOrdered;
      list.push(item[2]);
    } else if (line.startsWith("> ")) {
      flushParagraph();
      flushList();
      blocks.push(<blockquote key={`q-${blocks.length}`} className="border-l-2 border-brand pl-3 text-copy-muted">{inlineMarkdown(line.slice(2))}</blockquote>);
    } else if (!line.trim()) {
      flushParagraph();
      flushList();
    } else {
      paragraph.push(line.trim());
    }
  }
  if (code) blocks.push(<pre key={`code-${blocks.length}`} className="overflow-x-auto rounded-xl border border-surface-border bg-base p-3 font-mono text-xs leading-5 text-copy-secondary"><code>{code.join("\n")}</code></pre>);
  flushParagraph();
  flushList();

  return <div className="space-y-4 break-words text-sm">{blocks}</div>;
}
