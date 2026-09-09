import AbFrameBridge from "./AbFrameBridge";
import AbGameBridge from "./AbGameBridge";

export default class MasterBridge {

    private _frameBridge: AbFrameBridge;

    private _gameBridge: AbGameBridge;

    public constructor(frameBridge: AbFrameBridge, gameBridge: AbGameBridge) {
        this._frameBridge = frameBridge;
        this._gameBridge = gameBridge;
        this._frameBridge.otherSide = this._gameBridge;
        this._gameBridge.otherSide = this._frameBridge;
    }

}