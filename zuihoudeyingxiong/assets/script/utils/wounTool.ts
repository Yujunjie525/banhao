import { _decorator, Component, director, Node } from 'cc';
import { nodePool } from './nodePool';
const { ccclass, property } = _decorator;

@ccclass('wounTool')
export class wounTool extends Component {
    protected onEnable(): void {
        this.scheduleOnce(() => {
            this.node.destroy();
        }, 0.4)
    }
    protected onDestroy(): void {
        this.unscheduleAllCallbacks()
    }
}


