import { _decorator, Collider2D, Component, Contact2DType, director, Director, Node, Animation, RigidBody2D, v2, CCFloat } from 'cc';
import { pzTag } from '../data/enums';
import { nodePool } from '../utils/nodePool';
import { audioTool } from '../utils/audioTool';
const { ccclass, property } = _decorator;

@ccclass('runEmeyTs')
export class runEmeyTs extends Component {
    // 碰撞体
    private collider: Collider2D = null;
    // 动画
    private ani: Animation = null
    // 刚体
    private rig: RigidBody2D = null
    // 奔跑速度
    @property(CCFloat) bulletSeep: number = 10;
    onEnable(): void {
        this.init()
    }
    update(dt: number): void {
        this.rig.linearVelocity = v2(this.bulletSeep * -3, 0);
        if (this.node.position.x < -1880) {
            nodePool.ins.huiShouNode(this.node)
        }
    }
    init() {
        this.collider = this.node.getComponent(Collider2D);
        this.collider.on(Contact2DType.BEGIN_CONTACT, this.onBeginContact, this);
        this.ani = this.node.getComponent(Animation)
        this.rig = this.node.getComponent(RigidBody2D);
    }
    /**
     * 碰撞监听
     */
    onBeginContact(selfCollider: any, otherCollider: any, contact: any) {
        console.log(otherCollider.group);
        switch (otherCollider.group) {
            // 如果碰到的是子弹，则播放消失动画，并销毁
            case pzTag.bullet:
                director.once(Director.EVENT_AFTER_PHYSICS, () => {
                    this.scheduleOnce(() => {
                        audioTool.ins.playSound('xiaoshi')
                        nodePool.ins.getPoolNode('wounTx', this.node.parent, this.node.position)
                        this.node.destroy();
                    }, 0.01)
                });
                break;
        }

    }
}


