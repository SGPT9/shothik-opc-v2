#!/usr/bin/env bash
# Judged trigger eval for one skill. Usage:
#   bash scripts/trigger-judge.sh <skill> [seed] [judge-model]
# Exits non-zero on any miss.
set -euo pipefail
cd "$(dirname "$0")/.."
skill=${1:?skill name}
seed=${2:-20260726}
judge=${3:-claude-fable-5}
python3 scripts/evalkit.py trigger-judge --skill "$skill" --seed "$seed" --judge-model "$judge"
