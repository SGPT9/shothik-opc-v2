---
summary: 'vibemaster design philosophy: the first-principles thesis, write only what models lack, evidence hierarchy with battle-tested first, the two conditions for a standalone skill, platform duty, triggering discipline'
read_when:
  - Designing or revising any skill
  - Judging whether a skill should exist or be built
---

# vibemaster design philosophy

[中文](./philosophy.zh-CN.md)

Core principles for skill design and evaluation. When a design and this document disagree, the document wins.

## 1. The first-principles thesis

Most thinking and logic problems are, at heart, philosophy problems. Every skill starts from a mental model and grows into a workflow, and must be able to point out which thinking engine drives each step. What an engine hands the executor is not terminology. It is the question that step should ask.

## 2. Write only what models don't do by default

Navigation, not tutorials: give only the judgment criteria at forks and the quality bar for deliverables. Routine steps a model has already internalized are never written. Skills are independently usable, with no mandatory chain.

## 3. The evidence hierarchy: battle-tested > controlled tests > claims

When judging a practice, or whether a skill deserves to live: large-scale survival evidence (install counts, years in production, long-term choices made with real stakes) outranks controlled tests and self-testing, which outrank claims and reasoning. A test samples reality with constructed cases. Reality samples you. A controlled baseline on one model and a few scenarios cannot cover the real cross-model distribution, and is never enough to overrule demand proven by large-scale practice. Survival evidence itself must pass a survivorship-bias check.

## 4. Red-flag tables and pitfall lists are native products of inversion

When writing a skill, explicitly run "how will users crash with this" and produce the red-flag and counterexample sections.

## 5. A standalone skill needs both its own summons and its own procedure

Some class of users would call for it in distinctive words, and it has a distinctive procedure rather than just knowledge. Knowledge itself can live in a deeper reference opened only when needed. The summons and the procedure are what justify a separate skill.

## 6. Platform duty

Whatever the platform is doing or is bound to do becomes a liability when done at the skill layer: routing, updaters, and session memory all qualify. Before building anything, ask: whose duty is this.

## 7. Triggering discipline

A description states what the skill is, when to use it, and how it differs from its neighbors. Broad positive triggers must carry an exclusion clause. No moral imperatives (MUST/ALWAYS). One trigger per branch: never restate the same scenario in synonyms. Only skills whose misfiring causes real harm get an invocation-control flag, and never a cross-harness configuration matrix.
