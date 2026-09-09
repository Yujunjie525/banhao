import { lyx_system } from "../common/utils/LYXSystem";
import simpleFrameBridge from "../gameframe/SimpleFrameBridge";
import simpleGameBridge from "../subgame/SimpleGameBridge";
import AbFrameBridge from "./AbFrameBridge";
import AbGameBridge from "./AbGameBridge";
import MasterBridge from "./MasterBridge";

const { ccclass, property } = cc._decorator;

@ccclass
export default class Main extends cc.Component {

    private _masterBridge: MasterBridge;
    private _frameBridge: AbFrameBridge;
    private _gameBridge: AbGameBridge;

    onLoad() {
        cc.debug.setDisplayStats(false);

        this._frameBridge = simpleFrameBridge;
        this._gameBridge = simpleGameBridge;
        this._masterBridge = new MasterBridge(this._frameBridge, this._gameBridge);

        /**屏幕适配*/
        lyx_system.fixDesignResolutionSize(this.node.getComponent(cc.Canvas));
    }

    start () {
        this._gameBridge.initGame();
        this._frameBridge.initFrame();
    }

}
