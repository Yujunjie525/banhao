import { _decorator, Component, sys } from 'cc';
import { load, save } from '../utils/tools';

const { ccclass } = _decorator;

class OnlineTimeManagerStatic {
    private static onlineTimer: ReturnType<typeof setInterval> | null = null;
    private static onlineMinutes = 0;
    private static todayDate = '';
    private static initialized = false;
    private static currentUserId = '';
    private static lastTickTime = 0;

    private static readonly dailyRewardDateKey = 'dailyRewardDate';
    private static readonly dailyRewardClaimedKey = 'dailyRewardClaimed';
    private static readonly dailyOnlineMinutesKey = 'dailyOnlineMinutes';
    private static readonly totalOnlineMinutesKey = 'totalOnlineMinutes';

    private static getUserId() {
        return sys.localStorage.getItem('SLS_USER_ID') || 'default';
    }

    private static getKeyWithUserId(baseKey: string) {
        return `${baseKey}_${this.getUserId()}`;
    }

    private static updateTodayDate() {
        const today = new Date();
        const month = today.getMonth() + 1;
        const date = today.getDate();
        const monthText = month < 10 ? `0${month}` : `${month}`;
        const dateText = date < 10 ? `0${date}` : `${date}`;
        this.todayDate = `${today.getFullYear()}-${monthText}-${dateText}`;
    }

    private static readTodayOnlineMinutesFromStorage() {
        const onlineMinutesKey = this.getKeyWithUserId(this.dailyOnlineMinutesKey);
        const onlineMinutes = load(onlineMinutesKey, 1);
        return onlineMinutes === null ? 0 : Math.max(0, Number(onlineMinutes) || 0);
    }

    private static saveTodayOnlineMinutes(minutes: number) {
        const onlineMinutesKey = this.getKeyWithUserId(this.dailyOnlineMinutesKey);
        save(onlineMinutesKey, minutes);
    }

    private static readTotalOnlineMinutesFromStorage() {
        const totalOnlineMinutesKey = this.getKeyWithUserId(this.totalOnlineMinutesKey);
        const totalOnlineMinutes = load(totalOnlineMinutesKey, 1);
        return totalOnlineMinutes === null ? null : Math.max(0, Number(totalOnlineMinutes) || 0);
    }

    private static saveTotalOnlineMinutes(minutes: number) {
        const totalOnlineMinutesKey = this.getKeyWithUserId(this.totalOnlineMinutesKey);
        save(totalOnlineMinutesKey, minutes);
    }

    private static ensureTotalOnlineMinutesInitialized() {
        const totalOnlineMinutes = this.readTotalOnlineMinutesFromStorage();
        if (totalOnlineMinutes !== null) {
            return;
        }

        this.saveTotalOnlineMinutes(this.readTodayOnlineMinutesFromStorage());
    }

    private static checkNewDay() {
        const rewardDateKey = this.getKeyWithUserId(this.dailyRewardDateKey);
        const claimedKey = this.getKeyWithUserId(this.dailyRewardClaimedKey);
        const onlineMinutesKey = this.getKeyWithUserId(this.dailyOnlineMinutesKey);

        const savedDate = load(rewardDateKey, 0);
        if (!savedDate || savedDate !== this.todayDate) {
            save(rewardDateKey, this.todayDate);
            save(claimedKey, []);
            save(onlineMinutesKey, 0);
            this.onlineMinutes = 0;
        }
    }

    private static syncUserScopeIfNeeded() {
        const latestUserId = this.getUserId();
        if (latestUserId !== this.currentUserId) {
            this.currentUserId = latestUserId;
            this.updateTodayDate();
            this.checkNewDay();
            this.onlineMinutes = this.readTodayOnlineMinutesFromStorage();
            this.ensureTotalOnlineMinutesInitialized();
            this.lastTickTime = Date.now();
        }
    }

    public static initialize() {
        this.syncUserScopeIfNeeded();
        this.updateTodayDate();
        this.checkNewDay();
        this.ensureTotalOnlineMinutesInitialized();

        if (!this.initialized) {
            this.onlineMinutes = this.readTodayOnlineMinutesFromStorage();
            this.lastTickTime = Date.now();
            this.initialized = true;
            this.startOnlineTimer();
            return;
        }

        this.onlineMinutes = this.readTodayOnlineMinutesFromStorage();
        if (!this.lastTickTime) {
            this.lastTickTime = Date.now();
        }
        this.startOnlineTimer();
    }

    private static startOnlineTimer() {
        if (this.onlineTimer) {
            return;
        }

        this.onlineTimer = setInterval(() => {
            this.tick();
        }, 1000);
    }

    private static tick() {
        this.syncUserScopeIfNeeded();
        this.updateTodayDate();
        this.checkNewDay();

        const now = Date.now();
        if (!this.lastTickTime) {
            this.lastTickTime = now;
            return;
        }

        const diff = now - this.lastTickTime;
        if (diff < 60000) {
            return;
        }

        const addMinutes = Math.floor(diff / 60000);
        this.lastTickTime = now;

        this.onlineMinutes = this.readTodayOnlineMinutesFromStorage() + addMinutes;
        this.saveTodayOnlineMinutes(this.onlineMinutes);

        const totalOnlineMinutes = (this.readTotalOnlineMinutesFromStorage() || 0) + addMinutes;
        this.saveTotalOnlineMinutes(totalOnlineMinutes);

        console.log(`今日在线时长: ${this.onlineMinutes} 分钟，累计在线时长: ${totalOnlineMinutes} 分钟`);
    }

    public static stopOnlineTimer() {
        if (this.onlineTimer) {
            clearInterval(this.onlineTimer);
            this.onlineTimer = null;
        }
    }

    public static getOnlineMinutes() {
        return this.getTodayOnlineMinutes();
    }

    public static getTodayOnlineMinutes() {
        this.initialize();
        this.onlineMinutes = this.readTodayOnlineMinutesFromStorage();
        return this.onlineMinutes;
    }

    public static getCurrentOnlineMinutes() {
        return this.getTodayOnlineMinutes();
    }

    public static getTotalOnlineMinutes() {
        this.initialize();
        return this.readTotalOnlineMinutesFromStorage() || 0;
    }
}

@ccclass('OnlineTimeManager')
export default class OnlineTimeManager extends Component {
    private static _instance: OnlineTimeManager = null;

    public static get Instance(): OnlineTimeManager {
        return this._instance;
    }

    public static initialize() {
        OnlineTimeManagerStatic.initialize();
    }

    public static getOnlineMinutes() {
        return OnlineTimeManagerStatic.getOnlineMinutes();
    }

    public static getTodayOnlineMinutes() {
        return OnlineTimeManagerStatic.getTodayOnlineMinutes();
    }

    public static getCurrentOnlineMinutes() {
        return OnlineTimeManagerStatic.getCurrentOnlineMinutes();
    }

    public static getTotalOnlineMinutes() {
        return OnlineTimeManagerStatic.getTotalOnlineMinutes();
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
        if (OnlineTimeManager._instance === this) {
            OnlineTimeManager._instance = null;
        }
    }
}
