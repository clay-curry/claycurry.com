"use client";

import { renderDebugConsole } from "@/lib/debug-console";
import type { DebugPayload } from "@/lib/effect/services/debug-log";

/**
 * Check if debug mode is active via URL param or localStorage.
 */
function isDebugActive(): boolean {
  if (typeof window === "undefined") return false;
  if (new URLSearchParams(window.location.search).get("debug") === "1") {
    return true;
  }
  try {
    if (localStorage.getItem("tron-debug") === "1") return true;
  } catch {
    // localStorage may be unavailable
  }
  return false;
}

/**
 * Append `debug=1` to a URL string.
 */
function appendDebugParam(input: string | URL): string {
  const url = new URL(input, window.location.origin);
  url.searchParams.set("debug", "1");
  return url.toString();
}

/**
 * A drop-in replacement for `fetch()` that, when debug mode is active,
 * appends `?debug=1` to the request, extracts the `__debug` payload from
 * the response, renders it to the console, and strips it from the body
 * so callers are unaffected.
 */
export async function debugFetch(
  input: RequestInfo | URL,
  init?: RequestInit,
): Promise<Response> {
  if (!isDebugActive()) {
    return fetch(input, init);
  }

  // Determine method and URL for console display
  const method = (init?.method ?? "GET").toUpperCase();
  const urlStr =
    typeof input === "string"
      ? input
      : input instanceof URL
        ? input.toString()
        : input.url;

  const debugUrl = appendDebugParam(urlStr);
  const startTime = performance.now();

  const response = await fetch(debugUrl, init);

  const clientMs = Math.round(performance.now() - startTime);
  const contentType = response.headers.get("content-type") ?? "";

  // Handle X-Debug header for non-JSON responses
  const xDebugHeader = response.headers.get("X-Debug");
  if (xDebugHeader && !contentType.includes("application/json")) {
    try {
      const debugData = JSON.parse(atob(xDebugHeader));
      renderDebugConsole(
        method,
        urlStr,
        response.status,
        clientMs,
        null,
        debugData,
      );
    } catch {
      // Silently skip if decoding fails
    }
    return response;
  }

  // For JSON responses, extract __debug and return a clean response
  if (contentType.includes("application/json")) {
    const clonedResponse = response.clone();
    try {
      const json = await clonedResponse.json();
      const debugPayload = json.__debug as DebugPayload["__debug"] | undefined;

      if (debugPayload) {
        // Strip __debug from the body for the caller
        const { __debug: _, ...cleanBody } = json;

        renderDebugConsole(
          method,
          urlStr,
          response.status,
          clientMs,
          cleanBody,
          debugPayload,
        );

        // Return a new Response with the clean body
        return new Response(JSON.stringify(cleanBody), {
          status: response.status,
          statusText: response.statusText,
          headers: response.headers,
        });
      }
    } catch {
      // If JSON parsing fails, return the original response
    }
  }

  return response;
}
