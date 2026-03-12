/**
 * @module effect/runtime
 *
 * Assembles the production Layer stack and provides a ManagedRuntime for
 * running Effect programs in API route handlers.
 *
 * The runtime is a singleton — it is created once when the module is first
 * imported and reused across all requests. This avoids the overhead of
 * reconstructing Layers on every request while still allowing request-scoped
 * services (like TracingService) to be provided per-request in the handler.
 *
 * Layer composition:
 *   AppLive = RedisLive + EmailLive + LoggerLive
 *
 * TracingService is intentionally NOT in the global runtime — it is
 * request-scoped and provided per-request in `runRouteHandler`.
 *
 * @see handler.ts for how this runtime is used in route handlers
 */
import type { Layer as L } from "effect";
import { Layer, ManagedRuntime } from "effect";
import { EmailLive } from "@/lib/services/Email";
import { LoggerLive } from "@/lib/services/Logger";
import { RedisLive } from "@/lib/services/Redis";

/**
 * The production Layer stack. All long-lived services (Redis connections,
 * email client, logger configuration) are composed here.
 */
export const AppLive = Layer.mergeAll(RedisLive, EmailLive, LoggerLive);

/** The set of services provided by the production runtime */
export type AppRequirements = L.Layer.Success<typeof AppLive>;

/**
 * The production ManagedRuntime. Created lazily on first import.
 * Route handlers use this via `runRouteHandler`.
 */
export const appRuntime = ManagedRuntime.make(AppLive);
