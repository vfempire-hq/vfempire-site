// VF planned-pricing sections: data + revolver-card renderer for all 20 systems.
// Source of truth for numbers: ~/VF-PRICE-LIST.md (Vincent-approved 2026-09-11).
// Honesty law: everything is labeled PLANNED PRICING until purchasable.
//
// Design: each tier is a premium credit card. Cards orbit on a Y-Z circle,
// pause 3s at each position, then rotate smoothly to the next. VF-blue →
// white metallic gradient on the recommended tier; slate + steel on the
// alternatives. Reduced-motion respected.

export const pricingCss = `
/* ═══════════ pricing (revolver) ═══════════ */
#pricing{background:var(--silver);border-top:1px solid var(--line);padding:110px 6vw 130px;perspective:1500px;perspective-origin:50% 50%}
#pricing .wrap{width:min(1080px,100%);margin:0 auto;text-align:center}
#pricing .stage{width:min(560px,100%);position:relative;margin:80px auto 60px;aspect-ratio:1.7/1;transform-style:preserve-3d}
#pricing .hoverhint{position:absolute;bottom:calc(100% + 24px);left:50%;transform:translateX(-50%);font-size:10.5px;font-weight:600;letter-spacing:.28em;color:var(--faint);text-transform:uppercase;display:flex;align-items:center;gap:10px;pointer-events:none;opacity:.7;transition:opacity .3s}
#pricing .hoverhint::before,#pricing .hoverhint::after{content:'';width:32px;height:1px;background:var(--faint);opacity:.5}
#pricing .stage:hover .hoverhint{opacity:.35}

/* card base */
#pricing .card{position:absolute;inset:0;border-radius:22px;padding:22px 24px 20px;color:#fff;box-shadow:0 30px 60px rgba(30,60,110,.28),0 0 0 1px rgba(255,255,255,.4) inset,0 -20px 40px rgba(255,255,255,.25) inset;overflow:hidden;transform-style:preserve-3d;animation-play-state:paused;will-change:transform,z-index;backface-visibility:hidden;display:flex;flex-direction:column;gap:0}
#pricing .card > *{position:relative;z-index:2}
#pricing .card::before{content:'';position:absolute;inset:-20%;background:conic-gradient(from 140deg at 60% 40%,transparent 0deg,rgba(255,255,255,.22) 50deg,transparent 100deg,transparent 260deg,rgba(255,255,255,.16) 310deg,transparent 360deg);pointer-events:none;animation:pxHolo 12s linear infinite;mix-blend-mode:overlay}
#pricing .card::after{content:'';position:absolute;top:0;left:-40%;width:40%;height:100%;background:linear-gradient(105deg,transparent 30%,rgba(255,255,255,.35) 50%,transparent 70%);pointer-events:none;animation:pxShim 5s 1.8s ease-in-out infinite}
@keyframes pxHolo{to{transform:rotate(360deg)}}
@keyframes pxShim{0%,55%,100%{left:-40%}75%{left:140%}}

/* three tier finishes */
#pricing .card.t-blue {background:linear-gradient(135deg,#0b47b8 0%,#1f6ff2 32%,#7ba8ff 62%,#e2ecff 88%,#f5f8ff 100%)}
#pricing .card.t-slate{background:linear-gradient(135deg,#243b6b 0%,#4c6fa5 34%,#a8bcdc 66%,#e8edf5 100%)}
#pricing .card.t-steel{background:linear-gradient(135deg,#5a6a86 0%,#8a99b5 34%,#c9d1de 66%,#f2f4f8 100%)}

/* header */
#pricing .cardhead{display:flex;justify-content:space-between;align-items:center;gap:12px;flex-shrink:0}
#pricing .brand{font-family:'Instrument',serif;font-style:italic;font-size:18px;font-weight:500;letter-spacing:.01em;text-shadow:0 1px 2px rgba(0,0,0,.25);display:flex;align-items:center;gap:10px;text-align:left}
#pricing .brand::before{content:'';width:20px;height:20px;border-radius:6px;background:rgba(255,255,255,.22);border:1px solid rgba(255,255,255,.35);flex-shrink:0}
#pricing .brand b{font-family:'Hanken',sans-serif;font-style:normal;font-weight:800;letter-spacing:.14em;font-size:10.5px;display:block;opacity:.95;text-align:left}
#pricing .rec{font-size:9px;font-weight:800;letter-spacing:.28em;color:#0b47b8;background:linear-gradient(180deg,#fff 0%,#e0ebff 100%);padding:5px 10px;border-radius:99px;box-shadow:0 3px 8px rgba(11,71,184,.2),0 0 0 1px rgba(11,71,184,.15);white-space:nowrap}
#pricing .card.t-slate .rec{color:#243b6b;background:linear-gradient(180deg,#fff 0%,#e6e8f0 100%);box-shadow:0 3px 8px rgba(36,59,107,.2),0 0 0 1px rgba(36,59,107,.15)}
#pricing .card.t-steel .rec{color:#5a6a86;background:linear-gradient(180deg,#fff 0%,#e8ecf0 100%);box-shadow:0 3px 8px rgba(90,106,134,.2),0 0 0 1px rgba(90,106,134,.15)}

/* stats */
#pricing .stats{display:grid;grid-template-columns:1fr 1fr 1fr;gap:14px;margin-top:12px;padding-bottom:12px;border-bottom:1px solid rgba(255,255,255,.16);flex-shrink:0;text-align:left}
#pricing .stat{display:flex;flex-direction:column;gap:2px}
#pricing .stat span{font-size:8.5px;font-weight:700;letter-spacing:.24em;color:rgba(255,255,255,.7);text-transform:uppercase}
#pricing .stat b{font-family:'Hanken',sans-serif;font-size:20px;font-weight:700;letter-spacing:-.015em;color:#fff}

/* price */
#pricing .pricerow{display:flex;justify-content:space-between;align-items:flex-end;margin-top:14px;flex-shrink:0;text-align:left}
#pricing .pricerow .lead{display:flex;flex-direction:column;gap:1px}
#pricing .pricerow .lead > span:first-child{font-size:9px;font-weight:700;letter-spacing:.26em;color:rgba(255,255,255,.7);text-transform:uppercase}
#pricing .pricerow .pr{font-family:'Hanken',sans-serif;font-size:48px;font-weight:800;letter-spacing:-.045em;line-height:1;color:#fff;text-shadow:0 2px 6px rgba(0,0,0,.3),0 1px 0 rgba(255,255,255,.35)}
#pricing .pricerow .pr b{font-size:15px;font-weight:600;letter-spacing:0;color:rgba(255,255,255,.75);margin-left:6px}
#pricing .pricerow .trail{text-align:right;display:flex;flex-direction:column;gap:1px}
#pricing .pricerow .trail span{font-size:9px;font-weight:700;letter-spacing:.24em;color:rgba(255,255,255,.7);text-transform:uppercase}
#pricing .pricerow .trail b{font-family:'Hanken',sans-serif;font-size:20px;font-weight:700;letter-spacing:-.01em;color:#fff}

/* progress */
#pricing .prog{margin-top:12px;flex-shrink:0}
#pricing .proglabel{display:flex;justify-content:space-between;font-size:9px;font-weight:700;letter-spacing:.22em;color:rgba(255,255,255,.85);text-transform:uppercase;margin-bottom:6px}
#pricing .progbar{height:4px;background:rgba(255,255,255,.15);border-radius:99px;position:relative;overflow:hidden}
#pricing .progbar::before{content:'';position:absolute;top:0;left:0;bottom:0;background:linear-gradient(90deg,rgba(255,255,255,.6) 0%,#fff 100%);border-radius:99px;width:0;animation-play-state:paused;box-shadow:0 0 10px rgba(255,255,255,.5)}
#pricing .proghandle{position:absolute;top:50%;transform:translate(-50%,-50%);width:12px;height:12px;background:#fff;border-radius:50%;box-shadow:0 3px 8px rgba(0,0,0,.25),0 0 0 1.5px rgba(255,255,255,.4);left:0;animation-play-state:paused}

/* tiles */
#pricing .tiles{margin-top:auto;padding-top:10px;display:flex;justify-content:space-between;align-items:center;gap:12px;flex-shrink:0;text-align:left}
#pricing .locations{display:flex;flex-direction:column;gap:2px;font-size:9.5px;line-height:1.35;color:rgba(255,255,255,.9)}
#pricing .locations b{font-weight:700;letter-spacing:.05em}
#pricing .locations em{font-style:normal;color:rgba(255,255,255,.5);font-size:8.5px;letter-spacing:.22em;text-transform:uppercase;font-weight:600;margin-right:5px}
#pricing .thumbs{display:flex;gap:6px}
#pricing .thumb{width:38px;height:28px;border-radius:6px;background:linear-gradient(135deg,rgba(255,255,255,.28) 0%,rgba(255,255,255,.08) 100%);border:1px solid rgba(255,255,255,.25);display:flex;align-items:center;justify-content:center;color:#fff;font-family:'Hanken',sans-serif;font-size:15px;font-weight:800;letter-spacing:.02em}

/* === 3-tier orbit (120° apart, 11.7s cycle: 3s hold + 0.9s rotate x3) === */
#pricing .orbit-3 .card{animation:pxOrbit3 11.7s linear infinite}
#pricing .orbit-3 .card.p1{animation-delay:0s}
#pricing .orbit-3 .card.p2{animation-delay:-7.8s}
#pricing .orbit-3 .card.p3{animation-delay:-3.9s}
#pricing .orbit-3 .card.p1 .progbar::before,#pricing .orbit-3 .card.p1 .proghandle{animation:pxProg 11.7s linear infinite,pxHandle 11.7s linear infinite;animation-delay:0s;animation-play-state:paused}
#pricing .orbit-3 .card.p1 .proghandle{animation:pxHandle 11.7s linear infinite;animation-delay:0s;animation-play-state:paused}
#pricing .orbit-3 .card.p1 .progbar::before{animation:pxProg 11.7s linear infinite;animation-delay:0s;animation-play-state:paused}
#pricing .orbit-3 .card.p2 .proghandle{animation:pxHandle 11.7s linear infinite;animation-delay:-7.8s;animation-play-state:paused}
#pricing .orbit-3 .card.p2 .progbar::before{animation:pxProg 11.7s linear infinite;animation-delay:-7.8s;animation-play-state:paused}
#pricing .orbit-3 .card.p3 .proghandle{animation:pxHandle 11.7s linear infinite;animation-delay:-3.9s;animation-play-state:paused}
#pricing .orbit-3 .card.p3 .progbar::before{animation:pxProg 11.7s linear infinite;animation-delay:-3.9s;animation-play-state:paused}

/* === 2-tier orbit (180° apart, 7.8s cycle) === */
#pricing .orbit-2 .card{animation:pxOrbit2 7.8s linear infinite}
#pricing .orbit-2 .card.p1{animation-delay:0s}
#pricing .orbit-2 .card.p2{animation-delay:-3.9s}
#pricing .orbit-2 .card.p1 .proghandle{animation:pxHandle 7.8s linear infinite;animation-delay:0s;animation-play-state:paused}
#pricing .orbit-2 .card.p1 .progbar::before{animation:pxProg 7.8s linear infinite;animation-delay:0s;animation-play-state:paused}
#pricing .orbit-2 .card.p2 .proghandle{animation:pxHandle 7.8s linear infinite;animation-delay:-3.9s;animation-play-state:paused}
#pricing .orbit-2 .card.p2 .progbar::before{animation:pxProg 7.8s linear infinite;animation-delay:-3.9s;animation-play-state:paused}

#pricing .stage:hover .card,#pricing .stage:hover .card .progbar::before,#pricing .stage:hover .card .proghandle{animation-play-state:running}

/* 3-tier orbit keyframes (see pricing-stack S1 for annotation) */
@keyframes pxOrbit3{
  0%,25.6%   {transform:translate3d(0,    0px, 110px); z-index:30}
  26.6%      {transform:translate3d(0,  +28px, 106px); z-index:29}
  27.5%      {transform:translate3d(0,  +55px,  95px); z-index:27}
  28.5%      {transform:translate3d(0,  +78px,  78px); z-index:24}
  29.5%      {transform:translate3d(0,  +95px,  55px); z-index:20}
  30.5%      {transform:translate3d(0, +106px,  28px); z-index:17}
  31.5%      {transform:translate3d(0, +110px,    0);  z-index:15}
  32.4%      {transform:translate3d(0, +106px, -28px); z-index:12}
  33.3%,58.9%{transform:translate3d(0,  +95px, -55px); z-index:10}
  59.9%      {transform:translate3d(0,  +78px, -78px); z-index:8}
  60.9%      {transform:translate3d(0,  +55px, -95px); z-index:5}
  61.8%      {transform:translate3d(0,  +28px,-106px); z-index:4}
  63%        {transform:translate3d(0,    0px,-110px); z-index:3}
  64%        {transform:translate3d(0,  -28px,-106px); z-index:4}
  64.9%      {transform:translate3d(0,  -55px, -95px); z-index:5}
  65.8%      {transform:translate3d(0,  -78px, -78px); z-index:8}
  66.6%,92.3%{transform:translate3d(0,  -95px, -55px); z-index:10}
  93.3%      {transform:translate3d(0, -106px, -28px); z-index:12}
  94.2%      {transform:translate3d(0, -110px,    0);  z-index:15}
  95.2%      {transform:translate3d(0, -106px, +28px); z-index:17}
  96.2%      {transform:translate3d(0,  -95px, +55px); z-index:20}
  97.2%      {transform:translate3d(0,  -78px, +78px); z-index:24}
  98.2%      {transform:translate3d(0,  -55px, +95px); z-index:27}
  99.1%      {transform:translate3d(0,  -28px,+106px); z-index:29}
  100%       {transform:translate3d(0,    0px, 110px); z-index:30}
}

/* 2-tier orbit: 180° swap between front and back */
@keyframes pxOrbit2{
  0%,38.5%   {transform:translate3d(0,    0px, 110px); z-index:30}
  40%        {transform:translate3d(0,  +55px,  95px); z-index:27}
  42%        {transform:translate3d(0,  +95px,  55px); z-index:20}
  44%        {transform:translate3d(0, +110px,    0);  z-index:15}
  46%        {transform:translate3d(0,  +95px, -55px); z-index:10}
  47.5%      {transform:translate3d(0,  +55px, -95px); z-index:5}
  49%,88.5%  {transform:translate3d(0,    0px,-110px); z-index:3}
  90%        {transform:translate3d(0,  -55px, -95px); z-index:5}
  92%        {transform:translate3d(0,  -95px, -55px); z-index:10}
  94%        {transform:translate3d(0, -110px,    0);  z-index:15}
  96%        {transform:translate3d(0,  -95px, +55px); z-index:20}
  98%        {transform:translate3d(0,  -55px, +95px); z-index:27}
  100%       {transform:translate3d(0,    0px, 110px); z-index:30}
}

@keyframes pxProg{
  0%       {width:0;    opacity:1}
  25.6%    {width:100%; opacity:1}
  27%      {width:100%; opacity:0}
  99%      {width:0;    opacity:0}
  100%     {width:0;    opacity:1}
}
@keyframes pxHandle{
  0%       {left:0;    opacity:1}
  25.6%    {left:100%; opacity:1}
  27%      {left:100%; opacity:0}
  99%      {left:0;    opacity:0}
  100%     {left:0;    opacity:1}
}

.pnote{margin-top:26px;font-size:12px;line-height:1.6;color:var(--faint);text-align:center}

/* ═══════════ system requirements ═══════════ */
#sysreq{padding:110px 6vw}
#sysreq .wrap{width:min(1080px,100%);margin:0 auto}
#sysreq .sysreqgrid{display:grid;grid-template-columns:340px 1fr;gap:80px;align-items:start}
#sysreq .sysreqhead .k{margin-bottom:16px}
#sysreq .sysreqhead h2{font-size:clamp(28px,3.6vw,40px);font-weight:700;letter-spacing:-.03em;line-height:1.1;margin:0}
#sysreq .sysreqhead .lead{margin-top:20px;color:var(--dove);font-size:15px;line-height:1.7;max-width:280px}
#sysreq .sysreqrows{margin:0;padding:0;border-top:1px solid var(--line)}
#sysreq .sysreqrow{display:grid;grid-template-columns:180px 1fr;gap:32px;padding:22px 4px;border-bottom:1px solid var(--line);align-items:baseline}
#sysreq .sysreqrow dt{font-family:'Hanken',sans-serif;font-size:11px;font-weight:700;letter-spacing:.24em;color:var(--ink);text-transform:uppercase;margin:0}
#sysreq .sysreqrow dd{margin:0;font-size:15px;line-height:1.55;color:var(--dove)}
@media(max-width:880px){
  #sysreq .sysreqgrid{grid-template-columns:1fr;gap:40px}
  #sysreq .sysreqrow{grid-template-columns:1fr;gap:6px;padding:18px 0}
}
#pricing .k,#pricing h2,#pricing .lead{text-align:center}
#pricing h2{max-width:640px;margin-left:auto;margin-right:auto}
#pricing .lead{max-width:620px;margin-left:auto;margin-right:auto}
#pricing .extra{margin-top:44px;font-size:12.5px;color:var(--dove);text-align:center;font-family:'Instrument',serif;font-style:italic}

@media (prefers-reduced-motion:reduce){
  #pricing .card{animation:none!important;opacity:1}
  #pricing .card::before,#pricing .card::after{animation:none!important}
  #pricing .progbar::before,#pricing .proghandle{animation:none!important;width:70%;opacity:1}
}
`;

const NOTE = 'Planned launch pricing; VF confirms final figures at each release. The price you join at is the price you renew at: no first-year bait, no renewal games.';

// Per-tier meaningful stats: 3 concise metrics that read as product identity
// rather than generic "Region: EU". Keyed by slug → array of {label, value}
// triplets in the SAME ORDER as the tiers in PRICING[slug].tiers.
export const STATS = {
  'field-intelligence': [
    [ ['Fields','1'], ['Data','Basic'], ['Cost','€0'] ],
    [ ['Fields','∞'], ['Hectares','Unlimited'], ['Coverage','Full farm'] ],
    [ ['Client farms','Many'], ['View','Portfolio'], ['Access','Full'] ],
  ],
  'private-care-watch': [
    [ ['Sensor hub','1'], ['Camera','None'], ['Cloud','None'] ],
    [ ['Alerts','Fall + drift'], ['App','Family'], ['Cover','All-in'] ],
    [ ['Rooms','Multi'], ['Homes','Shared'], ['Beds','Small residence'] ],
  ],
  'the-apprentice': [
    [ ['Seats','1'], ['Codes','Live lookup'], ['Copilot','Full'] ],
    [ ['Seats','5'], ['History','Shared'], ['Fit','Small firm'] ],
  ],
  'back-office-autopilot': [
    [ ['Entities','1'], ['Books','Full'], ['Filings','Prepared'] ],
    [ ['Entities','Every'], ['Autopilot','Unified'], ['Ownership','Multi-co'] ],
  ],
  'everyday-law-navigator': [
    [ ['Lookups','Limited'], ['Sources','Cited'], ['Cost','€0'] ],
    [ ['Docs','Generated'], ['Deadlines','Tracked'], ['Letters','Ready'] ],
    [ ['Scope','1 dispute'], ['Duration','90 days'], ['End','Complete'] ],
  ],
  'triage-continuity': [
    [ ['Check-ins','Daily'], ['Crisis','Routed'], ['Paywall','None'] ],
    [ ['Record','Continuity'], ['Handovers','Practitioner'], ['Storage','EU'] ],
    [ ['Employer','Firewalled'], ['Team','Yes'], ['Per seat','€3'] ],
  ],
  'site-truth-engine': [
    [ ['Cameras','Unlimited'], ['Hardware','Yours'], ['Sites','1'] ],
    [ ['Cameras','Unlimited'], ['Sites','3+'], ['Rate','Reduced'] ],
  ],
  'grid-home-optimiser': [
    [ ['Hub','Home'], ['Supplier','Any'], ['Switch','None'] ],
    [ ['Tariff','Windows'], ['Load','Shifted'], ['Solar','Self-use'] ],
    [ ['EV','Yes'], ['Heat pump','Yes'], ['Tariffs','Dynamic'] ],
  ],
  'self-training-qc-vision': [
    [ ['Cameras','Line-spec'], ['Edge','Yes'], ['Setup','Self-serve'] ],
    [ ['Software','Full'], ['Training','Self-loop'], ['Per line','€249'] ],
  ],
  'different-minds-engine': [
    [ ['Children','1'], ['Profile','Full'], ['Toolset','Complete'] ],
    [ ['Class','Whole'], ['Per student','€9'], ['Volume','Yes'] ],
  ],
  'low-resource-language-ai': [
    [ ['Languages','MT ↔ EN'], ['Cost','Free'], ['Duration','Forever'] ],
    [ ['Writing','Assisted'], ['Learning','Yes'], ['Speech','Included'] ],
    [ ['Per M chars','€15'], ['Products','Yes'], ['Pipelines','Yes'] ],
  ],
  'citizen-services-desk': [
    [ ['Residents','< 10k'], ['Desk','Full'], ['Sovereign','Yes'] ],
    [ ['Residents','10k–100k'], ['Desk','Full'], ['Sovereign','Yes'] ],
    [ ['Residents','100k+'], ['Scope','Custom'], ['Quote','Open'] ],
  ],
  'claims-advocate': [
    [ ['Policy','Decoded'], ['Evidence','Filed'], ['Appeals','Drafted'] ],
    [ ['Claims','Ongoing'], ['Insurers','Multiple'], ['Cost','Monthly'] ],
  ],
  'offline-first-response': [
    [ ['Nodes','1'], ['Users','Unlimited'], ['Licence','Year 1'] ],
    [ ['Licence','Year 2+'], ['Rate','€990'], ['Scope','Org'] ],
    [ ['Coverage','+1 node'], ['Reach','Larger'], ['Growth','Modular'] ],
  ],
  'self-filing-ledger': [
    [ ['Books','Full'], ['VAT','Logic'], ['Position','Live'] ],
    [ ['Books','Full'], ['Filed','Yes'], ['Regions','MT + UK'] ],
  ],
  'vf-mail': [
    [ ['Mailboxes','1'], ['Storage','10 GB'], ['Domain','Custom'] ],
    [ ['Mailboxes','5'], ['Storage','50 GB'], ['Domain','Shared'] ],
    [ ['Per seat','€4.99'], ['Storage','25 GB'], ['Domain','Company'] ],
  ],
  'fuelit': [
    [ ['Prices','Live'], ['Map','Full'], ['Cost','€0'] ],
    [ ['Range','Math'], ['Handoffs','Auto'], ['CarPlay','Yes'] ],
  ],
  'guardian-shield': [
    [ ['Devices','5'], ['Renewal','Same €'], ['Shield','Full'] ],
    [ ['Household','Yes'], ['Breach','Watched'], ['Vault','Included'] ],
  ],
  'mapit': [
    [ ['Basket','Compare'], ['Ads','None'], ['Sales','None'] ],
    [ ['Baskets','Unlimited'], ['History','Price'], ['Trips','Automated'] ],
  ],
  'snapit': [
    [ ['Licence','Perpetual'], ['Version','Current'], ['Renewals','None'] ],
    [ ['Seats','5'], ['Toolset','Advanced'], ['Licence','Perpetual'] ],
    [ ['Upgrade','Per major'], ['Optional','Yes'], ['Rate','€29'] ],
  ],
};

// Per-product system requirements: displayed as a separate section on the
// profile page (between mechanics and roadmap). Concise hardware/OS/network
// facts a prospective buyer wants to see before pricing.
export const SYSREQ = {
  'field-intelligence':      { title: 'What the farm needs', rows: [ ['Farm data','A field boundary, GPS or drawn.'], ['Hardware','None. Runs from the web.'], ['Internet','Occasional; a daily sync is enough.'], ['Integrations','Optional: your existing weather station or soil probe.'] ] },
  'private-care-watch':      { title: 'What the home needs', rows: [ ['Sensor hub','One VF hub, plugged into any power outlet.'], ['Camera','None; motion + radar only.'], ['Internet','Home broadband, ~1 Mbps sustained.'], ['Data residency','EU metal. Your data never leaves the region.'] ] },
  'the-apprentice':          { title: 'What the tradesperson needs', rows: [ ['Device','Any modern phone or tablet.'], ['Model','Runs local when the device supports it; falls back to EU cloud.'], ['Codes','UK, MT, DE building + electrical codes on day one.'], ['Offline','Full capability without connection for the copilot.'] ] },
  'back-office-autopilot':   { title: 'What the firm needs', rows: [ ['Books','Existing accounts import or start clean.'], ['Filings','MT + UK from day one; EU expansion Q2.'], ['Bank','Read-only feeds; you approve every action.'], ['Storage','EU-held, encrypted at rest, exportable at any moment.'] ] },
  'everyday-law-navigator':  { title: 'What you need to run it', rows: [ ['Device','Phone, tablet or browser.'], ['Coverage','MT + UK jurisdictions at launch; EU roadmap.'], ['Documents','Optional upload for grounded answers.'], ['Confidentiality','We never train models on what you upload.'] ] },
  'triage-continuity':       { title: 'What the person needs', rows: [ ['Device','Phone or watch.'], ['Model','Local screening, EU-hosted continuity record.'], ['Practitioners','Optional link: you invite them, revocable.'], ['Crisis path','Always free, always on, no login required.'] ] },
  'site-truth-engine':       { title: 'What the site needs', rows: [ ['Cameras','Any existing IP cameras, RTSP or ONVIF.'], ['Compute','One VF edge box per site (included in pricing).'], ['Internet','Uplink only for dashboard sync; footage stays on site.'], ['Plans','Upload once, PDF or DXF.'] ] },
  'grid-home-optimiser':     { title: 'What the home needs', rows: [ ['Hub','One VF energy hub, DIN-rail or plug-in.'], ['Meter','Your existing smart meter; no swap required.'], ['Supplier','Works with any EU supplier; no switch needed.'], ['Extras','Optional: EV wallbox, heat pump for orchestration tier.'] ] },
  'self-training-qc-vision': { title: 'What the line needs', rows: [ ['Edge unit','One VF industrial box, DIN-rail mount, fanless.'], ['Cameras','2–4 GigE machine-vision cameras per line, spec\'d for you.'], ['Network','Isolated line VLAN; nothing leaves without your say.'], ['Training','You show it good vs bad; no ML engineer required.'] ] },
  'different-minds-engine':  { title: 'What the learner needs', rows: [ ['Device','Any tablet, phone or Chromebook.'], ['Age','From 6, EN + MT at launch.'], ['Assessment','Optional formal profile import; not required.'], ['Data','EU-held, family-controlled, exportable.'] ] },
  'low-resource-language-ai':{ title: 'What you need to run it', rows: [ ['Languages','Maltese ↔ English at launch. Roadmap: more low-resource EU languages.'], ['Devices','Any modern browser, phone, tablet.'], ['Institutions','On-premise option: runs on your metal, air-gapped.'], ['API','REST, streaming, batched. Documented.'] ] },
  'citizen-services-desk':   { title: 'What the council needs', rows: [ ['Deployment','Sovereign: runs in your data centre or your chosen EU host.'], ['Languages','Two per commune at launch, more on request.'], ['Systems','Read-only feeds from existing case, permit and payment systems.'], ['Residents','24/7 chat + phone in the languages you serve.'] ] },
  'claims-advocate':         { title: 'What the claim needs', rows: [ ['Policy','PDF, image or link; we decode the wording.'], ['Evidence','Photos, letters, receipts, uploaded or camera-in.'], ['Insurers','No integration required; works via letter + email.'], ['Payout','You keep 100%: no percentage cut, ever.'] ] },
  'offline-first-response':  { title: 'What the responders need', rows: [ ['Node','Hardened outdoor-rated compute, LTE + LoRa fallback.'], ['Users','Unlimited field-app users per node.'], ['Power','Mains + 12h battery + solar option.'], ['Sync','Meshes with other nodes; syncs to HQ when uplink returns.'] ] },
  'vf-mail':                 { title: 'What you need to run it', rows: [ ['Domain','Bring your own; or use vfempire.mail alias.'], ['Devices','IMAP + SMTP everywhere; native apps roadmap.'], ['Storage','EU metal in Malta; encrypted at rest.'], ['Migration','From Gmail, Fastmail, Proton: one-click import.'] ] },
  'self-filing-ledger':      { title: 'What the ledger needs', rows: [ ['Regions','Malta and UK from day one; wider EU roadmap.'], ['Import','From Xero, QuickBooks, Sage: or start clean.'], ['Bank','Read-only feeds; you approve every filing.'], ['Sovereignty','Books export in one click; you own the data outright.'] ] },
  'fuelit':                  { title: 'What the driver needs', rows: [ ['Device','iPhone or Android phone.'], ['Vehicle','Any: pump prices are universal; range math is optional.'], ['Pairing','Plays alongside your car\'s GPS: no replacement.'], ['CarPlay + Android Auto','Both, with the Plus tier.'] ] },
  'guardian-shield':         { title: 'What you get on the shield', rows: [ ['Devices','5 across Windows, Mac, iOS, Android.'], ['Renewal','€59/year for life. No price bump on renewal.'], ['Vault','Password + document vault included.'], ['Identity','Breach watch across the major dark-web dumps.'] ] },
  'mapit':                   { title: 'What the shopper needs', rows: [ ['Device','Phone.'], ['Coverage','Your town\'s major grocers, expanding.'], ['Model','Prices via public feeds + confirmed by users; no receipt-selling.'], ['Data','Your baskets stay on your device unless you pin them.'] ] },
  'snapit':                  { title: 'What the library needs', rows: [ ['Device','Windows, Mac, Linux: desktop-first, mobile companion.'], ['Storage','Your disk, your NAS, your S3-compatible bucket.'], ['Licence','One-off, perpetual, no phone-home.'], ['Upgrades','Optional: €29 per major version if you want it.'] ] },
};

export const PRICING = {
  'field-intelligence': {
    h: 'Flat for the farm.<br><span class="mute">Hectares don’t change the price.</span>',
    lead: 'Per-hectare pricing yields pennies on a three-hectare holding and feels like a tax, so the farm pays one flat figure. The basic satellite view stays free, because the market gives that away and so do we.',
    thumbs: ['FARM', 'EU'],
    tiers: [
      { t: 'ONE FIELD', p: 'Free', per: '', d: 'A single field, basic satellite view and weather. Free forever.' },
      { t: 'WHOLE FARM', p: '€19', per: '/ month per farm', d: 'Every field, unlimited hectares. The full intelligence layer, flat.', hot: true },
      { t: 'ADVISOR', p: '€49', per: '/ month', d: 'Portfolio view across client farms, for agronomists and co-ops.' },
    ],
  },
  'private-care-watch': {
    h: 'The hub near cost.<br><span class="mute">The watching is the product.</span>',
    lead: 'One price covers fall alerting, routine drift and the family app together, with nothing essential sold back as an add-on.',
    thumbs: ['HOME', 'EU'],
    tiers: [
      { t: 'THE HUB', p: '€249', per: 'one-off', d: 'The in-home sensor hub, priced near hardware cost. No camera, no cloud.' },
      { t: 'CARE WATCH', p: '€29', per: '/ month', d: 'Fall alerting, routine drift, family app. Everything, all-in.', hot: true },
      { t: 'RESIDENCE', p: '€49', per: '/ month per home', d: 'Multi-room coverage for small residences and shared homes.' },
    ],
  },
  'the-apprentice': {
    h: 'One tradesperson.<br><span class="mute">One clean number.</span>',
    lead: 'Priced under a single workshop data licence, for the copilot, the lookups and the paperwork together.',
    thumbs: ['TOOL', 'EU'],
    tiers: [
      { t: 'TRADESPERSON', p: '€29', per: '/ month', d: 'The full apprentice: job copilot, code lookups, paperwork. €290 a year.', hot: true },
      { t: 'FIRM', p: '€99', per: '/ month', d: 'Five seats and a shared job history for small firms.' },
    ],
  },
  'back-office-autopilot': {
    h: 'Above the software.<br><span class="mute">Far below a human back office.</span>',
    lead: 'Bookkeeping software starts near €10 a month; a human back office starts near €100. The autopilot sits between, and it is built for owners who run more than one company.',
    thumbs: ['BOOK', 'EU'],
    tiers: [
      { t: 'ONE COMPANY', p: '€29', per: '/ month', d: 'One entity, the whole back office: books and filings prepared for your approval.' },
      { t: 'MULTI-COMPANY', p: '€59', per: '/ month', d: 'Every entity you run under one autopilot.', hot: true },
    ],
    extra: 'Thirty-day free trial.',
  },
  'everyday-law-navigator': {
    h: 'Priced for a dispute.<br><span class="mute">Sized to the stakes.</span>',
    lead: 'Generic chatbots are free and government guidance is free, so the basics stay free here too. You pay for the grounded layer: your jurisdiction, your documents, your deadlines.',
    thumbs: ['LAW', 'EU'],
    tiers: [
      { t: 'LOOKUP', p: 'Free', per: '', d: 'Situation lookups with sourced answers, limited monthly.' },
      { t: 'NAVIGATOR', p: '€9.90', per: '/ month', d: 'Documents, deadlines and letters for everything ongoing.', hot: true },
      { t: 'CASE PACK', p: '€29', per: 'one-off · 90 days', d: 'One dispute, end to end. No subscription.' },
    ],
  },
  'triage-continuity': {
    h: 'The crisis path is free.<br><span class="mute">It always will be.</span>',
    lead: 'VF never paywalls check-ins and crisis routing. The paid layer is continuity: the record that follows you between practitioners.',
    thumbs: ['CARE', 'EU'],
    tiers: [
      { t: 'CHECK-IN', p: 'Free', per: '', d: 'Daily check-ins and crisis routing. Never behind a paywall.' },
      { t: 'CONTINUITY', p: '€5.99', per: '/ month · €59 a year', d: 'The continuity record and practitioner handovers.', hot: true },
      { t: 'WORKPLACE', p: '€3', per: '/ employee · month', d: 'Continuity for teams, firewalled from the employer&rsquo;s view.' },
    ],
  },
  'site-truth-engine': {
    h: 'Per site.<br><span class="mute">Unlimited cameras.</span>',
    lead: 'The incumbents charge per camera or start at five figures a year. Site Truth runs on the cameras you already own: one flat figure per site, unlimited cameras.',
    thumbs: ['SITE', 'EU'],
    tiers: [
      { t: 'SITE', p: '€299', per: '/ month per site', d: 'Unlimited cameras on your existing hardware.', hot: true },
      { t: 'PORTFOLIO', p: '€199', per: '/ month per site', d: 'From three sites up.' },
    ],
  },
  'grid-home-optimiser': {
    h: 'Hub near cost.<br><span class="mute">Savings carry the rest.</span>',
    lead: 'Optimisation in this class documents hundreds of euros a year in savings. The hub is priced like hardware; the subscription is priced to disappear inside what it saves.',
    thumbs: ['WATT', 'EU'],
    tiers: [
      { t: 'THE HUB', p: '€149', per: 'one-off', d: 'The home energy hub. Works with your existing supplier; no switch required.' },
      { t: 'OPTIMISE', p: '€7.99', per: '/ month', d: 'Core optimisation: tariff windows, load shifting, solar self-use.', hot: true },
      { t: 'ORCHESTRATE', p: '€12.99', per: '/ month', d: 'Full orchestration: EV, heat pump and dynamic tariffs together.' },
    ],
  },
  'self-training-qc-vision': {
    h: 'Equipment money.<br><span class="mute">An owner can sign it off alone.</span>',
    lead: 'Machine-vision QC today means tens of thousands with integrators in the building. VF prices this like a piece of line equipment an owner can sign off alone; the first year lands under €8,000.',
    thumbs: ['LINE', 'EU'],
    tiers: [
      { t: 'LINE UNIT', p: '€4,900', per: 'per line · one-off', d: 'Edge unit and cameras spec&rsquo;d for your line, self-serve setup.' },
      { t: 'VISION', p: '€249', per: '/ month per line', d: 'The software and the self-training loop.', hot: true },
    ],
  },
  'different-minds-engine': {
    h: 'Family and school,<br><span class="mute">priced apart on purpose.</span>',
    lead: 'Per-head prices differ ten to twenty times between homes and schools across this market. We keep the two channels honest and separate.',
    thumbs: ['LEARN', 'EU'],
    tiers: [
      { t: 'FAMILY', p: '€119', per: '/ year', d: 'One child&rsquo;s full profile and toolset at home. €12.99 monthly if you prefer.', hot: true },
      { t: 'SCHOOLS', p: '€9', per: '/ student · year', d: 'Whole-class licensing, volume tiers below.' },
    ],
  },
  'low-resource-language-ai': {
    h: 'Maltese stays free.<br><span class="mute">The category gets a price.</span>',
    lead: 'No one sells a serious Maltese AI, so core translation stays free as the national-service layer, and the paid tiers price a category that didn&rsquo;t exist.',
    thumbs: ['MT', 'EU'],
    tiers: [
      { t: 'CORE', p: 'Free', per: '', d: 'Maltese ↔ English translation, free forever. Every use grows the corpus.' },
      { t: 'PREMIUM', p: '€7.99', per: '/ month', d: 'Writing assistance, learning tools and speech.', hot: true },
      { t: 'API', p: '€15', per: '/ million characters', d: 'Maltese-grade translation for products and pipelines.' },
    ],
    extra: 'Institutions from €250/month: bilingual workflow tooling, on-premise option included.',
  },
  'citizen-services-desk': {
    h: 'Priced by population.<br><span class="mute">Sovereignty included.</span>',
    lead: 'The market quotes behind closed doors and sells sovereign deployment as the expensive extra. Here it is the product: flat annual bands any council can budget.',
    thumbs: ['CITY', 'EU'],
    tiers: [
      { t: 'SMALL', p: '€6,000', per: '/ year', d: 'Communes under 10,000 residents.' },
      { t: 'MID', p: '€24,000', per: '/ year', d: '10,000 to 100,000 residents.', hot: true },
      { t: 'LARGE', p: 'from €60,000', per: '/ year', d: 'Cities past 100,000, scoped and quoted openly.' },
    ],
  },
  'claims-advocate': {
    h: 'Pay per claim.<br><span class="mute">One price, one claim.</span>',
    lead: 'Letter generators are free now, and letters alone don&rsquo;t win appeals. The price buys the decode, the evidence file and the escalation map for one claim, with no percentage taken from your payout.',
    thumbs: ['FILE', 'EU'],
    tiers: [
      { t: 'CLAIM PACK', p: '€39', per: 'per claim', d: 'Policy decode, evidence file, appeal drafts. One claim, end to end.', hot: true },
      { t: 'TRACKER', p: '€9.90', per: '/ month', d: 'For ongoing or multiple claims across insurers.' },
    ],
  },
  'offline-first-response': {
    h: 'Priced per kit.<br><span class="mute">Volunteers don&rsquo;t do per-user.</span>',
    lead: 'Volunteer organisations buy hardware with the licence inside, so the field app is unlimited-users and the price is the node.',
    thumbs: ['SOS', 'EU'],
    tiers: [
      { t: 'STARTER KIT', p: '€2,900', per: 'one-off', d: 'One hardened node, year-one organisation licence, unlimited field-app users.', hot: true },
      { t: 'RENEWAL', p: '€990', per: '/ year', d: 'The organisation licence from year two.' },
      { t: 'EXTRA NODE', p: '€1,190', per: 'each', d: 'Grow coverage node by node.' },
    ],
    extra: 'Municipal and agency deployments quoted per deployment.',
  },
  'vf-mail': {
    h: 'No free tier.<br><span class="mute">Free mail is the model we left.</span>',
    lead: 'You pay for free email with your correspondence. VF Mail has one honest model: you pay a small fee, and nobody else pays for you. Custom domain included from the first tier.',
    thumbs: ['MAIL', 'EU'],
    tiers: [
      { t: 'MAILBOX', p: '€3.99', per: '/ month', d: 'One mailbox, custom domain included. EU metal, no ecosystem.', hot: true },
      { t: 'FAMILY', p: '€9.99', per: '/ month', d: 'Five mailboxes under one roof.' },
      { t: 'TEAMS', p: '€4.99', per: '/ user · month', d: 'Company mail on infrastructure you can point to.' },
    ],
    extra: 'Thirty-day trial instead of a free tier.',
  },
  'self-filing-ledger': {
    h: 'Software money.<br><span class="mute">Accountant results.</span>',
    lead: 'A traditional accountant runs €900–1,500 a year. The ledger files for a fraction of that, and the software tier stands alone if you only want the books.',
    thumbs: ['BOOK', 'EU'],
    tiers: [
      { t: 'SOFTWARE', p: '€19', per: '/ month', d: 'The self-filing ledger: books, VAT logic, live position.' },
      { t: 'FILED', p: '€49', per: '/ month', d: 'Software plus your returns actually filed. Malta and UK first.', hot: true },
    ],
  },
  'fuelit': {
    h: 'Free where it counts.<br><span class="mute">€9.99 a year where it thinks.</span>',
    lead: 'Fuel prices are public data; charging for them would be a toll on what is already yours. Plus prices the thinking: range math, handoffs, alerts.',
    thumbs: ['FUEL', 'EU'],
    tiers: [
      { t: 'CORE', p: 'Free', per: '', d: 'Prices on your route, station cards, the map. Forever.' },
      { t: 'PLUS', p: '€9.99', per: '/ year', d: 'Garage and range math, two-leg handoff automation, alerts, CarPlay and Android Auto extras.', hot: true },
    ],
  },
  'guardian-shield': {
    h: '€59 this year.<br><span class="mute">€59 every year.</span>',
    lead: 'The industry sells at €25 and renews at €100. Guardian Shield renews at the price you joined at. The honest renewal is the product.',
    thumbs: ['SEC', 'EU'],
    tiers: [
      { t: 'SHIELD', p: '€59', per: '/ year · 5 devices', d: 'The full shield. Same price at every renewal.', hot: true },
      { t: 'FAMILY + IDENTITY', p: '€99', per: '/ year', d: 'The household: breach watch, vault, identity guard.' },
    ],
  },
  'mapit': {
    h: 'The basket stays free.<br><span class="mute">We don&rsquo;t sell you to retailers.</span>',
    lead: 'Everything in this category is "free", funded by ads, cashback cuts and receipt-data sales. MapIT sells neither ads nor you. Plus is the only revenue, and it is optional.',
    thumbs: ['SHOP', 'EU'],
    tiers: [
      { t: 'CORE', p: 'Free', per: '', d: 'Basket compare across your town. No ads, no data sales.' },
      { t: 'PLUS', p: '€14.99', per: '/ year', d: 'Unlimited saved baskets, price history, trip automation.', hot: true },
    ],
  },
  'snapit': {
    h: 'Buy it once.<br><span class="mute">It&rsquo;s your library, after all.</span>',
    lead: 'The people who keep their photos local are loudly tired of subscriptions. SnapIT is a one-off licence: pay once, own the version, upgrade only when a major release earns it.',
    thumbs: ['SNAP', 'EU'],
    tiers: [
      { t: 'PERSONAL', p: '€69', per: 'one-off', d: 'Perpetual licence, current major version.', hot: true },
      { t: 'FAMILY / PRO', p: '€129', per: 'one-off', d: 'Five seats plus the advanced toolset.' },
      { t: 'UPGRADES', p: '€29', per: 'per major version', d: 'Optional, and only when a new major version is worth it.' },
    ],
    note: 'Planned launch pricing; VF confirms final figures at release. One-off means one-off: the licence never expires and never phones home.',
  },
};

// Finish assignment: hot tier gets blue, the rest cycle slate → steel by order.
function finishFor(idx, hotIdx) {
  if (idx === hotIdx) return 't-blue';
  const others = ['t-slate', 't-steel'];
  const skipHot = idx > hotIdx ? idx - 1 : idx;
  return others[skipHot % 2];
}

// Derive trailing metric from the price/period
function trailFor(tier) {
  const num = parseFloat(tier.p.replace(/[€,]/g, ''));
  if (tier.p === 'Free') return { label: 'Forever', value: '€0' };
  if (isNaN(num) || num <= 0) return { label: 'Total', value: tier.p };
  const per = (tier.per || '').toLowerCase();
  if (per.includes('month')) {
    const y = num * 12;
    return { label: 'Year one', value: '€' + (y >= 1000 ? y.toLocaleString('en-GB') : y.toFixed(y % 1 === 0 ? 0 : 2)) };
  }
  if (per.includes('year')) return { label: 'Per month', value: '€' + (num / 12).toFixed(2) };
  if (per.includes('one-off') || per.includes('each') || per.includes('claim') || per.includes('line')) return { label: 'Payment', value: 'One-off' };
  return { label: 'Rate', value: tier.p };
}

function progressFor(tier, idx, allLen, hotIdx) {
  if (idx === hotIdx) return 68;
  if (idx === 0) return 34;
  if (idx === allLen - 1) return 12;
  return 42;
}

function periodLead(tier) {
  const per = (tier.per || '').toLowerCase();
  if (per.includes('month')) return 'Monthly';
  if (per.includes('year')) return 'Yearly';
  if (per.includes('one-off') || per.includes('each') || per.includes('claim') || per.includes('line')) return 'One-off';
  if (tier.p === 'Free') return 'Free';
  return 'Rate';
}

function firstFeature(d) {
  const sentence = d.split(/[.·—-]/)[0].trim();
  return sentence.length > 42 ? sentence.slice(0, 42) + '…' : sentence;
}

function tierCard(brand, product, tier, idx, all, thumbs, pos, statsRow) {
  const hotIdx = all.findIndex(x => x.hot);
  const finish = finishFor(idx, hotIdx < 0 ? 0 : hotIdx);
  const trail = trailFor(tier);
  const progress = progressFor(tier, idx, all.length, hotIdx < 0 ? 0 : hotIdx);
  const lead = periodLead(tier);
  const brandTop = brand.toUpperCase().split(' ')[0];
  const brandRest = brand.toUpperCase();
  const recLabel = tier.hot ? 'RECOMMENDED' : tier.t;
  const feat = firstFeature(tier.d);
  // per-tier stats (real product metrics) with generic fallback
  const s = statsRow || [ ['Tier', tier.t.split(' ')[0]], ['Region','EU'], ['Model', tier.hot ? 'Recommended' : 'Alternative'] ];
  return `<div class="card ${finish} p${pos}">
    <div class="cardhead">
      <div class="brand">${brandTop} <b>${brandRest} · ${tier.t}</b></div>
      <span class="rec">${recLabel}</span>
    </div>
    <div class="stats">
      <div class="stat"><span>${s[0][0]}</span><b>${s[0][1]}</b></div>
      <div class="stat"><span>${s[1][0]}</span><b>${s[1][1]}</b></div>
      <div class="stat"><span>${s[2][0]}</span><b>${s[2][1]}</b></div>
    </div>
    <div class="pricerow">
      <div class="lead"><span>${lead}</span><span class="pr">${tier.p}${tier.per ? `<b>${tier.per}</b>` : ''}</span></div>
      <div class="trail"><span>${trail.label}</span><b>${trail.value}</b></div>
    </div>
    <div class="prog">
      <div class="proglabel"><span>Founding seats claimed</span><span>${progress}%</span></div>
      <div class="progbar"><div class="proghandle"></div></div>
    </div>
    <div class="tiles">
      <div class="locations">
        <div><em>Region</em>EU · Malta OSS</div>
        <div><em>Includes</em>${feat}</div>
      </div>
      <div class="thumbs"><div class="thumb">${thumbs[0]}</div><div class="thumb">${thumbs[1]}</div></div>
    </div>
  </div>`;
}

// System requirements section: separate from pricing, sits above it on
// the profile page. Two-column layout: title/subtitle on the left, spec
// rows on the right.
export function sysreqHtml(slug) {
  const s = SYSREQ[slug];
  if (!s) return '';
  return `<section id="sysreq" style="background:var(--paper);border-top:1px solid var(--line)">
  <div class="wrap">
    <div class="sysreqgrid">
      <div class="sysreqhead">
        <div class="k rv">SYSTEM REQUIREMENTS</div>
        <h2 class="rv">${s.title}</h2>
        <p class="lead rv">Everything you need on your side to run it,<br/>and nothing you don&rsquo;t.</p>
      </div>
      <dl class="sysreqrows rv">
        ${s.rows.map(([label, value]) => `<div class="sysreqrow"><dt>${label}</dt><dd>${value}</dd></div>`).join('\n        ')}
      </dl>
    </div>
  </div>
</section>

`;
}

export function pricingHtml(slug, brand = 'VF') {
  const p = PRICING[slug];
  if (!p) throw new Error('no pricing for ' + slug);
  const note = (p.note || NOTE);
  const thumbs = p.thumbs || ['VF', 'EU'];

  // Rotate through up to 3 tiers. If a hot tier exists, put it FIRST (p1)
  // so at rest it faces the viewer. For 4+ tier products (rare), show the
  // top 3 by priority: hot, then first, then last.
  let show = p.tiers;
  if (p.tiers.length > 3) {
    const hot = p.tiers.find(t => t.hot);
    const others = p.tiers.filter(t => t !== hot);
    show = [hot, others[0], others[others.length - 1]].filter(Boolean);
  }
  const hotIdx = show.findIndex(t => t.hot);
  if (hotIdx > 0) {
    // move hot tier to position 0
    const hot = show[hotIdx];
    show = [hot, ...show.filter((_, i) => i !== hotIdx)];
  }
  const orbitClass = show.length === 2 ? 'orbit-2' : 'orbit-3';

  const stats = STATS[slug] || [];
  // stats overlay is indexed against the original PRICING.tiers order: map
  // each shown tier back to its original index so hot-tier reordering picks
  // the correct stats row for each card.
  const cards = show.map((t, i) => {
    const origIdx = p.tiers.indexOf(t);
    return tierCard(brand, slug, t, i, p.tiers, thumbs, i + 1, stats[origIdx]);
  }).join('\n');

  return `<section id="pricing">
  <div class="wrap">
    <div class="k rv">PLANNED PRICING</div>
    <h2 class="rv">${p.h}</h2>
    <p class="lead rv">${p.lead}</p>
    <div class="stage ${orbitClass}">
      <span class="hoverhint">Hover the card${show.length > 1 ? 's' : ''} to see every tier</span>
${cards}
    </div>
    ${p.extra ? `<p class="extra rv">${p.extra}</p>` : ''}
    <p class="pnote rv">${note}</p>
  </div>
</section>

`;
}
