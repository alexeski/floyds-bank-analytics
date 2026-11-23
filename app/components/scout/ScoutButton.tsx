"use client";

import { SparkleIcon } from "../icons";
import { useScout } from "./ScoutProvider";

export default function ScoutButton() {
  const { isOpen, openChat, closeChat } = useScout();

  return (
    <button
      type="button"
      data-scout-trigger
      onClick={isOpen ? closeChat : openChat}
      aria-label={isOpen ? "Close Scout chat" : "Open Scout chat"}
      aria-expanded={isOpen}
      className={`inline-flex shrink-0 items-center gap-2 rounded-md px-3 py-2 text-sm font-bold transition-colors ${
        isOpen
          ? "bg-brand-900 text-white"
          : "bg-brand-700 text-white hover:bg-brand-800"
      }`}
    >
      <SparkleIcon className="size-4" />
      <span className="hidden sm:inline">Ask Scout</span>
    </button>
  );
}
