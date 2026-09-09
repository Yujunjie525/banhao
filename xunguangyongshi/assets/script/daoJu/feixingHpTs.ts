import { _decorator, CCFloat, Collider2D, Component, Contact2DType, director, Node, RigidBody2D, v2, Vec3, Animation } from 'cc';
import { nodePool } from '../utils/nodePool';
import { emits, pzTag } from '../data/enums';
const { ccclass, property } = _decorator;

@ccclass('feixingHpTs')
export class feixingHpTs extends Component {
    // 速度
    @property(CCFloat) bulletSeep: number = 10;
    private feixingRig: RigidBody2D = null
    // 碰撞体
    private collider: Collider2D = null;
    // 动画
    private ani: Animation = null
    onEnable(): void {
        this.feixingRig = this.node.getComponent(RigidBody2D);
        this.collider = this.node.getComponent(Collider2D);
        this.ani = this.node.getComponent(Animation)
        this.collider.on(Contact2DType.BEGIN_CONTACT, this.onBeginContact, this);
    }

    update(dt: number) {
        this.feixingRig.linearVelocity = v2(this.bulletSeep * -1, 0);
        if (this.node.position.x < -1880) {
            nodePool.ins.huiShouNode(this.node)
        }
    }
    /**
 * 碰撞监听
 */
    onBeginContact(selfCollider: any, otherCollider: any, contact: any) {
        switch (otherCollider.group) {
            case pzTag.player:
                this.scheduleOnce(() => {
                    nodePool.ins.getPoolNode('jiangliTx', this.node.parent, this.node.position)
                    this.node.destroy();
                }, 0.01)
                break;
        }

    }
}


