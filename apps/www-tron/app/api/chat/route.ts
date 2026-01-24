import { anthropic } from "@ai-sdk/anthropic";
import { streamText, convertToModelMessages } from "ai";
import type { UIMessage } from "ai";

const SYSTEM_PROMPT = `You are a helpful AI assistant on Clay Curry's portfolio website. You can answer questions about Clay's work, skills, experience, and projects. Be concise, friendly, and helpful.

About Clay:
- Software engineer with expertise in web development
- Works with TypeScript, React, Next.js, and other modern technologies
- Passionate about building great user experiences

If you don't have specific information about something, acknowledge that and offer to help in other ways.`;

export async function POST(request: Request) {
  try {
    const { messages } = (await request.json()) as { messages: UIMessage[] };

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return new Response(JSON.stringify({ error: "Messages are required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }

    const result = streamText({
      model: anthropic("claude-3-haiku-20240307"),
      system: SYSTEM_PROMPT,
      messages: await convertToModelMessages(messages)
    });

    return result.toUIMessageStreamResponse();
  } catch (error) {
    console.error("Chat API error:", error);
    return new Response(
      JSON.stringify({ error: "Sorry, something went wrong. Please try again." }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
