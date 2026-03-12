"use client";

import dynamic from "next/dynamic";

const TracePanel = dynamic(
  () => import("./TracePanel").then((m) => m.TracePanel),
  { ssr: false },
);

export function TracePanelLoader() {
  return <TracePanel />;
}
