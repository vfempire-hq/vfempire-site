#!/usr/bin/env node
// VF Empire brand kit generator.
//   node scripts/brand-kit.mjs
// Writes assets/brand/ (SVG masters + PNG exports), site.webmanifest and the favicon set from one
// source of truth: the VF mark path used in every nav, and the Hanken wordmark outlined at weight 600
// with the nav's .16em tracking. Everything here is derived; never hand-edit the outputs.
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import sharp from 'sharp';
import * as fontkit from 'fontkit';
import wawoff2 from 'wawoff2';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT = path.join(ROOT, 'assets', 'brand');
fs.mkdirSync(OUT, { recursive: true });

// ---- tokens (mirrors house.css)
const INK = '#1d1d1f', PAPER = '#fbfbfd', SILVER = '#f5f5f7', CORE = '#1f6ff2', CORE_DEEP = '#0b47b8', DOVE = '#6e6e73', WHITE = '#ffffff', LINE = '#e4e6ea';

// ---- the mark: 24x24 viewBox, ink body from y=4 to y=20
const MARK_PATH = 'M3 4l5.2 16h2.2L4.4 4H3zm7 0l5.2 16h2.2L11.4 4H10zm10.6 0h-6.2l.7 2.1h5.5V4zm-4.2 6.6l.7 2.1h3.5v-2.1h-4.2z';
const MARK_BOX = { x: 3, y: 4, w: 18.6, h: 16 }; // tight bounds of the glyph body

// ---- wordmark outlines from the self-hosted variable font
const ttf = Buffer.from(await wawoff2.decompress(fs.readFileSync(path.join(ROOT, 'fonts', 'hanken.woff2'))));
const font = fontkit.create(ttf);
const upem = font.unitsPerEm;
const textPath = (str, { wght = 600, size = 100, tracking = 0.16, x = 0, y = 0 } = {}) => {
  // returns { d, width, capHeight } with y as the baseline; path coordinates in px
  const v = font.getVariation({ wght });
  const run = font.layout(str);
  const s = size / upem;
  let cx = x; const parts = [];
  for (const g of run.glyphs) {
    const gl = v.getGlyph(g.id);
    const d = gl.path.toSVG();
    if (d) parts.push(`<path transform="translate(${cx.toFixed(3)} ${y.toFixed(3)}) scale(${s.toFixed(6)} ${(-s).toFixed(6)})" d="${d}"/>`);
    cx += gl.advanceWidth * s + tracking * size;
  }
  return { markup: parts.join(''), width: cx - x - tracking * size, capHeight: font.capHeight * s };
};

const svg = (w, h, body, bg = null) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}">${bg ? `<rect width="${w}" height="${h}" fill="${bg}"/>` : ''}${body}</svg>\n`;
const mark = (x, y, size, fill) => `<g transform="translate(${x} ${y}) scale(${size / 24})"><path d="${MARK_PATH}" fill="${fill}"/></g>`;

// ---- 1. the mark alone
const markSvg = fill => svg(24, 24, `<path d="${MARK_PATH}" fill="${fill}"/>`);
const files = {};
files['vf-mark.svg'] = markSvg(INK);
files['vf-mark-white.svg'] = markSvg(WHITE);
files['vf-mark-blue.svg'] = markSvg(CORE);

// ---- 2. horizontal lockup: mark + wordmark on one baseline, nav proportions
// nav: 22px mark box beside 12px text, 9px gap => mark box = 1.833 x font size, gap = 0.75 x font size
const lockupH = fill => {
  const fs_ = 100, markSize = fs_ * 1.833, gap = fs_ * 0.75;
  const t = textPath('VF EMPIRE', { size: fs_, tracking: 0.16 });
  const H = markSize, baseline = H / 2 + t.capHeight / 2; // cap-height centred on the mark box
  const W = markSize + gap + t.width;
  const pad = 0; // tight; clear space is documented in BRAND.md
  return svg(Math.ceil(W + pad * 2), Math.ceil(H + pad * 2),
    mark(pad, pad, markSize, fill) + `<g fill="${fill}">${textPath('VF EMPIRE', { size: fs_, tracking: 0.16, x: pad + markSize + gap, y: pad + baseline }).markup}</g>`);
};
files['vf-logo-horizontal.svg'] = lockupH(INK);
files['vf-logo-horizontal-white.svg'] = lockupH(WHITE);
files['vf-logo-horizontal-blue.svg'] = lockupH(CORE);

// ---- 3. stacked lockup: mark centred above the wordmark
const lockupS = fill => {
  const fs_ = 100, markSize = fs_ * 2.6, gap = fs_ * 0.7;
  const t = textPath('VF EMPIRE', { size: fs_, tracking: 0.16 });
  const W = Math.max(markSize, t.width), H = markSize + gap + t.capHeight;
  const mx = (W - markSize) / 2, tx = (W - t.width) / 2;
  return svg(Math.ceil(W), Math.ceil(H),
    mark(mx, 0, markSize, fill) + `<g fill="${fill}">${textPath('VF EMPIRE', { size: fs_, tracking: 0.16, x: tx, y: H }).markup}</g>`);
};
files['vf-logo-stacked.svg'] = lockupS(INK);
files['vf-logo-stacked-white.svg'] = lockupS(WHITE);

// ---- 4. wordmark alone
const wordmark = fill => { const t = textPath('VF EMPIRE', { size: 100, tracking: 0.16 }); return svg(Math.ceil(t.width), Math.ceil(t.capHeight), `<g fill="${fill}">${textPath('VF EMPIRE', { size: 100, tracking: 0.16, y: t.capHeight }).markup}</g>`); };
files['vf-wordmark.svg'] = wordmark(INK);
files['vf-wordmark-white.svg'] = wordmark(WHITE);

// ---- 5. app icon: rounded tile (rx 14/64 like the favicon) with the mark
const appIcon = (tile, fill) => svg(64, 64, `<rect width="64" height="64" rx="14" fill="${tile}"/>` + mark(11, 11, 42, fill));
files['app-icon.svg'] = appIcon(SILVER, INK);
files['app-icon-dark.svg'] = appIcon(INK, WHITE);
files['app-icon-blue.svg'] = appIcon(CORE, WHITE);
// maskable (Android): safe zone is the inner 80%, so a smaller mark on a full-bleed tile
files['app-icon-maskable.svg'] = svg(64, 64, `<rect width="64" height="64" fill="${SILVER}"/>` + mark(15, 15, 34, INK));

// ---- 6. social: OG default (1200x630), avatar (1024), banners
const og = () => {
  const W = 1200, H = 630;
  const t = textPath('VF EMPIRE', { size: 44, tracking: 0.16 });
  const tag = textPath('The systems house for open intelligence.', { wght: 600, size: 56, tracking: -0.04 });
  const tag2 = textPath('Engines, harnesses and dashboards on hardware you own. Malta, EU.', { wght: 400, size: 26, tracking: 0 });
  const url = textPath('vfempire.com', { wght: 600, size: 22, tracking: 0.08 });
  const markSize = 44 * 1.833, gap = 44 * 0.75;
  return svg(W, H,
    `<rect width="${W}" height="${H}" fill="${PAPER}"/>` +
    `<rect x="0" y="0" width="${W}" height="${H}" fill="url(#g)"/>` +
    `<defs><radialGradient id="g" cx="0.5" cy="-0.1" r="0.9"><stop offset="0" stop-color="#ffffff"/><stop offset="1" stop-color="#eef1f6"/></radialGradient></defs>` +
    mark(96, 96, markSize, INK) + `<g fill="${INK}">${textPath('VF EMPIRE', { size: 44, tracking: 0.16, x: 96 + markSize + gap, y: 96 + markSize / 2 + t.capHeight / 2 }).markup}</g>` +
    `<g fill="${INK}">${textPath('The systems house for open intelligence.', { wght: 600, size: 56, tracking: -0.04, x: 96, y: 366 }).markup}</g>` +
    `<g fill="${DOVE}">${textPath('Engines, harnesses and dashboards on hardware you own. Malta, EU.', { wght: 400, size: 26, tracking: 0, x: 96, y: 428 }).markup}</g>` +
    `<rect x="96" y="486" width="${W - 192}" height="1" fill="${LINE}"/>` +
    `<g fill="${CORE_DEEP}">${textPath('vfempire.com', { wght: 600, size: 22, tracking: 0.08, x: 96, y: 540 }).markup}</g>` +
    `<circle cx="${W - 120}" cy="${H - 110}" r="10" fill="${CORE}"/>`);
};
files['og-default.svg'] = og();
const banner = (W, H) => {
  const t = textPath('VF EMPIRE', { size: 36, tracking: 0.16 });
  const markSize = 36 * 1.833, gap = 36 * 0.75, x = W * 0.06, y = H / 2 - markSize / 2;
  const tag = textPath('The systems house for open intelligence.', { wght: 400, size: 24, tracking: 0 });
  return svg(W, H, `<rect width="${W}" height="${H}" fill="${PAPER}"/>` + mark(x, y, markSize, INK) +
    `<g fill="${INK}">${textPath('VF EMPIRE', { size: 36, tracking: 0.16, x: x + markSize + gap, y: y + markSize / 2 + t.capHeight / 2 }).markup}</g>` +
    `<g fill="${DOVE}">${textPath('The systems house for open intelligence.', { wght: 400, size: 24, tracking: 0, x: W - W * 0.06 - tag.width, y: y + markSize / 2 + tag.capHeight / 2 }).markup}</g>`);
};
files['banner-1584x396.svg'] = banner(1584, 396);
files['banner-1500x500.svg'] = banner(1500, 500);

for (const [name, body] of Object.entries(files)) fs.writeFileSync(path.join(OUT, name), body);

// ---- PNG exports
const png = async (name, w, out, opts = {}) => {
  const src = path.join(OUT, name);
  await sharp(Buffer.from(fs.readFileSync(src)), { density: 400 }).resize({ width: w, ...opts }).png().toFile(path.join(OUT, out));
};
for (const w of [256, 512, 1024, 2048, 4096]) {
  await png('vf-mark.svg', w, `vf-mark-${w}.png`);
  await png('vf-mark-white.svg', w, `vf-mark-white-${w}.png`);
}
for (const w of [800, 1600, 3200, 6400]) {
  await png('vf-logo-horizontal.svg', w, `vf-logo-horizontal-${w}.png`);
  await png('vf-logo-horizontal-white.svg', w, `vf-logo-horizontal-white-${w}.png`);
}
for (const w of [800, 1600, 3200]) {
  await png('vf-logo-stacked.svg', w, `vf-logo-stacked-${w}.png`);
  await png('vf-logo-stacked-white.svg', w, `vf-logo-stacked-white-${w}.png`);
  await png('vf-wordmark.svg', w, `vf-wordmark-${w}.png`);
}
for (const w of [1024, 512, 192, 180, 32, 16]) await png('app-icon.svg', w, `app-icon-${w}.png`);
await png('app-icon-dark.svg', 1024, 'app-icon-dark-1024.png');
await png('app-icon-blue.svg', 1024, 'app-icon-blue-1024.png');
await png('app-icon-maskable.svg', 512, 'app-icon-maskable-512.png');
await png('app-icon.svg', 1024, 'avatar-1024.png');
await png('og-default.svg', 1200, 'og-default.png');
await png('banner-1584x396.svg', 1584, 'banner-1584x396.png');
await png('banner-1500x500.svg', 1500, 'banner-1500x500.png');

// ---- favicon.ico (PNG-compressed entries: 16, 32, 48)
const icoEntries = [];
for (const w of [16, 32, 48]) icoEntries.push({ w, buf: await sharp(Buffer.from(fs.readFileSync(path.join(OUT, 'app-icon.svg'))), { density: 400 }).resize(w, w).png().toBuffer() });
const header = Buffer.alloc(6); header.writeUInt16LE(0, 0); header.writeUInt16LE(1, 2); header.writeUInt16LE(icoEntries.length, 4);
let offset = 6 + 16 * icoEntries.length; const dirs = [], blobs = [];
for (const e of icoEntries) {
  const d = Buffer.alloc(16); d.writeUInt8(e.w === 256 ? 0 : e.w, 0); d.writeUInt8(e.w === 256 ? 0 : e.w, 1); d.writeUInt8(0, 2); d.writeUInt8(0, 3);
  d.writeUInt16LE(1, 4); d.writeUInt16LE(32, 6); d.writeUInt32LE(e.buf.length, 8); d.writeUInt32LE(offset, 12);
  dirs.push(d); blobs.push(e.buf); offset += e.buf.length;
}
fs.writeFileSync(path.join(ROOT, 'favicon.ico'), Buffer.concat([header, ...dirs, ...blobs]));
fs.copyFileSync(path.join(OUT, 'app-icon-180.png'), path.join(ROOT, 'apple-touch-icon.png'));

// ---- web manifest
fs.writeFileSync(path.join(ROOT, 'site.webmanifest'), JSON.stringify({
  name: 'VF Empire', short_name: 'VF Empire', description: 'The systems house for open intelligence. Engines, harnesses and dashboards on hardware you own. Malta, EU.',
  start_url: '/', display: 'browser', background_color: PAPER, theme_color: PAPER,
  icons: [
    { src: '/assets/brand/app-icon-192.png', sizes: '192x192', type: 'image/png' },
    { src: '/assets/brand/app-icon-512.png', sizes: '512x512', type: 'image/png' },
    { src: '/assets/brand/app-icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
  ],
}, null, 2) + '\n');

// ---- tokens for other agents and tools
fs.writeFileSync(path.join(OUT, 'tokens.json'), JSON.stringify({
  colour: { paper: PAPER, silver: SILVER, mist: '#eceff3', ink: INK, dove: DOVE, faint: '#a1a1a6', line: LINE, core: CORE, coreDeep: CORE_DEEP, glow: 'rgba(37,110,245,.35)', warn: '#c93221', ok: '#0b7a3e', amber: '#c76b1d' },
  type: { text: 'Hanken Grotesk (variable, self-hosted /fonts/hanken.woff2)', accent: 'Instrument Serif italic (/fonts/instrument-italic.woff2)', wordmark: { face: 'Hanken', weight: 600, tracking: '0.16em', case: 'upper' }, display: { weight: 600, tracking: '-0.045em', lineHeight: 1.04 }, body: { size: '16.5px', lineHeight: 1.65, maxWidth: '75ch' }, kicker: { size: '11px', tracking: '0.4em', weight: 600, colour: CORE_DEEP } },
  radius: { card: '20px', tile: '18px', pill: '99px', appIcon: '14/64 of the side' },
  motion: { ease: 'cubic-bezier(.2,.7,.2,1)', baseline: '240ms', reveal: '900ms', reducedMotion: 'respected' },
  logo: { mark: 'assets/brand/vf-mark.svg', horizontal: 'assets/brand/vf-logo-horizontal.svg', stacked: 'assets/brand/vf-logo-stacked.svg', clearSpace: 'the height of the V in the mark on every side', minimumSize: { mark: '16px', horizontal: '96px wide' } },
}, null, 2) + '\n');

console.log(`brand kit: ${fs.readdirSync(OUT).length} files in assets/brand, favicon.ico, apple-touch-icon.png, site.webmanifest`);
