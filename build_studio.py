"""Build the standalone studio from local inputs without touching the legacy page."""

import json
import math
from pathlib import Path
import re
from fractions import Fraction


BASE_DIR = Path(__file__).resolve().parent
EXPECTED_RECORDS = 773
OUTPUT_NAME = "video-prompt-studio.html"
ASPECT_GROUPS = [
    "2.39:1", "2.35:1", "21:9", "1.85:1", "16:9", "3:2", "4:3",
    "5:4", "1:1", "4:5", "3:4", "2:3", "9:16", "9:21",
]
NUMBER_PATTERN = r"[0-9]+(?:\.[0-9]+)?"
SOURCE_FIELDS = (
    "slug", "title", "prompt", "category", "model", "duration", "aspect",
    "author", "source_link", "url", "video", "poster",
)
PLACEHOLDERS = (
    "<!-- STUDIO_STYLE -->", "<!-- STUDIO_DATA -->", "<!-- STUDIO_SCRIPT -->",
)
JSON_ESCAPES = str.maketrans({
    "<": r"\u003c", ">": r"\u003e", "&": r"\u0026",
    "\u2028": r"\u2028", "\u2029": r"\u2029",
})


def parse_duration(value):
    """Require a positive, finite number followed immediately by lowercase s."""
    if not isinstance(value, str) or not re.fullmatch(NUMBER_PATTERN + "s", value):
        raise ValueError(f"Invalid duration: {value!r}; expected a positive number + s")
    seconds = float(value[:-1])
    if not math.isfinite(seconds) or seconds <= 0:
        raise ValueError(f"Invalid duration: {value!r}; seconds must be finite and positive")
    return int(seconds) if seconds.is_integer() else seconds


def aspect_ratio(value):
    if not isinstance(value, str) or not re.fullmatch(
        NUMBER_PATTERN + ":" + NUMBER_PATTERN, value
    ):
        raise ValueError(f"Invalid aspect ratio: {value!r}")
    width, height = (Fraction(part) for part in value.split(":"))
    if width <= 0 or height <= 0:
        raise ValueError(f"Invalid aspect ratio: {value!r}; dimensions must be positive")
    return width / height


def classify_aspect(value):
    """Choose the nearest standard by abs(actual - standard) / standard.

    Exact labels win first; ties retain ASPECT_GROUPS order. Fractions make the
    inclusive 3% boundary exact. This classification never changes source aspect.
    """
    ratio = aspect_ratio(value)
    if value in ASPECT_GROUPS:
        return value
    distances = [
        (abs(ratio - aspect_ratio(group)) / aspect_ratio(group), group)
        for group in ASPECT_GROUPS
    ]
    distance, group = min(distances, key=lambda item: item[0])
    return group if distance <= Fraction(3, 100) else "other"


def normalize_category(value):
    if value is None:
        return "other"
    if not isinstance(value, str):
        raise ValueError(f"Invalid category: {value!r}")
    return re.sub(r"[\s\-\u2010-\u2015]+", " ", value).strip().lower() or "other"


def build_catalog(rows, translations, thumbs_ext, base_dir=BASE_DIR,
                  expected_count=EXPECTED_RECORDS):
    """Validate every row and map translations by first-seen unique title order."""
    if not isinstance(rows, list) or len(rows) != expected_count:
        raise ValueError(f"prompts.json must contain exactly {expected_count} records")
    if not isinstance(translations, list):
        raise ValueError("titles_zh.json must be a translation array")
    if not isinstance(thumbs_ext, dict):
        raise ValueError("thumbs_ext.json must be a slug-to-extension object")

    titles = {}
    ids = set()
    for index, row in enumerate(rows):
        if not isinstance(row, dict):
            raise ValueError(f"Record {index + 1} must be an object")
        missing = set(SOURCE_FIELDS) - row.keys()
        if missing:
            raise ValueError(f"Record {index + 1} missing fields: {sorted(missing)}")
        for field in SOURCE_FIELDS:
            if field != "category" and not isinstance(row[field], str):
                raise ValueError(f"Record {index + 1}: {field} must be a string")
        slug = row["slug"]
        if not re.fullmatch(r"[A-Za-z0-9_-]+", slug):
            raise ValueError(f"Invalid thumbnail slug: {slug!r}")
        if slug in ids:
            raise ValueError(f"Duplicate id: {slug}")
        ids.add(slug)
        if not row["title"].strip():
            raise ValueError(f"Empty title for {slug}")
        titles.setdefault(row["title"], None)

    if len(translations) != len(titles):
        raise ValueError(
            f"Translation length mismatch: {len(translations)} translations for "
            f"{len(titles)} unique titles"
        )
    if any(not isinstance(text, str) or not text.strip() for text in translations):
        raise ValueError("Every translation must be a non-empty string")
    title_map = dict(zip(titles, translations))

    catalog = []
    for row in rows:
        slug = row["slug"]
        extension = thumbs_ext.get(slug)
        if not isinstance(extension, str) or not re.fullmatch(r"\.[A-Za-z0-9]+", extension):
            raise ValueError(f"Missing or invalid thumbnail extension for {slug}")
        thumb = Path("thumbs") / (slug + extension)
        if not (Path(base_dir) / thumb).is_file():
            raise ValueError(f"Thumbnail file does not exist: {Path(base_dir) / thumb}")
        catalog.append({
            "id": slug,
            "title": row["title"],
            "title_zh": title_map[row["title"]],
            "prompt": row["prompt"],
            "category": normalize_category(row["category"]),
            "model": row["model"],
            "duration": row["duration"],
            "duration_seconds": parse_duration(row["duration"]),
            "aspect": row["aspect"],
            "aspect_group": classify_aspect(row["aspect"]),
            "author": row["author"],
            "source_link": row["source_link"],
            "url": row["url"],
            "video": row["video"],
            "poster": row["poster"],
            "thumb": thumb.as_posix(),
        })
    return catalog


def load_catalog(base_dir=BASE_DIR):
    base_dir = Path(base_dir)
    inputs = [
        json.loads((base_dir / name).read_text(encoding="utf-8"))
        for name in ("prompts.json", "titles_zh.json", "thumbs_ext.json")
    ]
    return build_catalog(*inputs, base_dir=base_dir)


CURATED_TOKEN = "/*__CURATED_IDS__*/[]"
CURATED_QUOTA = {"MiniMax H3": 84, "Seedance 2.5": 18, "Veo 3": 18}
CURATED_LIMIT = 120
CURATED_MIN_SCORE = 8.0
CURATED_MIN_LENGTH = 200
CAMERA_FAMILIES = (
    r"dolly|pan\b|tilt|crane|tracking|zoom|handheld|推轨|摇移|跟拍|环绕",
    r"close-?up|wide shot|medium shot|extreme|特写|全景|中景|远景",
    r"low angle|high angle|aerial|drone|over-the-shoulder|俯拍|仰拍|肩后",
    r"lens|\d+\s*mm|焦段|光圈",
)
LIGHT_PATTERN = r"golden hour|volumetric|backlit|rim light|neon|chiaroscuro|soft light|hard light|silhouette|candlelight|moonlight|sunlight|lighting|光线|逆光|霓虹|烛光|月光"
MOTION_PATTERN = r"slow motion|speed ramp|particles|fluid|splash|wind|rain|snow|smoke|fabric|motion|physics|慢动作|粒子|飞溅"
AUDIO_PATTERN = r"sound|audio|music|score|sfx|foley|voice|whisper|dialogue|soundscape|声音|音乐|音效|旁白"
STRUCT_PATTERN = r"(?m)^\s*(?:\*\*)?(scene|subject|camera|lighting|style|audio|sound|motion|action|environment|场景|主体|镜头|光线|风格|声音|运动|动作|环境)(?:\*\*)?\s*[:：]"


def quality_score(item):
    """Offline richness score: length, camera/light/motion/audio language, structure."""
    prompt = item.get("prompt", "")
    length = len(prompt)
    score = max(0.0, min(6.0, (min(length, 6000) - 150) / 1200 * 6))
    if length < CURATED_MIN_LENGTH:
        score -= 4
    if length > 9000:
        score -= 2
    if length > 14000:
        score -= 4
    score += 1.2 * sum(
        1 for family in CAMERA_FAMILIES if re.search(family, prompt, re.I)
    )
    for pattern, weight in ((LIGHT_PATTERN, 1.5), (MOTION_PATTERN, 1.0), (AUDIO_PATTERN, 1.0)):
        if re.search(pattern, prompt, re.I):
            score += weight
    sections = len(re.findall(STRUCT_PATTERN, prompt, re.I))
    score += 2 if sections >= 2 else (1 if sections == 1 else 0)
    if re.search(r"\d+\s*(mm|fps)", prompt, re.I):
        score += 0.5
    return round(score, 2)


def curated_order(catalog):
    """Score-ranked, model-quota'd, category/model-diverse default selection."""
    ranked = sorted(catalog, key=lambda item: (-quality_score(item), item.get("id", "")))
    used = {}
    picked = []
    for item in ranked:
        if len(picked) >= CURATED_LIMIT:
            break
        model = item.get("model", "")
        if used.get(model, 0) >= CURATED_QUOTA.get(model, 0):
            continue
        if quality_score(item) < CURATED_MIN_SCORE or len(item.get("prompt", "")) < CURATED_MIN_LENGTH:
            continue
        used[model] = used.get(model, 0) + 1
        picked.append(item)
    pool = list(picked)
    ordered = []
    recent_categories = []
    recent_models = []
    while pool:
        choice = None
        for index, item in enumerate(pool):
            if (item.get("category", "other") not in recent_categories[-3:]
                    and item.get("model", "") not in recent_models[-2:]):
                choice = index
                break
        if choice is None:
            for index, item in enumerate(pool):
                if item.get("category", "other") not in recent_categories[-2:]:
                    choice = index
                    break
        if choice is None:
            choice = 0
        item = pool.pop(choice)
        ordered.append(item.get("id", ""))
        recent_categories.append(item.get("category", "other"))
        recent_models.append(item.get("model", ""))
    return ordered


def script_safe_json(catalog):
    """Escape HTML-sensitive characters without changing decoded JSON values."""
    return json.dumps(catalog, ensure_ascii=False, allow_nan=False,
                      separators=(",", ":")).translate(JSON_ESCAPES)


def render_page(template, css, js, catalog):
    for marker in PLACEHOLDERS:
        if template.count(marker) != 1:
            raise ValueError(f"Template must contain exactly one {marker}")
    js = js.replace(CURATED_TOKEN, script_safe_json(curated_order(catalog)))
    replacements = dict(zip(PLACEHOLDERS, (
        f"<style>{css}</style>",
        '<script id="catalog-data" type="application/json">'
        + script_safe_json(catalog) + "</script>",
        f"<script>{js}</script>",
    )))
    # A single pass prevents marker-like strings inside inputs being replaced.
    pattern = "|".join(re.escape(marker) for marker in PLACEHOLDERS)
    return re.sub(pattern, lambda match: replacements[match.group(0)], template)


def main():
    required = [BASE_DIR / name for name in
                ("studio.template.html", "studio.css", "studio.js")]
    missing = [path.name for path in required if not path.is_file()]
    if missing:
        raise SystemExit("Build skipped; missing studio inputs: " + ", ".join(missing))
    catalog = load_catalog()
    template, css, js = (path.read_text(encoding="utf-8") for path in required)
    page = render_page(template, css, js, catalog)
    output = BASE_DIR / OUTPUT_NAME
    if output.is_symlink():
        raise ValueError("Refusing to overwrite a symlink as studio output")
    legacy = BASE_DIR / "minimax-h3-prompt-assistant.html"
    if legacy.exists() and output.exists() and output.samefile(legacy):
        raise ValueError("Studio output must not alias the legacy page")
    output.write_text(page, encoding="utf-8")
    print(f"Built {output} ({len(catalog)} records)")


if __name__ == "__main__":
    main()
