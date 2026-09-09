import { _decorator, Component, director, Node, NodeEventType, tween, Vec3 } from 'cc';
import { loadPool } from '../res/loadPool';
import { bgmName, emits } from '../data/enmus';
import { audioTool } from '../untils/audioTool';
import { wxAd } from '../AD/wxAd';
import { gameConfig } from '../data/gameConfig';
import { save } from '../untils/tools';
const { ccclass, property } = _decorator;

@ccclass('PauseWnd')
export class PauseWnd extends Component {
    @property(Node) back: Node;
    private popUI: Node;
    protected onEnable(): void {
        this.init()
    }
    init() {
        let close = this.node.getChildByPath('popUI/close')
        close.on(NodeEventType.TOUCH_START, this.closeBtn, this)
        let btn_close = this.node.getChildByPath('popUI/btn_close')
        btn_close.on(NodeEventType.TOUCH_START, this.closeBtn, this)
        // 进场动画
        this.popUI = this.node.getChildByName('popUI')
        this.popUI.setScale(0, 0)
        tween(this.popUI).to(0.2, { scale: new Vec3(1, 1, 1) }).by(0.06, { scale: new Vec3(0.2, 0.2, 1) }).by(0.05, { scale: new Vec3(-0.2, -0.2, 1) }).start()
    }
    // 关闭弹窗
    closeBtn() {
        if (gameConfig.isAd) {
            wxAd.ins.hideBanner2()
        }
        audioTool.ins.playSound(bgmName.sound_btn)
        // 恢复计时器
        director.emit(emits.resumeTimer)
        // 出场动画
        tween(this.popUI).by(0.06, { scale: new Vec3(0.2, 0.2, 1) }).by(0.05, { scale: new Vec3(-0.2, -0.2, 1) }).to(0.02, { scale: new Vec3(1.1, 1.1, 1) }).to(0.1, { scale: new Vec3(0, 0, 1) }).call(() => {
            loadPool.ins.huiShouNode(this.node)
        }).start()
    }
    // 返回首页
    backBtn() {
        audioTool.ins.stopMusic()
        loadPool.ins.huiShouNode(this.node)
        // 隐藏广告
        if (gameConfig.isAd) {
            wxAd.ins.hideCustomAd()
            wxAd.ins.hideBanner2()
        }
        director.loadScene('home')
    }
}
