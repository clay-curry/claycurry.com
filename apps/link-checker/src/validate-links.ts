import { createServer, type IncomingMessage, type ServerResponse, type Server } from 'http';
import next from 'next';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const siteDir = path.resolve(__dirname, '../../site');

// Change working directory to site so Next.js can resolve its config and dependencies
process.chdir(siteDir);

// Use production mode to avoid MDX loader issues with Bun
const app = next({ dev: false, dir: siteDir });
const handle = app.getRequestHandler();

// Hard-coded list of routes to check
const ROUTES_TO_CHECK = [
  '/',
  '/about',
  '/blog',
  '/projects',
  '/contact',
];

type RouteResult = {
  route: string;
  status: number;
  ok: boolean;
};

/**
 * Start the Next.js server on a Unix socket (no port needed)
 */
async function startServer(): Promise<{ server: Server; socketPath: string }> {
  await app.prepare();

  const server = createServer((req: IncomingMessage, res: ServerResponse) => {
    handle(req, res);
  });

  // Use a Unix socket instead of a port
  const socketPath = `/tmp/next-link-checker-${process.pid}.sock`;

  // Remove existing socket file if it exists
  const fs = await import('fs');
  if (fs.existsSync(socketPath)) {
    fs.unlinkSync(socketPath);
  }

  await new Promise<void>((resolve) => {
    server.listen(socketPath, () => {
      console.log(`> Server listening on Unix socket: ${socketPath}`);
      resolve();
    });
  });

  return { server, socketPath };
}

/**
 * Check all routes via HTTP requests over Unix socket
 */
async function checkRoutes(socketPath: string): Promise<RouteResult[]> {
  const results: RouteResult[] = [];
  const http = await import('http');

  for (const route of ROUTES_TO_CHECK) {
    try {
      const result = await new Promise<RouteResult>((resolve) => {
        const req = http.request(
          {
            socketPath,
            path: route,
            method: 'GET',
            headers: { host: 'localhost' },
          },
          (res) => {
            // Consume the response body
            res.on('data', () => {});
            res.on('end', () => {
              resolve({
                route,
                status: res.statusCode || 0,
                ok: (res.statusCode || 0) >= 200 && (res.statusCode || 0) < 400,
              });
            });
          }
        );
        req.on('error', () => {
          resolve({ route, status: 0, ok: false });
        });
        req.end();
      });

      results.push(result);
      console.log(`  ${result.ok ? '✓' : '✗'} ${route} - ${result.status}`);
    } catch (error) {
      results.push({ route, status: 0, ok: false });
      console.log(`  ✗ ${route} - Error: ${error}`);
    }
  }

  return results;
}

// Main entry point
(async function main() {
  const { server, socketPath } = await startServer();

  console.log('\nChecking routes...');
  const results = await checkRoutes(socketPath);

  const passed = results.every((r) => r.ok);
  console.log(`\n${passed ? 'PASSED' : 'FAILED'}: ${results.filter((r) => r.ok).length}/${results.length} routes OK`);

  server.close();

  // Clean up socket file
  const fs = await import('fs');
  if (fs.existsSync(socketPath)) {
    fs.unlinkSync(socketPath);
  }

  process.exit(passed ? 0 : 1);
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

////////////////////////////////////////////////
// IIIFE to allow top-level await
////////////////////////////////////////////////
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