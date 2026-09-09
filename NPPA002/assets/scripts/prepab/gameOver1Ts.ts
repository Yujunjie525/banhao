import { _decorator, Component, director, Node, NodeEventType, sys, tween, Vec3 } from 'cc';
import { loadPool } from '../res/loadPool';
import { gameConfig } from '../data/gameConfig';
import { bgmName, emits } from '../data/enmus';
import { audioTool } from '../untils/audioTool';
import { wxAd } from '../AD/wxAd';
import KSAdMgr from '../../Sdk/KSAdMgr';
const { ccclass, property } = _decorator;

@ccclass('gameOver1Ts')
export class gameOver1Ts extends Component {
    private popUI: Node;
    protected onEnable(): void {
        this.init()
    }

    init() {
        if (gameConfig.isAd) {
            wxAd.ins.chapingAd()
        }
        // 进场动画
        this.popUI = this.node.getChildByName('popUI')
        this.popUI.setScale(0, 0)
        tween(this.popUI).to(0.2, { scale: new Vec3(1, 1, 1) }).by(0.06, { scale: new Vec3(0.2, 0.2, 1) }).by(0.05, { scale: new Vec3(-0.2, -0.2, 1) }).start()
        // 复活按钮
        const fuhuo = this.node.getChildByPath('popUI/fuhuo')
        fuhuo.on(NodeEventType.TOUCH_START, this.fuhuoBtn, this)
        // 拒绝复活
        const refuse = this.node.getChildByPath('popUI/refuse')
        refuse.on(NodeEventType.TOUCH_START, this.refuseBtn, this)
    }
    // 
    fuhuoBtn() {
        // 关闭广告
        if (gameConfig.isAd) {
            if (sys.platform == sys.Platform.WECHAT_GAME) {
                KSAdMgr.Instance.videoReward(() => {
                    gameConfig.fuhouNum = 0
                    director.emit(emits.isFuhuo)
                    // 出场动画
                    tween(this.popUI).by(0.06, { scale: new Vec3(0.2, 0.2, 1) }).by(0.05, { scale: new Vec3(-0.2, -0.2, 1) }).to(0.02, { scale: new Vec3(1.1, 1.1, 1) }).to(0.1, { scale: new Vec3(0, 0, 1) }).call(() => {
                        loadPool.ins.huiShouNode(this.node)
                    }).start()
                });
            } else {
                wxAd.ins.hideBanner2()
                wxAd.ins.loadVideoAd(() => {
                    gameConfig.fuhouNum = 0
                    director.emit(emits.isFuhuo)
                    // 出场动画
                    tween(this.popUI).by(0.06, { scale: new Vec3(0.2, 0.2, 1) }).by(0.05, { scale: new Vec3(-0.2, -0.2, 1) }).to(0.02, { scale: new Vec3(1.1, 1.1, 1) }).to(0.1, { scale: new Vec3(0, 0, 1) }).call(() => {
                        loadPool.ins.huiShouNode(this.node)
                    }).start()
                })
            }
        } else {
            console.log('无广告');
        }
    }
    // 拒绝
    refuseBtn() {
        audioTool.ins.playSound(bgmName.sound_btn)
        // 出场动画
        tween(this.popUI).by(0.06, { scale: new Vec3(0.2, 0.2, 1) }).by(0.05, { scale: new Vec3(-0.2, -0.2, 1) }).to(0.02, { scale: new Vec3(1.1, 1.1, 1) }).to(0.1, { scale: new Vec3(0, 0, 1) }).call(() => {
            loadPool.ins.huiShouNode(this.node)
            // loadPool.ins.getPoolNode('gameOver2', gameConfig.gameRoot)
            director.loadScene('home')
        }).start()
    }
    /**
     * 组件销毁
     */
    protected onDestroy(): void {
        // 复活按钮
        const fuhuo = this.node.getChildByPath('popUI/fuhuo')
        fuhuo.off(NodeEventType.TOUCH_START, this.fuhuoBtn, this)
        // 拒绝复活
        const refuse = this.node.getChildByPath('popUI/refuse')
        refuse.off(NodeEventType.TOUCH_START, this.refuseBtn, this)
    }
}


