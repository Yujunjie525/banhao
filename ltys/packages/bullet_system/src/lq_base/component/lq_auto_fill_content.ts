import ccclass = cc._decorator.ccclass;
import menu = cc._decorator.menu;

@ccclass
@menu("lq/auto_fill")
export class LQAutoFillContent extends cc.Component {
    protected start(): void {
        this.node.width = cc.visibleRect.width;
        this.node.height = cc.visibleRect.height;
    }
}
