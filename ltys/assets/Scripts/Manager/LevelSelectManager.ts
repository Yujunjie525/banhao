const { ccclass, property } = cc._decorator;

import TipsManager from '../Load/TipsManager';
import mGameData from '../Load/GameData';
import GameState, { getProgress, saveProgress } from '../game/GameState';
import StateBridge from '../game/StateBridge';
import cfg from '../game/config';
import { getThunderWarriorTotalLevels } from '../game/ThunderWarriorLevelConfig';

@ccclass
export default class LevelSelectManager extends cc.Component {
    @property(cc.ScrollView)
    levelScrollView: cc.ScrollView = null;

    @property(cc.Node)
    content: cc.Node = null;

    @property(cc.Prefab)
    levelItemPrefab: cc.Prefab = null;

    @property(cc.Node)
    closeBtn: cc.Node = null;

    @property(cc.Label)
    tipsLabel: cc.Label = null;

    private _levelItems: cc.Node[] = [];
    private _sprites: Record<string, cc.SpriteFrame> = {};
    private _assetsReady: boolean = false;
    private _built: boolean = false;

    private readonly _colCount: number = 3;
    private readonly _minGapX: number = 10;
    private readonly _gapY: number = 22;
    private readonly _paddingTop: number = 7;
    private readonly _paddingBottom: number = 20;
    private readonly _levelBackgroundCount: number = 5;
    private readonly _levelsPerBackground: number = 20;

    onLoad() {
        this._resolveNodes();
        this._bindCloseButton();
    }

    onEnable() {
        this._showActivePanel();
    }

    show() {
        StateBridge.prepareLevelSelection();
        mGameData.shouldOpenLevelSelect = false;
        if (!this.node.active) {
            this.node.active = true;
            return;
        }
        this._showActivePanel();
    }

    private _showActivePanel() {
        this._resolveNodes();
        this._bindCloseButton();
        if (this.tipsLabel) this.tipsLabel.node.active = false;
        this._loadAssets(() => {
            this._buildList();
            this._refreshList();
            this._scrollToUnlockedLevel();
        });
    }

    close() {
        this.node.active = false;
    }

    initLevelList() {
        this._refreshList();
    }

    private _resolveNodes() {
        if (!this.closeBtn) this.closeBtn = this.node.getChildByName('BtnClose');

        if (!this.levelScrollView) {
            const scrollNode = this.node.getChildByName('LevelScrollView');
            this.levelScrollView = scrollNode && scrollNode.getComponent(cc.ScrollView);
        }

        if (!this.content && this.levelScrollView) {
            this.content = this.levelScrollView.content;
        }

        if (!this.tipsLabel) {
            const tipsNode = this.node.getChildByName('Tips');
            this.tipsLabel = tipsNode && tipsNode.getComponent(cc.Label);
        }
    }

    private _bindCloseButton() {
        if (!this.closeBtn) return;
        this.closeBtn.off(cc.Node.EventType.TOUCH_END, this.close, this);
        this.closeBtn.on(cc.Node.EventType.TOUCH_END, () => {
            this._playClick();
            this.close();
        }, this);
    }

    private _loadAssets(done: () => void) {
        if (this._assetsReady) {
            done();
            return;
        }

        const paths = [
            '2Main1/guanqiabeijing1',
            '2Main1/guanqiabeijing2',
            '2Main1/guanqiabeijing3',
            '2Main1/guanqiabeijing4',
            '2Main1/guanqiabeijing5',
            '2Main1/xingxing1',
            '2Main1/xingxing2',
        ];
        let left = paths.length;
        paths.forEach((path: string) => {
            cc.loader.loadRes(path, cc.SpriteFrame, (err: Error, spriteFrame: cc.SpriteFrame) => {
                const key = path.substring(path.lastIndexOf('/') + 1);
                if (err) {
                    cc.warn('[LevelSelect] load sprite failed:', path, err);
                } else {
                    this._sprites[key] = spriteFrame;
                }
                left--;
                if (left <= 0) {
                    this._assetsReady = true;
                    done();
                }
            });
        });
    }

    private _buildList() {
        if (this._built) return;
        if (!this.content || !this.levelItemPrefab) {
            cc.error('[LevelSelect] LevelScrollView content or LevelItemPrefab is missing');
            return;
        }

        this.content.removeAllChildren();
        this._levelItems = [];

        const total = this._getTotalLevels();
        const sample = cc.instantiate(this.levelItemPrefab);
        const itemW = sample.width || 220;
        const itemH = sample.height || 262;
        sample.destroy();

        const view = this.levelScrollView && this.levelScrollView.node.getChildByName('view');
        const viewW = Math.max(1, (view && view.width) || (this.levelScrollView && this.levelScrollView.node.width) || this.content.width);
        const viewH = Math.max(1, (view && view.height) || (this.levelScrollView && this.levelScrollView.node.height) || this.content.height);
        const maxColumns = Math.max(1, Math.floor((viewW + this._minGapX) / (itemW + this._minGapX)));
        const columns = Math.max(1, Math.min(total, this._colCount, maxColumns));
        const gapX = columns > 1 ? Math.max(0, (viewW - columns * itemW) / (columns - 1)) : 0;
        const gridWidth = columns * itemW + Math.max(0, columns - 1) * gapX;
        const rows = Math.ceil(total / columns);
        const contentW = Math.max(viewW, itemW);
        this.content.width = contentW;
        const requiredHeight = this._paddingTop + rows * itemH + Math.max(0, rows - 1) * this._gapY + this._paddingBottom;
        this.content.height = Math.max(viewH, requiredHeight);

        for (let level = 1; level <= total; level++) {
            const item = cc.instantiate(this.levelItemPrefab);
            item.name = 'LevelItem_' + level;
            const index = level - 1;
            const row = Math.floor(index / columns);
            const col = index % columns;
            item.x = -gridWidth / 2 + itemW / 2 + col * (itemW + gapX);
            item.y = -this._paddingTop - itemH / 2 - row * (itemH + this._gapY);
            item.targetOff(this);
            item.on(cc.Node.EventType.TOUCH_END, () => {
                this._playClick();
                this._onClickLevel(level);
            }, this);
            this.content.addChild(item);
            this._levelItems.push(item);
        }

        this._built = true;
    }

    private _refreshList() {
        if (!this._built) return;
        StateBridge.syncForStartScene();
        mGameData.GetLevelData();

        const progress = getProgress();
        const unlockedLevel = Math.max(1, Math.floor(Number(progress.unlocked_level || mGameData.unlockedLevel) || 1));
        this._levelItems.forEach((item: cc.Node, index: number) => {
            const level = index + 1;
            const locked = level > unlockedLevel;
            this._setLevelBg(item, level);
            this._setLevelNumber(item, level);
            this._setLock(item, locked);
            const progressStars = Math.max(0, Math.floor(Number(progress.level_stars && progress.level_stars[String(level)]) || 0));
            const legacyStars = Math.max(0, Math.floor(Number((mGameData.levelStars || [])[level - 1]) || 0));
            this._setStars(item, Math.max(progressStars, legacyStars), locked);
        });
    }

    private _setLevelBg(item: cc.Node, level: number) {
        const levelBg = item.getChildByName('LevelBg');
        const sprite = levelBg && levelBg.getComponent(cc.Sprite);
        const backgroundIndex = Math.max(
            1,
            Math.min(this._levelBackgroundCount, Math.ceil(Math.max(1, Math.floor(level)) / this._levelsPerBackground))
        );
        const key = 'guanqiabeijing' + backgroundIndex;
        if (sprite && this._sprites[key]) {
            sprite.spriteFrame = this._sprites[key];
            sprite.sizeMode = cc.Sprite.SizeMode.CUSTOM;
        }
    }

    private _setLevelNumber(item: cc.Node, level: number) {
        const numberNode = item.getChildByName('LevelNumber');
        const label = numberNode && numberNode.getComponent(cc.Label);
        if (label) {
            numberNode.active = true;
            label.string = this._formatLevelName(level);
            label.horizontalAlign = cc.Label.HorizontalAlign.CENTER;
            label.verticalAlign = cc.Label.VerticalAlign.CENTER;
        }
    }

    private _setLock(item: cc.Node, locked: boolean) {
        const lockNode = item.getChildByName('suoBg');
        if (!lockNode) return;
        lockNode.active = locked;
        const icon = lockNode.getChildByName('suo');
        if (icon) icon.active = locked;
    }

    private _setStars(item: cc.Node, stars: number, locked: boolean) {
        const starsNode = item.getChildByName('Stars');
        if (!starsNode) return;
        stars = Math.max(0, Math.min(3, Math.floor(Number(stars) || 0)));
        starsNode.active = !locked && stars > 0;
        for (let i = 0; i < starsNode.childrenCount; i++) {
            const starNode = starsNode.children[i];
            const sprite = starNode.getComponent(cc.Sprite);
            starNode.active = i < 3;
            if (sprite) {
                sprite.spriteFrame = this._sprites[i < stars ? 'xingxing1' : 'xingxing2'] || null;
            }
        }
    }

    private _formatLevelName(level: number): string {
        return '第' + String(Math.max(1, Math.floor(Number(level) || 1))) + '关';
    }

    private _onClickLevel(level: number) {
        StateBridge.syncForStartScene();
        mGameData.GetLevelData();
        const progress = getProgress();
        const unlockedLevel = Math.max(1, Math.floor(Number(progress.unlocked_level || mGameData.unlockedLevel) || 1));

        if (level > unlockedLevel || level > this._getTotalLevels()) {
            this._showTip('关卡未解锁。');
            return;
        }

        if (progress.stamina < cfg.levelCost) {
            this._showTip('体力不足，无法开始游戏。');
            return;
        }

        mGameData.isInfiniteMode = false;
        mGameData.currentLevel = level;
        mGameData.SaveLevelData();

        GameState.selectedLevel = level;
        progress.stamina -= cfg.levelCost;
        progress.last_stamina_time = Math.floor(Date.now() / 1000);
        saveProgress();
        StateBridge.syncNewToOld();
        cc.director.loadScene('ThunderWarrior');
    }

    private _playClick() {
        const loadNode = cc.find('Canvas/LoadManager');
        const loadManager = loadNode && loadNode.getComponent('LoadManager') as any;
        if (loadManager && loadManager.playClick) loadManager.playClick();
    }

    private _scrollToUnlockedLevel() {
        if (!this.levelScrollView || !this.content || this._levelItems.length === 0) return;

        const progress = getProgress();
        const unlockedLevel = Math.max(1, Math.min(this._getTotalLevels(), Math.floor(Number(progress.unlocked_level || mGameData.unlockedLevel) || 1)));
        const targetItem = this._levelItems[unlockedLevel - 1];
        if (!targetItem) return;

        const viewHeight = this.levelScrollView.node.height;
        const maxOffsetY = Math.max(0, this.content.height - viewHeight);
        const targetY = Math.max(0, Math.min(maxOffsetY, -targetItem.y - viewHeight * 0.5));
        this.levelScrollView.scrollToOffset(cc.v2(0, targetY), 0.2);
    }

    private _getTotalLevels(): number {
        return getThunderWarriorTotalLevels();
    }

    private _showTip(text: string) {
        // if (this.tipsLabel) {
        //     this.tipsLabel.node.active = true;
        //     this.tipsLabel.string = text;
        //     this.unschedule(this._hideTip);
        //     this.scheduleOnce(this._hideTip, 1.5);
        // } else {
            TipsManager.show(text);
        // }
    }

    private _hideTip() {
        if (this.tipsLabel) this.tipsLabel.node.active = false;
    }
}
