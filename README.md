# vfempire-site

[![security-scan](https://github.com/vfempire-hq/vfempire-site/actions/workflows/security-scan.yml/badge.svg)](https://github.com/vfempire-hq/vfempire-site/actions/workflows/security-scan.yml)

The corporate website for **VF Empire Corp Ltd** — Malta C 94160, VAT MT 2686-9431. Live at [vfempire.com](https://vfempire.com/).

Static HTML, hand-crafted, served by **Cloudflare Workers Assets** from `dist/`.

## Privacy posture

- **Zero third-party scripts.** No Google Analytics, no Facebook Pixel, no Hotjar, no LogRocket, no Segment, no ad-tech.
- **Zero third-party fonts.** Hanken + Instrument Italic are self-hosted at `/fonts/`.
- **One stylesheet.** `/house.css` carries the tokens, type scale, nav, buttons, footer and consent notice for every page; page-specific layout stays inline per page.
- **Zero third-party image hosts.** All assets served from `vfempire.com`.
- **Zero cookies.** Site sets no cookies. First-party consent banner (`vf-consent`) stores accept/decline as `localStorage` only.
- **Strict CSP.** `default-src 'self'; connect-src 'self'; frame-ancestors 'none';` etc. — see `dist/_headers`.
- **HSTS with preload.** 63072000s max-age, includeSubDomains, preload.
- **Cross-origin isolation.** COOP + COEP + CORP set to same-origin.
- **Bot policy.** Search engines and answer engines (Googlebot, Bingbot, OAI-SearchBot, PerplexityBot, Claude-SearchBot, Applebot) are explicitly welcome in `robots.txt`; only `/dev/` and the error pages are disallowed. `/llms.txt` gives language-model agents a plain-text map of the site.
- **security.txt.** RFC 9116 disclosure endpoint at `.well-known/security.txt`.

Every claim above is verifiable by inspecting `dist/`.

## Structure

```
vfempire-site/
├── index.html              # Homepage (mirrored to dist/index.html on deploy)
├── house.css               # Shared house stylesheet: tokens, type scale, nav, buttons, footer, consent
├── build.mjs               # The one build step (see Build)
├── CLAUDE.md               # Standing rules for every change (voice, visual system, SEO checklist)
├── engine.html, harness.html, dashboards.html   # Pillar pages for the house method
├── about.html, press.html, careers.html, training-centre.html, permanence-guarantee.html, glossary.html
├── journal/                # The build log, one page per entry, RSS + JSON feeds
├── compare/                # Product comparison pages
├── services/               # Services index + the three fixed-fee engagements
├── systems/                # Product index + 23 product pages
│   ├── _build.mjs          # Generator for the templated product pages (node systems/_build.mjs)
│   └── content-*.mjs       # Content packs the generator reads; edit these, not the generated HTML
├── legal/                  # Terms, privacy, cookies
├── contact/                # Contact page
├── assets/                 # Renders, scripts, brand kit (assets/brand, see docs/BRAND.md)
├── fonts/                  # Self-hosted webfonts
├── llms.txt                # Plain-text site map for language-model agents (AEO)
├── sitemap.xml
├── sitemap-full.xml
├── wrangler.jsonc          # Cloudflare Workers Assets config
├── dist/                   # Deployment artefact — what Cloudflare serves
│   ├── _headers            # CSP + security headers
│   ├── .well-known/        # security.txt, pgp.txt
│   ├── robots.txt
│   └── (mirror of source structure)
└── docs/                   # Internal documentation
```

## Build

One build step produces everything Cloudflare serves:

```
npm ci                      # sharp (image variants), fontkit + wawoff2 (brand kit)
node build.mjs              # generated product pages, shared partials on every page,
                            # sitemap.xml from git dates, dist/ with a hashed stylesheet
                            # and AVIF/WebP variants of every image
node build.mjs --no-images  # the same without the image pipeline (seconds)
python3 scripts/verify.py   # copy voice, JSON-LD, tags, SEO fields, house rules
python3 scripts/linkcheck.py
```

`node build.mjs --check` (CI) fails if the build would change a committed file, so
source, partials, sitemap and `dist/` can never drift. Product copy for the templated
pages lives in `systems/content-*.mjs`; the brand kit is regenerated with
`node scripts/brand-kit.mjs` (see `docs/BRAND.md`); the asset inventory with
`node scripts/assets-inventory.mjs` (see `docs/ASSETS.md`). `CLAUDE.md` holds the
standing rules for every change, `docs/SITE-REVIEW-2026-09.md` the plan.

## Local dev

```
# Preview locally with wrangler
npx wrangler dev

# Or serve dist/ with any static server
python3 -m http.server 8000 --directory dist
```

## Deployment

See [DEPLOY.md](./DEPLOY.md). Short version:

```
# One-time (per machine where the token lives)
npx wrangler login

# Every deploy
npx wrangler deploy
```

Cloudflare Workers Assets picks up `wrangler.jsonc` at the repo root and serves `dist/`.

## Repository

- Canonical: `github.com/vfempire-hq/vfempire-site` (pending `vfempire-hq` org creation).
- Licence: **MIT** — see [LICENSE](./LICENSE). Marketing content + design tokens are shared under a permissive licence; product code lives in the per-product repos under their own licences.
