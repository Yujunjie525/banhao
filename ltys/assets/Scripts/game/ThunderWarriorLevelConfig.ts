export interface ThunderRuneConfig {
    runeId: string;
    name: string;
    glyph: string;
    color: cc.Color;
}

export interface ThunderHeroSkill {
    skillId: string;
    name: string;
    effectType: 'add_thunder_energy' | 'shuffle_board' | 'grant_free_storm_shield' | 'clear_most_common_rune' | 'extend_attack_timer';
    cooldownSec: number;
    value: number;
}

export interface ThunderHeroConfig {
    entityId: string;
    name: string;
    shortName: string;
    role: string;
    mark: string;
    color: cc.Color;
    skill: ThunderHeroSkill;
}

export interface ThunderMonsterConfig {
    entityId: string;
    name: string;
    mark: string;
    color: cc.Color;
}

export interface ThunderWarriorLevelConfig {
    levelId: number;
    levelName: string;
    attackInterval: number;
    monsterAttack: number;
    thunderCounterDamage: number;
    playerHp: number;
    enemyHp: number;
    goldRewardBase: number;
    runePool: string[];
    monsterId: string;
}

export interface ThunderRaceStageConfig {
    raceStageId: string;
    monsterId: string;
    enemyHp: number;
    attackDamage: number;
}

export interface ThunderRaceConfig {
    modeId: string;
    configVersion: string;
    fixedSeed: string;
    runePool: string[];
    raceStages: ThunderRaceStageConfig[];
    clearReward: {
        rewardId: string;
        currencyId: 'CUR_DIAMOND';
        amount: number;
        repeatable: boolean;
    };
    disableCharacterSkills: boolean;
    energyCostPerAttack: number;
    weaknessDurationSec: number;
    weaknessDamagePerStack: number;
    monsterTransitionSec: number;
}

const TOTAL_LEVELS = 100;

export const THUNDER_GLOBAL_CONFIG = {
    stormShieldCost: 10,
    thunderCounterCost: 20,
    thunderComboBonus: 5,
    starGoldRewardRates: {
        1: 0.5,
        2: 0.75,
        3: 1,
    },
};

export const THUNDER_RACE_CONFIG: ThunderRaceConfig = {
    modeId: 'race_001',
    configVersion: 'race_stages_v1',
    fixedSeed: 'race_v1_001',
    runePool: ['r001', 'r002', 'r003', 'r004', 'r005', 'r006'],
    raceStages: [
        { raceStageId: 'rs_001', monsterId: 'm001', enemyHp: 30, attackDamage: 10 },
        { raceStageId: 'rs_002', monsterId: 'm002', enemyHp: 60, attackDamage: 15 },
        { raceStageId: 'rs_003', monsterId: 'm003', enemyHp: 150, attackDamage: 25 },
        { raceStageId: 'rs_004', monsterId: 'm004', enemyHp: 240, attackDamage: 30 },
        { raceStageId: 'rs_005', monsterId: 'm005', enemyHp: 350, attackDamage: 35 },
        { raceStageId: 'rs_006', monsterId: 'm006', enemyHp: 600, attackDamage: 50 },
    ],
    clearReward: {
        rewardId: 'race_clear_diamond_001',
        currencyId: 'CUR_DIAMOND',
        amount: 100,
        repeatable: true,
    },
    disableCharacterSkills: true,
    energyCostPerAttack: 20,
    weaknessDurationSec: 10,
    weaknessDamagePerStack: 0.1,
    monsterTransitionSec: 0.6,
};

export const THUNDER_RUNES: ThunderRuneConfig[] = [
    { runeId: 'r001', name: '闪电', glyph: '电', color: new cc.Color(98, 228, 235, 255) },
    { runeId: 'r002', name: '风盾', glyph: '盾', color: new cc.Color(125, 184, 255, 255) },
    { runeId: 'r003', name: '雷锤', glyph: '锤', color: new cc.Color(241, 196, 83, 255) },
    { runeId: 'r004', name: '疾风', glyph: '风', color: new cc.Color(116, 212, 147, 255) },
    { runeId: 'r005', name: '霹雳枪', glyph: '枪', color: new cc.Color(255, 127, 111, 255) },
    { runeId: 'r006', name: '银电刃', glyph: '刃', color: new cc.Color(217, 227, 231, 255) },
    { runeId: 'r007', name: '黑云', glyph: '云', color: new cc.Color(169, 147, 223, 255) },
    { runeId: 'r008', name: '金雷戟', glyph: '戟', color: new cc.Color(243, 169, 75, 255) },
    { runeId: 'r009', name: '青霆弩', glyph: '弩', color: new cc.Color(51, 195, 165, 255) },
    { runeId: 'r010', name: '天罚印', glyph: '印', color: new cc.Color(239, 143, 189, 255) },
];

export const THUNDER_HEROES: ThunderHeroConfig[] = [
    { entityId: 'c001', name: '引雷战将', shortName: '战将', role: '稳定蓄雷', mark: '勇', color: new cc.Color(98, 228, 235, 255), skill: { skillId: 'SK001', name: '雷霆号令', effectType: 'add_thunder_energy', cooldownSec: 35, value: 10 } },
    { entityId: 'c002', name: '风阵剑姬', shortName: '剑姬', role: '盘面整理', mark: '剑', color: new cc.Color(125, 184, 255, 255), skill: { skillId: 'SK002', name: '风暴重排', effectType: 'shuffle_board', cooldownSec: 40, value: 0 } },
    { entityId: 'c003', name: '不灭雷卫', shortName: '雷卫', role: '容错防御', mark: '盾', color: new cc.Color(241, 196, 83, 255), skill: { skillId: 'SK003', name: '不灭雷盾', effectType: 'grant_free_storm_shield', cooldownSec: 45, value: 1 } },
    { entityId: 'c004', name: '万纹祭司', shortName: '祭司', role: '群体消除', mark: '祭', color: new cc.Color(169, 147, 223, 255), skill: { skillId: 'SK004', name: '雷纹共鸣', effectType: 'clear_most_common_rune', cooldownSec: 45, value: 0 } },
    { entityId: 'c005', name: '驭时游侠', shortName: '游侠', role: '倒计时控制', mark: '弩', color: new cc.Color(51, 195, 165, 255), skill: { skillId: 'SK005', name: '雷时延缓', effectType: 'extend_attack_timer', cooldownSec: 30, value: 5 } },
];

export const THUNDER_MONSTERS: ThunderMonsterConfig[] = [
    { entityId: 'm001', name: '噬雷魔犬', mark: '犬', color: new cc.Color(182, 93, 114, 255) },
    { entityId: 'm002', name: '风暴行刑者', mark: '刑', color: new cc.Color(189, 120, 78, 255) },
    { entityId: 'm003', name: '天空毁灭者', mark: '毁', color: new cc.Color(120, 110, 174, 255) },
    { entityId: 'm004', name: '雷鸣石像', mark: '像', color: new cc.Color(140, 128, 104, 255) },
    { entityId: 'm005', name: '云海女妖', mark: '妖', color: new cc.Color(107, 157, 181, 255) },
    { entityId: 'm006', name: '万雷之王', mark: '王', color: new cc.Color(169, 106, 88, 255) },
];

const ZONE_NAMES = ['雷云前哨', '风暴断崖', '天空神殿', '雷鸣回廊', '云海祭坛', '万雷王座'];

function lerpLevel(levelId: number, start: number, end: number): number {
    const progress = (levelId - 1) / (TOTAL_LEVELS - 1);
    return start + (end - start) * progress;
}

function roundToOne(value: number): number {
    return Math.round(value * 10) / 10;
}

function getRuneCount(levelId: number): number {
    if (levelId <= 15) return 4;
    if (levelId <= 30) return 5;
    if (levelId <= 45) return 6;
    if (levelId <= 60) return 7;
    if (levelId <= 75) return 8;
    if (levelId <= 90) return 9;
    return 10;
}

function createLevelConfig(levelId: number): ThunderWarriorLevelConfig {
    const zoneIndex = Math.min(ZONE_NAMES.length - 1, Math.floor((levelId - 1) * ZONE_NAMES.length / TOTAL_LEVELS));
    return {
        levelId,
        levelName: ZONE_NAMES[zoneIndex] + '·' + levelId,
        attackInterval: roundToOne(lerpLevel(levelId, 12, 6)),
        monsterAttack: Math.round(lerpLevel(levelId, 10, 40)),
        thunderCounterDamage: Math.round(lerpLevel(levelId, 10, 50)),
        playerHp: Math.round(lerpLevel(levelId, 30, 150)),
        enemyHp: Math.round(lerpLevel(levelId, 30, 600)),
        goldRewardBase: Math.round(lerpLevel(levelId, 100, 1200)),
        runePool: THUNDER_RUNES.slice(0, getRuneCount(levelId)).map((rune) => rune.runeId),
        monsterId: THUNDER_MONSTERS[zoneIndex].entityId,
    };
}

const LEVELS: ThunderWarriorLevelConfig[] = Array.from(
    { length: TOTAL_LEVELS },
    (_, index) => createLevelConfig(index + 1)
);

export function getThunderWarriorTotalLevels(): number {
    return LEVELS.length;
}

export function getThunderWarriorLevelConfig(levelId: number): ThunderWarriorLevelConfig {
    const level = Math.max(1, Math.min(LEVELS.length, Math.floor(Number(levelId) || 1)));
    return LEVELS[level - 1];
}

export function calculateThunderWarriorStars(currentHp: number, maxHp: number): number {
    const normalizedMaxHp = Math.max(1, Number(maxHp) || 1);
    const normalizedCurrentHp = Math.max(0, Number(currentHp) || 0);
    if (normalizedCurrentHp <= 0) return 0;
    const hpRatio = normalizedCurrentHp / normalizedMaxHp;
    if (hpRatio >= 1) return 3;
    if (hpRatio >= 0.5) return 2;
    return 1;
}

export function getThunderRune(runeId: string): ThunderRuneConfig {
    for (let i = 0; i < THUNDER_RUNES.length; i++) {
        if (THUNDER_RUNES[i].runeId === runeId) return THUNDER_RUNES[i];
    }
    return THUNDER_RUNES[0];
}

export function getThunderHeroByIndex(index: number): ThunderHeroConfig {
    const normalized = Math.max(0, Math.min(THUNDER_HEROES.length - 1, Math.floor(Number(index) || 0)));
    return THUNDER_HEROES[normalized];
}

export function getThunderMonster(monsterId: string): ThunderMonsterConfig {
    for (let i = 0; i < THUNDER_MONSTERS.length; i++) {
        if (THUNDER_MONSTERS[i].entityId === monsterId) return THUNDER_MONSTERS[i];
    }
    return THUNDER_MONSTERS[0];
}

export default LEVELS;
