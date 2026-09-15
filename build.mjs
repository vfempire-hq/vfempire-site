#!/usr/bin/env node
// vfempire.com — the one build step.
//
//   node build.mjs            build everything: generated product pages, shared partials on every
//                             source page, sitemap.xml, dist/ mirror with hashed stylesheet and
//                             AVIF/WebP image variants
//   node build.mjs --check    build, then fail if the working tree changed (CI parity gate)
//   node build.mjs --no-images  skip the image pipeline (fast local builds)
//
// Source pages stay complete, hand-editable HTML. The build only normalises the shared blocks
// (nav links, Systems flyout, footer, consent notice, house script) so one edit here reaches
// every page, and produces dist/ exactly as Cloudflare serves it.
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const ROOT = path.dirname(fileURLToPath(import.meta.url));
const args = new Set(process.argv.slice(2));
const CHECK = args.has('--check');
const IMAGES = !args.has('--no-images');
const TODAY = new Date().toISOString().slice(0, 10);

// ------------------------------------------------------------------ partials
const NAV_LINKS = `<div class="nl"><button data-m="m-sys" type="button">Systems</button><a href="/software">Software</a><a href="/services/">Services</a><a href="/security">Security</a><a href="/contact/">Contact</a></div>`;

const FLYOUT = `<div class="fly" id="m-sys"><div class="in">
  <div class="col"><b>THE METHOD</b>
    <a href="/engine">Helmsman Engine<small>Frontier open models, steered</small></a>
    <a href="/harness">Harness Stack<small>The frame around the model</small></a>
    <a href="/dashboards">Command Dashboards<small>Fleet, process &amp; cost control</small></a>
  </div>
  <div class="col"><b>SYSTEMS</b>
    <a href="/systems/">All 23 systems<small>The build slate, filterable</small></a>
    <a href="/systems/fileit">FileIT<small>The self-filing ledger</small></a>
    <a href="/systems/nav-it">NAV·IT<small>A navigator that never sells your route</small></a>
    <a href="https://snapit.vfempire.com">SnapIT<small>Live · from €59, one-off</small></a>
  </div>
  <div class="col"><b>SERVICES</b>
    <a href="/services/">All services<small>Three fixed-fee engagements</small></a>
    <a href="/services/cra-readiness-audit">CRA Readiness Audit<small>2 weeks · €12-18k</small></a>
    <a href="/services/threat-model-dpia">Threat Model + DPIA<small>3-4 weeks · €18-30k</small></a>
  </div>
  <div class="col"><b>COMPANY</b>
    <a href="/about">About<small>The systems house, Malta</small></a>
    <a href="/training-centre">AI Training Centre<small>First intake forming</small></a>
    <a href="/journal/">Journal<small>The build log, dated</small></a>
    <a href="/glossary">Glossary<small>Harness, gate, sovereign AI</small></a>
  </div>
</div></div>
<div id="dim"></div>`;

const BRAND_SVG = `<svg width="20" height="20" viewBox="0 0 24 24"><path d="M3 4l5.2 16h2.2L4.4 4H3zm7 0l5.2 16h2.2L11.4 4H10zm10.6 0h-6.2l.7 2.1h5.5V4zm-4.2 6.6l.7 2.1h3.5v-2.1h-4.2z" fill="#1d1d1f"/></svg>`;

const footerHtml = (attrs = '') => `<footer${attrs} class="full">
  <div class="fin">
    <div class="fgrid">
      <div>
        <div class="brand" style="margin-bottom:6px">
          ${BRAND_SVG}
          VF EMPIRE
        </div>
        <p class="blurb">The systems house for open intelligence. Engines, harnesses and dashboards, designed in Malta and run on hardware you own.</p>
      </div>
      <div>
        <h6>SYSTEMS</h6>
        <a href="/systems/">All 23 systems</a>
        <a href="/engine">Helmsman Engine</a>
        <a href="/harness">Harness Stack</a>
        <a href="/dashboards">Command Dashboards</a>
        <a href="https://si-lock.com">S◉LOCK OS</a>
      </div>
      <div>
        <h6>SERVICES</h6>
        <a href="/services/">All services</a>
        <a href="/services/cra-readiness-audit">CRA Readiness Audit</a>
        <a href="/services/threat-model-dpia">Threat Model + DPIA</a>
        <a href="/services/signing-infrastructure">Signing + SBOM Blueprint</a>
        <a href="/permanence-guarantee">Permanence Guarantee</a>
      </div>
      <div>
        <h6>COMPANY</h6>
        <a href="/about">About</a>
        <a href="/software">Software thesis</a>
        <a href="/security">Security posture</a>
        <a href="/training-centre">AI Training Centre</a>
        <a href="/journal/">Journal</a>
        <a href="/glossary">Glossary</a>
        <a href="/press">Press</a>
        <a href="/careers">Careers</a>
      </div>
      <div>
        <h6>CONTACT</h6>
        <a href="mailto:hello@vfempire.com">hello@vfempire.com</a>
        <a href="mailto:sales@vfempire.com">sales@vfempire.com</a>
        <a href="mailto:support@vfempire.com">support@vfempire.com</a>
        <a href="/contact/">All addresses →</a>
        <a href="https://noirda.solutions">Noirda GmbH · Germany</a>
        <a href="https://gn-productions.com">Guardian Network · UK</a>
      </div>
    </div>
    <div class="legal">
      <span>© 2026 VF Empire Corp Ltd · Company No. C 94160 · VAT MT 2686-9431 · Għajnsielem, Gozo, Malta · EU · Incorporated 2019</span>
      <span><a href="/legal/terms">Terms</a> &nbsp;·&nbsp; <a href="/legal/privacy">Privacy</a> &nbsp;·&nbsp; <a href="/legal/cookies">Cookies</a> &nbsp;·&nbsp; <a href="/legal/security-policy">Security policy</a></span>
    </div>
  </div>
</footer>`;

const CONSENT = `<div class="consent" id="consent" role="dialog" aria-label="Cookie notice">
  <h5><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#1f6ff2" stroke-width="2"><circle cx="12" cy="12" r="9"/><circle cx="9" cy="10" r="1" fill="#1f6ff2" stroke="none"/><circle cx="14" cy="14" r="1" fill="#1f6ff2" stroke="none"/><circle cx="13" cy="8.5" r="1" fill="#1f6ff2" stroke="none"/></svg>Privacy, by architecture.</h5>
  <p>This site sets <strong>no tracking, no analytics and no advertising cookies</strong>. It stores only what it needs to serve you securely. We ask anyway, because we build everything this way. Details in our <a href="/legal/cookies">Cookie Policy</a> and <a href="/legal/privacy">Privacy Policy</a>.</p>
  <div class="row">
    <button class="dec" id="cdec">Decline</button>
    <button class="acc" id="cacc">Accept</button>
  </div>
</div>`;

const HOUSE_SCRIPT = `<script src="/assets/house.js" defer></script>`;
const ICONS = `<link rel="icon" href="/favicon.ico" sizes="32x32">
<link rel="icon" type="image/svg+xml" href="/assets/brand/app-icon.svg">
<link rel="apple-touch-icon" href="/apple-touch-icon.png">
<link rel="manifest" href="/site.webmanifest">`;
const NOSCRIPT = `<noscript><style>.rv{opacity:1;transform:none}</style></noscript>`;

// Known inline script variants that house.js replaces (consent IIFE, reveal observer, stagger).
const INLINE_SCRIPTS = [
  /<script>\n\(\(\) => \{\n  const el = document\.getElementById\('consent'\);[\s\S]*?<\/script>\n/g,
  /<script>\nconst io = new IntersectionObserver\([\s\S]*?<\/script>\n/g,
  /<script>\n\/\/ Reveal-on-scroll[\s\S]*?<\/script>\n/g,
];

// ------------------------------------------------------------------ helpers
const read = f => fs.readFileSync(f, 'utf8');
const write = (f, s) => { fs.mkdirSync(path.dirname(f), { recursive: true }); fs.writeFileSync(f, s); };
const walk = (dir, out = []) => {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) { if (!['dist', 'docs', 'node_modules', '.git', 'fonts', 'assets', 'scripts', 'workers'].includes(e.name)) walk(p, out); }
    else if (e.name.endsWith('.html')) out.push(p);
  }
  return out;
};
const rel = p => path.relative(ROOT, p).split(path.sep).join('/');
const gitDate = f => {
  try { return execSync(`git log -1 --format=%cs -- "${f}"`, { cwd: ROOT }).toString().trim() || TODAY; } catch { return TODAY; }
};

// ------------------------------------------------------------------ 1. generated product pages
await import('./systems/_build.mjs');

// ------------------------------------------------------------------ 2. shared partials on every source page
const pages = walk(ROOT).sort();
let changed = 0;
for (const p of pages) {
  const f = rel(p);
  let s = read(p); const before = s;
  const isIndex = f === 'index.html';
  const noindex = /name="robots" content="noindex"/.test(s);

  // head: house.css, no-JS fallback, scroll rail
  if (!s.includes('href="/house.css"')) s = s.replace(/(<meta name="theme-color"[^>]*>\n)/, `$1<link rel="stylesheet" href="/house.css">\n`);
  if (!s.includes('<noscript>')) s = s.replace('<link rel="stylesheet" href="/house.css">\n', `<link rel="stylesheet" href="/house.css">\n${NOSCRIPT}\n`);
  if (!noindex && !s.includes('scrollrail.js')) s = s.replace(`${NOSCRIPT}\n`, `<script src="/assets/scrollrail.js" defer></script>\n${NOSCRIPT}\n`);

  // favicon set + manifest (replaces the old inline data: icon)
  s = s.replace(/<link rel="icon" href="data:image\/svg\+xml[^>]*>\n?/, '');
  s = s.replace(/<link rel="icon" href="\/favicon\.ico"[^>]*>\n<link rel="icon" type="image\/svg\+xml"[^>]*>\n<link rel="apple-touch-icon"[^>]*>\n<link rel="manifest"[^>]*>\n?/, '');
  if (s.includes('<!-- seo-pass -->')) s = s.replace('<!-- seo-pass -->', `${ICONS}\n<!-- seo-pass -->`);
  else s = s.replace('</head>', `${ICONS}\n</head>`);

  // nav links + Systems flyout on subpages (the homepage keeps its own four-menu nav)
  if (!isIndex) {
    s = s.replace(/<div class="nl">[\s\S]*?<\/div>/, NAV_LINKS);
    if (!s.includes('<div class="nl">')) s = s.replace(/(<span class="crumb">[\s\S]*?<\/span>\n)/, `$1    ${NAV_LINKS}\n`);
    s = s.replace(/\n<div class="fly" id="m-sys">[\s\S]*?<\/div><\/div>\n<div id="dim"><\/div>\n/, '\n');
    s = s.replace(/<\/nav>\n/, `</nav>\n${FLYOUT}\n`);
  }

  // footer
  const fm = s.match(/<footer([^>]*)>[\s\S]*?<\/footer>/);
  if (fm) {
    const attrs = (fm[1].match(/ id="[^"]+"/) || [''])[0];
    s = s.replace(fm[0], footerHtml(attrs));
  }

  // consent notice + house script (public pages)
  if (!noindex) {
    if (s.includes('id="consent"')) s = s.replace(/<div class="consent" id="consent"[^>]*>[\s\S]*?\n<\/div>/, CONSENT);
    else s = s.replace('</body>', `${CONSENT}\n\n</body>`);
    for (const re of INLINE_SCRIPTS) s = s.replace(re, '');
    if (!s.includes(HOUSE_SCRIPT)) s = s.replace('</body>', `${HOUSE_SCRIPT}\n\n</body>`);
  }
  // inline scripts become files under assets/page/ so the CSP can drop 'unsafe-inline' for scripts
  let n = 0;
  s = s.replace(/<script>([\s\S]*?)<\/script>\n?/g, (m, code) => {
    const name = f.replace(/\.html$/, '').replace(/[\/]/g, '-') + (n ? `-${n}` : '') + '.js'; n++;
    write(path.join(ROOT, 'assets', 'page', name), code.trim() + '\n');
    return `<script src="/assets/page/${name}" defer></script>\n`;
  });

  s = s.replace(/\n{4,}/g, '\n\n\n');
  if (s !== before) { write(p, s); changed++; }
}
console.log(`partials: ${pages.length} pages, ${changed} updated`);

// ------------------------------------------------------------------ 3. sitemap.xml
const urls = [];
for (const p of pages) {
  const f = rel(p); const s = read(p);
  if (/name="robots" content="noindex"/.test(s)) continue;
  const canon = (s.match(/<link rel="canonical" href="([^"]+)"/) || [])[1];
  if (!canon) continue;
  let pr = '0.6', cf = 'monthly';
  if (f === 'index.html') { pr = '1.0'; cf = 'weekly'; }
  else if (f.startsWith('systems/') || f.startsWith('services/')) { pr = '0.8'; }
  else if (['software.html', 'security.html', 'engine.html', 'harness.html', 'dashboards.html'].includes(f)) { pr = '0.9'; }
  else if (f.startsWith('journal/')) { pr = f === 'journal/index.html' ? '0.8' : '0.5'; cf = f === 'journal/index.html' ? 'weekly' : 'yearly'; }
  else if (f.startsWith('legal/')) { pr = '0.3'; cf = 'yearly'; }
  urls.push({ loc: canon, lastmod: gitDate(f), cf, pr });
}
urls.sort((a, b) => a.loc.localeCompare(b.loc));
write(path.join(ROOT, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
  urls.map(u => `  <url>\n    <loc>${u.loc}</loc>\n    <lastmod>${u.lastmod}</lastmod>\n    <changefreq>${u.cf}</changefreq>\n    <priority>${u.pr}</priority>\n  </url>\n`).join('') + `</urlset>\n`);
console.log(`sitemap: ${urls.length} urls`);

// ------------------------------------------------------------------ 4. dist mirror
const DIST = path.join(ROOT, 'dist');
const copyDir = (src, dst) => { fs.mkdirSync(dst, { recursive: true }); fs.cpSync(src, dst, { recursive: true }); };
for (const p of pages) write(path.join(DIST, rel(p)), read(p));
for (const f of ['sitemap.xml', 'llms.txt', 'site.webmanifest', ...fs.readdirSync(ROOT).filter(n => /^[0-9a-f]{32}\.txt$/.test(n))]) if (fs.existsSync(path.join(ROOT, f))) write(path.join(DIST, f), read(path.join(ROOT, f)));
for (const f of ['favicon.ico', 'apple-touch-icon.png']) if (fs.existsSync(path.join(ROOT, f))) fs.copyFileSync(path.join(ROOT, f), path.join(DIST, f));
if (fs.existsSync(path.join(ROOT, 'journal'))) for (const f of ['feed.xml', 'feed.json']) if (fs.existsSync(path.join(ROOT, 'journal', f))) write(path.join(DIST, 'journal', f), read(path.join(ROOT, 'journal', f)));
copyDir(path.join(ROOT, 'assets'), path.join(DIST, 'assets'));
copyDir(path.join(ROOT, 'fonts'), path.join(DIST, 'fonts'));
// remove fonts no page uses
for (const f of fs.readdirSync(path.join(DIST, 'fonts'))) if (!['hanken.woff2', 'instrument-italic.woff2'].includes(f)) fs.rmSync(path.join(DIST, 'fonts', f));

// hashed stylesheet: /assets/house.<hash>.css (immutable), /house.css kept as a fallback alias
const css = read(path.join(ROOT, 'house.css'));
const hash = crypto.createHash('sha256').update(css).digest('hex').slice(0, 10);
const hashed = `/assets/house.${hash}.css`;
for (const f of fs.readdirSync(path.join(DIST, 'assets'))) if (/^house\.[0-9a-f]{10}\.css$/.test(f) && f !== `house.${hash}.css`) fs.rmSync(path.join(DIST, 'assets', f));
write(path.join(DIST, 'assets', `house.${hash}.css`), css);
write(path.join(DIST, 'house.css'), css);
const distPages = walk(DIST).filter(p => !rel(p).includes('/preview/') && !rel(p).includes('/dev/'));
for (const p of distPages) write(p, read(p).replace('href="/house.css"', `href="${hashed}"`));
console.log(`dist: ${distPages.length} pages, stylesheet ${hashed}`);

// ------------------------------------------------------------------ 5. images: AVIF + WebP variants and <picture> in dist
if (IMAGES) {
  let sharp = null;
  try { sharp = (await import('sharp')).default; } catch { console.log('images: sharp not installed (npm install), skipping'); }
  if (sharp) {
    const imgs = [];
    const scan = d => { for (const e of fs.readdirSync(d, { withFileTypes: true })) { const p = path.join(d, e.name); if (e.isDirectory()) scan(p); else if (/\.(png|jpe?g)$/i.test(e.name)) imgs.push(p); } };
    scan(path.join(DIST, 'assets'));
    let made = 0;
    for (const src of imgs) {
      const base = src.replace(/\.(png|jpe?g)$/i, '');
      const st = fs.statSync(src);
      for (const [ext, opts] of [['webp', { quality: 82 }], ['avif', { quality: 55, effort: 4 }]]) {
        const out = `${base}.${ext}`;
        if (fs.existsSync(out) && fs.statSync(out).mtimeMs >= st.mtimeMs) continue;
        const img = sharp(src);
        const meta = await img.metadata();
        const w = Math.min(meta.width || 1600, 1600);
        await img.resize({ width: w, withoutEnlargement: true })[ext](opts).toFile(out);
        made++;
      }
    }
    for (const p of distPages) {
      let s = read(p);
      s = s.replace(/<img ([^>]*?)src="([^"]+\.(?:png|jpe?g))"([^>]*)>/g, (m, a, srcAttr, b) => {
        const abs = srcAttr.startsWith('/') ? srcAttr : srcAttr.startsWith('../') ? '/' + srcAttr.slice(3) : '/' + srcAttr;
        const stem = abs.replace(/\.(png|jpe?g)$/i, '');
        if (!fs.existsSync(path.join(DIST, `${stem}.webp`))) return m;
        return `<picture><source type="image/avif" srcset="${stem}.avif"><source type="image/webp" srcset="${stem}.webp"><img ${a}src="${srcAttr}"${b}></picture>`;
      });
      write(p, s);
    }
    console.log(`images: ${imgs.length} sources, ${made} variants written`);
  }
}

// ------------------------------------------------------------------ 6. check mode
if (CHECK) {
  const diff = execSync('git status --porcelain', { cwd: ROOT }).toString().trim();
  if (diff) { console.error('build --check: the build changed tracked files; run node build.mjs and commit:\n' + diff); process.exit(1); }
  console.log('build --check: clean');
}
