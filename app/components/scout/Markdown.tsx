"use client";

import ReactMarkdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";

/**
 * Renders Scout's Markdown replies. Raw HTML is never rendered (react-markdown
 * escapes it unless a raw-HTML plugin is added, and none is), images are
 * dropped, and links render as plain text because Scout users have no direct
 * access to ThoughtSpot.
 */
const COMPONENTS: Components = {
  a: ({ children }) => <span className="font-semibold">{children}</span>,
  h1: ({ children }) => <h3 className="mt-3 mb-1 text-base font-bold first:mt-0">{children}</h3>,
  h2: ({ children }) => <h3 className="mt-3 mb-1 text-[15px] font-bold first:mt-0">{children}</h3>,
  h3: ({ children }) => <h4 className="mt-3 mb-1 font-bold first:mt-0">{children}</h4>,
  h4: ({ children }) => <h4 className="mt-2 mb-1 font-semibold first:mt-0">{children}</h4>,
  p: ({ children }) => <p className="my-2 first:mt-0 last:mb-0">{children}</p>,
  ul: ({ children }) => <ul className="my-2 list-disc space-y-1 pl-5">{children}</ul>,
  ol: ({ children }) => <ol className="my-2 list-decimal space-y-1 pl-5">{children}</ol>,
  strong: ({ children }) => <strong className="font-bold">{children}</strong>,
  blockquote: ({ children }) => (
    <blockquote className="my-2 border-l-4 border-brand-200 pl-3 text-muted">{children}</blockquote>
  ),
  code: ({ children }) => (
    <code className="rounded bg-surface px-1 py-0.5 font-mono text-[12px]">{children}</code>
  ),
  pre: ({ children }) => (
    <pre className="my-2 overflow-x-auto rounded-lg bg-surface p-3 text-[12px]">{children}</pre>
  ),
  table: ({ children }) => (
    <div className="my-2 overflow-x-auto rounded-lg border border-line">
      <table className="w-full border-collapse text-left text-[13px]">{children}</table>
    </div>
  ),
  thead: ({ children }) => <thead className="bg-surface">{children}</thead>,
  th: ({ children }) => (
    <th className="border-b border-line px-2.5 py-1.5 font-semibold whitespace-nowrap">{children}</th>
  ),
  td: ({ children }) => (
    <td className="border-b border-line px-2.5 py-1.5 tabular-nums last:border-b-0">{children}</td>
  ),
  hr: () => <hr className="my-3 border-line" />,
};

export default function Markdown({ children }: { children: string }) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={COMPONENTS}
      disallowedElements={["img"]}
      skipHtml
    >
      {children}
    </ReactMarkdown>
  );
}
