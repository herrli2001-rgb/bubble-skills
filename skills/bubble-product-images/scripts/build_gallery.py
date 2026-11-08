#!/usr/bin/env python3
"""Package existing product/reference images into a local review gallery."""
import argparse
import hashlib
import html
import json
from pathlib import Path
import shutil

SLOTS = {"main": "主图", "feature": "卖点图", "lifestyle": "场景图"}
SIGNATURES = {".png": b"\x89PNG\r\n\x1a\n", ".jpg": b"\xff\xd8", ".jpeg": b"\xff\xd8", ".webp": b"RIFF"}


def build(source, output):
    data = json.loads(source.read_text(encoding="utf-8"))
    if not data.get("product") or not data.get("references") or not data.get("outputs"):
        raise ValueError("Manifest requires product, references, and outputs")
    slots = [item.get("slot") for item in data["outputs"]]
    if any(slot not in SLOTS for slot in slots) or len(set(slots)) != len(slots):
        raise ValueError("Output slots must be unique main/feature/lifestyle values")
    checked = []
    for group in ("references", "outputs"):
        for item in data[group]:
            path = (source.parent / item["path"]).resolve()
            signature = SIGNATURES.get(path.suffix.lower())
            if not path.is_file() or signature is None:
                raise ValueError(f"Missing or unsupported image: {path.name}")
            with path.open("rb") as handle:
                header = handle.read(12)
            if not header.startswith(signature) or (path.suffix.lower() == ".webp" and header[8:12] != b"WEBP"):
                raise ValueError(f"Image signature mismatch: {path.name}")
            relative = "images/" + hashlib.sha256(path.read_bytes()).hexdigest()[:20] + path.suffix.lower()
            checked.append((group, item, path, relative))
    if output.exists():
        raise ValueError("Output directory already exists; choose a new gallery directory")
    (output / "images").mkdir(parents=True)
    esc = lambda value: html.escape(str(value), quote=True)
    cards = {"references": [], "outputs": []}
    result = {"product": data["product"], "references": [], "outputs": [], "review_status": "visual_review_required"}
    for group, item, path, relative in checked:
        shutil.copyfile(path, output / relative)
        title = item.get("label") or SLOTS.get(item.get("slot"), "参考图")
        caption = item.get("caption") or ""
        cards[group].append(f"<figure><a href='{relative}'><img src='{relative}' alt='{esc(title)}' loading='lazy'></a><figcaption><b>{esc(title)}</b><p>{esc(caption)}</p></figcaption></figure>")
        result[group].append({**item, "path": relative})
    document = "<!doctype html><html lang='zh-CN'><meta charset='utf-8'><meta name='viewport' content='width=device-width,initial-scale=1'>"
    document += f"<title>{esc(data['product'])} · 图片审核</title><style>body{{font:16px/1.6 system-ui,sans-serif;max-width:1200px;margin:40px auto;padding:0 24px;color:#20242a}}.grid{{display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:24px}}figure{{margin:0;border:1px solid #e5e7eb;border-radius:16px;overflow:hidden}}img{{width:100%;aspect-ratio:1;object-fit:contain;background:#f7f7f8}}figcaption{{padding:16px}}.note{{color:#66717d}}</style><body>"
    document += f"<h1>{esc(data['product'])}</h1><p class='note'>先对照参考图检查商品一致性和卖点依据。此页面打包已有图片，不调用生图服务。</p><h2>参考图</h2><div class='grid'>"
    document += "".join(cards["references"]) + "</div><h2>待审核图片</h2><div class='grid'>" + "".join(cards["outputs"]) + "</div></body></html>"
    (output / "ecommerce-gallery.html").write_text(document, encoding="utf-8")
    (output / "image-manifest.json").write_text(json.dumps(result, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    return {"output": str(output), "references": len(result["references"]), "images": len(result["outputs"])}


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("manifest", type=Path)
    parser.add_argument("--out", type=Path, required=True)
    args = parser.parse_args()
    try:
        result = build(args.manifest.expanduser().resolve(), args.out.expanduser().resolve())
    except (ValueError, OSError, KeyError, TypeError) as exc:
        parser.exit(2, f"Error: {exc}\n")
    print(json.dumps(result, ensure_ascii=False))


if __name__ == "__main__":
    main()
