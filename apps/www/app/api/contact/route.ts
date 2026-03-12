/**
 * @module api/contact
 *
 * API Route: Contact Form
 *
 * Sends contact form submissions via the EmailService Effect layer.
 * Validates required fields (name, email, message) before sending.
 *
 * Endpoint:
 * - POST /api/contact { name, email, message }
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

    const { name, message } = body;
    const senderEmail = body.email;

    if (!name || !senderEmail || !message) {
      return yield* Effect.fail(
        new ValidationError({ message: "Missing required fields" }),
      );
    }

    yield* Effect.logDebug("Validation passed, sending email").pipe(
      Effect.annotateLogs("from", senderEmail),
    );

    yield* tracing.span(
      "email.send",
      email
        .send({
          from: "Contact <contact@claycurry.com>",
          to: contactData.email,
          replyTo: senderEmail,
          subject: `New message from ${name}`,
          text: `Name: ${name}\nEmail: ${senderEmail}\n\nMessage:\n${message}`,
          html: `
          <h2>New Contact Form Submission</h2>
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Email:</strong> ${senderEmail}</p>
          <p><strong>Message:</strong></p>
          <p>${String(message).replace(/\n/g, "<br>")}</p>
        `,
        })
        .pipe(
          Effect.mapError(
            (e) => new EmailError({ message: e.message, cause: e }),
          ),
        ),
    );

    yield* Effect.logDebug("Email sent successfully");

    return NextResponse.json({ success: true });
  });

export async function POST(req: NextRequest) {
  return runRouteHandler(req, handlePost(req));
}
