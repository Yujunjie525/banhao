import { _decorator, Component, director, Label, Node, tween, UIOpacity, Vec3, sys } from 'cc';
import { emits } from '../data/enmus';
import { loadPool } from '../res/loadPool';
import { getScopedPlayerListKey, getScopedSelectTypeKey } from '../../script/utils/tools';
import { localData } from '../../script/data/enums';
const { ccclass, property } = _decorator;

@ccclass('TipsWnd')
export class TipsWnd extends Component {
    @property(Label) msgLabel: Label = null
    @property(Node) btn_qr: Node = null
    // 是否需要清除账号密码并返回登录界面
    private needClearAccount: boolean = false
    // @property(UIOpacity) mess: UIOpacity = null
    protected onEnable(): void {
        this.init()
        // 重置标志
        this.needClearAccount = false
    }
    init() {
        // this.node.setPosition(0, -1000)
        director.on(emits.tipWndMsg, this.showTip, this)

        this.btn_qr.on(Node.EventType.TOUCH_END, this.onClick_qr, this)
    }
    protected onDestroy(): void {
        director.off(emits.tipWndMsg, this.showTip, this)
    }
    showTip(val: string, clearAccount: boolean = false) {
        this.msgLabel.string = val
        this.needClearAccount = clearAccount
        // this.node.setPosition(0, -50)
        // tween(this.node).to(0.5, { position: new Vec3(0, 0, 0) }).to(0.2, { position: new Vec3(0, 700, 0) }).call(() => {
        //     loadPool.ins.huiShouNode(this.node
        //     )
        // }).start()
    }
    onClick_qr() {
        loadPool.ins.huiShouNode(this.node)
        
        if (this.needClearAccount) {
            // 清除账号密码
            sys.localStorage.removeItem('SLS_USERNAME');
            sys.localStorage.removeItem('SLS_PASSWORD');
            sys.localStorage.removeItem('SLS_USER_ID');
            sys.localStorage.removeItem(localData.playerList);
            sys.localStorage.removeItem(localData.slectType);
            sys.localStorage.removeItem(getScopedPlayerListKey());
            sys.localStorage.removeItem(getScopedSelectTypeKey());
            console.log('账号信息已清除，跳转到登录界面');
            // 跳转到登录界面
            director.loadScene('loading2');
        }
    }
}


