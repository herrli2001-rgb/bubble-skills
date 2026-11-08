# Bubble Skills

**bubble lxp** 的七个实用 Agent Skills：视频理解、技能制作、像素短片、电商新品跟进、图文周报、商品图与视频导演。

一个懂点电商和金融的 AI 开发者。此仓库聚焦已经整理出来的工具与工作流；具体来源和改动见 [NOTICE.md](NOTICE.md)。

## 技能目录

| 技能 | 能做什么 | 需要什么 |
|---|---|---|
| [视频理解助手](skills/bubble-watch) | 提取视频画面和字幕，按时间点问答与总结 | Python、FFmpeg/ffprobe、yt-dlp；宿主需能看图片；转写可选 |
| [技能制作助手](skills/bubble-skill-creator) | 中文引导创建技能、初始化目录、检查结构和辅助脚本 | Python + PyYAML；基于 Codex 随附 Skill Creator |
| [xp视频导演skill](skills/xp-video-director) | 故事、分镜、首尾帧、Seedance 任务与成片复核 | Python、FFmpeg；另配生图与视频服务，未验收真实付费生成 |
| [像素短视频工坊](skills/bubble-pixel-video) | 自带 Remotion 工程，交付短片和横竖封面 | Node、npm、可用浏览器；字体许可已保留 |
| [电商新品跟进助手](skills/bubble-product-followup) | 报价整理、精确定价、旧价差异清单 | Python；实际定价规则由使用者提供 |
| [图文周报助手](skills/bubble-weekly-report) | 根据事实与证据生成本地 HTML/Markdown 周报 | Python；真实工作记录与适合交付的图片 |
| [电商商品图助手](skills/bubble-product-images) | 引导制作主图/卖点图/场景图，打包本地审核画廊 | 支持参考图的生图工具；Python 用于画廊 |

**公开预览版 v0.1.1。** 不附带模型、账号或付费 API 额度。新品跟进不含平台自动改价/上架适配器；周报不自动访问企业文档；商品图脚本只整理实际生成的图片，不自行调用生图服务。

## 安装

先克隆仓库：

```sh
git clone https://github.com/herrli2001-rgb/bubble-skills.git
cd bubble-skills
python3 tools/install.py --list
python3 tools/install.py --skill bubble-watch
```

Windows 将 `python3` 替换为 `python`。安装器默认复制到当前用户的 `~/.codex/skills/`，不覆盖已有目录。也可指定其他支持 Agent Skills 的宿主目录：

```sh
python3 tools/install.py --skill bubble-weekly-report --dest /path/to/host/skills
# 安装全部七项
python3 tools/install.py --all
```

在宿主重新加载技能后，用 `$bubble-watch` 等技能名调用。可以按需手动复制`skills/` 下的单个技能目录；不必安装全部依赖。每项说明中的仓库命令从仓库根目录运行，安装后按实际技能目录定位脚本。

## 快速运行示例

下面只运行本地功能，不提交店铺操作、不发送周报、不调用生图或转写 API：

```sh
python3 skills/bubble-product-followup/scripts/prepare_followup.py --quotes skills/bubble-product-followup/examples/quotes.csv --current skills/bubble-product-followup/examples/current.csv --policy skills/bubble-product-followup/examples/pricing-policy.json --out ./out/quote-demo
python3 skills/bubble-weekly-report/scripts/build_report.py skills/bubble-weekly-report/examples/week.json --out ./out/weekly-demo
```

输出目录使用新路径，避免覆盖先前交付。示例供应商、编号、报价和周报均为合成数据。

Watch 可在本地视频上使用：

```sh
python3 skills/bubble-watch/scripts/watch.py /path/to/video.mp4 --detail balanced --no-whisper --out-dir ./out/watch-demo
```

脚本交付画面路径与字幕；由宿主模型读取证据作答。可选转写会向配置的服务发送音频，密钥应私下填写在本机配置或环境变量中。

像素视频见 [使用说明](skills/bubble-pixel-video/README.md)。商品图需先准备实物参考图和生成结果，见 [技能说明](skills/bubble-product-images/SKILL.md)。

## 开发验证

```sh
python3 -m venv .venv
.venv/bin/python -m pip install -r requirements-dev.txt
.venv/bin/python tools/validate_publication.py
.venv/bin/python -m unittest discover -s tests -v
```

Windows 使用 `.venv\Scripts\python.exe`。CI 运行结构检查与离线样例；本机发布验证记录见 [docs/VALIDATION.md](docs/VALIDATION.md)。这些测试不证明所有视频站点、模型服务或在线商家平台可用。

## 来源与许可

- Watch 基于 [bradautomates/claude-video](https://github.com/bradautomates/claude-video)，保留 MIT 许可。
- Skill Creator 基于 [OpenAI 的实现](https://github.com/openai/skills/tree/main/skills/.system/skill-creator)，保留包内 Apache-2.0 许可。
- 本仓库新写代码与说明使用 MIT；字体、依赖和各目录的独立许可不变。详见 [NOTICE.md](NOTICE.md)。

问题和改进建议可在本仓库 Issues 提出。请勿在 Issue 中提交密码、API Key、账号凭据、私人业务数据或未脱敏截图。
