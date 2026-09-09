import { gameConfig } from './gameConfig';

export interface HeroSkillConfig {
    heroId: string;
    heroName: string;
    skillName: string;
    skillDescription: string;
    stepBonus: number;
    brightnessBonus: number;
    immuneBlackHole: boolean;
    slotRewardSteps: number;
}

export const heroSkillConfigs: Record<number, HeroSkillConfig> = {
    1: {
        heroId: 'C001',
        heroName: '寻光学徒',
        skillName: '无',
        skillDescription: '没有任何特殊的机制加成，提供最纯粹、硬核的解谜体验',
        stepBonus: 0,
        brightnessBonus: 0,
        immuneBlackHole: false,
        slotRewardSteps: 0,
    },
    2: {
        heroId: 'C002',
        heroName: '追风旅人',
        skillName: '风之庇护',
        skillDescription: '每局游戏初始阶段，直接额外获得 +5 步数上限',
        stepBonus: 5,
        brightnessBonus: 0,
        immuneBlackHole: false,
        slotRewardSteps: 0,
    },
    3: {
        heroId: 'C003',
        heroName: '晨曦祭司',
        skillName: '破晓之瞳',
        skillDescription: '关卡初始地图亮度绝对值额外提升 20%',
        stepBonus: 0,
        brightnessBonus: 20,
        immuneBlackHole: false,
        slotRewardSteps: 0,
    },
    4: {
        heroId: 'C004',
        heroName: '灵魂织补者',
        skillName: '灵魂剥离',
        skillDescription: '游戏可绝对免疫"噬梦黑洞"的吞噬判定',
        stepBonus: 0,
        brightnessBonus: 0,
        immuneBlackHole: true,
        slotRewardSteps: 0,
    },
    5: {
        heroId: 'C005',
        heroName: '空间架构师',
        skillName: '空间重构',
        skillDescription: '每次成功将一个光块推入"记忆槽"完成对接时，立即恢复 5 点剩余步数',
        stepBonus: 0,
        brightnessBonus: 0,
        immuneBlackHole: false,
        slotRewardSteps: 5,
    },
};

export function getCurrentHeroSkill(): HeroSkillConfig {
    const heroType = gameConfig.slectType || 1;
    return heroSkillConfigs[heroType] || heroSkillConfigs[1];
}

export function getHeroStepBonus(): number {
    return getCurrentHeroSkill().stepBonus;
}

export function getHeroBrightnessBonus(): number {
    return getCurrentHeroSkill().brightnessBonus;
}

export function isImmuneBlackHole(): boolean {
    return getCurrentHeroSkill().immuneBlackHole;
}

export function getSlotRewardSteps(): number {
    return getCurrentHeroSkill().slotRewardSteps;
}