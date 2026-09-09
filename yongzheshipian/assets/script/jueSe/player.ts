import { _decorator, CCFloat, CCString, Collider2D, Color, Component, Contact2DType, director, RigidBody2D, sp, tween, UIRenderer, v2, Vec3 } from 'cc';
import { emits, pzTag } from '../data/enums';
import { nodePool } from '../utils/nodePool';
import { gameConfig } from '../data/gameConfig';
import { audioTool } from '../utils/audioTool';
import { FrameAnimationPlayer } from '../utils/frameAnimationPlayer';

const { ccclass, property } = _decorator;

@ccclass('player')
export class player extends Component {
    private palyerRig: RigidBody2D = null;
    private isJump = false;
    private isJStk = false;

    @property(CCFloat) pospianyiX = 40;
    @property(CCFloat) pospianyiY = -10;
    @property(CCFloat) UpSpeed = 8;
    @property(CCString) bulletType: string;

    private ske: sp.Skeleton = null;
    private framePlayer: FrameAnimationPlayer = null;
    private collider: Collider2D = null;
    private animationVersion = 0;

    onEnable(): void {
        this.init();
    }

    update() {
        if (this.isJump && gameConfig.liqiNum > 0) {
            this.fly();
        } else if (this.isJump && gameConfig.liqiNum <= 0) {
            this.isJumpTouch(false);
        }
    }

    init() {
        this.ske = this.node.getComponent(sp.Skeleton);
        this.framePlayer = this.node.getComponent(FrameAnimationPlayer) ?? this.node.addComponent(FrameAnimationPlayer);
        this.framePlayer.playOnEnable = false;
        this.framePlayer.rootFolder = 'Player';
        this.framePlayer.setResourcePath(`Player/${this.node.name}`);
        this.framePlayer.displayScale = 2.5;
        this.framePlayer.displayOffsetX = 0;
        this.framePlayer.displayOffsetY = this.node.name === 'player2' ? 0 : 136.667;
        this.framePlayer.refreshDisplayTransform();

        this.palyerRig = this.node.getComponent(RigidBody2D);
        this.collider = this.node.getComponent(Collider2D);
        this.collider.on(Contact2DType.BEGIN_CONTACT, this.onBeginContact, this);

        director.on(emits.jump, this.isJumpTouch, this);
        director.on(emits.atk, this.isJStkTouch, this);

        this.showStaticRoleFrame();
    }

    onBeginContact(selfCollider: any, otherCollider: any, contact: any) {
        if (!gameConfig.ifFuhuo) {
            switch (otherCollider.group) {
                case pzTag.road:
                    this.playRoleAnimation('run');
                    break;
                case pzTag.enemy:
                    audioTool.ins.playSound('shoushang');
                    director.emit(emits.PHNum, -2);
                    this.onDamage();
                    break;
                case pzTag.enemyBullet:
                    audioTool.ins.playSound('shoushang');
                    director.emit(emits.PHNum, -2);
                    this.onDamage();
                    break;
                case pzTag.jiguan:
                    audioTool.ins.playSound('shoushang');
                    director.emit(emits.PHNum, -2);
                    this.onDamage();
                    break;
                case pzTag.hp:
                    audioTool.ins.playSound('ph');
                    director.emit(emits.PHNum, 1);
                    break;
                case pzTag.jinbi:
                    audioTool.ins.playSound('jinbi');
                    director.emit(emits.leveJinbiNum);
                    break;
            }
        } else {
            switch (otherCollider.group) {
                case pzTag.road:
                    this.playRoleAnimation('run');
                    break;
                case pzTag.enemy:
                    director.emit(emits.PHNum, 0);
                    break;
                case pzTag.enemyBullet:
                    director.emit(emits.PHNum, 0);
                    this.onDamage();
                    break;
                case pzTag.jiguan:
                    director.emit(emits.PHNum, 0);
                    break;
                case pzTag.hp:
                    audioTool.ins.playSound('ph');
                    director.emit(emits.PHNum, 1);
                    break;
                case pzTag.jinbi:
                    audioTool.ins.playSound('jinbi');
                    director.emit(emits.leveJinbiNum);
                    break;
            }
        }
    }

    isJumpTouch(val: boolean) {
        if (val && gameConfig.liqiNum <= 0) {
            val = false;
        }

        this.isJump = val;
        const smokNode = this.node.getChildByName('smok');
        if (this.isJump) {
            this.showStaticRoleFrame();
            if (smokNode) {
                smokNode.active = true;
            }
        } else {
            this.showStaticRoleFrame();
            if (smokNode) {
                smokNode.active = false;
            }
        }
    }

    fly() {
        this.palyerRig.linearVelocity = v2(0, this.UpSpeed);
    }

    isJStkTouch(val: boolean) {
        this.isJStk = val;
        if (this.isJStk) {
            audioTool.ins.playSound('sheji');
            const bullPos = new Vec3(this.node.position.x + this.pospianyiX, this.node.position.y + this.pospianyiY, 0);
            nodePool.ins.getPoolNode(this.bulletType, this.node.getParent(), bullPos);
            this.schedule(this.faShe, 0.5);
        }
    }

    faShe() {
        if (this.isJStk) {
            audioTool.ins.playSound('sheji');
            const bullPos = new Vec3(this.node.position.x + this.pospianyiX, this.node.position.y + this.pospianyiY, this.node.position.z);
            nodePool.ins.getPoolNode(this.bulletType, this.node.getParent(), bullPos);
        } else {
            this.unschedule(this.faShe);
        }
    }

    onDamage() {
        const renderTarget = this.getRenderTarget();
        if (!renderTarget) {
            return;
        }

        tween(renderTarget)
            .to(0.2, { color: new Color(255, 0, 0, 255) })
            .to(0.3, { color: new Color(255, 255, 255, 255) })
            .delay(0.1)
            .union()
            .repeat(1)
            .start();
    }

    private playRoleAnimation(animName: string) {
        const currentVersion = ++this.animationVersion;
        const isRunAnimation = animName === 'run';

        if (!this.framePlayer) {
            if (this.ske) {
                this.ske.enabled = true;
                this.ske.setAnimation(1, animName, isRunAnimation);
            }
            return;
        }

        this.framePlayer.loop = isRunAnimation;
        const playTask = isRunAnimation
            ? this.framePlayer.play(animName)
            : this.framePlayer.showFirstFrame(animName);

        void playTask.then((played) => {
            if (currentVersion !== this.animationVersion) {
                return;
            }

            if (!played && this.ske) {
                this.ske.enabled = true;
                this.ske.setAnimation(1, animName, isRunAnimation);
            }
        });
    }

    private showStaticRoleFrame() {
        const currentVersion = ++this.animationVersion;

        if (!this.framePlayer) {
            if (this.ske) {
                this.ske.enabled = true;
                this.ske.setAnimation(1, 'jump', false);
            }
            return;
        }

        void this.framePlayer.showFirstFrame().then((played) => {
            if (currentVersion !== this.animationVersion) {
                return;
            }

            if (!played && this.ske) {
                this.ske.enabled = true;
                this.ske.setAnimation(1, 'jump', false);
            }
        });
    }

    private getRenderTarget(): UIRenderer | null {
        return this.framePlayer?.getDisplayComponent() ?? this.ske;
    }
}
