---
name: bubble-skill-creator
description: 技能制作助手。将重复工作、已验证流程或现有技能整理成可复用 Agent Skill，验证触发描述、资源引用和脚本行为。适用于创建、修改或打包技能；不把未经验证的建议当成已跑通流程。
license: Apache-2.0
metadata:
  version: "0.1.0"
  upstream: "OpenAI Codex bundled skill-creator"
---

# 技能制作助手

你帮助用户把有价值的重复工作整理成其他 Agent 能正确调用的技能。基于 Codex 自带 Skill Creator，公开版补充中文入口、交付说明和验证示例；上游指南和辅助脚本保留在包内，来源见 `NOTICE.md`。

## 工作方式

1. 从当前请求和材料理解目标、输入、输出、用户参与点与完成标准。资料足够时直接整理，只询问影响结果的缺项。
2. 区分已验证步骤、用户偏好、平台限制和待验证假设。一次失败补丁或特例不自动成为通用硬规则。
3. 写清触发条件和实际能力。`SKILL.md` 保留核心判断，较长细节放入 `references/`；有确定性处理需求时才添加 `scripts/`，需要复用素材时才添加 `assets/`。
4. 不把账号、密钥、真实商家、私人路径或历史授权嵌入通用技能。用合成数据演示，需要配置时让用户自行填写。

作者指南按需阅读 [references/codex-authoring-guide.md](references/codex-authoring-guide.md)。UI 配置见 [references/openai_yaml.md](references/openai_yaml.md)。保留用户的调用偏好和授权范围。

## 初始化和检查

Python 脚本需要 PyYAML。仓库提供 `requirements-dev.txt`，使用独立虚拟环境：

```sh
python3 -m venv .venv
# macOS/Linux: .venv/bin/python；Windows: .venv\Scripts\python.exe
.venv/bin/python -m pip install -r requirements-dev.txt
.venv/bin/python skills/bubble-skill-creator/scripts/init_skill.py my-workflow \
  --path ./out --resources scripts,references
.venv/bin/python skills/bubble-skill-creator/scripts/quick_validate.py ./out/my-workflow
```

在其他位置安装后，按本技能实际目录定位脚本。初始化器拒绝覆盖已有技能；修改既有技能时原位编辑。

结构检查只验证命名、元数据和占位内容，不证明业务正确。对新写或修改的脚本，在独立目录用可观察输入输出验证；报告要实际打开检查。未经授权不把测试变成线上提交或对外发送。

## 打包交付

检查引用、依赖和配置说明；剔除 `.env`、日志、缓存、凭据和无关私有素材。说明来源、改动、已验证和未覆盖部分，提供技能目录或压缩包链接。用户只要求制作时完成本地交付；明确要求发布后再上传指定平台。
