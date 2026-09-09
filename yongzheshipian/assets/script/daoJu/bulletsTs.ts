import { _decorator, CCFloat, Collider2D, Component, Contact2DType, Director, director, Node, Vec3, Animation } from 'cc';
import { nodePool } from '../utils/nodePool';
import { pzTag } from '../data/enums';
const { ccclass, property } = _decorator;
//电子邮件puhalskijsemen@gmail.com
//源码网站 开vpn全局模式打开 http://web3incubators.com/
//电报https://t.me/gamecode999
//网页客服 http://web3incubators.com/kefu.html
@ccclass('bulletsTs')
export class bulletsTs extends Component {
    // 子弹速度
    @property(CCFloat) bulletSeep: number = 1280;
    // 碰撞体
    private collider: Collider2D = null;
    onEnable(): void {
        this.init()
    }

    update(dt: number) {
        //子弹位置
        const juli = this.bulletSeep * dt;
        const bulletPos = new Vec3(
            this.node.position.x + juli,
            this.node.position.y
        );
        //子弹出屏幕后回收
        this.node.setPosition(bulletPos);
        if (this.node.position.x > 1280) {
            nodePool.ins.huiShouNode(this.node)
        }
    }
    onDestroy(): void {
        // 组件销毁时一定要停止所有计时器
        this.unscheduleAllCallbacks();
    }
    init() {
        this.collider = this.node.getComponent(Collider2D);
        this.collider.on(Contact2DType.BEGIN_CONTACT, this.onBeginContact, this);
    }
    /**
     * 碰撞监听
     */
    onBeginContact(selfCollider: any, otherCollider: any, contact: any) {
        switch (otherCollider.group) {
            case pzTag.enemy:
                director.once(Director.EVENT_AFTER_PHYSICS, () => {
                    this.node.destroy();
                });
                break;
        }

    }
}


