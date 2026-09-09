const { ccclass, property } = cc._decorator;

import TipsManager from '../Load/TipsManager';
import mGameData from '../Load/GameData';
import GameState, { getProgress, saveProgress } from '../game/GameState';
import StateBridge from '../game/StateBridge';
import cfg from '../game/config';
import warriorRunConfig from '../game/WarriorRunConfig';
import UserDataSyncManager from './UserDataSyncManager';
import WarriorRunAssetLoader from '../game/WarriorRunAssetLoader';

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
    private _enteringLevel: boolean = false;

    private readonly _colCount: number = 2;
    private readonly _gapX: number = 30;
    private readonly _gapY: number = 20;
    private readonly _paddingTop: number = 20;
    private readonly _paddingBottom: number = 20;

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
        this.closeBtn.on(cc.Node.EventType.TOUCH_END, this.close, this);
    }

    private _loadAssets(done: () => void) {
        if (this._assetsReady) {
            done();
            return;
        }

        const paths = [
            '2main/guanqiapeitu1',
            '2main/guanqiapeitu2',
            '2main/guanqiapeitu3',
            '2main/guanqiapeitu4',
            '2main/guanqiapeitu5',
            '2main/xingxing1',
            '2main/xingxing2',
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

        const rows = Math.ceil(total / this._colCount);
        const totalW = this._colCount * itemW + (this._colCount - 1) * this._gapX;
        const contentW = Math.max(this.content.width, totalW);
        this.content.width = contentW;
        this.content.height = this._paddingTop + rows * itemH + Math.max(0, rows - 1) * this._gapY + this._paddingBottom;

        for (let level = 1; level <= total; level++) {
            const item = cc.instantiate(this.levelItemPrefab);
            item.name = 'LevelItem_' + level;
            const index = level - 1;
            const row = Math.floor(index / this._colCount);
            const col = index % this._colCount;
            item.x = -totalW / 2 + itemW / 2 + col * (itemW + this._gapX);
            item.y = -this._paddingTop - itemH / 2 - row * (itemH + this._gapY);
            item.targetOff(this);
            item.on(cc.Node.EventType.TOUCH_END, () => this._onClickLevel(level), this);
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
            const stars = locked ? 0 : this._getLevelStars(level);
            this._setLevelBg(item, level);
            this._setLevelNumber(item, level);
            this._setLock(item, locked);
            this._setStars(item, stars, locked);
        });
    }

    private _setLevelBg(item: cc.Node, level: number) {
        const levelBg = item.getChildByName('dikuangguanqia') || item.getChildByName('LevelBg');
        const sprite = levelBg && levelBg.getComponent(cc.Sprite);
        const groupIndex = Math.max(1, Math.min(5, Math.ceil(level / 20)));
        const key = 'guanqiapeitu' + groupIndex;
        if (sprite && this._sprites[key]) {
            sprite.spriteFrame = this._sprites[key];
            sprite.sizeMode = cc.Sprite.SizeMode.CUSTOM;
        }
    }

    private _setLevelNumber(item: cc.Node, level: number) {
        const numberNode = item.getChildByName('LevelNumber');
        const label = numberNode && numberNode.getComponent(cc.Label);
        if (label) label.string = '第' + String(level) + '关';
    }

    private _setLock(item: cc.Node, locked: boolean) {
        const lockNode = item.getChildByName('suoBg');
        if (lockNode) lockNode.active = locked;
    }

    private _setStars(item: cc.Node, stars: number, locked: boolean) {
        const starsNode = item.getChildByName('Stars');
        if (!starsNode) return;
        starsNode.active = !locked;
        if (locked) return;

        const fullStar = this._sprites['xingxing1'];
        const grayStar = this._sprites['xingxing2'];
        starsNode.children.forEach((starNode: cc.Node, index: number) => {
            starNode.active = true;
            const sprite = starNode.getComponent(cc.Sprite);
            if (!sprite) return;
            const frame = index < stars ? fullStar : grayStar;
            if (frame) {
                sprite.spriteFrame = frame;
                sprite.sizeMode = cc.Sprite.SizeMode.CUSTOM;
            }
        });
    }

    private _onClickLevel(level: number) {
        if (this._enteringLevel) return;
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

        this._enteringLevel = true;
        WarriorRunAssetLoader.preload(() => {
            if (!this.node || !this.node.isValid) return;
            StateBridge.syncForStartScene();
            const latestProgress = getProgress();
            if (latestProgress.stamina < cfg.levelCost) {
                this._enteringLevel = false;
                this._showTip('体力不足，无法开始游戏。');
                return;
            }

            mGameData.isInfiniteMode = false;
            mGameData.currentLevel = level;
            mGameData.SaveLevelData();

            GameState.selectedLevel = level;
            latestProgress.stamina -= cfg.levelCost;
            latestProgress.last_stamina_time = Math.floor(Date.now() / 1000);
            saveProgress();
            UserDataSyncManager.recordConsumedStamina(cfg.levelCost);
            StateBridge.syncNewToOld();
            cc.audioEngine.stopMusic();
            cc.director.loadScene('WarriorRun');
        });
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
        return warriorRunConfig.levels.length;
    }

    private _getLevelStars(level: number): number {
        const progress = getProgress();
        const starsMap = progress.level_stars || {};
        const stars = Math.max(0, Math.floor(Number(starsMap[String(level)] || 0)));
        return Math.min(3, stars);
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
