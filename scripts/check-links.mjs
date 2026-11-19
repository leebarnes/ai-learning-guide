#!/usr/bin/env node
// Checks every external URL in src/content/resources.mjs (and provider homepages) over the network.
//
//   npm run check:links
//
// Some providers block automated requests (HTTP 403/429, bot challenges). Those are reported as
// "blocked — check by hand", not as failures. Only clear failures (404/410, DNS errors, timeouts)
// make the script exit non-zero. Run it every month or two and fix or replace anything flagged.

import { resources, providers } from '../src/content/resources.mjs';

const urls = new Map();
for (const r of resources) urls.set(r.url, r.id);
for (const [id, p] of Object.entries(providers)) if (!urls.has(p.url)) urls.set(p.url, `provider:${id}`);

const UA = 'Mozilla/5.0 (compatible; link-checker)';
const results = { ok: [], redirected: [], blocked: [], failed: [] };

async function check(url, id) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 20000);
  try {
    let res = await fetch(url, { method: 'HEAD', redirect: 'follow', signal: ctrl.signal, headers: { 'User-Agent': UA } });
    if (res.status === 405 || res.status === 403 || res.status === 400)
      res = await fetch(url, { method: 'GET', redirect: 'follow', signal: ctrl.signal, headers: { 'User-Agent': UA } });
    const s = res.status;
    if (s >= 200 && s < 300) {
      const moved = res.url && res.url.replace(/\/$/, '') !== url.replace(/\/$/, '');
      (moved ? results.redirected : results.ok).push({ id, url, note: moved ? `→ ${res.url}` : '' });
    } else if ([401, 403, 429, 503].includes(s)) results.blocked.push({ id, url, note: `HTTP ${s}` });
    else results.failed.push({ id, url, note: `HTTP ${s}` });
  } catch (e) {
    results.failed.push({ id, url, note: e.name === 'AbortError' ? 'timeout' : e.cause?.code || e.message });
  } finally {
    clearTimeout(timer);
  }
}

const entries = [...urls.entries()];
for (let i = 0; i < entries.length; i += 6) await Promise.all(entries.slice(i, i + 6).map(([u, id]) => check(u, id)));

const print = (label, list) => {
  if (!list.length) return;
  console.log(`\n${label} (${list.length})`);
  for (const r of list) console.log(`  ${r.id.padEnd(28)} ${r.url} ${r.note}`);
};
print('✗ Failed — fix or remove', results.failed);
print('? Blocked automated access — check by hand in a browser', results.blocked);
print('→ Redirected — consider updating to the final URL', results.redirected);
console.log(`\n✓ ${results.ok.length} OK, ${results.redirected.length} redirected, ${results.blocked.length} blocked, ${results.failed.length} failed`);
process.exit(results.failed.length ? 1 : 0);
