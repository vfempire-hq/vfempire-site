#!/usr/bin/env python3
"""SEO / AEO head + structured-data pass for vfempire.com pages.

Adds only what a page is missing: robots directive, complete Open Graph +
Twitter cards, font preload, BreadcrumbList, FAQPage (from visible FAQ
blocks), Service offers on service pages, ContactPage on the contact page,
and Organization enrichment + a systems ItemList on the homepage.
Idempotent. Run from the repo root with page paths as arguments.
"""
import re, sys, json, html, pathlib

ORG = "https://vfempire.com/#org"
DEFAULT_IMG = "https://vfempire.com/assets/hero-core.png"
SERVICE_OFFERS = {
    'cra-readiness-audit': (12000, 18000, 'P2W', 'CRA Readiness Audit'),
    'threat-model-dpia': (18000, 30000, 'P4W', 'Threat Model + DPIA Drafting'),
    'signing-infrastructure': (25000, 40000, 'P6W', 'Signing Infrastructure + SBOM Blueprint'),
}


def text(s):
    s = re.sub(r'<[^>]+>', '', s)
    return html.unescape(re.sub(r'\s+', ' ', s)).strip()


def get(pattern, s, default=''):
    m = re.search(pattern, s, re.S)
    return html.unescape(m.group(1)).strip() if m else default


def raw(pattern, s, default=''):
    m = re.search(pattern, s, re.S)
    return m.group(1).strip() if m else default


def crumbs_for(path, name):
    items = [("VF Empire", "https://vfempire.com/")]
    parts = [p for p in path.strip('/').split('/') if p]
    if len(parts) == 2:
        section = {'services': ('Services', 'https://vfempire.com/#services'),
                   'legal': ('Legal', 'https://vfempire.com/legal/terms'),
                   'systems': ('Under Construction', 'https://vfempire.com/#pipeline')}.get(parts[0])
        if section: items.append(section)
    items.append((name, None))
    out = []
    for i, (n, u) in enumerate(items, 1):
        li = {"@type": "ListItem", "position": i, "name": n}
        if u: li["item"] = u
        out.append(li)
    return {"@type": "BreadcrumbList", "itemListElement": out}


def process(path: pathlib.Path):
    s = path.read_text()
    if 'name="robots" content="noindex"' in s:
        return s, 'noindex, skipped'
    canonical = get(r'<link rel="canonical" href="([^"]+)"', s)
    title = get(r'<title>(.*?)</title>', s)
    page_name = re.split(r'\s*\|\s*', title)[0]
    short_name = re.split(r':\s', page_name)[0]
    desc = get(r'<meta name="description" content="([^"]*)"', s)
    og_title = raw(r'<meta property="og:title" content="([^"]*)"', s, raw(r'<title>(.*?)</title>', s).split(' | ')[0])
    og_desc = raw(r'<meta property="og:description" content="([^"]*)"', s, raw(r'<meta name="description" content="([^"]*)"', s))
    og_img = get(r'<meta property="og:image" content="([^"]*)"', s, DEFAULT_IMG)
    upath = canonical.replace('https://vfempire.com', '') or '/'
    qt, qd = og_title.replace('"', '&quot;'), og_desc.replace('"', '&quot;')

    # ---- head tags: insert what is missing, before the icon link ----
    need = []
    def want(tag_re, tag):
        if not re.search(tag_re, s): need.append(tag)
    want(r'<meta name="robots"', '<meta name="robots" content="index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1">')
    want(r'property="og:type"', '<meta property="og:type" content="website">')
    want(r'property="og:site_name"', '<meta property="og:site_name" content="VF Empire">')
    want(r'property="og:title"', f'<meta property="og:title" content="{qt}">')
    want(r'property="og:description"', f'<meta property="og:description" content="{qd}">')
    want(r'property="og:url"', f'<meta property="og:url" content="{canonical}">')
    want(r'property="og:image"', f'<meta property="og:image" content="{og_img}">')
    if og_img == DEFAULT_IMG:
        want(r'property="og:image:width"', '<meta property="og:image:width" content="1344">')
        want(r'property="og:image:height"', '<meta property="og:image:height" content="768">')
    want(r'property="og:locale"', '<meta property="og:locale" content="en_GB">')
    want(r'name="twitter:card"', '<meta name="twitter:card" content="summary_large_image">')
    want(r'name="twitter:title"', f'<meta name="twitter:title" content="{qt}">')
    want(r'name="twitter:description"', f'<meta name="twitter:description" content="{qd}">')
    want(r'name="twitter:image"', f'<meta name="twitter:image" content="{og_img}">')
    want(r'rel="preload" href="/fonts/hanken.woff2"', '<link rel="preload" href="/fonts/hanken.woff2" as="font" type="font/woff2" crossorigin>')
    if need:
        s = s.replace('<link rel="icon"', '\n'.join(need) + '\n<link rel="icon"', 1)

    # ---- structured data ----
    own = re.sub(r'<!-- seo-pass -->\n<script type="application/ld\+json">.*?</script>\n', '', s, count=1, flags=re.S)
    blocks = re.findall(r'<script type="application/ld\+json">(.*?)</script>', own, re.S)
    types = set()
    for b in blocks:
        j = json.loads(b)
        for g in j.get('@graph', [j]):
            types.add(g.get('@type'))
    graph = []
    if upath != '/' and 'BreadcrumbList' not in types:
        graph.append(crumbs_for(upath, short_name))
    if upath != '/' and not (types & {'WebPage', 'SoftwareApplication', 'Service', 'ContactPage'}):
        graph.append({"@type": "ContactPage" if upath.startswith('/contact') else "WebPage",
                      "@id": canonical, "url": canonical, "name": page_name, "description": desc,
                      "isPartOf": {"@id": "https://vfempire.com/#site"}, "about": {"@id": ORG},
                      "inLanguage": "en-GB", "primaryImageOfPage": og_img})
    # FAQ blocks -> FAQPage
    if 'FAQPage' not in types:
        qa = re.findall(r'<details class="fq">\s*<summary>(.*?)</summary>\s*<div>(.*?)</div>', s, re.S)
        qa += re.findall(r'<div class="q">\s*<h4>(.*?)</h4>\s*<p>(.*?)</p>', s, re.S)
        if qa:
            graph.append({"@type": "FAQPage", "@id": canonical + "#faq",
                          "mainEntity": [{"@type": "Question", "name": text(q),
                                          "acceptedAnswer": {"@type": "Answer", "text": text(a)}} for q, a in qa]})
    # Services -> Service with fixed-fee offer
    slug = upath.rstrip('/').split('/')[-1]
    if upath.startswith('/services/') and 'Service' not in types and slug in SERVICE_OFFERS:
        lo, hi, dur, sname = SERVICE_OFFERS[slug]
        graph.append({"@type": "Service", "@id": canonical + "#service", "name": sname, "url": canonical,
                      "description": desc, "serviceType": "Cyber Resilience Act compliance consulting",
                      "provider": {"@id": ORG}, "areaServed": {"@type": "Place", "name": "European Union"},
                      "offers": {"@type": "Offer", "url": canonical, "availability": "https://schema.org/InStock",
                                 "priceCurrency": "EUR",
                                 "priceSpecification": {"@type": "PriceSpecification", "priceCurrency": "EUR",
                                                        "minPrice": lo, "maxPrice": hi,
                                                        "description": f"Fixed fee, typical engagement {dur[1:]} weeks"}}})
    # Contact -> ContactPoint list
    if upath.startswith('/contact'):
        cps = []
        for em, role in re.findall(r'href="mailto:([^"]+)"[^>]*>[^<]*</a></div>\s*<div class="role">(.*?)</div>', s):
            cps.append({"@type": "ContactPoint", "email": em, "contactType": text(role),
                        "availableLanguage": ["en", "de", "mt"], "areaServed": "EU"})
        if cps:
            graph.append({"@type": "Organization", "@id": ORG, "contactPoint": cps})
    # Homepage enrichment
    if upath == '/':
        if '"sameAs"' not in s:
            s = s.replace('"email": "info@vfempire.com",',
                          '"email": "info@vfempire.com",\n      "sameAs": ["https://github.com/vfempire-hq", "https://si-lock.com", "https://noirda.solutions", "https://gn-productions.com"],\n      "contactPoint": [\n        {"@type": "ContactPoint", "email": "info@vfempire.com", "contactType": "general enquiries", "availableLanguage": ["en", "de", "mt"]},\n        {"@type": "ContactPoint", "email": "sales@vfempire.com", "contactType": "sales", "availableLanguage": ["en", "de", "mt"]},\n        {"@type": "ContactPoint", "email": "support@vfempire.com", "contactType": "customer support", "availableLanguage": ["en", "de", "mt"]},\n        {"@type": "ContactPoint", "email": "security@vfempire.com", "contactType": "security", "availableLanguage": ["en"]}\n      ],\n      "areaServed": ["MT", "EU", "DE", "GB"],', 1)
        if 'ItemList' not in types:
            items = re.findall(r'<a class="pp" href="([^"]+)">.*?<h5>(.*?)</h5>', s, re.S)
            if items:
                graph.append({"@type": "ItemList", "@id": "https://vfempire.com/#systems", "name": "VF Empire systems on the build slate",
                              "itemListOrder": "https://schema.org/ItemListOrderAscending", "numberOfItems": len(items),
                              "itemListElement": [{"@type": "ListItem", "position": i, "name": text(n),
                                                   "url": (u if u.startswith('http') else 'https://vfempire.com' + u)}
                                                  for i, (u, n) in enumerate(items, 1)]})
    if graph:
        block = '<script type="application/ld+json">\n' + json.dumps({"@context": "https://schema.org", "@graph": graph}, ensure_ascii=False, indent=2) + '\n</script>\n'
        # replace a previous pass's block if present
        if '<!-- seo-pass -->' in s:
            s = re.sub(r'<!-- seo-pass -->\n<script type="application/ld\+json">.*?</script>\n', '<!-- seo-pass -->\n' + block, s, count=1, flags=re.S)
        else:
            s = s.replace('</head>', '<!-- seo-pass -->\n' + block + '</head>', 1)
    return s, f'+{len(need)} head tags, +{len(graph)} schema nodes'


if __name__ == '__main__':
    for p in sys.argv[1:]:
        path = pathlib.Path(p)
        out, note = process(path)
        path.write_text(out)
        print(p, note)
