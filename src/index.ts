// @runpod/sdk — TypeScript client for the RunPod v2 REST API.
//
// The typed API surface under src/generated/ is openapi-typescript output from
// spec/openapi.yaml; `task generate` rebuilds it.

import createClient, { type Client } from "openapi-fetch";
import type { paths } from "./generated/schema.js";
import { createRetryFetch, type RetryOptions } from "./retry.js";

export const DEFAULT_BASE_URL = "https://api.runpod.io";

export interface RunpodClientOptions {
  /** API key; falls back to the RUNPOD_API_KEY environment variable. */
  apiKey?: string;
  /** API base URL for another environment; falls back to RUNPOD_API_BASE_URL, then production. */
  baseUrl?: string;
  /** Retry tuning, or false to disable the retry layer entirely. */
  retry?: RetryOptions | false;
  /** Base fetch implementation, injectable for tests. */
  fetch?: typeof fetch;
}

export type RunpodClient = Client<paths>;

/**
 * Creates a typed RunPod API client with the shared retry policy wired in.
 *
 * The API key comes from `options.apiKey` or `RUNPOD_API_KEY`; without either,
 * this throws. A blank `baseUrl` or `RUNPOD_API_BASE_URL` is treated as unset
 * and falls back to {@link DEFAULT_BASE_URL}.
 *
 * @throws Error when no API key is available.
 */
export function createRunpodClient(options: RunpodClientOptions = {}): RunpodClient {
  const apiKey = options.apiKey ?? process.env.RUNPOD_API_KEY;
  if (!apiKey) {
    throw new Error("runpod: API key required (set RUNPOD_API_KEY or pass apiKey)");
  }
  // Blank counts as unset: an empty RUNPOD_API_BASE_URL in a .env would
  // otherwise make every request URL relative and unparseable.
  const baseUrl =
    options.baseUrl?.trim() || process.env.RUNPOD_API_BASE_URL?.trim() || DEFAULT_BASE_URL;

  const baseFetch = options.fetch ?? globalThis.fetch;
  const fetchImpl =
    options.retry === false ? baseFetch : createRetryFetch({ ...options.retry, fetch: baseFetch });

  return createClient<paths>({
    baseUrl,
    fetch: fetchImpl,
    // Generation rejects contracts with a different array query encoding.
    querySerializer: { array: { style: "form", explode: false } },
    headers: { Authorization: `Bearer ${apiKey}` },
  });
}

export { createRetryFetch, parseRetryAfter, type RetryOptions } from "./retry.js";
export type { paths, components } from "./generated/schema.js";
