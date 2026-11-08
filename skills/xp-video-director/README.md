# xp视频导演skill

从想法、故事和分镜，推进到画风设定、首尾帧、视频片段、剪辑与复核。与像素视频模板不同，它是工具可替换的制作流程，不限定画风。

## 前置条件

Python 3.9+、FFmpeg/ffprobe；图像生成由当前宿主提供。实际视频生成需要用户自行开通和配置可用的视频服务；随包 Seedance 脚本只覆盖首帧/首尾帧请求，不包含模型或额度。

```sh
python3 tools/install.py --skill xp-video-director
python3 skills/xp-video-director/scripts/video_tools.py doctor
```

Windows 通常使用 `python`。在支持 Agent Skills 的宿主中调用 `$xp-video-director`，给出想法、时长、画风、比例和已有参考。也可以只要求完成分镜、提示词或输入检查。

先完成本地可审阅资产，再按用户已有预算授权提交真实任务。API 密钥只通过本机安全配置或环境变量提供，不发送到聊天。

## 随包工具

- `video_tools.py doctor`：检查 Python、FFmpeg/ffprobe 和配置存在性，不打印密钥。
- `video_tools.py check-pair`：检查首尾帧尺寸和比例，不能代替视觉审核。
- `seedance.py prepare`：只生成本地请求，不联网、不消费额度。
- `seedance.py submit/status/download`：分别创建真实任务、查询已有任务、下载成功片段；创建超时保留不确定回执，不自动重发。
- `video_tools.py review-frames`：提取全片样帧与切点前后帧，交给宿主实际查看。

命令参数和示例见 [Seedance 接入](references/seedance.md)，创作流程见 [SKILL.md](SKILL.md)。

## 来源和验证

方法来源及公开范围见 [NOTICE.md](NOTICE.md)。原作者完整提示词、文章截图与源视频不包含在本包中。

发布验收使用合成媒体和模拟 HTTP，不创建真实付费任务；模型账户权限、实时价格和实际成片质量尚需真实制作验收。首次提交前先核对这些条件。
