#!/usr/bin/env bash
# Bare-vs-skill duel for one skill on one model. Usage:
#   bash scripts/duel.sh <skill> <model-id> [scenario-ids like 1,3]
# Results land in .issues/duels/<date>-<skill>-<model>/ with a summary.json.
set -euo pipefail
cd "$(dirname "$0")/.."
skill=${1:?skill name}
model=${2:?model id}
scen=${3:-}
python3 scripts/evalkit.py duel --skill "$skill" --model "$model" ${scen:+--scenarios "$scen"}
