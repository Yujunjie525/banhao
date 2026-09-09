import { EHandlerResult } from "../../common/bridge/EHandlerResult";
import Handler from "../../common/bridge/Handler";
import { Round } from "../logic/ui/common/Round";

export default class UpdateRoundHandler extends Handler {
    public round: Round;
    public constructor(round: Round) {
        super(round.node);

        this.round = round;
    }

    public handleRequest(msg: string, callback?: (...args: any[]) => void): EHandlerResult {
        if (msg.startsWith("updateround")) {
            let txtArr: string[] = msg.split(":");
            let round: number = +txtArr[1];

            this.round.updateRound(round);
        }
        return EHandlerResult.CONTINUE;
    }

}