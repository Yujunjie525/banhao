import MasterGlobal from "../../script/common/MasterGlobal";
import { GameBackendApi } from "../../script/Api/GameBackendApi";
import LocalStorageKeys from "./LocalStorageKeys";

const { ccclass, property } = cc._decorator;

// 关卡配置接口
export interface LegacyLevelConfig {
    levelId: number; //关卡
    icon: string;   //icon图标
    time: number;   //通关时间
    Monster: Array<number>; // 可出现的怪物类型
    num: number; // 怪物数量
    speed: number; // 怪物移动速度
}

interface ServerUserDataPayload {
    version: number;
    gold?: number;
    soulStone?: number;
    goodsInventory?: { [key: string]: number };
    level?: {
        current: number;
        unlocked: number;
    };
    levelStars?: {
        [key: string]: number;
    };
    totalOnlineSeconds?: number;
    stamina?: {
        current: number;
        max: number;
        lastRecoverTime: number;
        totalConsumed: number;
    };
    shop?: {
        unlockedTrainIds: number[];
        currentTrainId: number;
        currentKingId?: number;
        itemStock: number[];
    };
    strengthen?: {
        levels: { [key: string]: number };
        baseLevel?: number;
    };
    weekReward?: {
        weekKey: string;
        claimedMap: { [key: string]: boolean };
    };
    onlineReward?: {
        dateKey: string;
        onlineSeconds: number;
        claimedMap: { [key: string]: boolean };
    };
}

interface PendingStaminaSnapshot {
    current: number;
    max: number;
    lastRecoverTime: number;
    totalConsumed: number;
}

@ccclass
class GameData {
    //背景音乐是否开启,默认开启
    public isBGMOn: boolean = true;
    //音效是否开启,默认开启
    public isSoundOn: boolean = true;
    //存储音频开关状态的key
    public isBGMOnKey: string = 'IsBGMOn';
    //存储音效开关状态的key
    public isSoundOnKey: string = 'IsSoundOn';
    //游戏是否开始
    public isGameBegin: boolean = true;
    //背景移动速度
    public BgMoveSpeed: number = 8;
    //是否第二次触摸
    public isTouchAgain: boolean = true;
    //玩家所处位置。-1在左，1在右
    public playerLoc: number = -1;
    //玩家当下得分
    public EveryScore: number = 0;
    //玩家最高得分
    public BestScore: number = 0;
    //记录玩家BUFF状态
    public playerBuff: boolean = false;
    //是否微信分享
    public isOpenWXShare: boolean = true;
    //存储时的最高分key
    public BestScoreKey: string = 'BestScore';
    //buff图片(0-飞镖，1--蚊子，2--狐狸)
    public buffTuji: Array<number> = [-1, -1, -1];
    //护盾值
    public playerHudun: cc.Node = null;
    //PlayerManager实例
    public playerManager: any = null;
    //物体移动速度
    public MoveSpeed: number = 10;
    //体力系统相关
    public currentStamina: number = 30; //当前体力值
    public maxStamina: number = 30; //最大体力值
    public lastRecoverTime: number = Date.now(); //上次恢复体力的时间戳
    public staminaKey: string = 'Stamina'; //存储体力的key
    public lastRecoverTimeKey: string = 'LastRecoverTime'; //存储上次恢复时间的key

    //钻石系统相关
    public currentGold: number = 1000; //当前钻石数量，初始给1000
    public goldKey: string = 'CurrentGold'; //存储钻石的key
    public currentSoulStone: number = 2000;
    public soulStoneKey: string = 'CurrentSoulStone';
    public goodsInventory: { [key: string]: number } = {};
    public goodsInventoryKey: string = 'GoodsInventory';

    //角色系统相关
    public unlockedRoles: Array<boolean> = [true, false, false, false, false]; //角色解锁状态，默认解锁第一个角色
    public currentRole: number = 0; //当前选中的角色索引
    public unlockedRolesKey: string = 'UnlockedRoles'; //存储角色解锁状态的key
    public currentRoleKey: string = 'CurrentRole'; //存储当前选中角色的key
    public roleWeights: Array<number> = [10, 20, 30, 40, 50]; //角色重量
    public rolePrices: Array<number> = [0, 2000, 4000, 6000, 8000]; //角色价格

    //商店道具库存相关
    public itemStock: Array<number> = [0, 0, 0]; //道具1-3的库存
    public itemStockKey: string = 'ItemStock'; //存储道具库存的key

    //关卡模式相关
    public isInfiniteMode: boolean = true; //是否为无限模式，false为关卡模式
    public currentLevel: number = 1; //当前正在玩的关卡
    public unlockedLevel: number = 1; //已经解锁的最高关卡
    //是否自动打开关卡选择界面
    public shouldOpenLevelSelect: boolean = false;
    // 扩展关卡到100关，难度逐渐增加
    public levelTargetScores: Array<number> = [];

    // 关卡配置数组
    public legacyLevelConfigs: Array<LegacyLevelConfig> = [];
    public totalConsumedStamina: number = 0;
    public totalConsumedStaminaKey: string = 'TotalConsumeStamina';
    public totalOnlineSeconds: number = 0;
    public totalOnlineSecondsKey: string = 'TotalOnlineSeconds';
    public levelStarsKey: string = 'LevelStars';
    private syncUserDataTimer: any = null;
    private isSyncingUserData: boolean = false;
    private pendingUserDataSync: boolean = false;
    private readonly staminaSyncPendingKey: string = 'StaminaSyncPending';
    private levelStarsData: { [key: string]: number } = {};

    constructor() {
        // 直接使用静态关卡配置数组
        // 加载音频开关状态
        this.GetBGMOnData();
        // 加载音效开关状态
        this.GetSoundOnData();
        // 加载角色解锁状态
        this.GetUnlockedRolesData();
        // 加载当前选中角色
        this.GetCurrentRoleData();
        this.GetTotalConsumedStaminaData();
        this.GetTotalOnlineSecondsData();
    }


    public currentLevelKey: string = 'CurrentLevel'; //存储当前关卡的key
    public unlockedLevelKey: string = 'UnlockedLevel'; //存储已解锁关卡的key

    /**
     * 获取当前用户ID
     * @returns 用户ID，如果没有登录返回null
     */
    private getUserId(): string | null {
        return cc.sys.localStorage.getItem(LocalStorageKeys.appKey('SLS_USER_ID'));
    }

    /**
     * 生成带用户ID后缀的存储key
     * @param baseKey 基础key
     * @returns 带用户ID后缀的key
     */
    private getKeyWithUserId(baseKey: string): string {
        return LocalStorageKeys.userKey(baseKey, this.getUserId());
    }

    private getStaminaSyncPendingKey(): string {
        return this.getKeyWithUserId(this.staminaSyncPendingKey);
    }

    private getCurrentStaminaSnapshot(): PendingStaminaSnapshot {
        return {
            current: Math.max(0, Number(this.currentStamina) || 0),
            max: Math.max(1, Number(this.maxStamina) || 1),
            lastRecoverTime: Math.max(0, Number(this.lastRecoverTime) || Date.now()),
            totalConsumed: Math.max(0, Number(this.totalConsumedStamina) || 0),
        };
    }

    private markStaminaSyncPending(): void {
        cc.sys.localStorage.setItem(
            this.getStaminaSyncPendingKey(),
            JSON.stringify(this.getCurrentStaminaSnapshot())
        );
    }

    private readPendingStaminaSnapshot(): PendingStaminaSnapshot | null {
        const raw = cc.sys.localStorage.getItem(this.getStaminaSyncPendingKey());
        if (!raw) {
            return null;
        }

        try {
            const data = JSON.parse(raw);
            if (!data || data.current == null || data.max == null) {
                cc.sys.localStorage.removeItem(this.getStaminaSyncPendingKey());
                return null;
            }

            const max = Math.max(1, Number(data.max) || 1);
            return {
                current: Math.max(0, Math.min(max, Number(data.current) || 0)),
                max,
                lastRecoverTime: Math.max(0, Number(data.lastRecoverTime) || Date.now()),
                totalConsumed: Math.max(0, Number(data.totalConsumed) || 0),
            };
        } catch (error) {
            console.warn('pending stamina sync data parse failed, reset it.', error);
            cc.sys.localStorage.removeItem(this.getStaminaSyncPendingKey());
            return null;
        }
    }

    private isSameStaminaSnapshot(left: PendingStaminaSnapshot, right: PendingStaminaSnapshot): boolean {
        return !!left && !!right
            && left.current === right.current
            && left.max === right.max
            && left.lastRecoverTime === right.lastRecoverTime
            && left.totalConsumed === right.totalConsumed;
    }

    private clearStaminaSyncPendingIfMatches(snapshot: PendingStaminaSnapshot): void {
        const pending = this.readPendingStaminaSnapshot();
        if (pending && this.isSameStaminaSnapshot(pending, snapshot)) {
            cc.sys.localStorage.removeItem(this.getStaminaSyncPendingKey());
        }
    }

    private persistStaminaSnapshot(snapshot: PendingStaminaSnapshot): void {
        this.currentStamina = Math.max(0, Math.min(snapshot.max, snapshot.current));
        this.maxStamina = Math.max(1, snapshot.max);
        this.lastRecoverTime = Math.max(0, snapshot.lastRecoverTime || Date.now());
        this.totalConsumedStamina = Math.max(0, snapshot.totalConsumed);

        cc.sys.localStorage.setItem(this.getKeyWithUserId(this.staminaKey), `${this.currentStamina}`);
        cc.sys.localStorage.setItem(this.getKeyWithUserId(this.lastRecoverTimeKey), `${this.lastRecoverTime}`);
        cc.sys.localStorage.setItem(this.getKeyWithUserId(this.totalConsumedStaminaKey), `${this.totalConsumedStamina}`);
    }

    private restorePendingStaminaSnapshot(snapshot: PendingStaminaSnapshot): void {
        if (!snapshot) {
            return;
        }

        const max = Math.max(1, Number(this.maxStamina) || 1, snapshot.max);
        const restored: PendingStaminaSnapshot = {
            current: Math.max(0, Math.min(max, snapshot.current)),
            max,
            lastRecoverTime: snapshot.lastRecoverTime,
            totalConsumed: snapshot.totalConsumed,
        };
        this.persistStaminaSnapshot(restored);
        // Keep the effective snapshot (including the current max stamina) as
        // pending until the follow-up save is acknowledged by the server.
        const effectiveSnapshot = this.getCurrentStaminaSnapshot();
        cc.sys.localStorage.setItem(
            this.getStaminaSyncPendingKey(),
            JSON.stringify(effectiveSnapshot)
        );
        cc.director.emit('staminaUpdated');
    }

    private flushUserDataSyncImmediately(): void {
        if (this.syncUserDataTimer != null) {
            clearTimeout(this.syncUserDataTimer);
            this.syncUserDataTimer = null;
        }
        this.syncUserDataToServer();
    }

    /**
     * 存储数据
     */
    private getUsername(): string | null {
        return cc.sys.localStorage.getItem(LocalStorageKeys.appKey('SLS_USERNAME'));
    }

    public resetRuntimeDataForUserSwitch(): void {
        this.currentGold = 1000;
        this.currentSoulStone = 2000;
        this.currentLevel = 1;
        this.unlockedLevel = 1;
        this.levelStarsData = {};
        this.currentStamina = this.maxStamina;
        this.lastRecoverTime = Date.now();
        this.totalConsumedStamina = 0;
        this.totalOnlineSeconds = 0;
        this.itemStock = [0, 0, 0];
        this.goodsInventory = {};
    }

    public loadLocalUserScopedData(): void {
        this.GetGoldData();
        this.GetSoulStoneData();
        this.GetLevelData();
        this.GetStaminaData();
        this.GetItemStockData();
        this.GetGoodsInventoryData();
        this.GetTotalConsumedStaminaData();
        this.GetTotalOnlineSecondsData();
    }

    public clearAllLocalSavedData(): void {
        LocalStorageKeys.clearAppData();
        this.resetRuntimeDataForUserSwitch();
    }

    public requestSyncUserData(delayMs: number = 500): void {
        const username = this.getUsername();
        if (!username) {
            return;
        }

        if (this.syncUserDataTimer != null) {
            clearTimeout(this.syncUserDataTimer);
        }

        this.syncUserDataTimer = setTimeout(() => {
            this.syncUserDataTimer = null;
            this.syncUserDataToServer();
        }, Math.max(0, delayMs));
    }

    public async syncUserDataToServer(): Promise<boolean> {
        const username = this.getUsername();
        if (!username) {
            return false;
        }

        if (this.isSyncingUserData) {
            this.pendingUserDataSync = true;
            return false;
        }

        this.isSyncingUserData = true;
        try {
            const payload = this.buildServerUserDataPayload();
            const staminaSnapshot: PendingStaminaSnapshot | null = payload.stamina
                ? {
                    current: payload.stamina.current,
                    max: payload.stamina.max,
                    lastRecoverTime: payload.stamina.lastRecoverTime,
                    totalConsumed: payload.stamina.totalConsumed,
                }
                : null;
            const result = await GameBackendApi.saveUserData(username, JSON.stringify(payload));
            if (!result || result.code !== 0) {
                console.warn('saveUserData failed:', result);
                return false;
            }
            if (staminaSnapshot) {
                this.clearStaminaSyncPendingIfMatches(staminaSnapshot);
            }
            return true;
        } catch (error) {
            console.warn('saveUserData request failed:', error);
            return false;
        } finally {
            this.isSyncingUserData = false;
            if (this.pendingUserDataSync) {
                this.pendingUserDataSync = false;
                this.requestSyncUserData(300);
            }
        }
    }

    public async loadUserDataFromServer(): Promise<boolean> {
        const username = this.getUsername();
        if (!username) {
            return false;
        }

        // Keep a local stamina mutation that has not been acknowledged by the
        // server. A refresh can happen before the immediate save request
        // finishes; applying the older server payload blindly would roll the
        // spent stamina back.
        const pendingStamina = this.readPendingStaminaSnapshot();

        try {
            const result = await GameBackendApi.getUserData(username);
            if (!result || result.code !== 0) {
                return false;
            }

            const payload = this.extractServerUserDataPayload(result.data);
            if (!payload) {
                return false;
            }

            this.applyServerUserDataPayload(payload);
            if (pendingStamina) {
                this.restorePendingStaminaSnapshot(pendingStamina);
                this.flushUserDataSyncImmediately();
            }
            return true;
        } catch (error) {
            console.warn('getUserData request failed:', error);
            return false;
        }
    }

    private buildServerUserDataPayload(): ServerUserDataPayload {
        return {
            version: 1,
            gold: Math.max(0, Number(this.currentGold) || 0),
            soulStone: Math.max(0, Number(this.currentSoulStone) || 0),
            goodsInventory: this.getGoodsInventorySnapshot(),
            level: {
                current: Math.max(1, Number(this.currentLevel) || 1),
                unlocked: Math.max(1, Number(this.unlockedLevel) || 1),
            },
            levelStars: this.getLevelStarsSnapshot(),
            totalOnlineSeconds: Math.max(0, Number(this.totalOnlineSeconds) || 0),
            stamina: {
                current: Math.max(0, Number(this.currentStamina) || 0),
                max: Math.max(0, Number(this.maxStamina) || 0),
                lastRecoverTime: Math.max(0, Number(this.lastRecoverTime) || 0),
                totalConsumed: Math.max(0, Number(this.totalConsumedStamina) || 0),
            },
            shop: {
                unlockedTrainIds: this.getUnlockedTrainIds(),
                currentTrainId: this.getCurrentTrainId(),
                currentKingId: this.getCurrentKingId(),
                itemStock: (this.itemStock || []).slice(),
            },
            strengthen: {
                levels: this.getStrengthenLevelsSnapshot(),
                baseLevel: this.getBaseUpgradeLevelSnapshot(),
            },
            weekReward: {
                weekKey: this.getCurrentWeekKey(),
                claimedMap: this.getWeekRewardClaimedSnapshot(),
            },
            onlineReward: {
                dateKey: this.getCurrentDateKey(),
                onlineSeconds: this.getOnlineRewardOnlineSeconds(),
                claimedMap: this.getOnlineRewardClaimedSnapshot(),
            },
        };
    }

    private extractServerUserDataPayload(rawData: any): ServerUserDataPayload | null {
        if (!rawData) {
            return null;
        }

        const candidates = [
            rawData.jsondata,
            rawData.jsonData,
            rawData.userData,
            rawData.userdata,
            rawData.data,
            rawData,
        ];

        for (let i = 0; i < candidates.length; i++) {
            const parsed = this.tryParseServerPayload(candidates[i]);
            if (parsed) {
                return parsed;
            }
        }

        return null;
    }

    private tryParseServerPayload(candidate: any): ServerUserDataPayload | null {
        if (!candidate) {
            return null;
        }

        if (typeof candidate === 'string') {
            try {
                return this.tryParseServerPayload(JSON.parse(candidate));
            } catch (error) {
                return null;
            }
        }

        if (typeof candidate !== 'object') {
            return null;
        }

        if (
            candidate.version != null ||
            candidate.gold != null ||
            candidate.soulStone != null ||
            candidate.goodsInventory != null ||
            candidate.level != null ||
            candidate.levelStars != null ||
            candidate.stamina != null ||
            candidate.shop != null ||
            candidate.strengthen != null ||
            candidate.weekReward != null ||
            candidate.onlineReward != null
        ) {
            return candidate as ServerUserDataPayload;
        }

        return null;
    }

    private applyServerUserDataPayload(payload: ServerUserDataPayload): void {
        if (payload.gold != null) {
            this.currentGold = Math.max(0, Number(payload.gold) || 0);
            cc.sys.localStorage.setItem(this.getKeyWithUserId(this.goldKey), `${this.currentGold}`);
        }
        if (payload.soulStone != null) {
            this.currentSoulStone = Math.max(0, Number(payload.soulStone) || 0);
            cc.sys.localStorage.setItem(this.getKeyWithUserId(this.soulStoneKey), `${this.currentSoulStone}`);
        }
        if (payload.goodsInventory) {
            this.goodsInventory = this.normalizeGoodsInventory(payload.goodsInventory);
            cc.sys.localStorage.setItem(this.getKeyWithUserId(this.goodsInventoryKey), JSON.stringify(this.goodsInventory));
        }

        if (payload.level) {
            const totalLevels = this.getTotalLevels();
            this.currentLevel = Math.max(1, Number(payload.level.current) || 1);
            this.unlockedLevel = Math.max(this.currentLevel, Number(payload.level.unlocked) || 1);
            if (totalLevels > 0) {
                this.currentLevel = Math.min(totalLevels, this.currentLevel);
                this.unlockedLevel = Math.min(totalLevels, this.unlockedLevel);
            }
            cc.sys.localStorage.setItem(this.getKeyWithUserId(this.currentLevelKey), `${this.currentLevel}`);
            cc.sys.localStorage.setItem(this.getKeyWithUserId(this.unlockedLevelKey), `${this.unlockedLevel}`);
            cc.director.emit('levelUpdated');
        }

        if (payload.levelStars) {
            this.clearLevelStars();
            Object.keys(payload.levelStars).forEach((levelKey) => {
                const level = Number(levelKey) || 0;
                if (level <= 0) {
                    return;
                }
                this.setLevelStars(level, payload.levelStars[levelKey]);
            });
            cc.director.emit('levelUpdated');
        }

        if (payload.totalOnlineSeconds != null) {
            this.totalOnlineSeconds = Math.max(0, Number(payload.totalOnlineSeconds) || 0);
            cc.sys.localStorage.setItem(this.getKeyWithUserId(this.totalOnlineSecondsKey), `${this.totalOnlineSeconds}`);
            const totalMinutes = this.getTotalOnlineMinutes();
            cc.sys.localStorage.setItem(this.getKeyWithUserId('TotalPlayMinutes'), `${totalMinutes}`);
            cc.sys.localStorage.setItem(this.getKeyWithUserId('AchievementPlayMinutes'), `${totalMinutes}`);
        }

        if (payload.stamina) {
            this.currentStamina = Math.max(0, Number(payload.stamina.current) || 0);
            this.maxStamina = Math.max(0, Number(payload.stamina.max) || this.maxStamina);
            this.lastRecoverTime = Math.max(0, Number(payload.stamina.lastRecoverTime) || Date.now());
            this.totalConsumedStamina = Math.max(0, Number(payload.stamina.totalConsumed) || 0);

            cc.sys.localStorage.setItem(this.getKeyWithUserId(this.staminaKey), `${this.currentStamina}`);
            cc.sys.localStorage.setItem(this.getKeyWithUserId(this.lastRecoverTimeKey), `${this.lastRecoverTime}`);
            cc.sys.localStorage.setItem(this.getKeyWithUserId(this.totalConsumedStaminaKey), `${this.totalConsumedStamina}`);
        }

        if (payload.shop) {
            const unlockedTrainIds = Array.isArray(payload.shop.unlockedTrainIds) ? payload.shop.unlockedTrainIds : [1];
            const normalizedTrainIds = unlockedTrainIds
                .map((item) => Number(item) || 0)
                .filter((item, index, array) => item > 0 && array.indexOf(item) === index)
                .sort((a, b) => a - b);
            if (normalizedTrainIds.indexOf(1) < 0) {
                normalizedTrainIds.unshift(1);
            }

            cc.sys.localStorage.setItem(this.getKeyWithUserId('UnlockedTrainIds'), JSON.stringify(normalizedTrainIds));

            const currentTrainId = Number(payload.shop.currentTrainId) || normalizedTrainIds[0] || 1;
            cc.sys.localStorage.setItem(this.getKeyWithUserId('CurrentTrainId'), `${currentTrainId}`);
            cc.sys.localStorage.setItem(this.getKeyWithUserId('CurrentKingId'), `${Number(payload.shop.currentKingId) || currentTrainId}`);
            cc.sys.localStorage.setItem(LocalStorageKeys.appKey('CurrentKingId'), `${Number(payload.shop.currentKingId) || currentTrainId}`);

            if (Array.isArray(payload.shop.itemStock)) {
                this.itemStock = payload.shop.itemStock.map((item) => Math.max(0, Number(item) || 0));
                cc.sys.localStorage.setItem(this.getKeyWithUserId(this.itemStockKey), JSON.stringify(this.itemStock));
            }
        }

        if (payload.strengthen && payload.strengthen.levels) {
            const levels = payload.strengthen.levels;
            Object.keys(levels).forEach((trainId) => {
                const level = Math.max(1, Number(levels[trainId]) || 1);
                cc.sys.localStorage.setItem(this.getStrengthenLevelStorageKey(Number(trainId)), `${level}`);
            });
        }
        if (payload.strengthen && payload.strengthen.baseLevel != null) {
            const level = Math.max(1, Number(payload.strengthen.baseLevel) || 1);
            cc.sys.localStorage.setItem(this.getBaseUpgradeLevelStorageKey(), `${level}`);
        }

        if (payload.weekReward) {
            const weekKey = payload.weekReward.weekKey || this.getCurrentWeekKey();
            cc.sys.localStorage.setItem(
                this.getWeekRewardClaimedStorageKey(weekKey),
                JSON.stringify(payload.weekReward.claimedMap || {})
            );
        }

        if (payload.onlineReward) {
            const dateKey = payload.onlineReward.dateKey || this.getCurrentDateKey();
            cc.sys.localStorage.setItem(
                this.getOnlineRewardStorageKey(dateKey),
                JSON.stringify({
                    onlineSeconds: Math.max(0, Number(payload.onlineReward.onlineSeconds) || 0),
                    claimedMap: payload.onlineReward.claimedMap || {},
                })
            );
        }

        cc.director.emit('goldUpdated');
        cc.director.emit('soulStoneUpdated');
    }

    private getStrengthenLevelsSnapshot(): { [key: string]: number } {
        const result: { [key: string]: number } = {};
        const candidates = [1, 2, 3, 4];
        for (let i = 0; i < candidates.length; i++) {
            const trainId = candidates[i];
            const raw = cc.sys.localStorage.getItem(this.getStrengthenLevelStorageKey(trainId));
            const level = Math.max(1, Number(raw) || 1);
            result[`${trainId}`] = level;
        }
        return result;
    }

    private getStrengthenLevelStorageKey(trainId: number): string {
        return this.getKeyWithUserId(`StrengthenLevel_${trainId}`);
    }

    private getBaseUpgradeLevelSnapshot(): number {
        const raw = cc.sys.localStorage.getItem(this.getBaseUpgradeLevelStorageKey());
        return Math.max(1, Number(raw) || 1);
    }

    private getBaseUpgradeLevelStorageKey(): string {
        return this.getKeyWithUserId('BaseUpgradeLevel');
    }

    private getWeekRewardClaimedSnapshot(): { [key: string]: boolean } {
        const raw = cc.sys.localStorage.getItem(this.getWeekRewardClaimedStorageKey(this.getCurrentWeekKey()));
        if (!raw) {
            return {};
        }

        try {
            return JSON.parse(raw) || {};
        } catch (error) {
            return {};
        }
    }

    private getWeekRewardClaimedStorageKey(weekKey: string): string {
        return LocalStorageKeys.userKey(`WeekRewardClaimed_${weekKey}`, this.getUserId());
    }

    private getCurrentWeekKey(): string {
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const day = today.getDay();
        const diffToMonday = day === 0 ? -6 : 1 - day;
        today.setDate(today.getDate() + diffToMonday);
        today.setHours(0, 0, 0, 0);

        const year = today.getFullYear();
        const month = `${today.getMonth() + 1}`.padStart(2, '0');
        const date = `${today.getDate()}`.padStart(2, '0');
        return `${year}${month}${date}`;
    }

    private getOnlineRewardClaimedSnapshot(): { [key: string]: boolean } {
        const raw = cc.sys.localStorage.getItem(this.getOnlineRewardStorageKey(this.getCurrentDateKey()));
        if (!raw) {
            return {};
        }

        try {
            const data = JSON.parse(raw) || {};
            return data.claimedMap || {};
        } catch (error) {
            return {};
        }
    }

    private getOnlineRewardOnlineSeconds(): number {
        const raw = cc.sys.localStorage.getItem(this.getOnlineRewardStorageKey(this.getCurrentDateKey()));
        if (!raw) {
            return 0;
        }

        try {
            const data = JSON.parse(raw) || {};
            return Math.max(0, Number(data.onlineSeconds) || 0);
        } catch (error) {
            return 0;
        }
    }

    private getOnlineRewardStorageKey(dateKey: string): string {
        return LocalStorageKeys.userKey(`OnlineReward_${dateKey}`, this.getUserId());
    }

    private getCurrentDateKey(): string {
        const now = new Date();
        const year = now.getFullYear();
        const month = `${now.getMonth() + 1}`.padStart(2, '0');
        const date = `${now.getDate()}`.padStart(2, '0');
        return `${year}${month}${date}`;
    }

    SetData() {
        // 存储音频开关状态
        this.SaveBGMOnData();
        // 存储音效开关状态
        this.SaveSoundOnData();
        // 存储角色解锁状态
        this.SaveUnlockedRolesData();
        // 存储当前选中角色
        this.SaveCurrentRoleData();
        if (cc.sys.platform != cc.sys.WECHAT_GAME) {
            return;
        }

        const bestScoreKey = this.getKeyWithUserId(this.BestScoreKey);
        wx.setStorage({
            key: bestScoreKey,
            data: this.BestScore,
        });

        wx.setUserCloudStorage({
            KVDataList: [{ key: '1', value: mGameData.BestScore.toString() }],
        });

        // 存储体力数据
        this.SaveStaminaData();
        // 存储关卡数据
        this.SaveLevelData();
        // 存储钻石数据
        this.SaveGoldData();
    }

    /**
     * 存储体力数据
     */
    SaveStaminaData(syncImmediately: boolean = true) {
        // 使用Cocos Creator的本地存储接口替代微信接口
        const staminaKey = this.getKeyWithUserId(this.staminaKey);
        const lastRecoverTimeKey = this.getKeyWithUserId(this.lastRecoverTimeKey);
        // Persist a user-scoped pending snapshot before starting the request
        // so a refresh cannot lose a stamina change if the request is
        // interrupted.
        this.markStaminaSyncPending();
        cc.sys.localStorage.setItem(staminaKey, this.currentStamina.toString());
        cc.sys.localStorage.setItem(lastRecoverTimeKey, this.lastRecoverTime.toString());
        if (syncImmediately) {
            this.flushUserDataSyncImmediately();
        }
        cc.director.emit('staminaUpdated');
    }

    /**
     * 获取存储的体力数据
     */
    GetStaminaData() {
        // 使用Cocos Creator的本地存储接口替代微信接口
        const staminaKey = this.getKeyWithUserId(this.staminaKey);
        const lastRecoverTimeKey = this.getKeyWithUserId(this.lastRecoverTimeKey);
        const staminaStr = cc.sys.localStorage.getItem(staminaKey);
        if (staminaStr) {
            this.currentStamina = parseInt(staminaStr);
        } else {
            // 如果没有数据，重置为满体力
            this.currentStamina = this.maxStamina;
        }

        const lastRecoverTimeStr = cc.sys.localStorage.getItem(lastRecoverTimeKey);
        if (lastRecoverTimeStr) {
            this.lastRecoverTime = parseInt(lastRecoverTimeStr);
        } else {
            // 如果没有数据，重置为当前时间
            this.lastRecoverTime = Date.now();
        }
    }

    /**
     * 存储钻石数据
     */
    SaveTotalConsumedStaminaData(syncImmediately: boolean = true) {
        const totalConsumedStaminaKey = this.getKeyWithUserId(this.totalConsumedStaminaKey);
        this.markStaminaSyncPending();
        cc.sys.localStorage.setItem(totalConsumedStaminaKey, this.totalConsumedStamina.toString());
        if (syncImmediately) {
            this.flushUserDataSyncImmediately();
        }
    }

    GetTotalConsumedStaminaData() {
        const totalConsumedStaminaKey = this.getKeyWithUserId(this.totalConsumedStaminaKey);
        const totalConsumedStaminaStr = cc.sys.localStorage.getItem(totalConsumedStaminaKey);
        if (totalConsumedStaminaStr) {
            this.totalConsumedStamina = Math.max(0, parseInt(totalConsumedStaminaStr) || 0);
        } else {
            this.totalConsumedStamina = 0;
        }
    }

    SaveTotalOnlineSecondsData() {
        const totalOnlineSecondsKey = this.getKeyWithUserId(this.totalOnlineSecondsKey);
        cc.sys.localStorage.setItem(totalOnlineSecondsKey, this.totalOnlineSeconds.toString());

        const totalMinutes = this.getTotalOnlineMinutes();
        cc.sys.localStorage.setItem(this.getKeyWithUserId('TotalPlayMinutes'), `${totalMinutes}`);
        cc.sys.localStorage.setItem(this.getKeyWithUserId('AchievementPlayMinutes'), `${totalMinutes}`);
        this.requestSyncUserData(5000);
    }

    GetTotalOnlineSecondsData() {
        const totalOnlineSecondsKey = this.getKeyWithUserId(this.totalOnlineSecondsKey);
        const totalOnlineSecondsStr = cc.sys.localStorage.getItem(totalOnlineSecondsKey);
        if (totalOnlineSecondsStr) {
            this.totalOnlineSeconds = Math.max(0, parseInt(totalOnlineSecondsStr) || 0);
        } else {
            this.totalOnlineSeconds = 0;
        }
    }

    addTotalOnlineSeconds(seconds: number) {
        const safeSeconds = Math.max(0, Math.floor(Number(seconds) || 0));
        if (safeSeconds <= 0) {
            return;
        }

        this.totalOnlineSeconds += safeSeconds;
        this.SaveTotalOnlineSecondsData();
    }

    getTotalOnlineMinutes(): number {
        return Math.floor(Math.max(0, Number(this.totalOnlineSeconds) || 0) / 60);
    }

    SaveGoldData() {
        // 使用Cocos Creator的本地存储接口保存钻石数据
        const goldKey = this.getKeyWithUserId(this.goldKey);
        cc.sys.localStorage.setItem(goldKey, this.currentGold.toString());
        this.requestSyncUserData();
    }

    /**
     * 获取存储的钻石数据
     */
    GetGoldData() {
        // 使用Cocos Creator的本地存储接口加载钻石数据
        const goldKey = this.getKeyWithUserId(this.goldKey);
        // 先检查用户ID是否正确获取
        const userId = this.getUserId();
        const goldStr = cc.sys.localStorage.getItem(goldKey);
        if (goldStr) {
            this.currentGold = parseInt(goldStr);
        } else {
            // 如果没有数据，重置为初始值20000
            this.currentGold = 1000;
            // 同时尝试读取不带用户ID的key
            const defaultGoldKey = LocalStorageKeys.appKey('CurrentGold');
            const defaultGoldStr = cc.sys.localStorage.getItem(defaultGoldKey);
        }
    }

    SaveSoulStoneData() {
        const soulStoneKey = this.getKeyWithUserId(this.soulStoneKey);
        this.currentSoulStone = Math.max(0, Math.floor(Number(this.currentSoulStone) || 0));
        cc.sys.localStorage.setItem(soulStoneKey, this.currentSoulStone.toString());
        cc.director.emit('soulStoneUpdated');
        this.requestSyncUserData();
    }

    GetSoulStoneData() {
        const soulStoneKey = this.getKeyWithUserId(this.soulStoneKey);
        const soulStoneStr = cc.sys.localStorage.getItem(soulStoneKey);
        if (soulStoneStr) {
            this.currentSoulStone = Math.max(0, parseInt(soulStoneStr) || 0);
        } else {
            this.currentSoulStone = 2000;
            cc.sys.localStorage.setItem(soulStoneKey, this.currentSoulStone.toString());
        }
    }

    addSoulStone(amount: number): void {
        const count = Math.max(0, Math.floor(Number(amount) || 0));
        if (count <= 0) {
            return;
        }

        this.currentSoulStone += count;
        this.SaveSoulStoneData();
    }

    spendSoulStone(amount: number): boolean {
        const cost = Math.max(0, Math.floor(Number(amount) || 0));
        if (this.currentSoulStone < cost) {
            return false;
        }

        this.currentSoulStone -= cost;
        this.SaveSoulStoneData();
        return true;
    }

    SaveGoodsInventoryData() {
        const goodsInventoryKey = this.getKeyWithUserId(this.goodsInventoryKey);
        cc.sys.localStorage.setItem(goodsInventoryKey, JSON.stringify(this.getGoodsInventorySnapshot()));
        this.requestSyncUserData();
    }

    GetGoodsInventoryData() {
        const goodsInventoryKey = this.getKeyWithUserId(this.goodsInventoryKey);
        const raw = cc.sys.localStorage.getItem(goodsInventoryKey);
        if (!raw) {
            this.goodsInventory = {};
            return;
        }

        try {
            this.goodsInventory = this.normalizeGoodsInventory(JSON.parse(raw));
        } catch (error) {
            this.goodsInventory = {};
        }
    }

    addGoodsInventory(itemId: string, amount: number): void {
        const id = String(itemId || '').trim();
        const count = Math.max(0, Math.floor(Number(amount) || 0));
        if (!id || count <= 0) {
            return;
        }

        this.goodsInventory[id] = Math.max(0, Number(this.goodsInventory[id]) || 0) + count;
        this.SaveGoodsInventoryData();
    }

    getGoodsInventoryAmount(itemId: string): number {
        const id = String(itemId || '').trim();
        if (!id) {
            return 0;
        }
        return Math.max(0, Math.floor(Number(this.goodsInventory[id]) || 0));
    }

    consumeGoodsInventory(itemId: string, amount: number = 1): boolean {
        const id = String(itemId || '').trim();
        const count = Math.max(0, Math.floor(Number(amount) || 0));
        if (!id || count <= 0 || this.getGoodsInventoryAmount(id) < count) {
            return false;
        }

        const remaining = this.getGoodsInventoryAmount(id) - count;
        if (remaining > 0) {
            this.goodsInventory[id] = remaining;
        } else {
            delete this.goodsInventory[id];
        }
        this.SaveGoodsInventoryData();
        return true;
    }

    grantGoodsReward(itemId: string, amount: number): void {
        const id = String(itemId || '').trim();
        const count = Math.max(0, Math.floor(Number(amount) || 0));
        if (!id || count <= 0) {
            return;
        }

        const goodsId = this.resolveGoodsConfigId(id);
        if (goodsId === 'C001') {
            this.currentGold += count;
            this.SaveGoldData();
            cc.director.emit('goldUpdated');
            return;
        }
        if (goodsId === 'C002') {
            this.addSoulStone(count);
            return;
        }

        this.addGoodsInventory(id, count);
    }

    grantLevelRewards(rewards: Array<{ item_id: string; amount: number }>): void {
        if (!Array.isArray(rewards)) {
            return;
        }

        for (let i = 0; i < rewards.length; i++) {
            const reward = rewards[i];
            if (!reward) {
                continue;
            }
            this.grantGoodsReward(reward.item_id, reward.amount);
        }
        this.requestSyncUserData(0);
    }

    private resolveGoodsConfigId(itemId: string): string {
        const id = String(itemId || '').trim();
        if (!id) {
            return '';
        }

        const goodsAsset = cc.resources.get('config/goods', cc.JsonAsset) as cc.JsonAsset;
        const rawList = goodsAsset && goodsAsset.json
            ? (Array.isArray(goodsAsset.json.goods) ? goodsAsset.json.goods : goodsAsset.json.heroes)
            : [];
        if (!Array.isArray(rawList) || rawList.length <= 0) {
            return id.split('_')[0] || id;
        }

        for (let i = 0; i < rawList.length; i++) {
            const configId = String(rawList[i] && rawList[i].id || '').trim();
            if (configId && configId === id) {
                return configId;
            }
        }

        const baseId = id.split('_')[0] || id;
        for (let i = 0; i < rawList.length; i++) {
            const configId = String(rawList[i] && rawList[i].id || '').trim();
            if (configId && configId === baseId) {
                return configId;
            }
        }

        return id;
    }

    private getGoodsInventorySnapshot(): { [key: string]: number } {
        return this.normalizeGoodsInventory(this.goodsInventory);
    }

    private normalizeGoodsInventory(raw: any): { [key: string]: number } {
        const result: { [key: string]: number } = {};
        if (!raw || typeof raw !== 'object') {
            return result;
        }

        Object.keys(raw).forEach((key) => {
            const id = String(key || '').trim();
            const amount = Math.max(0, Math.floor(Number(raw[key]) || 0));
            if (id && amount > 0) {
                result[id] = amount;
            }
        });
        return result;
    }
    /**
     * 存储道具库存数据
     */
    SaveItemStockData() {
        // 使用Cocos Creator的本地存储接口保存道具库存数据
        const itemStockKey = this.getKeyWithUserId(this.itemStockKey);
        cc.sys.localStorage.setItem(itemStockKey, JSON.stringify(this.itemStock));
        this.requestSyncUserData();
    }

    /**
     * 获取存储的道具库存数据
     */
    GetItemStockData() {
        // 使用Cocos Creator的本地存储接口加载道具库存数据
        const itemStockKey = this.getKeyWithUserId(this.itemStockKey);
        const itemStockStr = cc.sys.localStorage.getItem(itemStockKey);
        if (itemStockStr) {
            this.itemStock = JSON.parse(itemStockStr);
        } else {
            // 如果没有数据，重置为初始值
            this.itemStock = [0, 0, 0];
        }
    }

    /**
     * 获取指定道具的库存
     * @param itemId 道具ID (1-3)
     * @returns 道具库存数量
     */
    getItemStock(itemId: number): number {
        const index = itemId - 1;
        if (index >= 0 && index < this.itemStock.length) {
            return this.itemStock[index];
        }
        return 0;
    }

    /**
     * 增加指定道具的库存
     * @param itemId 道具ID (1-3)
     * @param count 增加的数量
     */
    addItemStock(itemId: number, count: number): void {
        const index = itemId - 1;
        if (index >= 0 && index < this.itemStock.length) {
            this.itemStock[index] += count;
            this.SaveItemStockData();
        }
    }

    /**
     * 减少指定道具的库存
     * @param itemId 道具ID (1-3)
     * @param count 减少的数量
     * @returns 是否成功减少
     */
    reduceItemStock(itemId: number, count: number): boolean {
        const index = itemId - 1;
        if (index >= 0 && index < this.itemStock.length && this.itemStock[index] >= count) {
            this.itemStock[index] -= count;
            this.SaveItemStockData();
            return true;
        }
        return false;
    }

    /**
     * 存储音频开关状态
     */
    SaveBGMOnData() {
        const isBGMOnKey = this.getKeyWithUserId(this.isBGMOnKey);
        cc.sys.localStorage.setItem(isBGMOnKey, this.isBGMOn.toString());
    }

    /**
     * 获取存储的音频开关状态
     */
    GetBGMOnData() {
        const isBGMOnKey = this.getKeyWithUserId(this.isBGMOnKey);
        const isBGMOnStr = cc.sys.localStorage.getItem(isBGMOnKey);
        if (isBGMOnStr) {
            this.isBGMOn = isBGMOnStr === 'true';
        } else {
            this.isBGMOn = true; // 默认开启
        }
    }

    /**
     * 存储音效开关状态
     */
    SaveSoundOnData() {
        const isSoundOnKey = this.getKeyWithUserId(this.isSoundOnKey);
        cc.sys.localStorage.setItem(isSoundOnKey, this.isSoundOn.toString());
    }

    /**
     * 获取存储的音效开关状态
     */
    GetSoundOnData() {
        const isSoundOnKey = this.getKeyWithUserId(this.isSoundOnKey);
        const isSoundOnStr = cc.sys.localStorage.getItem(isSoundOnKey);
        if (isSoundOnStr) {
            this.isSoundOn = isSoundOnStr === 'true';
        } else {
            this.isSoundOn = true; // 默认开启
        }
    }

    /**
     * 存储角色解锁状态
     */
    SaveUnlockedRolesData() {
        const unlockedRolesKey = this.getKeyWithUserId(this.unlockedRolesKey);
        cc.sys.localStorage.setItem(unlockedRolesKey, JSON.stringify(this.unlockedRoles));
    }

    /**
     * 获取存储的角色解锁状态
     */
    GetUnlockedRolesData() {
        const unlockedRolesKey = this.getKeyWithUserId(this.unlockedRolesKey);
        const unlockedRolesStr = cc.sys.localStorage.getItem(unlockedRolesKey);
        if (unlockedRolesStr) {
            this.unlockedRoles = JSON.parse(unlockedRolesStr);
        } else {
            this.unlockedRoles = [true, false, false, false, false]; // 默认解锁第一个角色
            // 首次运行时保存默认值
            this.SaveUnlockedRolesData();
        }
        console.log('加载角色解锁状态:', this.unlockedRoles);
    }

    /**
     * 存储当前选中角色
     */
    SaveCurrentRoleData() {
        const currentRoleKey = this.getKeyWithUserId(this.currentRoleKey);
        cc.sys.localStorage.setItem(currentRoleKey, this.currentRole.toString());
    }

    /**
     * 获取存储的当前选中角色
     */
    GetCurrentRoleData() {
        const currentRoleKey = this.getKeyWithUserId(this.currentRoleKey);
        const currentRoleStr = cc.sys.localStorage.getItem(currentRoleKey);
        if (currentRoleStr) {
            this.currentRole = parseInt(currentRoleStr);
        } else {
            this.currentRole = 0; // 默认选中第一个角色
            // 首次运行时保存默认值
            this.SaveCurrentRoleData();
        }
        console.log('加载当前选中角色:', this.currentRole);
    }

    /**
     * 存储关卡数据
     */
    public getUnlockedTrainIds(): number[] {
        const key = this.getKeyWithUserId('UnlockedTrainIds');
        const raw = cc.sys.localStorage.getItem(key);
        let ids: number[] = [];

        if (raw) {
            try {
                ids = JSON.parse(raw) || [];
            } catch (error) {
                ids = [];
            }
        }

        ids = ids
            .map((item) => Number(item) || 0)
            .filter((item, index, array) => item > 0 && array.indexOf(item) === index)
            .sort((a, b) => a - b);

        if (ids.indexOf(1) < 0) {
            ids.unshift(1);
        }

        cc.sys.localStorage.setItem(key, JSON.stringify(ids));
        return ids;
    }

    public isTrainUnlocked(trainId: number): boolean {
        return this.getUnlockedTrainIds().indexOf(trainId) >= 0;
    }

    public unlockTrain(trainId: number): void {
        let ids = this.getUnlockedTrainIds();
        if (ids.indexOf(trainId) >= 0) {
            return;
        }

        ids.push(trainId);
        ids = ids.sort((a, b) => a - b);
        cc.sys.localStorage.setItem(this.getKeyWithUserId('UnlockedTrainIds'), JSON.stringify(ids));
        this.requestSyncUserData();
    }

    public getCurrentTrainId(): number {
        const unlockedIds = this.getUnlockedTrainIds();
        const key = this.getKeyWithUserId('CurrentTrainId');
        const raw = cc.sys.localStorage.getItem(key);
        const savedTrainId = raw ? Number(raw) || 0 : 0;

        if (savedTrainId > 0 && unlockedIds.indexOf(savedTrainId) >= 0) {
            return savedTrainId;
        }

        const fallbackTrainId = unlockedIds.length > 0 ? unlockedIds[0] : 1;
        cc.sys.localStorage.setItem(key, `${fallbackTrainId}`);
        return fallbackTrainId;
    }

    public setCurrentTrainId(trainId: number): void {
        if (!this.isTrainUnlocked(trainId)) {
            return;
        }

        const key = this.getKeyWithUserId('CurrentTrainId');
        cc.sys.localStorage.setItem(key, `${trainId}`);
        this.setCurrentKingId(trainId, false);
        this.requestSyncUserData();
    }

    public getCurrentKingId(): number {
        const userKey = this.getKeyWithUserId('CurrentKingId');
        const appKey = LocalStorageKeys.appKey('CurrentKingId');
        const raw = cc.sys.localStorage.getItem(userKey) || cc.sys.localStorage.getItem(appKey);
        const savedKingId = raw ? Number(raw) || 0 : 0;
        if (savedKingId > 0) {
            return savedKingId;
        }
        return this.getCurrentTrainId();
    }

    public setCurrentKingId(kingId: number, sync: boolean = true): void {
        const id = Math.max(1, Number(kingId) || 1);
        cc.sys.localStorage.setItem(this.getKeyWithUserId('CurrentKingId'), `${id}`);
        cc.sys.localStorage.setItem(LocalStorageKeys.appKey('CurrentKingId'), `${id}`);
        if (sync) {
            this.requestSyncUserData();
        }
    }

    SaveLevelData() {
        const currentLevelKey = this.getKeyWithUserId(this.currentLevelKey);
        const unlockedLevelKey = this.getKeyWithUserId(this.unlockedLevelKey);

        cc.sys.localStorage.setItem(currentLevelKey, this.currentLevel.toString());
        cc.sys.localStorage.setItem(unlockedLevelKey, this.unlockedLevel.toString());

        console.log('关卡数据已保存：当前关卡=', this.currentLevel, '已解锁关卡=', this.unlockedLevel);
    }

    /**
     * 获取存储的关卡数据
     */
    GetLevelData() {
        const currentLevelKey = this.getKeyWithUserId(this.currentLevelKey);
        const unlockedLevelKey = this.getKeyWithUserId(this.unlockedLevelKey);

        // 加载当前关卡
        const levelStr = cc.sys.localStorage.getItem(currentLevelKey);
        if (levelStr) {
            this.currentLevel = parseInt(levelStr);
        } else {
            this.currentLevel = 1;
        }

        // 加载已解锁关卡
        const unlockedLevelStr = cc.sys.localStorage.getItem(unlockedLevelKey);
        if (unlockedLevelStr) {
            this.unlockedLevel = parseInt(unlockedLevelStr);
        } else {
            this.unlockedLevel = 1;
        }

        const totalLevels = this.getTotalLevels();
        if (totalLevels > 0) {
            this.currentLevel = Math.max(1, Math.min(totalLevels, Number(this.currentLevel) || 1));
            this.unlockedLevel = Math.max(1, Math.min(totalLevels, Number(this.unlockedLevel) || 1));
        }

        this.loadLevelStarsData();

        console.log('从本地加载关卡数据：当前关卡=', this.currentLevel, '已解锁关卡=', this.unlockedLevel);
    }

    /**
     * 消耗一点体力
     * @returns 是否成功消耗
     */
    ConsumeStamina(): boolean {
        if (this.currentStamina > 0) {
            // Spending the first point from a full stamina bar starts a new
            // recovery interval. Without this reset, a stale timestamp can
            // immediately restore one point before a retry is charged.
            const wasFull = this.currentStamina >= this.maxStamina;
            this.currentStamina--;
            if (wasFull) {
                this.lastRecoverTime = Date.now();
            }
            this.totalConsumedStamina++;
            // Save both stamina fields before starting one immediate request;
            // otherwise each save method would send the same payload twice.
            this.SaveStaminaData(false);
            this.SaveTotalConsumedStaminaData(false);
            this.flushUserDataSyncImmediately();
            return true;
        }
        return false;
    }

    addStamina(amount: number): number {
        const count = Math.max(0, Math.floor(Number(amount) || 0));
        if (count <= 0) {
            return 0;
        }

        const before = this.currentStamina;
        this.currentStamina = Math.min(this.maxStamina, before + count);
        const added = this.currentStamina - before;
        if (added > 0) {
            this.SaveStaminaData();
        }
        return added;
    }

    /**
     * 检查并恢复体力
     */
    CheckAndRecoverStamina() {
        const now = Date.now();
        const timeDiff = now - this.lastRecoverTime;
        const recoverInterval = 10 * 60 * 1000; // 10分钟，单位毫秒

        // 计算应该恢复的体力点数
        const recoverPoints = Math.floor(timeDiff / recoverInterval);

        if (recoverPoints > 0) {
            this.currentStamina = Math.min(this.maxStamina, this.currentStamina + recoverPoints);
            this.lastRecoverTime += recoverPoints * recoverInterval;
            this.SaveStaminaData();
        }
    }

    /**
     * 检查是否有足够的体力开始游戏
     * @returns 是否有足够体力
     */
    HasEnoughStamina(): boolean {
        this.CheckAndRecoverStamina();
        return this.currentStamina > 0;
        // return true
    }

    /**
     * 计算距离下次恢复体力的剩余时间（毫秒）
     * @returns 剩余时间（毫秒），如果体力已满则返回0
     */
    GetRemainingRecoverTime(): number {
        // 如果体力已满，不需要恢复
        if (this.currentStamina >= this.maxStamina) {
            return 0;
        }

        const now = Date.now();
        const timeDiff = now - this.lastRecoverTime;
        const recoverInterval = 10 * 60 * 1000; // 10分钟，单位毫秒

        // 计算距离下次恢复的剩余时间
        const remainingTime = recoverInterval - (timeDiff % recoverInterval);
        return remainingTime;
    }

    /**
     * 获取格式化的恢复倒计时字符串
     * @returns 格式化的时间字符串（MM:SS），如果体力已满则返回空字符串
     */
    GetFormattedRecoverTime(): string {
        const remainingTime = this.GetRemainingRecoverTime();

        if (remainingTime <= 0) {
            return "";
        }

        // 转换为分钟和秒
        const minutes = Math.floor(remainingTime / (60 * 1000));
        const seconds = Math.floor((remainingTime % (60 * 1000)) / 1000);

        // 格式化为MM:SS格式
        return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    /**
     * 记录buff数据
     * @param self 
     */
    initBuffzu(self) {
        this.buffTuji[0] = -1;
        this.buffTuji[1] = -1;
        this.buffTuji[2] = -1;
        if (this.buffTuji[0] == -1) {
            self.Spr1.spriteFrame = null;
            self.Spr2.spriteFrame = null;
            self.Spr3.spriteFrame = null;
        }
    }
    /**
     * 添加buff数据
     * @param num 
     * @param self 
     */
    addBuffNum(num: any, self: any) {
        var num0 = this.buffTuji[0];
        var num1 = this.buffTuji[1];
        if (num1 > -1) {
            if (num1 == num) {
                this.buffTuji[2] = num;
            } else {
                this.buffTuji[1] = -1;
                this.buffTuji[0] = num;
            }
        } else {
            if (num0 > -1) {
                if (num0 == num) {
                    this.buffTuji[1] = num;
                } else {
                    this.buffTuji[0] = num;
                }
            } else {
                this.buffTuji[0] = num;
            }
        }
        this.checkBuff(self);
    }
    /**
     * 检查是否满足buffer
     * @param self 
     */
    checkBuff(self) {
        var num = this.buffTuji[2];
        if (num == -1) return;
        switch (num) {
            case 0:
                this.buff1(self);
                self.PlayBuffAudio();
                this.initBuffzu(self);
                break;
            case 1:
                this.buff2(self);
                self.PlayBuffAudio();
                this.initBuffzu(self);
                break;
            case 2:
                this.buff3(self);
                self.PlayBuffAudio();
                this.initBuffzu(self);
                break;
        }
    }

    buff1(self) {
        self.node.stopAllActions();
        // 检查dun是否存在
        if (self.dun) {
            self.dun.opacity = 255;
        }
        self.anim.play("buff1");
        this.isTouchAgain = false;
        this.playerBuff = true;
        this.BgMoveSpeed = 24;
        var a1 = cc.moveTo(0.5, cc.v2(0, 200));
        var a2 = cc.moveTo(3, cc.v2(250, 100));
        var a3 = cc.moveTo(3, cc.v2(-250, 0));
        var a4 = cc.moveTo(3, cc.v2(250, 0));
        var a5 = cc.moveTo(2, cc.v2(200, -197));
        var a6 = cc.callFunc(() => {
            this.playerBuff = false;
            this.BgMoveSpeed = 8;
            // 重置保护罩位置到人物中心
            if (this.playerHudun) {
                this.playerHudun.y = 0;
            }
            // 确保玩家位置正确，并根据位置设置正确的状态
            if (self) {
                // 检查角色是否到达地面位置
                if (Math.abs(self.node.y + 197) < 10) {
                    // 角色已经在地面，可以恢复跳跃权限
                    this.isTouchAgain = true;
                    // 恢复角色正常跑动动画
                    if (self.node.x > 150) {
                        self.anim.play('y1');
                        this.playerLoc = 1;
                    } else if (self.node.x < -150) {
                        self.anim.play('z1');
                        this.playerLoc = -1;
                    } else {
                        // 如果角色在中间位置，根据当前位置设置方向
                        if (self.node.x > 0) {
                            self.anim.play('y1');
                            this.playerLoc = 1;
                        } else {
                            self.anim.play('z1');
                            this.playerLoc = -1;
                        }
                    }
                }
            }
        });

        var action = cc.sequence(a1, a2, a3, a4, a5, a6);
        self.node.runAction(action);
    }
    buff2(self) {
        self.node.stopAllActions();
        // 检查dun是否存在
        if (self.dun) {
            self.dun.opacity = 255;
        }
        self.anim.play("buff2");
        this.isTouchAgain = false;
        this.playerBuff = true;
        this.BgMoveSpeed = 24;
        var a1 = cc.moveTo(0.5, cc.v2(0, 200));
        var a2 = cc.moveTo(3, cc.v2(250, 100));
        var a3 = cc.moveTo(3, cc.v2(-250, 0));
        var a4 = cc.moveTo(3, cc.v2(250, 0));
        var a5 = cc.moveTo(2, cc.v2(200, -197));
        var a6 = cc.callFunc(() => {
            this.playerBuff = false;
            this.BgMoveSpeed = 8;
            // 重置保护罩位置到人物中心
            if (this.playerHudun) {
                this.playerHudun.y = 0;
            }
            // 确保玩家位置正确，并根据位置设置正确的状态
            if (self) {
                // 检查角色是否到达地面位置
                if (Math.abs(self.node.y + 197) < 10) {
                    // 角色已经在地面，可以恢复跳跃权限
                    this.isTouchAgain = true;
                    // 恢复角色正常跑动动画
                    if (self.node.x > 150) {
                        self.anim.play('y1');
                        this.playerLoc = 1;
                    } else if (self.node.x < -150) {
                        self.anim.play('z1');
                        this.playerLoc = -1;
                    } else {
                        // 如果角色在中间位置，根据当前位置设置方向
                        if (self.node.x > 0) {
                            self.anim.play('y1');
                            this.playerLoc = 1;
                        } else {
                            self.anim.play('z1');
                            this.playerLoc = -1;
                        }
                    }
                }
            }
        });

        var action = cc.sequence(a1, a2, a3, a4, a5, a6);
        self.node.runAction(action);
    }
    buff3(self) {
        // 检查dun是否存在
        if (self.dun) {
            this.playerHudun = self.dun;
            this.playerHudun.y = 100;

            self.node.stopAllActions();
            self.dun.opacity = 255;
            self.anim.play("buff3");
            this.isTouchAgain = false;
            this.playerBuff = true;
            this.BgMoveSpeed = 24;
            var a1 = cc.moveTo(0.5, cc.v2(0, 200));
            var a2 = cc.moveTo(3, cc.v2(250, 100));
            var a3 = cc.moveTo(3, cc.v2(-250, 0));
            var a4 = cc.moveTo(3, cc.v2(250, 0));
            var a5 = cc.moveTo(2, cc.v2(200, -197));
            var a6 = cc.callFunc(() => {
                this.playerBuff = false;
                this.BgMoveSpeed = 8;
                // 重置保护罩位置到人物中心
                if (this.playerHudun) {
                    this.playerHudun.y = 0;
                }
                // 确保玩家位置正确，并根据位置设置正确的状态
                if (self) {
                    // 检查角色是否到达地面位置
                    if (Math.abs(self.node.y + 197) < 10) {
                        // 角色已经在地面，可以恢复跳跃权限
                        this.isTouchAgain = true;
                        // 恢复角色正常跑动动画
                        if (self.node.x > 150) {
                            self.anim.play('y1');
                            this.playerLoc = 1;
                        } else if (self.node.x < -150) {
                            self.anim.play('z1');
                            this.playerLoc = -1;
                        } else {
                            // 如果角色在中间位置，根据当前位置设置方向
                            if (self.node.x > 0) {
                                self.anim.play('y1');
                                this.playerLoc = 1;
                            } else {
                                self.anim.play('z1');
                                this.playerLoc = -1;
                            }
                        }
                    }
                }
            });

            var action = cc.sequence(a1, a2, a3, a4, a5, a6);
            self.node.runAction(action);
        } else {
            console.warn('self.dun未找到，无法执行buff3效果');
        }
    }
    /**
     * buff图片管理
     * @param self 
     */
    changeSprs(self) {
        self.Spr1.spriteFrame = self.SprZu[this.buffTuji[0]];
        self.Spr2.spriteFrame = self.SprZu[this.buffTuji[1]];
        self.Spr3.spriteFrame = self.SprZu[this.buffTuji[2]];
    }
    /**数据初始化 */
    initGame() {
        //控制克隆怪物
        this.isGameBegin = true;
        //开启触屏
        this.playerLoc = -1;
        this.isTouchAgain = true;
        this.EveryScore = 0;
        // 重置玩家buff状态，避免永久无敌
        this.playerBuff = false;
        // 重置速度为初始值
        this.BgMoveSpeed = 8;
        this.MoveSpeed = 10;
        // 重置buff图片状态
        this.buffTuji = [-1, -1, -1];
        // 重置护盾节点
        this.playerHudun = null;
        // 重置PlayerManager引用
        this.playerManager = null;
        // 不改变当前游戏模式（保持无限模式或关卡模式）
        // 无限模式下不重置currentLevel，保持用户进度
    }

    /**
     * 初始化关卡游戏
     */
    initLevelGame() {
        this.initGame();
        this.isInfiniteMode = false;
        this.EveryScore = 0;
    }



    /**
     * 获取指定关卡获得的星星数
     * @param level 关卡数
     * @returns 获得的星星数（0-3）
     */
    getLevelStars(level: number): number {
        if (level < 1 || level > this.getTotalLevels()) {
            console.warn(`获取星星数失败：关卡号${level}无效`);
            return 0;
        }

        const stars = this.levelStarsData[`${level}`];

        const validStars = Math.max(0, Math.min(Number(stars) || 0, 3));

        // 如果关卡已经通过（即小于当前关卡），且本地没有星星数据，给默认1星
        // if (level < this.currentLevel && stars === 0) {
        //     stars = 1;
        //     console.log(`关卡${level}已通过，但本地无星星数据，给默认1星`);
        // }

        return validStars;
    }

    setLevelStars(level: number, stars: number): number {
        const totalLevels = this.getTotalLevels();
        if (level < 1 || (totalLevels > 0 && level > totalLevels)) {
            console.warn(`保存星级失败：关卡 ${level} 无效`);
            return 0;
        }

        const nextStars = Math.max(0, Math.min(3, Number(stars) || 0));
        const currentStars = this.getLevelStars(level);
        const finalStars = Math.max(currentStars, nextStars);
        this.levelStarsData[`${level}`] = finalStars;
        this.saveLevelStarsData();
        return finalStars;
    }

    private saveLevelStarsData(): void {
        const data = JSON.stringify(this.levelStarsData);
        cc.sys.localStorage.setItem(this.getKeyWithUserId(this.levelStarsKey), data);
    }

    private loadLevelStarsData(): void {
        const raw = cc.sys.localStorage.getItem(this.getKeyWithUserId(this.levelStarsKey));
        if (!raw) {
            this.levelStarsData = {};
            return;
        }

        try {
            const parsed = JSON.parse(raw) || {};
            const totalLevels = this.getTotalLevels();
            this.levelStarsData = {};
            Object.keys(parsed).forEach((levelKey) => {
                const level = Number(levelKey) || 0;
                if (level < 1 || (totalLevels > 0 && level > totalLevels)) {
                    return;
                }
                const stars = Math.max(0, Math.min(3, Number(parsed[levelKey]) || 0));
                if (stars > 0) {
                    this.levelStarsData[`${level}`] = stars;
                }
            });
        } catch (error) {
            this.levelStarsData = {};
        }
    }

    private getLevelStarsSnapshot(): { [key: string]: number } {
        const result: { [key: string]: number } = {};
        const totalLevels = Math.max(0, Number(this.getTotalLevels()) || 0);
        for (let level = 1; level <= totalLevels; level++) {
            const stars = this.getLevelStars(level);
            if (stars > 0) {
                result[`${level}`] = stars;
            }
        }
        return result;
    }

    clearLevelStars(): void {
        this.levelStarsData = {};
        this.saveLevelStarsData();
    }

    applyServerRankStars(ranklist: any[], replaceLocal: boolean = false): void {
        if (replaceLocal) {
            this.clearLevelStars();
        }
        if (!Array.isArray(ranklist)) {
            return;
        }

        for (let i = 0; i < ranklist.length; i++) {
            const levelData = ranklist[i];
            if (!levelData || typeof levelData.rank !== 'number') {
                continue;
            }

            const level = Number(levelData.rank) || 0;
            if (level <= 0) {
                continue;
            }

            this.setLevelStars(level, levelData.star || 0);
        }
    }

    /**
     * 重置关卡进度为第一关
     */
    resetLevelProgress() {
        this.currentLevel = 1;
        this.unlockedLevel = 1;
        const currentLevelKey = this.getKeyWithUserId(this.currentLevelKey);
        const unlockedLevelKey = this.getKeyWithUserId(this.unlockedLevelKey);
        cc.sys.localStorage.removeItem(currentLevelKey);
        cc.sys.localStorage.removeItem(unlockedLevelKey);

        this.clearLevelStars();

        console.log('关卡进度已重置，重新从第1关开始');
    }

    /**
     * 获取总关卡数
     * @returns 总关卡数
     */
    getTotalLevels(): number {
        const levelsAsset = cc.resources.get('config/levels', cc.JsonAsset) as cc.JsonAsset;
        const levels = levelsAsset && levelsAsset.json && Array.isArray(levelsAsset.json.levels)
            ? levelsAsset.json.levels
            : null;
        if (levels && levels.length > 0) {
            return levels.length;
        }

        return this.legacyLevelConfigs.length;
    }

    /**
     * 获取已解锁的最高关卡
     * @returns 已解锁的最高关卡号
     */
    getHighestUnlockedLevel(): number {
        // 从最高关卡开始向下遍历，找到第一个已解锁的关卡
        for (let level = this.getTotalLevels(); level >= 2; level--) {
            if (this.isLevelUnlocked(level)) {
                return level;
            }
        }
        // 如果没有找到（理论上不可能，因为第一关总是解锁的），返回第一关
        return 1;
    }

    // 剧情弹窗相关
    /**
     * 获取已通关的最高关卡
     * 当前正在挑战但尚未通关的关卡不参与计算
     */
    getHighestPassedLevel(): number {
        const totalLevels = this.getTotalLevels();
        const unlockedBasedLevel = Math.max(0, Math.min(totalLevels, (Number(this.unlockedLevel) || 1) - 1));

        let starsBasedLevel = 0;
        for (let level = totalLevels; level >= 1; level--) {
            if ((this.getLevelStars(level) || 0) > 0) {
                starsBasedLevel = level;
                break;
            }
        }

        return Math.max(unlockedBasedLevel, starsBasedLevel);
    }

    /**
     * 获取已通关关卡数量
     * 当前未通过关卡不计入通关类成就
     */
    getCompletedLevelCount(): number {
        return Math.max(0, this.getHighestPassedLevel());
    }

    public storyPopupShownKey: string = 'StoryPopupShown';

    private getStoryPopupStorageKey(): string {
        const userId = this.getUserId();
        if (userId) {
            return `${this.storyPopupShownKey}_${userId}`;
        }

        const username = this.getUsername();
        if (username) {
            return `${this.storyPopupShownKey}_${username}`;
        }

        return this.storyPopupShownKey;
    }

    /**
     * 检查剧情弹窗是否已显示
     * @returns 是否已显示
     */
    isStoryPopupShown(): boolean {
        const key = this.getStoryPopupStorageKey();
        const value = cc.sys.localStorage.getItem(key);
        return value === 'true';
    }

    /**
     * 记录剧情弹窗已显示
     */
    setStoryPopupShown() {
        const key = this.getStoryPopupStorageKey();
        cc.sys.localStorage.setItem(key, 'true');
    }

    /**
     * 检查关卡是否解锁
     * @param level 关卡号
     * @returns 是否解锁
     */
    isLevelUnlocked(level: number): boolean {
        // 确保关卡号有效
        const totalLevels = this.getTotalLevels();
        if (level < 1 || level > totalLevels) {
            return false;
        }

        // 所有小于等于已解锁关卡的关卡都应该解锁
        if (level <= this.unlockedLevel) {
            return true;
        }

        // 超过已解锁关卡，按照原逻辑判断
        return false;
    }
}
let mGameData = new GameData();
export default mGameData;
