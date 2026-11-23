import type { Metadata } from "next";
import Link from "next/link";
import { BANK_NAME, Emblem, Logo, PRODUCT_NAME } from "../components/brand";
import { ArrowRightIcon, CheckIcon, ShieldIcon } from "../components/icons";
import Swoosh from "../components/marketing/Swoosh";
import LoginForm from "./LoginForm";

export const metadata: Metadata = {
  title: "Log on",
};

const HIGHLIGHTS = [
  "Live Liveboards for every line of business",
  "Banksy, your AI data analyst",
  "Row-level security on every query",
] as const;

export default function LoginPage() {
  return (
    <div className="grid flex-1 bg-white lg:min-h-dvh lg:grid-cols-[1fr_1.1fr]">
      <aside className="relative hidden overflow-hidden bg-brand-900 text-white lg:flex lg:flex-col">
        <Swoosh />
        <div className="relative flex flex-1 flex-col justify-between p-12">
          <Link href="/" aria-label={`${BANK_NAME} home`}>
            <Logo tone="inverse" showProduct />
          </Link>
          <div className="max-w-md">
            <Emblem tone="inverse" className="size-14" />
            <h2 className="mt-8 text-4xl leading-tight font-extrabold tracking-tight">
              The whole bank, at a glance.
            </h2>
            <ul className="mt-8 space-y-3">
              {HIGHLIGHTS.map((item) => (
                <li key={item} className="flex items-center gap-3 text-brand-100">
                  <span className="rounded-full bg-brand-500 p-1 text-brand-950">
                    <CheckIcon className="size-3.5" />
                  </span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <p className="text-xs text-brand-200/70">
            {BANK_NAME} is a fictitious brand created for a ThoughtSpot hands-on
            lab.
          </p>
        </div>
      </aside>

      <section className="flex flex-col">
        <div className="flex items-center justify-between border-b border-line px-6 py-4 lg:border-none lg:px-12 lg:pt-10">
          <Link href="/" className="lg:hidden" aria-label={`${BANK_NAME} home`}>
            <Logo />
          </Link>
          <Link
            href="/"
            className="ml-auto inline-flex items-center gap-1 text-sm font-semibold text-brand-700 hover:text-brand-900"
          >
            <ArrowRightIcon className="size-4 rotate-180" />
            Back to {BANK_NAME}
          </Link>
        </div>

        <div className="flex flex-1 items-center justify-center px-6 py-12">
          <div className="w-full max-w-md">
            <p className="text-sm font-bold uppercase tracking-[0.14em] text-brand-700">
              {PRODUCT_NAME}
            </p>
            <h1 className="mt-2 text-4xl font-extrabold tracking-tight text-ink">
              Log on
            </h1>
            <p className="mt-2 text-muted">
              Use your {BANK_NAME} colleague ID to continue.
            </p>

            <LoginForm />

            <div className="mt-8 flex items-start gap-3 rounded-lg bg-surface p-4 text-sm text-muted">
              <ShieldIcon className="mt-0.5 size-5 shrink-0 text-brand-700" />
              <p>
                <span className="font-semibold text-ink">Demo environment.</span>{" "}
                No real credentials are needed or checked. Please don&rsquo;t
                enter a real password.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
