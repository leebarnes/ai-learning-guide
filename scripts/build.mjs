#!/usr/bin/env node
// Static site generator for AI Advantage. Zero dependencies — just Node.js.
//
//   node scripts/build.mjs        → writes the site to dist/
//
// Content lives in src/content/*.mjs, styles and scripts in src/assets/.
// All internal links are written as *relative* URLs, so the built site works at a domain root
// or under any sub-path (e.g. https://user.github.io/ai-learning-guide/) without configuration.

import { mkdir, rm, writeFile, cp } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { site, phases, nav } from '../src/content/site.mjs';
import { stages } from '../src/content/stages.mjs';
import { roles } from '../src/content/roles.mjs';
import { resources, providers, topics, lastReviewed } from '../src/content/resources.mjs';
import { home, groundRules } from '../src/content/pages.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const OUT = join(ROOT, 'dist');

// ─── Validation ──────────────────────────────────────────────────────────────
// Fail loudly on content mistakes so they never reach the live site.

const errors = [];
const resourceById = new Map();
const LEVELS = ['beginner', 'intermediate', 'advanced', 'all'];
const COSTS = ['free', 'free-account', 'freemium', 'paid'];
const SCOPES = ['neutral', 'vendor'];
const roleSlugs = roles.map((r) => r.slug);

for (const r of resources) {
  if (resourceById.has(r.id)) errors.push(`Duplicate resource id "${r.id}"`);
  resourceById.set(r.id, r);
  for (const f of ['id', 'title', 'provider', 'url', 'summary', 'format', 'cost', 'level', 'scope'])
    if (!r[f]) errors.push(`Resource "${r.id}" is missing "${f}"`);
  if (!providers[r.provider]) errors.push(`Resource "${r.id}" has unknown provider "${r.provider}"`);
  if (!/^https:\/\//.test(r.url)) errors.push(`Resource "${r.id}" URL must start with https://`);
  if (!LEVELS.includes(r.level)) errors.push(`Resource "${r.id}" has invalid level "${r.level}"`);
  if (!COSTS.includes(r.cost)) errors.push(`Resource "${r.id}" has invalid cost "${r.cost}"`);
  if (!SCOPES.includes(r.scope)) errors.push(`Resource "${r.id}" has invalid scope "${r.scope}"`);
  for (const t of r.topics || []) if (!topics[t]) errors.push(`Resource "${r.id}" has unknown topic "${t}"`);
  for (const s of r.stages || []) if (!stages.some((st) => st.number === s)) errors.push(`Resource "${r.id}" has unknown stage ${s}`);
  for (const role of r.roles || []) if (!roleSlugs.includes(role)) errors.push(`Resource "${r.id}" has unknown role "${role}"`);
}
const checkRefs = (where, ids) => {
  for (const id of ids || []) if (!resourceById.has(id)) errors.push(`${where} references unknown resource "${id}"`);
};
stages.forEach((s) => checkRefs(`Stage ${s.number}`, s.resources));
roles.forEach((r) => checkRefs(`Role ${r.slug}`, r.resources));
checkRefs('Home start paths', home.startPaths.map((p) => p.resource));
roles.forEach((r) =>
  r.learningAreas.forEach((a) => {
    if (!stages.some((s) => s.number === a.stage)) errors.push(`Role ${r.slug} references unknown stage ${a.stage}`);
  }),
);

if (errors.length) {
  console.error('\nContent errors:\n  - ' + errors.join('\n  - ') + '\n');
  process.exit(1);
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

const esc = (s = '') =>
  String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const isExternal = (url) => /^https?:\/\//.test(url);

/** Build a relative URL from the current page to a site path such as "journey/" or "". */
const linkTo = (root, path = '') => (root + path) || './';

/** Inline formatting: **bold**, `code`, [text](url). "/path" links are site-relative. */
function inline(text, root) {
  let s = esc(text);
  s = s.replace(/`([^`]+)`/g, '<code>$1</code>');
  s = s.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  s = s.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_, label, url) => {
    const raw = url.replace(/&amp;/g, '&');
    if (raw.startsWith('/')) return `<a href="${esc(linkTo(root, raw.slice(1)))}">${label}</a>`;
    return extLink(raw, label);
  });
  return s;
}

const paras = (text, root) =>
  text
    .split(/\n\n+/)
    .map((p) => `<p>${inline(p, root)}</p>`)
    .join('\n');

const icon = {
  external:
    '<svg class="icon icon-ext" viewBox="0 0 16 16" aria-hidden="true" focusable="false"><path d="M6 3h7v7M13 3 5.5 10.5M11 9.5V13H3V5h3.5" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  arrow:
    '<svg class="icon" viewBox="0 0 16 16" aria-hidden="true" focusable="false"><path d="M3 8h10M9 4l4 4-4 4" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  back:
    '<svg class="icon" viewBox="0 0 16 16" aria-hidden="true" focusable="false"><path d="M13 8H3M7 4 3 8l4 4" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  check:
    '<svg class="icon icon-check" viewBox="0 0 16 16" aria-hidden="true" focusable="false"><path d="m3.5 8.5 3 3 6-7" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  alert:
    '<svg class="icon" viewBox="0 0 16 16" aria-hidden="true" focusable="false"><path d="M8 2 1.5 13.5h13L8 2Zm0 4.5v3.2m0 2v.1" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  menu:
    '<svg class="icon" viewBox="0 0 20 20" aria-hidden="true" focusable="false"><path d="M3 6h14M3 10h14M3 14h14" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>',
  theme:
    '<svg class="icon" viewBox="0 0 20 20" aria-hidden="true" focusable="false"><circle cx="10" cy="10" r="7" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="M10 3a7 7 0 0 1 0 14Z" fill="currentColor"/></svg>',
};

function extLink(url, label, cls = '') {
  return `<a href="${esc(url)}"${cls ? ` class="${cls}"` : ''} target="_blank" rel="noopener">${label}${icon.external}<span class="visually-hidden"> (opens in a new tab)</span></a>`;
}

const LABELS = {
  level: { beginner: 'Beginner', intermediate: 'Intermediate', advanced: 'Advanced', all: 'All levels' },
  cost: { free: 'Free', 'free-account': 'Free · account', freemium: 'Free to start', paid: 'Paid' },
  scope: { neutral: 'Vendor-neutral', vendor: 'Vendor-specific' },
  format: {
    course: 'Course',
    path: 'Learning path',
    catalog: 'Catalog',
    docs: 'Documentation',
    newsletter: 'Newsletter',
    tutorial: 'Tutorial',
    data: 'Datasets',
    certification: 'Certification',
    framework: 'Framework',
    blog: 'News & blog',
  },
};

// A resource counts toward a stage/role if it is tagged with it OR recommended on that stage/role page.
const effectiveStages = (r) =>
  [...new Set([...(r.stages || []), ...stages.filter((s) => s.resources.includes(r.id)).map((s) => s.number)])].sort();
const effectiveRoles = (r) => [...new Set([...(r.roles || []), ...roles.filter((ro) => ro.resources.includes(r.id)).map((ro) => ro.slug)])];

const phaseOf = (stage) => phases.find((p) => p.stages.includes(stage.number));
const stageByNumber = (n) => stages.find((s) => s.number === n);

// ─── Components ──────────────────────────────────────────────────────────────

function resourceCard(r, root, { headingLevel = 3 } = {}) {
  const p = providers[r.provider];
  const h = `h${headingLevel}`;
  const data = [
    `data-stages="${effectiveStages(r).join(' ')}"`,
    `data-topics="${(r.topics || []).join(' ')}"`,
    `data-roles="${effectiveRoles(r).join(' ')}"`,
    `data-level="${r.level}"`,
    `data-scope="${r.scope}"`,
    `data-cost="${r.cost}"`,
  ].join(' ');
  return `<li class="resource-card" ${data}>
  <p class="resource-provider">${esc(p.name)}<span class="resource-format"> · ${LABELS.format[r.format] || esc(r.format)}</span></p>
  <${h} class="resource-title">${extLink(r.url, esc(r.title), 'stretched')}</${h}>
  <p class="resource-summary">${inline(r.summary, root)}</p>
  <ul class="badges" aria-label="Details">
    <li class="badge badge-level-${r.level}">${LABELS.level[r.level]}</li>
    <li class="badge badge-cost-${r.cost}">${LABELS.cost[r.cost]}</li>
    <li class="badge badge-scope-${r.scope}">${LABELS.scope[r.scope]}</li>
  </ul>
</li>`;
}

const resourceList = (ids, root, opts) =>
  `<ul class="resource-grid">${ids.map((id) => resourceCard(resourceById.get(id), root, opts)).join('\n')}</ul>`;

/** The six-stage journey track, grouped by phase. Used on Home, Journey and stage pages. */
function journeyTrack(root, { current = null, compact = false } = {}) {
  return `<ol class="track${compact ? ' track-compact' : ''}" aria-label="The six learning stages">
${phases
  .map(
    (ph) => `  <li class="track-phase phase-${ph.id}">
    <span class="track-phase-label">${esc(ph.label)}</span>
    <ol class="track-stages">
${ph.stages
  .map((n) => {
    const s = stageByNumber(n);
    const isCurrent = current === n;
    return `      <li class="track-stage${isCurrent ? ' is-current' : ''}">
        <a href="${linkTo(root, `journey/${s.slug}/`)}"${isCurrent ? ' aria-current="page"' : ''}>
          <span class="track-num" aria-hidden="true">${s.number}</span>
          <span class="track-text"><span class="visually-hidden">Stage ${s.number}: </span><span class="track-title">${esc(s.title)}</span>${
            compact ? '' : `<span class="track-short">${esc(s.short)}</span>`
          }</span>
        </a>
      </li>`;
  })
  .join('\n')}
    </ol>
  </li>`,
  )
  .join('\n')}
</ol>`;
}

function promptBlock(prompt, label = 'Example prompt') {
  return `<figure class="prompt">
  <figcaption><span>${esc(label)}</span><button type="button" class="copy-btn" data-copy hidden>Copy</button></figcaption>
  <pre><code>${esc(prompt)}</code></pre>
</figure>`;
}

function exercise(ex, root) {
  return `<article class="exercise">
  <header><h3>${esc(ex.title)}</h3>${ex.time ? `<p class="exercise-time">About ${esc(ex.time)}</p>` : ''}</header>
  ${ex.text ? `<p>${inline(ex.text, root)}</p>` : ''}
  ${ex.steps ? `<ol class="steps">${ex.steps.map((s) => `<li>${inline(s, root)}</li>`).join('')}</ol>` : ''}
  ${ex.prompt ? promptBlock(ex.prompt, 'Starter prompt — adapt it') : ''}
</article>`;
}

const safetyNote = (root) =>
  `<aside class="callout callout-safety" aria-label="Safety reminder">${icon.alert}<p>Use synthetic or public data for every exercise. Never upload employer or client information to a personal AI account without authorization. <a href="${linkTo(root, 'ground-rules/')}">Read the ground rules</a>.</p></aside>`;

// ─── Layout ──────────────────────────────────────────────────────────────────

const THEME_BOOT = `(function(){try{var t=localStorage.getItem('theme');if(t==='light'||t==='dark')document.documentElement.dataset.theme=t;}catch(e){}document.documentElement.classList.add('js');})();`;

function layout({ title, description, path, active, body, base = null }) {
  const depth = path.split('/').filter(Boolean).length;
  const root = base ? '' : depth ? '../'.repeat(depth) : '';
  const pageTitle = title ? `${title} · ${site.name}` : `${site.name} — ${site.tagline}`;
  const desc = description || site.description;
  const absUrl = site.url ? new URL(path, site.url.endsWith('/') ? site.url : site.url + '/').href : '';
  const asset = (p) => esc(linkTo(root, p));

  const navItems = nav
    .map((n) => {
      const cur = active === n.path;
      return `<li><a href="${esc(linkTo(root, n.path))}"${cur ? ' aria-current="page"' : ''}>${esc(n.label)}</a></li>`;
    })
    .join('');

  return `<!doctype html>
<html lang="${site.lang}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(pageTitle)}</title>
<meta name="description" content="${esc(desc)}">
${base ? `<base href="${esc(base)}">` : ''}
<meta name="color-scheme" content="light dark">
<meta name="theme-color" content="#f7f6f2" media="(prefers-color-scheme: light)">
<meta name="theme-color" content="#14171c" media="(prefers-color-scheme: dark)">
${absUrl ? `<link rel="canonical" href="${esc(absUrl)}">` : ''}
<meta property="og:type" content="website">
<meta property="og:site_name" content="${esc(site.name)}">
<meta property="og:title" content="${esc(title || site.name)}">
<meta property="og:description" content="${esc(desc)}">
${absUrl ? `<meta property="og:url" content="${esc(absUrl)}">` : ''}
<meta name="twitter:card" content="summary">
<meta name="twitter:title" content="${esc(title || site.name)}">
<meta name="twitter:description" content="${esc(desc)}">
<link rel="icon" href="${asset('assets/favicon.svg')}" type="image/svg+xml">
<link rel="stylesheet" href="${asset('assets/styles.css')}">
<script>${THEME_BOOT}</script>
<script src="${asset('assets/app.js')}" defer></script>
</head>
<body>
<a class="skip-link" href="#main">Skip to content</a>
<header class="site-header">
  <div class="container header-inner">
    <a class="brand" href="${esc(linkTo(root, ''))}"${path === '' ? ' aria-current="page"' : ''}>
      <img src="${asset('assets/favicon.svg')}" alt="" width="28" height="28">
      <span>${esc(site.name)}</span>
    </a>
    <button type="button" class="nav-toggle icon-btn" aria-expanded="false" aria-controls="site-nav" hidden>${icon.menu}<span class="visually-hidden">Menu</span></button>
    <nav id="site-nav" class="site-nav" aria-label="Main">
      <ul>${navItems}</ul>
    </nav>
    <button type="button" class="theme-toggle icon-btn" hidden aria-label="Switch colour theme">${icon.theme}</button>
  </div>
</header>
<main id="main" tabindex="-1">
${body(root)}
</main>
<footer class="site-footer">
  <div class="container footer-inner">
    <div>
      <p class="footer-brand">${esc(site.name)}</p>
      <p class="footer-tagline">${esc(site.tagline)}</p>
    </div>
    <nav aria-label="Footer">
      <ul>
        <li><a href="${esc(linkTo(root, ''))}">Home</a></li>
        ${nav.map((n) => `<li><a href="${esc(linkTo(root, n.path))}">${esc(n.label)}</a></li>`).join('')}
      </ul>
    </nav>
    <p class="footer-note">An independent learning guide, not affiliated with any AI vendor or training provider. Course availability and pricing change — check the provider’s site. Resource links reviewed ${esc(lastReviewed)}.</p>
  </div>
</footer>
</body>
</html>
`;
}

// ─── Pages ───────────────────────────────────────────────────────────────────

const pages = [];
const page = (p) => pages.push(p);

// Home ----------------------------------------------------------------------
page({
  path: '',
  active: '',
  title: '',
  body: (root) => {
    const primary = Object.entries(providers).filter(([, p]) => p.tier === 'primary');
    const supplementary = Object.entries(providers).filter(([, p]) => p.tier === 'supplementary');
    return `
<section class="hero">
  <div class="container">
    <p class="eyebrow">A self-directed AI learning guide for IT professionals</p>
    <h1 class="hero-title">${site.tagline.split('. ').map((t) => `<span>${esc(t.replace(/\.$/, ''))}.</span>`).join(' ')}</h1>
    <p class="lead">${inline(home.intro, root)}</p>
    <div class="cta-row">
      <a class="btn btn-primary" href="#start">Find where to begin ${icon.arrow}</a>
      <a class="btn btn-secondary" href="${linkTo(root, 'roles/')}">Learn for your role</a>
    </div>
  </div>
</section>

<section class="section section-tint" aria-labelledby="journey-h">
  <div class="container">
    <div class="section-head">
      <h2 id="journey-h">The learning journey</h2>
      <p>Six stages, from understanding AI to leading its adoption. Explore them in any order — they describe a direction, not a syllabus.</p>
    </div>
    ${journeyTrack(root)}
    <p class="section-more"><a href="${linkTo(root, 'journey/')}">How the stages fit together ${icon.arrow}</a></p>
  </div>
</section>

<section class="section" id="start" aria-labelledby="start-h">
  <div class="container">
    <div class="section-head">
      <h2 id="start-h">Where to begin</h2>
      <p>Pick the description that fits you best. Each comes with one good, free place to start.</p>
    </div>
    <ul class="start-grid">
${home.startPaths
  .map((sp) => {
    const r = resourceById.get(sp.resource);
    return `      <li class="start-card">
        <h3>${esc(sp.label)}</h3>
        <p>${inline(sp.text, root)}</p>
        <p class="start-resource"><span class="start-resource-label">Recommended start</span>${extLink(r.url, esc(r.title))}<span class="start-resource-meta">${esc(providers[r.provider].name)} · ${LABELS.cost[r.cost]}</span></p>
        <a class="text-link" href="${linkTo(root, sp.link)}">${esc(sp.linkText)} ${icon.arrow}</a>
      </li>`;
  })
  .join('\n')}
    </ul>
  </div>
</section>

<section class="section section-tint" aria-labelledby="roles-h">
  <div class="container">
    <div class="section-head">
      <h2 id="roles-h">Learn for your role</h2>
      <p>Practical use cases, exercises and projects tailored to four common IT roles.</p>
    </div>
    <ul class="role-grid">
${roles
  .map(
    (r) => `      <li class="role-card">
        <h3><a class="stretched" href="${linkTo(root, `roles/${r.slug}/`)}">${esc(r.title)}</a></h3>
        <p>${esc(r.short)}</p>
        <span class="card-arrow" aria-hidden="true">${icon.arrow}</span>
      </li>`,
  )
  .join('\n')}
    </ul>
  </div>
</section>

<section class="section" aria-labelledby="providers-h">
  <div class="container">
    <div class="section-head">
      <h2 id="providers-h">Where the learning happens</h2>
      <p>This guide points you to training maintained by established providers rather than reproducing it. These three are the best general starting points.</p>
    </div>
    <ul class="provider-grid">
${primary
  .map(
    ([, p]) => `      <li class="provider-card">
        <h3>${extLink(p.url, esc(p.name), 'stretched')}</h3>
        <p>${esc(p.bestFor)}</p>
        <p class="provider-cost">${esc(p.cost)}</p>
      </li>`,
  )
  .join('\n')}
    </ul>
    <p class="provider-more">Also useful: ${supplementary.map(([, p]) => extLink(p.url, esc(p.name))).join(', ')}. <a href="${linkTo(root, 'resources/')}">Browse all resources</a>.</p>
  </div>
</section>

<section class="section section-tint" aria-labelledby="principles-h">
  <div class="container">
    <h2 id="principles-h" class="visually-hidden">How this guide works</h2>
    <ul class="principles">
${home.principles.map((p) => `      <li><h3>${esc(p.title)}</h3><p>${inline(p.text, root)}</p></li>`).join('\n')}
    </ul>
  </div>
</section>`;
  },
});

// Journey overview ------------------------------------------------------------
const ladder = [
  { name: 'Prompt', stage: 1, text: 'You ask, it answers. You supply all the context every time.' },
  { name: 'Reusable instructions', stage: 3, text: 'Standing instructions and project knowledge. You stop repeating yourself.' },
  { name: 'Skill', stage: 3, text: 'A packaged, tested task definition the assistant loads when it is relevant.' },
  { name: 'Workflow', stage: 3, text: 'Several checked steps in a fixed order. Predictable and easy to verify.' },
  { name: 'Agent', stage: 4, text: 'The AI decides which steps and tools to use towards a goal. More flexible, less predictable.' },
  { name: 'Code', stage: 5, text: 'A script or app that runs the same way every time — often written with an AI coding agent.' },
];

page({
  path: 'journey/',
  active: 'journey/',
  title: 'The learning journey',
  description: 'Six stages for building practical AI skill — understand, apply, build reusable workflows, understand agents, explore AI-assisted coding, and lead adoption.',
  body: (root) => `
<section class="page-head">
  <div class="container">
    <p class="eyebrow">Learning journey</p>
    <h1>Six stages, any order</h1>
    <p class="lead">Each stage builds a distinct capability. Most people start at Stage 1 or 2, but if you already use AI daily, jump ahead — and dip back when you hit a gap.</p>
  </div>
</section>

<section class="section section-tight">
  <div class="container">
    ${journeyTrack(root)}
  </div>
</section>

<section class="section section-tint" aria-labelledby="ladder-h">
  <div class="container">
    <div class="section-head">
      <h2 id="ladder-h">From prompting to building</h2>
      <p>Stages 1 to 5 trace a progression in how much you hand over to AI — and how much structure you put around it. Each step up gives more leverage and needs more care.</p>
    </div>
    <ol class="ladder">
${ladder
  .map(
    (l, i) => `      <li class="ladder-step" style="--i:${i}">
        <span class="ladder-name">${esc(l.name)}</span>
        <span class="ladder-text">${esc(l.text)}</span>
        <a class="ladder-stage" href="${linkTo(root, `journey/${stageByNumber(l.stage).slug}/`)}">Stage ${l.stage}</a>
      </li>`,
  )
  .join('\n')}
    </ol>
    <p class="ladder-note">More automation is not automatically better. A good prompt often beats a fragile agent — Stage 6 is about knowing which to recommend.</p>
  </div>
</section>

<section class="section" aria-labelledby="stages-h">
  <div class="container">
    <h2 id="stages-h" class="visually-hidden">All stages</h2>
    <ul class="stage-list">
${stages
  .map(
    (s) => `      <li class="stage-card phase-${phaseOf(s).id}">
        <p class="stage-card-num">Stage ${s.number} · ${esc(phaseOf(s).label)}</p>
        <h3><a class="stretched" href="${linkTo(root, `journey/${s.slug}/`)}">${esc(s.title)}</a></h3>
        <p>${esc(s.short)}</p>
        <p class="stage-card-outcome"><strong>Outcome:</strong> ${esc(s.outcome)}</p>
      </li>`,
  )
  .join('\n')}
    </ul>
  </div>
</section>`,
});

// Stage pages ------------------------------------------------------------------
stages.forEach((s, i) => {
  const prev = stages[i - 1];
  const next = stages[i + 1];
  const ph = phaseOf(s);
  page({
    path: `journey/${s.slug}/`,
    active: 'journey/',
    title: `Stage ${s.number}: ${s.title}`,
    description: `${s.short} ${s.outcome}`,
    body: (root) => `
<section class="page-head phase-${ph.id}">
  <div class="container">
    <nav class="breadcrumb" aria-label="Breadcrumb"><a href="${linkTo(root, 'journey/')}">Learning journey</a> <span aria-hidden="true">/</span> <span>Stage ${s.number}</span></nav>
    <p class="eyebrow stage-eyebrow"><span class="stage-badge" aria-hidden="true">${s.number}</span> Stage ${s.number} · ${esc(ph.label)}</p>
    <h1>${esc(s.title)}</h1>
    <p class="lead">${esc(s.short)}</p>
    <p class="outcome"><span>Outcome</span>${esc(s.outcome)}</p>
  </div>
</section>

<div class="container stage-nav-wrap">${journeyTrack(root, { current: s.number, compact: true })}</div>

<section class="section section-tight">
  <div class="container two-col">
    <div><h2>What it means</h2>${paras(s.whatItMeans, root)}</div>
    <div><h2>Why it matters</h2>${paras(s.whyItMatters, root)}</div>
  </div>
</section>

<section class="section section-tint" aria-labelledby="learn-h">
  <div class="container">
    <h2 id="learn-h">What to learn</h2>
    <ul class="topic-grid">
${s.learn.map((l) => `      <li><h3>${esc(l.title)}</h3><p>${inline(l.text, root)}</p></li>`).join('\n')}
    </ul>
  </div>
</section>

<section class="section" aria-labelledby="cando-h">
  <div class="container two-col two-col-wide">
    <div>
      <h2 id="cando-h">You’ll be able to</h2>
      <ul class="checklist">${s.canDo.map((c) => `<li>${icon.check}<span>${inline(c, root)}</span></li>`).join('')}</ul>
    </div>
    <div class="side-notes">
      <aside class="callout callout-transfer" aria-labelledby="transfer-h-${s.number}">
        <h2 id="transfer-h-${s.number}" class="h4">What transfers between tools</h2>
        <p>${inline(s.transferable, root)}</p>
      </aside>
      <aside class="callout callout-watch" aria-labelledby="watch-h-${s.number}">
        <h2 id="watch-h-${s.number}" class="h4">${icon.alert} Watch out for</h2>
        <ul>${s.watchOut.map((w) => `<li>${inline(w, root)}</li>`).join('')}</ul>
      </aside>
    </div>
  </div>
</section>

<section class="section section-tint" aria-labelledby="practice-h">
  <div class="container">
    <div class="section-head">
      <h2 id="practice-h">Practise it</h2>
      <p>Two short exercises you can do with any AI assistant. Change the details to suit your work.</p>
    </div>
    <div class="exercise-grid">${s.exercises.map((e) => exercise(e, root)).join('\n')}</div>
    ${safetyNote(root)}
  </div>
</section>

<section class="section" aria-labelledby="where-h">
  <div class="container">
    <div class="section-head">
      <h2 id="where-h">Where to learn it</h2>
      <p>Hand-picked starting points. <a href="${linkTo(root, `resources/?stage=${s.number}`)}">See every resource for Stage ${s.number}</a>.</p>
    </div>
    ${resourceList(s.resources, root)}
  </div>
</section>

<nav class="pager container" aria-label="Stages">
  ${prev ? `<a class="pager-prev" href="${linkTo(root, `journey/${prev.slug}/`)}">${icon.back}<span><small>Stage ${prev.number}</small>${esc(prev.title)}</span></a>` : '<span></span>'}
  ${next ? `<a class="pager-next" href="${linkTo(root, `journey/${next.slug}/`)}"><span><small>Stage ${next.number}</small>${esc(next.title)}</span>${icon.arrow}</a>` : `<a class="pager-next" href="${linkTo(root, 'stay-current/')}"><span><small>Keep going</small>Stay current</span>${icon.arrow}</a>`}
</nav>`,
  });
});

// Roles -------------------------------------------------------------------------
const roleTabs = (root, current) =>
  `<nav class="role-tabs" aria-label="Choose a role"><ul>${roles
    .map(
      (r) =>
        `<li><a href="${linkTo(root, `roles/${r.slug}/`)}"${r.slug === current ? ' aria-current="page"' : ''}>${esc(r.title)}</a></li>`,
    )
    .join('')}</ul></nav>`;

page({
  path: 'roles/',
  active: 'roles/',
  title: 'Learn for your role',
  description: 'AI use cases, exercises and projects for technical product owners, project managers, data analysts and business analysts.',
  body: (root) => `
<section class="page-head">
  <div class="container">
    <p class="eyebrow">Learn for your role</p>
    <h1>Choose your role</h1>
    <p class="lead">Each role page shows where AI helps most in that work, what to practise, and a progression of projects from first exercises to advanced builds. The foundations are shared — they live in the <a href="${linkTo(root, 'journey/')}">learning journey</a>.</p>
  </div>
</section>
<section class="section section-tight">
  <div class="container">
    <ul class="role-grid role-grid-large">
${roles
  .map(
    (r) => `      <li class="role-card">
        <h2 class="h3"><a class="stretched" href="${linkTo(root, `roles/${r.slug}/`)}">${esc(r.title)}</a></h2>
        <p>${esc(r.short)}</p>
        <ul class="chips" aria-label="Focus areas">${r.focus.slice(0, 4).map((f) => `<li>${esc(f)}</li>`).join('')}</ul>
        <span class="card-arrow" aria-hidden="true">${icon.arrow}</span>
      </li>`,
  )
  .join('\n')}
    </ul>
    <aside class="callout">
      <h2 class="h4">Not one of these roles?</h2>
      <p>The patterns transfer. Most knowledge work involves the same core activities — research, synthesis, structured writing, analysis and review. Start with the <a href="${linkTo(root, 'journey/understand/')}">learning journey</a> and borrow the exercises closest to your work.</p>
    </aside>
  </div>
</section>`,
});

const projectBlock = (label, p, root) => `<article class="project">
  <p class="project-label">${esc(label)}</p>
  <h3>${esc(p.title)}</h3>
  <p>${inline(p.text, root)}</p>
  ${p.steps ? `<ol class="steps">${p.steps.map((s) => `<li>${inline(s, root)}</li>`).join('')}</ol>` : ''}
  ${p.prompt ? promptBlock(p.prompt, 'Starter prompt — adapt it') : ''}
</article>`;

roles.forEach((r) => {
  page({
    path: `roles/${r.slug}/`,
    active: 'roles/',
    title: `AI for the ${r.title}`,
    description: `Practical AI use cases, exercises and projects for a ${r.title}: ${r.focus.join(', ').toLowerCase()}.`,
    body: (root) => `
<section class="page-head">
  <div class="container">
    <nav class="breadcrumb" aria-label="Breadcrumb"><a href="${linkTo(root, 'roles/')}">Your role</a> <span aria-hidden="true">/</span> <span>${esc(r.title)}</span></nav>
    ${roleTabs(root, r.slug)}
    <h1>AI for the ${esc(r.title)}</h1>
    <p class="lead">${inline(r.intro, root)}</p>
    <ul class="chips" aria-label="Focus areas">${r.focus.map((f) => `<li>${esc(f)}</li>`).join('')}</ul>
  </div>
</section>

<section class="section section-tight" aria-labelledby="uses-h">
  <div class="container">
    <h2 id="uses-h">Where AI helps</h2>
    <ul class="topic-grid">
${r.useCases.map((u) => `      <li><h3>${esc(u.title)}</h3><p>${inline(u.text, root)}</p></li>`).join('\n')}
    </ul>
  </div>
</section>

<section class="section section-tint" aria-labelledby="areas-h">
  <div class="container">
    <div class="section-head">
      <h2 id="areas-h">Stages to prioritize</h2>
      <p>The whole journey is relevant, but these stages matter most for your role.</p>
    </div>
    <ul class="area-list">
${r.learningAreas
  .map((a) => {
    const s = stageByNumber(a.stage);
    return `      <li class="phase-${phaseOf(s).id}"><a href="${linkTo(root, `journey/${s.slug}/`)}"><span class="stage-badge" aria-hidden="true">${s.number}</span><span><strong>Stage ${s.number}: ${esc(s.title)}</strong><span>${inline(a.note, root)}</span></span></a></li>`;
  })
  .join('\n')}
    </ul>
  </div>
</section>

<section class="section" aria-labelledby="practice-h">
  <div class="container">
    <div class="section-head">
      <h2 id="practice-h">Practise and build</h2>
      <p>A progression from short first exercises to a substantial project. Do them in order or pick the one that matches your experience.</p>
    </div>
    <h3 class="level-heading"><span class="badge badge-level-beginner">Beginner</span> First exercises</h3>
    <div class="exercise-grid">${r.beginner.map((e) => exercise(e, root)).join('\n')}</div>
    <div class="project-stack">
      ${projectBlock('Intermediate project', r.intermediate, root)}
      ${projectBlock('Advanced opportunity', r.advanced, root)}
    </div>
    ${safetyNote(root)}
  </div>
</section>

<section class="section section-tint" aria-labelledby="where-h">
  <div class="container">
    <div class="section-head">
      <h2 id="where-h">Recommended resources</h2>
      <p>Selected for this role. <a href="${linkTo(root, `resources/?role=${r.slug}`)}">See all resources tagged for ${esc(r.title)}s</a> or browse by stage.</p>
    </div>
    ${resourceList(r.resources, root)}
  </div>
</section>

<div class="container section-tight">${roleTabs(root, r.slug)}</div>`,
  });
});

// Resources ----------------------------------------------------------------------
const sortedResources = [...resources].sort((a, b) => {
  const tierRank = { primary: 0, supplementary: 1, other: 2 };
  return (
    (b.startHere ? 1 : 0) - (a.startHere ? 1 : 0) ||
    LEVELS.indexOf(a.level) - LEVELS.indexOf(b.level) ||
    tierRank[providers[a.provider].tier] - tierRank[providers[b.provider].tier]
  );
});

const select = (name, label, options) => `<div class="filter">
  <label for="f-${name}">${esc(label)}</label>
  <select id="f-${name}" name="${name}">
    <option value="">Any</option>
    ${options.map(([v, l]) => `<option value="${esc(v)}">${esc(l)}</option>`).join('')}
  </select>
</div>`;

page({
  path: 'resources/',
  active: 'resources/',
  title: 'Learning resources',
  description: 'A curated directory of AI training from Claude Academy, OpenAI Academy, DeepLearning.AI, Microsoft Learn, DataCamp, PMI and more — filterable by stage, topic, role and level.',
  body: (root) => {
    const starters = sortedResources.filter((r) => r.startHere);
    const provs = Object.entries(providers).filter(([, p]) => p.tier !== 'other');
    return `
<section class="page-head">
  <div class="container">
    <p class="eyebrow">Learning resources</p>
    <h1>Curated training and references</h1>
    <p class="lead">A short, deliberately selective list. Where possible we link to providers’ maintained catalogs rather than individual lessons, so links stay useful as courses change.</p>
  </div>
</section>

<section class="section section-tight" aria-labelledby="starters-h">
  <div class="container">
    <div class="section-head">
      <h2 id="starters-h">Best beginner starting points</h2>
      <p>Free or free to start, and no technical background needed.</p>
    </div>
    <ul class="resource-grid">${starters.map((r) => resourceCard(r, root)).join('\n')}</ul>
  </div>
</section>

<section class="section section-tint" aria-labelledby="providers-h">
  <div class="container">
    <h2 id="providers-h">Providers</h2>
    <div class="provider-table-wrap">
    <table class="provider-table">
      <thead><tr><th scope="col">Provider</th><th scope="col">Best for</th><th scope="col">Cost</th></tr></thead>
      <tbody>
${provs
  .map(
    ([, p]) =>
      `        <tr><th scope="row">${extLink(p.url, esc(p.name))}${p.tier === 'primary' ? ' <span class="tag">Primary</span>' : ''}</th><td>${esc(p.bestFor)}</td><td>${esc(p.cost)}</td></tr>`,
  )
  .join('\n')}
      </tbody>
    </table>
    </div>
    <dl class="legend">
      <div><dt>Vendor-neutral</dt><dd>Concepts that apply to any AI tool.</dd></div>
      <div><dt>Vendor-specific</dt><dd>Training for one product. The skills usually transfer; the buttons don’t.</dd></div>
      <div><dt>Free · account</dt><dd>Free, but you need to register.</dd></div>
      <div><dt>Free to start</dt><dd>Some content free; full access or certificates paid.</dd></div>
    </dl>
  </div>
</section>

<section class="section" aria-labelledby="all-h">
  <div class="container">
    <div class="section-head">
      <h2 id="all-h">All resources</h2>
      <p>Filter by any combination. Filters update the list as you choose.</p>
    </div>
    <form class="filters" id="resource-filters" hidden>
      ${select('stage', 'Stage', stages.map((s) => [String(s.number), `${s.number}. ${s.title}`]))}
      ${select('topic', 'Topic', Object.entries(topics))}
      ${select('role', 'Role', roles.map((r) => [r.slug, r.title]))}
      ${select('level', 'Level', [['beginner', 'Beginner'], ['intermediate', 'Intermediate'], ['advanced', 'Advanced']])}
      ${select('scope', 'Type', [['neutral', 'Vendor-neutral'], ['vendor', 'Vendor-specific']])}
      ${select('cost', 'Cost', [['free', 'Free (incl. with account)'], ['freemium', 'Free to start'], ['paid', 'Paid']])}
      <button type="reset" class="btn btn-secondary btn-small">Clear filters</button>
    </form>
    <p class="filter-status" id="filter-status" role="status" aria-live="polite"></p>
    <ul class="resource-grid" id="resource-list">
${sortedResources.map((r) => resourceCard(r, root)).join('\n')}
    </ul>
    <p class="empty-state" id="empty-state" hidden>No resources match all of those filters. Try removing one.</p>
    <p class="fine-print">Resource links reviewed ${esc(lastReviewed)}. Providers change courses, prices and URLs frequently — if something has moved, the provider’s catalog is the best place to look.</p>
  </div>
</section>`;
  },
});

// Stay current --------------------------------------------------------------------
page({
  path: 'stay-current/',
  active: 'stay-current/',
  title: 'Stay current',
  description: 'Official documentation, release notes and trustworthy newsletters for keeping up with AI tools as they change.',
  body: (root) => {
    const current = resources.filter((r) => r.current);
    const groups = [
      ['Anthropic and Claude', current.filter((r) => r.provider === 'anthropic')],
      ['OpenAI, ChatGPT and Codex', current.filter((r) => r.provider === 'openai')],
      ['Vendor-neutral', current.filter((r) => r.scope === 'neutral')],
    ];
    return `
<section class="page-head">
  <div class="container">
    <p class="eyebrow">Stay current</p>
    <h1>Keep up without drowning</h1>
    <p class="lead">AI tools change monthly. Recorded courses fall behind; <strong>official documentation and release notes are usually the most current source</strong> of what a tool can do today. You don’t need to follow everything — a short, regular routine is enough.</p>
  </div>
</section>

<section class="section section-tight" aria-labelledby="routine-h">
  <div class="container two-col">
    <div>
      <h2 id="routine-h">A 20-minute monthly routine</h2>
      <ol class="steps">
        <li>Skim the release notes for the assistant you use most. Note one feature to try.</li>
        <li>Read one issue of a newsletter such as The Batch for the wider picture.</li>
        <li>Try the new feature on a real (non-confidential) task.</li>
        <li>Every few months, re-run your personal test tasks from <a href="${linkTo(root, 'journey/ai-champion/')}">Stage 6</a> to see what has improved.</li>
      </ol>
    </div>
    <div>
      <h2>Evaluating something new</h2>
      <ul class="checklist">
        <li>${icon.check}<span>What problem does it solve that I actually have?</span></li>
        <li>${icon.check}<span>Does it work on my own test tasks, not just the demo?</span></li>
        <li>${icon.check}<span>Where does my data go, and who can see it?</span></li>
        <li>${icon.check}<span>What can it access or change, and can I limit that?</span></li>
        <li>${icon.check}<span>What does it cost at realistic usage?</span></li>
        <li>${icon.check}<span>Would I trust it without checking? (The answer should usually be no.)</span></li>
      </ul>
    </div>
  </div>
</section>

${groups
  .map(
    ([label, items], i) => `<section class="section${i % 2 === 0 ? ' section-tint' : ''}" aria-labelledby="g${i}-h">
  <div class="container">
    <h2 id="g${i}-h">${esc(label)}</h2>
    ${resourceList(items.map((r) => r.id), root)}
  </div>
</section>`,
  )
  .join('\n')}

<section class="section" aria-labelledby="academies-h">
  <div class="container">
    <div class="section-head">
      <h2 id="academies-h">Updated training</h2>
      <p>The academies add courses as products change. Check their catalogs every few months.</p>
    </div>
    ${resourceList(['claude-academy', 'openai-academy', 'dlai-courses'], root)}
  </div>
</section>`;
  },
});

// Ground rules ----------------------------------------------------------------------
page({
  path: 'ground-rules/',
  active: 'ground-rules/',
  title: 'Ground rules for safe practice',
  description: 'How to learn and use AI responsibly: protect confidential data, practise with synthetic data, verify output, and keep agents and code under control.',
  body: (root) => `
<section class="page-head">
  <div class="container">
    <p class="eyebrow">Ground rules</p>
    <h1>Practise safely, use responsibly</h1>
    <p class="lead">${inline(groundRules.intro, root)}</p>
  </div>
</section>

<section class="section section-tight">
  <div class="container">
    <ol class="rules">
${groundRules.rules.map((r) => `      <li><h2 class="h3">${esc(r.title)}</h2><p>${inline(r.text, root)}</p></li>`).join('\n')}
    </ol>
  </div>
</section>

<section class="section section-tint" aria-labelledby="synthetic-h">
  <div class="container two-col two-col-wide">
    <div>
      <h2 id="synthetic-h">${esc(groundRules.syntheticTitle)}</h2>
      <p>${inline(groundRules.syntheticIntro, root)}</p>
      <p>${inline(groundRules.syntheticDataNote, root)}</p>
    </div>
    <div>${promptBlock(groundRules.syntheticPrompt, 'Synthetic practice-data prompt')}</div>
  </div>
</section>

<section class="section" aria-labelledby="policy-h">
  <div class="container narrow">
    <h2 id="policy-h">${esc(groundRules.policyTitle)}</h2>
    <p>${inline(groundRules.policyText, root)}</p>
  </div>
</section>`,
});

// ─── Write output ────────────────────────────────────────────────────────────

await rm(OUT, { recursive: true, force: true });
await mkdir(OUT, { recursive: true });
await cp(join(ROOT, 'src/assets'), join(OUT, 'assets'), { recursive: true });

for (const p of pages) {
  const file = join(OUT, p.path, 'index.html');
  await mkdir(dirname(file), { recursive: true });
  await writeFile(file, layout(p));
}

// 404 page: GitHub Pages serves it from any URL, so relative links need a <base> pointing at the site root.
const basePath = site.url ? new URL(site.url).pathname.replace(/\/?$/, '/') : '/';
await writeFile(
  join(OUT, '404.html'),
  layout({
    path: '404/',
    base: basePath,
    title: 'Page not found',
    body: () => `
<section class="page-head">
  <div class="container narrow">
    <p class="eyebrow">404</p>
    <h1>That page isn’t here</h1>
    <p class="lead">It may have moved. Try one of these instead:</p>
    <ul class="link-list">
      <li><a href="./">Home</a></li>
      ${nav.map((n) => `<li><a href="${esc(n.path)}">${esc(n.label)}</a></li>`).join('')}
    </ul>
  </div>
</section>`,
  }),
);

// Disable Jekyll processing on GitHub Pages.
await writeFile(join(OUT, '.nojekyll'), '');

if (site.url) {
  const baseUrl = site.url.endsWith('/') ? site.url : site.url + '/';
  const urls = pages.map((p) => `  <url><loc>${esc(new URL(p.path, baseUrl).href)}</loc></url>`).join('\n');
  await writeFile(
    join(OUT, 'sitemap.xml'),
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`,
  );
  // robots.txt is only honoured at a domain root, so skip it when the site lives under a sub-path.
  if (basePath === '/') await writeFile(join(OUT, 'robots.txt'), `User-agent: *\nAllow: /\nSitemap: ${baseUrl}sitemap.xml\n`);
}

console.log(`Built ${pages.length + 1} pages to dist/${site.url ? ` for ${site.url}` : ''}`);
