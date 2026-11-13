# Bankalytics — ThoughtSpot Banking Analytics Hands-On Lab

Bankalytics is a sample banking analytics portal for ThoughtSpot hands-on labs. It covers credit cards, checking, savings, and lending, and it's built with Next.js, React, and the ThoughtSpot Visual Embed SDK.

## Prerequisites

- [Node.js](https://nodejs.org/) 20.9 or later (includes `npm`)
- [Git](https://git-scm.com/downloads)
- A code editor, such as [VS Code](https://code.visualstudio.com/)
- Access to a ThoughtSpot instance

Check your versions:

```bash
node --version
npm --version
git --version
```

## Download

Clone the repository:

```bash
git clone https://github.com/thoughtspot/tse-hol-banking-analytics.git
cd tse-hol-banking-analytics
```

If you don't have Git, use **Code → Download ZIP** on the GitHub repository page, unzip the file, and open a terminal in the unzipped folder.

## Install

Install the dependencies:

```bash
npm install
```

## Configure

Create a `.env.local` file in the project root, and set it to the URL of your ThoughtSpot instance:

```bash
NEXT_PUBLIC_THOUGHTSPOT_HOST=https://your-instance.thoughtspot.cloud
```

`.env.local` is ignored by Git. Don't commit it.

## Run

Start the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser. When you edit a file, the page reloads automatically.

To stop the server, press `Ctrl+C` in the terminal.

## Set up SpotterCode (optional)

[SpotterCode](https://developers.thoughtspot.com/docs/SpotterCode) is ThoughtSpot's AI coding assistant for embedding ThoughtSpot and using the REST APIs. It connects your coding agent to a ThoughtSpot-hosted MCP server that provides SDK references, REST API docs, code samples, and developer guides. Use it with any coding agent that supports MCP servers.

### Requirements

- A coding agent that supports remote MCP servers over HTTP, such as Claude Code, Cursor, or VS Code with GitHub Copilot.
- For the authenticated endpoint, a ThoughtSpot Analytics license with an active ThoughtSpot Embedded subscription, and access to a ThoughtSpot instance.

### MCP endpoints

| Endpoint | URL | Use it for |
| -------- | --- | ---------- |
| Authenticated | `https://spottercode.thoughtspot.app/mcp` | Docs lookup plus tools that run against your ThoughtSpot instance (`execute-thoughtspot-code`, `list-orgs`, `switch-org`). Requires you to sign in. |
| Docs only | `https://spottercode.thoughtspot.app/mcp/docs` | Developer docs and REST API reference lookup only. No sign-in or ThoughtSpot instance needed. |

### Add the server to your agent

The exact steps depend on your agent. In general, add a remote (HTTP) MCP server named `SpotterCode` with one of the URLs above, then complete the sign-in prompt and enter the URL of your ThoughtSpot instance when asked.

- **Claude Code:** `claude mcp add --transport http SpotterCode https://spottercode.thoughtspot.app/mcp`
- **Claude (web):** In **Customize → Connectors**, add a custom connector with the server URL. It syncs to Claude Code automatically.
- **Cursor:** Use the one-click install from the [Cursor Marketplace](https://cursor.com/marketplace/thoughtspot), or add the server URL in **Settings → Tools and MCP**.
- **VS Code:** Add the server through the Extensions view or your workspace `mcp.json`. A chat agent extension such as GitHub Copilot must be installed.
- **Other agents:** Follow your agent's documentation for adding a remote MCP server.

### Verify the connection

Ask your agent: "Use SpotterCode to confirm you have access to the ThoughtSpot developer docs and REST API reference."

### Learn more

- [Set up SpotterCode](https://developers.thoughtspot.com/docs/tutorials/spottercode-embed/set-up-spottercode)
- [Integrate SpotterCode with your IDE](https://developers.thoughtspot.com/docs/integrate-SpotterCode)
- [SpotterCode prompting guide](https://developers.thoughtspot.com/docs/spottercode-prompting-guide)
- [ThoughtSpot developer documentation index (llms.txt)](https://developers.thoughtspot.com/docs/llms.txt)

SpotterCode is rate limited to 120 requests per minute per IP address. If you exceed the limit, requests are blocked for 10 minutes.

## Other commands

| Command         | Description                                  |
| --------------- | -------------------------------------------- |
| `npm run build` | Create a production build                    |
| `npm run start` | Serve the production build (run `build` first) |
| `npm run lint`  | Run ESLint                                   |

## Troubleshooting

- **Port 3000 is already in use:** run `npm run dev -- -p 3001` and open `http://localhost:3001`.
- **`npm install` fails:** confirm that you're on Node.js 20.9 or later, delete `node_modules`, and run `npm install` again.
