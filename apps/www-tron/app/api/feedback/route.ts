import { Resend } from "resend";
import { NextResponse } from "next/server";
import { contactData } from "@/lib/portfolio-data";

export async function POST(request: Request) {
  try {
    const resend = new Resend(process.env.RESEND_API_KEY);
    const { page, sentiment, message } = await request.json();

    if (!page || !sentiment) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    if (!["positive", "negative"].includes(sentiment)) {
      return NextResponse.json(
        { error: "Invalid sentiment value" },
        { status: 400 }
      );
    }

    const sentimentEmoji = sentiment === "positive" ? "👍" : "👎";
    const sentimentText = sentiment === "positive" ? "Positive" : "Negative";

    const { error } = await resend.emails.send({
      from: "Feedback <feedback@claycurry.com>",
      to: contactData.email,
      subject: `${sentimentEmoji} Page Feedback: ${page}`,
      text: `Page: ${page}\nSentiment: ${sentimentText}\n${message ? `\nMessage:\n${message}` : ""}`,
      html: `
        <h2>Page Feedback</h2>
        <p><strong>Page:</strong> ${page}</p>
        <p><strong>Sentiment:</strong> ${sentimentEmoji} ${sentimentText}</p>
        ${message ? `<p><strong>Message:</strong></p><p>${message.replace(/\n/g, "<br>")}</p>` : ""}
      `,
    });

    if (error) {
      console.error("Resend error:", error);
      return NextResponse.json(
        { error: "Failed to send feedback" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Feedback error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
