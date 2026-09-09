import { load, save } from "../../script/utils/tools";


export class GameData {
    private static _instance: GameData = null;
    public static get inst(): GameData {
        if (this._instance === null) {
            this._instance = new GameData();
        }
        return this._instance;
    }

    public maxStamina: number = 30;
    public currentStamina: number = 30;
    public lastRecoverTime: number = 0;

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

    private getTotalConsumedStaminaKey(): string {
        return 'totalConsumedStamina_' + this.getUserId();
    }

    SaveStaminaData() {
        save(this.getStaminaKey(), this.currentStamina);
        save(this.getRecoverTimeKey(), this.lastRecoverTime);
    }

    LoadStaminaData() {
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

        this.CheckAndRecoverStamina();
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
            const totalConsumed = load(this.getTotalConsumedStaminaKey(), 1) || 0;
            save(this.getTotalConsumedStaminaKey(), totalConsumed + amount);
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
