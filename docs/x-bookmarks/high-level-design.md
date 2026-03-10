# X Bookmarks High-Level Design

## Overview

The X bookmarks feature is refactored into a layered sync system that always
targets the `clay__curry` account and validates every external contract before
state is persisted or returned to the UI.

The system has three layers:

1. Domain
   - Bookmark, folder, owner, snapshot, token, and diagnostics contracts are
     defined with `zod`.
   - Error taxonomy is explicit: `reauth_required`, `owner_mismatch`,
     `schema_invalid`, `upstream_error`, and `cache_stale`.
2. Infrastructure
   - `XBookmarksClient` handles X API calls.
   - `XTokenStore` exchanges and refreshes OAuth tokens.
   - `BookmarksRepository` is the storage contract.
   - `BookmarksSnapshotRepository` is the current owner-scoped Redis or
     in-memory implementation for tokens, snapshots, and sync diagnostics.
3. Application
   - `BookmarksSyncService` decides whether to serve a fresh snapshot, attempt a
     live sync, or fall back to stale data.

## Goals

- Only pull bookmarks from `@clay__curry`.
- Prevent invalid or mismatched token state from blanking the page.
- Validate X payloads, persisted records, and route responses with contracts.
- Preserve a stale snapshot when live sync fails.
- Keep the cache boundary replaceable so a future push-based, disk-backed cache
  can slot in without changing route contracts.

## Request Flow

1. `/api/x/bookmarks` asks `BookmarksSyncService` for the current snapshot.
2. If an owner-scoped snapshot is still fresh, it is returned immediately.
3. If the snapshot is stale or missing:
   - `XTokenStore` loads and refreshes tokens as needed.
   - `XIdentityVerifier` confirms the token belongs to `@clay__curry`.
   - `XBookmarksOwnerResolver` resolves `@clay__curry` and validates the
     optional `X_OWNER_USER_ID`.
   - `XBookmarksClient` fetches bookmarks and folders.
   - `BookmarksSnapshotRepository` stores the new snapshot and sync status.
4. If live sync fails and a previous snapshot exists, the service returns that
   snapshot with `status="stale"` and `isStale=true`.
5. If live sync fails and no snapshot exists, the service returns a typed
   failure payload with an explicit status code such as
   `reauth_required` or `owner_mismatch`.

## Diagnostics

- `/api/x/bookmarks/status?secret=...` exposes:
  - configured owner username and compatibility user id
  - resolved owner
  - authenticated owner
  - token health and expiry
  - last attempted sync
  - last successful sync
  - cache age and stale state
  - last error

## Future Cache Direction

The current repository remains pull-based and memory/Redis backed, but the
service depends only on repository semantics:

- load snapshot
- persist snapshot
- load token record
- persist token record
- load diagnostics
- persist diagnostics

That interface is the seam for a future push-based, disk-backed snapshot
publisher. The route contracts and orchestration logic do not need to change
when the storage backend changes.
