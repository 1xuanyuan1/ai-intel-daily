---
title: "DeepSeek Harness 深挖：Agent 竞争不只看模型了"
date: 2026-08-15
updated: 2026-08-15
layout: post
description: "从 Cordis 插件内核、四种运行模式到只追加事件流，拆解 DeepSeek Harness 改变了什么、尚未证明什么。"
categories:
  - Agent
cover: /assets/images/ai-intel-signal-matrix.jpg
banner: /assets/images/ai-intel-signal-matrix.jpg
pin: 1
status: deep-dive
topic: DeepSeek Harness
fact_checked_at: "2026-08-15T01:00:00+08:00"
timezone: Asia/Shanghai
tags:
  - DeepSeek
  - Harness
  - Agent
  - Cordis
  - 开源
---

DeepSeek Harness 的意义，不是 DeepSeek 又多了一个聊天界面。它把模型之外的工具、上下文、权限、执行循环、会话日志和界面拆成可替换插件，让 Agent 的“运行系统”本身成为可实验、可审计、可重组的对象。

## 先给结论

1. **这是一个 Harness，当前更像开发者基础设施。** 官方定位是开发者预览版，并明确警告后续存在破坏兼容性的变更。
2. **真正的架构变化是“一切皆插件”。** 模型适配器、工具注册表、会话日志、沙箱、审批策略和 Agent loop 都能在配置层替换。
3. **只追加事件流是更值得长期关注的设计。** 它让模型请求、工具调用、结果和上下文注入可以被回放、恢复、分叉和审计。
4. **现在还不能下“全面领先”结论。** 已有实测样本证明它能完成真实任务，也暴露了界面粗糙、配置门槛和插件治理成本。目前没有足够的同条件、可复现对比证明它整体优于 Codex 或 Claude Code。

## 2026 年 8 月 13 日究竟发布了什么

DeepSeek 在8月13日开放 DeepSeek Harness 开发者预览版，源码使用 MIT 许可证。安装 Node.js 后，开发者可以运行：

```sh
npx @deepseek-ai/dsh web
```

它会在本机启动 Web UI，默认地址是 `http://127.0.0.1:3080`。官方网站和仓库都把它标为“开发者预览”，仓库更直接写明：项目仍在快速迭代，将出现破坏兼容性的变更。

这个限定很重要。开源、可安装和能完成 Demo，都不等于已经适合生产环境。

## Harness 是什么

Harness 可以理解为围绕模型搭建的 Agent 运行系统。

模型负责理解和判断下一步；Harness 负责把当前工作材料交给模型，提供工具，控制权限，执行操作，读取结果，然后决定继续、重试还是结束。一个最小流程是：

```text
接收目标 → 组装当前信息 → 请求模型 → 调用工具 → 记录结果 → 继续或结束
```

这就是为什么同一个模型放进不同 Harness，任务完成率、速度、工具使用次数和费用可能不同。模型决定能力上限，Harness 影响这份能力能兑现多少。

## DeepSeek 真正改了哪一层

### Cordis：只管插件生命周期的底板

DeepSeek Harness 建在 Cordis 插件框架之上。按官方架构文档，Cordis 管理插件加载、卸载、服务依赖、类型化事件和可逆的副作用；它不把某个模型、工具或 Agent loop 写成不可替换的特权核心。

可以把 Cordis 想成一块带规则的接线板：每个模块声明自己提供什么服务、依赖什么服务，插上去时注册能力，拔下来时撤销它带来的注册和副作用。这个类比只用于理解结构；真实机制仍是服务容器、依赖注入、事件分发和资源释放。

Cordis 论文把这两个问题称为时间可组合性和空间可组合性：前者关心组件移除时能否完整撤销副作用，后者关心组件能否声明并动态响应依赖变化。但该论文仍是持续修订的预印本，不应把它直接扩张成“Agent 已经实现自我进化”的产品事实。

### 四种模式是四套预设，不是四个新模型

| 模式 | 官方定位 | 适合场景 | 边界 |
|---|---|---|---|
| 标准模式 | 完整工具组合 | 日常开发和通用任务 | 能力多，上下文和权限管理也更复杂 |
| PTC 模式 | 让模型生成一段代码，组合多轮工具操作 | 结构化、多步、可编排任务 | 可能减少模型往返，实际成本与稳定性仍要用真实任务验证 |
| 极简模式 | 仅保留 shell 与文件编辑工具 | 最小环境的模型基准测试 | 它用于控制变量，不是普通用户的功能完整版 |
| 创造模式 | 检查当前运行时，在内存中试验插件并组合新预设 | 研究 Harness、制作插件或专用 Agent | 能创建和试验组件，不等于已证明可以稳定自我进化 |

### 会话是事件流，不只是一页对话

DeepSeek Harness 把会话设计成只追加的 `SessionEvent` 日志。一个轮次里，用户消息、模型请求与输出、工具调用与结果、轮次开始与结束都会成为事件。下一次模型看到的历史，也是从这份日志重新投影出来的。

这种设计有三个直接价值：

- **可观测：** 可以查看 Agent 在哪一步改变了方向，工具实际返回了什么。
- **可恢复：** 失败任务可以从已有事件边界恢复或分叉，不必只看最后的报错。
- **可审计：** 团队能把成本、权限、工具调用和结果联系起来。

它也带来一个管理问题：记录越完整，密钥、内部文件、敏感输出和日志保留策略就越需要被正式治理。“全程留痕”本身不自动等于安全。

## 同一个模型，Harness 真会改变结果吗

会，但现有数据只能支持这个较弱的结论。

Composio 在8月6日公开的一组小规模测试中，让同一个 DeepSeek V4 Flash 分别运行在 Oh My Pi、Claude Code、Codex 和 OpenCode 四种框架里，完成 30 项涉及 Gmail、GitHub、Slack 和 Notion 的任务。完成数分别是 17、16、16 和 14，每任务耗时与成功任务成本也不同。

这组数据说明 Harness 是可以被单独优化和评估的变量。它没有测试 DeepSeek Harness，也不能证明 DeepSeek Harness 领先。

## 三组独立体验告诉了我们什么

- **极客公园：** 发布当晚安装后，让它重构网站并调用 GitHub API 生成增长曲线，两项任务都完成，当时模型费用不到3元。该报道同时指出界面对非编程用户不够友好，预览版痕迹明显。
- **量子位：** 内测体验里用同一 V4 Flash 比较 DSH 与 Codex，有的视觉任务 Codex 结果更好，有的长任务中 DSH 更愿意继续迭代。这是体验样本，没有给出可复现的统一评测协议。
- **数字生命卡兹克：** 上手稿详细展示了四种模式、轨迹视图和社区插件，结论同样是架构很有趣，当前产品对普通用户仍不友好。

三组样本的共识是：插件化和轨迹日志有辨识度，开发者预览版的产品完成度仍有明显缺口。它们不能支持“已经赢下 Agent 竞争”这类强结论。

## 哪些说法现在还不能当真

| 说法 | 当前判定 | 原因 |
|---|---|---|
| DeepSeek Harness 整体优于 Codex 或 Claude Code | 未证实 | 缺少同任务、同配置、可复现的大样本测试 |
| 它是“Agent 时代的 Android” | 比喻与预测 | 开放架构已存在，稳定插件生态尚未形成 |
| Agent 可以通过 Cordis 稳定自我进化 | 研究方向 | 官方提供了创建与试验插件的机制，但未证明长期安全、稳定、可回归 |
| GitHub Star 高等于生产可用 | 错误推论 | Star 只能表示关注度，不代表成功率、安全性或维护成本 |
| 插件多就一定更好 | 错误推论 | 插件会扩大依赖、权限、兼容性和供应链治理范围 |

## 对不同人的行动建议

### 普通 AI 用户

不需要为了热度立即迁移。现在更值得记住的是一套新的选型问题：工具权限是否清楚，失败后能否恢复，过程是否可见，单任务成本是否可计算。

### 开发者

可以现在试，但要使用测试项目、独立工作目录和最小权限，同时预留插件与 API 破坏性变更的迁移成本。不要把主力仓库和生产密钥直接交给预览版。

### 团队技术负责人

把它当成一个 Harness 研究样本，不是已完成采购验收的产品。测试时至少记录：端到端任务完成率、人工介入次数、失败恢复率、单任务费用、权限弹窗和日志中的敏感数据暴露面。

## 事实台账

| 断言 | 分类 | 主要依据 | 可否作为结论 |
|---|---|---|---|
| 8月13日开放开发者预览版，以 MIT 许可证开源 | 已证实事实 | DeepSeek 官网、官方 GitHub | 是 |
| 模型、工具、会话、沙箱、存储、循环、调度和 UI 由插件组合 | 已证实事实 | DeepSeek 官网、架构文档 | 是 |
| Cordis 管理插件、服务依赖、事件和可逆副作用 | 已证实事实 | Cordis 入门与架构文档 | 是 |
| 会话采用只追加事件日志，支持回放、恢复与分叉 | 已证实事实 | DeepSeek 官网、架构文档 | 是 |
| 发布当晚已有媒体完成网站重构与 GitHub API 任务 | 第三方单次实测 | 极客公园 | 只能证明该样本成功 |
| DSH 的长任务表现整体优于 Codex | 未证实 | 个别媒体 Demo，无统一评测协议 | 否 |
| 插件生态将使 DSH 成为“Agent 时代的 Android” | 预测 | 媒体类比与社区热度 | 否 |

## 来源附录

### 一手来源

- [DeepSeek Harness 开发者预览版](https://www.deepseek.com/harness/)｜DeepSeek｜核对发布定位、插件架构、四种模式与事件流。
- [DeepSeek Harness 官方 GitHub](https://github.com/deepseek-ai/deepseek-harness)｜DeepSeek AI｜核对许可证、安装命令与开发者预览警告。
- [DeepSeek Harness 架构文档](https://github.com/deepseek-ai/deepseek-harness/blob/master/docs/architecture.zh.md)｜DeepSeek AI｜核对插件树、能力 seam、轮次流程与会话日志。
- [Cordis 入门](https://github.com/deepseek-ai/deepseek-harness/blob/master/docs/cordis-primer.zh.md)｜DeepSeek AI｜核对服务、依赖、类型化事件与可逆副作用。
- [A Programming Paradigm for Spatiotemporal Composability](https://github.com/cordiverse/paper)｜Cordiverse｜论文为持续修订的预印本。

### 交叉来源

- [DeepSeek Harness 实测：一夜 5 万星，Agent 界的 Android 来了](https://www.163.com/dy/article/L49SJTK405119FMA.html)｜极客公园｜2026-08-14｜安装、任务交付、成本与产品完成度样本。
- [深度体验 DeepSeek Harness，我原谅它涨价了](https://finance.sina.cn/tech/csj/2026-08-14/detail-inineywh3041305.d.html)｜量子位｜2026-08-14｜四种模式、轨迹功能、DSH 与 Codex 的个别 Demo。
- [从0到1带你速通 DeepSeek Harness](https://mp.weixin.qq.com/s/xkC1aenHFNSH2BxyzLDfcA)｜数字生命卡兹克｜2026-08-14｜产品上手、社区插件和普通用户门槛。
- [Composio 测试 Codex 等 4 个 AI 工具](https://www.ithome.com/0/986/967.htm)｜IT之家转述 Composio｜2026-08-07｜证明同模型在不同 Harness 中的结果、速度和成本可能不同；未测试 DSH。

---

**本账号判断：** 模型决定能力上限，Harness 影响能力兑现率。DeepSeek 这次最重要的尝试，是把这一层从厂商封装的产品内部拿出来，变成开放的组合问题。它值得开发者现在试，值得团队现在测，还不值得被当成已经完成的 Agent 终局。
