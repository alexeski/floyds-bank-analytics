"use client";

import { usePathname } from "next/navigation";
import { BANK_NAME, PRODUCT_NAME } from "./brand";
import { isMarketingPath } from "./chrome";

/** Slim footer for the signed-in portal. Hidden on the marketing pages. */
export default function SiteFooter() {
  const pathname = usePathname();
  if (isMarketingPath(pathname)) return null;

  return (
    <footer className="border-t border-line bg-white">
      <div className="mx-auto flex max-w-7xl flex-col gap-1 px-4 py-5 text-sm text-muted sm:flex-row sm:justify-between sm:px-6">
        <span>
          {BANK_NAME} · {PRODUCT_NAME} Enterprise Analytics
        </span>
        <span>
          Figures shown are sample data. {BANK_NAME} is a fictitious bank.
        </span>
      </div>
    </footer>
  );
}
