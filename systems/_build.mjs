// VF systems-page generator: clones the fuelit.html house template exactly.
// Usage: node _build.mjs   (writes <slug>.html per product in this dir)
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { pricingCss, pricingHtml, sysreqHtml, PRICING } from './pricing.mjs';
const DIR = path.dirname(fileURLToPath(import.meta.url));

const ICONS = {
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3.5 2"/>',
  arrow: '<path d="M3 12h13M12 5l7 7-7 7"/>',
  home: '<path d="M3 11l9-8 9 8"/><path d="M5 9v11h14V9"/>',
  shield: '<path d="M12 3l7 3v5c0 5-3.5 8-7 10-3.5-2-7-5-7-10V6l7-3z"/>',
  leaf: '<path d="M4 20c0-9 5-15 16-16-1 11-7 16-16 16z"/><path d="M4 20c4-6 8-9 12-11"/>',
  heart: '<path d="M12 20s-7-4.5-9-9c-1.3-3 .8-6.5 4-6.5 2 0 3.5 1 5 3 1.5-2 3-3 5-3 3.2 0 5.3 3.5 4 6.5-2 4.5-9 9-9 9z"/>',
  wrench: '<path d="M14 6a4 4 0 0 0-5.6 5L4 15.4a2 2 0 1 0 2.8 2.8L11.2 14a4 4 0 0 0 5-5.6L13.5 11 11 8.5 14 6z"/>',
  briefcase: '<rect x="3" y="8" width="18" height="12" rx="2"/><path d="M9 8V6a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2M3 13h18"/>',
  book: '<path d="M5 4h11a3 3 0 0 1 3 3v13H8a3 3 0 0 0-3 3V4z"/><path d="M5 17a3 3 0 0 1 3-3h11"/>',
  globe: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c3 3.5 3 14 0 18M12 3c-3 3.5-3 14 0 18"/>',
  bolt: '<path d="M13 3L5 13h5l-1 8 8-10h-5l1-8z"/>',
  users: '<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20c.8-3.5 3.4-5.5 6.5-5.5s5.7 2 6.5 5.5"/><circle cx="17" cy="9" r="2.5"/><path d="M15.5 14.7c2.7.2 4.9 2 5.6 5.3"/>',
  building: '<rect x="5" y="3" width="14" height="18" rx="1"/><path d="M9 7h2m2 0h2M9 11h2m2 0h2M9 15h2m2 0h2M11 21v-3h2v3"/>',
  truck: '<path d="M3 17h2m14 0h2M5 17a2 2 0 1 0 4 0 2 2 0 0 0-4 0zm10 0a2 2 0 1 0 4 0 2 2 0 0 0-4 0zM3 12l1.5-5h9L16 12m-13 0h18v5"/>',
  alert: '<path d="M12 3l10 18H2L12 3z"/><path d="M12 10v4m0 3v.5"/>',
  pin: '<path d="M12 3c3.5 3.8 5.5 6.9 5.5 9.7A5.5 5.5 0 0 1 12 18a5.5 5.5 0 0 1-5.5-5.3C6.5 9.9 8.5 6.8 12 3z"/><path d="M9 21h6"/>',
  eye: '<path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6-10-6-10-6z"/><circle cx="12" cy="12" r="2.5"/>',
  layers: '<path d="M12 3l9 5-9 5-9-5 9-5z"/><path d="M3 13l9 5 9-5"/>',
  doc: '<path d="M7 3h7l4 4v14H7V3z"/><path d="M14 3v4h4M10 12h5M10 16h5"/>',
  chat: '<path d="M4 5h16v10H9l-5 4V5z"/>',
};
const ic = n => `<svg width="22" height="22" viewBox="0 0 24 24">${ICONS[n] || ICONS.arrow}</svg>`;

// Product pages that are maintained by hand (not generated) but can be linked as related systems.
const HAND_META = {
  'fileit':          { name: 'FileIT',          pn: 'P·04', sector: 'ACCOUNTING',     line: 'The self-filing ledger: books to stamped submission at HMRC MTD, ELSTER, CFR and ROS.' },
  'fuelit':          { name: 'FuelIT',          pn: 'P·17', sector: 'MOBILITY',       line: 'Official fuel-price feeds ranked against your route, tank and real range across nine EU countries.' },
  'guardian-shield': { name: 'Guardian Shield', pn: 'P·18', sector: 'SECURITY',       line: 'Vault, malware scanner, WireGuard VPN, DNS filter and breach watch on infrastructure you own.' },
  'mapit':           { name: 'MapIT',           pn: 'P·19', sector: 'COMMERCE',       line: 'Write your list once; MapIT prices the whole basket at every store in your zone.' },
  'snapit':          { name: 'SnapIT',          pn: 'P·20', sector: 'MEDIA',          line: 'Every drive you own scanned into one private photo and video library. Live, from €59.' },
  'nav-it':          { name: 'NAV·IT',          pn: 'P·21', sector: 'SOVEREIGN INFRASTRUCTURE', line: 'A self-hosted turn-by-turn navigator on open map data. Ships inside FuelIT and MapIT.' },
  'vf-mail':         { name: 'VF Mail',         pn: 'P·16', sector: 'EMAIL',          line: 'A whole mail system of our own (server, shield and address) on metal we hold. In beta.' },
  'vf-home':         { name: 'VF Home',         pn: 'P·24', sector: 'SMART HOME',     line: 'Matter, Zigbee and Z-Wave on hardware you own, with local NVR and the Permanence Guarantee.' },
  'vf-legacy':       { name: 'VF Legacy',       pn: 'P·23', sector: 'DIGITAL ESTATE', line: 'Everything you leave behind, closed by you: sealed instructions and per-jurisdiction executor packets.' },
  'vf-wallet':       { name: 'VF Wallet',       pn: 'P·22', sector: 'IDENTITY',       line: 'The EU digital identity wallet built for people: full ARF conformance and a user-inspectable audit log.' },
};
let META = {};

const faqHtml = c => (c.faq && c.faq.length) ? `<section id="faq" style="background:var(--silver);border-top:1px solid var(--line);border-bottom:1px solid var(--line)">
  <div class="wrap">
    <div class="k rv">QUESTIONS</div>
    <h2 class="rv">Asked.<br><span class="mute">Answered.</span></h2>
    <div class="faq rv">
      ${c.faq.map(f => `<div class="q">
        <h4>${f.q}</h4>
        <p>${f.a}</p>
      </div>`).join('\n      ')}
    </div>
  </div>
</section>
` : '';

const relatedHtml = c => {
  const rel = (c.related || []).map(slug => [slug, META[slug]]).filter(([, m]) => m);
  if (!rel.length) return '';
  return `<section id="related">
  <div class="wrap">
    <div class="k rv">RELATED SYSTEMS</div>
    <h2 class="rv">Built the same way.<br><span class="mute">Read next.</span></h2>
    <div class="related rv">
      ${rel.map(([slug, m]) => `<a href="/systems/${slug}">
        <span class="rk">${m.pn} · ${m.sector}</span>
        <h4>${m.name}</h4>
        <p>${m.line}</p>
        <span class="go">Open →</span>
      </a>`).join('\n      ')}
    </div>
  </div>
</section>
`;
};

const page = c => `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${c.name}: ${c.titleTag} | VF Empire</title>
<meta name="description" content="${c.metaDesc}">
<link rel="canonical" href="https://vfempire.com/systems/${c.slug}">
<meta name="theme-color" content="#fbfbfd">
<link rel="stylesheet" href="/house.css">
<script src="/assets/scrollrail.js" defer></script>
<noscript><style>.rv{opacity:1;transform:none}</style></noscript>
<meta property="og:type" content="website">
<meta property="og:site_name" content="VF Empire">
<meta property="og:title" content="${c.name}: ${c.ogTitle}">
<meta property="og:description" content="${c.ogDesc}">
<meta property="og:url" content="https://vfempire.com/systems/${c.slug}">
<meta property="og:image" content="https://vfempire.com/assets/pipe/${c.img}.png">
<meta name="robots" content="index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1">
<meta property="og:locale" content="en_GB">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${c.name}: ${c.ogTitle}">
<meta name="twitter:description" content="${c.ogDesc}">
<meta name="twitter:image" content="https://vfempire.com/assets/pipe/${c.img}.png">
<link rel="preload" href="/fonts/hanken.woff2" as="font" type="font/woff2" crossorigin>
<link rel="icon" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'%3E%3Crect width='64' height='64' rx='14' fill='%23f5f5f7'/%3E%3Ctext x='32' y='43' font-family='Georgia,serif' font-size='30' fill='%231d1d1f' text-anchor='middle'%3EVF%3C/text%3E%3C/svg%3E">
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "SoftwareApplication",
      "name": "${c.name}",
      "applicationCategory": "${c.appCategory}",
      "operatingSystem": "${c.os}",
      "creator": {"@id": "https://vfempire.com/#org"},
      "url": "https://vfempire.com/systems/${c.slug}",
      "image": "https://vfempire.com/assets/pipe/${c.img}.png",
      "description": ${JSON.stringify(c.ldDesc)}
    },
    {
      "@type": "BreadcrumbList",
      "itemListElement": [
        {"@type": "ListItem", "position": 1, "name": "VF Empire", "item": "https://vfempire.com/"},
        {"@type": "ListItem", "position": 2, "name": "Systems", "item": "https://vfempire.com/systems/"},
        {"@type": "ListItem", "position": 3, "name": "${c.name}"}
      ]
    }
  ]
}
</script>
<style>
.phero{padding:130px 6vw 60px;background:
  radial-gradient(900px 480px at 72% 30%, #ffffff 0%, transparent 70%),
  linear-gradient(180deg,#fdfdfe 0%, #f4f6f9 100%);border-bottom:1px solid var(--line)}
.phero .in{min-height:calc(92vh - 190px);display:grid;grid-template-columns:1.05fr .95fr;align-items:center;gap:40px;width:min(1150px,100%);margin:0 auto}
.phero .eb{font-size:11px;letter-spacing:.42em;color:var(--dove);font-weight:600;margin-bottom:24px;opacity:0;animation:up .9s .05s cubic-bezier(.2,.7,.2,1) forwards}
.phero .eb b{color:var(--core)}
.phero h1{font-size:clamp(40px,5.6vw,76px);font-weight:600;letter-spacing:-.05em;line-height:1;opacity:0;animation:up 1s .2s cubic-bezier(.2,.7,.2,1) forwards}
.phero h1 span{display:block;color:var(--faint);font-size:.52em;letter-spacing:-.03em;margin-top:14px;font-weight:600}
.phero p.sub{max-width:480px;font-size:16.5px;line-height:1.62;color:var(--dove);margin:24px 0 0;opacity:0;animation:up 1s .38s cubic-bezier(.2,.7,.2,1) forwards}
.phero .meta{display:flex;gap:9px;flex-wrap:wrap;margin-top:28px;opacity:0;animation:up 1s .5s cubic-bezier(.2,.7,.2,1) forwards}
.phero .acts{display:flex;gap:14px;align-items:center;margin-top:34px;opacity:0;animation:up 1s .62s cubic-bezier(.2,.7,.2,1) forwards}
.pheroart{position:relative;opacity:0;animation:up 1.2s .5s cubic-bezier(.2,.7,.2,1) forwards}
.pheroart img{display:block;width:min(430px,84vw);height:auto;margin:0 auto;mix-blend-mode:multiply;-webkit-mask-image:radial-gradient(ellipse 68% 72% at 50% 48%,#000 58%,transparent 88%);mask-image:radial-gradient(ellipse 68% 72% at 50% 48%,#000 58%,transparent 88%)}

/* why: the failures */
.fails{margin-top:56px;border-top:1px solid var(--line)}
.fl{display:grid;grid-template-columns:70px 1.1fr 1.6fr;align-items:start;gap:26px;padding:30px 10px;border-bottom:1px solid var(--line);position:relative;transition:background .3s,padding-left .3s}
.fl::before{content:"";position:absolute;left:0;top:0;bottom:0;width:2px;background:var(--core);transform:scaleY(0);transition:transform .3s}
.fl:hover{background:#fff;padding-left:22px}
.fl:hover::before{transform:scaleY(1)}
.fl .num{font-size:13px;font-weight:600;color:var(--dove);letter-spacing:.1em;padding-top:3px}
.fl:hover .num{color:var(--core)}
.fl h4{font-size:19px;font-weight:600;letter-spacing:-.025em}
.fl p{font-size:13.5px;line-height:1.6;color:var(--dove)}
@media(max-width:880px){.fl{grid-template-columns:44px 1fr;gap:8px 16px}.fl p{grid-column:2}}

/* image band */
.band{margin:80px calc(50% - 50vw) 0;width:100vw;position:relative;background:#fff;border-top:1px solid var(--line);border-bottom:1px solid var(--line)}
.band img{display:block;width:100%;max-height:72vh;object-fit:cover;mix-blend-mode:multiply}
.band .cap{position:absolute;left:22px;bottom:18px;font-size:10px;font-weight:600;letter-spacing:.22em;color:var(--dove);background:rgba(255,255,255,.72);border:1px solid rgba(255,255,255,.95);backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px);padding:7px 14px;border-radius:99px}

/* who: audience bento */
.aud{display:grid;grid-template-columns:repeat(2,1fr);gap:16px;margin-top:56px}
.au{background:#fff;border:1px solid var(--line);border-radius:20px;padding:32px 30px;transition:transform .35s,box-shadow .35s}
.au:hover{transform:translateY(-4px);box-shadow:0 24px 48px -28px rgba(40,55,90,.25)}
.au .ic{width:22px;height:22px;display:flex;align-items:center;justify-content:center;margin-bottom:16px}
.au .ic svg{width:22px;height:22px;stroke:var(--core-deep);fill:none;stroke-width:1.6;stroke-linecap:round;stroke-linejoin:round}
.au h4{font-size:17px;font-weight:600;letter-spacing:-.02em;margin-bottom:8px}
.au p{font-size:13.5px;line-height:1.62;color:var(--dove)}
.au.first{grid-column:1/-1;display:grid;grid-template-columns:auto 1fr;gap:26px;align-items:start;background:linear-gradient(160deg,#0e2a63,var(--core-deep) 55%,var(--core));border-color:transparent}
.au.first .ic svg{stroke:#fff}
.au.first h4{color:#fff}
.au.first p{color:rgba(255,255,255,.75);max-width:640px}
.au.first .co{display:flex;gap:8px;flex-wrap:wrap;margin-top:16px}
.au.first .co span{font-size:10.5px;font-weight:600;letter-spacing:.1em;color:#fff;background:rgba(255,255,255,.14);border:1px solid rgba(255,255,255,.22);padding:7px 14px;border-radius:99px}
@media(max-width:880px){.aud{grid-template-columns:1fr}.au.first{grid-template-columns:1fr;gap:4px}}

/* how: outcomes strip */
.outs{display:grid;grid-template-columns:repeat(3,1fr);gap:1px;background:var(--line);border:1px solid var(--line);border-radius:20px;overflow:hidden;margin-top:56px}
.outs .c{background:#fff;padding:34px 30px}
.outs .c .n{font-size:21px;font-weight:600;letter-spacing:-.03em;line-height:1.25}
.outs .c .n span{color:var(--core)}
.outs .c p{font-size:13px;color:var(--dove);margin-top:10px;line-height:1.6}
@media(max-width:880px){.outs{grid-template-columns:1fr}}

/* mechanics: the stack */
.pillars{margin-top:12px;font-size:14.5px}
.pillars a{color:var(--core-deep);border-bottom:1px solid var(--line)}
.pillars a:hover{color:var(--core);border-color:var(--core)}
.mech{display:grid;grid-template-columns:1fr 1fr;gap:56px;align-items:center;margin-top:56px}
.mechart img{display:block;width:100%;mix-blend-mode:multiply;-webkit-mask-image:radial-gradient(ellipse 80% 80% at 50% 50%,#000 55%,transparent 92%);mask-image:radial-gradient(ellipse 80% 80% at 50% 50%,#000 55%,transparent 92%)}
.layers{display:flex;flex-direction:column;gap:0;border-top:1px solid var(--line)}
.ly{padding:24px 4px;border-bottom:1px solid var(--line)}
.ly .lt{display:flex;align-items:baseline;gap:12px}
.ly .lt i{font-style:normal;font-size:10.5px;font-weight:600;letter-spacing:.16em;color:var(--core)}
.ly h4{font-size:17px;font-weight:600;letter-spacing:-.02em}
.ly p{font-size:13.5px;line-height:1.62;color:var(--dove);margin-top:7px}
@media(max-width:880px){.mech{grid-template-columns:1fr}}

/* roadmap */
.road{margin-top:56px;border-top:1px solid var(--line)}
.rd{display:grid;grid-template-columns:80px 1.1fr 1.6fr auto;align-items:center;gap:26px;padding:26px 10px;border-bottom:1px solid var(--line)}
.rd .num{font-size:12px;font-weight:600;color:var(--dove);letter-spacing:.14em}
.rd h4{font-size:18px;font-weight:600;letter-spacing:-.02em}
.rd p{font-size:13.5px;line-height:1.55;color:var(--dove)}
@media(max-width:880px){.rd{grid-template-columns:54px 1fr;gap:8px 16px}.rd p{grid-column:2}.rd .status{grid-column:2;justify-self:start}}


${pricingCss}
/* cta + footer */
.cta-band{text-align:center;background:var(--silver);border-top:1px solid var(--line)}

@media(max-width:880px){
  .phero{padding-top:110px}
  .phero .in{grid-template-columns:1fr;min-height:0;text-align:left}
  .pheroart{order:-1}
  .pheroart img{width:min(300px,70vw)}
}
</style>
</head>
<body>

<nav class="nav">
  <div class="in">
    <a class="brand" href="/">
      <svg width="22" height="22" viewBox="0 0 24 24"><path d="M3 4l5.2 16h2.2L4.4 4H3zm7 0l5.2 16h2.2L11.4 4H10zm10.6 0h-6.2l.7 2.1h5.5V4zm-4.2 6.6l.7 2.1h3.5v-2.1h-4.2z" fill="#1d1d1f"/></svg>
      VF EMPIRE
    </a>
    <span class="crumb"><a href="/systems/">Systems</a> &nbsp;/&nbsp; <b>${c.pn} ${c.name}</b></span>
    <div class="nl"><a href="/systems/">Systems</a><a href="/software">Software</a><a href="/services/">Services</a><a href="/security">Security</a><a href="/contact/">Contact</a></div>
    <a class="cta" href="mailto:info@vfempire.com">Commission a system</a>
  </div>
</nav>

<header class="phero">
<div class="in">
  <div>
    <div class="eb"><b>${c.pn}</b> &nbsp;·&nbsp; ${c.sector} &nbsp;·&nbsp; ON THE VF BUILD SLATE</div>
    <h1>${c.name}<span>${c.tagline}</span></h1>
    <p class="sub">${c.sub}</p>
    <div class="meta">
      <span class="mchip hot">IN BUILD</span>
      ${c.chips.map(x => `<span class="mchip">${x}</span>`).join('\n      ')}
    </div>
    <div class="acts">
      <a class="bt pri" href="mailto:info@vfempire.com?subject=${encodeURIComponent(c.name)}">Register interest</a>
      <a class="bt gho" href="/#pipeline">Back to the slate</a>
    </div>
  </div>
  <div class="pheroart"><img src="../assets/pipe/${c.img}.webp" alt="${c.heroAlt}" width="896" height="1152" fetchpriority="high"></div>
</div>
</header>

<section id="why">
  <div class="wrap">
    <div class="k rv">WHY IT HAS TO EXIST</div>
    <h2 class="rv">${c.whyH}</h2>
    <p class="lead rv">${c.whyLead}</p>

    <div class="fails rv">
      ${c.fails.map((f, i) => `<div class="fl">
        <span class="num">F·0${i + 1}</span>
        <h4>${f.h}</h4>
        <p>${f.p}</p>
      </div>`).join('\n      ')}
    </div>

    <figure class="band rv">
      <img src="../assets/pipe/${c.img}-flow.png" alt="${c.flowAlt}" width="2304" height="1792" loading="lazy" decoding="async">
      <figcaption class="cap">${c.cap}</figcaption>
    </figure>
  </div>
</section>

<section id="who" style="background:var(--silver);border-top:1px solid var(--line);border-bottom:1px solid var(--line)">
  <div class="wrap">
    <h2 class="rv">${c.whoH}</h2>

    <div class="aud rv">
      <div class="au first">
        <div>
          <div class="ic">${ic(c.first.icon)}</div>
        </div>
        <div>
          <h4>${c.first.h}</h4>
          <p>${c.first.p}</p>
          <div class="co">${c.first.co.map(x => `<span>${x}</span>`).join('')}</div>
        </div>
      </div>
      ${c.aud.map(a => `<div class="au">
        <div class="ic">${ic(a.icon)}</div>
        <h4>${a.h}</h4>
        <p>${a.p}</p>
      </div>`).join('\n      ')}
    </div>
  </div>
</section>

<section id="how">
  <div class="wrap">
    <div class="k rv">WHAT IT CHANGES</div>
    <h2 class="rv">${c.howH}</h2>
    <p class="lead rv">${c.howLead}</p>

    <div class="outs rv">
      ${c.outs.map(o => `<div class="c"><div class="n">${o.h}<span>.</span></div><p>${o.p}</p></div>`).join('\n      ')}
    </div>
  </div>
</section>

<section id="mechanics" style="background:var(--silver);border-top:1px solid var(--line);border-bottom:1px solid var(--line)">
  <div class="wrap">
    <div class="k rv">THE MECHANICS</div>
    <h2 class="rv">${c.mechH}</h2>
    <p class="lead rv">${c.mechLead}</p>
    <p class="lead rv pillars">Every VF system runs on the <a href="/harness">harness stack</a>, is steered by the <a href="/engine">Helmsman engine</a> and is watched from a <a href="/dashboards">command dashboard</a>.</p>

    <div class="mech rv">
      <div class="mechart"><img src="../assets/pipe/${c.img}-mech.png" alt="${c.mechAlt}"></div>
      <div class="layers">
        ${c.layers.map((l, i) => `<div class="ly">
          <div class="lt"><i>LAYER ${i + 1}</i><h4>${l.h}</h4></div>
          <p>${l.p}</p>
        </div>`).join('\n        ')}
      </div>
    </div>
  </div>
</section>

<section id="roadmap">
  <div class="wrap">
    <h2 class="rv">${c.roadH}</h2>

    <div class="road rv">
      ${c.road.map((r, i) => `<div class="rd">
        <span class="num">R·0${i + 1}</span>
        <h4>${r.h}</h4>
        <p>${r.p}</p>
        <span class="status${i === 0 ? ' hot' : ''}">${i === 0 ? 'IN BUILD' : i === 1 ? 'NEXT' : 'PLANNED'}</span>
      </div>`).join('\n      ')}
    </div>
  </div>
</section>

${faqHtml(c)}
${PRICING[c.slug] ? pricingHtml(c.slug, c.name) : ''}
${sysreqHtml(c.slug)}
${relatedHtml(c)}

<section class="cta-band">
  <div class="wrap">
    <div class="k rv">FOLLOW THE BUILD</div>
    <h2 class="rv">${c.ctaH}</h2>
    <p class="lead rv" style="margin-left:auto;margin-right:auto">${c.ctaLead}</p>
    <div style="margin-top:36px">
      <a class="bt pri rv" href="mailto:info@vfempire.com?subject=${encodeURIComponent(c.name)}">info@vfempire.com</a>
    </div>
  </div>
</section>

<footer>
  <div class="legal">
    <span>© 2026 VF Empire Corp Ltd · Company No. C 94160 · VAT MT 2686-9431 · Għajnsielem, Gozo, Malta · EU</span>
    <span><a href="/legal/terms">Terms</a> &nbsp;·&nbsp; <a href="/legal/privacy">Privacy</a> &nbsp;·&nbsp; <a href="/legal/cookies">Cookies</a> &nbsp;·&nbsp; <a href="/security">Security</a> &nbsp;·&nbsp; <a href="/contact/">Contact</a></span>
  </div>
</footer>

<div class="consent" id="consent" role="dialog" aria-label="Cookie notice">
  <h5><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#1f6ff2" stroke-width="2"><circle cx="12" cy="12" r="9"/><circle cx="9" cy="10" r="1" fill="#1f6ff2" stroke="none"/><circle cx="14" cy="14" r="1" fill="#1f6ff2" stroke="none"/><circle cx="13" cy="8.5" r="1" fill="#1f6ff2" stroke="none"/></svg>Privacy, by architecture.</h5>
  <p>This site sets <strong>no tracking, no analytics and no advertising cookies</strong>. It stores only what it needs to serve you securely. We ask anyway, because we build everything this way. Details in our <a href="/legal/cookies">Cookie Policy</a> and <a href="/legal/privacy">Privacy Policy</a>.</p>
  <div class="row">
    <button class="dec" id="cdec">Decline</button>
    <button class="acc" id="cacc">Accept</button>
  </div>
</div>

<script src="/assets/house.js" defer></script>

</body>
</html>
`;

const packs = [];
for (const f of ['content-a.mjs', 'content-b.mjs', 'content-c.mjs']) {
  const p = path.join(DIR, f);
  if (fs.existsSync(p)) packs.push(...(await import(p)).default);
}
// Retired slugs stay in the content packs for the record but are not built.
const RETIRED = new Set(['back-office-autopilot']);
META = { ...HAND_META };
for (const c of packs) if (!RETIRED.has(c.slug)) META[c.slug] = { name: c.name, pn: c.pn, sector: c.sector, line: c.ogDesc };
// Pages that diverged from the template and are maintained by hand: never overwrite.
const HAND_MAINTAINED = new Set(['vf-mail']);
for (const c of packs) {
  if (RETIRED.has(c.slug) || HAND_MAINTAINED.has(c.slug)) continue;
  fs.writeFileSync(path.join(DIR, c.slug + '.html'), page(c));
  console.log('built', c.slug + '.html');
}
