import type { Metadata } from "next";
import { Suspense } from "react";
import { Figtree, Geist_Mono } from "next/font/google";
import BanksyProvider from "./components/banksy/BanksyProvider";
import { BANK_NAME, PRODUCT_NAME } from "./components/brand";
import SiteFooter from "./components/SiteFooter";
import SiteHeader from "./components/SiteHeader";
import ThoughtSpotInit from "./components/thoughtspot/ThoughtSpotInit";
import "./globals.css";

const figtree = Figtree({
  variable: "--font-figtree",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: `${PRODUCT_NAME} · ${BANK_NAME}`,
    template: `%s · ${BANK_NAME}`,
  },
  description: `${BANK_NAME} ${PRODUCT_NAME}: analytics across current accounts, savings, cards, lending, small business, and wealth.`,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en-GB"
      className={`${figtree.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col font-sans">
        {process.env.TS_USERNAME && (
          <ThoughtSpotInit username={process.env.TS_USERNAME} />
        )}
        <BanksyProvider>
          {/* The header and footer read the pathname, so they sit in Suspense
              for routes whose path is only known at request time. */}
          <Suspense fallback={<div className="h-[136px] bg-white md:h-[100px]" />}>
            <SiteHeader />
          </Suspense>
          <main className="flex flex-1 flex-col">{children}</main>
          <Suspense fallback={null}>
            <SiteFooter />
          </Suspense>
        </BanksyProvider>
      </body>
    </html>
  );
}
