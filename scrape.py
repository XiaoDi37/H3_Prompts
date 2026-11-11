#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Scrape BeatAPI MiniMax H3 prompt gallery into prompts.json."""
import re, json, time, sys, html, urllib.request, concurrent.futures as cf

BASE = "https://beatapi.io"
LIST_URL = BASE + "/minimax-h3-prompts"
UA = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"}


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


def strip_tags(s):
    s = re.sub(r"<[^>]+>", " ", s)
    return re.sub(r"\s+", " ", html.unescape(s)).strip()


def get_list():
    h = fetch(LIST_URL)
    b = re.search(r'<script[^>]*application/ld\+json[^>]*>(.*?)</script>', h, re.S).group(1)
    d = json.loads(b)
    items = d["mainEntity"]["itemListElement"]
    out = []
    for it in items:
        u = it["url"]
        out.append({"pos": it.get("position"), "name": it.get("name"),
                    "url": BASE + u if u.startswith("/") else u, "slug": u.rstrip("/").split("/")[-1]})
    return out


def parse_detail(h):
    rec = {}
    # title
    m = re.search(r"<h1[^>]*>(.*?)</h1>", h, re.S)
    rec["title"] = strip_tags(m.group(1)) if m else None
    # prompt body: div right after the "Prompt" heading + copy button
    i = h.find(">Prompt<")
    body = None
    if i >= 0:
        j = h.find('whitespace-pre-wrap', i)
        if j >= 0:
            start = h.find(">", j) + 1
            end = h.find("</div>", start)
            body = html.unescape(h[start:end])
            body = re.sub(r"<[^>]+>", "", body)
            body = body.replace("\r", "").strip()
    rec["prompt"] = body
    # visible text for metadata
    txt = re.sub(r"<script.*?</script>", "", h, flags=re.S)
    txt = re.sub(r"<style.*?</style>", "", txt, flags=re.S)
    txt = strip_tags(txt)
    def grab(label, stops):
        k = txt.find(label)
        if k < 0:
            return None
        seg = txt[k + len(label):]
        for s in stops:
            p = seg.find(s)
            if p >= 0:
                seg = seg[:p]
        return seg.strip() or None
    rec["model"] = grab("Model", ["Duration", "Aspect", "Source", "Generate"])
    rec["duration"] = grab("Duration", ["Aspect", "Source", "Generate", "Model"])
    rec["aspect"] = grab("Aspect ratio", ["Source", "Generate", "Duration", "Model"])
    src = grab("Source", ["Generate", "Copy prompt", "Open source", "Aspect", "Duration"])
    rec["source"] = src
    # author handle
    am = re.search(r"@([A-Za-z0-9_]+)", src or "")
    rec["author"] = ("@" + am.group(1)) if am else None
    # source links (x.com / twitter)
    links = re.findall(r'href="(https?://(?:x\.com|twitter\.com)/[^"]+)"', h)
    rec["source_link"] = links[0] if links else None
    # video / poster
    vid = re.findall(r'<source[^>]+src="([^"]+)"', h) or re.findall(r'<video[^>]+src="([^"]+)"', h)
    rec["video"] = vid[0] if vid else None
    poster = re.findall(r'poster="([^"]+)"', h)
    rec["poster"] = poster[0] if poster else None
    # category from meta description ("A MiniMax H3 <cat> prompt ...")
    dm = re.search(r'<meta name="description" content="([^"]+)"', h)
    cat = None
    if dm:
        cm = re.search(r"MiniMax H3\s+([a-zA-Z \-]+?)\s+prompt", dm.group(1))
        if cm:
            cat = cm.group(1).strip()
    rec["category"] = cat
    return rec


def work(item):
    h = fetch(item["url"])
    if not h:
        return {**item, "error": True}
    rec = parse_detail(h)
    return {**item, **rec}


def main():
    items = get_list()
    print("list items:", len(items))
    results = [None] * len(items)
    done = 0
    with cf.ThreadPoolExecutor(max_workers=8) as ex:
        futs = {ex.submit(work, it): idx for idx, it in enumerate(items)}
        for f in cf.as_completed(futs):
            idx = futs[f]
            results[idx] = f.result()
            done += 1
            if done % 25 == 0:
                print("progress", done, "/", len(items))
    errs = [r for r in results if r.get("error") or not r.get("prompt")]
    print("errors/empty:", len(errs))
    for r in errs[:10]:
        print("  -", r.get("slug"), "err" if r.get("error") else "no-body")
    clean = []
    for r in results:
        r.pop("error", None)
        clean.append(r)
    with open("prompts.json", "w", encoding="utf-8") as f:
        json.dump(clean, f, ensure_ascii=False)
    print("wrote prompts.json:", len(clean))


if __name__ == "__main__":
    main()
