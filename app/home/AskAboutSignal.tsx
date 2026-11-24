"use client";

import { SparkleIcon } from "../components/icons";
import { useScout } from "../components/scout/ScoutProvider";

/** Hands a signal's follow-up question to Scout, which opens with the answer. */
export default function AskAboutSignal({ question }: { question: string }) {
  const { ask } = useScout();
  return (
    <button
      type="button"
      onClick={() => void ask(question)}
      title={question}
      className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-brand-50 px-2.5 py-1 text-xs font-bold text-brand-800 ring-1 ring-brand-100 transition-colors hover:bg-brand-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600"
    >
      <SparkleIcon className="size-3.5" />
      Ask Scout why
    </button>
  );
}
