# Runpod REST API v2 — TypeScript SDK

A typed TypeScript/JavaScript client for **Runpod REST API v2**
(`https://api.runpod.io/v2`). Manage pods, clusters,
Serverless endpoints, templates, network volumes, registries, catalog, SSH keys,
and billing.

[REST v2 API docs](https://api.runpod.io/v2/docs) ·
[OpenAPI spec](https://api.runpod.io/v2/openapi.json) ·
[Runpod plugin](https://github.com/runpod/runpod-plugins-official) ·
[MCP server](https://github.com/runpod/runpod-mcp)

Supports **Node.js 20+**, ESM, and CommonJS. For Serverless job submission and
results, use the existing [runpod-sdk](https://github.com/runpod/js-sdk).

## Using an AI agent instead?

The **[Runpod plugin](https://github.com/runpod/runpod-plugins-official#install)**
adds Runpod skills and tools to your agent. In Claude Code:

```text
/plugin marketplace add runpod/runpod-plugins-official
/plugin install runpod@runpod
/reload-plugins
```

Authenticate through `/mcp` → **runpod** → **Sign in with Runpod**.
[Install for other agents](https://github.com/runpod/runpod-plugins-official#install).

For **[MCP tools only](https://github.com/runpod/runpod-mcp#quick-start)**,
run the guided installer and follow its connection/authentication prompts:

```bash
npx @runpod/mcp-server@latest add
```

These alternatives let an agent manage Runpod without integrating this SDK.

## Get started with the SDK

To build from source, install **Node.js 24** and **pnpm 11**. Python is only needed
when regenerating types or running the spec tests.

From the SDK checkout:

```bash
pnpm install --frozen-lockfile
pnpm build
cp .env.example .env
```

Set `RUNPOD_API_KEY` in `.env`, then run a read-only request to list GPU types:

```bash
node --env-file=.env examples/catalog.mjs
```

## Use it in your app

Create a local package from the SDK checkout:

```bash
npm pack
```

Then install that file **in your app's directory**, using the tarball path printed
by `npm pack`:

```bash
npm install /path/to/package.tgz
```

Set `RUNPOD_API_KEY` in your app's environment and make a request:

```ts
import { createRunpodClient } from "@runpod/typescript-api-sdk";

const client = createRunpodClient();
const { data, response } = await client.GET("/v2/catalog/gpus", {
  signal: AbortSignal.timeout(15_000),
});

if (!response.ok) throw new Error(`Runpod request failed: ${response.status}`);
if (!data) throw new Error("Runpod returned no data");
console.log(data.gpus);
```

The client uses `RUNPOD_API_KEY`, or accepts `{ apiKey: "..." }`. It retries
transient failures by default; pass `{ retry: false }` to disable retries.
Use `response.ok` to check HTTP status. Network, timeout, and parsing failures
reject the promise. The SDK does not load `.env` automatically or set a default
timeout. Keep API keys in server-side code.

## More

- [Client guide](docs/client.md): options, errors, retries, CommonJS, and log streams.
- [Examples](examples): runnable catalog and pod-log requests.
- [Development](docs/development.md): tests, type generation, and spec-update automation.

MIT — [License](LICENSE) · [Third-party notices](THIRD_PARTY_NOTICES.txt)
