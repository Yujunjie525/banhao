import { EHandlerResult } from "../../common/bridge/EHandlerResult";
import Handler from "../../common/bridge/Handler";
import MasterGlobal from "../../common/MasterGlobal";
import { Round } from "../logic/ui/common/Round";
import UIFrame from "../logic/ui/prefab/UIFrame";
import simpleFrameBridge from "../SimpleFrameBridge";
import GameOverHandler from "./GameOverHandler";

export default class RoundOverHandler extends Handler {

    public uiFrame: UIFrame;

    public constructor(uiFrame: UIFrame) {
        super(uiFrame.node);

        this.uiFrame = uiFrame;
    }

    public handleRequest(msg: string, callback?: (...args: any[]) => void): EHandlerResult {
        if (msg.startsWith("roundover")) {
            let round: Round = null;
            if (this.uiFrame && this.uiFrame._title && this.uiFrame._title._round) {
                round = this.uiFrame._title._round;
            }
            if (round) {
                if (round.cur >= round.all) {
                    new GameOverHandler(this.uiFrame).handleRequest("gameover");
                    return;
                }
            }
            simpleFrameBridge.sendMessage("stopgame", () => {
                round && round.updateRound();
                if (!MasterGlobal.isOver) simpleFrameBridge.sendMessage("startgame");
            });
        }
        return EHandlerResult.CONTINUE;
    }
}