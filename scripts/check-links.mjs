#!/usr/bin/env node
// Checks every external URL in src/content/resources.mjs (and provider homepages) over the network.
//
//   npm run check:links
//
// Results fall into four groups:
//   ✓ OK          the page loaded at the URL we link to
//   → Redirected  the page loaded, but at a different final URL — update the link, or if the
//                 redirect is deliberate and stable, add `redirectOk: true` to that entry
//   ? Blocked     the site refuses automated requests (HTTP 401/403/429/503) — check by hand
//   ✗ Failed      404/410, other errors, DNS failures or timeouts — fix or remove
//
// Some sites answer automated requests with misleading errors (Kaggle returns 404 even for its
// homepage). Entries marked `blocksBots: true` report any non-2xx response as Blocked, not Failed.
//
// Only "Failed" makes the script exit non-zero.
//
// Optional environment variables (used by .github/workflows/check-links.yml):
//   LINK_REPORT=path.md   also write a Markdown report to this file
//   GITHUB_OUTPUT         (set by GitHub Actions) receives failed/redirected/blocked/actionable counts
//   GITHUB_STEP_SUMMARY   (set by GitHub Actions) receives the Markdown report for the run page

import { appendFile, writeFile } from 'node:fs/promises';
import { resources, providers } from '../src/content/resources.mjs';

// url → { id, redirectOk }
const urls = new Map();
for (const r of resources) urls.set(r.url, { id: r.id, redirectOk: !!r.redirectOk, blocksBots: !!r.blocksBots });
for (const [id, p] of Object.entries(providers))
  if (!urls.has(p.url)) urls.set(p.url, { id: `provider:${id}`, redirectOk: !!p.redirectOk, blocksBots: !!p.blocksBots });

const UA = 'Mozilla/5.0 (compatible; link-checker)';
const results = { ok: [], redirected: [], blocked: [], failed: [] };

const normalize = (u) => {
  try {
    const x = new URL(u);
    return (x.host.toLowerCase() + x.pathname).replace(/\/$/, '') + x.search;
  } catch {
    return u;
  }
};

async function check(url, { id, redirectOk, blocksBots }) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 20000);
  try {
    let res = await fetch(url, { method: 'HEAD', redirect: 'follow', signal: ctrl.signal, headers: { 'User-Agent': UA } });
    if (res.status === 405 || res.status === 403 || res.status === 400)
      res = await fetch(url, { method: 'GET', redirect: 'follow', signal: ctrl.signal, headers: { 'User-Agent': UA } });
    const s = res.status;
    if (s >= 200 && s < 300) {
      const moved = res.url && normalize(res.url) !== normalize(url);
      if (moved && !redirectOk) results.redirected.push({ id, url, note: res.url });
      else results.ok.push({ id, url, note: moved ? `expected redirect → ${res.url}` : '' });
    } else if ([401, 403, 429, 503].includes(s)) results.blocked.push({ id, url, note: `HTTP ${s}` });
    else if (blocksBots) results.blocked.push({ id, url, note: `HTTP ${s} (site is known to block automated checks)` });
    else results.failed.push({ id, url, note: `HTTP ${s}` });
  } catch (e) {
    results.failed.push({ id, url, note: e.name === 'AbortError' ? 'timeout after 20s' : e.cause?.code || e.message });
  } finally {
    clearTimeout(timer);
  }
}

const entries = [...urls.entries()];
for (let i = 0; i < entries.length; i += 6) await Promise.all(entries.slice(i, i + 6).map(([u, meta]) => check(u, meta)));
for (const list of Object.values(results)) list.sort((a, b) => a.id.localeCompare(b.id));

// ── Console output ──────────────────────────────────────────────────────────
const print = (label, list) => {
  if (!list.length) return;
  console.log(`\n${label} (${list.length})`);
  for (const r of list) console.log(`  ${r.id.padEnd(28)} ${r.url} ${r.note}`);
};
print('✗ Failed — fix or remove', results.failed);
print('→ Redirected — update the URL (or mark redirectOk if deliberate)', results.redirected);
print('? Blocked automated access — check by hand in a browser', results.blocked);
const counts = {
  ok: results.ok.length,
  redirected: results.redirected.length,
  blocked: results.blocked.length,
  failed: results.failed.length,
};
console.log(`\n✓ ${counts.ok} OK, ${counts.redirected} redirected, ${counts.blocked} blocked, ${counts.failed} failed`);

// ── Markdown report ─────────────────────────────────────────────────────────
const table = (list, noteHeader) =>
  `| Resource id | Link | ${noteHeader} |\n| --- | --- | --- |\n` +
  list.map((r) => `| \`${r.id}\` | ${r.url} | ${String(r.note).replace(/\|/g, '\\|')} |`).join('\n');

const runUrl =
  process.env.GITHUB_SERVER_URL && process.env.GITHUB_REPOSITORY && process.env.GITHUB_RUN_ID
    ? `${process.env.GITHUB_SERVER_URL}/${process.env.GITHUB_REPOSITORY}/actions/runs/${process.env.GITHUB_RUN_ID}`
    : '';

const report = [
  `## Learning-resource link check — ${new Date().toISOString().slice(0, 10)}`,
  '',
  `**${counts.failed} failed · ${counts.redirected} redirected · ${counts.blocked} blocked · ${counts.ok} OK** (${urls.size} links checked)${runUrl ? ` · [run log](${runUrl})` : ''}`,
  '',
  counts.failed
    ? `### ✗ Failed — fix or remove\n\nThese returned an error. Find the entry by its id in \`src/content/resources.mjs\`, then update the URL or remove the entry (and its id from \`stages.mjs\` / \`roles.mjs\`).\n\n${table(results.failed, 'Error')}`
    : '### ✓ No broken links',
  '',
  counts.redirected
    ? `### → Redirected — update the link\n\nThese still work but now land somewhere else. Usually the provider moved the page: replace the URL with the new one. If the redirect is deliberate and stable, add \`redirectOk: true\` to the entry instead.\n\n${table(results.redirected, 'Now lands at')}`
    : '',
  '',
  counts.blocked
    ? `<details><summary><strong>? Blocked automated checks (${counts.blocked}) — check these by hand occasionally</strong></summary>\n\nThese sites refuse automated requests, so the checker can’t tell whether the page still exists. This is expected for some providers (e.g. PMI, DataCamp, OpenAI help centre, Kaggle) and does not by itself need action. Open them in a browser every few months.\n\n${table(results.blocked, 'Response')}\n\n</details>`
    : '',
  '',
  'After fixing links, update `lastReviewed` at the top of `src/content/resources.mjs` and push to `main` to redeploy.',
  '',
]
  .filter((line, i, arr) => !(line === '' && arr[i - 1] === ''))
  .join('\n');

if (process.env.LINK_REPORT) await writeFile(process.env.LINK_REPORT, report);
if (process.env.GITHUB_STEP_SUMMARY) await appendFile(process.env.GITHUB_STEP_SUMMARY, report + '\n');
if (process.env.GITHUB_OUTPUT)
  await appendFile(
    process.env.GITHUB_OUTPUT,
    `failed=${counts.failed}\nredirected=${counts.redirected}\nblocked=${counts.blocked}\nactionable=${counts.failed + counts.redirected}\n`,
  );

process.exit(counts.failed ? 1 : 0);
