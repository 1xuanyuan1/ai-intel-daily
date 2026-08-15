---
title: "Composio 八大 Agent Harness 实测：同跑 DeepSeek V4 Flash，Pi 20 项第一"
date: 2026-08-15
updated: 2026-08-15
layout: post
description: "Composio 用 DeepSeek V4 Flash 在 8 种 Agent Harness 上执行 30 项多应用任务；Pi 完成 20 项，OpenCode 完成 14 项。本文为原报告完整中文译编。"
categories:
  - 评测报告
cover: /assets/images/ai-intel-signal-matrix.jpg
banner: /assets/images/ai-intel-signal-matrix.jpg
status: translated-report
topic: DeepSeek V4 Flash Agent Harness Benchmark
original_published_at: "2026-08-11"
fact_checked_at: "2026-08-15T09:40:25+08:00"
timezone: Asia/Shanghai
tags:
  - DeepSeek
  - Harness
  - Agent
  - Composio
  - Pi
  - OpenCode
---

> **原文：** [Finding the Best Harness for DeepSeek V4 Flash](https://composio.dev/content/best-agent-harness-deepseek-v4-flash)<br>
> **作者：** Sunil Kumar Dash｜**发布：** 2026 年 8 月 11 日｜**来源：** Composio<br>
> **编者说明：** 本文为完整中文译编，保留原报告的测试方法、数据、限定条件与结论；小标题和个别长句按中文阅读习惯调整。评测由 Composio 发布，本站未独立复跑这 240 次任务。

## 核心结果

Composio 让 **DeepSeek V4 Flash** 分别运行在 8 种 Agent Harness 中，执行 30 项涉及多个 SaaS 应用的长流程任务。

- **Pi Agent：** 完成 20 项，通过率 66.7%，为报告中的最高成绩。
- **OMP：** 完成 17 项，通过率 56.7%。
- **Claude Code、Codex、DeepAgents：** 各完成 16 项，通过率均为 53.3%。
- **Hermes Agent：** 完成 15 项，通过率 50.0%。
- **OpenCode：** 完成 14 项，通过率 46.7%。
- **Prime Agent：** 24 次有效运行中完成 15 项，报告通过率为 62.5%；另有 6 次运行未计入这一比例。

这组结果支持一个清晰结论：**即使使用相同的基础模型，不同 Harness 也会显著改变任务成功率、耗时、Token 消耗和成本。**

但“完全同条件”需要加一个限定：原报告明确说明，Pi 使用了不同的推理设置，并接入了两个模型供应商，因此它的成本数据不能与其他 Harness 直接横向比较。

## 为什么要比较 Harness

Agent Harness 是当下最热门的词之一。几个月前，它还很少出现在 AI Agent 的讨论中。随着编程 Agent 和通用 Agent 找到产品市场契合点，并开始消耗数量大得多的 Token，几乎每家前沿 AI 实验室以及一批新公司都开始推出自己的 Harness，例如 Hermes、Pi、OMP 和 Prime Agent。

这并不奇怪。Harness 是把模型能力转化为实际经济价值的“最后一公里”。

Prime Agent 使用 Opus 5 时，曾在 [ARC-AGI 3 上取得 95.50%](https://x.com/PrimeIntellect/status/2085087000764568010) 的成绩，明显高于对应模型在自有 Harness 中的表现。

DeepSeek V4 Flash 则是当前很值得关注的模型。按照 [Artificial Analysis](https://artificialanalysis.ai/models/deepseek-v4-flash) 的数据，它的智能指数得分为 52，低于 Opus 5 Max 的 63，但 Composio 称其成本低约 50—90 倍。

Agent 任务需要同时平衡智能水平与调用成本，这使 DeepSeek V4 Flash 很适合用来观察 Harness 的影响。

我们已经知道 Harness 可以改善结果，但每种 Harness 的运行方式不同，效率与成本也会变化。因此，Composio 把 DeepSeek V4 Flash 放进 8 种不同 Harness，让它们执行涉及多个 SaaS 应用的长流程任务。

## 评测怎么做

测试由 30 项高难度工作流组成。所有 Harness 使用相同的 Composio 托管 MCP 工具，每项任务最多运行 900 秒。

这些工作流要求 Agent 在 Airtable、Gmail、Google Calendar、Google Sheets、GitHub、Slack 和 PostHog 等多个 SaaS 应用之间操作，并给出可以被独立验证的结果。

### 任务示例一：同步 Google Sheets 名单与 Google Calendar

从电子表格读取 40 场活动，使用精确的活动 ID 找到对应的日历事件；原地更新内容错误的事件，创建缺失事件，同时不得修改无关事件和源表格。

### 任务示例二：核对 GitHub Issue 与 Linear

找出所有同时包含评测标签和 Linear Issue ID 的开放 GitHub Issue；验证每个 ID 是否真实存在于 Linear，检查它是否处于已完成状态，并返回精确映射，全程不得修改两个系统中的数据。

### 任务示例三：在 Gmail、Sheets 与 Slack 之间同步支持工单

在 Gmail 中找出符合条件的支持工单，把内容原样写入 Google Sheets 台账；使用关联账号回复每一张已记录工单，再把最终数量发到正确的 Slack 线程。诱饵工单和被排除的工单必须保持不变。

## 怎样判定成功

每种 Harness 都得到一套相互隔离的测试环境，并用唯一运行标签标识。环境中既有真正的目标数据，也有文件名相似、键值几乎相同、记录无关等诱饵，用来识别范围过大的错误操作。

Agent 结束任务后，程序化验证器会检查相连应用中的真实状态。Composio 没有再用一个 LLM 判断答案“看起来是否正确”。

验证器会检查：

- 是否找到了正确记录；
- 计算和报告数值是否精确；
- 是否完成了要求的全部操作；
- 诱饵和无关数据是否保持不变；
- 最终回答是否符合规定格式；
- 是否实际使用了要求的服务商工具。

只有全部检查项通过，一次运行才算成功。部分执行数据会被保留用于调试，但榜单采用二元计分：只有通过或失败。

例如，一名 Agent 正确更新了 Google Sheets 中要求修改的所有单元格，却在最终回答里报告了错误的行号。它通过了 12 项检查中的 11 项，但整个工作流仍被判定失败。

另一次任务中，Agent 使用了正确的 PostHog 工具，也返回了合法 JSON，却把事件数量算成 133；验证器独立核出的数量是 148，因此同样失败。

这个标准看起来严格，却更接近 Agent 的生产使用场景：即便改对了记录，如果报告了错误结果，或者完成任务时误改了无关数据，都应该算失败。

## 总体结果

8 种 Harness 共执行 240 次任务，其中 129 次成功，总通过率为 53.8%。30 项工作流中，只有 6 项被所有 Harness 成功完成。

| Harness | 完成情况 | 报告通过率 | 中位耗时 | 每次成功成本 |
|---|---:|---:|---:|---:|
| Pi Agent | 20 / 30 | 66.7% | 132.2 秒 | 0.028 美元 |
| Prime Agent | 15 / 24 次有效运行 | 62.5%\* | 242.1 秒 | 0.131 美元 |
| OMP | 17 / 30 | 56.7% | 272.4 秒 | 0.103 美元 |
| Claude Code | 16 / 30 | 53.3% | 122.7 秒 | 0.195 美元 |
| Codex | 16 / 30 | 53.3% | 245.0 秒 | 0.081 美元 |
| DeepAgents | 16 / 30 | 53.3% | 187.1 秒 | 0.045 美元 |
| Hermes Agent | 15 / 30 | 50.0% | 175.5 秒 | 0.056+ 美元 |
| OpenCode | 14 / 30 | 46.7% | 129.7 秒 | 0.073 美元 |

\* Prime Agent 有 6 次运行未计入其通过率：其中 2 次因为会话规模过大，验证器超时；另有 4 次没有记录下来。Prime 的大型会话最多达到 350 万 Token 和 33 次工具调用。

> **口径提示：** 原报告的“总体通过率”以全部 240 次运行计算，即 129 ÷ 240；Prime Agent 自身的 62.5% 则只按 24 次有效运行计算，即 15 ÷ 24。阅读排名时应注意这两个分母不同。

## 通过率

Pi 的报告通过率最高：30 项任务中完成 20 项，得分 66.7%。

Prime Agent 的报告通过率为 62.5%，即 24 次有效运行中完成 15 次。因为前述 6 次无法评分的运行被排除，所以 Prime 的比例不能简单按 30 次任务计算。

OMP 完成 17 项，通过率 56.7%。Claude Code、Codex 和 DeepAgents 各完成 16 项，均为 53.3%；Hermes 完成 15 项，为 50.0%；OpenCode 完成 14 项，为 46.7%。

没有一种 Harness 在所有指标上都取得最好结果。原报告认为，在可直接比较的结果中，OMP 通过率最高，Claude Code 耗时最短，DeepAgents 的单次成功成本最低。

## 每项任务平均消耗多少运行时 Token

| Harness | 每项任务平均运行时 Token |
|---|---:|
| Prime Agent | 约 140 万 |
| OMP | 约 74.2 万 |
| Claude Code | 约 74.2 万 |
| OpenCode、DeepAgents、Codex | 各自在约 66.5 万—69.2 万之间 |
| Pi Agent | 约 55.9 万 |
| Hermes Agent | 约 19.2 万 |

Prime Agent 消耗的运行时 Token 最多，平均每项任务约 140 万，明显高于其他 Harness。

这里的“运行时 Token”包括 Harness 在 Agent 循环中处理的上下文，和用于计算费用的输入、输出 Token 不是同一组统计值。不同 Harness 计算运行时 Token 的方式也可能不同，因此这些数字只能作为近似比较。

## 中位完成时间

Claude Code 的中位完成时间最短，为 122.7 秒；OpenCode 为 129.7 秒，Pi 为 132.2 秒。Hermes 用时 175.5 秒，DeepAgents 为 187.1 秒。Prime Agent 和 Codex 都接近 4 分钟，OMP 最慢，为 272.4 秒。

Token 消耗与完成时间并不完全同步。Claude Code 与 OMP 每项任务都处理约 74.2 万运行时 Token，但 Claude Code 的完成时间不到 OMP 的一半。Hermes 只处理约 19.2 万 Token，用时却仍长于 Claude Code。

原因在于，完成时间还包括工具调用、网络请求、重试和 Harness 自身处理。一种 Harness 可能用少数几次大请求处理很多 Token；另一种 Harness 也可能处理较少 Token，却要串行发起多次调用并等待每次结果。

完成得快也不一定通过得多。Claude Code 是可比 Harness 中最快的，但 OMP 多完成了一项任务。OpenCode 的速度几乎追上 Claude Code，通过率却是报告中最低的。

## 每次成功任务的成本

报告采用下面的公式：

```text
每次成功成本 = 总成本 ÷ 成功任务数
```

Claude Code 的每次成功成本最高，为 0.195 美元。它的总 Token 使用量与 Codex、OMP 接近，但几乎所有输入 Token 都按“新输入”费率计价。

Claude Code 只有 1.5% 的 Token 来自缓存，Codex 约为 70%，OMP 约为 57%。新输入的价格是缓存输入的 5 倍，因此成本差距被明显拉大。

Claude Code 在 30 项任务上总计花费 3.12 美元，成功 16 项；平均每项任务花费 0.104 美元，每次成功花费 0.195 美元。

这也说明，只看 Token 数量无法解释最终成本。新输入、缓存输入和输出 Token 的构成，以及最终通过率，都会影响“每次成功成本”。

Pi 的报告成本最低，每次成功为 0.028 美元。但 Pi 使用了不同的推理设置和两个模型供应商，因此不能直接与其他 Harness 比成本。

其余 Harness 的每次成功成本为：

- DeepAgents：0.045 美元；
- Hermes：0.056+ 美元；
- OpenCode：0.073 美元；
- Codex：0.081 美元；
- OMP：0.103 美元；
- Prime Agent：0.131 美元；
- Claude Code：0.195 美元。

Claude Code 与 DeepAgents 的通过率相同，都是 53.3%，但 Claude Code 每完成一次成功任务的成本超过 DeepAgents 的 4 倍。

这些成本根据记录下来的 Token 使用量与模型供应商价格估算，属于 API 成本估计。Hermes 有两项任务超时，且没有保存最终用量数据，所以它的实际成本高于报告值。

## Harness 的影响是真实存在的

Harness 对 Agent 的影响可以和模型本身一样重要。它会明显改变成本、速度和可靠性。因此，各大 AI 实验室纷纷开发自己的 Harness，同时也有强劲的开源方案在短时间内出现。

不过，最合适的 Harness 仍取决于你要解决的任务。未来，企业很可能会像评测模型一样，使用自己的内部工作流评测 Harness，并关注一套“Harness 经济学”：

- Token 消耗；
- 完成时间；
- 总成本；
- 每次成功结果的成本。

对于同一个任务，选对模型与 Harness 的组合，可能同时改变以上四项指标。

Harness 正是连接模型智能与真实经济价值的最后一公里。

## 如何正确使用这份报告

这份评测最能支持的结论，是 **Harness 本身值得被当作独立变量测试**。它不能直接证明 Pi 在所有类型的 Agent 任务中都优于 OpenCode，也不能证明这组排名可以原样迁移到代码修改、浏览器操作或企业内部流程。

如果团队正在选型，更稳妥的做法是复用报告的思路：固定模型、工具、任务环境和超时上限，用自己的真实工作流分别记录成功率、人工介入次数、耗时、总成本和单次成功成本。

## 来源

- [Finding the Best Harness for DeepSeek V4 Flash](https://composio.dev/content/best-agent-harness-deepseek-v4-flash)｜Composio｜2026-08-11｜本文唯一原始报告与全部评测数据来源。
- [Artificial Analysis：DeepSeek V4 Flash](https://artificialanalysis.ai/models/deepseek-v4-flash)｜原报告用于比较模型智能指数与价格的引用来源。
- [Prime Intellect：Prime Agent 的 ARC-AGI 3 成绩](https://x.com/PrimeIntellect/status/2085087000764568010)｜原报告引用的 Harness 表现案例。

---

**AI 情报主编判断：** 过去大家习惯问“哪个模型最强”，这份测试提醒团队再多问一句：“这个模型放在哪套 Harness 里，能以多大成本稳定完成我的任务？”模型决定能力上限，Harness 影响能力兑现率；最终应该优化的不是单次跑分，而是每一次可靠结果的成本。
