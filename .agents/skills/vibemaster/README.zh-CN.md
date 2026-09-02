<div align="center">
  <img src="assets/banner.jpg" width="100%" alt="vibemaster coding skills" />
  <h1>VIBEMASTER</h1>
  <p><b>更强的 Superpowers 轻量级替代：四个 Skills，一个闭环。</b></p>
  <p>
    <a href="https://github.com/liustack/vibemaster/actions/workflows/ci.yml"><img src="https://img.shields.io/github/actions/workflow/status/liustack/vibemaster/ci.yml?branch=main&label=tests" alt="tests"></a>
    <a href="https://skills.sh/liustack/vibemaster"><img src="https://img.shields.io/badge/skills.sh-vibemaster-black" alt="skills.sh"></a>
    <a href="LICENSE"><img src="https://img.shields.io/badge/license-MIT-blue.svg" alt="License"></a>
  </p>
  <p><a href="./README.md">English</a></p>
</div>

> **liustack 已更名为 vibemaster。** 名字换了，四个技能不变，下方安装命令已更新为 `liustack/vibemaster`。

每个 Skill 只干一个事：动手之前帮你捋清楚，编码时用最佳实践，出问题时找根因，交接时做快照。

<p align="center">
  <img src="assets/loop.jpg" width="820" alt="vibemaster 工作流闭环：动手之前帮你捋清楚，编码时用最佳实践，出问题时找根因，交接时做快照。" />
</p>

## 技能

| 技能 | 何时 | 你得到什么 |
| :-- | :-- | :-- |
| [`shaping`](skills/shaping/SKILL.zh-CN.md) | 动手之前 | 把一个模糊的想法，变成三样东西之一：一个有理由撑腰的决定，几个真正不一样（不是换个说法而已）的候选方案，或者一份可评审的 `spec.md` / `design.md`。 |
| [`coding`](skills/coding/SKILL.zh-CN.md) | 编码过程 | 遵循编码最佳实践，不求最新，但求最稳：红绿 TDD 测试，重构一条龙，收尾前再来一轮对抗式审查。 |
| [`dig`](skills/dig/SKILL.zh-CN.md) | 有 BUG 时 | 不管问题出在哪一层，都刨到真正的原因：先复现问题，提出能被推翻的假设，一次只改一个变量以确认到底是什么在起作用，原因说不通症状就不动手改。产出 `issue.md`。 |
| [`snapshot`](skills/snapshot/SKILL.zh-CN.md) | 转手交接时 | 一份新会话能直接续接的交接文档，信它的决策，重验它的事实。 |

斜杠命令是可选的。每个技能都有自己的触发词（需求澄清、brainstorm、为什么又坏了、收尾下次接着做），纪律自己进场，不用点名。

⭐ **如果好用，就[点个 star](https://github.com/liustack/vibemaster)。** star 是下一个开发者找到它的方式，也是我们继续做下去的动力。

## 安装

直接跟你claude code 或 codex 说，

```bash
帮我安装 npx -y skills add liustack/vibemaster -g
```

或者复制这行到命令行粘贴

```bash
npx -y skills add liustack/vibemaster -g
```

或者做完 claude code 插件安装：

```bash
# Claude Code 插件市场
claude plugin marketplace add liustack/vibemaster
claude plugin install vibemaster@vibemaster        # 全家桶
claude plugin install shaping@vibemaster       # 或只装一个

# Codex / 其他 agent：技能住在 ~/.agents/skills
git clone https://github.com/liustack/vibemaster
ln -s "$(pwd)/vibemaster/skills/"* ~/.agents/skills/
```

> 完整 `vibemaster` 插件和单技能小插件二选一，别都装：它们带着同名技能。

| 在哪 | 怎么调 |
|---|---|
| Claude Code | 输 `/<技能名>`（如 `/dig`），或者直接说话：description 会自动触发 |
| Codex | 按 `$` 打开技能搜索选一个（`/skills` 只是管理面板） |
| 其他 Agent Skills 工具 | 靠各技能的 description 自动触发 |

## 工作流

- **做一个功能**：`/shaping` → 批准 spec → `/coding` → 合并
- **修一个顽固 bug**：`/dig` 复现、挖到根因、一路修完并留下回归测试
- **做不做的取舍**：`/shaping`，需要几轮就几轮
- **活没干完要停**：`/snapshot` → 开新会话 → 接着上次做

## 为什么选 vibemaster

与其他工作流套件不同，vibemaster 的方法不仅仅是经验清单：它按设计研究和科学哲学校准，理论同时是这套方法的回归测试，技能的任何改动不许违背它。需求不是从「模糊」单向压缩成「具体」：它在不同层级之间反复展开与折叠，开空间、收空间，直到收敛成确定的答案。这个过程有名字，[问题与解法的共同演化](https://doi.org/10.1016/S0142-694X%2801%2900009-6)（Dorst 与 Cross）：试解法会改写对问题的理解，新理解再收窄解法的空间，逐步把不确定情境具象化（[杜威的探究](https://plato.stanford.edu/entries/dewey/)）。

所以四个技能共享同一套动作。模糊的请求是一个可能性空间，每一轮工作只做一件事：让范围变小。发散不是目标，而是收敛失去依据时的局部操作：选项全是同义换皮就**展开**出真正不同的疆域，依据一够立即**折叠**，证据掀翻框架就**重切**。检验只有一条，借自[波普尔](https://en.wikipedia.org/wiki/Falsifiability)：排除不了任何可能性的输出，不算进展。dig 用同一把尺跑[皮尔士三元](https://plato.stanford.edu/entries/abduction/)：溯因提出假设，演绎推出后果，归纳交给现实检验。

**比 Superpowers 更轻。** Superpowers 给开发任务立了一条固定流水线：先头脑风暴、再写计划、然后执行，不管这个任务用不用得上。vibemaster 只留四个技能，每个管一个阶段，而且不是习惯性运行：发散出多个方案、拷问、review，只有在跳过它们真会出问题的时候才出场，从来不是必经的固定步骤。

**而且轻是量出来的。** 实际加载内容的 token 开销，Superpowers 实时拉取最新版，两边用同一把尺。跑 `python3 tests/measure_context_savings.py` 就能复测：

| 你付的钱 | Superpowers | vibemaster |
|---|---|---|
| 每个会话的常驻 | 约 1,250（14 条 description，外加钩子在每次 /compact 后重新注入的调度技能） | 约 680（4 条 description，无钩子） |
| 做一个功能 | 约 12,000（8 技能链） | 约 4,100（shaping + coding） |
| 挖一个 bug | 约 4,600（systematic-debugging 修复还要再链 TDD） | 约 2,600（dig 自己闭环） |

**但该强的地方更强。** 技能少了，每个干的活更多。coding 把每一行代码的标准定在今天的最佳写法（代码能跑，和照今天该有的写法写，是两件不一样的事，它两个都查），TDD、重构、专挑毛病的 review 在同一个循环里做完，不是分开的几道工序。第一性原理和逆向思维在 shaping 和 dig 里也是真在干活：负责生成假设和判断失败的标准，不是扫一眼就翻过去的清单条目。

**grill-me 得靠你自己记得去跑。** grill-me 是一个拿尖锐问题拷问需求的技能，要手动调用。vibemaster 的 shaping 靠触发词自动进场，用第一性原理和逆向思维（从「怎样才会失败」倒推回来）问同一类问题，每敲定一个决策就当场写进 spec 文件。拷问是自动的，写出来的文件本身就是交付物。


## 卸载

```bash
npx skills remove shaping coding dig snapshot -g
# 或：claude plugin uninstall vibemaster@vibemaster
```

## License

MIT。有问题和疑问欢迎开 issue，也推荐你 fork 它构建自己的工作流。

如果你需要商业技术栈（创始人自审、细分市场、营销诊断），欢迎使用我开源的 [opcstack](https://github.com/liustack/opcstack)。

