import BaseComponent from "../base/BaseComponent";
import Optional from "./Optional";
import { QuickTool } from "./UtilsToolkit";

const { ccclass, property } = cc._decorator;

@ccclass
export default class EventRelay extends cc.Component {

    @property(cc.Node)
    public receiver: cc.Node = null;

    @property()
    public handleFuncName: string = "onEvent";

    public onEvent(...arg: any) {
        Optional.of(this.receiver).call(node => {
            //@ts-ignore
            QuickTool.safeCall(node.getComponent(BaseComponent)._baseObject, this.handleFuncName, ...arg);
        });
    }

}