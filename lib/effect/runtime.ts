import { Layer, ManagedRuntime } from "effect";
import { globalValue } from "effect/GlobalValue";
import { RedisLayer } from "./services/redis";

const AppLive = Layer.mergeAll(RedisLayer);

export const appRuntime = globalValue(
  Symbol.for("claycurry.com/appRuntime"),
  () => {
    const runtime = ManagedRuntime.make(AppLive);

    if (typeof process !== "undefined") {
      process.on("SIGTERM", () => {
        runtime.dispose().catch(() => {});
      });
    }

    return runtime;
  },
);
