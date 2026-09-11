# Client guide

```ts
import { createRunpodClient } from "@runpod/typescript-api-sdk";

const client = createRunpodClient(); // RUNPOD_API_KEY from the environment
const { data, error, response } = await client.GET("/v2/catalog/gpus", {
  signal: AbortSignal.timeout(15_000),
});
if (!response.ok) {
  throw new Error(`Catalog failed (${response.status}): ${JSON.stringify(error)}`);
}
if (!data) throw new Error("Catalog response had no data");
console.log(`${data.gpus.length} GPU types`);
```

CommonJS uses `const { createRunpodClient } = require("@runpod/typescript-api-sdk")`.

Always use `response.ok` to decide whether an HTTP response succeeded. A
bodyless failure can return `error: undefined`; neither `if (error)` nor
`error !== undefined` reliably checks HTTP status. `response.ok` does not narrow
TypeScript's response union, so check `data` before accessing it. Some successful
operations intentionally return no body.

HTTP failures with decodable bodies return the usual openapi-fetch result.
Network errors, cancellation, and response parsing errors can reject the promise.
Types describe the vendored contract; they do not validate response data at runtime.
OpenAPI constraints such as conditional `if`/`then`, patterns, and numeric limits
are not all expressible in generated TypeScript. For example, pod creation requires
an image unless a template is supplied, and exactly one of GPU or CPU; the API
validates these rules.

Options: `apiKey` overrides `RUNPOD_API_KEY`; `baseUrl` overrides
`RUNPOD_API_BASE_URL`, then defaults to `https://api.runpod.io`. Blank base URLs
count as unset. `retry` configures or disables retries; `fetch` injects the base
implementation. Catalog query arrays use the spec's comma-separated encoding.
Per-request openapi-fetch options, including `signal` and `parseAs`, remain available.

## Retries and timeouts

Defaults: four total attempts, exponential backoff with equal jitter from a
1-second base to a 30-second maximum, and `Retry-After` capped at 60 seconds.
429 responses retry for all methods. Network failures and 500/502/503/504 retry
only for GET, HEAD, PUT, DELETE, and OPTIONS. POST and PATCH do not retry those
failures, because the mutation may already have happened.

Pass `retry: { maxAttempts, minBackoffMs, maxBackoffMs, maxRetryAfterMs }`, or
`retry: false`. Attempts must be a positive safe integer. Delays must be finite,
nonnegative, at most 2,147,483,647 milliseconds, and minimum backoff must not
exceed maximum backoff.

There is no default total timeout. Pass `signal: AbortSignal.timeout(...)` to
bound the request and retry waits. Cancellation interrupts a pending backoff
immediately and preserves the caller's abort reason. Injected fetch implementations
must honor the signal during their own network work. An injected sleep cannot
be stopped internally, but the client stops waiting for it on cancellation.

## Logs and runnable examples

After `pnpm build`, these examples make read-only requests:

```bash
node --env-file=.env examples/catalog.mjs
node --env-file=.env examples/pod-logs.mjs YOUR_POD_ID
```

The `--env-file` flag requires Node 20.6 or newer; on earlier Node 20 versions,
export the variables in your shell. The SDK itself does not load `.env` files.

Pod and worker log endpoints return SSE. Use `parseAs: "stream"` to read their
response body, as demonstrated in [examples/pod-logs.mjs](../examples/pod-logs.mjs).
The example prints raw SSE and stops after 30 seconds via cancellation. A stream
chunk is not necessarily an SSE event; use an SSE parser if you need structured
events. Failures after streaming begins are not automatically retried or resumed.

