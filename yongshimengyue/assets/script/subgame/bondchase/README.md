# 盟约追逐（无尽模式）灰盒实现

这套代码与主玩法 `YSMYBattle` 隔离，不修改主玩法脚本。角色支持独立视觉预制体，平台支持按逻辑宽度平铺石块贴图，背景固定覆盖屏幕；素材缺失时仍会退回灰盒显示，便于继续验证玩法节奏。

## 文件结构

```text
assets/script/subgame/bondchase/
  BondChaseTypes.ts       配置接口
  BondChaseConfig.ts      配置清洗和无资源时的默认数据
  BondChaseGenerator.ts   带种子的受约束平台区块生成
  BondChaseActor.ts       角色视觉预制体、动画和灰盒回退
  BondChaseTemplate.ts    平台贴图、碰撞调试和公主路线绘制
  BondChaseController.ts  输入、追逐、距离失败、黑水、镜头、流式模板
assets/resources/config/
  bond_chase_shared.json  可由策划/关卡直接调整的模板配置
```

## 场景拼装

1. 用 Cocos Creator 2.4.6 打开项目，等待新脚本和 JSON 的 `.meta` 自动生成。
2. 新建一个 2D 场景，建议保存为 `assets/Scene/BondChaseGraybox.fire`。
3. 场景中创建或保留一个 `Canvas`，设计分辨率使用项目当前的竖屏设置（本项目为 720x1334）。
4. 在 `Canvas` 下创建空节点 `BondChaseRoot`，位置设为 `(0, 0)`，大小不需要手动填写。
5. 将 `BondChaseController.ts` 挂到 `BondChaseRoot`。
6. Inspector 中保持以下默认值：
   - `Auto Start`：勾选。
   - `Config Path`：`config/bond_chase_shared`。
   - `World Root`、`Hud Root`：留空，脚本会自动创建。
7. 保存场景并点击预览。运行后会看到四个初始模板、自动移动的公主、可操作的护卫、底部三个触控按钮和盟约距离 HUD。

如果场景已经有专用的世界节点和 HUD 节点，也可以将它们拖入 `World Root`、`Hud Root`。这两个节点应只由副玩法控制，脚本启动时会清理它们的子节点。

## 操作和当前规则

- 键盘 `A/D` 或方向键控制护卫左右移动。
- `W`、上方向键或空格控制护卫跳跃。
- `R` 使用当前种子重新开始，便于复现同一张地图。
- 屏幕底部的“左/跳/右”按钮是同一套输入的触控入口。
- 公主完全由模板路线驱动，护卫不需要接管公主。
- 程序生成路线只在恢复平台插入 `wait_guard`；普通平台上公主会连续前进。
- 公主速度会随本局时间从护卫安全节奏的 74% 平滑提高到 90%，并带有小幅平滑随机变化。
- 两人距离超过上限的 70% 后公主逐级减速，但不会在普通平台直接停下。
- 两人距离超过 `max_chain_distance` 并持续 `chain_fail_delay` 秒，直接失败。
- 黑水从 `water_start` 开始上升；基准速度为 `water_speed`，会根据公主脚底到水面的距离动态调整，任一角色触水失败。
- 镜头以护卫位置为跟随目标。
- `generator.enabled` 为 `true` 时，平台按护卫跳跃能力受约束生成；运行时保持当前区块、上方区块和下方缓冲。
- 将 `generator.enabled` 改为 `false` 后，可退回原有的 `template_pool` 固定模板循环。
- `randomize_seed_each_run` 为 `true` 时，失败弹窗的“重新挑战”会使用新种子生成新地图；控制台会输出本局种子。

## 程序化生成参数

```json
"generator": {
  "enabled": true,
  "seed": 1357911,
  "randomize_seed_each_run": true,
  "chunk_height": 720,
  "min_rise": 120,
  "max_rise": 185,
  "min_platform_width": 110,
  "max_platform_width": 210,
  "min_fallback_platform_width": 180,
  "max_fallback_platform_width": 240,
  "visual_stack_probability": 0.2,
  "visual_stack_short_width": 160,
  "visual_stack_max_layers": 2,
  "safety_margin": 35,
  "min_edge_gap": 50,
  "recovery_interval": 4,
  "max_attempts": 12
}
```

- `seed`：关闭每局随机种子时使用的固定种子。
- `randomize_seed_each_run`：是否让正常开始和“重新挑战”生成新种子；键盘 `R` 始终保留当前种子。
- `chunk_height`：每个流式区块的高度。
- `min_rise/max_rise`：相邻平台中心的垂直高度差。
- `min_platform_width/max_platform_width`：平台宽度范围。
- `min_fallback_platform_width/max_fallback_platform_width`：随机候选全部失败后，安全兜底平台的宽度范围。
- `visual_stack_probability`：短平台生成下方纯视觉叠层的概率，默认 `0.2`。
- `visual_stack_short_width`：宽度不超过此值的平台才可能出现叠层，默认 `160`。
- `visual_stack_max_layers`：最多额外生成的视觉叠层数量，默认 `2`；叠层不参与碰撞。
- `safety_margin`：从护卫理论水平可达距离中扣除的安全余量。
- `min_edge_gap`：普通平台希望保留的最小边缘空档。
- `recovery_interval`：每生成多少个平台插入一个更宽、跨度更小的恢复平台。
- `max_attempts`：随机候选失败后的最大重试次数，超过后生成安全兜底平台。

生成器会根据目标平台高度动态计算护卫水平可达距离，并限制平台边缘空档。它不会修改护卫移动、跳跃或碰撞代码。每个平台都会生成公主的 `jump`，每经过四个普通平台后的恢复平台才额外生成 `wait_guard`。

程序生成路线会把每个平台表面划分为落地点和起跳点。点位位于平台中心到对应边缘的中点，即相对中心偏移 `width / 4`：

- 落地点位于朝向上一个平台的一侧。
- 起跳点位于朝向下一个平台的一侧。
- 两点相同则直接进入下一次跳跃，不添加走路动作。
- 两点分处平台两侧时，自动插入 `run`，让公主从落地点走到起跳点。
- 恢复平台的 `wait_guard` 位于落地点之后、平台内走路之前。

公主节奏参数：

- `princess_pace_start_ratio`：开局相对护卫理论安全节奏的倍率，默认 `0.74`。
- `princess_pace_end_ratio`：提速完成后的倍率，默认 `0.9`。
- `princess_pace_ramp_seconds`：从开局倍率平滑提高到最终倍率所需时间，默认 `45` 秒。
- `princess_pace_variation`：每 8～12 秒选择的新速度扰动范围，默认 `±0.04`，运行时会平滑过渡。
- `princess_pace_control_allowance`：在护卫理论落地时间上增加的操作余量，默认 `0.15` 秒。

黑水自适应参数：

- `water_speed`：黑水的基准上升速度，默认 `46` 像素/秒。
- `water_target_gap`：黑水与公主脚底希望保持的垂直距离，默认 `180` 像素，使水面处于屏幕底部可见范围。
- `water_guard_clearance`：水面追赶公主时仍需保留在护卫脚底下方的距离，默认 `90` 像素，避免正常追赶中的护卫被直接淹没。
- `water_min_speed_scale`：水面接近目标位置时的最低速度倍率，默认 `0.5`。
- `water_max_speed_scale`：水面距离目标位置较远时的最高速度倍率，默认 `4`。
- `water_distance_gain`：距离偏差对水速的响应强度，默认 `3`。
- `water_speed_response`：实际水速靠近目标水速的响应系数，默认 `0.75`，让追赶速度变化更自然。

水速使用公主去除跳跃弧线后的路线基准高度，以及护卫最近一次接地高度进行计算。因此角色单次起跳和下落不会直接造成黑水明显加速或减速。

## 模板配置规则

所有坐标单位都是屏幕像素，区块自己的左下角是 `(0, 0)`，区块向上延伸。以下固定模板配置在 `generator.enabled=false` 时使用，也可作为特殊区块的配置格式。

平台字段：

```json
{
  "id": "T1_left",
  "type": "solid",
  "x": -180,
  "y": 210,
  "width": 190,
  "height": 28
}
```

`x/y` 是平台中心点。`type` 支持 `solid`、`fragile`、`dichi`；灰盒阶段三种类型只影响颜色，护卫都可以落上去。

公主路线字段：

```json
{ "action": "run", "x": -180, "y": 252, "duration": 1.3 }
{ "action": "jump", "x": 170, "y": 372, "duration": 1.6, "arc_height": 110 }
{ "action": "wait", "duration": 0.6 }
{ "action": "wait_guard", "resume_distance": 250 }
```

- `run`：从上一步终点线性移动到目标点。
- `jump`：从上一步终点移动到目标点，同时沿正弦曲线抬高 `arc_height`，这是第一版的硬性位置移动动画。
- `wait`：原地等待指定秒数。
- `wait_guard`：直到护卫与公主的距离小于 `resume_distance` 才继续。
- `duration` 使用秒；`x/y` 仍然是当前模板的局部坐标。

每个模板的 `height` 必须大于该模板最高平台和路线点的 `y`，并留出至少 40 像素余量。添加新模板时，只需在 `templates` 中增加对象，并把 ID 加入 `template_pool`。

## 灰盒调参顺序

建议按以下顺序调，不要一开始同时改所有参数：

1. 先只调平台的 `x/y/width/height`，让公主路线上的每个落点都有对应平台。
2. 再调路线的 `duration` 和 `arc_height`，确认公主移动速度和跳跃弧线。
3. 让护卫只用键盘能够跟到第一个 `wait_guard`，再调整 `resume_distance`。
4. 调 `max_chain_distance` 和 `chain_fail_delay`，验证超距预警和失败时机。
5. 最后调 `water_speed`，确保玩家有足够时间观察模板并追上公主。

## 验收清单

- 公主会按照配置自动跑、跳，在恢复平台等待，不受键盘输入影响。
- 公主会随时间平滑提速；玩家落后时按距离分级减速，超过上限后仍保留 25% 移动速度。
- 护卫可以用左右移动和跳跃跟随公主。
- 盟约距离不超过上限的 70% 时为绿色，70% 到 100% 时为金色警告，超过上限后变红并显示断裂倒计时。
- HUD 实时显示护卫相对本局起点的高度；失败弹窗显示本局最高高度。
- 超距持续 1 秒或任一角色接触黑水后停止并显示失败原因与最高高度。
- 护卫上移后会自动创建上方模板，旧模板会在下方移出缓冲区后回收。
- 修改 JSON 后重新运行，模板布局和路线会随配置变化。

## 美术替换边界

`BondChaseController` 的 `Princess Visual Prefab`、`Guard Visual Prefab`、`Platform Sprite Frame` 和 `Background Sprite Frame` 可以直接替换美术资源，不影响路线、平台碰撞、距离失败和流式生成逻辑。

平台 JSON 的 `width/height` 始终是碰撞尺寸。平台图片使用 `TILED` 模式按 `width` 横向平铺，保持原图高度，并让图片顶部和碰撞顶部对齐。`Show Debug Route` 开启时会显示公主路线和粉色平台碰撞轮廓；关闭时只显示正式美术。

背景节点由代码创建在 `worldRoot` 外，因此固定在屏幕后方，不会随平台世界移动。`Water Sprite Frame` 会按世界宽度等比显示，并通过 `Water Surface Offset` 让可见水面与 `waterY` 的失败判定线对齐；当前素材建议保持默认值 `32`。素材缺失时才退回程序绘制的黑水。

## UI 美术复用

控制器会直接复用主玩法操作按钮图片：`anniuzuoyi`、`anniutiaoyue`、`anniuyouyi`，位置按主玩法 `GeneraItem.prefab` 的竖屏布局创建。

失败时会在副玩法 HUD 内创建独立弹窗，复用主界面的 `tanchuangxiao`、`peituyouxishibai`、`anniuchognxintiaozhan` 和 `anniufanhuizhujiemian`。`Main Menu Scene` 默认是 `main`；若项目中的主界面场景名称不同，需要在控制器 Inspector 中改成构建列表里的实际场景名。

`Height Pixels Per Meter` 默认是 `30`，表示护卫每上升 30 个世界像素记为 1 米。该值只影响 HUD 和失败弹窗中的高度显示，不影响角色移动、平台生成或碰撞。
