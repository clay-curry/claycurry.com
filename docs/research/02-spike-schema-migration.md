# Spike: @effect/schema vs Zod -- Coexistence and Migration

**Date**: 2026-03-12
**Status**: Research complete
**Scope**: ~30 Zod schemas in `apps/www/lib/x/contracts.ts` (263 lines)

---

## Table of Contents

1. [Current Zod Usage Inventory](#1-current-zod-usage-inventory)
2. [Can Zod and @effect/schema Coexist?](#2-can-zod-and-effectschema-coexist)
3. [Side-by-Side Schema Comparisons](#3-side-by-side-schema-comparisons)
4. [Error Channel Integration](#4-error-channel-integration)
5. [What @effect/schema Gives Us That Zod Does Not](#5-what-effectschema-gives-us-that-zod-does-not)
6. [Bundle Size](#6-bundle-size)
7. [Bridge Packages](#7-bridge-packages)
8. [Migration Strategy](#8-migration-strategy)
9. [Go/No-Go Verdict](#9-gono-go-verdict)

---

## 1. Current Zod Usage Inventory

### Schema Count and Categories

| Category | Schemas | Lines |
|----------|---------|-------|
| Primitives / branded types | `IsoDateTimeStringSchema`, `NullableIsoDateTimeStringSchema` | 7 |
| X API response shapes | `XTweetSchema`, `XUserSchema`, `XMediaSchema`, `XPublicMetricsSchema`, `XBookmarksResponseSchema`, `XBookmarkFoldersResponseSchema`, `XUserEnvelopeSchema`, `XOAuthTokenResponseSchema` | 50 |
| Domain models | `NormalizedBookmarkSchema`, `BookmarkMediaSchema`, `BookmarkSourceOwnerSchema`, `XBookmarkFolderSchema` | 25 |
| Enums | `IntegrationIssueCodeSchema`, `BookmarksApiStatusSchema`, `TokenHealthStatusSchema` | 20 |
| Persistence records | `XTokenRecordSchema`, `LegacyStoredTokensSchema`, `BookmarksSnapshotRecordSchema`, `BookmarksSyncStatusRecordSchema` | 40 |
| API response envelopes | `BookmarksApiResponseSchema`, `BookmarksStatusApiResponseSchema` | 35 |

### Usage Patterns (4 call sites)

| File | Pattern | How Zod Is Called |
|------|---------|-------------------|
| `client.ts` | `parseContract(schema, payload, ctx)` | `schema.parse(payload)` inside try/catch, wraps `ZodError` in `XIntegrationError` |
| `cache.ts` | `getValidated<T>(key, schema: ZodType<T>)` | `schema.parse(parsed)` after `JSON.parse`, deletes cache on failure |
| `cache.ts` | `setValidated<T>(key, schema, value)` | `schema.parse(value)` to validate before `JSON.stringify` |
| `tokens.ts` | Direct `.parse()` calls | `XTokenRecordSchema.parse(...)`, `XOAuthTokenResponseSchema.parse(...)` |

### Key Observation

The Zod integration surface is narrow: all validation flows through **3 patterns** (`parseContract`, `getValidated`/`setValidated`, direct `.parse()`). The schemas themselves are pure data declarations with no Zod-specific logic beyond `.refine()` on `IsoDateTimeStringSchema`.

---

## 2. Can Zod and @effect/schema Coexist?

**Yes.** The two libraries are independent with no runtime conflicts. Coexistence strategies:

### Strategy A: Keep Zod in contracts.ts, use Schema in new Effect code

```
contracts.ts          (Zod)    -- existing, unchanged
contracts-effect.ts   (Schema) -- new Effect-native schemas for new features
```

Interop points:
- Types extracted via `z.infer<>` and `typeof schema.Type` are plain TypeScript types -- they are structurally compatible when the shapes match.
- Data validated by Zod can flow into Effect pipelines without re-validation, since the output is just typed data.
- The `@zod-plugin/effect` package (see Section 7) bridges Zod parse results into `Effect<A, ZodError>`.

### Strategy B: Thin adapter in the Effect service layer

```typescript
// In the Effect layer, wrap Zod parse to produce Effect:
import { Effect } from "effect";
import { XBookmarksResponseSchema } from "./contracts";

const decodeBookmarksResponse = (input: unknown) =>
  Effect.try({
    try: () => XBookmarksResponseSchema.parse(input),
    catch: (error) => new SchemaValidationError({ cause: error }),
  });
```

This keeps all 30 Zod schemas untouched while making decode failures appear in the Effect error channel.

### Strategy C: Full migration to @effect/schema (eventual)

Replace Zod schemas one-by-one. The narrow call-site surface (3 patterns) means the migration boundary is well-defined.

**Recommended**: Start with Strategy B (zero changes to contracts.ts), migrate to C only when a schema needs bidirectional encoding or Effect-native features.

---

## 3. Side-by-Side Schema Comparisons

### Example 1: BookmarkSourceOwnerSchema (simple object)

**Zod (current)**
```typescript
import { z } from "zod";

export const BookmarkSourceOwnerSchema = z.object({
  id: z.string().nullable(),
  username: z.string().min(1),
  name: z.string().nullable(),
});

export type BookmarkSourceOwner = z.infer<typeof BookmarkSourceOwnerSchema>;
```

**@effect/schema equivalent**
```typescript
import { Schema } from "effect";

export class BookmarkSourceOwner extends Schema.Class<BookmarkSourceOwner>("BookmarkSourceOwner")({
  id: Schema.NullOr(Schema.String),
  username: Schema.String.pipe(Schema.minLength(1)),
  name: Schema.NullOr(Schema.String),
}) {}

// Type is automatically: { id: string | null; username: string; name: string | null }
// Access via: typeof BookmarkSourceOwner.Type
```

Or without the class-based approach:
```typescript
export const BookmarkSourceOwnerSchema = Schema.Struct({
  id: Schema.NullOr(Schema.String),
  username: Schema.String.pipe(Schema.minLength(1)),
  name: Schema.NullOr(Schema.String),
});

export type BookmarkSourceOwner = typeof BookmarkSourceOwnerSchema.Type;
```

### Example 2: IsoDateTimeStringSchema (custom refinement)

**Zod (current)**
```typescript
function isIsoDateTimeString(value: string): boolean {
  return !Number.isNaN(Date.parse(value));
}

export const IsoDateTimeStringSchema = z
  .string()
  .min(1)
  .refine(isIsoDateTimeString, "Expected an ISO datetime string");
```

**@effect/schema equivalent**
```typescript
import { Schema } from "effect";

export const IsoDateTimeString = Schema.String.pipe(
  Schema.minLength(1),
  Schema.filter((s) => !Number.isNaN(Date.parse(s)), {
    message: () => "Expected an ISO datetime string",
  })
);

// Or use the built-in Schema.DateTimeUtc for full ISO 8601 parsing
// which also gives bidirectional encoding (string <-> Date):
export const IsoDateTime = Schema.DateTimeUtc;
```

The `Schema.DateTimeUtc` option illustrates a key advantage: Effect Schema can decode the string into an actual `DateTime.Utc` object and encode it back -- something Zod `.refine()` cannot do without a separate `.transform()`.

### Example 3: XBookmarksResponseSchema (nested optional objects with arrays)

**Zod (current)**
```typescript
export const XBookmarksResponseSchema = z.object({
  data: z.array(XTweetSchema).optional(),
  includes: z
    .object({
      users: z.array(XUserSchema).optional(),
      media: z.array(XMediaSchema).optional(),
    })
    .optional(),
  meta: z
    .object({
      next_token: z.string().optional(),
      result_count: z.number().int().nonnegative(),
    })
    .optional(),
});
```

**@effect/schema equivalent**
```typescript
export const XBookmarksResponseSchema = Schema.Struct({
  data: Schema.optional(Schema.Array(XTweetSchema)),
  includes: Schema.optional(Schema.Struct({
    users: Schema.optional(Schema.Array(XUserSchema)),
    media: Schema.optional(Schema.Array(XMediaSchema)),
  })),
  meta: Schema.optional(Schema.Struct({
    next_token: Schema.optional(Schema.String),
    result_count: Schema.Number.pipe(
      Schema.int(),
      Schema.nonNegative()
    ),
  })),
});
```

### Mapping Cheat Sheet

| Zod | @effect/schema |
|-----|----------------|
| `z.string()` | `Schema.String` |
| `z.number()` | `Schema.Number` |
| `z.boolean()` | `Schema.Boolean` |
| `z.string().min(1)` | `Schema.String.pipe(Schema.minLength(1))` |
| `z.number().int()` | `Schema.Number.pipe(Schema.int())` |
| `z.number().nonnegative()` | `Schema.Number.pipe(Schema.nonNegative())` |
| `z.number().positive()` | `Schema.Number.pipe(Schema.positive())` |
| `z.string().optional()` | `Schema.optional(Schema.String)` |
| `z.string().nullable()` | `Schema.NullOr(Schema.String)` |
| `z.array(schema)` | `Schema.Array(schema)` |
| `z.enum(["a", "b"])` | `Schema.Literal("a", "b")` |
| `z.object({...})` | `Schema.Struct({...})` |
| `.refine(fn, msg)` | `.pipe(Schema.filter(fn, { message }))` |
| `z.infer<typeof S>` | `typeof S.Type` |
| `schema.parse(x)` | `Schema.decodeUnknownSync(schema)(x)` |
| `schema.safeParse(x)` | `Schema.decodeUnknownEither(schema)(x)` |

---

## 4. Error Channel Integration

This is where @effect/schema has a decisive advantage over Zod for Effect-based code.

### Current: Zod errors are caught and re-wrapped manually

```typescript
// client.ts -- current pattern
function parseContract<T>(
  schema: { parse: (value: unknown) => T },
  payload: unknown,
  context: string,
): T {
  try {
    return schema.parse(payload);      // Zod throws ZodError
  } catch (error) {
    throw new XIntegrationError(       // manual wrapping
      "schema_invalid",
      `${context} did not match the expected contract`,
      { cause: error, tokenStatus: "invalid" },
    );
  }
}
```

### With @effect/schema: Decode failures become tagged errors automatically

```typescript
import { Schema, ParseResult } from "effect";

// Schema.decodeUnknown returns Effect<A, ParseError>
// ParseError has _tag: "ParseError" -- it's already a tagged error

const decodeBookmarksResponse = Schema.decodeUnknown(XBookmarksResponseSchema);
// Type: (input: unknown) => Effect<XBookmarksResponse, ParseError>

// In an Effect pipeline, ParseError flows through the error channel:
const program = Effect.gen(function* () {
  const json = yield* fetchJson(url, accessToken);
  const response = yield* decodeBookmarksResponse(json);
  //                       ^^^^^^^^^^^^^^^^^^^^^^^^
  //  If this fails, ParseError appears in E channel automatically.
  //  No try/catch, no manual wrapping.
  return response;
});

// Handle with catchTag:
const handled = program.pipe(
  Effect.catchTag("ParseError", (error) =>
    Effect.fail(new XSchemaError({
      context: "bookmarks response",
      cause: error,
    }))
  )
);
```

### Wrapping into domain-specific tagged errors

```typescript
import { Data } from "effect";

class XSchemaError extends Data.TaggedError("XSchemaError")<{
  context: string;
  cause: ParseResult.ParseError;
}> {}

// Create a reusable decode-and-tag helper:
const parseContract = <A, I>(schema: Schema.Schema<A, I>, context: string) =>
  (input: unknown) => Schema.decodeUnknown(schema)(input).pipe(
    Effect.mapError((cause) => new XSchemaError({ context, cause }))
  );
```

This replaces the current try/catch `parseContract` function entirely, and the error is tracked in the type system -- the compiler tells you when `XSchemaError` is unhandled.

---

## 5. What @effect/schema Gives Us That Zod Does Not

### 5.1 Bidirectional Transforms (Encoding + Decoding)

Zod `.transform()` is one-way: input -> output. There is no way to reverse the transform for serialization.

```typescript
// Effect Schema: bidirectional
const DateFromString = Schema.DateFromString;
// Decode: "2024-01-15T00:00:00Z" -> Date object
// Encode: Date object -> "2024-01-15T00:00:00Z"

Schema.decodeUnknownSync(DateFromString)("2024-01-15T00:00:00Z");
// => Date(2024-01-15)

Schema.encodeSync(DateFromString)(new Date("2024-01-15"));
// => "2024-01-15T00:00:00.000Z"
```

This matters for our cache layer (`setValidated` / `getValidated`) where we serialize to Redis and deserialize back. Currently both directions use `schema.parse()` which works because we store the "encoded" form. With Effect Schema, `encode` and `decode` would be explicit and type-safe.

### 5.2 Annotations

Schemas can carry metadata for documentation, JSON Schema generation, error messages, and arbitrary user data:

```typescript
const Username = Schema.String.pipe(
  Schema.minLength(1),
  Schema.annotations({
    identifier: "Username",
    title: "Twitter/X Username",
    description: "A non-empty string representing a Twitter handle",
    examples: ["claycurry"],
  })
);
```

### 5.3 JSON Schema Generation

```typescript
import { JSONSchema } from "effect";

const jsonSchema = JSONSchema.make(BookmarkSourceOwnerSchema);
// => { type: "object", properties: { ... }, required: [...] }
```

Zod v4 now has this built-in too (`z.toJSONSchema()`), but Effect's version respects annotations.

### 5.4 Arbitrary Data Generation (Property-Based Testing)

```typescript
import { Arbitrary, FastCheck } from "effect";

const arb = Arbitrary.make(BookmarkSourceOwnerSchema);
FastCheck.sample(arb, 5);
// => [{ id: null, username: "abc", name: "def" }, ...]
```

### 5.5 Equivalence and Ordering

```typescript
import { Equivalence } from "effect";

const eq = Equivalence.make(BookmarkSourceOwnerSchema);
eq({ id: "1", username: "a", name: "b" }, { id: "1", username: "a", name: "b" });
// => true
```

### 5.6 Class-Based Schemas with Methods

```typescript
class NormalizedBookmark extends Schema.Class<NormalizedBookmark>("NormalizedBookmark")({
  id: Schema.String,
  text: Schema.String,
  createdAt: IsoDateTimeString,
  // ...
}) {
  get shortText() {
    return this.text.slice(0, 140);
  }
}
```

---

## 6. Bundle Size

### Raw Numbers (approximate, gzipped)

| Library | Standalone Size (gzip) | Marginal Cost When Effect Already Bundled |
|---------|----------------------|-------------------------------------------|
| Zod 3 | ~14 KB | +14 KB (independent) |
| Zod 4 | ~8 KB | +8 KB (independent) |
| Zod Mini (v4) | ~2 KB | +2 KB (independent) |
| `effect` (core) | ~50 KB | already in bundle |
| `@effect/schema` | ~19 KB | **~0 KB marginal** (schema is re-exported from `effect` since 3.x) |

**Key insight**: Since Effect 3.x, `Schema` is included in the `effect` package itself (as `import { Schema } from "effect"`). If we are already committed to adopting Effect as a dependency, @effect/schema adds essentially zero marginal bundle size. Meanwhile, keeping Zod means carrying ~8-14 KB of redundant validation library.

Effect's function-based export style enables tree-shaking: only the Schema combinators actually used are included in the bundle.

### Verdict on Bundle Size

If Effect is adopted (which Phase 1 already decided), **removing Zod saves 8-14 KB** with no additional cost for Schema. This is a clear win, but not urgent -- it becomes free savings whenever we complete migration.

---

## 7. Bridge Packages

### `@zod-plugin/effect` (official Zod plugin)

**What it does**: Adds `.effect.parseSync()` and `.effect.parse()` methods to all Zod schemas, returning `Effect<A, ZodError>` instead of throwing.

```typescript
import "@zod-plugin/effect";
import { Effect } from "effect";
import { XBookmarksResponseSchema } from "./contracts";

// Returns Effect<XBookmarksResponse, ZodError, never>
const result = XBookmarksResponseSchema.effect.parseSync(payload);

// Use in Effect pipeline:
const program = Effect.gen(function* () {
  const response = yield* XBookmarksResponseSchema.effect.parseSync(json);
  return response;
});
```

**Status**: v0.1.0, maintained by the Zod team with Effect team review. Works with Zod 3.x.

**Assessment**: This is useful as a **transitional bridge** -- it lets us use existing Zod schemas inside Effect pipelines without manual `Effect.try()` wrapping. However, `ZodError` is not a tagged Effect error, so we would still need `Effect.mapError()` to convert it. For a small codebase like ours (30 schemas), the bridge adds complexity without saving much effort vs. direct migration.

### `ts-to-effect-schema` (code generation)

Generates Effect Schema code from TypeScript type definitions. Not directly useful here since our types are derived from Zod schemas (not the other way around), but could be useful if we extracted interfaces first.

### No Zod-to-Schema Codemod Exists

There is no automated tool to convert Zod schema definitions to @effect/schema. Migration must be manual. Given our ~263 lines / ~30 schemas, this is approximately 2-3 hours of work.

---

## 8. Migration Strategy

### Recommended: Incremental Migration with Effect Adapter (Phase-Gated)

#### Phase 2a: Wrap Zod in Effect (immediate, ~30 min)

Create a thin adapter that wraps Zod `.parse()` in `Effect.try()` for use in Effect service layers. **Zero changes to contracts.ts.**

```typescript
// lib/x/schema-bridge.ts
import { Effect, Data } from "effect";
import type { ZodType } from "zod";

export class SchemaValidationError extends Data.TaggedError("SchemaValidationError")<{
  readonly context: string;
  readonly cause: unknown;
}> {}

export const parseContract = <T>(
  schema: ZodType<T>,
  context: string,
) => (input: unknown): Effect.Effect<T, SchemaValidationError> =>
  Effect.try({
    try: () => schema.parse(input),
    catch: (cause) => new SchemaValidationError({ context, cause }),
  });
```

#### Phase 2b: New schemas in @effect/schema (ongoing)

Any new domain types added outside `lib/x/` use `Schema` from Effect. No Zod for new code.

#### Phase 3: Migrate contracts.ts (when touching the file for other reasons)

Convert schemas one-by-one from Zod to @effect/schema. Order of migration:

1. **Leaf schemas first** (no dependencies): `IsoDateTimeStringSchema`, `BookmarkMediaSchema`, `XPublicMetricsSchema`, `XBookmarkFolderSchema`, enum schemas
2. **Mid-level schemas**: `BookmarkSourceOwnerSchema`, `XUserSchema`, `XMediaSchema`, `XTweetSchema`
3. **Composite schemas**: `NormalizedBookmarkSchema`, `XBookmarksResponseSchema`, `BookmarksSnapshotRecordSchema`, etc.
4. **Update call sites**: Replace `getValidated`/`setValidated` ZodType parameter with `Schema.Schema`, replace `parseContract` with Effect-native decode

Each schema can be migrated independently because:
- The call sites use duck typing (`{ parse: (v: unknown) => T }` in `parseContract`)
- `Schema.decodeUnknownSync` satisfies this interface via a wrapper
- Types are structurally compatible

#### Phase 4: Remove Zod dependency

Once all schemas are migrated, remove `zod` from `package.json`. Expected bundle size savings: ~8-14 KB gzipped.

### Why NOT Big-Bang?

- 263 lines is small enough to big-bang, but there is no urgency
- The current Zod schemas work fine; the adapter pattern (Phase 2a) gives us Effect integration immediately
- Incremental migration means each PR is small and reviewable
- Risk of regression is lower when schemas are migrated alongside their tests

---

## 9. Go/No-Go Verdict

### GO -- with phased approach

| Question | Answer |
|----------|--------|
| Can Zod and Schema coexist? | **Yes.** No conflicts. Types are structurally compatible. |
| Can Schema decode the same shapes? | **Yes.** All 30 schemas have direct equivalents (see Section 3). |
| Migration path? | **Incremental.** Adapter first (30 min), then schema-by-schema. |
| Error channel integration? | **Major win.** `ParseError` is a tagged error; `catchTag` just works. |
| Features beyond Zod? | **Bidirectional encoding, annotations, JSON Schema, Arbitrary generation, class-based schemas.** |
| Bundle impact? | **Net negative.** Schema is included in `effect`; removing Zod saves 8-14 KB. |
| Bridge packages? | **`@zod-plugin/effect` exists** but not needed for our small codebase. |

### Recommended Action

1. **Now**: Create `schema-bridge.ts` adapter (Phase 2a) so Effect services can consume Zod-validated data through the error channel
2. **Next sprint**: Write new schemas in @effect/schema, keep Zod for existing `contracts.ts`
3. **When modifying contracts.ts**: Migrate touched schemas to @effect/schema
4. **Target**: Full Zod removal within 2-3 sprints of active X integration work

### Risks

- **Learning curve**: The pipe-based API (`Schema.String.pipe(Schema.minLength(1))`) is more verbose than Zod's chained API (`z.string().min(1)`). Team needs ~1 day to internalize.
- **Missing built-in validators**: Effect Schema lacks built-in email, URL format, IP address validators that Zod provides. Not relevant for our current X schemas, but may matter for future use cases.
- **Ecosystem maturity**: Zod has broader third-party ecosystem (form libraries, tRPC, etc.). Effect Schema integrations are growing but narrower.

---

## Sources

- [Effect Schema vs Zod -- Official Comparison (Effect-TS/effect repo)](https://github.com/Effect-TS/effect/blob/main/packages/effect/schema-vs-zod.md)
- [Effect Schema Getting Started](https://effect.website/docs/schema/getting-started/)
- [Effect Schema Basic Usage](https://effect.website/docs/schema/basic-usage/)
- [Effect Schema Error Formatters](https://effect.website/docs/schema/error-formatters/)
- [@zod-plugin/effect on npm](https://www.npmjs.com/package/@zod-plugin/effect)
- [Zod Plugin PR by colinhacks](https://github.com/colinhacks/zod/pull/3445)
- [Using Zod with Effect -- Effect Community Discussion](https://www.answeroverflow.com/m/1208136518707978291)
- [Schema vs Zod Benefits -- Effect Community](https://www.answeroverflow.com/m/1101258194354966550)
- [EffectPatterns -- Schema vs Zod Comparison](https://github.com/PaulJPhilp/EffectPatterns/blob/main/content/published/patterns/schema/getting-started/schema-vs-zod.mdx)
- [Zod v4 Release Notes](https://zod.dev/v4)
- [Schema Benchmarks](https://schemabenchmarks.dev/blog/welcome)
- [HN Discussion: Converting from Zod to Effect Schema](https://news.ycombinator.com/item?id=41791316)
- [Effect-TS Tree Shaking Discussion](https://github.com/Effect-TS/effect/issues/5317)
