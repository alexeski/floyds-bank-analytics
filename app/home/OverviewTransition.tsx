"use client";

import { createContext, useContext, useTransition, type ReactNode, type TransitionStartFunction } from "react";

type OverviewTransition = { isPending: boolean; startTransition: TransitionStartFunction };

const Context = createContext<OverviewTransition | null>(null);

/**
 * One transition shared by every filter control on the page, so the content
 * area knows when new data is on its way: it keeps showing the current figures
 * (dimmed) instead of falling back to the loading skeleton, then animates them
 * to the new values.
 */
export function OverviewTransitionProvider({ children }: { children: ReactNode }) {
  const [isPending, startTransition] = useTransition();
  return <Context value={{ isPending, startTransition }}>{children}</Context>;
}

export function useOverviewTransition(): OverviewTransition {
  const context = useContext(Context);
  if (!context) throw new Error("useOverviewTransition must be used inside OverviewTransitionProvider");
  return context;
}

/** Dims the live figures and shows a progress bar under the header while filters apply. */
export function PendingSurface({ children }: { children: ReactNode }) {
  const { isPending } = useOverviewTransition();
  return (
    <div aria-busy={isPending} className="relative">
      <div
        aria-hidden="true"
        className={`pointer-events-none fixed inset-x-0 top-[104px] z-40 h-0.5 overflow-hidden transition-opacity duration-300 md:top-[68px] ${
          isPending ? "opacity-100" : "opacity-0"
        }`}
      >
        <div className="motion-progress h-full w-full origin-left bg-gradient-to-r from-brand-500 via-brand-400 to-brand-700" />
      </div>
      <div
        className={`transition-[opacity,filter] duration-300 ${
          isPending ? "opacity-55 saturate-50" : "opacity-100"
        }`}
      >
        {children}
      </div>
    </div>
  );
}
