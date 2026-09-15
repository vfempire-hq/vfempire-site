# vfempire.com site review and plan, September 2026

Scope: every page in the source tree (34 pages, 22 product pages, 3 services, home, software, security, contact, 3 legal, 2 error pages). Method: full read of the markup and copy, a per-page SEO audit script, Playwright screenshots at 1440 px and 390 px before and after this pass, and a crawl-surface check (sitemap, robots, security.txt, internal links).

The pass that ships alongside this document already did the following: stop-slop copy rewrite on every page, one shared house stylesheet, consistent nav, footer and consent notice on every page, primary nav links on every subpage, structured data and social cards on every page, a sitemap with all 33 public URLs, an answer-engine-friendly robots.txt and a /llms.txt. Everything below is what comes next, ranked by expected traffic impact.

## 1. Where the traffic will come from

Search demand this site can win sits in five intent groups. Each needs a page whose H1, title and first paragraph say the same thing.

| Intent group | Example queries | Page that should rank | State today |
|---|---|---|---|
| Sovereign / local-first AI systems | sovereign AI system, on-premise LLM deployment, self-hosted AI orchestration, EU AI systems engineering | /engine, /harness, /dashboards, /systems/ | Only homepage anchors exist (#engine, #rd). Anchors do not rank. |
| CRA and GDPR consulting | Cyber Resilience Act audit, CRA readiness, DPIA drafting, SBOM signing infrastructure, CRA consultant EU | /services/ index + the 3 service pages | Service pages are strong; no index page; no nav entry on subpages. |
| Product searches | self-hosted navigation app, fuel price app Europe, private photo library software, EU digital identity wallet, digital legacy vault, private smart home hub | /systems/* | Titles too long (50 to 84 characters), descriptions up to 279 characters, 4 internal links per page. |
| Training and education | AI training centre Malta, AI engineering course EU, harness engineering training | /training-centre | Homepage section only. |
| Trust and entity queries | VF Empire, VF Empire Malta, Vincent Falzon, Permanence Guarantee, S◉LOCK | /about, /permanence-guarantee, /press | No about page. security.txt links /careers and /legal/security-policy, both 404. |

## 2. Additions: pages the site is missing

Ordered by value. Each is a real URL with its own title, H1, description, breadcrumb and schema; the generator pattern in `systems/_build.mjs` is the model for the templated ones.

1. **/systems/** index. Every product tile with sector and status filters, one paragraph of house method at the top, ItemList schema. This becomes the page that ranks for "VF Empire products" and the hub that passes authority to 22 product pages.
2. **/services/** index. The three fixed-fee engagements side by side, a comparison table (weeks, fee, deliverables), the discovery-call CTA, Service schema. Add "Services" to the subpage nav once it exists.
3. **/engine**, **/harness**, **/dashboards**. One page per pillar of the house method. These are the pages that answer "what is an AI harness" and "what is an orchestration engine", the questions answer engines get asked. Each: definition in the first 40 words, a diagram, how it ships inside every VF system, FAQ block.
4. **/training-centre**. Curriculum lanes, intake dates, who it is for, EducationalOrganization and Course schema. Register-interest form that posts to a mailto today and to a Worker later.
5. **/about**. Founding, registration, the two network companies, the people. This is the E-E-A-T page search engines look for before they trust a company site; link it from every footer.
6. **/permanence-guarantee**. The guarantee has a name and is referenced from 6 pages; it deserves one URL with the contractual text, the escrow mechanism and the source-release clause.
7. **/journal** (build log). The commit history already reads like release notes ("112 to 122 tests, Malta jurisdiction live"). Publish those as dated entries with an RSS feed. Fresh, specific, technical content is the single largest lever for organic traffic on a site this size.
8. **/glossary**. Twenty terms (sovereign AI, harness, gate, evidence discipline, local-first, reproducible build, transparency log, Permanence Guarantee, ARF, CRA, DPIA, SBOM). Each entry is a 60-word definition plus a link to the page that uses it. Answer engines quote glossary entries verbatim.
9. **/compare/** pages. "VF Mail vs Proton Mail", "Guardian Shield vs Bitwarden", "NAV·IT vs Google Maps". High-intent, low-competition queries; the security page already makes these comparisons in prose.
10. **/press** and **/careers**. Press kit, logo files, boilerplate, founder bio; careers page (security.txt already points there).
11. **Fix the broken references**: `/legal/security-policy` and `/careers` in `.well-known/security.txt`, `vfempire.com/security/pgp` and `bounty.vfempire.com` on the security page. Either build them or point them at pages that exist.
12. **Remove the placeholders** on product pages: the "papers & code" cards labelled TBA read as unfinished work. Publish the ADRs they promise (several already exist in the product repos) or drop the block until they do.

## 3. SEO and AEO: backend work per page

Done in this pass: robots directive, Open Graph and Twitter cards, font preload, BreadcrumbList, FAQPage from visible FAQs, Service and Offer schema on services, ContactPage and ContactPoint schema, Organization sameAs and contactPoint, homepage ItemList, sitemap, robots.txt, llms.txt, no-JS fallback for the reveal animation.

Next, in order:

1. **Titles and descriptions.** 13 of the 22 product titles exceed 60 characters and 22 descriptions exceed 160; search engines truncate both. Rewrite to the pattern `Product: five-word promise | VF Empire` and a 140-character description that names the category, the region and the differentiator. The generator makes this a content-pack edit (`titleTag`, `metaDesc`, `ogDesc`).
2. **FAQ on every product page.** The services and security pages carry FAQ blocks and now FAQPage schema; the 22 product pages carry none. Add a `faq` array to each content pack entry (4 to 6 questions in the words a buyer types: "Does NAV·IT work offline?", "Which countries does FuelIT cover?") and render it in the template. This is the highest-yield AEO change available.
3. **Internal linking.** Product pages link out 4 times. Add a "Related systems" block (same sector, plus the two systems it ships inside or alongside), the pillar links (engine, harness, dashboards) in the method section, and the full 4-column footer on every page. Target: 12 or more distinct internal links per page.
4. **Image SEO and performance.** Homepage product tiles ship with empty alt text; give every product image a descriptive alt with the product name. Convert the PNG hero assets (imgstudio-library.png at 3.6 MB, neo3d-pinklady.png at 1.5 MB, four more above 450 KB) to AVIF/WebP with `srcset`, set explicit width and height to stop layout shift, and mark the hero image `fetchpriority="high"`. Add `loading="lazy"` and `decoding="async"` below the fold.
5. **SoftwareApplication schema depth.** Add `url`, `image`, `softwareVersion`, `releaseNotes` and, where pricing is public (SnapIT is live), an `offers` node with real prices. Keep planned prices out of schema until they are final.
6. **Entity corroboration.** Search engines confirm an organisation from outside sources: a LinkedIn company page, a Crunchbase profile, a GitHub organisation README that links back, a Wikidata item (registration number, founding date, website). Add each to `sameAs`.
7. **Search Console, Bing Webmaster Tools and IndexNow.** All three are script-free (DNS or file verification). Cloudflare can send IndexNow pings on deploy so new pages are indexed within hours instead of weeks. Without Search Console there is no way to see which queries already bring traffic.
8. **Speakable and definitions.** On the pillar and glossary pages, put the one-sentence definition in the first paragraph, mark it with `speakable` in WebPage schema, and repeat the entity name in the H1. Answer engines lift these sentences directly.
9. **German market.** Noirda GmbH and the DE launch of FuelIT and VF Wallet argue for `/de/` versions of the homepage, services and the two products, with `hreflang` pairs. Second phase.

## 4. Visual enhancement plan

The house look is right: paper, ink and one blue, Hanken with an Instrument italic accent, a frosted 52 px nav, pill buttons, 20 px radii. This pass made it consistent. What follows sharpens it.

1. **Contrast.** The faint grey (#a1a1a6) used for kickers, chip labels, tile tags and the pricing note sits below the WCAG AA ratio for small text on white. Move small labels to the dove grey (#6e6e73) or the deep blue (#0b47b8); keep faint for decorative rules only. One token change in `house.css` fixes most of it.
2. **Hero band edge.** On product pages the hero band is capped at 1150 px and ends before the viewport on wide screens, leaving a hard edge. Make the band full-bleed with the content wrapper inside it, matching the homepage hero.
3. **Pricing card overflow.** At 390 px the revolver pricing card is wider than the viewport; the "TRACKER" tier label is cut off. Scale the card with `min(560px, 100%)` and let the stats grid wrap.
4. **One signature visual per page.** Product pages share eight identical section shapes. Each already has three renders (hero, flow, mechanics); give the flow render a full-width band with the caption as a figure, so each page has one moment that is not a card grid.
5. **Kicker rhythm.** Every section opens with the same tracked uppercase label. Keep it as the house grammar but drop it on alternating sections (the failures list and the roadmap can open straight with the H2), so the page reads as designed rather than templated.
6. **Motion budget.** Every element carries a reveal-on-scroll. Limit it to section headers and the first row of each grid; let cards appear at once. Fewer, better-timed reveals read as more expensive.
7. **Subpage footer.** Subpages carry the compact footer. Use the homepage's four-column footer everywhere: it doubles as the site map and adds 20 internal links per page.
8. **Chips and status.** Status chips (IN BUILD, SPEC COMPLETE, LIVE) use three different treatments across the homepage tiles, the product hero and the roadmap. Define one `status` chip set in `house.css` with three states and use it in all three places.
9. **Icons.** The audience bento uses inline SVG icons with a 38 px tinted square behind each; the pattern repeats on 25 pages. Consider dropping the square and letting the icon sit on the card at 20 px, or replacing icons with the product's own render crops.

## 5. Layout plan

1. **Home**: keep the order (hero, engine room, R&D, divisions, build slate, training centre, S◉LOCK, FAQ, ratings, integrate, commission). Add sector filters to the build slate and cut the tile count shown by default to 12 with a "See all 22" link to `/systems/`.
2. **Product pages**: hero, why, who, how, mechanics, roadmap, FAQ (new), papers and code (only when real), pricing, requirements, related systems (new), CTA. FAQ before pricing so the buyer's objections are answered where the price is.
3. **Services**: add the index page above the three; on each service page move the deliverables list above the timeline (buyers read what they get before how long it takes).
4. **Company pages** (software, security, about, training centre): centred hero, then alternating full-bleed bands and text columns; no card grids below the fold.
5. **Navigation**: subpages now carry Systems, Software, Security and Contact. Add Services once the index exists, and give the Systems item a flyout on subpages too (the homepage flyout markup can move into `house.css` and a shared partial).

## 6. Technical enhancements

1. **One build step for the whole site.** The generator covers 13 product pages; the other 21 pages carry hand-copied nav, footer and consent markup. Extend `_build.mjs` (or a small `build.mjs` at the root) to stamp shared partials into every page from one source, so the next change to the nav is one edit. Keep the output committed in `dist/` as today.
2. **CI checks on every push.** HTML validation, a link checker, the em-dash and slop grep from this pass, JSON-LD validation, and Lighthouse CI with budgets (LCP under 2.5 s, CLS under 0.1, 100 SEO). GitHub Actions, no external services.
3. **Cache and headers.** `house.css` now revalidates on every load; move to a content-hashed filename written by the build step and cache it for a year. Add an `Early-Hints`/`Link: rel=preload` header for the stylesheet and the font.
4. **Images pipeline.** A build script that emits AVIF, WebP and a fallback at three widths for every asset in `assets/`, and writes the `srcset` into the pages. Today the 22 pipe tiles alone weigh several megabytes on the homepage.
5. **Font subsetting.** `hanken.woff2` is 34 KB and fine; `SILOCKSans-Variable.woff2` (352 KB) and the TTFs in `/fonts/` are unused by any page and should leave the served tree.
6. **CSP hardening.** The policy still allows `'unsafe-inline'` for scripts. Once the build step exists, move inline scripts to `/assets/*.js` and drop the exception; keep `'unsafe-inline'` for styles until the page-specific CSS moves out too.
7. **Forms without third parties.** Register-interest and discovery-call forms as a Cloudflare Worker that writes to VF Mail; today every CTA is a `mailto:`, which loses mobile users who have no mail client configured.
8. **Analytics without scripts.** Cloudflare zone analytics (server-side) plus Search Console cover traffic and queries with zero client-side code, consistent with the privacy posture.
9. **Sitemap from git.** Generate `lastmod` from each file's last commit date in the build step instead of by hand.
10. **RSS/Atom** for the journal and a JSON feed for the build slate (status changes), both linked from `<head>`.

## 7. Copy voice, going forward

The rules the pass applied are in `THE-OS/prompt-skills/stop-slop`. For this site the working rules are: no em dashes; no "not X, it's Y" reversals; no adverb crutches; name the actor; keep the product guarantees ("never sent to Google") exactly as written because a mechanism backs them; keep headlines short and declarative. Run the verification grep from this pass before every commit; the generator's content packs are the place to edit product copy.

## 8. Suggested order of work

| Sprint | Items | Why first |
|---|---|---|
| 1 | Titles and descriptions; product FAQ blocks; /systems/ and /services/ index pages; broken references; Search Console + Bing + IndexNow | Direct ranking impact, all content-pack or small template edits |
| 2 | Pillar pages (/engine, /harness, /dashboards), /about, /permanence-guarantee, full footer everywhere, related-systems block | Builds the entity and the internal link graph |
| 3 | Journal with RSS, glossary, first three compare pages | Fresh content and answer-engine coverage |
| 4 | Image pipeline, one build step, CI checks, hashed CSS, CSP tightening | Performance and maintainability |
| 5 | Training centre page with schema, forms via Worker, German versions | Conversion and second market |
