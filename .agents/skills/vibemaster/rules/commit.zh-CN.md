---
summary: 'Git 提交规范：Conventional Commits 格式、原子提交、HEREDOC 用法'
---

# Git 提交规范

[English](./commit.md)（权威版本）

## 提交信息格式

```
<type>[optional scope]: <imperative summary>

[optional body]

[optional footer(s)]
```

- 摘要用祈使语气，不超过 72 字符
- 末尾不加句号
- scope 只在增加清晰度时用（如 `auth`、`api`、`ui`）
- 破坏性变更用 `!` 标记（如 `feat!:`）或加 `BREAKING CHANGE:` footer

## 可用类型

| Type | 含义 |
|------|------|
| `feat` | 新功能 |
| `fix` | 缺陷修复 |
| `docs` | 文档更新 |
| `style` | 格式调整（不改逻辑） |
| `refactor` | 重构（不改行为） |
| `perf` | 性能优化 |
| `test` | 测试相关 |
| `build` | 构建系统或依赖变更 |
| `ci` | CI/CD 变更 |
| `chore` | 维护性事务 |
| `revert` | 回退提交 |

## 原子提交原则

1. 一个提交只做一件事
2. 每次提交后仓库仍可构建、可运行
3. 每个提交可独立回退，只影响它自己的变更
4. 行为变更时相关测试放进同一个提交
5. 不把重构、格式化和行为变更混进同一个提交

## 提交流程

```bash
# 1. 检查变更
git status --short
git diff --staged --stat

# 2. 选择性暂存（避免 git add -A）
git add <specific-files>

# 3. 检查将要提交的内容
git diff --staged

# 4. 提交（多行信息用 HEREDOC）
git commit -m "$(cat <<'EOF'
<type>[scope]: <summary>

[optional body]
EOF
)"
```

## 注意事项

- 不提交 `.env`、凭据等敏感文件
- pre-commit 钩子失败后，修好问题**新开一个提交**（不要用 `--amend`）
- 不自动推送。等用户发话
