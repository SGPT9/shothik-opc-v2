---
summary: '用项目自己的命令和脚本做验证。降级验证必须标注。视觉变更配截图'
---

# 验证纪律

[English](./verification.md)（权威版本）

- 先找项目的官方命令：AGENTS.md、README、docs/、scripts/、package.json、Makefile、justfile、Procfile。不预设 `make` 存在。
- 用户给了启动命令就原样跑。不擅自把 `run`/`start`/`dev`/`serve`/`preview` 互换，不把 `./script` 改写成 `bash script`，除非原命令失败且你说明了原因。
- 启动前确认工作目录、env 文件、端口来源。常驻 dev server 放在持久会话里跑。
- 项目脚本失败时，读报错、读脚本、定位原因。不许退回静态 HTML 或构建产物还宣称「浏览器验证过」。降级验证不可避免时，明确标注这是降级。
- 有视觉影响的 UI 变更：前后截图对比。
- 收尾时只关掉你自己起的会话和进程。
