import { _decorator, Component, director, Label, Node, tween, UIOpacity, Vec3 } from 'cc';
import { emits } from './enmus';
import { loadPool } from './loadPool';
const { ccclass, property } = _decorator;

@ccclass('tips')
export class tips extends Component {
    @property(Label) msgLabel: Label = null
    @property(UIOpacity) mess: UIOpacity = null
    protected onEnable(): void {
        this.init()
    }
    init() {
        this.node.setPosition(0, 0)
        director.on(emits.tipMsg, this.showTip, this)
    }
    protected onDestroy(): void {
        director.off(emits.tipMsg, this.showTip, this)
    }
    showTip(val: string) {
        this.msgLabel.string = val
        this.node.setPosition(0, 0)
        tween(this.node).to(1, { position: new Vec3(0, 0, 0) }).to(0.3, { position: new Vec3(0, 700, 0) }).call(() => {
            loadPool.ins.huiShouNode(this.node
            )
        }).start()
    }
}


