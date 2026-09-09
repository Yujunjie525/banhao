import { EHandlerResult } from "../../common/bridge/EHandlerResult";
import Handler from "../../common/bridge/Handler";
import { Title } from "../logic/ui/common/Title";

export default class AddScoreHandler extends Handler {
    public title: Title;
    public constructor(title: Title) {
        super(title.node);

        this.title = title;
    }

    public handleRequest(msg: string, callback?: (...args: any[]) => void): EHandlerResult {
        if (msg.startsWith("addscore")) {
            let txtArr: string[] = msg.split(":");
            let addScore: number = +txtArr[1];
            let isAnim: boolean = !(+txtArr[2] == 0);

            this.title.addScore(addScore, !!isAnim);
        }
        if (msg.startsWith("setgoodsleft")) {
            let txtArr: string[] = msg.split(":");
            this.title.setGoodsLeft(+txtArr[1]);
        }
        if (msg.startsWith("changegoodsleft")) {
            let txtArr: string[] = msg.split(":");
            let delta: number = +txtArr[1];
            let isAnim: boolean = !(+txtArr[2] == 0);
            this.title.changeGoodsLeft(delta, !!isAnim);
        }
        return EHandlerResult.CONTINUE;
    }

}
