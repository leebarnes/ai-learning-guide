# AI Advantage

**Learn it. Apply it. Build with it. Lead with it.**

A self-directed guide for IT knowledge workers — product owners, project managers, data analysts, business analysts and anyone else — who want to build practical AI skill: from confident prompting to reusable workflows, agents, AI-assisted coding, and leading AI adoption.

It is a static website: no accounts, no backend, no database, no tracking, no API keys. It is built by a single zero-dependency Node.js script and hosted on GitHub Pages.

---

## Quick start

Requires **Node.js 20 or newer**. There is nothing to install — no `npm install` step, no dependencies.

```bash
npm run dev        # build, then serve at http://localhost:4321/
npm test           # build, then run the offline quality checks
npm run build      # build only → dist/
npm run check:links  # check every external resource link over the network
```

To preview exactly as GitHub Pages will serve a project site under a sub-path:

```bash
npm run build && BASE=/ai-learning-guide/ npm run serve
# → http://localhost:4321/ai-learning-guide/
```

## How the project is organized

```
src/
  content/              ← everything you'd normally edit
    site.mjs            site name, tagline, navigation, the four phases
    stages.mjs          the six learning stages (text, exercises, recommended resources)
    roles.mjs           the four role guides
    resources.mjs       ★ ALL external learning links, providers, topics
    pages.mjs           Home page and Ground Rules text
  assets/
    styles.css          all styling (light + dark themes via CSS custom properties)
    app.js              progressive enhancements: theme toggle, mobile menu, filters, copy buttons
    favicon.svg
scripts/
  build.mjs             generator + page templates → dist/
  serve.mjs             local preview server (optionally under a sub-path)
  check.mjs             offline tests run by `npm test`
  check-links.mjs       network check of external links
.github/workflows/
  deploy.yml            build, test and deploy to GitHub Pages on push to main
  check-links.yml       monthly external-link check → GitHub issue; keeps the schedule alive
```

**Content is separate from presentation.** You can update almost everything by editing the files in `src/content/` — they are plain JavaScript objects with comments explaining each field. The page templates live in `scripts/build.mjs` if you ever need to change layout.

### Text formatting in content files

Text fields support a deliberately tiny set of formatting:

- `**bold**`
- `` `code` ``
- `[link text](https://example.com)` — external links open in a new tab
- `[link text](/resources/?topic=data)` — a leading `/` means "relative to the site root"; the build converts it to a correct relative link, so it works under any sub-path
- A blank line (`\n\n`) starts a new paragraph in longer fields

### Pages generated

| Path | Source |
| --- | --- |
| `/` | `pages.mjs` (home), plus stages, roles and providers |
| `/journey/` and `/journey/<stage>/` (6) | `stages.mjs` |
| `/roles/` and `/roles/<role>/` (4) | `roles.mjs` |
| `/resources/` | `resources.mjs` |
| `/stay-current/` | resources with `current: true` |
| `/ground-rules/` | `pages.mjs` |
| `/404.html`, `sitemap.xml` | generated |

## Updating learning resources

All external training links live in **`src/content/resources.mjs`**. Nothing else contains course URLs (apart from provider home pages, which are also in that file).

**Add a resource:** copy an existing entry, give it a unique `id`, and fill in the fields. The header comment in the file documents each one. Key fields:

| Field | Values |
| --- | --- |
| `cost` | `free`, `free-account`, `freemium` (free to start), `paid` |
| `level` | `beginner`, `intermediate`, `advanced`, `all` |
| `scope` | `neutral` (transferable concepts) or `vendor` (one product) |
| `stages` | stage numbers 1–6 |
| `topics` | keys from the `topics` object in the same file |
| `roles` | role slugs, or `[]` for everyone |
| `startHere` | `true` to feature it as a beginner starting point |
| `current` | `true` to list it on the Stay Current page |

**Recommend it on a stage or role page:** add its `id` to that stage's or role's `resources` array in `stages.mjs` / `roles.mjs`. (A resource recommended on a role page is automatically included when visitors filter the directory by that role.)

**Remove a resource:** delete the entry and remove its `id` from any `resources` arrays. If you forget, the build stops with a clear message naming the dangling reference — it will never publish a broken reference.

### Automatic monthly link check

`.github/workflows/check-links.yml` runs `scripts/check-links.mjs` at 09:00 UTC on the 1st of every month (or on demand: **Actions → Check external links → Run workflow**). Each link is sorted into:

| Result | Meaning | What happens |
| --- | --- | --- |
| ✗ Failed | 404, other error, DNS failure or timeout | Listed in the issue; the run also fails |
| → Redirected | Works, but lands on a different URL | Listed in the issue |
| ? Blocked | Site refuses automated checks (401/403/429/503) | Listed in a collapsed section; no action needed |
| ✓ OK | Loads at the linked URL | — |

**How you hear about problems:** if anything failed or redirected, the workflow opens a GitHub issue labelled `link-check` titled "Learning-resource links need attention" (or, if one is already open, updates it and adds a comment), so you get a notification. When a later run finds nothing to fix, it closes the issue automatically. Each run's page also shows the full report in its summary.

**Fixing an issue:** find each resource id in `src/content/resources.mjs` and update or remove it. For a link that redirects on purpose (a stable entry point that forwards to a versioned page), add `redirectOk: true` to the entry instead. Then update `lastReviewed`, push to `main`, and either wait for next month's run or trigger one manually to close the issue.

**Blocked sites:** several providers (PMI, DataCamp, OpenAI help center, Kaggle) block automated checkers and will always show as blocked. Open them in a browser every few months.

**Keep-alive:** GitHub disables scheduled workflows in public repositories after 60 days without activity. If the latest commit is 45 or more days old, the monthly run makes an empty commit (`chore: keep scheduled link check active`) to keep the schedule switched on. These commits don't redeploy the site. If you edit locally, run `git pull` before pushing so you pick them up.

You can also run the checker locally with `npm run check:links`.

**`lastReviewed`** at the top of `resources.mjs` is shown in the site footer and on the Resources page. Only change it when you have actually reviewed the links.

Prefer linking to maintained catalog and landing pages over individual lessons — they move less often.

## Testing

`npm test` builds the site and runs `scripts/check.mjs`, which verifies offline that:

- every internal link, asset and `#anchor` resolves;
- no internal URL is root-absolute (which would break under a GitHub Pages sub-path);
- each page has one `<h1>`, a title, a meta description, a `lang` attribute and a main landmark;
- headings don't skip levels, ids are unique, images have `alt`;
- external links use HTTPS and new-tab links carry `rel="noopener"`;
- the resource directory and all six filters are present, and every role has resources tagged for it.

The build itself validates content: unknown resource ids, providers, topics, stages or roles, invalid enum values, and non-HTTPS URLs all fail the build.

## Deploying to GitHub Pages

Deployment uses GitHub Actions (`.github/workflows/deploy.yml`).

1. Create a GitHub repository (for example `ai-learning-guide`) and push this project to its `main` branch.
2. In the repository, go to **Settings → Pages → Build and deployment** and set **Source** to **GitHub Actions**.
3. Push to `main` (or run the workflow manually from the **Actions** tab). The workflow builds, runs the tests, and deploys. The site appears at `https://<username>.github.io/<repository>/`.

The workflow passes the Pages URL to the build as `SITE_URL`, which is used for canonical links, Open Graph metadata, the sitemap and the 404 page. All other links are relative, so the site works at a domain root, under a sub-path, or opened from `dist/` on a local server without changes.

**Custom domain:** configure it under Settings → Pages. The workflow picks up the new base URL automatically.

**Without GitHub Actions:** run `SITE_URL=https://<username>.github.io/<repository>/ npm run build` and publish the contents of `dist/` any way you like (any static host works).

## Design and implementation notes

- **Zero-dependency static generator.** Astro or similar would add a dependency tree that needs regular updating. A single readable build script keeps maintenance close to zero and the content files easy to edit for someone with modest web experience.
- **Works without JavaScript.** Every page is complete HTML. JavaScript only adds conveniences: the theme toggle, a collapsible mobile menu, live filtering on the Resources page (with filters reflected in the URL, e.g. `resources/?stage=5&role=data-analyst`), and copy buttons on prompts. Without JavaScript the full resource list is shown and the navigation simply wraps.
- **Accessibility.** Semantic landmarks, a skip link, visible focus styles, `aria-current` on navigation, a polite live region for filter results, labelled controls, reduced-motion support, and WCAG AA contrast for text in both themes.
- **Themes.** Light/dark follows the operating system by default; the toggle stores an explicit choice in `localStorage`.
- **Privacy.** No analytics, cookies, fonts or scripts from third parties. System fonts only.

## Assumptions and limitations

- **Resource details change.** Course titles, prices and URLs were checked in November 2026. Pages on pmi.org, datacamp.com, help.openai.com, openai.com and kaggle.com block automated access; those entries were confirmed through the providers' listings and search results rather than by loading the page. Cost labels for Claude Academy and OpenAI Academy reflect what the sites state (Claude Academy: free courses) or imply (OpenAI Academy: free with sign-up). Each entry's `check` field records how it was verified.
- **No AI-specific IIBA credential** existed at the time of writing; the IIBA entry is labelled as complementary professional development rather than AI training.
- **No social preview image.** Shared links show a title and description but no image (`twitter:card` is `summary`). To add one, place a 1200×630 PNG in `src/assets/` and add `og:image` / `twitter:image` tags in the `layout()` function of `scripts/build.mjs`.
- **Search** is intentionally not implemented; the directory is small enough to filter.
- **Content currency.** Stage and role content is written to be durable (concepts over product features), but product names such as Claude Code, Codex and MCP should be sanity-checked when you review links.
