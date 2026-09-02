#!/usr/bin/env python3
"""Measure the context cost of vibemaster vs Superpowers. Reproduce the
numbers in the README yourself:

    python3 tests/measure_context_savings.py

Method, so you can audit it:

- Superpowers skills are fetched live from github.com/obra/superpowers,
  so the comparison is against whatever it ships today, not a frozen
  copy. vibemaster is read from this repo.
- Tokens are estimated as ascii_chars / 4 + cjk_chars * 1. Rough
  (plus or minus ~15%), applied identically to both sides.
- Two layers are measured. Always-on: skill descriptions every session
  carries, plus anything a hook injects into every session (Superpowers'
  SessionStart hook injects the full using-superpowers body on startup,
  /clear, and every /compact; vibemaster has no hook). Per-task: the
  bodies loaded when skills actually fire.
- The count is conservative in Superpowers' favor: only SKILL.md files
  are counted, none of its supporting files, and cross-references
  between its skills are counted once.

Not part of the unit suite: it needs the network and measures a moving
target. Run it by hand.
"""

import json
import pathlib
import re
import sys
import urllib.request

ROOT = pathlib.Path(__file__).resolve().parent.parent
SUP_API = "https://api.github.com/repos/obra/superpowers/contents/skills"
SUP_RAW = "https://raw.githubusercontent.com/obra/superpowers/main/skills/{}/SKILL.md"

# The chain Superpowers' own docs route one feature through.
SUP_FEATURE_CHAIN = [
    "brainstorming",
    "writing-plans",
    "executing-plans",
    "test-driven-development",
    "requesting-code-review",
    "receiving-code-review",
    "verification-before-completion",
    "finishing-a-development-branch",
]

LIU_SKILLS = ["shaping", "coding", "dig", "snapshot"]


def tokens(text):
    cjk = len(re.findall(r"[　-鿿＀-￯]", text))
    return round((len(text) - cjk) / 4 + cjk)


def description(text):
    match = re.search(r"^description: (.+)$", text, re.MULTILINE)
    return match.group(1) if match else ""


def fetch(url):
    req = urllib.request.Request(url, headers={"User-Agent": "vibemaster-measure"})
    with urllib.request.urlopen(req, timeout=30) as resp:
        return resp.read().decode()


def main():
    names = [entry["name"] for entry in json.loads(fetch(SUP_API)) if entry["type"] == "dir"]
    sup = {name: fetch(SUP_RAW.format(name)) for name in names}
    liu = {
        name: (ROOT / "skills" / name / "SKILL.md").read_text()
        for name in LIU_SKILLS
    }

    sup_desc = sum(tokens(description(text)) for text in sup.values())
    liu_desc = sum(tokens(description(text)) for text in liu.values())
    # The SessionStart hook (hooks/session-start) injects the full
    # using-superpowers body, wrapped in an EXTREMELY_IMPORTANT block.
    sup_hook = tokens(sup.get("using-superpowers", "")) + 25
    chain = [name for name in SUP_FEATURE_CHAIN if name in sup]
    sup_feature = sum(tokens(sup[name]) for name in chain)
    liu_feature = tokens(liu["shaping"]) + tokens(liu["coding"])
    sup_debug = tokens(sup.get("systematic-debugging", "")) + tokens(
        sup.get("test-driven-development", "")
    )
    liu_debug = tokens(liu["dig"])

    print(f"Superpowers: {len(sup)} skills fetched live")
    print(f"vibemaster:  {len(liu)} skills read from this repo\n")
    rows = [
        ("Always-on, every session",
         f"{sup_desc + sup_hook:>6,} ({len(sup)} descriptions + hook-injected dispatcher)",
         f"{liu_desc:>6,} ({len(liu)} descriptions, no hook)"),
        (f"Ship one feature ({len(chain)}-skill chain vs shaping+coding)",
         f"{sup_feature:>6,}", f"{liu_feature:>6,}"),
        ("Dig one bug (debugging+TDD vs dig alone)",
         f"{sup_debug:>6,}", f"{liu_debug:>6,}"),
    ]
    width = max(len(row[0]) for row in rows)
    print(f"{'tokens':<{width}}  {'Superpowers':<50} vibemaster")
    for label, sup_val, liu_val in rows:
        print(f"{label:<{width}}  {sup_val:<50} {liu_val}")
    print("\nEstimate: ascii/4 + cjk. Superpowers' supporting files not counted.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
