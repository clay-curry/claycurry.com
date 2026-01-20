import fs from "fs/promises";
import path from "path";
import { unified } from "unified";
import rehypeParse from "rehype-parse";
import { selectAll } from "hast-util-select";
import type { Element as HastElement } from "hast";

// Goal: 
//   - generate an index for page index  
// A link that no longer resolves at the intended target may be called broken or dead.

interface CanonicalUrlNode {
  /** 
   * 
   * Canonical Link Element - refers to an HTML element that helps webmasters prevent duplicate 
   * content issues in search engine optimization by specifying the "canonical" or "preferred" version of a web page
   * 
   * // 
   * <title>Explore the world of dresses</title>
   * <link rel="canonical" href="https://example.com/dresses/green-dresses" />
   * 
   * A canonical URL is the "main" or "preferred" URL for a piece of content when multiple URLs (due to parameters, versions, or duplication) point to the same page, telling search engines which version to index to avoid duplicate content issues and consolidate ranking signals */
  final_url: string; // after redirects
  status_code: number;
  links_found: string[];
  timestamp_visited: number;
  
  content_type: 'text/html' | 'application/pdf' | 'image/*' | 'other';
  content_raw: string; // 
  content_md?: string; // translated html as markdown
}

interface LinkNode {
  raw_href: string;
  dest_url: string;
  status_code: number;
  redirect_chain: [number, string][];

  parent_url: string;   // URL of resource containing the link
  position: string; // R
  link_type: 'external' | 'anchor' | 'mailto' | 'tel' | 'file' | 'other';
  label: 'PASS' | 'FAIL' | 'WARN';
}

interface UrlCache {
  [url: string]: UrlNode; 
}

const CACHE_DIR = ".link-checker/cache";
const CACHE_FILE = path.join(CACHE_DIR, "url_visited.json");
const BASE_URL = "http://localhost:3001";
const MAX_PAGES = 1000; // Safety limit


// simple, non-cryptographic hash 
function hash(str: string): string {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = (h * 31 + str.charCodeAt(i)) | 0;
  }
  return h.toString(16);
}


class LinkClient {
  private maxRetries = 3;
  private retryDelay = 1000;
  private cacheFile: string;
  private cacheDir: string;
  cache: UrlCache = {};

  constructor(cacheFile: string, cacheDir: string) {
    this.cacheFile = cacheFile;
    this.cacheDir = cacheDir;
  }

  /**
   * Fetch a URL with retry logic (no cache check - use has() first)
   */
  async fetchUrlResponse(url: string): Promise<Response> {
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
      try {
        const response = await fetch(url);
        if (response.ok || attempt === this.maxRetries) {
          return response;
        }
        // Retry on 5xx errors
        if (response.status >= 500) {
          console.log(`Attempt ${attempt}/${this.maxRetries} failed with ${response.status}, retrying...`);
          await this.sleep(this.retryDelay * attempt);
          continue;
        }
        return response;
      } catch (error) {
        lastError = error as Error;
        console.log(`Attempt ${attempt}/${this.maxRetries} failed: ${lastError.message}, retrying...`);
        if (attempt < this.maxRetries) {
          await this.sleep(this.retryDelay * attempt);
        }
      }
    }
    throw lastError ?? new Error(`Failed to fetch ${url} after ${this.maxRetries} attempts`);
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Load existing cache from disk
   */
  async loadCache(): Promise<UrlCache> {
    try {
      const cacheContent = await fs.readFile(this.cacheFile, "utf-8");
      this.cache = JSON.parse(cacheContent);
      console.log(`Loaded ${Object.keys(this.cache).length} URLs from cache`);
      return this.cache;
    } catch (error) {
      console.log("No existing cache found, starting fresh");
      this.cache = {};
      return this.cache;
    }
  }

  /**
   * Save cache to disk
   */
  async saveCache(cache: UrlCache): Promise<void> {
    await fs.mkdir(this.cacheDir, { recursive: true });
    await fs.writeFile(this.cacheFile, JSON.stringify(cache, null, 2));
    console.log(`Saved ${Object.keys(cache).length} URLs to cache`);
  }

}

/**
 * LinkWriter - Handles cache I/O and reporting
 */
class LinkWriter {
  /**
   * Generate a report of all visited URLs
   */
  generateReport(cache: UrlCache): void {
    const urls = Object.keys(cache);
    console.log(`\n=== Link Builder Report ===`);
    console.log(`Total URLs visited: ${urls.length}\n`);

    const statusCodes = new Map<number, number>();
    urls.forEach((url) => {
      const status = cache[url].status_code;
      statusCodes.set(status, (statusCodes.get(status) || 0) + 1);
    });

    console.log("Status code distribution:");
    Array.from(statusCodes.entries())
      .sort((a, b) => a[0] - b[0])
      .forEach(([code, count]) => {
        console.log(`  ${code}: ${count} pages`);
      });

    // Find broken links
    const brokenLinks = urls.filter(
      (url) => cache[url].status_code !== 200 && cache[url].status_code !== 0
    );
    if (brokenLinks.length > 0) {
      console.log(`\n⚠️  Broken links (${brokenLinks.length}):`);
      brokenLinks.forEach((url) => {
        console.log(`  ${cache[url].status_code} - ${url}`);
      });
    }
  }
}

/**
 * HrefMatcher - Handles href extraction and URL operations
 */
class HrefMatcher {
  private baseUrl: string;
  constructor(baseUrl: string) { this.baseUrl = baseUrl }

  /**
   * Check if URL should be crawled
   */
  shouldCrawl(url: string): boolean {
    // Only crawl URLs from the same origin
    try {
      const urlObj = new URL(url);
      const baseUrlObj = new URL(this.baseUrl);
      return urlObj.origin === baseUrlObj.origin;
    } catch {
      return false;
    }
  }

  /**
   * Normalize URL by removing trailing slashes and fragments
   */
  normalizeUrl(url: string): string {
    try {
      const urlObj = new URL(url);
      // Remove fragment
      urlObj.hash = "";
      // Remove trailing slash unless it's the root
      let normalized = urlObj.toString();
      if (normalized.endsWith("/") && urlObj.pathname !== "/") {
        normalized = normalized.slice(0, -1);
      }
      return normalized;
    } catch {
      return url;
    }
  }

  /**
   * Extract all links from HTML content
   */
  extractLinks(html: string, pageUrl: string): string[] {
    const tree = unified().use(rehypeParse).parse(html);
    const links: string[] = [];

    // Get all anchor tags with href attributes
    const anchors = selectAll("a[href]", tree) as HastElement[];

    anchors.forEach((anchor: HastElement) => {
      const href = anchor.properties?.href;
      if (!href || typeof href !== "string") return;

      try {
        // Resolve relative URLs
        const absoluteUrl = new URL(href, pageUrl).toString();
        links.push(absoluteUrl);
      } catch {
        // Skip invalid URLs
      }
    });

    return links;
  }

  /**
   * Fetch a URL and extract its content and links
   */
  async fetchUrl(url: string, linkCache?: LinkClient): Promise<UrlNode | null> {
    // Check cache first
    if (linkCache && url in linkCache.cache) {
      const cached = linkCache.cache[url];
      console.log(`${cached.status_code} - ${url} (cached)`);
      return cached;
    }

    try {
      let response: Response;
      if (linkCache && typeof linkCache.fetchUrlResponse === 'function') {
        response = await linkCache.fetchUrlResponse(url);
      } else {
        response = await fetch(url);
      }
      console.log(`${response.status} - ${url}`);
      const content = await response.text();
      const links = this.extractLinks(content, url);

      return {
        status_code: response.status,
        time_visited: Date.now() / 1000,
        content,
        links_found: links,
      };
    } catch (error) {
      console.log(`ERR - ${url}`);
      return {
        status_code: 0,
        time_visited: Date.now() / 1000,
        content: "",
        links_found: [],
      };
    }
  }
}

/**
 * LinkCrawler - Orchestrates the crawling process
 */
class LinkCrawler {
  private visited: UrlCache = {};
  private queue: Set<string> = new Set();
  private processed: Set<string> = new Set();
  private baseUrl: string;
  private finder: HrefMatcher;
  private cache: LinkClient;
  private writer: LinkWriter;
  private maxPages: number;

  constructor(
    baseUrl: string,
    finder: HrefMatcher,
    cache: LinkClient,
    writer: LinkWriter,
    maxPages: number = MAX_PAGES
  ) {
    this.baseUrl = baseUrl;
    this.finder = finder;
    this.cache = cache;
    this.writer = writer;
    this.maxPages = maxPages;
  }

  /**
   * Crawl a single URL
   */
  async crawlUrl(url: string): Promise<void> {
    const normalizedUrl = this.finder.normalizeUrl(url);

    // Skip if already processed
    if (this.processed.has(normalizedUrl)) {
      return;
    }

    this.processed.add(normalizedUrl);

    // Fetch the URL using irLinkClient via HrefMatcher
    const result = await this.finder.fetchUrl(normalizedUrl, this.cache);
    if (!result) return;

    // Store in cache
    this.visited[normalizedUrl] = result;

    // Add new links to queue
    for (const link of result.links_found) {
      const normalizedLink = this.finder.normalizeUrl(link);
      if (
        this.finder.shouldCrawl(normalizedLink) &&
        !this.processed.has(normalizedLink)
      ) {
        this.queue.add(normalizedLink);
      }
    }
  }

  /**
   * Start crawling from the base URL
   */
  async crawl(): Promise<void> {
    this.visited = await this.cache.loadCache();

    // Add base URL to queue
    this.queue.add(this.baseUrl);

    let count = 0;
    while (this.queue.size > 0 && count < this.maxPages) {
      const url = this.queue.values().next().value as string;
      this.queue.delete(url);

      await this.crawlUrl(url);
      count++;

      // Save cache periodically
      if (count % 10 === 0) {
        await this.cache.saveCache(this.visited);
      }
    }

    // Final save
    await this.cache.saveCache(this.visited);

    console.log(`\nCrawling complete!`);
    console.log(`Total pages visited: ${Object.keys(this.visited).length}`);
    console.log(`Total links in queue: ${this.queue.size}`);
  }

  /**
   * Get the visited cache
   */
  getVisited(): UrlCache {
    return this.visited;
  }
}

/**
 * Main function
 */
async function main() {
  const cache = new LinkClient(CACHE_FILE, CACHE_DIR);
  const finder = new HrefMatcher(BASE_URL);
  const writer = new LinkWriter();
  const crawler = new LinkCrawler(BASE_URL, finder, cache, writer, 10);

  console.log(`Starting link builder for ${BASE_URL}...\n`);

  await crawler.crawl();
  writer.generateReport(crawler.getVisited());
}

// Run if called directly
// Check if this module is being run directly (works with --experimental-strip-types)
const isMainModule = process.argv[1]?.endsWith("route-walker.ts");
if (isMainModule) {
  main().catch(console.error);
}

export { LinkClient as LinkCache, LinkWriter, HrefMatcher as LinkFinder, LinkCrawler };
