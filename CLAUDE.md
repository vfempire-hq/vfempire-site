# vfempire.com — standing instructions for every Claude session

This file is read automatically by Claude Code. It is the operating manual
for the corporate website of VF Empire Corp Ltd (Malta, C 94160). Follow it
on every task in this repository, however small. Vincent Falzon (Managing
Director) approved the plan it references on 2026-09-15; do not relitigate
it, extend it.

## 1. The plan you are executing

`docs/SITE-REVIEW-2026-09.md` is the approved site plan: traffic intent map,
the pages the site is missing, the per-page SEO/AEO backlog, the visual and
layout plan, the technical roadmap and the sprint order. Every change to this
site should move an item in that plan forward or keep the site consistent
with it. When you finish an item, tick it in section 9 ("Progress log") of
that document with the date and the commit.

## 2. What this site is

- Static, hand-authored HTML served from `dist/` by Cloudflare Workers
  Assets (`wrangler.jsonc`). Source pages live at the repo root, `systems/`,
  `services/`, `legal/`, `contact/` and the newer sections; `dist/` is a
  mirror produced by `./scripts/mirror-to-dist.sh` (run it before every
  commit that touches a page; the build step `node build.mjs`, once
  present, runs it for you).
- Zero third-party scripts, fonts, images or cookies. The CSP in
  `dist/_headers` enforces `'self'` for everything. Never add analytics
  scripts, tag managers, CDN fonts, embeds or a cookie. Traffic insight comes
  from Cloudflare zone analytics and Search Console, both script-free.
- Light theme only. There is no dark theme and no toggle.

## 3. The house visual system (do not fork it)

- `/house.css` is the single stylesheet for tokens, type scale, nav, buttons,
  chips, footer, consent notice, scroll rail and shared sections. Every page
  links it. Page-specific layout lives in that page's own `<style>` block and
  nowhere else. Never re-declare a house rule inline; if you need a new
  shared component, add it to `house.css` once.
- Tokens: paper `#fbfbfd`, silver `#f5f5f7`, mist `#eceff3`, ink `#1d1d1f`,
  dove `#6e6e73`, faint `#a1a1a6` (decorative rules only, never small text),
  line `#e4e6ea`, core blue `#1f6ff2`, core-deep `#0b47b8`. Use
  `var(--token)`; no new hex values without adding a token.
- Type: Hanken (self-hosted, weight 400 to 700) for everything; Instrument
  italic (`<em class="i">`) for one accent per headline at most. Headings are
  weight 600 with tight tracking (`-.045em` at display size). Body copy stays
  under 75 characters per line.
- Nav: fixed 52 px frosted bar, brand mark, breadcrumb on subpages, primary
  links (Systems, Software, Security, Contact; Services once `/services/`
  exists), black pill CTA "Commission a system". Footer: the house footer
  from `house.css` (the full four-column version is the target on every
  page). Consent notice on every public page.
- Banned: gradient text, side-stripe borders as accents, glassmorphism
  beyond the nav and consent card, identical icon-square card grids as the
  only visual on a page, `100vh` heroes on inner pages, placeholder chips
  such as "TBA" or "coming soon", lorem ipsum, stock photography.
- Motion: 240 ms to 900 ms, `var(--ease)`, reveal-on-scroll (`.rv`) on section
  headers and the first row of a grid only. Respect `prefers-reduced-motion`
  (house.css already does).

## 4. Copy voice (stop-slop rules, non-negotiable)

Reference: `THE-OS/prompt-skills/stop-slop/SKILL.md` and its references.

- No em dashes anywhere (`—`), including titles, meta, JSON-LD, alt text,
  CSS and JS comments. Use a full stop, comma, colon or parentheses.
- No reversals: "not X, it's Y", "isn't X. It's Y", "X, not Y", "Not because
  X. Because Y." State Y.
- No adverb crutches (actually, really, simply, truly, genuinely, fully,
  literally, deeply, fundamentally), no throat-clearing ("Here's the thing",
  "It turns out", "It's worth noting", "At its core", "In a world where"), no
  vague declaratives, no meta-commentary, no staccato fragments in body
  prose, no rhetorical triads.
- Active voice with a named actor (VF, we, you, the engine, the app).
- Keep every mechanism-backed guarantee exactly as written ("no route is
  ever sent to Google"); keep prices, dates, statutes, jurisdictions, form
  codes, test counts and legal wording verbatim.
- British spelling. Short declaratives, varied length. Headlines short.
- Facts only. Never invent a customer, a quote, a number, a date, a team
  member, a partner, a certification or a competitor claim. If a fact is not
  already on the site or in this repo's docs, write around it or ask.
- Product copy for the templated product pages is edited in
  `systems/content-*.mjs` and `systems/pricing.mjs`, then rebuilt with
  `node systems/_build.mjs`. Never hand-edit a generated page (the 13 pages
  the generator lists); the build will overwrite it. Hand-maintained product
  pages are named in the generator's `HAND_MAINTAINED` set.

## 5. SEO and AEO checklist for every page (new or edited)

- `<title>`: "Page name | VF Empire", 60 characters or fewer. Home is
  "VF Empire | The systems house for open intelligence".
- `<meta name="description">`: 120 to 160 characters, names the category,
  the region (Malta, EU) and the differentiator, no em dash.
- Canonical URL, extensionless (`/systems/nav-it`), matches `og:url`.
- One `<h1>`. H2s describe the section in the words a buyer types.
- Open Graph and Twitter cards complete (og:image 1200 px wide or more).
- JSON-LD: BreadcrumbList on every subpage; FAQPage wherever a visible FAQ
  block exists; the page's own type (SoftwareApplication, Service, Article,
  Course, DefinedTermSet, ContactPage, WebPage). `scripts/seo-pass.py` adds
  the generic ones; run it on any new page.
- An FAQ block (4 to 6 questions in the words a buyer types, direct answers
  of 40 to 80 words) on every product, service, pillar and company page.
- 12 or more distinct internal links per page, contextual, not only nav and
  footer. Every product page links its related systems and the pillar pages.
- Every content image has descriptive alt text naming the product; decorative
  images use `alt=""`. Explicit `width`/`height`; `loading="lazy"` below the
  fold; hero image `fetchpriority="high"`.
- Sitemap (`sitemap.xml`), `robots.txt` (answer engines welcome) and
  `/llms.txt` list every public page. Add new pages to all three.
- No `noindex` on a public page; error pages and `/dev/` stay out of the
  index.

## 6. Before every commit

```
python3 scripts/verify.py          # em dashes, slop words, JSON-LD, tags, house checks
node systems/_build.mjs            # if you touched a content pack or the template
./scripts/mirror-to-dist.sh        # dist/ must equal source
```

All three must be clean. Commit in conventional format
(`feat:`, `fix:`, `content:`, `style:`, `refactor:`, `chore:`, `ci:`), one
concern per commit, real evidence in the message (counts, pages, checks
run). Never push to `main` directly: branch, push, open a pull request.

## 7. Things that look tempting and are wrong here

- Adding a JavaScript framework, a CSS framework, Tailwind or a bundler. The
  site is plain HTML and CSS by design; the only build is `node build.mjs`.
- "Improving" the design by moving away from the house look (dark mode,
  new accent colours, new fonts, big gradients). The house look is settled.
- Writing marketing claims that sound good but are not on the record.
- Editing `dist/` directly. Edit source, then mirror.
- Leaving a page without a footer, consent notice, breadcrumb or FAQ.
- Reintroducing per-page copies of the house CSS.
