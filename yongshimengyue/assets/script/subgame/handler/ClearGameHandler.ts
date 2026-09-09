import { EHandlerResult } from "../../common/bridge/EHandlerResult";
import Handler from "../../common/bridge/Handler";
import { gameManager } from "../prefab/manager/gamemanager";

export default class ClearGameHandler extends Handler {
    public handleRequest(msg: string, callback?: (...args: any[]) => void): EHandlerResult {
        if (msg === "cleargame") {
            if (gameManager.battleRoot && gameManager.battleRoot.isValid) {
                gameManager.battleRoot.destroy();
            }
            gameManager.battleRoot = null;
            gameManager.currentBattle = null;
            if (gameManager.mainRoot && gameManager.mainRoot.isValid) {
                gameManager.mainRoot.active = true;
            }
            callback && callback();
            return EHandlerResult.BREAK;
        }
        return EHandlerResult.CONTINUE;
    }
}
