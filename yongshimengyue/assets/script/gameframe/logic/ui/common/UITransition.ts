import auto_Transition from "../../../data/autoui/common/auto_Transition";
import { Package, PackageType } from "../../../data/const/DefineConst";
import GameController from "../../../GameController";
import { lyx_bridge } from "../../../manager/LYXBridge";
import UIBase from "../../../../common/base/UIBase";
import UIHelp from "../../../../common/utils/UIHelp";
import { httpServer } from "../../../../common/manager/HttpServer";

const { ccclass, menu } = cc._decorator;

@ccclass
@menu("UI/common/UITransition")
export default class UITransition extends UIBase {
    public ui: auto_Transition = null;
    protected static bundleName = "subgame";
    protected static prefabUrl = "common/Transition";
    protected static className = "UITransition";

    public offset = 0.05;
    public unit = 0;
    public completeCallback: Function = null;

    onUILoad(): void {
        this.ui = this.node.addComponent(auto_Transition);
        if (this.params) {
            this.completeCallback = this.params[0];
        }
    }

    onShow(): void {
    }

    update(dt: number): void {
        this.unit += dt;
        if (this.unit < this.offset) {
            return;
        }
        this.unit = 0;

        const sprite = this.ui && this.ui.bar ? this.ui.bar.getComponent(cc.Sprite) : null;
        if (!sprite) {
            this.finishTransition();
            return;
        }

        sprite.fillRange = Math.min(1, sprite.fillRange + 0.1);
        if (sprite.fillRange < 1) {
            return;
        }

        if (Package.TYPE == PackageType.APP && lyx_bridge.isWebViewJavascriptBridge()) {
            lyx_bridge.getParams((res) => {
                try {
                    const data = JSON.parse(res || "{}");
                    GameController.gameId = Number(data.gameid) || 0;
                    GameController.curLevel = Number(data.level) || 0;
                    GameController.mode = Number(data.mode) || 0;
                    GameController.requestUrl = data.requestUrl || "";
                    GameController.planId = Number(data.planid) || 0;
                    GameController.token = data.token || "";
                    GameController.hiddenBack = Number(data.hiddenBack) || 0;
                    if (GameController.requestUrl) {
                        httpServer.setMainUrl(GameController.requestUrl + "api/");
                    }
                    if (GameController.token) {
                        httpServer.setToken(GameController.token);
                    }
                    GameController.refreshCurrentConfig(data.level);
                } catch (error) {
                    cc.warn("UITransition parse failed", error);
                }
                this.finishTransition();
            }, () => {
                this.finishTransition();
            });
            return;
        }

        this.finishTransition();
    }

    private finishTransition(): void {
        this.completeCallback && this.completeCallback();
        this.onClose();
    }

    onClose(): void {
        UIHelp.CloseUI(UITransition);
    }
}
