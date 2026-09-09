export interface WarriorRunSpawnWeights {
    goldLine: number;
    goldPile: number;
    energy: number;
    obstacle: number;
}

export interface WarriorRunLevelConfig {
    levelId: number;
    passTime: number;
    speedMultiplier: number;
    spawnIntervalMeters: number;
    spawnWeights: WarriorRunSpawnWeights;
    obstaclePool: number[];
    weatherWeights: number[];
}

const LEVEL_COUNT = 100;

const LEVELS: WarriorRunLevelConfig[] = [];

for (let level = 1; level <= LEVEL_COUNT; level++) {
    const tier = Math.floor((level - 1) / 10);
    const phase = (level - 1) % 10;
    const obstaclePool = [201, 202];
    if (level >= 12) obstaclePool.push(203);
    if (level >= 25) obstaclePool.push(204);
    if (level >= 45) obstaclePool.push(201, 203);
    if (level >= 70) obstaclePool.push(204);

    LEVELS.push({
        levelId: level,
        passTime: Math.min(150, 30 + Math.floor((level - 1) / 5) * 7),
        speedMultiplier: Math.min(2.25, 1 + tier * 0.1 + phase * 0.012),
        spawnIntervalMeters: Math.max(6.8, 13 - tier * 0.55 - phase * 0.06),
        spawnWeights: {
            goldLine: Math.max(24, 52 - tier * 2),
            goldPile: Math.max(8, 13 - Math.floor(tier / 2)),
            energy: Math.max(4, 9 - Math.floor(tier / 2)),
            obstacle: Math.min(64, 26 + tier * 4 + Math.floor(phase / 3)),
        },
        obstaclePool,
        weatherWeights: [
            Math.max(8, 55 - tier * 5),
            Math.min(22, 14 + tier),
            Math.min(26, 10 + tier * 2),
            level >= 18 ? Math.min(30, tier * 4) : 0,
            Math.min(12, 8 + Math.floor(tier / 2)),
            Math.min(14, 8 + Math.floor(tier / 2)),
        ],
    });
}

export function getWarriorRunTotalLevels(): number {
    return LEVELS.length;
}

export function getWarriorRunLevelConfig(levelId: number): WarriorRunLevelConfig {
    const level = Math.max(1, Math.min(LEVELS.length, Math.floor(Number(levelId) || 1)));
    return LEVELS[level - 1];
}

export default LEVELS;
