"use client";

import {
  AlertTriangle,
  CheckCircle2,
  LoaderCircle,
  RefreshCcw,
  ShieldAlert,
  ShieldCheck,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/lib/components/ui/alert";
import { Badge } from "@/lib/components/ui/badge";
import { Button } from "@/lib/components/ui/button";
import { cn } from "@/lib/utils";
import type {
  XCredentialCheck,
  XCredentialDiagnostics,
  XCredentialSummaryStatus,
  XCredentialValidationResult,
  XCredentialVariable,
} from "@/lib/x/diagnostics";
import type { DebugPanelTabProps } from "../types";

function formatTimestamp(value: string | null): string {
  if (!value) {
    return "Not available";
  }

  return new Date(value).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
  });
}

function formatOwner(
  value: { id: string | null; username: string } | null,
): string {
  if (!value) {
    return "Not available";
  }

  return value.id ? `@${value.username} (${value.id})` : `@${value.username}`;
}

function formatCheckTone(status: XCredentialCheck["status"]) {
  switch (status) {
    case "pass":
      return "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-200";
    case "warn":
      return "border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-200";
    case "fail":
      return "border-red-500/30 bg-red-500/10 text-red-700 dark:text-red-200";
  }
}

function formatSummaryTone(status: XCredentialSummaryStatus) {
  switch (status) {
    case "ready":
      return {
        badge:
          "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-200",
        icon: ShieldCheck,
      };
    case "warning":
      return {
        badge:
          "border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-200",
        icon: AlertTriangle,
      };
    case "action_required":
      return {
        badge: "border-red-500/30 bg-red-500/10 text-red-700 dark:text-red-200",
        icon: ShieldAlert,
      };
  }
}

function formatVariableSource(variable: XCredentialVariable): string {
  switch (variable.source) {
    case "env":
      return "loaded";
    case "missing":
      return "missing";
    case "unset":
      return "unset";
  }
}

function VariableRow({ variable }: { variable: XCredentialVariable }) {
  const sourceLabel = formatVariableSource(variable);

  return (
    <div className="rounded-xl border border-border/70 bg-background/70 px-3 py-3">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="space-y-1">
          <p className="text-sm font-medium text-foreground">{variable.key}</p>
          <p className="text-xs text-muted-foreground">{variable.detail}</p>
          {!variable.isSecret && variable.value ? (
            <p className="text-[11px] text-muted-foreground">
              effective value:{" "}
              <span className="font-medium">{variable.value}</span>
            </p>
          ) : null}
        </div>
        <Badge
          variant="outline"
          className={cn(
            "capitalize",
            variable.source === "missing"
              ? "border-red-500/30 text-red-700 dark:text-red-200"
              : "border-border/80",
          )}
        >
          {sourceLabel}
        </Badge>
      </div>
    </div>
  );
}

function CheckList({ checks }: { checks: XCredentialCheck[] }) {
  return (
    <div className="grid gap-2">
      {checks.map((check) => (
        <div
          key={check.id}
          className={cn(
            "rounded-xl border px-3 py-3",
            formatCheckTone(check.status),
          )}
        >
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-xs font-semibold uppercase tracking-[0.18em]">
              {check.label}
            </p>
            <Badge variant="outline" className="capitalize">
              {check.status}
            </Badge>
          </div>
          <p className="mt-1 text-sm">{check.message}</p>
        </div>
      ))}
    </div>
  );
}

function NextSteps({ steps }: { steps: string[] }) {
  if (steps.length === 0) {
    return null;
  }

  return (
    <div className="space-y-2">
      <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-muted-foreground">
        Next steps
      </p>
      <ul className="space-y-2 text-sm text-muted-foreground">
        {steps.map((step) => (
          <li
            key={step}
            className="rounded-lg border border-border/60 bg-muted/20 px-3 py-2"
          >
            {step}
          </li>
        ))}
      </ul>
    </div>
  );
}

function RuntimeRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-border/70 bg-background/70 px-3 py-2.5">
      <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
        {label}
      </p>
      <p className="text-sm text-foreground">{value}</p>
    </div>
  );
}

function ValidationSummary({
  result,
}: {
  result: XCredentialValidationResult;
}) {
  const isValid = result.status === "valid";

  return (
    <div className="space-y-3 rounded-2xl border border-border/80 bg-background/70 p-4 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <Badge
              variant="outline"
              className={cn(
                isValid
                  ? "border-emerald-500/30 text-emerald-700 dark:text-emerald-200"
                  : "border-red-500/30 text-red-700 dark:text-red-200",
              )}
            >
              {result.status}
            </Badge>
            <span className="text-sm font-semibold text-foreground">
              Live validation
            </span>
          </div>
          <p className="text-sm text-muted-foreground">{result.message}</p>
        </div>
        <p className="text-[11px] text-muted-foreground">
          checked {formatTimestamp(result.checkedAt)}
        </p>
      </div>

      <div className="grid gap-2">
        <RuntimeRow label="token status" value={result.token.status} />
        <RuntimeRow
          label="token expires"
          value={formatTimestamp(result.token.expiresAt)}
        />
        <RuntimeRow
          label="authenticated owner"
          value={formatOwner(result.owner.authenticatedOwner)}
        />
        <RuntimeRow
          label="resolved owner"
          value={formatOwner(result.owner.resolvedOwner)}
        />
      </div>

      <CheckList checks={result.checks} />
      <NextSteps steps={result.nextSteps} />
    </div>
  );
}

export function CredentialsTab(_props: DebugPanelTabProps) {
  const [diagnostics, setDiagnostics] = useState<XCredentialDiagnostics | null>(
    null,
  );
  const [diagnosticsError, setDiagnosticsError] = useState<string | null>(null);
  const [isLoadingDiagnostics, setIsLoadingDiagnostics] = useState(true);
  const [validationResult, setValidationResult] =
    useState<XCredentialValidationResult | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [isValidating, setIsValidating] = useState(false);

  const loadDiagnostics = useCallback(async () => {
    setIsLoadingDiagnostics(true);
    setDiagnosticsError(null);

    try {
      const response = await fetch("/api/x/debug/credentials", {
        cache: "no-store",
      });
      const body = await response.json();

      if (!response.ok) {
        setDiagnostics(null);
        setDiagnosticsError(
          typeof body?.error === "string"
            ? body.error
            : "Failed to load X credential diagnostics.",
        );
        return;
      }

      setDiagnostics(body as XCredentialDiagnostics);
    } catch (error) {
      setDiagnostics(null);
      setDiagnosticsError(
        error instanceof Error
          ? error.message
          : "Failed to load X credential diagnostics.",
      );
    } finally {
      setIsLoadingDiagnostics(false);
    }
  }, []);

  useEffect(() => {
    loadDiagnostics();
  }, [loadDiagnostics]);

  const handleValidate = useCallback(async () => {
    setIsValidating(true);
    setValidationError(null);

    try {
      const response = await fetch("/api/x/debug/credentials/validate", {
        cache: "no-store",
        method: "POST",
      });
      const body = await response.json();

      if (!response.ok && typeof body?.status !== "string") {
        setValidationResult(null);
        setValidationError(
          typeof body?.error === "string"
            ? body.error
            : "Failed to validate X credentials.",
        );
        return;
      }

      setValidationResult(body as XCredentialValidationResult);
      await loadDiagnostics();
    } catch (error) {
      setValidationResult(null);
      setValidationError(
        error instanceof Error
          ? error.message
          : "Failed to validate X credentials.",
      );
    } finally {
      setIsValidating(false);
    }
  }, [loadDiagnostics]);

  if (isLoadingDiagnostics && !diagnostics) {
    return (
      <div className="flex min-h-40 items-center justify-center rounded-2xl border border-border/80 bg-background/70 text-sm text-muted-foreground">
        <LoaderCircle className="mr-2 size-4 animate-spin" />
        Loading X credential diagnostics...
      </div>
    );
  }

  if (!diagnostics) {
    return (
      <Alert className="border-red-500/30 bg-red-500/10 text-red-700 dark:text-red-200">
        <ShieldAlert className="size-4" />
        <AlertTitle>Diagnostics unavailable</AlertTitle>
        <AlertDescription>
          <p>
            {diagnosticsError ?? "Failed to load X credential diagnostics."}
          </p>
        </AlertDescription>
      </Alert>
    );
  }

  const summaryTone = formatSummaryTone(diagnostics.summary.status);
  const SummaryIcon = summaryTone.icon;

  return (
    <div className="space-y-4">
      <section className="space-y-3 rounded-2xl border border-border/80 bg-background/70 p-4 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="outline" className={summaryTone.badge}>
                {diagnostics.summary.status.replace("_", " ")}
              </Badge>
              <span className="text-sm font-semibold text-foreground">
                Overall summary
              </span>
            </div>
            <div className="flex items-start gap-2">
              <SummaryIcon
                className={cn(
                  "mt-0.5 size-4 shrink-0",
                  diagnostics.summary.status === "ready"
                    ? "text-emerald-600 dark:text-emerald-300"
                    : diagnostics.summary.status === "warning"
                      ? "text-amber-600 dark:text-amber-300"
                      : "text-red-600 dark:text-red-300",
                )}
              />
              <p className="text-sm text-muted-foreground">
                {diagnostics.summary.message}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button
              onClick={loadDiagnostics}
              size="sm"
              variant="outline"
              disabled={isLoadingDiagnostics}
            >
              <RefreshCcw
                className={cn(
                  "size-3.5",
                  isLoadingDiagnostics && "animate-spin",
                )}
              />
              Refresh
            </Button>
            <Button onClick={handleValidate} size="sm" disabled={isValidating}>
              {isValidating ? (
                <LoaderCircle className="size-3.5 animate-spin" />
              ) : (
                <CheckCircle2 className="size-3.5" />
              )}
              Run live validation
            </Button>
          </div>
        </div>

        <div className="grid gap-2">
          <RuntimeRow
            label="diagnostics generated"
            value={formatTimestamp(diagnostics.generatedAt)}
          />
          <RuntimeRow
            label="runtime environment"
            value={
              diagnostics.environment.vercelEnv
                ? `${diagnostics.environment.vercelEnv} / ${diagnostics.environment.nodeEnv ?? "unknown"}`
                : (diagnostics.environment.nodeEnv ?? "unknown")
            }
          />
        </div>

        {diagnosticsError ? (
          <Alert className="border-red-500/30 bg-red-500/10 text-red-700 dark:text-red-200">
            <ShieldAlert className="size-4" />
            <AlertTitle>Refresh failed</AlertTitle>
            <AlertDescription>
              <p>{diagnosticsError}</p>
            </AlertDescription>
          </Alert>
        ) : null}

        {validationError ? (
          <Alert className="border-red-500/30 bg-red-500/10 text-red-700 dark:text-red-200">
            <ShieldAlert className="size-4" />
            <AlertTitle>Validation failed to run</AlertTitle>
            <AlertDescription>
              <p>{validationError}</p>
            </AlertDescription>
          </Alert>
        ) : null}

        <CheckList checks={diagnostics.checks} />
        <NextSteps steps={diagnostics.nextSteps} />
      </section>

      {validationResult ? (
        <ValidationSummary result={validationResult} />
      ) : null}

      <section className="space-y-3 rounded-2xl border border-border/80 bg-background/70 p-4 shadow-sm">
        <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-muted-foreground">
          Environment variables
        </p>

        <div className="grid gap-2">
          {diagnostics.env.variables.map((variable) => (
            <VariableRow key={variable.key} variable={variable} />
          ))}
        </div>
      </section>

      <section className="space-y-3 rounded-2xl border border-border/80 bg-background/70 p-4 shadow-sm">
        <div className="space-y-1">
          <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-muted-foreground">
            Runtime state
          </p>
          <p className="text-sm text-muted-foreground">
            This is the current token, owner, and snapshot state the server sees
            in local debug mode.
          </p>
        </div>

        <div className="grid gap-2">
          <RuntimeRow
            label="configured owner"
            value={`@${diagnostics.runtime.configuredUsername}`}
          />
          <RuntimeRow
            label="configured owner id"
            value={diagnostics.runtime.configuredUserId ?? "Not set"}
          />
          <RuntimeRow
            label="token status"
            value={diagnostics.runtime.tokenStatus}
          />
          <RuntimeRow
            label="token expires"
            value={formatTimestamp(diagnostics.runtime.tokenExpiresAt)}
          />
          <RuntimeRow
            label="last token refresh"
            value={formatTimestamp(diagnostics.runtime.lastRefreshedAt)}
          />
          <RuntimeRow
            label="authenticated owner"
            value={formatOwner(diagnostics.runtime.authenticatedOwner)}
          />
          <RuntimeRow
            label="resolved owner"
            value={formatOwner(diagnostics.runtime.resolvedOwner)}
          />
          <RuntimeRow
            label="last sync attempt"
            value={formatTimestamp(diagnostics.runtime.lastAttemptedSyncAt)}
          />
          <RuntimeRow
            label="last successful sync"
            value={formatTimestamp(diagnostics.runtime.lastSuccessfulSyncAt)}
          />
          <RuntimeRow
            label="snapshot state"
            value={
              diagnostics.runtime.snapshotPresent
                ? diagnostics.runtime.snapshotFresh
                  ? `fresh (${diagnostics.runtime.snapshotSource ?? "unknown"})`
                  : `stale (${diagnostics.runtime.snapshotSource ?? "unknown"})`
                : "missing"
            }
          />
          <RuntimeRow
            label="snapshot cached"
            value={formatTimestamp(diagnostics.runtime.snapshotCachedAt)}
          />
          <RuntimeRow
            label="snapshot last synced"
            value={formatTimestamp(diagnostics.runtime.snapshotLastSyncedAt)}
          />
          <RuntimeRow
            label="snapshot age"
            value={
              diagnostics.runtime.cacheAgeSeconds === null
                ? "Not available"
                : `${diagnostics.runtime.cacheAgeSeconds}s`
            }
          />
        </div>

        {diagnostics.runtime.lastError ? (
          <Alert className="border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-200">
            <AlertTriangle className="size-4" />
            <AlertTitle>Last recorded sync error</AlertTitle>
            <AlertDescription>
              <p>
                {diagnostics.runtime.lastError.code}:{" "}
                {diagnostics.runtime.lastError.message}
              </p>
            </AlertDescription>
          </Alert>
        ) : null}
      </section>
    </div>
  );
}
