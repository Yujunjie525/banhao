import { EHandlerResult } from "../../common/bridge/EHandlerResult";
import Handler from "../../common/bridge/Handler";
import { demandResLoader } from "../../common/manager/DemandResLoader";
import ResUtils from "../../common/utils/ResUtils";
import simpleGameBridge from "../SimpleGameBridge";
import { gameManager } from "../prefab/manager/gamemanager";
import ClearGameHandler from "./ClearGameHandler";
import PauseGameHandler from "./PauseGameHandler";
import ResetTrainHandler from "./ResetTrainHandler";
import ResumeGameHandler from "./ResumeGameHandler";
import ReviveBossHandler from "./ReviveBossHandler";
import StartGameHandler from "./StartGameHandler";
import TimeOverHandler from "./TimeOverHandler";

export default class InitGameHandler extends Handler {
    private registeredRuntimeHandlers: boolean = false;

    public handleRequest(msg: string, callback?: (...args: any[]) => void): EHandlerResult {
        if (msg === "initgame") {
            Promise.all([
                demandResLoader.loadAsset<cc.Prefab>("subgame:prefab/Game", cc.Prefab),
                demandResLoader.loadAsset<cc.Prefab>("subgame:prefab/Frame", cc.Prefab),
            ]).then(() => {
                this.ensureMainRoot();
                this.ensureRuntimeHandlers();
                callback && callback();
            }).catch((err) => {
                cc.error("InitGameHandler load subgame entry failed", err);
                callback && callback();
            });
            return EHandlerResult.BREAK;
        }
        return EHandlerResult.CONTINUE;
    }

    private ensureMainRoot(): void {
        if (gameManager.mainRoot && gameManager.mainRoot.isValid) {
            return;
        }

        const prefab = ResUtils.getAsset<cc.Prefab>("subgame:prefab/Game", cc.Prefab);
        const scene = cc.director.getScene();
        if (!prefab || !scene) {
            return;
        }

        gameManager.mainRoot = cc.instantiate(prefab);
        scene.addChild(gameManager.mainRoot, 0);
    }

    private ensureRuntimeHandlers(): void {
        if (this.registeredRuntimeHandlers) {
            return;
        }

        this.registeredRuntimeHandlers = true;
        const owner = gameManager.mainRoot || cc.director.getScene();
        simpleGameBridge.registerHandler(new StartGameHandler(owner));
        simpleGameBridge.registerHandler(new ClearGameHandler(owner));
        simpleGameBridge.registerHandler(new PauseGameHandler(owner));
        simpleGameBridge.registerHandler(new ResumeGameHandler(owner));
        simpleGameBridge.registerHandler(new ResetTrainHandler(owner));
        simpleGameBridge.registerHandler(new ReviveBossHandler(owner));
        simpleGameBridge.registerHandler(new TimeOverHandler(owner));
    }
}
