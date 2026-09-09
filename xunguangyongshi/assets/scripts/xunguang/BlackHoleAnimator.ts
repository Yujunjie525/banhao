import { _decorator, Component, Node, Sprite, UITransform } from 'cc';
import { FrameAnimationPlayer } from '../../script/utils/frameAnimationPlayer';

const { ccclass, property } = _decorator;
const DISPLAY_NODE_NAME = '__black_hole_anim__';

export type BlackHoleAnimType = 'patrol' | 'pulse' | 'gravity';

@ccclass('BlackHoleAnimator')
export class BlackHoleAnimator extends Component {
    @property(Node)
    displayNode: Node | null = null;

    @property
    framesPerSecond = 12;

    @property
    rootFolder = 'UI/blackHole';

    private framePlayer: FrameAnimationPlayer | null = null;
    private currentType: BlackHoleAnimType = 'patrol';

    onLoad() {
        this.ensureFramePlayer();
    }

    public async playLoop(type: BlackHoleAnimType) {
        this.currentType = type;
        const framePlayer = this.ensureFramePlayer();
        if (!framePlayer) {
            return false;
        }

        framePlayer.loop = true;
        framePlayer.framesPerSecond = this.framesPerSecond;
        framePlayer.setResourcePath(this.getLoopPath(type));
        return framePlayer.play();
    }

    public getDisplayNode() {
        return this.displayNode ?? this.node;
    }

    public setDisplayScale(scale: number) {
        const target = this.displayNode ?? this.node;
        target.setScale(scale, scale, 1);
    }

    private ensureFramePlayer() {
        this.displayNode = this.displayNode ?? this.ensureDisplayNode();

        if (this.framePlayer && this.framePlayer.node && this.framePlayer.node.isValid) {
            return this.framePlayer;
        }

        const sprite = this.displayNode.getComponent(Sprite) ?? this.displayNode.addComponent(Sprite);
        sprite.sizeMode = Sprite.SizeMode.TRIMMED;

        const player = this.displayNode.getComponent(FrameAnimationPlayer) ?? this.displayNode.addComponent(FrameAnimationPlayer);
        player.targetSprite = sprite;
        player.playOnEnable = false;
        player.autoDisableSpine = true;
        player.createDisplayNodeIfMissing = false;
        player.rootFolder = this.rootFolder;
        player.framesPerSecond = this.framesPerSecond;
        this.framePlayer = player;
        return this.framePlayer;
    }

    private ensureDisplayNode() {
        let displayNode = this.node.getChildByName(DISPLAY_NODE_NAME);
        if (!displayNode) {
            displayNode = new Node(DISPLAY_NODE_NAME);
            displayNode.setParent(this.node);
            displayNode.setPosition(0, 0, 0);
            const transform = displayNode.addComponent(UITransform);
            transform.setContentSize(1, 1);
        }

        return displayNode;
    }

    private getLoopPath(type: BlackHoleAnimType) {
        return `${this.rootFolder}/${type}`;
    }
}
