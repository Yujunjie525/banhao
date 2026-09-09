import { _decorator, Node } from 'cc';
import { GameBackendApi, GameBackendResponse } from '../GameBackendSdk/GameBackendApi';
import { load, save } from './tools';
const { ccclass } = _decorator;

interface UserArchiveData {
    currentGold: number;
    unlockedRoles: boolean[];
    currentRole: number;
    currentStamina: number;
    lastRecoverTime: number;
    completedLevels: number[];
}

@ccclass('gameConfig')
export class gameConfig {
    static readonly APP_ID = 'app.yongshixunzhang3';
    static readonly STORAGE_KEY_USERNAME = 'SLS_USERNAME';

    // 游戏根节点
    static gameRoot: Node = null;
    // 设置音效
    static isSound = 1;
    // 设置音乐
    static isBgm = 1;
    // 音效音量
    static soundVol = 0.9;
    // 音乐音量
    static bgmVol = 0.8;
    // 游戏模式（编辑器还是游戏） 游戏 1编辑
    static gameModel = 0;
    // 当前编辑器模式 1 添加方块 2删除方块 3添加网格 4删除网格
    static editModel = 1;
    // 当前关卡
    static nowLevel = 1;
    // 剩余可复活次数
    static fuhouNum = 1;
    // 剩余移出次数
    static yichuNum = 1;
    // 剩余撤回次数
    static chehuiNum = 1;
    // 剩余打乱次数
    static randomNum = 1;
    // 当前使用的皮肤
    static nowPifu = 1;
    // 第二个皮肤是否解锁
    static pifuIsJiesuo = 0;
    // 是否开启广告
    static isAd = true;
    // 临时关卡（用于关卡选择，不影响解锁进度）
    static tempLevel = 0;
    // 当前正在玩的关卡
    static currentLevel = 0;
    // 当前关卡通关时间（秒）
    static levelTime = 0;
    // 当前钻石数量
    static currentGold = 0;

    // 角色系统相关
    static unlockedRoles: Array<boolean> = [true, false, false, false, false];
    static currentRole = 0;
    static unlockedRolesKey = 'UnlockedRoles';
    static currentRoleKey = 'CurrentRole';
    static rolePrices: Array<number> = [0, 2000, 4000, 6000, 8000];

    // 角色索引定义（从0开始）
    static ROLE_INDEX_DEFAULT = 0;   // 角色1：默认
    static ROLE_INDEX_Revive = 1;     // 角色2：复活（续关1次）
    static ROLE_INDEX_Bonus = 2;     // 角色3：额外+100钻石
    static ROLE_INDEX_Speed = 3;      // 角色4：移动速度+50%
    static ROLE_INDEX_Immune = 4;    // 角色5：无敌/免疫伤害

    static getIsRoleUnlocked(roleIndex: number): boolean {
        return this.unlockedRoles[roleIndex] || false;
    }

    static isCurrentRole(roleIndex: number): boolean {
        return this.currentRole === roleIndex;
    }

    static hasRoleReviveBonus(): boolean {
        return this.isCurrentRole(this.ROLE_INDEX_Revive);
    }

    static hasRoleSpeedBonus(): boolean {
        return this.isCurrentRole(this.ROLE_INDEX_Speed);
    }

    static hasRoleImmuneBonus(): boolean {
        return this.isCurrentRole(this.ROLE_INDEX_Immune);
    }

    static hasRoleBonusGold(): boolean {
        return this.isCurrentRole(this.ROLE_INDEX_Bonus);
    }

    // 存储已通关关卡的key
    static completedLevelsKey = 'CompletedLevels';

    private static userDataSyncTimer: ReturnType<typeof setTimeout> | null = null;
    private static isSavingUserData = false;
    private static hasPendingUserDataSync = false;
    private static cachedUsername = '';
    private static cachedUserId = '';
    private static pendingArchiveSnapshot: UserArchiveData | null = null;

    static setActiveUserContext(username?: string | null, userId?: string | number | null) {
        if (username) {
            this.cachedUsername = String(username);
        }

        if (userId !== undefined && userId !== null && `${userId}` !== '') {
            this.cachedUserId = String(userId);
        }
    }

    static clearActiveUserContext() {
        this.cachedUsername = '';
        this.cachedUserId = '';
        this.pendingArchiveSnapshot = null;
        this.hasPendingUserDataSync = false;

        if (this.userDataSyncTimer) {
            clearTimeout(this.userDataSyncTimer);
            this.userDataSyncTimer = null;
        }
    }

    private static getCurrentUsername(): string {
        const username = load(this.STORAGE_KEY_USERNAME, 0);
        return username ? String(username) : this.cachedUsername;
    }

    private static getCurrentUserId(): string {
        const userId = load('SLS_USER_ID', 0);
        return userId ? String(userId) : this.cachedUserId;
    }

    private static cloneArchiveData(archive: UserArchiveData): UserArchiveData {
        return {
            currentGold: archive.currentGold,
            unlockedRoles: [...archive.unlockedRoles],
            currentRole: archive.currentRole,
            currentStamina: archive.currentStamina,
            lastRecoverTime: archive.lastRecoverTime,
            completedLevels: [...(archive.completedLevels || [])],
        };
    }

    static updateArchiveSnapshot(partialArchive: Partial<UserArchiveData>) {
        const baseArchive = this.pendingArchiveSnapshot
            ? this.cloneArchiveData(this.pendingArchiveSnapshot)
            : this.getUserArchiveData();

        const nextArchive: UserArchiveData = {
            currentGold: typeof partialArchive.currentGold === 'number'
                ? Math.max(0, Math.floor(partialArchive.currentGold))
                : baseArchive.currentGold,
            unlockedRoles: partialArchive.unlockedRoles
                ? [...partialArchive.unlockedRoles]
                : [...baseArchive.unlockedRoles],
            currentRole: typeof partialArchive.currentRole === 'number'
                ? Math.floor(partialArchive.currentRole)
                : baseArchive.currentRole,
            currentStamina: typeof partialArchive.currentStamina === 'number'
                ? Math.max(0, Math.floor(partialArchive.currentStamina))
                : baseArchive.currentStamina,
            lastRecoverTime: typeof partialArchive.lastRecoverTime === 'number'
                ? Number(partialArchive.lastRecoverTime)
                : baseArchive.lastRecoverTime,
            completedLevels: partialArchive.completedLevels
                ? [...partialArchive.completedLevels]
                : [...(baseArchive.completedLevels || [])],
        };

        this.pendingArchiveSnapshot = nextArchive;
    }

    /**
     * 获取带用户ID的存储键
     */
    static getKeyWithUserId(key: string): string {
        const userId = this.getCurrentUserId();
        return userId ? `${key}_${userId}` : key;
    }

    private static getStoredGold(): number {
        const goldKey = this.getKeyWithUserId('CurrentGold');
        const savedGold = load(goldKey, 1);
        if (savedGold !== null && !Number.isNaN(savedGold)) {
            return Math.max(0, Number(savedGold));
        }

        const defaultGold = load('CurrentGold', 1);
        if (defaultGold !== null && !Number.isNaN(defaultGold)) {
            return Math.max(0, Number(defaultGold));
        }

        return 0;
    }

    private static getStaminaStorageKey(): string {
        const userId = this.getCurrentUserId();
        return 'SLS_STAMINA_' + (userId ? String(userId) : 'default');
    }

    private static getRecoverTimeStorageKey(): string {
        const userId = this.getCurrentUserId();
        return 'SLS_RECOVER_TIME_' + (userId ? String(userId) : 'default');
    }

    private static getStoredStamina(): number {
        const savedStamina = load(this.getStaminaStorageKey(), 1);
        if (savedStamina !== null && !Number.isNaN(savedStamina)) {
            return Math.max(0, Number(savedStamina));
        }
        return 30;
    }

    private static getStoredRecoverTime(): number {
        const savedRecoverTime = load(this.getRecoverTimeStorageKey(), 1);
        if (savedRecoverTime !== null && !Number.isNaN(savedRecoverTime)) {
            return Number(savedRecoverTime);
        }
        return Date.now();
    }

    private static normalizeUnlockedRoles(source: unknown): boolean[] | null {
        if (!Array.isArray(source)) {
            return null;
        }

        const totalRoles = this.rolePrices.length;
        const normalizedRoles = new Array<boolean>(totalRoles).fill(false);
        for (let i = 0; i < totalRoles; i++) {
            normalizedRoles[i] = Boolean(source[i]);
        }

        normalizedRoles[0] = true;
        return normalizedRoles;
    }

    private static getStoredUnlockedRoles(): boolean[] {
        const unlockedRolesKey = this.getKeyWithUserId(this.unlockedRolesKey);
        const unlockedRolesStr = load(unlockedRolesKey, 0);
        if (!unlockedRolesStr) {
            return [true, false, false, false, false];
        }

        try {
            return this.normalizeUnlockedRoles(JSON.parse(unlockedRolesStr)) || [true, false, false, false, false];
        } catch (error) {
            console.error('解析本地角色解锁数据失败:', error);
            return [true, false, false, false, false];
        }
    }

    private static getFirstUnlockedRoleIndex(roles: boolean[] = this.unlockedRoles): number {
        const foundIndex = roles.findIndex((item) => item);
        return foundIndex >= 0 ? foundIndex : 0;
    }

    private static getStoredCurrentRole(roles: boolean[] = this.unlockedRoles): number {
        const currentRoleKey = this.getKeyWithUserId(this.currentRoleKey);
        const currentRoleStr = load(currentRoleKey, 0);
        const fallbackRole = this.getFirstUnlockedRoleIndex(roles);
        if (!currentRoleStr) {
            return fallbackRole;
        }

        const roleIndex = parseInt(currentRoleStr, 10);
        if (Number.isNaN(roleIndex) || roleIndex < 0 || roleIndex >= roles.length || !roles[roleIndex]) {
            return fallbackRole;
        }

        return roleIndex;
    }

    static LoadGoldData() {
        this.currentGold = this.getStoredGold();
        console.log(`加载钻石数据：${this.currentGold}`);
    }

    /**
     * 存储角色解锁状态
     */
    static SaveUnlockedRolesData(syncToServer = true) {
        const unlockedRolesKey = this.getKeyWithUserId(this.unlockedRolesKey);
        save(unlockedRolesKey, JSON.stringify(this.unlockedRoles));
        this.updateArchiveSnapshot({
            unlockedRoles: [...this.unlockedRoles],
        });

        if (syncToServer) {
            this.scheduleUserDataSync();
        }
    }

    /**
     * 获取存储的角色解锁状态
     */
    static GetUnlockedRolesData() {
        this.unlockedRoles = this.getStoredUnlockedRoles();
        const unlockedRolesKey = this.getKeyWithUserId(this.unlockedRolesKey);
        if (load(unlockedRolesKey, 0) === null) {
            this.SaveUnlockedRolesData(false);
        }
        console.log('加载角色解锁状态:', this.unlockedRoles);
    }

    /**
     * 存储当前选中角色
     */
    static SaveCurrentRoleData(syncToServer = true) {
        const currentRoleKey = this.getKeyWithUserId(this.currentRoleKey);
        save(currentRoleKey, this.currentRole.toString());
        this.updateArchiveSnapshot({
            currentRole: this.currentRole,
        });

        if (syncToServer) {
            this.scheduleUserDataSync();
        }
    }

    /**
     * 获取存储的当前选中角色
     */
    static GetCurrentRoleData() {
        this.currentRole = this.getStoredCurrentRole(this.unlockedRoles);
        const currentRoleKey = this.getKeyWithUserId(this.currentRoleKey);
        if (load(currentRoleKey, 0) === null) {
            this.SaveCurrentRoleData(false);
        }
        console.log('加载当前选中角色:', this.currentRole);
    }

    /**
     * 检查角色是否解锁
     */
    static isRoleUnlocked(roleIndex: number): boolean {
        return this.unlockedRoles[roleIndex] || false;
    }

    /**
     * 保存钻石数据
     */
    static SaveGoldData(syncToServer = true) {
        const goldKey = this.getKeyWithUserId('CurrentGold');
        save(goldKey, this.currentGold.toString());
        save('CurrentGold', this.currentGold.toString());
        this.updateArchiveSnapshot({
            currentGold: this.currentGold,
        });

        if (syncToServer) {
            this.scheduleUserDataSync();
        }
    }

    /**
     * 初始化当前用户本地存档
     */
    static LoadUserDataFromLocal() {
        this.LoadGoldData();
        this.GetUnlockedRolesData();
        this.GetCurrentRoleData();
    }

    /**
     * 解锁角色
     */
    static unlockRole(roleIndex: number): boolean {
        if (this.isRoleUnlocked(roleIndex)) {
            return false;
        }

        const price = this.rolePrices[roleIndex];
        if (this.currentGold >= price) {
            this.currentGold -= price;
            this.unlockedRoles[roleIndex] = true;
            this.SaveUnlockedRolesData();
            this.SaveGoldData();
            return true;
        }
        return false;
    }

    /**
     * 设置当前角色
     */
    static setCurrentRole(roleIndex: number) {
        if (this.isRoleUnlocked(roleIndex)) {
            this.currentRole = roleIndex;
            this.SaveCurrentRoleData();
        }
    }

    /**
     * 获取当前角色ID（1-5）
     */
    static getCurrentPlayerId(): number {
        return this.currentRole + 1;
    }

    /**
     * 初始化角色数据
     */
    static initRoleData() {
        this.GetUnlockedRolesData();
        this.GetCurrentRoleData();
    }

    private static getStoredCompletedLevels(): number[] {
        const completedLevelsKey = this.getKeyWithUserId(this.completedLevelsKey);
        const completedLevelsStr = load(completedLevelsKey, 0);
        if (completedLevelsStr) {
            try {
                return JSON.parse(completedLevelsStr);
            } catch (error) {
                console.error('解析已通关关卡数据失败:', error);
                return [];
            }
        }
        return [];
    }

    /**
     * 组装当前用户存档
     */
    static getUserArchiveData(): UserArchiveData {
        if (this.pendingArchiveSnapshot) {
            return this.cloneArchiveData(this.pendingArchiveSnapshot);
        }

        const unlockedRoles = this.getStoredUnlockedRoles();
        return {
            currentGold: this.getStoredGold(),
            unlockedRoles,
            currentRole: this.getStoredCurrentRole(unlockedRoles),
            currentStamina: this.getStoredStamina(),
            lastRecoverTime: this.getStoredRecoverTime(),
            completedLevels: this.getStoredCompletedLevels(),
        };
    }

    private static extractServerJsonData(result: GameBackendResponse): string | null {
        if (typeof result.data === 'string' && result.data.trim()) {
            return result.data;
        }

        if (result.data && typeof result.data === 'object') {
            const payload = result.data as Record<string, unknown>;
            if (typeof payload.jsondata === 'string' && payload.jsondata.trim()) {
                return payload.jsondata;
            }
            if (typeof payload.jsonData === 'string' && payload.jsonData.trim()) {
                return payload.jsonData;
            }
        }

        if (typeof result.jsondata === 'string' && result.jsondata.trim()) {
            return result.jsondata;
        }

        return null;
    }

    /**
     * 从服务端拉取用户存档并覆盖本地
     */
    static async SyncUserDataFromServer(): Promise<boolean> {
        const username = this.getCurrentUsername();
        if (!username) {
            return false;
        }

        try {
            const result = await GameBackendApi.getUserData({
                appid: this.APP_ID,
                username,
            });

            if (result.code !== 0) {
                console.warn('获取服务端用户存档失败:', result.msg || result.code);
                return false;
            }

            const jsonText = this.extractServerJsonData(result);
            if (!jsonText) {
                console.log('服务端暂无用户存档数据');
                return false;
            }

            const serverData = JSON.parse(jsonText) as Partial<UserArchiveData>;
            const nextGold = typeof serverData.currentGold === 'number' && !Number.isNaN(serverData.currentGold)
                ? Math.max(0, Math.floor(serverData.currentGold))
                : this.getStoredGold();
            const nextUnlockedRoles = this.normalizeUnlockedRoles(serverData.unlockedRoles) || this.getStoredUnlockedRoles();
            const nextStamina = typeof serverData.currentStamina === 'number' && !Number.isNaN(serverData.currentStamina)
                ? Math.max(0, Math.floor(serverData.currentStamina))
                : this.getStoredStamina();
            const nextRecoverTime = typeof serverData.lastRecoverTime === 'number' && !Number.isNaN(serverData.lastRecoverTime)
                ? Number(serverData.lastRecoverTime)
                : this.getStoredRecoverTime();
            const nextCompletedLevels = Array.isArray(serverData.completedLevels)
                ? serverData.completedLevels.filter(l => typeof l === 'number' && l > 0)
                : this.getStoredCompletedLevels();

            let nextCurrentRole = this.getStoredCurrentRole(nextUnlockedRoles);
            if (typeof serverData.currentRole === 'number' && !Number.isNaN(serverData.currentRole)) {
                nextCurrentRole = Math.floor(serverData.currentRole);
            }
            if (nextCurrentRole < 0 || nextCurrentRole >= nextUnlockedRoles.length || !nextUnlockedRoles[nextCurrentRole]) {
                nextCurrentRole = this.getFirstUnlockedRoleIndex(nextUnlockedRoles);
            }

            this.currentGold = nextGold;
            this.unlockedRoles = nextUnlockedRoles;
            this.currentRole = nextCurrentRole;

            this.SaveGoldData(false);
            this.SaveUnlockedRolesData(false);
            this.SaveCurrentRoleData(false);
            save(this.getStaminaStorageKey(), nextStamina.toString());
            save(this.getRecoverTimeStorageKey(), nextRecoverTime.toString());
            
            const completedLevelsKey = this.getKeyWithUserId(this.completedLevelsKey);
            save(completedLevelsKey, JSON.stringify(nextCompletedLevels));
            
            this.updateArchiveSnapshot({
                currentGold: this.currentGold,
                unlockedRoles: [...this.unlockedRoles],
                currentRole: this.currentRole,
                currentStamina: nextStamina,
                lastRecoverTime: nextRecoverTime,
                completedLevels: nextCompletedLevels,
            });

            console.log('服务端用户存档同步成功:', {
                currentGold: this.currentGold,
                unlockedRoles: this.unlockedRoles,
                currentRole: this.currentRole,
                currentStamina: nextStamina,
                lastRecoverTime: nextRecoverTime,
                completedLevels: nextCompletedLevels,
            });
            return true;
        } catch (error) {
            console.error('同步服务端用户存档失败:', error);
            return false;
        }
    }

    /**
     * 数据变更后延迟上报，避免一次操作发送多次请求
     */
    static scheduleUserDataSync(immediate = false) {
        const username = this.getCurrentUsername();
        if (!username) {
            return;
        }

        this.cachedUsername = username;
        this.hasPendingUserDataSync = true;

        if (this.isSavingUserData) {
            return;
        }

        if (immediate) {
            if (this.userDataSyncTimer) {
                clearTimeout(this.userDataSyncTimer);
                this.userDataSyncTimer = null;
            }
            void this.flushUserDataToServer();
            return;
        }

        if (this.userDataSyncTimer) {
            return;
        }

        this.userDataSyncTimer = setTimeout(() => {
            this.userDataSyncTimer = null;
            void this.flushUserDataToServer();
        }, 200);
    }

    /**
     * 立即把当前存档写回服务端
     */
    static async flushUserDataToServer(): Promise<void> {
        const username = this.getCurrentUsername();
        if (!username) {
            this.hasPendingUserDataSync = false;
            return;
        }

        if (this.isSavingUserData) {
            this.hasPendingUserDataSync = true;
            return;
        }

        this.hasPendingUserDataSync = false;
        this.isSavingUserData = true;
        let archive: UserArchiveData | null = null;

        try {
            archive = this.getUserArchiveData();
            this.pendingArchiveSnapshot = null;
            const result = await GameBackendApi.saveUserData({
                appid: this.APP_ID,
                username,
                jsondata: JSON.stringify(archive),
            });

            if (result.code !== 0) {
                this.pendingArchiveSnapshot = archive;
                console.warn('保存服务端用户存档失败:', result.msg || result.code);
            }
        } catch (error) {
            if (archive) {
                this.pendingArchiveSnapshot = archive;
            }
            console.error('保存服务端用户存档异常:', error);
        } finally {
            this.isSavingUserData = false;
            if (this.hasPendingUserDataSync) {
                this.scheduleUserDataSync(true);
            }
        }
    }

    /**
     * 检查关卡是否已经通关
     */
    static isLevelCompleted(level: number): boolean {
        const completedLevelsKey = this.getKeyWithUserId(this.completedLevelsKey);
        const completedLevelsStr = load(completedLevelsKey, 0);
        if (completedLevelsStr) {
            const completedLevels: number[] = JSON.parse(completedLevelsStr);
            return completedLevels.indexOf(level) !== -1;
        }
        return false;
    }

    /**
     * 标记关卡为已通关
     */
    static markLevelCompleted(level: number) {
        const completedLevelsKey = this.getKeyWithUserId(this.completedLevelsKey);
        const completedLevelsStr = load(completedLevelsKey, 0);
        let completedLevels: number[] = [];
        if (completedLevelsStr) {
            completedLevels = JSON.parse(completedLevelsStr);
        }
        if (completedLevels.indexOf(level) === -1) {
            completedLevels.push(level);
            save(completedLevelsKey, JSON.stringify(completedLevels));
        }
    }

    /**
     * 处理关卡通关奖励
     */
    static awardLevelCompletion(level: number): void {
        let baseGold = 0;
        if (!this.isLevelCompleted(level)) {
            baseGold = 100;
        } else {
            baseGold = 10;
        }

        let extraGold = 0;
        if (this.hasRoleBonusGold()) {
            extraGold = 100;
        }

        this.currentGold += baseGold + extraGold;
        this.SaveGoldData();

        if (!this.isLevelCompleted(level)) {
            this.markLevelCompleted(level);
        }
    }

    /**
     * 处理三倍奖励
     */
    static awardTripleLevelCompletion(level: number): void {
        let baseGold = 0;
        if (!this.isLevelCompleted(level)) {
            baseGold = 100;
        } else {
            baseGold = 10;
        }

        let extraGold = 0;
        if (this.hasRoleBonusGold()) {
            extraGold = 100;
        }

        const totalReward = baseGold * 3 + extraGold;
        this.currentGold += totalReward;
        this.SaveGoldData();

        if (!this.isLevelCompleted(level)) {
            this.markLevelCompleted(level);
        }
    }
}
