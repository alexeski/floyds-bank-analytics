"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { CloseIcon, CollapseIcon, ExpandIcon, NewChatIcon, SendIcon, SparkleIcon } from "../icons";
import { useScout } from "./ScoutProvider";

const STARTERS = [
  "How did customer deposits change this quarter?",
  "Which card categories grew fastest?",
  "Show small business clients by region",
] as const;

/**
 * Scout's chat, as a drawer on the right of the screen. It stays mounted when
 * closed, so the conversation (and any charts in it) don't reload, and it can
 * widen to give answers more room.
 */
export default function ScoutChat() {
  const { isOpen, isThinking, messages, closeChat, ask, newChat } = useScout();
  const [draft, setDraft] = useState("");
  const [wide, setWide] = useState(false);
  const panelRef = useRef<HTMLElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    inputRef.current?.focus();

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") closeChat();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isOpen, closeChat]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: "end" });
  }, [messages, isThinking]);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const question = draft;
    setDraft("");
    void ask(question);
  }

  const iconButton =
    "relative rounded-md p-1.5 text-brand-200 transition-colors hover:bg-white/10 hover:text-white disabled:pointer-events-none disabled:opacity-40";

  return (
    <aside
      ref={panelRef}
      role="dialog"
      aria-modal="false"
      aria-labelledby="scout-chat-title"
      aria-hidden={!isOpen}
      inert={!isOpen}
      className={`fixed inset-y-0 right-0 z-50 flex w-full flex-col border-l border-line bg-white shadow-2xl shadow-brand-950/20 transition-[translate,width,visibility] duration-300 ease-out ${
        wide ? "sm:w-[min(960px,72vw)]" : "sm:w-[520px]"
      } ${isOpen ? "visible translate-x-0" : "invisible translate-x-full"}`}
    >
      <div className="relative flex shrink-0 items-center gap-3 overflow-hidden bg-brand-900 px-4 py-3.5 text-white sm:px-5">
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
          onClick={newChat}
          disabled={isThinking || messages.length === 0}
          aria-label="Start a new chat"
          title="New chat"
          className={iconButton}
        >
          <NewChatIcon className="size-5" />
        </button>
        <button
          type="button"
          onClick={() => setWide((value) => !value)}
          aria-label={wide ? "Make the chat narrower" : "Make the chat wider"}
          aria-pressed={wide}
          title={wide ? "Narrower" : "Wider"}
          className={`${iconButton} hidden sm:block`}
        >
          {wide ? <CollapseIcon className="size-5" /> : <ExpandIcon className="size-5" />}
        </button>
        <button
          type="button"
          onClick={closeChat}
          aria-label="Close Scout chat"
          title="Close"
          className={iconButton}
        >
          <CloseIcon className="size-5" />
        </button>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto bg-surface">
        <div className="mx-auto max-w-3xl space-y-4 px-4 py-5 sm:px-5">
          {messages.length === 0 && (
            <div className="py-6">
              <p className="text-base font-bold text-ink">Hello, I&rsquo;m Scout.</p>
              <p className="mt-1 text-sm text-muted">
                Ask me about deposits, cards, lending, customers, and more. Here are a few
                ideas:
              </p>
              <ul className="mt-5 space-y-2">
                {STARTERS.map((starter) => (
                  <li key={starter}>
                    <button
                      type="button"
                      onClick={() => void ask(starter)}
                      className="flex w-full items-center gap-3 rounded-xl border border-line bg-white px-4 py-3 text-left text-sm font-medium text-ink transition-colors hover:border-brand-300 hover:bg-brand-50"
                    >
                      <SparkleIcon className="size-4 shrink-0 text-brand-600" />
                      {starter}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
          {messages.map(({ id, role, content }) => (
            <div
              key={id}
              className={`flex ${role === "user" ? "justify-end" : "justify-start"}`}
            >
              <p
                className={`max-w-[85%] rounded-2xl px-3.5 py-2 text-sm whitespace-pre-wrap ${
                  role === "user"
                    ? "rounded-br-sm bg-brand-700 text-white"
                    : "rounded-bl-sm border border-line bg-white text-ink"
                }`}
              >
                {content}
              </p>
            </div>
          ))}
          {isThinking && (
            <p className="flex items-center gap-2 text-xs text-muted" aria-live="polite">
              <span className="flex gap-1">
                <span className="size-1.5 animate-pulse rounded-full bg-brand-600" />
                <span className="size-1.5 animate-pulse rounded-full bg-brand-600 [animation-delay:150ms]" />
                <span className="size-1.5 animate-pulse rounded-full bg-brand-600 [animation-delay:300ms]" />
              </span>
              Scout is thinking…
            </p>
          )}
          <div ref={endRef} />
        </div>
      </div>

      <form onSubmit={handleSubmit} className="shrink-0 border-t border-line bg-white p-3 sm:p-4">
        <div className="mx-auto flex max-w-3xl items-center gap-2">
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
        </div>
      </form>
    </aside>
  );
}
