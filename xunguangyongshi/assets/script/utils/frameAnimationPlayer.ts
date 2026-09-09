import { _decorator, Component, Node, resources, Sprite, SpriteFrame, sp, UIRenderer, UITransform } from 'cc';

const { ccclass, property } = _decorator;

type FrameNameInfo = {
    prefix: string;
    index: number;
};

@ccclass('FrameAnimationPlayer')
export class FrameAnimationPlayer extends Component {
    private static readonly frameCache = new Map<string, Promise<SpriteFrame[]>>();
    private static readonly displayNodeName = '__frame_anim_display__';

    @property(Sprite)
    targetSprite: Sprite | null = null;

    @property
    resourcePath = '';

    @property
    rootFolder = 'Player';

    @property
    framesPerSecond = 12;

    @property
    loop = true;

    @property
    playOnEnable = false;

    @property
    autoDisableSpine = true;

    @property
    createDisplayNodeIfMissing = true;

    @property
    displayScale = 1;

    @property
    displayOffsetX = 0;

    @property
    displayOffsetY = 0;

    private spine: sp.Skeleton | null = null;
    private currentFrames: SpriteFrame[] = [];
    private currentFrameIndex = 0;
    private currentClip = '';
    private elapsed = 0;
    private isPlaying = false;
    private usingFrameAnimation = false;
    private loadVersion = 0;

    onLoad() {
        this.targetSprite = this.targetSprite ?? this.ensureTargetSprite();
        if (!this.targetSprite) {
            return;
        }

        this.refreshDisplayTransform();
        this.targetSprite.enabled = false;
        this.targetSprite.sizeMode = Sprite.SizeMode.TRIMMED;
        this.spine = this.node.getComponent(sp.Skeleton);
    }

    async onEnable() {
        if (this.playOnEnable) {
            await this.play();
        }
    }

    onDisable() {
        this.stop();
    }

    public setResourcePath(path: string) {
        this.resourcePath = path;
    }

    public refreshDisplayTransform() {
        if (!this.targetSprite) {
            return;
        }

        this.targetSprite.node.setPosition(this.displayOffsetX, this.displayOffsetY, 0);
        this.targetSprite.node.setScale(this.displayScale, this.displayScale, 1);
    }

    public async play(clipName = ''): Promise<boolean> {
        const normalizedClip = clipName.trim();
        const nextVersion = ++this.loadVersion;

        if (this.usingFrameAnimation && normalizedClip === this.currentClip && this.currentFrames.length > 0) {
            this.isPlaying = true;
            return true;
        }

        const loadedFrames = await this.resolveClipFrames(normalizedClip);

        if (nextVersion !== this.loadVersion) {
            return false;
        }

        if (loadedFrames.length === 0) {
            this.useSpineFallback();
            return false;
        }

        this.currentClip = normalizedClip;
        this.currentFrames = loadedFrames;
        this.currentFrameIndex = 0;
        this.elapsed = 0;
        this.isPlaying = true;
        this.usingFrameAnimation = true;

        this.applyFrame(this.currentFrameIndex);
        this.showFrameAnimation();
        return true;
    }

    public async playOnce(clipName = ''): Promise<number> {
        const normalizedClip = clipName.trim();
        const nextVersion = ++this.loadVersion;
        const loadedFrames = await this.resolveClipFrames(normalizedClip);

        if (nextVersion !== this.loadVersion) {
            return 0;
        }

        if (loadedFrames.length === 0) {
            this.useSpineFallback();
            return 0;
        }

        this.currentClip = normalizedClip;
        this.currentFrames = loadedFrames;
        this.currentFrameIndex = 0;
        this.elapsed = 0;
        this.isPlaying = loadedFrames.length > 1;
        this.usingFrameAnimation = true;
        this.loop = false;

        this.applyFrame(this.currentFrameIndex);
        this.showFrameAnimation();
        return this.getCurrentClipDuration();
    }

    public async showFirstFrame(clipName = ''): Promise<boolean> {
        const normalizedClip = clipName.trim();
        const nextVersion = ++this.loadVersion;
        const loadedFrames = await this.resolveClipFrames(normalizedClip);

        if (nextVersion !== this.loadVersion) {
            return false;
        }

        if (loadedFrames.length === 0) {
            this.useSpineFallback();
            return false;
        }

        this.currentClip = normalizedClip;
        this.currentFrames = [loadedFrames[0]];
        this.currentFrameIndex = 0;
        this.elapsed = 0;
        this.isPlaying = false;
        this.usingFrameAnimation = true;

        this.applyFrame(this.currentFrameIndex);
        this.showFrameAnimation();
        return true;
    }

    public stop() {
        this.isPlaying = false;
        this.elapsed = 0;
    }

    public getDisplayComponent(): UIRenderer | null {
        if (this.usingFrameAnimation) {
            return this.targetSprite;
        }
        return this.spine ?? this.targetSprite;
    }

    public getCurrentClipDuration() {
        if (this.framesPerSecond <= 0 || this.currentFrames.length === 0) {
            return 0;
        }

        return this.currentFrames.length / this.framesPerSecond;
    }

    update(dt: number) {
        if (!this.isPlaying || this.currentFrames.length <= 1 || this.framesPerSecond <= 0) {
            return;
        }

        this.elapsed += dt;
        const frameDuration = 1 / this.framesPerSecond;

        while (this.elapsed >= frameDuration) {
            this.elapsed -= frameDuration;
            this.stepFrame();

            if (!this.isPlaying) {
                break;
            }
        }
    }

    private stepFrame() {
        if (this.currentFrames.length === 0) {
            return;
        }

        const lastFrameIndex = this.currentFrames.length - 1;
        if (this.currentFrameIndex >= lastFrameIndex) {
            if (!this.loop) {
                this.isPlaying = false;
                return;
            }

            this.currentFrameIndex = 0;
        } else {
            this.currentFrameIndex += 1;
        }

        this.applyFrame(this.currentFrameIndex);
    }

    private applyFrame(frameIndex: number) {
        if (!this.targetSprite || this.currentFrames.length === 0) {
            return;
        }

        const frame = this.currentFrames[frameIndex];
        if (!frame) {
            return;
        }

        this.targetSprite.spriteFrame = frame;
        this.targetSprite.enabled = true;
    }

    private ensureTargetSprite(): Sprite | null {
        const selfSprite = this.node.getComponent(Sprite);
        if (selfSprite) {
            return selfSprite;
        }

        if (!this.createDisplayNodeIfMissing) {
            return null;
        }

        let displayNode = this.node.getChildByName(FrameAnimationPlayer.displayNodeName);
        if (!displayNode) {
            displayNode = new Node(FrameAnimationPlayer.displayNodeName);
            displayNode.setParent(this.node);
            displayNode.setPosition(0, 0, 0);
            const transform = displayNode.addComponent(UITransform);
            transform.setContentSize(1, 1);
        }

        return displayNode.getComponent(Sprite) ?? displayNode.addComponent(Sprite);
    }

    private showFrameAnimation() {
        if (this.targetSprite) {
            this.targetSprite.enabled = true;
        }

        if (this.autoDisableSpine && this.spine) {
            this.spine.enabled = false;
        }
    }

    private useSpineFallback() {
        this.currentFrames = [];
        this.currentFrameIndex = 0;
        this.currentClip = '';
        this.elapsed = 0;
        this.isPlaying = false;
        this.usingFrameAnimation = false;

        if (this.autoDisableSpine && this.spine) {
            this.spine.enabled = true;
        }

        if (this.targetSprite) {
            this.targetSprite.enabled = false;
            this.targetSprite.spriteFrame = null;
        }
    }

    private getCandidatePaths(clipName: string): string[] {
        const basePath = this.resourcePath.trim() || `${this.rootFolder}/${this.node.name}`;
        if (!clipName) {
            return [basePath];
        }

        return [`${basePath}/${clipName}`, basePath];
    }

    private async resolveClipFrames(clipName: string) {
        const candidatePaths = this.getCandidatePaths(clipName);
        let loadedFrames: SpriteFrame[] = [];

        for (const path of candidatePaths) {
            loadedFrames = await FrameAnimationPlayer.loadFrames(path);
            if (loadedFrames.length > 0) {
                break;
            }
        }

        return loadedFrames;
    }

    private static loadFrames(path: string): Promise<SpriteFrame[]> {
        const cachedPromise = this.frameCache.get(path);
        if (cachedPromise) {
            return cachedPromise;
        }

        const loadPromise = new Promise<SpriteFrame[]>((resolve) => {
            resources.loadDir(path, SpriteFrame, (err, assets) => {
                if (err || !assets || assets.length === 0) {
                    resolve([]);
                    return;
                }

                resolve(this.pickPlayableFrames(assets));
            });
        });

        this.frameCache.set(path, loadPromise);
        return loadPromise;
    }

    private static pickPlayableFrames(frames: SpriteFrame[]): SpriteFrame[] {
        const sortedFrames = this.sortFrames(frames.filter(Boolean));
        if (sortedFrames.length <= 1) {
            return sortedFrames;
        }

        const groupedFrames = new Map<string, SpriteFrame[]>();
        for (const frame of sortedFrames) {
            const info = this.parseFrameName(frame.name);
            if (!info.prefix) {
                continue;
            }

            const group = groupedFrames.get(info.prefix) ?? [];
            group.push(frame);
            groupedFrames.set(info.prefix, group);
        }

        let bestGroup: SpriteFrame[] = [];
        groupedFrames.forEach((group) => {
            if (group.length > bestGroup.length) {
                bestGroup = group;
            }
        });

        if (bestGroup.length >= 2) {
            return this.sortFrames(bestGroup);
        }

        return sortedFrames;
    }

    private static sortFrames(frames: SpriteFrame[]): SpriteFrame[] {
        return [...frames].sort((left, right) => {
            const leftInfo = this.parseFrameName(left.name);
            const rightInfo = this.parseFrameName(right.name);

            if (leftInfo.prefix !== rightInfo.prefix) {
                return leftInfo.prefix.localeCompare(rightInfo.prefix, 'zh-Hans-CN');
            }

            if (leftInfo.index !== rightInfo.index) {
                return leftInfo.index - rightInfo.index;
            }

            return left.name.localeCompare(right.name, 'zh-Hans-CN');
        });
    }

    private static parseFrameName(name: string): FrameNameInfo {
        const match = name.match(/^(.*?)(\d+)$/);
        if (!match) {
            return {
                prefix: '',
                index: Number.MAX_SAFE_INTEGER,
            };
        }

        return {
            prefix: match[1],
            index: Number(match[2]),
        };
    }
}
