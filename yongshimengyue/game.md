# 核心玩法开发指南（面向 AI 编码代理）
## 核心目标
基于当前游戏项目结构，强化功能，新增油箱功能，实现火车运行速度变化功能

## 1. 基础信息（必确认）
- **目标预制体路径**：D:\Work\cocos\NPPA\002\Game\assets\subgame\prefab\Game.prefab（核心根预制体，可补充其他需修改的预制体，如 CustomerItem.prefab/ShapeBox.prefab）
- **效果图路径**：Assets/Resources/Game/Art/New/效果图.png
- **资源素材目录**：Assets/Resources/Game/Art/New/（包含 fish_1.png ~ fish_5.png、shape_1.png ~ shape_4.png、maopai.png 等所有可用素材）
- **预制体关联的引用类**：Assets/GameViewRefs.cs（预制体上序列化的精灵/按钮/预制体引用都在此类中定义）

## 2. 操作步骤（AI 需执行）
### 步骤 1：分析效果图
- 识别效果图中的视觉元素：包含哪些鱼精灵（fish_*.png）、形状图片（shape_*.png）、背景/道具图片（maopai.png/beijing.png 等）；
- 记录元素的位置、层级、尺寸、显示顺序、交互状态（如是否默认显示/隐藏）；
- 对比当前预制体的资源引用，列出「效果图有但预制体缺失」「预制体有但效果图无」「资源引用路径错误」的差异点。

### 步骤 2：修改预制体资源引用
- 打开目标预制体（如 FishGameRoot.prefab），定位 `GameViewRefs` 组件中的序列化字段；
- 按效果图替换所有精灵/图片引用：
  - 例：若效果图显示 fish_3.png 作为核心鱼素材，需将预制体中对应字段的 Sprite 赋值为 `Assets/Resources/Game/Art/New/fish_3.png`；
  - 例：若效果图使用 maopai2.png 替换原 maopai.png，需更新预制体中对应的 Sprite 引用路径；
- 确保所有资源引用的路径为 `Resources/Game/Art/New/[文件名].png`（与素材目录一致，符合项目「Resources 硬编码路径」约定）；
- 调整元素的 RectTransform 组件（位置、大小、锚点），匹配效果图的视觉布局。

### 步骤 3：验证资源引用有效性
- 检查所有替换后的资源是否存在于 `Assets/Resources/Game/Art/New/` 目录（如 fish_1.png ~ fish_5.png 均已存在，无需新增）；
- 运行「Tools -> Fish -> Build Game Prefabs」重建预制体，确保无「FileNotFoundException」报错；
- 进入 Unity Play 模式，验证 SampleScene 中预制体加载后，视觉效果与效果图完全一致，无缺失资源的 Debug.LogError 日志。

### 步骤 4：保存与确认
- 保存修改后的预制体，确保未手动修改「FishGamePrefabBuilder」自动生成的内容（如需持久化修改，需同步更新 `FishGamePrefabBuilder.cs` 中的构建逻辑）；
- 生成修改报告：列出「修改的预制体字段」「替换的资源路径」「调整的布局参数」，便于人工复核。

## 3. 约束与注意事项
- 资源路径必须严格遵循项目约定：仅使用 `Resources/Game/Art/New/` 下的素材，且路径硬编码为 `Resources/Game/Art/New/[文件名]`（无需后缀 .png）；
- 禁止删除/新增素材文件，仅可替换预制体的资源引用；
- 若效果图中包含未在素材目录的资源（如无效果图中提到的 fish_6.png），需先提示「素材缺失」，而非随意替换；
- 修改后必须运行预制体重建工具，确保修改能被编辑器工具识别，且无运行时错误。

## 4. AI 辅助操作提示
- 搜索关键词：`GameViewRefs`、`FishGameRoot.prefab`、`Resources/Game/Art/New/`、`SaveAsPrefabAsset`；
- 验证命令：运行「Tools -> Fish -> Build Game Prefabs」后，检查 Unity Console 无报错；
- 输出要求：修改完成后，列出「预制体修改清单」+「视觉效果对比说明」，确保人工可快速核验。