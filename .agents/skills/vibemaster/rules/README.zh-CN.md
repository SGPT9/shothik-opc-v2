# rules/

[English](./README.md)（权威版本）

可复用的 agent 规则。每个文件都能直接放进 Claude Code 原生的 `.claude/rules/` 机制，也足够素，可以整段贴进没有 rules 目录的 harness 的 `AGENTS.md`。

## 安装

Claude Code，本机所有项目：

```bash
ln -s "$(pwd)/rules" ~/.claude/rules/vibemaster
```

Claude Code，单个项目：

```bash
ln -s /path/to/vibemaster/rules .claude/rules/vibemaster
```

Codex 等只认 AGENTS.md 的 harness：把文件内容追加到全局或项目的 `AGENTS.md`。

## 格式

- Frontmatter 的 `summary:` 由 `scripts/list-docs.sh` 读取用于发现。可选的 `paths:`（glob 列表）让 Claude Code 只在读到匹配文件时加载该规则。
- 规则是全程有效的约束。有条件、多步骤的东西属于 `skills/` 下的技能，不属于这里。
- 每个规则都有 `.zh-CN.md` 翻译，英文版是权威版本。
