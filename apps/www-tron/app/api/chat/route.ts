import { NextRequest, NextResponse } from 'next/server'

const SYSTEM_PROMPT = `You are a helpful AI assistant on Clay Curry's portfolio website. You can answer questions about Clay's work, skills, experience, and projects. Be concise, friendly, and helpful.

About Clay:
- Software engineer with expertise in web development
- Works with TypeScript, React, Next.js, and other modern technologies
- Passionate about building great user experiences

If you don't have specific information about something, acknowledge that and offer to help in other ways.`

export async function POST(request: NextRequest) {
  try {
    const { message, history } = await request.json()

    if (!message || typeof message !== 'string') {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 })
    }

    const apiKey = process.env.ANTHROPIC_API_KEY

    if (!apiKey) {
      // Fallback response when no API key is configured
      return NextResponse.json({
        response: "I'm not fully configured yet. Please check back soon, or feel free to reach out to Clay directly through the contact form!"
      })
    }

    const messages = [
      ...(history || []).map((msg: { role: string; content: string }) => ({
        role: msg.role,
        content: msg.content,
      })),
      { role: 'user', content: message },
    ]

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-3-haiku-20240307',
        max_tokens: 1024,
        system: SYSTEM_PROMPT,
        messages,
      }),
    })

    if (!response.ok) {
      const error = await response.text()
      console.error('Anthropic API error:', error)
      return NextResponse.json({
        response: "I'm having trouble connecting right now. Please try again later."
      })
    }

    const data = await response.json()
    const assistantMessage = data.content[0]?.text || "I couldn't generate a response."

    return NextResponse.json({ response: assistantMessage })
  } catch (error) {
    console.error('Chat API error:', error)
    return NextResponse.json({
      response: "Sorry, something went wrong. Please try again."
    })
  }
}
