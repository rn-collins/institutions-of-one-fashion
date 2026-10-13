# Institutions of One × Fashion

An evidence-led exhibition about turning a singular fashion practice into an institution that can be built, carried, controlled, and continued. Static, accessible, dependency-free, and deployable to Vercel.

```sh
npm test
npm run build
```

No AI imagery. Four Met Open Access/Public Domain objects are represented by object-level records and rights metadata. `PUBLIC_SITE_URL` configures canonical metadata and sitemap generation.

## What the public site shows

`data/releases.json` is the only record that decides what is public. It has one entry per piece: each dossier (`ioo-fashion/b01`) and each of its social pieces (`ioo-fashion/b01-carousel-a`, `-carousel-b`, `-reel`, `-pin-01` to `-pin-04`, `-youtube`). Each entry has `releasedAt` (a date in Pacific/Honolulu, or empty), `hold`, `postUrls` (one per platform), `longFormUrl` and `sourcePageUrl`.

- A piece is public when `releasedAt` is today or earlier in Hawaii and `hold` is false. An empty date means it is not released.
- The build renders the complete production set into `.production/` (not served, not committed) and copies only released pieces into `dist/`. Anything else is absent from the site and returns 404, even by direct URL: carousel frames, pins, thumbnails, storyboards, ZIPs, asset kit JSON, platform kits, motion plans, carousel copy, search and sitemap entries.
- Platform kits and motion plans carry copy for every channel, so they become public only once every social piece of that dossier is released.
- To release a piece, set its `releasedAt` to the posting date, set `hold` to false, and add its post links. The dossier page then shows it and links to the post.
- A daily GitHub Actions run (`.github/workflows/daily-release.yml`, 00:05 Hawaii) redeploys the site on any day a piece reaches its date. It uses the `VERCEL_DEPLOY_HOOK_URL` repository secret when set, and otherwise pushes a one-line stamp to `main` so the Vercel Git integration rebuilds. That commit ends with a Made-with line, as AGENTS.md asks.

Every dossier page links to its long-form chapter, its posts and source page when they exist, the index of all dossiers at `/dossiers`, and the previous and next dossiers.

Each released dossier has a sources page on the RN Collins portfolio, `https://rn-selected-work.vercel.app/sources/ioo-fashion/<id>` (its `sourcePageUrl`). Those pages link back to the dossier page and its chapter. The build writes their data to `.production/selected-work-sources.json`, one entry per released dossier: the sources, further reading and collection images the dossier page shows. When a dossier is released or its sources change, copy that file to rn-selected-work `data/sources-ioo-fashion.json` and run `python3 scripts/sync_releases.py` there.

Only one build runs at a time in a checkout (`scripts/build-lock.mjs`). The test suite holds the same lock while it runs, so a build started elsewhere in the folder waits instead of rewriting `dist/` under the tests.

## Deployment

- Framework preset: Other
- Build command: `npm run build`
- Output directory: `dist`
- Install command: `npm install`
- Node.js: 20 or later
- Production environment variable: `PUBLIC_SITE_URL=https://institutions-of-one-fashion.vercel.app`
- Git integration: automatic production deployments from `rn-collins/institutions-of-one-fashion` branch `main`

Corrections and takedown requests use the repository's public, structured GitHub Issue form. The form warns reporters not to disclose private, confidential, medical, financial, or legally privileged information.
