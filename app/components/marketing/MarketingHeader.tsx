import Link from "next/link";
import { Logo } from "../brand";
import { LockIcon } from "../icons";

const SEGMENTS = ["Personal", "Business", "Commercial"] as const;

const NAV_LINKS = [
  { href: "/#platform", label: "Platform" },
  { href: "/#banksy", label: "Banksy AI" },
  { href: "/#security", label: "Security" },
  { href: "/#contact", label: "Contact" },
] as const;

/** Public site header used by the landing page. */
export default function MarketingHeader() {
  return (
    <header className="sticky top-0 z-30 bg-white/95 shadow-[0_1px_0_var(--color-line)] backdrop-blur">
      <div className="bg-brand-950 text-[13px] text-brand-200">
        <div className="mx-auto flex h-9 max-w-7xl items-center justify-between px-4 sm:px-6">
          <nav aria-label="Customer type" className="flex h-full items-stretch">
            {SEGMENTS.map((segment) => (
              <span
                key={segment}
                className={`flex items-center border-b-2 px-3 first:pl-0 ${
                  segment === "Commercial"
                    ? "border-brand-500 font-semibold text-white"
                    : "border-transparent"
                }`}
              >
                {segment}
              </span>
            ))}
          </nav>
          <span className="hidden sm:inline">Help &amp; support</span>
        </div>
      </div>
      <div className="mx-auto flex h-[72px] max-w-7xl items-center gap-10 px-4 sm:px-6">
        <Link href="/" aria-label="Home">
          <Logo />
        </Link>
        <nav aria-label="Main" className="hidden items-center gap-1 lg:flex">
          {NAV_LINKS.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className="rounded-md px-3 py-2 text-[15px] font-semibold text-ink transition-colors hover:bg-brand-50 hover:text-brand-800"
            >
              {label}
            </Link>
          ))}
        </nav>
        <Link
          href="/login"
          className="ml-auto inline-flex items-center gap-2 rounded-md bg-brand-700 px-5 py-2.5 text-sm font-bold text-white shadow-sm transition-colors hover:bg-brand-800"
        >
          <LockIcon className="size-4" />
          Log on
        </Link>
      </div>
    </header>
  );
}
