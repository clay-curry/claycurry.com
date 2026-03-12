import type { Span, SpanNode } from "./types";

/**
 * Build a tree of SpanNodes from a flat list of spans.
 * Supports multiple root spans (session-level traces).
 */
export function buildSpanTree(spans: Span[]): SpanNode[] {
  if (spans.length === 0) return [];

  const nodeMap = new Map<string, SpanNode>();
  const roots: SpanNode[] = [];

  // Create all nodes
  for (const span of spans) {
    nodeMap.set(span.spanId, { span, children: [] });
  }

  // Link parents
  for (const span of spans) {
    const node = nodeMap.get(span.spanId);
    if (!node) continue;

    if (span.parentSpanId) {
      const parent = nodeMap.get(span.parentSpanId);
      if (parent) {
        parent.children.push(node);
      } else {
        // Orphan: parent span was dropped or not in this trace
        roots.push(node);
      }
    } else {
      roots.push(node);
    }
  }

  // Sort children by startTime recursively
  function sortChildren(node: SpanNode) {
    node.children.sort(
      (a, b) => Date.parse(a.span.startTime) - Date.parse(b.span.startTime),
    );
    for (const child of node.children) {
      sortChildren(child);
    }
  }

  for (const root of roots) {
    sortChildren(root);
  }

  roots.sort(
    (a, b) => Date.parse(a.span.startTime) - Date.parse(b.span.startTime),
  );

  return roots;
}
