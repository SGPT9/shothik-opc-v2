---
summary: 'Progressive disclosure: the list-docs.sh index and how it shares one principle with the Agent Skills loading model'
read_when:
  - Adding a document to docs/
  - Designing the references/ structure of a new skill
---

# Progressive disclosure

[中文](./progressive-disclosure.zh-CN.md)

## How the list-docs.sh index works

`scripts/list-docs.sh` scans every markdown file with frontmatter under `docs/` and `rules/` (skipping `.zh-CN.md` translations, the index is English-only), extracts only each file's path, `summary`, and `read_when` hints, and prints them as one index. An agent runs the script before starting work. What enters context is the index, not the body of every document. When a `read_when` hint matches the task at hand, the agent reads that file in full.

The payoff: you spend the context budget in layers, not all at once. The documentation can keep growing, but as long as the frontmatter is accurate the index barely grows with it: each entry is a few lines, the real weight stays in the bodies and is only paid for on a hit.

## The same principle as Agent Skills' progressive disclosure

This is not a design invented here. It is the same principle as the Agent Skills loading model:

1. **Index layer**: the skill listing puts only each skill's `name` and `description` into system context. The agent sees it at all times, but the layer is very thin.
2. **Body layer**: only after a description matches the current task is the full `SKILL.md` loaded, and only then is the context cost of the skill's core knowledge and procedure paid.
3. **Deep material**: if the body is not enough, it points to documents under `references/`, loaded only when explicitly needed.

The two-layer "index → document body" structure of `list-docs.sh` and the three-layer "skill listing → `SKILL.md` → `references/`" structure are one expand-on-demand idea. The index layer always solves the same problem: letting the agent know what exists and when to look, without preloading everything.

## Conventions for new documents

Every new document under `docs/` carries frontmatter with at least two fields:

- `summary`: one sentence on what the document covers. Write the content boundary, not a recap ("Git commit conventions: Conventional Commits format, atomic commits, HEREDOC usage," not a copy of the opening paragraph).
- `read_when`: trigger scenarios, not a content summary. Answer "what is the agent doing when it should open this document", not "what does this document say". The more concrete the scenario, the higher the hit rate: fewer missed must-reads, fewer pointless reads.

English is the authoritative version. A `.zh-CN.md` translation sits alongside for Chinese readers and stays out of the index: cross-references always point at the English file. After writing, run `bash scripts/list-docs.sh` and confirm the document appears with the summary and hints you expect.
