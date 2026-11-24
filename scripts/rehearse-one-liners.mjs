// Rehearses the six one-line lab prompts, in order, with Claude Code.
//
// Each step runs in a new non-interactive Claude Code session (`claude -p`),
// so the only state shared between steps is the code left in the repository,
// exactly as for an attendee. After each step it records the agent's time,
// turns, and cost, runs typecheck and lint, and checks the main pages.
//
// Usage (from a fresh clone, with `npm install` done, `.env.local` in place,
// and a dev server already running):
//   node scripts/rehearse-one-liners.mjs --repo . --dev http://localhost:3200 --out ../rehearsal-results

import { spawn, spawnSync } from "node:child_process";
import { appendFileSync, mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { parseArgs } from "node:util";

const { values } = parseArgs({
  options: {
    repo: { type: "string", default: "." },
    dev: { type: "string", default: "http://localhost:3000" },
    out: { type: "string", default: "rehearsal-results" },
    "timeout-minutes": { type: "string", default: "25" },
  },
});

const REPO = path.resolve(values.repo);
const DEV = values.dev.replace(/\/+$/, "");
const OUT = path.resolve(values.out);
const STEP_TIMEOUT_MS = Number(values["timeout-minutes"]) * 60_000;
mkdirSync(OUT, { recursive: true });

// The one-liners exactly as the presenter would say them. The dev server's
// address is added only so the agent tests against the right port.
const STEPS = [
  { n: 1, ask: "Connect Scout to our bank's data." },
  { n: 2, ask: "Make the Overview page live." },
  { n: 3, ask: "Show our Liveboards on the Analytics page and open each one embedded." },
  { n: 4, ask: 'Add "View as table" to every chart.' },
  { n: 5, ask: "Put Spotter on the Bankalytics AI page." },
  { n: 6, ask: "Make the embedded analytics match our portal." },
];
const SUFFIX = ` (The dev server for this checkout is running at ${DEV}.)`;

// File edits plus the commands the lab prompts need; nothing else.
const ALLOWED = [
  "Read", "Edit", "Write", "Glob", "Grep", "TodoWrite", "WebFetch",
  "Bash(npx:*)", "Bash(npm:*)", "Bash(node:*)", "Bash(curl:*)",
  "Bash(ls:*)", "Bash(cat:*)", "Bash(grep:*)", "Bash(rg:*)", "Bash(find:*)",
  "Bash(head:*)", "Bash(tail:*)", "Bash(wc:*)", "Bash(sed:*)", "Bash(mkdir:*)",
  "Bash(echo:*)", "Bash(git status:*)", "Bash(git diff:*)",
].join(",");

const env = { ...process.env };
delete env.CLAUDECODE; // run as a standalone session, even if launched from one
delete env.CLAUDE_CODE_ENTRYPOINT;

function runClaude(prompt) {
  return new Promise((resolve) => {
    const started = Date.now();
    const child = spawn(
      "claude",
      ["-p", prompt, "--output-format", "json", "--permission-mode", "acceptEdits", "--allowedTools", ALLOWED],
      { cwd: REPO, env, stdio: ["ignore", "pipe", "pipe"] },
    );
    let stdout = "";
    let stderr = "";
    child.stdout.on("data", (d) => (stdout += d));
    child.stderr.on("data", (d) => (stderr += d));
    const timer = setTimeout(() => child.kill("SIGTERM"), STEP_TIMEOUT_MS);
    child.on("close", (code, signal) => {
      clearTimeout(timer);
      resolve({ code, signal, stdout, stderr, wallMs: Date.now() - started });
    });
  });
}

function check(cmd, args) {
  const r = spawnSync(cmd, args, { cwd: REPO, env, encoding: "utf8", timeout: 300_000 });
  return { ok: r.status === 0, tail: `${r.stdout ?? ""}${r.stderr ?? ""}`.trim().split("\n").slice(-6).join("\n") };
}

async function page(pathname) {
  try {
    const res = await fetch(`${DEV}${pathname}`, { signal: AbortSignal.timeout(180_000) });
    return { status: res.status, html: await res.text() };
  } catch (error) {
    return { status: 0, html: String(error) };
  }
}

const log = (line) => {
  console.log(line);
  appendFileSync(path.join(OUT, "progress.log"), `${new Date().toISOString()} ${line}\n`);
};

for (const step of STEPS) {
  log(`step ${step.n} started: ${step.ask}`);
  const run = await runClaude(step.ask + SUFFIX);
  writeFileSync(path.join(OUT, `step-${step.n}.stdout.json`), run.stdout);
  writeFileSync(path.join(OUT, `step-${step.n}.stderr.txt`), run.stderr);
  let result = {};
  try {
    result = JSON.parse(run.stdout);
  } catch {
    // Left empty: the summary records the exit code and signal instead.
  }

  const tsc = check("npx", ["tsc", "--noEmit"]);
  const lint = check("npx", ["eslint", "."]);
  const home = await page("/home");
  const analytics = await page("/analytics");
  const ai = await page("/ai");

  const summary = {
    step: step.n,
    ask: step.ask,
    exit: run.code,
    signal: run.signal,
    minutes: +(run.wallMs / 60_000).toFixed(1),
    turns: result.num_turns ?? null,
    costUsd: result.total_cost_usd ?? null,
    models: result.modelUsage ? Object.keys(result.modelUsage) : null,
    isError: result.is_error ?? null,
    typecheck: tsc.ok,
    lint: lint.ok,
    pages: {
      overviewLive: home.html.includes("Live data") && !home.html.includes("isn’t connected yet"),
      liveboardLinks: new Set(analytics.html.match(/href="\/analytics\/[0-9a-f-]{36}"/g) ?? []).size,
      aiStatus: ai.status,
    },
    finalMessage: result.result ?? "",
    typecheckTail: tsc.ok ? "" : tsc.tail,
    lintTail: lint.ok ? "" : lint.tail,
  };
  appendFileSync(path.join(OUT, "summary.jsonl"), `${JSON.stringify(summary)}\n`);
  log(`step ${step.n} done in ${summary.minutes} min (typecheck ${tsc.ok ? "pass" : "FAIL"}, lint ${lint.ok ? "pass" : "FAIL"})`);
}
log("all steps done");
