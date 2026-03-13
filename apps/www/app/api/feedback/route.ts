import { Effect } from "effect";
import { type NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { withDebug } from "@/lib/debug";
import { contactData } from "@/lib/portfolio-data";

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export const POST = withDebug(
  "POST /api/feedback",
  async (request: NextRequest, debug) => {
    return Effect.runPromise(
      Effect.gen(function* () {
        const body = yield* Effect.tryPromise({
          try: () => request.json(),
          catch: () => ({ _tag: "ParseError" as const }),
        });
        const { page, sentiment, message } = body;

        if (!page || !sentiment) {
          return NextResponse.json(
            { error: "Missing required fields" },
            { status: 400 },
          );
        }

        if (!["positive", "negative"].includes(sentiment)) {
          return NextResponse.json(
            { error: "Invalid sentiment value" },
            { status: 400 },
          );
        }

        debug.log("feedback received", { page, sentiment });

        const sentimentEmoji = sentiment === "positive" ? "👍" : "👎";
        const sentimentText =
          sentiment === "positive" ? "Positive" : "Negative";

        const resend = new Resend(process.env.RESEND_API_KEY);
        const { error } = yield* Effect.tryPromise({
          try: () =>
            resend.emails.send({
              from: "Feedback <feedback@claycurry.com>",
              to: contactData.email,
              subject: `${sentimentEmoji} Page Feedback: ${page}`,
              text: `Page: ${page}\nSentiment: ${sentimentText}\n${message ? `\nMessage:\n${message}` : ""}`,
              html: `
          <h2>Page Feedback</h2>
          <p><strong>Page:</strong> ${escapeHtml(page)}</p>
          <p><strong>Sentiment:</strong> ${sentimentEmoji} ${sentimentText}</p>
          ${message ? `<p><strong>Message:</strong></p><p>${escapeHtml(message).replace(/\n/g, "<br>")}</p>` : ""}
        `,
            }),
          catch: (cause) => ({ _tag: "ResendError" as const, cause }),
        });

        if (error) {
          console.error("Resend error:", error);
          debug.error("Resend API failed", { error: String(error) });
          return NextResponse.json(
            { error: "Failed to send feedback" },
            { status: 500 },
          );
        }

        debug.log("feedback email sent");
        return NextResponse.json({ success: true });
      }).pipe(
        Effect.catchAll((err) => {
          console.error("Feedback error:", err);
          return Effect.succeed(
            NextResponse.json(
              { error: "Internal server error" },
              { status: 500 },
            ),
          );
        }),
      ),
    );
  },
);
