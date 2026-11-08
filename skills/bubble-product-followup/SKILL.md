---
name: bubble-product-followup
description: 电商新品跟进助手。整理供应商报价、核对商品规格、按用户指定规则计算建议售价并生成差异清单。适用于新品录入、报价变动核对和跟进计划；公开版本仅生成本地文件，不自动提交平台售价或上架。
license: MIT
metadata:
  version: "0.1.0"
---

# 电商新品跟进助手

你负责把供应商的零散资料整理成用户能核对、能继续执行的新品跟进计划。先读取本次材料和规则，明确已有信息，缺什么就问什么。

## 开始工作

1. 确认本批目标：登记报价、核对变价、补链接/图片、还是修改平台商品；分别记录状态。
2. 收集供应商、供货商品编号、SKU、准确规格、供货价和来源线索。长编号作为文本处理。用“供应商 + 供货商品编号 + SKU + 规格”精确区分，不能按名称相似度自动合并。
3. 询问实际定价规则和取整方法；示例参数不作为用户默认规则。不把加价率当作毛利率。
4. 有旧表时核对旧采购价与旧售价。只要求核对采购价变动时，不顺便重算未变价商品。

## 本地审核清单

脚本只使用 Python 标准库，不访问网站、凭据或浏览器。规范化 CSV 字段见 [examples/quotes.csv](examples/quotes.csv)，已有跟进表见 [examples/current.csv](examples/current.csv)。重复身份会报错，先解决歧义。

在仓库根目录运行：

```sh
python3 skills/bubble-product-followup/scripts/prepare_followup.py \
  --quotes skills/bubble-product-followup/examples/quotes.csv \
  --current skills/bubble-product-followup/examples/current.csv \
  --policy skills/bubble-product-followup/examples/pricing-policy.json \
  --out ./out/quote-demo
```

实际使用时替换为本批文件。Windows 可使用 `python`。输出目录必须是新目录。

- `markup`：采购价乘 `multiplier`。
- `margin`：采购价除以 `(1 - target_margin)`。
- `round_up_to`：明确的向上取整步长，例如 `0.1`。货币用 Decimal 计算。
- 采购价未变的已有记录保留旧售价，标记 `unchanged`；新商品和采购价变动分别为 `new`、`cost_changed`，等待审核。

交付 `followup-plan.csv`、`followup-plan.json` 和本批说明。CSV 导入 Excel 时把商品编号和 SKU 列指定为文本；JSON 保留完整字符串。检查数量、规格、价格和未匹配项，提供可点击的绝对路径链接。

## 用户要求继续操作平台时

本公开包不附带特定平台写入脚本或店铺配置。只能使用当前宿主实际可用且获授权的平台工具。执行前检查登录需求，提醒用户在自己的账号中登录；浏览器被其他任务占用时使用独立会话，不抢占业务标签页。

先给出准确店铺、商品身份、改前值、改后值和范围，沿用本次已有授权。只读检查和保存草稿不能算已改价/已上架。提交后重新读取目标商品和未改规格核验；状态未知时先核对，不重复提交。

用户只要求本地整理时，到文件交付即完成。图片和链接只登记有明确来源的材料，不用包装图冒充主图，不上传未授权公开的资料。
