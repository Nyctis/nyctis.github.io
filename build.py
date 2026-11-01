#!/usr/bin/env python3
"""Builds the static site into docs/. Standard library only.

Pages live in src/en. The first line of a page is
<!-- title | description -->. All links are relative, so the site works at
username.github.io/repo/ and on a custom domain alike.
"""

import re
import shutil
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent

SRC, OUT = ROOT / "src", ROOT / "docs"

# Footer links. Empty ones are left out, so nothing points at a dead address.
REPO_URL = ""
DEMO_URL = ""
DECK_URL = ""

# The release page. While it is empty, the download block and GitHub links stay out.
MAC_URL = "https://github.com/Nyctis/beetle-desktop/releases/tag/v0.1.0"
MAC_VERSION = "v0.1.0"
ORG_URL = "https://github.com/Nyctis"

APPLE = ('<svg class="ic" viewBox="0 0 24 24" aria-hidden="true"><path d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014'
         '-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 '
         '3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376'
         '-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 '
         '2.715-.688 3.559-1.701"/></svg>')
GITHUB = ('<svg class="ic" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 '
          '0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 '
          '1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 '
          '1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 '
          '0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/></svg>')

PAGES = [
    ("index", ""),
    ("how-it-works", "how-it-works/"),
    ("mac", "mac/"),
    ("server", "server/"),
    ("pricing", "pricing/"),
    ("components", "components/"),
    ("protocol", "protocol/"),
    ("privacy", "privacy/"),
    ("notes", "notes/"),
    ("notes-chain", "notes/keeping-the-chain-out-of-sight/"),
    ("colophon", "colophon/"),
]

NAV = [("how-it-works/", "How it works"), ("mac/", "Desktop"), ("server/", "Server"), ("pricing/", "Pricing")]
DOC_KEYS = {"components", "protocol", "privacy", "notes", "notes-chain"}
DOCS = [("components", "components/", "Components"), ("protocol", "protocol/", "Protocol"), ("privacy", "privacy/", "Privacy"),
        ("notes", "notes/", "Notes")]


# Notes on the screenshots, in the window's own 1200 x 780 coordinates.
# (target x, target y, label x, label y, text). Labels sit next to what they point at,
# so arrows stay short. G puts a label in the gutter beside the window.
G = 1216
SHOTS = {
    "models": ("models.png", "The Models page with adapters and base models", [
        (1162, 166, G, 166, "Roll back at any time"),
        (731, 220, 762, 246, "Score before and after"),
        (1162, 375, G, 375, "Who sells each model"),
        (500, 430, 530, 458, "What runs on this Mac"),
    ]),
    "network": ("network.png", "Direct links to three sellers, with Solana underneath", [
        (1162, 228, G, 228, "Machine and models"),
        (600, 264, 628, 312, "Direct, no relay"),
        (1162, 346, G, 346, "Money and commitments"),
        (1162, 460, G, 460, "Live from the chain"),
        (1162, 657, G, 657, "Public record"),
    ]),
    "connect": ("connect.png", "The Connect page for agents and developers", [
        (1050, 178, 1092, 178, "One click"),
        (1050, 356, 1092, 356, "Hard limits"),
        (715, 564, 768, 564, "OpenAI-compatible address"),
    ]),
}


def shot(name, root):
    src, alt, notes = SHOTS[name]
    lines, pins, chips, items = "", "", "", ""
    for n, (tx, ty, lx, ly, text) in enumerate(notes, 1):
        path = f"M{lx} {ly}H{tx}" + (f"V{ty}" if ty != ly else "")
        lines += f'<path class="leader" marker-end="url(#ah-{name})" d="{path}"/>'
        pins += f'<g class="pin"><circle cx="{tx}" cy="{ty}" r="14"/><text x="{tx}" y="{ty + 5}" text-anchor="middle">{n}</text></g>'
        chips += f'<span class="note" style="left:{lx / 12:.2f}%;top:{ly / 7.8:.2f}%">{text}</span>'
        items += f"<li>{text}</li>"
    head = (f'<defs><marker id="ah-{name}" viewBox="0 0 8 8" refX="7.5" refY="4" markerWidth="8" markerHeight="8" '
            f'markerUnits="userSpaceOnUse" orient="auto"><path d="M0 .5L8 4L0 7.5z"/></marker></defs>')
    return (f'<figure class="anno"><div class="anno-img"><img src="{root}assets/shots/{src}" alt="{alt}" width="2400" height="1560" loading="lazy">'
            f'<svg viewBox="0 0 1200 780" aria-hidden="true">{head}{lines}{pins}</svg>{chips}</div>'
            f'<ol class="anno-notes">{items}</ol></figure>')


def download_buttons():
    return (f'<div class="cta dlbtns"><a href="{MAC_URL}">{APPLE}Download for Mac</a>'
            f'<a class="alt" href="{ORG_URL}">{GITHUB}GitHub</a></div>')


def download_block(root):
    return (f'<section class="dl"><img src="{root}assets/shots/desktop.png" width="2400" height="1020" loading="lazy" '
            f'alt="The Network page of Beetle Desktop, showing direct links from this Mac to three GPU sellers, with Solana underneath">'
            f'<div class="dl-foot">{download_buttons()}'
            f'<p class="cap">{MAC_VERSION} · Apple silicon · Built for macOS 13 or later · Install steps on the release page</p></div></section>')


def logo_paths(name):
    """The original artwork, recoloured with currentColor. Geometry is never edited."""
    svg = (SRC / "assets" / "logo" / name).read_text()
    box = re.search(r'viewBox="([^"]+)"', svg).group(1)
    inner = re.search(r"</title>(.*)</svg>", svg, re.S).group(1).replace('fill="#0B0D12"', 'fill="currentColor"')
    return box, inner


def page_html(key, path, title, desc, body):
    depth = path.count("/")
    root = "../" * depth or "./"
    nav = "".join(f'<a href="{root}{href}"{" aria-current=page" if path == href else ""}>{label}</a>' for href, label in NAV)
    in_docs = key in DOC_KEYS
    box, logo = logo_paths("nyctis-logo.svg")
    mbox, mark = logo_paths("nyctis-mark.svg")
    flinks = "".join(f'<a href="{url}">{label}</a>' for url, label in ((DEMO_URL, "Demo"), (DECK_URL, "Deck"), (REPO_URL, "Source")) if url)
    body = body.replace("{{root}}", root).replace("{{base}}", root)
    body = body.replace("{{seal}}", f'<svg class="seal" viewBox="{mbox}" aria-hidden="true">{mark}</svg>')
    body = body.replace('<svg viewBox="-182.5 -182.5 365 365" aria-hidden="true"><use href="#nyctis-m"/></svg>',
                        f'<svg viewBox="{mbox}" aria-hidden="true">{mark}</svg>')
    body = re.sub(r"\{\{shot:(\w+)\}\}", lambda m: shot(m.group(1), root), body)
    body = body.replace("{{download}}", download_block(root) if MAC_URL else "")
    body = body.replace("{{dl-buttons}}", download_buttons() if MAC_URL else "")
    org = f'<a class="gh" href="{ORG_URL}" aria-label="Nyctis on GitHub">{GITHUB}</a>' if MAC_URL else ""
    dnav = ""
    if in_docs:
        tabs = "".join(
            f'<a href="{root}{p}"{" aria-current=page" if path.startswith(p) else ""}>{label}</a>'
            for _, p, label in DOCS)
        dnav = f'<nav class="dnav" aria-label="Documentation">{tabs}</nav>'
    full_title = title if key == "index" else f"{title} · Beetle"
    return f"""<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>{full_title}</title>
<meta name="description" content="{desc}">
<meta name="theme-color" content="#0B0D12">
<meta property="og:title" content="{full_title}">
<meta property="og:description" content="{desc}">
<meta property="og:type" content="website">
<meta property="og:image" content="{root}assets/og.png">
<link rel="icon" href="{root}assets/favicon.svg" type="image/svg+xml">
<link rel="stylesheet" href="{root}assets/site.css">
</head>
<body class="p-{key}">
<a class="skip" href="#main">Skip to content</a>
<header class="top">
  <a class="brand" href="{root}" aria-label="Nyctis Beetle">
    <svg class="logo" viewBox="{box}" aria-hidden="true">{logo}</svg>
    <span>Beetle</span>
  </a>
  <nav class="links" aria-label="Main">{nav}<a href="{root}components/"{" aria-current=page" if in_docs else ""}>Docs</a></nav>
  {org}
</header>
{dnav}
<main id="main">
{body}
</main>
<footer class="foot">
  <svg class="logo" viewBox="{box}" aria-hidden="true">{logo}</svg>
  <p>Beetle runs on Solana devnet.</p>
  <p class="flinks"><a href="{root}colophon/">Colophon</a>{flinks}</p>
</footer>
<script src="{root}assets/scenes.js"></script>
<script src="{root}assets/site.js"></script>
{f'<script src="{root}assets/live.js"></script>' if key == "index" else ""}
</body>
</html>
"""


def main():
    if OUT.exists():
        shutil.rmtree(OUT)
    shutil.copytree(SRC / "assets", OUT / "assets")
    (OUT / ".nojekyll").write_text("")
    box, mark = logo_paths("nyctis-mark.svg")
    x, y, w, h = [float(v) for v in box.split()]
    pad = w * .16
    icon = (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="{x - pad} {y - pad} {w + 2 * pad} {h + 2 * pad}" color="#F4F2EA">'
            f'<rect x="{x - pad}" y="{y - pad}" width="{w + 2 * pad}" height="{h + 2 * pad}" fill="#0B0D12"/>{mark}</svg>')
    (OUT / "assets" / "favicon.svg").write_text(icon)
    built = 0
    for key, path in PAGES:
        raw = (SRC / "en" / f"{key}.html").read_text()
        head = re.match(r"<!--\s*(.*?)\s*\|\s*(.*?)\s*-->\n", raw)
        target = OUT / path / "index.html"
        target.parent.mkdir(parents=True, exist_ok=True)
        target.write_text(page_html(key, path, head.group(1), head.group(2), raw[head.end():]))
        built += 1
    print(f"built {built} pages into {OUT}")


if __name__ == "__main__":
    main()
