import { NextResponse } from "next/server";
import {
  getValidationHttpStatus,
  validateXCredentials,
} from "@/lib/x/diagnostics";

export const dynamic = "force-dynamic";

function jsonResponse(body: unknown, status = 200) {
  return NextResponse.json(body, {
    headers: {
      "Cache-Control": "no-store",
    },
    status,
  });
}

export async function POST() {
  try {
    const result = await validateXCredentials();
    return jsonResponse(result, getValidationHttpStatus(result));
  } catch (error) {
    console.error("X credential validation error:", error);
    return jsonResponse(
      {
        checkedAt: new Date().toISOString(),
        checks: [],
        message: "Failed to validate X credentials.",
        nextSteps: [],
        ok: false,
        owner: {
          authenticatedOwner: null,
          configuredUserId: null,
          configuredUsername: process.env.X_OWNER_USERNAME ?? null,
          resolvedOwner: null,
        },
        status: "upstream_error",
        token: {
          expiresAt: null,
          lastRefreshedAt: null,
          present: false,
          status: "invalid",
        },
      },
      500,
    );
  }
}
