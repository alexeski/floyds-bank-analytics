"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import BanksyButton from "./banksy/BanksyButton";
import { Logo, PRODUCT_NAME } from "./brand";
import { isMarketingPath } from "./chrome";
import { LogOutIcon } from "./icons";

const NAV_ITEMS = [
  { href: "/home", label: "Overview" },
  { href: "/analytics", label: "Analytics" },
  { href: "/ai", label: `${PRODUCT_NAME} AI` },
] as const;

function isActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

/** Header for the signed-in portal. Hidden on the marketing pages. */
export default function SiteHeader() {
  const pathname = usePathname();
  if (isMarketingPath(pathname)) return null;

  return (
    <header
      className="sticky top-0 z-30 bg-white shadow-[0_1px_0_var(--color-line),0_6px_18px_rgba(2,71,49,0.08)]"
    >
      <div className="bg-brand-950 text-[12px] text-brand-200">
        <div className="mx-auto flex h-8 max-w-7xl items-center justify-between px-4 sm:px-6">
          <span className="font-medium tracking-wide">
            Commercial Banking · Enterprise Analytics
          </span>
          <span className="hidden items-center gap-1.5 sm:inline-flex">
            <span className="size-1.5 rounded-full bg-brand-500" />
            Internal use only
          </span>
        </div>
      </div>
      <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-x-6 px-4 sm:px-6 md:h-[68px] md:flex-nowrap md:gap-x-10">
        <Link
          href="/home"
          className="flex h-[60px] shrink-0 items-center md:h-auto"
          aria-label={`${PRODUCT_NAME} overview`}
        >
          <Logo showProduct />
        </Link>
        {/* On small screens the nav drops to its own row under the logo. */}
        <nav
          aria-label="Primary"
          className="order-last -mx-4 flex h-11 w-[calc(100%+2rem)] min-w-0 items-stretch gap-1 overflow-x-auto border-t border-line px-2 sm:-mx-6 sm:w-[calc(100%+3rem)] sm:px-4 md:order-none md:mx-0 md:h-full md:w-auto md:border-none md:px-0"
        >
          {NAV_ITEMS.map(({ href, label }) => {
            const active = isActive(pathname, href);
            return (
              <Link
                key={href}
                href={href}
                aria-current={active ? "page" : undefined}
                className={`flex items-center whitespace-nowrap border-b-4 px-3 pt-1 text-[15px] font-semibold transition-colors ${
                  active
                    ? "border-brand-500 text-brand-900"
                    : "border-transparent text-muted hover:text-brand-800"
                }`}
              >
                {label}
              </Link>
            );
          })}
        </nav>
        <div className="ml-auto flex shrink-0 items-center gap-2">
          <BanksyButton />
          <Link
            href="/"
            className="hidden items-center gap-1.5 rounded-md px-3 py-2 text-sm font-semibold text-brand-800 transition-colors hover:bg-brand-50 md:inline-flex"
          >
            <LogOutIcon className="size-4" />
            Log off
          </Link>
        </div>
      </div>
    </header>
  );
}
