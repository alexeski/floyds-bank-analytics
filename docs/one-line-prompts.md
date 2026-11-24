# One-line prompts: an alternative way to run the lab

This branch (`one-line-prompts`) is an experiment, kept apart from `main` until a decision is made. It lets the presenter and attendees ask for each lab step in one short sentence instead of pasting a long prompt, while still getting the same result.

## The two options

| | Detailed prompts (`main`, tag `detailed-prompts-v1`) | One-line prompts (this branch) |
| --- | --- | --- |
| What attendees type | The full prompt file (copy and paste) | One sentence, for example "Make the Overview page live." |
| Where the detail lives | In the prompt | In `prompts/`, found through `AGENTS.md` |
| Works with | Any coding agent | Best with Claude Code; other agents read `AGENTS.md` too, but untested |
| Stage moment | "Paste this prompt" | "Type this sentence" |
| Fallback | Not needed | Paste the full prompt file, unchanged |

## How it works

- `AGENTS.md` starts with a "Lab steps" map: six typical requests, each pointing to its full prompt file, with rules every step follows (read the spec first and follow it exactly, verify, white-label, never commit, and what to do when an earlier step is missing). The map sits outside the block that `next dev` manages, which `next dev` leaves alone.
- `CLAUDE.md` imports `AGENTS.md`, so Claude Code always has the map. Cursor, GitHub Copilot, Codex, and Gemini CLI read `AGENTS.md` directly.
- The prompt files are unchanged, so they stay the single source of truth and the fallback.
- `prompts/README.md` lists the six one-liners.

| Step | One-liner |
| --- | --- |
| 1 | Connect Scout to our bank's data. |
| 2 | Make the Overview page live. |
| 3 | Show our Liveboards on the Analytics page and open each one embedded. |
| 4 | Add "View as table" to every chart. |
| 5 | Put Spotter on the Bankalytics AI page. |
| 6 | Make the embedded analytics match our portal. |

## Rehearsal results (23 Nov 2026)

All six one-liners were run in order on a fresh clone of this branch, each in a new non-interactive Claude Code session (model: claude-sonnet-5-5), so each step saw only the code earlier steps left behind. The only addition to each one-liner was the dev server's address, because the rehearsal ran on port 3200.

| Step | Time | Cost | Typecheck / lint | Result |
| --- | --- | --- | --- | --- |
| 1 | 4.7 min | $0.81 | Pass / pass | Scout chat built; token, MCP connection, and 9 tools worked. The reply test stopped at the AI gateway's usage limit (not a code problem). |
| 2 | 2.0 min | $0.41 | Pass / pass | Overview live; only `getOverviewData()` replaced, contract and UI untouched. |
| 3 | 3.3 min | $0.74 | Pass / pass | Liveboard tiles and full-height embeds; reused step 2's REST helper. |
| 4 | 3.5 min | $0.80 | Pass / pass | "View as table" action and dialog; 12/12 adapter tests pass. |
| 5 | 1.8 min | $0.49 | Pass / pass | Spotter page built to spec. Rendering not confirmed (browser pane was hidden during the check). |
| 6 | 1.6 min | $0.40 | Pass / pass | Theme module, Figtree font, Scout branding, portal icon. |
| Total | 16.9 min | $3.64 | 6/6 | |

Checked independently: the Liveboard embed carries exactly the specified settings (Explore and TML actions hidden, Spotter 3 chat, data cache, the portal icon sprite), and the Analytics page lists the same Liveboards as the finished portal.

### What the rehearsal found

- **Fixed:** steps 3 and 5 put "Spotter" and "ThoughtSpot" in loading and error messages, because only prompt 1 states the white-label rule and each step runs in a fresh session. The rule now sits with the rules for every step in `AGENTS.md`.
- **Open:** confirm the Spotter page renders, with the browser visible.

## Before deciding

1. Rerun the rehearsal with the white-label fix and check every page in a visible browser (see below).
2. Try the one-liners once in each other tool attendees will use (Cursor, GitHub Copilot).
3. Raise the AI gateway's usage limit so the Scout chat can answer, then rerun step 1.

## How to rerun the rehearsal

From a fresh clone of this branch with `npm install` done and `.env.local` in place, start a dev server on a spare port, then run:

```bash
node scripts/rehearse-one-liners.mjs --repo . --dev http://localhost:3200 --out ../rehearsal-results
```

It runs the six one-liners in order with Claude Code (`claude -p`), each in a fresh session, and writes per-step timing, cost, typecheck and lint results, page checks, and the agent's final message to `summary.jsonl` in the output folder. Each step is capped at 25 minutes.

## How to adopt it

Merge this branch into `main`. Nothing else changes: the prompt files stay as they are and remain the fallback. To drop the idea, delete the branch.
