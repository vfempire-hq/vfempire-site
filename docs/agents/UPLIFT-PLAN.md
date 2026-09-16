# Agent pages · visual craft uplift plan

**Version**: 0.1 (draft, pending Vincent gate)
**Date**: 2026-09-16
**Scope**: /agents/, /agents/re-kon, /agents/auto-mate. Proof-of-concept first, then back-ports to /software, /systems, /security.
**Target**: match or beat the visual craft of Framer.com, Linear.app, Vercel.com, Arc.net, Anthropic.com. Zero third-party JS, zero CDN fonts, zero telemetry, self-hosted everything. Every principle from the existing house rules kept.

---

## 1. Non-negotiables (kept from the house)

These stay exactly as they are. No dark mode. No third-party. Everything below is layered on top.

- One shared stylesheet at `/house.css`. Any new shared component goes there.
- Zero third-party scripts. No CDN fonts. No analytics. No embeds. CSP stays `'self'` for everything.
- Light theme only. Paper `#fbfbfd`, silver, mist, ink, dove, faint, line, core blue `#1f6ff2`, core-deep `#0b47b8`.
- Hanken (self-hosted) plus Instrument italic accent.
- British spelling. No em dashes anywhere. No stop-slop words. Verify.py passes.
- Every page keeps: canonical, OG, JSON-LD (WebPage, BreadcrumbList, SoftwareApplication where relevant, FAQPage), sitemap entry, llms.txt entry, house nav, house footer, consent notice.
- `prefers-reduced-motion` respected on every new motion. Content works with JS disabled.
- Reproducible builds, verifiable, per Terms § 15.

## 2. Where we are today

The site is Apple-light editorial minimalism, executed well. What's missing to reach Framer-tier is not more decoration; it is **choreographed motion, live product surfaces, and interaction density**. The current agent pages have static art placeholders, static cards, one reveal-on-scroll animation, and no evidence that the product moves. A visitor cannot see what the product does without reading text.

Uplift replaces "static explanation" with "live demonstration".

## 3. New capabilities we add

Six new capabilities across the design system. All self-hosted. All progressive-enhancement (page works without them).

### 3.1 Live-hero pattern

Every agent's hero contains a **looping, deterministic, in-browser demonstration of the product**. Not a video file. Inline SVG plus a small vanilla JS module that drives an animation timeline.

- **Auto-Mate hero**: a floating input box that types a query, shows the intent classifier's JSON output, shows the plan preview panel with typed actions, shows the confirm gate, shows execution. Loop, 12–18 seconds. Ends with a soft flash on the result.
- **Re-Kon hero**: a mission graph. Sub-questions expand from a central brief node. For each, source dots pulse in from the edges and connect. Evidence chain builds as the mission fills. Ends with a dossier icon materialising and the completion event flashing. Loop, 14–20 seconds.
- **Agents hub hero**: the fleet bus. Two agent nodes (Re-Kon and Auto-Mate) with a bus socket between them. Message pulses cross the bus, capability names appearing over the sockets. Loop, 10–14 seconds.

Every hero animation is time-driven (deterministic), not scroll-driven. Auto-plays on view. Pauses when off-viewport. Restarts on next enter.

### 3.2 Motion tokens (extension of house.css)

Add a small motion palette on top of the current `--ease`. Spring-timing functions, choreographed delay scales, standard durations.

```css
:root {
  /* existing --ease stays */
  --ease-out-expo:  cubic-bezier(.16, 1, .3, 1);
  --ease-out-back:  cubic-bezier(.34, 1.56, .64, 1);
  --ease-in-out-quart: cubic-bezier(.76, 0, .24, 1);

  --spring-soft:  cubic-bezier(.5, 1.5, .3, 1);
  --spring-firm:  cubic-bezier(.4, 2.2, .3, 1);

  --dur-fast: 180ms;
  --dur-base: 320ms;
  --dur-slow: 560ms;
  --dur-hero: 900ms;

  --stagger: 60ms;
}
```

Everything animated uses one of these. No ad-hoc timing.

### 3.3 Magnetic interactive elements

Buttons, cards and section CTAs get subtle magnetic attraction to the cursor. Not a huge deflection. 4–10 px maximum, with a spring return. Zero effect at touch-first devices (feature-detected). Zero effect when `prefers-reduced-motion` is set.

Cursor treatment: the standard OS cursor stays. **We do not replace the cursor.** (Custom cursors annoy screen readers, keyboard users and accessibility tooling; they are Framer's weakest craft choice.) Instead the target moves toward the cursor. Subtler and more trustworthy.

### 3.4 Scroll-tied section reveals (upgraded)

Current `.rv` reveals fire once per element. Upgrade to a choreographed pattern:

- Section headers reveal first, with a mask-clip animation from left to right (not fade).
- Section leads reveal 200 ms after.
- Grids reveal in staggered columns (60 ms per column).
- Cards inside grids reveal in staggered rows (60 ms per row).
- Nothing reveals until the section is 20% in view.
- Reveal timing switches to a spring, not linear.

### 3.5 Product surfaces (self-hosted screenshots and mocks)

Every product gets at least one high-fidelity in-browser mock of its actual UI. Not a screenshot of a competitor. Not a stock image. A real render of the product's own window, styled to match the house.

- Auto-Mate: a full-detail render of the floating input at rest, and one with a plan preview panel expanded.
- Re-Kon: a full-detail render of the mission-live screen, with the evidence inspector open.
- Rendered on the German PC forge in matte style, per the standing render rules. Optimised to WebP, under 200 KB each.

### 3.6 Section-transition motions

Between sections, on `.alt` boundaries, add a subtle **material shift**: the incoming section's background slides in from the sides at 900 ms with the section content revealing on top of the slide. Only on desktop, only for non-reduced-motion.

## 4. The JS module

One file: `/assets/motion.js`. Vanilla, self-hosted, no dependencies. Under 8 KB minified. Handles:

- `IntersectionObserver` for reveals and hero-animation start/pause
- Magnetic cursor deflection on `[data-magnet]` elements
- Hero-animation timelines (Auto-Mate typing, Re-Kon mission graph, agents-hub fleet-bus)
- `matchMedia('(prefers-reduced-motion: reduce)')` guard on every effect
- One `MutationObserver` for late-added DOM, not needed today

Loads with `defer`. Page works without it (heroes fall back to first-frame static; reveals fall back to always-visible). Passes `verify.py` unchanged.

## 5. Rendering the hero product screens

The German PC forge is live (ComfyUI :8188, RTX 4080). For the product-surface renders (mocks of the product UI), we brief:

- **Style**: matte, editorial, no gloss, no plastic, no fantasy. House palette. Real window chrome. Real UI copy pulled from the engineering specs.
- **Format**: PNG at 3x, converted to WebP for web at 2x, with a 1x fallback. Explicit width and height on `<img>`.
- **Placement**: hero section (below the live animation), plus one further down each page.

The **live hero** (Section 3.1) does not need a render. It's SVG plus code.

## 6. Performance budget

- Per-page: max 300 KB total (HTML plus CSS plus JS plus above-fold WebP). Below-fold images lazy-load.
- JS: `motion.js` under 8 KB min, gzipped under 3 KB. No other JS added.
- CSS: no new stylesheet. Extensions go into `house.css`. Page-specific CSS stays inline as it is today.
- Every animation runs at 60 fps on the Vincent-standard test devices (macOS Safari 17, Chrome, Firefox; Windows Chrome and Edge; iOS Safari 17 with Reduce Motion off; iOS Safari 17 with Reduce Motion on).
- Time to first contentful paint under 800 ms on cold cache (Cloudflare-served, roughly the current baseline). Time to interactive under 1.2 s.
- Total requests per page under 12.

## 7. Craft details that raise the bar without adding weight

Small moves that read as "expensive" and cost almost nothing.

- Variable-weight animation on hero H1 (Hanken supports weight 100–900): weight settles from 400 to 600 in 900 ms on load.
- Instrument italic accent word in each H1 reveals with a small vertical drift plus a hairline underline that draws left to right.
- Kicker (`.k`) letters reveal one at a time on a 40 ms stagger.
- Cards get a hover state that slightly desaturates other cards in the same grid, focussing attention on the hovered one.
- Section transitions have a hairline `1px` accent divider that draws left to right, using the core blue at 40% opacity.
- Buttons have a subtle inner shimmer on hover, using a `mask-image` and a translated gradient (no keyframe re-layout).
- Chips inherit a tiny scale-up (1.0 to 1.03) on hover.
- Focus rings redesigned: single 2px core-blue ring, 4px offset, animated in on focus with a 180 ms opacity fade (accessibility retained).

## 8. Rollout order

1. **Motion tokens added to house.css** (Section 3.2).
2. **`/assets/motion.js` built** with reveals, magnets, and one hero animation slot.
3. **Auto-Mate page uplift** as the proof-of-concept. Live hero (Section 3.1 Auto-Mate). Full section-level uplifts. Product surface render.
4. **Vincent review at a preview URL** (`/preview/agents/auto-mate/`) so live `/agents/auto-mate/` keeps working during iteration.
5. **Iterate to the bar Vincent approves.**
6. **Promote** to `/agents/auto-mate/`.
7. **Re-Kon page** with the same pattern plus its own live hero (mission graph).
8. **Agents hub page** with the fleet-bus live hero.
9. **Back-port learnings** to /software, /systems, /security in a subsequent pass. Not part of this scope.

## 9. Explicit non-goals

- No 3D scenes, no WebGL, no Three.js. The visual language is 2D editorial.
- No sound. Silent product. If Vincent wants sound later it comes as a separate design pass.
- No dark mode.
- No custom cursor replacement.
- No third-party libraries (no GSAP, no Framer Motion, no anime.js, no Motion One, no Lenis, no Locomotive). Vanilla only.
- No frameworks (no React, no Svelte, no Astro).
- No CDN assets. Everything under `/assets/`, `/fonts/`, `/dist/`.
- No breaking any current token in `house.css`.

## 10. Success criteria

A visitor who lands on /agents/auto-mate and has never heard of the product understands within 6 seconds:

1. What Auto-Mate is (the floating input demonstration teaches this without text).
2. That it is safe (the confirm gate is visible in the demo).
3. That it composes with Re-Kon (a routing pulse in the demo teaches this).
4. That it is a one-time purchase (a chip in the hero).
5. That it runs on their machine (a chip in the hero).

Time-to-interactive stays under 1.2 s on cold cache. Lighthouse Performance 95+ on desktop, 90+ on mobile. `prefers-reduced-motion` degrades gracefully with no jank.

The visual craft measured against Framer.com, Linear.app, Vercel.com, Arc.net: at least equal on hero polish, and superior on trust signals (visible confirm gate, evidence chain, sealed data, no ads, no tracking).

## 11. Open decisions requiring Vincent gate

1. **Preview lane** (`/preview/agents/auto-mate/`) versus **iterate on the live page**. Recommend preview so live stays clean during iteration.
2. **Which agent page to uplift first**: Auto-Mate (recommended: the live floating-input demo is the strongest signature moment) or Re-Kon (research-scout mission graph is the more novel visual).
3. **Section-transition material slide** (Section 3.6): keep in the plan or drop as risk of feeling too "Framer".
4. **Hero animation length**: 10–20 seconds looped, or a one-shot on view with a "replay" affordance.
5. **Product-surface renders style**: matte editorial (as agreed) OR try a subtle "material" surface with soft shadows (still no gloss). Recommend the former for consistency with `/software`.
6. **How aggressive the magnet effect**: 4 px maximum (subtle) or up to 10 px (Framer-ish). Recommend 4–6 px.
7. **Font variable-weight settle on hero H1**: on or off. Recommend on, it's a signature move for basically zero cost.
