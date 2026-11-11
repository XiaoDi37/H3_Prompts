"""Run with: python -B -m unittest discover -s <this directory> -p test_studio_build.py -v"""

import json
from pathlib import Path
import unittest
from unittest.mock import patch

import build_studio as studio


class StudioBuildTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.base = Path(__file__).resolve().parent
        cls.rows, cls.translations, cls.extensions = [
            json.loads((cls.base / name).read_text(encoding="utf-8"))
            for name in ("prompts.json", "titles_zh.json", "thumbs_ext.json")
        ]
        cls.catalog = studio.load_catalog()

    def test_all_standard_aspects_match_exactly(self):
        for aspect in studio.ASPECT_GROUPS:
            with self.subTest(aspect=aspect):
                self.assertEqual(studio.classify_aspect(aspect), aspect)

    def test_aspect_approximation_and_other(self):
        cases = {
            "7:4": "16:9", "32:18": "16:9", "40:17": "2.35:1",
            "239:100": "2.39:1", "9:5": "16:9", "45:68": "2:3",
            "103:100": "1:1", "10301:10000": "other", "8:9": "other",
        }
        for aspect, expected in cases.items():
            with self.subTest(aspect=aspect):
                self.assertEqual(studio.classify_aspect(aspect), expected)

    def test_invalid_aspects_raise(self):
        for aspect in (None, "", "16/9", "16:0", "0:9", "-16:9", "nan:1"):
            with self.subTest(aspect=aspect), self.assertRaises(ValueError):
                studio.classify_aspect(aspect)

    def test_duration_sorting_is_numeric(self):
        values = ["15s", "5s", "108s", "7.5s"]
        self.assertEqual(sorted(values, key=studio.parse_duration),
                         ["5s", "7.5s", "15s", "108s"])
        self.assertEqual(studio.parse_duration("0.25s"), 0.25)
        for row in self.catalog:
            self.assertIsInstance(row["duration_seconds"], (int, float))
            self.assertGreater(row["duration_seconds"], 0)
            self.assertEqual(row["duration_seconds"], float(row["duration"][:-1]))

    def test_invalid_durations_raise(self):
        invalid = (None, 15, "", "0s", "0.0s", "-1s", "NaNs", "infs",
                   "15", "15 s", "15S", " 15s", "15s\n", "1e3s", "9" * 400 + "s")
        for duration in invalid:
            with self.subTest(duration=duration), self.assertRaises(ValueError):
                studio.parse_duration(duration)

    def test_category_normalization(self):
        self.assertEqual(studio.normalize_category("  cinematic--story\t "),
                         "cinematic story")
        self.assertEqual(studio.normalize_category("music\u2011video"), "music video")
        self.assertEqual(studio.normalize_category(None), "other")
        self.assertEqual(studio.normalize_category(""), "other")
        for row in self.catalog:
            self.assertNotIn("-", row["category"])
            self.assertEqual(row["category"], " ".join(row["category"].split()))

    def test_translation_length_must_match_in_both_directions(self):
        for translations in (self.translations[:-1], self.translations + ["extra"]):
            with self.subTest(length=len(translations)):
                with self.assertRaisesRegex(ValueError, "Translation length mismatch"):
                    studio.build_catalog(self.rows, translations, self.extensions)

    def test_empty_translation_rejected(self):
        with self.assertRaisesRegex(ValueError, "non-empty string"):
            studio.build_catalog(self.rows, [""] + self.translations[1:], self.extensions)

    def test_550_coverage_and_first_seen_title_mapping(self):
        self.assertEqual(len(self.catalog), 550)
        self.assertEqual(len({row["id"] for row in self.catalog}), 550)
        unique_titles = list(dict.fromkeys(row["title"] for row in self.rows))
        self.assertEqual(len(unique_titles), 505)
        self.assertEqual(len(self.translations), 505)
        title_map = dict(zip(unique_titles, self.translations))
        for source, record in zip(self.rows, self.catalog):
            self.assertEqual(record["id"], source["slug"])
            self.assertEqual(record["title_zh"], title_map[source["title"]])
            for field in ("title", "prompt", "model", "duration", "aspect", "author",
                          "source_link", "url", "video", "poster"):
                self.assertEqual(record[field], source[field])
            expected_thumb = "thumbs/" + source["slug"] + self.extensions[source["slug"]]
            self.assertEqual(record["thumb"], expected_thumb)
            self.assertTrue((self.base / record["thumb"]).is_file())
        self.assertEqual(json.loads(studio.script_safe_json(self.catalog)), self.catalog)

    def test_exact_catalog_schema(self):
        fields = {"id", "title", "title_zh", "prompt", "category", "model", "duration",
                  "duration_seconds", "aspect", "aspect_group", "author", "source_link",
                  "url", "video", "poster", "thumb"}
        for row in self.catalog:
            self.assertEqual(set(row), fields)

    def test_wrong_record_count_rejected(self):
        with self.assertRaisesRegex(ValueError, "exactly 550"):
            studio.build_catalog(self.rows[:-1], self.translations, self.extensions)

    def test_duplicate_id_rejected(self):
        duplicate = dict(self.rows[1], slug=self.rows[0]["slug"])
        with self.assertRaisesRegex(ValueError, "Duplicate id"):
            studio.build_catalog([self.rows[0], duplicate] + self.rows[2:],
                                 self.translations, self.extensions)

    def test_missing_thumbnail_mapping_rejected(self):
        with self.assertRaisesRegex(ValueError, "thumbnail extension"):
            studio.build_catalog(self.rows, self.translations, {})

    def test_missing_thumbnail_file_rejected(self):
        with patch.object(Path, "is_file", return_value=False):
            with self.assertRaisesRegex(ValueError, "Thumbnail file does not exist"):
                studio.build_catalog(self.rows, self.translations, self.extensions)

    def test_safe_script_embedding_round_trip(self):
        catalog = [{"prompt": "</script><script>alert('x')</script>&\u2028\u2029中文"}]
        payload = studio.script_safe_json(catalog)
        for char, escaped in (("<", r"\u003c"), (">", r"\u003e"), ("&", r"\u0026"),
                              ("\u2028", r"\u2028"), ("\u2029", r"\u2029")):
            self.assertNotIn(char, payload)
            self.assertIn(escaped, payload)
        self.assertEqual(json.loads(payload), catalog)
        template = "\n".join(studio.PLACEHOLDERS)
        page = studio.render_page(template, "body {}", "void 0;", catalog)
        self.assertEqual(page.count("<script"), 2)
        self.assertEqual(page.count("</script>"), 2)
        self.assertIn('<script id="catalog-data" type="application/json">'
                      + payload + "</script>", page)
        self.assertIn("<style>body {}</style>", page)
        self.assertIn("<script>void 0;</script>", page)

    def test_template_markers_are_unique_and_not_recursively_replaced(self):
        template = "\n".join(studio.PLACEHOLDERS)
        css = "/* <!-- STUDIO_SCRIPT --> */"
        page = studio.render_page(template, css, "void 0;", [])
        self.assertIn("<style>" + css + "</style>", page)
        for marker in studio.PLACEHOLDERS:
            for invalid in (template.replace(marker, ""), template + marker):
                with self.subTest(marker=marker), self.assertRaisesRegex(
                    ValueError, "exactly one"
                ):
                    studio.render_page(invalid, "", "", [])

    def test_missing_assets_skip_build_without_writing(self):
        with patch.object(Path, "is_file", return_value=False):
            with patch.object(Path, "write_text") as write:
                with self.assertRaisesRegex(SystemExit, "Build skipped"):
                    studio.main()
                write.assert_not_called()


if __name__ == "__main__":
    unittest.main()
