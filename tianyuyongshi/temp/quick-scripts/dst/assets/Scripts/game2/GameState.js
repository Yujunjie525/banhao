
                (function() {
                    var nodeEnv = typeof require !== 'undefined' && typeof process !== 'undefined';
                    var __module = nodeEnv ? module : {exports:{}};
                    var __filename = 'preview-scripts/assets/Scripts/game2/GameState.js';
                    var __require = nodeEnv ? function (request) {
                        return cc.require(request);
                    } : function (request) {
                        return __quick_compile_project__.require(request, __filename);
                    };
                    function __define (exports, require, module) {
                        if (!nodeEnv) {__quick_compile_project__.registerModule(__filename, module);}"use strict";
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
                    }
                    if (nodeEnv) {
                        __define(__module.exports, __require, __module);
                    }
                    else {
                        __quick_compile_project__.registerModuleFunc(__filename, function () {
                            __define(__module.exports, __require, __module);
                        });
                    }
                })();
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFzc2V0c1xcU2NyaXB0c1xcZ2FtZTJcXEdhbWVTdGF0ZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7QUFBQSxrQ0FBa0M7OztBQUVsQyxJQUFNLFFBQVEsR0FBRyxjQUFjLENBQUM7QUFFaEMsU0FBUyxVQUFVO0lBQ2YsSUFBSTtRQUNBLE9BQU8sRUFBRSxJQUFJLEVBQUUsQ0FBQyxHQUFHLElBQUksRUFBRSxDQUFDLEdBQUcsQ0FBQyxZQUFZO1lBQ3RDLENBQUMsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLFlBQVksQ0FBQyxPQUFPLENBQUMsYUFBYSxDQUFDO1lBQzVDLENBQUMsQ0FBQyxJQUFJLENBQUM7S0FDZDtJQUFDLE9BQU8sQ0FBQyxFQUFFLEdBQUU7SUFDZCxPQUFPLElBQUksQ0FBQztBQUNoQixDQUFDO0FBRUQsU0FBZ0IsbUJBQW1CO0lBQy9CLElBQU0sTUFBTSxHQUFHLFVBQVUsRUFBRSxDQUFDO0lBQzVCLE9BQU8sTUFBTSxDQUFDLENBQUMsQ0FBSSxRQUFRLFNBQUksTUFBUSxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUM7QUFDdkQsQ0FBQztBQUhELGtEQUdDO0FBRUQsU0FBUyxLQUFLO0lBQ1YsSUFBSTtRQUNBLElBQU0sR0FBRyxHQUFHLFlBQVksQ0FBQyxPQUFPLENBQUMsbUJBQW1CLEVBQUUsQ0FBQyxDQUFDO1FBQ3hELElBQUksR0FBRztZQUFFLE9BQU8sSUFBSSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQztLQUNuQztJQUFDLE9BQU8sQ0FBQyxFQUFFLEdBQUU7SUFDZCxPQUFPLElBQUksQ0FBQztBQUNoQixDQUFDO0FBRUQsSUFBTSxNQUFNLEdBQUcsS0FBSyxFQUFFLENBQUM7QUFFdkIsSUFBTSxTQUFTLEdBQUc7SUFDZCxPQUFPO0lBQ1AsT0FBTyxFQUFLLE1BQU0sQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBSSxDQUFDLENBQUMsRUFBRTtJQUMzQyxNQUFNLEVBQU0sTUFBTSxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFLLENBQUMsQ0FBQyxHQUFHO0lBRTVDLGlEQUFpRDtJQUNqRCxVQUFVLEVBQUUsQ0FBQyxNQUFNLElBQUksTUFBTSxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxFQUFrQztJQUVsRyxvREFBb0Q7SUFDcEQsU0FBUyxFQUFFLENBQUMsTUFBTSxJQUFJLE1BQU0sQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsRUFBa0M7SUFFL0YsWUFBWTtJQUNaLFlBQVksRUFBRSxDQUFDO0lBRWYsZUFBZTtJQUNmLGNBQWMsRUFBRSxDQUFDLE1BQU0sSUFBSSxNQUFNLENBQUMsY0FBYyxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxjQUFjLENBQUMsQ0FBQyxDQUFDLFNBQVM7SUFFckYsMEJBQTBCO0lBQzFCLGdCQUFnQixFQUFFLENBQUM7SUFDbkIsZUFBZSxFQUFHLEdBQUc7SUFFckIscUJBQXFCO0lBQ3JCLGdCQUFnQixFQUFFLENBQUMsTUFBTSxJQUFJLE1BQU0sQ0FBQyxnQkFBZ0IsSUFBSSxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLGdCQUFnQixDQUFDLENBQUMsQ0FBQyxDQUFDO0lBRTNGLHlDQUF5QztJQUN6QyxVQUFVLEVBQUUsQ0FBQyxNQUFNLElBQUksTUFBTSxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxFQUFtQztJQUVuRyxrQkFBa0I7SUFDbEIsYUFBYSxFQUFFLEVBQW1EO0lBRWxFLFNBQVM7SUFDVCxVQUFVLEVBQUU7UUFDUixLQUFLLEVBQUUsQ0FBQztRQUNSLFlBQVksRUFBRSxDQUFDO1FBQ2YsWUFBWSxFQUFFLENBQUM7UUFDZixZQUFZLEVBQUUsQ0FBQztLQUNsQjtJQUVELElBQUk7UUFDQSxJQUFJO1lBQ0EsWUFBWSxDQUFDLE9BQU8sQ0FBQyxtQkFBbUIsRUFBRSxFQUFFLElBQUksQ0FBQyxTQUFTLENBQUM7Z0JBQ3ZELE9BQU8sRUFBVSxJQUFJLENBQUMsT0FBTztnQkFDN0IsTUFBTSxFQUFXLElBQUksQ0FBQyxNQUFNO2dCQUM1QixVQUFVLEVBQU8sSUFBSSxDQUFDLFVBQVU7Z0JBQ2hDLFNBQVMsRUFBUSxJQUFJLENBQUMsU0FBUztnQkFDL0IsY0FBYyxFQUFHLElBQUksQ0FBQyxjQUFjO2dCQUNwQyxnQkFBZ0IsRUFBRSxJQUFJLENBQUMsZ0JBQWdCO2dCQUN2QyxVQUFVLEVBQU8sSUFBSSxDQUFDLFVBQVU7YUFDbkMsQ0FBQyxDQUFDLENBQUM7U0FDUDtRQUFDLE9BQU8sQ0FBQyxFQUFFLEdBQUU7SUFDbEIsQ0FBQztDQUNKLENBQUM7QUFFRixrQkFBZSxTQUFTLENBQUMiLCJmaWxlIjoiIiwic291cmNlUm9vdCI6Ii8iLCJzb3VyY2VzQ29udGVudCI6WyIvLyDot6jlnLrmma/nirbmgIHljZXkvosg4oCUIENDMi54IOaooeWdl+WPquaxguWAvOS4gOasoe+8jOWkqeeEtui3qOWcuuaZr+aMgeS5hVxyXG5cclxuY29uc3QgU0FWRV9LRVkgPSAnZ2FtZXN0YXRlX3YxJztcblxuZnVuY3Rpb24gX2dldFVzZXJJZCgpOiBzdHJpbmcgfCBudWxsIHtcbiAgICB0cnkge1xuICAgICAgICByZXR1cm4gY2MgJiYgY2Muc3lzICYmIGNjLnN5cy5sb2NhbFN0b3JhZ2VcbiAgICAgICAgICAgID8gY2Muc3lzLmxvY2FsU3RvcmFnZS5nZXRJdGVtKCdTTFNfVVNFUl9JRCcpXG4gICAgICAgICAgICA6IG51bGw7XG4gICAgfSBjYXRjaCAoZSkge31cbiAgICByZXR1cm4gbnVsbDtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGdldEdhbWVTdGF0ZVNhdmVLZXkoKTogc3RyaW5nIHtcbiAgICBjb25zdCB1c2VySWQgPSBfZ2V0VXNlcklkKCk7XG4gICAgcmV0dXJuIHVzZXJJZCA/IGAke1NBVkVfS0VZfV8ke3VzZXJJZH1gIDogU0FWRV9LRVk7XG59XG5cbmZ1bmN0aW9uIF9sb2FkKCkge1xuICAgIHRyeSB7XG4gICAgICAgIGNvbnN0IHJhdyA9IGxvY2FsU3RvcmFnZS5nZXRJdGVtKGdldEdhbWVTdGF0ZVNhdmVLZXkoKSk7XG4gICAgICAgIGlmIChyYXcpIHJldHVybiBKU09OLnBhcnNlKHJhdyk7XG4gICAgfSBjYXRjaCAoZSkge31cbiAgICByZXR1cm4gbnVsbDtcbn1cclxuXHJcbmNvbnN0IF9zYXZlZCA9IF9sb2FkKCk7XHJcblxyXG5jb25zdCBHYW1lU3RhdGUgPSB7XHJcbiAgICAvLyDnjqnlrrbotYTkuqdcclxuICAgIHN0YW1pbmE6ICAgIF9zYXZlZCA/IF9zYXZlZC5zdGFtaW5hICAgIDogMzAsXHJcbiAgICBzaGVucG86ICAgICBfc2F2ZWQgPyBfc2F2ZWQuc2hlbnBvICAgICA6IDEwMCxcclxuXHJcbiAgICAvLyDoi7Hpm4Tnoo7niYfvvJprZXkgPSBmcmFnbWVudElk77yI5aaCICdJdGVtXzAwMifvvInvvIx2YWx1ZSA9IOaVsOmHj1xyXG4gICAgaGVyb1NoYXJkczogKF9zYXZlZCAmJiBfc2F2ZWQuaGVyb1NoYXJkcykgPyBfc2F2ZWQuaGVyb1NoYXJkcyA6IHt9IGFzIHsgW2l0ZW1JZDogc3RyaW5nXTogbnVtYmVyIH0sXHJcblxyXG4gICAgLy8g5YuH5aOr5Y2H6Zi2562J57qn77yaa2V5ID0gaGVyb0lk77yI5aaCICdIZXJvXzAxJ++8ie+8jHZhbHVlID0g5b2T5YmN6Zi257qn77yIMei1t++8iVxyXG4gICAgaGVyb1RpZXJzOiAoX3NhdmVkICYmIF9zYXZlZC5oZXJvVGllcnMpID8gX3NhdmVkLmhlcm9UaWVycyA6IHt9IGFzIHsgW2hlcm9JZDogc3RyaW5nXTogbnVtYmVyIH0sXHJcblxyXG4gICAgLy8g5L2T5Yqb5oGi5aSN6K6h5pe277yI56eS77yJXHJcbiAgICBzdGFtaW5hVGltZXI6IDAsXHJcblxyXG4gICAgLy8g5b2T5YmN6KOF5aSH55qE56We5qC455qu6IKkIElEXHJcbiAgICBlcXVpcHBlZFNraW5JZDogKF9zYXZlZCAmJiBfc2F2ZWQuZXF1aXBwZWRTa2luSWQpID8gX3NhdmVkLmVxdWlwcGVkU2tpbklkIDogJ1NraW5fMDEnLFxyXG5cclxuICAgIC8vIOmAieWFs+eVjOmdou+8muW9k+WJjemAieS4reeahOWFs+WNoee0ouW8le+8iDAtYmFzZWTvvIlcclxuICAgIHNlbGVjdGVkTGV2ZWxJZHg6IDAsXHJcbiAgICBzZWxlY3RlZExldmVsSWQ6ICAnMScsXHJcblxyXG4gICAgLy8g5pyA6auY5bey6Kej6ZSB5YWz5Y2h57Si5byV77yIMC1iYXNlZO+8iVxyXG4gICAgbWF4VW5sb2NrZWRMZXZlbDogKF9zYXZlZCAmJiBfc2F2ZWQubWF4VW5sb2NrZWRMZXZlbCAhPSBudWxsKSA/IF9zYXZlZC5tYXhVbmxvY2tlZExldmVsIDogNCxcclxuXHJcbiAgICAvLyDmr4/lhbPmmJ/nuqforrDlvZXvvJprZXkgPSBsZXZlbF9pZO+8iOWtl+espuS4su+8ie+8jHZhbHVlID0gMH4zXHJcbiAgICBsZXZlbFN0YXJzOiAoX3NhdmVkICYmIF9zYXZlZC5sZXZlbFN0YXJzKSA/IF9zYXZlZC5sZXZlbFN0YXJzIDoge30gYXMgeyBbbGV2ZWxJZDogc3RyaW5nXTogbnVtYmVyIH0sXHJcblxyXG4gICAgLy8g57uT566X5p2l5rqQ5qCH6K6w77yI55So5LqO5Zy65pmv6Ze05Lyg5Y+C77yJXHJcbiAgICByZXR1cm5pbmdGcm9tOiAnJyBhcyAnZmxlZScgfCAncmV2aXZlJyB8ICd2aWN0b3J5JyB8ICdkZWZlYXQnIHwgJycsXHJcblxyXG4gICAgLy8g5LiK5bGA57uT566X5pWw5o2uXHJcbiAgICBsYXN0UmVzdWx0OiB7XHJcbiAgICAgICAgc3RhcnM6IDAsXHJcbiAgICAgICAgc2hlbnBvRWFybmVkOiAwLFxyXG4gICAgICAgIHNoYXJkc0Vhcm5lZDogMCxcclxuICAgICAgICB3YXZlc0NsZWFyZWQ6IDBcclxuICAgIH0sXHJcblxyXG4gICAgc2F2ZSgpIHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGxvY2FsU3RvcmFnZS5zZXRJdGVtKGdldEdhbWVTdGF0ZVNhdmVLZXkoKSwgSlNPTi5zdHJpbmdpZnkoe1xuICAgICAgICAgICAgICAgIHN0YW1pbmE6ICAgICAgICAgdGhpcy5zdGFtaW5hLFxuICAgICAgICAgICAgICAgIHNoZW5wbzogICAgICAgICAgdGhpcy5zaGVucG8sXG4gICAgICAgICAgICAgICAgaGVyb1NoYXJkczogICAgICB0aGlzLmhlcm9TaGFyZHMsXG4gICAgICAgICAgICAgICAgaGVyb1RpZXJzOiAgICAgICB0aGlzLmhlcm9UaWVycyxcclxuICAgICAgICAgICAgICAgIGVxdWlwcGVkU2tpbklkOiAgdGhpcy5lcXVpcHBlZFNraW5JZCxcclxuICAgICAgICAgICAgICAgIG1heFVubG9ja2VkTGV2ZWw6IHRoaXMubWF4VW5sb2NrZWRMZXZlbCxcclxuICAgICAgICAgICAgICAgIGxldmVsU3RhcnM6ICAgICAgdGhpcy5sZXZlbFN0YXJzLFxyXG4gICAgICAgICAgICB9KSk7XHJcbiAgICAgICAgfSBjYXRjaCAoZSkge31cclxuICAgIH1cclxufTtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IEdhbWVTdGF0ZTtcclxuIl19