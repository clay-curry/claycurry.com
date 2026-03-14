"use client";

import { AlertTriangle, Play, RotateCcw } from "lucide-react";
import { useState } from "react";
import { Badge } from "@/lib/components/ui/badge";
import { Button } from "@/lib/components/ui/button";
import { Input } from "@/lib/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/lib/components/ui/select";
import { Switch } from "@/lib/components/ui/switch";
import { Textarea } from "@/lib/components/ui/textarea";
import { cn } from "@/lib/utils";
import { ApiResponseView } from "./api-response-view";
import type {
  InternalApiDescriptor,
  InternalApiField,
  InternalApiFormValues,
  InternalApiResponseState,
} from "./types";

function buildDefaultValues(fields: InternalApiField[]): InternalApiFormValues {
  return Object.fromEntries(
    fields.map((field) => [
      field.name,
      field.type === "switch"
        ? (field.defaultValue ?? false)
        : (field.defaultValue ?? ""),
    ]),
  );
}

function formatRequestBody(body: unknown) {
  if (body === undefined) return undefined;
  return JSON.stringify(body, null, 2);
}

function formatResponseBody(body: string, contentType: string) {
  if (!body.trim()) {
    return "(empty response body)";
  }

  if (contentType.includes("application/json")) {
    try {
      return JSON.stringify(JSON.parse(body), null, 2);
    } catch {
      return body;
    }
  }

  return body;
}

function getRequiredFieldError(
  fields: InternalApiField[],
  values: InternalApiFormValues,
) {
  for (const field of fields) {
    if (!field.required) continue;

    const value = values[field.name];
    if (typeof value === "boolean") continue;
    if (!value.trim()) {
      return `${field.label} is required.`;
    }
  }

  return null;
}

function FieldInput({
  field,
  value,
  onChange,
}: {
  field: InternalApiField;
  value: string | boolean;
  onChange: (nextValue: string | boolean) => void;
}) {
  if (field.type === "switch") {
    return (
      <div className="flex items-center justify-between gap-3 rounded-lg border border-border/70 bg-background/70 px-3 py-2">
        <div className="min-w-0">
          <p className="text-sm font-medium text-foreground">{field.label}</p>
          {field.description ? (
            <p className="text-xs text-muted-foreground">{field.description}</p>
          ) : null}
        </div>
        <Switch checked={value === true} onCheckedChange={onChange} />
      </div>
    );
  }

  if (field.type === "select") {
    return (
      <div className="space-y-1.5">
        <div>
          <p className="text-sm font-medium text-foreground">{field.label}</p>
          {field.description ? (
            <p className="text-xs text-muted-foreground">{field.description}</p>
          ) : null}
        </div>
        <Select value={String(value)} onValueChange={onChange}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="z-[10010]">
            {field.options.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    );
  }

  if (field.type === "textarea") {
    return (
      <div className="space-y-1.5">
        <div>
          <p className="text-sm font-medium text-foreground">{field.label}</p>
          {field.description ? (
            <p className="text-xs text-muted-foreground">{field.description}</p>
          ) : null}
        </div>
        <Textarea
          value={String(value)}
          onChange={(event) => onChange(event.target.value)}
          placeholder={field.placeholder}
          className="min-h-24"
        />
      </div>
    );
  }

  return (
    <div className="space-y-1.5">
      <div>
        <p className="text-sm font-medium text-foreground">{field.label}</p>
        {field.description ? (
          <p className="text-xs text-muted-foreground">{field.description}</p>
        ) : null}
      </div>
      <Input
        value={String(value)}
        onChange={(event) => onChange(event.target.value)}
        placeholder={field.placeholder}
      />
    </div>
  );
}

export function ApiRequestCard({
  descriptor,
  variant = "default",
}: {
  descriptor: InternalApiDescriptor;
  variant?: "default" | "embedded";
}) {
  const isEmbedded = variant === "embedded";
  const [values, setValues] = useState<InternalApiFormValues>(() =>
    buildDefaultValues(descriptor.fields),
  );
  const [response, setResponse] = useState<InternalApiResponseState | null>(
    null,
  );
  const [error, setError] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);

  const handleFieldChange = (name: string, nextValue: string | boolean) => {
    setValues((current) => ({
      ...current,
      [name]: nextValue,
    }));
  };

  const handleReset = () => {
    setValues(buildDefaultValues(descriptor.fields));
    setResponse(null);
    setError(null);
  };

  const handleSend = async () => {
    const requiredFieldError = getRequiredFieldError(descriptor.fields, values);
    if (requiredFieldError) {
      setError(requiredFieldError);
      setResponse(null);
      return;
    }

    setError(null);
    setIsSending(true);

    try {
      const request = descriptor.buildRequest(values);
      const startedAt = performance.now();
      const fetchResponse = await fetch(request.url, request.init);
      const durationMs = Math.round(performance.now() - startedAt);
      const contentType = fetchResponse.headers.get("content-type") ?? "";
      const rawBody = await fetchResponse.text();

      setResponse({
        request: {
          method: descriptor.method,
          url: request.url,
          headers: request.headersPreview,
          body: formatRequestBody(request.bodyPreview),
        },
        ok: fetchResponse.ok,
        status: fetchResponse.status,
        statusText: fetchResponse.statusText,
        durationMs,
        contentType,
        body: formatResponseBody(rawBody, contentType),
      });
    } catch (caughtError) {
      setResponse(null);
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Request failed with an unknown error.",
      );
    } finally {
      setIsSending(false);
    }
  };

  return (
    <section
      className={cn(
        isEmbedded
          ? ""
          : "rounded-2xl border border-border/80 bg-background/70 p-4 shadow-sm",
      )}
    >
      {!isEmbedded ? (
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <Badge
                variant={descriptor.method === "POST" ? "default" : "outline"}
              >
                {descriptor.method}
              </Badge>
              <h3 className="text-sm font-semibold text-foreground">
                {descriptor.label}
              </h3>
            </div>
            <p className="text-xs text-muted-foreground">
              {descriptor.description}
            </p>
          </div>
        </div>
      ) : null}

      <div className={cn(isEmbedded ? "space-y-4" : "")}>
        {descriptor.warning ? (
          <div
            className={cn(
              !isEmbedded && "mt-3",
              "flex items-start gap-2 rounded-xl border border-amber-500/25 bg-amber-500/10 px-3 py-2 text-xs text-amber-700 dark:text-amber-200",
            )}
          >
            <AlertTriangle className="mt-0.5 size-3.5 shrink-0" />
            <p>{descriptor.warning}</p>
          </div>
        ) : null}

        {descriptor.disabledReason ? (
          <div
            className={cn(
              !isEmbedded && "mt-3",
              "rounded-xl border border-dashed border-border/80 bg-muted/20 px-3 py-4 text-xs text-muted-foreground",
            )}
          >
            {descriptor.disabledReason}
          </div>
        ) : (
          <>
            {descriptor.fields.length > 0 ? (
              <div
                className={cn(
                  !isEmbedded && "mt-3",
                  "grid gap-3",
                  descriptor.fields.length > 2 ? "lg:grid-cols-2" : "",
                )}
              >
                {descriptor.fields.map((field) => (
                  <FieldInput
                    key={field.name}
                    field={field}
                    value={values[field.name] ?? ""}
                    onChange={(nextValue) =>
                      handleFieldChange(field.name, nextValue)
                    }
                  />
                ))}
              </div>
            ) : null}

            <div
              className={cn(
                !isEmbedded && "mt-4",
                "flex flex-wrap items-center gap-2",
              )}
            >
              <Button
                onClick={handleSend}
                disabled={isSending}
                size="sm"
                className="min-w-24"
              >
                <Play className="size-3.5" />
                {isSending ? "Sending..." : "Send"}
              </Button>
              <Button onClick={handleReset} size="sm" variant="outline">
                <RotateCcw className="size-3.5" />
                Reset
              </Button>
            </div>
          </>
        )}

        <div className={cn(!isEmbedded && "mt-4")}>
          <ApiResponseView error={error} response={response} />
        </div>
      </div>
    </section>
  );
}
