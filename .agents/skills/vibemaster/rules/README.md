# rules/

Reusable agent rules. Each file is a drop-in for Claude Code's native `.claude/rules/` mechanism, and plain enough to paste into an `AGENTS.md` for harnesses without a rules directory.

## Install

Claude Code, all projects on this machine:

```bash
ln -s "$(pwd)/rules" ~/.claude/rules/vibemaster
```

Claude Code, one project:

```bash
ln -s /path/to/vibemaster/rules .claude/rules/vibemaster
```

Codex and other AGENTS.md-only harnesses: append the file contents to your global or project `AGENTS.md`.

## Format

- Frontmatter `summary:` is read by `scripts/list-docs.sh` for discovery. Optional `paths:` (a glob list) makes Claude Code load the rule only when matching files are read.
- Rules are always-on constraints. Anything conditional or multi-step belongs in a skill under `skills/`, not here.
- Every rule has a `.zh-CN.md` twin. The English file is the authoritative version, translations link back to it.
