import { _decorator, Component, director, Node, NodeEventType, tween, Vec3 } from 'cc';
import { loadPool } from '../res/loadPool';
import { bgmName, emits } from '../data/enmus';
import { audioTool } from '../../script/utils/audioTool';
import { wxAd } from '../../script/AD/wxAd';
import { gameConfig } from '../../script/data/gameConfig';
import { emits as legacyEmits } from '../../script/data/enums';
import { clearSessionUserData, save } from '../../script/utils/tools';
const { ccclass, property } = _decorator;

@ccclass('setting')
export class setting extends Component {
    @property(Node) back: Node;
    @property(Node) back2: Node;
    private popUI: Node;
    protected onEnable(): void {
        this.init()
    }
    init() {
        director.on(emits.backIsShow, this.backIsShow, this)
        let close = this.node.getChildByPath('popUI/close')
        close.on(NodeEventType.TOUCH_START, this.closeBtn, this)
        // 进场动画
        this.popUI = this.node.getChildByName('popUI')
        this.popUI.setScale(0, 0)
        tween(this.popUI).to(0.2, { scale: new Vec3(1, 1, 1) }).by(0.06, { scale: new Vec3(0.2, 0.2, 1) }).by(0.05, { scale: new Vec3(-0.2, -0.2, 1) }).start()
    }
    protected onDestroy(): void {
        director.off(emits.backIsShow, this.backIsShow, this)
    }
    // 关闭弹窗
    closeBtn() {
        if (gameConfig.isAd) {
            // wxAd.ins.hideBanner2()
        }
        audioTool.ins.playSound(bgmName.sound_btn)
        // 出场动画
        tween(this.popUI).by(0.06, { scale: new Vec3(0.2, 0.2, 1) }).by(0.05, { scale: new Vec3(-0.2, -0.2, 1) }).to(0.02, { scale: new Vec3(1.1, 1.1, 1) }).to(0.1, { scale: new Vec3(0, 0, 1) }).call(() => {
            if (gameConfig.gamePause == 1) {
                gameConfig.gamePause = 0
                director.emit(legacyEmits.gamePause)
            }
            loadPool.ins.huiShouNode(this.node)
        }).start()
    }
    // 返回首页
    backBtn() {
        audioTool.ins.stopMusic()
        loadPool.ins.huiShouNode(this.node)
        // 隐藏广告
        if (gameConfig.isAd) {
            // wxAd.ins.hideCustomAd()
            // wxAd.ins.hideBanner2()
        }
        director.loadScene('home2')
    }
    // 返回到登录界面
    backBtn2() {
        audioTool.ins.stopMusic()
        loadPool.ins.huiShouNode(this.node)
        
        clearSessionUserData();
        localStorage.removeItem('SLS_USERNAME');
        localStorage.removeItem('SLS_PASSWORD');
        localStorage.removeItem('SLS_USER_ID');
        save('SLS_REALNAME', 'false');
        console.log('账号信息已清除，实名认证信息保留，跳转到登录界面');
        director.loadScene('loading2');
    }

    backIsShow(val: number) {
        if (val == 1) {
            this.back.active = true
            this.back2.active = false
        } else {
            this.back2.active = true
            this.back.active = false
        }
    }
}
