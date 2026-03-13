# X Bookmarks Low-Level Design

## Core Classes

### `XBookmarksClient`

- Fetches `/2/users/me`, `/2/users/by/username/:username`,
  `/2/users/:id/bookmarks`, and bookmark folders.
- Normalizes tweet payloads into the internal bookmark contract.
- Maps bearer-token `401` failures to `reauth_required`.
- Parses every successful JSON payload through `zod` before returning it.

### `XBookmarksOwnerResolver`

- Resolves the configured username `claycurry__` to a concrete X account.
- Validates the optional `X_OWNER_USER_ID` compatibility setting.
- Throws `owner_mismatch` if the configured id does not match the resolved
  username.

### `XIdentityVerifier`

- Calls `/2/users/me` using the current access token.
- Rejects any token whose authenticated username is not `claycurry__`.

### `XTokenStore`

- Loads owner-scoped token records from the repository.
- Migrates the legacy `x:tokens` blob only after owner verification succeeds.
- Refreshes tokens when they are within the refresh window.
- Evicts stored tokens that fail with `reauth_required`, `owner_mismatch`, or
  `schema_invalid` so the system does not loop on a known-bad credential set.
- Rejects invalid refresh payloads instead of silently persisting malformed
  state.

### `BookmarksRepository` / `BookmarksSnapshotRepository`

- `BookmarksRepository` is the storage contract consumed by the token and sync
  layers.
- `BookmarksSnapshotRepository` is the current Redis-or-memory implementation.
- Persists versioned keys under `x:v2:<owner>:...`.
- Stores:
  - token record
  - snapshot record
  - sync diagnostics record
- Imports legacy bookmark cache entries into owner-scoped snapshot records.
- Does not expire snapshots; freshness is timestamp-based so stale data can be
  served during outages.

### `BookmarksSyncService`

- Primary orchestration entrypoint for route handlers.
- Behavior:
  - return fresh snapshot without hitting X when cache is still fresh
  - attempt live sync when cache is stale or missing
  - return stale snapshot on sync failure
  - return typed empty failure only when no snapshot exists

## Persisted Contracts

### Token Record

- `accessToken`
- `refreshToken`
- `expiresAt`
- `owner`
- `createdAt`
- `updatedAt`
- `lastRefreshedAt`

### Snapshot Record

- `owner`
- `folderId`
- `bookmarks`
- `folders`
- `lastSyncedAt`
- `cachedAt`
- `source`

### Diagnostics Record

- `configuredOwnerUsername`
- `configuredOwnerUserId`
- `resolvedOwner`
- `authenticatedOwner`
- `tokenStatus`
- `tokenExpiresAt`
- `lastRefreshedAt`
- `lastSuccessfulSyncAt`
- `lastAttemptedSyncAt`
- `lastError`

## Route Contracts

### `GET /api/x/bookmarks`

- Returns:
  - `bookmarks`
  - `folders`
  - `owner`
  - `status`
  - `isStale`
  - `lastSyncedAt`
  - `cachedAt`
  - optional `error`
  - optional `fixture`

### `GET /api/x/bookmarks/status?secret=...`

- Returns:
  - configured owner details
  - resolved and authenticated owner
  - token status and expiry
  - sync attempt timing
  - cache age
  - stale state
  - last error

## Failure Semantics

- `reauth_required`
  - no tokens stored
  - refresh token invalid
  - access token rejected by X
- `owner_mismatch`
  - authenticated account is not `claycurry__`
  - `X_OWNER_USER_ID` conflicts with the resolved username
- `schema_invalid`
  - X returned a payload that failed contract validation
  - persisted JSON failed contract validation
- `upstream_error`
  - X returned a non-auth upstream error
- `cache_stale`
  - stale snapshot served after live sync failure

## Migration Rules

- Legacy token record:
  - read from `x:tokens`
  - validate structure
  - verify owner identity
  - promote to `x:v2:<owner>:tokens`
- Legacy bookmark cache:
  - read `x:bookmarks`, `x:bookmarks:folders`, and folder variants
  - validate arrays
  - wrap them into `SnapshotRecord`
  - mark `lastSyncedAt` as `null` so the service treats them as stale until a
    successful live sync refreshes them
