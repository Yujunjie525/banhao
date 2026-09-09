import { _decorator, Component, director, Node, NodeEventType, tween, Vec3 } from 'cc';
import { gameConfig } from '../data/gameConfig';
import { emits, localData } from '../data/enums';
import { nodePool } from './nodePool';
import { wxAd } from '../AD/wxAd';
import { save } from './tools';
const { ccclass, property } = _decorator;

@ccclass('tiliTool')
export class tiliTool extends Component {
    private popUI: Node;
    protected onEnable(): void {
        let lingqu2 = this.node.getChildByPath('popUI/lingqu2')
        lingqu2.on(NodeEventType.TOUCH_START, this.getTili, this)
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
    // 获取体力
    getTili() {
        // wxAd.ins.jiliAd(() => {

        // })
        gameConfig.tiliNum += 20
        // 更新数据
        director.emit(emits.initNum)
        save(localData.tiliNum, gameConfig.tiliNum)
        // 弹窗
        console.log(gameConfig.isGame);
        if (gameConfig.isGame == 0) {
            nodePool.ins.getPoolNode('tips', gameConfig.homeRoot, new Vec3(0, 60, 0))
            director.emit(emits.tips, '领取成功')
            // 出场动画
            tween(this.popUI).by(0.06, { scale: new Vec3(0.2, 0.2, 1) }).by(0.05, { scale: new Vec3(-0.2, -0.2, 1) }).to(0.02, { scale: new Vec3(1.1, 1.1, 1) }).to(0.1, { scale: new Vec3(0, 0, 1) }).call(() => {
                nodePool.ins.huiShouNode(this.node)
            }).start()
        } else {
            gameConfig.gamePause = 0
            director.emit(emits.gamePause)
            director.loadScene('game')
            gameConfig.tiliNum -= 5
            save(localData.tiliNum, gameConfig.tiliNum)
        }
    }
    closeBtn() {
        // 出场动画
        tween(this.popUI).by(0.06, { scale: new Vec3(0.2, 0.2, 1) }).by(0.05, { scale: new Vec3(-0.2, -0.2, 1) }).to(0.02, { scale: new Vec3(1.1, 1.1, 1) }).to(0.1, { scale: new Vec3(0, 0, 1) }).call(() => {
            nodePool.ins.huiShouNode(this.node)
        }).start()
    }
}


