import { load, save } from './tools';

export class GameData {
    private static _instance: GameData = null;
    private lifecycleHooksBound: boolean = false;
    public static get inst(): GameData {
        if (this._instance === null) {
            this._instance = new GameData();
        }
        return this._instance;
    }

    public maxStamina: number = 30;
    public currentStamina: number = 30;
    public lastRecoverTime: number = 0;
    public staminaRecoveryPaused: boolean = false;
    public staminaPausedAt: number = 0;

    constructor() {
        this.bindLifecycleHooks();
    }

    private getUserId(): string {
        const userId = load('SLS_USER_ID', 0);
        return userId ? String(userId) : 'default';
    }

    private getStaminaKey(): string {
        return 'SLS_STAMINA_' + this.getUserId();
    }

    private getRecoverTimeKey(): string {
        return 'SLS_RECOVER_TIME_' + this.getUserId();
    }

    private isLoggedIn(): boolean {
        return !!cc.sys.localStorage.getItem('SLS_USERNAME');
    }

    private getGlobal(): any {
        return require('./Global');
    }

    private bindLifecycleHooks() {
        if (this.lifecycleHooksBound || !cc || !cc.game) {
            return;
        }

        this.lifecycleHooksBound = true;

        cc.game.on(cc.game.EVENT_HIDE, () => {
            if (this.isLoggedIn()) {
                this.PauseStaminaRecovery();
            }
        });

        cc.game.on(cc.game.EVENT_SHOW, () => {
            if (this.isLoggedIn()) {
                this.ResumeStaminaRecovery();
            }
        });
    }

    private syncStaminaToGlobal() {
        const Global = this.getGlobal();
        if (!Global.userData || typeof Global.userData !== 'object') {
            Global.userData = Global.getDefaultUserData ? Global.getDefaultUserData() : {};
        }

        Global.userData.currentStamina = this.currentStamina;
        Global.userData.lastRecoverTime = this.lastRecoverTime;
        Global.userData.staminaRecoveryPaused = this.staminaRecoveryPaused;
        Global.userData.staminaPausedAt = this.staminaPausedAt;
    }

    private loadStaminaFromGlobal(): boolean {
        const Global = this.getGlobal();
        const userData = Global && Global.userData;
        if (!userData || typeof userData !== 'object') {
            return false;
        }

        const stamina = Number(userData.currentStamina);
        const recoverTime = Number(userData.lastRecoverTime);
        const hasStamina = !isNaN(stamina);
        const hasRecoverTime = !isNaN(recoverTime);
        this.staminaRecoveryPaused = userData.staminaRecoveryPaused === true || userData.staminaRecoveryPaused === 1 || userData.staminaRecoveryPaused === '1';
        this.staminaPausedAt = Number(userData.staminaPausedAt) || 0;

        if (!hasStamina && !hasRecoverTime) {
            return false;
        }

        this.currentStamina = hasStamina ? Math.max(0, Math.min(this.maxStamina, stamina)) : this.maxStamina;
        this.lastRecoverTime = hasRecoverTime ? recoverTime : 0;
        return true;
    }

    SaveStaminaData() {
        this.currentStamina = Math.max(0, Math.min(this.maxStamina, this.currentStamina));
        if (!this.lastRecoverTime || this.lastRecoverTime < 0) {
            this.lastRecoverTime = Date.now();
        }

        this.syncStaminaToGlobal();
        save(this.getStaminaKey(), this.currentStamina);
        save(this.getRecoverTimeKey(), this.lastRecoverTime);

        const Global = this.getGlobal();
        if (Global && typeof Global.saveData === 'function') {
            Global.saveData();
        }
    }

    PauseStaminaRecovery() {
        if (this.currentStamina >= this.maxStamina || this.staminaRecoveryPaused) {
            return;
        }

        this.staminaRecoveryPaused = true;
        this.staminaPausedAt = Date.now();
        this.SaveStaminaData();
    }

    ResumeStaminaRecovery() {
        if (!this.staminaRecoveryPaused) {
            return;
        }

        if (this.currentStamina < this.maxStamina && this.staminaPausedAt > 0) {
            this.lastRecoverTime += Date.now() - this.staminaPausedAt;
        }

        this.staminaRecoveryPaused = false;
        this.staminaPausedAt = 0;
        this.SaveStaminaData();
    }

    LoadStaminaData() {
        const loadedFromGlobal = this.loadStaminaFromGlobal();
        let needsPersist = !loadedFromGlobal;

        if (!loadedFromGlobal) {
            const savedStamina = load(this.getStaminaKey(), 1);
            const savedTime = load(this.getRecoverTimeKey(), 1);

            if (savedStamina !== null) {
                this.currentStamina = savedStamina;
            } else {
                this.currentStamina = this.maxStamina;
            }

            if (savedTime !== null) {
                this.lastRecoverTime = savedTime;
            } else {
                this.lastRecoverTime = Date.now();
            }
        }

        const normalizedStamina = Math.max(0, Math.min(this.maxStamina, Number(this.currentStamina) || 0));
        if (normalizedStamina !== this.currentStamina) {
            needsPersist = true;
        }
        this.currentStamina = normalizedStamina;

        if (!this.lastRecoverTime || this.lastRecoverTime < 0) {
            this.lastRecoverTime = Date.now();
            needsPersist = true;
        }

        if (this.isLoggedIn()) {
            if (this.staminaRecoveryPaused) {
                this.ResumeStaminaRecovery();
            }
        } else if (!this.staminaRecoveryPaused && this.currentStamina < this.maxStamina) {
            this.staminaRecoveryPaused = true;
            this.staminaPausedAt = Date.now();
            needsPersist = true;
        }

        if (this.staminaRecoveryPaused) {
            if (needsPersist) {
                this.SaveStaminaData();
            }
            return;
        }

        const staminaBeforeRecover = this.currentStamina;
        const recoverTimeBeforeRecover = this.lastRecoverTime;
        this.CheckAndRecoverStamina();

        if (this.currentStamina === staminaBeforeRecover && this.lastRecoverTime === recoverTimeBeforeRecover && needsPersist) {
            this.SaveStaminaData();
        }
    }

    CheckAndRecoverStamina() {
        const now = Date.now();
        const timeDiff = now - this.lastRecoverTime;
        const recoverInterval = 10 * 60 * 1000;

        const recoverPoints = Math.floor(timeDiff / recoverInterval);

        if (recoverPoints > 0) {
            this.currentStamina = Math.min(this.maxStamina, this.currentStamina + recoverPoints);
            this.lastRecoverTime += recoverPoints * recoverInterval;
            this.SaveStaminaData();
        }
    }

    GetRemainingRecoverTime(): number {
        if (this.currentStamina >= this.maxStamina) {
            return 0;
        }

        const now = Date.now();
        const timeDiff = now - this.lastRecoverTime;
        const recoverInterval = 10 * 60 * 1000;

        const remainingTime = recoverInterval - (timeDiff % recoverInterval);
        return remainingTime;
    }

    GetFormattedRecoverTime(): string {
        const remainingTime = this.GetRemainingRecoverTime();

        if (remainingTime <= 0) {
            return "";
        }

        const minutes = Math.floor(remainingTime / (60 * 1000));
        const seconds = Math.floor((remainingTime % (60 * 1000)) / 1000);

        const minStr = minutes < 10 ? '0' + minutes : '' + minutes;
        const secStr = seconds < 10 ? '0' + seconds : '' + seconds;
        return minStr + ':' + secStr;
    }

    ConsumeStamina(amount: number = 1): boolean {
        if (this.currentStamina >= amount) {
            if (this.currentStamina >= this.maxStamina) {
                this.lastRecoverTime = Date.now();
            }
            this.currentStamina -= amount;
            this.SaveStaminaData();
            return true;
        }
        return false;
    }

    AddStamina(amount: number) {
        this.currentStamina = Math.min(this.maxStamina, this.currentStamina + amount);
        this.SaveStaminaData();
    }

    ReloadStamina() {
        this.LoadStaminaData();
    }
}

export const mGameData = GameData.inst;
