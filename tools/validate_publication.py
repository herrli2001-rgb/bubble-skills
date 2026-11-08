#!/usr/bin/env python3
"""Check distributable skill structure, references, and obvious private residue."""
from pathlib import Path
import re
import sys
import yaml

ROOT = Path(__file__).resolve().parents[1]
EXPECTED = {
    "bubble-watch", "bubble-skill-creator", "bubble-pixel-video",
    "bubble-product-followup", "bubble-weekly-report", "bubble-product-images",
}
PRIVATE_MARKERS = [
    r"/Users/[^/\s]+/(?:Documents|Pictures|Library)/",
    r"joyspace\.jd\.", r"(?:https?://)[^\s\"']*\.jd\.local",
    r"\b(?:sk|ghp|gho|github_pat)_[A-Za-z0-9_]{20,}",
    r"\bsk-[A-Za-z0-9_-]{24,}", r"-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----",
]


def validate():
    errors = []
    found = {p.name for p in (ROOT / "skills").iterdir() if p.is_dir()}
    if found != EXPECTED:
        errors.append(f"Skill set mismatch: {found}")
    for name in sorted(found):
        directory = ROOT / "skills" / name
        skill = directory / "SKILL.md"
        text = skill.read_text(encoding="utf-8")
        match = re.match(r"^---\n(.*?)\n---(?:\n|$)", text, re.S)
        if not match:
            errors.append(f"{name}: missing frontmatter")
            continue
        metadata = yaml.safe_load(match.group(1))
        if metadata.get("name") != name or not metadata.get("description"):
            errors.append(f"{name}: bad name or description")
        if not (directory / "LICENSE").is_file():
            errors.append(f"{name}: missing license")
    for path in ROOT.rglob("*"):
        if any(x in path.relative_to(ROOT).parts for x in (".git", "node_modules", "__pycache__", ".venv")):
            continue
        if path.is_symlink():
            errors.append(f"Symlink is not distributable: {path.relative_to(ROOT)}")
        if not path.is_file():
            continue
        relative = path.relative_to(ROOT)
        if path.name.startswith(".env") or path.suffix in (".bak", ".pyc", ".log"):
            errors.append(f"Excluded runtime file: {relative}")
        if path.stat().st_size > 25_000_000:
            errors.append(f"Unexpected large file: {relative}")
        if path.suffix.lower() not in (".py", ".md", ".json", ".yaml", ".yml", ".ts", ".tsx", ".mjs", ".csv", ".txt"):
            continue
        content = path.read_text(encoding="utf-8")
        if path != Path(__file__).resolve():
            for pattern in PRIVATE_MARKERS:
                if re.search(pattern, content):
                    errors.append(f"Private marker {pattern!r} in {relative}")
        if path.suffix == ".md":
            # Code fences may illustrate hypothetical skill layouts and links.
            prose = re.sub(r"^```[^\n]*\n.*?^```[^\n]*$", "", content, flags=re.S | re.M)
            for link in re.findall(r"\]\(([^)]+)\)", prose):
                if "://" in link or link.startswith(("#", "/")) or "<" in link:
                    continue
                target = link.split("#", 1)[0]
                if target and not (path.parent / target).exists():
                    errors.append(f"Missing Markdown target {link!r} in {relative}")
    if errors:
        print("\n".join(errors), file=sys.stderr)
        return 1
    print(f"Publication checks passed: {len(found)} skills")
    return 0


if __name__ == "__main__":
    raise SystemExit(validate())
