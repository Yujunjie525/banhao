export interface ArcanePoint {
    x: number;
    y: number;
}

export interface ArcaneMonsterPoint extends ArcanePoint {
    monster_id: string;
}

export type ArcaneMonsterBehavior =
    'standard_chase' |
    'dash_chase' |
    'predictive_chase' |
    'phase_chase';

export interface ArcaneCharacterConfig {
    entity_id: string;
    name: string;
    base_spd: number;
    body_size_grid: number;
    color: string;
    accent: string;
}

export interface ArcaneMonsterConfig {
    entity_id: string;
    name: string;
    role: string;
    base_chase_spd: number;
    body_size_grid: number;
    lifetime_sec: number;
    behavior_type: ArcaneMonsterBehavior;
    behavior_params: { [key: string]: number | boolean };
    color: string;
    accent: string;
}

export interface ArcaneEscapeLevelConfig {
    escape_level_id: string;
    level_no: number;
    name: string;
    map_width_grid: number;
    map_height_grid: number;
    cell_size_px: number;
    target_time_sec: number;
    monster_spd_multiplier: number;
    monster_spd_acceleration_per_sec: number;
    start_point: ArcanePoint;
    exit_point: ArcanePoint;
    monster_points: ArcaneMonsterPoint[];
    blocked_points: ArcanePoint[];
}

export const ARCANE_GLOBAL_CONFIG = {
    schema_version: '1.0.0',
    max_stamina: 30,
    initial_diamonds: 300,
    revive_cost_diamonds: 100,
    max_revive_per_run: 1,
    stamina_recover_interval_sec: 360,
    viewport_width_grid: 16,
    viewport_height_grid: 9,
    camera_follow_lerp: 0.16,
    analysis_width_grid: 5,
    analysis_height_grid: 5,
    analysis_min_preview_sec: 0.5,
    analysis_cooldown_sec: 0.6,
    analysis_preview_shake_amplitude_px: 2,
    analysis_preview_shake_frequency_hz: 12,
    monster_wake_delay_sec: 3,
    treasure_monster_death_delay_sec: 3,
    // 仅闯关模式使用怪物追踪速度缩放；寻宝模式的怪物作为静态宝藏，不会移动。
    escape_monster_speed_scale: 0.4
};

export const ARCANE_CHARACTERS: ArcaneCharacterConfig[] = [
    { entity_id: 'C001', name: '奥术勇者', base_spd: 4, body_size_grid: 1, color: '#59d4b3', accent: '#d8b25b' },
    { entity_id: 'C002', name: '星界旅者', base_spd: 5, body_size_grid: 1, color: '#77c7db', accent: '#d7c58a' },
    { entity_id: 'C003', name: '符文智者', base_spd: 6, body_size_grid: 1, color: '#d8b25b', accent: '#8ed2c1' },
    { entity_id: 'C004', name: '秘银斥候', base_spd: 7, body_size_grid: 1, color: '#b8c7c7', accent: '#c75b4a' },
    { entity_id: 'C005', name: '回廊行者', base_spd: 8, body_size_grid: 1, color: '#85b583', accent: '#d8b25b' }
];

export const ARCANE_MONSTERS: ArcaneMonsterConfig[] = [
    {
        entity_id: 'M001', name: '噬能魔影', role: '基础高速追兵',
        base_chase_spd: 3, body_size_grid: 1, lifetime_sec: 15,
        behavior_type: 'standard_chase', behavior_params: {},
        color: '#4ec0b0', accent: '#16292b'
    },
    {
        entity_id: 'M002', name: '符文巨像', role: '空间压迫者',
        base_chase_spd: 2, body_size_grid: 3, lifetime_sec: 25,
        behavior_type: 'standard_chase', behavior_params: {},
        color: '#9b7448', accent: '#d6b35e'
    },
    {
        entity_id: 'M003', name: '裂隙猎犬', role: '短寿命突进追兵',
        base_chase_spd: 3, body_size_grid: 1, lifetime_sec: 10,
        behavior_type: 'dash_chase',
        behavior_params: { dash_every_grid: 5, dash_charge_sec: 0.6, dash_distance_grid: 2 },
        color: '#b95147', accent: '#d8c5a2'
    },
    {
        entity_id: 'M004', name: '秘法监视者', role: '路线截击者',
        base_chase_spd: 2, body_size_grid: 1, lifetime_sec: 18,
        behavior_type: 'predictive_chase',
        behavior_params: { prediction_interval_sec: 3, prediction_distance_grid: 2 },
        color: '#8c79b4', accent: '#d8b25b'
    },
    {
        entity_id: 'M005', name: '穿行秘偶', role: '集群穿插者',
        base_chase_spd: 2, body_size_grid: 1, lifetime_sec: 14,
        behavior_type: 'phase_chase', behavior_params: { ignore_soft_collision: true },
        color: '#cabd91', accent: '#5b7f7c'
    }
];

const CHAPTER_NAMES = ['启印回廊', '铜钟庭院', '裂隙书库', '星界密室', '永夜核心'];
const STAGE_NAMES = [
    '初识', '微光', '回声', '旧痕', '岔路',
    '暗门', '环厅', '石语', '残页', '冷焰',
    '迷阵', '钟摆', '断桥', '密契', '追影',
    '封锁', '错层', '深潜', '终试', '镇守'
];

function keyOf(point: ArcanePoint): string {
    return point.x + ',' + point.y;
}

function createFixedRandom(seed: number): () => number {
    let state = seed >>> 0;
    return () => {
        state = (state * 1664525 + 1013904223) >>> 0;
        return state / 4294967296;
    };
}

function addBlocked(
    blocked: ArcanePoint[],
    occupied: { [key: string]: boolean },
    x: number,
    y: number,
    width: number,
    height: number,
    safeY: number,
    detourY: number
): void {
    if (x < 0 || y < 0 || x >= width || y >= height) return;
    if (Math.abs(y - safeY) <= 1 || Math.abs(y - detourY) <= 1) return;
    const key = x + ',' + y;
    if (occupied[key]) return;
    occupied[key] = true;
    blocked.push({ x, y });
}

function buildBlockedPoints(levelNo: number, width: number, height: number, safeY: number): ArcanePoint[] {
    const blocked: ArcanePoint[] = [];
    const occupied: { [key: string]: boolean } = {};
    const chapter = Math.floor((levelNo - 1) / 20);
    const detourY = safeY + (levelNo % 2 === 0 ? -4 : 4);

    for (let x = 7; x < width - 6; x += Math.max(5, 8 - chapter)) {
        const upperGap = 3 + ((x + levelNo) % Math.max(2, safeY - 5));
        const lowerSpan = Math.max(2, height - safeY - 5);
        const lowerGap = safeY + 3 + ((x * 2 + levelNo) % lowerSpan);
        for (let y = 1; y < height - 1; y++) {
            if (Math.abs(y - safeY) <= 1 || Math.abs(y - upperGap) <= 1 || Math.abs(y - lowerGap) <= 1) continue;
            addBlocked(blocked, occupied, x, y, width, height, safeY, detourY);
        }
    }

    const horizontalRows = chapter + (levelNo % 5 === 0 ? 1 : 0);
    for (let row = 0; row < horizontalRows; row++) {
        const y = row % 2 === 0 ? 3 + row : height - 4 - row;
        for (let x = 10 + row * 2; x < width - 8; x++) {
            if ((x + levelNo + row) % 7 < 2) continue;
            addBlocked(blocked, occupied, x, y, width, height, safeY, detourY);
        }
    }
    return blocked;
}

function canPlaceMonster(
    x: number,
    y: number,
    size: number,
    width: number,
    height: number,
    safeY: number,
    detourY: number,
    start: ArcanePoint,
    blocked: { [key: string]: boolean },
    occupied: { [key: string]: boolean },
    allowSafeBand: boolean = false
): boolean {
    if (x < 1 || y < 1 || x + size >= width - 1 || y + size >= height - 1) return false;
    if (!allowSafeBand && (Math.abs(y + size / 2 - safeY) < 3.2 || Math.abs(y - detourY) <= 2)) return false;
    for (let oy = 0; oy < size; oy++) {
        for (let ox = 0; ox < size; ox++) {
            const px = x + ox;
            const py = y + oy;
            if (blocked[px + ',' + py] || occupied[px + ',' + py]) return false;
            if (Math.abs(px - start.x) <= 3 && Math.abs(py - start.y) <= 3) return false;
        }
    }
    return true;
}

function buildMonsterPoints(
    levelNo: number,
    width: number,
    height: number,
    safeY: number,
    start: ArcanePoint,
    blockedPoints: ArcanePoint[]
): ArcaneMonsterPoint[] {
    const chapter = Math.floor((levelNo - 1) / 20);
    const stage = (levelNo - 1) % 20;
    const availableMonsterCount = Math.min(5, 1 + chapter + (stage >= 10 ? 1 : 0));
    const targetCount = Math.min(14, 2 + Math.floor((levelNo - 1) / 7));
    const random = createFixedRandom(0x5f3759df ^ (levelNo * 2654435761));
    const detourY = safeY + (levelNo % 2 === 0 ? -4 : 4);
    const blocked: { [key: string]: boolean } = {};
    const occupied: { [key: string]: boolean } = {};
    const points: ArcaneMonsterPoint[] = [];
    blockedPoints.forEach((point) => { blocked[keyOf(point)] = true; });

    const occupyMonsterArea = (x: number, y: number, size: number) => {
        for (let oy = -1; oy <= size; oy++) {
            for (let ox = -1; ox <= size; ox++) occupied[(x + ox) + ',' + (y + oy)] = true;
        }
    };

    // Put a small number of seals near the central route so every level requires
    // reading runes and choosing whether to detour instead of walking straight.
    const pressureCount = Math.min(targetCount, 1 + chapter);
    for (let pressureIndex = 0; pressureIndex < pressureCount; pressureIndex++) {
        const monsterIndex = (levelNo + pressureIndex) % availableMonsterCount;
        const monster = ARCANE_MONSTERS[monsterIndex];
        const size = monster.body_size_grid;
        const minX = levelNo === 1 ? start.x + 4 : start.x + 5;
        const maxX = Math.max(minX, width - size - 5);
        const span = Math.max(1, maxX - minX + 1);
        const preferredX = levelNo === 1 && pressureIndex === 0
            ? minX
            : minX + Math.floor((pressureIndex + 1) * span / (pressureCount + 1));
        const y = safeY - Math.floor(size / 2);
        let placed = false;
        for (let attempt = 0; attempt < span; attempt++) {
            const x = minX + ((preferredX - minX + attempt) % span);
            if (!canPlaceMonster(x, y, size, width, height, safeY, detourY, start, blocked, occupied, true)) continue;
            points.push({ x, y, monster_id: monster.entity_id });
            occupyMonsterArea(x, y, size);
            placed = true;
            break;
        }
        if (!placed) throw new Error('E' + padLevel(levelNo) + ' route pressure placement failed');
    }

    let attempts = 0;
    while (points.length < targetCount && attempts < 3000) {
        attempts++;
        const monsterIndex = (points.length + levelNo + Math.floor(random() * availableMonsterCount)) % availableMonsterCount;
        const monster = ARCANE_MONSTERS[monsterIndex];
        const size = monster.body_size_grid;
        const x = 5 + Math.floor(random() * Math.max(1, width - size - 7));
        const preferUpper = (points.length + levelNo) % 2 === 0;
        const upperMax = Math.max(2, safeY - size - 3);
        const lowerMin = Math.min(height - size - 2, safeY + 3);
        const y = preferUpper
            ? 1 + Math.floor(random() * upperMax)
            : lowerMin + Math.floor(random() * Math.max(1, height - size - lowerMin - 1));
        if (!canPlaceMonster(x, y, size, width, height, safeY, detourY, start, blocked, occupied)) continue;

        points.push({ x, y, monster_id: monster.entity_id });
        occupyMonsterArea(x, y, size);
    }

    if (points.length !== targetCount) {
        throw new Error('E' + padLevel(levelNo) + ' monster layout generation failed');
    }
    return points;
}

function padLevel(levelNo: number): string {
    return ('000' + levelNo).slice(-3);
}

function buildLevel(levelNo: number): ArcaneEscapeLevelConfig {
    const chapter = Math.floor((levelNo - 1) / 20);
    const stage = (levelNo - 1) % 20;
    const width = 30 + chapter * 3 + Math.floor(stage / 7);
    const height = 20 + chapter * 2;
    const safeY = Math.floor(height / 2);
    const start = { x: 2, y: safeY };
    const exit = { x: width - 3, y: safeY };
    const blockedPoints = buildBlockedPoints(levelNo, width, height, safeY);

    return {
        escape_level_id: 'E' + padLevel(levelNo),
        level_no: levelNo,
        name: CHAPTER_NAMES[chapter] + '·' + STAGE_NAMES[stage],
        map_width_grid: width,
        map_height_grid: height,
        cell_size_px: 32,
        target_time_sec: 75 + chapter * 20 + Math.floor(stage / 5) * 8,
        monster_spd_multiplier: Number((0.82 + chapter * 0.16 + stage * 0.008).toFixed(2)),
        monster_spd_acceleration_per_sec: Number((0.004 + chapter * 0.006 + stage * 0.00035).toFixed(4)),
        start_point: start,
        exit_point: exit,
        monster_points: buildMonsterPoints(levelNo, width, height, safeY, start, blockedPoints),
        blocked_points: blockedPoints
    };
}

function validateLevel(level: ArcaneEscapeLevelConfig): void {
    const blocked: { [key: string]: boolean } = {};
    const occupied: { [key: string]: boolean } = {};
    level.blocked_points.forEach((point) => { blocked[keyOf(point)] = true; });
    const startKey = keyOf(level.start_point);
    const exitKey = keyOf(level.exit_point);
    if (startKey === exitKey || blocked[startKey] || blocked[exitKey]) {
        throw new Error(level.escape_level_id + ' has an invalid start or exit');
    }
    for (let x = level.start_point.x; x <= level.exit_point.x; x++) {
        for (let offset = -1; offset <= 1; offset++) {
            if (blocked[x + ',' + (level.start_point.y + offset)]) {
                throw new Error(level.escape_level_id + ' blocks its three-grid safe route');
            }
        }
    }
    level.monster_points.forEach((point) => {
        if (Math.abs(point.x - level.start_point.x) <= 3 && Math.abs(point.y - level.start_point.y) <= 3) {
            throw new Error(level.escape_level_id + ' has a monster in its opening analysis area');
        }
        const monster = ARCANE_MONSTERS.filter((item) => item.entity_id === point.monster_id)[0];
        if (!monster) throw new Error(level.escape_level_id + ' references an unknown monster');
        for (let oy = 0; oy < monster.body_size_grid; oy++) {
            for (let ox = 0; ox < monster.body_size_grid; ox++) {
                const x = point.x + ox;
                const y = point.y + oy;
                const key = x + ',' + y;
                if (x < 0 || y < 0 || x >= level.map_width_grid || y >= level.map_height_grid
                    || blocked[key] || key === startKey || key === exitKey || occupied[key]) {
                    throw new Error(level.escape_level_id + ' has an overlapping monster footprint');
                }
                occupied[key] = true;
            }
        }
    });
}

export const ARCANE_ESCAPE_LEVELS: ArcaneEscapeLevelConfig[] = [];
for (let levelNo = 1; levelNo <= 100; levelNo++) {
    const level = buildLevel(levelNo);
    validateLevel(level);
    ARCANE_ESCAPE_LEVELS.push(level);
}

export function getArcaneEscapeLevel(levelNo: number): ArcaneEscapeLevelConfig {
    const index = Math.max(0, Math.min(ARCANE_ESCAPE_LEVELS.length - 1, Math.floor(levelNo || 1) - 1));
    return ARCANE_ESCAPE_LEVELS[index];
}

export function getArcaneCharacter(index: number): ArcaneCharacterConfig {
    const safeIndex = Math.max(0, Math.min(ARCANE_CHARACTERS.length - 1, Math.floor(index || 0)));
    return ARCANE_CHARACTERS[safeIndex];
}

export function getArcaneMonster(monsterId: string): ArcaneMonsterConfig {
    for (let i = 0; i < ARCANE_MONSTERS.length; i++) {
        if (ARCANE_MONSTERS[i].entity_id === monsterId) return ARCANE_MONSTERS[i];
    }
    throw new Error('Unknown arcane monster: ' + monsterId);
}
