"use client";

import { useState, type FormEvent } from "react";
import { ArrowRightIcon, SparkleIcon } from "../icons";
import { useScout } from "./ScoutProvider";

const SUGGESTIONS = [
  "Which regions grew current account balances fastest?",
  "Top card spend categories this quarter",
  "Savings attrition by customer age",
] as const;

export default function ScoutBar() {
  const { ask, openChat } = useScout();
  const [question, setQuestion] = useState("");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!question.trim()) {
      openChat();
      return;
    }
    void ask(question);
    setQuestion("");
  }

  return (
    <section data-scout-trigger className="mx-auto max-w-7xl px-4 pb-6 sm:px-6">
      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-3 rounded-xl border border-brand-200 bg-brand-50/60 p-3 sm:flex-row sm:items-center"
      >
        <label
          htmlFor="scout-bar-input"
          className="flex shrink-0 items-center gap-2 pl-1 text-sm font-bold text-brand-900"
        >
          <span className="rounded-md bg-brand-700 p-1.5 text-white">
            <SparkleIcon className="size-4" />
          </span>
          Ask Scout
        </label>
        <div className="flex min-w-0 flex-1 items-center gap-2 rounded-lg border border-line bg-white py-1 pr-1 pl-4 transition-colors focus-within:border-brand-600 focus-within:ring-3 focus-within:ring-brand-500/20">
          <input
            id="scout-bar-input"
            type="text"
            value={question}
            onChange={(event) => setQuestion(event.target.value)}
            placeholder="Ask anything about deposits, cards, lending, or customers…"
            autoComplete="off"
            className="min-w-0 flex-1 bg-transparent py-1.5 text-sm outline-none placeholder:text-muted"
          />
          <button
            type="submit"
            className="inline-flex items-center gap-1.5 rounded-md bg-brand-700 px-4 py-2 text-sm font-bold text-white transition-colors hover:bg-brand-800"
          >
            Ask
            <ArrowRightIcon className="size-4" />
          </button>
        </div>
      </form>
      <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
        <span className="font-semibold text-muted">Try:</span>
        {SUGGESTIONS.map((suggestion) => (
          <button
            key={suggestion}
            type="button"
            onClick={() => void ask(suggestion)}
            className="rounded-full border border-line bg-white px-3 py-1 font-medium text-ink transition-colors hover:border-brand-300 hover:bg-brand-50 hover:text-brand-900"
          >
            {suggestion}
          </button>
        ))}
      </div>
    </section>
  );
}
