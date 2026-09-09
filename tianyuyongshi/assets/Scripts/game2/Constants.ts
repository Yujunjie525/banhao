// 枚举、常量与 loadConfig

export enum Scene {
    Main    = 'main',
    Level   = 'xuan',
    Battle  = 'battle',
    Upgrade = 'qianghua',
    Youxi   = 'youxi'
}

export enum HeroId {
    LingJianShi    = 'H001',
    NuLeiLiShi     = 'H002',
    JuLingTianNv   = 'H003',
    LieYanFaZun    = 'H004',
    ChuanYunNuShou = 'H005',
    BaGuaTianShi   = 'H006'
}

export enum MonsterId {
    MiWuYaoLang    = 'm_01',
    HunDunJuLing   = 'm_02',
    GuiYiMoBu      = 'm_03',
    BaoLieHuoGui   = 'm_04',
    ShiHunGuWu     = 'm_05',
    ShenYuanLingZhu = 'm_06'
}

// 运行时配置缓存（由 loadConfig 填充）
export const CFG: {
    stamina: any;
    currency: any;
    summon: any;
    heroRank: any;
    heroUpgrade: any;
    heroConfig: any[];
    monsterConfig: any[];
    coreSkins: any[];
    itemConfig: any[];
    heroUpgradeConfig: any[];
    levelStaminaCost: number;
    starThresholds: number[];
    levels: any[];
} = {
    stamina: {},
    currency: {},
    summon: {},
    heroRank: {},
    heroUpgrade: {},
    heroConfig: [],
    monsterConfig: [],
    coreSkins: [],
    itemConfig: [],
    heroUpgradeConfig: [],
    levelStaminaCost: 1,
    starThresholds: [0.8, 0.4, 0.0],
    levels: []
};

export function loadConfig(cfg: any): void {
    if (!cfg) return;
    CFG.stamina          = cfg.stamina          || CFG.stamina;
    CFG.currency         = cfg.currency         || CFG.currency;
    CFG.summon           = cfg.summon           || CFG.summon;
    CFG.heroRank         = cfg.heroRank         || CFG.heroRank;
    CFG.heroUpgrade      = cfg.heroUpgrade      || CFG.heroUpgrade;
    CFG.levelStaminaCost = cfg.levelStaminaCost != null ? cfg.levelStaminaCost : CFG.levelStaminaCost;
    CFG.starThresholds   = cfg.starThresholds   || CFG.starThresholds;

    const copyArr = (src: any[], dst: any[]) => {
        if (!src || !src.length) return;
        dst.length = 0;
        src.forEach((v: any) => dst.push(v));
    };
    copyArr(cfg.heroConfig,         CFG.heroConfig);
    copyArr(cfg.monsterConfig,      CFG.monsterConfig);
    copyArr(cfg.coreSkins,          CFG.coreSkins);
    copyArr(cfg.itemConfig,         CFG.itemConfig);
    copyArr(cfg.heroUpgradeConfig,  CFG.heroUpgradeConfig);
    copyArr(cfg.levels,             CFG.levels);
}

// 根据 item_id 查 itemConfig 里的 icon 文件名（去后缀）
export function getItemIcon(itemId: string): string {
    for (let i = 0; i < CFG.itemConfig.length; i++) {
        if (CFG.itemConfig[i].id === itemId) {
            const icon: string = CFG.itemConfig[i].icon || '';
            return icon.replace(/\.[^.]+$/, '');   // 去掉 .png
        }
    }
    return '';
}
