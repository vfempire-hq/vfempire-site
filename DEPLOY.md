# DEPLOY — vfempire-site

**Target**: `https://vfempire.com` via Cloudflare Workers Assets.
**Config**: `wrangler.jsonc` at repo root, `dist/` is the served directory.

---

## Prerequisites

- Node.js 20+ + `npx`.
- Cloudflare account with the **`vfempire.com`** zone.
- A Cloudflare API token with `Workers Scripts:Edit` + `Workers R2 Storage:Edit` + `Zone:Read` scopes, OR an interactive login via `wrangler login`.

The **master token** is stored in Vincent's password manager entry `Cloudflare / vfempire prod`. Never commit it.

---

## First-time setup

```bash
# Clone
git clone git@github.com:vfempire-hq/vfempire-site.git
cd vfempire-site

# Install wrangler locally (project doesn't need node_modules for the build itself)
npm install wrangler --save-dev

# Authenticate (interactive OR non-interactive)
export CLOUDFLARE_API_TOKEN='<token from password manager>'
# OR
npx wrangler login
```

## Every deploy

```bash
# 1. Make your edits under systems/, index.html, etc.
# 2. Mirror to dist/ (the served directory)
./scripts/mirror-to-dist.sh   # OR manually cp -r changed files into dist/

# 3. Dry-run — see what Cloudflare will do without shipping
npx wrangler deploy --dry-run

# 4. Real deploy
npx wrangler deploy

# 5. Verify
curl -sI https://vfempire.com/ | head
curl -s  https://vfempire.com/systems/nav-it | head -3
```

Expected propagation: ~30 s to all edges.

## Verifying the security headers

After each deploy, confirm the hardening headers are actually being served:

```bash
curl -sI https://vfempire.com/ | grep -iE 'content-security-policy|strict-transport|x-content-type|x-frame|referrer-policy|permissions-policy|cross-origin'
```

Expected output includes:

```
strict-transport-security: max-age=63072000; includeSubDomains; preload
content-security-policy: default-src 'self'; script-src 'self' 'unsafe-inline'; ...
x-content-type-options: nosniff
x-frame-options: DENY
referrer-policy: strict-origin-when-cross-origin
permissions-policy: accelerometer=(), ...
cross-origin-opener-policy: same-origin
cross-origin-resource-policy: same-origin
cross-origin-embedder-policy: require-corp
```

If any of those are missing, `dist/_headers` didn't parse — Wrangler prints a warning at deploy time.

## Verifying third-party purity

A one-shot audit against the deployed site:

```bash
# Fetch every HTML page + grep for external hosts (should return only vfempire.com + schema.org)
for path in / /systems/nav-it /systems/fuelit /systems/mapit /legal/privacy; do
  curl -s "https://vfempire.com${path}" | grep -oE 'https?://[a-zA-Z0-9.-]+' | sort -u
done
```

Any host that's not `vfempire.com`, `schema.org`, `www.w3.org`, or a listed sister-brand (gn-productions, noirda.solutions, si-lock.com) is a regression.

## Rollback

Cloudflare Workers keeps the last 100 deploys. Rollback:

```bash
# List recent
npx wrangler deployments list

# Roll back to a specific ID
npx wrangler rollback <deployment-id>
```

## Git push

```bash
# First push after cloning the fresh repo
git remote add origin git@github.com:vfempire-hq/vfempire-site.git
git push -u origin main

# Regular
git add -A
git commit -m "…"
git push
```

CI (planned): `.github/workflows/deploy.yml` runs `wrangler deploy` on every push to `main`. Requires `CLOUDFLARE_API_TOKEN` + `CLOUDFLARE_ACCOUNT_ID` as GitHub Actions secrets.

## Never commit

- `.env`, `.env.*` — real tokens go here, gitignored.
- `secrets/` — same.
- `.wrangler/` — local dev state.

Sweep before committing: `git status | grep -iE '\.env$|secret|\.key$'` — should be empty.
