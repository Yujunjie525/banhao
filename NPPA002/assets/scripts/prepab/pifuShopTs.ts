import { _decorator, Component, director, Node, NodeEventType, sys, tween, Vec3 } from 'cc';
import { gameConfig } from '../data/gameConfig';
import { loadPool } from '../res/loadPool';
import { audioTool } from '../untils/audioTool';
import { bgmName, emits, local } from '../data/enmus';
import { save } from '../untils/tools';
import { wxAd } from '../AD/wxAd';
import KSAdMgr from '../../Sdk/KSAdMgr';
const { ccclass, property } = _decorator;

@ccclass('pifuShopTs')
export class pifuShopTs extends Component {
    @property(Node) pifu1: Node = null
    @property(Node) pifu2: Node = null
    private popUI: Node;
    protected onEnable(): void {
        this.init()
    }
    init() {
        // 进场动画
        this.popUI = this.node.getChildByName('popUI')
        this.popUI.setScale(0, 0)
        tween(this.popUI).to(0.2, { scale: new Vec3(1, 1, 1) }).by(0.06, { scale: new Vec3(0.2, 0.2, 1) }).by(0.05, { scale: new Vec3(-0.2, -0.2, 1) }).start()
        // 选择状态
        switch (gameConfig.nowPifu) {
            case 1:
                this.pifu1.getChildByName('status').active = true
                this.pifu2.getChildByName('status').active = false
                break
            case 2:
                this.pifu1.getChildByName('status').active = false
                this.pifu2.getChildByName('status').active = true
                break
            default:
                console.log('更换皮肤出错');
        }
        // 第二个皮肤是否解锁
        if (gameConfig.pifuIsJiesuo) {
            this.pifu2.getChildByName('jiesuo').active = false
        } else {
            this.pifu2.getChildByName('jiesuo').active = true
        }
        // 注册点击事件
        this.pifu1.on(NodeEventType.TOUCH_START, this.pifuBtn1, this)
        this.pifu2.on(NodeEventType.TOUCH_START, this.pifuBtn2, this)
    }
    // 皮肤1
    pifuBtn1() {
        audioTool.ins.playSound(bgmName.sound_btn)
        this.pifu1.getChildByName('status').active = true
        this.pifu2.getChildByName('status').active = false
        gameConfig.nowPifu = 1
        save(local.nowPifu, gameConfig.nowPifu)
    }
    // 皮肤2
    pifuBtn2() {
        audioTool.ins.playSound(bgmName.sound_btn)
        if (gameConfig.pifuIsJiesuo) {
            this.pifu1.getChildByName('status').active = false
            this.pifu2.getChildByName('status').active = true
            gameConfig.nowPifu = 2
            save(local.nowPifu, gameConfig.nowPifu)
        } else {
            if (gameConfig.isAd) {
                if (sys.platform == sys.Platform.WECHAT_GAME) {
                    KSAdMgr.Instance.videoReward(() => {
                        loadPool.ins.getPoolNode('tips', this.node)
                        director.emit(emits.tipMsg, '皮肤已解锁')
                        this.pifu2.getChildByName('jiesuo').active = false
                        gameConfig.pifuIsJiesuo = 1
                        save(local.pifuIsJiesuo, gameConfig.pifuIsJiesuo)
                    })
                } else {
                    wxAd.ins.loadVideoAd(() => {
                        loadPool.ins.getPoolNode('tips', this.node)
                        director.emit(emits.tipMsg, '皮肤已解锁')
                        this.pifu2.getChildByName('jiesuo').active = false
                        gameConfig.pifuIsJiesuo = 1
                        save(local.pifuIsJiesuo, gameConfig.pifuIsJiesuo)
                    })
                }
            }
        }
    }
    // 关闭弹窗
    closeBtn() {
        audioTool.ins.playSound(bgmName.sound_btn)
        // 出场动画
        tween(this.popUI).by(0.06, { scale: new Vec3(0.2, 0.2, 1) }).by(0.05, { scale: new Vec3(-0.2, -0.2, 1) }).to(0.02, { scale: new Vec3(1.1, 1.1, 1) }).to(0.1, { scale: new Vec3(0, 0, 1) }).call(() => {
            loadPool.ins.huiShouNode(this.node)
        }).start()
    }
    /**
   * 组件销毁
   */
    protected onDestroy(): void {
        this.pifu1.off(NodeEventType.TOUCH_START, this.pifuBtn1, this)
        this.pifu2.off(NodeEventType.TOUCH_START, this.pifuBtn2, this)
    }
}



