import type { ReactNode } from "react";

type PageHeaderProps = {
  eyebrow: string;
  title: string;
  description: string;
  icon: ReactNode;
  /**
   * "compact" is a single 56px band for full-screen pages (an embedded chat
   * or Liveboard), so the embed keeps as much height as possible.
   */
  variant?: "default" | "compact";
  /** Optional content on the right of a compact header, such as a status badge. */
  aside?: ReactNode;
};

export default function PageHeader({
  eyebrow,
  title,
  description,
  icon,
  variant = "default",
  aside,
}: PageHeaderProps) {
  if (variant === "compact") {
    return (
      <section className="relative shrink-0 overflow-hidden bg-brand-900 text-white">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 right-0 w-1/2 bg-[radial-gradient(circle_at_90%_50%,rgba(17,182,122,0.3),transparent_60%)]"
        />
        <div className="relative mx-auto flex h-14 max-w-7xl items-center gap-3 px-4 sm:px-6">
          <span className="rounded-md bg-brand-500 p-1.5 text-brand-950 [&>svg]:size-5">
            {icon}
          </span>
          <h1 className="shrink-0 text-lg font-extrabold tracking-tight">{title}</h1>
          <p className="hidden min-w-0 truncate border-l border-white/20 pl-3 text-sm text-brand-100/85 lg:block">
            <span className="sr-only">{eyebrow}: </span>
            {description}
          </p>
          {aside && <div className="ml-auto shrink-0">{aside}</div>}
        </div>
        <div
          aria-hidden="true"
          className="absolute inset-x-0 bottom-0 h-0.5 bg-gradient-to-r from-brand-500 via-brand-400 to-transparent"
        />
      </section>
    );
  }

  return (
    <section className="relative overflow-hidden bg-brand-900 text-white">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-0 right-0 w-1/2 bg-[radial-gradient(circle_at_85%_30%,rgba(17,182,122,0.35),transparent_60%)]"
      />
      <div
        aria-hidden="true"
        className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-brand-500 via-brand-400 to-transparent"
      />
      <div className="relative mx-auto flex max-w-7xl items-start gap-5 px-4 py-10 sm:px-6">
        <div className="hidden rounded-lg bg-brand-500 p-3 text-brand-950 sm:block">
          {icon}
        </div>
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-brand-300">
            {eyebrow}
          </p>
          <h1 className="mt-1.5 text-3xl font-extrabold tracking-tight sm:text-4xl">
            {title}
          </h1>
          <p className="mt-2 max-w-2xl text-brand-100/90">{description}</p>
        </div>
      </div>
    </section>
  );
}
