import { NextResponse } from "next/server";
import { readXCredentialDiagnostics } from "@/lib/x/diagnostics";

export const dynamic = "force-dynamic";

function notFoundResponse() {
  return new NextResponse(null, {
    headers: {
      "Cache-Control": "no-store",
    },
    status: 404,
  });
}

function jsonResponse(body: unknown, status = 200) {
  return NextResponse.json(body, {
    headers: {
      "Cache-Control": "no-store",
    },
    status,
  });
}

export async function GET() {
  if (process.env.VERCEL_ENV === "production") {
    return notFoundResponse();
  }

  try {
    const diagnostics = await readXCredentialDiagnostics();
    return jsonResponse(diagnostics);
  } catch (error) {
    console.error("X credential diagnostics error:", error);
    return jsonResponse(
      {
        error: "Failed to read X credential diagnostics.",
      },
      500,
    );
  }
}
