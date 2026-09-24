# @runpod/typescript-api-sdk

## 0.2.0

### Minor Changes

- 71be666: Resync the vendored production spec and regenerate the types. Adds cursor
  pagination on the list endpoints (`cursor` and `limit` query parameters, and a
  `pagination` block carrying `nextCursor` and `hasNextPage` on the response) and
  the account-secrets paths. Both are additive upstream, so existing calls keep
  their current types.

## 0.1.1

### Patch Changes

- Update the README installation instructions now that the SDK is available on npm.

## 0.1.0

### Minor Changes

- 23de1a8: Initial TypeScript SDK for Runpod REST API v2, with generated request and response types, configurable retries, and ESM and CommonJS support. Includes whole-operation deadlines, structured rate-limit metadata, and a bounded SSE log-event iterator.
