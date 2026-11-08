# 自带工程的使用与适配

模板位于 `assets/starter/`，不依赖原聊天文件。它包含原案例可运行的室内美术与人物代码；内容是待替换示例，不是新主题成片。

```sh
python3 <skill目录>/scripts/bootstrap.py <新的绝对路径> --theme '新主题'
cd <新的绝对路径>
npm ci
```

bootstrap拒绝覆盖已有目录。已有用户工程应原位适配，不重新初始化。Node版本遵循package.json；依赖锁定为已跑通的Remotion 4.0.536与React 19.2.3，按本机需要更新时同步所有 `@remotion/*` 包。

## 改主题的文件地图

| 文件 | 需要决定/修改的内容 |
|---|---|
| `src/project.json` | 主题、横竖标题分行、场景顺序、速度、转场类型、音乐路径 |
| `src/intro/script.ts` | 阶段/地点、两行旁白、头顶心声、源帧事件；替换旧主题文字 |
| `ParentsPressure.tsx` / `PressureVoices.tsx` | 仅在适合压力的情节使用；每句文案、出现次序、布局与句数 |
| `actors.ts` | 身份轮廓、衣服、道具、表情与表演；新增角色/动作按场景隔离 |
| `living.ts` / `dorm.ts` / `office.ts` / `bedroom.ts` | 对应房间；新场景另建文件并接入SceneRenderer |
| `SceneRenderer.tsx` | 场景绘制路由、统一时间、心声与字幕层、安全区 |
| `MaterialTransition.tsx` | 道具遮挡及切点；换道具时也改发起位置 |
| `Cover.tsx` / `PortraitCover.tsx` | 两种封面版式及思考人物；长标题须分别调整字号与间距 |
| `Film.tsx` / `project.ts` | 由源时长/速度计算输出帧数、转场扣时与音轨；不内嵌封面 |

模板 `scenes` 使用示例内部id `parents/dorm/office/relatives`；id是场景类型，不要求新故事仍叫父母、考研或催婚。可替换场景含义、角色关系或新增类型。改完搜索旧年龄、事件、封面文字与压力台词，确认实际出片的分支全部适配；未使用的备用场景可以保留。不能只改标题就交付新主题。

`project.json` 中每个场景的 `playbackRate` 是相对源动画的绝对速度。源时长在 `sceneData[id].duration`；输出帧数等于 `round(sourceFrames / rate)`。场景间用配置的 `transitionFrames` 重叠。最后一段不扣出场转场。`Film` 第一帧就是剧情，无卧室预告、封面片头。

用户要求很短的demo或单镜约3秒时，除了源时长还要调整入场/退场时间：`SceneRenderer` 中字幕入场参考源帧35、离场从 `duration-47` 开始；`Film` 的尾部遮罩默认占12个输出帧。这些是原案例的节奏，短镜直接截断会压缩可读窗口。按新镜头重新安排气泡、表演及淡入淡出，并从实际视频检查文字完整停留的时间。

## 音频与导出

没有指定音乐时可先生成一段低音量原创音轨：

```sh
python3 <skill目录>/scripts/make-original-audio.py <工程目录>
```

脚本按工程当前时间线生成BGM和轻微转场拟音，并设置对应路径；没有下载第三方素材。若用户给了音乐，放入 `public/audio/` 并配置 `musicFile`，保持音乐原速，拟音跟随转场。改片长/速度后重新对齐音频，不仅截视频。

```sh
npm run lint
npm run render:all
```

只导出其中一项可使用 `render:video` / `render:landscape` / `render:portrait`。三个固定输出为 `out/video.mp4`、`out/cover-landscape.png`、`out/cover-portrait.png`。封面注册为Still，视频注册为PixelFilm，各场景也有独立组合便于检查。

默认CLI自动检测本机Chrome；无本机Chrome时用Remotion支持的浏览器。用Node渲染API时配置文件不自动生效，需传 `browserExecutable`。先检关键帧，再出整片；导出后从实际MP4抽帧复查，检查总时长、音轨、字幕末尾与转场中点。
