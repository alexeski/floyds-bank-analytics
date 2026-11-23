"use client";

import { useEffect } from "react";
import { initThoughtSpot } from "./sdk";

/**
 * Starts SDK initialization as soon as the app loads. Embeds await the same
 * shared promise from ./sdk, so they never mount before init has finished.
 */
export default function ThoughtSpotInit({ username }: { username: string }) {
  useEffect(() => {
    initThoughtSpot(username).catch((error: unknown) => {
      console.error(
        "[thoughtspot] init failed:",
        error instanceof Error ? error.message : error,
      );
    });
  }, [username]);

  return null;
}
