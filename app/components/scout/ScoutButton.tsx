"use client";

import { usePathname } from "next/navigation";
import { useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { SparkleIcon } from "../icons";
import { useScout } from "./ScoutProvider";

const subscribe = () => () => {};

/**
 * The floating "Ask Scout" launcher at the bottom right of every portal page.
 * It hides while the chat drawer is open, and shows when Scout is still
 * answering a question asked before the drawer was closed.
 */
export default function ScoutButton() {
  const { isOpen, isThinking, openChat } = useScout();
  const pathname = usePathname();
  // Portals need document.body, which only exists in the browser.
  const inBrowser = useSyncExternalStore(subscribe, () => true, () => false);

  // The Bankalytics AI page is the assistant itself, with its own input box
  // along the bottom of the screen, so the launcher would only get in the way.
  if (!inBrowser || /^\/ai\/?$/.test(pathname)) return null;

  return createPortal(
    <button
      type="button"
      data-scout-trigger
      onClick={openChat}
      aria-label="Open Scout chat"
      aria-expanded={isOpen}
      tabIndex={isOpen ? -1 : undefined}
      className={`group fixed right-5 bottom-5 z-40 flex items-center gap-2.5 rounded-full bg-brand-900 py-2 pr-2 pl-2 text-white shadow-xl shadow-brand-950/30 ring-1 ring-white/10 transition-all duration-300 hover:bg-brand-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600 sm:right-6 sm:bottom-6 sm:pr-5 ${
        isOpen ? "pointer-events-none translate-y-3 opacity-0" : "translate-y-0 opacity-100"
      }`}
    >
      <span className="relative grid size-10 place-items-center rounded-full bg-brand-500 text-brand-950 transition-transform group-hover:scale-105">
        <SparkleIcon className="size-5" />
        {isThinking && (
          <span
            aria-hidden="true"
            className="absolute inset-0 animate-ping rounded-full bg-brand-400/50"
          />
        )}
      </span>
      <span className="hidden text-left leading-tight sm:block">
        <span className="block text-sm font-bold">
          {isThinking ? "Scout is answering…" : "Ask Scout"}
        </span>
        <span className="block text-xs text-brand-200">
          {isThinking ? "Open to follow along" : "Your banking data assistant"}
        </span>
      </span>
    </button>,
    document.body,
  );
}
