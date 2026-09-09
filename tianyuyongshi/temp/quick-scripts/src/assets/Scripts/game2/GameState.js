"use strict";
cc._RF.push(module, 'a41cfsXkrVPNZ++JP4a0z9n', 'GameState');
// Scripts/game2/GameState.ts

// 跨场景状态单例 — CC2.x 模块只求值一次，天然跨场景持久
Object.defineProperty(exports, "__esModule", { value: true });
exports.getGameStateSaveKey = void 0;
var SAVE_KEY = 'gamestate_v1';
function _getUserId() {
    try {
        return cc && cc.sys && cc.sys.localStorage
            ? cc.sys.localStorage.getItem('SLS_USER_ID')
            : null;
    }
    catch (e) { }
    return null;
}
function getGameStateSaveKey() {
    var userId = _getUserId();
    return userId ? SAVE_KEY + "_" + userId : SAVE_KEY;
}
exports.getGameStateSaveKey = getGameStateSaveKey;
function _load() {
    try {
        var raw = localStorage.getItem(getGameStateSaveKey());
        if (raw)
            return JSON.parse(raw);
    }
    catch (e) { }
    return null;
}
var _saved = _load();
var GameState = {
    // 玩家资产
    stamina: _saved ? _saved.stamina : 30,
    shenpo: _saved ? _saved.shenpo : 100,
    // 英雄碎片：key = fragmentId（如 'Item_002'），value = 数量
    heroShards: (_saved && _saved.heroShards) ? _saved.heroShards : {},
    // 勇士升阶等级：key = heroId（如 'Hero_01'），value = 当前阶级（1起）
    heroTiers: (_saved && _saved.heroTiers) ? _saved.heroTiers : {},
    // 体力恢复计时（秒）
    staminaTimer: 0,
    // 当前装备的神核皮肤 ID
    equippedSkinId: (_saved && _saved.equippedSkinId) ? _saved.equippedSkinId : 'Skin_01',
    // 选关界面：当前选中的关卡索引（0-based）
    selectedLevelIdx: 0,
    selectedLevelId: '1',
    // 最高已解锁关卡索引（0-based）
    maxUnlockedLevel: (_saved && _saved.maxUnlockedLevel != null) ? _saved.maxUnlockedLevel : 4,
    // 每关星级记录：key = level_id（字符串），value = 0~3
    levelStars: (_saved && _saved.levelStars) ? _saved.levelStars : {},
    // 结算来源标记（用于场景间传参）
    returningFrom: '',
    // 上局结算数据
    lastResult: {
        stars: 0,
        shenpoEarned: 0,
        shardsEarned: 0,
        wavesCleared: 0
    },
    save: function () {
        try {
            localStorage.setItem(getGameStateSaveKey(), JSON.stringify({
                stamina: this.stamina,
                shenpo: this.shenpo,
                heroShards: this.heroShards,
                heroTiers: this.heroTiers,
                equippedSkinId: this.equippedSkinId,
                maxUnlockedLevel: this.maxUnlockedLevel,
                levelStars: this.levelStars,
            }));
        }
        catch (e) { }
    }
};
exports.default = GameState;

cc._RF.pop();