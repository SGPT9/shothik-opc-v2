#!/usr/bin/env bash
# Contract check: skills/ directories and distribution manifests must agree,
# and every version field in the repo must be identical.
set -euo pipefail
cd "$(dirname "$0")/.."

python3 - <<'EOF'
import json, os, sys

fail = []
skill_dirs = sorted(d for d in os.listdir('skills') if os.path.isdir(f'skills/{d}'))

manifests = ['.claude-plugin/marketplace.json', '.agents/plugins/marketplace.json']
versions = {}

for m in manifests:
    d = json.load(open(m))
    versions[f'{m}:metadata'] = d['metadata']['version']
    referenced = set()
    for pl in d['plugins']:
        versions[f"{m}:{pl['name']}"] = pl['version']
        for s in pl.get('skills', []):
            referenced.add(s.removeprefix('./skills/'))
    missing_in_manifest = set(skill_dirs) - referenced
    missing_on_disk = referenced - set(skill_dirs)
    if missing_in_manifest:
        fail.append(f'{m}: skills on disk but not referenced: {sorted(missing_in_manifest)}')
    if missing_on_disk:
        fail.append(f'{m}: referenced skills missing on disk: {sorted(missing_on_disk)}')

codex = json.load(open('.codex-plugin/plugin.json'))
versions['.codex-plugin/plugin.json'] = codex['version']

meta_desc = json.load(open('.claude-plugin/marketplace.json'))['metadata']['description']
short = codex['interface']['shortDescription']
if short not in meta_desc:
    fail.append(f'.codex-plugin/plugin.json: shortDescription drifted from marketplace metadata description: {short!r}')

if len(set(versions.values())) > 1:
    fail.append('version mismatch: ' + json.dumps(versions, indent=2))

for d in skill_dirs:
    if not os.path.isfile(f'skills/{d}/SKILL.md'):
        fail.append(f'skills/{d}: missing SKILL.md')

if fail:
    print('CONTRACT FAIL')
    for f in fail:
        print(' -', f)
    sys.exit(1)
print(f'OK: {len(skill_dirs)} skills consistent across {len(manifests)+1} manifests, version {next(iter(versions.values()))}')
EOF
