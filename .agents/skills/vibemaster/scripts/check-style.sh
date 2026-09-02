#!/usr/bin/env bash
# Style check: mechanical guards for the expression-style disciplines.
# 1. Banned terms — jargon purged by audits must never return (the ratchet:
#    model audits find terms, this list keeps them out forever).
# 2. No semicolons in prose (rules/punctuation.md) — code blocks and inline
#    code are exempt.
set -euo pipefail
cd "$(dirname "$0")/.."
export LC_ALL=C.UTF-8 2>/dev/null || export LC_ALL=en_US.UTF-8

python3 - <<'EOF'
import glob, re, sys

BANNED = ['助产', '接生', '曳光弹', '爆炸半径', '接骨', '立案', '回填']

targets = sorted(
    set(glob.glob('skills/**/*.md', recursive=True))
    | set(glob.glob('rules/*.md'))
    | set(glob.glob('docs/*.md'))
    | set(glob.glob('README*.md'))
)

fail = []
for path in targets:
    in_fence = False
    for lineno, line in enumerate(open(path, encoding='utf-8'), 1):
        if line.lstrip().startswith('```'):
            in_fence = not in_fence
            continue
        if in_fence:
            continue
        prose = re.sub(r'`[^`]*`', '', line)
        for term in BANNED:
            if term in prose:
                fail.append(f'{path}:{lineno}: banned term 「{term}」')
        if ';' in prose or '；' in prose:
            fail.append(f'{path}:{lineno}: semicolon in prose')
        if any(d in prose for d in ('\u2013', '\u2014', '\u2015')):
            fail.append(f'{path}:{lineno}: dash in prose')

if fail:
    print('STYLE FAIL')
    for f in fail:
        print(' -', f)
    sys.exit(1)
print(f'OK: {len(targets)} files style-checked')
EOF
