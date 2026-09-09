import { _decorator, Component, director, Label, Node, sys, UIOpacity, tween, Vec3 } from 'cc';
import { emits } from './enmus';
import { gameConfig } from './gameConfig';
import { loadPool } from './loadPool';
const { ccclass, property } = _decorator;

@ccclass('TipsWnd')
export class TipsWnd extends Component {
    @property(Label) msgLabel: Label = null;
    @property(Node) btn_qr: Node = null;
    private needClearAccount = false;
    // @property(UIOpacity) mess: UIOpacity = null

    protected onEnable(): void {
        this.init();
        this.needClearAccount = false;
    }

    init() {
        // this.node.setPosition(0, -1000)
        director.on(emits.tipWndMsg, this.showTip, this);
        this.btn_qr.on(Node.EventType.TOUCH_END, this.onClick_qr, this);
    }

    protected onDestroy(): void {
        director.off(emits.tipWndMsg, this.showTip, this);
    }

    showTip(val: string, clearAccount = false) {
        this.msgLabel.string = val;
        this.needClearAccount = clearAccount;
        // this.node.setPosition(0, -50)
        // tween(this.node).to(0.5, { position: new Vec3(0, 0, 0) }).to(0.2, { position: new Vec3(0, 700, 0) }).call(() => {
        //     loadPool.ins.huiShouNode(this.node)
        // }).start()
    }

    onClick_qr() {
        loadPool.ins.huiShouNode(this.node);

        if (this.needClearAccount) {
            gameConfig.clearActiveUserContext();
            sys.localStorage.removeItem('SLS_USERNAME');
            sys.localStorage.removeItem('SLS_PASSWORD');
            sys.localStorage.removeItem('SLS_USER_ID');
            console.log('账号信息已清除，跳转到登录界面');
            director.loadScene('loading');
        }
    }
}
