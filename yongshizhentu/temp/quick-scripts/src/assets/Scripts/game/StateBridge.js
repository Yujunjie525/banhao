"use strict";
cc._RF.push(module, '8dfd7CifkpG0ZotGiaMDXRI', 'StateBridge');
// Scripts/game/StateBridge.ts

Object.defineProperty(exports, "__esModule", { value: true });
var GameData_1 = require("../Load/GameData");
var UserDataSyncManager_1 = require("../Manager/UserDataSyncManager");
var GameState_1 = require("./GameState");
var SHENPO_KEY = 'Game2Shenpo';
var HERO_TIERS_KEY = 'Game2HeroTiers';
function getScopedKey(baseKey) {
    var userId = cc.sys.localStorage.getItem('SLS_USER_ID');
    return userId ? baseKey + "_" + userId : baseKey;
}
function normalizeLevelStars(rawStars) {
    var stars = {};
    if (Array.isArray(rawStars)) {
        rawStars.forEach(function (value, index) {
            var star = Math.max(0, Math.floor(Number(value) || 0));
            if (star > 0)
                stars[String(index + 1)] = star;
        });
        return stars;
    }
    if (rawStars && typeof rawStars === 'object') {
        Object.keys(rawStars).forEach(function (levelId) {
            var star = Math.max(0, Math.floor(Number(rawStars[levelId]) || 0));
            if (star > 0)
                stars[String(levelId)] = star;
        });
    }
    return stars;
}
function copyLevelStarsToArray(rawStars) {
    var totalLevels = GameData_1.default.getTotalLevels ? GameData_1.default.getTotalLevels() : 0;
    var total = Math.max(totalLevels, Object.keys(rawStars || {}).length);
    var starsArray = [];
    for (var i = 1; i <= total; i++) {
        starsArray.push(Math.max(0, Math.floor(Number(rawStars && rawStars[String(i)]) || 0)));
    }
    return starsArray;
}
function requestUpload() {
    try {
        if (UserDataSyncManager_1.default && UserDataSyncManager_1.default.requestUpload) {
            UserDataSyncManager_1.default.requestUpload();
        }
    }
    catch (error) {
        cc.warn('[StateBridge] request upload failed', error);
    }
}
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
    StateBridge.getFailedLevels = function () {
        GameState_1.loadProgress();
        var failed = GameState_1.getProgress().failed_levels || [];
        return failed
            .map(function (level) { return Math.max(1, Math.floor(Number(level) || 0)); })
            .filter(function (level, index, list) { return level > 0 && list.indexOf(level) === index; });
    };
    StateBridge.saveFailedLevels = function (failedLevels) {
        GameState_1.loadProgress();
        GameState_1.getProgress().failed_levels = (failedLevels || [])
            .map(function (level) { return Math.max(1, Math.floor(Number(level) || 0)); })
            .filter(function (level, index, list) { return level > 0 && list.indexOf(level) === index; });
        GameState_1.saveProgress();
    };
    StateBridge.hasNewStateSave = function () {
        return !!cc.sys.localStorage.getItem(GameState_1.getProgressSaveKey());
    };
    StateBridge.syncForStartScene = function () {
        if (this.hasNewStateSave()) {
            this.syncNewToOld();
        }
        else {
            this.syncOldToNew();
        }
    };
    StateBridge.syncOldToNew = function () {
        if (GameData_1.default.GetStaminaData)
            GameData_1.default.GetStaminaData();
        if (GameData_1.default.CheckAndRecoverStamina)
            GameData_1.default.CheckAndRecoverStamina();
        GameState_1.loadProgress();
        var p = GameState_1.getProgress();
        p.stamina = Math.max(0, Math.floor(Number(GameData_1.default.currentStamina) || p.stamina || 0));
        p.last_stamina_time = Math.floor((Number(GameData_1.default.lastRecoverTime) || Date.now()) / 1000);
        p.unlocked_level = Math.max(1, Math.floor(Number(GameData_1.default.unlockedLevel) || p.unlocked_level || 1));
        p.level_stars = normalizeLevelStars(GameData_1.default.levelStars || p.level_stars);
        GameState_1.default.selectedLevel = Math.max(1, Math.floor(Number(GameData_1.default.currentLevel) || GameState_1.default.selectedLevel || 1));
        GameState_1.saveProgress();
    };
    StateBridge.syncNewToOld = function () {
        GameState_1.loadProgress();
        var p = GameState_1.getProgress();
        GameData_1.default.currentStamina = Math.max(0, Math.floor(Number(p.stamina) || 0));
        GameData_1.default.lastRecoverTime = Math.max(0, Math.floor(Number(p.last_stamina_time) || 0)) * 1000 || Date.now();
        if (GameData_1.default.SaveStaminaData)
            GameData_1.default.SaveStaminaData();
        GameData_1.default.unlockedLevel = Math.max(1, Math.floor(Number(p.unlocked_level) || 1));
        GameData_1.default.currentLevel = Math.min(Math.max(1, Math.floor(Number(GameState_1.default.selectedLevel) || 1)), GameData_1.default.unlockedLevel);
        GameData_1.default.levelStars = copyLevelStarsToArray(p.level_stars || {});
        if (GameData_1.default.SaveLevelData)
            GameData_1.default.SaveLevelData();
        cc.director.emit('staminaUpdated');
        requestUpload();
    };
    StateBridge.consumeStamina = function () {
        GameState_1.loadProgress();
        var p = GameState_1.getProgress();
        if (p.stamina <= 0) {
            this.syncNewToOld();
            return false;
        }
        p.stamina -= 1;
        p.last_stamina_time = Math.floor(Date.now() / 1000);
        GameState_1.saveProgress();
        UserDataSyncManager_1.default.recordConsumedStamina(1);
        this.syncNewToOld();
        return true;
    };
    StateBridge.prepareLevelSelection = function () {
        this.syncForStartScene();
        var p = GameState_1.getProgress();
        GameState_1.default.selectedLevel = Math.max(1, Math.min(GameState_1.default.selectedLevel || p.unlocked_level || 1, p.unlocked_level || 1));
        GameState_1.saveProgress();
    };
    StateBridge.prepareUpgrade = function () {
        this.syncForStartScene();
        GameState_1.saveProgress();
    };
    return StateBridge;
}());
exports.default = StateBridge;

cc._RF.pop();