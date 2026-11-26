"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { DEMO_USER } from "../components/brand";
import { LockIcon } from "../components/icons";

/** Shown as dots in the password field. Not a real password, and never sent. */
const DEMO_PASSWORD = "demo-password";

/**
 * Demo log-on form, prefilled with the demo user's email and a dummy
 * password. Nothing is sent anywhere: submitting simply opens the portal.
 * The app signs in to the analytics service separately, with trusted auth.
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
        <label htmlFor="email" className="block text-sm font-bold text-ink">
          Work email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="off"
          defaultValue={DEMO_USER.email}
          className="mt-1.5 block w-full rounded-md border border-[#8a948f] bg-white px-3.5 py-3 text-[15px] text-ink outline-none transition-shadow focus:border-brand-700 focus:ring-3 focus:ring-brand-500/25"
        />
      </div>
      <div>
        <label htmlFor="password" className="block text-sm font-bold text-ink">
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="off"
          defaultValue={DEMO_PASSWORD}
          className="mt-1.5 block w-full rounded-md border border-[#8a948f] bg-white px-3.5 py-3 text-[15px] text-ink outline-none transition-shadow focus:border-brand-700 focus:ring-3 focus:ring-brand-500/25"
        />
      </div>
      <label className="flex items-center gap-2.5 text-sm text-ink">
        <input
          type="checkbox"
          defaultChecked
          className="size-4 rounded accent-brand-700"
        />
        Remember me
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
