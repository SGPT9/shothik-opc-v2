#!/usr/bin/env python3
"""Privacy gate for shaping's publish step.

Usage: python3 check-publish.py <draft-spec.md> <publish-text.md>

Checks the text about to be published against the privacy rules in
references/publish.md. Exit 0 means clear to show the user. Exit 1 lists
what must be fixed first. The human approval gate is not replaced by
this script, it runs before it.
"""
import re
import subprocess
import sys


def main() -> int:
    if len(sys.argv) != 3:
        print(__doc__.strip())
        return 2
    draft_path, publish_path = sys.argv[1], sys.argv[2]
    draft = open(draft_path, encoding='utf-8').read()
    publish = open(publish_path, encoding='utf-8').read()
    findings = []

    # 1. Private paths must not leak into public text.
    for pattern, label in [
        (r'\.issues/', 'draft-directory path (.issues/)'),
        (r'/Users/[^\s`)\]]+', 'local absolute path'),
        (r'/home/[^\s`)\]]+', 'local absolute path'),
        (r'[A-Za-z]:\\\\[^\s`)\]]+', 'local absolute path'),
    ]:
        for m in re.finditer(pattern, publish):
            line = publish.count('\n', 0, m.start()) + 1
            findings.append(f'line {line}: {label} leaked: {m.group(0)[:60]}')

    # 2. Publish text is rewritten, never pasted. Any long line copied
    #    verbatim from the draft is a paste, not a rewrite.
    draft_lines = {l.strip() for l in draft.splitlines() if len(l.strip()) >= 30}
    for i, line in enumerate(publish.splitlines(), 1):
        stripped = line.strip()
        if len(stripped) >= 30 and stripped in draft_lines and not stripped.startswith(('#', '|', '-')):
            findings.append(f'line {i}: verbatim draft line pasted, rewrite it: {stripped[:50]}…')

    # 3. The allowlist template must be complete (five sections, either language).
    section_aliases = [
        ('Problem', '问题'),
        ('Solution', '方案'),
        ('Acceptance', '验收'),
        ('Key decisions', '关键决策'),
        ('Out of scope', 'Out of Scope'),
    ]
    for en, zh in section_aliases:
        if en.lower() not in publish.lower() and zh not in publish:
            findings.append(f'template section missing: {en} / {zh}')

    # 4. Best-effort visibility probe: warn loudly when the target is public.
    try:
        vis = subprocess.run(
            ['gh', 'repo', 'view', '--json', 'visibility', '-q', '.visibility'],
            capture_output=True, text=True, timeout=10,
        )
        if vis.returncode == 0 and 'PUBLIC' in vis.stdout.upper():
            print('NOTE: target repo is PUBLIC. Everything below ships to the open internet.')
    except (FileNotFoundError, subprocess.TimeoutExpired):
        pass

    if findings:
        print('PUBLISH GATE FAIL')
        for f in findings:
            print(' -', f)
        return 1
    print('OK: publish text passed the privacy gate')
    return 0


if __name__ == '__main__':
    sys.exit(main())
