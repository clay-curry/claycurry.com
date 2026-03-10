import type {
  IntegrationIssue,
  IntegrationIssueCode,
  TokenHealthStatus,
} from "./contracts";

export class XIntegrationError extends Error {
  code: IntegrationIssueCode;
  tokenStatus?: TokenHealthStatus;

  constructor(
    code: IntegrationIssueCode,
    message: string,
    options?: { cause?: unknown; tokenStatus?: TokenHealthStatus },
  ) {
    super(message, options?.cause ? { cause: options.cause } : undefined);
    this.name = "XIntegrationError";
    this.code = code;
    this.tokenStatus = options?.tokenStatus;
  }
}

export function toIntegrationError(
  error: unknown,
  fallbackCode: IntegrationIssueCode = "upstream_error",
): XIntegrationError {
  if (error instanceof XIntegrationError) {
    return error;
  }

  if (error instanceof Error) {
    return new XIntegrationError(fallbackCode, error.message, { cause: error });
  }

  return new XIntegrationError(fallbackCode, "Unknown X integration error");
}

export function toIntegrationIssue(error: unknown): IntegrationIssue {
  const normalized = toIntegrationError(error);
  return {
    code: normalized.code,
    message: normalized.message,
  };
}
