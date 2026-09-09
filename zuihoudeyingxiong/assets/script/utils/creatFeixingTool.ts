import { _decorator, Component, Node, Vec3 } from 'cc';
import { nodePool } from './nodePool';
import { gameConfig } from '../data/gameConfig';
const { ccclass, property } = _decorator;

@ccclass('creatFeixingTool')
export class creatFeixingTool extends Component {
    // 随机时间
    private randomTime: number = null
    // 随机飞行物
    private randomFxq: number = null
    // 随机生成位置
    private randomPos: Vec3 = null;
    start() {
        // 生成时间
        this.randomTime = Math.floor(Math.random() * (10 - 5) + 5)
        // 随机飞行器类型
        this.randomFxq = Math.floor(Math.random() * (gameConfig.fxqName.length - 0) + 0)
        this.schedule(function () {
            if (gameConfig.gamePause == 1) {
                return
            } else {
                console.log('类型：' + gameConfig.fxqName[this.randomFxq]);
                // 随机位置
                const randomPosY = Math.floor(Math.random() * 270 - 70)
                this.randomPos = new Vec3(this.node.position.x, randomPosY)
                nodePool.ins.getPoolNode(gameConfig.fxqName[this.randomFxq], this.node, this.randomPos)
                // 随机生成时间
                this.randomTime = Math.floor(Math.random() * (10 - 5) + 5)
                // 随机飞行器类型
                this.randomFxq = Math.floor(Math.random() * (gameConfig.fxqName.length - 0) + 0)
            }
        }, this.randomTime);
    }

}


