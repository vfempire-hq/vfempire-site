# vfempire-site

[![security-scan](https://github.com/vfempire-hq/vfempire-site/actions/workflows/security-scan.yml/badge.svg)](https://github.com/vfempire-hq/vfempire-site/actions/workflows/security-scan.yml)

The corporate website for **VF Empire Corp Ltd** — Malta C 94160, VAT MT 2686-9431. Live at [vfempire.com](https://vfempire.com/).

Static HTML, hand-crafted, served by **Cloudflare Workers Assets** from `dist/`.

## Privacy posture

- **Zero third-party scripts.** No Google Analytics, no Facebook Pixel, no Hotjar, no LogRocket, no Segment, no ad-tech.
- **Zero third-party fonts.** Hanken + Instrument Italic are self-hosted at `/fonts/`.
- **Zero third-party image hosts.** All assets served from `vfempire.com`.
- **Zero cookies.** Site sets no cookies. First-party consent banner (`vf-consent`) stores accept/decline as `localStorage` only.
- **Strict CSP.** `default-src 'self'; connect-src 'self'; frame-ancestors 'none';` etc. — see `dist/_headers`.
- **HSTS with preload.** 63072000s max-age, includeSubDomains, preload.
- **Cross-origin isolation.** COOP + COEP + CORP set to same-origin.
- **Bot policy.** Aggressive scrapers + AI-training crawlers (GPTBot, ClaudeBot, CCBot, anthropic-ai, Google-Extended) explicitly disallowed in `robots.txt`.
- **security.txt.** RFC 9116 disclosure endpoint at `.well-known/security.txt`.

Every claim above is verifiable by inspecting `dist/`.

## Structure

```
vfempire-site/
├── index.html              # Homepage (mirrored to dist/index.html on deploy)
├── systems/                # Product pages, 21 as of this commit
├── legal/                  # Terms, privacy, cookies
├── contact/                # Contact page
├── assets/                 # Images, fonts, scripts
├── fonts/                  # Self-hosted webfonts
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
