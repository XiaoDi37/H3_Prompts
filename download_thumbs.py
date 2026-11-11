#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Download 550 poster thumbnails into thumbs/ named by slug."""
import json, os, urllib.request, concurrent.futures as cf, sys

os.makedirs("thumbs", exist_ok=True)
data = json.load(open("prompts.json", encoding="utf-8"))
UA = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"}


def dl(r):
    slug = r.get("slug")
    url = r.get("poster")
    if not slug or not url:
        return (slug, False, "missing")
    ext = ".jpg"
    if ".webp" in url:
        ext = ".webp"
    elif ".png" in url:
        ext = ".png"
    out = os.path.join("thumbs", slug + ext)
    if os.path.exists(out) and os.path.getsize(out) > 0:
        return (slug, True, "cached")
    for t in range(3):
        try:
            req = urllib.request.Request(url, headers=UA)
            b = urllib.request.urlopen(req, timeout=30).read()
            with open(out, "wb") as f:
                f.write(b)
            return (slug, True, "ok")
        except Exception as e:
            if t == 2:
                return (slug, False, str(e))
    return (slug, False, "unknown")


def main():
    ok = fail = 0
    done = 0
    fails = []
    with cf.ThreadPoolExecutor(max_workers=10) as ex:
        for slug, good, msg in ex.map(dl, data):
            done += 1
            if good:
                ok += 1
            else:
                fail += 1
                fails.append((slug, msg))
            if done % 50 == 0:
                print("progress", done, "/", len(data), "ok", ok, "fail", fail, flush=True)
    print("DONE ok=", ok, "fail=", fail)
    for s, m in fails[:20]:
        print("  fail:", s, m)
    # record which extension each slug got, for the page builder
    ext_map = {}
    for f in os.listdir("thumbs"):
        base, e = os.path.splitext(f)
        ext_map[base] = e
    json.dump(ext_map, open("thumbs_ext.json", "w", encoding="utf-8"))
    print("wrote thumbs_ext.json:", len(ext_map))


if __name__ == "__main__":
    main()
