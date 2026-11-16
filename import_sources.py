"""Import MIT-licensed prompt libraries into the FRAME catalog.

Sources (cloned into external-sources/):
  xianyu110/awesome-minimax-h3-prompts  — 72 reconstructed H3 writing references
  flaqai/awesome-minimax-h3-video-prompts — 84 original H3 recipes
  kinovi-ai/awesome-seedance-2-5-prompts — 24 Seedance 2.5 cases
  liu-kaining/Awesome-Veo3-Prompts — 30 Veo 3 JSON prompts

Run: python import_sources.py
Merges into prompts.json / titles_zh.json / thumbs_ext.json, resolves thumbnails
(local preview copy -> remote poster download -> generated SVG slate), dedupes
against existing rows by source URL and prompt text, and is safe to re-run.
"""

import concurrent.futures
import json
import re
import shutil
import urllib.request
from html import escape
from pathlib import Path

BASE = Path(__file__).resolve().parent
SOURCES = BASE / "external-sources"
THUMBS = BASE / "thumbs"

FLAQAI_REPO = "https://github.com/flaqai/awesome-minimax-h3-video-prompts"

XIAN_CATEGORY = {
    "Animals": "animals",
    "Animation & Anime": "animation",
    "Camera Motion": "camera move",
    "Character & Performance": "character",
    "Cinematic": "cinematic story",
    "Dialogue & Sound": "character",
    "Product & Ads": "product commercial",
    "VFX & Transitions": "vfx",
    "Video Editing": "editing",
}

FLAQAI_CATEGORY = {
    "BRD": "brand film", "PRD": "product commercial", "UGC": "vlog",
    "TRV": "cinematic travel", "FNB": "food", "FSH": "fashion",
    "CIN": "cinematic story", "ANI": "animation", "ACT": "action",
    "VFX": "vfx", "DIG": "gameplay", "SOC": "comedy", "MUS": "music video",
    "EDU": "documentary", "ARC": "architecture", "MOB": "action",
    "NAT": "animals", "IND": "brand film", "EDT": "editing",
    "MRF": "camera move", "CHR": "character", "MOG": "motion graphics",
    "SRL": "viral short", "VER": "vlog",
}

FLAQAI_ZH = {
    "BRD-001": "午夜天文台茶饮发布", "BRD-002": "社区影院开幕之夜",
    "BRD-003": "一支广告，三种画幅", "PRD-001": "模块化徒步灯功能演示",
    "PRD-002": "陶瓷香薰机材质短片", "PRD-003": "电商旋转展示：几何不漂移",
    "UGC-001": "台灯真实初体验", "UGC-002": "阳台香草套装的周末日常",
    "UGC-003": "通勤斜挎包实装测试", "TRV-001": "雨后水乡清晨",
    "TRV-002": "火山岛民宿揭幕", "TRV-003": "第一人称夜市寻路",
    "FNB-001": "清晨面包房开酥过程", "FNB-002": "清汤面出餐",
    "FNB-003": "气泡草本茶微距广告", "FSH-001": "风洞眼镜时尚大片",
    "FSH-002": "矿物唇彩质地研究", "FSH-003": "四套造型织物转场",
    "CIN-001": "图书馆里未寄出的信", "CIN-002": "末班车站台告别",
    "CIN-003": "屋顶气象信号之谜", "ANI-001": "剪纸湿地食物网",
    "ANI-002": "黏土维修机器人捡到纽扣", "ANI-003": "水墨鱼化作城市电车",
    "ACT-001": "室内攀岩最后一跃", "ACT-002": "雨战赛道自行车过弯",
    "ACT-003": "一镜到底乒乓对拉", "VFX-001": "玻璃温室长出夜空",
    "VFX-002": "微缩集雨之城", "VFX-003": "星座长裙表演",
    "DIG-001": "专注计时器产品导览", "DIG-002": "电动自行车仪表模式",
    "DIG-003": "战术花园游戏背包", "SOC-001": "三个房间，一颗滚动的橙子",
    "SOC-002": "办公室植物悄悄占领", "SOC-003": "自助洗衣店的外星人",
    "MUS-001": "屋顶三重奏现场", "MUS-002": "多语种车站对唱",
    "MUS-003": "排练到舞台匹配剪辑", "MUS-004": "声音化形专辑循环",
    "EDU-001": "潮汐沼泽碳汇解说", "EDU-002": "文物故事：不做复原断言",
    "EDU-003": "车间安全规程：台钻安装", "EDU-004": "从微观世界到日常尺度",
    "ARC-001": "真实小户型导览", "ARC-002": "庭院咖啡馆晨昏研究",
    "ARC-003": "改造概念：前后对比边界", "ARC-004": "智能家居晚间序列",
    "MOB-001": "电动城市车内饰演示", "MOB-002": "载货自行车淋雨测试",
    "MOB-003": "夜卧列车服务", "MOB-004": "人行道配送机器人交接",
    "NAT-001": "城市狐狸黎明观察", "NAT-002": "老年犬雨衣试穿",
    "NAT-003": "阳台番茄生长日记", "NAT-004": "潮池微距田野笔记",
    "IND-001": "小批量装配流程", "IND-002": "冷链包裹之旅",
    "IND-003": "无障碍安全出口提示", "IND-004": "双语服务台迎宾",
    "EDT-001": "清空背景，保留主角", "EDT-002": "续写维修咖啡馆打烊一刻",
    "EDT-003": "产品教程本地化：无需重拍", "EDT-004": "办公室演示重打光，其余不变",
    "MRF-001": "一镜到底三生态博物馆轨道",
    "MRF-002": "放射软木音箱：迁移运动语法而非内容",
    "MRF-003": "四间工坊，一根铜线", "MRF-004": "野外净水器搭建：基于已验证参考",
    "CHR-001": "纸鸟筹备暴风雨", "CHR-002": "第一条新根",
    "CHR-003": "双语收音机维修交接", "CHR-004": "多出一餐：三人对手戏",
    "MOG-001": "夜市海报随节拍生长", "MOG-002": "模块化产品特性卡",
    "MOG-003": "文物剪影片头", "MOG-004": "材质样卡动态标识",
    "SRL-001": "地图隆起成山水", "SRL-002": "影子先完成",
    "SRL-003": "水洼先看见雨", "SRL-004": "一颗球，四种材质",
    "VER-001": "真实模块化饭盒直播演示", "VER-002": "错递的包裹，对的邻居",
    "VER-003": "一件工具，三次修车", "VER-004": "陶艺创作者回答一个真问题",
}


KINOVI_CATEGORY = {
    "First Screen": "cinematic story",
    "Reference Generation": "reference",
    "User Works": "viral short",
    "Video Editing": "editing",
}

VEO_CATEGORY = {
    "aerial_car_forest_night": "cinematic story",
    "alien_frog_spaceship_tour": "comedy",
    "amazon_box_studio_transformation": "brand film",
    "apple_airpods_explosive_reveal": "brand film",
    "apple_workspace_morning_reveal": "brand film",
    "bee_flight_kitchen_adventure": "animals",
    "ceramic_apple_asmr_slicing": "viral short",
    "chewy_backyard_pet_lounge": "brand film",
    "corona_beach_party_transformation": "brand film",
    "cosplayer_forest_greeting": "vlog",
    "doorbell_camera_drone_cat": "comedy",
    "fast_food_fighter_pixel_battle": "gameplay",
    "ferrari_holographic_assembly": "brand film",
    "hamster_museum_sprint_adventure": "animals",
    "jeep_expedition_crate_reveal": "brand film",
    "knight_dragon_volcanic_confrontation": "cinematic story",
    "lego_magic_spaceship_assembly": "brand film",
    "mega_waterslide_city_adventure": "action",
    "moroccan_tiktok_paris_vlog": "vlog",
    "muscle_car_watermelon_crash": "viral short",
    "nike_swoosh_particle_assembly": "brand film",
    "optimus_prime_desert_transformation": "action",
    "pixel_art_castle_adventure": "gameplay",
    "rooftop_queen_rap_performance": "music video",
    "sushi_explosion_kinetic_box": "food",
    "tesla_crate_magic_reveal": "brand film",
    "tesla_nature_pavilion_reveal": "brand film",
    "three_kingdoms_journalist_adventure": "viral short",
    "trojan_horse_selfie_adventure": "comedy",
    "winter_forest_spinning_joy": "cinematic story",
}

VEO_EN = {
    "aerial_car_forest_night": "Aerial Car Forest Night",
    "alien_frog_spaceship_tour": "Alien Frog Spaceship Tour",
    "amazon_box_studio_transformation": "Amazon Box Studio Transformation",
    "apple_airpods_explosive_reveal": "Apple AirPods Explosive Reveal",
    "apple_workspace_morning_reveal": "Apple Workspace Morning Reveal",
    "bee_flight_kitchen_adventure": "Bee Flight Kitchen Adventure",
    "ceramic_apple_asmr_slicing": "Ceramic Apple ASMR Slicing",
    "chewy_backyard_pet_lounge": "Chewy Backyard Pet Lounge",
    "corona_beach_party_transformation": "Corona Beach Party Transformation",
    "cosplayer_forest_greeting": "Cosplayer Forest Greeting",
    "doorbell_camera_drone_cat": "Doorbell Camera Drone Cat",
    "fast_food_fighter_pixel_battle": "Fast Food Fighter Pixel Battle",
    "ferrari_holographic_assembly": "Ferrari Holographic Assembly",
    "hamster_museum_sprint_adventure": "Hamster Museum Sprint Adventure",
    "jeep_expedition_crate_reveal": "Jeep Expedition Crate Reveal",
    "knight_dragon_volcanic_confrontation": "Knight Dragon Volcanic Confrontation",
    "lego_magic_spaceship_assembly": "LEGO Magic Spaceship Assembly",
    "mega_waterslide_city_adventure": "Mega Waterslide City Adventure",
    "moroccan_tiktok_paris_vlog": "Moroccan TikTok Paris Vlog",
    "muscle_car_watermelon_crash": "Muscle Car Watermelon Crash",
    "nike_swoosh_particle_assembly": "Nike Swoosh Particle Assembly",
    "optimus_prime_desert_transformation": "Optimus Prime Desert Transformation",
    "pixel_art_castle_adventure": "Pixel Art Castle Adventure",
    "rooftop_queen_rap_performance": "Rooftop Queen Rap Performance",
    "sushi_explosion_kinetic_box": "Sushi Explosion Kinetic Box",
    "tesla_crate_magic_reveal": "Tesla Crate Magic Reveal",
    "tesla_nature_pavilion_reveal": "Tesla Nature Pavilion Reveal",
    "three_kingdoms_journalist_adventure": "Three Kingdoms Journalist Adventure",
    "trojan_horse_selfie_adventure": "Trojan Horse Selfie Adventure",
    "winter_forest_spinning_joy": "Winter Forest Spinning Joy",
}

BADGES = {"MiniMax H3": "H3", "Seedance 2.5": "SD 2.5", "Veo 3": "VEO 3"}


def find_aspect(text):
    for match in re.finditer(r"(\d+(?:\.\d+)?):(\d+(?:\.\d+)?)", text):
        width, height = float(match.group(1)), float(match.group(2))
        if width > 0 and height > 0 and 0.2 <= width / height <= 5:
            return match.group(0)
    return ""


def norm_url(url):
    if not url:
        return ""
    # Keep the fragment: GitHub blob anchors identify individual recipes.
    url = url.split("?")[0].rstrip("/").lower()
    url = re.sub(r"^https?://(www\.|mobile\.)?(twitter\.com|x\.com)", "https://x.com", url)
    return url


def norm_text(text):
    return " ".join(text.lower().split())


def prompt_block(markdown):
    match = re.search(r"```text\s*\n(.*?)```", markdown, re.S)
    if not match:
        match = re.search(r"~~~~text\s*\n(.*?)~~~~", markdown, re.S)
    if not match:
        raise ValueError("No ```text prompt block found")
    return match.group(1).strip()


def parse_xianyu110():
    root = SOURCES / "xianyu110"
    gallery = {}
    zh_text = (root / "prompts" / "GALLERY.zh-CN.md").read_text(encoding="utf-8")
    for match in re.finditer(
        r"### \d+\.\s*(.+?)\s*\n+<a href=\"[^\"]*#prompt-([a-z0-9]+)\"><img src=\"([^\"]+)\"",
        zh_text,
    ):
        gallery[match.group(2)] = (match.group(1).strip(), match.group(3))
    rows = []
    for path in sorted((root / "prompts").glob("*/*.md")):
        text = path.read_text(encoding="utf-8")
        title = re.search(r"^# (.+)$", text, re.M).group(1).strip()
        category_raw = re.search(r"\*\*Category:\*\*\s*(.+)", text).group(1).strip()
        clip = re.search(r"\*\*Reference clip:\*\*\s*\[(@[^\]]+)\]\((https?://[^)]+)\)", text)
        gallery_id = re.search(r"#prompt-([a-z0-9]+)", text).group(1)
        prompt = prompt_block(text)
        duration = re.search(r"Duration:\s*([\d.]+)\s*seconds", prompt)
        aspect = re.search(r"Aspect ratio:\s*([\d.]+:[\d.]+)", prompt)
        if not aspect:
            aspect = re.search(r"\*\*Aspect ratio:\*\*\s*([\d.]+:[\d.]+)", text)
        zh_title, poster = gallery.get(gallery_id, ("", ""))
        if not zh_title:
            raise ValueError(f"No Chinese gallery title for {path.name} ({gallery_id})")
        rows.append({
            "slug": "xm-" + path.stem,
            "title": title,
            "title_zh": zh_title,
            "prompt": prompt,
            "category": XIAN_CATEGORY[category_raw],
            "model": "MiniMax H3",
            "duration": (duration.group(1) if duration else "15") + "s",
            "aspect": aspect.group(1) if aspect else "16:9",
            "author": clip.group(1) if clip else "@tryminimax",
            "source_link": clip.group(2) if clip else "",
            "url": f"https://tryminimax.asia/minimax-h3-prompts#prompt-{gallery_id}",
            "video": "",
            "poster": poster,
            "preview_file": root / "assets" / "previews" / f"{gallery_id}.webp",
            "source_label": "tryminimax.asia",
        })
    return rows


def parse_flaqai():
    root = SOURCES / "flaqai"
    gallery = {}
    asset_index = (root / "assets" / "README.md").read_text(encoding="utf-8")
    for match in re.finditer(r"gallery/([\w.-]+\.webp)[^\n]*?\[([A-Z]+-\d+)\]", asset_index):
        gallery[match.group(2)] = root / "assets" / "gallery" / match.group(1)
    rows = []
    for path in sorted((root / "prompts").glob("[0-9]*.md")):
        text = path.read_text(encoding="utf-8")
        sections = re.split(r"^## ([A-Z]+-\d+) (.+)$", text, flags=re.M)
        for index in range(1, len(sections), 3):
            recipe_id, title, body = sections[index], sections[index + 1].strip(), sections[index + 2]
            prompt = prompt_block(body)
            format_line = re.search(r"\*\*Format:\*\*\s*(.+)", body)
            format_text = format_line.group(1).strip().rstrip("\\").strip() if format_line else ""
            aspect = re.search(r"(\d+(?:\.\d+)?:\d+(?:\.\d+)?)", format_text)
            seconds = re.search(r"(\d+)(?:[–-](\d+))?\s*seconds", format_text)
            if not seconds:
                seconds = re.search(r"(\d+)-second", format_text)
            if seconds:
                value = max(int(g) for g in seconds.groups() if g)
            else:
                value = 10
            anchor = re.sub(r"[^a-z0-9 -]", "", f"{recipe_id} {title}".lower()).replace(" ", "-")
            blob = f"{FLAQAI_REPO}/blob/main/prompts/{path.name}#{anchor}"
            preview = gallery.get(recipe_id)
            rows.append({
                "slug": "fq-" + recipe_id.lower(),
                "title": title,
                "title_zh": FLAQAI_ZH[recipe_id],
                "prompt": prompt,
                "category": FLAQAI_CATEGORY[recipe_id.split("-")[0]],
                "model": "MiniMax H3",
                "duration": f"{value}s",
                "aspect": aspect.group(1) if aspect else "16:9",
                "author": "Flaq AI",
                "source_link": blob,
                "url": blob,
                "video": "",
                "poster": (f"https://raw.githubusercontent.com/flaqai/awesome-minimax-h3-video-prompts/main/assets/gallery/{preview.name}" if preview else ""),
                "preview_file": preview,
                "source_label": "Flaq AI · MIT",
            })
    return rows


def placeholder_svg(title, category, source_label, badge="H3"):
    words, lines, current = title.split(), [], ""
    for word in words:
        candidate = (current + " " + word).strip()
        if len(candidate) > 30 and current:
            lines.append(current)
            current = word
        else:
            current = candidate
        if len(lines) == 3:
            break
    if current and len(lines) < 3:
        lines.append(current)
    if len(lines) == 3 and len(" ".join(lines)) < len(title):
        lines[2] = lines[2][:27].rstrip() + "…"
    title_spans = "".join(
        f'<text x="40" y="{168 + i * 36}" class="t">{escape(line)}</text>'
        for i, line in enumerate(lines)
    )
    stripes = "".join(
        f'<rect x="{i * 40}" y="0" width="20" height="10" fill="#ffb454" opacity="0.85"/>'
        for i in range(16)
    )
    return f'''<svg xmlns="http://www.w3.org/2000/svg" width="640" height="360" viewBox="0 0 640 360">
<defs><linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
<stop offset="0" stop-color="#16202a"/><stop offset="1" stop-color="#0b1116"/>
</linearGradient></defs>
<style>.t{{font:600 26px 'Segoe UI',sans-serif;fill:#eaf4f6}}.s{{font:500 15px 'Segoe UI',sans-serif;fill:#8fa3ad;letter-spacing:2px}}</style>
<rect width="640" height="360" fill="url(#bg)"/>
<g>{stripes}</g>
<rect x="0" y="10" width="640" height="2" fill="#ffb454" opacity="0.35"/>
<text x="40" y="72" style="font:700 30px 'Segoe UI',sans-serif" fill="#ffb454">{escape(badge)}</text>
<text x="600" y="70" text-anchor="end" class="s">{escape(category.upper())}</text>
{title_spans}
<path d="M40 300 h24 M40 300 v-24 M600 300 h-24 M600 300 v-24" stroke="#5ad7f0" stroke-width="2" opacity="0.5" fill="none"/>
<text x="40" y="330" class="s">{escape(source_label.upper())}</text>
<text x="600" y="330" text-anchor="end" class="s">WRITING REFERENCE</text>
</svg>'''


def parse_kinovi():
    root = SOURCES / "kinovi"
    text = (root / "README.md").read_text(encoding="utf-8")
    zh_text = (root / "README_zh.md").read_text(encoding="utf-8")
    zh_titles = {}
    for match in re.finditer(r"^### No\. (\d+): (.+)$", zh_text, re.M):
        zh_titles[match.group(1)] = match.group(2).strip()
    section = text.split("## 🎬 All Prompts", 1)[1].split("## 🤝", 1)[0]
    parts = re.split(r"^### No\. (\d+): (.+)$", section, flags=re.M)
    rows = []
    for index in range(1, len(parts), 3):
        num, title, body = parts[index], parts[index + 1].strip(), parts[index + 2]
        prompt = re.search(r"```\s*\n(.*?)```", body, re.S).group(1).strip()
        image = re.search(r'<img src="(images/[^"]+)"', body).group(1)
        blog = re.search(r"\((https://kinovi\.ai/blogs/[^)]+)\)", body)
        category = re.search(r"\*\*Category:\*\*\s*(.+)", body).group(1).strip()
        seconds = re.search(r"(\d+)[-\s]seconds?", prompt)
        stem = Path(image).stem
        url = blog.group(1) if blog else f"https://github.com/kinovi-ai/awesome-seedance-2-5-prompts#{stem}"
        rows.append({
            "slug": "sd-" + stem,
            "title": title,
            "title_zh": zh_titles[num],
            "prompt": prompt,
            "category": KINOVI_CATEGORY[category],
            "model": "Seedance 2.5",
            "duration": (seconds.group(1) if seconds else "10") + "s",
            "aspect": find_aspect(prompt) or "16:9",
            "author": "kinovi.ai",
            # README cites one shared Volcano Ark promo page for every recipe;
            # the per-example blog anchor is the unique, recipe-level source.
            "source_link": url,
            "url": url,
            "video": "",
            "poster": f"https://raw.githubusercontent.com/kinovi-ai/awesome-seedance-2-5-prompts/main/{image}",
            "preview_file": root / image,
            "source_label": "kinovi.ai · MIT",
        })
    return rows


def parse_veo():
    root = SOURCES / "liu-kaining"
    rows = []
    for path in sorted((root / "prompts").glob("*.md")):
        stem = path.stem
        if stem not in VEO_EN:
            continue
        text = path.read_text(encoding="utf-8")
        zh_title = re.search(r"^# (.+)$", text, re.M).group(1).strip()
        zh_title = re.sub(r"视频提示词$", "", zh_title).strip()
        block = re.search(r"```json\s*\n(.*?)```", text, re.S)
        prompt = ""
        if block:
            try:
                prompt = json.dumps(json.loads(block.group(1)), ensure_ascii=False, indent=2)
            except json.JSONDecodeError:
                prompt = block.group(1).strip()
        if not prompt:
            block = re.search(r"```(?:text)?\s*\n(.*?)```", text, re.S)
            prompt = block.group(1).strip()
        seconds = re.search(r"(\d+)[-\s]seconds?", prompt)
        blob = f"https://github.com/liu-kaining/Awesome-Veo3-Prompts/blob/main/prompts/{path.name}"
        rows.append({
            "slug": "veo-" + stem.replace("_", "-"),
            "title": VEO_EN[stem],
            "title_zh": zh_title,
            "prompt": prompt,
            "category": VEO_CATEGORY[stem],
            "model": "Veo 3",
            "duration": (seconds.group(1) if seconds else "8") + "s",
            "aspect": find_aspect(prompt) or "16:9",
            "author": "liukaining",
            "source_link": blob,
            "url": blob,
            "video": "",
            "poster": "",
            "preview_file": None,
            "source_label": "liukaining · MIT",
        })
    return rows


def image_extension(data):
    if data[:3] == b"\xff\xd8\xff":
        return ".jpg"
    if data[:8] == b"\x89PNG\r\n\x1a\n":
        return ".png"
    if data[:4] == b"RIFF" and data[8:12] == b"WEBP":
        return ".webp"
    if data[:6] in (b"GIF87a", b"GIF89a"):
        return ".gif"
    return None


def download(url):
    request = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0 (compatible; FRAME-import)"})
    with urllib.request.urlopen(request, timeout=12) as response:
        return response.read()


def resolve_thumb(row, stats):
    slug = row["slug"]
    preview = row.get("preview_file")
    if preview and preview.is_file():
        ext = preview.suffix.lower()
        shutil.copyfile(preview, THUMBS / (slug + ext))
        stats["copied"] += 1
        return ext
    if row["poster"]:
        try:
            data = download(row["poster"])
            ext = image_extension(data)
            if ext:
                (THUMBS / (slug + ext)).write_bytes(data)
                stats["downloaded"] += 1
                return ext
        except Exception:
            pass
    (THUMBS / (slug + ".svg")).write_text(
        placeholder_svg(row["title"], row["category"], row["source_label"],
                        BADGES.get(row["model"], "AI")), encoding="utf-8"
    )
    stats["placeholder"] += 1
    return ".svg"


def dump_json(path, value):
    old = path.read_text(encoding="utf-8") if path.exists() else ""
    indent = 2 if old.startswith("[\n  ") or old.startswith("{\n  ") else None
    kwargs = {"ensure_ascii": False}
    if indent:
        kwargs["indent"] = indent
    else:
        kwargs["separators"] = (",", ":")
    path.write_text(json.dumps(value, **kwargs) + "\n", encoding="utf-8")


def main():
    rows = json.loads((BASE / "prompts.json").read_text(encoding="utf-8"))
    translations = json.loads((BASE / "titles_zh.json").read_text(encoding="utf-8"))
    thumbs_ext = json.loads((BASE / "thumbs_ext.json").read_text(encoding="utf-8"))

    seen_titles = list(dict.fromkeys(row["title"] for row in rows))
    if len(seen_titles) != len(translations):
        raise SystemExit("Existing titles/translations are out of sync; aborting")
    title_map = dict(zip(seen_titles, translations))
    seen_urls = {norm_url(row["source_link"]) for row in rows if row["source_link"]}
    seen_prompts = {norm_text(row["prompt"]) for row in rows}
    seen_slugs = {row["slug"] for row in rows}

    candidates = parse_xianyu110() + parse_flaqai() + parse_kinovi() + parse_veo()
    stats = {"copied": 0, "downloaded": 0, "placeholder": 0}
    added, skipped = [], {"duplicate": 0, "already": 0}
    for row in candidates:
        if row["slug"] in seen_slugs:
            skipped["already"] += 1
            continue
        if (row["source_link"] and norm_url(row["source_link"]) in seen_urls) or norm_text(row["prompt"]) in seen_prompts:
            skipped["duplicate"] += 1
            continue
        seen_slugs.add(row["slug"])
        if row["source_link"]:
            seen_urls.add(norm_url(row["source_link"]))
        seen_prompts.add(norm_text(row["prompt"]))
        added.append(row)

    with concurrent.futures.ThreadPoolExecutor(max_workers=8) as pool:
        extensions = list(pool.map(lambda row: resolve_thumb(row, stats), added))

    next_pos = max(row["pos"] for row in rows) + 1
    new_translations = []
    for row, ext in zip(added, extensions):
        thumbs_ext[row["slug"]] = ext
        if row["title"] not in title_map:
            title_map[row["title"]] = row["title_zh"]
            new_translations.append(row["title_zh"])
        rows.append({
            "pos": next_pos, "name": row["title"], "url": row["url"], "slug": row["slug"],
            "title": row["title"], "prompt": row["prompt"], "model": row["model"],
            "duration": row["duration"], "aspect": row["aspect"], "source": row["author"],
            "author": row["author"], "source_link": row["source_link"], "video": row["video"],
            "poster": row["poster"], "category": row["category"],
        })
        next_pos += 1

    dump_json(BASE / "prompts.json", rows)
    dump_json(BASE / "titles_zh.json", translations + new_translations)
    dump_json(BASE / "thumbs_ext.json", thumbs_ext)

    prefixes = {"xm-": "xianyu110", "fq-": "flaqai", "sd-": "kinovi", "veo-": "veo3"}
    counts = {name: sum(1 for r in added if r["slug"].startswith(p)) for p, name in prefixes.items()}
    print(f"Imported {len(added)} rows: " + " ".join(f"{k}={v}" for k, v in counts.items()))
    print(f"Skipped: {skipped['duplicate']} duplicates, {skipped['already']} already imported")
    print(f"Thumbnails: {stats['copied']} copied, {stats['downloaded']} downloaded, {stats['placeholder']} placeholders")
    print(f"Catalog total: {len(rows)} rows, {len(title_map)} unique titles")


if __name__ == "__main__":
    main()