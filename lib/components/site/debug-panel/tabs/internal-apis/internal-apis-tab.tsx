"use client";

import { AlertTriangle } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/lib/components/ui/accordion";
import { Badge } from "@/lib/components/ui/badge";
import type { DebugPanelTabProps } from "../../types";
import { ApiRequestCard } from "./api-request-card";
import { getInternalApiDescriptors } from "./descriptors";

export function InternalApisTab({
  bookmarksSource,
  mockMode,
}: DebugPanelTabProps) {
  const descriptors = getInternalApiDescriptors(mockMode, bookmarksSource);

  return (
    <div className="space-y-4">
      <div className="space-y-1">
        <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-muted-foreground">
          Internal API workbench
        </p>
        <p className="text-sm text-muted-foreground">
          Every request is explicit and only runs when you click Send. Use the
          per-endpoint fields to test the route with your own arguments.
        </p>
      </div>

      <Accordion type="single" collapsible className="space-y-4">
        {descriptors.map((descriptor) => (
          <AccordionItem
            key={`${descriptor.id}:${descriptor.defaultsKey}`}
            value={descriptor.id}
            className="overflow-hidden rounded-2xl border border-border/80 bg-background/70 px-4 shadow-sm"
          >
            <AccordionTrigger className="py-3 text-left hover:no-underline">
              <div className="min-w-0 space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge
                    variant={
                      descriptor.method === "POST" ? "default" : "outline"
                    }
                  >
                    {descriptor.method}
                  </Badge>
                  <span className="text-sm font-semibold text-foreground">
                    {descriptor.label}
                  </span>
                  {descriptor.disabledReason ? (
                    <Badge variant="outline">Disabled</Badge>
                  ) : null}
                  {descriptor.warning ? (
                    <Badge
                      variant="outline"
                      className="border-amber-500/30 text-amber-700 dark:text-amber-200"
                    >
                      Warning
                    </Badge>
                  ) : null}
                </div>
                <p className="text-xs text-muted-foreground">
                  {descriptor.description}
                </p>
                {descriptor.disabledReason ? (
                  <p className="text-[11px] text-muted-foreground">
                    {descriptor.disabledReason}
                  </p>
                ) : null}
                {descriptor.warning ? (
                  <p className="flex items-start gap-1.5 text-[11px] text-amber-700 dark:text-amber-200">
                    <AlertTriangle className="mt-0.5 size-3 shrink-0" />
                    <span>{descriptor.warning}</span>
                  </p>
                ) : null}
              </div>
            </AccordionTrigger>
            <AccordionContent className="pb-4">
              <ApiRequestCard descriptor={descriptor} variant="embedded" />
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
}
