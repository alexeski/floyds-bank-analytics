Wire the Scout chat (app/components/scout/) to the ThoughtSpot MCP server at TS_MCP_URL,
following ARCHITECTURE.md (/api/scout route, streamed NDJSON, browser holds the transcript).

LLM: Anthropic TS SDK → LiteLLM proxy (LITELLM_URL / \_API_KEY / \_MODEL / \_MAX_TOKENS).
Don't print .env.local values; normalize them defensively (scheme, slashes, /v1, quotes).

Auth: trusted-auth token for TS_USERNAME from TOKEN_SERVICE_URL, sent with
x-ts-host = host of NEXT_PUBLIC_THOUGHTSPOT_HOST.

Tools: load all; report any the server withholds and its stated reason.
Multi-step tools (create/modify_dashboard, analysis and model sessions) return
needs_input / in_progress + task_id: keep the full transcript across turns, never
confirm a plan for the user, never retry a failed dashboard without asking.
Whenever a liveboard is created, always give it a description: use the user's wording if
given, otherwise write one short sentence summarizing it. Pass it through the tool's
description field if the tool schema has one; if it doesn't, say so in your report
and add it to the system prompt so the model includes one in the request.

UX: stream text; status line with elapsed time (connecting, thinking, each tool,
MCP progress). Logging: tool name, only — tell me where logs land.
Clean replies: the chat bubble shows only the final answer, never the model's process.
In the system prompt, tell the model to write no text before or between tool calls (no
"Let me…", "I'll analyze…", "Perfect!", no talk of sessions, searches or data sources),
to open with the headline answer, and to add no preamble or closing offer. As a backstop,
when a model step that streamed text ends in tool calls, take that text back out of the
bubble (a "discard" event) and leave it out of the transcript. Show progress in the status
line instead, including the step_notification notes in get_session_updates results.
Data source: always the model named "Banking"; Scout must never discover or choose one.
On the server, look up its ID once with search_objects (query "Banking", types ["WORKSHEET"],
exact title match), cache it, and put it in the system prompt with the rule: call
create_analysis_session with that data_source_id straight away, never search for a data
source, and reuse the session for follow-ups. If the lookup fails, fall back to telling the
model to make that one exact search itself. A session without data_source_id fails here.
Cache Components is on: never call Date.now() / new Date() / Math.random() during render
or in a useState initializer. Record start times in event handlers or useEffect, and
time with performance.now(). Don't run `next build` to check this.

Scout users have no direct access to ThoughtSpot: never render links to ThoughtSpot, or to
a liveboard or answer that was created. Describe the result in text only.
White label: the app is fully white-labeled, so the words "ThoughtSpot" and "Spotter" must
never appear anywhere a user can see them: chat replies, status labels, error messages, or
any UI text. Use neutral wording instead ("the analytics service", "your data", "Scout").
Tell the model in the system prompt never to mention ThoughtSpot, Spotter, MCP, or tool
names. As a backstop, replace those words server-side in everything streamed to the browser
(text, status, and errors), including when a word is split across two streamed chunks.
Tool replies come back as markdown: render it properly (headings, lists, tables, bold, code),
sanitized, with no raw HTML. Close the chat when I click outside it.

Testing, keep it minimal: run typecheck and lint, then ONE Node script (fetch, no browser,
no Playwright or other headless browser) against {{DEV_URL}} that sends a simple question to
/api/scout and checks that it streams a reply, and that the reply shown (after any discard)
has no narration such as "Let me" or "I'll". Don't create liveboards as a test.

Don't commit.
