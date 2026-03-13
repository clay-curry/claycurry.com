# Spike: Tagged Errors Bridging XIntegrationError to Effect

**Status**: Research complete
**Date**: 2026-03-12
**Verdict**: GO — The existing error model maps cleanly to `Data.TaggedError` with `Effect.catchTag`. Migration can be incremental.

---

## 1. Wrapping `XIntegrationError` as an Effect error channel type

The existing `XIntegrationError` uses a `code` field as the discriminant. Effect's `Data.TaggedError` uses `_tag`. We have two strategies:

### Strategy A: One TaggedError per error code (recommended)

Create separate Effect error classes for each `IntegrationIssueCode`. This gives maximum type-safety and enables `Effect.catchTag` per error type:

```ts
import { Data } from "effect"

class ReauthRequired extends Data.TaggedError("ReauthRequired")<{
  message: string
  tokenStatus?: string
  cause?: unknown
}> {}

class OwnerMismatch extends Data.TaggedError("OwnerMismatch")<{
  message: string
  tokenStatus?: string
  cause?: unknown
}> {}

class SchemaInvalid extends Data.TaggedError("SchemaInvalid")<{
  message: string
  tokenStatus?: string
  cause?: unknown
}> {}

class UpstreamError extends Data.TaggedError("UpstreamError")<{
  message: string
  tokenStatus?: string
  cause?: unknown
}> {}

class RateLimited extends Data.TaggedError("RateLimited")<{
  message: string
  retryAfterMs?: number
  cause?: unknown
}> {}

class InsufficientPermissions extends Data.TaggedError("InsufficientPermissions")<{
  message: string
  cause?: unknown
}> {}

class CacheStale extends Data.TaggedError("CacheStale")<{
  message: string
  originalError?: XSyncError
}> {}

// Union of all X integration errors
type XSyncError =
  | ReauthRequired
  | OwnerMismatch
  | SchemaInvalid
  | UpstreamError
  | RateLimited
  | InsufficientPermissions
  | CacheStale
```

### Strategy B: Wrapper that preserves the existing class

Keep `XIntegrationError` and create a single tagged wrapper. Less granular but lower migration effort:

```ts
class XError extends Data.TaggedError("XError")<{
  code: IntegrationIssueCode
  message: string
  tokenStatus?: string
  cause?: unknown
}> {}
```

This works with `Effect.catchAll` but not with `Effect.catchTag` per error code — you'd need `Effect.catchTag("XError", (e) => { switch(e.code) { ... } })`.

**Recommendation**: Strategy A. The whole point of Effect's error channel is per-type discrimination. Strategy B loses that benefit.

### Bridge function from legacy to Effect errors

```ts
function fromXIntegrationError(error: XIntegrationError): XSyncError {
  switch (error.code) {
    case "reauth_required":
      return new ReauthRequired({
        message: error.message,
        tokenStatus: error.tokenStatus,
        cause: error.cause,
      })
    case "owner_mismatch":
      return new OwnerMismatch({
        message: error.message,
        tokenStatus: error.tokenStatus,
        cause: error.cause,
      })
    case "schema_invalid":
      return new SchemaInvalid({
        message: error.message,
        tokenStatus: error.tokenStatus,
        cause: error.cause,
      })
    case "upstream_error":
      return new UpstreamError({
        message: error.message,
        tokenStatus: error.tokenStatus,
        cause: error.cause,
      })
    case "rate_limited":
      return new RateLimited({
        message: error.message,
        cause: error.cause,
      })
    case "insufficient_permissions":
      return new InsufficientPermissions({
        message: error.message,
        cause: error.cause,
      })
    case "cache_stale":
      return new CacheStale({ message: error.message })
    default:
      return new UpstreamError({
        message: error.message,
        cause: error,
      })
  }
}
```

### Sources
- [Effect Expected Errors Documentation](https://effect.website/docs/error-management/expected-errors/)
- [Effect Yieldable Errors Documentation](https://effect.website/docs/error-management/yieldable-errors/)
- [Define errors with TaggedError — typeonce.dev](https://www.typeonce.dev/course/effect-beginners-complete-getting-started/type-safe-error-handling-with-effect/define-errors-with-taggederror)

---

## 2. Can `Effect.catchTag("ReauthRequired", ...)` work with our error codes?

**Yes**, with Strategy A above. Each error code becomes its own `_tag`, so `catchTag` works directly:

```ts
const program = getBookmarksEffect.pipe(
  Effect.catchTag("ReauthRequired", (error) =>
    Effect.gen(function* () {
      yield* Effect.logWarning(`Reauth required: ${error.message}`)
      // Return degraded response or trigger OAuth flow
      return buildReauthResponse(error)
    })
  ),
  Effect.catchTag("OwnerMismatch", (error) =>
    Effect.gen(function* () {
      yield* Effect.logError(`Owner mismatch: ${error.message}`)
      return buildMismatchResponse(error)
    })
  ),
  Effect.catchTag("RateLimited", (error) =>
    Effect.gen(function* () {
      yield* Effect.logWarning(`Rate limited, retry after ${error.retryAfterMs}ms`)
      return yield* Effect.retry(
        getBookmarksEffect,
        Schedule.exponential("1 second").pipe(Schedule.compose(Schedule.recurs(3)))
      )
    })
  )
)
```

You can also use `Effect.catchTags` to handle multiple error types in one call:

```ts
const handled = getBookmarksEffect.pipe(
  Effect.catchTags({
    ReauthRequired: (e) => Effect.succeed(buildReauthResponse(e)),
    OwnerMismatch: (e) => Effect.succeed(buildMismatchResponse(e)),
    SchemaInvalid: (e) => Effect.succeed(buildSchemaErrorResponse(e)),
    UpstreamError: (e) => Effect.succeed(buildUpstreamErrorResponse(e)),
    RateLimited: (e) => Effect.succeed(buildRateLimitedResponse(e)),
    InsufficientPermissions: (e) => Effect.succeed(buildPermissionsResponse(e)),
    CacheStale: (e) => Effect.succeed(buildStaleResponse(e)),
  })
)
// Type: Effect<BookmarksApiResponse, never, Requirements>
//                                    ^^^^^ fully handled!
```

The compiler tracks the error union: if you forget to handle `RateLimited`, the error channel still contains it, and TypeScript will tell you.

### Sources
- [Effect Error Channel Operations](https://effect.website/docs/error-management/error-channel-operations/)

---

## 3. Refactoring path from try-catch to Effect typed error channels

The migration follows a bottom-up approach — wrap leaf operations first, then compose upward:

### Phase 1: Wrap leaf I/O operations with `Effect.tryPromise`

```ts
// Before (client.ts)
async readJsonResponse(response: Response, context: string): Promise<unknown> {
  if (!response.ok) {
    if (response.status === 401 || response.status === 403) {
      throw new XIntegrationError("reauth_required", message, { tokenStatus: "invalid" })
    }
    throw new XIntegrationError("upstream_error", message)
  }
  return await response.json()
}

// After
readJsonResponse(response: Response, context: string): Effect.Effect<unknown, ReauthRequired | UpstreamError | SchemaInvalid> {
  return Effect.gen(function* () {
    if (!response.ok) {
      const body = yield* Effect.tryPromise(() => response.text())
      const message = `${context} failed (${response.status}): ${body}`
      if (response.status === 401 || response.status === 403) {
        return yield* new ReauthRequired({ message, tokenStatus: "invalid" })
      }
      return yield* new UpstreamError({ message })
    }

    const json = yield* Effect.tryPromise({
      try: () => response.json(),
      catch: () => new SchemaInvalid({
        message: `${context} returned non-JSON`,
        tokenStatus: "invalid",
      }),
    })
    return json
  })
}
```

### Phase 2: Wrap service methods that call leaf operations

The token store, identity verifier, and owner resolver each become Effect-returning functions.

### Phase 3: Compose in the orchestrator (`getBookmarks`)

The 100-line try-catch in `service.ts` decomposes into a pipeline (see section 4).

### Phase 4: Remove `toIntegrationError()` bridge

Once all call sites produce typed Effect errors, the normalizer is no longer needed.

---

## 4. Concrete before/after for `getBookmarks()`

### BEFORE: Current implementation (service.ts lines 107-311)

The current `getBookmarks()` is a single 200-line async method with:
- A 170-line try-catch block
- Manual error normalization via `toIntegrationError()`
- Stale-cache fallback logic mixed with error handling
- Mutable `context` object threaded through the happy path
- Multiple responsibilities: caching, token management, identity verification, fetching, snapshotting, status recording

### AFTER: Decomposed Effect pipeline

```ts
import { Effect, pipe } from "effect"

// Individual operations — each returns a typed Effect
const checkCache = (
  repo: BookmarksRepository,
  owner: BookmarkSourceOwner,
  folderId: string | undefined,
  freshnessMs: number,
): Effect.Effect<BookmarksSnapshotRecord | null, never> =>
  Effect.tryPromise({
    try: () => repo.getSnapshot(owner, folderId),
    catch: () => null as never, // cache miss is not an error
  }).pipe(
    Effect.map((snapshot) => {
      if (!snapshot) return null
      const isFresh = Date.now() - Date.parse(snapshot.lastSyncedAt ?? "") < freshnessMs
      return isFresh ? snapshot : null
    }),
    Effect.withSpan("CheckCache"),
  )

const acquireToken = (
  tokenStore: XTokenStore,
  verifyOwner: (token: string) => Effect.Effect<BookmarkSourceOwner, ReauthRequired | OwnerMismatch>,
): Effect.Effect<XTokenRecord, ReauthRequired | OwnerMismatch | SchemaInvalid> =>
  Effect.tryPromise({
    try: () => tokenStore.getTokenForSync(async (accessToken) => {
      // Bridge: run inner Effect to get owner, throw on failure for legacy compat
      const owner = await Effect.runPromise(verifyOwner(accessToken))
      return owner
    }),
    catch: (error) => fromXIntegrationError(toIntegrationError(error)),
  }).pipe(Effect.withSpan("AcquireToken"))

const verifyAndResolveOwner = (
  client: XBookmarksClient,
  config: XLiveRuntimeConfig,
  accessToken: string,
): Effect.Effect<
  { authenticated: BookmarkSourceOwner; resolved: BookmarkSourceOwner },
  ReauthRequired | OwnerMismatch | SchemaInvalid
> =>
  Effect.gen(function* () {
    const [authenticated, resolved] = yield* Effect.tryPromise({
      try: () => Promise.all([
        new XIdentityVerifier(client, config.ownerUsername).verify(accessToken),
        new XBookmarksOwnerResolver(client, config.ownerUsername, config.ownerUserId)
          .resolve(accessToken),
      ]),
      catch: (error) => fromXIntegrationError(toIntegrationError(error)),
    })

    if (resolved.id && authenticated.id && resolved.id !== authenticated.id) {
      return yield* new OwnerMismatch({
        message: `Resolved owner @${resolved.username} does not match authenticated owner @${authenticated.username}`,
        tokenStatus: "owner_mismatch",
      })
    }

    const ownerId = resolved.id ?? authenticated.id
    if (!ownerId) {
      return yield* new SchemaInvalid({
        message: "Unable to determine the verified owner id for bookmark sync",
        tokenStatus: "invalid",
      })
    }

    return { authenticated, resolved }
  }).pipe(Effect.withSpan("VerifyAndResolveOwner"))

const fetchAndSaveBookmarks = (
  client: XBookmarksClient,
  repo: BookmarksRepository,
  config: XRuntimeConfig,
  ownerId: string,
  owner: BookmarkSourceOwner,
  accessToken: string,
  folderId?: string,
): Effect.Effect<BookmarksSnapshotRecord, UpstreamError | SchemaInvalid | ReauthRequired> =>
  Effect.gen(function* () {
    const [bookmarks, folders] = yield* Effect.tryPromise({
      try: () => Promise.all([
        folderId
          ? client.fetchBookmarksByFolder(ownerId, folderId, accessToken)
          : client.fetchAllBookmarks(ownerId, accessToken),
        client.fetchBookmarkFolders(ownerId, accessToken),
      ]),
      catch: (error) => fromXIntegrationError(toIntegrationError(error)),
    })

    yield* Effect.annotateCurrentSpan("bookmarks.count", bookmarks.length)
    yield* Effect.annotateCurrentSpan("folders.count", folders.length)

    const snapshot = buildLiveSnapshot(owner, bookmarks, folders, folderId)
    yield* Effect.tryPromise(() => repo.setSnapshot(config.ownerUsername, snapshot))

    return snapshot
  }).pipe(Effect.withSpan("FetchAndSaveBookmarks"))

// --- The orchestrator: clean, flat, and type-safe ---

const getBookmarksEffect = (
  options: BookmarksSyncServiceOptions,
  folderId?: string,
): Effect.Effect<
  { response: BookmarksApiResponse; httpStatus: number },
  never  // all errors handled
> => {
  const ownerHint = buildOwnerHint(options.config)

  const liveSyncPipeline = Effect.gen(function* () {
    // Step 1: Check cache
    const cached = yield* checkCache(
      options.repository, ownerHint, folderId, options.config.snapshotFreshnessMs
    )
    if (cached) {
      return { response: snapshotToApiResponse(cached, "fresh"), httpStatus: 200 }
    }

    // Step 2: Acquire token
    const liveConfig = assertLiveConfig(options.config)
    const tokenStore = XTokenStore.fromRuntimeConfig(
      options.repository, liveConfig, options.fetchImpl ?? fetch
    )
    const tokenRecord = yield* acquireToken(tokenStore, (token) =>
      Effect.tryPromise({
        try: () => new XIdentityVerifier(
          options.client, liveConfig.ownerUsername
        ).verify(token),
        catch: (e) => fromXIntegrationError(toIntegrationError(e)),
      })
    )

    // Step 3: Verify identity and resolve owner
    const { authenticated, resolved } = yield* verifyAndResolveOwner(
      options.client, liveConfig, tokenRecord.accessToken
    )
    const ownerId = resolved.id ?? authenticated.id ?? ""

    // Step 4: Fetch bookmarks and save snapshot
    const snapshot = yield* fetchAndSaveBookmarks(
      options.client, options.repository, options.config,
      ownerId, resolved, tokenRecord.accessToken, folderId
    )

    // Step 5: Update status (success)
    yield* Effect.tryPromise(() =>
      options.repository.setStatus(options.config.ownerUsername, buildStatusRecord({
        /* ... success fields ... */
      }))
    )

    return { response: snapshotToApiResponse(snapshot, "fresh"), httpStatus: 200 }
  }).pipe(Effect.withSpan("BookmarkSync.LiveSync"))

  // --- Stale-cache fallback via Effect.catchAll ---
  return liveSyncPipeline.pipe(
    Effect.catchAll((error) =>
      handleSyncFailure(options, ownerHint, folderId, error)
    )
  )
}
```

The `handleSyncFailure` function encapsulates the stale-cache fallback:

```ts
const handleSyncFailure = (
  options: BookmarksSyncServiceOptions,
  ownerHint: BookmarkSourceOwner,
  folderId: string | undefined,
  error: XSyncError,
): Effect.Effect<{ response: BookmarksApiResponse; httpStatus: number }, never> =>
  Effect.gen(function* () {
    const snapshot = yield* Effect.tryPromise({
      try: () => options.repository.getSnapshot(ownerHint, folderId),
      catch: () => null,
    })

    yield* Effect.annotateCurrentSpan("error._tag", error._tag)
    yield* Effect.annotateCurrentSpan("error.message", error.message)
    yield* Effect.annotateCurrentSpan("fallback.has_stale_cache", !!snapshot)

    if (snapshot) {
      // Serve stale cache with degraded status
      yield* Effect.logWarning(
        `Serving stale snapshot due to ${error._tag}: ${error.message}`
      )
      return {
        response: snapshotToApiResponse(snapshot, "stale", error.message),
        httpStatus: 200,
      }
    }

    // No cache, return error response
    yield* Effect.logError(`Bookmark sync failed with no cache: ${error._tag}`)
    return {
      response: buildErrorResponse(ownerHint, error),
      httpStatus: mapTagToHttpStatus(error._tag),
    }
  }).pipe(Effect.withSpan("BookmarkSync.Fallback"))

function mapTagToHttpStatus(tag: XSyncError["_tag"]): number {
  switch (tag) {
    case "ReauthRequired": return 503
    case "OwnerMismatch": return 409
    case "SchemaInvalid":
    case "UpstreamError": return 502
    case "RateLimited": return 429
    case "InsufficientPermissions": return 403
    default: return 500
  }
}
```

### What changed

| Aspect | Before | After |
|--------|--------|-------|
| Error typing | `catch (error)` — `unknown` | `Effect<..., ReauthRequired \| OwnerMismatch \| ...>` — fully typed union |
| Error normalization | Manual `toIntegrationError()` on every catch | Automatic via `fromXIntegrationError` at I/O boundary |
| Fallback logic | Inside catch block, mixed with status recording | Separate `handleSyncFailure` composed via `Effect.catchAll` |
| Observability | None | Every step has a span with attributes |
| Testability | Must mock entire async flow | Each step is an independent Effect, composable and testable |
| Status recording | Duplicated in try and catch blocks | Can be a single `Effect.ensuring` or `Effect.onExit` |

---

## 5. Can `toIntegrationError()` be replaced by `Effect.catchAll` + `Effect.mapError`?

**Yes.** The current `toIntegrationError()` serves two purposes:

1. **Normalize unknown errors** to `XIntegrationError` — replaced by `Effect.tryPromise({ catch: ... })` at the I/O boundary
2. **Preserve typed errors** that are already `XIntegrationError` — replaced by the typed error channel (no normalization needed)

The replacement pattern:

```ts
// Current: toIntegrationError in catch blocks
try {
  await someOperation()
} catch (error) {
  const normalized = toIntegrationError(error)
  // use normalized.code
}

// Effect replacement: mapError at the operation boundary
const someOperationEffect = Effect.tryPromise({
  try: () => someOperation(),
  catch: (error) => {
    if (error instanceof XIntegrationError) {
      return fromXIntegrationError(error)  // preserves type
    }
    return new UpstreamError({ message: String(error), cause: error })
  },
})
```

For a gradual migration, both can coexist. The legacy `toIntegrationError()` continues to work in non-Effect code paths, while `fromXIntegrationError()` bridges into the Effect error channel.

Once migration is complete, `toIntegrationError()` can be deleted entirely because:
- Every I/O boundary produces typed Effect errors
- `Effect.catchAll`/`Effect.catchTag` handles them
- No `unknown` errors exist in the Effect pipeline

---

## 6. How do tagged errors compose with the stale-cache fallback pattern?

The stale-cache fallback is the most important error recovery pattern in the bookmark sync flow. In Effect, it maps beautifully to `Effect.catchAll`:

```ts
// The core pattern: try live sync, fall back to stale cache on ANY error
const getBookmarksWithFallback = liveSyncPipeline.pipe(
  Effect.catchAll((error) =>
    staleCacheFallback(error)
  )
)
```

For more granular control, use `Effect.catchTags` to handle different errors differently:

```ts
const getBookmarksWithFallback = liveSyncPipeline.pipe(
  Effect.catchTags({
    // Reauth: always try stale cache, log for operator alert
    ReauthRequired: (e) =>
      staleCacheFallback(e).pipe(
        Effect.tap(() => Effect.logWarning("OAuth token needs refresh"))
      ),

    // Rate limited: retry with backoff before falling back
    RateLimited: (e) =>
      liveSyncPipeline.pipe(
        Effect.retry(Schedule.exponential("2 seconds").pipe(
          Schedule.compose(Schedule.recurs(2))
        )),
        Effect.catchAll(() => staleCacheFallback(e))
      ),

    // Owner mismatch: don't serve stale cache (data integrity issue)
    OwnerMismatch: (e) =>
      Effect.succeed({
        response: buildErrorResponse(ownerHint, e),
        httpStatus: 409,
      }),

    // Schema invalid: stale cache, but flag for investigation
    SchemaInvalid: (e) =>
      staleCacheFallback(e).pipe(
        Effect.tap(() => Effect.logError("Schema contract broken — investigate"))
      ),

    // Upstream error: standard stale fallback
    UpstreamError: (e) => staleCacheFallback(e),

    // Permissions: no fallback, clear error
    InsufficientPermissions: (e) =>
      Effect.succeed({
        response: buildErrorResponse(ownerHint, e),
        httpStatus: 403,
      }),

    // Cache stale is itself a "soft" error, just return it
    CacheStale: (e) =>
      Effect.succeed({
        response: buildStaleResponse(e),
        httpStatus: 200,
      }),
  })
)
```

This is a significant improvement over the current implementation where all error types go through the same catch block and the only differentiation is via `mapErrorCodeToStatus()`.

### Composition with `Effect.onExit` for status recording

The status recording logic (currently duplicated in both try and catch) can be unified:

```ts
const withStatusRecording = liveSyncPipeline.pipe(
  Effect.onExit((exit) =>
    Effect.gen(function* () {
      const statusRecord = Exit.match(exit, {
        onSuccess: (result) => buildSuccessStatus(result),
        onFailure: (cause) => buildFailureStatus(Cause.squash(cause)),
      })
      yield* Effect.tryPromise(() =>
        options.repository.setStatus(config.ownerUsername, statusRecord)
      )
    }).pipe(Effect.ignore) // status recording should not fail the main flow
  ),
  Effect.catchAll((error) => staleCacheFallback(error))
)
```

### Sources
- [Effect Error Channel Operations](https://effect.website/docs/error-management/error-channel-operations/)
- [Effect Expected Errors](https://effect.website/docs/error-management/expected-errors/)
- [EffectPatterns community repo](https://github.com/PaulJPhilp/EffectPatterns)

---

## Go/No-Go Verdict: GO

### Reasons

1. **Direct mapping**: Each `IntegrationIssueCode` becomes a `Data.TaggedError` with its own `_tag`. The 1:1 correspondence means no semantic loss.

2. **Compiler-enforced exhaustiveness**: `Effect.catchTags` with all error types results in `Effect<A, never, R>` — the compiler proves all errors are handled. The current code has 8 untyped catches that could miss error types silently.

3. **Better fallback granularity**: The stale-cache pattern benefits enormously from per-error-type handling. Currently, `OwnerMismatch` and `RateLimited` get the same fallback treatment — with Effect we can retry rate limits and reject owner mismatches.

4. **Incremental adoption**: The `fromXIntegrationError()` bridge function allows gradual migration. Legacy code continues to throw `XIntegrationError`; Effect code wraps it at the boundary.

5. **Eliminates silent swallowing**: The 7 silently swallowed errors identified in Phase 1 become compile errors — an `Effect<A, E, R>` with unhandled `E` must be explicitly handled or propagated.

### Risks

- **Learning curve**: Team needs to understand `Effect.gen`, `yield*` for error short-circuiting, and the `Effect<A, E, R>` type parameter semantics.
- **Async bridge overhead**: During migration, `Effect.runPromise` calls at boundaries add a small overhead. This disappears once the full call chain is Effect-native.
- **Bundle size**: `effect` core is ~50KB gzipped. For a server-side sync flow this is negligible; for client-side code it would matter more.

### Migration order

1. **Define tagged errors** in `lib/x/effect-errors.ts` alongside existing `errors.ts`
2. **Wrap leaf operations** (`readJsonResponse`, `requestToken`, `requestJson`) — these are the I/O boundaries
3. **Wrap service classes** (`XIdentityVerifier.verify`, `XBookmarksOwnerResolver.resolve`, `XTokenStore.getTokenForSync`)
4. **Rewrite orchestrator** (`getBookmarks`) as an Effect pipeline with `catchTags`
5. **Delete** `toIntegrationError()` and old catch blocks once fully migrated
6. **Address** the 7 silently swallowed errors and 11 missing error handlers by adding explicit `Effect.catchTag` or `Effect.tapError` handlers
