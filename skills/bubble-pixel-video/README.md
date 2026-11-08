# 像素短视频工坊

自包含的像素室内短片工程：用户主题 → 分镜与台词 → 像素人物/场景 → 视频 → 独立横竖封面。参考示例见 `assets/reference/`；新主题必须调整场景叙事，不只更换标题。

## 使用

需要 Python 3、Node（版本范围见 starter/package.json）、npm，以及 Remotion 支持的浏览器。

```sh
python3 skills/bubble-pixel-video/scripts/bootstrap.py ./out/pixel-demo --theme '新的故事'
cd out/pixel-demo
npm ci
```

替换 `src/project.json` 与 `src/intro/script.ts` 的示例主题、场景和台词，按 [references/project.md](references/project.md) 适配角色、道具和封面。需要原创示例音轨时：

```sh
python3 ../../skills/bubble-pixel-video/scripts/make-original-audio.py .
npm run lint
npm run render:all
```

也可将音乐路径留空导出无声画面。若指定已安装的浏览器，设置 `REMOTION_BROWSER_EXECUTABLE` 为实际可执行文件路径；否则由 Remotion 按其支持方式处理浏览器。

输出：`out/video.mp4`、`out/cover-landscape.png`、`out/cover-portrait.png`。横竖封面分别排版，不用裁切代替。

## 许可与边界

- 模板自有代码按 MIT 发布，字体许可位于 `assets/starter/public/fonts/`。
- Remotion 等依赖遵循各自许可，使用前按实际用途核对。
- 示例不含第三方 BGM，不附带生图模型、配音服务或它们的额度。
- 工程复制及渲染验证与“任何主题都无需修改即可出片”是不同能力；改主题后仍需核对字幕、转场、声音和完整视频。
