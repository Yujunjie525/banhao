import { _decorator, Collider2D, Component, Contact2DType, director, Director, Node, Animation, RigidBody2D, v2, CCFloat, Vec3, UITransform } from 'cc';
import { emits, pzTag } from '../data/enums';
import { nodePool } from '../utils/nodePool';
import { gameConfig } from '../data/gameConfig';
import { audioTool } from '../utils/audioTool';
const { ccclass, property } = _decorator;
//电子邮件puhalskijsemen@gmail.com
//源码网站 开vpn全局模式打开 http://web3incubators.com/
//电报https://t.me/gamecode999
//网页客服 http://web3incubators.com/kefu.html
@ccclass('shootEmeyTs')
export class shootEmeyTs extends Component {
    // 碰撞体
    private collider: Collider2D = null;
    // 动画
    private ani: Animation = null
    // 刚体
    private rig: RigidBody2D = null
    // 子弹相对于玩家偏移 X
    @property(CCFloat) pospianyiX: number = 40
    // 子弹相对于玩家偏移 Y
    @property(CCFloat) pospianyiY: number = -10
    onEnable(): void {
        this.init()
    }
    update(dt: number): void {
    }
    onDestroy(): void {
        // 组件销毁时一定要停止所有计时器
        this.unscheduleAllCallbacks();
    }
    init() {
        this.collider = this.node.getComponent(Collider2D);
        this.collider.on(Contact2DType.BEGIN_CONTACT, this.onBeginContact, this);
        this.rig = this.node.getComponent(RigidBody2D);
        this.shootBullet()
    }
    /**
     * 碰撞监听
     */
    onBeginContact(selfCollider: any, otherCollider: any, contact: any) {
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
    /**
     * 发射子弹
     */
    shootBullet() {
        this.schedule(() => {
            if (gameConfig.gamePause == 1) {
                return
            } else {
                const bullPos = new Vec3(this.node.position.x + this.pospianyiX, this.node.position.y + this.pospianyiY, this.node.position.z)
                nodePool.ins.getPoolNode('enemyBullet', this.node.getParent(), bullPos)
            }

        }, 3)
    }
}


