#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Fix duration/aspect/model/source metadata by re-parsing detail pages with a
robust label/value span-pair regex (the old full-text search grabbed garbage
from prompt bodies containing words like 'Duration' or timestamps)."""
import re, json, time, sys, html, urllib.request, concurrent.futures as cf

UA = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"}
PAIR_RE = re.compile(
    r'text-black/45">\s*([^<]+?)\s*</span>\s*<span[^>]*font-semibold[^>]*>\s*([^<]+?)\s*</span>'
)


def fetch(url, tries=3):
    for t in range(tries):
        try:
            req = urllib.request.Request(url, headers=UA)
            with urllib.request.urlopen(req, timeout=30) as r:
                return r.read().decode("utf-8", "replace")
        except Exception as e:
            if t == tries - 1:
                print("FAIL", url, e, file=sys.stderr)
                return None
            time.sleep(1.5 * (t + 1))


def parse_meta(h):
    pairs = PAIR_RE.findall(h)
    m = {}
    for k, v in pairs:
        m[html.unescape(k).strip().lower()] = html.unescape(v).strip()
    return {
        "model": m.get("model", ""),
        "duration": m.get("duration", ""),
        "aspect": m.get("aspect ratio", ""),
        "source": m.get("source", ""),
    }


def work(rec):
    url = rec.get("url")
    if not url:
        return rec.get("id"), None
    h = fetch(url)
    if not h:
        return rec.get("id"), None
    return rec.get("id"), parse_meta(h)


def main():
    data = json.load(open("prompts.json", encoding="utf-8"))
    by_slug = {r.get("slug"): r for r in data}
    ids = [r.get("slug") for r in data]
    urls = {r.get("slug"): r.get("url") for r in data}
    # rebuild minimal rec list for workers
    work_items = [{"id": s, "url": urls[s]} for s in ids]

    fixed = 0
    missing = 0
    done = 0
    results = {}
    with cf.ThreadPoolExecutor(max_workers=8) as ex:
        futs = [ex.submit(work, it) for it in work_items]
        for f in cf.as_completed(futs):
            sid, meta = f.result()
            done += 1
            if meta:
                results[sid] = meta
            else:
                missing += 1
            if done % 50 == 0:
                print("progress", done, "/", len(work_items), flush=True)

    for r in data:
        sid = r.get("slug")
        meta = results.get(sid)
        if not meta:
            continue
        if meta["model"]:
            r["model"] = meta["model"]
        if meta["duration"]:
            r["duration"] = meta["duration"]
        if meta["aspect"]:
            r["aspect"] = meta["aspect"]
        if meta["source"]:
            r["source"] = meta["source"]
            am = re.search(r"@([A-Za-z0-9_]+)", meta["source"])
            if am:
                r["author"] = "@" + am.group(1)
        fixed += 1

    json.dump(data, open("prompts.json", "w", encoding="utf-8"), ensure_ascii=False)
    print("fixed:", fixed, "missing:", missing)

    from collections import Counter
    dur = Counter(r.get("duration") for r in data)
    asp = Counter(r.get("aspect") for r in data)
    print("duration unique:", len(dur), "->", dur.most_common(12))
    print("aspect unique:", len(asp), "->", asp.most_common(12))


if __name__ == "__main__":
    main()
