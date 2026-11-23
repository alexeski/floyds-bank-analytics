import type { Metadata } from "next";
import { PRODUCT_NAME } from "../components/brand";
import PageHeader from "../components/PageHeader";
import { SendIcon, SparkleIcon } from "../components/icons";

export const metadata: Metadata = {
  title: `${PRODUCT_NAME} AI`,
};

const SUGGESTED_QUESTIONS = [
  "What was credit card spend by category last quarter?",
  "Which regions grew current account balances fastest?",
  "Show savings attrition by customer tenure",
  "Compare mortgage lending to last year",
] as const;

/**
 * A full-screen page: it fills the viewport below the sticky portal header
 * (104px tall below md, 68px from md up) and uses the compact page header, so
 * the chat area keeps as much height as possible. The footer is hidden here
 * (see isFullScreenPath in app/components/chrome.ts), so the page never scrolls.
 */
export default function BankalyticsAiPage() {
  return (
    <div className="flex h-[calc(100dvh-104px)] min-h-[480px] flex-col md:h-[calc(100dvh-68px)]">
      <PageHeader
        eyebrow="Conversational analytics"
        title={`${PRODUCT_NAME} AI`}
        description="Ask questions about the bank's data in plain English and get answers with charts."
        icon={<SparkleIcon className="size-7" />}
        variant="compact"
      />
      <section className="mx-auto flex min-h-0 w-full max-w-4xl flex-1 flex-col px-4 py-6 sm:px-6">
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl border border-line bg-white">
          <div className="flex min-h-0 flex-1 flex-col items-center justify-center overflow-y-auto px-6 py-10 text-center">
            <span className="rounded-xl bg-brand-700 p-3.5 text-white shadow-lg shadow-brand-700/25">
              <SparkleIcon className="size-7" />
            </span>
            <h2 className="mt-5 text-2xl font-extrabold tracking-tight">
              What would you like to know?
            </h2>
            <p className="mt-1 text-sm text-muted">
              Try one of these to get started.
            </p>
            <ul className="mt-8 grid w-full gap-3 sm:grid-cols-2">
              {SUGGESTED_QUESTIONS.map((question) => (
                <li
                  key={question}
                  className="rounded-lg border border-line bg-surface px-4 py-3 text-left text-sm font-medium text-ink"
                >
                  {question}
                </li>
              ))}
            </ul>
          </div>
          <div className="border-t border-line bg-surface/60 p-4">
            <div className="flex items-center gap-2 rounded-lg border border-line bg-white py-1.5 pr-1.5 pl-4">
              <label htmlFor="ai-question" className="sr-only">
                Ask a question
              </label>
              <input
                id="ai-question"
                type="text"
                disabled
                placeholder={`${PRODUCT_NAME} AI is not connected yet`}
                className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-muted disabled:cursor-not-allowed"
              />
              <button
                type="button"
                disabled
                aria-label="Send question"
                className="rounded-md bg-brand-700 p-2.5 text-white disabled:opacity-40"
              >
                <SendIcon className="size-4" />
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
