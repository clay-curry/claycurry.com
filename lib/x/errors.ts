import { Data } from "effect";
import type {
  IntegrationIssue,
  IntegrationIssueCode,
  TokenHealthStatus,
} from "./contracts";

// ============================================================
// Tagged Errors — one per IntegrationIssueCode
// ============================================================

export class ReauthRequired extends Data.TaggedError("ReauthRequired")<{
  readonly message: string;
  readonly tokenStatus?: TokenHealthStatus;
  readonly cause?: unknown;
}> {}

export class Misconfigured extends Data.TaggedError("Misconfigured")<{
  readonly message: string;
  readonly tokenStatus?: TokenHealthStatus;
  readonly cause?: unknown;
}> {}

export class OwnerMismatch extends Data.TaggedError("OwnerMismatch")<{
  readonly message: string;
  readonly tokenStatus?: TokenHealthStatus;
  readonly cause?: unknown;
}> {}

export class SchemaInvalid extends Data.TaggedError("SchemaInvalid")<{
  readonly message: string;
  readonly tokenStatus?: TokenHealthStatus;
  readonly cause?: unknown;
}> {}

export class UpstreamError extends Data.TaggedError("UpstreamError")<{
  readonly message: string;
  readonly tokenStatus?: TokenHealthStatus;
  readonly cause?: unknown;
}> {}

export class CacheStale extends Data.TaggedError("CacheStale")<{
  readonly message: string;
  readonly tokenStatus?: TokenHealthStatus;
  readonly cause?: unknown;
}> {}

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

export function toIntegrationIssue(error: unknown): IntegrationIssue {
  const normalized = toXError(error);
  return {
    code: errorCode(normalized),
    message: normalized.message,
  };
}
