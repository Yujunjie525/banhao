const {ccclass} = cc._decorator;
import {LQMessageUtil} from "../util/lq_message_util";

@ccclass
export class LQMsgComponent extends cc.Component {
    protected onLoad(): void {
        LQMessageUtil.register(this);
    }

    protected onDestroy(): void {
        LQMessageUtil.remove(this);
    }
}