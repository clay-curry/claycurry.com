/**
 * @module services/Logger
 *
 * Structured logging service replacing all `console.error` sites with typed,
 * context-enriched log entries. In production, emits JSON to stdout for
 * structured log ingestion. In tests, collects entries into an array for
 * assertion.
 *
 * Integrates with Effect's built-in logging: this module configures a custom
 * `Logger` that emits structured JSON, and provides it as a Layer.
 *
 * @example
 * ```ts
 * yield* Effect.logInfo("View count incremented").pipe(
 *   Effect.annotateLogs({ slug: "my-post", count: 42 })
 * )
 * ```
 */
import { Layer, Logger, LogLevel } from "effect";

/**
 * Production logging Layer. Replaces Effect's default logger with a JSON
 * structured logger that writes to stdout. Each log entry includes timestamp,
 * level, message, and any annotations.
 */
export const LoggerLive = Layer.merge(
  Logger.replace(
    Logger.defaultLogger,
    Logger.make(({ logLevel, message, annotations, date }) => {
      const entry = {
        timestamp: date.toISOString(),
        level: logLevel.label,
        message: typeof message === "string" ? message : String(message),
        ...Object.fromEntries(annotations),
      };
      if (logLevel._tag === "Error" || logLevel._tag === "Fatal") {
        console.error(JSON.stringify(entry));
      } else {
        console.log(JSON.stringify(entry));
      }
    }),
  ),
  Logger.minimumLogLevel(LogLevel.Info),
);

/**
 * Test logging Layer. Suppresses all log output during tests.
 * Use `Logger.test` from Effect if you need to capture log entries.
 */
export const LoggerTest = Logger.replace(
  Logger.defaultLogger,
  Logger.make(() => {
    /* silent during tests */
  }),
);
