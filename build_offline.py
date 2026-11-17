"""Build FRAME-studio-offline.zip: single-file page, launcher, NOTICE and all local thumbs."""
import json
import zipfile
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent
OUTPUT_NAME = "FRAME-studio-offline.zip"
EXTRA_FILES = ("video-prompt-studio.html", "start_studio.py", "NOTICE")


def main():
    rows = json.loads((BASE_DIR / "prompts.json").read_text(encoding="utf-8"))
    extensions = json.loads((BASE_DIR / "thumbs_ext.json").read_text(encoding="utf-8"))
    thumbs = ["thumbs/" + row["slug"] + extensions[row["slug"]] for row in rows]
    missing = [name for name in (*EXTRA_FILES, *thumbs) if not (BASE_DIR / name).is_file()]
    if missing:
        raise SystemExit("Build skipped; missing inputs: " + ", ".join(missing[:5]))
    output = BASE_DIR / OUTPUT_NAME
    with zipfile.ZipFile(output, "w", zipfile.ZIP_DEFLATED, compresslevel=6) as archive:
        for name in (*EXTRA_FILES, *thumbs):
            archive.write(BASE_DIR / name, name)
    with zipfile.ZipFile(output) as archive:
        bad = archive.testzip()
        if bad is not None:
            raise SystemExit(f"Archive CRC check failed: {bad}")
        entries = len(archive.namelist())
    print(f"Built {output.name} ({entries} entries, {output.stat().st_size / 1e6:.1f} MB)")


if __name__ == "__main__":
    main()