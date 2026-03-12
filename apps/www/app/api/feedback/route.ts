/**
 * @module api/feedback
 *
 * API Route: Page Feedback
 *
 * Sends page feedback (positive/negative sentiment with optional message)
 * via the EmailService Effect layer.
 *
 * Endpoint:
 * - POST /api/feedback { page, sentiment, message? }
 *
 * Effect services used: EmailService, TracingService
 */
import { Effect } from "effect";
import { type NextRequest, NextResponse } from "next/server";
import { EmailError, ValidationError } from "@/lib/effect/errors";
import { contactData } from "@/lib/portfolio-data";
import { EmailService } from "@/lib/services/Email";
import { TracingService } from "@/lib/services/Tracing";
import { runRouteHandler } from "../_shared/handler";

const handlePost = (req: NextRequest) =>
  Effect.gen(function* () {
    const tracing = yield* TracingService;
    const email = yield* EmailService;

    const body = yield* Effect.tryPromise({
      try: () => req.json(),
      catch: () => new ValidationError({ message: "Invalid request body" }),
    });

    const { page, sentiment, message } = body;

    if (!page || !sentiment) {
      return yield* Effect.fail(
        new ValidationError({ message: "Missing required fields" }),
      );
    }

    if (!["positive", "negative"].includes(sentiment)) {
      return yield* Effect.fail(
        new ValidationError({ message: "Invalid sentiment value" }),
      );
    }

    const sentimentEmoji = sentiment === "positive" ? "\u{1F44D}" : "\u{1F44E}";
    const sentimentText = sentiment === "positive" ? "Positive" : "Negative";

    yield* Effect.logDebug("Validation passed, sending feedback email").pipe(
      Effect.annotateLogs("page", page),
      Effect.annotateLogs("sentiment", sentiment),
    );

    yield* tracing.span(
      "email.send",
      email
        .send({
          from: "Feedback <feedback@claycurry.com>",
          to: contactData.email,
          subject: `${sentimentEmoji} Page Feedback: ${page}`,
          text: `Page: ${page}\nSentiment: ${sentimentText}\n${message ? `\nMessage:\n${message}` : ""}`,
          html: `
          <h2>Page Feedback</h2>
          <p><strong>Page:</strong> ${page}</p>
          <p><strong>Sentiment:</strong> ${sentimentEmoji} ${sentimentText}</p>
          ${message ? `<p><strong>Message:</strong></p><p>${String(message).replace(/\n/g, "<br>")}</p>` : ""}
        `,
        })
        .pipe(
          Effect.mapError(
            (e) => new EmailError({ message: e.message, cause: e }),
          ),
        ),
    );

    yield* Effect.logDebug("Feedback email sent successfully");

    return NextResponse.json({ success: true });
  });

export async function POST(req: NextRequest) {
  return runRouteHandler(req, handlePost(req));
}
