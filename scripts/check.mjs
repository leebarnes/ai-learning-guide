#!/usr/bin/env node
// Offline quality checks for the built site (run `npm test`, which builds first).
//
//  • every internal link and asset reference resolves to a file in dist/
//  • every in-page #anchor exists
//  • no absolute "/..." internal URLs (they would break under a GitHub Pages sub-path)
//  • each page has exactly one <h1>, a <title>, a meta description, lang, and a main landmark
//  • images have alt attributes; ids are unique; heading levels don't skip on the way down
//  • external links open safely (rel="noopener") and use https
//  • the resource filter markup is present and consistent

import { readdir, readFile, stat } from 'node:fs/promises';
import { join, dirname, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const DIST = join(dirname(fileURLToPath(import.meta.url)), '..', 'dist');
const problems = [];
const warn = (file, msg) => problems.push(`${relative(DIST, file)}: ${msg}`);

async function walk(dir) {
  const out = [];
  for (const e of await readdir(dir, { withFileTypes: true })) {
    const p = join(dir, e.name);
    if (e.isDirectory()) out.push(...(await walk(p)));
    else out.push(p);
  }
  return out;
}

const exists = async (p) => {
  try {
    const s = await stat(p);
    return s.isDirectory() ? exists(join(p, 'index.html')) : true;
  } catch {
    return false;
  }
};

const files = (await walk(DIST)).filter((f) => f.endsWith('.html'));
const idsByFile = new Map();
let linkCount = 0;
let externalCount = 0;
const externalUrls = new Set();

for (const file of files) {
  const html = await readFile(file, 'utf8');
  const ids = [...html.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]);
  idsByFile.set(file, new Set(ids));
  const dupes = ids.filter((id, i) => ids.indexOf(id) !== i);
  if (dupes.length) warn(file, `duplicate ids: ${[...new Set(dupes)].join(', ')}`);
}

for (const file of files) {
  const html = await readFile(file, 'utf8');
  const is404 = file.endsWith('404.html');

  // Basic document structure
  if (!/<html lang="[a-z-]+"/.test(html)) warn(file, 'missing lang attribute');
  if (!/<title>[^<]+<\/title>/.test(html)) warn(file, 'missing <title>');
  if (!/<meta name="description" content="[^"]{30,}"/.test(html)) warn(file, 'missing or short meta description');
  if (!/<main id="main"/.test(html)) warn(file, 'missing <main id="main">');
  const h1s = (html.match(/<h1[\s>]/g) || []).length;
  if (h1s !== 1) warn(file, `expected exactly one <h1>, found ${h1s}`);
  for (const img of html.match(/<img\b[^>]*>/g) || []) if (!/\balt="/.test(img)) warn(file, `image without alt: ${img}`);

  // Heading order: a heading may go at most one level deeper than the previous one.
  // (.visually-hidden headings count — they exist for screen-reader structure.)
  let prev = 1;
  for (const m of html.matchAll(/<h([1-6])[\s>]/g)) {
    const level = Number(m[1]);
    if (level > prev + 1) warn(file, `heading jumps from h${prev} to h${level}`);
    prev = level;
  }

  // Links and asset references
  const baseMatch = html.match(/<base href="([^"]+)"/);
  for (const m of html.matchAll(/\s(href|src)="([^"]*)"/g)) {
    const [, attr, url] = m;
    if (!url) {
      warn(file, `empty ${attr}`);
      continue;
    }
    if (/^(mailto:|tel:|data:)/.test(url)) continue;
    if (/^https?:\/\//.test(url)) {
      externalCount++;
      externalUrls.add(url.replace(/&amp;/g, '&'));
      if (url.startsWith('http://')) warn(file, `insecure external link: ${url}`);
      continue;
    }
    if (baseMatch && attr === 'href' && url === baseMatch[1]) continue;
    linkCount++;
    if (url.startsWith('/') && !is404) {
      warn(file, `root-absolute URL breaks under a sub-path: ${url}`);
      continue;
    }
    const [pathPart, hash] = url.replace(/&amp;/g, '&').split('#');
    const cleanPath = pathPart.split('?')[0];
    // 404.html uses <base href="/">, so resolve its links from the site root.
    const fromDir = is404 ? DIST : dirname(file);
    const target = cleanPath ? resolve(fromDir, cleanPath.replace(/^\//, '')) : file;
    if (!target.startsWith(DIST)) {
      warn(file, `link escapes the site root: ${url}`);
      continue;
    }
    if (!(await exists(target))) {
      warn(file, `broken internal link: ${url}`);
      continue;
    }
    if (hash) {
      const targetFile = target.endsWith('.html') ? target : join(target, 'index.html');
      if (!idsByFile.get(targetFile)?.has(hash)) warn(file, `missing anchor #${hash} (from ${url})`);
    }
  }

  // External links opened in new tabs must carry rel="noopener"
  for (const a of html.match(/<a\b[^>]*target="_blank"[^>]*>/g) || [])
    if (!/rel="[^"]*noopener/.test(a)) warn(file, `target=_blank without noopener: ${a}`);
}

// Resource page sanity
const resHtml = await readFile(join(DIST, 'resources/index.html'), 'utf8');
const listMatch = resHtml.match(/<ul class="resource-grid" id="resource-list">([\s\S]*?)<\/ul>\s*<p class="empty-state"/);
const cards = listMatch ? (listMatch[1].match(/class="resource-card"/g) || []).length : 0;
if (cards < 10) problems.push(`resources/index.html: expected the full resource list, found ${cards} cards`);
for (const name of ['stage', 'topic', 'role', 'level', 'scope', 'cost'])
  if (!resHtml.includes(`name="${name}"`)) problems.push(`resources/index.html: missing filter "${name}"`);

// Each role should have at least some resources tagged for it (so the role filter is never empty)
for (const role of ['product-owner', 'project-manager', 'data-analyst', 'business-analyst']) {
  const n = [...resHtml.matchAll(/data-roles="([^"]*)"/g)].filter((m) => m[1].split(' ').includes(role)).length;
  if (n < 3) problems.push(`resources: only ${n} resources tagged for role "${role}"`);
}

console.log(
  `Checked ${files.length} pages, ${linkCount} internal links/assets, ${externalCount} external links (${externalUrls.size} unique).`,
);
if (problems.length) {
  console.error(`\n${problems.length} problem(s):\n  - ` + problems.join('\n  - '));
  process.exit(1);
}
console.log('All checks passed.');
