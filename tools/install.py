#!/usr/bin/env python3
"""Install selected Bubble skills without overwriting existing skills."""
import argparse
from pathlib import Path
import shutil


def main():
    root = Path(__file__).resolve().parents[1] / "skills"
    names = sorted(p.name for p in root.iterdir() if (p / "SKILL.md").is_file())
    parser = argparse.ArgumentParser(description=__doc__)
    choice = parser.add_mutually_exclusive_group(required=True)
    choice.add_argument("--list", action="store_true")
    choice.add_argument("--all", action="store_true")
    choice.add_argument("--skill", action="append", choices=names)
    parser.add_argument("--dest", type=Path, default=Path.home() / ".codex" / "skills")
    args = parser.parse_args()
    if args.list:
        print("\n".join(names))
        return
    selected = names if args.all else list(dict.fromkeys(args.skill))
    destination = args.dest.expanduser().resolve()
    for name in selected:
        if (destination / name).exists():
            parser.exit(2, f"Refusing to overwrite existing skill: {destination / name}\n")
    destination.mkdir(parents=True, exist_ok=True)
    for name in selected:
        shutil.copytree(root / name, destination / name, ignore=shutil.ignore_patterns("__pycache__", "*.pyc", "node_modules"))
        print(f"Installed {name}")


if __name__ == "__main__":
    main()
