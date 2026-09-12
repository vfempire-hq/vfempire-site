// Injects the revolver pricing section into the 5 legacy standalone pages
// (fuelit, guardian-shield, mapit, self-filing-ledger, snapit) — one-off
// splice: pricingCss into <style>, pricingHtml between roadmap and cta-band.
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { pricingCss, pricingHtml, sysreqHtml, PRICING } from './pricing.mjs';
const DIR = path.dirname(fileURLToPath(import.meta.url));

const PAGES = [
  { slug: 'fuelit',              brand: 'FuelIT' },
  { slug: 'guardian-shield',     brand: 'Guardian Shield' },
  { slug: 'mapit',               brand: 'MapIT' },
  { slug: 'self-filing-ledger',  brand: 'Self-Filing Ledger' },
  { slug: 'snapit',              brand: 'SnapIT' },
];

for (const { slug, brand } of PAGES) {
  const file = path.join(DIR, slug + '.html');
  let html = fs.readFileSync(file, 'utf8');
  if (!PRICING[slug]) { console.error('no PRICING for', slug); continue; }

  // Purge any previous injection so re-runs stay idempotent even after CSS/data changes
  html = html.replace(/\/\* ═══════════ pricing \(revolver\)[\s\S]*?@media \(prefers-reduced-motion:reduce\)\{[^}]+\}[^}]+\}[^}]+\}\n?/g, '');
  html = html.replace(/<section id="pricing"[\s\S]*?<\/section>\n?\n?/g, '');
  html = html.replace(/<section id="sysreq"[\s\S]*?<\/section>\n?\n?/g, '');

  // 1. Inject CSS into the main <style> block, before /* cta + footer */
  const cssMarker = '/* cta + footer */';
  if (html.includes(cssMarker)) {
    html = html.replace(cssMarker, pricingCss + '\n' + cssMarker);
  } else {
    // Fall back: append before </style>
    html = html.replace('</style>', pricingCss + '\n</style>');
  }

  // 2. Inject sections between end-of-roadmap and cta-band: sysreq then pricing
  const sections = sysreqHtml(slug) + '\n' + pricingHtml(slug, brand);
  const ctaMarker = '<section class="cta-band">';
  if (html.includes(ctaMarker)) {
    html = html.replace(ctaMarker, sections + '\n' + ctaMarker);
  } else {
    console.error('no cta-band anchor in', slug);
    continue;
  }

  fs.writeFileSync(file, html);
  console.log('injected', slug, '(' + brand + ')');
}
