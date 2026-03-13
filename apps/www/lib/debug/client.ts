"use client";

import type { DebugPayload } from "./service";

export function isDebugMode(): boolean {
  if (typeof window === "undefined") return false;

  const params = new URLSearchParams(window.location.search);
  if (params.get("debug") === "1") return true;

  try {
    if (localStorage.getItem("debug") === "1") return true;
  } catch {
    // localStorage may be unavailable
  }

  return false;
}

export function renderDebugToConsole(debug: DebugPayload): void {
  const label = `[debug] ${debug.route} ${debug.durationMs}ms`;

  console.groupCollapsed(`%c${label}`, "color: #0ff; font-weight: bold;");

  for (const entry of debug.logs) {
    const method =
      entry.level === "error"
        ? "error"
        : entry.level === "warn"
          ? "warn"
          : "log";
    if (entry.attrs && Object.keys(entry.attrs).length > 0) {
      console[method](entry.msg, entry.attrs);
    } else {
      console[method](entry.msg);
    }
  }

  for (const span of debug.spans) {
    const style =
      span.status === "error"
        ? "color: #f44; font-weight: bold;"
        : "color: #8f8;";
    console.log(`%cspan: ${span.name}`, style, {
      duration: span.durationMs !== null ? `${span.durationMs}ms` : "n/a",
      status: span.status,
      ...(span.attrs && Object.keys(span.attrs).length > 0
        ? { attrs: span.attrs }
        : {}),
    });
  }

  console.groupEnd();
}

export async function debugFetch(
  input: string | URL | Request,
  init?: RequestInit,
): Promise<Response> {
  const debug = isDebugMode();

  if (!debug) {
    return fetch(input, init);
  }

  const headers = new Headers(init?.headers);
  headers.set("X-Debug", "1");
  const augmentedInit = { ...init, headers };

  const response = await fetch(input, augmentedInit);

  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) {
    const headerPayload = response.headers.get("X-Debug-Log");
    if (headerPayload) {
      try {
        const payload = JSON.parse(atob(headerPayload)) as DebugPayload;
        renderDebugToConsole(payload);
      } catch {
        /* ignore malformed debug header */
      }
    }
    return response;
  }

  const body = await response.clone().json();

  if (!body.__debug) {
    return response;
  }

  const { __debug, ...cleanBody } = body;
  renderDebugToConsole(__debug as DebugPayload);

  return new Response(JSON.stringify(cleanBody), {
    status: response.status,
    statusText: response.statusText,
    headers: response.headers,
  });
}
