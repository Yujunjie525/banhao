import { EHandlerResult } from "../../common/bridge/EHandlerResult";
import Handler from "../../common/bridge/Handler";
import { gameManager } from "../prefab/manager/gamemanager";

export default class ResetTrainHandler extends Handler {
    public handleRequest(msg: string, callback?: (...args: any[]) => void): EHandlerResult {
        if (msg === "resettrains") {
            gameManager.currentBattle && gameManager.currentBattle.restartBattle();
            callback && callback();
            return EHandlerResult.BREAK;
        }
        return EHandlerResult.CONTINUE;
    }
}
