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
      const { page, sentiment, message, email } = body;

      if (!page || !sentiment) {
        return NextResponse.json(
          { error: "Missing required fields" },
          { status: 400 },
        );
      }

      const validSentiments = [
        "positive",
        "negative",
        "terrible",
        "bad",
        "good",
        "amazing",
      ];
      if (!validSentiments.includes(sentiment)) {
        return NextResponse.json(
          { error: "Invalid sentiment value" },
          { status: 400 },
        );
      }

      const emojiMap: Record<string, string> = {
        positive: "👍",
        negative: "👎",
        terrible: "😭",
        bad: "😣",
        good: "🙂",
        amazing: "🤩",
      };
      const labelMap: Record<string, string> = {
        positive: "Positive",
        negative: "Negative",
        terrible: "Terrible",
        bad: "Bad",
        good: "Good",
        amazing: "Amazing",
      };
      const sentimentEmoji = emojiMap[sentiment];
      const sentimentText = labelMap[sentiment];

      const resend = new Resend(process.env.RESEND_API_KEY);
      const { error } = yield* Effect.tryPromise({
        try: () =>
          resend.emails.send({
            from: "Feedback <feedback@claycurry.studio>",
            to: contactData.email,
            subject: `${sentimentEmoji} Page Feedback: ${page}`,
            text: `Page: ${page}\nSentiment: ${sentimentText}${email ? `\nEmail: ${email}` : ""}\n${message ? `\nMessage:\n${message}` : ""}`,
            html: `
        <h2>Page Feedback</h2>
        <p><strong>Page:</strong> ${escapeHtml(page)}</p>
        <p><strong>Sentiment:</strong> ${sentimentEmoji} ${sentimentText}</p>
        ${email ? `<p><strong>Email:</strong> ${escapeHtml(email)}</p>` : ""}
        ${message ? `<p><strong>Message:</strong></p><p>${escapeHtml(message).replace(/\n/g, "<br>")}</p>` : ""}
      `,
          }),
        catch: (cause) => ({ _tag: "ResendError" as const, cause }),
      });

      if (error) {
        console.error("Resend error:", error);
        return NextResponse.json(
          { error: "Failed to send feedback" },
          { status: 500 },
        );
      }

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
}
