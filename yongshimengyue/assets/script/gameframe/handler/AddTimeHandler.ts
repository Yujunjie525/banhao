import { EHandlerResult } from "../../common/bridge/EHandlerResult";
import Handler from "../../common/bridge/Handler";

export default class AddTimeHandler extends Handler {

    public handleRequest(msg: string, callback?: (...args: any[]) => void): EHandlerResult {
        if (msg.startsWith("addtime")) {
            let txtArr: string[] = msg.split(":");
            let addTime: number = +txtArr[1];
            let isAnim: boolean = !(+txtArr[2] == 0);

        }
        return EHandlerResult.CONTINUE;
    }

}