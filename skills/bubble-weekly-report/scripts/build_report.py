#!/usr/bin/env python3
"""Render user-supplied weekly evidence to a portable Markdown/HTML report."""
import argparse
from datetime import date
import hashlib
import html
import json
from pathlib import Path
import shutil

IMAGE_TYPES = {".png": b"\x89PNG\r\n\x1a\n", ".jpg": b"\xff\xd8", ".jpeg": b"\xff\xd8", ".webp": b"RIFF"}


def check_image(path):
    signature = IMAGE_TYPES.get(path.suffix.lower())
    if not path.is_file() or signature is None:
        raise ValueError(f"Evidence image is missing or unsupported: {path.name}")
    with path.open("rb") as handle:
        header = handle.read(12)
    if not header.startswith(signature) or (path.suffix.lower() == ".webp" and header[8:12] != b"WEBP"):
        raise ValueError(f"Image signature does not match: {path.name}")


def build(source, output):
    data = json.loads(source.read_text(encoding="utf-8"))
    start, end = (date.fromisoformat(data["period"][key]) for key in ("start", "end"))
    if start > end:
        raise ValueError("Period start must not be after end")
    items = data.get("items", [])
    if not items:
        raise ValueError("At least one evidence-backed work item is required")
    images = {}
    for item in items:
        when = date.fromisoformat(item["date"])
        if not start <= when <= end:
            raise ValueError(f"Item outside report period: {item['title']}")
        if not item.get("title") or not item.get("result") or not item.get("evidence"):
            raise ValueError("Every item needs a title, result, and evidence reference")
        for picture in item.get("images", []):
            if not picture.get("caption"):
                raise ValueError("Each image needs an evidence caption")
            path = (source.parent / picture["path"]).resolve()
            check_image(path)
            name = hashlib.sha256(path.read_bytes()).hexdigest()[:20] + path.suffix.lower()
            images[path] = "evidence/" + name
    if output.exists():
        raise ValueError("Output directory already exists; choose a new report directory")
    output.mkdir(parents=True)
    if images:
        (output / "evidence").mkdir()
        for path, relative in images.items():
            shutil.copyfile(path, output / relative)
    esc = lambda value: html.escape(str(value), quote=True)
    title = str(data.get("title") or f"周报 {start}—{end}")
    author = str(data.get("author") or "")
    md = [f"# {title}", "", f"{author} · {start}—{end}", "", "## 本周重点事项", ""]
    sections = [f"<h1>{esc(title)}</h1><p class='meta'>{esc(author)} · {start}—{end}</p><h2>本周重点事项</h2>"]
    for i, item in enumerate(items, 1):
        md.extend([f"### {i}. {item['title']}", "", str(item["result"]), "", f"证据：{item['evidence']}", ""])
        sections.append(f"<article><h3>{i}. {esc(item['title'])}</h3><p>{esc(item['result'])}</p><p class='meta'>证据：{esc(item['evidence'])}</p>")
        for picture in item.get("images", []):
            relative = images[(source.parent / picture["path"]).resolve()]
            caption = str(picture["caption"])
            alt = caption.replace("[", "(").replace("]", ")").replace("\n", " ")
            md.extend([f"![{alt}]({relative})", "", caption, ""])
            sections.append(f"<figure><img src='{relative}' alt='{esc(caption)}'><figcaption>{esc(caption)}</figcaption></figure>")
        sections.append("</article>")
    for key, heading in [("learnings", "本周学习思考"), ("next_week", "下周重点规划")]:
        md.extend([f"## {heading}", ""])
        values = data.get(key) or []
        sections.append(f"<h2>{heading}</h2>")
        if values:
            md.extend([f"- {value}" for value in values] + [""])
            sections.append("<ul>" + "".join(f"<li>{esc(value)}</li>" for value in values) + "</ul>")
        else:
            md.extend(["待补充", ""])
            sections.append("<p class='meta'>待补充</p>")
    document = "<!doctype html><html lang='zh-CN'><meta charset='utf-8'><meta name='viewport' content='width=device-width,initial-scale=1'>"
    document += f"<title>{esc(title)}</title><style>body{{font:17px/1.8 system-ui,sans-serif;max-width:920px;margin:48px auto;padding:0 24px;color:#20242a}}h1{{line-height:1.3}}h2{{margin-top:40px}}.meta,figcaption{{color:#66717d}}article{{border-bottom:1px solid #e5e7eb;padding-bottom:24px}}figure{{margin:24px 0}}img{{max-width:100%;height:auto;border-radius:12px}}figcaption{{font-size:14px}}@media print{{body{{margin:0}}article{{break-inside:avoid}}}}</style><body>"
    document += "".join(sections) + "</body></html>"
    (output / "weekly-report.md").write_text("\n".join(md), encoding="utf-8")
    (output / "weekly-report.html").write_text(document, encoding="utf-8")
    return {"items": len(items), "images": len(images), "output": str(output)}


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("source", type=Path)
    parser.add_argument("--out", type=Path, required=True)
    args = parser.parse_args()
    try:
        result = build(args.source.expanduser().resolve(), args.out.expanduser().resolve())
    except (ValueError, OSError, KeyError, TypeError) as exc:
        parser.exit(2, f"Error: {exc}\n")
    print(json.dumps(result, ensure_ascii=False))


if __name__ == "__main__":
    main()
