#!/usr/bin/env python3
"""Copy the self-contained starter; initialize theme and poster titles safely."""
import argparse
import json
from pathlib import Path
import shutil

def split_title(theme):
    if len(theme) <= 6:
        return [theme, ""]
    middle = (len(theme) + 1) // 2
    return [theme[:middle], theme[middle:]]

def main():
    p = argparse.ArgumentParser()
    p.add_argument('destination', type=Path)
    p.add_argument('--theme', required=True)
    p.add_argument('--landscape-lines', help='Two lines separated by |; review semantic line breaks')
    p.add_argument('--portrait-lines', help='Two lines separated by |; independent portrait layout')
    args = p.parse_args()
    dest = args.destination.expanduser().resolve()
    if dest.exists():
        p.error('Destination already exists. Adapt that project in place or choose a new path.')
    titles = {}
    for key, value in [('landscapeTitleLines', args.landscape_lines), ('portraitTitleLines', args.portrait_lines)]:
        lines = value.split('|') if value else split_title(args.theme)
        if len(lines) != 2:
            p.error('This starter has two title rows. Pass two lines, or edit the cover layout for more rows.')
        titles[key] = lines
    source = Path(__file__).resolve().parents[1] / 'assets/starter'
    shutil.copytree(source, dest)
    config_path = dest / 'src/project.json'
    config = json.loads(config_path.read_text(encoding="utf-8"))
    config.update({'theme': args.theme, **titles})
    config_path.write_text(json.dumps(config, ensure_ascii=False, indent=2) + '\n', encoding="utf-8")
    (dest/'brief.json').write_text(json.dumps({
        'theme': args.theme,
        'status': 'Starter initialized; replace sample scene narration, thoughts, pressure lines, actors and props before final delivery.',
        'deliverables': ['out/video.mp4','out/cover-landscape.png','out/cover-portrait.png'],
        'cover_in_video': False,
    }, ensure_ascii=False, indent=2)+'\n', encoding="utf-8")
    print(json.dumps({'project':str(dest),'next':'Adapt the sample content, npm ci, generate or add audio, npm run lint, npm run render:all.'},ensure_ascii=False))

if __name__ == '__main__':
    import sys
    if hasattr(sys.stdout, "reconfigure"):
        sys.stdout.reconfigure(encoding="utf-8")
    main()
