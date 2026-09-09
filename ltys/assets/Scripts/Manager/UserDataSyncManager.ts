import { APP_ID } from "../Common/AppConfig";

interface RemoteUserDataPayload {
    version?: number;
    updatedAt?: number;
    currentGold?: number;
    game2Shenpo?: number;
    game2HeroTiers?: { [heroId: string]: number };
    game2EquippedSkinId?: string;
    itemStock?: number[];
    totalGoldEarned?: number;
    skills?: any[];
    achieveClaimedList?: number[];
    weeklyRewardClaimedList?: number[];
    weeklyRewardWeekStart?: string;
    dailyRewardClaimedList?: number[];
    dailyRewardDate?: string;
    dailyOnlineMinutes?: number;
    totalConsumedStamina?: number;
    currentStamina?: number;
    lastRecoverTime?: number;
    unlockedRoles?: boolean[];
    currentRole?: number;
    bestDistance?: number;
    currentLevel?: number;
    unlockedLevel?: number;
    levelStars?: number[];
    failedLevels?: number[];
    thunderWarriorLevelGuideCompleted?: boolean;
    thunderWarriorRaceGuideCompleted?: boolean;
}

export interface PassLevelSettlementPayload {
    grantGold: number;
    targetBestStars: number;
}

export default class UserDataSyncManager {
    private static readonly ENABLE_DEBUG_LOG = true;
    private static readonly SAVE_URL = "https://pay.szvi-bo.com/v1/testapp/SaveUserData";
    private static readonly GET_URL = "https://pay.szvi-bo.com/v1/testapp/GetUserData";
    private static readonly PASS_LEVEL_URL = "https://pay.szvi-bo.com/v1/testapp/PassLevel";

    private static readonly USERNAME_KEY = "SLS_USERNAME";
    private static readonly USER_ID_KEY = "SLS_USER_ID";

    private static readonly GOLD_KEY = "CurrentGold";
    private static readonly TOTAL_GOLD_EARNED_KEY = "TotalGoldEarned";
    private static readonly SKILLS_KEY = "Skills";
    private static readonly ACHIEVE_KEY = "Achievesclaimed";
    private static readonly WEEKLY_REWARD_CLAIMED_KEY = "weeklyRewardClaimed";
    private static readonly WEEKLY_REWARD_WEEK_START_KEY = "weeklyRewardWeekStart";
    private static readonly DAILY_REWARD_CLAIMED_KEY = "dailyRewardClaimed";
    private static readonly DAILY_REWARD_DATE_KEY = "dailyRewardDate";
    private static readonly DAILY_ONLINE_MINUTES_KEY = "dailyOnlineMinutes";
    private static readonly TOTAL_CONSUMED_STAMINA_KEY = "TotalConsumedStamina";
    private static readonly STAMINA_KEY = "Stamina";
    private static readonly LAST_RECOVER_TIME_KEY = "LastRecoverTime";
    private static readonly UNLOCKED_ROLES_KEY = "UnlockedRoles";
    private static readonly CURRENT_ROLE_KEY = "CurrentRole";
    private static readonly BEST_DISTANCE_KEY = "BestDistance";
    private static readonly CURRENT_LEVEL_KEY = "CurrentLevel";
    private static readonly UNLOCKED_LEVEL_KEY = "UnlockedLevel";
    private static readonly LEVEL_STARS_KEY = "LevelStars";
    private static readonly THUNDER_WARRIOR_LEVEL_GUIDE_KEY = "ThunderWarriorLevelGuideCompleted";
    private static readonly THUNDER_WARRIOR_RACE_GUIDE_KEY = "ThunderWarriorRaceGuideCompleted";
    private static readonly GAME2_SHENPO_KEY = "Game2Shenpo";
    private static readonly GAME2_HERO_TIERS_KEY = "Game2HeroTiers";
    private static readonly ITEM_STOCK_KEY = "ItemStock";

    private static currentSessionKey = "";
    private static initialSyncCompleted = false;
    private static lastUploadedPayload = "";
    private static uploadTimer: any = null;
    private static hasDirtyChanges = false;
    private static pendingUploadAfterInitialSync = false;
    private static lifecycleInitialized = false;

    private static ensureSessionState(): void {
        const sessionKey = `${this.getUsername() || ""}::${this.getUserId() || ""}`;
        if (sessionKey === this.currentSessionKey) {
            return;
        }

        this.currentSessionKey = sessionKey;
        this.initialSyncCompleted = false;
        this.lastUploadedPayload = "";
        this.hasDirtyChanges = false;
        this.pendingUploadAfterInitialSync = false;

        if (this.uploadTimer) {
            clearTimeout(this.uploadTimer);
            this.uploadTimer = null;
        }
    }

    private static getUsername(): string | null {
        return cc.sys.localStorage.getItem(this.USERNAME_KEY);
    }

    private static getUserId(): string | null {
        return cc.sys.localStorage.getItem(this.USER_ID_KEY);
    }

    private static getScopedKey(baseKey: string): string {
        const userId = this.getUserId();
        return userId ? `${baseKey}_${userId}` : baseKey;
    }

    private static hasLoginContext(): boolean {
        return !!this.getUsername();
    }

    private static getGameData(): any {
        return require("../Load/GameData").default;
    }

    private static getStateBridge(): any {
        return require("../game/StateBridge").default;
    }

    private static getGameState(): any {
        return require("../game/GameState").default;
    }

    private static logDebug(message: string, data?: any): void {
        if (!this.ENABLE_DEBUG_LOG) {
            return;
        }

        if (typeof data === "undefined") {
            console.log(`[UserDataSync] ${message}`);
            return;
        }

        console.log(`[UserDataSync] ${message}`, data);
    }

    private static ensureLifecycleHooks(): void {
        if (this.lifecycleInitialized) {
            return;
        }

        this.lifecycleInitialized = true;

        if (cc && cc.game && cc.game.on) {
            cc.game.on(cc.game.EVENT_HIDE, () => {
                this.flushUpload().catch((error) => {
                    console.error("Flush user data on hide failed:", error);
                });
            });
        }
    }

    public static enableUploadsForCurrentSession(): void {
        this.ensureSessionState();
        this.ensureLifecycleHooks();
        if (!this.hasLoginContext()) {
            return;
        }

        this.initialSyncCompleted = true;
        this.lastUploadedPayload = this.serializePayload(this.buildLocalPayload());
        this.hasDirtyChanges = false;
        this.pendingUploadAfterInitialSync = false;
        this.logDebug("Enable uploads for current session", {
            username: this.getUsername(),
            userId: this.getUserId()
        });
    }

    public static async syncFromServer(): Promise<void> {
        this.ensureSessionState();
        this.ensureLifecycleHooks();
        if (!this.hasLoginContext()) {
            return;
        }

        try {
            const remotePayload = await this.fetchRemotePayload();
            if (remotePayload) {
                this.logDebug("Parsed remote payload", remotePayload);
                this.applyPayloadToLocal(remotePayload);
            } else {
                console.warn("GetUserData returned empty jsondata, reloading scoped local defaults for current account.");
                this.reloadScopedLocalData();
            }
        } catch (error) {
            console.error("Sync user data from server failed:", error);
        } finally {
            this.initialSyncCompleted = true;
            if (this.pendingUploadAfterInitialSync || this.hasDirtyChanges) {
                this.pendingUploadAfterInitialSync = false;
                this.hasDirtyChanges = true;
                try {
                    await this.uploadLocalData(true);
                } catch (error) {
                    console.error("Upload pending user data after sync failed:", error);
                }
            } else {
                this.lastUploadedPayload = this.serializePayload(this.buildLocalPayload());
                this.hasDirtyChanges = false;
            }
        }
    }

    public static requestUpload(): void {
        this.ensureSessionState();
        this.ensureLifecycleHooks();
        if (!this.hasLoginContext()) {
            return;
        }

        this.hasDirtyChanges = true;
        if (!this.initialSyncCompleted) {
            this.pendingUploadAfterInitialSync = true;
            this.logDebug("Queue upload until initial sync completes", {
                username: this.getUsername(),
                userId: this.getUserId()
            });
            return;
        }

        this.logDebug("Mark user data dirty and schedule upload", {
            username: this.getUsername(),
            userId: this.getUserId()
        });

        if (this.uploadTimer) {
            clearTimeout(this.uploadTimer);
        }

        this.uploadTimer = setTimeout(() => {
            this.uploadTimer = null;
            this.uploadLocalData().catch((error) => {
                console.error("Upload user data failed:", error);
            });
        }, 300);
    }

    public static async flushUpload(): Promise<void> {
        this.ensureSessionState();
        if (!this.initialSyncCompleted || !this.hasLoginContext() || !this.hasDirtyChanges) {
            return;
        }

        if (this.uploadTimer) {
            clearTimeout(this.uploadTimer);
            this.uploadTimer = null;
        }

        this.logDebug("Flush upload immediately", {
            username: this.getUsername(),
            userId: this.getUserId()
        });
        await this.uploadLocalData(true);
    }

    public static async postPassLevel(rank: number, star: number, settlement?: PassLevelSettlementPayload): Promise<any> {
        this.ensureSessionState();
        if (!this.hasLoginContext()) {
            throw new Error("PassLevel requires a logged-in user");
        }

        const normalizedRank = Math.max(1, Math.floor(Number(rank) || 1));
        const normalizedStar = Math.max(0, Math.floor(Number(star) || 0));
        const payload: any = {
            appid: APP_ID,
            username: this.getUsername(),
            rank: normalizedRank,
            star: normalizedStar
        };

        if (settlement) {
            const targetBestStars = Math.max(normalizedStar, Math.floor(Number(settlement.targetBestStars) || 0));
            const identity = this.getUserId() || this.getUsername() || "unknown";
            payload.level_id = normalizedRank;
            payload.target_best_stars = targetBestStars;
            payload.grant_gold = Math.max(0, Math.floor(Number(settlement.grantGold) || 0));
            payload.idempotency_key = `${identity}_${normalizedRank}_${targetBestStars}`;
        }

        this.logDebug("Uploading pass level payload", payload);
        const response = await this.postJson(this.PASS_LEVEL_URL, payload);
        this.logDebug("PassLevel response", response);
        this.ensureSuccessfulResponse(response, "PassLevel settlement failed");
        return response;
    }

    public static getTotalConsumedStamina(): number {
        return this.readNumber(this.TOTAL_CONSUMED_STAMINA_KEY, 0);
    }

    public static setTotalConsumedStamina(value: number): void {
        const normalizedValue = Math.max(0, Math.floor(value));
        cc.sys.localStorage.setItem(this.getScopedKey(this.TOTAL_CONSUMED_STAMINA_KEY), normalizedValue.toString());
    }

    public static recordConsumedStamina(amount = 1): void {
        if (amount <= 0) {
            return;
        }

        const nextValue = this.getTotalConsumedStamina() + amount;
        this.setTotalConsumedStamina(nextValue);
        this.requestUpload();
    }

    private static async uploadLocalData(force = false): Promise<void> {
        if (!this.hasLoginContext()) {
            return;
        }

        const payload = this.buildLocalPayload();
        const serializedPayload = this.serializePayload(payload);
        if (!force && serializedPayload === this.lastUploadedPayload) {
            this.logDebug("Skip upload because payload is unchanged");
            return;
        }

        this.logDebug("Uploading payload to SaveUserData", {
            username: this.getUsername(),
            userId: this.getUserId(),
            payload,
            serializedPayload
        });

        const response = await this.postJson(this.SAVE_URL, {
            appid: APP_ID,
            username: this.getUsername(),
            jsondata: serializedPayload
        });
        this.logDebug("SaveUserData response", response);
        this.ensureSuccessfulResponse(response, "SaveUserData failed");

        this.lastUploadedPayload = serializedPayload;
        this.hasDirtyChanges = false;
    }

    private static buildLocalPayload(): RemoteUserDataPayload {
        const gameData = this.getGameData();
        const gameState = this.getGameState();
        const progress = gameState.progress || {};
        const fallbackCurrentLevel = Math.max(1, gameState.selectedLevel || gameData.currentLevel || 1);
        const fallbackUnlockedLevel = Math.max(1, progress.unlocked_level || gameData.unlockedLevel || 1);
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
            bestDistance: this.readNumber(this.BEST_DISTANCE_KEY, gameData.bestDistance || gameData.BestScore || 0),
            currentLevel: this.readNumber(this.CURRENT_LEVEL_KEY, gameData.currentLevel || fallbackCurrentLevel),
            unlockedLevel: this.readNumber(this.UNLOCKED_LEVEL_KEY, gameData.unlockedLevel || fallbackUnlockedLevel),
            levelStars: this.readJsonArray(this.LEVEL_STARS_KEY, this.progressStarsToArray(progress.level_stars || gameData.levelStars || [])),
            failedLevels: this.getStateBridge().getFailedLevels(),
            thunderWarriorLevelGuideCompleted: this.readBoolean(this.THUNDER_WARRIOR_LEVEL_GUIDE_KEY),
            thunderWarriorRaceGuideCompleted: this.readBoolean(this.THUNDER_WARRIOR_RACE_GUIDE_KEY)
        };
    }

    private static async fetchRemotePayload(): Promise<RemoteUserDataPayload | null> {
        const response = await this.postJson(this.GET_URL, {
            appid: APP_ID,
            username: this.getUsername()
        });
        this.logDebug("GetUserData response", response);

        const rawPayload = response?.data?.jsondata ?? response?.jsondata ?? null;
        if (!rawPayload) {
            this.logDebug("GetUserData returned empty jsondata", {
                username: this.getUsername(),
                userId: this.getUserId(),
                rawPayload
            });
            return null;
        }

        let parsedPayload: any = rawPayload;
        if (typeof rawPayload === "string") {
            const trimmedPayload = rawPayload.trim();
            if (!trimmedPayload) {
                return null;
            }

            try {
                parsedPayload = JSON.parse(trimmedPayload);
            } catch (error) {
                console.error("Parse remote user data failed:", error);
                return null;
            }
        }

        if (!parsedPayload || typeof parsedPayload !== "object") {
            return null;
        }

        return parsedPayload as RemoteUserDataPayload;
    }

    private static applyPayloadToLocal(payload: RemoteUserDataPayload): void {
        const gameData = this.getGameData();
        this.logDebug("Apply payload to local storage", payload);

        if (typeof payload.currentGold === "number" && Number.isFinite(payload.currentGold)) {
            const normalizedGold = Math.max(0, Math.floor(payload.currentGold));
            cc.sys.localStorage.setItem(this.getScopedKey(this.GOLD_KEY), normalizedGold.toString());
            gameData.currentGold = normalizedGold;
        }

        if (typeof payload.totalGoldEarned === "number" && Number.isFinite(payload.totalGoldEarned)) {
            const normalizedTotalGold = Math.max(0, Math.floor(payload.totalGoldEarned));
            cc.sys.localStorage.setItem(this.getScopedKey(this.TOTAL_GOLD_EARNED_KEY), normalizedTotalGold.toString());
            gameData.totalGoldEarned = normalizedTotalGold;
        }

        if (typeof payload.game2Shenpo === "number" && Number.isFinite(payload.game2Shenpo)) {
            const normalizedShenpo = Math.max(0, Math.floor(payload.game2Shenpo));
            cc.sys.localStorage.setItem(this.getScopedKey(this.GAME2_SHENPO_KEY), normalizedShenpo.toString());
            this.getStateBridge().saveShenpo(normalizedShenpo);
        }

        if (payload.game2HeroTiers && typeof payload.game2HeroTiers === "object" && !Array.isArray(payload.game2HeroTiers)) {
            cc.sys.localStorage.setItem(this.getScopedKey(this.GAME2_HERO_TIERS_KEY), JSON.stringify(payload.game2HeroTiers));
            this.getStateBridge().saveHeroTiers(payload.game2HeroTiers);
        }

        if (typeof payload.game2EquippedSkinId === "string" && payload.game2EquippedSkinId) {
            const gameState = this.getGameState();
            gameState.equippedSkinId = payload.game2EquippedSkinId;
            if (typeof gameState.save === "function") {
                gameState.save();
            }
        }

        if (Array.isArray(payload.itemStock)) {
            const normalizedItemStock = payload.itemStock.map((value) => Math.max(0, Math.floor(Number(value) || 0)));
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
            const normalizedMinutes = Math.max(0, Math.floor(payload.dailyOnlineMinutes));
            cc.sys.localStorage.setItem(this.getScopedKey(this.DAILY_ONLINE_MINUTES_KEY), normalizedMinutes.toString());
        }

        if (typeof payload.totalConsumedStamina === "number" && Number.isFinite(payload.totalConsumedStamina)) {
            const normalizedConsumedStamina = Math.max(0, Math.floor(payload.totalConsumedStamina));
            cc.sys.localStorage.setItem(this.getScopedKey(this.TOTAL_CONSUMED_STAMINA_KEY), normalizedConsumedStamina.toString());
        }

        if (typeof payload.currentStamina === "number" && Number.isFinite(payload.currentStamina)) {
            const normalizedStamina = Math.max(0, Math.min(30, Math.floor(payload.currentStamina)));
            cc.sys.localStorage.setItem(this.getScopedKey(this.STAMINA_KEY), normalizedStamina.toString());
            gameData.currentStamina = normalizedStamina;
        }

        if (typeof payload.lastRecoverTime === "number" && Number.isFinite(payload.lastRecoverTime)) {
            const normalizedTime = Math.max(0, Math.floor(payload.lastRecoverTime));
            cc.sys.localStorage.setItem(this.getScopedKey(this.LAST_RECOVER_TIME_KEY), normalizedTime.toString());
            gameData.lastRecoverTime = normalizedTime;
        }

        if (Array.isArray(payload.unlockedRoles)) {
            cc.sys.localStorage.setItem(this.getScopedKey(this.UNLOCKED_ROLES_KEY), JSON.stringify(payload.unlockedRoles));
            gameData.unlockedRoles = payload.unlockedRoles;
        }

        if (typeof payload.currentRole === "number" && Number.isFinite(payload.currentRole)) {
            const normalizedRole = Math.max(0, Math.floor(payload.currentRole));
            cc.sys.localStorage.setItem(this.getScopedKey(this.CURRENT_ROLE_KEY), normalizedRole.toString());
            gameData.currentRole = normalizedRole;
        }

        if (typeof payload.bestDistance === "number" && Number.isFinite(payload.bestDistance)) {
            const localBestDistance = Math.max(
                0,
                Math.floor(Number(gameData.bestDistance || gameData.BestScore || this.readNumber(this.BEST_DISTANCE_KEY, 0)) || 0)
            );
            const normalizedBestDistance = Math.max(localBestDistance, Math.max(0, Math.floor(payload.bestDistance)));
            cc.sys.localStorage.setItem(this.getScopedKey(this.BEST_DISTANCE_KEY), normalizedBestDistance.toString());
            cc.sys.localStorage.setItem(this.getScopedKey("BestScore"), normalizedBestDistance.toString());
            gameData.bestDistance = normalizedBestDistance;
            gameData.BestScore = normalizedBestDistance;
        }

        if (typeof payload.currentLevel === "number" && Number.isFinite(payload.currentLevel)) {
            const normalizedCurrentLevel = Math.max(1, Math.floor(payload.currentLevel));
            cc.sys.localStorage.setItem(this.getScopedKey(this.CURRENT_LEVEL_KEY), normalizedCurrentLevel.toString());
            gameData.currentLevel = normalizedCurrentLevel;
        }

        if (typeof payload.unlockedLevel === "number" && Number.isFinite(payload.unlockedLevel)) {
            const normalizedUnlockedLevel = Math.max(1, Math.floor(payload.unlockedLevel));
            cc.sys.localStorage.setItem(this.getScopedKey(this.UNLOCKED_LEVEL_KEY), normalizedUnlockedLevel.toString());
            gameData.unlockedLevel = normalizedUnlockedLevel;
        }

        if (Array.isArray(payload.levelStars)) {
            cc.sys.localStorage.setItem(this.getScopedKey(this.LEVEL_STARS_KEY), JSON.stringify(payload.levelStars));
            gameData.levelStars = [];
            gameData.loadLevelStarsArray(payload.levelStars);
        }

        if (Array.isArray(payload.failedLevels)) {
            this.getStateBridge().saveFailedLevels(payload.failedLevels);
        }

        if (typeof payload.thunderWarriorLevelGuideCompleted === "boolean") {
            this.writeBoolean(
                this.THUNDER_WARRIOR_LEVEL_GUIDE_KEY,
                this.readBoolean(this.THUNDER_WARRIOR_LEVEL_GUIDE_KEY) || payload.thunderWarriorLevelGuideCompleted
            );
        }

        if (typeof payload.thunderWarriorRaceGuideCompleted === "boolean") {
            this.writeBoolean(
                this.THUNDER_WARRIOR_RACE_GUIDE_KEY,
                this.readBoolean(this.THUNDER_WARRIOR_RACE_GUIDE_KEY) || payload.thunderWarriorRaceGuideCompleted
            );
        }

        gameData.GetGoldData();
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
    }

    private static reloadScopedLocalData(): void {
        const gameData = this.getGameData();
        if (!gameData) {
            return;
        }

        gameData.GetGoldData();
        gameData.GetSkillsData();
        gameData.GetUnlockedRolesData?.();
        gameData.GetCurrentRoleData?.();
        gameData.GetItemStockData?.();
        gameData.GetLevelData?.();
        gameData.GetStaminaData?.();
        gameData.CheckAndRecoverStamina?.();
        this.getStateBridge().syncOldToNew();

        this.logDebug("Reload scoped local data for current account", {
            username: this.getUsername(),
            userId: this.getUserId(),
            currentGold: gameData.currentGold,
            skills: gameData.skills,
            currentStamina: gameData.currentStamina,
            unlockedLevel: gameData.unlockedLevel
        });

        cc.director.emit("goldUpdated");
        cc.director.emit("shenpoUpdated");
        cc.director.emit("staminaUpdated");
    }

    private static readString(baseKey: string): string {
        return cc.sys.localStorage.getItem(this.getScopedKey(baseKey)) || "";
    }

    private static readNumber(baseKey: string, defaultValue: number): number {
        const rawValue = cc.sys.localStorage.getItem(this.getScopedKey(baseKey));
        if (!rawValue) {
            return defaultValue;
        }

        const parsedValue = parseInt(rawValue, 10);
        return Number.isNaN(parsedValue) ? defaultValue : parsedValue;
    }

    private static readBoolean(baseKey: string, defaultValue = false): boolean {
        const rawValue = cc.sys.localStorage.getItem(this.getScopedKey(baseKey));
        if (rawValue === null || rawValue === "") return defaultValue;
        return rawValue === "true" || rawValue === "1";
    }

    private static writeBoolean(baseKey: string, value: boolean): void {
        cc.sys.localStorage.setItem(this.getScopedKey(baseKey), value ? "true" : "false");
    }

    public static getStoredNumber(baseKey: string, defaultValue = 0): number {
        return this.readNumber(baseKey, defaultValue);
    }

    public static hasThunderWarriorGuideCompleted(isRaceMode: boolean): boolean {
        return this.readBoolean(
            isRaceMode ? this.THUNDER_WARRIOR_RACE_GUIDE_KEY : this.THUNDER_WARRIOR_LEVEL_GUIDE_KEY
        );
    }

    public static completeThunderWarriorGuide(isRaceMode: boolean): void {
        this.writeBoolean(
            isRaceMode ? this.THUNDER_WARRIOR_RACE_GUIDE_KEY : this.THUNDER_WARRIOR_LEVEL_GUIDE_KEY,
            true
        );
        this.requestUpload();
    }

    private static readJsonArray(baseKey: string, defaultValue: any[]): any[] {
        const rawValue = cc.sys.localStorage.getItem(this.getScopedKey(baseKey));
        if (!rawValue) {
            return defaultValue;
        }

        try {
            const parsedValue = JSON.parse(rawValue);
            return Array.isArray(parsedValue) ? parsedValue : defaultValue;
        } catch (error) {
            console.error(`Parse local array data failed for ${baseKey}:`, error);
            return defaultValue;
        }
    }

    private static readJsonObject(baseKey: string, defaultValue: { [key: string]: any }): { [key: string]: any } {
        const rawValue = cc.sys.localStorage.getItem(this.getScopedKey(baseKey));
        if (!rawValue) {
            return defaultValue;
        }

        try {
            const parsedValue = JSON.parse(rawValue);
            return parsedValue && typeof parsedValue === "object" && !Array.isArray(parsedValue)
                ? parsedValue
                : defaultValue;
        } catch (error) {
            console.error(`Parse local object data failed for ${baseKey}:`, error);
            return defaultValue;
        }
    }

    private static readNumberArray(baseKey: string): number[] {
        return this.readJsonArray(baseKey, []).filter((value) => typeof value === "number");
    }

    private static progressStarsToArray(rawStars: any): number[] {
        if (Array.isArray(rawStars)) {
            return rawStars.map((value) => Math.max(0, Math.floor(Number(value) || 0)));
        }

        if (!rawStars || typeof rawStars !== "object") {
            return [];
        }

        const levels = Object.keys(rawStars)
            .map((key) => parseInt(key, 10))
            .filter((level) => Number.isFinite(level) && level > 0);
        const maxLevel = levels.length > 0 ? Math.max(...levels) : 0;
        const result: number[] = [];
        for (let level = 1; level <= maxLevel; level++) {
            result.push(Math.max(0, Math.floor(Number(rawStars[String(level)]) || 0)));
        }
        return result;
    }

    private static serializePayload(payload: RemoteUserDataPayload): string {
        try {
            return JSON.stringify(payload);
        } catch (error) {
            console.error("Serialize user data payload failed:", error);
            return "{}";
        }
    }

    private static ensureSuccessfulResponse(response: any, fallbackMessage: string): void {
        const hasErrorCode = response && response.code !== undefined && response.code !== null && Number(response.code) !== 0;
        if (!response || hasErrorCode || response.success === false) {
            const message = response && (response.msg || response.message);
            throw new Error(message || fallbackMessage);
        }
    }

    private static async postJson(url: string, data: any): Promise<any> {
        return new Promise((resolve, reject) => {
            const xhr = new XMLHttpRequest();
            xhr.open("POST", url, true);
            xhr.setRequestHeader("Content-Type", "application/json");

            xhr.onload = () => {
                if (xhr.status >= 200 && xhr.status < 300) {
                    try {
                        resolve(JSON.parse(xhr.responseText));
                    } catch (error) {
                        reject(new Error(`JSON parse error: ${error.message}`));
                    }
                } else {
                    reject(new Error(`HTTP error: ${xhr.status}`));
                }
            };

            xhr.onerror = () => reject(new Error("Network request failed"));
            xhr.ontimeout = () => reject(new Error("Network request timeout"));

            xhr.send(JSON.stringify(data));
        });
    }
}
