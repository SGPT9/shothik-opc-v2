#!/usr/bin/env bash
# Fixture: price catalog where a stale derived file shadows the source the user edits.
# Root cause: build.js was run once and never again; loader prefers items.min.json.
# Usage: bash setup-stale-derived.sh <target-dir>
set -euo pipefail
TARGET="${1:?usage: setup-stale-derived.sh <target-dir>}"
mkdir -p "$TARGET/src"
cd "$TARGET"
cat > package.json <<'EOF'
{ "name": "pricelist", "version": "1.2.0", "scripts": { "build": "node src/build.js", "show": "node src/show.js" } }
EOF
cat > src/build.js <<'EOF'
// one-shot minifier: strips comments/whitespace from items.json
const fs = require('fs');
const items = JSON.parse(fs.readFileSync('items.json', 'utf8'));
fs.writeFileSync('items.min.json', JSON.stringify(items));
console.log('built items.min.json');
EOF
cat > src/show.js <<'EOF'
const fs = require('fs');
// prefer the minified build when present (faster parse on large catalogs)
const src = fs.existsSync('items.min.json') ? 'items.min.json' : 'items.json';
const items = JSON.parse(fs.readFileSync(src, 'utf8'));
for (const it of items) console.log(`${it.name}: $${it.price}`);
EOF
cat > items.json <<'EOF'
[
  { "name": "basic", "price": 19 },
  { "name": "pro", "price": 49 }
]
EOF
node src/build.js > /dev/null
# user later edited the source prices, but nothing rebuilt the derived file
cat > items.json <<'EOF'
[
  { "name": "basic", "price": 29 },
  { "name": "pro", "price": 59 }
]
EOF
git init -q && git add -A && git commit -qm "init pricelist"
echo "fixture ready: $TARGET"
