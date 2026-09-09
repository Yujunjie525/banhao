import { EHandlerResult } from "../../common/bridge/EHandlerResult";
import Handler from "../../common/bridge/Handler";
import { gameManager } from "../prefab/manager/gamemanager";

export default class TimeOverHandler extends Handler {
    public handleRequest(msg: string, callback?: (...args: any[]) => void): EHandlerResult {
        if (msg === "timeover") {
            gameManager.currentBattle && gameManager.currentBattle.failBattle();
            callback && callback();
            return EHandlerResult.BREAK;
        }
        return EHandlerResult.CONTINUE;
    }
}
