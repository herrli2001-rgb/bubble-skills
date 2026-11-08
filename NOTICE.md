# 来源与许可

本仓库由 bubble lxp 维护。不同目录按各自许可发布，根目录 MIT 许可不覆盖第三方代码或依赖的独立许可。

| 目录 | 来源 | 公开版处理 | 许可 |
|---|---|---|---|
| `skills/bubble-watch` | [bradautomates/claude-video](https://github.com/bradautomates/claude-video)，本机安装的 0.2.0 快照 | 保留脚本，包含本地 FFmpeg `-fps_mode` 兼容改动；补中文入口和离线验证；原指南在 references 中 | MIT，保留 Bradley Bonanno 的版权声明 |
| `skills/bubble-skill-creator` | [OpenAI Skill Creator](https://github.com/openai/skills/tree/main/skills/.system/skill-creator)，Codex 随附版本 | 保留脚本、作者指南和包内 Apache 许可；新写中文入口 | Apache-2.0；未将本机快照冒充某个上游提交 |
| `skills/bubble-pixel-video` | 已有本地像素短片工程与自包含模板 | 去掉个人源目录，增加跨平台浏览器配置与公开说明；不含原案例第三方 BGM | 自有代码 MIT；字体及运行依赖见下 |
| `skills/bubble-product-followup` | 既有新品跟进工作方法 | 重新实现通用本地报价/定价计划；不复制内部平台适配器、真实商家、表格或历史记录 | 本公开实现 MIT |
| `skills/bubble-weekly-report` | 既有图文周报工作方法 | 重新实现本地 HTML/Markdown 输出；去掉企业模板、姓名、ERP、私人链接与历史授权 | 本公开实现 MIT |
| `skills/bubble-product-images` | 既有电商参考图工作流的通用需求 | 重新编写工具无关入口和画廊脚本；不分发来源未核实的 OpenDesign 原文件 | 本公开实现 MIT |

## xp视频导演skill

新增 `skills/xp-video-director`：参考 Eian（@EianLu）的创作方法，发布独立整理的流程和本地辅助实现；不附文章全文、源视频、截图或原作者完整提示词。许可和验收范围见该目录的 NOTICE 与 README。

## 像素字体与运行依赖

- 模板包含 Fusion Pixel 字体，保留其 OFL 及底层字体许可文件：`skills/bubble-pixel-video/assets/starter/public/fonts/`。
- React、Remotion 及其他 npm 包通过 `npm ci` 安装，不把依赖包复制进仓库。各依赖按其自身许可使用；仓库 MIT 许可不替代 Remotion 的使用条件。
- Watch 使用系统安装的 FFmpeg、yt-dlp 和可选转写服务；本仓库不分发这些二进制、不包含 API Key。
- 参考视频为本地模板的无声演示；没有捆绑第三方音乐。

`source-snapshot.json` 记录复制源文件的初始相对路径和 SHA-256，用于追溯打包前内容，不含个人源路径。公开版改动以 Git 历史为准。
