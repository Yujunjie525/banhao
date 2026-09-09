import { APP_ID } from "../Common/AppConfig";

interface RemoteUserDataPayload {
    version?: number;
    updatedAt?: number;
    currentGold?: number;
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
    levelStars?: number[];
}

export default class UserDataSyncManager {
    private static readonly ENABLE_DEBUG_LOG = true;
    private static readonly SAVE_URL = "https://pay.szvi-bo.com/v1/testapp/SaveUserData";
    private static readonly GET_URL = "https://pay.szvi-bo.com/v1/testapp/GetUserData";

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
    private static readonly LEVEL_STARS_KEY = "LevelStars";

    private static currentSessionKey = "";
    private static initialSyncCompleted = false;
    private static lastUploadedPayload = "";
    private static uploadTimer: any = null;
    private static hasDirtyChanges = false;
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
            this.lastUploadedPayload = this.serializePayload(this.buildLocalPayload());
            this.hasDirtyChanges = false;
        }
    }

    public static requestUpload(): void {
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

        this.lastUploadedPayload = serializedPayload;
        this.hasDirtyChanges = false;
    }

    private static buildLocalPayload(): RemoteUserDataPayload {
        const gameData = this.getGameData();
        return {
            version: 1,
            updatedAt: Date.now(),
            currentGold: this.readNumber(this.GOLD_KEY, gameData.currentGold),
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
            levelStars: this.readJsonArray(this.LEVEL_STARS_KEY, gameData.getLevelStarsArray())
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

        if (Array.isArray(payload.levelStars)) {
            cc.sys.localStorage.setItem(this.getScopedKey(this.LEVEL_STARS_KEY), JSON.stringify(payload.levelStars));
            gameData.loadLevelStarsArray(payload.levelStars);
        }

        gameData.GetGoldData();
        gameData.GetSkillsData();
        gameData.GetStaminaData();
        gameData.GetUnlockedRolesData();
        gameData.GetCurrentRoleData();
        this.logDebug("Local data after applying remote payload", {
            currentGold: gameData.currentGold,
            skills: gameData.skills,
            currentStamina: gameData.currentStamina,
            lastRecoverTime: gameData.lastRecoverTime,
            unlockedRoles: gameData.unlockedRoles,
            currentRole: gameData.currentRole
        });
        cc.director.emit("goldUpdated");
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

        this.logDebug("Reload scoped local data for current account", {
            username: this.getUsername(),
            userId: this.getUserId(),
            currentGold: gameData.currentGold,
            skills: gameData.skills
        });

        cc.director.emit("goldUpdated");
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

    public static getStoredNumber(baseKey: string, defaultValue = 0): number {
        return this.readNumber(baseKey, defaultValue);
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

    private static readNumberArray(baseKey: string): number[] {
        return this.readJsonArray(baseKey, []).filter((value) => typeof value === "number");
    }

    private static serializePayload(payload: RemoteUserDataPayload): string {
        try {
            return JSON.stringify(payload);
        } catch (error) {
            console.error("Serialize user data payload failed:", error);
            return "{}";
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
