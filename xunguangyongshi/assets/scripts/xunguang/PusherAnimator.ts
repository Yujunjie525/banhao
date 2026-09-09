import { _decorator, Component, Node, Sprite, UIOpacity } from 'cc';
import { gameConfig } from '../../script/data/gameConfig';
import { FrameAnimationPlayer } from '../../script/utils/frameAnimationPlayer';

const { ccclass, property } = _decorator;

type PusherDirection = 'left' | 'right' | 'top' | 'bottom';
type PusherClip = 'show' | 'hide' | 'walk';

@ccclass('PusherAnimator')
export class PusherAnimator extends Component {
    @property(Node)
    roleNode: Node | null = null;

    @property
    framesPerSecond = 12;

    @property
    showHideSpeedMultiplier = 2;

    @property
    hideAfterHide = true;

    private framePlayer: FrameAnimationPlayer | null = null;
    private opacity: UIOpacity | null = null;
    private currentDirection: PusherDirection = 'bottom';
    private animVersion = 0;
    private isWalking = false;

    onLoad() {
        this.roleNode = this.roleNode ?? this.node.getChildByName('role') ?? this.node;
        this.framePlayer = this.ensureFramePlayer();
        this.opacity = this.node.getComponent(UIOpacity) ?? this.node.addComponent(UIOpacity);
        this.applyVisibleState(false);
    }

    public setDirectionByDelta(col: number, row: number) {
        if (Math.abs(col) >= Math.abs(row)) {
            this.currentDirection = col >= 0 ? 'right' : 'left';
            return;
        }

        this.currentDirection = row >= 0 ? 'top' : 'bottom';
    }

    public async playShow() {
        this.isWalking = false;
        const token = await this.startSingleClip('show');
        await this.waitClipFinished(token);
    }

    public async playHide() {
        this.isWalking = false;
        const token = await this.startSingleClip('hide');
        await this.waitClipFinished(token);
        if (this.hideAfterHide && token.version === this.animVersion && !this.isWalking) {
            this.applyVisibleState(false);
        }
    }

    public async playWalk() {
        const version = ++this.animVersion;
        const framePlayer = this.ensureFramePlayer();
        if (!framePlayer) {
            this.applyVisibleState(true);
            return;
        }

        this.isWalking = true;
        this.applyVisibleState(true);
        framePlayer.loop = true;
        framePlayer.framesPerSecond = this.framesPerSecond;
        const played = await this.playLoopWithFallback(framePlayer, 'walk');

        if (version !== this.animVersion || !this.isWalking) {
            return;
        }

        if (!played) {
            this.applyVisibleState(true);
        }
    }

    public stopImmediately() {
        this.animVersion += 1;
        this.isWalking = false;
        this.framePlayer?.stop();
        this.applyVisibleState(false);
    }

    public async stopWalkKeepVisible() {
        this.animVersion += 1;
        this.isWalking = false;
        const framePlayer = this.ensureFramePlayer();
        framePlayer?.stop();
        this.applyVisibleState(true);
        if (!framePlayer) {
            return;
        }

        framePlayer.framesPerSecond = this.framesPerSecond;
        framePlayer.setResourcePath(this.getResourcePath('walk'));
        await framePlayer.showFirstFrame();
    }

    public isVisible() {
        return !!this.roleNode?.active;
    }

    private async startSingleClip(clip: Exclude<PusherClip, 'walk'>) {
        const version = ++this.animVersion;
        const framePlayer = this.ensureFramePlayer();
        if (!framePlayer) {
            this.applyVisibleState(clip !== 'hide');
            return { version, duration: 0 };
        }

        this.applyVisibleState(true);
        framePlayer.framesPerSecond = this.getClipFramesPerSecond(clip);
        const duration = await this.playOnceWithFallback(framePlayer, clip);
        return { version, duration };
    }

    private getClipFramesPerSecond(clip: PusherClip) {
        if (clip === 'show' || clip === 'hide') {
            return this.framesPerSecond * this.showHideSpeedMultiplier;
        }

        return this.framesPerSecond;
    }

    private async waitClipFinished(token: { version: number; duration: number }) {
        if (token.version !== this.animVersion || this.isWalking) {
            return;
        }

        if (token.duration <= 0) {
            return;
        }

        await new Promise<void>((resolve) => {
            this.scheduleOnce(() => resolve(), token.duration);
        });
    }

    private ensureFramePlayer() {
        if (!this.roleNode) {
            return null;
        }

        if (this.framePlayer && this.framePlayer.node && this.framePlayer.node.isValid) {
            return this.framePlayer;
        }

        const sprite = this.roleNode.getComponent(Sprite) ?? this.roleNode.addComponent(Sprite);
        sprite.sizeMode = Sprite.SizeMode.TRIMMED;

        const player = this.roleNode.getComponent(FrameAnimationPlayer) ?? this.roleNode.addComponent(FrameAnimationPlayer);
        player.targetSprite = sprite;
        player.playOnEnable = false;
        player.autoDisableSpine = true;
        player.createDisplayNodeIfMissing = false;
        player.rootFolder = 'UI/roleAnim';
        player.framesPerSecond = this.framesPerSecond;
        this.framePlayer = player;
        return this.framePlayer;
    }

    private getResourcePath(clip: PusherClip) {
        return `UI/roleAnim/${this.getSelectedPlayerFolder()}/${clip}/${this.currentDirection}`;
    }

    private async playLoopWithFallback(framePlayer: FrameAnimationPlayer, clip: PusherClip): Promise<boolean> {
        framePlayer.loop = true;
        framePlayer.setResourcePath(this.getResourcePath(clip));
        const played = await framePlayer.play();
        if (played || this.getSelectedPlayerFolder() === 'player1') {
            return played;
        }

        framePlayer.setResourcePath(`UI/roleAnim/player1/${clip}/${this.currentDirection}`);
        return framePlayer.play();
    }

    private async playOnceWithFallback(framePlayer: FrameAnimationPlayer, clip: PusherClip): Promise<number> {
        framePlayer.loop = false;
        framePlayer.setResourcePath(this.getResourcePath(clip));
        let duration = await framePlayer.playOnce();
        if (duration > 0 || this.getSelectedPlayerFolder() === 'player1') {
            return duration;
        }

        framePlayer.setResourcePath(`UI/roleAnim/player1/${clip}/${this.currentDirection}`);
        return framePlayer.playOnce();
    }

    private getSelectedPlayerFolder() {
        const selected = Number(gameConfig.slectType || 1);
        const normalized = Number.isFinite(selected) && selected > 0 ? selected : 1;
        return `player${normalized}`;
    }

    private applyVisibleState(visible: boolean) {
        if (this.roleNode) {
            this.roleNode.active = visible;
        }

        if (this.opacity) {
            this.opacity.opacity = visible ? 255 : 0;
        }
    }
}
