# Changelog

Notable changes to vibemaster. Model-behavior evals are written alongside features but only run manually, so entries here cover what ships, not what was measured.

## Unreleased

### Changed
- Renamed the product from liustack to vibemaster. The GitHub org and author handle stay liustack, the repo moves to `liustack/vibemaster`, and the marketplace, the bundle plugin, and every install command now say vibemaster.
- shaping: a question riding inside a build list is a summons. From a real autonomous-session miss, dug and documented downstream: mixed requests exempt only their execution items, a user-brought candidate does not close the gate, and autonomy waives the pause, never the shaping (recommendation, grounds, and overturn conditions land in the output, then work proceeds on the recommendation).
- dig: the close routes the leftovers. The missing defense the meta root cause named goes through coding's loop, remediation bigger than the bug takes the issue.md to shaping, and nothing left means close without inventing a next step. Every edge of the four-skill loop now has body text behind it.

## 0.3.0 (2026-07-30)

The first eval-verified release: every skill change below ships with the
behavior run that motivated or confirmed it.

### Changed
- snapshot: handoffs now account for where the work is going. A gitignored local snapshot hands over nothing to another machine or agent, so the destination decides what must travel (WIP branch, commit message, PR description). Restore answers "where were we" before resuming, treats the newest file as a tiebreaker rather than a verdict, and routes resumed work back into the loop.
- dig: a dig entered through repeated failure never skips `issue.md`. Eval runs caught the small-problem exemption swallowing the deliverable, and the fix re-tested clean.
- shaping: candidates are evidence for recutting the frame, closing the gap between the co-evolution claim and the skill's instructions.
- coding: review checks acceptance criteria item by item and reports them separately from lens findings.
- rules/: everything the skills now carry is gone. tdd.md and review-lenses.md deleted, root-cause.md slimmed to defensive-code.md (the boundary doctrine no skill owns), verification.md keeps only the use-the-project's-own-entry-points discipline. Every remaining rule gained a zh-CN twin.
- README rebuilt as a landing page: watercolor banner and loop diagram, the theory behind shaping with its sources, measured context savings, and claims that survive a fact-check.

### Added
- `evalkit agentic`: behavior evals now run for real, in isolated workspaces with tool-enabled arms, post-state evidence capture, and judge-only regrading. First full matrix: snapshot/dig/coding across claude-sonnet-5, claude-opus-5 and gpt-5.5, adjudicated scores 10-11/11 and 19/20.
- Behavior eval fixtures for dig, snapshot, and coding's non-TDD paths (green-to-green refactor, verify-before-answer, adversarial review).
- CI: unit tests, skill format, manifest consistency, and style checks on every push and PR.
- `tests/measure_context_savings.py`: reproduces the README's context-cost comparison against a live fetch of Superpowers, so the numbers can be audited instead of trusted.

## 0.2.0 (2026-07-29)

The stack consolidates into a four-skill working loop.

### Added
- `coding`: development discipline from plan to green. Red-green-refactor for new behaviour, green-to-green for pure refactors, verify-before-answer for how-to-write-it questions, adversarial review before done. Absorbs test-first, best-practices, and the review-lenses rule.
- `dig` (renamed from figure-out): cross-domain root-cause digging with a first-principles hypothesis engine, falsify-first evidence discipline, magnitude reconciliation, and an `issue.md` deliverable. Absorbs the diagnosis half of best-practices, inversion, and first-principles.

### Changed
- All outward-facing text (marketplace manifests, skill description annotations) goes English-only. Chinese trigger phrases stay: they route Chinese users.

### Removed
- `test-first`, `best-practices`, `inversion`, `first-principles`: absorbed into coding and dig.
- `spec-out`, `deep-thought`, `muse`: consolidated into shaping earlier in the cycle. Personal judgment moved to opcstack's `opc-founder`.

## 0.1.0 (2026-07-25)

Initial release: the nine-skill era. Superseded by 0.2.0 within days, which is what pre-1.0 version numbers are for.
