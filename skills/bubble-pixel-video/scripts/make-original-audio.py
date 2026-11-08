#!/usr/bin/env python3
"""Deterministic original soft pixel pad and quiet swishes. No downloads."""
import argparse
import json
import math
from pathlib import Path
import random
import re
import struct
import wave

def write_wave(path, values, rate):
    path.parent.mkdir(parents=True, exist_ok=True)
    with wave.open(str(path), 'wb') as w:
        w.setnchannels(2); w.setsampwidth(2); w.setframerate(rate)
        w.writeframes(b''.join(struct.pack('<hh', int(max(-1,min(1,x))*32767), int(max(-1,min(1,x))*32767)) for x in values))

def main():
    parser=argparse.ArgumentParser()
    parser.add_argument('project',type=Path)
    args=parser.parse_args()
    root=args.project.expanduser().resolve()
    config_path=root/'src/project.json'
    config=json.loads(config_path.read_text(encoding="utf-8"))
    script=(root/'src/intro/script.ts').read_text(encoding="utf-8")
    source_frames={name:int(duration) for name,duration in re.findall(r'(\w+):\s*\{[^{}]*?duration:\s*(\d+)',script)}
    cursor=0; cues=[]
    for index,scene in enumerate(config['scenes']):
        if scene['id'] not in source_frames:
            parser.error('Cannot read literal scene duration. Update this helper for your schema before generating audio.')
        rate=scene['playbackRate']
        if rate<=0: parser.error('playbackRate must be positive')
        frames=math.floor(source_frames[scene['id']]/rate+0.5)
        cursor+=frames
        if index<len(config['scenes'])-1:
            transition=scene['transitionFrames']
            if transition>=frames: parser.error('Transition must be shorter than scene')
            cursor-=transition
            cues.append((cursor,transition))
    sr=48000; duration=cursor/30; count=cursor*(sr//30)
    # Original repeating C-add9 / A-minor7 / F-major7 / G-sus palette; no borrowed melody.
    chords=[(48,55,60,64,74),(45,52,57,60,67),(41,48,53,57,64),(43,50,55,60,62)]
    music=[0.0]*count
    for start in range(0,math.ceil(duration),4):
        notes=chords[(start//4)%len(chords)]
        for offset in range(min(int(4.5*sr),count-start*sr)):
            t=offset/sr
            env=min(t/.16,1)*min(max((4.5-t)/.8,0),1)
            value=0.0
            for note in notes:
                hz=440*2**((note-69)/12)
                value+=(math.sin(2*math.pi*hz*t)+.16*math.sin(2*math.pi*hz*3*t))/len(notes)
            music[start*sr+offset]+=value*env*.12
    for n in range(count):
        music[n]*=min(n/(sr*.15),1)*min((count-1-n)/sr,1)
    foley=[0.0]*count; rng=random.Random(170026)
    for frame,length in cues:
        state=0.0; size=length*(sr//30); start=frame*(sr//30)
        for n in range(size):
            state+=.12*(rng.uniform(-1,1)-state)
            if start+n<count: foley[start+n]+=state*.035*math.sin(math.pi*n/size)**2
    write_wave(root/'public/audio/original-pixel.wav',music,sr)
    write_wave(root/'public/audio/transition-foley.wav',foley,sr)
    config['musicFile']='audio/original-pixel.wav';config['foleyFile']='audio/transition-foley.wav'
    config_path.write_text(json.dumps(config,ensure_ascii=False,indent=2)+'\n', encoding="utf-8")
    meta={'method':'Original procedural sine harmonics, seed-stable swishes, no external samples','frames':cursor,'duration_seconds':duration,'rate':sr,'cue_frames':[f for f,_ in cues],'sample_peak':max(abs(v) for v in music),'title':'Soft pixel study'}
    (root/'public/audio/provenance.json').write_text(json.dumps(meta,indent=2)+'\n', encoding="utf-8")
    print(json.dumps(meta))

if __name__=='__main__': main()
