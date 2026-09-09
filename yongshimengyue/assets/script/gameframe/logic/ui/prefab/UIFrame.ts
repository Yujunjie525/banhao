import UIBase from "../../../../common/base/UIBase";
import MasterGlobal from "../../../../common/MasterGlobal";
import { soundManager } from "../../../../common/manager/SoundManager";
import UIHelp from "../../../../common/utils/UIHelp";
import { default as auto_Frame } from "../../../data/autoui/prefab/auto_Frame";
import GameController from "../../../GameController";
import GameOverHandler from "../../../handler/GameOverHandler";
import RoundOverHandler from "../../../handler/RoundOverHandler";
import simpleFrameBridge from "../../../SimpleFrameBridge";
import mGameData from "../../../../../Scripts/Data/GameData";
import UIResultWnd, { ResultWndState } from "../game/UIResultWnd";

const { ccclass, menu } = cc._decorator;

@ccclass
@menu("UI/prefab/UIFrame")
export default class UIFrame extends UIBase {
    public ui: auto_Frame = null;
    public resultWnd: UIResultWnd = null;
    public _title: any = { _clock: null, _round: null, btn_back: null };
    public _timedown: any = null;

    protected static bundleName = "subgame";
    protected static prefabUrl = "Frame";
    protected static className = "UIFrame";

    private resultWndNode: cc.Node = null;

    public onUILoad(): void {
        soundManager.installButtonClickSound();
        this.ui = this.node.addComponent(auto_Frame);
        simpleFrameBridge.registerHandler(new GameOverHandler(this));
        simpleFrameBridge.registerHandler(new RoundOverHandler(this));
        this.initResultWnd();
        this.initView();
    }

    public initView(): void {
        this.hideResult();
    }

    public resetGameData(): void {
        MasterGlobal.data = {};
        MasterGlobal.isPause = false;
        MasterGlobal.isOver = false;
        MasterGlobal.data["nextLevel"] = GameController.curLevel;
        MasterGlobal.data["usedTime"] = 0;
        MasterGlobal.data["errorCount"] = 0;
        MasterGlobal.data["correctCount"] = 0;
        MasterGlobal.data["score"] = 0;
        MasterGlobal.data["lvWin"] = true;
    }

    public StartGame(): void {
        const level = Math.max(1, Number(GameController.curLevel) || Number(mGameData.currentLevel) || 1);
        GameController.refreshCurrentConfig(level);
        this.resetGameData();
        this.hideResult();
        this.afterClearGame(() => {
            simpleFrameBridge.sendMessage("startgame");
        });
    }

    public returnToMainView(): void {
        MasterGlobal.isPause = false;
        this.hideResult();
        this.afterClearGame(() => {
            UIHelp.CloseUI(UIFrame);
        });
    }

    public refreshGameDirect(): void {
        this.StartGame();
    }

    public restartCurrentLevelDirect(): void {
        MasterGlobal.level = GameController.curLevel;
        this.StartGame();
    }

    public startNextLevelDirect(): void {
        const totalLevels = mGameData.getTotalLevels();
        if (totalLevels <= 0 || GameController.curLevel < totalLevels) {
            GameController.nextGameLevel();
        }
        MasterGlobal.level = GameController.curLevel;
        this.StartGame();
    }

    public showResultWnd(state: ResultWndState): void {
        this.initResultWnd();
        if (!this.resultWnd || !this.resultWndNode || !this.resultWndNode.isValid) {
            return;
        }

        this.resultWnd.state = state;
        this.resultWnd.bindFrame(this);
        if (this.resultWndNode.active) {
            this.resultWnd.onShow();
        } else {
            this.resultWndNode.active = true;
        }
    }

    public onClose(): void {
        this.returnToMainView();
    }

    private hideResult(): void {
        this.initResultWnd();
        if (this.resultWndNode && this.resultWndNode.isValid) {
            this.resultWndNode.active = false;
        }
    }

    private afterClearGame(callback: () => void): void {
        let completed = false;
        const done = () => {
            if (completed) {
                return;
            }
            completed = true;
            callback();
        };

        simpleFrameBridge.sendMessage("cleargame", done);
        this.scheduleOnce(done, 0);
    }

    private initResultWnd(): void {
        if (this.resultWndNode && this.resultWndNode.isValid && this.resultWnd && cc.isValid(this.resultWnd)) {
            return;
        }

        this.resultWndNode = this.node.getChildByName("ResultWnd ");
        if (!this.resultWndNode) {
            this.resultWndNode = this.findChildByNormalizedName(this.node, "ResultWnd");
        }
        if (!this.resultWndNode) {
            cc.warn("UIFrame missing ResultWnd node");
            return;
        }

        this.resultWndNode.active = false;
        this.resultWnd = this.resultWndNode.getComponent(UIResultWnd);
        if (!this.resultWnd) {
            this.resultWnd = this.resultWndNode.addComponent(UIResultWnd);
        }
        this.resultWnd.bindFrame(this);
        this.resultWndNode.zIndex = 999;
    }

    private findChildByNormalizedName(root: cc.Node, name: string): cc.Node {
        if (!root || !root.isValid) {
            return null;
        }
        const targetName = String(name || "").replace(/\s/g, "").toLowerCase();
        const currentName = String(root.name || "").replace(/\s/g, "").toLowerCase();
        if (currentName === targetName) {
            return root;
        }
        for (let i = 0; i < root.childrenCount; i++) {
            const found = this.findChildByNormalizedName(root.children[i], name);
            if (found) {
                return found;
            }
        }
        return null;
    }
}
