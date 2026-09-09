/// <reference path="../../../creator.d.ts" />

const { ccclass, property } = cc._decorator;

import mGameData from '../Load/GameData';
import UserDataSyncManager from '../Manager/UserDataSyncManager';
import GameState from './GameState';
import StateBridge from './StateBridge';
import { Scene } from './Constants';
import {
    ARCANE_ESCAPE_LEVELS,
    ARCANE_GLOBAL_CONFIG,
    ArcaneCharacterConfig,
    ArcaneMonsterConfig,
    ArcaneMonsterPoint,
    ArcanePoint,
    getArcaneCharacter,
    getArcaneEscapeLevel,
    getArcaneMonster
} from './ArcaneWarriorLevelConfig';
import {
    ARCANE_TREASURE_LEVELS,
    getArcaneTreasureLevel
} from './ArcaneWarriorTreasureLevelConfig';

interface ArcaneBattleLevelConfig {
    level_no: number;
    name: string;
    map_width_grid: number;
    map_height_grid: number;
    cell_size_px: number;
    start_point: ArcanePoint;
    monster_points: ArcaneMonsterPoint[];
    blocked_points: ArcanePoint[];
    exit_point?: ArcanePoint;
    target_time_sec?: number;
    monster_spd_multiplier?: number;
    monster_spd_acceleration_per_sec?: number;
    analysis_limit_count?: number;
}

interface RuntimeSeal extends ArcaneMonsterPoint {
    awakened: boolean;
}

interface GridPoint {
    x: number;
    y: number;
}

interface RuntimeMonster {
    uid: number;
    cfg: ArcaneMonsterConfig;
    x: number;
    y: number;
    wakeRemaining: number;
    lifeRemaining: number;
    activeElapsed: number;
    repathRemaining: number;
    predictionRemaining: number;
    path: GridPoint[];
    pathIndex: number;
    movedSinceDash: number;
    dashChargeRemaining: number;
    dashDistanceRemaining: number;
    facing: FacingDirection;
    moving: boolean;
}

type FacingDirection = 'down' | 'left' | 'right' | 'up';

interface ArcaneEffect {
    x: number;
    y: number;
    life: number;
    maxLife: number;
    color: cc.Color;
    kind: 'ring' | 'burst' | 'fade';
}

interface TileView {
    node: cc.Node;
    border: cc.Sprite;
    base: cc.Sprite;
    overlay: cc.Sprite;
    rune: cc.Sprite;
    runeLabel: cc.Label;
    renderKey: string;
}

interface EntityView {
    node: cc.Node;
    sprite: cc.Sprite;
    countdown: cc.Label;
    frames: cc.SpriteFrame[];
    frameKey: string;
    frameIndex: number;
    frameElapsed: number;
}

interface PopupAction {
    actionId: 'return' | 'next' | 'revive' | 'retry' | 'continue' | 'exit';
    label: string;
    kind: 'primary' | 'secondary' | 'danger';
    callback: () => void;
}

type PopupKind = 'pause' | 'revive' | 'result' | 'win';

const LEVEL_CLEAR_REWARD = 100;

interface PopupView {
    root: cc.Node;
    title: cc.Label;
    body: cc.Label;
    primary: cc.Node;
    secondary: cc.Node;
    tertiary: cc.Node;
}

const COLORS = {
    void: cc.color(7, 12, 13, 255),
    voidAlt: cc.color(10, 17, 18, 255),
    stone: cc.color(34, 54, 52, 255),
    stoneAlt: cc.color(39, 63, 59, 255),
    grid: cc.color(58, 88, 82, 150),
    wall: cc.color(20, 25, 24, 255),
    wallEdge: cc.color(92, 73, 47, 210),
    jade: cc.color(89, 212, 179, 255),
    jadeDark: cc.color(25, 99, 86, 255),
    gold: cc.color(216, 178, 91, 255),
    vermilion: cc.color(199, 79, 65, 255),
    text: cc.color(229, 235, 225, 255),
    muted: cc.color(151, 171, 164, 255),
    panel: cc.color(19, 29, 29, 245)
};

@ccclass
export default class ArcaneWarriorController extends cc.Component {
    // 帧间隔，单位为秒；数值越小，角色和怪物的帧动画播放越快。
    private readonly _animationFrameDuration = 0.06;
    // 是否在角色停止移动时继续循环播放当前朝向的帧动画。
    private readonly _playAnimationWhenIdle = true;

    @property(cc.AudioClip)
    battleBgm: cc.AudioClip = null;

    private _worldLayer: cc.Node = null;
    private _entityLayer: cc.Node = null;
    private _hudLayer: cc.Node = null;
    private _controlLayer: cc.Node = null;
    private _popupLayer: cc.Node = null;
    private _starNode: cc.Node = null;
    private _starSprites: cc.Sprite[] = [];
    private _starFullFrames: cc.SpriteFrame[] = [];
    private _emptyStarFrame: cc.SpriteFrame = null;

    private _tileRoot: cc.Node = null;
    private _tileTemplate: cc.Node = null;
    private _tilePalette: cc.Node = null;
    private _tileViews: TileView[] = [];
    private _heroNode: cc.Node = null;
    private _heroSprite: cc.Sprite = null;
    private _heroMarker: cc.Graphics = null;
    private _analysisFrame: cc.Graphics = null;
    private _heroPalette: cc.Node = null;
    private _monsterRoot: cc.Node = null;
    private _monsterTemplate: cc.Node = null;
    private _monsterPalette: cc.Node = null;
    private _monsterViews: EntityView[] = [];
    private _effectRoot: cc.Node = null;
    private _effectTemplate: cc.Node = null;
    private _effectPalette: cc.Node = null;
    private _effectViews: cc.Sprite[] = [];
    private _levelPanel: cc.Node = null;
    private _statusPanel: cc.Node = null;
    private _statusLabel: cc.Label = null;
    private _exploreLabel: cc.Label = null;
    private _arrowLabel: cc.Label = null;
    private _arrowIcon: cc.Node = null;
    private _arrowGraphics: cc.Graphics = null;
    private _hintLabel: cc.Label = null;
    private _analysisLabel: cc.Label = null;
    private _analysisStateLabel: cc.Label = null;
    private _toastLabel: cc.Label = null;

    private _joystickNode: cc.Node = null;
    private _joystickKnob: cc.Node = null;
    private _analysisButton: cc.Node = null;
    private _pauseButton: cc.Node = null;
    private _joystickTouchId = -1;
    private _analysisTouchId = -1;
    private _popupPause: PopupView = null;
    private _popupRevive: PopupView = null;
    private _popupResult: PopupView = null;
    private _popupWinResult: PopupView = null;
    private _winDiamondBox: cc.Node = null;
    private _winDiamondLabel: cc.Label = null;
    private _popupResultBodyFontSize = 16;
    private _popupResultBodyLineHeight = 22;
    private _popupWinBodyFontSize = 16;
    private _popupWinBodyLineHeight = 22;
    private _popupResultTitle = '';
    private _popupWinResultTitle = '';

    private _guideLayer: cc.Node = null;
    private _guideMask: cc.Node = null;
    private _guideNode1: cc.Node = null;
    private _guideNode2: cc.Node = null;
    private _guideDirectionIcon: cc.Node = null;
    private _guideAnalysisIcon: cc.Node = null;
    private _guideDirectionHand: cc.Node = null;
    private _guideAnalysisHand: cc.Node = null;
    private _guideClassicText: cc.Label = null;
    private _guideNode1ReferencePosition = cc.v2(0, 0);
    private _guideNode2ReferencePosition = cc.v2(0, 0);

    private _level: ArcaneBattleLevelConfig = null;
    private _hero: ArcaneCharacterConfig = null;
    private _levelNo = 1;
    private _isTreasureMode = false;
    private _analysisRemaining = 0;
    private _treasureFailureReason = '';
    private _revealed: boolean[][] = [];
    private _blocked: { [key: string]: boolean } = {};
    private _brokenSeals: { [key: string]: boolean } = {};
    private _seals: RuntimeSeal[] = [];
    private _monsters: RuntimeMonster[] = [];
    private _effects: ArcaneEffect[] = [];
    private _playerX = 0;
    private _playerY = 0;
    private _lastMoveX = 1;
    private _lastMoveY = 0;
    private _playerMoving = false;
    private _heroActuallyMoving = false;
    private _moveInputX = 0;
    private _moveInputY = 0;
    private _keyLeft = false;
    private _keyRight = false;
    private _keyUp = false;
    private _keyDown = false;
    private _cameraX = 0;
    private _cameraY = 0;
    private _cellSize = 32;
    private _viewportWidthGrid = ARCANE_GLOBAL_CONFIG.viewport_width_grid;
    private _viewportHeightGrid = ARCANE_GLOBAL_CONFIG.viewport_height_grid;
    private _visibleWidth = 1280;
    private _visibleHeight = 720;
    private _elapsed = 0;
    private _analysisCooldown = 0;
    private _analysisHolding = false;
    private _analysisHoldElapsed = 0;
    private _analysisReleasePending = false;
    private _paused = false;
    private _over = false;
    private _reviveUsed = false;
    private _spawnedCount = 0;
    private _fadedCount = 0;
    private _maxActive = 0;
    private _monsterUid = 0;
    private _tutorialStep = 0;
    private _toastRemaining = 0;
    private _statusMonster: RuntimeMonster = null;
    private _hudRefreshRemaining = 0;
    private _hudDirty = true;
    private _sceneTransitioning = false;
    private _bgmAudioId = -1;
    private _selectedRoleNo = 1;
    private _tilePaletteVersion = 0;
    private _heroAnimKey = '';
    private _heroAnimIndex = 0;
    private _heroAnimElapsed = 0;
    private _heroAnimationReady = false;
    private _animFrameCache: { [key: string]: cc.SpriteFrame[] } = {};
    private _animFrameLoading: { [key: string]: boolean } = {};
    private _animFrameCallbacks: { [key: string]: Array<(frames: cc.SpriteFrame[]) => void> } = {};

    onLoad(): void {
        this._playBGMFromStart();
        this._bindSceneLayers();
        this._bindInput();
        this._ensureInitialDiamonds();
        this._startConfiguredLevel();
    }

    onDestroy(): void {
        this._stopBGM();
        cc.systemEvent.off(cc.SystemEvent.EventType.KEY_DOWN, this._onKeyDown, this);
        cc.systemEvent.off(cc.SystemEvent.EventType.KEY_UP, this._onKeyUp, this);
    }

    update(dt: number): void {
        const timerDelta = Math.max(0, dt || 0);
        const movementDelta = Math.min(0.05, timerDelta);
        const viewportChanged = this._syncViewportMetrics(false);
        if (viewportChanged || this._tutorialStep !== 0) this._syncGuideLayout();
        if (!this._paused && !this._over) {
            this._elapsed += timerDelta;
            this._analysisCooldown = Math.max(0, this._analysisCooldown - timerDelta);
            this._updateAnalysisPreview(timerDelta);
            this._updatePlayer(movementDelta);
            this._updateMonsters(movementDelta, timerDelta);
            this._updateEffects(timerDelta);
            this._advanceEntityAnimations(timerDelta);
        }
        if (this._toastRemaining > 0) {
            this._toastRemaining -= timerDelta;
            if (this._statusMonster && this._statusMonster.wakeRemaining > 0) {
                this._statusLabel.string = '已发现：' + this._statusMonster.cfg.name
                    + ' ' + this._statusMonster.wakeRemaining.toFixed(1) + '秒';
            }
            if (this._toastRemaining <= 0) {
                if (this._toastLabel) this._toastLabel.node.active = false;
                if (this._statusPanel) this._statusPanel.active = false;
                this._statusMonster = null;
            }
        }
        if (this._statusMonster && !this._isTreasureMode) {
            const monsterStillExists = !this._over && this._monsters.indexOf(this._statusMonster) >= 0;
            if (!monsterStillExists) {
                if (this._toastLabel) this._toastLabel.node.active = false;
                if (this._statusPanel) this._statusPanel.active = false;
                this._statusMonster = null;
            } else {
                this._statusLabel.string = '已发现：' + this._statusMonster.cfg.name
                    + ' ' + this._monsterSurvivalRemaining(this._statusMonster).toFixed(1) + '秒';
            }
        }
        this._updateCamera(viewportChanged, timerDelta);
        this._drawBattle();
        this._hudRefreshRemaining = Math.max(0, this._hudRefreshRemaining - timerDelta);
        this._updateHud();
    }

    private _bindSceneLayers(): void {
        this._worldLayer = this._requiredNode('WorldLayer');
        this._entityLayer = this._requiredNode('EntityLayer');
        this._hudLayer = this._requiredNode('HudLayer');
        this._controlLayer = this._requiredNode('ControlLayer');
        this._popupLayer = this._requiredNode('PopupLayer');
        this._starNode = this._requiredNode('HudLayer/Star_node');
        this._starSprites = this._starNode.children.slice(0, 3)
            .map((node) => node.getComponent(cc.Sprite))
            .filter((sprite) => !!sprite);
        this._starFullFrames = this._starSprites.map((sprite) => sprite.spriteFrame);
        this._loadEmptyStarFrame();

        this._tileRoot = this._requiredNode('WorldLayer/TileRoot');
        this._tileTemplate = this._requiredNode('WorldLayer/TileTemplate');
        this._tilePalette = this._requiredNode('WorldLayer/TilePalette');
        this._heroNode = this._requiredNode('EntityLayer/HeroNode');
        this._heroSprite = this._requiredSprite('EntityLayer/HeroNode/HeroSprite');
        this._heroMarker = this._requiredNode('EntityLayer/HeroNode/PlayerBodyMarker').getComponent(cc.Graphics);
        const analysisFrameNode = new cc.Node('AnalysisRangeFrame');
        analysisFrameNode.parent = this._entityLayer;
        analysisFrameNode.setSiblingIndex(0);
        this._analysisFrame = analysisFrameNode.addComponent(cc.Graphics);
        this._analysisFrame.node.active = false;
        this._heroPalette = this._requiredNode('EntityLayer/HeroPalette');
        this._monsterRoot = this._requiredNode('EntityLayer/MonsterRoot');
        this._monsterTemplate = this._requiredNode('EntityLayer/MonsterTemplate');
        this._monsterPalette = this._requiredNode('EntityLayer/MonsterPalette');
        this._effectRoot = this._requiredNode('EntityLayer/EffectRoot');
        this._effectTemplate = this._requiredNode('EntityLayer/EffectTemplate');
        this._effectPalette = this._requiredNode('EntityLayer/EffectPalette');

        this._levelPanel = this._requiredNode('HudLayer/LevelPanel');
        this._statusPanel = this._requiredNode('HudLayer/MonsterTimerPanel');
        this._statusLabel = this._requiredLabel('HudLayer/MonsterTimerPanel/MonsterTimers');
        this._styleStatusLabel();
        this._exploreLabel = this._requiredLabel('HudLayer/ExploreLabel');
        this._arrowLabel = this._requiredLabel('HudLayer/ExitDirection/ExitDirectionLabel');
        this._arrowIcon = this._requiredNode('HudLayer/ExitDirection/ExitArrowIcon');
        let generatedArrow = this._arrowIcon.getChildByName('GeneratedArrow');
        if (!generatedArrow) {
            generatedArrow = new cc.Node('GeneratedArrow');
            generatedArrow.parent = this._arrowIcon;
        }
        generatedArrow.setPosition(0, 0);
        generatedArrow.setContentSize(38, 38);
        this._arrowGraphics = generatedArrow.getComponent(cc.Graphics) || generatedArrow.addComponent(cc.Graphics);
        this._drawExitArrow();
        this._hintLabel = this._requiredLabel('HudLayer/TutorialHint');
        this._toastLabel = this._requiredLabel('HudLayer/ToastLabel');
        this._pauseButton = this._requiredNode('HudLayer/PauseButton');

        this._joystickNode = this._requiredNode('ControlLayer/Joystick');
        this._joystickKnob = this._requiredNode('ControlLayer/Joystick/JoystickKnob');
        this._analysisButton = this._requiredNode('ControlLayer/AnalysisButton');
        this._analysisLabel = this._requiredLabel('ControlLayer/AnalysisButton/ButtonLabel');
        this._analysisStateLabel = this._requiredLabel('ControlLayer/AnalysisButton/AnalysisState');

        this._popupPause = this._popupView('PopupPause');
        this._popupRevive = this._popupView('PopupRevive');
        this._popupResult = this._popupView('PopupResult');
        this._popupWinResult = this._popupView('PopupWinResult');
        this._popupResultBodyFontSize = this._popupResult.body.fontSize;
        this._popupResultBodyLineHeight = this._popupResult.body.lineHeight;
        this._popupWinBodyFontSize = this._popupWinResult.body.fontSize;
        this._popupWinBodyLineHeight = this._popupWinResult.body.lineHeight;
        this._popupResultTitle = this._popupResult.title.string;
        this._popupWinResultTitle = this._popupWinResult.title.string;
        this._winDiamondBox = this._requiredNode('PopupLayer/PopupWinResult/DiamondBox');
        this._winDiamondLabel = this._requiredLabel('PopupLayer/PopupWinResult/DiamondLabel');

        this._guideLayer = this._requiredNode('GuideLayer');
        this._guideMask = this._requiredNode('GuideLayer/遮罩');
        this._guideNode1 = this._requiredNode('GuideLayer/node1');
        this._guideNode2 = this._requiredNode('GuideLayer/node2');
        this._guideDirectionHand = this._requiredNode('GuideLayer/node1/shouzhi');
        this._guideAnalysisHand = this._requiredNode('GuideLayer/node2/shouzhi');
        this._guideClassicText = this._requiredLabel('GuideLayer/node2/qipao/New Label');
        this._guideDirectionIcon = this._requiredNode('GuideLayer/node1/fangxiangjian');
        this._guideAnalysisIcon = this._requiredNode('GuideLayer/node2/anzhujiexi');
        this._guideNode1ReferencePosition = this._guideDirectionIcon.position.clone();
        this._guideNode2ReferencePosition = this._guideAnalysisIcon.position.clone();
        // The mask intentionally blocks the game controls until the guide icons are tapped.
        const blockInput = this._guideMask.getComponent(cc.BlockInputEvents);
        if (blockInput) blockInput.enabled = true;

        this._tileTemplate.active = false;
        this._tilePalette.active = false;
        this._heroPalette.active = false;
        this._monsterTemplate.active = false;
        this._monsterPalette.active = false;
        this._effectTemplate.active = false;
        this._effectPalette.active = false;
        this._levelPanel.active = false;
        this._statusPanel.active = false;
        this._exploreLabel.node.active = false;
        this._hintLabel.node.active = false;
        this._toastLabel.node.active = false;
        this._hidePopup();
        this._setGuideStep(0);
        this._syncGuideLayout();
    }

    private _requiredNode(path: string): cc.Node {
        const parts = path.split('/');
        let current = this.node;
        for (let i = 0; i < parts.length; i++) current = current ? current.getChildByName(parts[i]) : null;
        if (!current) throw new Error('ArcaneWarrior scene is missing node: ' + path);
        return current;
    }

    private _requiredLabel(path: string): cc.Label {
        const node = this._requiredNode(path);
        const label = node.getComponent(cc.Label);
        if (!label) throw new Error('ArcaneWarrior scene node requires cc.Label: ' + path);
        return label;
    }

    private _requiredSprite(path: string): cc.Sprite {
        const node = this._requiredNode(path);
        const sprite = node.getComponent(cc.Sprite);
        if (!sprite) throw new Error('ArcaneWarrior scene node requires cc.Sprite: ' + path);
        return sprite;
    }

    private _popupView(name: string): PopupView {
        const basePath = 'PopupLayer/' + name;
        const root = this._requiredNode(basePath);
        const tertiary = root.getChildByName('Tertiary');
        return {
            root,
            title: this._requiredLabel(basePath + '/TitleLabel'),
            body: this._requiredLabel(basePath + '/BodyLabel'),
            primary: this._requiredNode(basePath + '/Primary'),
            secondary: this._requiredNode(basePath + '/Secondary'),
            tertiary
        };
    }

    private _bindInput(): void {
        this._pauseButton.on(cc.Node.EventType.TOUCH_END, this._openPause, this);
        this._joystickNode.on(cc.Node.EventType.TOUCH_START, this._onJoystickTouch, this);
        this._joystickNode.on(cc.Node.EventType.TOUCH_MOVE, this._onJoystickTouch, this);
        this._joystickNode.on(cc.Node.EventType.TOUCH_END, this._onJoystickEnd, this);
        this._joystickNode.on(cc.Node.EventType.TOUCH_CANCEL, this._onJoystickEnd, this);
        this._analysisButton.on(cc.Node.EventType.TOUCH_START, this._beginAnalysis, this);
        this._analysisButton.on(cc.Node.EventType.TOUCH_END, this._releaseAnalysis, this);
        this._analysisButton.on(cc.Node.EventType.TOUCH_CANCEL, this._cancelAnalysis, this);
        this._guideDirectionIcon.on(cc.Node.EventType.TOUCH_END, this._onGuideDirectionTap, this);
        this._guideAnalysisIcon.on(cc.Node.EventType.TOUCH_END, this._onGuideAnalysisTap, this);
        cc.systemEvent.on(cc.SystemEvent.EventType.KEY_DOWN, this._onKeyDown, this);
        cc.systemEvent.on(cc.SystemEvent.EventType.KEY_UP, this._onKeyUp, this);
    }

    private _startConfiguredLevel(): void {
        if (mGameData.GetLevelData) mGameData.GetLevelData();
        if (mGameData.GetCurrentRoleData) mGameData.GetCurrentRoleData();
        this._isTreasureMode = !!mGameData.isInfiniteMode;
        const selectedTreasure = Math.max(1, Math.floor((GameState.selectedTreasureLevelIdx || 0) + 1));
        const selectedFromOld = Math.max(1, Math.floor(mGameData.currentLevel || 1));
        const totalLevels = this._isTreasureMode ? ARCANE_TREASURE_LEVELS.length : ARCANE_ESCAPE_LEVELS.length;
        this._levelNo = this._isTreasureMode ? selectedTreasure : selectedFromOld;
        this._levelNo = Math.max(1, Math.min(totalLevels, this._levelNo));
        this._level = this._isTreasureMode
            ? getArcaneTreasureLevel(this._levelNo)
            : getArcaneEscapeLevel(this._levelNo);
        this._hero = getArcaneCharacter(mGameData.currentRole || 0);
        this._loadSelectedRoleArt();

        this._revealed = [];
        this._blocked = {};
        this._brokenSeals = {};
        this._seals = [];
        this._monsters = [];
        this._effects = [];
        for (let y = 0; y < this._level.map_height_grid; y++) {
            const row: boolean[] = [];
            for (let x = 0; x < this._level.map_width_grid; x++) row.push(false);
            this._revealed.push(row);
        }
        this._level.blocked_points.forEach((point) => { this._blocked[this._key(point.x, point.y)] = true; });
        this._level.monster_points.forEach((point) => {
            this._seals.push({ x: point.x, y: point.y, monster_id: point.monster_id, awakened: false });
        });

        const heroGridSize = this._hero.body_size_grid;
        this._playerX = this._level.start_point.x + heroGridSize / 2;
        this._playerY = this._level.start_point.y + heroGridSize / 2;
        for (let y = this._level.start_point.y; y < this._level.start_point.y + heroGridSize; y++) {
            for (let x = this._level.start_point.x; x < this._level.start_point.x + heroGridSize; x++) {
                if (this._inside(x, y) && !this._blocked[this._key(x, y)]) this._revealed[y][x] = true;
            }
        }
        this._elapsed = 0;
        this._analysisCooldown = 0;
        this._analysisRemaining = this._isTreasureMode ? Math.max(1, this._level.analysis_limit_count || 1) : 0;
        this._treasureFailureReason = '';
        this._analysisHolding = false;
        this._analysisHoldElapsed = 0;
        this._analysisReleasePending = false;
        this._paused = false;
        this._over = false;
        this._reviveUsed = false;
        this._spawnedCount = 0;
        this._fadedCount = 0;
        this._maxActive = 0;
        this._moveInputX = 0;
        this._moveInputY = 0;
        this._playerMoving = false;
        this._heroActuallyMoving = false;
        this._syncViewportMetrics(true);
        this._syncGuideLayout();

        const tutorialMode = this._isTreasureMode ? 'classic' : 'escape';
        this._tutorialStep = this._levelNo === 1
            && !UserDataSyncManager.isNewbieGuideCompleted(tutorialMode) ? 101 : 0;
        this._guideClassicText.string = this._isTreasureMode
            ? '通过解析找出全部怪物。'
            : '通过解析找出一条通往出口的路。';
        this._setGuideStep(this._tutorialStep);
        this._arrowLabel.node.active = !this._isTreasureMode;
        this._hidePopup();
        this._updateCamera(true);
        this._drawBattle();
        this._updateHud();
    }

    private _updatePlayer(dt: number): void {
        const inputX = this._moveInputX + (this._keyRight ? 1 : 0) - (this._keyLeft ? 1 : 0);
        const inputY = this._moveInputY + (this._keyDown ? 1 : 0) - (this._keyUp ? 1 : 0);
        const inputLength = Math.sqrt(inputX * inputX + inputY * inputY);
        this._playerMoving = inputLength >= 0.08;
        this._heroActuallyMoving = false;
        if (!this._playerMoving) {
            return;
        }

        const moveX = inputX / inputLength;
        const moveY = inputY / inputLength;
        this._lastMoveX = moveX;
        this._lastMoveY = moveY;
        const oldPlayerX = this._playerX;
        const oldPlayerY = this._playerY;
        const distance = this._hero.base_spd * dt;
        const nextX = this._playerX + moveX * distance;
        const movedX = this._canPlayerStandAt(nextX, this._playerY);
        if (movedX) this._playerX = nextX;
        const nextY = this._playerY + moveY * distance;
        const movedY = this._canPlayerStandAt(this._playerX, nextY);
        if (movedY) this._playerY = nextY;

        // A full-grid rectangular body otherwise needs pixel-perfect alignment
        // to enter a passage that is exactly as wide as the hero footprint.
        if (!movedY && Math.abs(moveY) >= Math.abs(moveX)) {
            this._assistPlayerIntoVerticalPassage(nextY, distance);
        } else if (!movedX && Math.abs(moveX) > Math.abs(moveY)) {
            this._assistPlayerIntoHorizontalPassage(nextX, distance);
        }
        this._heroActuallyMoving = Math.abs(this._playerX - oldPlayerX) > 0.0001
            || Math.abs(this._playerY - oldPlayerY) > 0.0001;

        if (!this._isTreasureMode && this._level.exit_point
            && this._revealed[this._level.exit_point.y][this._level.exit_point.x]
            && this._playerOccupiesCell(this._level.exit_point.x, this._level.exit_point.y)) {
            this._finishBattle(true, null);
        }
    }

    private _canPlayerStandAt(centerX: number, centerY: number): boolean {
        const halfExtent = this._playerHalfExtentGrid();
        const left = centerX - halfExtent;
        const right = centerX + halfExtent;
        const top = centerY - halfExtent;
        const bottom = centerY + halfExtent;
        const minX = Math.floor(left);
        const maxX = Math.ceil(right) - 1;
        const minY = Math.floor(top);
        const maxY = Math.ceil(bottom) - 1;
        for (let y = minY; y <= maxY; y++) {
            for (let x = minX; x <= maxX; x++) {
                if (!this._isWalkable(x, y)
                    && this._aabbOverlap(left, top, right, bottom, x, y, x + 1, y + 1)) return false;
            }
        }
        return true;
    }

    private _assistPlayerIntoVerticalPassage(targetY: number, maxStep: number): void {
        const alignedX = this._nearestPassableAxisCenter(this._playerX, (candidateX) => {
            return this._canPlayerStandAt(candidateX, targetY);
        });
        if (alignedX === null) return;
        const assistedX = this._moveTowards(this._playerX, alignedX, maxStep);
        if (this._canPlayerStandAt(assistedX, this._playerY)) this._playerX = assistedX;
        if (this._canPlayerStandAt(this._playerX, targetY)) this._playerY = targetY;
    }

    private _assistPlayerIntoHorizontalPassage(targetX: number, maxStep: number): void {
        const alignedY = this._nearestPassableAxisCenter(this._playerY, (candidateY) => {
            return this._canPlayerStandAt(targetX, candidateY);
        });
        if (alignedY === null) return;
        const assistedY = this._moveTowards(this._playerY, alignedY, maxStep);
        if (this._canPlayerStandAt(this._playerX, assistedY)) this._playerY = assistedY;
        if (this._canPlayerStandAt(targetX, this._playerY)) this._playerX = targetX;
    }

    private _nearestPassableAxisCenter(value: number, canPass: (candidate: number) => boolean): number {
        const halfExtent = this._playerHalfExtentGrid();
        const lower = Math.floor(value - halfExtent) + halfExtent;
        const candidates = [lower, lower + 1].sort((a, b) => Math.abs(a - value) - Math.abs(b - value));
        for (let i = 0; i < candidates.length; i++) {
            if (Math.abs(candidates[i] - value) <= 0.5001 && canPass(candidates[i])) return candidates[i];
        }
        return null;
    }

    private _moveTowards(value: number, target: number, maxStep: number): number {
        const delta = target - value;
        if (Math.abs(delta) <= maxStep) return target;
        return value + (delta < 0 ? -maxStep : maxStep);
    }

    private _playerHalfExtentGrid(): number {
        return Math.max(0.5, this._hero.body_size_grid / 2);
    }

    private _playerOccupiesCell(x: number, y: number): boolean {
        const halfExtent = this._playerHalfExtentGrid();
        const epsilon = 0.0001;
        const cellCenterX = x + 0.5;
        const cellCenterY = y + 0.5;
        return cellCenterX >= this._playerX - halfExtent + epsilon
            && cellCenterX <= this._playerX + halfExtent - epsilon
            && cellCenterY >= this._playerY - halfExtent + epsilon
            && cellCenterY <= this._playerY + halfExtent - epsilon;
    }

    private _aabbOverlap(
        leftA: number, topA: number, rightA: number, bottomA: number,
        leftB: number, topB: number, rightB: number, bottomB: number
    ): boolean {
        const epsilon = 0.0001;
        return leftA < rightB - epsilon && rightA > leftB + epsilon
            && topA < bottomB - epsilon && bottomA > topB + epsilon;
    }

    private _beginAnalysis(event?: cc.Event.EventTouch): void {
        if (this._tutorialStep !== 0) return;
        const touchId = this._touchId(event);
        if (event && this._analysisTouchId >= 0 && touchId !== this._analysisTouchId) return;
        if (this._analysisHolding || !this._canAnalyze()) return;
        if (event) this._analysisTouchId = touchId;
        this._analysisHolding = true;
        this._hudDirty = true;
        this._analysisHoldElapsed = 0;
        this._analysisReleasePending = false;
        this._styleButton(this._analysisButton, 'primaryPressed');
    }

    private _releaseAnalysis(event?: cc.Event.EventTouch): void {
        const touchId = this._touchId(event);
        if (!event && this._analysisTouchId >= 0) return;
        if (event && this._analysisTouchId >= 0 && touchId !== this._analysisTouchId) return;
        if (event) this._analysisTouchId = -1;
        if (!this._analysisHolding) return;
        this._hudDirty = true;
        if (this._paused || this._over) {
            this._cancelAnalysis();
            return;
        }
        if (this._analysisHoldElapsed < ARCANE_GLOBAL_CONFIG.analysis_min_preview_sec) {
            this._analysisReleasePending = true;
            return;
        }
        this._completeAnalysis();
    }

    private _updateAnalysisPreview(dt: number): void {
        if (!this._analysisHolding) return;
        this._analysisHoldElapsed += Math.max(0, dt || 0);
        if (this._analysisReleasePending
            && this._analysisHoldElapsed >= ARCANE_GLOBAL_CONFIG.analysis_min_preview_sec) {
            this._completeAnalysis();
        }
    }

    private _completeAnalysis(): void {
        this._analysisTouchId = -1;
        this._analysisHolding = false;
        this._hudDirty = true;
        this._analysisHoldElapsed = 0;
        this._analysisReleasePending = false;
        this._styleButton(this._analysisButton, 'primary');
        if (this._paused || this._over) return;
        this._executeAnalysis();
    }

    private _cancelAnalysis(event?: cc.Event.EventTouch): void {
        const touchId = this._touchId(event);
        if (event && this._analysisTouchId >= 0 && touchId !== this._analysisTouchId) return;
        this._analysisTouchId = -1;
        this._analysisHolding = false;
        this._hudDirty = true;
        this._analysisHoldElapsed = 0;
        this._analysisReleasePending = false;
        if (this._analysisButton) this._styleButton(this._analysisButton, 'primary');
    }

    private _touchId(event?: cc.Event.EventTouch): number {
        return event && event.getID ? event.getID() : -1;
    }

    private _canAnalyze(): boolean {
        if (this._tutorialStep !== 0) return false;
        if (this._isTreasureMode && this._analysisRemaining <= 0) return false;
        return !this._paused && !this._over && this._analysisCooldown <= 0 && this._analysisCells().some((point) => {
            return !this._revealed[point.y][point.x] && !this._blocked[this._key(point.x, point.y)];
        });
    }

    private _analysisCells(): GridPoint[] {
        const centerX = Math.floor(this._playerX - 0.001);
        const centerY = Math.floor(this._playerY - 0.001);
        const halfW = Math.floor(ARCANE_GLOBAL_CONFIG.analysis_width_grid / 2);
        const halfH = Math.floor(ARCANE_GLOBAL_CONFIG.analysis_height_grid / 2);
        const cells: GridPoint[] = [];
        for (let y = centerY - halfH; y <= centerY + halfH; y++) {
            for (let x = centerX - halfW; x <= centerX + halfW; x++) {
                if (this._inside(x, y)) cells.push({ x, y });
            }
        }
        return cells;
    }

    private _executeAnalysis(): void {
        const cells = this._analysisCells();
        const newCells: { [key: string]: boolean } = {};
        let opened = 0;
        cells.forEach((point) => {
            const key = this._key(point.x, point.y);
            if (this._blocked[key] || this._revealed[point.y][point.x]) return;
            this._revealed[point.y][point.x] = true;
            newCells[key] = true;
            opened++;
        });
        if (!opened) return;

        this._hudDirty = true;
        this._analysisCooldown = ARCANE_GLOBAL_CONFIG.analysis_cooldown_sec;
        if (this._isTreasureMode) this._analysisRemaining = Math.max(0, this._analysisRemaining - 1);
        let spawned = 0;
        this._seals.forEach((seal) => {
            const key = this._key(seal.x, seal.y);
            if (seal.awakened || !newCells[key]) return;
            seal.awakened = true;
            this._brokenSeals[key] = true;
            this._spawnMonster(seal);
            spawned++;
        });
        // 解析完成后直接以地砖翻开和符文变化作为反馈。
        // 不在人物脚下生成 Ring，避免使用圆形占位图造成大圆圈遮挡角色。
        if (spawned > 0) {
            const firstSpawned = this._monsters[this._monsters.length - spawned];
            this._showDiscoveryToast(firstSpawned);
        }
        if (this._isTreasureMode) {
            const hiddenCount = this._seals.filter((seal) => !seal.awakened).length;
            if (hiddenCount === 0) {
                this._showToast('已找出全部魔物，等待最后一批消散');
            } else if (this._analysisRemaining <= 0) {
                this._treasureFailureReason = '解析次数耗尽，仍有 ' + hiddenCount + ' 只魔物未找到';
                this._finishBattle(false, null);
            }
        }
    }

    private _spawnMonster(seal: RuntimeSeal): void {
        const cfg = getArcaneMonster(seal.monster_id);
        this._monsters.push({
            uid: ++this._monsterUid,
            cfg,
            x: seal.x,
            y: seal.y,
            wakeRemaining: this._isTreasureMode
                ? ARCANE_GLOBAL_CONFIG.treasure_monster_death_delay_sec
                : ARCANE_GLOBAL_CONFIG.monster_wake_delay_sec,
            lifeRemaining: cfg.lifetime_sec,
            activeElapsed: 0,
            repathRemaining: 0,
            predictionRemaining: 0,
            path: [],
            pathIndex: 0,
            movedSinceDash: 0,
            dashChargeRemaining: 0,
            dashDistanceRemaining: 0,
            facing: 'down',
            moving: false
        });
        this._spawnedCount++;
        this._maxActive = Math.max(this._maxActive, this._monsters.length);
        this._effects.push({ x: seal.x + 0.5, y: seal.y + 0.5, life: 0.75, maxLife: 0.75, color: this._hex(cfg.color), kind: 'burst' });
    }

    private _updateMonsters(movementDt: number, timerDt: number): void {
        if (this._isTreasureMode) {
            const treasureSurvivors: RuntimeMonster[] = [];
            for (let i = 0; i < this._monsters.length; i++) {
                const monster = this._monsters[i];
                monster.wakeRemaining = Math.max(0, monster.wakeRemaining - timerDt);
                if (monster.wakeRemaining > 0) {
                    treasureSurvivors.push(monster);
                    continue;
                }
                this._fadedCount++;
                this._effects.push({
                    x: monster.x + monster.cfg.body_size_grid / 2,
                    y: monster.y + monster.cfg.body_size_grid / 2,
                    life: 0.7,
                    maxLife: 0.7,
                    color: this._hex(monster.cfg.color),
                    kind: 'fade'
                });
            }
            this._monsters = treasureSurvivors;
            if (this._seals.length > 0 && this._seals.every((seal) => seal.awakened)
                && this._monsters.length === 0) {
                this._finishBattle(true, null);
            }
            return;
        }
        const survivors: RuntimeMonster[] = [];
        for (let i = 0; i < this._monsters.length; i++) {
            const monster = this._monsters[i];
            if (monster.wakeRemaining > 0) {
                monster.wakeRemaining = Math.max(0, monster.wakeRemaining - timerDt);
                survivors.push(monster);
                continue;
            }

            monster.activeElapsed += timerDt;
            monster.lifeRemaining -= timerDt;
            if (monster.lifeRemaining <= 0) {
                this._fadedCount++;
                this._effects.push({
                    x: monster.x + monster.cfg.body_size_grid / 2,
                    y: monster.y + monster.cfg.body_size_grid / 2,
                    life: 0.7,
                    maxLife: 0.7,
                    color: this._hex(monster.cfg.color),
                    kind: 'fade'
                });
                continue;
            }

            this._moveMonster(monster, movementDt, timerDt);
            if (this._monsterTouchesPlayer(monster)) {
                survivors.push(monster);
                this._monsters = survivors.concat(this._monsters.slice(i + 1));
                this._finishBattle(false, monster);
                return;
            }
            survivors.push(monster);
        }
        this._monsters = survivors;
    }

    private _moveMonster(monster: RuntimeMonster, movementDt: number, timerDt: number): void {
        monster.moving = false;
        // 寻宝模式中的怪物是被发现后等待消失的宝藏，不参与追踪和碰撞移动。
        if (this._isTreasureMode) return;
        if (monster.dashChargeRemaining > 0) {
            monster.dashChargeRemaining = Math.max(0, monster.dashChargeRemaining - timerDt);
            return;
        }

        monster.repathRemaining -= timerDt;
        if (monster.cfg.behavior_type === 'predictive_chase') {
            monster.predictionRemaining -= timerDt;
            if (monster.predictionRemaining <= 0) {
                const interval = Math.max(0.1, Number(monster.cfg.behavior_params.prediction_interval_sec || 3));
                monster.predictionRemaining = interval;
                if (this._setPredictivePath(monster)) {
                    monster.repathRemaining = interval;
                } else {
                    this._setStandardPath(monster);
                }
            } else if (monster.repathRemaining <= 0 || monster.pathIndex >= monster.path.length) {
                this._setStandardPath(monster);
            }
        } else if (monster.repathRemaining <= 0 || monster.pathIndex >= monster.path.length) {
            this._setStandardPath(monster);
        }
        if (monster.pathIndex >= monster.path.length) return;

        const target = monster.path[monster.pathIndex];
        const targetX = target.x;
        const targetY = target.y;
        const dx = targetX - monster.x;
        const dy = targetY - monster.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        if (distance <= 0.001) {
            monster.pathIndex++;
            return;
        }

        const acceleration = 1 + monster.activeElapsed * (this._level.monster_spd_acceleration_per_sec || 0);
        const modeSpeedScale = ARCANE_GLOBAL_CONFIG.escape_monster_speed_scale;
        let speed = monster.cfg.base_chase_spd * (this._level.monster_spd_multiplier || 1)
            * acceleration * modeSpeedScale;
        if (monster.dashDistanceRemaining > 0) speed *= 2.6;
        const step = Math.min(distance, speed * movementDt);
        const nextX = monster.x + dx / distance * step;
        const nextY = monster.y + dy / distance * step;
        const oldX = monster.x;
        const oldY = monster.y;
        if (this._canMonsterOccupyAt(nextX, nextY, monster.cfg.body_size_grid)) {
            monster.x = nextX;
            monster.y = nextY;
            monster.movedSinceDash += step;
            if (monster.dashDistanceRemaining > 0) monster.dashDistanceRemaining = Math.max(0, monster.dashDistanceRemaining - step);
        } else {
            // Keep moving along the free axis when a diagonal corner is blocked.
            if (this._canMonsterOccupyAt(nextX, oldY, monster.cfg.body_size_grid)) monster.x = nextX;
            else if (this._canMonsterOccupyAt(oldX, nextY, monster.cfg.body_size_grid)) monster.y = nextY;
            if (monster.x !== oldX || monster.y !== oldY) {
                monster.movedSinceDash += Math.abs(monster.x - oldX) + Math.abs(monster.y - oldY);
            } else {
                monster.repathRemaining = 0;
            }
        }
        if (monster.x !== oldX || monster.y !== oldY) {
            monster.moving = true;
            monster.facing = this._directionFromVector(monster.x - oldX, monster.y - oldY, monster.facing);
            const remainingX = targetX - monster.x;
            const remainingY = targetY - monster.y;
            if (Math.sqrt(remainingX * remainingX + remainingY * remainingY) <= 0.001) monster.pathIndex++;
        }

        if (monster.cfg.behavior_type === 'dash_chase' && monster.dashDistanceRemaining <= 0) {
            const every = Number(monster.cfg.behavior_params.dash_every_grid || 5);
            if (monster.movedSinceDash >= every) {
                monster.movedSinceDash = 0;
                monster.dashChargeRemaining = Number(monster.cfg.behavior_params.dash_charge_sec || 0.6);
                monster.dashDistanceRemaining = Number(monster.cfg.behavior_params.dash_distance_grid || 2);
            }
        }
    }

    private _setStandardPath(monster: RuntimeMonster): void {
        const goal = this._nearestMonsterGoal(
            this._playerX - monster.cfg.body_size_grid / 2,
            this._playerY - monster.cfg.body_size_grid / 2,
            monster.cfg.body_size_grid
        );
        monster.path = this._findPath(monster, goal);
        monster.pathIndex = 0;
        monster.repathRemaining = 0.4;
    }

    private _setPredictivePath(monster: RuntimeMonster): boolean {
        if (!this._playerMoving) return false;
        const distance = Number(monster.cfg.behavior_params.prediction_distance_grid || 2);
        const goal = {
            x: Math.round(this._playerX - monster.cfg.body_size_grid / 2 + this._lastMoveX * distance),
            y: Math.round(this._playerY - monster.cfg.body_size_grid / 2 + this._lastMoveY * distance)
        };
        if (!this._canMonsterOccupy(goal.x, goal.y, monster.cfg.body_size_grid)) return false;

        const path = this._findPath(monster, goal);
        if (path.length === 0) return false;
        monster.path = path;
        monster.pathIndex = 0;
        return true;
    }

    private _nearestMonsterGoal(targetX: number, targetY: number, size: number): GridPoint {
        const originX = Math.round(targetX);
        const originY = Math.round(targetY);
        for (let radius = 0; radius < 12; radius++) {
            for (let y = originY - radius; y <= originY + radius; y++) {
                for (let x = originX - radius; x <= originX + radius; x++) {
                    if (Math.abs(x - originX) !== radius && Math.abs(y - originY) !== radius) continue;
                    if (this._canMonsterOccupy(x, y, size)) return { x, y };
                }
            }
        }
        return null;
    }

    private _findPath(monster: RuntimeMonster, goal: GridPoint): GridPoint[] {
        if (!goal) return [];
        const size = monster.cfg.body_size_grid;
        const startX = Math.round(monster.x);
        const startY = Math.round(monster.y);
        if (!this._canMonsterOccupy(startX, startY, size)) return [];
        const startKey = this._key(startX, startY);
        const goalKey = this._key(goal.x, goal.y);
        const open: Array<{ x: number; y: number; g: number; f: number }> = [
            { x: startX, y: startY, g: 0, f: Math.abs(goal.x - startX) + Math.abs(goal.y - startY) }
        ];
        const cameFrom: { [key: string]: string } = {};
        const bestG: { [key: string]: number } = {};
        bestG[startKey] = 0;
        const directions = [[1, 0], [-1, 0], [0, 1], [0, -1]];
        let guard = 0;

        while (open.length && guard++ < 5000) {
            open.sort((a, b) => a.f - b.f);
            const current = open.shift();
            const currentKey = this._key(current.x, current.y);
            if (currentKey === goalKey) {
                const path: GridPoint[] = [];
                let cursor = goalKey;
                while (cursor !== startKey) {
                    const parts = cursor.split(',');
                    path.push({ x: Number(parts[0]), y: Number(parts[1]) });
                    cursor = cameFrom[cursor];
                    if (!cursor) return [];
                }
                path.reverse();
                return path;
            }
            for (let i = 0; i < directions.length; i++) {
                const nx = current.x + directions[i][0];
                const ny = current.y + directions[i][1];
                if (!this._canMonsterOccupy(nx, ny, size)) continue;
                const neighborKey = this._key(nx, ny);
                let softCost = 0;
                if (monster.cfg.behavior_type !== 'phase_chase') softCost = this._softMonsterCost(monster, nx, ny, size);
                const nextG = current.g + 1 + softCost;
                if (bestG[neighborKey] != null && nextG >= bestG[neighborKey]) continue;
                bestG[neighborKey] = nextG;
                cameFrom[neighborKey] = currentKey;
                open.push({ x: nx, y: ny, g: nextG, f: nextG + Math.abs(goal.x - nx) + Math.abs(goal.y - ny) });
            }
        }
        return [];
    }

    private _softMonsterCost(monster: RuntimeMonster, x: number, y: number, size: number): number {
        for (let i = 0; i < this._monsters.length; i++) {
            const other = this._monsters[i];
            if (other === monster || other.wakeRemaining > 0) continue;
            if (this._rectOverlap(x, y, size, size, other.x, other.y, other.cfg.body_size_grid, other.cfg.body_size_grid)) return 2.5;
        }
        return 0;
    }

    private _canMonsterOccupy(x: number, y: number, size: number): boolean {
        for (let oy = 0; oy < size; oy++) {
            for (let ox = 0; ox < size; ox++) {
                if (!this._isWalkable(x + ox, y + oy)) return false;
            }
        }
        return true;
    }

    private _canMonsterOccupyAt(x: number, y: number, size: number): boolean {
        const epsilon = 0.0001;
        const minX = Math.floor(x + epsilon);
        const maxX = Math.ceil(x + size - epsilon) - 1;
        const minY = Math.floor(y + epsilon);
        const maxY = Math.ceil(y + size - epsilon) - 1;
        for (let cellY = minY; cellY <= maxY; cellY++) {
            for (let cellX = minX; cellX <= maxX; cellX++) {
                if (!this._isWalkable(cellX, cellY)) return false;
            }
        }
        return true;
    }

    private _monsterTouchesPlayer(monster: RuntimeMonster): boolean {
        if (monster.wakeRemaining > 0) return false;
        const halfExtent = this._playerHalfExtentGrid();
        return this._aabbOverlap(
            this._playerX - halfExtent,
            this._playerY - halfExtent,
            this._playerX + halfExtent,
            this._playerY + halfExtent,
            monster.x,
            monster.y,
            monster.x + monster.cfg.body_size_grid,
            monster.y + monster.cfg.body_size_grid
        );
    }

    private _rectOverlap(ax: number, ay: number, aw: number, ah: number, bx: number, by: number, bw: number, bh: number): boolean {
        return ax < bx + bw - 0.08 && ax + aw > bx + 0.08 && ay < by + bh - 0.08 && ay + ah > by + 0.08;
    }

    private _finishBattle(won: boolean, killer: RuntimeMonster): void {
        if (this._over) return;
        this._over = true;
        this._paused = true;
        this._cancelAnalysis();
        this._resetMovement();
        if (this._isTreasureMode) {
            this._finishTreasureBattle(won);
            return;
        }
        if (won) {
            const stars = this._currentStars();
            const levelReward = this._claimLevelClearReward(this._levelNo);
            this._saveVictory(stars);
            this._setWinStars(stars);
            this._setWinDiamondReward(levelReward);
            const nextLevel = this._levelNo < ARCANE_ESCAPE_LEVELS.length;
            const actions: PopupAction[] = [
                { actionId: 'return', label: '返回主界面', kind: 'secondary', callback: () => this._returnToStart() }
            ];
            if (nextLevel) actions.push({ actionId: 'next', label: '下一关', kind: 'primary', callback: () => this._startNextLevel() });
            this._showPopup(
                '',
                '',
                actions,
                'win',
                undefined,
                undefined,
                true
            );
            return;
        }

        const actions: PopupAction[] = [
            { actionId: 'retry', label: '重新挑战', kind: 'secondary', callback: () => this._retryLevel() },
            { actionId: 'return', label: '返回主界面', kind: 'danger', callback: () => this._returnToStart() }
        ];
        this._showPopup(
            '',
            '',
            actions,
            'result',
            undefined,
            undefined,
            true
        );
    }

    private _finishTreasureBattle(won: boolean): void {
        const actions: PopupAction[] = [
            { actionId: 'return', label: '返回主界面', kind: won ? 'secondary' : 'danger', callback: () => this._returnToStart() }
        ];
        if (won) {
            this._saveTreasureVictory();
            this._setWinStars(0);
            this._setWinDiamondReward(0);
            if (this._levelNo < ARCANE_TREASURE_LEVELS.length) {
                actions.push({ actionId: 'next', label: '下一关', kind: 'primary', callback: () => this._startNextLevel() });
            }
            this._showPopup(
                '',
                '',
                actions,
                'win',
                undefined,
                undefined,
                true
            );
            return;
        }
        actions.unshift({ actionId: 'retry', label: '重新挑战', kind: 'primary', callback: () => this._retryLevel() });
        this._showPopup(
            '',
            '',
            actions,
            'result',
            undefined,
            undefined,
            true
        );
    }

    private _saveVictory(stars: number): void {
        // 只有首次突破历史最高通关关卡才上报排行榜，重玩旧关卡不触发 PassLevel。
        const previousHighestPassedLevel = Math.max(0, Math.floor(mGameData.unlockedLevel || 1) - 1);
        const reachedNewHighestLevel = this._levelNo > previousHighestPassedLevel;

        mGameData.currentLevel = this._levelNo;
        if (mGameData.saveLevelStarsByLevel) mGameData.saveLevelStarsByLevel(this._levelNo, stars);
        mGameData.unlockedLevel = Math.max(mGameData.unlockedLevel || 1, Math.min(ARCANE_ESCAPE_LEVELS.length, this._levelNo + 1));
        if (mGameData.SaveLevelData) mGameData.SaveLevelData();

        GameState.levelStars[String(this._levelNo)] = Math.max(GameState.levelStars[String(this._levelNo)] || 0, stars);
        GameState.maxUnlockedLevel = Math.max(GameState.maxUnlockedLevel || 0, mGameData.unlockedLevel - 1);
        GameState.selectedLevelIdx = Math.min(ARCANE_ESCAPE_LEVELS.length - 1, this._levelNo);
        GameState.selectedLevelId = String(GameState.selectedLevelIdx + 1);
        GameState.returningFrom = 'victory';
        GameState.save();
        UserDataSyncManager.requestUpload();
        if (reachedNewHighestLevel) {
            // 完整账号存档和排行榜通关记录使用两个接口；排行榜只记录历史最高关卡。
            UserDataSyncManager.postPassLevel(this._levelNo, stars).catch((error) => {
                console.error('[ArcaneWarrior] post pass level failed:', error);
            });
        }
    }

    private _claimLevelClearReward(level: number): number {
        if (!UserDataSyncManager.markLevelClearRewardClaimed(level)) return 0;

        if (mGameData.addGold) {
            mGameData.addGold(LEVEL_CLEAR_REWARD);
        } else {
            mGameData.currentGold = Math.max(0, (mGameData.currentGold || 0) + LEVEL_CLEAR_REWARD);
            mGameData.totalGoldEarned = Math.max(0, (mGameData.totalGoldEarned || 0) + LEVEL_CLEAR_REWARD);
            if (mGameData.SaveGoldData) mGameData.SaveGoldData();
            cc.director.emit('goldUpdated');
        }
        return LEVEL_CLEAR_REWARD;
    }

    private _saveTreasureVictory(): void {
        const levelId = 'T' + ('000' + this._levelNo).slice(-3);
        GameState.treasureLevelClears[levelId] = true;
        GameState.treasureBestRemainingAnalysis[levelId] = Math.max(
            GameState.treasureBestRemainingAnalysis[levelId] || 0,
            this._analysisRemaining
        );
        GameState.maxUnlockedTreasureLevel = Math.max(
            GameState.maxUnlockedTreasureLevel || 1,
            Math.min(ARCANE_TREASURE_LEVELS.length, this._levelNo + 1)
        );
        GameState.selectedTreasureLevelIdx = Math.min(ARCANE_TREASURE_LEVELS.length - 1, this._levelNo);
        GameState.returningFrom = 'victory';
        GameState.save();
        UserDataSyncManager.requestUpload();
    }

    private _revive(): void {
        if (this._reviveUsed || !this._spendDiamonds(ARCANE_GLOBAL_CONFIG.revive_cost_diamonds)) return;
        this._reviveUsed = true;
        this._monsters = [];
        this._hidePopup();
        this._over = false;
        this._paused = false;
        this._effects.push({ x: this._playerX, y: this._playerY, life: 0.9, maxLife: 0.9, color: COLORS.gold, kind: 'ring' });
        this._showToast('原地复活，场上魔物已清除');
    }

    private _retryLevel(): void {
        if (this._sceneTransitioning) return;
        this._sceneTransitioning = true;
        this._hidePopup();
        if (!StateBridge.hasEnoughStamina()) {
            this._sceneTransitioning = false;
            this._showPopup('体力不足', '重新挑战需要消耗 1 点体力', [
                { actionId: 'return', label: '返回主界面', kind: 'primary', callback: () => this._returnToStart() }
            ]);
            return;
        }
        this._preloadAndReloadLevel(this._levelNo);
    }

    private _startNextLevel(): void {
        if (this._sceneTransitioning) return;
        const totalLevels = this._isTreasureMode ? ARCANE_TREASURE_LEVELS.length : ARCANE_ESCAPE_LEVELS.length;
        const next = Math.min(totalLevels, this._levelNo + 1);
        this._sceneTransitioning = true;
        this._hidePopup();
        if (!StateBridge.hasEnoughStamina()) {
            this._sceneTransitioning = false;
            this._showPopup('体力不足', '进入下一关需要消耗 1 点体力', [
                { actionId: 'return', label: '返回主界面', kind: 'primary', callback: () => this._returnToStart() }
            ]);
            return;
        }
        this._preloadAndReloadLevel(next);
    }

    private _preloadAndReloadLevel(levelNo: number): void {
        cc.director.preloadScene(Scene.ArcaneWarrior, null, (err: Error) => {
            if (err) {
                this._sceneTransitioning = false;
                this._showPopup('level load failed', 'please retry', [
                    { actionId: 'return', label: 'return', kind: 'primary', callback: () => this._returnToStart() }
                ]);
                return;
            }
            if (!StateBridge.consumeStamina()) {
                this._sceneTransitioning = false;
                this._showPopup('not enough stamina', 'entering a level costs 1 stamina', [
                    { actionId: 'return', label: 'return', kind: 'primary', callback: () => this._returnToStart() }
                ]);
                return;
            }
            mGameData.isInfiniteMode = this._isTreasureMode;
            if (this._isTreasureMode) {
                GameState.selectedTreasureLevelIdx = levelNo - 1;
            } else {
                mGameData.currentLevel = levelNo;
                if (mGameData.SaveLevelData) mGameData.SaveLevelData();
                GameState.selectedLevelIdx = levelNo - 1;
                GameState.selectedLevelId = String(levelNo);
            }
            GameState.save();
            cc.director.loadScene(Scene.ArcaneWarrior, (loadErr: Error) => {
                if (!loadErr || !this.node || !this.node.isValid) return;
                StateBridge.refundStamina();
                this._sceneTransitioning = false;
                this._showPopup('level load failed', 'stamina refunded, please retry', [
                    { actionId: 'return', label: 'return', kind: 'primary', callback: () => this._returnToStart() }
                ]);
            });
        });
    }

    private _returnToStart(): void {
        StateBridge.syncNewToOld();
        this._stopBGM();
        cc.director.loadScene('Start');
    }

    private _playBGMFromStart(): void {
        this._stopBGM();
        if (!mGameData.isBGMOn || !this.battleBgm) return;
        this._bgmAudioId = cc.audioEngine.play(this.battleBgm, true, 1);
        cc.audioEngine.setCurrentTime(this._bgmAudioId, 0);
    }

    private _stopBGM(): void {
        if (this._bgmAudioId < 0) return;
        cc.audioEngine.stop(this._bgmAudioId);
        this._bgmAudioId = -1;
    }

    private _openPause(): void {
        if (this._over) return;
        this._paused = true;
        this._cancelAnalysis();
        this._resetMovement();
        this._showPopup('暂停', '', [
            { actionId: 'continue', label: '继续', kind: 'primary', callback: () => { this._hidePopup(); this._paused = false; } },
            { actionId: 'exit', label: '退出本局', kind: 'danger', callback: () => this._returnToStart() }
        ], 'pause');
    }

    private _showPopup(
        title: string,
        body: string,
        actions: PopupAction[],
        kind: PopupKind = 'result',
        bodyFontSize?: number,
        bodyLineHeight?: number,
        useEditorText = false
    ): void {
        this._hidePopup();
        const view = this._popupForKind(kind);
        this._popupLayer.active = true;
        view.root.active = true;
        if (useEditorText) {
            if (kind === 'result') view.title.string = this._popupResultTitle;
            else if (kind === 'win') view.title.string = this._popupWinResultTitle;
            view.body.string = '';
            view.body.node.active = false;
        } else {
            view.title.string = title;
            view.body.string = body;
            view.body.node.active = !!body;
        }
        if (kind === 'result') {
            view.body.fontSize = bodyFontSize == null ? this._popupResultBodyFontSize : bodyFontSize;
            view.body.lineHeight = bodyLineHeight == null ? this._popupResultBodyLineHeight : bodyLineHeight;
        } else if (kind === 'win') {
            view.body.fontSize = bodyFontSize == null ? this._popupWinBodyFontSize : bodyFontSize;
            view.body.lineHeight = bodyLineHeight == null ? this._popupWinBodyLineHeight : bodyLineHeight;
        }

        const buttons = [view.primary, view.tertiary, view.secondary].filter((button) => !!button);
        for (let i = 0; i < buttons.length; i++) {
            const button = buttons[i];
            button.targetOff(this);
            button.active = false;
        }

        const used: cc.Node[] = [];
        for (let i = 0; i < actions.length; i++) {
            const action = actions[i];
            const button = this._popupButtonForAction(view, action, used, buttons);
            if (!button) continue;
            used.push(button);
            button.active = true;
            button.on(cc.Node.EventType.TOUCH_END, action.callback, this);
        }
        this._layoutPopupButtons(view, kind, used);
    }

    private _popupButtonForAction(view: PopupView, action: PopupAction, used: cc.Node[], buttons: cc.Node[]): cc.Node {
        let preferred: cc.Node = null;
        if (action.actionId === 'return' || action.actionId === 'exit') preferred = view.secondary;
        else if (action.actionId === 'retry' && view.tertiary && used.indexOf(view.primary) >= 0) preferred = view.tertiary;
        else if (action.actionId === 'next' || action.actionId === 'revive' || action.actionId === 'continue') preferred = view.primary;

        if (preferred && used.indexOf(preferred) < 0) return preferred;
        if (action.kind === 'primary' && used.indexOf(view.primary) < 0) return view.primary;
        return buttons.find((candidate) => used.indexOf(candidate) < 0) || null;
    }

    private _hidePopup(): void {
        const views = [this._popupPause, this._popupRevive, this._popupResult, this._popupWinResult];
        for (let i = 0; i < views.length; i++) {
            if (views[i] && views[i].root) views[i].root.active = false;
        }
        this._popupLayer.active = false;
    }

    private _popupForKind(kind: PopupKind): PopupView {
        if (kind === 'pause') return this._popupPause;
        if (kind === 'revive') return this._popupRevive;
        if (kind === 'win') return this._popupWinResult;
        return this._popupResult;
    }

    private _layoutPopupButtons(view: PopupView, kind: PopupKind, visible: cc.Node[]): void {
        if (kind === 'pause') return;
        const y = -190;
        if (visible.length === 1) {
            visible[0].setPosition(0, y);
            return;
        }
        if (kind === 'revive' && view.tertiary) {
            view.primary.setPosition(245, y);
            view.tertiary.setPosition(0, y);
            view.secondary.setPosition(-245, y);
            return;
        }
        view.primary.setPosition(133, y);
        view.secondary.setPosition(-145, y);
    }

    private _setWinStars(stars: number): void {
        const starNode = this._popupWinResult.root.getChildByName('StarNode');
        if (!starNode) return;
        starNode.active = stars > 0;
        for (let i = 0; i < starNode.childrenCount; i++) starNode.children[i].active = i < stars;
    }

    private _setWinDiamondReward(amount: number): void {
        const visible = amount > 0;
        if (this._winDiamondBox) this._winDiamondBox.active = visible;
        if (this._winDiamondLabel) {
            this._winDiamondLabel.node.active = visible;
            if (visible) this._winDiamondLabel.string = `本局获得钻石：${amount}`;
        }
    }

    private _drawBattle(): void {
        this._renderTileViews();
        this._renderAnalysisFrame();
        this._renderEntityViews();
        this._renderEffectViews();
    }

    private _renderAnalysisFrame(): void {
        if (!this._analysisFrame || !this._level) return;
        if (this._over) {
            this._analysisFrame.node.active = false;
            return;
        }
        const cells = this._analysisCells();
        if (!cells.length) {
            this._analysisFrame.node.active = false;
            return;
        }
        let minX = cells[0].x;
        let maxX = cells[0].x;
        let minY = cells[0].y;
        let maxY = cells[0].y;
        for (let i = 1; i < cells.length; i++) {
            minX = Math.min(minX, cells[i].x);
            maxX = Math.max(maxX, cells[i].x);
            minY = Math.min(minY, cells[i].y);
            maxY = Math.max(maxY, cells[i].y);
        }
        const topLeft = this._gridToLocal(minX, minY);
        const bottomRight = this._gridToLocal(maxX + 1, maxY + 1);
        const width = Math.max(0, bottomRight.x - topLeft.x);
        const height = Math.max(0, topLeft.y - bottomRight.y);
        if (width <= 0 || height <= 0) {
            this._analysisFrame.node.active = false;
            return;
        }
        this._analysisFrame.clear();
        this._analysisFrame.lineWidth = Math.max(3, this._cellSize * 0.08);
        this._analysisFrame.strokeColor = cc.color(54, 232, 105, 255);
        this._analysisFrame.rect(topLeft.x, bottomRight.y, width, height);
        this._analysisFrame.stroke();
        this._analysisFrame.node.active = true;
    }

    private _renderTileViews(): void {
        const firstX = Math.max(0, Math.floor(this._cameraX) - 1);
        const firstY = Math.max(0, Math.floor(this._cameraY) - 1);
        const lastX = Math.min(this._level.map_width_grid - 1, Math.ceil(this._cameraX + this._viewportWidthGrid) + 1);
        const lastY = Math.min(this._level.map_height_grid - 1, Math.ceil(this._cameraY + this._viewportHeightGrid) + 1);
        const preview: { [key: string]: boolean } = {};
        if (this._analysisHolding) this._analysisCells().forEach((point) => { preview[this._key(point.x, point.y)] = true; });
        let viewIndex = 0;

        for (let y = firstY; y <= lastY; y++) {
            for (let x = firstX; x <= lastX; x++) {
                const view = this._tileView(viewIndex++);
                const key = this._key(x, y);
                const revealed = this._revealed[y][x];
                const blocked = !!this._blocked[key];
                const local = this._gridToLocal(x + 0.5, y + 0.5);
                let shakeX = 0;
                let shakeY = 0;
                const isAnalysisPreview = preview[key] && !revealed && !blocked;
                if (isAnalysisPreview) {
                    const wave = this._elapsed * ARCANE_GLOBAL_CONFIG.analysis_preview_shake_frequency_hz + x * 1.7 + y * 2.3;
                    shakeX = Math.sin(wave) * ARCANE_GLOBAL_CONFIG.analysis_preview_shake_amplitude_px;
                    shakeY = Math.cos(wave * 0.9) * ARCANE_GLOBAL_CONFIG.analysis_preview_shake_amplitude_px;
                }
                view.node.setPosition(local.x + shakeX, local.y + shakeY);
                const isExit = !this._isTreasureMode && this._level.exit_point
                    && x === this._level.exit_point.x && y === this._level.exit_point.y;
                let overlayState = '';
                // A triggered seal becomes the monster's spawn tile.  Keep its
                // explored-floor surface visible; the monster itself is enough
                // of a warning, while red is reserved for the exit marker.
                if (revealed && isExit) overlayState = 'Exit';
                const showRune = revealed && !blocked && !this._brokenSeals[key] && !isExit;
                const runeCount = showRune ? this._hiddenSealCountAround(x, y) : 0;
                const renderKey = key + '|' + (blocked ? 'b' : revealed ? 'r' : 'h')
                    + '|' + (isAnalysisPreview ? 'p' : '') + '|' + overlayState + '|' + runeCount
                    + '|' + Math.round(this._cellSize) + '|' + this._tilePaletteVersion;
                if (view.renderKey !== renderKey) {
                    view.renderKey = renderKey;
                    view.node.setContentSize(this._cellSize, this._cellSize);
                    this._resizeTileSprite(view.overlay);
                    this._resizeRuneLabel(view.runeLabel);
                    this._renderTileSurface(view, blocked, revealed, isAnalysisPreview, (x + y) % 2 === 1);
                    if (overlayState) this._applyPaletteSprite(view.overlay, this._tilePalette.getChildByName(overlayState));
                    else view.overlay.node.active = false;

                    if (showRune && runeCount > 0) {
                    const runePalette = this._tilePalette.getChildByName('RunePalette');
                    const runeSource = runePalette ? runePalette.getChildByName('Rune' + runeCount) : null;
                    const hasRuneArt = this._applyPaletteSprite(view.rune, runeSource, false);
                    view.rune.node.active = hasRuneArt;
                    view.runeLabel.node.active = !hasRuneArt;
                    view.runeLabel.string = String(runeCount);
                    view.runeLabel.node.color = this._runeColor(runeCount);
                    } else {
                        view.rune.node.active = false;
                        view.runeLabel.node.active = false;
                    }
                }
                view.node.active = true;
            }
        }
        for (let i = viewIndex; i < this._tileViews.length; i++) this._tileViews[i].node.active = false;
        this._renderExitDirection();
    }

    private _tileView(index: number): TileView {
        if (this._tileViews[index]) return this._tileViews[index];
        const node = cc.instantiate(this._tileTemplate);
        node.name = 'Tile_' + index;
        node.parent = this._tileRoot;
        node.active = true;
        const borderNode = node.getChildByName('BorderSprite');
        const baseNode = node.getChildByName('BaseSprite');
        const overlayNode = node.getChildByName('OverlaySprite');
        const runeNode = node.getChildByName('RuneSprite');
        const runeLabelNode = node.getChildByName('RuneLabel');
        const view: TileView = {
            node,
            border: borderNode.getComponent(cc.Sprite),
            base: baseNode.getComponent(cc.Sprite),
            overlay: overlayNode.getComponent(cc.Sprite),
            rune: runeNode.getComponent(cc.Sprite),
            runeLabel: runeLabelNode.getComponent(cc.Label),
            renderKey: ''
        };
        this._tileViews.push(view);
        return view;
    }

    private _renderTileSurface(view: TileView, blocked: boolean, revealed: boolean,
        preview: boolean, alternate: boolean): void {
        const paletteName = blocked ? 'Blocked' : preview ? 'Preview'
            : revealed ? (alternate ? 'RevealedB' : 'RevealedA')
                : (alternate ? 'UnknownB' : 'UnknownA');
        const paletteNode = this._tilePalette ? this._tilePalette.getChildByName(paletteName) : null;
        const paletteSprite = paletteNode ? paletteNode.getComponent(cc.Sprite) : null;
        if (paletteSprite && paletteSprite.spriteFrame) {
            view.border.spriteFrame = paletteSprite.spriteFrame;
            view.border.sizeMode = cc.Sprite.SizeMode.CUSTOM;
            view.border.node.setContentSize(this._cellSize, this._cellSize);
            view.border.node.color = blocked ? cc.color(97, 115, 150, 255) : cc.color(255, 255, 255, 255);
            view.border.node.opacity = 255;
            view.border.node.active = true;
            view.base.node.active = false;
            return;
        }

        const borderSize = Math.max(2, this._cellSize - 2);
        const fillSize = Math.max(2, this._cellSize - 5);
        this._resizeTileSprite(view.border, borderSize);
        this._resizeTileSprite(view.base, fillSize);
        view.border.node.active = true;
        view.base.node.active = true;
        if (blocked) {
            view.border.node.color = cc.color(97, 115, 150, 255);
            view.base.node.color = cc.color(97, 115, 150, 255);
            return;
        }
        if (preview) {
            view.border.node.color = cc.color(89, 212, 179, 255);
            view.base.node.color = cc.color(23, 61, 57, 255);
            return;
        }
        if (revealed) {
            view.border.node.color = cc.color(70, 91, 89, 255);
            view.base.node.color = alternate ? cc.color(38, 54, 56, 255) : cc.color(43, 59, 61, 255);
            return;
        }
        view.border.node.color = cc.color(28, 39, 40, 255);
        view.base.node.color = cc.color(7, 10, 11, 255);
    }

    private _resizeTileSprite(sprite: cc.Sprite, size: number = this._cellSize): void {
        if (!sprite) return;
        sprite.sizeMode = cc.Sprite.SizeMode.CUSTOM;
        sprite.node.setContentSize(size, size);
    }

    private _resizeRuneLabel(label: cc.Label): void {
        if (!label) return;
        const fontSize = Math.max(18, Math.floor(this._cellSize * 0.55));
        // Tile nodes are cloned at runtime, so enforce the bold face here instead
        // of relying only on the serialized Label style flags in the scene.
        (label as any)._styleFlags = 1;
        label.fontFamily = 'Arial Black';
        label.fontSize = fontSize;
        label.lineHeight = fontSize + 6;
        label.node.setContentSize(this._cellSize, this._cellSize);
        const outline = label.node.getComponent(cc.LabelOutline);
        if (outline) {
            outline.color = cc.color(0, 0, 0, 255);
            outline.width = Math.max(2, Math.round(this._cellSize * 0.04));
        }
    }

    private _applyPaletteSprite(target: cc.Sprite, sourceNode: cc.Node, activate: boolean = true): boolean {
        const source = sourceNode ? sourceNode.getComponent(cc.Sprite) : null;
        if (!target || !source || !source.spriteFrame) {
            if (target) target.node.active = false;
            return false;
        }
        target.spriteFrame = source.spriteFrame;
        const sourceColor = sourceNode.color;
        target.node.color = cc.color(sourceColor.getR(), sourceColor.getG(), sourceColor.getB(), 255);
        target.node.opacity = Math.round(sourceNode.opacity * sourceColor.getA() / 255);
        target.node.active = activate;
        return true;
    }

    private _loadSelectedRoleArt(): void {
        this._selectedRoleNo = Math.max(1, Math.min(5, Math.floor((mGameData.currentRole || 0) + 1)));
        const roleNo = this._selectedRoleNo;
        const rolePath = '3game/renwu' + roleNo;
        this._heroAnimationReady = false;
        this._heroSprite.node.active = false;
        this._heroMarker.node.active = false;
        const initialDirection = this._directionFromVector(this._lastMoveX, this._lastMoveY, 'right');
        const directions: FacingDirection[] = ['down', 'left', 'right', 'up'];
        // 进入地图时一次性准备四向帧，避免第一次转向时才触发资源加载。
        directions.forEach((direction) => {
            this._requestAnimationFrames('role', roleNo, direction, (frames) => {
                // 先显示默认朝向，其他三个方向在后台完成缓存。
                if (direction !== initialDirection || this._heroAnimationReady
                    || !this._heroSprite || !this._heroSprite.node.isValid) return;
                if (!frames.length) {
                    cc.loader.loadRes(rolePath, cc.SpriteFrame, (fallbackErr: Error, fallback: cc.SpriteFrame) => {
                        if (!this._heroSprite || !this._heroSprite.node.isValid) return;
                        if (fallbackErr || !fallback) {
                            this._heroAnimationReady = !!this._heroSprite.spriteFrame;
                            return;
                        }
                        this._heroSprite.spriteFrame = fallback;
                        this._heroAnimationReady = true;
                    });
                    return;
                }
                this._heroAnimationReady = true;
                this._heroAnimKey = 'role/' + roleNo + '/' + initialDirection;
                this._heroAnimIndex = 0;
                this._heroAnimElapsed = 0;
                this._heroSprite.spriteFrame = frames[0];
                this._heroSprite.node.color = cc.Color.WHITE;
                this._heroSprite.node.opacity = 255;
            });
        });

        const tileFrameNames: { [name: string]: number } = {
            UnknownA: 1,
            UnknownB: 1,
            RevealedA: 2,
            RevealedB: 2,
            Blocked: 2,
            Preview: 3,
            TutorialTarget: 3
        };
        Object.keys(tileFrameNames).forEach((paletteName) => {
            const frameNo = tileFrameNames[paletteName];
            const path = '3game/map/' + roleNo + '/fangge' + frameNo;
            cc.loader.loadRes(path, cc.SpriteFrame, (err: Error, spriteFrame: cc.SpriteFrame) => {
                if (err || !spriteFrame || !this.node || !this.node.isValid) return;
                const paletteNode = this._tilePalette.getChildByName(paletteName);
                const paletteSprite = paletteNode ? paletteNode.getComponent(cc.Sprite) : null;
                if (!paletteSprite) return;
                paletteSprite.spriteFrame = spriteFrame;
                paletteNode.color = cc.Color.WHITE;
                paletteNode.opacity = 255;
                this._tilePaletteVersion++;
            });
        });
    }

    private _requestAnimationFrames(
        kind: 'role' | 'monster',
        number: number,
        direction: FacingDirection,
        callback: (frames: cc.SpriteFrame[]) => void
    ): void {
        const key = kind + '/' + number + '/' + direction;
        const cached = this._animFrameCache[key];
        if (cached) {
            callback(cached);
            return;
        }
        if (!this._animFrameCallbacks[key]) this._animFrameCallbacks[key] = [];
        this._animFrameCallbacks[key].push(callback);
        if (this._animFrameLoading[key]) return;
        this._animFrameLoading[key] = true;
        cc.loader.loadResDir('Anim/' + kind + '/' + number + '/' + direction, cc.SpriteFrame,
            (err: Error, frames: cc.SpriteFrame[]) => {
                this._animFrameLoading[key] = false;
                const sorted = err || !frames ? [] : frames.slice().sort((a, b) => {
                    const aMatch = String((a as any).name || '').match(/(\d+)(?!.*\d)/);
                    const bMatch = String((b as any).name || '').match(/(\d+)(?!.*\d)/);
                    return Number(aMatch ? aMatch[1] : 0) - Number(bMatch ? bMatch[1] : 0);
                });
                this._animFrameCache[key] = sorted;
                const callbacks = this._animFrameCallbacks[key] || [];
                delete this._animFrameCallbacks[key];
                callbacks.forEach((item) => item(sorted));
            });
    }

    private _directionFromVector(x: number, y: number, fallback: FacingDirection): FacingDirection {
        if (Math.abs(x) < 0.01 && Math.abs(y) < 0.01) return fallback;
        if (Math.abs(x) >= Math.abs(y)) return x < 0 ? 'left' : 'right';
        return y > 0 ? 'down' : 'up';
    }

    private _advanceEntityAnimations(dt: number): void {
        const frameDuration = Math.max(0.01, this._animationFrameDuration);
        if (this._heroSprite) {
            const direction = this._directionFromVector(this._lastMoveX, this._lastMoveY, 'right');
            this._requestAnimationFrames('role', this._selectedRoleNo, direction, (frames) => {
                if (!frames.length || !this._heroSprite || !this._heroSprite.node.isValid) return;
                const key = 'role/' + this._selectedRoleNo + '/' + direction;
                if (this._heroAnimKey !== key) {
                    this._heroAnimKey = key;
                    this._heroAnimIndex = 0;
                    this._heroAnimElapsed = 0;
                    this._heroSprite.spriteFrame = frames[0];
                }
            });
            if ((this._heroActuallyMoving || this._playAnimationWhenIdle) && this._heroAnimKey) {
                const frames = this._animFrameCache[this._heroAnimKey] || [];
                this._heroAnimElapsed += dt;
                while (frames.length && this._heroAnimElapsed >= frameDuration) {
                    this._heroAnimElapsed -= frameDuration;
                    this._heroAnimIndex = (this._heroAnimIndex + 1) % frames.length;
                    this._heroSprite.spriteFrame = frames[this._heroAnimIndex];
                }
            }
        }
        for (let i = 0; i < this._monsterViews.length; i++) {
            const view = this._monsterViews[i];
            const monster = this._monsters[i];
            if (!view || !monster || !monster.moving || !view.node.active || !view.frames.length) continue;
            view.frameElapsed += dt;
            while (view.frameElapsed >= frameDuration) {
                view.frameElapsed -= frameDuration;
                view.frameIndex = (view.frameIndex + 1) % view.frames.length;
                view.sprite.spriteFrame = view.frames[view.frameIndex];
            }
        }
    }

    private _renderExitDirection(): void {
        const container = this._arrowIcon.parent;
        if (this._isTreasureMode || !this._level.exit_point) {
            container.active = false;
            return;
        }
        container.active = true;
        const exitCenterX = this._level.exit_point.x + 0.5;
        const exitCenterY = this._level.exit_point.y + 0.5;
        const dx = exitCenterX - this._playerX;
        const dy = exitCenterY - this._playerY;
        const distance = Math.max(1, Math.round(Math.sqrt(dx * dx + dy * dy)));
        this._arrowIcon.angle = Math.atan2(-dy, dx) * 180 / Math.PI;
        const visible = exitCenterX >= this._cameraX && exitCenterX <= this._cameraX + this._viewportWidthGrid
            && exitCenterY >= this._cameraY && exitCenterY <= this._cameraY + this._viewportHeightGrid;
        if (visible) {
            this._arrowLabel.string = this._revealed[this._level.exit_point.y][this._level.exit_point.x]
                ? '出口已解析'
                : '出口就在视野内';
            return;
        }
        this._arrowLabel.string = '出口方向  ' + distance + ' 格';
    }

    private _drawExitArrow(): void {
        const graphics = this._arrowGraphics;
        graphics.clear();
        graphics.fillColor = cc.color(236, 190, 70, 255);
        graphics.strokeColor = cc.color(38, 30, 14, 255);
        graphics.lineWidth = 2.5;
        graphics.moveTo(-17, -5);
        graphics.lineTo(3, -5);
        graphics.lineTo(3, -13);
        graphics.lineTo(18, 0);
        graphics.lineTo(3, 13);
        graphics.lineTo(3, 5);
        graphics.lineTo(-17, 5);
        graphics.close();
        graphics.fill();
        graphics.stroke();
    }

    private _renderEntityViews(): void {
        const heroLocal = this._gridToLocal(this._playerX, this._playerY);
        const heroDiameter = this._playerHalfExtentGrid() * 2 * this._cellSize;
        this._heroNode.active = true;
        this._heroNode.setPosition(heroLocal);
        this._heroNode.setContentSize(heroDiameter, heroDiameter);
        if (this._heroAnimationReady && this._heroSprite && this._heroSprite.spriteFrame) {
            this._heroSprite.node.active = true;
            this._heroSprite.sizeMode = cc.Sprite.SizeMode.CUSTOM;
            const artSize = this._heroSprite.spriteFrame.getOriginalSize();
            this._heroSprite.node.setContentSize(artSize.width, artSize.height);
            this._heroSprite.node.setPosition(0, 0);
            // Each direction has its own authored frames; do not mirror them.
            this._heroSprite.node.scaleX = 1;
            this._heroMarker.node.active = false;
        } else {
            this._heroSprite.node.active = false;
            this._heroMarker.node.active = false;
        }
        if (this._heroMarker.node.active && Math.abs(this._heroMarker.node.width - heroDiameter) >= 0.01) {
            this._heroMarker.node.setContentSize(heroDiameter, heroDiameter);
            this._heroMarker.clear();
            this._heroMarker.fillColor = cc.color(255, 48, 48, 230);
            this._heroMarker.strokeColor = cc.color(255, 208, 94, 255);
            this._heroMarker.lineWidth = Math.max(2, this._cellSize * 0.06);
            this._heroMarker.rect(-heroDiameter / 2, -heroDiameter / 2, heroDiameter, heroDiameter);
            this._heroMarker.fill();
            this._heroMarker.stroke();
        }

        for (let i = 0; i < this._monsters.length; i++) {
            const monster = this._monsters[i];
            const view = this._monsterView(i);
            const size = monster.cfg.body_size_grid;
            const local = this._gridToLocal(monster.x + size / 2, monster.y + size / 2);
            const pixelSize = size * this._cellSize;
            const monsterNo = Number(monster.cfg.entity_id.replace(/^M0*/, ''));
            const animationKey = 'monster/' + monsterNo + '/' + monster.facing;
            let hasArt = false;
            if (monsterNo >= 1 && monsterNo <= 4) {
                if (view.frameKey !== animationKey) {
                    view.frameKey = animationKey;
                    view.frames = [];
                    view.frameIndex = 0;
                    view.frameElapsed = 0;
                    this._requestAnimationFrames('monster', monsterNo, monster.facing, (frames) => {
                        if (!view.node.isValid || view.frameKey !== animationKey) return;
                        view.frames = frames;
                        view.frameIndex = 0;
                        view.frameElapsed = 0;
                        if (frames.length) {
                            view.sprite.node.color = cc.Color.WHITE;
                            view.sprite.node.opacity = 255;
                            view.sprite.spriteFrame = frames[0];
                        }
                    });
                }
                hasArt = view.frames.length > 0;
            } else {
                view.frames = [];
                view.frameKey = '';
            }
            if (!hasArt) {
                const source = this._monsterPalette.getChildByName(monster.cfg.entity_id);
                hasArt = this._applyPaletteSprite(view.sprite, source);
            }
            view.node.active = true;
            view.node.setPosition(local);
            view.node.setContentSize(pixelSize, pixelSize);
            view.sprite.sizeMode = cc.Sprite.SizeMode.CUSTOM;
            view.sprite.node.setContentSize(pixelSize, pixelSize);
            view.countdown.node.active = false;
            view.node.active = hasArt;
        }
        for (let i = this._monsters.length; i < this._monsterViews.length; i++) this._monsterViews[i].node.active = false;
    }

    private _monsterView(index: number): EntityView {
        if (this._monsterViews[index]) return this._monsterViews[index];
        const node = cc.instantiate(this._monsterTemplate);
        node.name = 'Monster_' + index;
        node.parent = this._monsterRoot;
        node.active = true;
        const view: EntityView = {
            node,
            sprite: node.getChildByName('MonsterSprite').getComponent(cc.Sprite),
            countdown: node.getChildByName('CountdownLabel').getComponent(cc.Label),
            frames: [],
            frameKey: '',
            frameIndex: 0,
            frameElapsed: 0
        };
        this._monsterViews.push(view);
        return view;
    }

    private _renderEffectViews(): void {
        let viewIndex = 0;
        for (let i = 0; i < this._effects.length; i++) {
            const effect = this._effects[i];
            const sprite = this._effectView(viewIndex++);
            const local = this._gridToLocal(effect.x, effect.y);
            const progress = 1 - effect.life / effect.maxLife;
            const sourceName = effect.kind === 'burst' ? 'Burst' : (effect.kind === 'fade' ? 'Fade' : 'Ring');
            this._applyPaletteSprite(sprite, this._effectPalette.getChildByName(sourceName));
            sprite.node.setPosition(local);
            sprite.node.color = effect.color.clone().setA(255);
            sprite.node.opacity = Math.max(0, Math.round(220 * (1 - progress)));
            const startSize = effect.kind === 'fade' ? 42 : 28;
            const endSize = effect.kind === 'fade' ? 126 : 96;
            const pixelSize = startSize + (endSize - startSize) * progress;
            sprite.sizeMode = cc.Sprite.SizeMode.CUSTOM;
            sprite.node.setContentSize(pixelSize, pixelSize);
            sprite.node.angle = effect.kind === 'burst' ? progress * 90 : 0;
            sprite.node.active = true;
        }
        for (let i = viewIndex; i < this._effectViews.length; i++) this._effectViews[i].node.active = false;
    }

    private _effectView(index: number): cc.Sprite {
        if (this._effectViews[index]) return this._effectViews[index];
        const node = cc.instantiate(this._effectTemplate);
        node.name = 'Effect_' + index;
        node.parent = this._effectRoot;
        node.active = true;
        const sprite = node.getChildByName('EffectSprite').getComponent(cc.Sprite);
        this._effectViews.push(sprite);
        return sprite;
    }

    private _fitSpriteInside(sprite: cc.Sprite, width: number, height: number, padding: number): void {
        if (!sprite || !sprite.spriteFrame) return;
        const original = sprite.spriteFrame.getOriginalSize();
        const sourceWidth = Math.max(1, original.width);
        const sourceHeight = Math.max(1, original.height);
        const scale = Math.min(width * padding / sourceWidth, height * padding / sourceHeight);
        sprite.sizeMode = cc.Sprite.SizeMode.CUSTOM;
        sprite.node.setContentSize(sourceWidth * scale, sourceHeight * scale);
    }

    private _updateEffects(dt: number): void {
        for (let i = this._effects.length - 1; i >= 0; i--) {
            this._effects[i].life -= dt;
            if (this._effects[i].life <= 0) this._effects.splice(i, 1);
        }
    }

    private _updateCamera(immediate: boolean, dt: number = 1 / 60): void {
        const maxX = Math.max(0, this._level.map_width_grid - this._viewportWidthGrid);
        const maxY = Math.max(0, this._level.map_height_grid - this._viewportHeightGrid);
        const targetX = this._clamp(this._playerX - this._viewportWidthGrid / 2, 0, maxX);
        const targetY = this._clamp(this._playerY - this._viewportHeightGrid / 2, 0, maxY);
        if (immediate) {
            this._cameraX = targetX;
            this._cameraY = targetY;
            return;
        }
        const baseFollow = this._clamp(ARCANE_GLOBAL_CONFIG.camera_follow_lerp, 0, 0.9999);
        const frameScale = Math.max(0, Math.min(0.25, dt || 0)) * 60;
        const follow = 1 - Math.pow(1 - baseFollow, frameScale);
        this._cameraX += (targetX - this._cameraX) * follow;
        this._cameraY += (targetY - this._cameraY) * follow;
    }

    private _syncViewportMetrics(force: boolean): boolean {
        const canvasSize = this.node.getContentSize();
        const viewSize = cc.view && cc.view.getVisibleSize ? cc.view.getVisibleSize() : null;
        let width = canvasSize.width;
        let height = canvasSize.height;
        if (viewSize && viewSize.width > 0 && viewSize.height > 0) {
            // Always use the current visible viewport so both wide and narrow
            // landscape devices render the world edge-to-edge.
            width = viewSize.width;
            height = viewSize.height;
        }
        width = Math.max(1, width);
        height = Math.max(1, height);
        if (!force && Math.abs(width - this._visibleWidth) < 0.5 && Math.abs(height - this._visibleHeight) < 0.5) return false;

        this._visibleWidth = width;
        this._visibleHeight = height;
        this._viewportHeightGrid = ARCANE_GLOBAL_CONFIG.viewport_height_grid;
        this._cellSize = this._visibleHeight / this._viewportHeightGrid;
        this._viewportWidthGrid = this._visibleWidth / this._cellSize;
        return true;
    }

    private _updateHud(): void {
        if (!this._hudDirty && this._hudRefreshRemaining > 0) return;
        this._hudDirty = false;
        this._hudRefreshRemaining = 0.1;
        this._updateStarDisplay();
        if (this._isTreasureMode) {
            const remainingMonsters = this._seals.filter((seal) => !seal.awakened).length;
            this._statusLabel.string = '剩余解析次数：' + this._analysisRemaining
                + '\n剩余怪物数量：' + remainingMonsters;
            this._statusPanel.active = true;
            this._statusLabel.node.setContentSize(490, 58);
            this._statusLabel.fontSize = 24;
            this._statusLabel.lineHeight = 28;
            this._statusLabel.horizontalAlign = cc.Label.HorizontalAlign.CENTER;
            this._statusLabel.verticalAlign = cc.Label.VerticalAlign.CENTER;
            this._statusLabel.overflow = cc.Label.Overflow.NONE;
        } else {
            this._exploreLabel.node.active = false;
        }

        const canAnalyze = this._canAnalyze();
        if (this._analysisHolding) {
            this._analysisLabel.string = this._analysisReleasePending
                ? '解析中'
                : (this._isTreasureMode
                    ? '松开解析 ' + this._analysisRemaining + '/' + (this._level.analysis_limit_count || 0)
                    : '松开解析');
            this._analysisStateLabel.string = '预览 5×5';
        } else {
            this._analysisLabel.string = this._isTreasureMode
                ? '解析 ' + this._analysisRemaining + '/' + (this._level.analysis_limit_count || 0)
                : '按住解析';
            this._analysisStateLabel.string = this._analysisCooldown > 0
                ? this._analysisCooldown.toFixed(1) + 's'
                : (canAnalyze ? (this._isTreasureMode ? '寻找全部魔物' : '就绪')
                    : (this._isTreasureMode && this._analysisRemaining <= 0 ? '次数耗尽' : '移动选位'));
        }
        const button = this._analysisButton.getComponent(cc.Button);
        if (button) button.interactable = canAnalyze || this._analysisHolding;
        if (!this._analysisHolding) this._styleButton(this._analysisButton, canAnalyze ? 'primary' : 'disabled');

        if (this._tutorialStep === 101) this._hintLabel.string = '按住右侧解析按钮，松开后翻开中心 5×5';
        else if (this._tutorialStep === 102) this._hintLabel.string = '使用左侧摇杆，在已解析地砖上移动';
        else this._hintLabel.string = '';
    }

    private _exploredPercent(): number {
        let total = 0;
        let revealed = 0;
        for (let y = 0; y < this._level.map_height_grid; y++) {
            for (let x = 0; x < this._level.map_width_grid; x++) {
                if (this._blocked[this._key(x, y)]) continue;
                total++;
                if (this._revealed[y][x]) revealed++;
            }
        }
        return total > 0 ? Math.round(revealed / total * 100) : 0;
    }

    private _hiddenSealCountAround(x: number, y: number): number {
        let count = 0;
        for (let i = 0; i < this._seals.length; i++) {
            const seal = this._seals[i];
            if (seal.awakened) continue;
            if (Math.abs(seal.x - x) <= 1 && Math.abs(seal.y - y) <= 1 && !(seal.x === x && seal.y === y)) count++;
        }
        return count;
    }

    private _runeColor(count: number): cc.Color {
        return cc.color(24, 193, 255, 255);
    }

    private _styleStatusLabel(): void {
        this._statusLabel.node.color = cc.color(240, 192, 90, 255);
        this._statusLabel.fontSize = 26;
        this._statusLabel.lineHeight = 32;
        const outline = this._statusLabel.node.getComponent(cc.LabelOutline);
        if (outline) {
            outline.color = cc.color(0, 0, 0, 255);
            outline.width = 3;
        }
    }

    private _onJoystickTouch(event: cc.Event.EventTouch): void {
        if (this._paused || this._over) return;
        const touchId = this._touchId(event);
        if (this._joystickTouchId < 0) this._joystickTouchId = touchId;
        if (touchId !== this._joystickTouchId) return;
        const local = this._joystickNode.convertToNodeSpaceAR(event.getLocation());
        const length = Math.sqrt(local.x * local.x + local.y * local.y);
        const radius = 52;
        const scale = length > radius ? radius / length : 1;
        const x = local.x * scale;
        const y = local.y * scale;
        this._joystickKnob.setPosition(x, y);
        const deadZone = 8;
        if (length <= deadZone) {
            this._moveInputX = 0;
            this._moveInputY = 0;
            return;
        }
        this._moveInputX = local.x / length;
        this._moveInputY = -local.y / length;
    }

    private _onJoystickEnd(event?: cc.Event.EventTouch): void {
        const touchId = this._touchId(event);
        if (event && this._joystickTouchId >= 0 && touchId !== this._joystickTouchId) return;
        this._joystickTouchId = -1;
        this._moveInputX = 0;
        this._moveInputY = 0;
        this._joystickKnob.setPosition(0, 0);
    }

    private _onGuideDirectionTap(event?: cc.Event.EventTouch): void {
        if (event) event.stopPropagation();
        if (this._paused || this._over || this._tutorialStep !== 101) return;
        this._tutorialStep = 102;
        this._setGuideStep(102);
    }

    private _onGuideAnalysisTap(event?: cc.Event.EventTouch): void {
        if (event) event.stopPropagation();
        if (this._paused || this._over || this._tutorialStep !== 102) return;
        this._completeGuide();
    }

    private _onKeyDown(event: cc.Event.EventKeyboard): void {
        const key = event.keyCode;
        if (key === cc.macro.KEY.a || key === cc.macro.KEY.left) this._keyLeft = true;
        if (key === cc.macro.KEY.d || key === cc.macro.KEY.right) this._keyRight = true;
        if (key === cc.macro.KEY.w || key === cc.macro.KEY.up) this._keyUp = true;
        if (key === cc.macro.KEY.s || key === cc.macro.KEY.down) this._keyDown = true;
        if (key === cc.macro.KEY.space) this._beginAnalysis();
    }

    private _onKeyUp(event: cc.Event.EventKeyboard): void {
        const key = event.keyCode;
        if (key === cc.macro.KEY.a || key === cc.macro.KEY.left) this._keyLeft = false;
        if (key === cc.macro.KEY.d || key === cc.macro.KEY.right) this._keyRight = false;
        if (key === cc.macro.KEY.w || key === cc.macro.KEY.up) this._keyUp = false;
        if (key === cc.macro.KEY.s || key === cc.macro.KEY.down) this._keyDown = false;
        if (key === cc.macro.KEY.space) this._releaseAnalysis();
    }

    private _resetMovement(): void {
        this._joystickTouchId = -1;
        this._moveInputX = 0;
        this._moveInputY = 0;
        this._playerMoving = false;
        this._heroActuallyMoving = false;
        this._keyLeft = false;
        this._keyRight = false;
        this._keyUp = false;
        this._keyDown = false;
        if (this._joystickKnob) this._joystickKnob.setPosition(0, 0);
    }

    private _styleButton(node: cc.Node, kind: string): void {
        if (!node || !node.isValid) return;
        let tint = cc.color(255, 255, 255, 255);
        if (kind === 'primaryPressed') tint = cc.color(210, 240, 232, 255);
        if (kind === 'secondary') tint = cc.color(161, 135, 75, 255);
        if (kind === 'danger') tint = cc.color(163, 72, 62, 255);
        if (kind === 'disabled') tint = cc.color(84, 94, 90, 180);
        const sprite = node.getComponent(cc.Sprite);
        if (sprite) {
            sprite.node.color = cc.color(tint.getR(), tint.getG(), tint.getB(), 255);
            sprite.node.opacity = tint.getA();
        }
        const button = node.getComponent(cc.Button);
        if (button) button.interactable = kind !== 'disabled';
    }

    private _loadEmptyStarFrame(): void {
        cc.loader.loadRes('3game/xingxing2', cc.SpriteFrame, (err: Error, frame: cc.SpriteFrame) => {
            if (err) {
                console.error('[ArcaneWarrior] 加载空星资源失败:', err);
                return;
            }
            this._emptyStarFrame = frame;
            this._updateStarDisplay();
        });
    }

    private _updateStarDisplay(): void {
        if (!this._starSprites.length) return;
        const stars = this._currentStars();
        for (let i = 0; i < this._starSprites.length; i++) {
            const sprite = this._starSprites[i];
            if (!sprite) continue;
            sprite.node.active = true;
            if (i < stars) {
                if (this._starFullFrames[i]) sprite.spriteFrame = this._starFullFrames[i];
            } else if (this._emptyStarFrame) {
                sprite.spriteFrame = this._emptyStarFrame;
            }
        }
    }

    private _currentStars(): number {
        if (this._reviveUsed) return 1;
        return Math.max(1, 3 - Math.min(2, this._spawnedCount));
    }

    private _showToast(message: string): void {
        if (this._isTreasureMode) {
            this._hudDirty = true;
            return;
        }
        this._statusMonster = null;
        this._statusLabel.string = message;
        this._statusPanel.active = true;
        this._toastRemaining = 2.2;
    }

    private _syncGuideLayout(): void {
        if (!this._guideLayer || !this._guideMask || !this._guideNode1 || !this._guideNode2
            || !this._joystickNode || !this._analysisButton) return;

        const canvas = this._guideLayer.parent || this.node;
        const canvasSize = canvas.getContentSize();
        this._guideLayer.setPosition(0, 0);
        this._guideLayer.setContentSize(canvasSize.width, canvasSize.height);
        this._guideMask.setPosition(0, 0);
        this._guideMask.setContentSize(canvasSize.width + 200, canvasSize.height + 200);

        const alignToControl = (guideNode: cc.Node, controlNode: cc.Node): void => {
            const worldPosition = controlNode.convertToWorldSpaceAR(cc.v2(0, 0));
            const localPosition = this._guideLayer.convertToNodeSpaceAR(worldPosition);
            const referencePosition = guideNode === this._guideNode1
                ? this._guideNode1ReferencePosition
                : this._guideNode2ReferencePosition;
            guideNode.setPosition(
                localPosition.x - referencePosition.x,
                localPosition.y - referencePosition.y
            );
        };
        alignToControl(this._guideNode1, this._joystickNode);
        alignToControl(this._guideNode2, this._analysisButton);
    }

    private _setGuideStep(step: number): void {
        if (!this._guideLayer || !this._guideNode1 || !this._guideNode2) return;
        const visible = step === 101 || step === 102;
        this._guideLayer.active = visible;
        if (this._guideMask) this._guideMask.active = visible;
        this._guideNode1.active = step === 101;
        this._guideNode2.active = step === 102;
        [this._guideDirectionHand, this._guideAnalysisHand].forEach((hand) => {
            if (!hand) return;
            hand.stopAllActions();
            hand.scale = 1;
        });
        const activeHand = step === 101 ? this._guideDirectionHand : this._guideAnalysisHand;
        if (activeHand) {
            activeHand.runAction(cc.repeatForever(cc.sequence(
                cc.scaleTo(0.55, 1.14),
                cc.scaleTo(0.55, 1.0)
            )));
        }
    }

    private _completeGuide(): void {
        if (this._tutorialStep === 0) return;
        this._tutorialStep = 0;
        UserDataSyncManager.markNewbieGuideCompleted(this._isTreasureMode ? 'classic' : 'escape');
        this._setGuideStep(0);
    }

    private _showDiscoveryToast(monster: RuntimeMonster): void {
        if (this._isTreasureMode) {
            this._statusMonster = null;
            this._toastRemaining = 0;
            this._hudDirty = true;
            return;
        }
        this._statusMonster = monster || null;
        const name = monster ? monster.cfg.name : '魔影';
        const remain = monster ? this._monsterSurvivalRemaining(monster).toFixed(1) : '0.0';
        this._statusLabel.string = '已发现：' + name + ' ' + remain + '秒';
        this._statusPanel.active = true;
        this._toastRemaining = 0;
    }

    private _monsterSurvivalRemaining(monster: RuntimeMonster): number {
        return Math.max(0, monster.wakeRemaining + monster.lifeRemaining);
    }

    private _ensureInitialDiamonds(): void {
        if (mGameData.GetGoldData) mGameData.GetGoldData();
        const key = this._scopedKey('ArcaneWarriorProfileInitialized');
        if (cc.sys.localStorage.getItem(key) === 'true') return;
        if ((mGameData.currentGold || 0) <= 0) {
            mGameData.currentGold = ARCANE_GLOBAL_CONFIG.initial_diamonds;
            if (mGameData.SaveGoldData) mGameData.SaveGoldData();
            cc.director.emit('goldUpdated');
        }
        cc.sys.localStorage.setItem(key, 'true');
    }

    private _diamonds(): number {
        return Math.max(0, Math.floor(mGameData.currentGold || 0));
    }

    private _spendDiamonds(amount: number): boolean {
        if (this._diamonds() < amount) return false;
        mGameData.currentGold = this._diamonds() - amount;
        if (mGameData.SaveGoldData) mGameData.SaveGoldData();
        cc.director.emit('goldUpdated');
        UserDataSyncManager.requestUpload();
        return true;
    }

    private _scopedKey(baseKey: string): string {
        const userId = cc.sys.localStorage.getItem('SLS_USER_ID');
        return userId ? baseKey + '_' + userId : baseKey;
    }

    private _gridToLocal(gridX: number, gridY: number): cc.Vec2 {
        const boardWidth = this._viewportWidthGrid * this._cellSize;
        const boardHeight = this._viewportHeightGrid * this._cellSize;
        return cc.v2(
            -boardWidth / 2 + (gridX - this._cameraX) * this._cellSize,
            boardHeight / 2 - (gridY - this._cameraY) * this._cellSize
        );
    }

    private _isWalkable(x: number, y: number): boolean {
        return this._inside(x, y) && this._revealed[y][x] && !this._blocked[this._key(x, y)];
    }

    private _inside(x: number, y: number): boolean {
        return x >= 0 && y >= 0 && x < this._level.map_width_grid && y < this._level.map_height_grid;
    }

    private _key(x: number, y: number): string {
        return x + ',' + y;
    }

    private _clamp(value: number, min: number, max: number): number {
        return Math.max(min, Math.min(max, value));
    }

    private _formatTime(seconds: number): string {
        const total = Math.max(0, Math.floor(seconds));
        const minutes = Math.floor(total / 60);
        const remainder = total % 60;
        return (minutes < 10 ? '0' : '') + minutes + ':' + (remainder < 10 ? '0' : '') + remainder;
    }

    private _starsText(count: number): string {
        let text = '';
        for (let i = 0; i < 3; i++) text += i < count ? '★' : '☆';
        return text;
    }

    private _hex(value: string, alpha: number = 255): cc.Color {
        const normalized = value.replace('#', '');
        const parsed = parseInt(normalized, 16);
        return cc.color((parsed >> 16) & 255, (parsed >> 8) & 255, parsed & 255, alpha);
    }
}
