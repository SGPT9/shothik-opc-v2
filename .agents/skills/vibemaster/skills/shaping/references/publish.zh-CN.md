# 发布最终实现规格
[English](./publish.md)（权威版本）

根据已确认理解按模板重写发布产物。草稿只用于事实检查，不能作为复制源。

## 出口探测

按序探测，取第一个可用出口：

```bash
git rev-parse --is-inside-work-tree 2>/dev/null   # 有无 git
command -v gh >/dev/null && gh repo view --json url,visibility 2>/dev/null    # GitHub
command -v glab >/dev/null && glab repo view 2>/dev/null                      # GitLab
```

**出口可用的判据是 `repo view` 命令成功，不是 CLI 装没装**。`command -v` 只决定要不要尝试。装了 gh 但仓库无 remote（repo view 失败）＝该出口不可用，继续向下探测。

1. GitHub 可用 → Issue 或 PR 描述
2. GitLab 可用 → Issue 或 MR 描述
3. 有 git 但无可用 forge 出口 → commit message 正文
4. 无 git → 不发布，见「无 git 场景」

## 去向询问

问一次，用户选。按时机给默认推荐：开工前定稿 → 推荐 Issue（可被认领与派工）。收工补痕 → 推荐 PR/MR 描述。

## 白名单模板

发布文本只能由以下五节组成，节外内容不得出现：

```markdown
## 问题
<用户视角的问题陈述>

## 方案
<用户视角的方案描述>

## 验收标准
<来自逆向失败判定，逐条可验证>

## 关键决策
<为什么选 A 不选 B，被否方案各一句话>

## Out of Scope
<明确不做的事>
```

## 隐私纪律（不可关闭）

- 发布文本不得出现：`.issues/` 路径、草稿原文引用、内部代号、对具体个人的判断、文件路径与代码片段（编码了决策的 schema/状态机除外，须注明来源于原型）。
- 模板五节中凡未经用户确认、由你推断补全的内容（常见于 Out of Scope），必须在预览时逐条标注「推断，未确认」。
- **给用户过目之前先跑机械闸门。** 把候选文本写进临时文件，执行 `python3 scripts/check-publish.py <草稿spec.md> <候选文本.md>`（路径相对本技能目录）。它拦截私有路径泄漏、草稿整行照搬、模板缺节，并在目标仓公开时打警告。逐条修完重跑到绿，才把文本给用户过目。
- 发布前把完整最终文本展示给用户。能探测到仓库为 public 时，加一句醒目提示「这将发布到公开仓库」。用户明确确认后才执行发布命令。闸门跑在人工门之前，永远不替代人工门。

## 发布命令

```bash
gh issue create --title "<标题>" --body-file <蒸馏文件>
glab issue create --title "<标题>" --description "<蒸馏文本>"
```

PR/MR 描述场景：本技能不创建 PR，把蒸馏文本交给正常的 PR 流程使用。

## 降级出口

发布命令失败（未登录、无权限、网络异常）时：向用户说明失败原因，把蒸馏文本原样交给用户手动使用。最多重试一次，禁止自行变通发布渠道。

## 无 git 场景

草稿即终态，任务目录内的 `spec.md` 就是交付物。若用户需要同步或说服他人（合伙人、家人、客户），可把 spec 蒸馏成一段可直接发送的文本（同白名单纪律）交给用户。
