"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { CloseIcon, SendIcon, SparkleIcon } from "../icons";
import { useScout, type ScoutStatus } from "./ScoutProvider";
import Markdown from "./Markdown";

const STARTERS = [
  "How did customer deposits change this quarter?",
  "Which card categories grew fastest?",
  "Show small business clients by region",
] as const;

/** Elements marked with this attribute open or toggle the chat themselves. */
const TRIGGER_SELECTOR = "[data-scout-trigger]";

export default function ScoutChat() {
  const { isOpen, isThinking, status, messages, closeChat, ask } = useScout();
  const [draft, setDraft] = useState("");
  const dialogRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    inputRef.current?.focus();

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") closeChat();
    }
    function onPointerDown(event: PointerEvent) {
      const target = event.target as Element | null;
      if (!target || dialogRef.current?.contains(target)) return;
      if (target.closest(TRIGGER_SELECTOR)) return;
      closeChat();
    }
    window.addEventListener("keydown", onKeyDown);
    document.addEventListener("pointerdown", onPointerDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("pointerdown", onPointerDown);
    };
  }, [isOpen, closeChat]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: "end" });
  }, [messages, status]);

  if (!isOpen) return null;

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const question = draft;
    setDraft("");
    void ask(question);
  }

  return (
    <div
      ref={dialogRef}
      role="dialog"
      aria-modal="false"
      aria-labelledby="scout-chat-title"
      className="fixed inset-x-4 bottom-4 z-40 flex max-h-[min(680px,calc(100vh-7rem))] flex-col overflow-hidden rounded-2xl border border-line bg-white shadow-2xl shadow-brand-950/25 sm:inset-x-auto sm:right-6 sm:bottom-6 sm:w-[440px]"
    >
      <div className="relative flex items-center gap-3 overflow-hidden bg-brand-900 px-4 py-3.5 text-white">
        <span
          aria-hidden="true"
          className="pointer-events-none absolute -top-16 -right-10 size-40 rounded-full bg-brand-500/30 blur-2xl"
        />
        <span className="relative rounded-lg bg-brand-500 p-1.5 text-brand-950">
          <SparkleIcon className="size-5" />
        </span>
        <div className="relative min-w-0 flex-1">
          <h2 id="scout-chat-title" className="text-sm font-bold">
            Scout
          </h2>
          <p className="flex items-center gap-1.5 text-xs text-brand-200">
            <span className="size-1.5 rounded-full bg-brand-400" />
            Your banking data assistant
          </p>
        </div>
        <button
          type="button"
          onClick={closeChat}
          aria-label="Close Scout chat"
          className="relative rounded-md p-1.5 text-brand-200 transition-colors hover:bg-white/10 hover:text-white"
        >
          <CloseIcon className="size-5" />
        </button>
      </div>

      <div className="min-h-56 flex-1 space-y-3 overflow-y-auto bg-surface px-4 py-4">
        {messages.length === 0 && (
          <div className="py-4">
            <p className="text-sm font-semibold text-ink">
              Hello, I&rsquo;m Scout.
            </p>
            <p className="mt-1 text-sm text-muted">
              Ask me about deposits, cards, lending, customers, and more. Here
              are a few ideas:
            </p>
            <ul className="mt-4 space-y-2">
              {STARTERS.map((starter) => (
                <li key={starter}>
                  <button
                    type="button"
                    onClick={() => void ask(starter)}
                    className="w-full rounded-lg border border-line bg-white px-3 py-2 text-left text-sm text-ink transition-colors hover:border-brand-300 hover:bg-brand-50"
                  >
                    {starter}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
        {messages.map(({ id, role, content, error }) => {
          if (role === "assistant" && !content) return null;
          return (
            <div
              key={id}
              className={`flex ${role === "user" ? "justify-end" : "justify-start"}`}
            >
              {role === "user" ? (
                <p className="max-w-[85%] rounded-2xl rounded-br-sm bg-brand-700 px-3.5 py-2 text-sm whitespace-pre-wrap text-white">
                  {content}
                </p>
              ) : (
                <div
                  className={`max-w-[92%] min-w-0 rounded-2xl rounded-bl-sm border px-3.5 py-2.5 text-sm ${
                    error
                      ? "border-red-200 bg-red-50 text-red-900"
                      : "border-line bg-white text-ink"
                  }`}
                >
                  <Markdown>{content}</Markdown>
                </div>
              )}
            </div>
          );
        })}
        {status && <StatusLine status={status} />}
        <div ref={endRef} />
      </div>

      <form
        onSubmit={handleSubmit}
        className="flex items-center gap-2 border-t border-line bg-white p-3"
      >
        <label htmlFor="scout-chat-input" className="sr-only">
          Ask Scout a question
        </label>
        <input
          ref={inputRef}
          id="scout-chat-input"
          type="text"
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          placeholder="Ask a question…"
          autoComplete="off"
          className="min-w-0 flex-1 rounded-lg border border-line bg-surface px-3.5 py-2.5 text-sm outline-none placeholder:text-muted focus:border-brand-600 focus:bg-white"
        />
        <button
          type="submit"
          disabled={!draft.trim() || isThinking}
          aria-label="Send question"
          className="rounded-lg bg-brand-700 p-3 text-white transition-colors hover:bg-brand-800 disabled:opacity-40"
        >
          <SendIcon className="size-4" />
        </button>
      </form>
    </div>
  );
}

/** What Scout is doing now, with the time since the question was sent. */
function StatusLine({ status }: { status: ScoutStatus }) {
  const [now, setNow] = useState<number | null>(null);

  useEffect(() => {
    const timer = window.setInterval(() => setNow(performance.now()), 250);
    return () => window.clearInterval(timer);
  }, []);

  const seconds = now === null ? 0 : Math.max(0, (now - status.startedAt) / 1000);

  return (
    <p
      className="flex items-center gap-2 text-xs text-muted"
      role="status"
      aria-live="polite"
    >
      <span className="flex gap-1" aria-hidden="true">
        <span className="size-1.5 animate-pulse rounded-full bg-brand-600" />
        <span className="size-1.5 animate-pulse rounded-full bg-brand-600 [animation-delay:150ms]" />
        <span className="size-1.5 animate-pulse rounded-full bg-brand-600 [animation-delay:300ms]" />
      </span>
      <span className="min-w-0 truncate">{status.label}…</span>
      <span className="ml-auto shrink-0 tabular-nums">{seconds.toFixed(0)}s</span>
    </p>
  );
}
