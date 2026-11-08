"""Local behavioral checks. No provider is contacted and no paid task is created."""
import argparse
from contextlib import redirect_stdout
import io
import json
import os
from pathlib import Path
import shutil
import subprocess
import sys
import tempfile
import unittest
from unittest.mock import Mock, patch
import urllib.error

SKILL = Path(__file__).resolve().parents[1] / 'skills/xp-video-director'
sys.path.insert(0, str(SKILL / 'scripts'))
import seedance
import video_tools


@unittest.skipUnless(shutil.which("ffmpeg") and shutil.which("ffprobe"), "FFmpeg/ffprobe are required for media fixtures")
class SkillBehavior(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.temp = tempfile.TemporaryDirectory(prefix='xp-video-director-verify-')
        cls.root = Path(cls.temp.name)
        for name, size, color in [('first', '640x360', 'blue'), ('last', '640x360', 'green'), ('wrong', '360x640', 'red')]:
            subprocess.run(['ffmpeg', '-nostdin', '-hide_banner', '-loglevel', 'error',
                            '-f', 'lavfi', '-i', f'color=c={color}:s={size}',
                            '-frames:v', '1', str(cls.root / f'{name}.png')], check=True)
        cls.movie = cls.root / 'fixture.mp4'
        subprocess.run(['ffmpeg', '-nostdin', '-hide_banner', '-loglevel', 'error',
                        '-f', 'lavfi', '-i', 'testsrc2=size=640x360:rate=10',
                        '-t', '2', '-an', '-c:v', 'mpeg4', '-q:v', '4', str(cls.movie)], check=True)
        (cls.root / 'prompt.txt').write_text('蓝色场景中角色从画面左侧走入。', encoding='utf-8')

    @classmethod
    def tearDownClass(cls):
        cls.temp.cleanup()

    def output(self, name):
        return str(self.root / name)

    def prep_args(self, output, **changes):
        values = dict(model='test-model', first=self.output('first.png'), last=self.output('last.png'),
                      prompt_file=self.output('prompt.txt'), duration=5, ratio='16:9',
                      resolution='720p', audio=False, watermark=True, out=self.output(output))
        values.update(changes)
        return argparse.Namespace(**values)

    def test_matching_pair(self):
        result = video_tools.check_pair(self.output('first.png'), self.output('last.png'), '16:9')
        self.assertTrue(result['ok'])
        self.assertEqual(result['first']['width'], 640)
        self.assertEqual(result['visual_review'], 'not performed by this script')

    def test_mismatch_and_bad_ratio(self):
        self.assertFalse(video_tools.check_pair(self.output('first.png'), self.output('wrong.png'))['ok'])
        self.assertFalse(video_tools.check_pair(self.output('first.png'), ratio='9:16')['ok'])
        with self.assertRaises(ValueError):
            video_tools.check_pair(self.output('first.png'), ratio='0:0')

    def test_local_prepare_without_key_or_network(self):
        with patch.dict(os.environ, {'ARK_API_KEY': ''}), patch.object(seedance, 'api') as network:
            result = seedance.prepare(self.prep_args('request.json'))
        network.assert_not_called()
        self.assertFalse(result['network_called'])
        data = json.loads(Path(result['payload']).read_text(encoding="utf-8"))
        self.assertEqual([part.get('role') for part in data['content'][1:]], ['first_frame', 'last_frame'])
        self.assertTrue(data['content'][1]['image_url']['url'].startswith('data:image/png;base64,'))
        self.assertFalse(data['generate_audio'])

    def test_first_only_and_no_overwrite(self):
        args = self.prep_args('first-only.json', last=None)
        seedance.prepare(args)
        self.assertEqual(len(json.loads(Path(args.out).read_text(encoding="utf-8"))['content']), 2)
        with self.assertRaises(FileExistsError):
            seedance.prepare(args)

    def test_prepare_rejects_mismatch_before_output(self):
        args = self.prep_args('bad-request.json', last=self.output('wrong.png'))
        with self.assertRaises(ValueError):
            seedance.prepare(args)
        self.assertFalse(Path(args.out).exists())

    def test_submit_receipt_prevents_duplicate_post(self):
        request = seedance.prepare(self.prep_args('submit-request.json'))['payload']
        args = argparse.Namespace(payload=request, receipt=self.output('receipt.json'))
        with patch.dict(os.environ, {'ARK_API_KEY': 'test-value-not-a-real-key'}), \
             patch.object(seedance, 'api', return_value={'id': 'test-task'}) as network:
            self.assertEqual(seedance.submit(args)['task_id'], 'test-task')
            with self.assertRaises(FileExistsError):
                seedance.submit(args)
        self.assertEqual(network.call_count, 1)
        self.assertEqual(json.loads(Path(args.receipt).read_text(encoding="utf-8"))['state'], 'submitted')
        self.assertNotIn('test-value-not-a-real-key', Path(args.receipt).read_text(encoding="utf-8"))

    def test_uncertain_create_is_saved_without_retry(self):
        request = seedance.prepare(self.prep_args('uncertain-request.json'))['payload']
        args = argparse.Namespace(payload=request, receipt=self.output('uncertain-receipt.json'))
        with patch.dict(os.environ, {'ARK_API_KEY': 'test-value-not-a-real-key'}), \
             patch.object(seedance, 'api', side_effect=RuntimeError('Network outcome is uncertain')) as network:
            with self.assertRaises(RuntimeError):
                seedance.submit(args)
            with self.assertRaises(FileExistsError):
                seedance.submit(args)
        self.assertEqual(network.call_count, 1)
        self.assertEqual(json.loads(Path(args.receipt).read_text(encoding="utf-8"))['state'], 'uncertain')

    def test_missing_key_does_not_create_receipt(self):
        request = seedance.prepare(self.prep_args('keyless-request.json'))['payload']
        args = argparse.Namespace(payload=request, receipt=self.output('keyless-receipt.json'))
        with patch.dict(os.environ, {}, clear=True), patch.object(seedance, 'api') as network:
            with self.assertRaises(ValueError):
                seedance.submit(args)
        network.assert_not_called()
        self.assertFalse(Path(args.receipt).exists())

    def test_http_layer_does_not_retry_timeout(self):
        opener = Mock()
        opener.open.side_effect = urllib.error.URLError('timed out')
        with patch.dict(os.environ, {'ARK_API_KEY': 'test-value-not-a-real-key'}), \
             patch.object(seedance.urllib.request, 'build_opener', return_value=opener):
            with self.assertRaises(RuntimeError):
                seedance.api('POST', seedance.ENDPOINT, {'model': 'test-model', 'content': []})
        self.assertEqual(opener.open.call_count, 1)

    def test_status_queries_existing_id(self):
        response = dict(id='test-task', status='running', usage=None)
        args = argparse.Namespace(task='test-task', out=self.output('status.json'))
        with patch.object(seedance, 'api', return_value=response) as network:
            result = seedance.status(args)
        self.assertEqual(network.call_args.args, ('GET', seedance.ENDPOINT + '/test-task'))
        self.assertEqual(result['status'], 'running')

    def test_download_uses_media_url_without_api_auth(self):
        result = self.root / 'succeeded.json'
        result.write_text(json.dumps(dict(status='succeeded', content=dict(video_url='https://example.invalid/clip.mp4'))))
        args = argparse.Namespace(result=str(result), out=self.output('download.mp4'))
        with patch.object(seedance.urllib.request, 'urlopen', return_value=io.BytesIO(self.movie.read_bytes())) as network:
            downloaded = seedance.download(args)
        self.assertEqual(network.call_args.args, ('https://example.invalid/clip.mp4',))
        self.assertNotIn('headers', network.call_args.kwargs)
        self.assertEqual(video_tools.probe(downloaded['video'])['width'], 640)
        self.assertFalse(Path(args.out + '.part').exists())
        with self.assertRaises(FileExistsError):
            seedance.download(args)

    def test_review_extracts_native_frames_and_cut_neighbors(self):
        result = video_tools.review_frames(str(self.movie), self.output('review'), 1.0, [1.0])
        data = json.loads(Path(result['manifest']).read_text(encoding="utf-8"))
        self.assertEqual((result['width'], result['height']), (640, 360))
        self.assertEqual(len([frame for frame in data['frames'] if frame['reason'].startswith('cut ')]), 7)
        self.assertTrue(all((Path(result['output']) / frame['file']).exists() for frame in data['frames']))
        self.assertEqual(video_tools.probe(Path(result['output']) / data['frames'][0]['file'])['width'], 640)

    def test_invalid_cut_has_no_partial_output(self):
        output = self.output('invalid-review')
        with self.assertRaises(ValueError):
            video_tools.review_frames(str(self.movie), output, 1, [99])
        self.assertFalse(Path(output).exists())
