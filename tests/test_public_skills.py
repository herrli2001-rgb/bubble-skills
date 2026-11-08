"""Offline behavior checks with synthetic inputs and no live account access."""
import csv
import importlib.util
import json
import os
from pathlib import Path
import shutil
import struct
import subprocess
import sys
import tempfile
import unittest
import zlib

ROOT = Path(__file__).resolve().parents[1]


def load(module, relative):
    spec = importlib.util.spec_from_file_location(module, ROOT / relative)
    value = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(value)
    return value


def png(path, rgb=(30, 130, 210)):
    # A synthetic solid-color fixture, not a real product or private screenshot.
    def chunk(kind, data):
        return struct.pack("!I", len(data)) + kind + data + struct.pack("!I", zlib.crc32(kind + data) & 0xffffffff)
    path.write_bytes(b"\x89PNG\r\n\x1a\n" + chunk(b"IHDR", struct.pack("!2I5B", 8, 8, 8, 2, 0, 0, 0)) + chunk(b"IDAT", zlib.compress((b"\0" + bytes(rgb) * 8) * 8)) + chunk(b"IEND", b""))


class PublicSkillTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.work = Path(self.temp.name)

    def tearDown(self):
        self.temp.cleanup()

    def test_quote_identity_decimal_and_unchanged_price(self):
        module = load("quote_plan", "skills/bubble-product-followup/scripts/prepare_followup.py")
        examples = ROOT / "skills/bubble-product-followup/examples"
        result = module.prepare(examples / "quotes.csv", examples / "current.csv", examples / "pricing-policy.json", self.work / "plan")
        self.assertEqual(result["counts"], {"new": 1, "cost_changed": 1, "unchanged": 1})
        self.assertEqual(result["rows"][0]["proposed_retail"], "14.9")
        self.assertEqual(result["rows"][1]["proposed_retail"], "25.9")
        self.assertEqual(result["rows"][2]["proposed_retail"], "32.3")
        self.assertEqual(result["rows"][0]["sku"], "0002000000000001")
        self.assertTrue((self.work / "plan/followup-plan.csv").is_file())

    def test_quote_duplicate_and_bad_policy_do_not_write(self):
        module = load("quote_guard", "skills/bubble-product-followup/scripts/prepare_followup.py")
        examples = ROOT / "skills/bubble-product-followup/examples"
        rows = (examples / "quotes.csv").read_text(encoding="utf-8").splitlines()
        duplicate = self.work / "duplicate.csv"
        duplicate.write_text("\n".join(rows + [rows[1]]) + "\n", encoding="utf-8")
        with self.assertRaises(ValueError):
            module.prepare(duplicate, None, examples / "pricing-policy.json", self.work / "bad")
        self.assertFalse((self.work / "bad").exists())
        policy = self.work / "policy.json"
        policy.write_text(json.dumps({"mode": "margin", "target_margin": "1", "round_up_to": "0.1"}), encoding="utf-8")
        with self.assertRaises(ValueError):
            module.prepare(examples / "quotes.csv", None, policy, self.work / "bad")
        policy.write_text(json.dumps({"mode": "margin", "target_margin": "0.2", "round_up_to": "0.1"}), encoding="utf-8")
        result = module.prepare(examples / "quotes.csv", None, policy, self.work / "margin")
        self.assertEqual(result["rows"][0]["proposed_retail"], "15.5")

    def test_weekly_report_evidence_images_escape_and_period(self):
        module = load("weekly", "skills/bubble-weekly-report/scripts/build_report.py")
        data = json.loads((ROOT / "skills/bubble-weekly-report/examples/week.json").read_text(encoding="utf-8"))
        png(self.work / "sample.png")
        data["items"][0]["images"] = [{"path": "sample.png", "caption": "合成证据图"}]
        data["items"][0]["result"] = "<script>alert('test')</script>"
        source = self.work / "week.json"
        source.write_text(json.dumps(data, ensure_ascii=False), encoding="utf-8")
        result = module.build(source, self.work / "report")
        self.assertEqual(result["images"], 1)
        html = (self.work / "report/weekly-report.html").read_text(encoding="utf-8")
        self.assertNotIn("<script>", html)
        self.assertIn("&lt;script&gt;", html)
        self.assertEqual(len(list((self.work / "report/evidence").glob("*.png"))), 1)
        data["items"][0]["date"] = "2020-01-01"
        source.write_text(json.dumps(data), encoding="utf-8")
        with self.assertRaises(ValueError):
            module.build(source, self.work / "out-of-period")
        self.assertFalse((self.work / "out-of-period").exists())

    def test_gallery_copies_images_and_refuses_missing_reference(self):
        module = load("gallery", "skills/bubble-product-images/scripts/build_gallery.py")
        png(self.work / "reference.png")
        png(self.work / "main.png", (220, 170, 80))
        source = self.work / "manifest.json"
        data = {"product": "<示例>", "references": [{"path": "reference.png"}], "outputs": [{"slot": "main", "path": "main.png"}]}
        source.write_text(json.dumps(data), encoding="utf-8")
        module.build(source, self.work / "gallery")
        manifest = json.loads((self.work / "gallery/image-manifest.json").read_text(encoding="utf-8"))
        self.assertEqual(manifest["review_status"], "visual_review_required")
        self.assertTrue((self.work / "gallery" / manifest["references"][0]["path"]).is_file())
        self.assertIn("&lt;示例&gt;", (self.work / "gallery/ecommerce-gallery.html").read_text(encoding="utf-8"))
        data["references"][0]["path"] = "missing.png"
        source.write_text(json.dumps(data), encoding="utf-8")
        with self.assertRaises(ValueError):
            module.build(source, self.work / "missing")
        self.assertFalse((self.work / "missing").exists())

    def test_creator_initializes_and_validates_real_skill(self):
        scripts = ROOT / "skills/bubble-skill-creator/scripts"
        legacy_console = dict(os.environ, PYTHONIOENCODING="cp1252")
        result = subprocess.run([sys.executable, str(scripts / "init_skill.py"), "example-workflow", "--path", str(self.work / "技能目录")], capture_output=True, text=True, encoding="utf-8", env=legacy_console)
        self.assertEqual(result.returncode, 0, result.stderr)
        skill = self.work / "技能目录/example-workflow/SKILL.md"
        skill.write_text('---\nname: example-workflow\ndescription: 将用户提供的本地记录整理成有证据的汇总表。\n---\n\n# Example workflow\n\nRead the supplied records and preserve their source references.\n', encoding="utf-8")
        result = subprocess.run([sys.executable, str(scripts / "quick_validate.py"), str(skill.parent)], capture_output=True, text=True, encoding="utf-8", env=legacy_console)
        self.assertEqual(result.returncode, 0, result.stdout + result.stderr)
        result = subprocess.run([sys.executable, str(scripts / "init_skill.py"), "example-workflow", "--path", str(self.work / "技能目录")], capture_output=True, text=True, encoding="utf-8")
        self.assertNotEqual(result.returncode, 0)

    def test_installer_copies_all_skills_and_refuses_overwrite(self):
        command = [sys.executable, str(ROOT / "tools/install.py"), "--all", "--dest", str(self.work / "installed")]
        result = subprocess.run(command, capture_output=True, text=True, encoding="utf-8")
        self.assertEqual(result.returncode, 0, result.stderr)
        self.assertEqual(len(list((self.work / "installed").glob("*/SKILL.md"))), 7)
        result = subprocess.run(command, capture_output=True, text=True, encoding="utf-8")
        self.assertNotEqual(result.returncode, 0)

    def test_pixel_bootstrap_is_self_contained_and_refuses_overwrite(self):
        script = ROOT / "skills/bubble-pixel-video/scripts/bootstrap.py"
        command = [sys.executable, str(script), str(self.work / "pixel"), "--theme", "示例主题"]
        result = subprocess.run(command, capture_output=True, text=True, encoding="utf-8")
        self.assertEqual(result.returncode, 0, result.stderr)
        data = json.loads((self.work / "pixel/src/project.json").read_text(encoding="utf-8"))
        self.assertEqual(data["theme"], "示例主题")
        self.assertTrue((self.work / "pixel/package-lock.json").exists())
        result = subprocess.run(command, capture_output=True, text=True, encoding="utf-8")
        self.assertNotEqual(result.returncode, 0)

    @unittest.skipUnless(shutil.which("ffmpeg") and shutil.which("ffprobe"), "FFmpeg is not installed")
    def test_watch_extracts_real_frames_without_cloud_transcription(self):
        video = self.work / "synthetic.mp4"
        subprocess.run(["ffmpeg", "-v", "error", "-f", "lavfi", "-i", "testsrc2=size=160x120:rate=12", "-t", "2", "-c:v", "mpeg4", str(video)], check=True)
        result = subprocess.run([sys.executable, str(ROOT / "skills/bubble-watch/scripts/watch.py"), str(video), "--no-whisper", "--no-dedup", "--max-frames", "3", "--out-dir", str(self.work / "watch")], capture_output=True, text=True, encoding="utf-8", cwd=self.work, timeout=60)
        self.assertEqual(result.returncode, 0, result.stderr)
        frames = list((self.work / "watch/frames").glob("*.jpg"))
        self.assertGreater(len(frames), 0)
        self.assertLessEqual(len(frames), 3)
        for frame in frames:
            self.assertGreater(frame.stat().st_size, 100)


if __name__ == "__main__":
    unittest.main()
