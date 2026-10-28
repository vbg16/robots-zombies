#!/usr/bin/env python3
"""Validate a delivered PROT-0001 walk folder; does not approve animation/art."""
import argparse, hashlib, json, sys
from pathlib import Path
from PIL import Image

def validate(folder):
    folder=Path(folder); errors=[]; frames=[]; manifest={}
    try:
        manifest=json.loads((folder/'manifest.json').read_text())
        if not isinstance(manifest,dict): raise ValueError('object required')
    except Exception as exc:
        return {'status':'FAIL','errors':['manifest.json: '+str(exc)],'frames':[], 'visual_review':'NOT_EVALUATED'}
    w,h=manifest.get('width'),manifest.get('height')
    valid_size=all(type(v) is int and v>2 for v in (w,h))
    if not valid_size: errors.append('width/height must be integers > 2')
    pivot=manifest.get('pivot',{})
    if not isinstance(pivot,dict) or not valid_size or not all(type(pivot.get(k)) is int and 0<=pivot[k]<bound for k,bound in [('x',w),('y',h)]):
        errors.append('pivot must be shared and within the frame')
    entries=manifest.get('frames',[])
    if not isinstance(entries,list): entries=[]
    if len(entries)!=8: errors.append('Exactly 8 manifest frames required')
    pngs=list(folder.glob('*.png'))
    if {p.name for p in pngs}!={f'{i:02}.png' for i in range(8)}: errors.append('Folder must contain exactly 00.png through 07.png')
    for i,entry in enumerate(entries):
        name=f'{i:02}.png'
        if not isinstance(entry,dict) or entry.get('file')!=name or entry.get('ms')!=100:
            errors.append(f'Frame {i}: expected {name}, ms=100')
            continue
        try:
            path=folder/name
            with Image.open(path) as check:
                if check.format!='PNG': errors.append(name+': not PNG')
                check.verify()
            with Image.open(path) as im:
                im.load()
                if im.mode!='RGBA': errors.append(name+': requires native RGBA'); continue
                if im.size!=(w,h): errors.append(name+': inconsistent dimensions')
                alpha=im.getchannel('A'); hist=alpha.histogram(); box=alpha.getbbox()
                if not box: errors.append(name+': empty frame')
                if not hist[0]: errors.append(name+': no fully transparent pixels')
                if sum(hist[1:255]): errors.append(name+': intermediate alpha; needs documented exception and review')
                if box and (box[0]<1 or box[1]<1 or box[2]>im.width-1 or box[3]>im.height-1):
                    errors.append(name+': missing one-pixel transparent margin')
                frames.append({'file':name,'size':list(im.size),'bbox':box,'sha256':hashlib.sha256(path.read_bytes()).hexdigest()})
        except Exception as exc: errors.append(name+': unreadable/corrupt: '+str(exc))
    return {'status':'CHECKS_PASSED_REVIEW_PENDING' if not errors else 'FAIL','errors':errors,'frames':frames,
            'duration_ms':sum(e.get('ms',0) for e in entries if isinstance(e,dict) and type(e.get('ms')) is int),
            'visual_review':'NOT_EVALUATED',
            'remaining':['orientation, palette and baked background','actual shared foot alignment','limb alternation and weight transfer','loop continuity','real game scale, light/dark scenes','10-cycle evidence and in-game transitions']}
if __name__=='__main__':
    parser=argparse.ArgumentParser(); parser.add_argument('folder'); args=parser.parse_args()
    report=validate(args.folder); print(json.dumps(report,ensure_ascii=False,indent=2))
    sys.exit(1 if report['errors'] else 0)
