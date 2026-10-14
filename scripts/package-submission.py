#!/usr/bin/env python3
"""Build an isolated portable upload; refuse incomplete materials unless --draft."""
import argparse
import hashlib
import json
import pathlib
import re
import struct
import urllib.parse
import zipfile
import zlib

ROOT = pathlib.Path(__file__).resolve().parents[1]

def unique_object(pairs):
    result = {}
    for key, value in pairs:
        if key in result:
            raise ValueError(f"Duplicate JSON key: {key}")
        result[key] = value
    return result

def read_json(path):
    return json.loads(path.read_text(), object_pairs_hook=unique_object)

def https_url(value):
    if not isinstance(value, str) or len(value) > 1024:
        return False
    url = urllib.parse.urlsplit(value)
    return url.scheme == 'https' and bool(url.hostname) and not url.username and not url.password and not url.fragment

def png_dimensions(data):
    if data[:8] != b'\x89PNG\r\n\x1a\n' or len(data) > 5 * 1024 * 1024:
        raise SystemExit('Icons must be PNG and at most 5 MiB.')
    offset, chunks, compressed = 8, [], bytearray()
    while offset < len(data):
        if offset + 12 > len(data):
            raise SystemExit('Truncated PNG chunk.')
        length = struct.unpack('>I', data[offset:offset + 4])[0]
        kind = data[offset + 4:offset + 8]
        end = offset + 12 + length
        if end > len(data) or zlib.crc32(data[offset + 4:end - 4]) != struct.unpack('>I', data[end - 4:end])[0]:
            raise SystemExit('Invalid PNG chunk or checksum.')
        payload = data[offset + 8:end - 4]
        if kind == b'IHDR':
            if chunks or length != 13:
                raise SystemExit('Invalid PNG header.')
            width, height, depth, color, compression, filtering, interlace = struct.unpack('>IIBBBBB', payload)
        elif kind == b'IDAT':
            if b'IHDR' not in chunks or (b'IDAT' in chunks and chunks[-1] != b'IDAT'):
                raise SystemExit('Invalid PNG image-data order.')
            compressed.extend(payload)
        elif kind == b'IEND':
            if length or end != len(data):
                raise SystemExit('Invalid PNG end marker.')
        elif kind[0] & 32 == 0 and kind != b'PLTE':
            raise SystemExit('Unsupported critical PNG chunk.')
        chunks.append(kind)
        offset = end
    if not chunks or chunks[0] != b'IHDR' or chunks[-1] != b'IEND' or not compressed:
        raise SystemExit('Incomplete PNG.')
    depths = {0: (1, 2, 4, 8, 16), 2: (8, 16), 3: (1, 2, 4, 8), 4: (8, 16), 6: (8, 16)}
    if not (0 < width <= 4096 and 0 < height <= 4096) or depth not in depths.get(color, ()) or compression or filtering or interlace not in (0, 1):
        raise SystemExit('Invalid PNG image format or dimensions.')
    if color == 3 and b'PLTE' not in chunks:
        raise SystemExit('Indexed PNG needs a palette.')
    channels = {0: 1, 2: 3, 3: 1, 4: 2, 6: 4}[color]
    passes = [(0, 0, 1, 1)] if not interlace else [(0, 0, 8, 8), (4, 0, 8, 8), (0, 4, 4, 8), (2, 0, 4, 4), (0, 2, 2, 4), (1, 0, 2, 2), (0, 1, 1, 2)]
    rows = []
    for x, y, dx, dy in passes:
        columns, lines = max(0, (width - x + dx - 1) // dx), max(0, (height - y + dy - 1) // dy)
        if columns and lines:
            rows.extend([1 + (columns * channels * depth + 7) // 8] * lines)
    expected = sum(rows)
    decoder = zlib.decompressobj()
    try:
        pixels = decoder.decompress(compressed, expected + 1)
    except zlib.error:
        raise SystemExit('Invalid PNG compressed pixels.')
    if len(pixels) != expected or not decoder.eof or decoder.unused_data:
        raise SystemExit('Invalid PNG pixel-data length.')
    position = 0
    for size in rows:
        if pixels[position] > 4:
            raise SystemExit('Invalid PNG row filter.')
        position += size
    return width, height

parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument('--endpoint', required=True, help='Verified, existing HTTPS MCP endpoint; never a token URL')
parser.add_argument('--metadata', type=pathlib.Path, default=ROOT / 'docs/submission-metadata.draft.json')
parser.add_argument('--output', type=pathlib.Path, default=ROOT / 'releases')
parser.add_argument('--draft', action='store_true', help='Produce an explicitly incomplete preparation archive')
args = parser.parse_args()
if not https_url(args.endpoint) or urllib.parse.urlsplit(args.endpoint).query:
    raise SystemExit('The existing endpoint must be HTTPS without credentials, query, or fragment.')
manifest = read_json(args.metadata)
manifest.pop('$comment', None)
manifest['$schema'] = 'https://agent-plugins.org/schemas/1.0.0/plugin.schema.json'
manifest.update(license='MIT', repository='https://github.com/aaarslan/prompt-library-plugin')
if manifest.get('version') != read_json(ROOT / 'package.json')['version']:
    raise SystemExit('Package and source versions differ.')
if not re.fullmatch(r'[a-z0-9]+(?:[.-][a-z0-9]+)*', manifest.get('name', '')):
    raise SystemExit('Invalid portable plugin name.')
if not re.fullmatch(r'\d+\.\d+\.\d+', manifest.get('version', '')):
    raise SystemExit('An explicit semantic version is required.')
openai = manifest['extensions']['com.openai']
if manifest.get('apps') is not None or openai.get('apps') is not None:
    raise SystemExit('Public uploads must not declare app bindings.')
listing = openai['interface']
for field, limit in [('displayName', 30), ('shortDescription', 30), ('developerName', 80), ('longDescription', 4000)]:
    value = listing.get(field)
    if not isinstance(value, str) or not value.strip() or len(value) > limit:
        raise SystemExit(f'Invalid listing field: {field}')
prompts = listing.get('defaultPrompt', [])
normalized = [' '.join(value.split()) for value in prompts]
if len(prompts) > 3 or len(set(normalized)) != len(prompts) or any(not value.strip() or len(value) > 128 or '\n' in value or '\r' in value or '@' in value for value in prompts):
    raise SystemExit('Invalid suggested prompts.')
gaps = []
for field in ['websiteURL', 'supportURL', 'privacyPolicyURL', 'termsOfServiceURL']:
    value = listing.get(field)
    if not value:
        gaps.append(f'Missing verified public {field}')
    elif not https_url(value):
        raise SystemExit(f'Invalid HTTPS listing URL: {field}')
review = openai['review']
if type(review.get('commerce')) is not bool:
    raise SystemExit('Declare commerce as a boolean.')
if review['commerce'] and not review.get('commerce_description'):
    raise SystemExit('Describe the actual commerce behavior.')
cases = review['test_cases']
for kind, minimum in [('positive', 5), ('negative', 3)]:
    if len(cases.get(kind, [])) != minimum:
        raise SystemExit(f'Exactly {minimum} {kind} review cases are required for initial MCP review.')
    for case in cases[kind]:
        fields = ['description', 'prompt'] + (['tools_triggered', 'expected_behavior'] if kind == 'positive' else [])
        if any(not isinstance(case.get(field), str) or not case[field].strip() for field in fields):
            raise SystemExit(f'Incomplete {kind} review case.')
if not review.get('demo_recording_url'):
    gaps.append('Missing verified recording URL accessible to reviewers')
elif not https_url(review['demo_recording_url']):
    raise SystemExit('The demo recording needs a real HTTPS URL.')
publication = openai['publication']
if not publication.get('release_notes') or not isinstance(publication.get('countries'), list):
    raise SystemExit('Release notes and explicit country targeting are required.')
files = {}
for field, minimum in [('logo', 256), ('composerIcon', 48), ('logoDark', 256), ('composerIconDark', 48)]:
    rel = listing.get(field)
    if not rel and field.endswith('Dark'):
        continue
    if not isinstance(rel, str) or not rel.startswith('./assets/') or '\\' in rel or '..' in pathlib.PurePosixPath(rel).parts:
        raise SystemExit(f'Invalid contained icon path: {field}; use ./assets/...')
    relative = pathlib.PurePosixPath(rel).as_posix()
    path = ROOT / relative
    if any(parent.is_symlink() for parent in [path, *path.parents]) or not path.is_file() or not path.resolve().is_relative_to(ROOT):
        raise SystemExit('Icons must be contained regular files.')
    data = path.read_bytes()
    width, height = png_dimensions(data)
    if width != height or width < minimum:
        raise SystemExit(f'Invalid dimensions for {field}: {width} x {height}')
    files[relative] = data

mcp = {
    '$schema': 'https://agent-plugins.org/schemas/1.0.0/mcp.schema.json',
    'mcpServers': {
        'prompt-library': {
            'type': 'streamable-http',
            'url': args.endpoint,
            'extensions': {'com.openai': {'auth': {'type': 'oauth'}}},
        },
    },
}
# No client-registration mode, client secret, access token, or private App ID is inferred.
files['plugin.json'] = (json.dumps(manifest, indent=2, ensure_ascii=False) + '\n').encode()
files['mcp.json'] = (json.dumps(mcp, indent=2) + '\n').encode()
files['LICENSE'] = (ROOT / 'LICENSE').read_bytes()
if gaps and not args.draft:
    raise SystemExit('Submission materials are incomplete:\n- ' + '\n- '.join(gaps))
args.output.mkdir(parents=True, exist_ok=True)
name = f"prompt-library-v{manifest['version']}-{'preparation' if gaps else 'submission'}.zip"
archive = args.output / name
with zipfile.ZipFile(archive, 'w', compression=zipfile.ZIP_DEFLATED) as z:
    for rel, data in sorted(files.items()):
        info = zipfile.ZipInfo(rel, date_time=(2026, 1, 1, 0, 0, 0))
        info.compress_type = zipfile.ZIP_DEFLATED
        info.external_attr = 0o100644 << 16
        z.writestr(info, data, compresslevel=9)
# Inspect the archive itself, including all JSON files and icon bytes.
with zipfile.ZipFile(archive) as z:
    assert z.testzip() is None
    assert set(z.namelist()) == set(files)
    assert all(z.read(rel) == data for rel, data in files.items())
    assert not any(path.endswith('.app.json') or path.startswith('.') for path in z.namelist())
    for rel in ['plugin.json', 'mcp.json']:
        actual = json.loads(z.read(rel), object_pairs_hook=unique_object)
        assert 'apps' not in actual and actual.get('extensions', {}).get('com.openai', {}).get('apps') is None
    assert 'headers' not in mcp['mcpServers']['prompt-library']
report = {
    'archive': archive.name,
    'sha256': hashlib.sha256(archive.read_bytes()).hexdigest(),
    'files': sorted(files),
    'package_materials_complete': not gaps,
    'ready_for_review_submission': False,
    'preparation_gaps': gaps,
    'required_online_verification': [
        'Verify contents and unauthenticated access for every listing URL and recording URL',
        'Reuse the canonical Sites App and preserve portal-generated bindings; do not create a duplicate App',
        'Verify the exact deployed source version, authenticated ChatGPT interactions, and reviewer access',
        'Inspect the imported metadata, selected publisher identity, country targeting, and required portal scans',
        'The owner completes identity verification and legal/policy attestations',
    ],
}
(args.output / 'submission-readiness.json').write_text(json.dumps(report, indent=2) + '\n')
(args.output / (name + '.sha256')).write_text(f"{report['sha256']}  {name}\n")
print(json.dumps(report, indent=2))
