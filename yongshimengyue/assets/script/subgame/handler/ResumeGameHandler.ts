import { EHandlerResult } from "../../common/bridge/EHandlerResult";
import Handler from "../../common/bridge/Handler";
import { gameManager } from "../prefab/manager/gamemanager";

export default class ResumeGameHandler extends Handler {
    public handleRequest(msg: string, callback?: (...args: any[]) => void): EHandlerResult {
        if (msg === "resumegame") {
            gameManager.currentBattle && gameManager.currentBattle.resumeBattle();
            callback && callback();
            return EHandlerResult.BREAK;
        }
        return EHandlerResult.CONTINUE;
    }
}
