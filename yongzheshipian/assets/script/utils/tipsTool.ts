import { _decorator, Component, director, Label, Node, tween, UIOpacity, Vec3 } from 'cc';
import { emits } from '../data/enums';
import { nodePool } from './nodePool';
const { ccclass, property } = _decorator;

@ccclass('tipsTool')
export class tipsTool extends Component {
    // 文字
    @property(Label)
    text: Label = null;
    // 提示框主体的不透明度组件
    @property(UIOpacity)
    mess: UIOpacity = null;
    protected onEnable(): void {
        director.on(emits.tips, this.showTip, this)
    }
    showTip(val: string) {
        this.text.string = val
        tween(this.mess).to(0.6, { opacity: 255 }).delay(1).to(0.2, { opacity: 0 }).call(() => {
            nodePool.ins.huiShouNode(this.node)
        }).start()
    }
    protected onDestroy(): void {
        director.off(emits.tips, this.showTip, this)
    }
}


