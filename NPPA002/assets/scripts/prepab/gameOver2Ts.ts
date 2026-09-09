import { _decorator, Component, director, Node, NodeEventType, tween, Vec3 } from 'cc';
import { gameConfig } from '../data/gameConfig';
import { bgmName, emits, local } from '../data/enmus';
import { loadPool } from '../res/loadPool';
import { audioTool } from '../untils/audioTool';
import { save } from '../untils/tools';
import { wxAd } from '../AD/wxAd';
const { ccclass, property } = _decorator;

@ccclass('gameOver2Ts')
export class gameOver2Ts extends Component {
    private popUI: Node;
    protected onEnable(): void {
        this.init()
    }
    init() {
        // 进场动画
        this.popUI = this.node.getChildByName('popUI')
        this.popUI.setScale(0, 0)
        tween(this.popUI).to(0.2, { scale: new Vec3(1, 1, 1) }).by(0.06, { scale: new Vec3(0.2, 0.2, 1) }).by(0.05, { scale: new Vec3(-0.2, -0.2, 1) }).start()
        // 重新开始游戏
        const anew = this.node.getChildByPath('popUI/anew')
        anew.on(NodeEventType.TOUCH_START, this.anewBtn, this)
        // 返回首页
        const back = this.node.getChildByPath('popUI/back')
        back.on(NodeEventType.TOUCH_START, this.backBtn, this)
    }
    // 重新玩
    anewBtn() {
        // 关闭广告
        if (gameConfig.isAd) {
            wxAd.ins.hideBanner2()
        }
        audioTool.ins.playSound(bgmName.sound_btn)
        // 出场动画
        tween(this.popUI).by(0.06, { scale: new Vec3(0.2, 0.2, 1) }).by(0.05, { scale: new Vec3(-0.2, -0.2, 1) }).to(0.02, { scale: new Vec3(1.1, 1.1, 1) }).to(0.1, { scale: new Vec3(0, 0, 1) }).call(() => {
            director.emit(emits.anewGame)
            loadPool.ins.huiShouNode(this.node)
        }).start()
    }
    backBtn() {
        // 关闭广告
        if (gameConfig.isAd) {
            wxAd.ins.hideCustomAd()
            wxAd.ins.hideBanner2()
        }
        audioTool.ins.playSound(bgmName.sound_btn)
        // 出场动画
        tween(this.popUI).by(0.06, { scale: new Vec3(0.2, 0.2, 1) }).by(0.05, { scale: new Vec3(-0.2, -0.2, 1) }).to(0.02, { scale: new Vec3(1.1, 1.1, 1) }).to(0.1, { scale: new Vec3(0, 0, 1) }).call(() => {
            loadPool.ins.huiShouNode(this.node)
            director.loadScene('home')
        }).start()
    }
}


