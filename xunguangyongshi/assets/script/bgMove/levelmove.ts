import { _decorator, Collider2D, Component, Contact2DType, Director, director, Node, Vec3 } from 'cc';
import { nodePool } from '../utils/nodePool';
import { gameConfig } from '../data/gameConfig';
import { emits, pzTag } from '../data/enums';
const { ccclass, property } = _decorator;

@ccclass('roadmove')
export class roadmove extends Component {
    // 背景移动速度
    @property
    speed: number = 120;
    // 碰撞体
    private collider: Collider2D = null;
    // 是否创建新地图
    private isLeve = true
    // 地图随机
    private leveRandom = 0;
    onEnable(): void {
        // 关卡数量
        let leveNum = gameConfig.maxLevel - 1
        this.leveRandom = Math.round(Math.random() * (leveNum - 1) + 1)
        this.collider = this.node.getComponent(Collider2D);
        director.on(emits.gamePause, this.gamePause, this)
    }
    update(deltaTime: number) {
        // 每张背景图的位置
        let position = this.node.position;
        // 移动的距离
        let moveAmount = this.speed * deltaTime;
        //实时更新每张背景图的位置
        this.node.position = new Vec3(position.x - moveAmount, position.y, 0);
        if (this.node.position.x < 1200 && this.isLeve) {
            this.isLeve = false
            const pos = new Vec3(1980, 13.4, 0)
            const leve = 'leve_' + this.leveRandom
            console.log(leve);
            nodePool.ins.getPoolNode(leve, gameConfig.enemyNode, pos)
        }
        if (this.node.position.x < -1200) {
            this.node.destroy();
        }
    }
    // 暂停游戏
    gamePause() {
        if (gameConfig.gamePause == 1) {
            this.speed = 0
        } else {
            this.speed = 250
        }
    }
    onDestroy(): void {
        // 组件销毁时一定要停止所有计时器
        this.unscheduleAllCallbacks();
        director.off(emits.gamePause, this.gamePause, this)
    }
}


