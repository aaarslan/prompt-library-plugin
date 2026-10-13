#!/usr/bin/env python3
"""Deterministic public-source ZIP. Runtime data and credentials are never packaged."""
import hashlib, json, pathlib, subprocess, zipfile
ROOT=pathlib.Path(__file__).resolve().parents[1]
subprocess.run(['node','scripts/audit-public-source.mjs'],cwd=ROOT,check=True)
SKIP={'node_modules','.git','.sites-runtime','.wrangler','.next','.vinext','dist','out','coverage','releases','.agents','.codex'}
files=[]
for directory, dirs, names in __import__('os').walk(ROOT):
 dirs[:]=sorted(d for d in dirs if d not in SKIP)
 for name in sorted(names):
  p=pathlib.Path(directory)/name
  if name.endswith('.tsbuildinfo') or name=='next-env.d.ts': continue
  if p.is_symlink(): raise SystemExit('Symlinks are not included: '+str(p.relative_to(ROOT)))
  files.append(p)
version=json.loads((ROOT/'package.json').read_text())['version']
out=ROOT/'releases';out.mkdir(exist_ok=True)
archive=out/f'prompt-library-source-v{version}.zip'
manifest=[]
with zipfile.ZipFile(archive,'w',compression=zipfile.ZIP_DEFLATED,compresslevel=9) as z:
 for p in sorted(files):
  data=p.read_bytes(); rel=p.relative_to(ROOT).as_posix()
  info=zipfile.ZipInfo('prompt-library/'+rel,date_time=(2026,1,1,0,0,0));info.compress_type=zipfile.ZIP_DEFLATED;info.external_attr=0o100644<<16
  z.writestr(info,data,compresslevel=9)
  manifest.append({'path':rel,'bytes':len(data),'sha256':hashlib.sha256(data).hexdigest()})
with zipfile.ZipFile(archive) as z:
 assert z.testzip() is None
 assert len(z.infolist())==len(files)
(out/'source-manifest.json').write_text(json.dumps(manifest,indent=2)+'\n')
sha=hashlib.sha256(archive.read_bytes()).hexdigest()
(out/'SHA256SUMS').write_text(f'{sha}  {archive.name}\n')
print(json.dumps({'archive':str(archive),'files':len(files),'bytes':archive.stat().st_size,'sha256':sha}))
