// Read-only. Run after pnpm build: RUNPOD_API_KEY=... node examples/pod-logs.mjs POD_ID
import { createRunpodClient } from "../dist/index.js";
const id = process.argv[2];
if (!id) throw new Error("Usage: node examples/pod-logs.mjs POD_ID");
const client = createRunpodClient();
const { data, error, response } = await client.GET("/v2/pods/{id}/logs", {
  params: { path: { id }, query: { tail: 100 } },
  parseAs: "stream",
  signal: AbortSignal.timeout(30_000),
});
if (!response.ok) throw new Error(`Logs failed (${response.status}): ${JSON.stringify(error)}`);
if (!data) throw new Error("Log response had no body");
// These are raw SSE bytes. Chunk boundaries are not event boundaries.
const reader = data.getReader();
const decoder = new TextDecoder();
try {
  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    process.stdout.write(decoder.decode(value, { stream: true }));
  }
  process.stdout.write(decoder.decode());
} finally {
  try { await reader.cancel(); } finally { reader.releaseLock(); }
}
