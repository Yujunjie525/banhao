const { ccclass, property } = cc._decorator;

import mGameData from '../Load/GameData';
import TipsManager from '../Load/TipsManager';
import GameState from '../game2/GameState';
import StateBridge from '../game2/StateBridge';
import { Scene } from '../game2/Constants';
import { ARCANE_ESCAPE_LEVELS } from '../game2/ArcaneWarriorLevelConfig';
import { ARCANE_TREASURE_LEVELS } from '../game2/ArcaneWarriorTreasureLevelConfig';

const LEVEL_COLUMNS = 4;
const LEVEL_VERTICAL_SPACING = 20;
const LEVEL_TOP_PADDING = 8;
const LEVEL_COLUMN_POSITIONS = [-295, -107, 92, 290];
const LEVEL_ITEM_PREFAB_UUID = 'a18d5bf2-b892-408c-ad19-f87a454f8da5';

@ccclass
export default class LevelSelectManager extends cc.Component {
    @property(cc.Prefab)
    levelItemPrefab: cc.Prefab = null;

    private _scrollView: cc.ScrollView = null;
    private _content: cc.Node = null;
    private _earnedStarFrame: cc.SpriteFrame = null;
    private _emptyStarFrame: cc.SpriteFrame = null;
    private _levelMapFrames: {[group: number]: cc.SpriteFrame} = {};
    private _starFramesLoaded = false;
    private _ready = false;
    private _starting = false;
    private _treasureMode = false;

    onLoad() {
        const scrollNode = this.node.getChildByName('LevelScrollView');
        this._scrollView = scrollNode ? scrollNode.getComponent(cc.ScrollView) : null;
        this._content = this._scrollView ? this._scrollView.content : null;

        const closeBtn = this.node.getChildByName('BtnClose');
        if (closeBtn) closeBtn.on(cc.Node.EventType.TOUCH_END, this._close, this);

        this._configureScrollView();
        this._loadLevelItemPrefab();
        this._loadVisualFrames();
    }

    onEnable() {
        this._treasureMode = !!mGameData.isInfiniteMode;
        if (this._treasureMode) {
            StateBridge.syncOldToNew();
        } else {
            if (mGameData.GetLevelData) mGameData.GetLevelData();
            StateBridge.prepareLevelSelection();
        }
        this._updateModeHeader();
        if (this._ready) this._buildLevelList();
    }

    initLevelList() {
        if (this._ready) this._buildLevelList();
    }

    private _loadLevelItemPrefab() {
        if (this.levelItemPrefab) {
            this._trySetReady();
            return;
        }

        const assetManager: any = (cc as any).assetManager;
        if (!assetManager || !assetManager.loadAny) {
            console.error('当前 Cocos 版本不支持通过 UUID 加载 LevelItemPrefab');
            return;
        }

        assetManager.loadAny({ uuid: LEVEL_ITEM_PREFAB_UUID }, (err: Error, prefab: cc.Prefab) => {
            if (err || !prefab) {
                console.error('加载 LevelItemPrefab 失败:', err);
                return;
            }
            this.levelItemPrefab = prefab;
            this._trySetReady();
        });
    }

    private _loadVisualFrames() {
        let completed = 0;
        const totalAssets = 7;
        const finish = () => {
            completed++;
            if (completed < totalAssets) return;
            this._starFramesLoaded = true;
            this._trySetReady();
        };

        cc.loader.loadRes('2main/wujiaoxing1', cc.SpriteFrame, (err: Error, frame: cc.SpriteFrame) => {
            if (err) console.error('加载已获得星星图片失败:', err);
            else this._earnedStarFrame = frame;
            finish();
        });
        cc.loader.loadRes('2main/wujiaoxing2', cc.SpriteFrame, (err: Error, frame: cc.SpriteFrame) => {
            if (err) console.error('加载未获得星星图片失败:', err);
            else this._emptyStarFrame = frame;
            finish();
        });
        for (let group = 1; group <= 5; group++) {
            cc.loader.loadRes(`2main/guanqiapeitu${group}`, cc.SpriteFrame, (err: Error, frame: cc.SpriteFrame) => {
                if (err) console.error(`加载第${group}组关卡图片失败:`, err);
                else this._levelMapFrames[group] = frame;
                finish();
            });
        }
    }

    private _trySetReady() {
        if (!this.levelItemPrefab || !this._starFramesLoaded) return;
        this._ready = true;
        if (this.node && this.node.isValid && this.node.activeInHierarchy) this._buildLevelList();
    }

    private _configureScrollView() {
        if (!this._scrollView) return;
        this._scrollView.horizontal = false;
        this._scrollView.vertical = true;
        this._scrollView.inertia = true;
        this._scrollView.elastic = true;
        this._scrollView.brake = 0.75;
        this._scrollView.cancelInnerEvents = true;
        if (this._scrollView.horizontalScrollBar) this._scrollView.horizontalScrollBar.node.active = false;
    }

    private _buildLevelList() {
        if (!this._scrollView || !this._content || !this.levelItemPrefab) {
            console.error('LevelSelectManager 缺少 LevelScrollView、content 或 LevelItemPrefab');
            return;
        }

        this._content.children.slice().forEach((child) => {
            child.active = false;
            child.destroy();
        });

        const total = this._treasureMode ? ARCANE_TREASURE_LEVELS.length : ARCANE_ESCAPE_LEVELS.length;
        const unlocked = this._treasureMode
            ? Math.max(1, GameState.maxUnlockedTreasureLevel || 1)
            : Math.max(1, mGameData.unlockedLevel || 1);
        const prefabNode = this.levelItemPrefab.data;
        const itemHeight = prefabNode.height || 180;
        const viewWidth = this._scrollView.node.width;
        const viewHeight = this._scrollView.node.height;
        const rows = Math.ceil(total / LEVEL_COLUMNS);
        const contentHeight = Math.max(
            viewHeight,
            rows * itemHeight + Math.max(0, rows - 1) * LEVEL_VERTICAL_SPACING
        );

        this._content.anchorX = 0.5;
        this._content.anchorY = 1;
        this._content.setContentSize(viewWidth, contentHeight);
        this._content.setPosition(0, viewHeight / 2);

        for (let level = 1; level <= total; level++) {
            const item = cc.instantiate(this.levelItemPrefab);
            const itemIndex = level - 1;
            const row = Math.floor(itemIndex / LEVEL_COLUMNS);
            const column = itemIndex % LEVEL_COLUMNS;
            item.name = `Level_${level}`;
            item.parent = this._content;
            item.active = true;
            item.setPosition(
                LEVEL_COLUMN_POSITIONS[column],
                -LEVEL_TOP_PADDING - itemHeight / 2 - row * (itemHeight + LEVEL_VERTICAL_SPACING)
            );
            this._setLevelItem(item, level, level > unlocked);
        }

        this._scrollView.scrollToTop(0);
    }

    private _setLevelItem(item: cc.Node, level: number, locked: boolean) {
        const levelBg = item.getChildByName('LevelBg');
        const levelBgSprite = levelBg ? levelBg.getComponent(cc.Sprite) : null;
        const mapFrame = this._levelMapFrames[this._getLevelVisualGroup(level)];
        if (levelBgSprite && mapFrame) {
            levelBgSprite.spriteFrame = mapFrame;
            levelBg.setContentSize(153, 141);
        }

        const levelNumber = item.getChildByName('LevelNumber');
        const levelLabel = levelNumber ? levelNumber.getComponent(cc.Label) : null;
        if (levelLabel) levelLabel.string = `第${level}关`;

        const lockNode = item.getChildByName('suoBg');
        if (lockNode) lockNode.active = locked;

        const starsNode = item.getChildByName('Stars');
        if (starsNode && !this._treasureMode) {
            starsNode.active = !locked;
            const layout = starsNode.getComponent(cc.Layout);
            if (layout) layout.enabled = false;
            starsNode.setPosition(0, -14);
            starsNode.setContentSize(141, 45);
            const stars = mGameData.getLevelStars ? mGameData.getLevelStars(level) : 0;
            const earnedStars = Math.max(0, Math.min(3, Math.floor(stars || 0)));
            for (let i = 0; i < 3; i++) {
                const starNode = starsNode.getChildByName(`Star${i + 1}`);
                const sprite = starNode ? starNode.getComponent(cc.Sprite) : null;
                if (!sprite) continue;
                starNode.setPosition((i - 1) * 47, 0);
                starNode.setContentSize(47, 45);
                const frame = i < earnedStars ? this._earnedStarFrame : this._emptyStarFrame;
                if (frame) sprite.spriteFrame = frame;
            }
        } else if (starsNode) {
            starsNode.active = false;
        }
        this._setTreasureStatus(item, level, locked);

        const button = item.getComponent(cc.Button) || item.addComponent(cc.Button);
        button.transition = cc.Button.Transition.SCALE;
        button.zoomScale = 0.96;
        button.interactable = !locked;
        if (!locked) item.on(cc.Node.EventType.TOUCH_END, () => this._startLevel(level), this);
    }

    private _getLevelVisualGroup(level: number): number {
        return Math.max(1, Math.min(5, Math.ceil(Math.max(1, level) / 20)));
    }

    private _startLevel(level: number) {
        if (this._starting) return;
        const unlocked = this._treasureMode
            ? Math.max(1, GameState.maxUnlockedTreasureLevel || 1)
            : Math.max(1, mGameData.unlockedLevel || 1);
        if (level > unlocked) return;
        if (!StateBridge.hasEnoughStamina()) {
            TipsManager.show('体力不足，无法开始游戏。');
            return;
        }

        this._starting = true;
        this._preloadAndStartLevel(level);
    }

    private _preloadAndStartLevel(level: number): void {
        cc.director.preloadScene(Scene.ArcaneWarrior, null, (err: Error) => {
            if (err) {
                this._starting = false;
                TipsManager.show('level load failed, please retry');
                return;
            }
            if (!StateBridge.consumeStamina()) {
                this._starting = false;
                TipsManager.show('not enough stamina');
                return;
            }
            mGameData.isInfiniteMode = this._treasureMode;
            if (this._treasureMode) {
                GameState.selectedTreasureLevelIdx = level - 1;
            } else {
                mGameData.currentLevel = level;
                if (mGameData.SaveLevelData) mGameData.SaveLevelData();
                GameState.selectedLevelIdx = level - 1;
                GameState.selectedLevelId = String(level);
            }
            GameState.save();
            cc.audioEngine.stopAll();
            cc.director.loadScene(Scene.ArcaneWarrior, (loadErr: Error) => {
                if (!loadErr) return;
                StateBridge.refundStamina();
                this._starting = false;
                TipsManager.show('level load failed, stamina refunded');
            });
        });
    }

    private _updateModeHeader() {
        const headerRoot = this.node.getChildByName('New Sprite');
        const headerNode = headerRoot ? headerRoot.getChildByName('New Label') : null;
        const header = headerNode ? headerNode.getComponent(cc.Label) : null;
        if (header) {
            header.string = '关卡选择';
            header.fontSize = 40;
            header.overflow = cc.Label.Overflow.SHRINK;
            header.node.setContentSize(250, 58);
            header.node.color = cc.color(2, 42, 83);
        }
    }

    private _setTreasureStatus(item: cc.Node, level: number, locked: boolean) {
        let statusNode = item.getChildByName('TreasureStatus');
        // The level cards no longer show the analysis/monster summary text.
        if (statusNode) statusNode.active = false;
    }

    private _close() {
        if (this._starting) return;
        this.node.active = false;
    }
}
