#!/usr/bin/env python3
"""Refresh desktop/ on main from the latest published desktop-v* release.

Writes:
  desktop/latest.json   copy of the release's updater feed (what 0.2+ apps read)
  desktop/updates.json  the 2022 alpha feed (0.1.x, Tauri 1), pointed at the
                        new macOS build so alpha installs can update
  desktop/README.md     current version and download links

Usage: update_desktop_folder.py [TAG]   (default: newest published desktop-v*)
Needs the gh CLI with read access to this repository.
"""
import json
import subprocess
import sys
import urllib.request
from pathlib import Path

REPO = "airframesio/assets"
ROOT = Path(__file__).resolve().parent.parent / "desktop"

LABELS = [
    ("macOS (Apple silicon and Intel)", "_universal.dmg"),
    ("Windows installer (.exe)", "-setup.exe"),
    ("Windows installer (.msi)", ".msi"),
    ("Linux AppImage", ".AppImage"),
    ("Linux .deb", ".deb"),
    ("Linux .rpm", ".rpm"),
]


def gh(path):
    out = subprocess.run(["gh", "api", path], check=True, capture_output=True, text=True)
    return json.loads(out.stdout)


def desktop_releases():
    rels = gh(f"repos/{REPO}/releases?per_page=100")
    return [r for r in rels if r["tag_name"].startswith("desktop-v") and not r["draft"] and not r["prerelease"]]


def fetch(url):
    with urllib.request.urlopen(url) as resp:
        return resp.read()


def main():
    releases = desktop_releases()
    if len(sys.argv) > 1:
        releases_by_tag = {r["tag_name"]: r for r in releases}
        rel = releases_by_tag.get(sys.argv[1])
        if rel is None:
            sys.exit(f"{sys.argv[1]} is not a published desktop release")
    else:
        rel = max(releases, key=lambda r: r["published_at"])
    assets = {a["name"]: a["browser_download_url"] for a in rel["assets"]}
    if "latest.json" not in assets:
        sys.exit(f"{rel['tag_name']} has no latest.json")
    feed_raw = fetch(assets["latest.json"])
    feed = json.loads(feed_raw)
    version = feed["version"]

    ROOT.mkdir(exist_ok=True)
    (ROOT / "latest.json").write_bytes(feed_raw if feed_raw.endswith(b"\n") else feed_raw + b"\n")

    # The 0.1.x alpha (Tauri 1) reads desktop/updates.json. Its macOS updater
    # accepts the 2.x .app.tar.gz (same archive layout, same signing key).
    # Tauri 1 on Windows expects a zipped .msi, which 2.x builds do not make,
    # so Windows alpha installs have to download the new installer by hand.
    platforms = {}
    for key in ("darwin-x86_64", "darwin-aarch64"):
        if key in feed["platforms"]:
            platforms[key] = feed["platforms"][key]
    legacy = {
        "version": f"v{version}",
        "notes": feed.get("notes", ""),
        "pub_date": feed.get("pub_date", rel["published_at"]),
        "platforms": platforms,
    }
    (ROOT / "updates.json").write_text(json.dumps(legacy, indent=2) + "\n")

    lines = [
        "# Airframes Desktop",
        "",
        f"Latest version: **{version}** ([release notes]({rel['html_url']}))",
        "",
        "| Platform | Download |",
        "| --- | --- |",
    ]
    for label, suffix in LABELS:
        name = next((n for n in assets if n.endswith(suffix)), None)
        if name:
            lines.append(f"| {label} | [{name}]({assets[name]}) |")
    lines += [
        "",
        "Installed copies update themselves from",
        "[`latest.json`](https://github.com/airframesio/assets/releases/latest/download/latest.json)",
        "(mirrored here as [`latest.json`](latest.json)). [`updates.json`](updates.json) is the",
        "feed the 2022 alpha (0.1.x) reads.",
        "",
        "## All versions",
        "",
    ]
    for r in sorted(releases, key=lambda r: r["published_at"], reverse=True):
        lines.append(f"- [{r['tag_name'].removeprefix('desktop-')}]({r['html_url']}), {r['published_at'][:10]}")
    lines += [
        "",
        "This folder is rewritten by `scripts/update_desktop_folder.py` each time a",
        "`desktop-v*` release is published. Do not edit it by hand.",
        "",
    ]
    (ROOT / "README.md").write_text("\n".join(lines))
    print(f"desktop/ updated for {rel['tag_name']}")


if __name__ == "__main__":
    main()
