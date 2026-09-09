
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
        return require("../game2/StateBridge").default;
    };
    UserDataSyncManager.getGameState = function () {
        return require("../game2/GameState").default;
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
        var fallbackCurrentLevel = Math.max(1, (gameState.selectedLevelIdx || 0) + 1);
        var fallbackUnlockedLevel = Math.max(1, (gameState.maxUnlockedLevel || 0) + 1);
        return {
            version: 1,
            updatedAt: Date.now(),
            currentGold: this.readNumber(this.GOLD_KEY, gameData.currentGold),
            game2Shenpo: this.readNumber(this.GAME2_SHENPO_KEY, this.getStateBridge().getShenpo()),
            game2HeroTiers: this.readJsonObject(this.GAME2_HERO_TIERS_KEY, this.getStateBridge().getHeroTiers()),
            game2EquippedSkinId: typeof gameState.equippedSkinId === "string" ? gameState.equippedSkinId : "Skin_01",
            itemStock: this.readJsonArray(this.ITEM_STOCK_KEY, gameData.itemStock || [0, 0, 0]),
            totalGoldEarned: this.readNumber(this.TOTAL_GOLD_EARNED_KEY, gameData.totalGoldEarned || 0),
            bestScore: this.readNumber(this.BEST_SCORE_KEY, gameData.BestScore || 0),
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
            levelStars: this.readJsonArray(this.LEVEL_STARS_KEY, gameData.getLevelStarsArray())
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
        var _a;
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
        if (typeof payload.bestScore === "number" && Number.isFinite(payload.bestScore)) {
            var normalizedBestScore = Math.max(0, Math.floor(payload.bestScore));
            cc.sys.localStorage.setItem(this.getScopedKey(this.BEST_SCORE_KEY), normalizedBestScore.toString());
            gameData.BestScore = normalizedBestScore;
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
            gameState.save();
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
        if (Array.isArray(payload.levelStars)) {
            cc.sys.localStorage.setItem(this.getScopedKey(this.LEVEL_STARS_KEY), JSON.stringify(payload.levelStars));
            gameData.loadLevelStarsArray(payload.levelStars);
        }
        gameData.GetGoldData();
        (_a = gameData.GetBestScoreData) === null || _a === void 0 ? void 0 : _a.call(gameData);
        gameData.GetSkillsData();
        gameData.GetStaminaData();
        gameData.GetUnlockedRolesData();
        gameData.GetCurrentRoleData();
        this.getStateBridge().syncOldToNew();
        this.logDebug("Local data after applying remote payload", {
            currentGold: gameData.currentGold,
            skills: gameData.skills,
            currentStamina: gameData.currentStamina,
            lastRecoverTime: gameData.lastRecoverTime,
            unlockedRoles: gameData.unlockedRoles,
            currentRole: gameData.currentRole
        });
        cc.director.emit("goldUpdated");
        cc.director.emit("shenpoUpdated");
        cc.director.emit("staminaUpdated");
        cc.director.emit("roleUpdated");
    };
    UserDataSyncManager.reloadScopedLocalData = function () {
        var _a, _b, _c, _d, _e, _f;
        var gameData = this.getGameData();
        if (!gameData) {
            return;
        }
        gameData.GetGoldData();
        (_a = gameData.GetBestScoreData) === null || _a === void 0 ? void 0 : _a.call(gameData);
        gameData.GetSkillsData();
        (_b = gameData.GetUnlockedRolesData) === null || _b === void 0 ? void 0 : _b.call(gameData);
        (_c = gameData.GetCurrentRoleData) === null || _c === void 0 ? void 0 : _c.call(gameData);
        (_d = gameData.GetItemStockData) === null || _d === void 0 ? void 0 : _d.call(gameData);
        (_e = gameData.GetLevelData) === null || _e === void 0 ? void 0 : _e.call(gameData);
        (_f = gameData.GetStaminaData) === null || _f === void 0 ? void 0 : _f.call(gameData);
        this.logDebug("Reload scoped local data for current account", {
            username: this.getUsername(),
            userId: this.getUserId(),
            currentGold: gameData.currentGold,
            skills: gameData.skills
        });
        cc.director.emit("goldUpdated");
        cc.director.emit("shenpoUpdated");
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
    UserDataSyncManager.BEST_SCORE_KEY = "BestScore";
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFzc2V0c1xcU2NyaXB0c1xcTWFuYWdlclxcVXNlckRhdGFTeW5jTWFuYWdlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7O0FBQUEsaURBQTZDO0FBNkI3QztJQUFBO0lBMmpCQSxDQUFDO0lBdGhCa0Isc0NBQWtCLEdBQWpDO1FBQ0ksSUFBTSxVQUFVLEdBQUcsQ0FBRyxJQUFJLENBQUMsV0FBVyxFQUFFLElBQUksRUFBRSxZQUFLLElBQUksQ0FBQyxTQUFTLEVBQUUsSUFBSSxFQUFFLENBQUUsQ0FBQztRQUM1RSxJQUFJLFVBQVUsS0FBSyxJQUFJLENBQUMsaUJBQWlCLEVBQUU7WUFDdkMsT0FBTztTQUNWO1FBRUQsSUFBSSxDQUFDLGlCQUFpQixHQUFHLFVBQVUsQ0FBQztRQUNwQyxJQUFJLENBQUMsb0JBQW9CLEdBQUcsS0FBSyxDQUFDO1FBQ2xDLElBQUksQ0FBQyxtQkFBbUIsR0FBRyxFQUFFLENBQUM7UUFDOUIsSUFBSSxDQUFDLGVBQWUsR0FBRyxLQUFLLENBQUM7UUFFN0IsSUFBSSxJQUFJLENBQUMsV0FBVyxFQUFFO1lBQ2xCLFlBQVksQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLENBQUM7WUFDL0IsSUFBSSxDQUFDLFdBQVcsR0FBRyxJQUFJLENBQUM7U0FDM0I7SUFDTCxDQUFDO0lBRWMsK0JBQVcsR0FBMUI7UUFDSSxPQUFPLEVBQUUsQ0FBQyxHQUFHLENBQUMsWUFBWSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLENBQUM7SUFDMUQsQ0FBQztJQUVjLDZCQUFTLEdBQXhCO1FBQ0ksT0FBTyxFQUFFLENBQUMsR0FBRyxDQUFDLFlBQVksQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxDQUFDO0lBQ3pELENBQUM7SUFFYyxnQ0FBWSxHQUEzQixVQUE0QixPQUFlO1FBQ3ZDLElBQU0sTUFBTSxHQUFHLElBQUksQ0FBQyxTQUFTLEVBQUUsQ0FBQztRQUNoQyxPQUFPLE1BQU0sQ0FBQyxDQUFDLENBQUksT0FBTyxTQUFJLE1BQVEsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDO0lBQ3JELENBQUM7SUFFYyxtQ0FBZSxHQUE5QjtRQUNJLE9BQU8sQ0FBQyxDQUFDLElBQUksQ0FBQyxXQUFXLEVBQUUsQ0FBQztJQUNoQyxDQUFDO0lBRWMsK0JBQVcsR0FBMUI7UUFDSSxPQUFPLE9BQU8sQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDLE9BQU8sQ0FBQztJQUMvQyxDQUFDO0lBRWMsa0NBQWMsR0FBN0I7UUFDSSxPQUFPLE9BQU8sQ0FBQyxzQkFBc0IsQ0FBQyxDQUFDLE9BQU8sQ0FBQztJQUNuRCxDQUFDO0lBRWMsZ0NBQVksR0FBM0I7UUFDSSxPQUFPLE9BQU8sQ0FBQyxvQkFBb0IsQ0FBQyxDQUFDLE9BQU8sQ0FBQztJQUNqRCxDQUFDO0lBRWMsNEJBQVEsR0FBdkIsVUFBd0IsT0FBZSxFQUFFLElBQVU7UUFDL0MsSUFBSSxDQUFDLElBQUksQ0FBQyxnQkFBZ0IsRUFBRTtZQUN4QixPQUFPO1NBQ1Y7UUFFRCxJQUFJLE9BQU8sSUFBSSxLQUFLLFdBQVcsRUFBRTtZQUM3QixPQUFPLENBQUMsR0FBRyxDQUFDLG9CQUFrQixPQUFTLENBQUMsQ0FBQztZQUN6QyxPQUFPO1NBQ1Y7UUFFRCxPQUFPLENBQUMsR0FBRyxDQUFDLG9CQUFrQixPQUFTLEVBQUUsSUFBSSxDQUFDLENBQUM7SUFDbkQsQ0FBQztJQUVjLHdDQUFvQixHQUFuQztRQUFBLGlCQWNDO1FBYkcsSUFBSSxJQUFJLENBQUMsb0JBQW9CLEVBQUU7WUFDM0IsT0FBTztTQUNWO1FBRUQsSUFBSSxDQUFDLG9CQUFvQixHQUFHLElBQUksQ0FBQztRQUVqQyxJQUFJLEVBQUUsSUFBSSxFQUFFLENBQUMsSUFBSSxJQUFJLEVBQUUsQ0FBQyxJQUFJLENBQUMsRUFBRSxFQUFFO1lBQzdCLEVBQUUsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsVUFBVSxFQUFFO2dCQUMzQixLQUFJLENBQUMsV0FBVyxFQUFFLENBQUMsS0FBSyxDQUFDLFVBQUMsS0FBSztvQkFDM0IsT0FBTyxDQUFDLEtBQUssQ0FBQyxpQ0FBaUMsRUFBRSxLQUFLLENBQUMsQ0FBQztnQkFDNUQsQ0FBQyxDQUFDLENBQUM7WUFDUCxDQUFDLENBQUMsQ0FBQztTQUNOO0lBQ0wsQ0FBQztJQUVhLGtEQUE4QixHQUE1QztRQUNJLElBQUksQ0FBQyxrQkFBa0IsRUFBRSxDQUFDO1FBQzFCLElBQUksQ0FBQyxvQkFBb0IsRUFBRSxDQUFDO1FBQzVCLElBQUksQ0FBQyxJQUFJLENBQUMsZUFBZSxFQUFFLEVBQUU7WUFDekIsT0FBTztTQUNWO1FBRUQsSUFBSSxDQUFDLG9CQUFvQixHQUFHLElBQUksQ0FBQztRQUNqQyxJQUFJLENBQUMsbUJBQW1CLEdBQUcsSUFBSSxDQUFDLGdCQUFnQixDQUFDLElBQUksQ0FBQyxpQkFBaUIsRUFBRSxDQUFDLENBQUM7UUFDM0UsSUFBSSxDQUFDLGVBQWUsR0FBRyxLQUFLLENBQUM7UUFDN0IsSUFBSSxDQUFDLFFBQVEsQ0FBQyxvQ0FBb0MsRUFBRTtZQUNoRCxRQUFRLEVBQUUsSUFBSSxDQUFDLFdBQVcsRUFBRTtZQUM1QixNQUFNLEVBQUUsSUFBSSxDQUFDLFNBQVMsRUFBRTtTQUMzQixDQUFDLENBQUM7SUFDUCxDQUFDO0lBRW1CLGtDQUFjLEdBQWxDO3VDQUFzQyxPQUFPOzs7Ozt3QkFDekMsSUFBSSxDQUFDLGtCQUFrQixFQUFFLENBQUM7d0JBQzFCLElBQUksQ0FBQyxvQkFBb0IsRUFBRSxDQUFDO3dCQUM1QixJQUFJLENBQUMsSUFBSSxDQUFDLGVBQWUsRUFBRSxFQUFFOzRCQUN6QixzQkFBTzt5QkFDVjs7Ozt3QkFHeUIscUJBQU0sSUFBSSxDQUFDLGtCQUFrQixFQUFFLEVBQUE7O3dCQUEvQyxhQUFhLEdBQUcsU0FBK0I7d0JBQ3JELElBQUksYUFBYSxFQUFFOzRCQUNmLElBQUksQ0FBQyxRQUFRLENBQUMsdUJBQXVCLEVBQUUsYUFBYSxDQUFDLENBQUM7NEJBQ3RELElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxhQUFhLENBQUMsQ0FBQzt5QkFDM0M7NkJBQU07NEJBQ0gsT0FBTyxDQUFDLElBQUksQ0FBQywyRkFBMkYsQ0FBQyxDQUFDOzRCQUMxRyxJQUFJLENBQUMscUJBQXFCLEVBQUUsQ0FBQzt5QkFDaEM7Ozs7d0JBRUQsT0FBTyxDQUFDLEtBQUssQ0FBQyxvQ0FBb0MsRUFBRSxPQUFLLENBQUMsQ0FBQzs7O3dCQUUzRCxJQUFJLENBQUMsb0JBQW9CLEdBQUcsSUFBSSxDQUFDO3dCQUNqQyxJQUFJLENBQUMsbUJBQW1CLEdBQUcsSUFBSSxDQUFDLGdCQUFnQixDQUFDLElBQUksQ0FBQyxpQkFBaUIsRUFBRSxDQUFDLENBQUM7d0JBQzNFLElBQUksQ0FBQyxlQUFlLEdBQUcsS0FBSyxDQUFDOzs7Ozs7S0FFcEM7SUFFYSxpQ0FBYSxHQUEzQjtRQUFBLGlCQXVCQztRQXRCRyxJQUFJLENBQUMsa0JBQWtCLEVBQUUsQ0FBQztRQUMxQixJQUFJLENBQUMsb0JBQW9CLEVBQUUsQ0FBQztRQUM1QixJQUFJLENBQUMsSUFBSSxDQUFDLG9CQUFvQixJQUFJLENBQUMsSUFBSSxDQUFDLGVBQWUsRUFBRSxFQUFFO1lBQ3ZELE9BQU87U0FDVjtRQUVELElBQUksQ0FBQyxlQUFlLEdBQUcsSUFBSSxDQUFDO1FBQzVCLElBQUksQ0FBQyxRQUFRLENBQUMsMENBQTBDLEVBQUU7WUFDdEQsUUFBUSxFQUFFLElBQUksQ0FBQyxXQUFXLEVBQUU7WUFDNUIsTUFBTSxFQUFFLElBQUksQ0FBQyxTQUFTLEVBQUU7U0FDM0IsQ0FBQyxDQUFDO1FBRUgsSUFBSSxJQUFJLENBQUMsV0FBVyxFQUFFO1lBQ2xCLFlBQVksQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLENBQUM7U0FDbEM7UUFFRCxJQUFJLENBQUMsV0FBVyxHQUFHLFVBQVUsQ0FBQztZQUMxQixLQUFJLENBQUMsV0FBVyxHQUFHLElBQUksQ0FBQztZQUN4QixLQUFJLENBQUMsZUFBZSxFQUFFLENBQUMsS0FBSyxDQUFDLFVBQUMsS0FBSztnQkFDL0IsT0FBTyxDQUFDLEtBQUssQ0FBQywwQkFBMEIsRUFBRSxLQUFLLENBQUMsQ0FBQztZQUNyRCxDQUFDLENBQUMsQ0FBQztRQUNQLENBQUMsRUFBRSxHQUFHLENBQUMsQ0FBQztJQUNaLENBQUM7SUFFbUIsK0JBQVcsR0FBL0I7dUNBQW1DLE9BQU87Ozs7d0JBQ3RDLElBQUksQ0FBQyxrQkFBa0IsRUFBRSxDQUFDO3dCQUMxQixJQUFJLENBQUMsSUFBSSxDQUFDLG9CQUFvQixJQUFJLENBQUMsSUFBSSxDQUFDLGVBQWUsRUFBRSxJQUFJLENBQUMsSUFBSSxDQUFDLGVBQWUsRUFBRTs0QkFDaEYsc0JBQU87eUJBQ1Y7d0JBRUQsSUFBSSxJQUFJLENBQUMsV0FBVyxFQUFFOzRCQUNsQixZQUFZLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxDQUFDOzRCQUMvQixJQUFJLENBQUMsV0FBVyxHQUFHLElBQUksQ0FBQzt5QkFDM0I7d0JBRUQsSUFBSSxDQUFDLFFBQVEsQ0FBQywwQkFBMEIsRUFBRTs0QkFDdEMsUUFBUSxFQUFFLElBQUksQ0FBQyxXQUFXLEVBQUU7NEJBQzVCLE1BQU0sRUFBRSxJQUFJLENBQUMsU0FBUyxFQUFFO3lCQUMzQixDQUFDLENBQUM7d0JBQ0gscUJBQU0sSUFBSSxDQUFDLGVBQWUsQ0FBQyxJQUFJLENBQUMsRUFBQTs7d0JBQWhDLFNBQWdDLENBQUM7Ozs7O0tBQ3BDO0lBRWEsMkNBQXVCLEdBQXJDO1FBQ0ksT0FBTyxJQUFJLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQywwQkFBMEIsRUFBRSxDQUFDLENBQUMsQ0FBQztJQUMvRCxDQUFDO0lBRWEsMkNBQXVCLEdBQXJDLFVBQXNDLEtBQWE7UUFDL0MsSUFBTSxlQUFlLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDO1FBQ3ZELEVBQUUsQ0FBQyxHQUFHLENBQUMsWUFBWSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQywwQkFBMEIsQ0FBQyxFQUFFLGVBQWUsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxDQUFDO0lBQ2hILENBQUM7SUFFYSx5Q0FBcUIsR0FBbkMsVUFBb0MsTUFBVTtRQUFWLHVCQUFBLEVBQUEsVUFBVTtRQUMxQyxJQUFJLE1BQU0sSUFBSSxDQUFDLEVBQUU7WUFDYixPQUFPO1NBQ1Y7UUFFRCxJQUFNLFNBQVMsR0FBRyxJQUFJLENBQUMsdUJBQXVCLEVBQUUsR0FBRyxNQUFNLENBQUM7UUFDMUQsSUFBSSxDQUFDLHVCQUF1QixDQUFDLFNBQVMsQ0FBQyxDQUFDO1FBQ3hDLElBQUksQ0FBQyxhQUFhLEVBQUUsQ0FBQztJQUN6QixDQUFDO0lBRW9CLG1DQUFlLEdBQXBDLFVBQXFDLEtBQWE7UUFBYixzQkFBQSxFQUFBLGFBQWE7dUNBQUcsT0FBTzs7Ozs7d0JBQ3hELElBQUksQ0FBQyxJQUFJLENBQUMsZUFBZSxFQUFFLEVBQUU7NEJBQ3pCLHNCQUFPO3lCQUNWO3dCQUVLLE9BQU8sR0FBRyxJQUFJLENBQUMsaUJBQWlCLEVBQUUsQ0FBQzt3QkFDbkMsaUJBQWlCLEdBQUcsSUFBSSxDQUFDLGdCQUFnQixDQUFDLE9BQU8sQ0FBQyxDQUFDO3dCQUN6RCxJQUFJLENBQUMsS0FBSyxJQUFJLGlCQUFpQixLQUFLLElBQUksQ0FBQyxtQkFBbUIsRUFBRTs0QkFDMUQsSUFBSSxDQUFDLFFBQVEsQ0FBQywwQ0FBMEMsQ0FBQyxDQUFDOzRCQUMxRCxzQkFBTzt5QkFDVjt3QkFFRCxJQUFJLENBQUMsUUFBUSxDQUFDLG1DQUFtQyxFQUFFOzRCQUMvQyxRQUFRLEVBQUUsSUFBSSxDQUFDLFdBQVcsRUFBRTs0QkFDNUIsTUFBTSxFQUFFLElBQUksQ0FBQyxTQUFTLEVBQUU7NEJBQ3hCLE9BQU8sU0FBQTs0QkFDUCxpQkFBaUIsbUJBQUE7eUJBQ3BCLENBQUMsQ0FBQzt3QkFFYyxxQkFBTSxJQUFJLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxRQUFRLEVBQUU7Z0NBQ2hELEtBQUssRUFBRSxrQkFBTTtnQ0FDYixRQUFRLEVBQUUsSUFBSSxDQUFDLFdBQVcsRUFBRTtnQ0FDNUIsUUFBUSxFQUFFLGlCQUFpQjs2QkFDOUIsQ0FBQyxFQUFBOzt3QkFKSSxRQUFRLEdBQUcsU0FJZjt3QkFDRixJQUFJLENBQUMsUUFBUSxDQUFDLHVCQUF1QixFQUFFLFFBQVEsQ0FBQyxDQUFDO3dCQUVqRCxJQUFJLENBQUMsbUJBQW1CLEdBQUcsaUJBQWlCLENBQUM7d0JBQzdDLElBQUksQ0FBQyxlQUFlLEdBQUcsS0FBSyxDQUFDOzs7OztLQUNoQztJQUVjLHFDQUFpQixHQUFoQztRQUNJLElBQU0sUUFBUSxHQUFHLElBQUksQ0FBQyxXQUFXLEVBQUUsQ0FBQztRQUNwQyxJQUFNLFNBQVMsR0FBRyxJQUFJLENBQUMsWUFBWSxFQUFFLENBQUM7UUFDdEMsSUFBTSxvQkFBb0IsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxDQUFDLFNBQVMsQ0FBQyxnQkFBZ0IsSUFBSSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztRQUNoRixJQUFNLHFCQUFxQixHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLENBQUMsU0FBUyxDQUFDLGdCQUFnQixJQUFJLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDO1FBQ2pGLE9BQU87WUFDSCxPQUFPLEVBQUUsQ0FBQztZQUNWLFNBQVMsRUFBRSxJQUFJLENBQUMsR0FBRyxFQUFFO1lBQ3JCLFdBQVcsRUFBRSxJQUFJLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxRQUFRLEVBQUUsUUFBUSxDQUFDLFdBQVcsQ0FBQztZQUNqRSxXQUFXLEVBQUUsSUFBSSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsZ0JBQWdCLEVBQUUsSUFBSSxDQUFDLGNBQWMsRUFBRSxDQUFDLFNBQVMsRUFBRSxDQUFDO1lBQ3RGLGNBQWMsRUFBRSxJQUFJLENBQUMsY0FBYyxDQUFDLElBQUksQ0FBQyxvQkFBb0IsRUFBRSxJQUFJLENBQUMsY0FBYyxFQUFFLENBQUMsWUFBWSxFQUFFLENBQUM7WUFDcEcsbUJBQW1CLEVBQUUsT0FBTyxTQUFTLENBQUMsY0FBYyxLQUFLLFFBQVEsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDLGNBQWMsQ0FBQyxDQUFDLENBQUMsU0FBUztZQUN4RyxTQUFTLEVBQUUsSUFBSSxDQUFDLGFBQWEsQ0FBQyxJQUFJLENBQUMsY0FBYyxFQUFFLFFBQVEsQ0FBQyxTQUFTLElBQUksQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO1lBQ25GLGVBQWUsRUFBRSxJQUFJLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxxQkFBcUIsRUFBRSxRQUFRLENBQUMsZUFBZSxJQUFJLENBQUMsQ0FBQztZQUMzRixTQUFTLEVBQUUsSUFBSSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsY0FBYyxFQUFFLFFBQVEsQ0FBQyxTQUFTLElBQUksQ0FBQyxDQUFDO1lBQ3hFLE1BQU0sRUFBRSxJQUFJLENBQUMsYUFBYSxDQUFDLElBQUksQ0FBQyxVQUFVLEVBQUUsUUFBUSxDQUFDLE1BQU0sSUFBSSxFQUFFLENBQUM7WUFDbEUsa0JBQWtCLEVBQUUsSUFBSSxDQUFDLGVBQWUsQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDO1lBQzFELHVCQUF1QixFQUFFLElBQUksQ0FBQyxlQUFlLENBQUMsSUFBSSxDQUFDLHlCQUF5QixDQUFDO1lBQzdFLHFCQUFxQixFQUFFLElBQUksQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLDRCQUE0QixDQUFDO1lBQ3pFLHNCQUFzQixFQUFFLElBQUksQ0FBQyxlQUFlLENBQUMsSUFBSSxDQUFDLHdCQUF3QixDQUFDO1lBQzNFLGVBQWUsRUFBRSxJQUFJLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxxQkFBcUIsQ0FBQztZQUM1RCxrQkFBa0IsRUFBRSxJQUFJLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyx3QkFBd0IsRUFBRSxDQUFDLENBQUM7WUFDckUsb0JBQW9CLEVBQUUsSUFBSSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsMEJBQTBCLEVBQUUsQ0FBQyxDQUFDO1lBQ3pFLGNBQWMsRUFBRSxJQUFJLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxXQUFXLEVBQUUsUUFBUSxDQUFDLGNBQWMsQ0FBQztZQUMxRSxlQUFlLEVBQUUsSUFBSSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMscUJBQXFCLEVBQUUsUUFBUSxDQUFDLGVBQWUsQ0FBQztZQUN0RixhQUFhLEVBQUUsSUFBSSxDQUFDLGFBQWEsQ0FBQyxJQUFJLENBQUMsa0JBQWtCLEVBQUUsUUFBUSxDQUFDLGFBQWEsSUFBSSxDQUFDLElBQUksRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxLQUFLLENBQUMsQ0FBQztZQUN4SCxXQUFXLEVBQUUsSUFBSSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsZ0JBQWdCLEVBQUUsUUFBUSxDQUFDLFdBQVcsQ0FBQztZQUN6RSxZQUFZLEVBQUUsSUFBSSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsaUJBQWlCLEVBQUUsUUFBUSxDQUFDLFlBQVksSUFBSSxvQkFBb0IsQ0FBQztZQUNwRyxhQUFhLEVBQUUsSUFBSSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsa0JBQWtCLEVBQUUsUUFBUSxDQUFDLGFBQWEsSUFBSSxxQkFBcUIsQ0FBQztZQUN4RyxVQUFVLEVBQUUsSUFBSSxDQUFDLGFBQWEsQ0FBQyxJQUFJLENBQUMsZUFBZSxFQUFFLFFBQVEsQ0FBQyxrQkFBa0IsRUFBRSxDQUFDO1NBQ3RGLENBQUM7SUFDTixDQUFDO0lBRW9CLHNDQUFrQixHQUF2Qzs7dUNBQTJDLE9BQU87Ozs7NEJBQzdCLHFCQUFNLElBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLE9BQU8sRUFBRTs0QkFDL0MsS0FBSyxFQUFFLGtCQUFNOzRCQUNiLFFBQVEsRUFBRSxJQUFJLENBQUMsV0FBVyxFQUFFO3lCQUMvQixDQUFDLEVBQUE7O3dCQUhJLFFBQVEsR0FBRyxTQUdmO3dCQUNGLElBQUksQ0FBQyxRQUFRLENBQUMsc0JBQXNCLEVBQUUsUUFBUSxDQUFDLENBQUM7d0JBRTFDLFVBQVUscUJBQUcsUUFBUSxhQUFSLFFBQVEsdUJBQVIsUUFBUSxDQUFFLElBQUksMENBQUUsUUFBUSxtQ0FBSSxRQUFRLGFBQVIsUUFBUSx1QkFBUixRQUFRLENBQUUsUUFBUSxtQ0FBSSxJQUFJLENBQUM7d0JBQzFFLElBQUksQ0FBQyxVQUFVLEVBQUU7NEJBQ2IsSUFBSSxDQUFDLFFBQVEsQ0FBQyxxQ0FBcUMsRUFBRTtnQ0FDakQsUUFBUSxFQUFFLElBQUksQ0FBQyxXQUFXLEVBQUU7Z0NBQzVCLE1BQU0sRUFBRSxJQUFJLENBQUMsU0FBUyxFQUFFO2dDQUN4QixVQUFVLFlBQUE7NkJBQ2IsQ0FBQyxDQUFDOzRCQUNILHNCQUFPLElBQUksRUFBQzt5QkFDZjt3QkFFRyxhQUFhLEdBQVEsVUFBVSxDQUFDO3dCQUNwQyxJQUFJLE9BQU8sVUFBVSxLQUFLLFFBQVEsRUFBRTs0QkFDMUIsY0FBYyxHQUFHLFVBQVUsQ0FBQyxJQUFJLEVBQUUsQ0FBQzs0QkFDekMsSUFBSSxDQUFDLGNBQWMsRUFBRTtnQ0FDakIsc0JBQU8sSUFBSSxFQUFDOzZCQUNmOzRCQUVELElBQUk7Z0NBQ0EsYUFBYSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsY0FBYyxDQUFDLENBQUM7NkJBQzlDOzRCQUFDLE9BQU8sS0FBSyxFQUFFO2dDQUNaLE9BQU8sQ0FBQyxLQUFLLENBQUMsZ0NBQWdDLEVBQUUsS0FBSyxDQUFDLENBQUM7Z0NBQ3ZELHNCQUFPLElBQUksRUFBQzs2QkFDZjt5QkFDSjt3QkFFRCxJQUFJLENBQUMsYUFBYSxJQUFJLE9BQU8sYUFBYSxLQUFLLFFBQVEsRUFBRTs0QkFDckQsc0JBQU8sSUFBSSxFQUFDO3lCQUNmO3dCQUVELHNCQUFPLGFBQXNDLEVBQUM7Ozs7S0FDakQ7SUFFYyx1Q0FBbUIsR0FBbEMsVUFBbUMsT0FBOEI7O1FBQzdELElBQU0sUUFBUSxHQUFHLElBQUksQ0FBQyxXQUFXLEVBQUUsQ0FBQztRQUNwQyxJQUFJLENBQUMsUUFBUSxDQUFDLGdDQUFnQyxFQUFFLE9BQU8sQ0FBQyxDQUFDO1FBRXpELElBQUksT0FBTyxPQUFPLENBQUMsV0FBVyxLQUFLLFFBQVEsSUFBSSxNQUFNLENBQUMsUUFBUSxDQUFDLE9BQU8sQ0FBQyxXQUFXLENBQUMsRUFBRTtZQUNqRixJQUFNLGNBQWMsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxJQUFJLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDO1lBQ3BFLEVBQUUsQ0FBQyxHQUFHLENBQUMsWUFBWSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsRUFBRSxjQUFjLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FBQztZQUN6RixRQUFRLENBQUMsV0FBVyxHQUFHLGNBQWMsQ0FBQztTQUN6QztRQUVELElBQUksT0FBTyxPQUFPLENBQUMsZUFBZSxLQUFLLFFBQVEsSUFBSSxNQUFNLENBQUMsUUFBUSxDQUFDLE9BQU8sQ0FBQyxlQUFlLENBQUMsRUFBRTtZQUN6RixJQUFNLG1CQUFtQixHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLGVBQWUsQ0FBQyxDQUFDLENBQUM7WUFDN0UsRUFBRSxDQUFDLEdBQUcsQ0FBQyxZQUFZLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLHFCQUFxQixDQUFDLEVBQUUsbUJBQW1CLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FBQztZQUMzRyxRQUFRLENBQUMsZUFBZSxHQUFHLG1CQUFtQixDQUFDO1NBQ2xEO1FBRUQsSUFBSSxPQUFPLE9BQU8sQ0FBQyxTQUFTLEtBQUssUUFBUSxJQUFJLE1BQU0sQ0FBQyxRQUFRLENBQUMsT0FBTyxDQUFDLFNBQVMsQ0FBQyxFQUFFO1lBQzdFLElBQU0sbUJBQW1CLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQztZQUN2RSxFQUFFLENBQUMsR0FBRyxDQUFDLFlBQVksQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsY0FBYyxDQUFDLEVBQUUsbUJBQW1CLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FBQztZQUNwRyxRQUFRLENBQUMsU0FBUyxHQUFHLG1CQUFtQixDQUFDO1NBQzVDO1FBRUQsSUFBSSxPQUFPLE9BQU8sQ0FBQyxXQUFXLEtBQUssUUFBUSxJQUFJLE1BQU0sQ0FBQyxRQUFRLENBQUMsT0FBTyxDQUFDLFdBQVcsQ0FBQyxFQUFFO1lBQ2pGLElBQU0sZ0JBQWdCLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQztZQUN0RSxFQUFFLENBQUMsR0FBRyxDQUFDLFlBQVksQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsRUFBRSxnQkFBZ0IsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxDQUFDO1lBQ25HLElBQUksQ0FBQyxjQUFjLEVBQUUsQ0FBQyxVQUFVLENBQUMsZ0JBQWdCLENBQUMsQ0FBQztTQUN0RDtRQUVELElBQUksT0FBTyxDQUFDLGNBQWMsSUFBSSxPQUFPLE9BQU8sQ0FBQyxjQUFjLEtBQUssUUFBUSxJQUFJLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsY0FBYyxDQUFDLEVBQUU7WUFDaEgsRUFBRSxDQUFDLEdBQUcsQ0FBQyxZQUFZLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLG9CQUFvQixDQUFDLEVBQUUsSUFBSSxDQUFDLFNBQVMsQ0FBQyxPQUFPLENBQUMsY0FBYyxDQUFDLENBQUMsQ0FBQztZQUNsSCxJQUFJLENBQUMsY0FBYyxFQUFFLENBQUMsYUFBYSxDQUFDLE9BQU8sQ0FBQyxjQUFjLENBQUMsQ0FBQztTQUMvRDtRQUVELElBQUksT0FBTyxPQUFPLENBQUMsbUJBQW1CLEtBQUssUUFBUSxJQUFJLE9BQU8sQ0FBQyxtQkFBbUIsRUFBRTtZQUNoRixJQUFNLFNBQVMsR0FBRyxJQUFJLENBQUMsWUFBWSxFQUFFLENBQUM7WUFDdEMsU0FBUyxDQUFDLGNBQWMsR0FBRyxPQUFPLENBQUMsbUJBQW1CLENBQUM7WUFDdkQsU0FBUyxDQUFDLElBQUksRUFBRSxDQUFDO1NBQ3BCO1FBRUQsSUFBSSxLQUFLLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxTQUFTLENBQUMsRUFBRTtZQUNsQyxJQUFNLG1CQUFtQixHQUFHLE9BQU8sQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLFVBQUMsS0FBSyxJQUFLLE9BQUEsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBM0MsQ0FBMkMsQ0FBQyxDQUFDO1lBQzFHLEVBQUUsQ0FBQyxHQUFHLENBQUMsWUFBWSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQyxjQUFjLENBQUMsRUFBRSxJQUFJLENBQUMsU0FBUyxDQUFDLG1CQUFtQixDQUFDLENBQUMsQ0FBQztZQUN6RyxRQUFRLENBQUMsU0FBUyxHQUFHLG1CQUFtQixDQUFDO1NBQzVDO1FBRUQsSUFBSSxLQUFLLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsRUFBRTtZQUMvQixFQUFFLENBQUMsR0FBRyxDQUFDLFlBQVksQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLEVBQUUsSUFBSSxDQUFDLFNBQVMsQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQztZQUNoRyxRQUFRLENBQUMsTUFBTSxHQUFHLE9BQU8sQ0FBQyxNQUFNLENBQUM7U0FDcEM7UUFFRCxJQUFJLEtBQUssQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLGtCQUFrQixDQUFDLEVBQUU7WUFDM0MsRUFBRSxDQUFDLEdBQUcsQ0FBQyxZQUFZLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxFQUFFLElBQUksQ0FBQyxTQUFTLENBQUMsT0FBTyxDQUFDLGtCQUFrQixDQUFDLENBQUMsQ0FBQztTQUNoSDtRQUVELElBQUksS0FBSyxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsdUJBQXVCLENBQUMsRUFBRTtZQUNoRCxFQUFFLENBQUMsR0FBRyxDQUFDLFlBQVksQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMseUJBQXlCLENBQUMsRUFBRSxJQUFJLENBQUMsU0FBUyxDQUFDLE9BQU8sQ0FBQyx1QkFBdUIsQ0FBQyxDQUFDLENBQUM7U0FDbkk7UUFFRCxJQUFJLE9BQU8sT0FBTyxDQUFDLHFCQUFxQixLQUFLLFFBQVEsRUFBRTtZQUNuRCxFQUFFLENBQUMsR0FBRyxDQUFDLFlBQVksQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsNEJBQTRCLENBQUMsRUFBRSxPQUFPLENBQUMscUJBQXFCLENBQUMsQ0FBQztTQUNwSDtRQUVELElBQUksS0FBSyxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsc0JBQXNCLENBQUMsRUFBRTtZQUMvQyxFQUFFLENBQUMsR0FBRyxDQUFDLFlBQVksQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsd0JBQXdCLENBQUMsRUFBRSxJQUFJLENBQUMsU0FBUyxDQUFDLE9BQU8sQ0FBQyxzQkFBc0IsQ0FBQyxDQUFDLENBQUM7U0FDakk7UUFFRCxJQUFJLE9BQU8sT0FBTyxDQUFDLGVBQWUsS0FBSyxRQUFRLEVBQUU7WUFDN0MsRUFBRSxDQUFDLEdBQUcsQ0FBQyxZQUFZLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLHFCQUFxQixDQUFDLEVBQUUsT0FBTyxDQUFDLGVBQWUsQ0FBQyxDQUFDO1NBQ3ZHO1FBRUQsSUFBSSxPQUFPLE9BQU8sQ0FBQyxrQkFBa0IsS0FBSyxRQUFRLElBQUksTUFBTSxDQUFDLFFBQVEsQ0FBQyxPQUFPLENBQUMsa0JBQWtCLENBQUMsRUFBRTtZQUMvRixJQUFNLGlCQUFpQixHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLGtCQUFrQixDQUFDLENBQUMsQ0FBQztZQUM5RSxFQUFFLENBQUMsR0FBRyxDQUFDLFlBQVksQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsd0JBQXdCLENBQUMsRUFBRSxpQkFBaUIsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxDQUFDO1NBQy9HO1FBRUQsSUFBSSxPQUFPLE9BQU8sQ0FBQyxvQkFBb0IsS0FBSyxRQUFRLElBQUksTUFBTSxDQUFDLFFBQVEsQ0FBQyxPQUFPLENBQUMsb0JBQW9CLENBQUMsRUFBRTtZQUNuRyxJQUFNLHlCQUF5QixHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLG9CQUFvQixDQUFDLENBQUMsQ0FBQztZQUN4RixFQUFFLENBQUMsR0FBRyxDQUFDLFlBQVksQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsMEJBQTBCLENBQUMsRUFBRSx5QkFBeUIsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxDQUFDO1NBQ3pIO1FBRUQsSUFBSSxPQUFPLE9BQU8sQ0FBQyxjQUFjLEtBQUssUUFBUSxJQUFJLE1BQU0sQ0FBQyxRQUFRLENBQUMsT0FBTyxDQUFDLGNBQWMsQ0FBQyxFQUFFO1lBQ3ZGLElBQU0saUJBQWlCLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLEVBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsY0FBYyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ3hGLEVBQUUsQ0FBQyxHQUFHLENBQUMsWUFBWSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsRUFBRSxpQkFBaUIsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxDQUFDO1lBQy9GLFFBQVEsQ0FBQyxjQUFjLEdBQUcsaUJBQWlCLENBQUM7U0FDL0M7UUFFRCxJQUFJLE9BQU8sT0FBTyxDQUFDLGVBQWUsS0FBSyxRQUFRLElBQUksTUFBTSxDQUFDLFFBQVEsQ0FBQyxPQUFPLENBQUMsZUFBZSxDQUFDLEVBQUU7WUFDekYsSUFBTSxjQUFjLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsZUFBZSxDQUFDLENBQUMsQ0FBQztZQUN4RSxFQUFFLENBQUMsR0FBRyxDQUFDLFlBQVksQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMscUJBQXFCLENBQUMsRUFBRSxjQUFjLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FBQztZQUN0RyxRQUFRLENBQUMsZUFBZSxHQUFHLGNBQWMsQ0FBQztTQUM3QztRQUVELElBQUksS0FBSyxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsYUFBYSxDQUFDLEVBQUU7WUFDdEMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxZQUFZLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLGtCQUFrQixDQUFDLEVBQUUsSUFBSSxDQUFDLFNBQVMsQ0FBQyxPQUFPLENBQUMsYUFBYSxDQUFDLENBQUMsQ0FBQztZQUMvRyxRQUFRLENBQUMsYUFBYSxHQUFHLE9BQU8sQ0FBQyxhQUFhLENBQUM7U0FDbEQ7UUFFRCxJQUFJLE9BQU8sT0FBTyxDQUFDLFdBQVcsS0FBSyxRQUFRLElBQUksTUFBTSxDQUFDLFFBQVEsQ0FBQyxPQUFPLENBQUMsV0FBVyxDQUFDLEVBQUU7WUFDakYsSUFBTSxjQUFjLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQztZQUNwRSxFQUFFLENBQUMsR0FBRyxDQUFDLFlBQVksQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsRUFBRSxjQUFjLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FBQztZQUNqRyxRQUFRLENBQUMsV0FBVyxHQUFHLGNBQWMsQ0FBQztTQUN6QztRQUVELElBQUksT0FBTyxPQUFPLENBQUMsWUFBWSxLQUFLLFFBQVEsSUFBSSxNQUFNLENBQUMsUUFBUSxDQUFDLE9BQU8sQ0FBQyxZQUFZLENBQUMsRUFBRTtZQUNuRixJQUFNLHNCQUFzQixHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUM7WUFDN0UsRUFBRSxDQUFDLEdBQUcsQ0FBQyxZQUFZLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLGlCQUFpQixDQUFDLEVBQUUsc0JBQXNCLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FBQztZQUMxRyxRQUFRLENBQUMsWUFBWSxHQUFHLHNCQUFzQixDQUFDO1NBQ2xEO1FBRUQsSUFBSSxPQUFPLE9BQU8sQ0FBQyxhQUFhLEtBQUssUUFBUSxJQUFJLE1BQU0sQ0FBQyxRQUFRLENBQUMsT0FBTyxDQUFDLGFBQWEsQ0FBQyxFQUFFO1lBQ3JGLElBQU0sdUJBQXVCLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsYUFBYSxDQUFDLENBQUMsQ0FBQztZQUMvRSxFQUFFLENBQUMsR0FBRyxDQUFDLFlBQVksQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsa0JBQWtCLENBQUMsRUFBRSx1QkFBdUIsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxDQUFDO1lBQzVHLFFBQVEsQ0FBQyxhQUFhLEdBQUcsdUJBQXVCLENBQUM7U0FDcEQ7UUFFRCxJQUFJLEtBQUssQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLFVBQVUsQ0FBQyxFQUFFO1lBQ25DLEVBQUUsQ0FBQyxHQUFHLENBQUMsWUFBWSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQyxlQUFlLENBQUMsRUFBRSxJQUFJLENBQUMsU0FBUyxDQUFDLE9BQU8sQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDO1lBQ3pHLFFBQVEsQ0FBQyxtQkFBbUIsQ0FBQyxPQUFPLENBQUMsVUFBVSxDQUFDLENBQUM7U0FDcEQ7UUFFRCxRQUFRLENBQUMsV0FBVyxFQUFFLENBQUM7UUFDdkIsTUFBQSxRQUFRLENBQUMsZ0JBQWdCLCtDQUF6QixRQUFRLEVBQXNCO1FBQzlCLFFBQVEsQ0FBQyxhQUFhLEVBQUUsQ0FBQztRQUN6QixRQUFRLENBQUMsY0FBYyxFQUFFLENBQUM7UUFDMUIsUUFBUSxDQUFDLG9CQUFvQixFQUFFLENBQUM7UUFDaEMsUUFBUSxDQUFDLGtCQUFrQixFQUFFLENBQUM7UUFDOUIsSUFBSSxDQUFDLGNBQWMsRUFBRSxDQUFDLFlBQVksRUFBRSxDQUFDO1FBQ3JDLElBQUksQ0FBQyxRQUFRLENBQUMsMENBQTBDLEVBQUU7WUFDdEQsV0FBVyxFQUFFLFFBQVEsQ0FBQyxXQUFXO1lBQ2pDLE1BQU0sRUFBRSxRQUFRLENBQUMsTUFBTTtZQUN2QixjQUFjLEVBQUUsUUFBUSxDQUFDLGNBQWM7WUFDdkMsZUFBZSxFQUFFLFFBQVEsQ0FBQyxlQUFlO1lBQ3pDLGFBQWEsRUFBRSxRQUFRLENBQUMsYUFBYTtZQUNyQyxXQUFXLEVBQUUsUUFBUSxDQUFDLFdBQVc7U0FDcEMsQ0FBQyxDQUFDO1FBQ0gsRUFBRSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsYUFBYSxDQUFDLENBQUM7UUFDaEMsRUFBRSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsZUFBZSxDQUFDLENBQUM7UUFDbEMsRUFBRSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsQ0FBQztRQUNuQyxFQUFFLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxhQUFhLENBQUMsQ0FBQztJQUNwQyxDQUFDO0lBRWMseUNBQXFCLEdBQXBDOztRQUNJLElBQU0sUUFBUSxHQUFHLElBQUksQ0FBQyxXQUFXLEVBQUUsQ0FBQztRQUNwQyxJQUFJLENBQUMsUUFBUSxFQUFFO1lBQ1gsT0FBTztTQUNWO1FBRUQsUUFBUSxDQUFDLFdBQVcsRUFBRSxDQUFDO1FBQ3ZCLE1BQUEsUUFBUSxDQUFDLGdCQUFnQiwrQ0FBekIsUUFBUSxFQUFzQjtRQUM5QixRQUFRLENBQUMsYUFBYSxFQUFFLENBQUM7UUFDekIsTUFBQSxRQUFRLENBQUMsb0JBQW9CLCtDQUE3QixRQUFRLEVBQTBCO1FBQ2xDLE1BQUEsUUFBUSxDQUFDLGtCQUFrQiwrQ0FBM0IsUUFBUSxFQUF3QjtRQUNoQyxNQUFBLFFBQVEsQ0FBQyxnQkFBZ0IsK0NBQXpCLFFBQVEsRUFBc0I7UUFDOUIsTUFBQSxRQUFRLENBQUMsWUFBWSwrQ0FBckIsUUFBUSxFQUFrQjtRQUMxQixNQUFBLFFBQVEsQ0FBQyxjQUFjLCtDQUF2QixRQUFRLEVBQW9CO1FBRTVCLElBQUksQ0FBQyxRQUFRLENBQUMsOENBQThDLEVBQUU7WUFDMUQsUUFBUSxFQUFFLElBQUksQ0FBQyxXQUFXLEVBQUU7WUFDNUIsTUFBTSxFQUFFLElBQUksQ0FBQyxTQUFTLEVBQUU7WUFDeEIsV0FBVyxFQUFFLFFBQVEsQ0FBQyxXQUFXO1lBQ2pDLE1BQU0sRUFBRSxRQUFRLENBQUMsTUFBTTtTQUMxQixDQUFDLENBQUM7UUFFSCxFQUFFLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxhQUFhLENBQUMsQ0FBQztRQUNoQyxFQUFFLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxlQUFlLENBQUMsQ0FBQztJQUN0QyxDQUFDO0lBRWMsOEJBQVUsR0FBekIsVUFBMEIsT0FBZTtRQUNyQyxPQUFPLEVBQUUsQ0FBQyxHQUFHLENBQUMsWUFBWSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLE9BQU8sQ0FBQyxDQUFDLElBQUksRUFBRSxDQUFDO0lBQ3pFLENBQUM7SUFFYyw4QkFBVSxHQUF6QixVQUEwQixPQUFlLEVBQUUsWUFBb0I7UUFDM0QsSUFBTSxRQUFRLEdBQUcsRUFBRSxDQUFDLEdBQUcsQ0FBQyxZQUFZLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQztRQUN6RSxJQUFJLENBQUMsUUFBUSxFQUFFO1lBQ1gsT0FBTyxZQUFZLENBQUM7U0FDdkI7UUFFRCxJQUFNLFdBQVcsR0FBRyxRQUFRLENBQUMsUUFBUSxFQUFFLEVBQUUsQ0FBQyxDQUFDO1FBQzNDLE9BQU8sTUFBTSxDQUFDLEtBQUssQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQyxXQUFXLENBQUM7SUFDbEUsQ0FBQztJQUVhLG1DQUFlLEdBQTdCLFVBQThCLE9BQWUsRUFBRSxZQUFnQjtRQUFoQiw2QkFBQSxFQUFBLGdCQUFnQjtRQUMzRCxPQUFPLElBQUksQ0FBQyxVQUFVLENBQUMsT0FBTyxFQUFFLFlBQVksQ0FBQyxDQUFDO0lBQ2xELENBQUM7SUFFYyxpQ0FBYSxHQUE1QixVQUE2QixPQUFlLEVBQUUsWUFBbUI7UUFDN0QsSUFBTSxRQUFRLEdBQUcsRUFBRSxDQUFDLEdBQUcsQ0FBQyxZQUFZLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQztRQUN6RSxJQUFJLENBQUMsUUFBUSxFQUFFO1lBQ1gsT0FBTyxZQUFZLENBQUM7U0FDdkI7UUFFRCxJQUFJO1lBQ0EsSUFBTSxXQUFXLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUMsQ0FBQztZQUN6QyxPQUFPLEtBQUssQ0FBQyxPQUFPLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQyxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUMsWUFBWSxDQUFDO1NBQ2xFO1FBQUMsT0FBTyxLQUFLLEVBQUU7WUFDWixPQUFPLENBQUMsS0FBSyxDQUFDLHVDQUFxQyxPQUFPLE1BQUcsRUFBRSxLQUFLLENBQUMsQ0FBQztZQUN0RSxPQUFPLFlBQVksQ0FBQztTQUN2QjtJQUNMLENBQUM7SUFFYyxrQ0FBYyxHQUE3QixVQUE4QixPQUFlLEVBQUUsWUFBb0M7UUFDL0UsSUFBTSxRQUFRLEdBQUcsRUFBRSxDQUFDLEdBQUcsQ0FBQyxZQUFZLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQztRQUN6RSxJQUFJLENBQUMsUUFBUSxFQUFFO1lBQ1gsT0FBTyxZQUFZLENBQUM7U0FDdkI7UUFFRCxJQUFJO1lBQ0EsSUFBTSxXQUFXLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUMsQ0FBQztZQUN6QyxPQUFPLFdBQVcsSUFBSSxPQUFPLFdBQVcsS0FBSyxRQUFRLElBQUksQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLFdBQVcsQ0FBQztnQkFDaEYsQ0FBQyxDQUFDLFdBQVc7Z0JBQ2IsQ0FBQyxDQUFDLFlBQVksQ0FBQztTQUN0QjtRQUFDLE9BQU8sS0FBSyxFQUFFO1lBQ1osT0FBTyxDQUFDLEtBQUssQ0FBQyx3Q0FBc0MsT0FBTyxNQUFHLEVBQUUsS0FBSyxDQUFDLENBQUM7WUFDdkUsT0FBTyxZQUFZLENBQUM7U0FDdkI7SUFDTCxDQUFDO0lBRWMsbUNBQWUsR0FBOUIsVUFBK0IsT0FBZTtRQUMxQyxPQUFPLElBQUksQ0FBQyxhQUFhLENBQUMsT0FBTyxFQUFFLEVBQUUsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxVQUFDLEtBQUssSUFBSyxPQUFBLE9BQU8sS0FBSyxLQUFLLFFBQVEsRUFBekIsQ0FBeUIsQ0FBQyxDQUFDO0lBQ3hGLENBQUM7SUFFYyxvQ0FBZ0IsR0FBL0IsVUFBZ0MsT0FBOEI7UUFDMUQsSUFBSTtZQUNBLE9BQU8sSUFBSSxDQUFDLFNBQVMsQ0FBQyxPQUFPLENBQUMsQ0FBQztTQUNsQztRQUFDLE9BQU8sS0FBSyxFQUFFO1lBQ1osT0FBTyxDQUFDLEtBQUssQ0FBQyxxQ0FBcUMsRUFBRSxLQUFLLENBQUMsQ0FBQztZQUM1RCxPQUFPLElBQUksQ0FBQztTQUNmO0lBQ0wsQ0FBQztJQUVvQiw0QkFBUSxHQUE3QixVQUE4QixHQUFXLEVBQUUsSUFBUzt1Q0FBRyxPQUFPOztnQkFDMUQsc0JBQU8sSUFBSSxPQUFPLENBQUMsVUFBQyxPQUFPLEVBQUUsTUFBTTt3QkFDL0IsSUFBTSxHQUFHLEdBQUcsSUFBSSxjQUFjLEVBQUUsQ0FBQzt3QkFDakMsR0FBRyxDQUFDLElBQUksQ0FBQyxNQUFNLEVBQUUsR0FBRyxFQUFFLElBQUksQ0FBQyxDQUFDO3dCQUM1QixHQUFHLENBQUMsZ0JBQWdCLENBQUMsY0FBYyxFQUFFLGtCQUFrQixDQUFDLENBQUM7d0JBRXpELEdBQUcsQ0FBQyxNQUFNLEdBQUc7NEJBQ1QsSUFBSSxHQUFHLENBQUMsTUFBTSxJQUFJLEdBQUcsSUFBSSxHQUFHLENBQUMsTUFBTSxHQUFHLEdBQUcsRUFBRTtnQ0FDdkMsSUFBSTtvQ0FDQSxPQUFPLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQztpQ0FDekM7Z0NBQUMsT0FBTyxLQUFLLEVBQUU7b0NBQ1osTUFBTSxDQUFDLElBQUksS0FBSyxDQUFDLHVCQUFxQixLQUFLLENBQUMsT0FBUyxDQUFDLENBQUMsQ0FBQztpQ0FDM0Q7NkJBQ0o7aUNBQU07Z0NBQ0gsTUFBTSxDQUFDLElBQUksS0FBSyxDQUFDLGlCQUFlLEdBQUcsQ0FBQyxNQUFRLENBQUMsQ0FBQyxDQUFDOzZCQUNsRDt3QkFDTCxDQUFDLENBQUM7d0JBRUYsR0FBRyxDQUFDLE9BQU8sR0FBRyxjQUFNLE9BQUEsTUFBTSxDQUFDLElBQUksS0FBSyxDQUFDLHdCQUF3QixDQUFDLENBQUMsRUFBM0MsQ0FBMkMsQ0FBQzt3QkFDaEUsR0FBRyxDQUFDLFNBQVMsR0FBRyxjQUFNLE9BQUEsTUFBTSxDQUFDLElBQUksS0FBSyxDQUFDLHlCQUF5QixDQUFDLENBQUMsRUFBNUMsQ0FBNEMsQ0FBQzt3QkFFbkUsR0FBRyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7b0JBQ25DLENBQUMsQ0FBQyxFQUFDOzs7S0FDTjtJQXpqQnVCLG9DQUFnQixHQUFHLElBQUksQ0FBQztJQUN4Qiw0QkFBUSxHQUFHLGlEQUFpRCxDQUFDO0lBQzdELDJCQUFPLEdBQUcsZ0RBQWdELENBQUM7SUFFM0QsZ0NBQVksR0FBRyxjQUFjLENBQUM7SUFDOUIsK0JBQVcsR0FBRyxhQUFhLENBQUM7SUFFNUIsNEJBQVEsR0FBRyxhQUFhLENBQUM7SUFDekIseUNBQXFCLEdBQUcsaUJBQWlCLENBQUM7SUFDMUMsa0NBQWMsR0FBRyxXQUFXLENBQUM7SUFDN0IsOEJBQVUsR0FBRyxRQUFRLENBQUM7SUFDdEIsK0JBQVcsR0FBRyxpQkFBaUIsQ0FBQztJQUNoQyw2Q0FBeUIsR0FBRyxxQkFBcUIsQ0FBQztJQUNsRCxnREFBNEIsR0FBRyx1QkFBdUIsQ0FBQztJQUN2RCw0Q0FBd0IsR0FBRyxvQkFBb0IsQ0FBQztJQUNoRCx5Q0FBcUIsR0FBRyxpQkFBaUIsQ0FBQztJQUMxQyw0Q0FBd0IsR0FBRyxvQkFBb0IsQ0FBQztJQUNoRCw4Q0FBMEIsR0FBRyxzQkFBc0IsQ0FBQztJQUNwRCwrQkFBVyxHQUFHLFNBQVMsQ0FBQztJQUN4Qix5Q0FBcUIsR0FBRyxpQkFBaUIsQ0FBQztJQUMxQyxzQ0FBa0IsR0FBRyxlQUFlLENBQUM7SUFDckMsb0NBQWdCLEdBQUcsYUFBYSxDQUFDO0lBQ2pDLHFDQUFpQixHQUFHLGNBQWMsQ0FBQztJQUNuQyxzQ0FBa0IsR0FBRyxlQUFlLENBQUM7SUFDckMsbUNBQWUsR0FBRyxZQUFZLENBQUM7SUFDL0Isb0NBQWdCLEdBQUcsYUFBYSxDQUFDO0lBQ2pDLHdDQUFvQixHQUFHLGdCQUFnQixDQUFDO0lBQ3hDLGtDQUFjLEdBQUcsV0FBVyxDQUFDO0lBRXRDLHFDQUFpQixHQUFHLEVBQUUsQ0FBQztJQUN2Qix3Q0FBb0IsR0FBRyxLQUFLLENBQUM7SUFDN0IsdUNBQW1CLEdBQUcsRUFBRSxDQUFDO0lBQ3pCLCtCQUFXLEdBQVEsSUFBSSxDQUFDO0lBQ3hCLG1DQUFlLEdBQUcsS0FBSyxDQUFDO0lBQ3hCLHdDQUFvQixHQUFHLEtBQUssQ0FBQztJQXdoQmhELDBCQUFDO0NBM2pCRCxBQTJqQkMsSUFBQTtrQkEzakJvQixtQkFBbUIiLCJmaWxlIjoiIiwic291cmNlUm9vdCI6Ii8iLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBBUFBfSUQgfSBmcm9tIFwiLi4vQ29tbW9uL0FwcENvbmZpZ1wiO1xuXG5pbnRlcmZhY2UgUmVtb3RlVXNlckRhdGFQYXlsb2FkIHtcbiAgICB2ZXJzaW9uPzogbnVtYmVyO1xuICAgIHVwZGF0ZWRBdD86IG51bWJlcjtcbiAgICBjdXJyZW50R29sZD86IG51bWJlcjtcbiAgICBnYW1lMlNoZW5wbz86IG51bWJlcjtcbiAgICBnYW1lMkhlcm9UaWVycz86IHsgW2hlcm9JZDogc3RyaW5nXTogbnVtYmVyIH07XG4gICAgZ2FtZTJFcXVpcHBlZFNraW5JZD86IHN0cmluZztcbiAgICBpdGVtU3RvY2s/OiBudW1iZXJbXTtcbiAgICB0b3RhbEdvbGRFYXJuZWQ/OiBudW1iZXI7XG4gICAgYmVzdFNjb3JlPzogbnVtYmVyO1xuICAgIHNraWxscz86IGFueVtdO1xuICAgIGFjaGlldmVDbGFpbWVkTGlzdD86IG51bWJlcltdO1xuICAgIHdlZWtseVJld2FyZENsYWltZWRMaXN0PzogbnVtYmVyW107XG4gICAgd2Vla2x5UmV3YXJkV2Vla1N0YXJ0Pzogc3RyaW5nO1xuICAgIGRhaWx5UmV3YXJkQ2xhaW1lZExpc3Q/OiBudW1iZXJbXTtcbiAgICBkYWlseVJld2FyZERhdGU/OiBzdHJpbmc7XG4gICAgZGFpbHlPbmxpbmVNaW51dGVzPzogbnVtYmVyO1xuICAgIHRvdGFsQ29uc3VtZWRTdGFtaW5hPzogbnVtYmVyO1xuICAgIGN1cnJlbnRTdGFtaW5hPzogbnVtYmVyO1xuICAgIGxhc3RSZWNvdmVyVGltZT86IG51bWJlcjtcbiAgICB1bmxvY2tlZFJvbGVzPzogYm9vbGVhbltdO1xuICAgIGN1cnJlbnRSb2xlPzogbnVtYmVyO1xuICAgIGN1cnJlbnRMZXZlbD86IG51bWJlcjtcbiAgICB1bmxvY2tlZExldmVsPzogbnVtYmVyO1xuICAgIGxldmVsU3RhcnM/OiBudW1iZXJbXTtcbn1cblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgVXNlckRhdGFTeW5jTWFuYWdlciB7XG4gICAgcHJpdmF0ZSBzdGF0aWMgcmVhZG9ubHkgRU5BQkxFX0RFQlVHX0xPRyA9IHRydWU7XG4gICAgcHJpdmF0ZSBzdGF0aWMgcmVhZG9ubHkgU0FWRV9VUkwgPSBcImh0dHBzOi8vcGF5LnN6dmktYm8uY29tL3YxL3Rlc3RhcHAvU2F2ZVVzZXJEYXRhXCI7XG4gICAgcHJpdmF0ZSBzdGF0aWMgcmVhZG9ubHkgR0VUX1VSTCA9IFwiaHR0cHM6Ly9wYXkuc3p2aS1iby5jb20vdjEvdGVzdGFwcC9HZXRVc2VyRGF0YVwiO1xuXG4gICAgcHJpdmF0ZSBzdGF0aWMgcmVhZG9ubHkgVVNFUk5BTUVfS0VZID0gXCJTTFNfVVNFUk5BTUVcIjtcbiAgICBwcml2YXRlIHN0YXRpYyByZWFkb25seSBVU0VSX0lEX0tFWSA9IFwiU0xTX1VTRVJfSURcIjtcblxuICAgIHByaXZhdGUgc3RhdGljIHJlYWRvbmx5IEdPTERfS0VZID0gXCJDdXJyZW50R29sZFwiO1xuICAgIHByaXZhdGUgc3RhdGljIHJlYWRvbmx5IFRPVEFMX0dPTERfRUFSTkVEX0tFWSA9IFwiVG90YWxHb2xkRWFybmVkXCI7XG4gICAgcHJpdmF0ZSBzdGF0aWMgcmVhZG9ubHkgQkVTVF9TQ09SRV9LRVkgPSBcIkJlc3RTY29yZVwiO1xuICAgIHByaXZhdGUgc3RhdGljIHJlYWRvbmx5IFNLSUxMU19LRVkgPSBcIlNraWxsc1wiO1xuICAgIHByaXZhdGUgc3RhdGljIHJlYWRvbmx5IEFDSElFVkVfS0VZID0gXCJBY2hpZXZlc2NsYWltZWRcIjtcbiAgICBwcml2YXRlIHN0YXRpYyByZWFkb25seSBXRUVLTFlfUkVXQVJEX0NMQUlNRURfS0VZID0gXCJ3ZWVrbHlSZXdhcmRDbGFpbWVkXCI7XG4gICAgcHJpdmF0ZSBzdGF0aWMgcmVhZG9ubHkgV0VFS0xZX1JFV0FSRF9XRUVLX1NUQVJUX0tFWSA9IFwid2Vla2x5UmV3YXJkV2Vla1N0YXJ0XCI7XG4gICAgcHJpdmF0ZSBzdGF0aWMgcmVhZG9ubHkgREFJTFlfUkVXQVJEX0NMQUlNRURfS0VZID0gXCJkYWlseVJld2FyZENsYWltZWRcIjtcbiAgICBwcml2YXRlIHN0YXRpYyByZWFkb25seSBEQUlMWV9SRVdBUkRfREFURV9LRVkgPSBcImRhaWx5UmV3YXJkRGF0ZVwiO1xuICAgIHByaXZhdGUgc3RhdGljIHJlYWRvbmx5IERBSUxZX09OTElORV9NSU5VVEVTX0tFWSA9IFwiZGFpbHlPbmxpbmVNaW51dGVzXCI7XG4gICAgcHJpdmF0ZSBzdGF0aWMgcmVhZG9ubHkgVE9UQUxfQ09OU1VNRURfU1RBTUlOQV9LRVkgPSBcIlRvdGFsQ29uc3VtZWRTdGFtaW5hXCI7XG4gICAgcHJpdmF0ZSBzdGF0aWMgcmVhZG9ubHkgU1RBTUlOQV9LRVkgPSBcIlN0YW1pbmFcIjtcbiAgICBwcml2YXRlIHN0YXRpYyByZWFkb25seSBMQVNUX1JFQ09WRVJfVElNRV9LRVkgPSBcIkxhc3RSZWNvdmVyVGltZVwiO1xuICAgIHByaXZhdGUgc3RhdGljIHJlYWRvbmx5IFVOTE9DS0VEX1JPTEVTX0tFWSA9IFwiVW5sb2NrZWRSb2xlc1wiO1xuICAgIHByaXZhdGUgc3RhdGljIHJlYWRvbmx5IENVUlJFTlRfUk9MRV9LRVkgPSBcIkN1cnJlbnRSb2xlXCI7XG4gICAgcHJpdmF0ZSBzdGF0aWMgcmVhZG9ubHkgQ1VSUkVOVF9MRVZFTF9LRVkgPSBcIkN1cnJlbnRMZXZlbFwiO1xuICAgIHByaXZhdGUgc3RhdGljIHJlYWRvbmx5IFVOTE9DS0VEX0xFVkVMX0tFWSA9IFwiVW5sb2NrZWRMZXZlbFwiO1xuICAgIHByaXZhdGUgc3RhdGljIHJlYWRvbmx5IExFVkVMX1NUQVJTX0tFWSA9IFwiTGV2ZWxTdGFyc1wiO1xuICAgIHByaXZhdGUgc3RhdGljIHJlYWRvbmx5IEdBTUUyX1NIRU5QT19LRVkgPSBcIkdhbWUyU2hlbnBvXCI7XG4gICAgcHJpdmF0ZSBzdGF0aWMgcmVhZG9ubHkgR0FNRTJfSEVST19USUVSU19LRVkgPSBcIkdhbWUySGVyb1RpZXJzXCI7XG4gICAgcHJpdmF0ZSBzdGF0aWMgcmVhZG9ubHkgSVRFTV9TVE9DS19LRVkgPSBcIkl0ZW1TdG9ja1wiO1xuXG4gICAgcHJpdmF0ZSBzdGF0aWMgY3VycmVudFNlc3Npb25LZXkgPSBcIlwiO1xuICAgIHByaXZhdGUgc3RhdGljIGluaXRpYWxTeW5jQ29tcGxldGVkID0gZmFsc2U7XG4gICAgcHJpdmF0ZSBzdGF0aWMgbGFzdFVwbG9hZGVkUGF5bG9hZCA9IFwiXCI7XG4gICAgcHJpdmF0ZSBzdGF0aWMgdXBsb2FkVGltZXI6IGFueSA9IG51bGw7XG4gICAgcHJpdmF0ZSBzdGF0aWMgaGFzRGlydHlDaGFuZ2VzID0gZmFsc2U7XG4gICAgcHJpdmF0ZSBzdGF0aWMgbGlmZWN5Y2xlSW5pdGlhbGl6ZWQgPSBmYWxzZTtcblxuICAgIHByaXZhdGUgc3RhdGljIGVuc3VyZVNlc3Npb25TdGF0ZSgpOiB2b2lkIHtcbiAgICAgICAgY29uc3Qgc2Vzc2lvbktleSA9IGAke3RoaXMuZ2V0VXNlcm5hbWUoKSB8fCBcIlwifTo6JHt0aGlzLmdldFVzZXJJZCgpIHx8IFwiXCJ9YDtcbiAgICAgICAgaWYgKHNlc3Npb25LZXkgPT09IHRoaXMuY3VycmVudFNlc3Npb25LZXkpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMuY3VycmVudFNlc3Npb25LZXkgPSBzZXNzaW9uS2V5O1xuICAgICAgICB0aGlzLmluaXRpYWxTeW5jQ29tcGxldGVkID0gZmFsc2U7XG4gICAgICAgIHRoaXMubGFzdFVwbG9hZGVkUGF5bG9hZCA9IFwiXCI7XG4gICAgICAgIHRoaXMuaGFzRGlydHlDaGFuZ2VzID0gZmFsc2U7XG5cbiAgICAgICAgaWYgKHRoaXMudXBsb2FkVGltZXIpIHtcbiAgICAgICAgICAgIGNsZWFyVGltZW91dCh0aGlzLnVwbG9hZFRpbWVyKTtcbiAgICAgICAgICAgIHRoaXMudXBsb2FkVGltZXIgPSBudWxsO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBzdGF0aWMgZ2V0VXNlcm5hbWUoKTogc3RyaW5nIHwgbnVsbCB7XG4gICAgICAgIHJldHVybiBjYy5zeXMubG9jYWxTdG9yYWdlLmdldEl0ZW0odGhpcy5VU0VSTkFNRV9LRVkpO1xuICAgIH1cblxuICAgIHByaXZhdGUgc3RhdGljIGdldFVzZXJJZCgpOiBzdHJpbmcgfCBudWxsIHtcbiAgICAgICAgcmV0dXJuIGNjLnN5cy5sb2NhbFN0b3JhZ2UuZ2V0SXRlbSh0aGlzLlVTRVJfSURfS0VZKTtcbiAgICB9XG5cbiAgICBwcml2YXRlIHN0YXRpYyBnZXRTY29wZWRLZXkoYmFzZUtleTogc3RyaW5nKTogc3RyaW5nIHtcbiAgICAgICAgY29uc3QgdXNlcklkID0gdGhpcy5nZXRVc2VySWQoKTtcbiAgICAgICAgcmV0dXJuIHVzZXJJZCA/IGAke2Jhc2VLZXl9XyR7dXNlcklkfWAgOiBiYXNlS2V5O1xuICAgIH1cblxuICAgIHByaXZhdGUgc3RhdGljIGhhc0xvZ2luQ29udGV4dCgpOiBib29sZWFuIHtcbiAgICAgICAgcmV0dXJuICEhdGhpcy5nZXRVc2VybmFtZSgpO1xuICAgIH1cblxuICAgIHByaXZhdGUgc3RhdGljIGdldEdhbWVEYXRhKCk6IGFueSB7XG4gICAgICAgIHJldHVybiByZXF1aXJlKFwiLi4vTG9hZC9HYW1lRGF0YVwiKS5kZWZhdWx0O1xuICAgIH1cblxuICAgIHByaXZhdGUgc3RhdGljIGdldFN0YXRlQnJpZGdlKCk6IGFueSB7XG4gICAgICAgIHJldHVybiByZXF1aXJlKFwiLi4vZ2FtZTIvU3RhdGVCcmlkZ2VcIikuZGVmYXVsdDtcbiAgICB9XG5cbiAgICBwcml2YXRlIHN0YXRpYyBnZXRHYW1lU3RhdGUoKTogYW55IHtcbiAgICAgICAgcmV0dXJuIHJlcXVpcmUoXCIuLi9nYW1lMi9HYW1lU3RhdGVcIikuZGVmYXVsdDtcbiAgICB9XG5cbiAgICBwcml2YXRlIHN0YXRpYyBsb2dEZWJ1ZyhtZXNzYWdlOiBzdHJpbmcsIGRhdGE/OiBhbnkpOiB2b2lkIHtcbiAgICAgICAgaWYgKCF0aGlzLkVOQUJMRV9ERUJVR19MT0cpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICh0eXBlb2YgZGF0YSA9PT0gXCJ1bmRlZmluZWRcIikge1xuICAgICAgICAgICAgY29uc29sZS5sb2coYFtVc2VyRGF0YVN5bmNdICR7bWVzc2FnZX1gKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnNvbGUubG9nKGBbVXNlckRhdGFTeW5jXSAke21lc3NhZ2V9YCwgZGF0YSk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBzdGF0aWMgZW5zdXJlTGlmZWN5Y2xlSG9va3MoKTogdm9pZCB7XG4gICAgICAgIGlmICh0aGlzLmxpZmVjeWNsZUluaXRpYWxpemVkKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLmxpZmVjeWNsZUluaXRpYWxpemVkID0gdHJ1ZTtcblxuICAgICAgICBpZiAoY2MgJiYgY2MuZ2FtZSAmJiBjYy5nYW1lLm9uKSB7XG4gICAgICAgICAgICBjYy5nYW1lLm9uKGNjLmdhbWUuRVZFTlRfSElERSwgKCkgPT4ge1xuICAgICAgICAgICAgICAgIHRoaXMuZmx1c2hVcGxvYWQoKS5jYXRjaCgoZXJyb3IpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5lcnJvcihcIkZsdXNoIHVzZXIgZGF0YSBvbiBoaWRlIGZhaWxlZDpcIiwgZXJyb3IpO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwdWJsaWMgc3RhdGljIGVuYWJsZVVwbG9hZHNGb3JDdXJyZW50U2Vzc2lvbigpOiB2b2lkIHtcbiAgICAgICAgdGhpcy5lbnN1cmVTZXNzaW9uU3RhdGUoKTtcbiAgICAgICAgdGhpcy5lbnN1cmVMaWZlY3ljbGVIb29rcygpO1xuICAgICAgICBpZiAoIXRoaXMuaGFzTG9naW5Db250ZXh0KCkpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMuaW5pdGlhbFN5bmNDb21wbGV0ZWQgPSB0cnVlO1xuICAgICAgICB0aGlzLmxhc3RVcGxvYWRlZFBheWxvYWQgPSB0aGlzLnNlcmlhbGl6ZVBheWxvYWQodGhpcy5idWlsZExvY2FsUGF5bG9hZCgpKTtcbiAgICAgICAgdGhpcy5oYXNEaXJ0eUNoYW5nZXMgPSBmYWxzZTtcbiAgICAgICAgdGhpcy5sb2dEZWJ1ZyhcIkVuYWJsZSB1cGxvYWRzIGZvciBjdXJyZW50IHNlc3Npb25cIiwge1xuICAgICAgICAgICAgdXNlcm5hbWU6IHRoaXMuZ2V0VXNlcm5hbWUoKSxcbiAgICAgICAgICAgIHVzZXJJZDogdGhpcy5nZXRVc2VySWQoKVxuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBwdWJsaWMgc3RhdGljIGFzeW5jIHN5bmNGcm9tU2VydmVyKCk6IFByb21pc2U8dm9pZD4ge1xuICAgICAgICB0aGlzLmVuc3VyZVNlc3Npb25TdGF0ZSgpO1xuICAgICAgICB0aGlzLmVuc3VyZUxpZmVjeWNsZUhvb2tzKCk7XG4gICAgICAgIGlmICghdGhpcy5oYXNMb2dpbkNvbnRleHQoKSkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGNvbnN0IHJlbW90ZVBheWxvYWQgPSBhd2FpdCB0aGlzLmZldGNoUmVtb3RlUGF5bG9hZCgpO1xuICAgICAgICAgICAgaWYgKHJlbW90ZVBheWxvYWQpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmxvZ0RlYnVnKFwiUGFyc2VkIHJlbW90ZSBwYXlsb2FkXCIsIHJlbW90ZVBheWxvYWQpO1xuICAgICAgICAgICAgICAgIHRoaXMuYXBwbHlQYXlsb2FkVG9Mb2NhbChyZW1vdGVQYXlsb2FkKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgY29uc29sZS53YXJuKFwiR2V0VXNlckRhdGEgcmV0dXJuZWQgZW1wdHkganNvbmRhdGEsIHJlbG9hZGluZyBzY29wZWQgbG9jYWwgZGVmYXVsdHMgZm9yIGN1cnJlbnQgYWNjb3VudC5cIik7XG4gICAgICAgICAgICAgICAgdGhpcy5yZWxvYWRTY29wZWRMb2NhbERhdGEoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoXCJTeW5jIHVzZXIgZGF0YSBmcm9tIHNlcnZlciBmYWlsZWQ6XCIsIGVycm9yKTtcbiAgICAgICAgfSBmaW5hbGx5IHtcbiAgICAgICAgICAgIHRoaXMuaW5pdGlhbFN5bmNDb21wbGV0ZWQgPSB0cnVlO1xuICAgICAgICAgICAgdGhpcy5sYXN0VXBsb2FkZWRQYXlsb2FkID0gdGhpcy5zZXJpYWxpemVQYXlsb2FkKHRoaXMuYnVpbGRMb2NhbFBheWxvYWQoKSk7XG4gICAgICAgICAgICB0aGlzLmhhc0RpcnR5Q2hhbmdlcyA9IGZhbHNlO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHVibGljIHN0YXRpYyByZXF1ZXN0VXBsb2FkKCk6IHZvaWQge1xuICAgICAgICB0aGlzLmVuc3VyZVNlc3Npb25TdGF0ZSgpO1xuICAgICAgICB0aGlzLmVuc3VyZUxpZmVjeWNsZUhvb2tzKCk7XG4gICAgICAgIGlmICghdGhpcy5pbml0aWFsU3luY0NvbXBsZXRlZCB8fCAhdGhpcy5oYXNMb2dpbkNvbnRleHQoKSkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5oYXNEaXJ0eUNoYW5nZXMgPSB0cnVlO1xuICAgICAgICB0aGlzLmxvZ0RlYnVnKFwiTWFyayB1c2VyIGRhdGEgZGlydHkgYW5kIHNjaGVkdWxlIHVwbG9hZFwiLCB7XG4gICAgICAgICAgICB1c2VybmFtZTogdGhpcy5nZXRVc2VybmFtZSgpLFxuICAgICAgICAgICAgdXNlcklkOiB0aGlzLmdldFVzZXJJZCgpXG4gICAgICAgIH0pO1xuXG4gICAgICAgIGlmICh0aGlzLnVwbG9hZFRpbWVyKSB7XG4gICAgICAgICAgICBjbGVhclRpbWVvdXQodGhpcy51cGxvYWRUaW1lcik7XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLnVwbG9hZFRpbWVyID0gc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgICAgICB0aGlzLnVwbG9hZFRpbWVyID0gbnVsbDtcbiAgICAgICAgICAgIHRoaXMudXBsb2FkTG9jYWxEYXRhKCkuY2F0Y2goKGVycm9yKSA9PiB7XG4gICAgICAgICAgICAgICAgY29uc29sZS5lcnJvcihcIlVwbG9hZCB1c2VyIGRhdGEgZmFpbGVkOlwiLCBlcnJvcik7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSwgMzAwKTtcbiAgICB9XG5cbiAgICBwdWJsaWMgc3RhdGljIGFzeW5jIGZsdXNoVXBsb2FkKCk6IFByb21pc2U8dm9pZD4ge1xuICAgICAgICB0aGlzLmVuc3VyZVNlc3Npb25TdGF0ZSgpO1xuICAgICAgICBpZiAoIXRoaXMuaW5pdGlhbFN5bmNDb21wbGV0ZWQgfHwgIXRoaXMuaGFzTG9naW5Db250ZXh0KCkgfHwgIXRoaXMuaGFzRGlydHlDaGFuZ2VzKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBpZiAodGhpcy51cGxvYWRUaW1lcikge1xuICAgICAgICAgICAgY2xlYXJUaW1lb3V0KHRoaXMudXBsb2FkVGltZXIpO1xuICAgICAgICAgICAgdGhpcy51cGxvYWRUaW1lciA9IG51bGw7XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLmxvZ0RlYnVnKFwiRmx1c2ggdXBsb2FkIGltbWVkaWF0ZWx5XCIsIHtcbiAgICAgICAgICAgIHVzZXJuYW1lOiB0aGlzLmdldFVzZXJuYW1lKCksXG4gICAgICAgICAgICB1c2VySWQ6IHRoaXMuZ2V0VXNlcklkKClcbiAgICAgICAgfSk7XG4gICAgICAgIGF3YWl0IHRoaXMudXBsb2FkTG9jYWxEYXRhKHRydWUpO1xuICAgIH1cblxuICAgIHB1YmxpYyBzdGF0aWMgZ2V0VG90YWxDb25zdW1lZFN0YW1pbmEoKTogbnVtYmVyIHtcbiAgICAgICAgcmV0dXJuIHRoaXMucmVhZE51bWJlcih0aGlzLlRPVEFMX0NPTlNVTUVEX1NUQU1JTkFfS0VZLCAwKTtcbiAgICB9XG5cbiAgICBwdWJsaWMgc3RhdGljIHNldFRvdGFsQ29uc3VtZWRTdGFtaW5hKHZhbHVlOiBudW1iZXIpOiB2b2lkIHtcbiAgICAgICAgY29uc3Qgbm9ybWFsaXplZFZhbHVlID0gTWF0aC5tYXgoMCwgTWF0aC5mbG9vcih2YWx1ZSkpO1xuICAgICAgICBjYy5zeXMubG9jYWxTdG9yYWdlLnNldEl0ZW0odGhpcy5nZXRTY29wZWRLZXkodGhpcy5UT1RBTF9DT05TVU1FRF9TVEFNSU5BX0tFWSksIG5vcm1hbGl6ZWRWYWx1ZS50b1N0cmluZygpKTtcbiAgICB9XG5cbiAgICBwdWJsaWMgc3RhdGljIHJlY29yZENvbnN1bWVkU3RhbWluYShhbW91bnQgPSAxKTogdm9pZCB7XG4gICAgICAgIGlmIChhbW91bnQgPD0gMCkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgbmV4dFZhbHVlID0gdGhpcy5nZXRUb3RhbENvbnN1bWVkU3RhbWluYSgpICsgYW1vdW50O1xuICAgICAgICB0aGlzLnNldFRvdGFsQ29uc3VtZWRTdGFtaW5hKG5leHRWYWx1ZSk7XG4gICAgICAgIHRoaXMucmVxdWVzdFVwbG9hZCgpO1xuICAgIH1cblxuICAgIHByaXZhdGUgc3RhdGljIGFzeW5jIHVwbG9hZExvY2FsRGF0YShmb3JjZSA9IGZhbHNlKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgICAgIGlmICghdGhpcy5oYXNMb2dpbkNvbnRleHQoKSkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgcGF5bG9hZCA9IHRoaXMuYnVpbGRMb2NhbFBheWxvYWQoKTtcbiAgICAgICAgY29uc3Qgc2VyaWFsaXplZFBheWxvYWQgPSB0aGlzLnNlcmlhbGl6ZVBheWxvYWQocGF5bG9hZCk7XG4gICAgICAgIGlmICghZm9yY2UgJiYgc2VyaWFsaXplZFBheWxvYWQgPT09IHRoaXMubGFzdFVwbG9hZGVkUGF5bG9hZCkge1xuICAgICAgICAgICAgdGhpcy5sb2dEZWJ1ZyhcIlNraXAgdXBsb2FkIGJlY2F1c2UgcGF5bG9hZCBpcyB1bmNoYW5nZWRcIik7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLmxvZ0RlYnVnKFwiVXBsb2FkaW5nIHBheWxvYWQgdG8gU2F2ZVVzZXJEYXRhXCIsIHtcbiAgICAgICAgICAgIHVzZXJuYW1lOiB0aGlzLmdldFVzZXJuYW1lKCksXG4gICAgICAgICAgICB1c2VySWQ6IHRoaXMuZ2V0VXNlcklkKCksXG4gICAgICAgICAgICBwYXlsb2FkLFxuICAgICAgICAgICAgc2VyaWFsaXplZFBheWxvYWRcbiAgICAgICAgfSk7XG5cbiAgICAgICAgY29uc3QgcmVzcG9uc2UgPSBhd2FpdCB0aGlzLnBvc3RKc29uKHRoaXMuU0FWRV9VUkwsIHtcbiAgICAgICAgICAgIGFwcGlkOiBBUFBfSUQsXG4gICAgICAgICAgICB1c2VybmFtZTogdGhpcy5nZXRVc2VybmFtZSgpLFxuICAgICAgICAgICAganNvbmRhdGE6IHNlcmlhbGl6ZWRQYXlsb2FkXG4gICAgICAgIH0pO1xuICAgICAgICB0aGlzLmxvZ0RlYnVnKFwiU2F2ZVVzZXJEYXRhIHJlc3BvbnNlXCIsIHJlc3BvbnNlKTtcblxuICAgICAgICB0aGlzLmxhc3RVcGxvYWRlZFBheWxvYWQgPSBzZXJpYWxpemVkUGF5bG9hZDtcbiAgICAgICAgdGhpcy5oYXNEaXJ0eUNoYW5nZXMgPSBmYWxzZTtcbiAgICB9XG5cbiAgICBwcml2YXRlIHN0YXRpYyBidWlsZExvY2FsUGF5bG9hZCgpOiBSZW1vdGVVc2VyRGF0YVBheWxvYWQge1xuICAgICAgICBjb25zdCBnYW1lRGF0YSA9IHRoaXMuZ2V0R2FtZURhdGEoKTtcbiAgICAgICAgY29uc3QgZ2FtZVN0YXRlID0gdGhpcy5nZXRHYW1lU3RhdGUoKTtcbiAgICAgICAgY29uc3QgZmFsbGJhY2tDdXJyZW50TGV2ZWwgPSBNYXRoLm1heCgxLCAoZ2FtZVN0YXRlLnNlbGVjdGVkTGV2ZWxJZHggfHwgMCkgKyAxKTtcbiAgICAgICAgY29uc3QgZmFsbGJhY2tVbmxvY2tlZExldmVsID0gTWF0aC5tYXgoMSwgKGdhbWVTdGF0ZS5tYXhVbmxvY2tlZExldmVsIHx8IDApICsgMSk7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICB2ZXJzaW9uOiAxLFxuICAgICAgICAgICAgdXBkYXRlZEF0OiBEYXRlLm5vdygpLFxuICAgICAgICAgICAgY3VycmVudEdvbGQ6IHRoaXMucmVhZE51bWJlcih0aGlzLkdPTERfS0VZLCBnYW1lRGF0YS5jdXJyZW50R29sZCksXG4gICAgICAgICAgICBnYW1lMlNoZW5wbzogdGhpcy5yZWFkTnVtYmVyKHRoaXMuR0FNRTJfU0hFTlBPX0tFWSwgdGhpcy5nZXRTdGF0ZUJyaWRnZSgpLmdldFNoZW5wbygpKSxcbiAgICAgICAgICAgIGdhbWUySGVyb1RpZXJzOiB0aGlzLnJlYWRKc29uT2JqZWN0KHRoaXMuR0FNRTJfSEVST19USUVSU19LRVksIHRoaXMuZ2V0U3RhdGVCcmlkZ2UoKS5nZXRIZXJvVGllcnMoKSksXG4gICAgICAgICAgICBnYW1lMkVxdWlwcGVkU2tpbklkOiB0eXBlb2YgZ2FtZVN0YXRlLmVxdWlwcGVkU2tpbklkID09PSBcInN0cmluZ1wiID8gZ2FtZVN0YXRlLmVxdWlwcGVkU2tpbklkIDogXCJTa2luXzAxXCIsXG4gICAgICAgICAgICBpdGVtU3RvY2s6IHRoaXMucmVhZEpzb25BcnJheSh0aGlzLklURU1fU1RPQ0tfS0VZLCBnYW1lRGF0YS5pdGVtU3RvY2sgfHwgWzAsIDAsIDBdKSxcbiAgICAgICAgICAgIHRvdGFsR29sZEVhcm5lZDogdGhpcy5yZWFkTnVtYmVyKHRoaXMuVE9UQUxfR09MRF9FQVJORURfS0VZLCBnYW1lRGF0YS50b3RhbEdvbGRFYXJuZWQgfHwgMCksXG4gICAgICAgICAgICBiZXN0U2NvcmU6IHRoaXMucmVhZE51bWJlcih0aGlzLkJFU1RfU0NPUkVfS0VZLCBnYW1lRGF0YS5CZXN0U2NvcmUgfHwgMCksXG4gICAgICAgICAgICBza2lsbHM6IHRoaXMucmVhZEpzb25BcnJheSh0aGlzLlNLSUxMU19LRVksIGdhbWVEYXRhLnNraWxscyB8fCBbXSksXG4gICAgICAgICAgICBhY2hpZXZlQ2xhaW1lZExpc3Q6IHRoaXMucmVhZE51bWJlckFycmF5KHRoaXMuQUNISUVWRV9LRVkpLFxuICAgICAgICAgICAgd2Vla2x5UmV3YXJkQ2xhaW1lZExpc3Q6IHRoaXMucmVhZE51bWJlckFycmF5KHRoaXMuV0VFS0xZX1JFV0FSRF9DTEFJTUVEX0tFWSksXG4gICAgICAgICAgICB3ZWVrbHlSZXdhcmRXZWVrU3RhcnQ6IHRoaXMucmVhZFN0cmluZyh0aGlzLldFRUtMWV9SRVdBUkRfV0VFS19TVEFSVF9LRVkpLFxuICAgICAgICAgICAgZGFpbHlSZXdhcmRDbGFpbWVkTGlzdDogdGhpcy5yZWFkTnVtYmVyQXJyYXkodGhpcy5EQUlMWV9SRVdBUkRfQ0xBSU1FRF9LRVkpLFxuICAgICAgICAgICAgZGFpbHlSZXdhcmREYXRlOiB0aGlzLnJlYWRTdHJpbmcodGhpcy5EQUlMWV9SRVdBUkRfREFURV9LRVkpLFxuICAgICAgICAgICAgZGFpbHlPbmxpbmVNaW51dGVzOiB0aGlzLnJlYWROdW1iZXIodGhpcy5EQUlMWV9PTkxJTkVfTUlOVVRFU19LRVksIDApLFxuICAgICAgICAgICAgdG90YWxDb25zdW1lZFN0YW1pbmE6IHRoaXMucmVhZE51bWJlcih0aGlzLlRPVEFMX0NPTlNVTUVEX1NUQU1JTkFfS0VZLCAwKSxcbiAgICAgICAgICAgIGN1cnJlbnRTdGFtaW5hOiB0aGlzLnJlYWROdW1iZXIodGhpcy5TVEFNSU5BX0tFWSwgZ2FtZURhdGEuY3VycmVudFN0YW1pbmEpLFxuICAgICAgICAgICAgbGFzdFJlY292ZXJUaW1lOiB0aGlzLnJlYWROdW1iZXIodGhpcy5MQVNUX1JFQ09WRVJfVElNRV9LRVksIGdhbWVEYXRhLmxhc3RSZWNvdmVyVGltZSksXG4gICAgICAgICAgICB1bmxvY2tlZFJvbGVzOiB0aGlzLnJlYWRKc29uQXJyYXkodGhpcy5VTkxPQ0tFRF9ST0xFU19LRVksIGdhbWVEYXRhLnVubG9ja2VkUm9sZXMgfHwgW3RydWUsIGZhbHNlLCBmYWxzZSwgZmFsc2UsIGZhbHNlXSksXG4gICAgICAgICAgICBjdXJyZW50Um9sZTogdGhpcy5yZWFkTnVtYmVyKHRoaXMuQ1VSUkVOVF9ST0xFX0tFWSwgZ2FtZURhdGEuY3VycmVudFJvbGUpLFxuICAgICAgICAgICAgY3VycmVudExldmVsOiB0aGlzLnJlYWROdW1iZXIodGhpcy5DVVJSRU5UX0xFVkVMX0tFWSwgZ2FtZURhdGEuY3VycmVudExldmVsIHx8IGZhbGxiYWNrQ3VycmVudExldmVsKSxcbiAgICAgICAgICAgIHVubG9ja2VkTGV2ZWw6IHRoaXMucmVhZE51bWJlcih0aGlzLlVOTE9DS0VEX0xFVkVMX0tFWSwgZ2FtZURhdGEudW5sb2NrZWRMZXZlbCB8fCBmYWxsYmFja1VubG9ja2VkTGV2ZWwpLFxuICAgICAgICAgICAgbGV2ZWxTdGFyczogdGhpcy5yZWFkSnNvbkFycmF5KHRoaXMuTEVWRUxfU1RBUlNfS0VZLCBnYW1lRGF0YS5nZXRMZXZlbFN0YXJzQXJyYXkoKSlcbiAgICAgICAgfTtcbiAgICB9XG5cbiAgICBwcml2YXRlIHN0YXRpYyBhc3luYyBmZXRjaFJlbW90ZVBheWxvYWQoKTogUHJvbWlzZTxSZW1vdGVVc2VyRGF0YVBheWxvYWQgfCBudWxsPiB7XG4gICAgICAgIGNvbnN0IHJlc3BvbnNlID0gYXdhaXQgdGhpcy5wb3N0SnNvbih0aGlzLkdFVF9VUkwsIHtcbiAgICAgICAgICAgIGFwcGlkOiBBUFBfSUQsXG4gICAgICAgICAgICB1c2VybmFtZTogdGhpcy5nZXRVc2VybmFtZSgpXG4gICAgICAgIH0pO1xuICAgICAgICB0aGlzLmxvZ0RlYnVnKFwiR2V0VXNlckRhdGEgcmVzcG9uc2VcIiwgcmVzcG9uc2UpO1xuXG4gICAgICAgIGNvbnN0IHJhd1BheWxvYWQgPSByZXNwb25zZT8uZGF0YT8uanNvbmRhdGEgPz8gcmVzcG9uc2U/Lmpzb25kYXRhID8/IG51bGw7XG4gICAgICAgIGlmICghcmF3UGF5bG9hZCkge1xuICAgICAgICAgICAgdGhpcy5sb2dEZWJ1ZyhcIkdldFVzZXJEYXRhIHJldHVybmVkIGVtcHR5IGpzb25kYXRhXCIsIHtcbiAgICAgICAgICAgICAgICB1c2VybmFtZTogdGhpcy5nZXRVc2VybmFtZSgpLFxuICAgICAgICAgICAgICAgIHVzZXJJZDogdGhpcy5nZXRVc2VySWQoKSxcbiAgICAgICAgICAgICAgICByYXdQYXlsb2FkXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICB9XG5cbiAgICAgICAgbGV0IHBhcnNlZFBheWxvYWQ6IGFueSA9IHJhd1BheWxvYWQ7XG4gICAgICAgIGlmICh0eXBlb2YgcmF3UGF5bG9hZCA9PT0gXCJzdHJpbmdcIikge1xuICAgICAgICAgICAgY29uc3QgdHJpbW1lZFBheWxvYWQgPSByYXdQYXlsb2FkLnRyaW0oKTtcbiAgICAgICAgICAgIGlmICghdHJpbW1lZFBheWxvYWQpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICBwYXJzZWRQYXlsb2FkID0gSlNPTi5wYXJzZSh0cmltbWVkUGF5bG9hZCk7XG4gICAgICAgICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoXCJQYXJzZSByZW1vdGUgdXNlciBkYXRhIGZhaWxlZDpcIiwgZXJyb3IpO1xuICAgICAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgaWYgKCFwYXJzZWRQYXlsb2FkIHx8IHR5cGVvZiBwYXJzZWRQYXlsb2FkICE9PSBcIm9iamVjdFwiKSB7XG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBwYXJzZWRQYXlsb2FkIGFzIFJlbW90ZVVzZXJEYXRhUGF5bG9hZDtcbiAgICB9XG5cbiAgICBwcml2YXRlIHN0YXRpYyBhcHBseVBheWxvYWRUb0xvY2FsKHBheWxvYWQ6IFJlbW90ZVVzZXJEYXRhUGF5bG9hZCk6IHZvaWQge1xuICAgICAgICBjb25zdCBnYW1lRGF0YSA9IHRoaXMuZ2V0R2FtZURhdGEoKTtcbiAgICAgICAgdGhpcy5sb2dEZWJ1ZyhcIkFwcGx5IHBheWxvYWQgdG8gbG9jYWwgc3RvcmFnZVwiLCBwYXlsb2FkKTtcblxuICAgICAgICBpZiAodHlwZW9mIHBheWxvYWQuY3VycmVudEdvbGQgPT09IFwibnVtYmVyXCIgJiYgTnVtYmVyLmlzRmluaXRlKHBheWxvYWQuY3VycmVudEdvbGQpKSB7XG4gICAgICAgICAgICBjb25zdCBub3JtYWxpemVkR29sZCA9IE1hdGgubWF4KDAsIE1hdGguZmxvb3IocGF5bG9hZC5jdXJyZW50R29sZCkpO1xuICAgICAgICAgICAgY2Muc3lzLmxvY2FsU3RvcmFnZS5zZXRJdGVtKHRoaXMuZ2V0U2NvcGVkS2V5KHRoaXMuR09MRF9LRVkpLCBub3JtYWxpemVkR29sZC50b1N0cmluZygpKTtcbiAgICAgICAgICAgIGdhbWVEYXRhLmN1cnJlbnRHb2xkID0gbm9ybWFsaXplZEdvbGQ7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAodHlwZW9mIHBheWxvYWQudG90YWxHb2xkRWFybmVkID09PSBcIm51bWJlclwiICYmIE51bWJlci5pc0Zpbml0ZShwYXlsb2FkLnRvdGFsR29sZEVhcm5lZCkpIHtcbiAgICAgICAgICAgIGNvbnN0IG5vcm1hbGl6ZWRUb3RhbEdvbGQgPSBNYXRoLm1heCgwLCBNYXRoLmZsb29yKHBheWxvYWQudG90YWxHb2xkRWFybmVkKSk7XG4gICAgICAgICAgICBjYy5zeXMubG9jYWxTdG9yYWdlLnNldEl0ZW0odGhpcy5nZXRTY29wZWRLZXkodGhpcy5UT1RBTF9HT0xEX0VBUk5FRF9LRVkpLCBub3JtYWxpemVkVG90YWxHb2xkLnRvU3RyaW5nKCkpO1xuICAgICAgICAgICAgZ2FtZURhdGEudG90YWxHb2xkRWFybmVkID0gbm9ybWFsaXplZFRvdGFsR29sZDtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICh0eXBlb2YgcGF5bG9hZC5iZXN0U2NvcmUgPT09IFwibnVtYmVyXCIgJiYgTnVtYmVyLmlzRmluaXRlKHBheWxvYWQuYmVzdFNjb3JlKSkge1xuICAgICAgICAgICAgY29uc3Qgbm9ybWFsaXplZEJlc3RTY29yZSA9IE1hdGgubWF4KDAsIE1hdGguZmxvb3IocGF5bG9hZC5iZXN0U2NvcmUpKTtcbiAgICAgICAgICAgIGNjLnN5cy5sb2NhbFN0b3JhZ2Uuc2V0SXRlbSh0aGlzLmdldFNjb3BlZEtleSh0aGlzLkJFU1RfU0NPUkVfS0VZKSwgbm9ybWFsaXplZEJlc3RTY29yZS50b1N0cmluZygpKTtcbiAgICAgICAgICAgIGdhbWVEYXRhLkJlc3RTY29yZSA9IG5vcm1hbGl6ZWRCZXN0U2NvcmU7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAodHlwZW9mIHBheWxvYWQuZ2FtZTJTaGVucG8gPT09IFwibnVtYmVyXCIgJiYgTnVtYmVyLmlzRmluaXRlKHBheWxvYWQuZ2FtZTJTaGVucG8pKSB7XG4gICAgICAgICAgICBjb25zdCBub3JtYWxpemVkU2hlbnBvID0gTWF0aC5tYXgoMCwgTWF0aC5mbG9vcihwYXlsb2FkLmdhbWUyU2hlbnBvKSk7XG4gICAgICAgICAgICBjYy5zeXMubG9jYWxTdG9yYWdlLnNldEl0ZW0odGhpcy5nZXRTY29wZWRLZXkodGhpcy5HQU1FMl9TSEVOUE9fS0VZKSwgbm9ybWFsaXplZFNoZW5wby50b1N0cmluZygpKTtcbiAgICAgICAgICAgIHRoaXMuZ2V0U3RhdGVCcmlkZ2UoKS5zYXZlU2hlbnBvKG5vcm1hbGl6ZWRTaGVucG8pO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHBheWxvYWQuZ2FtZTJIZXJvVGllcnMgJiYgdHlwZW9mIHBheWxvYWQuZ2FtZTJIZXJvVGllcnMgPT09IFwib2JqZWN0XCIgJiYgIUFycmF5LmlzQXJyYXkocGF5bG9hZC5nYW1lMkhlcm9UaWVycykpIHtcbiAgICAgICAgICAgIGNjLnN5cy5sb2NhbFN0b3JhZ2Uuc2V0SXRlbSh0aGlzLmdldFNjb3BlZEtleSh0aGlzLkdBTUUyX0hFUk9fVElFUlNfS0VZKSwgSlNPTi5zdHJpbmdpZnkocGF5bG9hZC5nYW1lMkhlcm9UaWVycykpO1xuICAgICAgICAgICAgdGhpcy5nZXRTdGF0ZUJyaWRnZSgpLnNhdmVIZXJvVGllcnMocGF5bG9hZC5nYW1lMkhlcm9UaWVycyk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAodHlwZW9mIHBheWxvYWQuZ2FtZTJFcXVpcHBlZFNraW5JZCA9PT0gXCJzdHJpbmdcIiAmJiBwYXlsb2FkLmdhbWUyRXF1aXBwZWRTa2luSWQpIHtcbiAgICAgICAgICAgIGNvbnN0IGdhbWVTdGF0ZSA9IHRoaXMuZ2V0R2FtZVN0YXRlKCk7XG4gICAgICAgICAgICBnYW1lU3RhdGUuZXF1aXBwZWRTa2luSWQgPSBwYXlsb2FkLmdhbWUyRXF1aXBwZWRTa2luSWQ7XG4gICAgICAgICAgICBnYW1lU3RhdGUuc2F2ZSgpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKEFycmF5LmlzQXJyYXkocGF5bG9hZC5pdGVtU3RvY2spKSB7XG4gICAgICAgICAgICBjb25zdCBub3JtYWxpemVkSXRlbVN0b2NrID0gcGF5bG9hZC5pdGVtU3RvY2subWFwKCh2YWx1ZSkgPT4gTWF0aC5tYXgoMCwgTWF0aC5mbG9vcihOdW1iZXIodmFsdWUpIHx8IDApKSk7XG4gICAgICAgICAgICBjYy5zeXMubG9jYWxTdG9yYWdlLnNldEl0ZW0odGhpcy5nZXRTY29wZWRLZXkodGhpcy5JVEVNX1NUT0NLX0tFWSksIEpTT04uc3RyaW5naWZ5KG5vcm1hbGl6ZWRJdGVtU3RvY2spKTtcbiAgICAgICAgICAgIGdhbWVEYXRhLml0ZW1TdG9jayA9IG5vcm1hbGl6ZWRJdGVtU3RvY2s7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoQXJyYXkuaXNBcnJheShwYXlsb2FkLnNraWxscykpIHtcbiAgICAgICAgICAgIGNjLnN5cy5sb2NhbFN0b3JhZ2Uuc2V0SXRlbSh0aGlzLmdldFNjb3BlZEtleSh0aGlzLlNLSUxMU19LRVkpLCBKU09OLnN0cmluZ2lmeShwYXlsb2FkLnNraWxscykpO1xuICAgICAgICAgICAgZ2FtZURhdGEuc2tpbGxzID0gcGF5bG9hZC5za2lsbHM7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoQXJyYXkuaXNBcnJheShwYXlsb2FkLmFjaGlldmVDbGFpbWVkTGlzdCkpIHtcbiAgICAgICAgICAgIGNjLnN5cy5sb2NhbFN0b3JhZ2Uuc2V0SXRlbSh0aGlzLmdldFNjb3BlZEtleSh0aGlzLkFDSElFVkVfS0VZKSwgSlNPTi5zdHJpbmdpZnkocGF5bG9hZC5hY2hpZXZlQ2xhaW1lZExpc3QpKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChBcnJheS5pc0FycmF5KHBheWxvYWQud2Vla2x5UmV3YXJkQ2xhaW1lZExpc3QpKSB7XG4gICAgICAgICAgICBjYy5zeXMubG9jYWxTdG9yYWdlLnNldEl0ZW0odGhpcy5nZXRTY29wZWRLZXkodGhpcy5XRUVLTFlfUkVXQVJEX0NMQUlNRURfS0VZKSwgSlNPTi5zdHJpbmdpZnkocGF5bG9hZC53ZWVrbHlSZXdhcmRDbGFpbWVkTGlzdCkpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHR5cGVvZiBwYXlsb2FkLndlZWtseVJld2FyZFdlZWtTdGFydCA9PT0gXCJzdHJpbmdcIikge1xuICAgICAgICAgICAgY2Muc3lzLmxvY2FsU3RvcmFnZS5zZXRJdGVtKHRoaXMuZ2V0U2NvcGVkS2V5KHRoaXMuV0VFS0xZX1JFV0FSRF9XRUVLX1NUQVJUX0tFWSksIHBheWxvYWQud2Vla2x5UmV3YXJkV2Vla1N0YXJ0KTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChBcnJheS5pc0FycmF5KHBheWxvYWQuZGFpbHlSZXdhcmRDbGFpbWVkTGlzdCkpIHtcbiAgICAgICAgICAgIGNjLnN5cy5sb2NhbFN0b3JhZ2Uuc2V0SXRlbSh0aGlzLmdldFNjb3BlZEtleSh0aGlzLkRBSUxZX1JFV0FSRF9DTEFJTUVEX0tFWSksIEpTT04uc3RyaW5naWZ5KHBheWxvYWQuZGFpbHlSZXdhcmRDbGFpbWVkTGlzdCkpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHR5cGVvZiBwYXlsb2FkLmRhaWx5UmV3YXJkRGF0ZSA9PT0gXCJzdHJpbmdcIikge1xuICAgICAgICAgICAgY2Muc3lzLmxvY2FsU3RvcmFnZS5zZXRJdGVtKHRoaXMuZ2V0U2NvcGVkS2V5KHRoaXMuREFJTFlfUkVXQVJEX0RBVEVfS0VZKSwgcGF5bG9hZC5kYWlseVJld2FyZERhdGUpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHR5cGVvZiBwYXlsb2FkLmRhaWx5T25saW5lTWludXRlcyA9PT0gXCJudW1iZXJcIiAmJiBOdW1iZXIuaXNGaW5pdGUocGF5bG9hZC5kYWlseU9ubGluZU1pbnV0ZXMpKSB7XG4gICAgICAgICAgICBjb25zdCBub3JtYWxpemVkTWludXRlcyA9IE1hdGgubWF4KDAsIE1hdGguZmxvb3IocGF5bG9hZC5kYWlseU9ubGluZU1pbnV0ZXMpKTtcbiAgICAgICAgICAgIGNjLnN5cy5sb2NhbFN0b3JhZ2Uuc2V0SXRlbSh0aGlzLmdldFNjb3BlZEtleSh0aGlzLkRBSUxZX09OTElORV9NSU5VVEVTX0tFWSksIG5vcm1hbGl6ZWRNaW51dGVzLnRvU3RyaW5nKCkpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHR5cGVvZiBwYXlsb2FkLnRvdGFsQ29uc3VtZWRTdGFtaW5hID09PSBcIm51bWJlclwiICYmIE51bWJlci5pc0Zpbml0ZShwYXlsb2FkLnRvdGFsQ29uc3VtZWRTdGFtaW5hKSkge1xuICAgICAgICAgICAgY29uc3Qgbm9ybWFsaXplZENvbnN1bWVkU3RhbWluYSA9IE1hdGgubWF4KDAsIE1hdGguZmxvb3IocGF5bG9hZC50b3RhbENvbnN1bWVkU3RhbWluYSkpO1xuICAgICAgICAgICAgY2Muc3lzLmxvY2FsU3RvcmFnZS5zZXRJdGVtKHRoaXMuZ2V0U2NvcGVkS2V5KHRoaXMuVE9UQUxfQ09OU1VNRURfU1RBTUlOQV9LRVkpLCBub3JtYWxpemVkQ29uc3VtZWRTdGFtaW5hLnRvU3RyaW5nKCkpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHR5cGVvZiBwYXlsb2FkLmN1cnJlbnRTdGFtaW5hID09PSBcIm51bWJlclwiICYmIE51bWJlci5pc0Zpbml0ZShwYXlsb2FkLmN1cnJlbnRTdGFtaW5hKSkge1xuICAgICAgICAgICAgY29uc3Qgbm9ybWFsaXplZFN0YW1pbmEgPSBNYXRoLm1heCgwLCBNYXRoLm1pbigzMCwgTWF0aC5mbG9vcihwYXlsb2FkLmN1cnJlbnRTdGFtaW5hKSkpO1xuICAgICAgICAgICAgY2Muc3lzLmxvY2FsU3RvcmFnZS5zZXRJdGVtKHRoaXMuZ2V0U2NvcGVkS2V5KHRoaXMuU1RBTUlOQV9LRVkpLCBub3JtYWxpemVkU3RhbWluYS50b1N0cmluZygpKTtcbiAgICAgICAgICAgIGdhbWVEYXRhLmN1cnJlbnRTdGFtaW5hID0gbm9ybWFsaXplZFN0YW1pbmE7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAodHlwZW9mIHBheWxvYWQubGFzdFJlY292ZXJUaW1lID09PSBcIm51bWJlclwiICYmIE51bWJlci5pc0Zpbml0ZShwYXlsb2FkLmxhc3RSZWNvdmVyVGltZSkpIHtcbiAgICAgICAgICAgIGNvbnN0IG5vcm1hbGl6ZWRUaW1lID0gTWF0aC5tYXgoMCwgTWF0aC5mbG9vcihwYXlsb2FkLmxhc3RSZWNvdmVyVGltZSkpO1xuICAgICAgICAgICAgY2Muc3lzLmxvY2FsU3RvcmFnZS5zZXRJdGVtKHRoaXMuZ2V0U2NvcGVkS2V5KHRoaXMuTEFTVF9SRUNPVkVSX1RJTUVfS0VZKSwgbm9ybWFsaXplZFRpbWUudG9TdHJpbmcoKSk7XG4gICAgICAgICAgICBnYW1lRGF0YS5sYXN0UmVjb3ZlclRpbWUgPSBub3JtYWxpemVkVGltZTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChBcnJheS5pc0FycmF5KHBheWxvYWQudW5sb2NrZWRSb2xlcykpIHtcbiAgICAgICAgICAgIGNjLnN5cy5sb2NhbFN0b3JhZ2Uuc2V0SXRlbSh0aGlzLmdldFNjb3BlZEtleSh0aGlzLlVOTE9DS0VEX1JPTEVTX0tFWSksIEpTT04uc3RyaW5naWZ5KHBheWxvYWQudW5sb2NrZWRSb2xlcykpO1xuICAgICAgICAgICAgZ2FtZURhdGEudW5sb2NrZWRSb2xlcyA9IHBheWxvYWQudW5sb2NrZWRSb2xlcztcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICh0eXBlb2YgcGF5bG9hZC5jdXJyZW50Um9sZSA9PT0gXCJudW1iZXJcIiAmJiBOdW1iZXIuaXNGaW5pdGUocGF5bG9hZC5jdXJyZW50Um9sZSkpIHtcbiAgICAgICAgICAgIGNvbnN0IG5vcm1hbGl6ZWRSb2xlID0gTWF0aC5tYXgoMCwgTWF0aC5mbG9vcihwYXlsb2FkLmN1cnJlbnRSb2xlKSk7XG4gICAgICAgICAgICBjYy5zeXMubG9jYWxTdG9yYWdlLnNldEl0ZW0odGhpcy5nZXRTY29wZWRLZXkodGhpcy5DVVJSRU5UX1JPTEVfS0VZKSwgbm9ybWFsaXplZFJvbGUudG9TdHJpbmcoKSk7XG4gICAgICAgICAgICBnYW1lRGF0YS5jdXJyZW50Um9sZSA9IG5vcm1hbGl6ZWRSb2xlO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHR5cGVvZiBwYXlsb2FkLmN1cnJlbnRMZXZlbCA9PT0gXCJudW1iZXJcIiAmJiBOdW1iZXIuaXNGaW5pdGUocGF5bG9hZC5jdXJyZW50TGV2ZWwpKSB7XG4gICAgICAgICAgICBjb25zdCBub3JtYWxpemVkQ3VycmVudExldmVsID0gTWF0aC5tYXgoMSwgTWF0aC5mbG9vcihwYXlsb2FkLmN1cnJlbnRMZXZlbCkpO1xuICAgICAgICAgICAgY2Muc3lzLmxvY2FsU3RvcmFnZS5zZXRJdGVtKHRoaXMuZ2V0U2NvcGVkS2V5KHRoaXMuQ1VSUkVOVF9MRVZFTF9LRVkpLCBub3JtYWxpemVkQ3VycmVudExldmVsLnRvU3RyaW5nKCkpO1xuICAgICAgICAgICAgZ2FtZURhdGEuY3VycmVudExldmVsID0gbm9ybWFsaXplZEN1cnJlbnRMZXZlbDtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICh0eXBlb2YgcGF5bG9hZC51bmxvY2tlZExldmVsID09PSBcIm51bWJlclwiICYmIE51bWJlci5pc0Zpbml0ZShwYXlsb2FkLnVubG9ja2VkTGV2ZWwpKSB7XG4gICAgICAgICAgICBjb25zdCBub3JtYWxpemVkVW5sb2NrZWRMZXZlbCA9IE1hdGgubWF4KDEsIE1hdGguZmxvb3IocGF5bG9hZC51bmxvY2tlZExldmVsKSk7XG4gICAgICAgICAgICBjYy5zeXMubG9jYWxTdG9yYWdlLnNldEl0ZW0odGhpcy5nZXRTY29wZWRLZXkodGhpcy5VTkxPQ0tFRF9MRVZFTF9LRVkpLCBub3JtYWxpemVkVW5sb2NrZWRMZXZlbC50b1N0cmluZygpKTtcbiAgICAgICAgICAgIGdhbWVEYXRhLnVubG9ja2VkTGV2ZWwgPSBub3JtYWxpemVkVW5sb2NrZWRMZXZlbDtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChBcnJheS5pc0FycmF5KHBheWxvYWQubGV2ZWxTdGFycykpIHtcbiAgICAgICAgICAgIGNjLnN5cy5sb2NhbFN0b3JhZ2Uuc2V0SXRlbSh0aGlzLmdldFNjb3BlZEtleSh0aGlzLkxFVkVMX1NUQVJTX0tFWSksIEpTT04uc3RyaW5naWZ5KHBheWxvYWQubGV2ZWxTdGFycykpO1xuICAgICAgICAgICAgZ2FtZURhdGEubG9hZExldmVsU3RhcnNBcnJheShwYXlsb2FkLmxldmVsU3RhcnMpO1xuICAgICAgICB9XG5cbiAgICAgICAgZ2FtZURhdGEuR2V0R29sZERhdGEoKTtcbiAgICAgICAgZ2FtZURhdGEuR2V0QmVzdFNjb3JlRGF0YT8uKCk7XG4gICAgICAgIGdhbWVEYXRhLkdldFNraWxsc0RhdGEoKTtcbiAgICAgICAgZ2FtZURhdGEuR2V0U3RhbWluYURhdGEoKTtcbiAgICAgICAgZ2FtZURhdGEuR2V0VW5sb2NrZWRSb2xlc0RhdGEoKTtcbiAgICAgICAgZ2FtZURhdGEuR2V0Q3VycmVudFJvbGVEYXRhKCk7XG4gICAgICAgIHRoaXMuZ2V0U3RhdGVCcmlkZ2UoKS5zeW5jT2xkVG9OZXcoKTtcbiAgICAgICAgdGhpcy5sb2dEZWJ1ZyhcIkxvY2FsIGRhdGEgYWZ0ZXIgYXBwbHlpbmcgcmVtb3RlIHBheWxvYWRcIiwge1xuICAgICAgICAgICAgY3VycmVudEdvbGQ6IGdhbWVEYXRhLmN1cnJlbnRHb2xkLFxuICAgICAgICAgICAgc2tpbGxzOiBnYW1lRGF0YS5za2lsbHMsXG4gICAgICAgICAgICBjdXJyZW50U3RhbWluYTogZ2FtZURhdGEuY3VycmVudFN0YW1pbmEsXG4gICAgICAgICAgICBsYXN0UmVjb3ZlclRpbWU6IGdhbWVEYXRhLmxhc3RSZWNvdmVyVGltZSxcbiAgICAgICAgICAgIHVubG9ja2VkUm9sZXM6IGdhbWVEYXRhLnVubG9ja2VkUm9sZXMsXG4gICAgICAgICAgICBjdXJyZW50Um9sZTogZ2FtZURhdGEuY3VycmVudFJvbGVcbiAgICAgICAgfSk7XG4gICAgICAgIGNjLmRpcmVjdG9yLmVtaXQoXCJnb2xkVXBkYXRlZFwiKTtcbiAgICAgICAgY2MuZGlyZWN0b3IuZW1pdChcInNoZW5wb1VwZGF0ZWRcIik7XG4gICAgICAgIGNjLmRpcmVjdG9yLmVtaXQoXCJzdGFtaW5hVXBkYXRlZFwiKTtcbiAgICAgICAgY2MuZGlyZWN0b3IuZW1pdChcInJvbGVVcGRhdGVkXCIpO1xuICAgIH1cblxuICAgIHByaXZhdGUgc3RhdGljIHJlbG9hZFNjb3BlZExvY2FsRGF0YSgpOiB2b2lkIHtcbiAgICAgICAgY29uc3QgZ2FtZURhdGEgPSB0aGlzLmdldEdhbWVEYXRhKCk7XG4gICAgICAgIGlmICghZ2FtZURhdGEpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIGdhbWVEYXRhLkdldEdvbGREYXRhKCk7XG4gICAgICAgIGdhbWVEYXRhLkdldEJlc3RTY29yZURhdGE/LigpO1xuICAgICAgICBnYW1lRGF0YS5HZXRTa2lsbHNEYXRhKCk7XG4gICAgICAgIGdhbWVEYXRhLkdldFVubG9ja2VkUm9sZXNEYXRhPy4oKTtcbiAgICAgICAgZ2FtZURhdGEuR2V0Q3VycmVudFJvbGVEYXRhPy4oKTtcbiAgICAgICAgZ2FtZURhdGEuR2V0SXRlbVN0b2NrRGF0YT8uKCk7XG4gICAgICAgIGdhbWVEYXRhLkdldExldmVsRGF0YT8uKCk7XG4gICAgICAgIGdhbWVEYXRhLkdldFN0YW1pbmFEYXRhPy4oKTtcblxuICAgICAgICB0aGlzLmxvZ0RlYnVnKFwiUmVsb2FkIHNjb3BlZCBsb2NhbCBkYXRhIGZvciBjdXJyZW50IGFjY291bnRcIiwge1xuICAgICAgICAgICAgdXNlcm5hbWU6IHRoaXMuZ2V0VXNlcm5hbWUoKSxcbiAgICAgICAgICAgIHVzZXJJZDogdGhpcy5nZXRVc2VySWQoKSxcbiAgICAgICAgICAgIGN1cnJlbnRHb2xkOiBnYW1lRGF0YS5jdXJyZW50R29sZCxcbiAgICAgICAgICAgIHNraWxsczogZ2FtZURhdGEuc2tpbGxzXG4gICAgICAgIH0pO1xuXG4gICAgICAgIGNjLmRpcmVjdG9yLmVtaXQoXCJnb2xkVXBkYXRlZFwiKTtcbiAgICAgICAgY2MuZGlyZWN0b3IuZW1pdChcInNoZW5wb1VwZGF0ZWRcIik7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBzdGF0aWMgcmVhZFN0cmluZyhiYXNlS2V5OiBzdHJpbmcpOiBzdHJpbmcge1xuICAgICAgICByZXR1cm4gY2Muc3lzLmxvY2FsU3RvcmFnZS5nZXRJdGVtKHRoaXMuZ2V0U2NvcGVkS2V5KGJhc2VLZXkpKSB8fCBcIlwiO1xuICAgIH1cblxuICAgIHByaXZhdGUgc3RhdGljIHJlYWROdW1iZXIoYmFzZUtleTogc3RyaW5nLCBkZWZhdWx0VmFsdWU6IG51bWJlcik6IG51bWJlciB7XG4gICAgICAgIGNvbnN0IHJhd1ZhbHVlID0gY2Muc3lzLmxvY2FsU3RvcmFnZS5nZXRJdGVtKHRoaXMuZ2V0U2NvcGVkS2V5KGJhc2VLZXkpKTtcbiAgICAgICAgaWYgKCFyYXdWYWx1ZSkge1xuICAgICAgICAgICAgcmV0dXJuIGRlZmF1bHRWYWx1ZTtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IHBhcnNlZFZhbHVlID0gcGFyc2VJbnQocmF3VmFsdWUsIDEwKTtcbiAgICAgICAgcmV0dXJuIE51bWJlci5pc05hTihwYXJzZWRWYWx1ZSkgPyBkZWZhdWx0VmFsdWUgOiBwYXJzZWRWYWx1ZTtcbiAgICB9XG5cbiAgICBwdWJsaWMgc3RhdGljIGdldFN0b3JlZE51bWJlcihiYXNlS2V5OiBzdHJpbmcsIGRlZmF1bHRWYWx1ZSA9IDApOiBudW1iZXIge1xuICAgICAgICByZXR1cm4gdGhpcy5yZWFkTnVtYmVyKGJhc2VLZXksIGRlZmF1bHRWYWx1ZSk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBzdGF0aWMgcmVhZEpzb25BcnJheShiYXNlS2V5OiBzdHJpbmcsIGRlZmF1bHRWYWx1ZTogYW55W10pOiBhbnlbXSB7XG4gICAgICAgIGNvbnN0IHJhd1ZhbHVlID0gY2Muc3lzLmxvY2FsU3RvcmFnZS5nZXRJdGVtKHRoaXMuZ2V0U2NvcGVkS2V5KGJhc2VLZXkpKTtcbiAgICAgICAgaWYgKCFyYXdWYWx1ZSkge1xuICAgICAgICAgICAgcmV0dXJuIGRlZmF1bHRWYWx1ZTtcbiAgICAgICAgfVxuXG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBjb25zdCBwYXJzZWRWYWx1ZSA9IEpTT04ucGFyc2UocmF3VmFsdWUpO1xuICAgICAgICAgICAgcmV0dXJuIEFycmF5LmlzQXJyYXkocGFyc2VkVmFsdWUpID8gcGFyc2VkVmFsdWUgOiBkZWZhdWx0VmFsdWU7XG4gICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKGBQYXJzZSBsb2NhbCBhcnJheSBkYXRhIGZhaWxlZCBmb3IgJHtiYXNlS2V5fTpgLCBlcnJvcik7XG4gICAgICAgICAgICByZXR1cm4gZGVmYXVsdFZhbHVlO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBzdGF0aWMgcmVhZEpzb25PYmplY3QoYmFzZUtleTogc3RyaW5nLCBkZWZhdWx0VmFsdWU6IHsgW2tleTogc3RyaW5nXTogYW55IH0pOiB7IFtrZXk6IHN0cmluZ106IGFueSB9IHtcbiAgICAgICAgY29uc3QgcmF3VmFsdWUgPSBjYy5zeXMubG9jYWxTdG9yYWdlLmdldEl0ZW0odGhpcy5nZXRTY29wZWRLZXkoYmFzZUtleSkpO1xuICAgICAgICBpZiAoIXJhd1ZhbHVlKSB7XG4gICAgICAgICAgICByZXR1cm4gZGVmYXVsdFZhbHVlO1xuICAgICAgICB9XG5cbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGNvbnN0IHBhcnNlZFZhbHVlID0gSlNPTi5wYXJzZShyYXdWYWx1ZSk7XG4gICAgICAgICAgICByZXR1cm4gcGFyc2VkVmFsdWUgJiYgdHlwZW9mIHBhcnNlZFZhbHVlID09PSBcIm9iamVjdFwiICYmICFBcnJheS5pc0FycmF5KHBhcnNlZFZhbHVlKVxuICAgICAgICAgICAgICAgID8gcGFyc2VkVmFsdWVcbiAgICAgICAgICAgICAgICA6IGRlZmF1bHRWYWx1ZTtcbiAgICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoYFBhcnNlIGxvY2FsIG9iamVjdCBkYXRhIGZhaWxlZCBmb3IgJHtiYXNlS2V5fTpgLCBlcnJvcik7XG4gICAgICAgICAgICByZXR1cm4gZGVmYXVsdFZhbHVlO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBzdGF0aWMgcmVhZE51bWJlckFycmF5KGJhc2VLZXk6IHN0cmluZyk6IG51bWJlcltdIHtcbiAgICAgICAgcmV0dXJuIHRoaXMucmVhZEpzb25BcnJheShiYXNlS2V5LCBbXSkuZmlsdGVyKCh2YWx1ZSkgPT4gdHlwZW9mIHZhbHVlID09PSBcIm51bWJlclwiKTtcbiAgICB9XG5cbiAgICBwcml2YXRlIHN0YXRpYyBzZXJpYWxpemVQYXlsb2FkKHBheWxvYWQ6IFJlbW90ZVVzZXJEYXRhUGF5bG9hZCk6IHN0cmluZyB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICByZXR1cm4gSlNPTi5zdHJpbmdpZnkocGF5bG9hZCk7XG4gICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKFwiU2VyaWFsaXplIHVzZXIgZGF0YSBwYXlsb2FkIGZhaWxlZDpcIiwgZXJyb3IpO1xuICAgICAgICAgICAgcmV0dXJuIFwie31cIjtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHByaXZhdGUgc3RhdGljIGFzeW5jIHBvc3RKc29uKHVybDogc3RyaW5nLCBkYXRhOiBhbnkpOiBQcm9taXNlPGFueT4ge1xuICAgICAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgICAgICAgY29uc3QgeGhyID0gbmV3IFhNTEh0dHBSZXF1ZXN0KCk7XG4gICAgICAgICAgICB4aHIub3BlbihcIlBPU1RcIiwgdXJsLCB0cnVlKTtcbiAgICAgICAgICAgIHhoci5zZXRSZXF1ZXN0SGVhZGVyKFwiQ29udGVudC1UeXBlXCIsIFwiYXBwbGljYXRpb24vanNvblwiKTtcblxuICAgICAgICAgICAgeGhyLm9ubG9hZCA9ICgpID0+IHtcbiAgICAgICAgICAgICAgICBpZiAoeGhyLnN0YXR1cyA+PSAyMDAgJiYgeGhyLnN0YXR1cyA8IDMwMCkge1xuICAgICAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZShKU09OLnBhcnNlKHhoci5yZXNwb25zZVRleHQpKTtcbiAgICAgICAgICAgICAgICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlamVjdChuZXcgRXJyb3IoYEpTT04gcGFyc2UgZXJyb3I6ICR7ZXJyb3IubWVzc2FnZX1gKSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICByZWplY3QobmV3IEVycm9yKGBIVFRQIGVycm9yOiAke3hoci5zdGF0dXN9YCkpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIHhoci5vbmVycm9yID0gKCkgPT4gcmVqZWN0KG5ldyBFcnJvcihcIk5ldHdvcmsgcmVxdWVzdCBmYWlsZWRcIikpO1xuICAgICAgICAgICAgeGhyLm9udGltZW91dCA9ICgpID0+IHJlamVjdChuZXcgRXJyb3IoXCJOZXR3b3JrIHJlcXVlc3QgdGltZW91dFwiKSk7XG5cbiAgICAgICAgICAgIHhoci5zZW5kKEpTT04uc3RyaW5naWZ5KGRhdGEpKTtcbiAgICAgICAgfSk7XG4gICAgfVxufVxuIl19