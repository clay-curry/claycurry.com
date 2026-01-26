import { gateway, streamText, convertToModelMessages } from "ai";
import type { UIMessage } from "ai";
import type { GatewayProviderOptions } from "@ai-sdk/gateway";
import { getPostContent } from "@/app/(portfolio)/blog/loader";

const GITHUB_USERNAME = "clay-curry";

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
      fetch(`https://api.github.com/users/${GITHUB_USERNAME}`, { headers }),
      fetch(`https://api.github.com/users/${GITHUB_USERNAME}/repos?sort=updated&per_page=30`, { headers }),
    ]);

    if (!profileRes.ok || !reposRes.ok) {
      console.error("GitHub API error:", profileRes.status, reposRes.status);
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

- **Username**: ${GITHUB_USERNAME}
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
`
  )
  .join("\n")}
`;

    // Cache the result
    githubCache = { data: githubContext, timestamp: Date.now() };
    return githubContext;
  } catch (error) {
    console.error("Failed to fetch GitHub data:", error);
    return "";
  }
}

const SYSTEM_PROMPT = `
### Instructions

Answer the visitor's question using the information in Clay's background. Always supplement the background by crawling for examples in his github and resume.

github: http://github.com/clay-curry

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

export async function POST(req: Request) {
  const {
    messages,
    model = "grok/grok-3-mini",
    webSearch = false,
    slug,
  }: {
    messages: UIMessage[];
    model?: string;
    webSearch?: boolean;
    slug?: string;
  } = await req.json();

  // Build system prompt based on context (blog article or general)
  let fullSystemPrompt: string;

  if (slug) {
    // Blog context - include article content
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
      fullSystemPrompt = BLOG_SYSTEM_PROMPT + articleContext;
    } else {
      // Fallback if article not found
      fullSystemPrompt = BLOG_SYSTEM_PROMPT;
    }
  } else {
    // General context - use GitHub data
    const githubData = await fetchGitHubData();
    fullSystemPrompt = SYSTEM_PROMPT + (githubData ? `\n\n### GitHub Data\n${githubData}` : "");
  }

  const result = streamText({
    model: gateway(model),
    messages: await convertToModelMessages(messages),
    system: fullSystemPrompt,
    // Use Perplexity search tool when web search is enabled
    tools: webSearch
      ? {
          perplexity_search: gateway.tools.perplexitySearch({
            maxResults: 5,
          }),
        }
      : undefined,
    providerOptions: {
      gateway: {
        // Fallback models if primary fails
        models: ["anthropic/claude-3-haiku-20240307", "openai/gpt-4o-mini"],
      } satisfies GatewayProviderOptions,
    },
  });

  return result.toUIMessageStreamResponse({
    sendSources: true,
    sendReasoning: true,
  });
}
