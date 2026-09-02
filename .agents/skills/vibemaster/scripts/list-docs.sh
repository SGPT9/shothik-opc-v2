#!/usr/bin/env bash
set -euo pipefail

DOC_DIRS=(docs rules)
SKIP_DIRS=(bugs archive research)

prune_args=(-name '.*')
for d in "${SKIP_DIRS[@]}"; do
  prune_args+=(-o -name "$d")
done

output=""
for base in "${DOC_DIRS[@]}"; do
  [[ -d "$base" ]] || continue
  while IFS= read -r file; do
    entry=$(awk -v path="$file" '
      NR == 1 { if ($0 == "---") { infm = 1; next } else exit }
      infm && $0 == "---" { exit }
      infm {
        if ($0 ~ /^summary:/) {
          s = $0
          sub(/^summary:[[:space:]]*/, "", s)
          sub(/[[:space:]]+$/, "", s)
          gsub(/^["'\'']|["'\'']$/, "", s)
          summary = s
          inrw = 0
        } else if ($0 ~ /^read_when:[[:space:]]*\[/) {
          s = $0
          sub(/^read_when:[[:space:]]*\[/, "", s)
          sub(/\].*$/, "", s)
          n = split(s, arr, ",")
          for (i = 1; i <= n; i++) {
            t = arr[i]
            gsub(/^[[:space:]]+|[[:space:]]+$/, "", t)
            gsub(/^["'\'']|["'\'']$/, "", t)
            if (t != "") rw = (rw == "" ? t : rw "; " t)
          }
          inrw = 0
        } else if ($0 ~ /^read_when:[[:space:]]*$/) {
          inrw = 1
        } else if (inrw && $0 ~ /^[[:space:]]+-[[:space:]]+/) {
          t = $0
          sub(/^[[:space:]]+-[[:space:]]+/, "", t)
          sub(/[[:space:]]+$/, "", t)
          rw = (rw == "" ? t : rw "; " t)
        } else {
          inrw = 0
        }
      }
      END {
        if (summary != "") {
          print path " - " summary
          if (rw != "") print "  Read when: " rw
        }
      }
    ' "$file")
    if [[ -n "$entry" ]]; then
      output+="$entry"$'\n'
    fi
  done < <(find "$base" -type d \( "${prune_args[@]}" \) -prune -o -type f -name '*.md' ! -name '.*' ! -name '*.zh-CN.md' -print | sort)
done

if [[ -z "$output" ]]; then
  echo "No docs with front-matter found in docs/ or rules/"
  exit 0
fi

printf '%s' "$output"
echo
echo 'Reminder: Before coding, check the "Read when" hints above and read relevant docs as needed.'
