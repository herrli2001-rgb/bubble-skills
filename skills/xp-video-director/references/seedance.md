# Seedance 接入

只在本次需要实际视频生成或准备请求时读取。优先使用已连接且功能足够的视频工具；此脚本是缺少专用连接器时的本地API路径。

## 当前核验依据

2026-11-08对照火山方舟官方文档：

- [创建视频生成任务](https://docs.volcengine.com/docs/ark/create-video-generation-task-api?lang=zh)
- [查询视频生成任务](https://ark.volcengine.com/region:cn-beijing/docs/get-video-generation-task-api)
- [视频生成教程](https://console.volcengine.com/ark/region%3Acn-beijing/docs/video-generation-tutorial)

本地脚本仅覆盖首帧/首尾帧流程。请求中图片分别标为 `first_frame`、`last_frame`，任务创建后查询已有ID，成功再下载。其他参考图、视频编辑、延长和Draft模式应重新查对应官方文档，不能混进首尾帧请求。

模型ID、费用、可用分辨率、时长和音频能力在实际执行时重新确认。脚本不默认选择原文里的型号；请求参数放在JSON字段里，不追加弱校验文字标记。输入体积过大时改用服务支持的素材地址流程，不把图片自动上传到未知图床。

## 准备

脚本使用Python标准库，首尾帧技术检查另依赖ffprobe；抽帧还需要ffmpeg。最低Python版本3.9。`ARK_API_KEY` 从进程环境读取，不要求用户把凭据贴进聊天；凭据配置使用用户既有的安全方式。`SEEDANCE_MODEL_ID` 是可选的本地约定，表示本项目已核验可用的模型或接入点ID。

```bash
python3 "<本技能目录>/scripts/video_tools.py" doctor
```

doctor只显示二进制位置与环境变量是否存在，不打印值、不调用网络。内置生图工具可用性需由当前助手自行发现，这个本地脚本无法探测它。

## 1. 仅准备请求

已有镜头 `S001` 的提示词和两张图片后：

```bash
python3 "<本技能目录>/scripts/seedance.py" prepare \
  --model "$SEEDANCE_MODEL_ID" \
  --first frames/S001-first-v001.png \
  --last frames/S001-last-v001.png \
  --prompt-file prompts/S001-v001.txt \
  --duration 5 --ratio 16:9 --resolution 720p \
  --no-audio --watermark \
  --out prompts/S001-request-v001.json
```

上面5秒、720p和16:9只是命令示例，沿用本片需求和所选模型规格。只用首帧时省略 `--last`。声音和水印需求通过 `--audio` / `--no-audio`、`--watermark` / `--no-watermark`明确指定；默认无生成音频、有水印。

此步骤不访问网络、不消费额度。检查图片能否读取、首尾像素尺寸及目标比例后，把本地图片编码进请求JSON；输出只显示摘要。默认使用 `adaptive` 保持输入比例，明确给定比例时与图片核对。

脚本为本地Base64输入设置保守体积上限；超限时停止，不自动压缩画面或改用第三方上传服务。文件输出均使用新路径，避免覆盖旧版本。

## 2. 提交一个真实任务

先完成具体镜头检查，确认当前对话已经授权这次付费生成及预算范围，把镜头版本、估价和授权依据记进项目记录，再执行：

```bash
python3 "<本技能目录>/scripts/seedance.py" submit \
  --payload prompts/S001-request-v001.json \
  --receipt clips/S001-create-v001.json
```

这一步才会创建真实任务。脚本本身不判断聊天中的授权，也不自动算账户余额；这些由主导演在提交前落实。它不充值、不购额度、不替换模型。

提交前先独占创建回执文件；同一路径已存在时拒绝重复提交。POST最多发送一次。发生网络异常、超时或没有可用任务ID时保留 `uncertain` 状态，停止自动创建；同样内容不能换个回执名就重发。

脚本拒绝API跳转，避免把密钥带往其他地址。异常输出不回显请求头或任意服务端错误正文。

## 3. 查询已有任务

```bash
python3 "<本技能目录>/scripts/seedance.py" status \
  --task '实际任务ID' --out clips/S001-status-001.json
```

保留每次查询结果或复用项目既有日志方案。任务在运行时隔一段时间再查；持续跟进当前任务，不能用再次创建代替查询。遇到失败/过期/取消则记录原因，先判断是否能修复；需要重拍时重新核对输入与预算。任务和视频下载地址有时效，成功后及时下载，不把临时地址作为唯一交付。

脚本一次只做一次GET，不在内部长时间阻塞。由助手协调等待并更新用户，遵守当前环境的等待工具限制。

## 4. 下载及本地检查

```bash
python3 "<本技能目录>/scripts/seedance.py" download \
  --result clips/S001-status-003.json --out clips/S001-v001.mp4
python3 "<本技能目录>/scripts/video_tools.py" review-frames \
  clips/S001-v001.mp4 --out reviews/S001-v001 --fps 1
```

只有服务返回 `succeeded` 且有HTTPS视频地址时下载，不向媒体地址转发API密钥。下载中间文件使用 `.part`，失败保留它作为未完成证据；成功才出现最终目标文件。已有目标文件拒绝覆盖。

下载完成仍需实际解码、看图、播放，以及按任务要求听取音轨。任务成功只表示服务完成生成，不表示艺术质量或叙事已经通过。

## 未验证的范围

此技能创建时只做本地媒体与模拟HTTP验证，没有用用户账户发起付费视频生成。账户权限、余额、实时价格、模型可用性和具体输出质量必须在真实制作中确认。
