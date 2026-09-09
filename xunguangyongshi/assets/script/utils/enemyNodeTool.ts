import { _decorator, Component, director, Node, Vec3 } from 'cc';
import { emits } from '../data/enums';
import { nodePool } from './nodePool';
const { ccclass, property } = _decorator;

@ccclass('enemyNodeTool')
export class enemyNodeTool extends Component {
    start() {
        director.on(emits.creatLevel, this.creatLevel, this)
    }
    onEnable(): void {
    }
    update(deltaTime: number) {

    }
    creatLevel() {
        console.log('111');

        nodePool.ins.getPoolNode('level_1', this.node, pos)
    }
}


