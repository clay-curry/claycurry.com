import { gateway, streamText, convertToModelMessages } from "ai";
import type { UIMessage } from "ai";
import type { GatewayProviderOptions } from "@ai-sdk/gateway";

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

<analysis>
Briefly state whether the background fully answers, partially answers, or does not answer the question.
</analysis>

<answer>
Use section headers and bullet points only.
</answer>
`;

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
  const {
    messages,
    model = "grok/grok-3-mini",
    webSearch = false,
  }: {
    messages: UIMessage[];
    model?: string;
    webSearch?: boolean;
  } = await req.json();

  // Fetch GitHub data and build full system prompt
  const githubData = await fetchGitHubData();
  const fullSystemPrompt = SYSTEM_PROMPT + (githubData ? `\n\n### GitHub Data\n${githubData}` : "");

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
