/**
 * Tagged error hierarchy for X integration failures, built on Effect's
 * `Data.TaggedError`.
 *
 * Each error class corresponds to one `IntegrationIssueCode` and carries a
 * discriminant `_tag` that enables exhaustive pattern matching with
 * `Effect.catchTag`. The module also provides:
 *
 * - `xError()` — factory that constructs the correct tagged error from a
 *   runtime code string.
 * - `errorCode()` / `toXError()` / `toIntegrationIssue()` — converters for
 *   normalizing unknown errors into the domain hierarchy.
 *
 * @see https://effect.website/docs/data-types/data/#taggederror
 * @module
 */
import { Data } from "effect";
import type {
  IntegrationIssue,
  IntegrationIssueCode,
  TokenHealthStatus,
} from "./contracts";

// ============================================================
// Tagged Errors — one per IntegrationIssueCode
// ============================================================

/**
 * The stored OAuth token is missing, expired, or rejected by X.
 * The user must re-run the OAuth setup flow.
 */
export class ReauthRequired extends Data.TaggedError("ReauthRequired")<{
  readonly message: string;
  readonly tokenStatus?: TokenHealthStatus;
  readonly cause?: unknown;
}> {}

/**
 * Required environment variables (OAuth credentials) are missing or empty.
 * Live sync cannot proceed until the environment is corrected.
 */
export class Misconfigured extends Data.TaggedError("Misconfigured")<{
  readonly message: string;
  readonly tokenStatus?: TokenHealthStatus;
  readonly cause?: unknown;
}> {}

/**
 * The authenticated X account does not match the configured owner username
 * (`X_OWNER_USERNAME`). Typically means OAuth was completed while signed
 * into the wrong X account.
 */
export class OwnerMismatch extends Data.TaggedError("OwnerMismatch")<{
  readonly message: string;
  readonly tokenStatus?: TokenHealthStatus;
  readonly cause?: unknown;
}> {}

/**
 * An X API response did not match the expected Effect Schema. May indicate
 * an upstream API change or malformed data.
 */
export class SchemaInvalid extends Data.TaggedError("SchemaInvalid")<{
  readonly message: string;
  readonly tokenStatus?: TokenHealthStatus;
  readonly cause?: unknown;
}> {}

/**
 * The X API returned a non-success HTTP status (other than 401/403) or
 * the network request itself failed.
 */
export class UpstreamError extends Data.TaggedError("UpstreamError")<{
  readonly message: string;
  readonly tokenStatus?: TokenHealthStatus;
  readonly cause?: unknown;
}> {}

/**
 * A live sync was needed but failed, and the existing cached snapshot
 * is past its freshness window. The stale data may still be served
 * as a degraded fallback.
 */
export class CacheStale extends Data.TaggedError("CacheStale")<{
  readonly message: string;
  readonly tokenStatus?: TokenHealthStatus;
  readonly cause?: unknown;
}> {}

/** Union of all X integration tagged errors. */
export type XError =
  | Misconfigured
  | ReauthRequired
  | OwnerMismatch
  | SchemaInvalid
  | UpstreamError
  | CacheStale;

// ============================================================
// Factory — create the right tagged error from a code string
// ============================================================

/**
 * Factory that constructs the correct tagged error subclass from a runtime
 * `IntegrationIssueCode` string. Useful when the error type is determined
 * dynamically (e.g. from a stored status record).
 * @param code - The integration issue code to map.
 * @param message - Human-readable error description.
 * @param options.cause - Original error for chaining.
 * @param options.tokenStatus - Current token health at the time of failure.
 */
export function xError(
  code: IntegrationIssueCode,
  message: string,
  options?: { cause?: unknown; tokenStatus?: TokenHealthStatus },
): XError {
  const props = {
    message,
    tokenStatus: options?.tokenStatus,
    cause: options?.cause,
  };
  switch (code) {
    case "misconfigured":
      return new Misconfigured(props);
    case "reauth_required":
      return new ReauthRequired(props);
    case "owner_mismatch":
      return new OwnerMismatch(props);
    case "schema_invalid":
      return new SchemaInvalid(props);
    case "upstream_error":
      return new UpstreamError(props);
    case "cache_stale":
      return new CacheStale(props);
  }
}

// ============================================================
// Helpers — normalizing unknown errors
// ============================================================

/** Extract the IntegrationIssueCode from an XError */
export function errorCode(error: XError): IntegrationIssueCode {
  switch (error._tag) {
    case "Misconfigured":
      return "misconfigured";
    case "ReauthRequired":
      return "reauth_required";
    case "OwnerMismatch":
      return "owner_mismatch";
    case "SchemaInvalid":
      return "schema_invalid";
    case "UpstreamError":
      return "upstream_error";
    case "CacheStale":
      return "cache_stale";
  }
}

/**
 * Normalizes an unknown thrown value into a typed `XError`. If the value
 * is already an `XError` instance it is returned as-is; otherwise it is
 * wrapped with the given fallback code (defaults to `"upstream_error"`).
 * @param error - The unknown error to normalize.
 * @param fallbackCode - Code to use when `error` is not an `XError`.
 */
export function toXError(
  error: unknown,
  fallbackCode: IntegrationIssueCode = "upstream_error",
): XError {
  if (
    error instanceof Misconfigured ||
    error instanceof ReauthRequired ||
    error instanceof OwnerMismatch ||
    error instanceof SchemaInvalid ||
    error instanceof UpstreamError ||
    error instanceof CacheStale
  ) {
    return error;
  }

  if (error instanceof Error) {
    return xError(fallbackCode, error.message, { cause: error });
  }

  return xError(fallbackCode, "Unknown X integration error");
}

/**
 * Converts any error into an `IntegrationIssue` (code + message pair)
 * suitable for serialization in API responses and status records.
 */
export function toIntegrationIssue(error: unknown): IntegrationIssue {
  const normalized = toXError(error);
  return {
    code: errorCode(normalized),
    message: normalized.message,
  };
}
