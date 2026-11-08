#!/usr/bin/env python3
"""Prepare a first/last-frame request locally; submit once, query, or download."""
import argparse
import base64
from datetime import datetime, timezone
import hashlib
import json
import mimetypes
from pathlib import Path
import os
import re
import sys
import urllib.error
import urllib.parse
import urllib.request

from video_tools import check_pair

ENDPOINT = 'https://ark.cn-beijing.volces.com/api/v3/contents/generations/tasks'
MAX_BODY = 60_000_000  # Conservative headroom below the documented 64 MB ceiling.


def write_new(path, data):
    target = Path(path).expanduser().resolve()
    target.parent.mkdir(parents=True, exist_ok=True)
    with target.open('x', encoding='utf-8') as stream:
        json.dump(data, stream, ensure_ascii=False, indent=2)
        stream.write('\n')
    return target


def timestamp():
    return datetime.now(timezone.utc).isoformat()


def encoded_image(path):
    image = Path(path).expanduser().resolve(strict=True)
    if image.stat().st_size >= 30_000_000:
        raise ValueError('Image is too large for this local Base64 helper; use a documented URL/asset workflow')
    mime = mimetypes.guess_type(image.name)[0]
    if not mime or not mime.startswith('image/'):
        raise ValueError('A supported image filename extension is required')
    return 'data:' + mime.lower() + ';base64,' + base64.b64encode(image.read_bytes()).decode('ascii')


def prepare(args):
    model = args.model.strip()
    if not model or not re.fullmatch(r'[A-Za-z0-9._:-]+', model):
        raise ValueError('Use an explicit model/endpoint ID verified for this account')
    if args.duration <= 0:
        raise ValueError('Set a positive integer duration; verify the chosen model limits first')
    prompt = Path(args.prompt_file).expanduser().read_text(encoding='utf-8').strip()
    if not prompt:
        raise ValueError('Prompt file is empty')
    pair = check_pair(args.first, args.last, args.ratio)
    if not pair['ok']:
        raise ValueError('; '.join(pair['errors']))
    for frame in (pair['first'], pair['last']):
        if frame and not (300 <= frame['width'] <= 6000 and 300 <= frame['height'] <= 6000):
            raise ValueError('Image dimensions are outside the documented 300–6000px range; prepare corrected copies')
    content = [dict(type='text', text=prompt),
               dict(type='image_url', image_url=dict(url=encoded_image(args.first)), role='first_frame')]
    if args.last:
        content.append(dict(type='image_url', image_url=dict(url=encoded_image(args.last)), role='last_frame'))
    payload = dict(model=model, content=content, duration=args.duration,
                   resolution=args.resolution, ratio=args.ratio,
                   generate_audio=args.audio, watermark=args.watermark)
    raw = json.dumps(payload, ensure_ascii=False, separators=(',', ':')).encode('utf-8')
    if len(raw) >= MAX_BODY:
        raise ValueError('Encoded request exceeds local 60MB headroom; use a documented URL/asset workflow')
    target = write_new(args.out, payload)
    return dict(payload=str(target), model=model, duration=args.duration,
                resolution=args.resolution, first_frame=pair['first']['path'],
                last_frame=pair['last']['path'] if pair['last'] else None,
                generate_audio=args.audio, watermark=args.watermark,
                request_bytes=len(raw), network_called=False)


class NoRedirect(urllib.request.HTTPRedirectHandler):
    def redirect_request(self, req, fp, code, msg, headers, newurl):
        raise ValueError('API redirect refused; verify the official endpoint')


def api(method, url, payload=None):
    key = os.environ.get('ARK_API_KEY', '').strip()
    if not key:
        raise ValueError('ARK_API_KEY is not set; preparation remains available without it')
    raw = None if payload is None else json.dumps(payload, ensure_ascii=False, separators=(',', ':')).encode('utf-8')
    request = urllib.request.Request(url, data=raw, method=method,
                                     headers={'Content-Type': 'application/json', 'Authorization': 'Bearer ' + key})
    opener = urllib.request.build_opener(NoRedirect())
    try:
        # Intentionally one request. A create timeout must never trigger a blind POST retry.
        with opener.open(request, timeout=45) as response:
            return json.load(response)
    except urllib.error.HTTPError as error:
        # Do not echo request/headers or arbitrary provider response text.
        raise RuntimeError(f'Provider HTTP {error.code}; retain this receipt and inspect the account before resubmission') from None
    except (urllib.error.URLError, TimeoutError) as error:
        raise RuntimeError('Network outcome is uncertain; do not repeat create automatically') from None


def submit(args):
    source = Path(args.payload).expanduser().resolve(strict=True)
    if source.stat().st_size >= MAX_BODY:
        raise ValueError('Payload exceeds local request limit')
    payload = json.loads(source.read_text(encoding='utf-8'))
    if not isinstance(payload, dict) or not payload.get('model') or not payload.get('content'):
        raise ValueError('Payload must include a model and content')
    if not os.environ.get('ARK_API_KEY', '').strip():
        raise ValueError('ARK_API_KEY is not set; no task was submitted')
    receipt = dict(state='submitting', started_at=timestamp(),
                   payload_file=str(source), payload_sha256=hashlib.sha256(source.read_bytes()).hexdigest(),
                   model=payload['model'])
    # An existing receipt blocks accidental repeat submission under the same version.
    target = write_new(args.receipt, receipt)
    try:
        response = api('POST', ENDPOINT, payload)
        if not isinstance(response, dict) or not isinstance(response.get('id'), str) or not response['id'].strip():
            raise RuntimeError('Create response has no usable task ID; outcome is uncertain, inspect existing tasks')
        receipt.update(state='submitted', task_id=response['id'], response=response, updated_at=timestamp())
    except Exception as error:
        receipt.update(state='uncertain', error=str(error), updated_at=timestamp())
        target.write_text(json.dumps(receipt, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
        raise
    target.write_text(json.dumps(receipt, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    return dict(receipt=str(target), task_id=response['id'], state='submitted')


def status(args):
    if not re.fullmatch(r'[A-Za-z0-9._-]+', args.task):
        raise ValueError('Invalid task ID')
    response = api('GET', ENDPOINT + '/' + urllib.parse.quote(args.task, safe=''))
    target = write_new(args.out, response)
    return dict(result=str(target), task_id=response.get('id', args.task),
                status=response.get('status'), usage=response.get('usage'), error=response.get('error'))


def download(args):
    result = json.loads(Path(args.result).expanduser().read_text(encoding='utf-8'))
    if result.get('status') != 'succeeded':
        raise ValueError('Only succeeded tasks can be downloaded')
    url = result.get('content', {}).get('video_url')
    if not isinstance(url, str) or urllib.parse.urlparse(url).scheme != 'https':
        raise ValueError('Succeeded result contains no HTTPS content.video_url')
    target = Path(args.out).expanduser().resolve()
    if target.exists():
        raise FileExistsError('Output already exists; use a new version filename')
    target.parent.mkdir(parents=True, exist_ok=True)
    partial = target.with_name(target.name + '.part')
    # No API Authorization header is sent to the media CDN.
    with partial.open('xb') as output:
        with urllib.request.urlopen(url, timeout=45) as response:
            while True:
                chunk = response.read(1024 * 1024)
                if not chunk:
                    break
                output.write(chunk)
    if partial.stat().st_size == 0:
        raise ValueError('Downloaded file is empty; partial file was retained')
    # Same-directory hard link refuses to overwrite a concurrent output.
    os.link(partial, target)
    partial.unlink()
    return dict(video=str(target), bytes=target.stat().st_size)


def main(argv=None):
    parser = argparse.ArgumentParser(description=__doc__)
    commands = parser.add_subparsers(dest='command', required=True)
    prep = commands.add_parser('prepare', help='Local request only; no API key or network required')
    prep.add_argument('--model', required=True)
    prep.add_argument('--first', required=True)
    prep.add_argument('--last')
    prep.add_argument('--prompt-file', required=True)
    prep.add_argument('--duration', type=int, required=True)
    prep.add_argument('--ratio', default='adaptive')
    prep.add_argument('--resolution', default='720p')
    prep.add_argument('--audio', action=argparse.BooleanOptionalAction, default=False)
    prep.add_argument('--watermark', action=argparse.BooleanOptionalAction, default=True)
    prep.add_argument('--out', required=True)
    create = commands.add_parser('submit', help='Creates a real paid task; first verify existing user authorization')
    create.add_argument('--payload', required=True)
    create.add_argument('--receipt', required=True)
    query = commands.add_parser('status', help='Query one existing task; does not create a new task')
    query.add_argument('--task', required=True)
    query.add_argument('--out', required=True)
    fetch = commands.add_parser('download', help='Download a succeeded result without forwarding API credentials')
    fetch.add_argument('--result', required=True)
    fetch.add_argument('--out', required=True)
    args = parser.parse_args(argv)
    try:
        output = {'prepare': prepare, 'submit': submit, 'status': status, 'download': download}[args.command](args)
        print(json.dumps(output, ensure_ascii=False, indent=2))
        return 0
    except (OSError, ValueError, RuntimeError) as error:
        print(json.dumps(dict(error=str(error)), ensure_ascii=False), file=sys.stderr)
        return 2


if __name__ == '__main__':
    if hasattr(sys.stdout, "reconfigure"):
        sys.stdout.reconfigure(encoding="utf-8")
    if hasattr(sys.stderr, "reconfigure"):
        sys.stderr.reconfigure(encoding="utf-8")
    sys.exit(main())
