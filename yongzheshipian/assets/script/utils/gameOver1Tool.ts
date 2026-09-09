import { _decorator, Component, director, Node, NodeEventType, tween, Vec3 } from 'cc';
import { nodePool } from './nodePool';
import { gameConfig } from '../data/gameConfig';
import { emits } from '../data/enums';
import { audioTool } from './audioTool';
import { wxAd } from '../AD/wxAd';
const { ccclass, property } = _decorator;

@ccclass('gameOver1Tool')
export class gameOver1Tool extends Component {
    private popUI: Node;
    protected onEnable(): void {
        this.init()
    }
    init() {
        // 进场动画
        this.popUI = this.node.getChildByName('popUI')
        this.popUI.setScale(0, 0)
        tween(this.popUI).to(0.2, { scale: new Vec3(1, 1, 1) }).by(0.06, { scale: new Vec3(0.2, 0.2, 1) }).by(0.05, { scale: new Vec3(-0.2, -0.2, 1) }).start()
        // 按钮监听
        const jujue = this.node.getChildByPath('popUI/jujue')
        jujue.on(NodeEventType.TOUCH_START, this.jujueBtn, this)
        const fuhuo = this.node.getChildByPath('popUI/fuhuo')
        fuhuo.on(NodeEventType.TOUCH_START, this.fuhuoBtn, this)
    }
    // 拒绝
    jujueBtn() {
        // nodePool.ins.huiShouNode(this.node)
        // nodePool.ins.getPoolNode('gameOver2', gameConfig.gameRoot)
         tween(this.popUI)
            .by(0.06, { scale: new Vec3(0.2, 0.2, 1) })
            .by(0.05, { scale: new Vec3(-0.2, -0.2, 1) })
            .to(0.02, { scale: new Vec3(1.1, 1.1, 1) })
            .to(0.1, { scale: new Vec3(0, 0, 1) })
            .call(() => {
                audioTool.ins.stopMusic()
                gameConfig.gamePause = 0
                director.emit(emits.gamePause)
                director.loadScene('home2')
            })
            .start()
    }
    // 复活
    fuhuoBtn() {
        wxAd.ins.jiliAd(() => {
            gameConfig.fuhuoNum -= 1
            audioTool.ins.playMusic('gameBgm')
            nodePool.ins.huiShouNode(this.node)
            gameConfig.gamePause = 0
            director.emit(emits.gamePause)
            director.emit(emits.fuhuo)
            director.emit(emits.PHNum, 10)
            console.log('复活了');
        })

    }
}


