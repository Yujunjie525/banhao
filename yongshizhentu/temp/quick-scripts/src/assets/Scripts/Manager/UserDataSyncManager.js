"use strict";
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