"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { LockIcon } from "../components/icons";

const DEMO_USER_ID = "lab.analyst";

/**
 * Demo log-on form. Nothing is sent anywhere: submitting simply opens the
 * portal, so attendees can start the lab without real credentials.
 */
export default function LoginForm() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    router.push("/home");
  }

  return (
    <form onSubmit={handleSubmit} className="mt-8 space-y-5">
      <div>
        <label htmlFor="user-id" className="block text-sm font-bold text-ink">
          User ID
        </label>
        <input
          id="user-id"
          name="user-id"
          type="text"
          autoComplete="off"
          defaultValue={DEMO_USER_ID}
          className="mt-1.5 block w-full rounded-md border border-[#8a948f] bg-white px-3.5 py-3 text-[15px] text-ink outline-none transition-shadow focus:border-brand-700 focus:ring-3 focus:ring-brand-500/25"
        />
      </div>
      <div>
        <div className="flex items-baseline justify-between">
          <label htmlFor="password" className="block text-sm font-bold text-ink">
            Password
          </label>
          <span className="text-xs text-muted">Optional in the demo</span>
        </div>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="off"
          placeholder="Leave blank"
          className="mt-1.5 block w-full rounded-md border border-[#8a948f] bg-white px-3.5 py-3 text-[15px] text-ink outline-none transition-shadow placeholder:text-muted/70 focus:border-brand-700 focus:ring-3 focus:ring-brand-500/25"
        />
      </div>
      <label className="flex items-center gap-2.5 text-sm text-ink">
        <input
          type="checkbox"
          defaultChecked
          className="size-4 rounded accent-brand-700"
        />
        Remember my user ID
      </label>
      <button
        type="submit"
        disabled={isSubmitting}
        className="flex w-full items-center justify-center gap-2 rounded-md bg-brand-700 px-5 py-3.5 text-[15px] font-bold text-white shadow-sm transition-colors hover:bg-brand-800 disabled:opacity-70"
      >
        {isSubmitting ? (
          <>
            <span className="size-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
            Logging on…
          </>
        ) : (
          <>
            <LockIcon className="size-4" />
            Log on
          </>
        )}
      </button>
    </form>
  );
}
