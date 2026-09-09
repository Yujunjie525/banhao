import { _decorator, Component, director, Node, NodeEventType, tween, Vec3 } from 'cc';
import { nodePool } from './nodePool';
import { emits } from '../data/enums';
import { gameConfig } from '../data/gameConfig';
import { addTotalEarnedGold, getTime, setTime } from './tools';
import { wxAd } from '../AD/wxAd';
const { ccclass, property } = _decorator;

@ccclass('fuliTool')
export class fuliTool extends Component {
    private popUI: Node;
    private isTouch: boolean = true;
    protected onEnable(): void {
        // 领取按钮
        let lingqu = this.node.getChildByPath('popUI/lingqu')
        lingqu.on(NodeEventType.TOUCH_START, this.lingquBtn, this)
        let lingqu2 = this.node.getChildByPath('popUI/lingqu2')
        lingqu2.on(NodeEventType.TOUCH_START, this.lingquBtn2, this)
        let close = this.node.getChildByPath('popUI/closeBtn')
        close.on(NodeEventType.TOUCH_START, this.closeBtn, this)
        this.init()
    }
    // 初始化
    init() {
        // 进场动画
        this.popUI = this.node.getChildByName('popUI')
        this.popUI.setScale(0, 0)
        tween(this.popUI).to(0.2, { scale: new Vec3(1, 1, 1) }).by(0.06, { scale: new Vec3(0.2, 0.2, 1) }).by(0.05, { scale: new Vec3(-0.2, -0.2, 1) }).start()
    }
    // 普通领取
    lingquBtn() {
        if (this.isTouch) {
            this.isTouch = false
            setTime()
            // 金币和体力
            gameConfig.jinbiNum += 100
            addTotalEarnedGold(100)
            gameConfig.tiliNum += 20
            // 更新数据
            director.emit(emits.initNum)
            // 弹窗
            nodePool.ins.getPoolNode('tips', gameConfig.homeRoot, new Vec3(0, 60, 0))
            director.emit(emits.tips, '领取成功')
            // 出场动画
            tween(this.popUI).by(0.06, { scale: new Vec3(0.2, 0.2, 1) }).by(0.05, { scale: new Vec3(-0.2, -0.2, 1) }).to(0.02, { scale: new Vec3(1.1, 1.1, 1) }).to(0.1, { scale: new Vec3(0, 0, 1) }).call(() => {
                nodePool.ins.huiShouNode(this.node)
            }).start()
            director.emit(emits.initHomeIcon)
        }
    }
    // 双倍领取
    lingquBtn2() {
        if (this.isTouch) {
            this.isTouch = false
            // wxAd.ins.jiliAd(() => {

            // })
            setTime()
            // 金币和体力
            gameConfig.jinbiNum += 200
            addTotalEarnedGold(200)
            gameConfig.tiliNum += 40
            // 更新数据
            director.emit(emits.initNum)
            // 弹窗
            nodePool.ins.getPoolNode('tips', gameConfig.homeRoot, new Vec3(0, 60, 0))
            director.emit(emits.tips, '双倍领取成功')
            // 出场动画
            tween(this.popUI).by(0.06, { scale: new Vec3(0.2, 0.2, 1) }).by(0.05, { scale: new Vec3(-0.2, -0.2, 1) }).to(0.02, { scale: new Vec3(1.1, 1.1, 1) }).to(0.1, { scale: new Vec3(0, 0, 1) }).call(() => {
                nodePool.ins.huiShouNode(this.node)
            }).start()
            director.emit(emits.initHomeIcon)
        }
    }
    closeBtn() {
        // 出场动画
        tween(this.popUI).by(0.06, { scale: new Vec3(0.2, 0.2, 1) }).by(0.05, { scale: new Vec3(-0.2, -0.2, 1) }).to(0.02, { scale: new Vec3(1.1, 1.1, 1) }).to(0.1, { scale: new Vec3(0, 0, 1) }).call(() => {
            nodePool.ins.huiShouNode(this.node)
        }).start()
    }
}
