#!/usr/bin/env python3
"""Local diagnostics, first/last-frame checks, and evidence frame extraction."""
import argparse
from fractions import Fraction
import json
import math
from pathlib import Path
import os
import shutil
import subprocess
import sys


def run(command):
    result = subprocess.run(command, capture_output=True, text=True, encoding="utf-8")
    if result.returncode:
        raise ValueError(result.stderr.strip()[-2500:] or 'Media command failed')
    return result.stdout


def probe(path):
    source = Path(path).expanduser().resolve(strict=True)
    binary = shutil.which('ffprobe')
    if not binary:
        raise ValueError('ffprobe is required')
    data = json.loads(run([binary, '-v', 'error', '-show_streams', '-show_format',
                           '-of', 'json', str(source)]))
    stream = next((s for s in data.get('streams', []) if s.get('codec_type') == 'video'), None)
    if not stream or not stream.get('width') or not stream.get('height'):
        raise ValueError(f'No image/video dimensions: {source.name}')
    duration = data.get('format', {}).get('duration') or stream.get('duration') or 0
    rate = stream.get('avg_frame_rate') or stream.get('r_frame_rate') or '0/1'
    try:
        fps = float(Fraction(rate))
    except (ValueError, ZeroDivisionError):
        fps = 0.0
    return dict(path=str(source), width=stream['width'], height=stream['height'],
                duration=float(duration), fps=fps,
                has_audio=any(s.get('codec_type') == 'audio' for s in data.get('streams', [])),
                color_space=stream.get('color_space'),
                color_primaries=stream.get('color_primaries'),
                color_transfer=stream.get('color_transfer'),
                color_range=stream.get('color_range'))


def check_pair(first, last=None, ratio=None):
    start = probe(first)
    end = probe(last) if last else None
    errors = []
    if end and (start['width'], start['height']) != (end['width'], end['height']):
        errors.append('First and last frames must have identical pixel dimensions; prepare a corrected copy')
    if ratio and ratio != 'adaptive':
        try:
            width, height = map(float, ratio.split(':'))
            expected = width / height
        except (ValueError, ZeroDivisionError):
            raise ValueError('ratio must be positive W:H, or adaptive')
        if not math.isfinite(expected) or expected <= 0 or width <= 0 or height <= 0:
            raise ValueError('ratio must be positive W:H')
        actual = start['width'] / start['height']
        if abs(actual / expected - 1) > 0.01:
            errors.append(f'First-frame ratio {actual:.4f} differs from requested {ratio}')
    return dict(ok=not errors, first=start, last=end, requested_ratio=ratio,
                errors=errors, visual_review='not performed by this script')


def review_frames(source, out, fps, cuts):
    if not 0 < fps <= 2 or not math.isfinite(fps):
        raise ValueError('Sampling fps must be greater than 0 and no more than 2')
    meta = probe(source)
    if meta['duration'] <= 0:
        raise ValueError('A video with a known positive duration is required')
    binary = shutil.which('ffmpeg')
    if not binary:
        raise ValueError('ffmpeg is required')
    # Validate all cuts before creating output or running extraction.
    for point in cuts:
        if not math.isfinite(point) or not 0 <= point < meta['duration']:
            raise ValueError('Each cut must fall inside the video')
    target = Path(out).expanduser().resolve()
    target.mkdir(parents=True, exist_ok=False)
    run([binary, '-nostdin', '-hide_banner', '-loglevel', 'error',
         '-i', meta['path'], '-an', '-vf', f'fps={fps}',
         str(target / 'sample_%06d.png')])
    frames = [dict(file=path.name, timestamp_seconds=round(i / fps, 4),
                   timestamp_kind='approximate uniform sample', reason='uniform')
              for i, path in enumerate(sorted(target.glob('sample_*.png')))]
    frame_rate = meta['fps'] or 24.0
    end = max(0.0, meta['duration'] - 1 / frame_rate)
    exact = {0.0: 'first', end: 'last'}
    for point in cuts:
        for offset in range(-3, 4):
            moment = max(0.0, min(end, point + offset / frame_rate))
            exact[moment] = f'cut {point:g}s offset {offset} frames'
    for index, (moment, reason) in enumerate(sorted(exact.items())):
        image = target / f'detail_{index:04d}.png'
        run([binary, '-nostdin', '-hide_banner', '-loglevel', 'error',
             '-ss', f'{moment:.6f}', '-i', meta['path'], '-frames:v', '1', str(image)])
        if not image.exists():
            raise ValueError(f'Frame extraction produced no image near {moment:g}s')
        frames.append(dict(file=image.name, timestamp_seconds=round(moment, 6),
                           timestamp_kind='requested seek position', reason=reason))
    frames.sort(key=lambda frame: frame['timestamp_seconds'])
    manifest = dict(source=meta, sampling_fps=fps, frames=frames,
                    limitation='Inspect the images and play the movie; extraction alone is not a quality verdict. Cut offsets use average frame rate for variable-rate inputs.')
    (target / 'manifest.json').write_text(json.dumps(manifest, ensure_ascii=False, indent=2), encoding='utf-8')
    return dict(output=str(target), manifest=str(target / 'manifest.json'),
                frame_count=len(frames), width=meta['width'], height=meta['height'])


def main(argv=None):
    parser = argparse.ArgumentParser(description=__doc__)
    subs = parser.add_subparsers(dest='command', required=True)
    subs.add_parser('doctor', help='Report binaries and API-key presence without revealing credentials')
    pair = subs.add_parser('check-pair', help='Check image dimensions and optional delivery ratio')
    pair.add_argument('--first', required=True)
    pair.add_argument('--last')
    pair.add_argument('--ratio')
    review = subs.add_parser('review-frames', help='Extract full-resolution uniform samples and cut details')
    review.add_argument('video')
    review.add_argument('--out', required=True)
    review.add_argument('--fps', type=float, default=1.0)
    review.add_argument('--cuts', default='', help='Comma-separated cut times in seconds')
    args = parser.parse_args(argv)
    try:
        if args.command == 'doctor':
            result = dict(python=sys.version.split()[0],
                          binaries={name: shutil.which(name) for name in ('ffmpeg', 'ffprobe')},
                          ark_api_key_present=bool(os.environ.get('ARK_API_KEY', '').strip()),
                          seedance_model_id_present=bool(os.environ.get('SEEDANCE_MODEL_ID', '').strip()),
                          network_called=False)
        elif args.command == 'check-pair':
            result = check_pair(args.first, args.last, args.ratio)
        else:
            points = [float(value) for value in args.cuts.split(',') if value.strip()]
            result = review_frames(args.video, args.out, args.fps, points)
        print(json.dumps(result, ensure_ascii=False, indent=2))
        return 1 if result.get('ok') is False else 0
    except (OSError, ValueError, subprocess.SubprocessError) as error:
        print(json.dumps(dict(error=str(error)), ensure_ascii=False), file=sys.stderr)
        return 2


if __name__ == '__main__':
    if hasattr(sys.stdout, "reconfigure"):
        sys.stdout.reconfigure(encoding="utf-8")
    if hasattr(sys.stderr, "reconfigure"):
        sys.stderr.reconfigure(encoding="utf-8")
    sys.exit(main())
