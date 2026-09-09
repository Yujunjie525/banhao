import { _decorator, Component, director, Node, tween, Vec3 } from 'cc';
import { nodePool } from './nodePool';
import { emits } from '../data/enums';
const { ccclass, property } = _decorator;

@ccclass('querenTipTool')
export class querenTipTool extends Component {
    private popUI: Node;
    /**
    * 单例
    */
    private static _ins: querenTipTool = null!;
    public static get ins() {
        if (!this._ins) {
            this._ins = new querenTipTool();
        }
        return this._ins;
    }
    protected onEnable(): void {
        this.init()
    }
    init() {
        this.popUI = this.node.getChildByName('popUI')
        this.popUI.setScale(0, 0)
        tween(this.popUI).to(0.2, { scale: new Vec3(1, 1, 1) }).by(0.06, { scale: new Vec3(0.2, 0.2, 1) }).by(0.05, { scale: new Vec3(-0.2, -0.2, 1) }).start()
    }
    shiBtn() {
        // 出场动画
        tween(this.popUI).by(0.06, { scale: new Vec3(0.2, 0.2, 1) }).by(0.05, { scale: new Vec3(-0.2, -0.2, 1) }).to(0.02, { scale: new Vec3(1.1, 1.1, 1) }).to(0.1, { scale: new Vec3(0, 0, 1) }).call(() => {
            director.emit(emits.queren)
            nodePool.ins.huiShouNode(this.node)
        }).start()
    }
    fouBtn() {
        // 出场动画
        tween(this.popUI).by(0.06, { scale: new Vec3(0.2, 0.2, 1) }).by(0.05, { scale: new Vec3(-0.2, -0.2, 1) }).to(0.02, { scale: new Vec3(1.1, 1.1, 1) }).to(0.1, { scale: new Vec3(0, 0, 1) }).call(() => {
            nodePool.ins.huiShouNode(this.node)
        }).start()
    }
}


