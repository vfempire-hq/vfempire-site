#!/usr/bin/env bash
# Mirror source HTML files into dist/ before deploy.
#
# Cloudflare Workers Assets serves whatever's under dist/. The source tree at
# the repo root is the working copy that gets edited by hand; this script
# reflects those edits into dist/ so the deploy picks them up.
#
# We deliberately DO NOT deploy directly from the source tree because:
#   - It contains dev-only files (palette.html, index-v4-dark.html, mock-ratings/)
#   - It contains local state (.wrangler/)
#   - Keeping dist/ separate makes the "shipping bytes" reviewable at a glance

set -euo pipefail
cd "$(dirname "$0")/.."

# Top-level HTML (every hand-authored page at repo root)
for f in \
  index.html 401.html 404.html \
  about.html careers.html dashboards.html engine.html glossary.html harness.html \
  permanence-guarantee.html press.html security.html software.html training-centre.html; do
  [ -f "$f" ] && cp -v "$f" "dist/$f"
done

# Shared house stylesheet
cp -v house.css dist/house.css
cp -v llms.txt  dist/llms.txt

# Sitemap
cp -v sitemap.xml     dist/sitemap.xml
cp -v sitemap.xml     sitemap-full.xml || true

# Systems
mkdir -p dist/systems
find systems -maxdepth 1 -name '*.html' -exec cp -v {} dist/systems/ \;

# Services
mkdir -p dist/services
find services -maxdepth 1 -name '*.html' -exec cp -v {} dist/services/ \; 2>/dev/null || true

# Legal + contact
mkdir -p dist/legal dist/contact
find legal   -maxdepth 1 -name '*.html' -exec cp -v {} dist/legal/ \;
find contact -maxdepth 1 -name '*.html' -exec cp -v {} dist/contact/ \;

# Agents
mkdir -p dist/agents
find agents -maxdepth 1 -name '*.html' -exec cp -v {} dist/agents/ \;

# Compare + journal (mirror any HTML directly under these dirs)
if [ -d compare ]; then
  mkdir -p dist/compare
  find compare -maxdepth 1 -name '*.html' -exec cp -v {} dist/compare/ \;
fi
if [ -d journal ]; then
  mkdir -p dist/journal
  find journal -maxdepth 1 -name '*.html' -exec cp -v {} dist/journal/ \;
fi

# Preview builds (WIP work-in-progress builds; noindex; nested arbitrarily)
if [ -d preview ]; then
  mkdir -p dist/preview
  cp -r preview/. dist/preview/
fi

# Assets (fonts are inside dist/ already; keep the sync one-way for images)
if [ -d assets ]; then
  mkdir -p dist/assets
  cp -r assets/. dist/assets/
fi
if [ -d fonts ]; then
  mkdir -p dist/fonts
  cp -r fonts/. dist/fonts/
fi

echo
echo "✓ Mirror complete. Deploy with: npx wrangler deploy"
