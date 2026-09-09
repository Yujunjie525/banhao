import { EHandlerResult } from "../../common/bridge/EHandlerResult";
import Handler from "../../common/bridge/Handler";
import { gameManager } from "../prefab/manager/gamemanager";

export default class ReviveBossHandler extends Handler {
    public handleRequest(msg: string, callback?: (...args: any[]) => void): EHandlerResult {
        if (msg === "reviveboss") {
            gameManager.currentBattle && gameManager.currentBattle.reviveBattle();
            callback && callback();
            return EHandlerResult.BREAK;
        }
        return EHandlerResult.CONTINUE;
    }
}
