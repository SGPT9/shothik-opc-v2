#!/usr/bin/env bash
set -euo pipefail

fail=0
count=0

for dir in skills/*/; do
  [[ -f "$dir/SKILL.md" ]] || continue
  count=$((count + 1))
  dirname=$(basename "$dir")
  fm=$(awk 'NR==1 && $0!="---"{exit 1} NR>1 && $0=="---"{exit} NR>1{print}' "$dir/SKILL.md") || {
    echo "FAIL $dirname: no frontmatter"
    fail=1
    continue
  }
  name=$(printf '%s\n' "$fm" | awk '/^name:/{sub(/^name:[[:space:]]*/, ""); print; exit}')
  desc=$(printf '%s\n' "$fm" | awk '/^description:/{sub(/^description:[[:space:]]*/, ""); print; exit}')
  if [[ "$name" != "$dirname" ]]; then
    echo "FAIL $dirname: name '$name' != directory name"
    fail=1
  fi
  if [[ -z "$desc" ]]; then
    echo "FAIL $dirname: empty description"
    fail=1
  elif ! (printf '%s' "$desc" | grep -q '[a-zA-Z]' && printf '%s' "$desc" | python3 -c 'import sys;sys.exit(0 if any("\u4e00"<=c<="\u9fff" for c in sys.stdin.read()) else 1)'); then
    echo "FAIL $dirname: description not bilingual"
    fail=1
  elif printf '%s' "$desc" | grep -q ': ' && [[ "${desc:0:1}" != '"' && "${desc:0:1}" != "'" ]]; then
    echo "FAIL $dirname: unquoted description contains ': ' (breaks strict YAML parsers, e.g. npx skills)"
    fail=1
  fi
done


# Every English document must have a Chinese translation twin, and no orphans.
while IFS= read -r f; do
  twin="${f%.md}.zh-CN.md"
  if [[ ! -f "$twin" ]]; then
    echo "FAIL $f: missing translation twin"
    fail=1
  fi
done < <(find skills -type f -name '*.md' ! -name '*.zh-CN.md')
while IFS= read -r f; do
  base="${f%.zh-CN.md}.md"
  if [[ ! -f "$base" ]]; then
    echo "FAIL $f: translation without an English original"
    fail=1
  fi
done < <(find skills -type f -name '*.zh-CN.md')

if [[ $count -eq 0 ]]; then
  echo "FAIL: no skills found under skills/"
  exit 1
fi

[[ $fail -eq 0 ]] && echo "OK: $count skills checked" || exit 1
