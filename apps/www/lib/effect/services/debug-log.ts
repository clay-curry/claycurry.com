import {
  Context,
  Effect,
  type FiberId,
  HashMap,
  Layer,
  List,
  Logger,
  type LogLevel,
  Ref,
} from "effect";
import type { SpanNode } from "@/lib/tracing";

// ============================================================
// Types
// ============================================================

export interface DebugLogEntry {
  timestamp: string;
  level: "DEBUG" | "INFO" | "WARN" | "ERROR";
  source: string;
  message: string;
  data?: Record<string, unknown>;
}

export interface DebugPayload {
  __debug: {
    durationMs: number;
    requestReceivedAt: string;
    logs: DebugLogEntry[];
    spans: SpanNode[];
    fiberId: string;
  };
}

// ============================================================
// DebugLogCollector Service
// ============================================================

export interface DebugLogCollectorService {
  readonly append: (entry: DebugLogEntry) => Effect.Effect<void>;
  readonly drain: () => Effect.Effect<DebugLogEntry[]>;
}

export class DebugLogCollector extends Context.Tag("DebugLogCollector")<
  DebugLogCollector,
  DebugLogCollectorService
>() {}

/** Creates a fresh collector layer scoped to a single request. */
export const DebugLogCollectorLive: Layer.Layer<DebugLogCollector> =
  Layer.effect(
    DebugLogCollector,
    Effect.gen(function* () {
      const ref = yield* Ref.make<DebugLogEntry[]>([]);
      return {
        append: (entry: DebugLogEntry) =>
          Ref.update(ref, (logs) => [...logs, entry]),
        drain: () => Ref.get(ref),
      };
    }),
  );

// ============================================================
// Debug Logger Layer
// ============================================================

function mapLogLevel(level: LogLevel.LogLevel): DebugLogEntry["level"] {
  if (level._tag === "Error" || level._tag === "Fatal") return "ERROR";
  if (level._tag === "Warning") return "WARN";
  if (level._tag === "Debug" || level._tag === "Trace") return "DEBUG";
  return "INFO";
}

function serializeMessage(message: unknown): string {
  if (typeof message === "string") return message;
  try {
    return JSON.stringify(message);
  } catch {
    return String(message);
  }
}

/**
 * A Logger that intercepts all Effect.log* calls and writes entries
 * to the DebugLogCollector, while also forwarding to the default logger.
 */
export function makeDebugLoggerLayer(
  collector: DebugLogCollectorService,
): Layer.Layer<never> {
  const debugLogger = Logger.make<unknown, void>((options) => {
    // Forward to default logger first
    Logger.defaultLogger.log(options);

    // Extract span name from the log spans list
    const spanName = List.isCons(options.spans)
      ? options.spans.head.label
      : "root";

    // Convert annotations HashMap to a plain record
    const data: Record<string, unknown> = {};
    let hasData = false;
    HashMap.forEach(options.annotations, (value, key) => {
      data[key] = value;
      hasData = true;
    });

    const entry: DebugLogEntry = {
      timestamp: options.date.toISOString(),
      level: mapLogLevel(options.logLevel),
      source: spanName,
      message: serializeMessage(options.message),
      ...(hasData ? { data } : {}),
    };

    // Synchronously append — the Ref.update is safe to runSync
    // because it's a pure in-memory operation
    Effect.runSync(collector.append(entry));
  });

  return Logger.replace(Logger.defaultLogger, debugLogger);
}

/**
 * Formats a FiberId as a string for the debug payload.
 */
export function formatFiberId(fiberId: FiberId.FiberId): string {
  switch (fiberId._tag) {
    case "None":
      return "none";
    case "Runtime":
      return `fiber-${fiberId.id}`;
    case "Composite":
      return `${formatFiberId(fiberId.left)},${formatFiberId(fiberId.right)}`;
  }
}
