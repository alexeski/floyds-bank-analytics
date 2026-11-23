import type { SVGProps } from "react";

/**
 * Brand settings for the fictitious bank used in this lab. Change the names
 * here to rebrand every page at once.
 */
export const BANK_NAME = "Floyds Bank";
export const PRODUCT_NAME = "Bankalytics";

/** The "galloping horse" emblem: a horse's head inside a rounded square. */
export function Emblem({
  tone = "brand",
  ...props
}: SVGProps<SVGSVGElement> & { tone?: "brand" | "inverse" }) {
  const tile = tone === "brand" ? "#006a4d" : "#ffffff";
  const horse = tone === "brand" ? "#ffffff" : "#024731";
  const accent = tone === "brand" ? "#11b67a" : "#11b67a";
  return (
    <svg viewBox="0 0 48 48" aria-hidden="true" {...props}>
      <rect width="48" height="48" rx="11" fill={tile} />
      <path
        d="M36 42c1.6-8.3 1.4-15.7-2.2-22.3L31.6 13l-.2-6.4-3.6 4.2-3.4-3.5-.4 5.3c-4.2 2.3-8.4 6.3-12.1 10.9-1.8 2.3-2.3 4.4-1 6 1.4 1.6 4.2 1.1 7.2.3 1.6-.4 2.8.3 2.6 2-.5 3.6-3.3 6.6-4.6 10.1Z"
        fill={horse}
      />
      <path
        d="M31.6 13c2.9 2.4 5.2 6.9 6.1 12.4.7 4.6.5 10.5-.6 16.6"
        fill="none"
        stroke={accent}
        strokeWidth="2.6"
        strokeLinecap="round"
      />
      <circle cx="24.6" cy="17.6" r="1.4" fill={tile} />
    </svg>
  );
}

/** Emblem plus the wordmark. */
export function Logo({
  tone = "brand",
  className = "",
  showProduct = false,
}: {
  tone?: "brand" | "inverse";
  className?: string;
  showProduct?: boolean;
}) {
  const [first, ...rest] = BANK_NAME.split(" ");
  const text = tone === "brand" ? "text-brand-900" : "text-white";
  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <Emblem tone={tone} className="size-9 shrink-0" />
      <span className="flex flex-col leading-none">
        <span
          className={`text-[17px] font-extrabold uppercase tracking-[0.08em] ${text}`}
        >
          {first}
          <span className="font-medium"> {rest.join(" ")}</span>
        </span>
        {showProduct && (
          <span
            className={`mt-1 text-[11px] font-semibold uppercase tracking-[0.16em] ${
              tone === "brand" ? "text-brand-600" : "text-brand-300"
            }`}
          >
            {PRODUCT_NAME}
          </span>
        )}
      </span>
    </span>
  );
}
