"use client";

import Link from "next/link";
import { useEffect, useId, useRef, useState } from "react";
import { DEMO_USER as USER } from "./brand";
import { LogOutIcon } from "./icons";

/** Avatar button with the signed-in user's details and Log off. */
export default function AccountMenu() {
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const menuId = useId();

  useEffect(() => {
    if (!open) return;
    const onPointer = (event: PointerEvent) => {
      if (!root.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("pointerdown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={root} className="relative">
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={menuId}
        aria-label={`Account: ${USER.name}`}
        onClick={() => setOpen((value) => !value)}
        className="flex items-center gap-2.5 rounded-full py-1 pr-1 pl-1 transition-colors hover:bg-brand-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600 md:pr-3"
      >
        <span className="grid size-9 place-items-center rounded-full bg-brand-100 text-sm font-bold text-brand-800 ring-1 ring-brand-200">
          {USER.initials}
        </span>
        <span className="hidden text-left leading-tight lg:block">
          <span className="block text-sm font-bold text-ink">{USER.name}</span>
          <span className="block text-xs text-muted">{USER.role}</span>
        </span>
      </button>

      {open && (
        <div
          id={menuId}
          role="menu"
          className="motion-rise absolute right-0 z-40 mt-2 w-72 overflow-hidden rounded-xl border border-line bg-white shadow-xl shadow-brand-900/10"
          style={{ ["--rise-delay" as string]: "0ms" }}
        >
          <div className="flex items-center gap-3 border-b border-line bg-surface/60 px-4 py-3.5">
            <span className="grid size-10 shrink-0 place-items-center rounded-full bg-brand-100 font-bold text-brand-800 ring-1 ring-brand-200">
              {USER.initials}
            </span>
            <span className="min-w-0 leading-tight">
              <span className="block truncate font-bold text-ink">{USER.name}</span>
              <span className="block truncate text-xs text-ink/80">{USER.email}</span>
              <span className="mt-0.5 block truncate text-xs text-muted">
                {USER.role} · {USER.company}
              </span>
            </span>
          </div>
          <div className="p-1.5">
            <Link
              role="menuitem"
              href="/"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-semibold text-ink transition-colors hover:bg-brand-50 hover:text-brand-900"
            >
              <LogOutIcon className="size-4 text-muted" />
              Log off
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
