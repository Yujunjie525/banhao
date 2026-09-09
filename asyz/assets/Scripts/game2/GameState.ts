// 跨场景状态单例 — CC2.x 模块只求值一次，天然跨场景持久

const SAVE_KEY = 'gamestate_v1';

function _getStorage() {
    try {
        return cc && cc.sys && cc.sys.localStorage ? cc.sys.localStorage : null;
    } catch (e) {}
    return null;
}

function _getUserId(): string | null {
    const storage = _getStorage();
    return storage ? storage.getItem('SLS_USER_ID') : null;
}

export function getGameStateSaveKey(): string {
    const userId = _getUserId();
    return userId ? `${SAVE_KEY}_${userId}` : SAVE_KEY;
}

function _load() {
    try {
        const storage = _getStorage();
        const raw = storage ? storage.getItem(getGameStateSaveKey()) : null;
        if (raw) return JSON.parse(raw);
    } catch (e) {}
    return null;
}

const _saved = _load();

const GameState = {
    // 玩家资产
    stamina:    _saved ? _saved.stamina    : 30,
    shenpo:     _saved ? _saved.shenpo     : 100,

    // 英雄碎片：key = fragmentId（如 'Item_002'），value = 数量
    heroShards: (_saved && _saved.heroShards) ? _saved.heroShards : {} as { [itemId: string]: number },

    // 勇士升阶等级：key = heroId（如 'Hero_01'），value = 当前阶级（1起）
    heroTiers: (_saved && _saved.heroTiers) ? _saved.heroTiers : {} as { [heroId: string]: number },

    // 体力恢复计时（秒）
    staminaTimer: 0,

    // 当前装备的神核皮肤 ID
    equippedSkinId: (_saved && _saved.equippedSkinId) ? _saved.equippedSkinId : 'Skin_01',

    // 选关界面：当前选中的关卡索引（0-based）
    selectedLevelIdx: 0,
    selectedLevelId:  '1',

    // 最高已解锁关卡索引（0-based）
    maxUnlockedLevel: (_saved && _saved.maxUnlockedLevel != null) ? _saved.maxUnlockedLevel : 4,

    // 每关星级记录：key = level_id（字符串），value = 0~3
    levelStars: (_saved && _saved.levelStars) ? _saved.levelStars : {} as { [levelId: string]: number },

    // 寻宝模式拥有独立的选关、解锁和通关记录。
    selectedTreasureLevelIdx: (_saved && _saved.selectedTreasureLevelIdx != null)
        ? Math.max(0, _saved.selectedTreasureLevelIdx) : 0,
    maxUnlockedTreasureLevel: (_saved && _saved.maxUnlockedTreasureLevel != null)
        ? Math.max(1, _saved.maxUnlockedTreasureLevel) : 1,
    treasureLevelClears: (_saved && _saved.treasureLevelClears)
        ? _saved.treasureLevelClears : {} as { [levelId: string]: boolean },
    treasureBestRemainingAnalysis: (_saved && _saved.treasureBestRemainingAnalysis)
        ? _saved.treasureBestRemainingAnalysis : {} as { [levelId: string]: number },

    // 结算来源标记（用于场景间传参）
    returningFrom: '' as 'flee' | 'revive' | 'victory' | 'defeat' | '',

    // 上局结算数据
    lastResult: {
        stars: 0,
        shenpoEarned: 0,
        shardsEarned: 0,
        wavesCleared: 0
    },

    reload() {
        const saved = _load();
        this.stamina = saved && saved.stamina != null ? saved.stamina : 30;
        this.shenpo = saved && saved.shenpo != null ? saved.shenpo : 100;
        this.heroShards = (saved && saved.heroShards) ? saved.heroShards : {};
        this.heroTiers = (saved && saved.heroTiers) ? saved.heroTiers : {};
        this.staminaTimer = 0;
        this.equippedSkinId = (saved && saved.equippedSkinId) ? saved.equippedSkinId : 'Skin_01';
        this.selectedLevelIdx = 0;
        this.selectedLevelId = '1';
        this.maxUnlockedLevel = (saved && saved.maxUnlockedLevel != null) ? saved.maxUnlockedLevel : 4;
        this.levelStars = (saved && saved.levelStars) ? saved.levelStars : {};
        this.selectedTreasureLevelIdx = (saved && saved.selectedTreasureLevelIdx != null)
            ? Math.max(0, saved.selectedTreasureLevelIdx) : 0;
        this.maxUnlockedTreasureLevel = (saved && saved.maxUnlockedTreasureLevel != null)
            ? Math.max(1, saved.maxUnlockedTreasureLevel) : 1;
        this.treasureLevelClears = (saved && saved.treasureLevelClears) ? saved.treasureLevelClears : {};
        this.treasureBestRemainingAnalysis = (saved && saved.treasureBestRemainingAnalysis)
            ? saved.treasureBestRemainingAnalysis : {};
        this.returningFrom = '';
        this.lastResult = { stars: 0, shenpoEarned: 0, shardsEarned: 0, wavesCleared: 0 };
    },

    save() {
        try {
            const storage = _getStorage();
            if (!storage) return;
            storage.setItem(getGameStateSaveKey(), JSON.stringify({
                stamina:         this.stamina,
                shenpo:          this.shenpo,
                heroShards:      this.heroShards,
                heroTiers:       this.heroTiers,
                equippedSkinId:  this.equippedSkinId,
                maxUnlockedLevel: this.maxUnlockedLevel,
                levelStars:      this.levelStars,
                selectedTreasureLevelIdx: this.selectedTreasureLevelIdx,
                maxUnlockedTreasureLevel: this.maxUnlockedTreasureLevel,
                treasureLevelClears: this.treasureLevelClears,
                treasureBestRemainingAnalysis: this.treasureBestRemainingAnalysis,
            }));
        } catch (e) {}
    }
};

export default GameState;
