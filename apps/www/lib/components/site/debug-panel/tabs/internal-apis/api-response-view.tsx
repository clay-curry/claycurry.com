"use client";

import { Badge } from "@/lib/components/ui/badge";
import type { InternalApiResponseState } from "./types";

type ApiResponseViewProps = {
  response: InternalApiResponseState | null;
  error: string | null;
};

export function ApiResponseView({ response, error }: ApiResponseViewProps) {
  if (!response && !error) {
    return (
      <div className="rounded-xl border border-dashed border-border/80 bg-muted/20 px-3 py-4 text-xs text-muted-foreground">
        Send a request to inspect the response here.
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-destructive/30 bg-destructive/10 px-3 py-4 text-xs text-destructive">
        {error}
      </div>
    );
  }

  if (!response) return null;

  return (
    <div className="space-y-3 rounded-xl border border-border/80 bg-muted/20 p-3">
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant={response.ok ? "default" : "destructive"}>
          {response.status} {response.statusText}
        </Badge>
        <Badge variant="outline">{response.durationMs}ms</Badge>
        <Badge variant="outline">{response.contentType || "unknown"}</Badge>
      </div>

      <div className="space-y-2 text-xs">
        <div>
          <p className="mb-1 font-medium text-foreground">Request</p>
          <pre className="overflow-x-auto rounded-lg border border-border/70 bg-background/80 p-2 text-[11px] whitespace-pre-wrap break-all">
            {JSON.stringify(response.request, null, 2)}
          </pre>
        </div>
        <div>
          <p className="mb-1 font-medium text-foreground">Response</p>
          <pre className="max-h-64 overflow-auto rounded-lg border border-border/70 bg-background/80 p-2 text-[11px] whitespace-pre-wrap break-all">
            {response.body}
          </pre>
        </div>
      </div>
    </div>
  );
}
