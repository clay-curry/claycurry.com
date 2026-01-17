import { createServer } from 'http';
import { parse } from 'url';
import next from 'next';
import fs from 'fs';

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

// Get socket path from command line args or environment variable
const socketPath = process.argv[2] || process.env.SOCKET_PATH || '/tmp/nextjs-link-checker.sock';

app.prepare().then(() => {
  // Remove existing socket file if it exists
  if (fs.existsSync(socketPath)) {
    fs.unlinkSync(socketPath);
  }

  const server = createServer((req, res) => {
    const parsedUrl = parse(req.url, true);
    handle(req, res, parsedUrl);
  });

  server.listen(socketPath, () => {
    // Set socket permissions to allow access
    fs.chmodSync(socketPath, 0o666);
    console.log(`> Ready on ${socketPath}`);
  });

  // Clean up socket on exit
  process.on('SIGTERM', () => {
    server.close();
    if (fs.existsSync(socketPath)) {
      fs.unlinkSync(socketPath);
    }
    process.exit(0);
  });

  process.on('SIGINT', () => {
    server.close();
    if (fs.existsSync(socketPath)) {
      fs.unlinkSync(socketPath);
    }
    process.exit(0);
  });
});
