import { _decorator, CCFloat, Collider2D, Component, Contact2DType, Director, director, Node, RigidBody2D, v2, Vec3, Animation } from 'cc';
import { nodePool } from '../utils/nodePool';
import { pzTag } from '../data/enums';
const { ccclass, property } = _decorator;
//电子邮件puhalskijsemen@gmail.com
//源码网站 开vpn全局模式打开 http://web3incubators.com/
//电报https://t.me/gamecode999
//网页客服 http://web3incubators.com/kefu.html
@ccclass('enemyBullet')
export class enemyBullet extends Component {
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
    onDestroy(): void {
        // 组件销毁时一定要停止所有计时器
        this.unscheduleAllCallbacks();
    }
    /**
 * 碰撞监听
 */
    onBeginContact(selfCollider: any, otherCollider: any, contact: any) {
        switch (otherCollider.group) {
            // case pzTag.bullet:
            //     director.once(Director.EVENT_AFTER_PHYSICS, () => {
            //         this.scheduleOnce(() => {
            //             nodePool.ins.getPoolNode('wounTx', this.node.parent, this.node.position)
            //             this.node.destroy();
            //         }, 0.01)
            //     });
            //     break;
            case pzTag.player:
                director.once(Director.EVENT_AFTER_PHYSICS, () => {
                    this.node.destroy();
                });
                break;
        }

    }
}


