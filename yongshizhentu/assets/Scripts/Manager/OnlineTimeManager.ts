const { ccclass } = cc._decorator;

const UserDataSyncManager = require('./UserDataSyncManager').default;

class OnlineTimeManagerStatic {
    private static onlineTimer: any = null;
    private static onlineMinutes: number = 0;
    private static todayDate: string = '';
    private static initialized: boolean = false;
    private static currentUserId: string | null = null;

    private static readonly dailyRewardDateKey: string = 'dailyRewardDate';
    private static readonly dailyRewardClaimedKey: string = 'dailyRewardClaimed';
    private static readonly dailyOnlineMinutesKey: string = 'dailyOnlineMinutes';

    private static getUserId(): string | null {
        return cc.sys.localStorage.getItem('SLS_USER_ID');
    }

    private static getKeyWithUserId(baseKey: string): string {
        const userId = this.getUserId();
        if (userId) {
            return `${baseKey}_${userId}`;
        }
        return baseKey;
    }

    private static updateTodayDate(): void {
        const today = new Date();
        this.todayDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    }

    private static readOnlineMinutesFromStorage(): number {
        const onlineMinutesKey = this.getKeyWithUserId(this.dailyOnlineMinutesKey);
        const onlineMinutesStr = cc.sys.localStorage.getItem(onlineMinutesKey);
        if (!onlineMinutesStr) {
            return 0;
        }

        const parsed = parseInt(onlineMinutesStr, 10);
        return Number.isNaN(parsed) ? 0 : Math.max(0, parsed);
    }

    private static saveOnlineMinutes(minutes: number): void {
        const onlineMinutesKey = this.getKeyWithUserId(this.dailyOnlineMinutesKey);
        cc.sys.localStorage.setItem(onlineMinutesKey, minutes.toString());
        UserDataSyncManager.requestUpload();
    }

    private static checkNewDay(): void {
        const rewardDateKey = this.getKeyWithUserId(this.dailyRewardDateKey);
        const claimedKey = this.getKeyWithUserId(this.dailyRewardClaimedKey);
        const onlineMinutesKey = this.getKeyWithUserId(this.dailyOnlineMinutesKey);

        const savedDate = cc.sys.localStorage.getItem(rewardDateKey);
        if (!savedDate || savedDate !== this.todayDate) {
            cc.sys.localStorage.setItem(rewardDateKey, this.todayDate);
            cc.sys.localStorage.setItem(claimedKey, JSON.stringify([]));
            cc.sys.localStorage.setItem(onlineMinutesKey, '0');
            UserDataSyncManager.requestUpload();
        }
    }

    private static syncUserScopeIfNeeded(): void {
        const latestUserId = this.getUserId();
        if (latestUserId !== this.currentUserId) {
            this.currentUserId = latestUserId;
            this.updateTodayDate();
            this.checkNewDay();
            this.onlineMinutes = this.readOnlineMinutesFromStorage();
        }
    }

    public static initialize(): void {
        if (this.initialized) {
            return;
        }

        this.initialized = true;
        this.currentUserId = this.getUserId();

        this.updateTodayDate();
        this.checkNewDay();
        this.onlineMinutes = this.readOnlineMinutesFromStorage();
        this.startOnlineTimer();
    }

    private static startOnlineTimer(): void {
        if (this.onlineTimer) {
            clearInterval(this.onlineTimer);
        }

        this.onlineTimer = setInterval(() => {
            this.syncUserScopeIfNeeded();
            this.updateTodayDate();
            this.checkNewDay();

            this.onlineMinutes += 1;
            this.saveOnlineMinutes(this.onlineMinutes);
            console.log(`当前在线时长: ${this.onlineMinutes} 分钟`);
        }, 60000);
    }

    public static stopOnlineTimer(): void {
        if (this.onlineTimer) {
            clearInterval(this.onlineTimer);
            this.onlineTimer = null;
        }
    }

    public static getOnlineMinutes(): number {
        this.syncUserScopeIfNeeded();
        this.updateTodayDate();
        this.checkNewDay();

        this.onlineMinutes = this.readOnlineMinutesFromStorage();
        return this.onlineMinutes;
    }

    public static getCurrentOnlineMinutes(): number {
        this.syncUserScopeIfNeeded();
        return this.onlineMinutes;
    }
}

@ccclass
export default class OnlineTimeManager extends cc.Component {
    private static _instance: OnlineTimeManager = null;

    public static get Instance(): OnlineTimeManager {
        if (!this._instance) {
            console.error('OnlineTimeManager instance not initialized');
        }
        return this._instance;
    }

    protected onLoad(): void {
        if (!OnlineTimeManager._instance) {
            OnlineTimeManager._instance = this;
            OnlineTimeManagerStatic.initialize();
        } else {
            this.node.destroy();
        }
    }

    protected onDestroy(): void {
        // 静态管理器继续运行，不在此停止
    }

    public getOnlineMinutes(): number {
        return OnlineTimeManagerStatic.getOnlineMinutes();
    }

    public getCurrentOnlineMinutes(): number {
        return OnlineTimeManagerStatic.getCurrentOnlineMinutes();
    }
}
