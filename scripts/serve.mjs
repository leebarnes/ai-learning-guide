#!/usr/bin/env node
// Minimal static server for previewing dist/ — no dependencies.
//
//   npm run serve                      → http://localhost:4321/
//   BASE=/ai-learning-guide/ npm run serve
//                                      → http://localhost:4321/ai-learning-guide/
//     (simulates a GitHub Pages project sub-path, to prove relative links work)

import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { extname, join, normalize, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const DIST = join(dirname(fileURLToPath(import.meta.url)), '..', 'dist');
const PORT = Number(process.env.PORT) || 4321;
const BASE = (process.env.BASE || '/').replace(/\/?$/, '/');

const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.xml': 'application/xml',
  '.txt': 'text/plain; charset=utf-8',
};

createServer(async (req, res) => {
  const url = new URL(req.url, 'http://localhost');
  let path = decodeURIComponent(url.pathname);

  if (!path.startsWith(BASE)) {
    if (path === '/' && BASE !== '/') {
      res.writeHead(302, { Location: BASE });
      return res.end();
    }
    return notFound(res);
  }
  path = path.slice(BASE.length - 1);

  // Mirror GitHub Pages: "/journey" → redirect to "/journey/".
  let file = normalize(join(DIST, path));
  if (!file.startsWith(DIST)) return notFound(res);
  try {
    const s = await stat(file);
    if (s.isDirectory()) {
      if (!url.pathname.endsWith('/')) {
        res.writeHead(301, { Location: url.pathname + '/' + url.search });
        return res.end();
      }
      file = join(file, 'index.html');
    }
    const body = await readFile(file);
    res.writeHead(200, { 'Content-Type': TYPES[extname(file)] || 'application/octet-stream' });
    res.end(body);
  } catch {
    notFound(res);
  }
}).listen(PORT, () => {
  console.log(`Serving dist/ at http://localhost:${PORT}${BASE}`);
});

async function notFound(res) {
  try {
    res.writeHead(404, { 'Content-Type': TYPES['.html'] });
    res.end(await readFile(join(DIST, '404.html')));
  } catch {
    res.writeHead(404);
    res.end('Not found');
  }
}
