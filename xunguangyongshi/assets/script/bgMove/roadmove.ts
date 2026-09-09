import { _decorator, Component, director, Node, Vec3 } from 'cc';
import { emits } from '../data/enums';
import { gameConfig } from '../data/gameConfig';
const { ccclass, property } = _decorator;

@ccclass('roadmove')
export class roadmove extends Component {
    // 背景移动速度
    @property
    speed: number = 120;
    start() {
        director.on(emits.gamePause, this.gamePause, this)
    }
    update(deltaTime: number) {
        // 每张背景图的位置
        let position = this.node.position;
        // 移动的距离
        let moveAmount = this.speed * deltaTime;
        //实时更新每张背景图的位置
        this.node.position = new Vec3(position.x - moveAmount, position.y, 0);
        // 当这个背景的坐标小于负的宽度时
        if (this.node.position.x < -2460) {
            this.node.destroy()
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
    protected onDestroy(): void {
        director.off(emits.gamePause, this.gamePause, this)
    }
}


