import {
    _decorator,
    Component,
    director,
    instantiate,
    JsonAsset,
    Label,
    Node,
    Prefab,
    resources,
    ScrollView,
    Sprite,
    SpriteFrame,
    tween,
    UITransform,
    Vec2,
    Vec3,
} from 'cc';

import { emits } from '../data/enmus';
import { loadPool } from '../res/loadPool';
import { mGameData } from '../untils/GameData';
import { gameConfig } from '../../script/data/gameConfig';
import { audioTool } from '../../script/utils/audioTool';

const { ccclass, property } = _decorator;

@ccclass('LevelSelectWnd')
export class LevelSelectWnd extends Component {
    @property(ScrollView)
    levelScrollView: ScrollView = null;

    @property(Prefab)
    levelItemPrefab: Prefab = null;

    @property(SpriteFrame)
    levelUnlocked: SpriteFrame = null;

    @property(SpriteFrame)
    levelUnlocked2: SpriteFrame = null;

    @property(SpriteFrame)
    levelUnlocked3: SpriteFrame = null;

    @property(SpriteFrame)
    levelUnlocked4: SpriteFrame = null;

    @property(SpriteFrame)
    levelUnlocked5: SpriteFrame = null;

    @property(SpriteFrame)
    levelUnlocked6: SpriteFrame = null;

    @property(SpriteFrame)
    fullStarSpriteFrame: SpriteFrame = null;  // wujiaoxing 满星

    @property(SpriteFrame)
    emptyStarSpriteFrame: SpriteFrame = null;  // wujiaoxing2 空星

    @property(Node)
    closeBtn: Node = null;

    private readonly itemsPerRow = 2;
    private readonly horizontalSpacing = 22;
    private readonly verticalSpacing = 20;
    private readonly leftPadding = 20;
    private readonly topPadding = 20;
    private readonly levelConfigPath = 'config/xunguang_levels';
    private readonly fallbackTotalLevels = 30;

    private popUI: Node = null;
    private totalLevels = this.fallbackTotalLevels;

    onLoad() {
        if (this.closeBtn) {
            this.closeBtn.on(Node.EventType.TOUCH_END, this.onBackClick, this);
        }
    }

    onEnable() {
        if (this.closeBtn) {
            this.closeBtn.off(Node.EventType.TOUCH_END, this.onBackClick, this);
            this.closeBtn.on(Node.EventType.TOUCH_END, this.onBackClick, this);
        }

        this.popUI = this.node.getChildByName('popUI');
        if (this.popUI) {
            this.popUI.setScale(0, 0, 1);
            tween(this.popUI).to(0.2, { scale: new Vec3(1, 1, 1) }).start();
        }

        void this.initLevelList();
    }

    onDisable() {
        if (this.closeBtn) {
            this.closeBtn.off(Node.EventType.TOUCH_END, this.onBackClick, this);
        }
    }

    private async initLevelList() {
        const container = this.levelScrollView?.content;
        if (!container || !this.levelItemPrefab) {
            console.error('LevelSelectWnd missing content or item prefab');
            return;
        }

        this.totalLevels = await this.loadTotalLevels();
        container.removeAllChildren();

        for (let level = 1; level <= this.totalLevels; level++) {
            const levelItem = instantiate(this.levelItemPrefab);
            container.addChild(levelItem);
            this.setupLevelItem(levelItem, level);
        }

        this.updateScrollViewContentSize();
    }

    private loadTotalLevels(): Promise<number> {
        return new Promise((resolve) => {
            resources.load(this.levelConfigPath, JsonAsset, (error, asset) => {
                if (error || !asset) {
                    console.error('Load xunguang level config failed:', error);
                    resolve(this.fallbackTotalLevels);
                    return;
                }

                const json = asset.json as any;
                const levels = Array.isArray(json) ? json : json?.levels;
                resolve(Math.max(levels?.length || 0, 1));
            });
        });
    }

    private updateScrollViewContentSize() {
        const content = this.levelScrollView?.content;
        if (!content || content.children.length === 0) {
            return;
        }

        const firstItemTransform = content.children[0].getComponent(UITransform);
        const viewTransform = this.levelScrollView.node.getChildByName('view')?.getComponent(UITransform);
        const contentTransform = content.getComponent(UITransform);
        if (!firstItemTransform || !viewTransform || !contentTransform) {
            return;
        }

        const itemWidth = firstItemTransform.width;
        const itemHeight = firstItemTransform.height;
        const totalRows = Math.ceil(content.children.length / this.itemsPerRow);
        const rowWidth = this.itemsPerRow * itemWidth
            + (this.itemsPerRow - 1) * this.horizontalSpacing
            + this.leftPadding * 2;
        const totalHeight = totalRows * itemHeight
            + (totalRows - 1) * this.verticalSpacing
            + this.topPadding * 2;

        contentTransform.width = Math.max(viewTransform.width, rowWidth);
        contentTransform.height = Math.max(viewTransform.height, totalHeight);
        contentTransform.anchorX = 0;
        contentTransform.anchorY = 1;
        content.setPosition(0, 0, 0);

        for (let i = 0; i < content.children.length; i++) {
            const child = content.children[i];
            const childTransform = child.getComponent(UITransform);
            if (!childTransform) {
                continue;
            }

            childTransform.anchorX = 0.5;
            childTransform.anchorY = 0.5;

            const row = Math.floor(i / this.itemsPerRow);
            const col = i % this.itemsPerRow;
            const x = this.leftPadding + col * (itemWidth + this.horizontalSpacing) + itemWidth / 2;
            const y = -(this.topPadding + row * (itemHeight + this.verticalSpacing) + itemHeight / 2);
            child.setPosition(x, y, 0);
        }

        this.scrollToCurrentLevel(0.1);
    }

    private scrollToCurrentLevel(duration = 0) {
        const scrollView = this.levelScrollView;
        const content = scrollView?.content;
        const viewTransform = scrollView?.node.getChildByName('view')?.getComponent(UITransform);
        const contentTransform = content?.getComponent(UITransform);

        if (!scrollView || !content || !viewTransform || !contentTransform || content.children.length === 0) {
            return;
        }

        const currentLevel = Math.min(
            Math.max(1, Number(gameConfig.nowLevel || 1)),
            content.children.length,
        );
        const targetItem = content.children[currentLevel - 1];
        const targetTransform = targetItem?.getComponent(UITransform);

        if (!targetItem || !targetTransform) {
            return;
        }

        const targetCenterYFromTop = -targetItem.position.y;
        const targetOffsetY = targetCenterYFromTop - viewTransform.height / 2;
        const maxOffsetY = Math.max(0, contentTransform.height - viewTransform.height);
        const offsetY = Math.min(Math.max(0, targetOffsetY), maxOffsetY);

        scrollView.stopAutoScroll();
        scrollView.scrollToOffset(new Vec2(0, offsetY), duration);
    }

    private setupLevelItem(levelItem: Node, level: number) {
        const levelNumberLabel = levelItem.getChildByName('LevelNumber')?.getComponent(Label);
        const levelBg = levelItem.getChildByName('LevelBg')?.getComponent(Sprite);
        const lockNode = levelItem.getChildByName('suoBg');
        const isUnlocked = this.isLevelUnlocked(level);

        if (levelNumberLabel) {
            levelNumberLabel.string = `第${level}关`;
        }

        if (levelBg) {
            levelBg.spriteFrame = this.getLevelBackground(level);
        }

        if (lockNode) {
            lockNode.active = !isUnlocked;
        }

        this.updateLevelStars(levelItem, level, isUnlocked);

        levelItem.off(Node.EventType.TOUCH_END);
        levelItem.on(
            Node.EventType.TOUCH_END,
            () => {
                if (isUnlocked) {
                    this.onLevelClick(level);
                    return;
                }

                this.showTips('当前关卡未解锁。');
            },
            this,
        );
    }

    private updateLevelStars(levelItem: Node, level: number, isUnlocked: boolean) {
        const star1 = levelItem.getChildByName('star1')?.getComponent(Sprite);
        const star2 = levelItem.getChildByName('star2')?.getComponent(Sprite);
        const star3 = levelItem.getChildByName('star3')?.getComponent(Sprite);

        if (!star1 || !star2 || !star3) {
            return;
        }

        const stars = [star1, star2, star3];
        
        if (!isUnlocked) {
            for (const star of stars) {
                star.node.active = false;
            }
            return;
        }

        for (const star of stars) {
            star.node.active = true;
        }

        const levelStar = gameConfig.getLevelStar(level);
        
        for (let i = 0; i < stars.length; i++) {
            const starSprite = stars[i];
            if (starSprite) {
                starSprite.spriteFrame = (i + 1) <= levelStar 
                    ? (this.fullStarSpriteFrame || starSprite.spriteFrame)
                    : (this.emptyStarSpriteFrame || starSprite.spriteFrame);
            }
        }
    }

    private getLevelBackground(level: number) {
        if (level >= 51) {
            return this.levelUnlocked6 || this.levelUnlocked5 || this.levelUnlocked;
        }
        if (level >= 41) {
            return this.levelUnlocked5 || this.levelUnlocked4 || this.levelUnlocked;
        }
        if (level >= 31) {
            return this.levelUnlocked4 || this.levelUnlocked3 || this.levelUnlocked;
        }
        if (level >= 21) {
            return this.levelUnlocked3 || this.levelUnlocked2 || this.levelUnlocked;
        }
        if (level >= 11) {
            return this.levelUnlocked2 || this.levelUnlocked;
        }
        return this.levelUnlocked;
    }

    private isLevelUnlocked(level: number) {
        return Number(gameConfig.nowLevel || 1) >= level;
        // return true;
    }

    private onLevelClick(level: number) {
        if (!mGameData.ConsumeStamina(1)) {
            this.showTips('体力不足，请稍后再试。');
            return;
        }

        gameConfig.selectedLevel = level;
        audioTool.ins.stopMusic();
        director.loadScene('game2');
    }

    private showTips(msg: string) {
        loadPool.ins.getPoolNode('tips', this.node);
        director.emit(emits.tipMsg, msg);
    }

    private onBackClick() {
        if (!this.popUI) {
            loadPool.ins.huiShouNode(this.node);
            return;
        }

        tween(this.popUI)
            .to(0.2, { scale: new Vec3(0, 0, 1) })
            .call(() => {
                loadPool.ins.huiShouNode(this.node);
            })
            .start();
    }
}
