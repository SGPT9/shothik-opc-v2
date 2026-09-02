#!/usr/bin/env bash
# Fixture: a task frozen mid-flight. Some work verified, some not, one
# uncommitted change, and a spec already on disk that a good snapshot
# points at instead of copying.
# Usage: bash setup-mid-task.sh <target-dir>
set -euo pipefail
TARGET="${1:?usage: setup-mid-task.sh <target-dir>}"
mkdir -p "$TARGET/src" "$TARGET/test" "$TARGET/.issues/2026-07-28-rate-limit"
cd "$TARGET"
cat > package.json <<'EOF'
{ "name": "api-gate", "version": "0.9.0", "scripts": { "test": "node --test" } }
EOF
cat > src/limiter.js <<'EOF'
// sliding-window rate limiter, per API key
const windows = new Map();
function allow(key, limit, windowMs, now = Date.now()) {
  const hits = (windows.get(key) || []).filter((t) => now - t < windowMs);
  if (hits.length >= limit) { windows.set(key, hits); return false; }
  hits.push(now);
  windows.set(key, hits);
  return true;
}
module.exports = { allow };
EOF
cat > test/limiter.test.js <<'EOF'
const { test } = require('node:test');
const assert = require('node:assert');
const { allow } = require('../src/limiter.js');
test('allows under the limit', () => {
  assert.ok(allow('k1', 2, 1000, 0));
  assert.ok(allow('k1', 2, 1000, 10));
});
test('blocks over the limit', () => {
  allow('k2', 1, 1000, 0);
  assert.strictEqual(allow('k2', 1, 1000, 10), false);
});
EOF
cat > .issues/2026-07-28-rate-limit/spec.md <<'EOF'
# Rate limiting for the public API

## Approved scope
- Per-key sliding window over a rolling time window, keyed on the API key,
  never on IP or account id.
- Blocked requests answer 429 with a Retry-After header.
- Limits and window sizes are configurable per plan tier (free, pro,
  enterprise), read from plan config at request time, no restart needed.

## Out of scope
- Per-IP limits (revisit only if key sharing becomes an abuse vector).
- Global circuit breaking, request queuing, or token buckets.

## Acceptance criteria
- A key at its limit gets 429 with a correct Retry-After value.
- A key under its limit is never blocked, across window boundaries.
- Changing a tier's limit in plan config takes effect without restart.
- Existing unlimited internal endpoints keep working unchanged.

## Failure criteria
- Any request blocked for a key that is under its configured limit.
- Retry-After longer than the real wait, teaching clients to over-back-off.
EOF
git init -q && git add -A -- ':!.issues' && git commit -qm "wip: sliding-window limiter with tests"
# uncommitted work in progress: wiring the limiter into the request handler
cat > src/handler.js <<'EOF'
const { allow } = require('./limiter.js');
// TODO: read limit/window from plan config instead of constants
function handle(req) {
  if (!allow(req.key, 100, 60000)) return { status: 429 };
  return { status: 200 };
}
module.exports = { handle };
EOF
echo "fixture ready: $TARGET (handler.js is uncommitted, handler has no tests yet)"
