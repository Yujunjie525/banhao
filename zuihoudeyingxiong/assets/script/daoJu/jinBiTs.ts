import { _decorator, CCFloat, Collider2D, Component, Contact2DType, director, Node, RigidBody2D, v2, Vec3, Animation } from 'cc';
import { nodePool } from '../utils/nodePool';
import { emits, pzTag } from '../data/enums';
const { ccclass, property } = _decorator;

@ccclass('jinBiTs')
export class jinBiTs extends Component {
    // 碰撞体
    private collider: Collider2D = null;
    // 动画
    private ani: Animation = null
    onEnable(): void {
        this.collider = this.node.getComponent(Collider2D);
        this.ani = this.node.getComponent(Animation)
        this.collider.on(Contact2DType.BEGIN_CONTACT, this.onBeginContact, this);
    }

    update(dt: number) {

    }
    /**
 * 碰撞监听
 */
    onBeginContact(selfCollider: any, otherCollider: any, contact: any) {
        switch (otherCollider.group) {
            // 撞击到人物角色
            case pzTag.player:
                this.scheduleOnce(() => {
                    // 显示奖励特效
                    nodePool.ins.getPoolNode('jiangliTx', this.node.parent, this.node.position)
                    this.node.destroy();
                }, 0.01)
                break;
        }

    }
}


