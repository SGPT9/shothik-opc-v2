#!/usr/bin/env bash
# Fixture: revenue report disagrees with the ledger by exactly 75.
# Two independent causes: one order double-imported (+30) and two refunds
# never subtracted (-45 missing). A digger who stops at the first cause
# cannot make the magnitudes reconcile.
# Usage: bash setup-ledger-gap.sh <target-dir>
set -euo pipefail
TARGET="${1:?usage: setup-ledger-gap.sh <target-dir>}"
mkdir -p "$TARGET"
cd "$TARGET"
cat > orders.csv <<'EOF'
id,amount
1001,120
1002,30
1002,30
1003,85
1004,200
1005,65
EOF
cat > refunds.csv <<'EOF'
id,amount
1003,25
1005,20
EOF
cat > report.py <<'EOF'
import csv
total = sum(int(r["amount"]) for r in csv.DictReader(open("orders.csv")))
print(f"revenue: {total}")
EOF
cat > LEDGER.md <<'EOF'
# Finance ledger (source of truth)
Net revenue this period: **455**
(gross orders 500, refunds 45)
EOF
git init -q && git add -A && git commit -qm "init ledger fixture"
echo "fixture ready: $TARGET"
