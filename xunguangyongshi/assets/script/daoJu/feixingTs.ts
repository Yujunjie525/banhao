import { _decorator, Animation, CCFloat, Collider2D, Component, Contact2DType, Director, director, RigidBody2D, Sprite, v2 } from 'cc';
import { pzTag } from '../data/enums';
import { audioTool } from '../utils/audioTool';
import { nodePool } from '../utils/nodePool';
import { FrameAnimationPlayer } from '../utils/frameAnimationPlayer';

const { ccclass, property } = _decorator;

@ccclass('feixingTs')
export class feixingTs extends Component {
    private static readonly frameAnimPathMap: Record<string, string> = {
        feixingqi_1: 'enemsYs/飞行1',
        feixingqi_2: 'enemsYs/飞行2',
    };

    @property(CCFloat) bulletSeep: number = 10;
    @property(CCFloat) hp: number = 1;

    private feixingRig: RigidBody2D = null;
    private collider: Collider2D = null;
    private ani: Animation = null;
    private framePlayer: FrameAnimationPlayer = null;

    onEnable(): void {
        this.feixingRig = this.node.getComponent(RigidBody2D);
        this.collider = this.node.getComponent(Collider2D);
        this.ani = this.node.getComponent(Animation);
        this.collider.on(Contact2DType.BEGIN_CONTACT, this.onBeginContact, this);
        this.playFrameAnimation();
    }

    update() {
        this.feixingRig.linearVelocity = v2(this.bulletSeep * -1, 0);
        if (this.node.position.x < -1880) {
            nodePool.ins.huiShouNode(this.node);
        }
    }

    onDestroy(): void {
        this.unscheduleAllCallbacks();
    }

    private playFrameAnimation() {
        const resourcePath = feixingTs.frameAnimPathMap[this.node.name];
        if (!resourcePath) {
            return;
        }

        this.framePlayer = this.node.getComponent(FrameAnimationPlayer) ?? this.node.addComponent(FrameAnimationPlayer);
        this.framePlayer.targetSprite = this.node.getComponent(Sprite);
        this.framePlayer.playOnEnable = false;
        this.framePlayer.createDisplayNodeIfMissing = false;
        this.framePlayer.loop = true;
        this.framePlayer.framesPerSecond = 12;
        this.framePlayer.rootFolder = 'enemsYs';
        this.framePlayer.setResourcePath(resourcePath);
        this.framePlayer.refreshDisplayTransform();
        void this.framePlayer.play();
    }

    onBeginContact(selfCollider: any, otherCollider: any, contact: any) {
        switch (otherCollider.group) {
            case pzTag.bullet:
                audioTool.ins.playSound('zidanZj');
                this.hp -= 1;
                if (this.hp <= 0) {
                    director.once(Director.EVENT_AFTER_PHYSICS, () => {
                        this.scheduleOnce(() => {
                            audioTool.ins.playSound('xiaoshi');
                            nodePool.ins.getPoolNode('wounTx', this.node.parent, this.node.position);
                            this.node.destroy();
                        }, 0.01);
                    });
                }
                break;
            case pzTag.player:
                director.once(Director.EVENT_AFTER_PHYSICS, () => {
                    this.node.destroy();
                });
                break;
        }
    }
}
