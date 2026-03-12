/**
 * @module effect/errors
 *
 * Defines the error algebra for the application. Each error is a tagged class
 * (via `Data.TaggedError`) enabling exhaustive pattern matching in route
 * handlers via `Effect.catchTags`.
 *
 * Error hierarchy:
 * - ValidationError — invalid request input (maps to 400)
 * - RedisError — Redis operation failure (maps to 500, triggers fallback)
 * - EmailError — Resend API failure (maps to 502)
 * - UpstreamError — external HTTP API failure (maps to 502)
 * - AuthError — authentication/authorization failure (maps to 401/403)
 *
 * All errors carry a `message` field and an optional `cause` for chaining.
 */
import { Data } from "effect";

export class ValidationError extends Data.TaggedError("ValidationError")<{
  readonly message: string;
  readonly cause?: unknown;
}> {}

export class RedisError extends Data.TaggedError("RedisError")<{
  readonly message: string;
  readonly cause?: unknown;
}> {}

export class EmailError extends Data.TaggedError("EmailError")<{
  readonly message: string;
  readonly cause?: unknown;
}> {}

export class UpstreamError extends Data.TaggedError("UpstreamError")<{
  readonly message: string;
  readonly cause?: unknown;
}> {}

export class AuthError extends Data.TaggedError("AuthError")<{
  readonly message: string;
  readonly cause?: unknown;
}> {}

/** Union of all application errors for route handler signatures */
export type AppError =
  | ValidationError
  | RedisError
  | EmailError
  | UpstreamError
  | AuthError;
