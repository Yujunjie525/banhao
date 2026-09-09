"use strict";
cc._RF.push(module, '0e7d1U50pVA5qRiWtAtAHdk', 'StateBridge');
// Scripts/game2/StateBridge.ts

Object.defineProperty(exports, "__esModule", { value: true });
var GameData_1 = require("../Load/GameData");
var UserDataSyncManager_1 = require("../Manager/UserDataSyncManager");
var GameState_1 = require("./GameState");
var HERO_FRAGMENT_IDS = ['Item_002', 'Item_003', 'Item_004', 'Item_005', 'Item_006', 'Item_007'];
var SHENPO_KEY = 'Game2Shenpo';
var HERO_TIERS_KEY = 'Game2HeroTiers';
function getScopedKey(baseKey) {
    var userId = cc.sys.localStorage.getItem('SLS_USER_ID');
    return userId ? baseKey + "_" + userId : baseKey;
}
function normalizeLevelStars(rawStars) {
    var stars = {};
    if (Array.isArray(rawStars)) {
        for (var i = 0; i < rawStars.length; i++) {
            var value = Number(rawStars[i]) || 0;
            if (value > 0) {
                stars[String(i + 1)] = value;
            }
        }
    }
    else if (rawStars && typeof rawStars === 'object') {
        Object.keys(rawStars).forEach(function (key) {
            var value = Number(rawStars[key]) || 0;
            if (value > 0) {
                stars[String(key)] = value;
            }
        });
    }
    return stars;
}
function copyLevelStarsToArray(rawStars) {
    var totalLevels = GameData_1.default.getTotalLevels ? GameData_1.default.getTotalLevels() : 0;
    var starsArray = [];
    for (var i = 1; i <= totalLevels; i++) {
        starsArray.push(Number(rawStars[String(i)]) || 0);
    }
    return starsArray;
}
// 负责旧项目 GameData 和新玩法 GameState 之间的数据同步。
// 进入新玩法前，把旧主界面的数据拷给新玩法；
// 退出新玩法时，再把新玩法的结果写回旧主界面和同步系统。
var StateBridge = /** @class */ (function () {
    function StateBridge() {
    }
    StateBridge.getShenpo = function () {
        var raw = cc.sys.localStorage.getItem(getScopedKey(SHENPO_KEY));
        var value = raw ? parseInt(raw, 10) : 0;
        return isNaN(value) ? 0 : Math.max(0, value);
    };
    StateBridge.saveShenpo = function (value) {
        cc.sys.localStorage.setItem(getScopedKey(SHENPO_KEY), String(Math.max(0, Math.floor(value || 0))));
    };
    StateBridge.getHeroTiers = function () {
        try {
            var raw = cc.sys.localStorage.getItem(getScopedKey(HERO_TIERS_KEY));
            return raw ? JSON.parse(raw) : {};
        }
        catch (error) {
            return {};
        }
    };
    StateBridge.saveHeroTiers = function (heroTiers) {
        cc.sys.localStorage.setItem(getScopedKey(HERO_TIERS_KEY), JSON.stringify(heroTiers || {}));
    };
    StateBridge.hasNewStateSave = function () {
        return !!cc.sys.localStorage.getItem(GameState_1.getGameStateSaveKey());
    };
    // Start 场景加载时调用。
    // 如果当前账号已经有新玩法存档，就把它回写到旧主界面；
    // 否则用旧主界面的数据初始化新玩法存档。
    StateBridge.syncForStartScene = function () {
        if (this.hasNewStateSave()) {
            this.syncNewToOld();
        }
        else {
            this.syncOldToNew();
        }
    };
    // 旧 -> 新
    StateBridge.syncOldToNew = function () {
        if (GameData_1.default.GetStaminaData)
            GameData_1.default.GetStaminaData();
        if (GameData_1.default.CheckAndRecoverStamina)
            GameData_1.default.CheckAndRecoverStamina();
        if (GameData_1.default.GetGoldData)
            GameData_1.default.GetGoldData();
        if (GameData_1.default.GetLevelData)
            GameData_1.default.GetLevelData();
        if (GameData_1.default.GetItemStockData)
            GameData_1.default.GetItemStockData();
        GameState_1.default.stamina = GameData_1.default.currentStamina;
        GameState_1.default.shenpo = this.getShenpo();
        GameState_1.default.maxUnlockedLevel = Math.max(0, (GameData_1.default.unlockedLevel || 1) - 1);
        GameState_1.default.levelStars = normalizeLevelStars(GameData_1.default.levelStars);
        GameState_1.default.heroShards = GameState_1.default.heroShards || {};
        GameState_1.default.heroTiers = this.getHeroTiers();
        HERO_FRAGMENT_IDS.forEach(function (itemId, index) {
            var stock = GameData_1.default.getItemStock ? GameData_1.default.getItemStock(index + 1) : 0;
            GameState_1.default.heroShards[itemId] = Math.max(0, stock || 0);
        });
        if (!GameState_1.default.selectedLevelIdx || GameState_1.default.selectedLevelIdx < 0) {
            GameState_1.default.selectedLevelIdx = Math.max(0, (GameData_1.default.currentLevel || 1) - 1);
        }
        GameState_1.default.selectedLevelId = String(GameState_1.default.selectedLevelIdx + 1);
        GameState_1.default.save();
    };
    // 新 -> 旧
    StateBridge.syncNewToOld = function () {
        GameData_1.default.currentStamina = Math.max(0, GameState_1.default.stamina || 0);
        if (GameData_1.default.SaveStaminaData)
            GameData_1.default.SaveStaminaData();
        this.saveShenpo(GameState_1.default.shenpo || 0);
        this.saveHeroTiers(GameState_1.default.heroTiers || {});
        var unlockedLevel = Math.max(1, (GameState_1.default.maxUnlockedLevel || 0) + 1);
        GameData_1.default.unlockedLevel = unlockedLevel;
        GameData_1.default.currentLevel = Math.min(Math.max(1, (GameState_1.default.selectedLevelIdx || 0) + 1), unlockedLevel);
        GameData_1.default.levelStars = copyLevelStarsToArray(GameState_1.default.levelStars || {});
        if (GameData_1.default.SaveLevelData)
            GameData_1.default.SaveLevelData();
        HERO_FRAGMENT_IDS.forEach(function (itemId, index) {
            var count = Math.max(0, (GameState_1.default.heroShards && GameState_1.default.heroShards[itemId]) || 0);
            GameData_1.default.itemStock[index] = count;
        });
        if (GameData_1.default.SaveItemStockData)
            GameData_1.default.SaveItemStockData();
        cc.director.emit('goldUpdated');
        cc.director.emit('staminaUpdated');
        cc.director.emit('shenpoUpdated');
        UserDataSyncManager_1.default.requestUpload();
    };
    StateBridge.consumeStamina = function () {
        if (GameData_1.default.GetStaminaData)
            GameData_1.default.GetStaminaData();
        if (GameData_1.default.CheckAndRecoverStamina)
            GameData_1.default.CheckAndRecoverStamina();
        var enoughStamina = GameData_1.default.HasEnoughStamina
            ? GameData_1.default.HasEnoughStamina()
            : GameData_1.default.currentStamina > 0;
        if (!enoughStamina) {
            GameState_1.default.stamina = Math.max(0, GameData_1.default.currentStamina || 0);
            GameState_1.default.save();
            cc.director.emit('staminaUpdated');
            return false;
        }
        var consumed = GameData_1.default.ConsumeStamina
            ? GameData_1.default.ConsumeStamina()
            : false;
        if (!consumed) {
            GameState_1.default.stamina = Math.max(0, GameData_1.default.currentStamina || 0);
            GameState_1.default.save();
            cc.director.emit('staminaUpdated');
            return false;
        }
        GameState_1.default.stamina = Math.max(0, GameData_1.default.currentStamina || 0);
        GameState_1.default.save();
        cc.director.emit('staminaUpdated');
        UserDataSyncManager_1.default.requestUpload();
        return true;
    };
    StateBridge.prepareLevelSelection = function () {
        this.syncOldToNew();
        GameState_1.default.selectedLevelIdx = Math.max(0, (GameData_1.default.unlockedLevel || 1) - 1);
        GameState_1.default.selectedLevelId = String(GameState_1.default.selectedLevelIdx + 1);
        GameState_1.default.save();
    };
    StateBridge.prepareUpgrade = function () {
        this.syncOldToNew();
        GameState_1.default.save();
    };
    return StateBridge;
}());
exports.default = StateBridge;

cc._RF.pop();