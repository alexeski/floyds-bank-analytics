import type { ReactNode } from "react";

type PageHeaderProps = {
  eyebrow: string;
  title: string;
  description: string;
  icon: ReactNode;
};

export default function PageHeader({
  eyebrow,
  title,
  description,
  icon,
}: PageHeaderProps) {
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
