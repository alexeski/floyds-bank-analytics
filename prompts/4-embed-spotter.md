On the Bankalytics AI page (app/ai/page.tsx), replace the placeholder with an embedded Spotter using SpotterEmbed from the Visual Embed SDK's React components.

Requirements:

- Reuse the existing trusted-auth token endpoint. Initialize the SDK once from a shared, idempotent module that's only loaded in the browser (next/dynamic, ssr: false).
- Use the Spotter 3 chat: set updatedSpotterChatPrompt: true and spotterExperienceVersion: SPOTTER_2026_11.
- On the server, look up the 'Banking' model by exact name and pass its id as worksheetId, with disableSourceSelection: true. Wrap the server fetch in <Suspense>.
- Enable the chat history sidebar with spotterSidebarConfig: enablePastConversationsSidebar: true, collapsed by default, title 'Chat history', new-chat button 'New conversation'.
- Hide Spotter's generic sample questions.
- Update the page header description to fit the banking model.
- Add 6 clickable starter-prompt chips above the embed, styled like the suggestion chips in app/components/scout/ScoutBar.tsx. Each sends its question with HostEvent.SpotterSearch and is written against the Banking model's real columns, so look up the columns first and don't guess.
- Keep the page's laptop-friendly layout: it already uses the compact page header (PageHeader variant="compact") and fills the viewport below the portal header with no page scroll (the footer is hidden on /ai). Keep both, put the starter-prompt chips in a single row that scrolls sideways instead of wrapping, and give the embed all the remaining height.
- Keep embed props and handlers stable (module constants or useCallback) so the iframe isn't rebuilt. Make the embed fill the full available width and height of the page: give it style={{ height: "100%" }} and size its parents to match so the iframe doesn't collapse to 150px.

Verification, in this order:

1. Before writing code, check every SDK option you plan to use against the installed 1.53.1 types (node_modules/@thoughtspot/visual-embed-sdk). Don't use an option you haven't found there.
2. Run `tsc --noEmit` and lint, and fix errors. Don't run `next build`.

No browser or Playwright tests.

Don't commit. Report what passed and anything you couldn't verify.
