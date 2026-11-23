import { BANK_NAME, Logo, PRODUCT_NAME } from "../brand";

const COLUMNS = [
  {
    title: PRODUCT_NAME,
    links: ["Platform overview", "Banksy AI", "Liveboards", "Release notes"],
  },
  {
    title: "Lines of business",
    links: ["Current accounts", "Savings & ISAs", "Credit cards", "Wealth"],
  },
  {
    title: "Support",
    links: ["Help centre", "Training", "Service status", "Contact your team"],
  },
] as const;

/** Public site footer used by the landing page. */
export default function MarketingFooter() {
  return (
    <footer id="contact" className="bg-brand-950 text-brand-200">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 lg:grid-cols-[1.3fr_2fr]">
        <div>
          <Logo tone="inverse" />
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-brand-200/80">
            {PRODUCT_NAME} gives teams across {BANK_NAME} one trusted view of
            customers, products, and performance.
          </p>
        </div>
        <div className="grid gap-8 sm:grid-cols-3">
          {COLUMNS.map(({ title, links }) => (
            <div key={title}>
              <h2 className="text-sm font-bold text-white">{title}</h2>
              <ul className="mt-3 space-y-2 text-sm">
                {links.map((link) => (
                  <li key={link} className="text-brand-200/80">
                    {link}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 px-4 py-6 text-xs text-brand-200/70 sm:px-6 md:flex-row md:justify-between">
          <p>
            © 2026 {BANK_NAME}. {BANK_NAME} is a fictitious brand created for a
            hands-on lab and is not affiliated with any real bank.
          </p>
          <p>All figures are sample data.</p>
        </div>
      </div>
    </footer>
  );
}
