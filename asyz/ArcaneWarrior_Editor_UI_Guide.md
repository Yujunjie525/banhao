# ArcaneWarrior 编辑器 UI 与美术资源配置

## 一、使用方式

1. 用 Cocos Creator 2.4.6 打开 `assets/Scene/ArcaneWarrior.fire`。
2. 在层级管理器中展开 `Canvas`。所有固定 UI、模板节点和资源槽都已经建好。
3. 选中下表中的 Sprite 节点，把美术图片从资源管理器拖到 `Sprite -> Sprite Frame`。
4. 可以在编辑器中调整固定 UI 的位置、尺寸、锚点和字体，但不要修改本文件标记为“固定路径”的节点名或父子关系。
5. `TileTemplate`、`TilePalette`、`HeroPalette`、`MonsterTemplate`、`MonsterPalette`、`EffectTemplate`、`EffectPalette` 默认不激活，这是正常状态。运行时会读取这些节点上的 SpriteFrame，并克隆模板。
6. 战斗纵向固定显示 9 格，横向格数根据设备实际宽高自动计算（16:9 约为 16×9）；关卡地图尺寸不变，地块始终铺满可见区域。镜头平滑跟随人物并在地图边缘停止，屏幕外额外渲染一圈地块防止移动时突然出现。

注意：`tools/build-arcane-warrior-scene.js` 用于重新生成初始场景骨架。美术开始在编辑器里替换图片后，不要再执行该脚本，否则会覆盖场景里的手工资源绑定和布局调整。

> 说明：初始场景生成脚本已移除，现有 `ArcaneWarrior.fire` 直接在编辑器中维护。

## 二、节点层级与职责

### WorldLayer：地图

| 固定路径 | 编辑器中放置的内容 | 运行时职责 |
| --- | --- | --- |
| `WorldLayer/WorldBackdrop` | 1280x720 战斗背景图 | 地图下方的固定背景 |
| `WorldLayer/TileRoot` | 空节点 | 承载运行时克隆出的可见格子 |
| `WorldLayer/TileTemplate/BorderSprite` | 编辑器纯色方形 Sprite | 格子外边框；未解析暗灰、已解析灰青、解析预览亮青 |
| `WorldLayer/TileTemplate/BaseSprite` | 编辑器纯色方形 Sprite | 格子填充；未解析黑色、已解析灰青、解析预览深青绿 |
| `WorldLayer/TileTemplate/OverlaySprite` | 任意透明叠加图 | 格子状态叠加模板 |
| `WorldLayer/TileTemplate/RuneSprite` | 任意符文占位图 | 数字符文模板 |
| `WorldLayer/TileTemplate/RuneLabel` | 编辑器 Label | 符文图片未配置时显示 0-8 |
| `EntityLayer/HeroNode/PlayerBodyMarker` | 编辑器 Graphics | 人物立绘隐藏期间显示连续移动的红色圆形碰撞体 |
| `WorldLayer/TilePalette/*` | 对应状态的 SpriteFrame | 地图状态资源槽，详见第三节 |
| `WorldLayer/TilePalette/RunePalette/Rune0-8` | 0-8 九张透明符文图 | 解析后的周边封印数量 |

### EntityLayer：角色、怪物、特效

| 固定路径 | 编辑器中放置的内容 | 运行时职责 |
| --- | --- | --- |
| `EntityLayer/HeroNode/HeroSprite` | 任意角色占位图 | 玩家显示模板 |
| `EntityLayer/HeroPalette/C001-C005` | 五名角色立绘或俯视角色图 | 按当前选中角色换图 |
| `EntityLayer/MonsterRoot` | 空节点 | 承载运行时怪物 |
| `EntityLayer/MonsterTemplate/MonsterSprite` | 任意怪物占位图 | 怪物显示模板 |
| `EntityLayer/MonsterTemplate/CountdownLabel` | 编辑器 Label | 显示苏醒、存活或消散倒计时 |
| `EntityLayer/MonsterPalette/M001-M005` | 五类怪物图 | 按怪物配置换图 |
| `EntityLayer/EffectRoot` | 空节点 | 承载运行时特效 |
| `EntityLayer/EffectTemplate/EffectSprite` | 任意特效占位图 | 特效显示模板 |
| `EntityLayer/EffectPalette/Ring` | 透明扩散圆环 | 解析、复活等圆环反馈 |
| `EntityLayer/EffectPalette/Burst` | 透明放射爆裂 | 封印破坏反馈 |
| `EntityLayer/EffectPalette/Fade` | 透明烟尘或消散纹 | 怪物消散反馈 |

### HudLayer：固定战斗信息

| 固定路径 | 编辑器中放置的内容 |
| --- | --- |
| `HudLayer/LevelPanel` | 左上信息面板底图；子节点为关卡名和倒计时 |
| `HudLayer/MonsterTimerPanel` | 顶部怪物倒计时面板底图 |
| `HudLayer/PauseButton` | 暂停图标和 Button 组件 |
| `HudLayer/ExitDirection/ExitArrowIcon` | 朝右的出口箭头原图；代码只旋转该节点 |
| `HudLayer/ExitDirection/ExitDirectionLabel` | 出口距离文字 |
| `HudLayer/ExploreLabel` | 已解析百分比文字 |
| `HudLayer/TutorialHint` | 第一关教学提示文字 |
| `HudLayer/ToastLabel` | 局内短提示文字 |

### ControlLayer：操作区

| 固定路径 | 编辑器中放置的内容 |
| --- | --- |
| `ControlLayer/Joystick/JoystickBase` | 左下摇杆底盘 |
| `ControlLayer/Joystick/JoystickKnob` | 摇杆滑块 |
| `ControlLayer/AnalysisButton` | 右下解析按钮底图和 Button 组件 |
| `ControlLayer/AnalysisButton/ButtonLabel` | 按钮主文字 |
| `ControlLayer/AnalysisButton/AnalysisState` | 冷却、次数和准备状态文字 |

### PopupLayer：弹窗

| 固定路径 | 编辑器中放置的内容 |
| --- | --- |
| `PopupLayer/PopupPause` | 从 `youxi` 迁入的暂停弹窗，`Primary` 继续、`Secondary` 返回主页 |
| `PopupLayer/PopupRevive` | 从 `youxi` 迁入的复活弹窗，保留复活、重新挑战和返回主页 |
| `PopupLayer/PopupResult` | 从 `youxi` 迁入的失败结算弹窗，重新挑战或返回主页 |
| `PopupLayer/PopupWinResult` | 从 `youxi` 迁入的胜利弹窗，显示星级并进入下一关或返回主页 |
| `*/Mask`、`*/PanelBox`、`*/CenterImage` | 各弹窗自己的遮罩、面板和插图 Sprite |
| `*/TitleLabel`、`*/BodyLabel` | 各弹窗自己的标题和动态战斗结果文字 |
| `*/Primary`、`*/Secondary`、`*/Tertiary` | 旧版按钮图片；`Tertiary` 只用于复活弹窗的重新挑战 |

四个弹窗默认都关闭，代码按暂停、复活、失败、胜利结果只打开对应节点。当前使用的是 `youxi` 原始 UI 资源，后续可以逐个替换 SpriteFrame，不需要再改功能代码。

## 三、地图格子出图状态

运行中的一格由 `BorderSprite` 外框、`BaseSprite` 填充、`OverlaySprite` 状态叠加和 `RuneSprite` 数字符文组成。未解析、已解析和本次解析预览共用这套方形结构，只切换颜色；预览格还会整体抖动。人物由 `EntityLayer/HeroNode/PlayerBodyMarker` 独立显示，因此可以连续跨越格线，不会随格子跳动。不要把所有状态画在一张完整地砖里，否则状态组合时无法复用。

### 必需底图：5 张

| 资源槽节点 | 表现要求 |
| --- | --- |
| `UnknownA` | 未解析地块 A，暗、信息不可见 |
| `UnknownB` | 未解析地块 B，与 A 轻微纹理差异，用于消除重复感 |
| `RevealedA` | 已解析可行走地面 A，轮廓清晰 |
| `RevealedB` | 已解析可行走地面 B，与 A 轻微纹理差异 |
| `Blocked` | 不可通行墙体、深坑或实体障碍，必须和可行走地面明显区分 |

### 必需透明叠加：4 张

| 资源槽节点 | 表现要求 |
| --- | --- |
| `Preview` | 按住解析时的候选范围，高亮边框或扫描纹，中心透明 |
| `BrokenSeal` | 已触发封印，建议裂纹、破碎法印或红色叉痕 |
| `Exit` | 逃离模式出口，建议金色传送阵或门印 |
| `Start` | 出生点，建议低亮度蓝绿定位环，不能抢过出口 |

角色占位由 `EntityLayer/HeroNode/PlayerBodyMarker` 节点上的 `cc.Graphics` 绘制为红色实心圆；圆心使用连续地图坐标，可以停在任意格线中间。圆的直径和碰撞半径会按角色的 1/2/3 格体型同步缩放，人物立绘当前隐藏。

`TutorialTarget` 是预留的教学强调资源槽，当前玩法没有强制使用，可先不出图。

### 数字符文：9 张

`Rune0` 到 `Rune8` 表示该格周围八邻域内仍未触发的封印数量。建议做成同一套奥术数字或图形符号，不要使用普通系统数字截图。未提供符文图时会自动使用编辑器里的 `RuneLabel`，因此可以先完成底图再补符文。

### 地图图片技术规格

- 每张格子图统一为正方形 PNG，建议源文件 `128x128`，透明叠加和符文必须带 Alpha 通道。
- 游戏在 1280x720 下的实际逻辑格宽为 36 像素，代码会把 Sprite 等比槽位缩放到格子尺寸；所有状态图必须保持相同画布、中心点和边缘位置。
- 底图要能连续铺设。主要轮廓不要超出画布，边缘最好保留 1-2 像素安全区，避免图集采样串色。
- 若采用像素风，Texture 的 Filter Mode 统一设为 `Point`；若采用手绘或高清风格，统一使用 `Bilinear`，不要混用。
- `Preview`、`BrokenSeal`、`Exit`、`Start` 中央尽量透明，因为它们会叠在 `Unknown` 或 `Revealed` 底图上。
- 不要在地砖图片中绘制文字、倒计时或固定方向光影；镜头移动和状态组合后会显得错误。
- 推荐文件名：`tile_unknown_a.png`、`tile_unknown_b.png`、`tile_revealed_a.png`、`tile_revealed_b.png`、`tile_blocked.png`、`tile_overlay_preview.png`、`tile_overlay_broken_seal.png`、`tile_overlay_exit.png`、`tile_overlay_start.png`、`rune_0.png` 至 `rune_8.png`。

## 四、角色和 UI 出图建议

- `C001-C005`：透明 PNG，建议统一 `256x320` 画布、脚底对齐、朝向一致。代码会保持原图宽高比，将完整人物限制在策划配置的 N×N 占格方框内，不再额外放大高度。
- `M001-M005`：透明 PNG，建议统一 `256x256` 画布。2 格或 3 格怪物会按配置放大，主体要保留 10%-15% 安全边距。
- `Ring/Burst/Fade`：透明 PNG，建议 `256x256`，主体居中，不要带不透明底色。
- 背景图按 `1280x720` 横屏制作；需要适配全面屏时，重要信息放在中心 `1080x720` 安全区。
- 面板和按钮建议使用九宫格 Sprite，避免编辑器调整尺寸后边框拉伸；圆形摇杆、图标和箭头使用普通 Sprite。
- 出口箭头原图必须朝右，旋转方向由控制器计算。

## 五、代码与编辑器的边界

- 固定 UI 节点全部存在于 `.fire` 文件中，运行时不会 `new cc.Node` 或动态添加 Label、Button、Sprite、Graphics。
- 地图尺寸和怪物数量会随关卡变化，因此运行时只通过 `cc.instantiate` 克隆 `TileTemplate`、`MonsterTemplate` 和 `EffectTemplate`。
- 代码读取 `TilePalette`、`HeroPalette`、`MonsterPalette`、`EffectPalette` 上的 SpriteFrame。美术只需在编辑器中换图，不需要改控制器。
- 固定路径是脚本和场景之间的接口。可以改图片、颜色、字体、尺寸和位置，不要改固定路径中的节点名。
