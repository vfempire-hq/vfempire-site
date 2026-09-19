#!/usr/bin/env python3
"""Every internal href/src on every source page must resolve to a file in dist/. Exit 1 on a broken link."""
import re, glob, os, sys
pages = sorted(f for f in glob.glob('**/*.html', recursive=True) if not f.startswith(('dist/', 'docs/', 'node_modules/', 'preview/', 'dev/')))
def resolves(target):
    t = target.split('#')[0].split('?')[0]
    if not t or t.startswith(('http', 'mailto:', 'data:', 'tel:')): return True
    if t.startswith('/'): cand = ['dist' + t]
    else: cand = [os.path.normpath(os.path.join('dist', os.path.dirname(page), t))]
    for c in cand:
        for v in (c, c + '.html', c.rstrip('/') + '/index.html', c + 'index.html'):
            if os.path.isfile(v): return True
    return False
broken = 0
for page in pages:
    s = open(page).read()
    for m in re.finditer(r'(?:href|src)="([^"]+)"', s):
        if not resolves(m.group(1)):
            broken += 1; print(f'{page}: {m.group(1)}')
print(f'{len(pages)} pages, {broken} broken links')
sys.exit(1 if broken else 0)
