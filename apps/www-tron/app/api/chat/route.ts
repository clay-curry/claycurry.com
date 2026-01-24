import { anthropic } from "@ai-sdk/anthropic";
import { streamText, convertToModelMessages } from "ai";
import type { UIMessage } from "ai";

/*
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
*/


// Allow streaming responses up to 30 seconds
export const maxDuration = 30;
export async function POST(req: Request) {
  const {
    messages,
    model,
    webSearch,
  }: { 
    messages: UIMessage[]; 
    model: string; 
    webSearch: boolean;
  } = await req.json();
  const result = streamText({
    model: webSearch ? 'perplexity/sonar' : model,
    messages: await convertToModelMessages(messages),
    system:
      'You are a helpful assistant that can answer questions and help with tasks',
  });
  // send sources and reasoning back to the client
  return result.toUIMessageStreamResponse({
    sendSources: true,
    sendReasoning: true,
  });
}