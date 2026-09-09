export type Game3DifficultyKey = 'easy' | 'medium' | 'hard';

export type Game3DifficultyMode = {
    key: Game3DifficultyKey;
    unlockLevel: number;
    displayName: string;
    startLevel: number;
    endLevel: number;
    totalWaves: number;
    nextUnlockLevel?: number;
};

export const GAME3_DIFFICULTY_STORAGE_KEY = 'game3UnlockedDifficulty';

export const GAME3_DIFFICULTY_MODES: Game3DifficultyMode[] = [
    {
        key: 'easy',
        unlockLevel: 1,
        displayName: '简单',
        startLevel: 1,
        endLevel: 20,
        totalWaves: 20,
        nextUnlockLevel: 2,
    },
    {
        key: 'medium',
        unlockLevel: 2,
        displayName: '中等',
        startLevel: 21,
        endLevel: 70,
        totalWaves: 50,
        nextUnlockLevel: 3,
    },
    {
        key: 'hard',
        unlockLevel: 3,
        displayName: '困难',
        startLevel: 71,
        endLevel: 170,
        totalWaves: 100,
    },
];

export function getGame3DifficultyMode(key: unknown): Game3DifficultyMode {
    return GAME3_DIFFICULTY_MODES.find((mode) => mode.key === key) || GAME3_DIFFICULTY_MODES[0];
}

export function getGame3WaveNumber(level: number, mode: Game3DifficultyMode): number {
    const rawWave = level - mode.startLevel + 1;
    return Math.max(1, Math.min(mode.totalWaves, rawWave));
}
