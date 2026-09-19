#!/usr/bin/env python3
"""Validate Cloudflare Workers Assets config files that `wrangler deploy --dry-run`
does not catch.

Currently checks:
  * dist/_redirects: status codes must be in CF's allowed set {200, 301, 302,
    303, 307, 308}. Also rejects malformed lines (fewer than 2 fields).
  * dist/.assetsignore: gitignore-like syntax; only rejects lines that would
    upload the entire tree by mistake (empty root patterns, absolute paths
    that could be shell-expanded).

Adding a check here means it runs pre-merge in CI, so classes of bug that
only surface at real `wrangler deploy` (like the /dev/* -> /404.html 404
attempt in PR #7) get caught before shipping.

Docs:
  https://developers.cloudflare.com/workers/static-assets/redirects/
  https://developers.cloudflare.com/workers/static-assets/binding/#assetsignore
"""
import os
import sys

REDIRECTS_ALLOWED_STATUS = {200, 301, 302, 303, 307, 308}
REDIRECTS_PATH = "dist/_redirects"
ASSETSIGNORE_PATH = "dist/.assetsignore"


def check_redirects(path: str) -> list[str]:
    if not os.path.isfile(path):
        return []
    errs: list[str] = []
    for lineno, raw in enumerate(open(path).read().splitlines(), start=1):
        line = raw.strip()
        if not line or line.startswith("#"):
            continue
        parts = line.split()
        if len(parts) < 2:
            errs.append(f"{path}:{lineno}: malformed rule (need 'source destination [status]'): {raw!r}")
            continue
        if len(parts) >= 3:
            try:
                status = int(parts[2])
            except ValueError:
                errs.append(f"{path}:{lineno}: status field is not an integer: {parts[2]!r}")
                continue
            if status not in REDIRECTS_ALLOWED_STATUS:
                allowed = ", ".join(str(s) for s in sorted(REDIRECTS_ALLOWED_STATUS))
                errs.append(
                    f"{path}:{lineno}: status {status} not accepted by CF Workers Assets. "
                    f"Allowed: {allowed}. Use .assetsignore to exclude paths from upload "
                    f"if you want a real 404."
                )
    return errs


def check_assetsignore(path: str) -> list[str]:
    if not os.path.isfile(path):
        return []
    errs: list[str] = []
    for lineno, raw in enumerate(open(path).read().splitlines(), start=1):
        line = raw.strip()
        if not line or line.startswith("#"):
            continue
        # An unqualified '*' or '**' would exclude the whole assets tree.
        if line in ("*", "**", "**/*", "/**"):
            errs.append(f"{path}:{lineno}: pattern {line!r} would exclude every asset from upload")
    return errs


def main() -> int:
    all_errs: list[str] = []
    all_errs.extend(check_redirects(REDIRECTS_PATH))
    all_errs.extend(check_assetsignore(ASSETSIGNORE_PATH))
    if all_errs:
        for e in all_errs:
            print(e)
        print(f"{len(all_errs)} issue(s)")
        return 1
    print("cf-config: ok")
    return 0


if __name__ == "__main__":
    sys.exit(main())
