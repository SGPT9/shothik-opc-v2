---
summary: '渐进式披露：list-docs.sh 索引机制与 Agent Skills 同源的上下文管理原理'
read_when:
  - 向仓库新增 docs 文档时
  - 设计新 skill 的 references 结构时
---

# 渐进式披露

[English](./progressive-disclosure.md)（权威版本）

## list-docs.sh 的索引机制

`scripts/list-docs.sh` 扫描 `docs/` 与 `rules/` 目录下所有带 frontmatter 的 markdown 文件（跳过 `.zh-CN.md` 翻译版，索引只收英文），只提取每个文件的路径、`summary` 和 `read_when` 提示，拼成一份索引输出。agent 开工前先跑这个脚本，装进上下文的是索引本身，而不是每篇文档的正文。命中某条 `read_when` 提示后，agent 再按需去读对应文件的完整内容。

这套机制的收益：上下文预算分层花，不一次掏空。仓库里的文档可以持续增长，但只要 frontmatter 写得准确，索引本身的体积几乎不随文档数量线性膨胀：每条索引只占几行，真正的内容重量留在正文里，只有被命中时才付出。

## 与 Agent Skills 渐进式披露的同源关系

这不是本仓库自造的设计，而是和 Agent Skills 标准本身的加载模型同一套原理。Agent Skills 的三层结构是：

1. **索引层**：技能列表只把每个 skill 的 `name` 和 `description` 装进系统上下文，agent 全程都能看到，但这一层极薄。
2. **正文层**：某条 description 命中当前任务后，才加载对应 `SKILL.md` 的完整正文，这时才付出这个 skill 的核心知识和流程的上下文成本。
3. **深层材料**：`SKILL.md` 正文如果还不够，再按需指向 `references/` 目录下的深层文档，进一步细分的知识只有明确需要时才加载。

`scripts/list-docs.sh` 的「索引 → 文档正文」两层结构，和「skill 列表 → `SKILL.md` 正文 → `references/`」的三层结构是同一套「按需展开」的思路。索引层解决的问题都是同一个：如何在不预先加载全部内容的前提下，让 agent 知道「这里有什么、什么时候该看」。

## 写新文档的约定

往 `docs/` 加新文档时，必须带 frontmatter，且至少包含两个字段。

- `summary`：一句话说清「这文档管什么」，写内容边界，不是摘要复述。例如「Git Commit 规范：Conventional Commits 格式、原子提交、HEREDOC 用法」，而不是把正文第一段抄过来。
- `read_when`：写触发场景，不是内容摘要。要回答的问题是「agent 在做什么事的时候应该翻开这份文档」，而不是「这份文档讲了什么」。触发场景写得越具体，索引命中率越高，agent 越不容易漏读该读的文档，也越不容易在不需要时误读。

英文版是权威版本。`.zh-CN.md` 翻译版并排放置方便中文读者，不进索引：所有引用一律指向英文文件。写完新文档后跑一次 `bash scripts/list-docs.sh`，确认它出现在输出里，summary 和 read_when 提示都符合预期。
