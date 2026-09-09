// 阵营枚举
export const enum Camp {
    Han = 0,  // 汉营（黑旗）
    Chu = 1,  // 楚营（红旗）
}

// 场景名
export const SceneName = {
    Main:    'Main',
    LevelSelect: 'LevelSelect',
    Game:    'Game',
} as const;

// 用户进度结构
export interface UserProgress {
    unlocked_level: number;
    level_stars: Record<string, number>;
    failed_levels: number[];
    stamina: number;
    last_stamina_time: number;
}

// 关卡节点
export interface NodeConfig {
    node_id: number;
    camp: Camp;
    x: number;
    y: number;
}

// 关卡边
export interface EdgeConfig {
    start_node: number;
    end_node: number;
}

// 关卡配置
export interface LevelConfig {
    level_id: number;
    nodes_config: NodeConfig[];
    edges_config: EdgeConfig[];
}

// UI 元素布局（来自 data.json）
export interface UIElement {
    file: string;
    x: number;
    y: number;
    w: number;
    h: number;
}

// 本地存储 key
export const StorageKey = {
    UserProgress: 'ch_user_progress',
} as const;

// 将 data.json 坐标（左上角原点，y向下）转为 Cocos 坐标（中心原点，y向上），并按 Canvas 等比缩放
export function dataToCocosPos(
    elem: UIElement,
    origW: number, origH: number,
    canvasW: number, canvasH: number
): { x: number; y: number; width: number; height: number } {
    const scaleX = canvasW / origW;
    const scaleY = canvasH / origH;
    const cx = elem.x + elem.w / 2;
    const cy = elem.y + elem.h / 2;
    return {
        x: (cx - origW / 2) * scaleX,
        y: (origH / 2 - cy) * scaleY,
        width:  elem.w * scaleX,
        height: elem.h * scaleY,
    };
}

// 加载配置到运行时常量（原地更新，所有 require 方自动感知）
let _cfg: any = null;
export function loadConfig(cfg: any): void {
    _cfg = cfg;
}
export function getConfig(): any {
    return _cfg;
}
