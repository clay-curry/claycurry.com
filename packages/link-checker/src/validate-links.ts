import { type ChildProcess, spawn } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import http from "node:http";
import path from "node:path";
import { fileURLToPath } from "node:url";

/*
  This script validates every links reachable  in a next.js application.
  It uses the following procedure:

  1. read routes serialized in the `prerender-manifest.json` 
  manifest file, produced at build-("prerender")-time   
  2. mock-start a Next.js production server configured with bindings to a Unix 
  (rather than TCP) socket to prevent port collisions
  3. process static routes into HTTP requests to initiate recursive descent
  until visiting all dynamic routes.
  4. when encountering links, log the parent page route and full XPath encounterded 
  across the DOM. 
  5. group together broken links according to failure type (e.g., timeout, HTTP
  code, content mismatch, etc.) and tag them in a structured format.
  6. invoke a notification system to alert maintainers of broken links via 
  preferred channels (e.g., GitHub Issues, email, Slack, etc.).
*/

/** We expect non-2xx HTTP status codes for these routes*/
const expectedStatusCodes: Record<string, number> = {
  "/_not-found": 404,
  "/_global-error": 500,
};

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const appDirCandidates = [
  path.resolve(__dirname, "../../../apps/www"),
  path.resolve(__dirname, "../../site"),
];
const siteDir = appDirCandidates.find((candidate) =>
  existsSync(path.join(candidate, "package.json")),
);

if (!siteDir) {
  throw new Error(
    `Unable to locate Next.js app directory. Tried: ${appDirCandidates.join(", ")}`,
  );
}

const serverHost = "127.0.0.1";
const serverPort = 3101;
type RouteResult = {
  route: string;
  status: number;
  ok: boolean;
};

/** reads statically-rendered routes declared in 'prerender-manifest.json' metadata file.*/
function getStaticRoutesFromManifest(manifestPath: string): string[] {
  const manifest = JSON.parse(readFileSync(manifestPath, "utf-8"));
  return Object.keys(manifest.routes);
}

async function waitForFile(filePath: string, timeoutMs: number): Promise<void> {
  const start = Date.now();
  const pollIntervalMs = 500;

  while (!existsSync(filePath)) {
    if (Date.now() - start > timeoutMs) {
      throw new Error(`Timed out waiting for build artifact: ${filePath}`);
    }

    await new Promise((resolve) => setTimeout(resolve, pollIntervalMs));
  }
}

/**Start the Next.js production server as a subprocess using Unix socket*/
async function startServer(): Promise<ChildProcess> {
  return new Promise((resolve, reject) => {
    const serverProcess = spawn(
      "pnpm",
      ["start", "--hostname", serverHost, "--port", String(serverPort)],
      {
        cwd: siteDir,
        stdio: ["ignore", "pipe", "pipe"],
        env: { ...process.env, NODE_ENV: "production" },
      },
    );

    let started = false;

    const maybeResolveServer = (output: string) => {
      if (!started && /ready/i.test(output)) {
        started = true;
        resolve(serverProcess);
      }
    };

    serverProcess.stdout?.on("data", (data: Buffer) => {
      maybeResolveServer(data.toString());
    });

    serverProcess.stderr?.on("data", (data: Buffer) => {
      // Next.js sometimes logs to stderr even for non-errors
      maybeResolveServer(data.toString());
    });

    serverProcess.on("error", reject);
    serverProcess.on("exit", (code) => {
      if (!started) {
        reject(
          new Error(
            `Server exited before becoming ready (code ${code ?? "unknown"})`,
          ),
        );
      }
    });

    // Timeout after 30 seconds
    setTimeout(() => {
      if (!started) {
        serverProcess.kill();
        reject(new Error("Server failed to start within 30 seconds"));
      }
    }, 30000);
  });
}

/** Make an HTTP request over a Unix socket */
function requestOverSocket(
  route: string,
): Promise<{ status: number; ok: boolean }> {
  return new Promise((resolve, reject) => {
    const req = http.request(
      {
        host: serverHost,
        port: serverPort,
        path: route,
        method: "GET",
      },
      (res) => {
        // Consume response data to free up memory
        res.resume();
        resolve({
          status: res.statusCode ?? 0,
          ok: (res.statusCode ?? 0) >= 200 && (res.statusCode ?? 0) < 400,
        });
      },
    );

    req.on("error", reject);
    req.end();
  });
}

/** Check all routes via HTTP requests over Unix socket */
async function checkRoutes(routes: string[]): Promise<RouteResult[]> {
  const results: RouteResult[] = [];
  for (const route of routes) {
    try {
      const { status } = await requestOverSocket(route);
      const ok =
        (status >= 200 && status < 400) ||
        status === expectedStatusCodes[route];
      const statusInfo = expectedStatusCodes[route]
        ? `${status} (expected ${expectedStatusCodes[route]})`
        : String(status);
      results.push({ route, status, ok });
      console.log(`  ${ok ? "✓" : "✗"} ${route} - ${statusInfo}`);
    } catch (error) {
      results.push({
        route,
        status: 0,
        ok: false,
      });
      console.log(`  ✗ ${route} - Error: ${error}`);
    }
  }
  return results;
}

/** main entry point - IIIFE to allow top-level await */
(async function main() {
  const manifestPath = path.join(siteDir, ".next", "prerender-manifest.json");
  await waitForFile(manifestPath, 120000);
  const routes = getStaticRoutesFromManifest(manifestPath);
  console.log(`Found ${routes.length} routes in manifest\n`);

  console.log("Starting Next.js server...");
  const serverProcess = await startServer();

  try {
    console.log(`> Server running at http://${serverHost}:${serverPort}\n`);
    console.log("Checking routes...");
    const results = await checkRoutes(routes);

    const passed = results.every((r) => r.ok);
    console.log(
      `\n${passed ? "PASSED" : "FAILED"}: ${results.filter((r) => r.ok).length}/${results.length} routes OK`,
    );

    process.exit(passed ? 0 : 1);
  } finally {
    serverProcess.kill();
  }
})();

/*
import { LinkChecker, type CheckOptions } from '@claycurry/linkinator';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';

type CrawlResult = ReturnType<typeof LinkChecker.prototype.check>

const config: CheckOptions = {
    path: process.env.LNK_CHECKER_URL || process.env.LINK_CHECKER_URLS?.split(',') || 'https://localhost:3000',
    linksToSkip: ['https://skip.me/'] as string[],

    recurse: true,
    timeout: 12000,
    concurrency: 10,
    checkFragments: true,
    userAgent: 'LinkChecker/1.0 (+https://example.com/link-checker)',
};


(async function () {
  const result = collectLinkMetrics(config);
  publishLinkMetrics(result);
})();


async function collectLinkMetrics(config: CheckOptions): CrawlResult {
  const __dirname = path.dirname(fileURLToPath(import.meta.url));
  const BUILD_DIR = path.join(__dirname, '..', 'dist');
  /////////////////////////////////////////////////
  // Setup build directory and output files
  /////////////////////////////////////////////////
  fs.mkdirSync(BUILD_DIR, { recursive: true });
  const linksFile = path.join(BUILD_DIR, 'links.csv');
  fs.writeFileSync(linksFile, 'url,state,status,parent\n');
  const redirectsFile = path.join(BUILD_DIR, 'redirects.csv');
  fs.writeFileSync(redirectsFile, 'url,targetUrl,status,isNonStandard\n');

  /////////////////////////////////////////////////
  // configure + hook into the link checker process
  /////////////////////////////////////////////////
  const checker = new LinkChecker();

  /**
   * link - fires after a link has been checked.
   *
   * @param event - 'link'
   * @param listener - Callback receiving the LinkResult with url, state, status, and parent
   * /
  checker.on('link', result => {
    fs.appendFileSync(linksFile, `${result.url},${result.state},${result.status},${result.parent}\n`);
  });
  /**
   * retry - fires when a request is being retried.
   *
   * @param event - 'retry'
   * @param listener - Callback receiving RetryInfo details about the retry attempt
   * /
  // on(event: 'retry', listener: (details: RetryInfo) => void): this;
  /**
   * redirect - fires when a redirect is encountered.
   *
   * @param event - 'redirect'
   * @param listener - Callback receiving RedirectInfo with redirect details
   * /
  checker.on('redirect', result => {
    fs.appendFileSync(redirectsFile, `${result.url},${result.targetUrl},${result.status},${result.isNonStandard}\n`);
  });
  /**
   * httpInsecure - fires when an HTTP (non-HTTPS) link is detected.
   * 
   * @param event - 'httpInsecure'
   * @param listener - Callback receiving HttpInsecureInfo about the insecure link
   * /
  // on(event: 'httpInsecure', listener: (details: HttpInsecureInfo) => void): this;
  /**
   * statusCodeWarning - fires when a status code warning occurs.
   * 
   * @param event - 'statusCodeWarning'
   * @param listener - Callback receiving StatusCodeWarning details
   * /
  // on(event: 'statusCodeWarning', listener: (details: StatusCodeWarning) => void): this;
  /**
   * pagestart - fires when a new page starts being scanned.
   * 
   * @param event - 'pagestart'
   * @param listener - Callback receiving the URL string of the page being scanned
   * /
  checker.on('pagestart', url => {
    console.log(`Scanning ${url}`);
  });

  ////////////////////////////////////////////////
  // Collect URL metrics
  ////////////////////////////////////////////////
  try {
    return await checker.check(config);
  } catch (error) {
    console.error('Error during link checking:', error);
    throw error;
  } finally {
    console.log(`\nResults saved to:`);
    console.log(`  Links:     ${linksFile}`);
    console.log(`  Redirects: ${redirectsFile}\n`);

  }
}

///////////////////////////////////////////////
// Display a final summary of the scan
///////////////////////////////////////////////
async function publishLinkMetrics(resultPromise: CrawlResult) {
  const result = await resultPromise;
  console.log(`NOTIFICATION: ${result.passed ? 'PASSED' : 'FAILED'}`);
  console.log(result.passed ? 'PASSED :D' : 'FAILED :(');
  console.log(`Scanned total of ${result.links.length} links!`);
  const brokeLinksCount = result.links.filter(x => x.state === 'BROKEN');
  console.log(`Detected ${brokeLinksCount.length} broken links.`);
}


*/
