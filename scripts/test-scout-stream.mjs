// Sends one simple question to /api/scout and checks that it streams a reply.
// Usage: node scripts/test-scout-stream.mjs [http://localhost:3000]

const baseUrl = (process.argv[2] ?? "http://localhost:3000").replace(/\/+$/, "");
const QUESTION = "How many customers are in the Banking data?";
const TIMEOUT_MS = 5 * 60_000;

const started = performance.now();
const elapsed = () => `${((performance.now() - started) / 1000).toFixed(1)}s`;

const response = await fetch(`${baseUrl}/api/scout`, {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    // The route only accepts same-origin browser requests.
    "Sec-Fetch-Site": "same-origin",
  },
  body: JSON.stringify({ question: QUESTION, transcript: [] }),
  signal: AbortSignal.timeout(TIMEOUT_MS),
});

console.log(`HTTP ${response.status} ${response.headers.get("content-type")}`);
if (!response.ok || !response.body) {
  console.error("FAIL: no stream", await response.text());
  process.exit(1);
}

const counts = { status: 0, text: 0, done: 0, error: 0 };
let reply = "";
let errorMessage = "";
let chunks = 0;
let buffer = "";
const decoder = new TextDecoder();

for await (const chunk of response.body) {
  chunks += 1;
  buffer += decoder.decode(chunk, { stream: true });
  let newline;
  while ((newline = buffer.indexOf("\n")) !== -1) {
    const line = buffer.slice(0, newline).trim();
    buffer = buffer.slice(newline + 1);
    if (!line) continue;
    const event = JSON.parse(line);
    counts[event.type] = (counts[event.type] ?? 0) + 1;
    if (event.type === "status") console.log(`[${elapsed()}] status: ${event.label}`);
    if (event.type === "text") reply += event.delta;
    if (event.type === "error") errorMessage = event.message;
    if (event.type === "done") {
      console.log(`[${elapsed()}] done: transcript has ${event.transcript.length} messages`);
    }
  }
}

console.log(`\nReceived ${chunks} network chunks; events:`, counts);
if (reply) console.log(`\nReply:\n${reply}\n`);

if (counts.error > 0) {
  console.error(`FAIL: the route streamed an error: ${errorMessage}`);
  process.exit(1);
}
if (counts.done !== 1 || counts.text === 0) {
  console.error("FAIL: expected streamed text and exactly one done event");
  process.exit(1);
}
console.log(`PASS in ${elapsed()}`);
