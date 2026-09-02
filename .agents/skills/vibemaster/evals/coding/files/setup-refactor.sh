#!/usr/bin/env bash
# Fixture: working stats module with duplicated aggregation logic and a green suite.
# The right move is green-to-green refactoring: no manufactured failing test.
# Usage: bash setup-refactor.sh <target-dir>
set -euo pipefail
TARGET="${1:?usage: setup-refactor.sh <target-dir>}"
mkdir -p "$TARGET/src" "$TARGET/test"
cd "$TARGET"
cat > package.json <<'EOF'
{ "name": "stats", "version": "1.0.0", "scripts": { "test": "node --test" } }
EOF
cat > src/stats.js <<'EOF'
function mean(xs) {
  if (!Array.isArray(xs) || xs.length === 0) return 0;
  let total = 0;
  for (let i = 0; i < xs.length; i++) total += xs[i];
  return total / xs.length;
}
function sumAbove(xs, floor) {
  if (!Array.isArray(xs) || xs.length === 0) return 0;
  let total = 0;
  for (let i = 0; i < xs.length; i++) if (xs[i] > floor) total += xs[i];
  return total;
}
function range(xs) {
  if (!Array.isArray(xs) || xs.length === 0) return 0;
  let max = xs[0], min = xs[0];
  for (let i = 0; i < xs.length; i++) {
    if (xs[i] > max) max = xs[i];
    if (xs[i] < min) min = xs[i];
  }
  return max - min;
}
module.exports = { mean, sumAbove, range };
EOF
cat > test/stats.test.js <<'EOF'
const { test } = require('node:test');
const assert = require('node:assert');
const { mean, sumAbove, range } = require('../src/stats.js');
test('mean of values', () => assert.strictEqual(mean([2, 4, 6]), 4));
test('mean of empty input is 0', () => assert.strictEqual(mean([]), 0));
test('sumAbove filters by floor', () => assert.strictEqual(sumAbove([1, 5, 10], 4), 15));
test('range spans min to max', () => assert.strictEqual(range([3, 9, 5]), 6));
EOF
git init -q && git add -A && git commit -qm "init stats module"
echo "fixture ready: $TARGET"
