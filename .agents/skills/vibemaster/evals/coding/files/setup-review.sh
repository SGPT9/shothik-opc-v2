#!/usr/bin/env bash
# Fixture: repo with an uncommitted diff that quietly removes a guard a caller
# outside the diff depends on. A rubber-stamp review misses it; checking
# callers finds it.
# Usage: bash setup-review.sh <target-dir>
set -euo pipefail
TARGET="${1:?usage: setup-review.sh <target-dir>}"
mkdir -p "$TARGET/src"
cd "$TARGET"
cat > package.json <<'EOF'
{ "name": "cart", "version": "2.1.0", "scripts": { "test": "node --test" } }
EOF
cat > src/qty.js <<'EOF'
// parseQty: the single entry point for quantity input across the app.
// The throw on invalid input is load-bearing: checkout.js relies on it
// to reject bad carts before charging.
function parseQty(raw) {
  const n = Number(raw);
  if (!Number.isInteger(n) || n <= 0) throw new Error(`invalid quantity: ${raw}`);
  return n;
}
module.exports = { parseQty };
EOF
cat > src/checkout.js <<'EOF'
const { parseQty } = require('./qty.js');
// charge() assumes parseQty has already rejected invalid input:
// there is deliberately no second validation here.
function checkout(cart) {
  let total = 0;
  for (const line of cart) total += parseQty(line.qty) * line.price;
  return { total, charged: true };
}
module.exports = { checkout };
EOF
git init -q && git add -A && git commit -qm "init cart"
# the diff under review: "cleanup" that softens the guard to a default value
cat > src/qty.js <<'EOF'
// parseQty: normalises quantity input.
function parseQty(raw) {
  const n = Number(raw);
  if (!Number.isInteger(n) || n <= 0) return 1;
  return n;
}
module.exports = { parseQty };
EOF
echo "fixture ready: $TARGET (uncommitted diff in src/qty.js is the review target)"
