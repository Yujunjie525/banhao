import StateBridge from './StateBridge';
import mGameData from '../Load/GameData';
import warriorRunConfig from './WarriorRunConfig';
import { APP_ID } from '../Common/AppConfig';
import UserDataSyncManager from '../Manager/UserDataSyncManager';
import WarriorRunAssetLoader, { WarriorRunAssets } from './WarriorRunAssetLoader';
import GameState, { getProgress, saveProgress } from './GameState';

const { ccclass, property } = cc._decorator;

type ElementType = 'none' | 'wind' | 'fire' | 'thunder';
type EntityKind = 'target' | 'boss' | 'drop' | 'star';

interface CharacterConfig {
    entity_id: string;
    name: string;
    base_attack: number;
    fire_rate_per_sec: number;
    unlock_cost: number;
    initial_element: ElementType;
    initial_bullet_bonus: number;
    combo_dmg_bonus_per_hit: number;
    boss_damage_multiplier: number;
    element_advantage_bonus: number;
    squad_threshold_offset: number;
}

interface DropPackConfig {
    pack_id: string;
    name: string;
    pack_type: 'element' | 'math_buff' | 'math_debuff';
    element_value: ElementType;
    math_operator: 'none' | 'add' | 'subtract' | 'multiply' | 'divide';
    math_value: number;
}

interface TargetConfig {
    entity_id: string;
    name: string;
    target_type: 'cluster' | 'obstacle';
    cluster_shape: 'square' | 'column' | 'wide' | 'null';
    hp_per_unit: number;
    unit_count: number;
    drop_types: string[];
}

interface BossConfig {
    entity_id: string;
    name: string;
    base_hp: number;
    element_type: ElementType;
    lane_occupy: number;
    shift_interval_sec: number;
    approach_speed_per_sec: number;
}

interface SpawnConfig {
    spawn_distance: number;
    type: 'target' | 'boss';
    entity_id: string;
    lane: number;
    element: ElementType;
    unit_count_multiplier?: number;
}

interface LevelConfig {
    level_id: number;
    base_run_speed: number;
    initial_bullet_count: number;
    boss_hp_multiplier: number;
    duration_sec: number;
    wave_interval_sec: number;
    wave_group_count: number;
    unit_count_multiplier: number;
    enemy_speed_multiplier: number;
    boss_interval_sec: number;
    first_clear_reward: number;
}

interface RunEntity {
    id: string;
    kind: EntityKind;
    node: cc.Node;
    lane: number;
    element: ElementType;
    hp: number;
    maxHp: number;
    targetConfig?: TargetConfig;
    bossConfig?: BossConfig;
    dropConfig?: DropPackConfig;
    hpPerUnit?: number;
    passed?: boolean;
    speedMultiplier?: number;
}

interface FrameAnimationState {
    node: cc.Node;
    key: string;
    frames: cc.SpriteFrame[];
    frameDuration: number;
    elapsed: number;
    frameIndex: number;
}

const RUN_CONFIG = warriorRunConfig;
const DISPLAY_DISTANCE_SCALE = 0.14;


@ccclass
export default class WarriorRunController extends cc.Component {
    @property(cc.AudioClip)
    battleBgm: cc.AudioClip = null;

    @property(cc.AudioClip)
    clickEffect: cc.AudioClip = null;

    private _canvas: cc.Node = null;
    private _gameLayer: cc.Node = null;
    private _uiLayer: cc.Node = null;
    private _popupLayer: cc.Node = null;
    private _sprites: Record<string, cc.SpriteFrame> = {};
    private _animationFrames: Record<string, cc.SpriteFrame[]> = {};
    private _frameAnimations: FrameAnimationState[] = [];
    private _laneXs: number[] = [-180, 0, 180];
    private _viewW: number = 720;
    private _viewH: number = 1280;
    private _topY: number = 640;
    private _bottomY: number = -640;
    private _player: cc.Node = null;
    private _playerLane: number = 1;
    private _playerElement: ElementType = 'wind';
    private _playerRingOffsetY: number = 44;
    private _bulletCount: number = 10;
    private _baseBulletCount: number = 10;
    private _dropPowerGain: number = 0;
    private _character: CharacterConfig = RUN_CONFIG.characters[0];
    private _levelConfig: LevelConfig = null;
    private _nextWaveDistance: number = 120; // 运行时记录下一波小怪的触发距离；调参请改下方 _firstWaveDistance / _waveGap*。
    private _nextBossDistance: number = 1150; // 运行时记录下一个 Boss 的触发距离；调参请改下方 _firstBossDistance / _boss*。
    private _waveIndex: number = 0;
    private _entities: RunEntity[] = [];
    private _distance: number = 0;
    private _runSpeed: number = 95; // 角色跑动速度；所有“距离型刷怪参数”最终都会按这个速度换算成真实等待时间。
    private _fireTimer: number = 0;
    private _entitySeq: number = 0;
    private _lockedId: string = '';
    private _combo: number = 0;
    private _bestCombo: number = 0;
    private _monsterKills: number = 0;
    private _bossKills: number = 0;
    private _bossActive: boolean = false;
    private _rewardGranted: boolean = false;
    private _score: number = 0;
    private _paused: boolean = false;
    private _ended: boolean = false;
    private _reviveUsed: boolean = false;
    private _retrying: boolean = false;
    private _touchStart: cc.Vec2 = null;
    private _scoreLabel: cc.Label = null;
    private _distanceLabel: cc.Label = null;
    private _comboLabel: cc.Label = null;
    private _damageBuffLabel: cc.Label = null;
    private _bulletLabel: cc.Label = null;
    private _levelTimeLabel: cc.Label = null;
    private _elementRing: cc.Node = null;
    private _progressBar: cc.Node = null;
    private _scoreBg: cc.Node = null;
    private _pauseBtn: cc.Node = null;
    private _guideNode: cc.Node = null;
    private _guideStepNode: cc.Node = null;
    private _guideRing: cc.Node = null;
    private _guideCharacter: cc.Node = null;
    private _guideCharacters: cc.Node[] = [];
    private _guideHand: cc.Node = null;
    private _guideActive: boolean = false;
    private _guideCompleting: boolean = false;
    private _guideHandStartPosition: cc.Vec2 = null;
    private _guideHandOffsetFromRing: cc.Vec2 = null;
    private _guideTouchStart: cc.Vec2 = null;
    private _playerUnitCount: number = 0;
    private _lastProgressRatio: number = -1;
    private _solidFrame: cc.SpriteFrame = null;
    private _bulletTrailPool: cc.Node[] = [];
    private _isLevelMode: boolean = false;
    private _levelElapsed: number = 0;
    private _levelVictoryPending: boolean = false;
    private _nextLevelWaveTime: number = 0;
    private _nextLevelBossTime: number = 30;
    private _levelStarSpawnTimes: number[] = [];
    private _levelStarsSpawned: number = 0;
    private _levelStarsCollected: number = 0;

    // 刷怪节奏调参：单位都是“跑动距离”，不是屏幕像素；数值越小，怪物出现越快。
    private readonly _firstWaveDistance: number = 120; // 第一波小怪出现距离，调小会更早遇到怪。
    private readonly _firstBossDistance: number = 1150; // 第一个 Boss 出现距离，调小会更早进入 Boss 节奏。
    private readonly _bossPrepareDistance: number = 150; // 距离 Boss 小于该值时暂停刷小怪，给 Boss 出场留空档。
    private readonly _waveDelayNearBoss: number = 170; // 接近 Boss 或 Boss 存活时，下一波小怪至少推迟这么远。
    private readonly _waveDelayStackNearBoss: number = 190; // 接近 Boss 时每次跳过刷怪额外累加的距离，用于避免小怪挤到 Boss 前。
    private readonly _waveDelayAfterBossSpawn: number = 260; // Boss 刚刷出后，小怪至少延后这么远再刷。
    private readonly _waveDelayAfterBossKill: number = 45; // Boss 被击杀后，小怪最快隔这么远补出来；调小可减少空屏。
    private readonly _bossBaseGap: number = 1450; // Boss 之间的基础距离间隔，调小 Boss 更频繁。
    private readonly _bossMinGap: number = 1100; // Boss 之间的最小距离间隔，防止后期 Boss 过密。
    private readonly _bossGapDecreasePerKill: number = 20; // 每击杀一个 Boss，下一次 Boss 间隔减少多少。
    private readonly _waveGapStart: number = 190; // 普通小怪波次初始间隔，调小小怪更密。
    private readonly _waveGapMin: number = 135; // 普通小怪波次最小间隔，后期不会低于这个值。
    private readonly _waveGapDecreasePerWave: number = 2; // 每刷一波小怪，后续波次间隔减少多少。
    private readonly _waveGapDifficultyDecrease: number = 8; // 难度每提升 1 点时，波次间隔额外减少多少。
    private readonly _difficultyDistanceStep: number = 900; // 跑多远算提升 1 点刷怪难度，调小会更快变密。
    private readonly _wavesPerExtraGroup: number = 7; // 每多少波小怪，单波多刷一路怪。
    private readonly _maxGroupsPerWave: number = 3; // 单波最多同时刷几路怪，最大 3 对应三条跑道。
    private readonly _fireRateScale: number = 0.102; // 当前 0.06 射速提升至 1.7 倍。
    private readonly _endlessBossBalanceFireRateScale: number = 0.06; // 无尽精英血量沿用射速提升前的平衡基准。
    private readonly _endlessBossHpScale: number = 0.5;
    private readonly _levelBossHpMin: number = 500;
    private readonly _levelBossHpMax: number = 1000;
    private readonly _maxVisiblePlayerUnits: number = 16;
    private readonly _playerFormationColumns: number = 4;
    private readonly _playerFormationColumnSpacing: number = 38;
    private readonly _playerFormationRowSpacing: number = 36;
    private readonly _playerCountSceneY: number = -375.75;
    private readonly _targetCollisionY: number = 108;
    private readonly _victoryPopupDelaySec: number = 0.5;

    onLoad() {
        cc.audioEngine.stopMusic();
        if (mGameData.isBGMOn && this.battleBgm) {
            cc.audioEngine.playMusic(this.battleBgm, true);
        }

        StateBridge.syncForStartScene();
        this._canvas = this.node;
        this._prepareGuideBeforeRun();
        this._setupCanvas();
        this._prepareInitialRuntimeNodes();
        this._loadAssets(() => this._startRun());
    }

    private _setupCanvas() {
        const visible = cc.view && cc.view.getVisibleSize ? cc.view.getVisibleSize() : cc.winSize;
        this._viewH = Math.max(1280, Math.floor(visible.height || cc.winSize.height || 1280));
        const visibleW = Math.floor(visible.width || cc.winSize.width || 720);
        this._viewW = Math.max(720, Math.floor(visibleW * this._viewH / Math.max(1, visible.height || cc.winSize.height || 1280)));
        const laneGap = 195;
        this._laneXs = [-laneGap, 0, laneGap];
        this._topY = this._viewH / 2;
        this._bottomY = -this._viewH / 2;
        this._canvas.setContentSize(this._viewW, this._viewH);
        this._canvas.on(cc.Node.EventType.TOUCH_START, this._onTouchStart, this);
        this._canvas.on(cc.Node.EventType.TOUCH_END, this._onTouchEnd, this);
        this._canvas.on(cc.Node.EventType.TOUCH_CANCEL, this._onTouchEnd, this);
        this._canvas.on(cc.Node.EventType.TOUCH_END, this._playButtonClick, this);
    }

    onDestroy() {
        if (this._canvas) {
            this._canvas.off(cc.Node.EventType.TOUCH_END, this._playButtonClick, this);
            this._canvas.off(cc.Node.EventType.TOUCH_END, this._onTouchEnd, this);
            this._canvas.off(cc.Node.EventType.TOUCH_CANCEL, this._onTouchEnd, this);
        }
        cc.audioEngine.stopMusic();
    }

    private _playButtonClick(event: cc.Event.EventTouch) {
        if (!mGameData.isSoundOn || !this.clickEffect) {
            return;
        }

        const target = event && event.target as cc.Node;
        if (target && target !== this._canvas) {
            cc.audioEngine.playEffect(this.clickEffect, false);
        }
    }

    private _prepareGuideBeforeRun() {
        this._guideNode = this._canvas && this._canvas.getChildByName('GuideNode');
        const completed = UserDataSyncManager.hasCompletedWarriorRunGuide();
        if (this._guideNode) {
            this._guideNode.active = !completed;
        }
        this._guideActive = !!this._guideNode && !completed;
        this._paused = this._guideActive;
    }

    private _prepareInitialRuntimeNodes() {
        const gameLayer = this._canvas && this._canvas.getChildByName('GameLayer');
        if (!gameLayer) return;

        const playerY = this._sceneY(-561.893);
        const ringY = this._sceneY(-518);
        const countY = this._sceneY(this._playerCountSceneY);
        const player = gameLayer.getChildByName('Player');
        const ring = gameLayer.getChildByName('PlayerElement');
        const count = gameLayer.getChildByName('BulletCount');

        if (player) {
            this._disableWidget(player);
            player.stopAllActions();
            player.setPosition(this._laneXs[this._playerLane], playerY);
            player.active = false;
        }
        if (ring) {
            this._disableWidget(ring);
            ring.stopAllActions();
            ring.setPosition(this._laneXs[this._playerLane], ringY);
            ring.active = false;
        }
        if (count) {
            this._disableWidget(count);
            count.stopAllActions();
            count.setPosition(this._laneXs[this._playerLane], countY);
            count.active = false;
        }
    }

    private _loadAssets(done: () => void) {
        WarriorRunAssetLoader.preload((assets: WarriorRunAssets) => {
            this._sprites = assets.sprites;
            this._animationFrames = assets.animationFrames;
            done();
        });
    }

    private _startRun() {
        if (mGameData && mGameData.GetCurrentRoleData) mGameData.GetCurrentRoleData();
        if (mGameData && mGameData.GetLevelData) mGameData.GetLevelData();
        this._character = this._getSelectedCharacter();
        this._isLevelMode = !mGameData.isInfiniteMode;
        const selectedLevel = this._isLevelMode
            ? Math.max(1, Math.min(RUN_CONFIG.levels.length, Math.floor(Number(mGameData.currentLevel || GameState.selectedLevel) || 1)))
            : 1;
        GameState.selectedLevel = selectedLevel;
        this._levelConfig = RUN_CONFIG.levels[selectedLevel - 1] || RUN_CONFIG.levels[0];
        this._runSpeed = this._levelConfig.base_run_speed;
        this._bulletCount = this._isLevelMode
            ? Math.max(1, Math.floor(this._levelConfig.initial_bullet_count))
            : 1;
        this._baseBulletCount = this._bulletCount;
        this._dropPowerGain = 0;
        this._playerElement = this._character.initial_element || 'wind';
        this._nextWaveDistance = this._firstWaveDistance;
        this._nextBossDistance = this._firstBossDistance;
        this._waveIndex = 0;
        this._playerUnitCount = 0;
        this._levelElapsed = 0;
        this._nextLevelWaveTime = this._levelConfig.wave_interval_sec;
        this._nextLevelBossTime = this._levelConfig.boss_interval_sec;
        this._levelStarsSpawned = 0;
        this._levelStarsCollected = 0;
        this._levelStarSpawnTimes = [
            10 + Math.random() * 20,
            45 + Math.random() * 20,
            80 + Math.random() * 20,
        ];
        this._buildScene();
        this._refreshHud();
        this._startGuideIfNeeded();
    }

    private _startGuideIfNeeded() {
        if (!this._guideActive || !this._guideNode) return;

        this._guideStepNode = this._guideNode.getChildByName('node1');
        this._guideRing = this._guideStepNode && this._guideStepNode.getChildByName('fazhen1');
        this._guideCharacter = this._guideStepNode && this._guideStepNode.getChildByName('juese1');
        this._guideHand = this._guideStepNode && this._guideStepNode.getChildByName('shouzhi');
        if (!this._guideStepNode || !this._guideRing || !this._guideCharacter || !this._guideHand) {
            cc.warn('[WarriorRun] guide nodes are incomplete: GuideNode/node1/fazhen1/juese1/shouzhi');
            this._guideNode.active = false;
            this._guideActive = false;
            this._paused = false;
            return;
        }

        this._guideNode.active = true;
        this._guideNode.zIndex = 2000;
        this._guideCompleting = false;
        this._guideHandOffsetFromRing = cc.v2(
            this._guideHand.x - this._guideRing.x,
            this._guideHand.y - this._guideRing.y
        );
        this._alignGuidePresentation();
        this._guideNode.off(cc.Node.EventType.TOUCH_START, this._blockGuideTouch, this);
        this._guideNode.off(cc.Node.EventType.TOUCH_MOVE, this._blockGuideTouch, this);
        this._guideNode.off(cc.Node.EventType.TOUCH_END, this._blockGuideTouch, this);
        this._guideNode.off(cc.Node.EventType.TOUCH_CANCEL, this._blockGuideTouch, this);
        this._guideNode.off(cc.Node.EventType.TOUCH_START, this._onGuideTouchStart, this);
        this._guideNode.off(cc.Node.EventType.TOUCH_MOVE, this._onGuideTouchMove, this);
        this._guideNode.off(cc.Node.EventType.TOUCH_END, this._onGuideTouchEnd, this);
        this._guideNode.off(cc.Node.EventType.TOUCH_CANCEL, this._onGuideTouchCancel, this);
        this._guideNode.on(cc.Node.EventType.TOUCH_START, this._onGuideTouchStart, this);
        this._guideNode.on(cc.Node.EventType.TOUCH_MOVE, this._onGuideTouchMove, this);
        this._guideNode.on(cc.Node.EventType.TOUCH_END, this._onGuideTouchEnd, this);
        this._guideNode.on(cc.Node.EventType.TOUCH_CANCEL, this._onGuideTouchCancel, this);
        this._guideTouchStart = null;
        this._startGuideHandLoop();
    }

    private _alignGuidePresentation() {
        if (!this._guideActive || this._guideCompleting || !this._guideStepNode || !this._guideRing || !this._guideCharacter) return;
        if (!this._elementRing || !this._elementRing.isValid || !this._player || !this._player.isValid) return;

        const playerUnits = this._player.children
            .filter((child: cc.Node) => child.active && child.name.indexOf('Runtime_PlayerUnit_') === 0)
            .sort((a: cc.Node, b: cc.Node) => Number(a.name.replace('Runtime_PlayerUnit_', '')) - Number(b.name.replace('Runtime_PlayerUnit_', '')));
        this._alignGuideNodeToGameplayNode(this._guideRing, this._elementRing);
        this._syncGuideCharacters(playerUnits);

        if (this._guideHand && this._guideHandOffsetFromRing) {
            this._guideHand.setPosition(
                this._guideRing.x + this._guideHandOffsetFromRing.x,
                this._guideRing.y + this._guideHandOffsetFromRing.y
            );
        }
    }

    private _syncGuideCharacters(playerUnits: cc.Node[]) {
        if (!this._guideStepNode || !this._guideCharacter) return;
        const sources = playerUnits.length > 0 ? playerUnits : [this._player];
        const guideCharacters: cc.Node[] = [];

        sources.forEach((source: cc.Node, index: number) => {
            let guideCharacter = index === 0
                ? this._guideCharacter
                : this._guideStepNode.getChildByName('GuideCharacter_' + index);
            if (!guideCharacter) {
                guideCharacter = new cc.Node('GuideCharacter_' + index);
                guideCharacter.addComponent(cc.Sprite);
                this._guideStepNode.addChild(guideCharacter);
            }
            guideCharacter.active = true;
            guideCharacter.zIndex = 10 + source.zIndex;
            this._alignGuideNodeToGameplayNode(guideCharacter, source, true);
            guideCharacters.push(guideCharacter);
        });

        this._guideStepNode.children
            .filter((child: cc.Node) => child.name.indexOf('GuideCharacter_') === 0 && guideCharacters.indexOf(child) < 0)
            .forEach((child: cc.Node) => child.active = false);
        this._guideCharacters = guideCharacters;

        const bubble = this._guideStepNode.getChildByName('qipao');
        if (bubble) bubble.zIndex = 100;
        if (this._guideHand) this._guideHand.zIndex = 200;
    }

    private _alignGuideNodeToGameplayNode(guideNode: cc.Node, gameplayNode: cc.Node, syncSpriteFrame: boolean = false) {
        if (!guideNode || !guideNode.parent || !gameplayNode || !gameplayNode.isValid) return;
        if (syncSpriteFrame) {
            const gameplaySprite = gameplayNode.getComponent(cc.Sprite);
            const guideSprite = guideNode.getComponent(cc.Sprite);
            if (gameplaySprite && guideSprite && gameplaySprite.spriteFrame) {
                guideSprite.spriteFrame = gameplaySprite.spriteFrame;
                guideSprite.sizeMode = cc.Sprite.SizeMode.CUSTOM;
            }
        }
        const worldPosition = gameplayNode.convertToWorldSpaceAR(cc.v2(0, 0));
        guideNode.setPosition(guideNode.parent.convertToNodeSpaceAR(worldPosition));
        guideNode.setContentSize(gameplayNode.getContentSize());
        guideNode.scaleX = gameplayNode.scaleX;
        guideNode.scaleY = gameplayNode.scaleY;
        guideNode.angle = gameplayNode.angle;
    }

    private _getGuideLaneDeltaX(targetLaneX: number): number {
        if (!this._guideStepNode || !this._gameLayer || !this._player) return targetLaneX - (this._player ? this._player.x : 0);
        const currentWorld = this._gameLayer.convertToWorldSpaceAR(cc.v2(this._player.x, this._player.y));
        const targetWorld = this._gameLayer.convertToWorldSpaceAR(cc.v2(targetLaneX, this._player.y));
        const currentLocal = this._guideStepNode.convertToNodeSpaceAR(currentWorld);
        const targetLocal = this._guideStepNode.convertToNodeSpaceAR(targetWorld);
        return targetLocal.x - currentLocal.x;
    }

    private _startGuideHandLoop() {
        if (!this._guideHand) return;
        this._guideHand.stopAllActions();
        this._guideHandStartPosition = cc.v2(this._guideHand.x, this._guideHand.y);
        this._guideHand.opacity = 255;
        this._guideHand.runAction(cc.repeatForever(cc.sequence(
            cc.moveBy(0.55, cc.v2(180, 0)),
            cc.fadeOut(0.12),
            cc.delayTime(0.2),
            cc.callFunc(() => {
                if (!this._guideHand || !this._guideHand.isValid || !this._guideHandStartPosition) return;
                this._guideHand.setPosition(this._guideHandStartPosition);
                this._guideHand.opacity = 255;
            }),
            cc.delayTime(0.25)
        )));
    }

    private _blockGuideTouch(event: cc.Event.EventTouch) {
        if (event && event.stopPropagation) event.stopPropagation();
    }

    private _onGuideTouchStart(event: cc.Event.EventTouch) {
        this._blockGuideTouch(event);
        this._guideTouchStart = null;
        if (!this._guideActive || this._guideCompleting || !event || !event.touch) return;

        const point = event.touch.getLocation();
        if (this._isGuideTouchTarget(point)) {
            this._guideTouchStart = cc.v2(point.x, point.y);
        }
    }

    private _onGuideTouchMove(event: cc.Event.EventTouch) {
        this._blockGuideTouch(event);
    }

    private _onGuideTouchEnd(event: cc.Event.EventTouch) {
        this._blockGuideTouch(event);
        const start = this._guideTouchStart;
        this._guideTouchStart = null;
        if (!start || !this._guideActive || this._guideCompleting || !this._guideCharacter || !event || !event.touch) return;

        const end = event.touch.getLocation();
        const dx = end.x - start.x;
        const dy = end.y - start.y;
        const isRightSwipe = dx >= 60 && Math.abs(dx) >= Math.abs(dy);
        const isTap = Math.abs(dx) <= 20 && Math.abs(dy) <= 20 && this._isGuideTouchTarget(end);
        if (!isRightSwipe && !isTap) return;

        this._startGuideCompletionMove();
    }

    private _onGuideTouchCancel(event: cc.Event.EventTouch) {
        this._blockGuideTouch(event);
        this._guideTouchStart = null;
    }

    private _isGuideTouchTarget(worldPoint: cc.Vec2): boolean {
        if (!worldPoint) return false;
        const targets = [this._guideRing, this._guideHand].concat(this._guideCharacters)
            .filter((node: cc.Node) => !!node && node.isValid && node.activeInHierarchy);
        return targets.some((node: cc.Node) => node.getBoundingBoxToWorld().contains(worldPoint));
    }

    private _startGuideCompletionMove() {
        if (!this._guideActive || this._guideCompleting || !this._guideCharacter) return;

        this._guideCompleting = true;
        if (this._guideHand) {
            this._guideHand.stopAllActions();
            this._guideHand.runAction(cc.fadeOut(0.15));
        }

        const targetX = this._laneXs[Math.min(2, this._playerLane + 1)];
        const guideDeltaX = this._getGuideLaneDeltaX(targetX);
        if (this._guideRing) {
            this._guideRing.stopAllActions();
            this._guideRing.runAction(cc.moveTo(0.25, cc.v2(this._guideRing.x + guideDeltaX, this._guideRing.y)));
        }
        const guideCharacters = this._guideCharacters.length > 0 ? this._guideCharacters : [this._guideCharacter];
        guideCharacters.forEach((guideCharacter: cc.Node, index: number) => {
            if (!guideCharacter || !guideCharacter.isValid) return;
            guideCharacter.stopAllActions();
            const move = cc.moveTo(0.25, cc.v2(guideCharacter.x + guideDeltaX, guideCharacter.y));
            guideCharacter.runAction(index === 0
                ? cc.sequence(move, cc.callFunc(() => this._completeGuide()))
                : move);
        });
    }

    private _completeGuide() {
        if (!this._guideActive) return;

        this._guideTouchStart = null;
        this._playerLane = Math.min(2, this._playerLane + 1);
        this._resetCombo();
        this._movePlayerPresentationToX(this._laneXs[this._playerLane], 0.1);
        UserDataSyncManager.completeWarriorRunGuide();
        if (this._guideNode) {
            this._guideNode.active = false;
        }
        this._guideActive = false;
        this._guideCompleting = false;
        this._paused = false;
    }

    private _getSelectedCharacter(): CharacterConfig {
        const maxIndex = Math.max(0, RUN_CONFIG.characters.length - 1);
        const index = Math.max(0, Math.min(maxIndex, Math.floor(Number(mGameData.currentRole) || 0)));
        return RUN_CONFIG.characters[index] || RUN_CONFIG.characters[0];
    }

    private _getBossHp(boss: BossConfig, extraMultiplier: number = 1): number {
        if (!this._isLevelMode) {
            const fireRateMultiplier = this._bulletCount > 20
                ? Math.max(1, Math.floor(this._bulletCount / 20))
                : 1;
            const shotsPerSecond = Math.max(
                0.5,
                this._character.fire_rate_per_sec * fireRateMultiplier * this._endlessBossBalanceFireRateScale
            );
            const expectedFightSeconds = this._clamp(5.5 + this._bossKills * 1.2 + this._distance / 5000, 5.5, 15);
            const bossGrowth = this._clamp(extraMultiplier, 0.85, 2.2);
            const balancedHp = Math.max(1, Math.round(this._bulletCount * shotsPerSecond * expectedFightSeconds * bossGrowth));
            return Math.max(1, Math.round(balancedHp * this._endlessBossHpScale));
        }

        const multiplier = this._levelConfig ? this._levelConfig.boss_hp_multiplier : 0.5;
        const hp = Math.round(boss.base_hp * multiplier);
        return this._clamp(hp, this._levelBossHpMin, this._levelBossHpMax);
    }

    private _buildScene() {
        this._gameLayer = this._getOrAddNode('GameLayer', this._canvas, 0, 0, this._viewW, this._viewH);
        this._uiLayer = this._getOrAddNode('UILayer', this._canvas, 0, 0, this._viewW, this._viewH);
        this._popupLayer = this._getOrAddNode('PopupLayer', this._canvas, 0, 0, this._viewW, this._viewH);
        this._popupLayer.zIndex = 1000;
        this._clearRuntimeNodes();

        const backgroundGroup = this._isLevelMode
            ? Math.max(1, Math.min(5, Math.ceil(this._levelConfig.level_id / 20)))
            : 1;
        const backgroundKey = backgroundGroup === 1 ? 'beijing' : 'beijing' + backgroundGroup;
        const bg = this._getOrAddSprite('bg', this._gameLayer, backgroundKey, 0, 0, this._viewW, this._viewH, false);
        bg.zIndex = -10;
        this._drawLaneGuides();

        const playerY = this._sceneY(-561.893);
        this._player = this._getOrAddNode('Player', this._gameLayer, this._laneXs[this._playerLane], playerY, 220, 150);
        this._disableWidget(this._player);
        this._clearRuntimeChildren(this._player);
        const previewSprite = this._player.getComponent(cc.Sprite);
        if (previewSprite) previewSprite.enabled = false;
        this._player.scaleX = 1;
        this._player.scaleY = 1;
        this._player.zIndex = 20;
        this._elementRing = this._getOrAddSpriteOriginal('PlayerElement', this._gameLayer, 'fazhen1', this._player.x, this._sceneY(-518));
        this._disableWidget(this._elementRing);
        this._playerRingOffsetY = this._elementRing.y - this._player.y;
        this._elementRing.zIndex = 18;
        this._syncPlayerSquad();
        this._bulletLabel = this._getOrAddLabel('BulletCount', this._gameLayer, String(this._bulletCount), this._player.x, this._sceneY(this._playerCountSceneY), 38, cc.Color.WHITE);
        this._disableWidget(this._bulletLabel.node);
        this._stylePlayerCountLabel(this._bulletLabel);
        this._bulletLabel.node.zIndex = 30;
        this.scheduleOnce(() => this._syncPlayerPresentation(), 0);

        this._scoreBg = this._uiLayer.getChildByName('ScoreBg');
        const scoreLabelNode = this._uiLayer.getChildByName('ScoreLabel');
        this._scoreLabel = scoreLabelNode && scoreLabelNode.getComponent(cc.Label);
        if (scoreLabelNode) scoreLabelNode.active = false;
        const distanceLabelNode = this._uiLayer.getChildByName('DistanceLabel');
        this._distanceLabel = distanceLabelNode && distanceLabelNode.getComponent(cc.Label);
        if (!this._scoreBg || !this._scoreLabel || !this._distanceLabel) {
            cc.warn('[WarriorRun] editor HUD nodes are incomplete: ScoreBg/ScoreLabel/DistanceLabel');
        }
        this._comboLabel = this._getOrAddLabel('ComboLabel', this._uiLayer, 'COMBO 0!', this._sceneX(-238), this._topYFromScene(440), 34, cc.Color.YELLOW);
        this._damageBuffLabel = this._getOrAddLabel('BuffLabel', this._uiLayer, '+0% DMG', this._sceneX(-242), this._topYFromScene(402), 22, cc.Color.WHITE);
        this._comboLabel.node.active = false;
        this._damageBuffLabel.node.active = false;
        this._progressBar = this._uiLayer.getChildByName('ProgressBar');
        if (this._progressBar) {
            this._progressBar.active = this._isLevelMode;
            if (this._isLevelMode) this._drawProgress(0);
        } else {
            cc.warn('[WarriorRun] editor node not found: UILayer/ProgressBar');
        }
        const levelTimeNode = this._uiLayer.getChildByName('LevelTimeLabel');
        this._levelTimeLabel = levelTimeNode && levelTimeNode.getComponent(cc.Label);
        if (levelTimeNode) {
            levelTimeNode.active = this._isLevelMode;
        } else {
            cc.warn('[WarriorRun] editor node not found: UILayer/LevelTimeLabel');
        }

        this._pauseBtn = this._getOrAddSprite('PauseBtn', this._uiLayer, 'zanting1', this._sceneX(295), this._topYFromScene(581), 89, 88);
        this._pauseBtn.off(cc.Node.EventType.TOUCH_END, this._showPausePopup, this);
        this._pauseBtn.on(cc.Node.EventType.TOUCH_END, this._showPausePopup, this);
    }

    private _sceneX(baseX: number): number {
        if (baseX > 0) return this._viewW / 2 - (360 - baseX);
        if (baseX < 0) return -this._viewW / 2 + (baseX + 360);
        return 0;
    }

    private _sceneY(baseY: number): number {
        return this._bottomY + (baseY + 640);
    }

    private _topYFromScene(baseY: number): number {
        return this._topY - (640 - baseY);
    }

    private _drawLaneGuides() {
        const gNode = this._getOrAddNode('LaneGuides', this._gameLayer, 0, 0, this._viewW, this._viewH);
        const oldGraphics = gNode.getComponent(cc.Graphics);
        if (oldGraphics) oldGraphics.destroy();
        const halfGap = Math.abs(this._laneXs[1] - this._laneXs[0]) * 0.5;
        [-halfGap, halfGap].forEach((x, index) => {
            const guide = this._getOrAddNode('Guide_' + index, gNode, x, 0, 4, this._viewH - 60);
            this._drawRect(guide, new cc.Color(130, 220, 255, 100));
        });
    }

    private _drawProgress(ratio: number) {
        if (!this._progressBar) return;
        ratio = Math.max(0, Math.min(1, ratio));
        if (Math.abs(ratio - this._lastProgressRatio) < 0.005) return;
        this._lastProgressRatio = ratio;
        const bg = this._progressBar.getChildByName('ProgressBg');
        const fill = this._progressBar.getChildByName('ProgressFill');
        if (!bg || !fill) return;
        fill.width = Math.max(0, bg.width * ratio);
    }

    update(dt: number) {
        if (this._paused || this._ended || !this._player) return;
        this._updateFrameAnimations(dt);
        this._distance += this._runSpeed * dt;
        if (this._isLevelMode) {
            this._levelElapsed += dt;
            if (this._levelElapsed >= this._levelConfig.duration_sec) {
                this._levelElapsed = this._levelConfig.duration_sec;
                this._paused = true;
                this._refreshHud();
                this._scheduleLevelVictory();
                return;
            }
            this._spawnLevelByTime();
        } else {
            this._spawnEndlessByDistance();
        }
        this._updateEntities(dt);
        this._autoFire(dt);
        this._updateScore();
        this._refreshHud();
    }

    private _spawnEndlessByDistance() {
        while (this._distance >= this._nextWaveDistance) {
            if (this._nextBossDistance - this._distance < this._bossPrepareDistance || this._bossActive) {
                this._nextWaveDistance = Math.max(
                    this._nextWaveDistance + this._waveDelayStackNearBoss,
                    this._distance + this._waveDelayNearBoss
                );
                break;
            }
            this._spawnEndlessWave();
            this._nextWaveDistance += this._getNextWaveGap();
        }

        while (this._distance >= this._nextBossDistance) {
            if (!this._bossActive) {
                this._spawnEndlessBoss();
                this._nextWaveDistance = Math.max(this._nextWaveDistance, this._distance + this._waveDelayAfterBossSpawn);
            }
            this._nextBossDistance += Math.max(
                this._bossMinGap,
                this._bossBaseGap - this._bossKills * this._bossGapDecreasePerKill
            );
        }
    }

    private _spawnLevelByTime() {
        while (this._levelElapsed >= this._nextLevelWaveTime) {
            this._spawnLevelWave();
            this._nextLevelWaveTime += this._levelConfig.wave_interval_sec;
        }

        while (
            this._levelElapsed >= this._nextLevelBossTime &&
            this._nextLevelBossTime < this._levelConfig.duration_sec
        ) {
            this._spawnEndlessBoss();
            this._nextLevelBossTime += this._levelConfig.boss_interval_sec;
        }

        while (
            this._levelStarsSpawned < this._levelStarSpawnTimes.length &&
            this._levelElapsed >= this._levelStarSpawnTimes[this._levelStarsSpawned]
        ) {
            this._spawnLevelStar();
            this._levelStarsSpawned++;
        }
    }

    private _spawnLevelWave() {
        this._waveIndex++;
        const expectedGroups = Math.max(1, Math.min(3, this._levelConfig.wave_group_count));
        const baseGroups = Math.floor(expectedGroups);
        const groupCount = Math.min(3, baseGroups + (Math.random() < expectedGroups - baseGroups ? 1 : 0));
        const lanes = this._shuffleLanes();
        for (let i = 0; i < groupCount; i++) {
            const target = this._pickEndlessTarget();
            if (!target) continue;
            this._spawnEntity({
                spawn_distance: this._distance,
                type: 'target',
                entity_id: target.entity_id,
                lane: lanes[i],
                element: this._pickEndlessElement(),
                unit_count_multiplier: this._levelConfig.unit_count_multiplier,
            });
        }
    }

    private _spawnLevelStar() {
        const lane = Math.floor(Math.random() * this._laneXs.length);
        const root = this._getOrAddSprite(
            'Runtime_LevelStar_' + this._levelStarsSpawned,
            this._gameLayer,
            'xingxing1',
            this._laneXs[lane],
            this._topY + 60,
            76,
            76
        );
        root.zIndex = 16;
        this._entities.push({
            id: this._nextEntityId('STAR'),
            kind: 'star',
            node: root,
            lane,
            element: 'none',
            hp: 1,
            maxHp: 1,
            speedMultiplier: 2.5,
        });
    }

    private _spawnEndlessWave() {
        this._waveIndex++;
        const groupCount = Math.min(this._maxGroupsPerWave, 1 + Math.floor(this._waveIndex / this._wavesPerExtraGroup));
        const lanes = this._shuffleLanes();
        for (let i = 0; i < groupCount; i++) {
            const target = this._pickEndlessTarget();
            if (!target) continue;
            const spawn: SpawnConfig = {
                spawn_distance: this._distance,
                type: 'target',
                entity_id: target.entity_id,
                lane: lanes[i % lanes.length],
                element: this._pickEndlessElement(),
                unit_count_multiplier: this._getEndlessTargetMultiplier(target, i),
            };
            this._spawnEntity(spawn);
        }
    }

    private _spawnEndlessBoss() {
        const boss = RUN_CONFIG.bosses[0];
        if (!boss) return;
        this._spawnEntity({
            spawn_distance: this._distance,
            type: 'boss',
            entity_id: boss.entity_id,
            lane: 1,
            element: boss.element_type,
            unit_count_multiplier: this._getEndlessBossMultiplier(),
        });
    }

    private _spawnEntity(spawn: SpawnConfig) {
        if (spawn.type === 'boss') {
            const boss = this._findBoss(spawn.entity_id);
            if (!boss) return;
            this._bossActive = true;
            const bossHp = this._getBossHp(boss, spawn.unit_count_multiplier || 1);
            const bossLane = 1;
            const node = this._createBossNode(boss, bossLane, bossHp);
            this._entities.push({
                id: this._nextEntityId(spawn.entity_id),
                kind: 'boss',
                node,
                lane: bossLane,
                element: boss.element_type,
                hp: bossHp,
                maxHp: bossHp,
                bossConfig: boss,
            });
            return;
        }

        const target = this._findTarget(spawn.entity_id);
        if (!target) return;
        const units = this._getClusterUnits(target, spawn);
        const hp = Math.max(1, units * target.hp_per_unit);
        const node = this._createTargetNode(target, spawn.lane, spawn.element, units);
        this._entities.push({
            id: this._nextEntityId(spawn.entity_id),
            kind: 'target',
            node,
            lane: spawn.lane,
            element: spawn.element,
            hp,
            maxHp: hp,
            targetConfig: target,
            hpPerUnit: target.hp_per_unit,
            speedMultiplier: this._getTargetSpeedMultiplier(target, spawn),
        });
    }

    private _createTargetNode(target: TargetConfig, lane: number, element: ElementType, units: number): cc.Node {
        const root = this._addNode(target.name, this._gameLayer, this._laneXs[lane], this._topY - 120, 190, 150);
        root.zIndex = 15;
        this._addSpriteOriginal('ElementRing', root, this._ringSprite(element), 0, -28);
        this._addClusterSprites(root, target, units);
        const hpLabel = this._addLabel('HpLabel', root, String(units), 0, 56, 30, cc.Color.WHITE);
        this._styleMonsterCountLabel(hpLabel);
        return root;
    }

    private _createBossNode(boss: BossConfig, lane: number, hp: number): cc.Node {
        const root = this._addNode(boss.name, this._gameLayer, this._laneXs[lane], this._topY - 160, 220, 210);
        root.zIndex = 16;
        this._addSpriteOriginal('ElementRing', root, this._ringSprite(boss.element_type), 0, -34);
        const body = this._addSpriteOriginal('BossBody', root, 'boss', 0, -34);
        body.zIndex = 2;
        this._playFrameAnimation(body, 'monster/boss');
        const bossLabel = this._addLabel('BossLabel', root, String(hp), 0, 82, 26, cc.Color.WHITE);
        this._styleMonsterCountLabel(bossLabel);
        return root;
    }

    private _addClusterSprites(root: cc.Node, target: TargetConfig, units: number) {
        const count = this._getMonsterVisualCount(target, units);
        const positions = this._getSquadLayout('monster', count);
        const spriteKey = this._randomSmallMonsterSprite();
        positions.forEach((p, index) => {
            const unit = this._addSprite('Monster_' + index, root, spriteKey, p[0], p[1], 62, 76);
            unit.zIndex = index;
            this._playFrameAnimation(unit, 'monster/' + spriteKey.replace('xiaoguai', ''), 62, 76);
        });
    }

    private _getMonsterVisualCount(target: TargetConfig, units: number): number {
        if (!target || target.target_type === 'obstacle') return 1;
        const safeUnits = Math.max(1, units);
        if (safeUnits <= 15) return 1;
        if (safeUnits <= 30) return 2;
        if (safeUnits <= 50) return 3;
        if (safeUnits <= 75) return 4;
        return 5;
    }

    private _randomSmallMonsterSprite(): string {
        return 'xiaoguai' + (1 + Math.floor(Math.random() * 4));
    }

    private _pickEndlessTarget(): TargetConfig | null {
        let clusters = RUN_CONFIG.targets.filter((target: TargetConfig) => target.target_type === 'cluster');
        if (!clusters.length) return null;
        if (!this._isLevelMode && this._distance < this._firstBossDistance && this._bulletCount <= 3) {
            const starterTargets = clusters.filter((target: TargetConfig) =>
                target.drop_types.indexOf('math_buff') !== -1 &&
                target.drop_types.indexOf('math_debuff') === -1
            );
            if (starterTargets.length) clusters = starterTargets;
        }
        return clusters[Math.floor(Math.random() * clusters.length)];
    }

    private _pickEndlessElement(): ElementType {
        const elements: ElementType[] = ['wind', 'fire', 'thunder'];
        return elements[Math.floor(Math.random() * elements.length)];
    }

    private _shuffleLanes(): number[] {
        const lanes = [0, 1, 2];
        for (let i = lanes.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            const tmp = lanes[i];
            lanes[i] = lanes[j];
            lanes[j] = tmp;
        }
        return lanes;
    }

    private _getEndlessTargetMultiplier(target: TargetConfig, offset: number): number {
        const distance = Math.max(0, this._distance);
        const openingProgress = this._clamp(distance / this._firstBossDistance, 0, 1);
        const laterProgress = this._clamp((distance - this._firstBossDistance) / (6000 - this._firstBossDistance), 0, 1);
        const powerRatio = distance < this._firstBossDistance
            ? 0.25 + openingProgress * 0.65
            : 0.9 + laterProgress * 0.25;
        const distanceUnits = Math.pow(distance / 650, 1.12);
        const extraLanePressure = offset * (1 + distance / 3500);
        const randomRange = 0.15 + openingProgress * 0.05;
        const randomScale = 1 - randomRange + Math.random() * randomRange * 2;
        let targetUnits = Math.max(
            1,
            Math.round((1 + this._bulletCount * powerRatio + distanceUnits + extraLanePressure) * randomScale)
        );
        if (distance < 450 && this._bulletCount <= 3) {
            targetUnits += Math.floor(Math.random() * 2);
        }
        return targetUnits / Math.max(1, target.unit_count || 1);
    }

    private _getEndlessBossMultiplier(): number {
        return this._clamp(0.75 + Math.floor(this._distance / 1100) * 0.08 + this._bossKills * 0.12, 0.75, 2.2);
    }

    private _getNextWaveGap(): number {
        if (this._waveIndex <= 2) return 120;
        return this._clamp(
            this._waveGapStart - this._waveIndex * this._waveGapDecreasePerWave - this._getDifficultyLevel() * this._waveGapDifficultyDecrease,
            this._waveGapMin,
            this._waveGapStart
        );
    }

    private _getEnemyMoveSpeed(): number {
        const speedMultiplier = Math.min(2.05, 1 + this._distance / 8500 + (this._getPowerPressureMultiplier() - 1) * 0.18);
        const levelMultiplier = this._isLevelMode ? this._levelConfig.enemy_speed_multiplier : 1;
        return this._runSpeed * speedMultiplier * levelMultiplier;
    }

    private _getBossMoveSpeed(boss: BossConfig): number {
        const speedMultiplier = Math.min(1.8, 1 + this._distance / 11000 + this._bossKills * 0.025);
        const levelMultiplier = this._isLevelMode ? this._levelConfig.enemy_speed_multiplier : 1;
        return (boss.approach_speed_per_sec * 16) * speedMultiplier * levelMultiplier;
    }

    private _getDifficultyLevel(): number {
        return Math.max(0, this._distance / this._difficultyDistanceStep);
    }

    private _getPowerPressureMultiplier(): number {
        const baseBulletCount = Math.max(10, this._baseBulletCount || 10);
        const bulletRatio = Math.max(1, this._bulletCount / baseBulletCount);
        const gainRatio = Math.max(0, this._dropPowerGain / baseBulletCount);
        const pressureSeed = Math.max(0, bulletRatio - 1, gainRatio * 0.35);
        return this._clamp(1 + Math.pow(pressureSeed, 0.82) * 0.36, 1, 6.5);
    }

    private _getTargetDifficultyMultiplier(): number {
        const distance = Math.max(0, this._distance);
        const distancePressure = 1 + distance / 4200 + Math.pow(distance / 9000, 1.2);
        return this._clamp(distancePressure * this._getPowerPressureMultiplier(), 1, 18);
    }

    private _getBossDifficultyMultiplier(): number {
        const distance = Math.max(0, this._distance);
        const distancePressure = 1 + distance / 3600 + Math.pow(distance / 8000, 1.25);
        const powerPressure = 1 + (this._getPowerPressureMultiplier() - 1) * 0.95;
        return this._clamp(distancePressure * powerPressure, 1, 26);
    }

    private _updateEntities(dt: number) {
        for (let i = this._entities.length - 1; i >= 0; i--) {
            const entity = this._entities[i];
            if (!entity.node || !entity.node.isValid) {
                this._entities.splice(i, 1);
                continue;
            }

            if (entity.kind === 'boss') {
                this._updateBoss(entity, dt);
            } else {
                const moveSpeed = entity.kind === 'star' ? this._runSpeed * 0.9 : this._getEnemyMoveSpeed();
                entity.node.y -= moveSpeed * (entity.speedMultiplier || 1) * dt;

                if (this._checkTargetCollision(entity)) {
                    this._entities.splice(i, 1);
                    entity.node.destroy();
                    continue;
                }

                if (entity.node.y < this._bottomY - 90 && !entity.passed) {
                    entity.passed = true;
                    this._applyTargetLoss(entity);
                    this._entities.splice(i, 1);
                    entity.node.destroy();
                }
            }
        }
    }

    private _checkTargetCollision(entity: RunEntity): boolean {
        if (!this._isSmallMonster(entity) || !this._player) return false;
        if (entity.lane !== this._playerLane) return false;
        if (Math.abs(entity.node.y - this._player.y) > this._targetCollisionY) return false;

        this._applyTargetLoss(entity);
        return true;
    }

    private _isSmallMonster(entity: RunEntity): boolean {
        return !!entity && entity.kind === 'target' && !!entity.targetConfig &&
            entity.targetConfig.target_type === 'cluster';
    }

    private _getRemainingTargetUnits(entity: RunEntity): number {
        if (!this._isSmallMonster(entity)) return 0;
        const hpPerUnit = Math.max(1, entity.hpPerUnit || entity.targetConfig.hp_per_unit || 1);
        return Math.max(1, Math.ceil(Math.max(0, entity.hp) / hpPerUnit));
    }

    private _applyTargetLoss(entity: RunEntity) {
        if (this._ended) return;
        const loss = this._getRemainingTargetUnits(entity);
        if (loss <= 0) return;

        const beforeCount = this._bulletCount;
        this._bulletCount = Math.max(0, Math.floor(this._bulletCount - loss));
        this._recordDropPowerChange(beforeCount, this._bulletCount);
        this._syncPlayerSquad();
        if (this._bulletLabel) this._pulseNode(this._bulletLabel.node, true);
        if (this._bulletCount <= 0) this._gameOver();
    }

    private _updateBoss(entity: RunEntity, dt: number) {
        const boss = entity.bossConfig;
        entity.node.y -= this._getBossMoveSpeed(boss) * dt;
        if (entity.node.y <= this._player.y + 40) {
            this._gameOver();
        }
    }

    private _autoFire(dt: number) {
        this._fireTimer += dt;
        const fireRateMultiplier = this._bulletCount > 20
            ? Math.max(1, Math.floor(this._bulletCount / 20))
            : 1;
        const shotsPerSecond = this._character.fire_rate_per_sec * fireRateMultiplier * this._fireRateScale;
        const interval = 1 / Math.max(0.1, shotsPerSecond);
        while (this._fireTimer >= interval) {
            this._fireTimer -= interval;
            this._shootOnce();
        }
    }

    private _shootOnce() {
        const target = this._findFirstTargetInLane(this._playerLane);
        if (!target) {
            this._resetCombo();
            this._drawBulletTrail(null);
            return;
        }

        if (this._lockedId === target.id) {
            this._combo = Math.min(RUN_CONFIG.global_configs.combo_max_limit, this._combo + 1);
        } else {
            this._lockedId = target.id;
            this._combo = 1;
        }
        this._bestCombo = Math.max(this._bestCombo, this._combo);

        const elementMult = this._getElementMultiplier(this._playerElement, target.element);
        const countDamage = Math.max(1, Math.round(this._bulletCount * elementMult));
        const hpPerCount = target.kind === 'boss'
            ? 1
            : Math.max(1, target.hpPerUnit || (target.targetConfig && target.targetConfig.hp_per_unit) || 1);
        const damage = countDamage * hpPerCount;
        this._showElementDamageText(target, damage, elementMult);
        target.hp -= damage;
        this._drawBulletTrail(target.node);
        this._refreshEntityHp(target);
        if (target.hp <= 0) this._killEntity(target);
    }

    private _findFirstTargetInLane(lane: number): RunEntity {
        const candidates = this._entities.filter((entity) =>
            (entity.kind === 'target' || entity.kind === 'boss') &&
            entity.lane === lane &&
            entity.node &&
            entity.node.isValid &&
            entity.node.y > this._player.y
        );
        candidates.sort((a, b) => a.node.y - b.node.y);
        return candidates[0] || null;
    }

    private _killEntity(entity: RunEntity) {
        const index = this._entities.indexOf(entity);
        if (index !== -1) this._entities.splice(index, 1);

        if (entity.kind === 'boss') {
            this._bossKills++;
            this._bossActive = false;
            this._nextWaveDistance = Math.min(this._nextWaveDistance, this._distance + this._waveDelayAfterBossKill);
            entity.node.destroy();
            return;
        }

        this._monsterKills += Math.ceil(entity.maxHp / Math.max(1, entity.targetConfig.hp_per_unit));
        if (entity.targetConfig.drop_types.length > 0) this._spawnDrop(entity);
        entity.node.destroy();
    }

    private _spawnDrop(source: RunEntity) {
        const allowedTypes = this._getAllowedDropTypes(source.targetConfig);
        const pool = RUN_CONFIG.drop_packs.filter((pack) => allowedTypes.indexOf(pack.pack_type) !== -1);
        if (pool.length === 0) return;
        const drop = this._pickDropPack(pool);
        const root = this._addNode(drop.name, this._gameLayer, source.node.x, source.node.y, 110, 90);
        root.zIndex = 14;
        this._addDropGlow(root, drop);
        const dropLabel = this._addLabel('DropText', root, this._getDropDisplayText(drop), 0, -18, 34, cc.Color.WHITE);
        this._styleDropLabel(dropLabel, drop);
        this._entities.push({
            id: this._nextEntityId(drop.pack_id),
            kind: 'drop',
            node: root,
            lane: source.lane,
            element: drop.element_value,
            hp: 1,
            maxHp: 1,
            dropConfig: drop,
            speedMultiplier: 2,
        });
    }

    private _pickDropPack(pool: DropPackConfig[]): DropPackConfig {
        let totalWeight = 0;
        const weighted = pool.map((drop) => {
            const weight = this._getDropWeight(drop);
            totalWeight += weight;
            return { drop, weight };
        });

        if (totalWeight <= 0) {
            return pool[Math.floor(Math.random() * pool.length)];
        }

        let roll = Math.random() * totalWeight;
        for (let i = 0; i < weighted.length; i++) {
            roll -= weighted[i].weight;
            if (roll <= 0) {
                return weighted[i].drop;
            }
        }
        return weighted[weighted.length - 1].drop;
    }

    private _getDropWeight(drop: DropPackConfig): number {
        const isBeforeFirstBoss = this._bossKills === 0 && this._distance < this._firstBossDistance;
        const isLowPowerOpening = !this._isLevelMode && isBeforeFirstBoss && this._bulletCount <= 10;
        if (isLowPowerOpening) {
            if (drop.math_operator === 'add' && drop.math_value === 10) return 8;
            if (drop.math_operator === 'add' && drop.math_value >= 50) return 0.35;
            if (drop.math_operator === 'multiply') return 0.25;
            if (drop.pack_type === 'element') return 3;
        }
        if (!this._isLevelMode && isBeforeFirstBoss) {
            const highPower = this._bulletCount >= 36;
            if (drop.math_operator === 'add' && drop.math_value === 10) return highPower ? 1.2 : 2.2;
            if (drop.math_operator === 'add' && drop.math_value >= 50) return highPower ? 0.05 : 0.12;
            if (drop.math_operator === 'multiply') return highPower ? 0.05 : 0.1;
            if (drop.math_operator === 'subtract') return highPower ? 3.5 : 2.2;
            if (drop.math_operator === 'divide') return highPower ? 1.8 : 1;
            if (drop.pack_type === 'element') return highPower ? 3.5 : 3.2;
        }
        if (drop.math_operator === 'multiply') {
            if (isBeforeFirstBoss) return this._bulletCount >= 55 ? 0.22 : 0.14;
            if (this._bulletCount < 50) return 0.16;
            if (this._bulletCount >= 220) return 0.05;
            if (this._bulletCount >= 120) return 0.12;
            return 0.28;
        }
        if (drop.math_operator === 'add') {
            if (drop.math_value >= 50) {
                if (isBeforeFirstBoss) return this._bulletCount >= 70 ? 0.9 : 1.7;
                if (this._bulletCount >= 180) return 0.4;
                if (this._bulletCount >= 100) return 0.8;
                return 1.2;
            }
            return isBeforeFirstBoss ? 7 : 3.5;
        }
        if (drop.pack_type === 'math_debuff') {
            if (this._bulletCount >= 180) return 5;
            if (this._bulletCount >= 100) return 3.5;
            return isBeforeFirstBoss ? 1.2 : 2.2;
        }
        return isBeforeFirstBoss ? 4 : 2.5;
    }

    private _getAllowedDropTypes(target: TargetConfig): string[] {
        const types = (target && target.drop_types ? target.drop_types.slice() : []);
        const shouldBalanceEndlessOpening = !this._isLevelMode &&
            this._bossKills === 0 &&
            this._distance < this._firstBossDistance &&
            this._bulletCount >= 16;
        if (shouldBalanceEndlessOpening && types.indexOf('math_buff') !== -1 && types.indexOf('math_debuff') === -1) {
            types.push('math_debuff');
        }
        if (types.indexOf('math_buff') !== -1 && this._bulletCount >= 80 && types.indexOf('math_debuff') === -1) {
            types.push('math_debuff');
        }
        return types;
    }

    private _addDropGlow(root: cc.Node, drop: DropPackConfig) {
        const glow = this._addNode('DropGlow', root, 0, -18, 92, 92);
        glow.zIndex = 1;
        const graphics = glow.addComponent(cc.Graphics);
        const color = this._getDropTextColor(drop);
        const r = (color as any).r;
        const g = (color as any).g;
        const b = (color as any).b;

        graphics.fillColor = new cc.Color(r, g, b, 34);
        graphics.circle(0, 0, 42);
        graphics.fill();

        graphics.lineWidth = 8;
        graphics.strokeColor = new cc.Color(r, g, b, 72);
        graphics.circle(0, 0, 40);
        graphics.stroke();

        graphics.lineWidth = 3;
        graphics.strokeColor = new cc.Color(255, 255, 255, 150);
        graphics.circle(0, 0, 31);
        graphics.stroke();
    }

    private _checkDropPickup(entity: RunEntity) {
        if (entity.kind !== 'drop') return false;
        const hit = entity.lane === this._playerLane && Math.abs(entity.node.y - this._player.y) < 72;
        if (!hit) return false;
        this._applyDrop(entity.dropConfig);
        entity.node.destroy();
        return true;
    }

    private _checkStarPickup(entity: RunEntity) {
        if (entity.kind !== 'star') return false;
        const hit = entity.lane === this._playerLane && Math.abs(entity.node.y - this._player.y) < 82;
        if (!hit) return false;
        this._levelStarsCollected = Math.min(3, this._levelStarsCollected + 1);
        entity.node.destroy();
        return true;
    }

    private _applyDrop(drop: DropPackConfig) {
        if (drop.pack_type === 'element') {
            this._playerElement = drop.element_value;
            this._setSprite(this._elementRing, this._ringSprite(this._playerElement));
            return;
        }

        const beforeCount = this._bulletCount;
        if (drop.math_operator === 'add') this._bulletCount += drop.math_value;
        if (drop.math_operator === 'subtract') this._bulletCount -= drop.math_value;
        if (drop.math_operator === 'multiply') this._bulletCount *= drop.math_value;
        if (drop.math_operator === 'divide') this._bulletCount = Math.floor(this._bulletCount / Math.max(1, drop.math_value));
        this._bulletCount = Math.max(1, Math.min(this._getBulletCountLimit(), Math.floor(this._bulletCount)));
        this._recordDropPowerChange(beforeCount, this._bulletCount);
        this._syncPlayerSquad();
        this._pulseNode(this._bulletLabel.node, drop.pack_type === 'math_debuff');
    }

    private _recordDropPowerChange(beforeCount: number, afterCount: number) {
        const delta = afterCount - beforeCount;
        if (delta > 0) {
            this._dropPowerGain += delta;
        } else if (delta < 0) {
            this._dropPowerGain = Math.max(0, this._dropPowerGain + delta * 0.65);
        }
    }

    private _getBulletCountLimit(): number {
        if (this._bossKills <= 0) return 95;
        const distanceBonus = Math.floor(Math.max(0, this._distance - this._firstBossDistance) / 2200) * 30;
        return this._clamp(140 + this._bossKills * 45 + distanceBonus, 140, 360);
    }

    private _getDropDisplayText(drop: DropPackConfig): string {
        if (drop.pack_type === 'element') {
            if (drop.element_value === 'fire') return '火';
            if (drop.element_value === 'thunder') return '雷';
            return '风';
        }
        return drop.name;
    }

    private _styleDropLabel(label: cc.Label, drop: DropPackConfig) {
        const color = this._getDropTextColor(drop);
        label.node.color = color;
        label.fontSize = drop.pack_type === 'element' ? 40 : 34;
        label.lineHeight = label.fontSize + 8;
        label.horizontalAlign = cc.Label.HorizontalAlign.CENTER;
        label.verticalAlign = cc.Label.VerticalAlign.CENTER;
        label.overflow = cc.Label.Overflow.SHRINK;
        label.node.setContentSize(96, 56);
        label.node.zIndex = 6;
        this._setLabelOutline(label, this._getDropOutlineColor(drop), drop.pack_type === 'element' ? 5 : 4);

        let shadow = label.node.getComponent(cc.LabelShadow);
        if (!shadow) shadow = label.node.addComponent(cc.LabelShadow);
        shadow.color = new cc.Color((color as any).r, (color as any).g, (color as any).b, 180);
        shadow.offset = cc.v2(0, 0);
        shadow.blur = drop.pack_type === 'element' ? 12 : 8;
    }

    private _getDropTextColor(drop: DropPackConfig): cc.Color {
        if (drop.pack_type === 'math_debuff') return new cc.Color(255, 72, 72, 255);
        if (drop.pack_type === 'math_buff') return new cc.Color(86, 255, 112, 255);
        if (drop.element_value === 'fire') return new cc.Color(255, 126, 45, 255);
        if (drop.element_value === 'thunder') return new cc.Color(190, 120, 255, 255);
        return new cc.Color(92, 235, 255, 255);
    }

    private _getDropOutlineColor(drop: DropPackConfig): cc.Color {
        if (drop.pack_type === 'math_debuff') return new cc.Color(76, 0, 0, 255);
        if (drop.pack_type === 'math_buff') return new cc.Color(8, 70, 18, 255);
        if (drop.element_value === 'fire') return new cc.Color(88, 26, 0, 255);
        if (drop.element_value === 'thunder') return new cc.Color(45, 14, 92, 255);
        return new cc.Color(0, 58, 78, 255);
    }

    private _syncPlayerSquad() {
        if (!this._player) return;
        const count = this._getPlayerUnitCount();
        const runtimeUnits = this._player.children.filter((child: cc.Node) => child.name.indexOf('Runtime_PlayerUnit_') === 0);
        const playerSpriteKey = this._getSelectedPlayerSpriteKey();
        const playerAnimationKey = 'role/' + (this._getSelectedRoleIndex() + 1);

        this._playerUnitCount = count;
        runtimeUnits.forEach((child: cc.Node) => {
            const rawIndex = Number(child.name.replace('Runtime_PlayerUnit_', ''));
            if (isNaN(rawIndex) || rawIndex >= count) child.destroy();
        });

        const positions = this._getSquadLayout('player', count);
        positions.forEach((pos: number[], index: number) => {
            const unit = this._getOrAddSpriteOriginal('Runtime_PlayerUnit_' + index, this._player, playerSpriteKey, pos[0], pos[1]);
            unit.zIndex = index;
            this._playFrameAnimation(unit, playerAnimationKey);
            unit.scaleX = 1;
            unit.scaleY = 1;
        });
    }

    private _getSelectedRoleIndex(): number {
        const maxIndex = Math.max(0, RUN_CONFIG.characters.length - 1);
        return Math.max(0, Math.min(maxIndex, Math.floor(Number(mGameData.currentRole) || 0)));
    }

    private _getSelectedPlayerSpriteKey(): string {
        const roleIndex = this._getSelectedRoleIndex();
        const key = 'juese' + (roleIndex + 1);
        return this._sprites[key] ? key : 'juese1';
    }

    private _playFrameAnimation(node: cc.Node, key: string, maxWidth?: number, maxHeight?: number) {
        if (!node || !node.isValid) return;
        const frames = this._animationFrames[key];
        if (!frames || frames.length === 0) return;

        const sprite = node.getComponent(cc.Sprite) || node.addComponent(cc.Sprite);
        let state = this._frameAnimations.filter((item: FrameAnimationState) => item.node === node)[0];
        if (!state) {
            state = { node, key, frames, frameDuration: 0.08, elapsed: 0, frameIndex: 0 };
            this._frameAnimations.push(state);
        } else if (state.key !== key) {
            state.key = key;
            state.frames = frames;
            state.elapsed = 0;
            state.frameIndex = 0;
        }

        sprite.spriteFrame = frames[state.frameIndex] || frames[0];
        sprite.sizeMode = cc.Sprite.SizeMode.CUSTOM;
        const original = frames[0].getOriginalSize ? frames[0].getOriginalSize() : null;
        const width = original && original.width ? original.width : Math.max(1, node.width);
        const height = original && original.height ? original.height : Math.max(1, node.height);
        node.setContentSize(width, height);
        const scale = maxWidth && maxHeight
            ? Math.min(maxWidth / Math.max(1, width), maxHeight / Math.max(1, height))
            : 1;
        node.scaleX = scale;
        node.scaleY = scale;
    }

    private _updateFrameAnimations(dt: number) {
        for (let i = this._frameAnimations.length - 1; i >= 0; i--) {
            const state = this._frameAnimations[i];
            if (!state.node || !state.node.isValid) {
                this._frameAnimations.splice(i, 1);
                continue;
            }
            state.elapsed += dt;
            const advance = Math.floor(state.elapsed / state.frameDuration);
            if (advance <= 0) continue;
            state.elapsed -= advance * state.frameDuration;
            state.frameIndex = (state.frameIndex + advance) % state.frames.length;
            const sprite = state.node.getComponent(cc.Sprite);
            if (sprite) sprite.spriteFrame = state.frames[state.frameIndex];
        }
    }

    private _syncPlayerPresentation() {
        if (!this._player || !this._elementRing || !this._bulletLabel) return;
        const playerY = this._sceneY(-561.893);
        this._player.stopAllActions();
        this._elementRing.stopAllActions();
        this._bulletLabel.node.stopAllActions();
        this._disableWidget(this._player);
        this._disableWidget(this._elementRing);
        this._disableWidget(this._bulletLabel.node);
        this._player.setPosition(this._laneXs[this._playerLane], playerY);
        this._elementRing.setPosition(this._player.x, this._sceneY(-518));
        this._bulletLabel.node.setPosition(this._player.x, this._sceneY(this._playerCountSceneY));
        this._playerRingOffsetY = this._elementRing.y - this._player.y;
        this._syncPlayerSquad();
        this._alignGuidePresentation();
    }

    private _getPlayerUnitCount(): number {
        return Math.max(0, Math.min(this._maxVisiblePlayerUnits, Math.floor(this._bulletCount)));
    }

    private _getSquadLayout(kind: 'player' | 'monster', count: number = 5): number[][] {
        if (kind === 'player') {
            const cy = this._playerRingOffsetY;
            const columns = this._playerFormationColumns;
            const rows = Math.ceil(count / columns);
            const positions: number[][] = [];
            for (let row = 0; row < rows; row++) {
                const rowStart = row * columns;
                const unitsInRow = Math.min(columns, count - rowStart);
                const y = cy + ((rows - 1) * 0.5 - row) * this._playerFormationRowSpacing;
                for (let column = 0; column < unitsInRow; column++) {
                    const x = (column - (unitsInRow - 1) * 0.5) * this._playerFormationColumnSpacing;
                    positions.push([x, y]);
                }
            }
            return positions;
        }
        if (count <= 1) return [[0, -28]];
        if (count === 2) return [[-28, -28], [28, -28]];
        if (count === 3) return [[-56, -8], [0, -8], [56, -8]];
        if (count === 4) return [[-56, -8], [0, -8], [56, -8], [0, -58]];
        return [[-56, -8], [0, -8], [56, -8], [-28, -58], [28, -58]];
    }

    private _moveLane(dir: number) {
        if (this._paused || this._ended) return;
        const next = Math.max(0, Math.min(2, this._playerLane + dir));
        if (next === this._playerLane) return;
        this._playerLane = next;
        this._resetCombo();
        const targetX = this._laneXs[next];
        this._movePlayerPresentationToX(targetX, 0.1);
    }

    private _resetCombo() {
        this._lockedId = '';
        this._combo = 0;
    }

    private _movePlayerPresentationToX(targetX: number, duration: number) {
        const nodes = [
            this._player,
            this._elementRing,
            this._bulletLabel && this._bulletLabel.node,
        ].filter((node: cc.Node) => !!node);
        nodes.forEach((node: cc.Node) => {
            node.stopAllActions();
            node.runAction(cc.sequence(
                cc.moveTo(duration, cc.v2(targetX, node.y)),
                cc.callFunc(() => node.x = targetX)
            ));
        });
    }

    private _onTouchStart(event: cc.Event.EventTouch) {
        if (this._guideActive) return;
        this._touchStart = event.touch.getLocation();
    }

    private _onTouchEnd(event: cc.Event.EventTouch) {
        if (this._guideActive) {
            this._touchStart = null;
            return;
        }
        if (!this._touchStart) return;
        const end = event.touch.getLocation();
        const dx = end.x - this._touchStart.x;
        this._touchStart = null;
        if (Math.abs(dx) < 36) return;
        this._moveLane(dx > 0 ? 1 : -1);
    }

    private _refreshHud() {
        this._alignPlayerHudX();
        if (this._distanceLabel) {
            this._distanceLabel.string = this._isLevelMode
                ? '第' + this._levelConfig.level_id + '关'
                : '距离 ' + this._getDisplayDistance() + '米';
        }
        if (this._scoreLabel) {
            this._scoreLabel.node.active = false;
        }
        if (this._levelTimeLabel) {
            this._levelTimeLabel.node.active = this._isLevelMode;
            if (this._isLevelMode) {
                this._levelTimeLabel.string = '剩余' + Math.max(0, Math.ceil(this._levelConfig.duration_sec - this._levelElapsed)) + '秒';
            }
        }
        if (this._comboLabel) this._comboLabel.string = 'COMBO ' + this._combo + '!';
        if (this._damageBuffLabel) this._damageBuffLabel.string = '+' + this._combo + '% DMG';
        if (this._bulletLabel) this._bulletLabel.string = String(this._bulletCount);
        if (this._progressBar) {
            this._progressBar.active = this._isLevelMode;
            if (this._isLevelMode) this._drawProgress(this._levelElapsed / this._levelConfig.duration_sec);
        }

        for (let i = this._entities.length - 1; i >= 0; i--) {
            if (this._checkDropPickup(this._entities[i]) || this._checkStarPickup(this._entities[i])) {
                this._entities.splice(i, 1);
            }
        }
    }

    private _alignPlayerHudX() {
        if (!this._player) return;
        if (this._elementRing && Math.abs(this._elementRing.x - this._player.x) > 0.5) {
            this._elementRing.x = this._player.x;
        }
        if (this._bulletLabel && Math.abs(this._bulletLabel.node.x - this._player.x) > 0.5) {
            this._bulletLabel.node.x = this._player.x;
        }
    }

    private _refreshEntityHp(entity: RunEntity) {
        const labelNode = entity.node.getChildByName('HpLabel') || entity.node.getChildByName('BossLabel');
        const label = labelNode && labelNode.getComponent(cc.Label);
        if (!label) return;
        if (entity.kind === 'boss') {
            label.string = String(Math.max(0, Math.ceil(entity.hp)));
        } else {
            const hpPerUnit = entity.hpPerUnit || (entity.targetConfig && entity.targetConfig.hp_per_unit) || 1;
            label.string = String(Math.max(0, Math.ceil(entity.hp / Math.max(1, hpPerUnit))));
        }
    }

    private _updateScore() {
        this._score = this._getDisplayDistance() * RUN_CONFIG.global_configs.score_per_distance
            + this._monsterKills * RUN_CONFIG.global_configs.score_per_monster_kill
            + this._bestCombo * 100
            + this._bossKills * 5000;
    }

    private _gameOver() {
        if (this._ended) return;
        this._ended = true;
        this._paused = true;
        this._updateScore();
        if (!this._isLevelMode) this._saveBestDistance();
        this._showFailPopup();
    }

    private _levelVictory() {
        if (this._ended || !this._isLevelMode) return;
        this._levelVictoryPending = false;
        this._ended = true;
        this._paused = true;
        this._updateScore();
        this._saveLevelVictoryProgress();
        const shown = this._showConfiguredPopup('GameVictoryPopup', [
            { name: 'backBtn', cb: () => this._returnToStartAfterVictory() },
            { name: 'retryBtn', cb: () => this._goToNextLevel() },
        ], '成绩： ' + this._getDisplayDistance() + '米。');
        if (shown) {
            const popup = this._popupLayer.getChildByName('GameVictoryPopup');
            this._refreshVictoryStars(popup);
        } else {
            cc.warn('[WarriorRun] victory popup node not found: GameVictoryPopup');
            this._returnToStartAfterVictory();
        }
    }

    private _scheduleLevelVictory() {
        if (this._levelVictoryPending || this._ended) return;
        this._levelVictoryPending = true;
        this.scheduleOnce(() => {
            if (this._ended || !this._isLevelMode) return;
            this._levelVictory();
        }, this._victoryPopupDelaySec);
    }

    private _refreshVictoryStars(popup: cc.Node) {
        const starsNode = popup && popup.getChildByName('Stars');
        if (!starsNode) {
            cc.warn('[WarriorRun] victory stars node not found: GameVictoryPopup/Stars');
            return;
        }
        starsNode.children.forEach((starNode: cc.Node, index: number) => {
            const sprite = starNode.getComponent(cc.Sprite);
            const frame = index < this._levelStarsCollected
                ? this._sprites['xingxing1']
                : this._sprites['xingxing2'];
            starNode.active = true;
            if (sprite && frame) {
                sprite.spriteFrame = frame;
                sprite.sizeMode = cc.Sprite.SizeMode.CUSTOM;
            }
        });
    }

    private _saveLevelVictoryProgress() {
        const level = this._levelConfig.level_id;
        const progress = getProgress();
        const levelKey = String(level);
        const clearKey = this._getLevelClearKey(level);
        const oldStars = Math.max(0, Number((progress.level_stars || {})[levelKey]) || 0);
        const firstClear = cc.sys.localStorage.getItem(clearKey) !== '1' && oldStars <= 0 && level >= (progress.unlocked_level || 1);
        const stars = Math.max(0, Math.min(3, this._levelStarsCollected));
        const bestStars = Math.max(oldStars, stars);

        progress.level_stars = progress.level_stars || {};
        progress.level_stars[levelKey] = bestStars;
        progress.unlocked_level = Math.max(
            progress.unlocked_level || 1,
            Math.min(RUN_CONFIG.levels.length, level + 1)
        );
        GameState.lastStars = stars;
        GameState.selectedLevel = Math.min(RUN_CONFIG.levels.length, level + 1);
        saveProgress();

        cc.sys.localStorage.setItem(clearKey, '1');
        if (firstClear && this._levelConfig.first_clear_reward > 0 && mGameData && mGameData.addGold) {
            mGameData.addGold(this._levelConfig.first_clear_reward);
        }
        StateBridge.syncNewToOld();
        UserDataSyncManager.requestUpload();
    }

    private _getLevelClearKey(level: number): string {
        const userId = cc.sys.localStorage.getItem('SLS_USER_ID');
        const suffix = userId ? '_' + userId : '';
        return 'WarriorRunLevelCleared' + suffix + '_' + level;
    }

    private _returnToStartAfterVictory() {
        mGameData.shouldOpenLevelSelect = false;
        cc.director.loadScene('Start');
    }

    private _goToNextLevel() {
        if (this._retrying) return;
        this._retrying = true;
        const nextLevel = this._levelConfig.level_id + 1;
        if (nextLevel > RUN_CONFIG.levels.length) {
            this._returnToStartAfterVictory();
            return;
        }
        StateBridge.syncForStartScene();
        if (!StateBridge.consumeStamina()) {
            this._returnToStartAfterVictory();
            return;
        }
        mGameData.isInfiniteMode = false;
        mGameData.currentLevel = nextLevel;
        GameState.selectedLevel = nextLevel;
        if (mGameData.SaveLevelData) mGameData.SaveLevelData();
        cc.director.loadScene('WarriorRun');
    }

    private _showPausePopup() {
        if (this._guideActive || this._ended) return;
        this._paused = true;
        if (this._showConfiguredPopup('PausePopup', [
            { name: 'continueBtn', cb: () => { this._hidePopupLayer(); this._paused = false; } },
            { name: 'backBtn', cb: () => this._returnToStartWithReward() },
        ])) {
            return;
        }
        cc.warn('[WarriorRun] pause popup node not found: PausePopup');
    }

    private _showFailPopup() {
        if (cc.sys && cc.sys.platform === cc.sys.WECHAT_GAME && (window as any).wx && (window as any).wx.vibrateShort) {
            (window as any).wx.vibrateShort({});
        }
        if (!this._isLevelMode && !this._reviveUsed && this._showRevivePopup()) {
            return;
        }
        if (this._showGameOverPopup()) {
            return;
        }
        cc.warn('[WarriorRun] game over popup node not found: GameOverPopup');
    }

    private _showRevivePopup(): boolean {
        return this._showConfiguredPopup('RevivePopup', [
            { name: 'continueBtn', cb: () => this._reviveFromBoss() },
            { name: 'backBtn', cb: () => { if (!this._showGameOverPopup()) this._returnToStartWithReward(); } },
        ], '成绩： ' + this._getDisplayDistance() + '米。');
    }

    private _showGameOverPopup(): boolean {
        return this._showConfiguredPopup('GameOverPopup', [
            { name: 'retryBtn', cb: () => this._retryRun() },
            { name: 'backBtn', cb: () => this._returnToStartWithReward() },
        ], '成绩： ' + this._getDisplayDistance() + '米。');
    }

    private _retryRun() {
        if (this._retrying) return;
        this._retrying = true;
        StateBridge.syncForStartScene();
        if (!StateBridge.consumeStamina()) {
            this._returnToStartWithReward();
            return;
        }
        cc.director.loadScene('WarriorRun');
    }

    private _getDisplayDistance(): number {
        return Math.max(0, Math.floor(this._distance * DISPLAY_DISTANCE_SCALE));
    }

    private _getSettlementDiamond(): number {
        return Math.max(1, Math.floor(this._score / 300));
    }

    private _reviveFromBoss() {
        if (this._reviveUsed) return;
        this._reviveUsed = true;
        this._ended = false;
        this._paused = false;
        this._hidePopupLayer();
        this._entities.forEach((entity) => {
            if (entity.kind === 'boss') {
                entity.node.stopAllActions();
                entity.node.y = Math.max(entity.node.y + 220, 250);
            }
        });
    }

    private _grantDiamond(amount: number) {
        if (this._rewardGranted) {
            cc.director.loadScene('Start');
            return;
        }
        this._rewardGranted = true;
        if (mGameData && mGameData.addGold) {
            mGameData.addGold(amount);
        }
        StateBridge.syncNewToOld();
        cc.director.loadScene('Start');
    }

    private _returnToStartWithReward() {
        this._paused = true;
        this._ended = true;
        this._updateScore();
        if (this._isLevelMode) {
            mGameData.shouldOpenLevelSelect = false;
            cc.director.loadScene('Start');
            return;
        }
        this._saveBestDistance();
        this._grantDiamond(this._getSettlementDiamond());
    }

    private _showConfiguredPopup(
        popupName: string,
        buttons: { name: string; cb: () => void }[],
        body: string = ''
    ): boolean {
        if (!this._popupLayer) return false;
        const popup = this._popupLayer.getChildByName(popupName);
        if (!popup) return false;

        this._hidePopupLayer();
        popup.active = true;
        popup.zIndex = 1000;
        popup.setPosition(0, 0);
        popup.setContentSize(this._viewW, this._viewH);

        const mask = popup.getChildByName('Mask') || popup.getChildByName('遮罩');
        if (mask) {
            mask.setPosition(0, 0);
            mask.setContentSize(this._viewW, this._viewH);
            mask.scaleX = 1;
            mask.scaleY = 1;
        }

        const bodyLabel = this._findDeepLabel(popup, 'Body');
        if (bodyLabel) {
            bodyLabel.string = body;
            bodyLabel.node.active = !!body && !this._isLevelMode;
        }

        const scoreBackground = this._findDeep(popup, 'dikuang8');
        if (scoreBackground) {
            scoreBackground.active = !!body && !this._isLevelMode;
        }

        const playIcon = this._findDeep(popup, 'PlayIcon');
        if (playIcon) {
            playIcon.active = false;
        }

        const diamondLabel = this._findDeepLabel(popup, 'DiamondBody');
        if (diamondLabel) {
            diamondLabel.string = '本局获得钻石：' + this._getSettlementDiamond();
            diamondLabel.node.active = false;
        }

        buttons.forEach((cfg) => {
            const btn = this._findDeep(popup, cfg.name);
            if (!btn) return;
            btn.active = true;
            btn.targetOff(this);
            btn.off(cc.Node.EventType.TOUCH_END);
            btn.on(cc.Node.EventType.TOUCH_END, cfg.cb, this);
        });
        return true;
    }

    private _hidePopupLayer() {
        this._popupLayer.children.forEach((child: cc.Node) => {
            child.active = false;
        });
    }

    private _findDeep(root: cc.Node, name: string): cc.Node {
        if (!root) return null;
        if (root.name === name) return root;
        for (let i = 0; i < root.childrenCount; i++) {
            const found = this._findDeep(root.children[i], name);
            if (found) return found;
        }
        return null;
    }

    private _findDeepLabel(root: cc.Node, name: string): cc.Label {
        const node = this._findDeep(root, name);
        return node && node.getComponent(cc.Label);
    }

    private _stylePlayerCountLabel(label: cc.Label) {
        if (!label) return;
        label.node.color = new cc.Color(190, 255, 80, 255);
        this._setLabelOutline(label, new cc.Color(28, 45, 26, 255), 3);
    }

    private _styleMonsterCountLabel(label: cc.Label) {
        if (!label) return;
        label.node.color = new cc.Color(255, 218, 255, 255);
        this._setLabelOutline(label, new cc.Color(18, 10, 28, 255), 4);
    }

    private _showElementDamageText(target: RunEntity, damage: number, elementMult: number) {
        if (!target || !target.node || !target.node.isValid || !this._gameLayer) return;
        if (elementMult <= 1) return;

        const value = this._getElementDamageTextValue(target, damage);
        const label = this._addLabel(
            'ElementDamageText',
            this._gameLayer,
            '克制-' + value,
            target.node.x,
            target.node.y + 82,
            28,
            new cc.Color(255, 238, 82, 255)
        );
        label.node.setContentSize(180, 44);
        label.overflow = cc.Label.Overflow.SHRINK;
        label.node.zIndex = 120;
        this._setLabelOutline(
            label,
            new cc.Color(96, 42, 0, 255),
            4
        );

        let shadow = label.node.getComponent(cc.LabelShadow);
        if (!shadow) shadow = label.node.addComponent(cc.LabelShadow);
        shadow.color = new cc.Color(255, 164, 0, 170);
        shadow.offset = cc.v2(0, 0);
        shadow.blur = 8;

        label.node.opacity = 255;
        label.node.scaleX = 0.92;
        label.node.scaleY = 0.92;
        label.node.runAction(cc.sequence(
            cc.spawn(
                cc.moveBy(0.48, cc.v2(0, 58)),
                cc.sequence(cc.scaleTo(0.08, 1.16), cc.scaleTo(0.4, 1)),
                cc.fadeOut(0.48)
            ),
            cc.callFunc(() => {
                if (label.node && label.node.isValid) label.node.destroy();
            })
        ));
    }

    private _getElementDamageTextValue(target: RunEntity, damage: number): number {
        if (target.kind === 'boss') {
            return Math.max(1, Math.ceil(damage));
        }

        const hpPerUnit = target.hpPerUnit || (target.targetConfig && target.targetConfig.hp_per_unit) || 1;
        const safeHpPerUnit = Math.max(1, hpPerUnit);
        const beforeUnits = Math.max(0, Math.ceil(target.hp / safeHpPerUnit));
        const afterUnits = Math.max(0, Math.ceil(Math.max(0, target.hp - damage) / safeHpPerUnit));
        return Math.max(1, beforeUnits - afterUnits);
    }

    private _setLabelOutline(label: cc.Label, color: cc.Color, width: number) {
        let outline = label.node.getComponent(cc.LabelOutline);
        if (!outline) outline = label.node.addComponent(cc.LabelOutline);
        outline.color = color;
        outline.width = width;
    }

    private _drawBulletTrail(target: cc.Node = null) {
        const origins = this._getPlayerBulletOrigins();
        const total = Math.max(1, origins.length);
        origins.forEach((origin: cc.Vec2, index: number) => {
            const targetX = origin.x;
            const targetY = target ? target.y - 34 : this._getBulletOffscreenY();
            this._drawSingleBulletTrail(origin, cc.v2(targetX, targetY), index, total);
        });
    }

    private _getBulletOffscreenY(): number {
        return this._topY + 120;
    }

    private _getPlayerBulletOrigins(): cc.Vec2[] {
        if (!this._player || !this._gameLayer) return [cc.v2(this._laneXs[this._playerLane], this._bottomY + 160)];
        const units = this._player.children
            .filter((child: cc.Node) => child.active && child.name.indexOf('Runtime_PlayerUnit_') === 0)
            .sort((a: cc.Node, b: cc.Node) => Number(a.name.replace('Runtime_PlayerUnit_', '')) - Number(b.name.replace('Runtime_PlayerUnit_', '')));
        if (!units.length) return [cc.v2(this._player.x, this._player.y + this._playerRingOffsetY + 70)];
        return units.map((unit: cc.Node) => {
            const size = unit.getContentSize();
            const muzzleY = Math.max(54, size.height * 0.5 + 8);
            const world = unit.convertToWorldSpaceAR(cc.v2(0, muzzleY));
            return this._gameLayer.convertToNodeSpaceAR(world);
        });
    }

    private _drawSingleBulletTrail(start: cc.Vec2, end: cc.Vec2, index: number, total: number) {
        const dx = end.x - start.x;
        const dy = end.y - start.y;
        const len = Math.max(1, Math.sqrt(dx * dx + dy * dy));
        const bullet = this._getBulletTrailNode(start.x, start.y);
        bullet.zIndex = 80 + index;
        bullet.opacity = 255;
        bullet.angle = Math.atan2(dy, dx) * 180 / Math.PI - 90;

        const color = this._getBulletColor();
        const graphics = bullet.getComponent(cc.Graphics) || bullet.addComponent(cc.Graphics);
        graphics.clear();
        const curve = 0;
        graphics.lineCap = cc.Graphics.LineCap.ROUND;
        graphics.lineJoin = cc.Graphics.LineJoin.ROUND;
        graphics.lineWidth = 24;
        graphics.strokeColor = new cc.Color((color as any).r, (color as any).g, (color as any).b, 62);
        graphics.moveTo(curve * -0.7, -58);
        graphics.bezierCurveTo(curve, -26, -curve, 18, curve * 0.35, 48);
        graphics.stroke();
        graphics.lineWidth = 12;
        graphics.strokeColor = new cc.Color((color as any).r, (color as any).g, (color as any).b, 168);
        graphics.moveTo(curve * -0.4, -50);
        graphics.bezierCurveTo(curve, -22, -curve, 16, curve * 0.25, 42);
        graphics.stroke();
        graphics.lineWidth = 4;
        graphics.strokeColor = new cc.Color(255, 255, 255, 245);
        graphics.moveTo(0, -42);
        graphics.bezierCurveTo(curve * 0.5, -16, -curve * 0.4, 16, 0, 34);
        graphics.stroke();
        graphics.fillColor = new cc.Color((color as any).r, (color as any).g, (color as any).b, 150);
        graphics.circle(0, 48, 15);
        graphics.fill();
        graphics.fillColor = new cc.Color(255, 255, 255, 245);
        graphics.circle(0, 48, 7);
        graphics.fill();

        const duration = Math.max(0.12, Math.min(0.24, len / 2600));
        bullet.runAction(cc.sequence(
            cc.spawn(
                cc.moveTo(duration, end),
                cc.sequence(cc.scaleTo(duration * 0.35, 1.12, 1.08), cc.scaleTo(duration * 0.65, 0.88, 0.98)),
                cc.sequence(cc.fadeTo(duration * 0.7, 235), cc.fadeOut(duration * 0.3))
            ),
            cc.callFunc(() => this._recycleBulletTrailNode(bullet))
        ));
    }

    private _getBulletTrailNode(x: number, y: number): cc.Node {
        let bullet: cc.Node = null;
        while (this._bulletTrailPool.length > 0 && !bullet) {
            const cached = this._bulletTrailPool.pop();
            if (cached && cached.isValid) {
                bullet = cached;
            }
        }

        if (!bullet) {
            bullet = this._addNode('Runtime_BulletLine', this._gameLayer, x, y, 92, 140);
            bullet.addComponent(cc.Graphics);
        } else {
            if (bullet.parent !== this._gameLayer) {
                this._gameLayer.addChild(bullet);
            }
            bullet.setContentSize(92, 140);
            bullet.setPosition(x, y);
        }

        bullet.stopAllActions();
        bullet.active = true;
        bullet.opacity = 255;
        bullet.scaleX = 1;
        bullet.scaleY = 1;
        bullet.angle = 0;
        return bullet;
    }

    private _recycleBulletTrailNode(bullet: cc.Node) {
        if (!bullet || !bullet.isValid) return;
        bullet.stopAllActions();
        const graphics = bullet.getComponent(cc.Graphics);
        if (graphics) graphics.clear();
        bullet.active = false;
        bullet.opacity = 255;
        bullet.scaleX = 1;
        bullet.scaleY = 1;
        bullet.angle = 0;
        this._bulletTrailPool.push(bullet);
    }

    private _getBulletColor(): cc.Color {
        if (this._playerElement === 'fire') return new cc.Color(255, 126, 45, 255);
        if (this._playerElement === 'thunder') return new cc.Color(190, 120, 255, 255);
        return new cc.Color(92, 235, 255, 255);
    }

    private _pulseNode(node: cc.Node, bad: boolean) {
        node.color = bad ? cc.Color.RED : cc.Color.WHITE;
        node.stopAllActions();
        node.runAction(cc.sequence(
            cc.scaleTo(0.06, 1.25),
            cc.scaleTo(0.08, 1),
            cc.callFunc(() => {
                if (this._bulletLabel && node === this._bulletLabel.node) {
                    this._stylePlayerCountLabel(this._bulletLabel);
                } else {
                    node.color = cc.Color.WHITE;
                }
            })
        ));
    }

    private _getElementMultiplier(attacker: ElementType, defender: ElementType): number {
        if (attacker === 'none' || defender === 'none' || attacker === defender) return 1;
        const beats: Record<string, ElementType> = { wind: 'fire', fire: 'thunder', thunder: 'wind' };
        if (beats[attacker] === defender) return RUN_CONFIG.global_configs.element_advantage_multiplier + (this._character.element_advantage_bonus || 0);
        if (beats[defender] === attacker) return RUN_CONFIG.global_configs.element_disadvantage_multiplier;
        return 1;
    }

    private _getClusterUnits(target: TargetConfig, spawn?: SpawnConfig): number {
        const multiplier = spawn && spawn.unit_count_multiplier ? spawn.unit_count_multiplier : 1;
        return Math.max(1, Math.round((target.unit_count || 1) * multiplier));
    }

    private _getTargetSpeedMultiplier(target: TargetConfig, spawn: SpawnConfig): number {
        let multiplier = 1;

        if (target.target_type === 'obstacle') {
            multiplier *= 0.82;
        } else if (target.cluster_shape === 'column') {
            multiplier *= 1.1;
        } else if (target.cluster_shape === 'wide') {
            multiplier *= 0.92;
        }

        if (spawn.element === 'wind') multiplier *= 1.08;
        if (spawn.element === 'fire') multiplier *= 1.03;
        if (spawn.element === 'thunder') multiplier *= 0.97;

        const laneOffset = (spawn.lane - 1) * 0.03;
        const randomOffset = 0.88 + Math.random() * 0.26;
        return this._clamp(multiplier * randomOffset + laneOffset, 0.76, 1.28);
    }

    private _clamp(value: number, min: number, max: number): number {
        return Math.max(min, Math.min(max, value));
    }

    private _ringSprite(element: ElementType): string {
        if (element === 'fire') return 'fazhen2';
        if (element === 'thunder') return 'fazhen3';
        return 'fazhen1';
    }

    private _findTarget(id: string): TargetConfig {
        return RUN_CONFIG.targets.filter((target) => target.entity_id === id)[0] || null;
    }

    private _findBoss(id: string): BossConfig {
        return RUN_CONFIG.bosses.filter((boss) => boss.entity_id === id)[0] || null;
    }

    private _nextEntityId(prefix: string): string {
        this._entitySeq++;
        return prefix + '_' + this._entitySeq;
    }

    private _saveBestDistance() {
        const key = this._getBestDistanceKey();
        const oldValue = Math.max(0, Math.floor(Number(cc.sys.localStorage.getItem(key)) || 0));
        const nextValue = Math.max(oldValue, this._getDisplayDistance());
        if (nextValue > oldValue) {
            cc.sys.localStorage.setItem(key, String(nextValue));
            cc.sys.localStorage.setItem('WarriorRunBestDistance', String(nextValue));
            UserDataSyncManager.requestUpload();
            this._reportBestDistanceToServer(nextValue);
        }
    }

    private _reportBestDistanceToServer(distance: number) {
        this._reportRankToServer(Math.max(0, Math.floor(distance)), 3);
    }

    private _reportRankToServer(rank: number, stars: number) {
        const username = cc.sys.localStorage.getItem('SLS_USERNAME') || '';
        if (!username || rank <= 0) {
            return;
        }

        const xhr = new XMLHttpRequest();
        xhr.open('POST', 'https://pay.szvi-bo.com/v1/testapp/PassLevel', true);
        xhr.setRequestHeader('Content-Type', 'application/json');
        xhr.onload = () => {
            if (xhr.status < 200 || xhr.status >= 300) {
                cc.warn('[WarriorRun] report best distance failed:', xhr.status, xhr.responseText);
                return;
            }
            try {
                const data = JSON.parse(xhr.responseText);
                if (data && data.code !== 0) {
                    cc.warn('[WarriorRun] report best distance rejected:', data);
                }
            } catch (error) {
                cc.warn('[WarriorRun] report best distance parse failed:', error);
            }
        };
        xhr.onerror = () => cc.warn('[WarriorRun] report best distance network error');
        xhr.ontimeout = () => cc.warn('[WarriorRun] report best distance timeout');
        xhr.send(JSON.stringify({
            appid: APP_ID,
            username,
            rank,
            star: Math.max(0, Math.min(3, Math.floor(Number(stars) || 0)))
        }));
    }

    private _getBestDistanceKey(): string {
        const userId = cc.sys.localStorage.getItem('SLS_USER_ID');
        return userId ? 'WarriorRunBestDistance_' + userId : 'WarriorRunBestDistance';
    }

    private _clearRuntimeNodes() {
        const runtimeNames = ['BulletTrail', 'Runtime_Bullet', 'Panel'];
        this._bulletTrailPool = [];
        [this._gameLayer, this._popupLayer].forEach((root: cc.Node) => {
            if (!root) return;
            root.children.slice().forEach((child: cc.Node) => {
                if (child.name.indexOf('Runtime_') === 0 || runtimeNames.indexOf(child.name) !== -1) {
                    child.removeFromParent(false);
                    child.destroy();
                }
            });
        });
    }

    private _clearRuntimeChildren(root: cc.Node) {
        if (!root) return;
        root.children.slice().forEach((child: cc.Node) => {
            if (child.name.indexOf('Runtime_') === 0) {
                child.removeFromParent(false);
                child.destroy();
            }
        });
    }

    private _disableWidget(node: cc.Node) {
        if (!node) return;
        const widget = node.getComponent(cc.Widget);
        if (widget) widget.enabled = false;
    }

    private _getOrAddNode(name: string, parent: cc.Node, x: number, y: number, w: number, h: number): cc.Node {
        let node = parent.getChildByName(name);
        if (!node) {
            node = this._addNode(name, parent, x, y, w, h);
        } else {
            node.setPosition(x, y);
            node.setContentSize(w, h);
            node.active = true;
        }
        return node;
    }

    private _getOrAddSprite(name: string, parent: cc.Node, key: string, x: number, y: number, w: number, h: number, keepRatio: boolean = true): cc.Node {
        const node = this._getOrAddNode(name, parent, x, y, w, h);
        const sprite = node.getComponent(cc.Sprite) || node.addComponent(cc.Sprite);
        if (this._sprites[key]) sprite.spriteFrame = this._sprites[key];
        this._applySpriteSize(node, sprite, w, h, keepRatio);
        return node;
    }

    private _getOrAddSpriteOriginal(name: string, parent: cc.Node, key: string, x: number, y: number): cc.Node {
        let node = parent.getChildByName(name);
        if (!node) {
            node = this._addSpriteOriginal(name, parent, key, x, y);
        } else {
            node.setPosition(x, y);
            node.active = true;
            const sprite = node.getComponent(cc.Sprite) || node.addComponent(cc.Sprite);
            if (this._sprites[key]) sprite.spriteFrame = this._sprites[key];
            this._applySpriteOriginalSize(node, sprite);
        }
        return node;
    }

    private _getOrAddLabel(name: string, parent: cc.Node, text: string, x: number, y: number, size: number, color: cc.Color): cc.Label {
        const node = this._getOrAddNode(name, parent, x, y, 360, size + 16);
        const label = node.getComponent(cc.Label) || node.addComponent(cc.Label);
        label.string = text;
        label.fontSize = size;
        label.lineHeight = size + 8;
        label.horizontalAlign = cc.Label.HorizontalAlign.CENTER;
        label.verticalAlign = cc.Label.VerticalAlign.CENTER;
        node.color = color;
        return label;
    }

    private _addNode(name: string, parent: cc.Node, x: number, y: number, w: number, h: number): cc.Node {
        const node = new cc.Node(name);
        node.setContentSize(w, h);
        node.setPosition(x, y);
        parent.addChild(node);
        return node;
    }

    private _addSprite(name: string, parent: cc.Node, key: string, x: number, y: number, w: number, h: number, keepRatio: boolean = true): cc.Node {
        const node = this._addNode(name, parent, x, y, w, h);
        const sprite = node.addComponent(cc.Sprite);
        if (this._sprites[key]) sprite.spriteFrame = this._sprites[key];
        this._applySpriteSize(node, sprite, w, h, keepRatio);
        return node;
    }

    private _addSpriteOriginal(name: string, parent: cc.Node, key: string, x: number, y: number): cc.Node {
        const node = this._addNode(name, parent, x, y, 1, 1);
        const sprite = node.addComponent(cc.Sprite);
        if (this._sprites[key]) sprite.spriteFrame = this._sprites[key];
        this._applySpriteOriginalSize(node, sprite);
        return node;
    }

    private _applySpriteOriginalSize(node: cc.Node, sprite: cc.Sprite) {
        if (!sprite) return;
        sprite.sizeMode = cc.Sprite.SizeMode.TRIMMED;
        const frame = sprite.spriteFrame;
        if (frame && frame.getOriginalSize) {
            const original = frame.getOriginalSize();
            node.setContentSize(original.width || 1, original.height || 1);
        } else if (frame && frame.getRect) {
            const rect = frame.getRect();
            node.setContentSize(rect.width || 1, rect.height || 1);
        }
        node.scaleX = 1;
        node.scaleY = 1;
    }

    private _applySpriteSize(node: cc.Node, sprite: cc.Sprite, targetW: number, targetH: number, keepRatio: boolean) {
        if (!sprite) return;
        if (!keepRatio) {
            sprite.sizeMode = cc.Sprite.SizeMode.CUSTOM;
            node.scaleX = 1;
            node.scaleY = 1;
            node.setContentSize(targetW, targetH);
            return;
        }

        sprite.sizeMode = cc.Sprite.SizeMode.TRIMMED;
        const frame = sprite.spriteFrame;
        let rawW = targetW;
        let rawH = targetH;
        if (frame && frame.getOriginalSize) {
            const original = frame.getOriginalSize();
            rawW = original.width || rawW;
            rawH = original.height || rawH;
        } else if (frame && frame.getRect) {
            const rect = frame.getRect();
            rawW = rect.width || rawW;
            rawH = rect.height || rawH;
        }
        node.setContentSize(rawW, rawH);
        const scale = Math.min(targetW / Math.max(1, rawW), targetH / Math.max(1, rawH));
        node.scaleX = scale;
        node.scaleY = scale;
    }

    private _setSprite(node: cc.Node, key: string) {
        const sprite = node && node.getComponent(cc.Sprite);
        if (sprite && this._sprites[key]) sprite.spriteFrame = this._sprites[key];
    }

    private _addLabel(name: string, parent: cc.Node, text: string, x: number, y: number, size: number, color: cc.Color): cc.Label {
        const node = this._addNode(name, parent, x, y, 360, size + 16);
        const label = node.addComponent(cc.Label);
        label.string = text;
        label.fontSize = size;
        label.lineHeight = size + 8;
        label.horizontalAlign = cc.Label.HorizontalAlign.CENTER;
        label.verticalAlign = cc.Label.VerticalAlign.CENTER;
        node.color = color;
        return label;
    }

    private _drawRect(node: cc.Node, color: cc.Color) {
        const graphics = node.getComponent(cc.Graphics);
        if (graphics) graphics.destroy();
        const sprite = node.getComponent(cc.Sprite) || node.addComponent(cc.Sprite);
        sprite.spriteFrame = this._getSolidFrame();
        sprite.sizeMode = cc.Sprite.SizeMode.CUSTOM;
        node.color = new cc.Color((color as any).r, (color as any).g, (color as any).b);
        node.opacity = (color as any).a;
        node.scaleX = 1;
        node.scaleY = 1;
    }

    private _getSolidFrame(): cc.SpriteFrame {
        if (this._solidFrame) return this._solidFrame;
        const texture = new cc.Texture2D();
        const data = new Uint8Array([255, 255, 255, 255]);
        texture.initWithData(data as any, cc.Texture2D.PixelFormat.RGBA8888, 1, 1);
        this._solidFrame = new cc.SpriteFrame(texture);
        return this._solidFrame;
    }
}
