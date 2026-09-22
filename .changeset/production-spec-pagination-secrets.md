---
'@runpod/typescript-api-sdk': minor
---

Resync the vendored production spec and regenerate the types. Adds cursor
pagination on the list endpoints (`cursor` and `limit` query parameters, and a
`pagination` block carrying `nextCursor` and `hasNextPage` on the response) and
the account-secrets paths. Both are additive upstream, so existing calls keep
their current types.
