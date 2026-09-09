import { EHandlerResult } from "../../common/bridge/EHandlerResult";
import Handler from "../../common/bridge/Handler";
import { demandResLoader } from "../../common/manager/DemandResLoader";
import GameController from "../../gameframe/GameController";
import { gameManager } from "../prefab/manager/gamemanager";
import YSMYBattle from "../prefab/YSMYBattle";

export default class StartGameHandler extends Handler {
    public handleRequest(msg: string, callback?: (...args: any[]) => void): EHandlerResult {
        if (msg === "startgame") {
            this.startBattle(callback);
            return EHandlerResult.BREAK;
        }
        return EHandlerResult.CONTINUE;
    }

    private startBattle(callback?: (...args: any[]) => void): void {
        this.clearBattle();
        demandResLoader.ensureSubgameLogicEntry().then(() => {
            return demandResLoader.loadAsset<cc.Prefab>("subgame:prefab/component/GeneraItem", cc.Prefab);
        }).then((prefab) => {
            const scene = cc.director.getScene();
            if (!scene || !prefab) {
                callback && callback();
                return;
            }

            if (gameManager.mainRoot && gameManager.mainRoot.isValid) {
                gameManager.mainRoot.active = false;
            }

            gameManager.resetBattleResult();
            const battleRoot = cc.instantiate(prefab);
            // battleRoot.name = "YSMYBattleRoot";
            scene.addChild(battleRoot, 100);

            let battle = battleRoot.getComponent(YSMYBattle);
            if (!battle) {
                battle = battleRoot.addComponent(YSMYBattle);
            }

            gameManager.battleRoot = battleRoot;
            gameManager.currentBattle = battle;
            battle.initBattle(Math.max(1, Number(GameController.curLevel) || 1));
            callback && callback();
        }).catch((err) => {
            cc.error("StartGameHandler load YSMY battle failed", err);
            callback && callback();
        });
    }

    private clearBattle(): void {
        if (gameManager.battleRoot && gameManager.battleRoot.isValid) {
            gameManager.battleRoot.destroy();
        }
        gameManager.battleRoot = null;
        gameManager.currentBattle = null;
    }
}
