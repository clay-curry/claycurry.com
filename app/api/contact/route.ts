import { Effect } from "effect";
import { NextResponse } from "next/server";
import { Resend } from "resend";
import { contactData } from "@/lib/portfolio-data";

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export async function POST(request: Request) {
  return Effect.runPromise(
    Effect.gen(function* () {
      const body = yield* Effect.tryPromise({
        try: () => request.json(),
        catch: () => ({ _tag: "ParseError" as const }),
      });
      const { name, email, message } = body;

      if (!name || !email || !message) {
        return NextResponse.json(
          { error: "Missing required fields" },
          { status: 400 },
        );
      }

      const resend = new Resend(process.env.RESEND_API_KEY);
      const { error } = yield* Effect.tryPromise({
        try: () =>
          resend.emails.send({
            from: "Contact <contact@claycurry.studio>",
            to: contactData.email,
            replyTo: email,
            subject: `New message from ${name}`,
            text: `Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`,
            html: `
        <h2>New Contact Form Submission</h2>
        <p><strong>Name:</strong> ${escapeHtml(name)}</p>
        <p><strong>Email:</strong> ${escapeHtml(email)}</p>
        <p><strong>Message:</strong></p>
        <p>${escapeHtml(message).replace(/\n/g, "<br>")}</p>
      `,
          }),
        catch: (cause) => ({ _tag: "ResendError" as const, cause }),
      });

      if (error) {
        console.error("Resend error:", error);
        return NextResponse.json(
          { error: "Failed to send email" },
          { status: 500 },
        );
      }

      return NextResponse.json({ success: true });
    }).pipe(
      Effect.catchAll((err) => {
        console.error("Contact form error:", err);
        return Effect.succeed(
          NextResponse.json(
            { error: "Internal server error" },
            { status: 500 },
          ),
        );
      }),
    ),
  );
}
