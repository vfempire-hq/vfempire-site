#!/usr/bin/env python3
"""Site-wide checks. Run from the repo root before every commit. Exit 1 on any issue."""
import re, glob, json, sys
SLOP = ['actually', 'really', 'simply', 'genuinely', 'truly', 'literally', "Here's the thing", 'It turns out', 'Let that sink in', "It's worth noting", 'At its core', 'In a world where', 'lorem ipsum', 'TBA']
files = sorted(f for f in glob.glob('**/*.html', recursive=True) if not f.startswith(('dist/', 'docs/', 'node_modules/', 'preview/')) and f not in ('privacy.html', 'terms.html'))
bad = 0
for f in files:
    s = open(f).read(); errs = []
    if '—' in s: errs.append('em dash')
    for b in re.findall(r'<script type="application/ld\+json">(.*?)</script>', s, re.S):
        try: json.loads(b)
        except Exception as e: errs.append('invalid JSON-LD')
    for t in ['div', 'section', 'p', 'h1', 'h2', 'h3', 'h4', 'a', 'span', 'details', 'ul', 'ol', 'li', 'table', 'tr', 'td', 'nav', 'footer', 'main', 'header', 'dl', 'button', 'style', 'script', 'svg', 'noscript', 'article', 'figure']:
        o = len(re.findall(r'<' + t + r'[\s>]', s)); c = len(re.findall(r'</' + t + r'>', s))
        if o != c: errs.append(f'unbalanced <{t}> {o}/{c}')
    if 'href="/house.css"' not in s: errs.append('house.css not linked')
    if '<footer' not in s: errs.append('no footer')
    h1 = len(re.findall(r'<h1[\s>]', s))
    if h1 != 1: errs.append(f'{h1} h1')
    t = re.search(r'<title>(.*?)</title>', s, re.S); t = t.group(1) if t else ''
    if len(t) > 60: errs.append(f'title {len(t)} chars')
    d = re.search(r'<meta name="description" content="([^"]*)"', s); d = d.group(1) if d else ''
    noindex = 'content="noindex"' in s
    if not noindex:
        if not (110 <= len(d) <= 160): errs.append(f'description {len(d)} chars')
        for k, v in [('consent notice', 'id="consent"'), ('twitter card', 'name="twitter:card"'), ('robots', 'name="robots" content="index'), ('canonical', 'rel="canonical"'), ('scroll rail', 'scrollrail.js'), ('nav links', '<div class="nl">'), ('noscript fallback', '<noscript>')]:
            if v not in s: errs.append('missing ' + k)
        if 'BreadcrumbList' not in s and f != 'index.html': errs.append('missing BreadcrumbList')
        if re.search(r'^:root\{|^\.nav\{|^\.bt\{|^h2\{|^footer\{|^\.consent\{', s, re.M): errs.append('inline copy of house CSS')
    body = re.sub(r'<(script|style)[^>]*>.*?</\1>', '', s, flags=re.S)
    text = re.sub(r'<[^>]+>', ' ', body)
    for w in SLOP:
        if re.search(r'\b' + re.escape(w) + r'\b', text): errs.append('slop: ' + w)
    if re.search(r'<img(?![^>]*\balt=)[^>]*>', s): errs.append('img without alt')
    if re.search(r'<script>', s): errs.append('inline script (the build moves it to assets/page)')
    if re.search(r'\son(?:click|load|error|mouseover|submit|change|input)="', s): errs.append('inline event handler')
    if errs: bad += 1; print(f'{f}: ' + '; '.join(errs))
print(f'{len(files)} pages checked, {bad} with issues')
sys.exit(1 if bad else 0)
