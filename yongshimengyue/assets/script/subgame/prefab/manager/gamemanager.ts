export class GameManager {
    public gameState: boolean = false;
    public levelResultLocked: boolean = false;
    public levelFailCount: number = 0;
    public lastResultStar: number = 1;
    /** 当前结算页显示的钻石奖励，不代表钻石余额。 */
    public lastResultDiamond: number = 0;
    /** 无限模式结算页显示的最高高度（米）。 */
    public lastEndlessHeight: number = 0;
    public mainRoot: cc.Node = null;
    public battleRoot: cc.Node = null;
    public currentBattle: any = null;

    public init(): void {
        this.gameState = false;
        this.levelResultLocked = false;
        this.levelFailCount = 0;
        this.lastResultStar = 1;
        this.lastResultDiamond = 0;
        this.lastEndlessHeight = 0;
        this.battleRoot = null;
        this.currentBattle = null;
    }

    public resetBattleResult(): void {
        this.gameState = true;
        this.levelResultLocked = false;
        this.levelFailCount = 0;
        this.lastResultStar = 1;
        this.lastResultDiamond = 0;
        this.lastEndlessHeight = 0;
    }

    public lockLevelResult(): boolean {
        if (this.levelResultLocked) {
            return false;
        }
        this.levelResultLocked = true;
        this.gameState = false;
        return true;
    }
}

export let gameManager: GameManager = new GameManager();
