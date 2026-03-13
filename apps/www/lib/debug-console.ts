import type { DebugPayload } from "@/lib/effect/services/debug-log";

type DebugLevel = "DEBUG" | "INFO" | "WARN" | "ERROR";

const LEVEL_COLORS: Record<DebugLevel, string> = {
  DEBUG: "color: #6b7280; font-weight: bold",
  INFO: "color: #22d3ee; font-weight: bold",
  WARN: "color: #f59e0b; font-weight: bold",
  ERROR: "color: #ef4444; font-weight: bold",
};

const SOURCE_STYLE = "color: #a78bfa";
const DIM_STYLE = "color: #6b7280";
const RESET_STYLE = "color: inherit";
const BOLD_STYLE = "font-weight: bold";
const SUCCESS_STYLE = "color: #22c55e; font-weight: bold";
const ERROR_STATUS_STYLE = "color: #ef4444; font-weight: bold";

interface SpanNode {
  span: {
    name: string;
    durationMs: number | null;
    status: "ok" | "error";
  };
  children: SpanNode[];
}

/**
 * Render debug payload to the browser console with grouped, color-coded output.
 */
export function renderDebugConsole(
  method: string,
  url: string,
  status: number,
  clientMs: number,
  body: unknown,
  debug: DebugPayload["__debug"],
): void {
  const headerStyle = status < 400 ? SUCCESS_STYLE : ERROR_STATUS_STYLE;
  const statusText = status < 400 ? "OK" : "ERR";

  // Top-level group header
  console.group(
    `%c${method} ${url} %c· ${clientMs}ms · %c${status} ${statusText}`,
    `${BOLD_STYLE}; color: #22d3ee`,
    DIM_STYLE,
    headerStyle,
  );

  // Request section
  renderRequestSection(method, url);

  // Server Logs section
  if (debug.logs.length > 0) {
    renderLogsSection(debug.logs);
  }

  // Spans section
  if (debug.spans.length > 0) {
    renderSpansSection(debug.spans);
  }

  // Response section
  renderResponseSection(status, body, clientMs, debug.durationMs);

  console.groupEnd();
}

function renderRequestSection(method: string, url: string): void {
  console.group("%cRequest", BOLD_STYLE);
  console.log(`%cmethod: %c${method}`, DIM_STYLE, RESET_STYLE);
  console.log(`%curl: %c${url}`, DIM_STYLE, RESET_STYLE);
  console.log(
    `%ctimestamp: %c${new Date().toLocaleTimeString()}`,
    DIM_STYLE,
    RESET_STYLE,
  );
  console.groupEnd();
}

function renderLogsSection(logs: DebugPayload["__debug"]["logs"]): void {
  console.group(`%cServer Logs (${logs.length} entries)`, BOLD_STYLE);

  for (const entry of logs) {
    const time = new Date(entry.timestamp).toLocaleTimeString(undefined, {
      hour12: false,
      fractionalSecondDigits: 3,
    });

    const levelStyle = LEVEL_COLORS[entry.level] || RESET_STYLE;
    const dataStr = entry.data
      ? `  ${Object.entries(entry.data)
          .map(([k, v]) => `${k}=${JSON.stringify(v)}`)
          .join(" ")}`
      : "";

    console.log(
      `%c${time}  %c${entry.level.padEnd(5)}  %c[${entry.source}]  %c${entry.message}%c${dataStr}`,
      DIM_STYLE,
      levelStyle,
      SOURCE_STYLE,
      RESET_STYLE,
      DIM_STYLE,
    );
  }

  console.groupEnd();
}

function renderSpansSection(spans: SpanNode[]): void {
  const totalSpans = countSpans(spans);
  console.group(`%cSpans (${totalSpans})`, BOLD_STYLE);

  for (let i = 0; i < spans.length; i++) {
    const isLast = i === spans.length - 1;
    renderSpanNode(spans[i], "", isLast);
  }

  console.groupEnd();
}

function renderSpanNode(node: SpanNode, prefix: string, isLast: boolean): void {
  const connector = isLast ? "└─" : "├─";
  const duration =
    node.span.durationMs !== null ? `${node.span.durationMs}ms` : "?ms";
  const statusIcon = node.span.status === "ok" ? "✓" : "✗";
  const statusStyle =
    node.span.status === "ok" ? SUCCESS_STYLE : ERROR_STATUS_STYLE;

  // Pad name with dots for alignment
  const nameWidth = 40 - prefix.length;
  const paddedName = node.span.name.padEnd(nameWidth, " ·");

  console.log(
    `%c${prefix}${connector} ${paddedName} %c${duration}  %c${statusIcon}`,
    DIM_STYLE,
    RESET_STYLE,
    statusStyle,
  );

  const childPrefix = prefix + (isLast ? "   " : "│  ");
  for (let i = 0; i < node.children.length; i++) {
    const childIsLast = i === node.children.length - 1;
    renderSpanNode(node.children[i], childPrefix, childIsLast);
  }
}

function countSpans(nodes: SpanNode[]): number {
  let count = 0;
  for (const node of nodes) {
    count += 1 + countSpans(node.children);
  }
  return count;
}

function renderResponseSection(
  status: number,
  body: unknown,
  clientMs: number,
  serverMs: number,
): void {
  const statusStyle = status < 400 ? SUCCESS_STYLE : ERROR_STATUS_STYLE;

  console.group("%cResponse", BOLD_STYLE);
  console.log(`%cstatus: %c${status}`, DIM_STYLE, statusStyle);

  // Truncate body preview
  const bodyStr = JSON.stringify(body);
  const preview = bodyStr.length > 500 ? `${bodyStr.slice(0, 500)}…` : bodyStr;
  console.log(`%cbody: %c${preview}`, DIM_STYLE, RESET_STYLE);
  console.log(
    `%cduration: %c${clientMs}ms (network) / ${serverMs}ms (server)`,
    DIM_STYLE,
    RESET_STYLE,
  );
  console.groupEnd();
}
