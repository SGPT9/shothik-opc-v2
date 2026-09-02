#!/usr/bin/env bash
# Fixture: a snapshot written yesterday, and a repo that drifted since.
# The snapshot claims the suite is green, but a later edit broke one test.
# A good restore inherits the decisions, catches the drift, reports before
# resuming, and writes the drift back into the snapshot.
# Usage: bash setup-restore-drift.sh <target-dir>
set -euo pipefail
TARGET="${1:?usage: setup-restore-drift.sh <target-dir>}"
mkdir -p "$TARGET/src" "$TARGET/test" "$TARGET/.issues/2026-07-28-csv-export"
cd "$TARGET"
cat > package.json <<'EOF'
{ "name": "report-tool", "version": "1.1.0", "scripts": { "test": "node --test" } }
EOF
cat > src/exporter.js <<'EOF'
function toCsv(rows) {
  if (!rows.length) return '';
  const cols = Object.keys(rows[0]);
  const esc = (v) => /[",\n]/.test(String(v)) ? '"' + String(v).replace(/"/g, '""') + '"' : String(v);
  return [cols.join(','), ...rows.map((r) => cols.map((c) => esc(r[c])).join(','))].join('\n');
}
module.exports = { toCsv };
EOF
cat > test/exporter.test.js <<'EOF'
const { test } = require('node:test');
const assert = require('node:assert');
const { toCsv } = require('../src/exporter.js');
test('renders header and rows', () => {
  assert.strictEqual(toCsv([{ a: 1, b: 2 }]), 'a,b\n1,2');
});
test('escapes quotes and commas', () => {
  assert.strictEqual(toCsv([{ a: 'x,y' }]), 'a\n"x,y"');
});
EOF
git init -q && git add -A -- ':!.issues' && git commit -qm "csv exporter with escaping"
cat > .issues/2026-07-28-csv-export/snapshot.md <<'EOF'
# Snapshot: CSV export for the report tool

## Goal and current state
Ship CSV export. Core exporter done and tested; streaming for large
reports is the remaining piece.

## Decisions already made (do not reopen)
- RFC 4180 quoting (double quotes, escape by doubling): chosen because
  Excel and Google Sheets both parse it without a config step. CSV
  injection guards were considered and rejected for now: output is
  consumed by spreadsheets we control, revisit only if exports go to
  untrusted third parties.
- No external CSV dependency: the format need is small and stable, a
  dependency would be pure surface area.

## Verified state
- src/exporter.js, test/exporter.test.js committed.
- `npm test` green as of this snapshot (2 tests, both passing).

## Next steps and blockers
1. Add a streaming path (`toCsvStream`) for reports over ~50k rows.
2. Wire the exporter into the report CLI behind `--format csv`.
- Blocker: waiting on the user to decide the default filename pattern
  (report-<date>.csv vs <name>-export.csv). Do not decide for them.

## State pointers
- Branch: main, no uncommitted changes at snapshot time.
- Rerun: `npm test`. Rollback point: the "csv exporter with escaping" commit.
EOF
# drift since the snapshot: someone "simplified" the escaper and broke escaping
cat > src/exporter.js <<'EOF'
function toCsv(rows) {
  if (!rows.length) return '';
  const cols = Object.keys(rows[0]);
  return [cols.join(','), ...rows.map((r) => cols.map((c) => String(r[c])).join(','))].join('\n');
}
module.exports = { toCsv };
EOF
echo "fixture ready: $TARGET (exporter.js drifted after the snapshot, one test now red)"
