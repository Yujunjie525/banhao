const { ccclass, property } = cc._decorator;

import mGameData from '../Load/GameData';
import TipsManager from '../Load/TipsManager';
import GameState from '../game2/GameState';
import StateBridge from '../game2/StateBridge';
import { Scene } from '../game2/Constants';
import BgmMgr from '../Managers/BgmMgr';

const LEVEL_COLUMNS = 3;
const LEVEL_HORIZONTAL_SPACING = 10;
const LEVEL_VERTICAL_SPACING = 10;
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
        mGameData.isInfiniteMode = false;
        if (mGameData.GetLevelData) mGameData.GetLevelData();
        StateBridge.prepareLevelSelection();
        if (this._ready) this._buildLevelList();
    }

    onDisable() {
        this._starting = false;
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

        cc.loader.loadRes('zzImg2/五角星1', cc.SpriteFrame, (err: Error, frame: cc.SpriteFrame) => {
            if (err) console.error('加载已获得星星图片失败:', err);
            else this._earnedStarFrame = frame;
            finish();
        });
        cc.loader.loadRes('zzImg2/五角星2', cc.SpriteFrame, (err: Error, frame: cc.SpriteFrame) => {
            if (err) console.error('加载未获得星星图片失败:', err);
            else this._emptyStarFrame = frame;
            finish();
        });
        for (let group = 1; group <= 5; group++) {
            cc.loader.loadRes(`zzImg2/ditupeitu${group}`, cc.SpriteFrame, (err: Error, frame: cc.SpriteFrame) => {
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

        const total = mGameData.getTotalLevels ? mGameData.getTotalLevels() : mGameData.levelConfigs.length;
        const unlocked = Math.max(1, mGameData.unlockedLevel || 1);
        const prefabNode = this.levelItemPrefab.data;
        const itemWidth = prefabNode.width || 240;
        const itemHeight = prefabNode.height || 180;
        const viewWidth = this._scrollView.node.width;
        const viewHeight = this._scrollView.node.height;
        const rows = Math.ceil(total / LEVEL_COLUMNS);
        const gridWidth = LEVEL_COLUMNS * itemWidth + (LEVEL_COLUMNS - 1) * LEVEL_HORIZONTAL_SPACING;
        const contentHeight = Math.max(
            viewHeight,
            rows * itemHeight + Math.max(0, rows - 1) * LEVEL_VERTICAL_SPACING
        );

        this._content.anchorX = 0.5;
        this._content.anchorY = 1;
        this._content.setContentSize(Math.max(viewWidth, gridWidth), contentHeight);
        this._content.setPosition(0, viewHeight / 2);

        const startX = -gridWidth / 2 + itemWidth / 2;
        for (let level = 1; level <= total; level++) {
            const item = cc.instantiate(this.levelItemPrefab);
            const itemIndex = level - 1;
            const row = Math.floor(itemIndex / LEVEL_COLUMNS);
            const column = itemIndex % LEVEL_COLUMNS;
            item.name = `Level_${level}`;
            item.parent = this._content;
            item.active = true;
            item.setPosition(
                startX + column * (itemWidth + LEVEL_HORIZONTAL_SPACING),
                -itemHeight / 2 - row * (itemHeight + LEVEL_VERTICAL_SPACING)
            );
            this._setLevelItem(item, level, level > unlocked);
        }

        const selectedLevel = Math.max(1, Math.min(unlocked, total));
        const selectedRow = Math.floor((selectedLevel - 1) / LEVEL_COLUMNS);
        const offsetY = Math.max(
            0,
            selectedRow * (itemHeight + LEVEL_VERTICAL_SPACING) - viewHeight * 0.25
        );
        this._scrollView.scrollToOffset(cc.v2(0, offsetY), 0);
    }

    private _setLevelItem(item: cc.Node, level: number, locked: boolean) {
        const levelBg = item.getChildByName('LevelBg');
        const levelBgSprite = levelBg ? levelBg.getComponent(cc.Sprite) : null;
        const mapFrame = this._levelMapFrames[this._getLevelVisualGroup(level)];
        if (levelBgSprite && mapFrame) levelBgSprite.spriteFrame = mapFrame;

        const levelNumber = item.getChildByName('LevelNumber');
        const levelLabel = levelNumber ? levelNumber.getComponent(cc.Label) : null;
        if (levelLabel) levelLabel.string = `第${level}关`;

        const lockNode = item.getChildByName('suoBg');
        if (lockNode) lockNode.active = locked;

        const starsNode = item.getChildByName('Stars');
        if (starsNode) {
            starsNode.active = !locked;
            const stars = mGameData.getLevelStars ? mGameData.getLevelStars(level) : 0;
            const earnedStars = Math.max(0, Math.min(3, Math.floor(stars || 0)));
            for (let i = 0; i < 3; i++) {
                const starNode = starsNode.getChildByName(`Star${i + 1}`);
                const sprite = starNode ? starNode.getComponent(cc.Sprite) : null;
                if (!sprite) continue;
                const frame = i < earnedStars ? this._earnedStarFrame : this._emptyStarFrame;
                if (frame) sprite.spriteFrame = frame;
            }
        }

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
        if (!mGameData.isLevelUnlocked(level)) return;
        if (!StateBridge.consumeStamina()) {
            TipsManager.show('体力不足，无法开始游戏。');
            return;
        }

        this._starting = true;
        mGameData.isInfiniteMode = false;
        mGameData.currentLevel = level;
        if (mGameData.SaveLevelData) mGameData.SaveLevelData();

        GameState.selectedLevelIdx = level - 1;
        GameState.selectedLevelId = String(level);
        GameState.save();

        BgmMgr.pause();
        cc.director.loadScene(Scene.Youxi);
    }

    private _close() {
        this.node.active = false;
    }
}
