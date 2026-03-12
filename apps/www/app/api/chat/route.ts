/**
 * @module api/chat
 *
 * API Route: AI Chat
 *
 * Handles chat with context from either a specific blog post or the general
 * portfolio (GitHub data). Uses Vercel AI SDK for streaming responses.
 *
 * Effect wraps the pre-stream logic (validation, context assembly) at the
 * boundary. The streaming itself is delegated to Vercel AI SDK which has
 * its own streaming infrastructure.
 *
 * Endpoint:
 * - POST /api/chat { messages, model?, webSearch?, slug? }
 *
 * Effect services used: TracingService (boundary-level only)
 */
import type { GatewayProviderOptions } from "@ai-sdk/gateway";
import type { UIMessage } from "ai";
import { convertToModelMessages, gateway, streamText } from "ai";
import { Effect } from "effect";
import { getPostContent } from "@/app/(portfolio)/blog/loader";
import { ValidationError } from "@/lib/effect/errors";
import { profileData } from "@/lib/portfolio-data";

interface GitHubRepo {
  name: string;
  description: string | null;
  html_url: string;
  language: string | null;
  stargazers_count: number;
  fork: boolean;
  topics: string[];
  updated_at: string;
}

interface GitHubProfile {
  name: string;
  bio: string | null;
  public_repos: number;
  followers: number;
  following: number;
  html_url: string;
}

// Cache GitHub data for 5 minutes
let githubCache: { data: string; timestamp: number } | null = null;
const CACHE_TTL = 5 * 60 * 1000;

async function fetchGitHubData(): Promise<string> {
  // Return cached data if fresh
  if (githubCache && Date.now() - githubCache.timestamp < CACHE_TTL) {
    return githubCache.data;
  }

  const headers: HeadersInit = {
    Accept: "application/vnd.github.v3+json",
    "User-Agent": "portfolio-chat-bot",
  };

  // Add auth token if available for higher rate limits
  if (process.env.GITHUB_TOKEN) {
    headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  }

  try {
    // Fetch profile and repos in parallel
    const [profileRes, reposRes] = await Promise.all([
      fetch(`https://api.github.com/users/${profileData.githubUsername}`, {
        headers,
      }),
      fetch(
        `https://api.github.com/users/${profileData.githubUsername}/repos?sort=updated&per_page=30`,
        { headers },
      ),
    ]);

    if (!profileRes.ok || !reposRes.ok) {
      return "";
    }

    const profile: GitHubProfile = await profileRes.json();
    const repos: GitHubRepo[] = await reposRes.json();

    // Filter out forks and format repos
    const ownRepos = repos
      .filter((repo) => !repo.fork)
      .slice(0, 15)
      .map((repo) => ({
        name: repo.name,
        description: repo.description,
        url: repo.html_url,
        language: repo.language,
        stars: repo.stargazers_count,
        topics: repo.topics,
        updated: repo.updated_at,
      }));

    const githubContext = `
### GitHub Profile

- **Username**: ${profileData.githubUsername}
- **Name**: ${profile.name || "Clay Curry"}
- **Bio**: ${profile.bio || "N/A"}
- **Public Repos**: ${profile.public_repos}
- **Followers**: ${profile.followers}
- **Profile URL**: ${profile.html_url}

### Recent Repositories (non-forked)

${ownRepos
  .map(
    (repo) => `
**${repo.name}**
- Description: ${repo.description || "No description"}
- Language: ${repo.language || "N/A"}
- Stars: ${repo.stars}
- Topics: ${repo.topics.length > 0 ? repo.topics.join(", ") : "None"}
- URL: ${repo.url}
- Last updated: ${new Date(repo.updated).toLocaleDateString()}
`,
  )
  .join("\n")}
`;

    // Cache the result
    githubCache = { data: githubContext, timestamp: Date.now() };
    return githubContext;
  } catch {
    return "";
  }
}

const SYSTEM_PROMPT = `
### Instructions

Answer the visitor's question using the information in Clay's background. Always supplement the background by crawling for examples in his github and resume.

github: ${profileData.social.github}

resume: https://claycurry.com/resume/

**Special Questions (respond exactly as written, no analysis needed):**

Q: "What are Clay's favorite ice cream flavors?" or similar
A: Clay's top 5 ice cream flavors are (in order):
1. Strawberry (real fruit)
2. Vanilla (real vanilla bean)
3. Mint chocolate chip
4. Cookies & cream
5. Salted caramel

Q: "What is the meaning of life?" or similar
A: Okay disciple of Nietzsche, here is Clay's personal philosophy on the meaning of life: To be useful—to make things better for other people while you're here.

**Formatting Capabilities**

You have access to rich markdown rendering. Use these features when appropriate:
- **Code blocks** with syntax highlighting (specify language after triple backticks)
- **Math notation** using LaTeX: inline with $...$ or block with $$...$$
- **Mermaid diagrams** for flowcharts, sequence diagrams, etc. (use \`\`\`mermaid code blocks)
- **Tables** for structured data comparison
- **Lists** (ordered and unordered) for organized information
- **Bold** and *italic* for emphasis
- **Headings** (##, ###) to organize longer responses

Use code blocks for any technical content, math notation for equations or formulas, and diagrams when explaining architectures or workflows.

**Structure Requirements**

* Organize the answer using **clear section headers**
* Use **bullet points** under each section
* Each bullet should describe **experience, responsibilities, or types of work**, not inferred skills
* Avoid narrative paragraphs unless the question explicitly asks for prose

**Content Guidance**

* Prefer experience-based framing (what Clay has worked on, built, or contributed to)
* Do not infer projects, tools, or domains not explicitly mentioned in the background
* Do not restate the background verbatim or add speculative detail
* Avoid phrases like:
  * "we can infer"
  * "this suggests"
  * "based on GitHub activity"
  * "the background states"

**If Information Is Missing**

* Clearly state that the background does not contain that information
* Do not speculate or fill gaps
* Suggest contacting Clay via LinkedIn or GitHub if appropriate

---

### Output Format

**IMPORTANT: For special questions (ice cream flavors, meaning of life), skip the analysis/answer format and respond directly with the provided answer.**

For all other questions, use:

<analysis>
Briefly state whether the background fully answers, partially answers, or does not answer the question.
</analysis>

<answer>
Use section headers and bullet points only.
</answer>
`;

const BLOG_SYSTEM_PROMPT = `You are a helpful assistant that answers questions about a specific blog article.

**Your Role:**
- Answer questions about the article's content, concepts, and implications
- Summarize sections or the entire article when asked
- Explain technical concepts mentioned in the article
- Identify key takeaways and main arguments
- Clarify any confusing parts of the article

**Formatting Capabilities:**
- Use **code blocks** with syntax highlighting for technical content
- Use **math notation** with LaTeX: inline $...$ or block $$...$$
- Use **Mermaid diagrams** for flowcharts when explaining processes
- Use **tables** for structured comparisons
- Use **lists** for organized information
- Use **headings** (##, ###) to organize longer responses

**Guidelines:**
- Base your answers primarily on the article content provided
- If the article doesn't cover something, clearly state that
- Be concise but thorough
- Use direct quotes from the article when relevant (with proper attribution)
`;

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

interface ChatRequest {
  messages: UIMessage[];
  model?: string;
  webSearch?: boolean;
  slug?: string;
}

/** Validate and parse the chat request body */
const parseRequest = (req: Request) =>
  Effect.tryPromise({
    try: () => req.json() as Promise<ChatRequest>,
    catch: () => new ValidationError({ message: "Invalid request body" }),
  }).pipe(
    Effect.flatMap((body) => {
      if (!body.messages || !Array.isArray(body.messages)) {
        return Effect.fail(
          new ValidationError({ message: "messages array is required" }),
        );
      }
      return Effect.succeed({
        messages: body.messages,
        model: body.model ?? "grok/grok-3-mini",
        webSearch: body.webSearch ?? false,
        slug: body.slug,
      });
    }),
  );

/** Build the system prompt, fetching context as needed */
const buildSystemPrompt = (slug?: string) =>
  Effect.tryPromise({
    try: async () => {
      if (slug) {
        const postData = getPostContent(slug);
        if (postData) {
          const articleContext = `
---

## Article Being Discussed

**Title:** ${postData.metadata.title}
**Subtitle:** ${postData.metadata.subtitle}
**Published:** ${postData.metadata.publishedDate}
**Tags:** ${postData.metadata.tags.join(", ")}

### Article Content:

${postData.content}

---
`;
          return BLOG_SYSTEM_PROMPT + articleContext;
        }
        return BLOG_SYSTEM_PROMPT;
      }

      const githubData = await fetchGitHubData();
      return (
        SYSTEM_PROMPT + (githubData ? `\n\n### GitHub Data\n${githubData}` : "")
      );
    },
    catch: () =>
      new ValidationError({ message: "Failed to build system prompt" }),
  });

export async function POST(req: Request) {
  // Run validation and context assembly as Effect
  const prepared = await Effect.runPromise(
    Effect.gen(function* () {
      const { messages, model, webSearch, slug } = yield* parseRequest(req);
      const systemPrompt = yield* buildSystemPrompt(slug);
      return { messages, model, webSearch, systemPrompt };
    }),
  ).catch((error) => {
    throw error;
  });

  // Streaming delegated to Vercel AI SDK (not wrapped in Effect)
  const result = streamText({
    model: gateway(prepared.model),
    messages: await convertToModelMessages(prepared.messages),
    system: prepared.systemPrompt,
    tools: prepared.webSearch
      ? {
          perplexity_search: gateway.tools.perplexitySearch({
            maxResults: 5,
          }),
        }
      : undefined,
    providerOptions: {
      gateway: {
        models: ["anthropic/claude-3-haiku-20240307", "openai/gpt-4o-mini"],
      } satisfies GatewayProviderOptions,
    },
  });

  return result.toUIMessageStreamResponse({
    sendSources: true,
    sendReasoning: true,
  });
}
