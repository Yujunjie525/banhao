
                (function() {
                    var nodeEnv = typeof require !== 'undefined' && typeof process !== 'undefined';
                    var __module = nodeEnv ? module : {exports:{}};
                    var __filename = 'preview-scripts/assets/Scripts/Manager/UserDataSyncManager.js';
                    var __require = nodeEnv ? function (request) {
                        return cc.require(request);
                    } : function (request) {
                        return __quick_compile_project__.require(request, __filename);
                    };
                    function __define (exports, require, module) {
                        if (!nodeEnv) {__quick_compile_project__.registerModule(__filename, module);}"use strict";
cc._RF.push(module, '5ae77s8pStHLLzbGSfLoEbF', 'UserDataSyncManager');
// Scripts/Manager/UserDataSyncManager.ts

Object.defineProperty(exports, "__esModule", { value: true });
var AppConfig_1 = require("../Common/AppConfig");
var UserDataSyncManager = /** @class */ (function () {
    function UserDataSyncManager() {
    }
    UserDataSyncManager.ensureSessionState = function () {
        var sessionKey = (this.getUsername() || "") + "::" + (this.getUserId() || "");
        if (sessionKey === this.currentSessionKey) {
            return;
        }
        this.currentSessionKey = sessionKey;
        this.initialSyncCompleted = false;
        this.lastUploadedPayload = "";
        this.hasDirtyChanges = false;
        if (this.uploadTimer) {
            clearTimeout(this.uploadTimer);
            this.uploadTimer = null;
        }
    };
    UserDataSyncManager.getUsername = function () {
        return cc.sys.localStorage.getItem(this.USERNAME_KEY);
    };
    UserDataSyncManager.getUserId = function () {
        return cc.sys.localStorage.getItem(this.USER_ID_KEY);
    };
    UserDataSyncManager.getScopedKey = function (baseKey) {
        var userId = this.getUserId();
        return userId ? baseKey + "_" + userId : baseKey;
    };
    UserDataSyncManager.hasLoginContext = function () {
        return !!this.getUsername();
    };
    UserDataSyncManager.getGameData = function () {
        return require("../Load/GameData").default;
    };
    UserDataSyncManager.getStateBridge = function () {
        return require("../game/StateBridge").default;
    };
    UserDataSyncManager.getGameState = function () {
        return require("../game/GameState").default;
    };
    UserDataSyncManager.logDebug = function (message, data) {
        if (!this.ENABLE_DEBUG_LOG) {
            return;
        }
        if (typeof data === "undefined") {
            console.log("[UserDataSync] " + message);
            return;
        }
        console.log("[UserDataSync] " + message, data);
    };
    UserDataSyncManager.ensureLifecycleHooks = function () {
        var _this = this;
        if (this.lifecycleInitialized) {
            return;
        }
        this.lifecycleInitialized = true;
        if (cc && cc.game && cc.game.on) {
            cc.game.on(cc.game.EVENT_HIDE, function () {
                _this.flushUpload().catch(function (error) {
                    console.error("Flush user data on hide failed:", error);
                });
            });
        }
    };
    UserDataSyncManager.enableUploadsForCurrentSession = function () {
        this.ensureSessionState();
        this.ensureLifecycleHooks();
        if (!this.hasLoginContext()) {
            return;
        }
        this.initialSyncCompleted = true;
        this.lastUploadedPayload = this.serializePayload(this.buildLocalPayload());
        this.hasDirtyChanges = false;
        this.logDebug("Enable uploads for current session", {
            username: this.getUsername(),
            userId: this.getUserId()
        });
    };
    UserDataSyncManager.syncFromServer = function () {
        return __awaiter(this, void 0, Promise, function () {
            var remotePayload, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.ensureSessionState();
                        this.ensureLifecycleHooks();
                        if (!this.hasLoginContext()) {
                            return [2 /*return*/];
                        }
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, 4, 5]);
                        return [4 /*yield*/, this.fetchRemotePayload()];
                    case 2:
                        remotePayload = _a.sent();
                        if (remotePayload) {
                            this.logDebug("Parsed remote payload", remotePayload);
                            this.applyPayloadToLocal(remotePayload);
                        }
                        else {
                            console.warn("GetUserData returned empty jsondata, reloading scoped local defaults for current account.");
                            this.reloadScopedLocalData();
                        }
                        return [3 /*break*/, 5];
                    case 3:
                        error_1 = _a.sent();
                        console.error("Sync user data from server failed:", error_1);
                        return [3 /*break*/, 5];
                    case 4:
                        this.initialSyncCompleted = true;
                        this.lastUploadedPayload = this.serializePayload(this.buildLocalPayload());
                        this.hasDirtyChanges = false;
                        return [7 /*endfinally*/];
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    UserDataSyncManager.requestUpload = function () {
        var _this = this;
        this.ensureSessionState();
        this.ensureLifecycleHooks();
        if (!this.initialSyncCompleted || !this.hasLoginContext()) {
            return;
        }
        this.hasDirtyChanges = true;
        this.logDebug("Mark user data dirty and schedule upload", {
            username: this.getUsername(),
            userId: this.getUserId()
        });
        if (this.uploadTimer) {
            clearTimeout(this.uploadTimer);
        }
        this.uploadTimer = setTimeout(function () {
            _this.uploadTimer = null;
            _this.uploadLocalData().catch(function (error) {
                console.error("Upload user data failed:", error);
            });
        }, 300);
    };
    UserDataSyncManager.flushUpload = function () {
        return __awaiter(this, void 0, Promise, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.ensureSessionState();
                        if (!this.initialSyncCompleted || !this.hasLoginContext() || !this.hasDirtyChanges) {
                            return [2 /*return*/];
                        }
                        if (this.uploadTimer) {
                            clearTimeout(this.uploadTimer);
                            this.uploadTimer = null;
                        }
                        this.logDebug("Flush upload immediately", {
                            username: this.getUsername(),
                            userId: this.getUserId()
                        });
                        return [4 /*yield*/, this.uploadLocalData(true)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    UserDataSyncManager.getTotalConsumedStamina = function () {
        return this.readNumber(this.TOTAL_CONSUMED_STAMINA_KEY, 0);
    };
    UserDataSyncManager.setTotalConsumedStamina = function (value) {
        var normalizedValue = Math.max(0, Math.floor(value));
        cc.sys.localStorage.setItem(this.getScopedKey(this.TOTAL_CONSUMED_STAMINA_KEY), normalizedValue.toString());
    };
    UserDataSyncManager.recordConsumedStamina = function (amount) {
        if (amount === void 0) { amount = 1; }
        if (amount <= 0) {
            return;
        }
        var nextValue = this.getTotalConsumedStamina() + amount;
        this.setTotalConsumedStamina(nextValue);
        this.requestUpload();
    };
    UserDataSyncManager.uploadLocalData = function (force) {
        if (force === void 0) { force = false; }
        return __awaiter(this, void 0, Promise, function () {
            var payload, serializedPayload, response;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this.hasLoginContext()) {
                            return [2 /*return*/];
                        }
                        payload = this.buildLocalPayload();
                        serializedPayload = this.serializePayload(payload);
                        if (!force && serializedPayload === this.lastUploadedPayload) {
                            this.logDebug("Skip upload because payload is unchanged");
                            return [2 /*return*/];
                        }
                        this.logDebug("Uploading payload to SaveUserData", {
                            username: this.getUsername(),
                            userId: this.getUserId(),
                            payload: payload,
                            serializedPayload: serializedPayload
                        });
                        return [4 /*yield*/, this.postJson(this.SAVE_URL, {
                                appid: AppConfig_1.APP_ID,
                                username: this.getUsername(),
                                jsondata: serializedPayload
                            })];
                    case 1:
                        response = _a.sent();
                        this.logDebug("SaveUserData response", response);
                        this.lastUploadedPayload = serializedPayload;
                        this.hasDirtyChanges = false;
                        return [2 /*return*/];
                }
            });
        });
    };
    UserDataSyncManager.buildLocalPayload = function () {
        var gameData = this.getGameData();
        var gameState = this.getGameState();
        var progress = gameState.progress || {};
        var fallbackCurrentLevel = Math.max(1, gameState.selectedLevel || gameData.currentLevel || 1);
        var fallbackUnlockedLevel = Math.max(1, progress.unlocked_level || gameData.unlockedLevel || 1);
        return {
            version: 1,
            updatedAt: Date.now(),
            currentGold: this.readNumber(this.GOLD_KEY, gameData.currentGold),
            game2Shenpo: this.readNumber(this.GAME2_SHENPO_KEY, this.getStateBridge().getShenpo()),
            game2HeroTiers: this.readJsonObject(this.GAME2_HERO_TIERS_KEY, this.getStateBridge().getHeroTiers()),
            game2EquippedSkinId: typeof gameState.equippedSkinId === "string" ? gameState.equippedSkinId : "Skin_01",
            itemStock: this.readJsonArray(this.ITEM_STOCK_KEY, gameData.itemStock || [0, 0, 0]),
            totalGoldEarned: this.readNumber(this.TOTAL_GOLD_EARNED_KEY, gameData.totalGoldEarned || 0),
            skills: this.readJsonArray(this.SKILLS_KEY, gameData.skills || []),
            achieveClaimedList: this.readNumberArray(this.ACHIEVE_KEY),
            weeklyRewardClaimedList: this.readNumberArray(this.WEEKLY_REWARD_CLAIMED_KEY),
            weeklyRewardWeekStart: this.readString(this.WEEKLY_REWARD_WEEK_START_KEY),
            dailyRewardClaimedList: this.readNumberArray(this.DAILY_REWARD_CLAIMED_KEY),
            dailyRewardDate: this.readString(this.DAILY_REWARD_DATE_KEY),
            dailyOnlineMinutes: this.readNumber(this.DAILY_ONLINE_MINUTES_KEY, 0),
            totalConsumedStamina: this.readNumber(this.TOTAL_CONSUMED_STAMINA_KEY, 0),
            currentStamina: this.readNumber(this.STAMINA_KEY, gameData.currentStamina),
            lastRecoverTime: this.readNumber(this.LAST_RECOVER_TIME_KEY, gameData.lastRecoverTime),
            unlockedRoles: this.readJsonArray(this.UNLOCKED_ROLES_KEY, gameData.unlockedRoles || [true, false, false, false, false]),
            currentRole: this.readNumber(this.CURRENT_ROLE_KEY, gameData.currentRole),
            currentLevel: this.readNumber(this.CURRENT_LEVEL_KEY, gameData.currentLevel || fallbackCurrentLevel),
            unlockedLevel: this.readNumber(this.UNLOCKED_LEVEL_KEY, gameData.unlockedLevel || fallbackUnlockedLevel),
            warriorRunBestDistance: this.readNumber(this.WARRIOR_RUN_BEST_DISTANCE_KEY, 0),
            levelStars: this.readJsonArray(this.LEVEL_STARS_KEY, this.progressStarsToArray(progress.level_stars || gameData.levelStars || [])),
            failedLevels: this.getStateBridge().getFailedLevels()
        };
    };
    UserDataSyncManager.fetchRemotePayload = function () {
        var _a, _b, _c;
        return __awaiter(this, void 0, Promise, function () {
            var response, rawPayload, parsedPayload, trimmedPayload;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0: return [4 /*yield*/, this.postJson(this.GET_URL, {
                            appid: AppConfig_1.APP_ID,
                            username: this.getUsername()
                        })];
                    case 1:
                        response = _d.sent();
                        this.logDebug("GetUserData response", response);
                        rawPayload = (_c = (_b = (_a = response === null || response === void 0 ? void 0 : response.data) === null || _a === void 0 ? void 0 : _a.jsondata) !== null && _b !== void 0 ? _b : response === null || response === void 0 ? void 0 : response.jsondata) !== null && _c !== void 0 ? _c : null;
                        if (!rawPayload) {
                            this.logDebug("GetUserData returned empty jsondata", {
                                username: this.getUsername(),
                                userId: this.getUserId(),
                                rawPayload: rawPayload
                            });
                            return [2 /*return*/, null];
                        }
                        parsedPayload = rawPayload;
                        if (typeof rawPayload === "string") {
                            trimmedPayload = rawPayload.trim();
                            if (!trimmedPayload) {
                                return [2 /*return*/, null];
                            }
                            try {
                                parsedPayload = JSON.parse(trimmedPayload);
                            }
                            catch (error) {
                                console.error("Parse remote user data failed:", error);
                                return [2 /*return*/, null];
                            }
                        }
                        if (!parsedPayload || typeof parsedPayload !== "object") {
                            return [2 /*return*/, null];
                        }
                        return [2 /*return*/, parsedPayload];
                }
            });
        });
    };
    UserDataSyncManager.applyPayloadToLocal = function (payload) {
        var gameData = this.getGameData();
        this.logDebug("Apply payload to local storage", payload);
        if (typeof payload.currentGold === "number" && Number.isFinite(payload.currentGold)) {
            var normalizedGold = Math.max(0, Math.floor(payload.currentGold));
            cc.sys.localStorage.setItem(this.getScopedKey(this.GOLD_KEY), normalizedGold.toString());
            gameData.currentGold = normalizedGold;
        }
        if (typeof payload.totalGoldEarned === "number" && Number.isFinite(payload.totalGoldEarned)) {
            var normalizedTotalGold = Math.max(0, Math.floor(payload.totalGoldEarned));
            cc.sys.localStorage.setItem(this.getScopedKey(this.TOTAL_GOLD_EARNED_KEY), normalizedTotalGold.toString());
            gameData.totalGoldEarned = normalizedTotalGold;
        }
        if (typeof payload.game2Shenpo === "number" && Number.isFinite(payload.game2Shenpo)) {
            var normalizedShenpo = Math.max(0, Math.floor(payload.game2Shenpo));
            cc.sys.localStorage.setItem(this.getScopedKey(this.GAME2_SHENPO_KEY), normalizedShenpo.toString());
            this.getStateBridge().saveShenpo(normalizedShenpo);
        }
        if (payload.game2HeroTiers && typeof payload.game2HeroTiers === "object" && !Array.isArray(payload.game2HeroTiers)) {
            cc.sys.localStorage.setItem(this.getScopedKey(this.GAME2_HERO_TIERS_KEY), JSON.stringify(payload.game2HeroTiers));
            this.getStateBridge().saveHeroTiers(payload.game2HeroTiers);
        }
        if (typeof payload.game2EquippedSkinId === "string" && payload.game2EquippedSkinId) {
            var gameState = this.getGameState();
            gameState.equippedSkinId = payload.game2EquippedSkinId;
            if (typeof gameState.save === "function") {
                gameState.save();
            }
        }
        if (Array.isArray(payload.itemStock)) {
            var normalizedItemStock = payload.itemStock.map(function (value) { return Math.max(0, Math.floor(Number(value) || 0)); });
            cc.sys.localStorage.setItem(this.getScopedKey(this.ITEM_STOCK_KEY), JSON.stringify(normalizedItemStock));
            gameData.itemStock = normalizedItemStock;
        }
        if (Array.isArray(payload.skills)) {
            cc.sys.localStorage.setItem(this.getScopedKey(this.SKILLS_KEY), JSON.stringify(payload.skills));
            gameData.skills = payload.skills;
        }
        if (Array.isArray(payload.achieveClaimedList)) {
            cc.sys.localStorage.setItem(this.getScopedKey(this.ACHIEVE_KEY), JSON.stringify(payload.achieveClaimedList));
        }
        if (Array.isArray(payload.weeklyRewardClaimedList)) {
            cc.sys.localStorage.setItem(this.getScopedKey(this.WEEKLY_REWARD_CLAIMED_KEY), JSON.stringify(payload.weeklyRewardClaimedList));
        }
        if (typeof payload.weeklyRewardWeekStart === "string") {
            cc.sys.localStorage.setItem(this.getScopedKey(this.WEEKLY_REWARD_WEEK_START_KEY), payload.weeklyRewardWeekStart);
        }
        if (Array.isArray(payload.dailyRewardClaimedList)) {
            cc.sys.localStorage.setItem(this.getScopedKey(this.DAILY_REWARD_CLAIMED_KEY), JSON.stringify(payload.dailyRewardClaimedList));
        }
        if (typeof payload.dailyRewardDate === "string") {
            cc.sys.localStorage.setItem(this.getScopedKey(this.DAILY_REWARD_DATE_KEY), payload.dailyRewardDate);
        }
        if (typeof payload.dailyOnlineMinutes === "number" && Number.isFinite(payload.dailyOnlineMinutes)) {
            var normalizedMinutes = Math.max(0, Math.floor(payload.dailyOnlineMinutes));
            cc.sys.localStorage.setItem(this.getScopedKey(this.DAILY_ONLINE_MINUTES_KEY), normalizedMinutes.toString());
        }
        if (typeof payload.totalConsumedStamina === "number" && Number.isFinite(payload.totalConsumedStamina)) {
            var normalizedConsumedStamina = Math.max(0, Math.floor(payload.totalConsumedStamina));
            cc.sys.localStorage.setItem(this.getScopedKey(this.TOTAL_CONSUMED_STAMINA_KEY), normalizedConsumedStamina.toString());
        }
        if (typeof payload.currentStamina === "number" && Number.isFinite(payload.currentStamina)) {
            var normalizedStamina = Math.max(0, Math.min(30, Math.floor(payload.currentStamina)));
            cc.sys.localStorage.setItem(this.getScopedKey(this.STAMINA_KEY), normalizedStamina.toString());
            gameData.currentStamina = normalizedStamina;
        }
        if (typeof payload.lastRecoverTime === "number" && Number.isFinite(payload.lastRecoverTime)) {
            var normalizedTime = Math.max(0, Math.floor(payload.lastRecoverTime));
            cc.sys.localStorage.setItem(this.getScopedKey(this.LAST_RECOVER_TIME_KEY), normalizedTime.toString());
            gameData.lastRecoverTime = normalizedTime;
        }
        if (Array.isArray(payload.unlockedRoles)) {
            cc.sys.localStorage.setItem(this.getScopedKey(this.UNLOCKED_ROLES_KEY), JSON.stringify(payload.unlockedRoles));
            gameData.unlockedRoles = payload.unlockedRoles;
        }
        if (typeof payload.currentRole === "number" && Number.isFinite(payload.currentRole)) {
            var normalizedRole = Math.max(0, Math.floor(payload.currentRole));
            cc.sys.localStorage.setItem(this.getScopedKey(this.CURRENT_ROLE_KEY), normalizedRole.toString());
            gameData.currentRole = normalizedRole;
        }
        if (typeof payload.currentLevel === "number" && Number.isFinite(payload.currentLevel)) {
            var normalizedCurrentLevel = Math.max(1, Math.floor(payload.currentLevel));
            cc.sys.localStorage.setItem(this.getScopedKey(this.CURRENT_LEVEL_KEY), normalizedCurrentLevel.toString());
            gameData.currentLevel = normalizedCurrentLevel;
        }
        if (typeof payload.unlockedLevel === "number" && Number.isFinite(payload.unlockedLevel)) {
            var normalizedUnlockedLevel = Math.max(1, Math.floor(payload.unlockedLevel));
            cc.sys.localStorage.setItem(this.getScopedKey(this.UNLOCKED_LEVEL_KEY), normalizedUnlockedLevel.toString());
            gameData.unlockedLevel = normalizedUnlockedLevel;
        }
        if (typeof payload.warriorRunBestDistance === "number" && Number.isFinite(payload.warriorRunBestDistance)) {
            var normalizedBestDistance = Math.max(0, Math.floor(payload.warriorRunBestDistance));
            cc.sys.localStorage.setItem(this.getScopedKey(this.WARRIOR_RUN_BEST_DISTANCE_KEY), normalizedBestDistance.toString());
            cc.sys.localStorage.setItem(this.WARRIOR_RUN_BEST_DISTANCE_KEY, normalizedBestDistance.toString());
        }
        if (Array.isArray(payload.levelStars)) {
            cc.sys.localStorage.setItem(this.getScopedKey(this.LEVEL_STARS_KEY), JSON.stringify(payload.levelStars));
            gameData.levelStars = [];
            gameData.loadLevelStarsArray(payload.levelStars);
        }
        if (Array.isArray(payload.failedLevels)) {
            this.getStateBridge().saveFailedLevels(payload.failedLevels);
        }
        gameData.GetGoldData();
        gameData.GetStaminaData();
        gameData.GetCurrentRoleData();
        this.getStateBridge().syncOldToNew();
        this.logDebug("Local data after applying remote payload", {
            currentGold: gameData.currentGold,
            currentStamina: gameData.currentStamina,
            lastRecoverTime: gameData.lastRecoverTime,
            currentRole: gameData.currentRole
        });
        cc.director.emit("goldUpdated");
        cc.director.emit("shenpoUpdated");
        cc.director.emit("staminaUpdated");
        cc.director.emit("roleUpdated");
    };
    UserDataSyncManager.reloadScopedLocalData = function () {
        var _a, _b, _c, _d;
        var gameData = this.getGameData();
        if (!gameData) {
            return;
        }
        gameData.GetGoldData();
        (_a = gameData.GetCurrentRoleData) === null || _a === void 0 ? void 0 : _a.call(gameData);
        (_b = gameData.GetItemStockData) === null || _b === void 0 ? void 0 : _b.call(gameData);
        (_c = gameData.GetStaminaData) === null || _c === void 0 ? void 0 : _c.call(gameData);
        (_d = gameData.CheckAndRecoverStamina) === null || _d === void 0 ? void 0 : _d.call(gameData);
        this.getStateBridge().syncOldToNew();
        this.logDebug("Reload scoped local data for current account", {
            username: this.getUsername(),
            userId: this.getUserId(),
            currentGold: gameData.currentGold,
            currentStamina: gameData.currentStamina
        });
        cc.director.emit("goldUpdated");
        cc.director.emit("shenpoUpdated");
        cc.director.emit("staminaUpdated");
    };
    UserDataSyncManager.readString = function (baseKey) {
        return cc.sys.localStorage.getItem(this.getScopedKey(baseKey)) || "";
    };
    UserDataSyncManager.readNumber = function (baseKey, defaultValue) {
        var rawValue = cc.sys.localStorage.getItem(this.getScopedKey(baseKey));
        if (!rawValue) {
            return defaultValue;
        }
        var parsedValue = parseInt(rawValue, 10);
        return Number.isNaN(parsedValue) ? defaultValue : parsedValue;
    };
    UserDataSyncManager.getStoredNumber = function (baseKey, defaultValue) {
        if (defaultValue === void 0) { defaultValue = 0; }
        return this.readNumber(baseKey, defaultValue);
    };
    UserDataSyncManager.readJsonArray = function (baseKey, defaultValue) {
        var rawValue = cc.sys.localStorage.getItem(this.getScopedKey(baseKey));
        if (!rawValue) {
            return defaultValue;
        }
        try {
            var parsedValue = JSON.parse(rawValue);
            return Array.isArray(parsedValue) ? parsedValue : defaultValue;
        }
        catch (error) {
            console.error("Parse local array data failed for " + baseKey + ":", error);
            return defaultValue;
        }
    };
    UserDataSyncManager.readJsonObject = function (baseKey, defaultValue) {
        var rawValue = cc.sys.localStorage.getItem(this.getScopedKey(baseKey));
        if (!rawValue) {
            return defaultValue;
        }
        try {
            var parsedValue = JSON.parse(rawValue);
            return parsedValue && typeof parsedValue === "object" && !Array.isArray(parsedValue)
                ? parsedValue
                : defaultValue;
        }
        catch (error) {
            console.error("Parse local object data failed for " + baseKey + ":", error);
            return defaultValue;
        }
    };
    UserDataSyncManager.readNumberArray = function (baseKey) {
        return this.readJsonArray(baseKey, []).filter(function (value) { return typeof value === "number"; });
    };
    UserDataSyncManager.progressStarsToArray = function (rawStars) {
        if (Array.isArray(rawStars)) {
            return rawStars.map(function (value) { return Math.max(0, Math.floor(Number(value) || 0)); });
        }
        if (!rawStars || typeof rawStars !== "object") {
            return [];
        }
        var levels = Object.keys(rawStars)
            .map(function (key) { return parseInt(key, 10); })
            .filter(function (level) { return Number.isFinite(level) && level > 0; });
        var maxLevel = levels.length > 0 ? Math.max.apply(Math, levels) : 0;
        var result = [];
        for (var level = 1; level <= maxLevel; level++) {
            result.push(Math.max(0, Math.floor(Number(rawStars[String(level)]) || 0)));
        }
        return result;
    };
    UserDataSyncManager.serializePayload = function (payload) {
        try {
            return JSON.stringify(payload);
        }
        catch (error) {
            console.error("Serialize user data payload failed:", error);
            return "{}";
        }
    };
    UserDataSyncManager.postJson = function (url, data) {
        return __awaiter(this, void 0, Promise, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, new Promise(function (resolve, reject) {
                        var xhr = new XMLHttpRequest();
                        xhr.open("POST", url, true);
                        xhr.setRequestHeader("Content-Type", "application/json");
                        xhr.onload = function () {
                            if (xhr.status >= 200 && xhr.status < 300) {
                                try {
                                    resolve(JSON.parse(xhr.responseText));
                                }
                                catch (error) {
                                    reject(new Error("JSON parse error: " + error.message));
                                }
                            }
                            else {
                                reject(new Error("HTTP error: " + xhr.status));
                            }
                        };
                        xhr.onerror = function () { return reject(new Error("Network request failed")); };
                        xhr.ontimeout = function () { return reject(new Error("Network request timeout")); };
                        xhr.send(JSON.stringify(data));
                    })];
            });
        });
    };
    UserDataSyncManager.ENABLE_DEBUG_LOG = true;
    UserDataSyncManager.SAVE_URL = "https://pay.szvi-bo.com/v1/testapp/SaveUserData";
    UserDataSyncManager.GET_URL = "https://pay.szvi-bo.com/v1/testapp/GetUserData";
    UserDataSyncManager.USERNAME_KEY = "SLS_USERNAME";
    UserDataSyncManager.USER_ID_KEY = "SLS_USER_ID";
    UserDataSyncManager.GOLD_KEY = "CurrentGold";
    UserDataSyncManager.TOTAL_GOLD_EARNED_KEY = "TotalGoldEarned";
    UserDataSyncManager.SKILLS_KEY = "Skills";
    UserDataSyncManager.ACHIEVE_KEY = "Achievesclaimed";
    UserDataSyncManager.WEEKLY_REWARD_CLAIMED_KEY = "weeklyRewardClaimed";
    UserDataSyncManager.WEEKLY_REWARD_WEEK_START_KEY = "weeklyRewardWeekStart";
    UserDataSyncManager.DAILY_REWARD_CLAIMED_KEY = "dailyRewardClaimed";
    UserDataSyncManager.DAILY_REWARD_DATE_KEY = "dailyRewardDate";
    UserDataSyncManager.DAILY_ONLINE_MINUTES_KEY = "dailyOnlineMinutes";
    UserDataSyncManager.TOTAL_CONSUMED_STAMINA_KEY = "TotalConsumedStamina";
    UserDataSyncManager.STAMINA_KEY = "Stamina";
    UserDataSyncManager.LAST_RECOVER_TIME_KEY = "LastRecoverTime";
    UserDataSyncManager.UNLOCKED_ROLES_KEY = "UnlockedRoles";
    UserDataSyncManager.CURRENT_ROLE_KEY = "CurrentRole";
    UserDataSyncManager.CURRENT_LEVEL_KEY = "CurrentLevel";
    UserDataSyncManager.UNLOCKED_LEVEL_KEY = "UnlockedLevel";
    UserDataSyncManager.WARRIOR_RUN_BEST_DISTANCE_KEY = "WarriorRunBestDistance";
    UserDataSyncManager.LEVEL_STARS_KEY = "LevelStars";
    UserDataSyncManager.GAME2_SHENPO_KEY = "Game2Shenpo";
    UserDataSyncManager.GAME2_HERO_TIERS_KEY = "Game2HeroTiers";
    UserDataSyncManager.ITEM_STOCK_KEY = "ItemStock";
    UserDataSyncManager.currentSessionKey = "";
    UserDataSyncManager.initialSyncCompleted = false;
    UserDataSyncManager.lastUploadedPayload = "";
    UserDataSyncManager.uploadTimer = null;
    UserDataSyncManager.hasDirtyChanges = false;
    UserDataSyncManager.lifecycleInitialized = false;
    return UserDataSyncManager;
}());
exports.default = UserDataSyncManager;

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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFzc2V0c1xcU2NyaXB0c1xcTWFuYWdlclxcVXNlckRhdGFTeW5jTWFuYWdlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7O0FBQUEsaURBQTZDO0FBOEI3QztJQUFBO0lBa2xCQSxDQUFDO0lBN2lCa0Isc0NBQWtCLEdBQWpDO1FBQ0ksSUFBTSxVQUFVLEdBQUcsQ0FBRyxJQUFJLENBQUMsV0FBVyxFQUFFLElBQUksRUFBRSxZQUFLLElBQUksQ0FBQyxTQUFTLEVBQUUsSUFBSSxFQUFFLENBQUUsQ0FBQztRQUM1RSxJQUFJLFVBQVUsS0FBSyxJQUFJLENBQUMsaUJBQWlCLEVBQUU7WUFDdkMsT0FBTztTQUNWO1FBRUQsSUFBSSxDQUFDLGlCQUFpQixHQUFHLFVBQVUsQ0FBQztRQUNwQyxJQUFJLENBQUMsb0JBQW9CLEdBQUcsS0FBSyxDQUFDO1FBQ2xDLElBQUksQ0FBQyxtQkFBbUIsR0FBRyxFQUFFLENBQUM7UUFDOUIsSUFBSSxDQUFDLGVBQWUsR0FBRyxLQUFLLENBQUM7UUFFN0IsSUFBSSxJQUFJLENBQUMsV0FBVyxFQUFFO1lBQ2xCLFlBQVksQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLENBQUM7WUFDL0IsSUFBSSxDQUFDLFdBQVcsR0FBRyxJQUFJLENBQUM7U0FDM0I7SUFDTCxDQUFDO0lBRWMsK0JBQVcsR0FBMUI7UUFDSSxPQUFPLEVBQUUsQ0FBQyxHQUFHLENBQUMsWUFBWSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLENBQUM7SUFDMUQsQ0FBQztJQUVjLDZCQUFTLEdBQXhCO1FBQ0ksT0FBTyxFQUFFLENBQUMsR0FBRyxDQUFDLFlBQVksQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxDQUFDO0lBQ3pELENBQUM7SUFFYyxnQ0FBWSxHQUEzQixVQUE0QixPQUFlO1FBQ3ZDLElBQU0sTUFBTSxHQUFHLElBQUksQ0FBQyxTQUFTLEVBQUUsQ0FBQztRQUNoQyxPQUFPLE1BQU0s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eEIseUNBQXFCLEdBQUcsaUJBQWlCLENBQUM7SUFDMUMsc0NBQWtCLEdBQUcsZUFBZSxDQUFDO0lBQ3JDLG9DQUFnQixHQUFHLGFBQWEsQ0FBQztJQUNqQyxxQ0FBaUIsR0FBRyxjQUFjLENBQUM7SUFDbkMsc0NBQWtCLEdBQUcsZUFBZSxDQUFDO0lBQ3JDLGlEQUE2QixHQUFHLHdCQUF3QixDQUFDO0lBQ3pELG1DQUFlLEdBQUcsWUFBWSxDQUFDO0lBQy9CLG9DQUFnQixHQUFHLGFBQWEsQ0FBQztJQUNqQyx3Q0FBb0IsR0FBRyxnQkFBZ0IsQ0FBQztJQUN4QyxrQ0FBYyxHQUFHLFdBQVcsQ0FBQztJQUV0QyxxQ0FBaUIsR0FBRyxFQUFFLENBQUM7SUFDdkIsd0NBQW9CLEdBQUcsS0FBSyxDQUFDO0lBQzdCLHVDQUFtQixHQUFHLEVBQUUsQ0FBQztJQUN6QiwrQkFBVyxHQUFRLElBQUksQ0FBQztJQUN4QixtQ0FBZSxHQUFHLEtBQUssQ0FBQztJQUN4Qix3Q0FBb0IsR0FBRyxLQUFLLENBQUM7SUEraUJoRCwwQkFBQztDQWxsQkQsQUFrbEJDLElBQUE7a0JBbGxCb0IsbUJBQW1CIiwiZmlsZSI6IiIsInNvdXJjZVJvb3QiOiIvIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgQVBQX0lEIH0gZnJvbSBcIi4uL0NvbW1vbi9BcHBDb25maWdcIjtcclxuXHJcbmludGVyZmFjZSBSZW1vdGVVc2VyRGF0YVBheWxvYWQge1xyXG4gICAgdmVyc2lvbj86IG51bWJlcjtcclxuICAgIHVwZGF0ZWRBdD86IG51bWJlcjtcclxuICAgIGN1cnJlbnRHb2xkPzogbnVtYmVyO1xyXG4gICAgZ2FtZTJTaGVucG8/OiBudW1iZXI7XHJcbiAgICBnYW1lMkhlcm9UaWVycz86IHsgW2hlcm9JZDogc3RyaW5nXTogbnVtYmVyIH07XHJcbiAgICBnYW1lMkVxdWlwcGVkU2tpbklkPzogc3RyaW5nO1xyXG4gICAgaXRlbVN0b2NrPzogbnVtYmVyW107XHJcbiAgICB0b3RhbEdvbGRFYXJuZWQ/OiBudW1iZXI7XHJcbiAgICBza2lsbHM/OiBhbnlbXTtcclxuICAgIGFjaGlldmVDbGFpbWVkTGlzdD86IG51bWJlcltdO1xyXG4gICAgd2Vla2x5UmV3YXJkQ2xhaW1lZExpc3Q/OiBudW1iZXJbXTtcclxuICAgIHdlZWtseVJld2FyZFdlZWtTdGFydD86IHN0cmluZztcclxuICAgIGRhaWx5UmV3YXJkQ2xhaW1lZExpc3Q/OiBudW1iZXJbXTtcclxuICAgIGRhaWx5UmV3YXJkRGF0ZT86IHN0cmluZztcclxuICAgIGRhaWx5T25saW5lTWludXRlcz86IG51bWJlcjtcclxuICAgIHRvdGFsQ29uc3VtZWRTdGFtaW5hPzogbnVtYmVyO1xyXG4gICAgY3VycmVudFN0YW1pbmE/OiBudW1iZXI7XHJcbiAgICBsYXN0UmVjb3ZlclRpbWU/OiBudW1iZXI7XHJcbiAgICB1bmxvY2tlZFJvbGVzPzogYm9vbGVhbltdO1xyXG4gICAgY3VycmVudFJvbGU/OiBudW1iZXI7XHJcbiAgICBjdXJyZW50TGV2ZWw/OiBudW1iZXI7XG4gICAgdW5sb2NrZWRMZXZlbD86IG51bWJlcjtcbiAgICB3YXJyaW9yUnVuQmVzdERpc3RhbmNlPzogbnVtYmVyO1xuICAgIGxldmVsU3RhcnM/OiBudW1iZXJbXTtcbiAgICBmYWlsZWRMZXZlbHM/OiBudW1iZXJbXTtcbn1cblxyXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBVc2VyRGF0YVN5bmNNYW5hZ2VyIHtcclxuICAgIHByaXZhdGUgc3RhdGljIHJlYWRvbmx5IEVOQUJMRV9ERUJVR19MT0cgPSB0cnVlO1xyXG4gICAgcHJpdmF0ZSBzdGF0aWMgcmVhZG9ubHkgU0FWRV9VUkwgPSBcImh0dHBzOi8vcGF5LnN6dmktYm8uY29tL3YxL3Rlc3RhcHAvU2F2ZVVzZXJEYXRhXCI7XHJcbiAgICBwcml2YXRlIHN0YXRpYyByZWFkb25seSBHRVRfVVJMID0gXCJodHRwczovL3BheS5zenZpLWJvLmNvbS92MS90ZXN0YXBwL0dldFVzZXJEYXRhXCI7XHJcblxyXG4gICAgcHJpdmF0ZSBzdGF0aWMgcmVhZG9ubHkgVVNFUk5BTUVfS0VZID0gXCJTTFNfVVNFUk5BTUVcIjtcclxuICAgIHByaXZhdGUgc3RhdGljIHJlYWRvbmx5IFVTRVJfSURfS0VZID0gXCJTTFNfVVNFUl9JRFwiO1xyXG5cclxuICAgIHByaXZhdGUgc3RhdGljIHJlYWRvbmx5IEdPTERfS0VZID0gXCJDdXJyZW50R29sZFwiO1xyXG4gICAgcHJpdmF0ZSBzdGF0aWMgcmVhZG9ubHkgVE9UQUxfR09MRF9FQVJORURfS0VZID0gXCJUb3RhbEdvbGRFYXJuZWRcIjtcclxuICAgIHByaXZhdGUgc3RhdGljIHJlYWRvbmx5IFNLSUxMU19LRVkgPSBcIlNraWxsc1wiO1xyXG4gICAgcHJpdmF0ZSBzdGF0aWMgcmVhZG9ubHkgQUNISUVWRV9LRVkgPSBcIkFjaGlldmVzY2xhaW1lZFwiO1xyXG4gICAgcHJpdmF0ZSBzdGF0aWMgcmVhZG9ubHkgV0VFS0xZX1JFV0FSRF9DTEFJTUVEX0tFWSA9IFwid2Vla2x5UmV3YXJkQ2xhaW1lZFwiO1xyXG4gICAgcHJpdmF0ZSBzdGF0aWMgcmVhZG9ubHkgV0VFS0xZX1JFV0FSRF9XRUVLX1NUQVJUX0tFWSA9IFwid2Vla2x5UmV3YXJkV2Vla1N0YXJ0XCI7XHJcbiAgICBwcml2YXRlIHN0YXRpYyByZWFkb25seSBEQUlMWV9SRVdBUkRfQ0xBSU1FRF9LRVkgPSBcImRhaWx5UmV3YXJkQ2xhaW1lZFwiO1xyXG4gICAgcHJpdmF0ZSBzdGF0aWMgcmVhZG9ubHkgREFJTFlfUkVXQVJEX0RBVEVfS0VZID0gXCJkYWlseVJld2FyZERhdGVcIjtcclxuICAgIHByaXZhdGUgc3RhdGljIHJlYWRvbmx5IERBSUxZX09OTElORV9NSU5VVEVTX0tFWSA9IFwiZGFpbHlPbmxpbmVNaW51dGVzXCI7XHJcbiAgICBwcml2YXRlIHN0YXRpYyByZWFkb25seSBUT1RBTF9DT05TVU1FRF9TVEFNSU5BX0tFWSA9IFwiVG90YWxDb25zdW1lZFN0YW1pbmFcIjtcclxuICAgIHByaXZhdGUgc3RhdGljIHJlYWRvbmx5IFNUQU1JTkFfS0VZID0gXCJTdGFtaW5hXCI7XHJcbiAgICBwcml2YXRlIHN0YXRpYyByZWFkb25seSBMQVNUX1JFQ09WRVJfVElNRV9LRVkgPSBcIkxhc3RSZWNvdmVyVGltZVwiO1xyXG4gICAgcHJpdmF0ZSBzdGF0aWMgcmVhZG9ubHkgVU5MT0NLRURfUk9MRVNfS0VZID0gXCJVbmxvY2tlZFJvbGVzXCI7XHJcbiAgICBwcml2YXRlIHN0YXRpYyByZWFkb25seSBDVVJSRU5UX1JPTEVfS0VZID0gXCJDdXJyZW50Um9sZVwiO1xyXG4gICAgcHJpdmF0ZSBzdGF0aWMgcmVhZG9ubHkgQ1VSUkVOVF9MRVZFTF9LRVkgPSBcIkN1cnJlbnRMZXZlbFwiO1xuICAgIHByaXZhdGUgc3RhdGljIHJlYWRvbmx5IFVOTE9DS0VEX0xFVkVMX0tFWSA9IFwiVW5sb2NrZWRMZXZlbFwiO1xuICAgIHByaXZhdGUgc3RhdGljIHJlYWRvbmx5IFdBUlJJT1JfUlVOX0JFU1RfRElTVEFOQ0VfS0VZID0gXCJXYXJyaW9yUnVuQmVzdERpc3RhbmNlXCI7XG4gICAgcHJpdmF0ZSBzdGF0aWMgcmVhZG9ubHkgTEVWRUxfU1RBUlNfS0VZID0gXCJMZXZlbFN0YXJzXCI7XG4gICAgcHJpdmF0ZSBzdGF0aWMgcmVhZG9ubHkgR0FNRTJfU0hFTlBPX0tFWSA9IFwiR2FtZTJTaGVucG9cIjtcclxuICAgIHByaXZhdGUgc3RhdGljIHJlYWRvbmx5IEdBTUUyX0hFUk9fVElFUlNfS0VZID0gXCJHYW1lMkhlcm9UaWVyc1wiO1xyXG4gICAgcHJpdmF0ZSBzdGF0aWMgcmVhZG9ubHkgSVRFTV9TVE9DS19LRVkgPSBcIkl0ZW1TdG9ja1wiO1xyXG5cclxuICAgIHByaXZhdGUgc3RhdGljIGN1cnJlbnRTZXNzaW9uS2V5ID0gXCJcIjtcclxuICAgIHByaXZhdGUgc3RhdGljIGluaXRpYWxTeW5jQ29tcGxldGVkID0gZmFsc2U7XHJcbiAgICBwcml2YXRlIHN0YXRpYyBsYXN0VXBsb2FkZWRQYXlsb2FkID0gXCJcIjtcclxuICAgIHByaXZhdGUgc3RhdGljIHVwbG9hZFRpbWVyOiBhbnkgPSBudWxsO1xyXG4gICAgcHJpdmF0ZSBzdGF0aWMgaGFzRGlydHlDaGFuZ2VzID0gZmFsc2U7XHJcbiAgICBwcml2YXRlIHN0YXRpYyBsaWZlY3ljbGVJbml0aWFsaXplZCA9IGZhbHNlO1xyXG5cclxuICAgIHByaXZhdGUgc3RhdGljIGVuc3VyZVNlc3Npb25TdGF0ZSgpOiB2b2lkIHtcclxuICAgICAgICBjb25zdCBzZXNzaW9uS2V5ID0gYCR7dGhpcy5nZXRVc2VybmFtZSgpIHx8IFwiXCJ9Ojoke3RoaXMuZ2V0VXNlcklkKCkgfHwgXCJcIn1gO1xyXG4gICAgICAgIGlmIChzZXNzaW9uS2V5ID09PSB0aGlzLmN1cnJlbnRTZXNzaW9uS2V5KSB7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHRoaXMuY3VycmVudFNlc3Npb25LZXkgPSBzZXNzaW9uS2V5O1xyXG4gICAgICAgIHRoaXMuaW5pdGlhbFN5bmNDb21wbGV0ZWQgPSBmYWxzZTtcclxuICAgICAgICB0aGlzLmxhc3RVcGxvYWRlZFBheWxvYWQgPSBcIlwiO1xyXG4gICAgICAgIHRoaXMuaGFzRGlydHlDaGFuZ2VzID0gZmFsc2U7XHJcblxyXG4gICAgICAgIGlmICh0aGlzLnVwbG9hZFRpbWVyKSB7XHJcbiAgICAgICAgICAgIGNsZWFyVGltZW91dCh0aGlzLnVwbG9hZFRpbWVyKTtcclxuICAgICAgICAgICAgdGhpcy51cGxvYWRUaW1lciA9IG51bGw7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgc3RhdGljIGdldFVzZXJuYW1lKCk6IHN0cmluZyB8IG51bGwge1xyXG4gICAgICAgIHJldHVybiBjYy5zeXMubG9jYWxTdG9yYWdlLmdldEl0ZW0odGhpcy5VU0VSTkFNRV9LRVkpO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgc3RhdGljIGdldFVzZXJJZCgpOiBzdHJpbmcgfCBudWxsIHtcclxuICAgICAgICByZXR1cm4gY2Muc3lzLmxvY2FsU3RvcmFnZS5nZXRJdGVtKHRoaXMuVVNFUl9JRF9LRVkpO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgc3RhdGljIGdldFNjb3BlZEtleShiYXNlS2V5OiBzdHJpbmcpOiBzdHJpbmcge1xyXG4gICAgICAgIGNvbnN0IHVzZXJJZCA9IHRoaXMuZ2V0VXNlcklkKCk7XHJcbiAgICAgICAgcmV0dXJuIHVzZXJJZCA/IGAke2Jhc2VLZXl9XyR7dXNlcklkfWAgOiBiYXNlS2V5O1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgc3RhdGljIGhhc0xvZ2luQ29udGV4dCgpOiBib29sZWFuIHtcclxuICAgICAgICByZXR1cm4gISF0aGlzLmdldFVzZXJuYW1lKCk7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBzdGF0aWMgZ2V0R2FtZURhdGEoKTogYW55IHtcclxuICAgICAgICByZXR1cm4gcmVxdWlyZShcIi4uL0xvYWQvR2FtZURhdGFcIikuZGVmYXVsdDtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIHN0YXRpYyBnZXRTdGF0ZUJyaWRnZSgpOiBhbnkge1xyXG4gICAgICAgIHJldHVybiByZXF1aXJlKFwiLi4vZ2FtZS9TdGF0ZUJyaWRnZVwiKS5kZWZhdWx0O1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgc3RhdGljIGdldEdhbWVTdGF0ZSgpOiBhbnkge1xyXG4gICAgICAgIHJldHVybiByZXF1aXJlKFwiLi4vZ2FtZS9HYW1lU3RhdGVcIikuZGVmYXVsdDtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIHN0YXRpYyBsb2dEZWJ1ZyhtZXNzYWdlOiBzdHJpbmcsIGRhdGE/OiBhbnkpOiB2b2lkIHtcclxuICAgICAgICBpZiAoIXRoaXMuRU5BQkxFX0RFQlVHX0xPRykge1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAodHlwZW9mIGRhdGEgPT09IFwidW5kZWZpbmVkXCIpIHtcclxuICAgICAgICAgICAgY29uc29sZS5sb2coYFtVc2VyRGF0YVN5bmNdICR7bWVzc2FnZX1gKTtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgY29uc29sZS5sb2coYFtVc2VyRGF0YVN5bmNdICR7bWVzc2FnZX1gLCBkYXRhKTtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIHN0YXRpYyBlbnN1cmVMaWZlY3ljbGVIb29rcygpOiB2b2lkIHtcclxuICAgICAgICBpZiAodGhpcy5saWZlY3ljbGVJbml0aWFsaXplZCkge1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB0aGlzLmxpZmVjeWNsZUluaXRpYWxpemVkID0gdHJ1ZTtcclxuXHJcbiAgICAgICAgaWYgKGNjICYmIGNjLmdhbWUgJiYgY2MuZ2FtZS5vbikge1xyXG4gICAgICAgICAgICBjYy5nYW1lLm9uKGNjLmdhbWUuRVZFTlRfSElERSwgKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5mbHVzaFVwbG9hZCgpLmNhdGNoKChlcnJvcikgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoXCJGbHVzaCB1c2VyIGRhdGEgb24gaGlkZSBmYWlsZWQ6XCIsIGVycm9yKTtcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIHN0YXRpYyBlbmFibGVVcGxvYWRzRm9yQ3VycmVudFNlc3Npb24oKTogdm9pZCB7XHJcbiAgICAgICAgdGhpcy5lbnN1cmVTZXNzaW9uU3RhdGUoKTtcclxuICAgICAgICB0aGlzLmVuc3VyZUxpZmVjeWNsZUhvb2tzKCk7XHJcbiAgICAgICAgaWYgKCF0aGlzLmhhc0xvZ2luQ29udGV4dCgpKSB7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHRoaXMuaW5pdGlhbFN5bmNDb21wbGV0ZWQgPSB0cnVlO1xyXG4gICAgICAgIHRoaXMubGFzdFVwbG9hZGVkUGF5bG9hZCA9IHRoaXMuc2VyaWFsaXplUGF5bG9hZCh0aGlzLmJ1aWxkTG9jYWxQYXlsb2FkKCkpO1xyXG4gICAgICAgIHRoaXMuaGFzRGlydHlDaGFuZ2VzID0gZmFsc2U7XHJcbiAgICAgICAgdGhpcy5sb2dEZWJ1ZyhcIkVuYWJsZSB1cGxvYWRzIGZvciBjdXJyZW50IHNlc3Npb25cIiwge1xyXG4gICAgICAgICAgICB1c2VybmFtZTogdGhpcy5nZXRVc2VybmFtZSgpLFxyXG4gICAgICAgICAgICB1c2VySWQ6IHRoaXMuZ2V0VXNlcklkKClcclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgc3RhdGljIGFzeW5jIHN5bmNGcm9tU2VydmVyKCk6IFByb21pc2U8dm9pZD4ge1xyXG4gICAgICAgIHRoaXMuZW5zdXJlU2Vzc2lvblN0YXRlKCk7XHJcbiAgICAgICAgdGhpcy5lbnN1cmVMaWZlY3ljbGVIb29rcygpO1xyXG4gICAgICAgIGlmICghdGhpcy5oYXNMb2dpbkNvbnRleHQoKSkge1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB0cnkge1xyXG4gICAgICAgICAgICBjb25zdCByZW1vdGVQYXlsb2FkID0gYXdhaXQgdGhpcy5mZXRjaFJlbW90ZVBheWxvYWQoKTtcclxuICAgICAgICAgICAgaWYgKHJlbW90ZVBheWxvYWQpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMubG9nRGVidWcoXCJQYXJzZWQgcmVtb3RlIHBheWxvYWRcIiwgcmVtb3RlUGF5bG9hZCk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmFwcGx5UGF5bG9hZFRvTG9jYWwocmVtb3RlUGF5bG9hZCk7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBjb25zb2xlLndhcm4oXCJHZXRVc2VyRGF0YSByZXR1cm5lZCBlbXB0eSBqc29uZGF0YSwgcmVsb2FkaW5nIHNjb3BlZCBsb2NhbCBkZWZhdWx0cyBmb3IgY3VycmVudCBhY2NvdW50LlwiKTtcclxuICAgICAgICAgICAgICAgIHRoaXMucmVsb2FkU2NvcGVkTG9jYWxEYXRhKCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9IGNhdGNoIChlcnJvcikge1xyXG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKFwiU3luYyB1c2VyIGRhdGEgZnJvbSBzZXJ2ZXIgZmFpbGVkOlwiLCBlcnJvcik7XHJcbiAgICAgICAgfSBmaW5hbGx5IHtcclxuICAgICAgICAgICAgdGhpcy5pbml0aWFsU3luY0NvbXBsZXRlZCA9IHRydWU7XHJcbiAgICAgICAgICAgIHRoaXMubGFzdFVwbG9hZGVkUGF5bG9hZCA9IHRoaXMuc2VyaWFsaXplUGF5bG9hZCh0aGlzLmJ1aWxkTG9jYWxQYXlsb2FkKCkpO1xyXG4gICAgICAgICAgICB0aGlzLmhhc0RpcnR5Q2hhbmdlcyA9IGZhbHNlO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgc3RhdGljIHJlcXVlc3RVcGxvYWQoKTogdm9pZCB7XHJcbiAgICAgICAgdGhpcy5lbnN1cmVTZXNzaW9uU3RhdGUoKTtcclxuICAgICAgICB0aGlzLmVuc3VyZUxpZmVjeWNsZUhvb2tzKCk7XHJcbiAgICAgICAgaWYgKCF0aGlzLmluaXRpYWxTeW5jQ29tcGxldGVkIHx8ICF0aGlzLmhhc0xvZ2luQ29udGV4dCgpKSB7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHRoaXMuaGFzRGlydHlDaGFuZ2VzID0gdHJ1ZTtcclxuICAgICAgICB0aGlzLmxvZ0RlYnVnKFwiTWFyayB1c2VyIGRhdGEgZGlydHkgYW5kIHNjaGVkdWxlIHVwbG9hZFwiLCB7XHJcbiAgICAgICAgICAgIHVzZXJuYW1lOiB0aGlzLmdldFVzZXJuYW1lKCksXHJcbiAgICAgICAgICAgIHVzZXJJZDogdGhpcy5nZXRVc2VySWQoKVxyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICBpZiAodGhpcy51cGxvYWRUaW1lcikge1xyXG4gICAgICAgICAgICBjbGVhclRpbWVvdXQodGhpcy51cGxvYWRUaW1lcik7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB0aGlzLnVwbG9hZFRpbWVyID0gc2V0VGltZW91dCgoKSA9PiB7XHJcbiAgICAgICAgICAgIHRoaXMudXBsb2FkVGltZXIgPSBudWxsO1xyXG4gICAgICAgICAgICB0aGlzLnVwbG9hZExvY2FsRGF0YSgpLmNhdGNoKChlcnJvcikgPT4ge1xyXG4gICAgICAgICAgICAgICAgY29uc29sZS5lcnJvcihcIlVwbG9hZCB1c2VyIGRhdGEgZmFpbGVkOlwiLCBlcnJvcik7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH0sIDMwMCk7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIHN0YXRpYyBhc3luYyBmbHVzaFVwbG9hZCgpOiBQcm9taXNlPHZvaWQ+IHtcclxuICAgICAgICB0aGlzLmVuc3VyZVNlc3Npb25TdGF0ZSgpO1xyXG4gICAgICAgIGlmICghdGhpcy5pbml0aWFsU3luY0NvbXBsZXRlZCB8fCAhdGhpcy5oYXNMb2dpbkNvbnRleHQoKSB8fCAhdGhpcy5oYXNEaXJ0eUNoYW5nZXMpIHtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKHRoaXMudXBsb2FkVGltZXIpIHtcclxuICAgICAgICAgICAgY2xlYXJUaW1lb3V0KHRoaXMudXBsb2FkVGltZXIpO1xyXG4gICAgICAgICAgICB0aGlzLnVwbG9hZFRpbWVyID0gbnVsbDtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHRoaXMubG9nRGVidWcoXCJGbHVzaCB1cGxvYWQgaW1tZWRpYXRlbHlcIiwge1xyXG4gICAgICAgICAgICB1c2VybmFtZTogdGhpcy5nZXRVc2VybmFtZSgpLFxyXG4gICAgICAgICAgICB1c2VySWQ6IHRoaXMuZ2V0VXNlcklkKClcclxuICAgICAgICB9KTtcclxuICAgICAgICBhd2FpdCB0aGlzLnVwbG9hZExvY2FsRGF0YSh0cnVlKTtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgc3RhdGljIGdldFRvdGFsQ29uc3VtZWRTdGFtaW5hKCk6IG51bWJlciB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMucmVhZE51bWJlcih0aGlzLlRPVEFMX0NPTlNVTUVEX1NUQU1JTkFfS0VZLCAwKTtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgc3RhdGljIHNldFRvdGFsQ29uc3VtZWRTdGFtaW5hKHZhbHVlOiBudW1iZXIpOiB2b2lkIHtcclxuICAgICAgICBjb25zdCBub3JtYWxpemVkVmFsdWUgPSBNYXRoLm1heCgwLCBNYXRoLmZsb29yKHZhbHVlKSk7XHJcbiAgICAgICAgY2Muc3lzLmxvY2FsU3RvcmFnZS5zZXRJdGVtKHRoaXMuZ2V0U2NvcGVkS2V5KHRoaXMuVE9UQUxfQ09OU1VNRURfU1RBTUlOQV9LRVkpLCBub3JtYWxpemVkVmFsdWUudG9TdHJpbmcoKSk7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIHN0YXRpYyByZWNvcmRDb25zdW1lZFN0YW1pbmEoYW1vdW50ID0gMSk6IHZvaWQge1xyXG4gICAgICAgIGlmIChhbW91bnQgPD0gMCkge1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBjb25zdCBuZXh0VmFsdWUgPSB0aGlzLmdldFRvdGFsQ29uc3VtZWRTdGFtaW5hKCkgKyBhbW91bnQ7XHJcbiAgICAgICAgdGhpcy5zZXRUb3RhbENvbnN1bWVkU3RhbWluYShuZXh0VmFsdWUpO1xyXG4gICAgICAgIHRoaXMucmVxdWVzdFVwbG9hZCgpO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgc3RhdGljIGFzeW5jIHVwbG9hZExvY2FsRGF0YShmb3JjZSA9IGZhbHNlKTogUHJvbWlzZTx2b2lkPiB7XHJcbiAgICAgICAgaWYgKCF0aGlzLmhhc0xvZ2luQ29udGV4dCgpKSB7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGNvbnN0IHBheWxvYWQgPSB0aGlzLmJ1aWxkTG9jYWxQYXlsb2FkKCk7XHJcbiAgICAgICAgY29uc3Qgc2VyaWFsaXplZFBheWxvYWQgPSB0aGlzLnNlcmlhbGl6ZVBheWxvYWQocGF5bG9hZCk7XHJcbiAgICAgICAgaWYgKCFmb3JjZSAmJiBzZXJpYWxpemVkUGF5bG9hZCA9PT0gdGhpcy5sYXN0VXBsb2FkZWRQYXlsb2FkKSB7XHJcbiAgICAgICAgICAgIHRoaXMubG9nRGVidWcoXCJTa2lwIHVwbG9hZCBiZWNhdXNlIHBheWxvYWQgaXMgdW5jaGFuZ2VkXCIpO1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB0aGlzLmxvZ0RlYnVnKFwiVXBsb2FkaW5nIHBheWxvYWQgdG8gU2F2ZVVzZXJEYXRhXCIsIHtcclxuICAgICAgICAgICAgdXNlcm5hbWU6IHRoaXMuZ2V0VXNlcm5hbWUoKSxcclxuICAgICAgICAgICAgdXNlcklkOiB0aGlzLmdldFVzZXJJZCgpLFxyXG4gICAgICAgICAgICBwYXlsb2FkLFxyXG4gICAgICAgICAgICBzZXJpYWxpemVkUGF5bG9hZFxyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICBjb25zdCByZXNwb25zZSA9IGF3YWl0IHRoaXMucG9zdEpzb24odGhpcy5TQVZFX1VSTCwge1xyXG4gICAgICAgICAgICBhcHBpZDogQVBQX0lELFxyXG4gICAgICAgICAgICB1c2VybmFtZTogdGhpcy5nZXRVc2VybmFtZSgpLFxyXG4gICAgICAgICAgICBqc29uZGF0YTogc2VyaWFsaXplZFBheWxvYWRcclxuICAgICAgICB9KTtcclxuICAgICAgICB0aGlzLmxvZ0RlYnVnKFwiU2F2ZVVzZXJEYXRhIHJlc3BvbnNlXCIsIHJlc3BvbnNlKTtcclxuXHJcbiAgICAgICAgdGhpcy5sYXN0VXBsb2FkZWRQYXlsb2FkID0gc2VyaWFsaXplZFBheWxvYWQ7XHJcbiAgICAgICAgdGhpcy5oYXNEaXJ0eUNoYW5nZXMgPSBmYWxzZTtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIHN0YXRpYyBidWlsZExvY2FsUGF5bG9hZCgpOiBSZW1vdGVVc2VyRGF0YVBheWxvYWQge1xyXG4gICAgICAgIGNvbnN0IGdhbWVEYXRhID0gdGhpcy5nZXRHYW1lRGF0YSgpO1xyXG4gICAgICAgIGNvbnN0IGdhbWVTdGF0ZSA9IHRoaXMuZ2V0R2FtZVN0YXRlKCk7XHJcbiAgICAgICAgY29uc3QgcHJvZ3Jlc3MgPSBnYW1lU3RhdGUucHJvZ3Jlc3MgfHwge307XHJcbiAgICAgICAgY29uc3QgZmFsbGJhY2tDdXJyZW50TGV2ZWwgPSBNYXRoLm1heCgxLCBnYW1lU3RhdGUuc2VsZWN0ZWRMZXZlbCB8fCBnYW1lRGF0YS5jdXJyZW50TGV2ZWwgfHwgMSk7XHJcbiAgICAgICAgY29uc3QgZmFsbGJhY2tVbmxvY2tlZExldmVsID0gTWF0aC5tYXgoMSwgcHJvZ3Jlc3MudW5sb2NrZWRfbGV2ZWwgfHwgZ2FtZURhdGEudW5sb2NrZWRMZXZlbCB8fCAxKTtcclxuICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICB2ZXJzaW9uOiAxLFxyXG4gICAgICAgICAgICB1cGRhdGVkQXQ6IERhdGUubm93KCksXHJcbiAgICAgICAgICAgIGN1cnJlbnRHb2xkOiB0aGlzLnJlYWROdW1iZXIodGhpcy5HT0xEX0tFWSwgZ2FtZURhdGEuY3VycmVudEdvbGQpLFxyXG4gICAgICAgICAgICBnYW1lMlNoZW5wbzogdGhpcy5yZWFkTnVtYmVyKHRoaXMuR0FNRTJfU0hFTlBPX0tFWSwgdGhpcy5nZXRTdGF0ZUJyaWRnZSgpLmdldFNoZW5wbygpKSxcclxuICAgICAgICAgICAgZ2FtZTJIZXJvVGllcnM6IHRoaXMucmVhZEpzb25PYmplY3QodGhpcy5HQU1FMl9IRVJPX1RJRVJTX0tFWSwgdGhpcy5nZXRTdGF0ZUJyaWRnZSgpLmdldEhlcm9UaWVycygpKSxcclxuICAgICAgICAgICAgZ2FtZTJFcXVpcHBlZFNraW5JZDogdHlwZW9mIGdhbWVTdGF0ZS5lcXVpcHBlZFNraW5JZCA9PT0gXCJzdHJpbmdcIiA/IGdhbWVTdGF0ZS5lcXVpcHBlZFNraW5JZCA6IFwiU2tpbl8wMVwiLFxyXG4gICAgICAgICAgICBpdGVtU3RvY2s6IHRoaXMucmVhZEpzb25BcnJheSh0aGlzLklURU1fU1RPQ0tfS0VZLCBnYW1lRGF0YS5pdGVtU3RvY2sgfHwgWzAsIDAsIDBdKSxcclxuICAgICAgICAgICAgdG90YWxHb2xkRWFybmVkOiB0aGlzLnJlYWROdW1iZXIodGhpcy5UT1RBTF9HT0xEX0VBUk5FRF9LRVksIGdhbWVEYXRhLnRvdGFsR29sZEVhcm5lZCB8fCAwKSxcclxuICAgICAgICAgICAgc2tpbGxzOiB0aGlzLnJlYWRKc29uQXJyYXkodGhpcy5TS0lMTFNfS0VZLCBnYW1lRGF0YS5za2lsbHMgfHwgW10pLFxyXG4gICAgICAgICAgICBhY2hpZXZlQ2xhaW1lZExpc3Q6IHRoaXMucmVhZE51bWJlckFycmF5KHRoaXMuQUNISUVWRV9LRVkpLFxyXG4gICAgICAgICAgICB3ZWVrbHlSZXdhcmRDbGFpbWVkTGlzdDogdGhpcy5yZWFkTnVtYmVyQXJyYXkodGhpcy5XRUVLTFlfUkVXQVJEX0NMQUlNRURfS0VZKSxcclxuICAgICAgICAgICAgd2Vla2x5UmV3YXJkV2Vla1N0YXJ0OiB0aGlzLnJlYWRTdHJpbmcodGhpcy5XRUVLTFlfUkVXQVJEX1dFRUtfU1RBUlRfS0VZKSxcclxuICAgICAgICAgICAgZGFpbHlSZXdhcmRDbGFpbWVkTGlzdDogdGhpcy5yZWFkTnVtYmVyQXJyYXkodGhpcy5EQUlMWV9SRVdBUkRfQ0xBSU1FRF9LRVkpLFxyXG4gICAgICAgICAgICBkYWlseVJld2FyZERhdGU6IHRoaXMucmVhZFN0cmluZyh0aGlzLkRBSUxZX1JFV0FSRF9EQVRFX0tFWSksXHJcbiAgICAgICAgICAgIGRhaWx5T25saW5lTWludXRlczogdGhpcy5yZWFkTnVtYmVyKHRoaXMuREFJTFlfT05MSU5FX01JTlVURVNfS0VZLCAwKSxcclxuICAgICAgICAgICAgdG90YWxDb25zdW1lZFN0YW1pbmE6IHRoaXMucmVhZE51bWJlcih0aGlzLlRPVEFMX0NPTlNVTUVEX1NUQU1JTkFfS0VZLCAwKSxcclxuICAgICAgICAgICAgY3VycmVudFN0YW1pbmE6IHRoaXMucmVhZE51bWJlcih0aGlzLlNUQU1JTkFfS0VZLCBnYW1lRGF0YS5jdXJyZW50U3RhbWluYSksXHJcbiAgICAgICAgICAgIGxhc3RSZWNvdmVyVGltZTogdGhpcy5yZWFkTnVtYmVyKHRoaXMuTEFTVF9SRUNPVkVSX1RJTUVfS0VZLCBnYW1lRGF0YS5sYXN0UmVjb3ZlclRpbWUpLFxyXG4gICAgICAgICAgICB1bmxvY2tlZFJvbGVzOiB0aGlzLnJlYWRKc29uQXJyYXkodGhpcy5VTkxPQ0tFRF9ST0xFU19LRVksIGdhbWVEYXRhLnVubG9ja2VkUm9sZXMgfHwgW3RydWUsIGZhbHNlLCBmYWxzZSwgZmFsc2UsIGZhbHNlXSksXHJcbiAgICAgICAgICAgIGN1cnJlbnRSb2xlOiB0aGlzLnJlYWROdW1iZXIodGhpcy5DVVJSRU5UX1JPTEVfS0VZLCBnYW1lRGF0YS5jdXJyZW50Um9sZSksXG4gICAgICAgICAgICBjdXJyZW50TGV2ZWw6IHRoaXMucmVhZE51bWJlcih0aGlzLkNVUlJFTlRfTEVWRUxfS0VZLCBnYW1lRGF0YS5jdXJyZW50TGV2ZWwgfHwgZmFsbGJhY2tDdXJyZW50TGV2ZWwpLFxuICAgICAgICAgICAgdW5sb2NrZWRMZXZlbDogdGhpcy5yZWFkTnVtYmVyKHRoaXMuVU5MT0NLRURfTEVWRUxfS0VZLCBnYW1lRGF0YS51bmxvY2tlZExldmVsIHx8IGZhbGxiYWNrVW5sb2NrZWRMZXZlbCksXG4gICAgICAgICAgICB3YXJyaW9yUnVuQmVzdERpc3RhbmNlOiB0aGlzLnJlYWROdW1iZXIodGhpcy5XQVJSSU9SX1JVTl9CRVNUX0RJU1RBTkNFX0tFWSwgMCksXG4gICAgICAgICAgICBsZXZlbFN0YXJzOiB0aGlzLnJlYWRKc29uQXJyYXkodGhpcy5MRVZFTF9TVEFSU19LRVksIHRoaXMucHJvZ3Jlc3NTdGFyc1RvQXJyYXkocHJvZ3Jlc3MubGV2ZWxfc3RhcnMgfHwgZ2FtZURhdGEubGV2ZWxTdGFycyB8fCBbXSkpLFxuICAgICAgICAgICAgZmFpbGVkTGV2ZWxzOiB0aGlzLmdldFN0YXRlQnJpZGdlKCkuZ2V0RmFpbGVkTGV2ZWxzKClcbiAgICAgICAgfTtcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBzdGF0aWMgYXN5bmMgZmV0Y2hSZW1vdGVQYXlsb2FkKCk6IFByb21pc2U8UmVtb3RlVXNlckRhdGFQYXlsb2FkIHwgbnVsbD4ge1xyXG4gICAgICAgIGNvbnN0IHJlc3BvbnNlID0gYXdhaXQgdGhpcy5wb3N0SnNvbih0aGlzLkdFVF9VUkwsIHtcclxuICAgICAgICAgICAgYXBwaWQ6IEFQUF9JRCxcclxuICAgICAgICAgICAgdXNlcm5hbWU6IHRoaXMuZ2V0VXNlcm5hbWUoKVxyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHRoaXMubG9nRGVidWcoXCJHZXRVc2VyRGF0YSByZXNwb25zZVwiLCByZXNwb25zZSk7XHJcblxyXG4gICAgICAgIGNvbnN0IHJhd1BheWxvYWQgPSByZXNwb25zZT8uZGF0YT8uanNvbmRhdGEgPz8gcmVzcG9uc2U/Lmpzb25kYXRhID8/IG51bGw7XHJcbiAgICAgICAgaWYgKCFyYXdQYXlsb2FkKSB7XHJcbiAgICAgICAgICAgIHRoaXMubG9nRGVidWcoXCJHZXRVc2VyRGF0YSByZXR1cm5lZCBlbXB0eSBqc29uZGF0YVwiLCB7XHJcbiAgICAgICAgICAgICAgICB1c2VybmFtZTogdGhpcy5nZXRVc2VybmFtZSgpLFxyXG4gICAgICAgICAgICAgICAgdXNlcklkOiB0aGlzLmdldFVzZXJJZCgpLFxyXG4gICAgICAgICAgICAgICAgcmF3UGF5bG9hZFxyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgcmV0dXJuIG51bGw7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBsZXQgcGFyc2VkUGF5bG9hZDogYW55ID0gcmF3UGF5bG9hZDtcclxuICAgICAgICBpZiAodHlwZW9mIHJhd1BheWxvYWQgPT09IFwic3RyaW5nXCIpIHtcclxuICAgICAgICAgICAgY29uc3QgdHJpbW1lZFBheWxvYWQgPSByYXdQYXlsb2FkLnRyaW0oKTtcclxuICAgICAgICAgICAgaWYgKCF0cmltbWVkUGF5bG9hZCkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIG51bGw7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgICAgICBwYXJzZWRQYXlsb2FkID0gSlNPTi5wYXJzZSh0cmltbWVkUGF5bG9hZCk7XHJcbiAgICAgICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XHJcbiAgICAgICAgICAgICAgICBjb25zb2xlLmVycm9yKFwiUGFyc2UgcmVtb3RlIHVzZXIgZGF0YSBmYWlsZWQ6XCIsIGVycm9yKTtcclxuICAgICAgICAgICAgICAgIHJldHVybiBudWxsO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAoIXBhcnNlZFBheWxvYWQgfHwgdHlwZW9mIHBhcnNlZFBheWxvYWQgIT09IFwib2JqZWN0XCIpIHtcclxuICAgICAgICAgICAgcmV0dXJuIG51bGw7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXR1cm4gcGFyc2VkUGF5bG9hZCBhcyBSZW1vdGVVc2VyRGF0YVBheWxvYWQ7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBzdGF0aWMgYXBwbHlQYXlsb2FkVG9Mb2NhbChwYXlsb2FkOiBSZW1vdGVVc2VyRGF0YVBheWxvYWQpOiB2b2lkIHtcclxuICAgICAgICBjb25zdCBnYW1lRGF0YSA9IHRoaXMuZ2V0R2FtZURhdGEoKTtcclxuICAgICAgICB0aGlzLmxvZ0RlYnVnKFwiQXBwbHkgcGF5bG9hZCB0byBsb2NhbCBzdG9yYWdlXCIsIHBheWxvYWQpO1xyXG5cclxuICAgICAgICBpZiAodHlwZW9mIHBheWxvYWQuY3VycmVudEdvbGQgPT09IFwibnVtYmVyXCIgJiYgTnVtYmVyLmlzRmluaXRlKHBheWxvYWQuY3VycmVudEdvbGQpKSB7XHJcbiAgICAgICAgICAgIGNvbnN0IG5vcm1hbGl6ZWRHb2xkID0gTWF0aC5tYXgoMCwgTWF0aC5mbG9vcihwYXlsb2FkLmN1cnJlbnRHb2xkKSk7XHJcbiAgICAgICAgICAgIGNjLnN5cy5sb2NhbFN0b3JhZ2Uuc2V0SXRlbSh0aGlzLmdldFNjb3BlZEtleSh0aGlzLkdPTERfS0VZKSwgbm9ybWFsaXplZEdvbGQudG9TdHJpbmcoKSk7XHJcbiAgICAgICAgICAgIGdhbWVEYXRhLmN1cnJlbnRHb2xkID0gbm9ybWFsaXplZEdvbGQ7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAodHlwZW9mIHBheWxvYWQudG90YWxHb2xkRWFybmVkID09PSBcIm51bWJlclwiICYmIE51bWJlci5pc0Zpbml0ZShwYXlsb2FkLnRvdGFsR29sZEVhcm5lZCkpIHtcclxuICAgICAgICAgICAgY29uc3Qgbm9ybWFsaXplZFRvdGFsR29sZCA9IE1hdGgubWF4KDAsIE1hdGguZmxvb3IocGF5bG9hZC50b3RhbEdvbGRFYXJuZWQpKTtcclxuICAgICAgICAgICAgY2Muc3lzLmxvY2FsU3RvcmFnZS5zZXRJdGVtKHRoaXMuZ2V0U2NvcGVkS2V5KHRoaXMuVE9UQUxfR09MRF9FQVJORURfS0VZKSwgbm9ybWFsaXplZFRvdGFsR29sZC50b1N0cmluZygpKTtcclxuICAgICAgICAgICAgZ2FtZURhdGEudG90YWxHb2xkRWFybmVkID0gbm9ybWFsaXplZFRvdGFsR29sZDtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmICh0eXBlb2YgcGF5bG9hZC5nYW1lMlNoZW5wbyA9PT0gXCJudW1iZXJcIiAmJiBOdW1iZXIuaXNGaW5pdGUocGF5bG9hZC5nYW1lMlNoZW5wbykpIHtcclxuICAgICAgICAgICAgY29uc3Qgbm9ybWFsaXplZFNoZW5wbyA9IE1hdGgubWF4KDAsIE1hdGguZmxvb3IocGF5bG9hZC5nYW1lMlNoZW5wbykpO1xyXG4gICAgICAgICAgICBjYy5zeXMubG9jYWxTdG9yYWdlLnNldEl0ZW0odGhpcy5nZXRTY29wZWRLZXkodGhpcy5HQU1FMl9TSEVOUE9fS0VZKSwgbm9ybWFsaXplZFNoZW5wby50b1N0cmluZygpKTtcclxuICAgICAgICAgICAgdGhpcy5nZXRTdGF0ZUJyaWRnZSgpLnNhdmVTaGVucG8obm9ybWFsaXplZFNoZW5wbyk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAocGF5bG9hZC5nYW1lMkhlcm9UaWVycyAmJiB0eXBlb2YgcGF5bG9hZC5nYW1lMkhlcm9UaWVycyA9PT0gXCJvYmplY3RcIiAmJiAhQXJyYXkuaXNBcnJheShwYXlsb2FkLmdhbWUySGVyb1RpZXJzKSkge1xyXG4gICAgICAgICAgICBjYy5zeXMubG9jYWxTdG9yYWdlLnNldEl0ZW0odGhpcy5nZXRTY29wZWRLZXkodGhpcy5HQU1FMl9IRVJPX1RJRVJTX0tFWSksIEpTT04uc3RyaW5naWZ5KHBheWxvYWQuZ2FtZTJIZXJvVGllcnMpKTtcclxuICAgICAgICAgICAgdGhpcy5nZXRTdGF0ZUJyaWRnZSgpLnNhdmVIZXJvVGllcnMocGF5bG9hZC5nYW1lMkhlcm9UaWVycyk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAodHlwZW9mIHBheWxvYWQuZ2FtZTJFcXVpcHBlZFNraW5JZCA9PT0gXCJzdHJpbmdcIiAmJiBwYXlsb2FkLmdhbWUyRXF1aXBwZWRTa2luSWQpIHtcclxuICAgICAgICAgICAgY29uc3QgZ2FtZVN0YXRlID0gdGhpcy5nZXRHYW1lU3RhdGUoKTtcclxuICAgICAgICAgICAgZ2FtZVN0YXRlLmVxdWlwcGVkU2tpbklkID0gcGF5bG9hZC5nYW1lMkVxdWlwcGVkU2tpbklkO1xyXG4gICAgICAgICAgICBpZiAodHlwZW9mIGdhbWVTdGF0ZS5zYXZlID09PSBcImZ1bmN0aW9uXCIpIHtcclxuICAgICAgICAgICAgICAgIGdhbWVTdGF0ZS5zYXZlKCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmIChBcnJheS5pc0FycmF5KHBheWxvYWQuaXRlbVN0b2NrKSkge1xyXG4gICAgICAgICAgICBjb25zdCBub3JtYWxpemVkSXRlbVN0b2NrID0gcGF5bG9hZC5pdGVtU3RvY2subWFwKCh2YWx1ZSkgPT4gTWF0aC5tYXgoMCwgTWF0aC5mbG9vcihOdW1iZXIodmFsdWUpIHx8IDApKSk7XHJcbiAgICAgICAgICAgIGNjLnN5cy5sb2NhbFN0b3JhZ2Uuc2V0SXRlbSh0aGlzLmdldFNjb3BlZEtleSh0aGlzLklURU1fU1RPQ0tfS0VZKSwgSlNPTi5zdHJpbmdpZnkobm9ybWFsaXplZEl0ZW1TdG9jaykpO1xyXG4gICAgICAgICAgICBnYW1lRGF0YS5pdGVtU3RvY2sgPSBub3JtYWxpemVkSXRlbVN0b2NrO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKEFycmF5LmlzQXJyYXkocGF5bG9hZC5za2lsbHMpKSB7XHJcbiAgICAgICAgICAgIGNjLnN5cy5sb2NhbFN0b3JhZ2Uuc2V0SXRlbSh0aGlzLmdldFNjb3BlZEtleSh0aGlzLlNLSUxMU19LRVkpLCBKU09OLnN0cmluZ2lmeShwYXlsb2FkLnNraWxscykpO1xyXG4gICAgICAgICAgICBnYW1lRGF0YS5za2lsbHMgPSBwYXlsb2FkLnNraWxscztcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmIChBcnJheS5pc0FycmF5KHBheWxvYWQuYWNoaWV2ZUNsYWltZWRMaXN0KSkge1xyXG4gICAgICAgICAgICBjYy5zeXMubG9jYWxTdG9yYWdlLnNldEl0ZW0odGhpcy5nZXRTY29wZWRLZXkodGhpcy5BQ0hJRVZFX0tFWSksIEpTT04uc3RyaW5naWZ5KHBheWxvYWQuYWNoaWV2ZUNsYWltZWRMaXN0KSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAoQXJyYXkuaXNBcnJheShwYXlsb2FkLndlZWtseVJld2FyZENsYWltZWRMaXN0KSkge1xyXG4gICAgICAgICAgICBjYy5zeXMubG9jYWxTdG9yYWdlLnNldEl0ZW0odGhpcy5nZXRTY29wZWRLZXkodGhpcy5XRUVLTFlfUkVXQVJEX0NMQUlNRURfS0VZKSwgSlNPTi5zdHJpbmdpZnkocGF5bG9hZC53ZWVrbHlSZXdhcmRDbGFpbWVkTGlzdCkpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKHR5cGVvZiBwYXlsb2FkLndlZWtseVJld2FyZFdlZWtTdGFydCA9PT0gXCJzdHJpbmdcIikge1xyXG4gICAgICAgICAgICBjYy5zeXMubG9jYWxTdG9yYWdlLnNldEl0ZW0odGhpcy5nZXRTY29wZWRLZXkodGhpcy5XRUVLTFlfUkVXQVJEX1dFRUtfU1RBUlRfS0VZKSwgcGF5bG9hZC53ZWVrbHlSZXdhcmRXZWVrU3RhcnQpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKEFycmF5LmlzQXJyYXkocGF5bG9hZC5kYWlseVJld2FyZENsYWltZWRMaXN0KSkge1xyXG4gICAgICAgICAgICBjYy5zeXMubG9jYWxTdG9yYWdlLnNldEl0ZW0odGhpcy5nZXRTY29wZWRLZXkodGhpcy5EQUlMWV9SRVdBUkRfQ0xBSU1FRF9LRVkpLCBKU09OLnN0cmluZ2lmeShwYXlsb2FkLmRhaWx5UmV3YXJkQ2xhaW1lZExpc3QpKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmICh0eXBlb2YgcGF5bG9hZC5kYWlseVJld2FyZERhdGUgPT09IFwic3RyaW5nXCIpIHtcclxuICAgICAgICAgICAgY2Muc3lzLmxvY2FsU3RvcmFnZS5zZXRJdGVtKHRoaXMuZ2V0U2NvcGVkS2V5KHRoaXMuREFJTFlfUkVXQVJEX0RBVEVfS0VZKSwgcGF5bG9hZC5kYWlseVJld2FyZERhdGUpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKHR5cGVvZiBwYXlsb2FkLmRhaWx5T25saW5lTWludXRlcyA9PT0gXCJudW1iZXJcIiAmJiBOdW1iZXIuaXNGaW5pdGUocGF5bG9hZC5kYWlseU9ubGluZU1pbnV0ZXMpKSB7XHJcbiAgICAgICAgICAgIGNvbnN0IG5vcm1hbGl6ZWRNaW51dGVzID0gTWF0aC5tYXgoMCwgTWF0aC5mbG9vcihwYXlsb2FkLmRhaWx5T25saW5lTWludXRlcykpO1xyXG4gICAgICAgICAgICBjYy5zeXMubG9jYWxTdG9yYWdlLnNldEl0ZW0odGhpcy5nZXRTY29wZWRLZXkodGhpcy5EQUlMWV9PTkxJTkVfTUlOVVRFU19LRVkpLCBub3JtYWxpemVkTWludXRlcy50b1N0cmluZygpKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmICh0eXBlb2YgcGF5bG9hZC50b3RhbENvbnN1bWVkU3RhbWluYSA9PT0gXCJudW1iZXJcIiAmJiBOdW1iZXIuaXNGaW5pdGUocGF5bG9hZC50b3RhbENvbnN1bWVkU3RhbWluYSkpIHtcclxuICAgICAgICAgICAgY29uc3Qgbm9ybWFsaXplZENvbnN1bWVkU3RhbWluYSA9IE1hdGgubWF4KDAsIE1hdGguZmxvb3IocGF5bG9hZC50b3RhbENvbnN1bWVkU3RhbWluYSkpO1xyXG4gICAgICAgICAgICBjYy5zeXMubG9jYWxTdG9yYWdlLnNldEl0ZW0odGhpcy5nZXRTY29wZWRLZXkodGhpcy5UT1RBTF9DT05TVU1FRF9TVEFNSU5BX0tFWSksIG5vcm1hbGl6ZWRDb25zdW1lZFN0YW1pbmEudG9TdHJpbmcoKSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAodHlwZW9mIHBheWxvYWQuY3VycmVudFN0YW1pbmEgPT09IFwibnVtYmVyXCIgJiYgTnVtYmVyLmlzRmluaXRlKHBheWxvYWQuY3VycmVudFN0YW1pbmEpKSB7XHJcbiAgICAgICAgICAgIGNvbnN0IG5vcm1hbGl6ZWRTdGFtaW5hID0gTWF0aC5tYXgoMCwgTWF0aC5taW4oMzAsIE1hdGguZmxvb3IocGF5bG9hZC5jdXJyZW50U3RhbWluYSkpKTtcclxuICAgICAgICAgICAgY2Muc3lzLmxvY2FsU3RvcmFnZS5zZXRJdGVtKHRoaXMuZ2V0U2NvcGVkS2V5KHRoaXMuU1RBTUlOQV9LRVkpLCBub3JtYWxpemVkU3RhbWluYS50b1N0cmluZygpKTtcclxuICAgICAgICAgICAgZ2FtZURhdGEuY3VycmVudFN0YW1pbmEgPSBub3JtYWxpemVkU3RhbWluYTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmICh0eXBlb2YgcGF5bG9hZC5sYXN0UmVjb3ZlclRpbWUgPT09IFwibnVtYmVyXCIgJiYgTnVtYmVyLmlzRmluaXRlKHBheWxvYWQubGFzdFJlY292ZXJUaW1lKSkge1xyXG4gICAgICAgICAgICBjb25zdCBub3JtYWxpemVkVGltZSA9IE1hdGgubWF4KDAsIE1hdGguZmxvb3IocGF5bG9hZC5sYXN0UmVjb3ZlclRpbWUpKTtcclxuICAgICAgICAgICAgY2Muc3lzLmxvY2FsU3RvcmFnZS5zZXRJdGVtKHRoaXMuZ2V0U2NvcGVkS2V5KHRoaXMuTEFTVF9SRUNPVkVSX1RJTUVfS0VZKSwgbm9ybWFsaXplZFRpbWUudG9TdHJpbmcoKSk7XHJcbiAgICAgICAgICAgIGdhbWVEYXRhLmxhc3RSZWNvdmVyVGltZSA9IG5vcm1hbGl6ZWRUaW1lO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKEFycmF5LmlzQXJyYXkocGF5bG9hZC51bmxvY2tlZFJvbGVzKSkge1xyXG4gICAgICAgICAgICBjYy5zeXMubG9jYWxTdG9yYWdlLnNldEl0ZW0odGhpcy5nZXRTY29wZWRLZXkodGhpcy5VTkxPQ0tFRF9ST0xFU19LRVkpLCBKU09OLnN0cmluZ2lmeShwYXlsb2FkLnVubG9ja2VkUm9sZXMpKTtcclxuICAgICAgICAgICAgZ2FtZURhdGEudW5sb2NrZWRSb2xlcyA9IHBheWxvYWQudW5sb2NrZWRSb2xlcztcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmICh0eXBlb2YgcGF5bG9hZC5jdXJyZW50Um9sZSA9PT0gXCJudW1iZXJcIiAmJiBOdW1iZXIuaXNGaW5pdGUocGF5bG9hZC5jdXJyZW50Um9sZSkpIHtcclxuICAgICAgICAgICAgY29uc3Qgbm9ybWFsaXplZFJvbGUgPSBNYXRoLm1heCgwLCBNYXRoLmZsb29yKHBheWxvYWQuY3VycmVudFJvbGUpKTtcclxuICAgICAgICAgICAgY2Muc3lzLmxvY2FsU3RvcmFnZS5zZXRJdGVtKHRoaXMuZ2V0U2NvcGVkS2V5KHRoaXMuQ1VSUkVOVF9ST0xFX0tFWSksIG5vcm1hbGl6ZWRSb2xlLnRvU3RyaW5nKCkpO1xyXG4gICAgICAgICAgICBnYW1lRGF0YS5jdXJyZW50Um9sZSA9IG5vcm1hbGl6ZWRSb2xlO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKHR5cGVvZiBwYXlsb2FkLmN1cnJlbnRMZXZlbCA9PT0gXCJudW1iZXJcIiAmJiBOdW1iZXIuaXNGaW5pdGUocGF5bG9hZC5jdXJyZW50TGV2ZWwpKSB7XHJcbiAgICAgICAgICAgIGNvbnN0IG5vcm1hbGl6ZWRDdXJyZW50TGV2ZWwgPSBNYXRoLm1heCgxLCBNYXRoLmZsb29yKHBheWxvYWQuY3VycmVudExldmVsKSk7XHJcbiAgICAgICAgICAgIGNjLnN5cy5sb2NhbFN0b3JhZ2Uuc2V0SXRlbSh0aGlzLmdldFNjb3BlZEtleSh0aGlzLkNVUlJFTlRfTEVWRUxfS0VZKSwgbm9ybWFsaXplZEN1cnJlbnRMZXZlbC50b1N0cmluZygpKTtcclxuICAgICAgICAgICAgZ2FtZURhdGEuY3VycmVudExldmVsID0gbm9ybWFsaXplZEN1cnJlbnRMZXZlbDtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmICh0eXBlb2YgcGF5bG9hZC51bmxvY2tlZExldmVsID09PSBcIm51bWJlclwiICYmIE51bWJlci5pc0Zpbml0ZShwYXlsb2FkLnVubG9ja2VkTGV2ZWwpKSB7XG4gICAgICAgICAgICBjb25zdCBub3JtYWxpemVkVW5sb2NrZWRMZXZlbCA9IE1hdGgubWF4KDEsIE1hdGguZmxvb3IocGF5bG9hZC51bmxvY2tlZExldmVsKSk7XG4gICAgICAgICAgICBjYy5zeXMubG9jYWxTdG9yYWdlLnNldEl0ZW0odGhpcy5nZXRTY29wZWRLZXkodGhpcy5VTkxPQ0tFRF9MRVZFTF9LRVkpLCBub3JtYWxpemVkVW5sb2NrZWRMZXZlbC50b1N0cmluZygpKTtcbiAgICAgICAgICAgIGdhbWVEYXRhLnVubG9ja2VkTGV2ZWwgPSBub3JtYWxpemVkVW5sb2NrZWRMZXZlbDtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICh0eXBlb2YgcGF5bG9hZC53YXJyaW9yUnVuQmVzdERpc3RhbmNlID09PSBcIm51bWJlclwiICYmIE51bWJlci5pc0Zpbml0ZShwYXlsb2FkLndhcnJpb3JSdW5CZXN0RGlzdGFuY2UpKSB7XG4gICAgICAgICAgICBjb25zdCBub3JtYWxpemVkQmVzdERpc3RhbmNlID0gTWF0aC5tYXgoMCwgTWF0aC5mbG9vcihwYXlsb2FkLndhcnJpb3JSdW5CZXN0RGlzdGFuY2UpKTtcbiAgICAgICAgICAgIGNjLnN5cy5sb2NhbFN0b3JhZ2Uuc2V0SXRlbSh0aGlzLmdldFNjb3BlZEtleSh0aGlzLldBUlJJT1JfUlVOX0JFU1RfRElTVEFOQ0VfS0VZKSwgbm9ybWFsaXplZEJlc3REaXN0YW5jZS50b1N0cmluZygpKTtcbiAgICAgICAgICAgIGNjLnN5cy5sb2NhbFN0b3JhZ2Uuc2V0SXRlbSh0aGlzLldBUlJJT1JfUlVOX0JFU1RfRElTVEFOQ0VfS0VZLCBub3JtYWxpemVkQmVzdERpc3RhbmNlLnRvU3RyaW5nKCkpO1xuICAgICAgICB9XG5cclxuICAgICAgICBpZiAoQXJyYXkuaXNBcnJheShwYXlsb2FkLmxldmVsU3RhcnMpKSB7XG4gICAgICAgICAgICBjYy5zeXMubG9jYWxTdG9yYWdlLnNldEl0ZW0odGhpcy5nZXRTY29wZWRLZXkodGhpcy5MRVZFTF9TVEFSU19LRVkpLCBKU09OLnN0cmluZ2lmeShwYXlsb2FkLmxldmVsU3RhcnMpKTtcbiAgICAgICAgICAgIGdhbWVEYXRhLmxldmVsU3RhcnMgPSBbXTtcbiAgICAgICAgICAgIGdhbWVEYXRhLmxvYWRMZXZlbFN0YXJzQXJyYXkocGF5bG9hZC5sZXZlbFN0YXJzKTtcbiAgICAgICAgfVxuXHJcbiAgICAgICAgaWYgKEFycmF5LmlzQXJyYXkocGF5bG9hZC5mYWlsZWRMZXZlbHMpKSB7XHJcbiAgICAgICAgICAgIHRoaXMuZ2V0U3RhdGVCcmlkZ2UoKS5zYXZlRmFpbGVkTGV2ZWxzKHBheWxvYWQuZmFpbGVkTGV2ZWxzKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGdhbWVEYXRhLkdldEdvbGREYXRhKCk7XG4gICAgICAgIGdhbWVEYXRhLkdldFN0YW1pbmFEYXRhKCk7XG4gICAgICAgIGdhbWVEYXRhLkdldEN1cnJlbnRSb2xlRGF0YSgpO1xuICAgICAgICB0aGlzLmdldFN0YXRlQnJpZGdlKCkuc3luY09sZFRvTmV3KCk7XHJcbiAgICAgICAgdGhpcy5sb2dEZWJ1ZyhcIkxvY2FsIGRhdGEgYWZ0ZXIgYXBwbHlpbmcgcmVtb3RlIHBheWxvYWRcIiwge1xuICAgICAgICAgICAgY3VycmVudEdvbGQ6IGdhbWVEYXRhLmN1cnJlbnRHb2xkLFxuICAgICAgICAgICAgY3VycmVudFN0YW1pbmE6IGdhbWVEYXRhLmN1cnJlbnRTdGFtaW5hLFxuICAgICAgICAgICAgbGFzdFJlY292ZXJUaW1lOiBnYW1lRGF0YS5sYXN0UmVjb3ZlclRpbWUsXG4gICAgICAgICAgICBjdXJyZW50Um9sZTogZ2FtZURhdGEuY3VycmVudFJvbGVcbiAgICAgICAgfSk7XG4gICAgICAgIGNjLmRpcmVjdG9yLmVtaXQoXCJnb2xkVXBkYXRlZFwiKTtcclxuICAgICAgICBjYy5kaXJlY3Rvci5lbWl0KFwic2hlbnBvVXBkYXRlZFwiKTtcclxuICAgICAgICBjYy5kaXJlY3Rvci5lbWl0KFwic3RhbWluYVVwZGF0ZWRcIik7XHJcbiAgICAgICAgY2MuZGlyZWN0b3IuZW1pdChcInJvbGVVcGRhdGVkXCIpO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgc3RhdGljIHJlbG9hZFNjb3BlZExvY2FsRGF0YSgpOiB2b2lkIHtcclxuICAgICAgICBjb25zdCBnYW1lRGF0YSA9IHRoaXMuZ2V0R2FtZURhdGEoKTtcclxuICAgICAgICBpZiAoIWdhbWVEYXRhKSB7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGdhbWVEYXRhLkdldEdvbGREYXRhKCk7XG4gICAgICAgIGdhbWVEYXRhLkdldEN1cnJlbnRSb2xlRGF0YT8uKCk7XG4gICAgICAgIGdhbWVEYXRhLkdldEl0ZW1TdG9ja0RhdGE/LigpO1xuICAgICAgICBnYW1lRGF0YS5HZXRTdGFtaW5hRGF0YT8uKCk7XG4gICAgICAgIGdhbWVEYXRhLkNoZWNrQW5kUmVjb3ZlclN0YW1pbmE/LigpO1xuICAgICAgICB0aGlzLmdldFN0YXRlQnJpZGdlKCkuc3luY09sZFRvTmV3KCk7XG5cbiAgICAgICAgdGhpcy5sb2dEZWJ1ZyhcIlJlbG9hZCBzY29wZWQgbG9jYWwgZGF0YSBmb3IgY3VycmVudCBhY2NvdW50XCIsIHtcbiAgICAgICAgICAgIHVzZXJuYW1lOiB0aGlzLmdldFVzZXJuYW1lKCksXG4gICAgICAgICAgICB1c2VySWQ6IHRoaXMuZ2V0VXNlcklkKCksXG4gICAgICAgICAgICBjdXJyZW50R29sZDogZ2FtZURhdGEuY3VycmVudEdvbGQsXG4gICAgICAgICAgICBjdXJyZW50U3RhbWluYTogZ2FtZURhdGEuY3VycmVudFN0YW1pbmFcbiAgICAgICAgfSk7XG5cbiAgICAgICAgY2MuZGlyZWN0b3IuZW1pdChcImdvbGRVcGRhdGVkXCIpO1xuICAgICAgICBjYy5kaXJlY3Rvci5lbWl0KFwic2hlbnBvVXBkYXRlZFwiKTtcbiAgICAgICAgY2MuZGlyZWN0b3IuZW1pdChcInN0YW1pbmFVcGRhdGVkXCIpO1xuICAgIH1cblxyXG4gICAgcHJpdmF0ZSBzdGF0aWMgcmVhZFN0cmluZyhiYXNlS2V5OiBzdHJpbmcpOiBzdHJpbmcge1xyXG4gICAgICAgIHJldHVybiBjYy5zeXMubG9jYWxTdG9yYWdlLmdldEl0ZW0odGhpcy5nZXRTY29wZWRLZXkoYmFzZUtleSkpIHx8IFwiXCI7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBzdGF0aWMgcmVhZE51bWJlcihiYXNlS2V5OiBzdHJpbmcsIGRlZmF1bHRWYWx1ZTogbnVtYmVyKTogbnVtYmVyIHtcclxuICAgICAgICBjb25zdCByYXdWYWx1ZSA9IGNjLnN5cy5sb2NhbFN0b3JhZ2UuZ2V0SXRlbSh0aGlzLmdldFNjb3BlZEtleShiYXNlS2V5KSk7XHJcbiAgICAgICAgaWYgKCFyYXdWYWx1ZSkge1xyXG4gICAgICAgICAgICByZXR1cm4gZGVmYXVsdFZhbHVlO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgY29uc3QgcGFyc2VkVmFsdWUgPSBwYXJzZUludChyYXdWYWx1ZSwgMTApO1xyXG4gICAgICAgIHJldHVybiBOdW1iZXIuaXNOYU4ocGFyc2VkVmFsdWUpID8gZGVmYXVsdFZhbHVlIDogcGFyc2VkVmFsdWU7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIHN0YXRpYyBnZXRTdG9yZWROdW1iZXIoYmFzZUtleTogc3RyaW5nLCBkZWZhdWx0VmFsdWUgPSAwKTogbnVtYmVyIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5yZWFkTnVtYmVyKGJhc2VLZXksIGRlZmF1bHRWYWx1ZSk7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBzdGF0aWMgcmVhZEpzb25BcnJheShiYXNlS2V5OiBzdHJpbmcsIGRlZmF1bHRWYWx1ZTogYW55W10pOiBhbnlbXSB7XHJcbiAgICAgICAgY29uc3QgcmF3VmFsdWUgPSBjYy5zeXMubG9jYWxTdG9yYWdlLmdldEl0ZW0odGhpcy5nZXRTY29wZWRLZXkoYmFzZUtleSkpO1xyXG4gICAgICAgIGlmICghcmF3VmFsdWUpIHtcclxuICAgICAgICAgICAgcmV0dXJuIGRlZmF1bHRWYWx1ZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgIGNvbnN0IHBhcnNlZFZhbHVlID0gSlNPTi5wYXJzZShyYXdWYWx1ZSk7XHJcbiAgICAgICAgICAgIHJldHVybiBBcnJheS5pc0FycmF5KHBhcnNlZFZhbHVlKSA/IHBhcnNlZFZhbHVlIDogZGVmYXVsdFZhbHVlO1xyXG4gICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XHJcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoYFBhcnNlIGxvY2FsIGFycmF5IGRhdGEgZmFpbGVkIGZvciAke2Jhc2VLZXl9OmAsIGVycm9yKTtcclxuICAgICAgICAgICAgcmV0dXJuIGRlZmF1bHRWYWx1ZTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBzdGF0aWMgcmVhZEpzb25PYmplY3QoYmFzZUtleTogc3RyaW5nLCBkZWZhdWx0VmFsdWU6IHsgW2tleTogc3RyaW5nXTogYW55IH0pOiB7IFtrZXk6IHN0cmluZ106IGFueSB9IHtcclxuICAgICAgICBjb25zdCByYXdWYWx1ZSA9IGNjLnN5cy5sb2NhbFN0b3JhZ2UuZ2V0SXRlbSh0aGlzLmdldFNjb3BlZEtleShiYXNlS2V5KSk7XHJcbiAgICAgICAgaWYgKCFyYXdWYWx1ZSkge1xyXG4gICAgICAgICAgICByZXR1cm4gZGVmYXVsdFZhbHVlO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgY29uc3QgcGFyc2VkVmFsdWUgPSBKU09OLnBhcnNlKHJhd1ZhbHVlKTtcclxuICAgICAgICAgICAgcmV0dXJuIHBhcnNlZFZhbHVlICYmIHR5cGVvZiBwYXJzZWRWYWx1ZSA9PT0gXCJvYmplY3RcIiAmJiAhQXJyYXkuaXNBcnJheShwYXJzZWRWYWx1ZSlcclxuICAgICAgICAgICAgICAgID8gcGFyc2VkVmFsdWVcclxuICAgICAgICAgICAgICAgIDogZGVmYXVsdFZhbHVlO1xyXG4gICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XHJcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoYFBhcnNlIGxvY2FsIG9iamVjdCBkYXRhIGZhaWxlZCBmb3IgJHtiYXNlS2V5fTpgLCBlcnJvcik7XHJcbiAgICAgICAgICAgIHJldHVybiBkZWZhdWx0VmFsdWU7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgc3RhdGljIHJlYWROdW1iZXJBcnJheShiYXNlS2V5OiBzdHJpbmcpOiBudW1iZXJbXSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMucmVhZEpzb25BcnJheShiYXNlS2V5LCBbXSkuZmlsdGVyKCh2YWx1ZSkgPT4gdHlwZW9mIHZhbHVlID09PSBcIm51bWJlclwiKTtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIHN0YXRpYyBwcm9ncmVzc1N0YXJzVG9BcnJheShyYXdTdGFyczogYW55KTogbnVtYmVyW10ge1xyXG4gICAgICAgIGlmIChBcnJheS5pc0FycmF5KHJhd1N0YXJzKSkge1xyXG4gICAgICAgICAgICByZXR1cm4gcmF3U3RhcnMubWFwKCh2YWx1ZSkgPT4gTWF0aC5tYXgoMCwgTWF0aC5mbG9vcihOdW1iZXIodmFsdWUpIHx8IDApKSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAoIXJhd1N0YXJzIHx8IHR5cGVvZiByYXdTdGFycyAhPT0gXCJvYmplY3RcIikge1xyXG4gICAgICAgICAgICByZXR1cm4gW107XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBjb25zdCBsZXZlbHMgPSBPYmplY3Qua2V5cyhyYXdTdGFycylcclxuICAgICAgICAgICAgLm1hcCgoa2V5KSA9PiBwYXJzZUludChrZXksIDEwKSlcclxuICAgICAgICAgICAgLmZpbHRlcigobGV2ZWwpID0+IE51bWJlci5pc0Zpbml0ZShsZXZlbCkgJiYgbGV2ZWwgPiAwKTtcclxuICAgICAgICBjb25zdCBtYXhMZXZlbCA9IGxldmVscy5sZW5ndGggPiAwID8gTWF0aC5tYXgoLi4ubGV2ZWxzKSA6IDA7XHJcbiAgICAgICAgY29uc3QgcmVzdWx0OiBudW1iZXJbXSA9IFtdO1xyXG4gICAgICAgIGZvciAobGV0IGxldmVsID0gMTsgbGV2ZWwgPD0gbWF4TGV2ZWw7IGxldmVsKyspIHtcclxuICAgICAgICAgICAgcmVzdWx0LnB1c2goTWF0aC5tYXgoMCwgTWF0aC5mbG9vcihOdW1iZXIocmF3U3RhcnNbU3RyaW5nKGxldmVsKV0pIHx8IDApKSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiByZXN1bHQ7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBzdGF0aWMgc2VyaWFsaXplUGF5bG9hZChwYXlsb2FkOiBSZW1vdGVVc2VyRGF0YVBheWxvYWQpOiBzdHJpbmcge1xyXG4gICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgIHJldHVybiBKU09OLnN0cmluZ2lmeShwYXlsb2FkKTtcclxuICAgICAgICB9IGNhdGNoIChlcnJvcikge1xyXG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKFwiU2VyaWFsaXplIHVzZXIgZGF0YSBwYXlsb2FkIGZhaWxlZDpcIiwgZXJyb3IpO1xyXG4gICAgICAgICAgICByZXR1cm4gXCJ7fVwiO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIHN0YXRpYyBhc3luYyBwb3N0SnNvbih1cmw6IHN0cmluZywgZGF0YTogYW55KTogUHJvbWlzZTxhbnk+IHtcclxuICAgICAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xyXG4gICAgICAgICAgICBjb25zdCB4aHIgPSBuZXcgWE1MSHR0cFJlcXVlc3QoKTtcclxuICAgICAgICAgICAgeGhyLm9wZW4oXCJQT1NUXCIsIHVybCwgdHJ1ZSk7XHJcbiAgICAgICAgICAgIHhoci5zZXRSZXF1ZXN0SGVhZGVyKFwiQ29udGVudC1UeXBlXCIsIFwiYXBwbGljYXRpb24vanNvblwiKTtcclxuXHJcbiAgICAgICAgICAgIHhoci5vbmxvYWQgPSAoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICBpZiAoeGhyLnN0YXR1cyA+PSAyMDAgJiYgeGhyLnN0YXR1cyA8IDMwMCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlc29sdmUoSlNPTi5wYXJzZSh4aHIucmVzcG9uc2VUZXh0KSk7XHJcbiAgICAgICAgICAgICAgICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmVqZWN0KG5ldyBFcnJvcihgSlNPTiBwYXJzZSBlcnJvcjogJHtlcnJvci5tZXNzYWdlfWApKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIHJlamVjdChuZXcgRXJyb3IoYEhUVFAgZXJyb3I6ICR7eGhyLnN0YXR1c31gKSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH07XHJcblxyXG4gICAgICAgICAgICB4aHIub25lcnJvciA9ICgpID0+IHJlamVjdChuZXcgRXJyb3IoXCJOZXR3b3JrIHJlcXVlc3QgZmFpbGVkXCIpKTtcclxuICAgICAgICAgICAgeGhyLm9udGltZW91dCA9ICgpID0+IHJlamVjdChuZXcgRXJyb3IoXCJOZXR3b3JrIHJlcXVlc3QgdGltZW91dFwiKSk7XHJcblxyXG4gICAgICAgICAgICB4aHIuc2VuZChKU09OLnN0cmluZ2lmeShkYXRhKSk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcbn1cclxuIl19