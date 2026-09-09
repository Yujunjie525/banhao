import UIBase from "../../../../common/base/UIBase";
import UIMng from "../../../../common/manager/UIMng";
import MasterGlobal from "../../../../common/MasterGlobal";
import simpleFrameBridge from "../../../SimpleFrameBridge";
import UIFrame from "../prefab/UIFrame";
import { gameManager } from "../../../../subgame/prefab/manager/gamemanager";
import mGameData from "../../../../../Scripts/Data/GameData";
import TipsManager from "../../../../../Scripts/Manager/TipsManager";

const { ccclass, menu } = cc._decorator;

export enum ResultWndState {
    Win = "win",
    Lose = "lose",
    Stop = "stop",
    Going = "going",
}

@ccclass
@menu("UI/game/UIResultWnd")
export default class UIResultWnd extends UIBase {
    protected static bundleName = "subgame";
    protected static prefabUrl = "game/ResultWnd ";
    protected static className = "UIResultWnd";

    public state: ResultWndState = ResultWndState.Stop;

    public bgWin: cc.Node;
    public bgLose: cc.Node;
    public bgStop: cc.Node;
    public bgGoing: cc.Node;
    public bgBondChaseLose: cc.Node;
    private uiFrame: UIFrame = null;
    /** 防止选关失败页的重新挑战按钮被连续点击而重复扣体力。 */
    private retryInProgress: boolean = false;

    public bindFrame(frame: UIFrame): void {
        this.uiFrame = frame;
    }

    public onInit(params) {
        super.onInit(params);
        this.state = (params && params[0]) || ResultWndState.Stop;
    }

    onUILoad() {
        this.bgGoing = this.node.getChildByName("bg_going");
        this.bgStop = this.node.getChildByName("bg_stop");
        this.bgLose = this.node.getChildByName("bg_lose");
        this.bgWin = this.node.getChildByName("bg_win");
        this.bgBondChaseLose = this.node.getChildByName("bg_bond_chase_lose")
            || this.node.getChildByName("bg_bondchase_lose")
            || this.node.getChildByName("bg_endless_lose");
    }

    onShow() {
        cc.log("关闭游戏逻辑页onShow");
        this.retryInProgress = false;
        this.pauseGame();
        this.refreshState();
        this.unbindButtons(this.bgGoing);
        this.unbindButtons(this.bgStop);
        this.unbindButtons(this.bgLose);
        this.unbindButtons(this.bgWin);
        this.bindButtons(this.bgGoing);
        this.bindButtons(this.bgStop);
        this.bindButtons(this.bgLose);
        this.bindButtons(this.bgWin);
    }

    onHide() {
        this.retryInProgress = false;
        this.unbindButtons(this.bgGoing);
        this.unbindButtons(this.bgStop);
        this.unbindButtons(this.bgLose);
        this.unbindButtons(this.bgWin);
    }

    public bindButtons(panel: cc.Node) {
        if (!panel || !cc.isValid(panel)) {
            return;
        }
        let btnBack = panel.getChildByName("BtnBack");
        let btnGoing = panel.getChildByName("BtnGoing");
        this.bindButton(btnBack, this.onClickBack);
        this.bindButton(btnGoing, this.onClickGoing);
    }

    public unbindButtons(panel: cc.Node) {
        if (!panel || !cc.isValid(panel)) {
            return;
        }
        let btnBack = panel.getChildByName("BtnBack");
        let btnGoing = panel.getChildByName("BtnGoing");
        this.unbindButton(btnBack, this.onClickBack);
        this.unbindButton(btnGoing, this.onClickGoing);
    }

    /** 保留 cc.Button 的内部触摸监听，使用其 click 事件承接按钮行为。 */
    private bindButton(node: cc.Node, callback: () => void): void {
        if (!node || !cc.isValid(node)) {
            return;
        }

        this.unbindButton(node, callback);
        const button = node.getComponent(cc.Button);
        if (button) {
            button.enabled = true;
            button.interactable = true;
            node.on("click", callback, this);
        } else {
            node.on(cc.Node.EventType.TOUCH_END, callback, this);
        }
    }

    private unbindButton(node: cc.Node, callback: () => void): void {
        if (!node || !cc.isValid(node)) {
            return;
        }

        node.off("click", callback, this);
        node.off(cc.Node.EventType.TOUCH_END, callback, this);
    }

    public refreshState() {
        this.bgWin && (this.bgWin.active = this.state === ResultWndState.Win);
        this.bgLose && (this.bgLose.active = this.state === ResultWndState.Lose);
        this.bgStop && (this.bgStop.active = this.state === ResultWndState.Stop);
        this.bgGoing && (this.bgGoing.active = this.state === ResultWndState.Going);
        this.bgBondChaseLose && (this.bgBondChaseLose.active = false);
        // 无限模式页面由 BondChaseController 直接显示，不参与普通 ResultWndState 切换。
        if (this.state === ResultWndState.Win) {
            this.refreshWinStars();
            this.refreshDiamondReward(this.bgWin);
        }
        if (this.state === ResultWndState.Lose) {
            this.refreshLoseGoingButton();
        }
    }

    private refreshLoseGoingButton() {
        if (!this.bgLose || !cc.isValid(this.bgLose)) {
            return;
        }

        const btnGoing = this.bgLose.getChildByName("BtnGoing");
        if (!btnGoing) {
            return;
        }

        const background = btnGoing.getChildByName("Background");
        const background1 = btnGoing.getChildByName("Background1");
        const isFirstFail = gameManager.levelFailCount <= 1;
        if (background) {
            background.active = isFirstFail;
            this.setNestedLabel(background, "圣光复活(1/1)");
        }
        if (background1) {
            background1.active = !isFirstFail;
            this.setNestedLabel(background1, "重新开始");
        }
    }

    private setNestedLabel(root: cc.Node, value: string): void {
        if (!root || !cc.isValid(root)) {
            return;
        }

        const label = root.getComponent(cc.Label);
        if (label) {
            label.string = value;
            return;
        }

        for (let i = 0; i < root.childrenCount; i++) {
            this.setNestedLabel(root.children[i], value);
        }
    }

    private refreshWinStars() {
        if (!this.bgWin || !cc.isValid(this.bgWin)) {
            return;
        }

        const starsRoot = this.bgWin.getChildByName("starNode") || this.bgWin;
        const stars = Math.max(0, Math.min(3, Number(gameManager.lastResultStar) || 0));
        const star1 = starsRoot.getChildByName("star1");
        const star2 = starsRoot.getChildByName("star2");
        const star3 = starsRoot.getChildByName("star3");
        const star1Gray = starsRoot.getChildByName("star1_gray");
        const star2Gray = starsRoot.getChildByName("star2_gray");
        const star3Gray = starsRoot.getChildByName("star3_gray");

        if (star1) {
            star1.active = stars >= 1;
        }
        if (star2) {
            star2.active = stars >= 2;
        }
        if (star3) {
            star3.active = stars >= 3;
        }
        if (star1Gray) {
            star1Gray.active = stars < 1;
        }
        if (star2Gray) {
            star2Gray.active = stars < 2;
        }
        if (star3Gray) {
            star3Gray.active = stars < 3;
        }
    }

    /** 刷新结算页中 showReward/Number（兼容复制页面保留原名称的情况）。 */
    private refreshDiamondReward(panel: cc.Node): void {
        if (!panel || !cc.isValid(panel)) {
            return;
        }
        const rewardRoot = panel.getChildByName("showReward")
            || panel.getChildByName("ShowReward")
            || this.findChildByName(panel, "showReward");
        if (!rewardRoot) {
            return;
        }
        const numberNode = rewardRoot.getChildByName("Number")
            || rewardRoot.getChildByName("number")
            || this.findChildByName(rewardRoot, "Number");
        const label = numberNode && numberNode.getComponent(cc.Label);
        if (label) {
            label.string = String(Math.max(0, Math.floor(Number(gameManager.lastResultDiamond) || 0)));
        }
    }

    private findChildByName(root: cc.Node, name: string): cc.Node {
        if (!root) {
            return null;
        }
        for (let i = 0; i < root.childrenCount; i++) {
            const child = root.children[i];
            if (child.name === name) {
                return child;
            }
            const nested = this.findChildByName(child, name);
            if (nested) {
                return nested;
            }
        }
        return null;
    }

    public getUIFrame(): UIFrame | null {
        return this.uiFrame || UIMng.getInstance().getUI(UIFrame) as UIFrame || null;
    }

    public pauseGame() {
        simpleFrameBridge.sendMessage("pausegame");
        let uiFrame = this.getUIFrame();
        if (uiFrame && uiFrame._title && uiFrame._title._clock) {
            uiFrame._title._clock.switch = true;
        }
        this.setTitleBackButtonEnabled(uiFrame, false);
        MasterGlobal.isPause = true;
    }

    public resumeGame() {
        simpleFrameBridge.sendMessage("resumegame");
        let uiFrame = this.getUIFrame();
        if (uiFrame && uiFrame._title && uiFrame._title._clock) {
            uiFrame._title._clock.switch = false;
        }
        this.setTitleBackButtonEnabled(uiFrame, true);
        MasterGlobal.isPause = false;
    }

    private setTitleBackButtonEnabled(uiFrame: UIFrame, enabled: boolean): void {
        if (!uiFrame || !uiFrame._title || !uiFrame._title.btn_back) {
            return;
        }
        const button = uiFrame._title.btn_back.getComponent(cc.Button);
        if (button) {
            button.enabled = enabled;
        }
    }

    public onClickBack() {
        let uiFrame = this.getUIFrame();
        cc.log("关闭游戏逻辑页8888888888");
        if (!uiFrame) {
            this.onClose();
            return;
        }

        if (this.state === ResultWndState.Stop || this.state === ResultWndState.Going) {
            this.resumeGame();
        }
        cc.log("关闭游戏逻辑页666666");
        uiFrame.returnToMainView();
        this.onClose();
    }

    public onClickGoing() {
        let uiFrame = this.getUIFrame();
        if (!uiFrame) {
            this.onClose();
            return;
        }

        switch (this.state) {
            case ResultWndState.Win:
                uiFrame.startNextLevelDirect();
                this.onClose();
                break;
            case ResultWndState.Lose:
                // 选关模式的按钮文案是“重新挑战”，每次点击都代表开启一
                // 局新挑战，必须扣除 1 点体力。无尽模式不经过本窗口，
                // 因此不会影响无尽模式已有的扣体力逻辑。
                if (this.retryInProgress) {
                    return;
                }
                if (!this.consumeRetryStamina()) {
                    return;
                }
                this.retryInProgress = true;
                uiFrame.restartCurrentLevelDirect();
                this.onClose();
                break;
            case ResultWndState.Stop:
                this.resumeGame();
                this.onClose();
                break;
            case ResultWndState.Going:
                simpleFrameBridge.sendMessage("resettrains");
                this.resumeGame();
                this.onClose();
                break;
            default:
                this.onClose();
                break;
        }
    }

    /**
     * 失败后的重新挑战按新局处理，消耗 1 点体力。
     * 体力不足时保留失败结算页，避免无体力重开。
     */
    private consumeRetryStamina(): boolean {
        if (!mGameData || !mGameData.HasEnoughStamina()) {
            TipsManager.show("体力不足，无法重新挑战。");
            return false;
        }

        if (!mGameData.ConsumeStamina()) {
            TipsManager.show("体力不足，无法重新挑战。");
            return false;
        }

        return true;
    }

    onClose() {
        if (this.node && this.node.isValid) {
            this.node.active = false;
        }
    }

    onUIDestroy() {
        this.uiFrame = null;
        this.bgGoing = null;
        this.bgBondChaseLose = null;
        this.bgStop = null;
        this.bgLose = null;
        this.bgWin = null;
    }
}
