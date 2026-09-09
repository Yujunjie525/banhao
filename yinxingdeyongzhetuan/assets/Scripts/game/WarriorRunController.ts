import GameState, { getProgress, saveProgress } from './GameState';
import StateBridge from './StateBridge';
import mGameData from '../Load/GameData';
import { getWarriorRunLevelConfig, getWarriorRunTotalLevels, WarriorRunLevelConfig } from './WarriorRunLevelConfig';
import UserDataSyncManager from '../Manager/UserDataSyncManager';
import TipsManager from '../Load/TipsManager';

type Dimension = 'qin' | 'forest';
type RunState = 'playing' | 'paused' | 'over';
type EntityType = 'gold' | 'energy' | 'star' | 'obstacle';
type WeatherType = 'none' | 'fog' | 'rain' | 'storm' | 'drought' | 'snow';
type ObstacleEffect = 'fatal' | 'slow' | 'drain';

// 新背景图已经画好了三条跑道，运行逻辑不再依赖场景里的 Lane0/1/2 节点。
const TRACK_LEFT = -198;
const TRACK_RIGHT = 198;
const TRACK_TOP = 640;
const TRACK_BOTTOM = -640;
const LANE_XS = [-148, 0, 150];
// 天气切换间隔。
const WEATHER_SWITCH_SECONDS = 60;
const LEVEL_WEATHER_SWITCH_SECONDS = 20;
// 天气切换前多少秒显示“气象乱流”提示。
const WEATHER_WARNING_SECONDS = 3;
// 游戏内 1 米对应的像素距离，用于实体下落速度、吸附范围等换算。
const METERS_TO_PIXELS = 58;
// 金币阵型里相邻金币的纵向间距。
const GOLD_PATTERN_STEP_PIXELS = 58;
// 玩家和实体在 y 轴距离小于该值时才判定碰撞/拾取。
const COLLISION_Y_THRESHOLD = 58;
// 雨天打滑后减速持续时间，可累计。
const RAIN_SLOW_SECONDS = 5;
// 普通减速障碍持续时间。
const NORMAL_SLOW_SECONDS = 5;
// 普通减速倍率，0.5 表示速度降低 50%。
const NORMAL_SLOW_MULTIPLIER = 0.5;
const TREASURE_SECONDS = 10;
const TREASURE_ENERGY_COST = 20;
const TREASURE_GOLD_STOP_SECONDS = 3;
const TREASURE_GOLD_MIN_ROWS = 18;
const TREASURE_GOLD_MAX_ROWS = 24;
const ENERGY_DISPLAY_UNIT = 10;
const LEVEL_STAR_COUNT = 3;
const SPAWNED_STAR_SCALE = 1.5;
const HUD_STAR_SCALE = 1.2;
const LEVEL_LAST_STAR_ARRIVAL_SECONDS = 8;
// 人物跑步序列帧帧率，数值越大播放越快。
const ROLE_RUN_FPS = 30;
interface WeatherParticle {
    // 天气粒子的当前位置和运动参数。
    x: number;
    y: number;
    speed: number;
    drift: number;
    size: number;
}

interface WeatherConfig {
    // HUD 显示名称、天气类型、HUD 字体颜色。
    name: string;
    type: WeatherType;
    color: cc.Color;
}

interface ObstacleState {
    // 同一个障碍在当前维度下显示什么、产生什么效果。
    name: string;
    effect: ObstacleEffect;
    color: cc.Color;
    desc: string;
    slowMultiplier?: number;
}

interface ObstacleConfig {
    // 一个障碍 id 对应秦朝/森林两套状态。
    id: number;
    qin: ObstacleState;
    forest: ObstacleState;
}

interface ObstacleArtConfig {
    path: string;
    width: number;
    height: number;
}

interface RunEntity {
    // 局内正在下落的实体：金币、能量块或障碍。
    node: cc.Node;
    lane: number;
    y: number;
    type: EntityType;
    obstacleId?: number;
    treasure?: boolean;
    hit: boolean;
}

interface SpawnWeights {
    goldLine: number;
    goldPile: number;
    energy: number;
    obstacle: number;
}

interface RunStageConfig {
    // 无尽模式阶段配置：到达 time 秒后启用本阶段速度、障碍池和天气权重。
    time: number;
    speedMultiplier: number;
    spawnIntervalMeters: number;
    spawnWeights: SpawnWeights;
    obstaclePool: number[];
    weatherWeights: number[];
}

interface RoleConfig {
    // 商店角色对应的局内属性和被动效果。
    index: number;
    baseSpeed: number;
    energyCap: number;
    goldMultiplier: number;
    invincibleSeconds: number;
    switchCost: number;
    dimensionCooldownSeconds: number;
    magnetMeters: number;
}

const { ccclass, property } = cc._decorator;

@ccclass
export default class WarriorRunController extends cc.Component {
    @property(cc.AudioClip)
    battleBgm: cc.AudioClip = null;

    @property(cc.AudioClip)
    clickAudio: cc.AudioClip = null;

    private battleBgmAudioId: number = -1;

    // 跑道数量，目前固定三条。
    private readonly laneCount = 3;
    // 兜底角色配置；读取商店角色失败或角色未解锁时使用。
    private readonly defaultRole: RoleConfig = {
        index: 0,
        baseSpeed: 9,
        energyCap: 100,
        goldMultiplier: 1,
        invincibleSeconds: 3,
        switchCost: 20,
        dimensionCooldownSeconds: 3,
        magnetMeters: 0,
    };
    // 商店 0-4 号角色的局内能力配置。
    private readonly roleConfigs: RoleConfig[] = [
        { index: 0, baseSpeed: 9, energyCap: 100, goldMultiplier: 1, invincibleSeconds: 3, switchCost: 20, dimensionCooldownSeconds: 3, magnetMeters: 0 },
        { index: 1, baseSpeed: 11, energyCap: 100, goldMultiplier: 1, invincibleSeconds: 5, switchCost: 20, dimensionCooldownSeconds: 3, magnetMeters: 0 },
        { index: 2, baseSpeed: 10.5, energyCap: 60, goldMultiplier: 2, invincibleSeconds: 3, switchCost: 20, dimensionCooldownSeconds: 3, magnetMeters: 0 },
        { index: 3, baseSpeed: 10, energyCap: 100, goldMultiplier: 1, invincibleSeconds: 3, switchCost: 20, dimensionCooldownSeconds: 3, magnetMeters: 5 },
        { index: 4, baseSpeed: 12, energyCap: 100, goldMultiplier: 1, invincibleSeconds: 3, switchCost: 10, dimensionCooldownSeconds: 5, magnetMeters: 0 },
    ];
    // 当前跑道中心点缓存，使用背景图内三条跑道的中心点。
    private laneXs = LANE_XS.slice();
    // 障碍配置表，_initConfigs 初始化。
    private readonly obstacleMap: { [id: number]: ObstacleConfig } = {};
    private readonly obstacleArtPaths: { [id: number]: ObstacleArtConfig } = {
        201: { path: '1Load/dongkou', width: 112, height: 99 },
        202: { path: '1Load/xiangjiao', width: 129, height: 99 },
        203: { path: '1Load/langan', width: 120, height: 140 },
        204: { path: '1Load/shitou', width: 115, height: 115 },
    };
    private readonly obstacleSpriteFrames: { [path: string]: cc.SpriteFrame } = {};
    private readonly obstacleSpriteLoading: { [path: string]: boolean } = {};
    private readonly qinMapSpriteFrames: { [path: string]: cc.SpriteFrame } = {};
    private readonly qinMapSpriteLoading: { [path: string]: boolean } = {};
    private readonly roleSpriteFrames: { [path: string]: cc.SpriteFrame } = {};
    private readonly roleSpriteLoading: { [path: string]: boolean } = {};
    private readonly roleRunFrames: { [roleIndex: number]: cc.SpriteFrame[] } = {};
    private readonly roleRunLoading: { [roleIndex: number]: boolean } = {};
    // 天气配置，数组顺序必须和 stage.weatherWeights 的权重顺序一致。
    private readonly weathers: WeatherConfig[] = [
        { name: '晴天', type: 'none', color: new cc.Color(255, 218, 82, 255) },
        { name: '雾天', type: 'fog', color: new cc.Color(190, 196, 202, 255) },
        { name: '雨天', type: 'rain', color: new cc.Color(90, 150, 255, 255) },
        { name: '台风', type: 'storm', color: new cc.Color(130, 220, 255, 255) },
        { name: '干旱', type: 'drought', color: new cc.Color(255, 150, 64, 255) },
        { name: '下雪', type: 'snow', color: new cc.Color(210, 238, 255, 255) },
    ];
    // 无尽模式阶段表：时间越往后，速度更快、障碍池更多、天气权重更恶劣。
    private readonly runStages: RunStageConfig[] = [
        { time: 0, speedMultiplier: 1.0, spawnIntervalMeters: 13, spawnWeights: { goldLine: 50, goldPile: 12, energy: 8, obstacle: 30 }, obstaclePool: [201, 202], weatherWeights: [55, 15, 10, 0, 10, 10] },
        { time: 60, speedMultiplier: 1.25, spawnIntervalMeters: 11, spawnWeights: { goldLine: 42, goldPile: 12, energy: 7, obstacle: 39 }, obstaclePool: [201, 202, 203], weatherWeights: [35, 20, 20, 10, 10, 5] },
        { time: 180, speedMultiplier: 1.55, spawnIntervalMeters: 9.5, spawnWeights: { goldLine: 34, goldPile: 11, energy: 6, obstacle: 49 }, obstaclePool: [201, 202, 203, 204], weatherWeights: [18, 20, 25, 17, 10, 10] },
        { time: 420, speedMultiplier: 1.9, spawnIntervalMeters: 8, spawnWeights: { goldLine: 27, goldPile: 10, energy: 5, obstacle: 58 }, obstaclePool: [201, 202, 203, 204, 201, 203, 204], weatherWeights: [8, 18, 25, 27, 10, 12] },
        { time: 780, speedMultiplier: 2.3, spawnIntervalMeters: 6.8, spawnWeights: { goldLine: 22, goldPile: 8, energy: 4, obstacle: 66 }, obstaclePool: [201, 202, 203, 204, 201, 203, 204, 201, 204], weatherWeights: [3, 15, 25, 37, 8, 12] },
    ];
    // 当前游戏状态：playing 正常跑、paused 暂停、over 死亡/结算中。
    private state: RunState = 'playing';
    // 场景节点引用区，_rebuildScene 会查找或创建这些节点。
    private canvas: cc.Node = null;
    private gameLayer: cc.Node = null;
    private qinMapNode: cc.Node = null;
    private forestMapNode: cc.Node = null;
    private entityLayer: cc.Node = null;
    private weatherFxLayer: cc.Node = null;
    private weatherFxGraphics: cc.Graphics = null;
    private feedbackFxLayer: cc.Node = null;
    private entityTemplates: cc.Node = null;
    private hudLayer: cc.Node = null;
    private popupLayer: cc.Node = null;
    private player: cc.Node = null;
    private qinPlayerNode: cc.Node = null;
    private forestPlayerNode: cc.Node = null;
    private energyFill: cc.Node = null;
    private energySegments: cc.Node[] = [];
    private dimensionBtn: cc.Node = null;
    private distanceLabel: cc.Label = null;
    private speedLabel: cc.Label = null;
    private treasureCountdownLabel: cc.Label = null;
    private energyLabel: cc.Label = null;
    private energyCountLabel: cc.Label = null;
    private weatherLabel: cc.Label = null;
    private levelStarsHud: cc.Node = null;
    private levelStarNodes: cc.Node[] = [];
    private starFullFrame: cc.SpriteFrame = null;
    private starGrayFrame: cc.SpriteFrame = null;
    private starSpritesLoading = false;
    private popupTitle: cc.Label = null;
    private popupInfo: cc.Label = null;
    private popupGold: cc.Label = null;
    private reviveBtn: cc.Node = null;
    private winResultPopup: cc.Node = null;
    private loseResultPopup: cc.Node = null;
    private xuguanPopup: cc.Node = null;
    private gameOverPopup: cc.Node = null;

    // 当前屏幕内还没被销毁的道具/障碍。
    private entities: RunEntity[] = [];
    // 当前目标跑道索引，0/1/2 分别是左/中/右。
    private lane = 1;
    // 玩家要缓动到的目标 x 坐标。
    private targetX = 0;
    // 本局距离、金币、能量等核心局内数据。
    private distance = 0;
    private gold = 0;
    private energy = 60;
    // 本局运行时间，影响阶段、速度、天气。
    private runTime = 0;
    // 累计跑了多少米后触发下一次实体生成。
    private spawnMeter = 0;
    // 当前天气已持续时间。
    private weatherTimer = 0;
    // 台风下一次强推玩家切道的倒计时。
    private stormPushTimer = 0;
    // 当前减速剩余时间和减速倍率。
    private speedDebuffTimer = 0;
    private speedDebuffMultiplier = 1;
    // 切层/复活后的无敌剩余时间。
    private invincibleTimer = 0;
    // 切层按钮冷却倒计时。
    private dimensionCooldownTimer = 0;
    // 本局是否已经使用过续命。
    private reviveUsed = false;
    // 当前维度和切换前维度。
    private dimension: Dimension = 'qin';
    private oldDimension: Dimension = 'qin';
    private transitionTimer = 0;
    private treasureTimer = 0;
    private treasureLane = 1;
    // 当前天气和当前角色配置。
    private currentWeather: WeatherConfig = null;
    private activeRole: RoleConfig = null;
    private activeRunRoleIndex = -1;
    private roleRunFrameIndex = 0;
    private roleRunFrameTimer = 0;
    // 天气粒子缓存。
    private weatherParticles: WeatherParticle[] = [];
    // 滑动起点，用来判断左右切道。
    private touchStartX = 0;
    private touchStartY = 0;
    // 最近一局金币缓存 key，供结算/其他界面读取。
    private readonly lastRunGoldKey = 'LastRunGold';
    // 防止复活后或多按钮路径重复结算金币。
    private runResultSaved = false;
    private currentLevelId = 1;
    private currentLevelConfig: WarriorRunLevelConfig = null;
    private timeLeftLabel: cc.Label = null;
    private levelCompleted = false;
    private spawnedLevelStars = 0;
    private collectedLevelStars = 0;
    private guideNode: cc.Node = null;
    private guideStepOneNode: cc.Node = null;
    private guideStepTwoNode: cc.Node = null;
    private guideSwipeFinger: cc.Node = null;
    private guideSwitchFinger: cc.Node = null;
    private guideSwitchButton: cc.Node = null;
    private guideStep = 0;
    private guideTouchStartX = 0;
    private guideTouchStartY = 0;

    // Cocos 生命周期：同步存档、搭建场景节点、开始一局跑酷。
    onLoad() {
        this._playBattleBgm();
        StateBridge.syncForStartScene();
        this.canvas = this.node.parent || this.node;
        this.canvas.on(cc.Node.EventType.TOUCH_END, this._playButtonClick, this);
        this._initConfigs();
        this._rebuildScene();
        this._preloadObstacleSprites();
        this._preloadStarSprites();
        this._startRun();
        this._setupFirstRunGuide();
    }

    onDestroy() {
        if (this.canvas) {
            this.canvas.off(cc.Node.EventType.TOUCH_END, this._playButtonClick, this);
        }
        if (this.battleBgmAudioId !== -1) {
            cc.audioEngine.stop(this.battleBgmAudioId);
            this.battleBgmAudioId = -1;
        }
    }

    private _playBattleBgm() {
        // All WarriorRun entry points converge here, so Start BGM cannot overlap the battle track.
        if (this.battleBgmAudioId !== -1) {
            cc.audioEngine.stop(this.battleBgmAudioId);
            this.battleBgmAudioId = -1;
        }
        if (!mGameData.isBGMOn || !this.battleBgm) return;
        this.battleBgmAudioId = cc.audioEngine.play(this.battleBgm, true, 1);
    }

    private _playButtonClick(event: cc.Event.EventTouch){
        if (!mGameData.isSoundOn || !this.clickAudio || !event) return;
        let target = event.target as cc.Node;
        while (target) {
            if (target.getComponent(cc.Button)) {
                cc.audioEngine.playEffect(this.clickAudio, false);
                return;
            }
            if (target === this.canvas) break;
            target = target.parent;
        }
    }

    // Cocos 每帧更新：推进时间、天气、移动、生成、碰撞和 HUD。
    update(dt: number) {
        if (this.state !== 'playing') return;
        dt = Math.min(dt, 0.05);

        this.runTime += dt;
        if (this.currentLevelConfig && this.runTime >= this.currentLevelConfig.passTime) {
            this._completeLevel();
            return;
        }
        this.weatherTimer += dt;
        this.spawnMeter += this._getFinalSpeed() * dt;

        if (this.weatherTimer >= this._getWeatherSwitchSeconds()) {
            this.weatherTimer = 0;
            this._switchWeather();
        }

        if (this.speedDebuffTimer > 0) {
            this.speedDebuffTimer = Math.max(0, this.speedDebuffTimer - dt);
            if (this.speedDebuffTimer <= 0) this.speedDebuffMultiplier = 1;
        }
        if (this.invincibleTimer > 0) this.invincibleTimer = Math.max(0, this.invincibleTimer - dt);
        if (this.dimensionCooldownTimer > 0) this.dimensionCooldownTimer = Math.max(0, this.dimensionCooldownTimer - dt);
        if (this.transitionTimer > 0) this.transitionTimer = Math.max(0, this.transitionTimer - dt);
        this._updateTreasureLayerTimer(dt);

        this._updateStorm(dt);
        this.distance += this._getFinalSpeed() * dt;
        this._updateTrack(dt);
        this._updateWeatherEffects(dt);
        this.targetX = this._getLaneCenterX(this.lane, this.player.parent);
        this.player.x += (this.targetX - this.player.x) * Math.min(1, dt * 14);
        this._updateRoleRunAnimation(dt);
        this._spawnEntities();
        this._spawnScheduledLevelStars();
        this._updateEntities(dt);
        this._updateMagnetCollection();
        this._checkCollisions();
        this._updateHUD();
    }

    // 无尽和关卡模式分别记录引导；无尽有两步，关卡只保留右滑步骤。
    private _setupFirstRunGuide() {
        this.guideNode = this.canvas && this.canvas.getChildByName('GuideNode');
        if (!this.guideNode) return;

        this.guideNode.zIndex = 1300;
        this.guideStepOneNode = this.guideNode.getChildByName('node1');
        this.guideStepTwoNode = this.guideNode.getChildByName('node2');
        this.guideSwipeFinger = this.guideStepOneNode && this.guideStepOneNode.getChildByName('shouzhi');
        this.guideSwitchFinger = this.guideStepTwoNode && this.guideStepTwoNode.getChildByName('shouzhi');
        this.guideSwitchButton = this.guideStepTwoNode && this.guideStepTwoNode.getChildByName('qiehuan');
        if (this.guideSwitchButton && !this.guideSwitchButton.getComponent(cc.Button)) {
            this.guideSwitchButton.addComponent(cc.Button);
        }

        const infiniteMode = this._isInfiniteMode();
        if (UserDataSyncManager.isWarriorRunGuideCompleted(infiniteMode)) {
            this.guideNode.active = false;
            return;
        }

        const missingStepOne = !this.guideStepOneNode || !this.guideSwipeFinger;
        const missingInfiniteStep = infiniteMode && (!this.guideStepTwoNode || !this.guideSwitchButton);
        if (missingStepOne || missingInfiniteStep) {
            cc.warn('[WarriorRun] GuideNode hierarchy is incomplete.');
            this.guideNode.active = false;
            return;
        }

        this.guideNode.on(cc.Node.EventType.TOUCH_START, this._onGuideTouchStart, this);
        this.guideNode.on(cc.Node.EventType.TOUCH_END, this._onGuideTouchEnd, this);
        if (infiniteMode) {
            this.guideSwitchButton.on(cc.Node.EventType.TOUCH_START, this._stopButtonTouch, this);
            this.guideSwitchButton.on(cc.Node.EventType.TOUCH_END, this._onGuideSwitchTap, this);
        }

        this._showGuideStepOne();
    }

    private _showGuideStepOne() {
        this.state = 'paused';
        this.guideStep = 1;
        this.guideNode.active = true;
        this.guideStepOneNode.active = true;
        if (this.guideStepTwoNode) this.guideStepTwoNode.active = false;
        this._alignGuideTargets();
        this._playGuideSwipeAnimation();
        this.scheduleOnce(() => {
            if (this.guideStep !== 1) return;
            this._alignGuideTargets();
            this._playGuideSwipeAnimation();
        }, 0);
    }

    private _showGuideStepTwo() {
        this.guideStep = 2;
        this.guideStepOneNode.active = false;
        this.guideStepTwoNode.active = true;
        if (this.guideSwipeFinger) {
            this.guideSwipeFinger.stopAllActions();
            this.guideSwipeFinger.opacity = 255;
        }
        this._alignGuideTargets();
        this._playGuideSwitchAnimation();
    }

    // Player 和 DimensionBtn 使用底部 Widget，需把适配后的世界坐标换算到 GuideNode 内。
    private _alignGuideTargets() {
        [this.gameLayer, this.player, this.hudLayer, this.dimensionBtn].forEach((node) => {
            const widget = node && node.getComponent(cc.Widget);
            if (widget) widget.updateAlignment();
        });

        if (this.player && this.guideSwipeFinger && this.guideStepOneNode) {
            const playerWorldPos = this.player.convertToWorldSpaceAR(cc.v2(0, 0));
            const playerGuidePos = this.guideStepOneNode.convertToNodeSpaceAR(playerWorldPos);
            // 手指图片的指尖位于中心点左上方，保留美术原本相对人物的偏移。
            this.guideSwipeFinger.setPosition(playerGuidePos.x + 46, playerGuidePos.y - 50);
        }

        if (this.dimensionBtn && this.guideSwitchButton && this.guideStepTwoNode) {
            const buttonWorldPos = this.dimensionBtn.convertToWorldSpaceAR(cc.v2(0, 0));
            const buttonGuidePos = this.guideStepTwoNode.convertToNodeSpaceAR(buttonWorldPos);
            this.guideSwitchButton.setPosition(buttonGuidePos);
            if (this.guideSwitchFinger) {
                this.guideSwitchFinger.setPosition(buttonGuidePos.x + 51, buttonGuidePos.y - 26);
            }
        }
    }

    private _playGuideSwipeAnimation() {
        const finger = this.guideSwipeFinger;
        if (!finger) return;
        const start = cc.v2(finger.x, finger.y);
        finger.stopAllActions();
        finger.opacity = 255;
        finger.setPosition(start);
        finger.runAction(cc.repeatForever(cc.sequence(
            cc.delayTime(0.2),
            cc.spawn(
                cc.moveTo(0.7, start.x + 150, start.y).easing(cc.easeSineInOut()),
                cc.fadeOut(0.7)
            ),
            cc.callFunc(() => {
                finger.setPosition(start);
                finger.opacity = 255;
            }),
            cc.delayTime(0.35)
        )));
    }

    private _playGuideSwitchAnimation() {
        const finger = this.guideSwitchFinger;
        if (!finger) return;
        const baseScale = finger.scale || 1;
        finger.stopAllActions();
        finger.scale = baseScale;
        finger.runAction(cc.repeatForever(cc.sequence(
            cc.scaleTo(0.45, baseScale * 0.78),
            cc.scaleTo(0.45, baseScale * 1.08)
        )));
    }

    private _onGuideTouchStart(event: cc.Event.EventTouch) {
        if (this.guideStep !== 1) return;
        this._stopButtonTouch(event);
        const pos = event.touch.getLocation();
        this.guideTouchStartX = pos.x;
        this.guideTouchStartY = pos.y;
    }

    private _onGuideTouchEnd(event: cc.Event.EventTouch) {
        if (this.guideStep !== 1) return;
        this._stopButtonTouch(event);
        const pos = event.touch.getLocation();
        const dx = pos.x - this.guideTouchStartX;
        const dy = pos.y - this.guideTouchStartY;
        if (dx <= Math.max(38, Math.abs(dy) * 1.2)) return;

        if (this._isInfiniteMode()) {
            this._showGuideStepTwo();
            return;
        }
        this._completeFirstRunGuide();
    }

    private _onGuideSwitchTap(event: cc.Event.EventTouch) {
        if (this.guideStep !== 2) return;
        this._stopButtonTouch(event);
        this._playButtonClick(event);
        if (this.guideSwitchFinger) this.guideSwitchFinger.stopAllActions();
        this._completeFirstRunGuide();
    }

    private _completeFirstRunGuide() {
        UserDataSyncManager.completeWarriorRunGuide(this._isInfiniteMode());
        this.guideStep = 0;
        this.guideNode.active = false;
        this.state = 'playing';
    }

    // 初始化障碍配置表。新增/修改障碍效果主要改这里。
    private _initConfigs() {
        this.currentWeather = this.weathers[0];
        const fatal = (name: string, color: cc.Color, desc: string): ObstacleState => ({ name, color, desc, effect: 'fatal' });
        const slow = (name: string, color: cc.Color, desc: string, slowMultiplier = NORMAL_SLOW_MULTIPLIER): ObstacleState => ({ name, color, desc, effect: 'slow', slowMultiplier });

        [
            {
                id: 201,
                qin: fatal('黑洞', new cc.Color(126, 82, 45, 255), '致命'),
                forest: fatal('黑洞', new cc.Color(126, 82, 45, 255), '致命'),
            },
            {
                id: 202,
                qin: slow('香蕉皮', new cc.Color(58, 70, 130, 255), '减速'),
                forest: slow('香蕉皮', new cc.Color(58, 70, 130, 255), '减速'),
            },
            {
                id: 203,
                qin: fatal('路障', new cc.Color(120, 120, 120, 255), '致命'),
                forest: fatal('路障', new cc.Color(120, 120, 120, 255), '致命'),
            },
            {
                id: 204,
                qin: fatal('石头', new cc.Color(154, 132, 96, 255), '致命'),
                forest: fatal('石头', new cc.Color(154, 132, 96, 255), '致命'),
            },
        ].forEach((item) => this.obstacleMap[item.id] = item);
    }

    // 查找场景已有节点；缺失时创建兜底节点，保证脚本能独立运行。
    private _rebuildScene() {
        this.node.active = true;
        this.canvas.setContentSize(720, 1280);
        this.canvas.color = cc.Color.WHITE;

        this.gameLayer = this._findOrCreateNode('RunGameLayer', this.canvas, 720, 1280);
        this.qinMapNode = this.gameLayer.getChildByName('QinMap');
        this.forestMapNode = this.gameLayer.getChildByName('ForestMap');
        if (this.qinMapNode) this.qinMapNode.zIndex = 0;
        if (this.forestMapNode) this.forestMapNode.zIndex = 0;
        if (this.gameLayer.children.length === 0) {
            this._makeLayerColor(this.gameLayer, new cc.Color(20, 8, 10, 255));
            this._buildTrack();
        }
        this._fitTrackToMap();

        this.entityLayer = this._findOrCreateNode('EntityLayer', this.gameLayer, 720, 1280);
        this.entityLayer.zIndex = 20;
        this.entityLayer.removeAllChildren();
        this.entityTemplates = this.gameLayer.getChildByName('EntityTemplates');
        if (this.entityTemplates) {
            this.entityTemplates.zIndex = -1;
            this.entityTemplates.active = false;
        }
        this.player = this._findOrCreateNode('Player', this.gameLayer, 58, 78);
        this.player.zIndex = 30;
        this.qinPlayerNode = this.player.getChildByName('QinSkin');
        this.forestPlayerNode = this.player.getChildByName('ForestSkin');
        if (this.player.y === 0) this.player.y = -455;
        this._drawPlayer();
        this.weatherFxLayer = this.canvas.getChildByName('WeatherFxLayer') || this.gameLayer.getChildByName('WeatherFxLayer');
        if (!this.weatherFxLayer) this.weatherFxLayer = this._node('WeatherFxLayer', this.canvas, 720, 1280);
        if (this.weatherFxLayer.parent !== this.canvas) this.weatherFxLayer.parent = this.canvas;
        this.weatherFxLayer.setContentSize(720, 1280);
        this.weatherFxLayer.setPosition(0, 0);
        this.weatherFxLayer.opacity = 255;
        this.weatherFxLayer.zIndex = 900;
        this.weatherFxGraphics = this.weatherFxLayer.getComponent(cc.Graphics);
        if (!this.weatherFxGraphics) this.weatherFxGraphics = this.weatherFxLayer.addComponent(cc.Graphics);
        this.weatherFxGraphics.enabled = true;
        this.feedbackFxLayer = this._findOrCreateNode('FeedbackFxLayer', this.gameLayer, 720, 1280);
        this.feedbackFxLayer.zIndex = 1100;

        this.hudLayer = this._findOrCreateNode('HUDLayer', this.canvas, 720, 1280);
        this.hudLayer.zIndex = 1000;
        this._buildHUD();
        this.popupLayer = this._findOrCreateNode('PopupLayer', this.canvas, 720, 1280);
        this.popupLayer.zIndex = 1200;
        this.popupLayer.active = false;
        this._buildPopup();
        this._bindVisualPopups();

        this.canvas.on(cc.Node.EventType.TOUCH_START, this._onTouchStart, this);
        this.canvas.on(cc.Node.EventType.TOUCH_END, this._onTouchEnd, this);
        this.canvas.on(cc.Node.EventType.TOUCH_CANCEL, this._onTouchEnd, this);
    }

    // 没有预制背景节点时的兜底底色；真实跑道由背景图承载。
    private _buildTrack() {
        const track = this._node('TrackFallback', this.gameLayer, TRACK_RIGHT - TRACK_LEFT, TRACK_TOP - TRACK_BOTTOM);
        track.x = (TRACK_LEFT + TRACK_RIGHT) * 0.5;
        track.y = (TRACK_TOP + TRACK_BOTTOM) * 0.5;
        this._makeLayerColor(track, new cc.Color(170, 102, 32, 255));
    }

    // 查找或创建局内 HUD：能量条、天气、距离、速度、暂停、切层按钮。
    private _buildHUD() {
        const energyBg = this._findOrCreateNode('EnergyBg', this.hudLayer, 260, 24, cc.v2(-205, 555));
        if (!this._hasSpriteFrame(energyBg) && !energyBg.getComponent(cc.Graphics)) {
            this._makeLayerColor(energyBg, new cc.Color(28, 40, 48, 230));
        }
        this._syncEnergySegments(energyBg);
        if (this.energySegments.length > 0) {
            this.energyFill = energyBg.getChildByName('EnergyFill');
            if (this.energyFill) this.energyFill.active = false;
        } else {
            this.energyFill = this._findOrCreateNode('EnergyFill', energyBg, 250, 16, cc.v2(-125, 0));
            this.energyFill.setAnchorPoint(0, 0.5);
            this.energyFill.height = Math.max(1, energyBg.height - 8);
            this.energyFill.x = -energyBg.width * 0.5 + 5;
            this.energyFill.y = 0;
            if (!this._hasSpriteFrame(this.energyFill) && !this.energyFill.getComponent(cc.Graphics)) {
                this._makeLayerColor(this.energyFill, new cc.Color(58, 218, 236, 255));
            }
        }

        this.energyLabel = this._findOrCreateLabel('energyLabel', this.hudLayer, 'Energy 60/100', 22, cc.Color.WHITE, cc.v2(-205, 590));
        this.energyLabel.node.active = false;
        this.energyCountLabel = this._findOrCreateEditableLabel('energyCountLabel', this.hudLayer, '6/10', 18, cc.Color.WHITE, cc.v2(-205, 528));
        this.weatherLabel = this._findOrCreateLabel('weatherLabel', this.hudLayer, 'Weather: Clear', 24, cc.Color.WHITE, cc.v2(0, 585));
        this.distanceLabel = this._findOrCreateLabel('distanceLabel', this.hudLayer, '0m', 42, cc.Color.WHITE, cc.v2(0, 535));
        this.timeLeftLabel = this._findOrCreateEditableLabel('timeLeftLabel', this.hudLayer, '第1关 00：30', 24, new cc.Color(255, 232, 92, 255), cc.v2(-205, 555));
        this.timeLeftLabel.node.setPosition(-221, 555);
        this.timeLeftLabel.node.setContentSize(270, 40);
        this._enableTopWidget(this.timeLeftLabel.node, 58);
        this._buildLevelStarsHud();
        this.speedLabel = this._findOrCreateLabel('speedLabel', this.hudLayer, 'Speed 0.0m/s', 20, new cc.Color(220, 230, 236, 255), cc.v2(0, 465));
        this.treasureCountdownLabel = this._findOrCreateEditableLabel('treasureCountdownLabel', this.hudLayer, '', 20, new cc.Color(255, 232, 92, 255), cc.v2(0, 435));

        this._findOrCreateButton('PauseBtn', this.hudLayer, '', 88, 54, cc.v2(285, 565), () => this._pause());
        this.dimensionBtn = this._findOrCreateButton('DimensionBtn', this.hudLayer, '', 118, 118, cc.v2(0, -535), () => this._tapDimension(), false);
        this._ensureDimensionButtonUI();
    }

    // 创建通用暂停/失败兜底弹窗。已有美术弹窗优先走场景节点。
    private _buildPopup() {
        this._clearGeneratedGraphics(this.popupLayer);
        const panel = this._findOrCreateNode('Panel', this.popupLayer, 580, 560);
        this._clearGeneratedGraphics(panel);

        this.popupTitle = this._findOrCreatePopupLabel('Title', panel, 'Pause', 44, new cc.Color(255, 197, 90, 255), cc.v2(0, 200));
        this.popupInfo = this._findOrCreatePopupLabel('Info', panel, '', 28, cc.Color.WHITE, cc.v2(0, 95));
        this.popupGold = this._findOrCreatePopupLabel('Gold', panel, '', 26, new cc.Color(255, 220, 80, 255), cc.v2(0, 45));
        this.reviveBtn = this._findOrCreateButton('PrimaryBtn', panel, '', 360, 78, cc.v2(0, -80), () => this._onPrimaryPopup(), false);
        this._hideButtonLabel(this.reviveBtn);
        const backBtn = this._findOrCreateButton('BackBtn', panel, '', 360, 72, cc.v2(0, -185), () => this._returnToStart(), false);
        this._hideButtonLabel(backBtn);
    }

    // 藏宝洞按钮直接通过本体颜色表示可用状态。
    private _ensureDimensionButtonUI() {
        if (!this.dimensionBtn) return;

        this._setChildActive(this.dimensionBtn, 'Label', false);
        this._setChildActive(this.dimensionBtn, 'CostLabel', false);
    }

    private _syncEnergySegments(energyBg?: cc.Node) {
        const bg = energyBg
            || (this.energyFill && this.energyFill.parent)
            || (this.energySegments.length > 0 && this.energySegments[0].parent);
        if (!bg) return;
        this.energySegments = bg.children
            .filter((node) => node.name === 'tubiaonengliangtiao2' && node.getComponent(cc.Sprite))
            .sort((a, b) => a.x - b.x)
            .slice(0, 10);
    }

    // 从商店存档读取当前角色，并把角色被动应用到本局。
    private _applySelectedRole() {
        if (mGameData.GetUnlockedRolesData) mGameData.GetUnlockedRolesData();
        if (mGameData.GetCurrentRoleData) mGameData.GetCurrentRoleData();
        const roleIndex = Math.max(0, Math.floor(Number(mGameData.currentRole) || 0));
        const unlocked = Array.isArray(mGameData.unlockedRoles) ? mGameData.unlockedRoles : [];
        const selected = this.roleConfigs[roleIndex] || this.defaultRole;
        this.activeRole = unlocked[roleIndex] === false ? this.defaultRole : selected;
        this._applyQinMapForCurrentLevel();
        this._applyRoleSkinsForSelectedRole();
    }

    // Qin layer changes background every 20 levels; ForestMap keeps the editor-configured beijing_gold.
    private _applyQinMapForCurrentLevel() {
        if (!this.qinMapNode) return;

        const path = this._getQinMapPathForCurrentLevel();
        const sprite = this.qinMapNode.getComponent(cc.Sprite) || this.qinMapNode.addComponent(cc.Sprite);
        sprite.sizeMode = cc.Sprite.SizeMode.CUSTOM;

        const cachedSpriteFrame = this.qinMapSpriteFrames[path];
        if (cachedSpriteFrame) {
            sprite.spriteFrame = cachedSpriteFrame;
            this._updateWidgetAlignment(this.qinMapNode);
            return;
        }

        if (this.qinMapSpriteLoading[path]) return;
        this.qinMapSpriteLoading[path] = true;
        cc.loader.loadRes(path, cc.SpriteFrame, (err: Error, spriteFrame: cc.SpriteFrame) => {
            this.qinMapSpriteLoading[path] = false;
            if (err || !spriteFrame) {
                cc.warn('[WarriorRun] load qin map failed:', path, err);
                return;
            }

            this.qinMapSpriteFrames[path] = spriteFrame;
            if (this._getQinMapPathForCurrentLevel() !== path) return;
            if (this.qinMapNode && this.qinMapNode.isValid) {
                const currentSprite = this.qinMapNode.getComponent(cc.Sprite) || this.qinMapNode.addComponent(cc.Sprite);
                currentSprite.spriteFrame = spriteFrame;
                currentSprite.sizeMode = cc.Sprite.SizeMode.CUSTOM;
                this._updateWidgetAlignment(this.qinMapNode);
            }
        });
    }

    private _getQinMapPathForCurrentLevel(): string {
        const level = Math.max(1, Math.floor(Number(this.currentLevelId) || 1));
        const index = Math.max(1, Math.min(5, Math.floor((level - 1) / 20) + 1));
        return `2Main/beijingditu${index}`;
    }

    private _updateWidgetAlignment(node: cc.Node) {
        const widget = node && node.getComponent(cc.Widget);
        if (widget) widget.updateAlignment();
    }

    // Play the selected shop role's run frames on both layer skins.
    private _applyRoleSkinsForSelectedRole() {
        if (!this.qinPlayerNode && !this.forestPlayerNode) return;

        const roleIndex = Math.max(0, Math.min(4, Math.floor(Number(this._getRole().index) || 0)));
        this.activeRunRoleIndex = roleIndex;
        this.roleRunFrameIndex = 0;
        this.roleRunFrameTimer = 0;

        const cachedFrames = this.roleRunFrames[roleIndex];
        if (cachedFrames && cachedFrames.length > 0) {
            this._applyRoleRunFrame(cachedFrames[0]);
            return;
        }

        if (this.roleRunLoading[roleIndex]) return;
        this.roleRunLoading[roleIndex] = true;
        const animPath = `anim/role${roleIndex + 1}`;
        cc.loader.loadResDir(animPath, cc.SpriteFrame, (err: Error, frames: cc.SpriteFrame[], urls: string[]) => {
            this.roleRunLoading[roleIndex] = false;
            if (err || !frames || frames.length <= 0) {
                cc.warn('[WarriorRun] load role run animation failed:', animPath, err);
                this._applyStaticRoleSkinFallback(roleIndex);
                return;
            }

            const sortedFrames = frames
                .map((frame, index) => ({ frame, url: urls && urls[index] ? urls[index] : frame.name }))
                .sort((a, b) => this._getFrameSortValue(a.url) - this._getFrameSortValue(b.url))
                .map((item) => item.frame);
            this.roleRunFrames[roleIndex] = sortedFrames;
            if (this._getRole().index === roleIndex) {
                this.activeRunRoleIndex = roleIndex;
                this.roleRunFrameIndex = 0;
                this.roleRunFrameTimer = 0;
                this._applyRoleRunFrame(sortedFrames[0]);
            }
        });
    }

    private _applyStaticRoleSkinFallback(roleIndex: number) {
        const path = `2Main/${roleIndex + 1}`;
        const cachedSpriteFrame = this.roleSpriteFrames[path];
        if (cachedSpriteFrame) {
            this._applyRoleRunFrame(cachedSpriteFrame);
            return;
        }

        if (this.roleSpriteLoading[path]) return;
        this.roleSpriteLoading[path] = true;
        cc.loader.loadRes(path, cc.SpriteFrame, (err: Error, spriteFrame: cc.SpriteFrame) => {
            this.roleSpriteLoading[path] = false;
            if (err || !spriteFrame) {
                cc.warn('[WarriorRun] load role skin fallback failed:', path, err);
                return;
            }

            this.roleSpriteFrames[path] = spriteFrame;
            if (this._getRole().index === roleIndex) this._applyRoleRunFrame(spriteFrame);
        });
    }

    private _getFrameSortValue(url: string): number {
        const match = String(url || '').match(/(\d+)(?!.*\d)/);
        return match ? Number(match[1]) : 0;
    }

    private _applyRoleRunFrame(spriteFrame: cc.SpriteFrame) {
        const applyFrame = (node: cc.Node) => {
            if (!node || !node.isValid || !spriteFrame) return;
            const sprite = node.getComponent(cc.Sprite) || node.addComponent(cc.Sprite);
            sprite.spriteFrame = spriteFrame;
            sprite.sizeMode = cc.Sprite.SizeMode.RAW;
            sprite.trim = false;
        };
        applyFrame(this.qinPlayerNode);
        applyFrame(this.forestPlayerNode);
    }

    private _updateRoleRunAnimation(dt: number) {
        const roleIndex = Math.max(0, Math.min(4, Math.floor(Number(this._getRole().index) || 0)));
        if (this.activeRunRoleIndex !== roleIndex) {
            this._applyRoleSkinsForSelectedRole();
            return;
        }

        const frames = this.roleRunFrames[roleIndex];
        if (!frames || frames.length <= 1) return;
        const animationSpeedMultiplier = this.speedDebuffTimer > 0 ? this.speedDebuffMultiplier : 1;
        const frameSeconds = 1 / Math.max(1, ROLE_RUN_FPS);
        this.roleRunFrameTimer += dt * animationSpeedMultiplier;
        if (this.roleRunFrameTimer < frameSeconds) return;

        const advancedFrames = Math.floor(this.roleRunFrameTimer / frameSeconds);
        this.roleRunFrameTimer -= advancedFrames * frameSeconds;
        this.roleRunFrameIndex = (this.roleRunFrameIndex + advancedFrames) % frames.length;
        this._applyRoleRunFrame(frames[this.roleRunFrameIndex]);
    }

    // 获取当前角色配置，空值时返回默认角色。
    private _getRole(): RoleConfig {
        return this.activeRole || this.defaultRole;
    }

    // 当前角色基础速度。
    private _getBaseSpeed(): number {
        return this._getRole().baseSpeed;
    }

    // 当前角色能量上限。
    private _getEnergyCap(): number {
        return this._getRole().energyCap;
    }

    // Treasure layer entry cost.
    private _getSwitchCost(): number {
        return TREASURE_ENERGY_COST;
    }

    // 当前角色切层后的无敌秒数。
    private _getInvincibleSeconds(): number {
        return this._getRole().invincibleSeconds;
    }

    // 当前角色切层冷却秒数。
    private _getDimensionCooldownSeconds(): number {
        return this._getRole().dimensionCooldownSeconds;
    }

    // 单个金币实际收益，受天气和角色金币倍率影响。
    private _getGoldValue(): number {
        const baseGold = this.currentWeather.type === 'drought' ? 1 : 2;
        return Math.max(1, Math.floor(baseGold * this._getRole().goldMultiplier));
    }

    private _isInfiniteMode(): boolean {
        return !!mGameData.isInfiniteMode;
    }

    private _loadSelectedLevelConfig() {
        if (this._isInfiniteMode()) {
            const selected = Math.max(1, Math.floor(Number(GameState.selectedLevel || mGameData.currentLevel || mGameData.unlockedLevel) || 1));
            this.currentLevelId = selected;
            this.currentLevelConfig = null;
            return;
        }
        const totalLevels = getWarriorRunTotalLevels();
        const selected = Math.max(1, Math.floor(Number(GameState.selectedLevel || mGameData.currentLevel) || 1));
        this.currentLevelId = Math.max(1, Math.min(totalLevels, selected));
        GameState.selectedLevel = this.currentLevelId;
        mGameData.isInfiniteMode = false;
        mGameData.currentLevel = this.currentLevelId;
        this.currentLevelConfig = getWarriorRunLevelConfig(this.currentLevelId);
    }

    // Reset all runtime state for the selected level.
    private _startRun() {
        this._loadSelectedLevelConfig();
        this._applySelectedRole();
        this.state = 'playing';
        this.runResultSaved = false;
        this.levelCompleted = false;
        this._hideAllPopups();
        this.hudLayer.active = true;
        this.entities.forEach((entity) => entity.node.destroy());
        this.entities = [];
        this.lane = 1;
        this.targetX = this._getLaneCenterX(this.lane, this.player.parent);
        this.player.x = this.targetX;
        this.distance = 0;
        this.gold = 0;
        const startingEnergy = this._isInfiniteMode() ? TREASURE_ENERGY_COST : 60;
        this.energy = Math.min(startingEnergy, this._getEnergyCap());
        this.spawnedLevelStars = 0;
        this.collectedLevelStars = 0;
        this.runTime = 0;
        this.spawnMeter = 0;
        this.weatherTimer = 0;
        this.stormPushTimer = 6;
        this.weatherParticles = [];
        this.speedDebuffTimer = 0;
        this.speedDebuffMultiplier = 1;
        this.invincibleTimer = 0;
        this.dimensionCooldownTimer = 0;
        this.reviveUsed = false;
        this.transitionTimer = 0;
        this.treasureTimer = 0;
        this.treasureLane = 1;
        this.dimension = 'qin';
        this.oldDimension = 'qin';
        this.currentWeather = this.weathers[0];
        this._applyDimensionLook();
        this._applyModeHudVisibility();
        this._refreshLevelStarsHud();
        this._updateHUD();
    }

    // 计算当前最终速度：角色基础速度 * 阶段倍率 * 天气倍率 * 减速 Buff。
    private _getFinalSpeed(): number {
        let stage = this._getCurrentStage().speedMultiplier;
        let weather = this.currentWeather.type === 'snow' ? 0.8 : 1;
        let debuff = this.speedDebuffTimer > 0 ? this.speedDebuffMultiplier : 1;
        return this._getBaseSpeed() * stage * weather * debuff;
    }

    // 按跑动距离触发一波实体生成，决定这一波是金币、金币堆、能量还是障碍。
    private _spawnEntities() {
        const stage = this._getCurrentStage();
        if (this.spawnMeter < stage.spawnIntervalMeters) return;
        this.spawnMeter = 0;
        if (this.dimension === 'forest') {
            if (this.treasureTimer > TREASURE_GOLD_STOP_SECONDS) this._spawnTreasureGoldTrail();
            return;
        }
        const weights = stage.spawnWeights;
        const energyWeight = this.currentLevelConfig ? 0 : weights.energy;
        const totalWeight = weights.goldLine + weights.goldPile + energyWeight + weights.obstacle;
        let roll = Math.random() * totalWeight;
        if (roll < weights.goldLine) {
            this._spawnGoldLine();
            return;
        }
        roll -= weights.goldLine;
        if (roll < weights.goldPile) {
            this._spawnGoldPile();
            return;
        }
        roll -= weights.goldPile;
        if (roll < energyWeight) {
            this._spawnEntity(Math.floor(Math.random() * this.laneCount), 'energy');
            return;
        }
        this._spawnObstacle();
    }

    private _spawnScheduledLevelStars() {
        if (!this.currentLevelConfig || this.spawnedLevelStars >= LEVEL_STAR_COUNT) return;
        const passTime = this.currentLevelConfig.passTime;
        const arrivalTimes = [
            passTime * 0.3,
            passTime * 0.55,
            Math.max(passTime * 0.75, passTime - LEVEL_LAST_STAR_ARRIVAL_SECONDS),
        ];
        const travelSeconds = Math.max(0.8, (700 - this.player.y) / Math.max(1, this._getFinalSpeed() * METERS_TO_PIXELS));
        while (this.spawnedLevelStars < LEVEL_STAR_COUNT
            && this.runTime >= Math.max(0, arrivalTimes[this.spawnedLevelStars] - travelSeconds)) {
            this._spawnEntity(this._pickLevelStarLane(), 'star');
            this.spawnedLevelStars++;
        }
    }

    private _pickLevelStarLane(): number {
        const candidates = [0, 1, 2].filter((lane) => !this.entities.some((entity) =>
            entity.type === 'obstacle' && entity.lane === lane && entity.y > 360
        ));
        const lanes = candidates.length > 0 ? candidates : [0, 1, 2];
        return lanes[Math.floor(Math.random() * lanes.length)];
    }

    // 根据本局运行时间获取当前无尽阶段。
    private _getCurrentStage(): RunStageConfig {
        if (this.currentLevelConfig) {
            return {
                time: 0,
                speedMultiplier: this.currentLevelConfig.speedMultiplier,
                spawnIntervalMeters: this.currentLevelConfig.spawnIntervalMeters,
                spawnWeights: this.currentLevelConfig.spawnWeights,
                obstaclePool: this.currentLevelConfig.obstaclePool,
                weatherWeights: this.currentLevelConfig.weatherWeights,
            };
        }
        for (let i = this.runStages.length - 1; i >= 0; i--) {
            if (this.runTime >= this.runStages[i].time) return this.runStages[i];
        }
        return this.runStages[0];
    }

    // 生成单列金币或小波浪金币。
    private _spawnGoldLine() {
        const lane = Math.floor(Math.random() * this.laneCount);
        const count = 2 + Math.floor(Math.random() * 2);
        const wave = Math.random() < 0.35;
        for (let i = 0; i < count; i++) {
            const laneOffset = wave ? (i % 2 === 0 ? 0 : (Math.random() < 0.5 ? -1 : 1)) : 0;
            this._spawnEntity(this._clampLane(lane + laneOffset), 'gold', i * 70);
        }
    }

    // 生成 S/V 型金币堆，并有概率在附近放风险障碍。
    private _spawnGoldPile() {
        const pattern = Math.random() < 0.5 ? 's' : 'v';
        const lanes = pattern === 's' ? [0, 1, 2, 1] : [0, 1, 2, 1];
        if (Math.random() < 0.5) lanes.reverse();
        const baseOffset = pattern === 's' ? 0 : 30;
        for (let i = 0; i < lanes.length; i++) {
            this._spawnEntity(this._clampLane(lanes[i]), 'gold', baseOffset + i * GOLD_PATTERN_STEP_PIXELS);
        }
        if (this.dimension !== 'forest' && Math.random() < 0.55) this._spawnObstacleNearGoldPile();
    }

    // Treasure layer creates dense, varied gold trails without locking every wave to one shape.
    private _spawnTreasureGoldTrail() {
        const lane = this.treasureLane;
        const rows = TREASURE_GOLD_MIN_ROWS + Math.floor(Math.random() * (TREASURE_GOLD_MAX_ROWS - TREASURE_GOLD_MIN_ROWS + 1));
        const gap = GOLD_PATTERN_STEP_PIXELS - 18 + Math.floor(Math.random() * 17);
        const sideLane = this._pickNextTreasureLane(lane);
        const thirdLane = [0, 1, 2].filter((item) => item !== lane && item !== sideLane)[0];
        const sideStart = Math.floor(Math.random() * 3);
        const sideEvery = 2 + Math.floor(Math.random() * 2);
        const burstStart = 2 + Math.floor(Math.random() * 4);
        const burstEvery = 5 + Math.floor(Math.random() * 3);
        for (let row = 0; row < rows; row++) {
            const offsetY = row * gap;
            this._spawnTreasureGold(lane, offsetY);
            if ((row + sideStart) % sideEvery === 0) {
                this._spawnTreasureGold(sideLane, offsetY + Math.floor(gap * 0.45));
            }
            if (row >= burstStart && (row - burstStart) % burstEvery === 0) {
                this._spawnTreasureGold(sideLane, offsetY + Math.floor(gap * 0.18));
                this._spawnTreasureGold(thirdLane, offsetY + Math.floor(gap * 0.36));
            }
            if (Math.random() < 0.18) {
                this._spawnTreasureGold(Math.floor(Math.random() * this.laneCount), offsetY + Math.floor(Math.random() * gap));
            }
        }
        this.treasureLane = Math.random() < 0.25 ? Math.floor(Math.random() * this.laneCount) : sideLane;
    }

    private _spawnTreasureGold(lane: number, offsetY: number) {
        this._spawnEntity(this._clampLane(lane), 'gold', Math.max(0, offsetY), undefined, true);
    }

    private _pickNextTreasureLane(currentLane: number): number {
        const lanes: number[] = [];
        for (let lane = 0; lane < this.laneCount; lane++) {
            if (lane !== currentLane) lanes.push(lane);
        }
        return lanes[Math.floor(Math.random() * lanes.length)] || 1;
    }

    // Spawn one obstacle from the current stage pool.
    private _spawnObstacle() {
        const pool = this._getCurrentStage().obstaclePool;
        const lane = Math.floor(Math.random() * this.laneCount);
        this._spawnEntity(lane, 'obstacle', 0, pool[Math.floor(Math.random() * pool.length)]);
    }

    // 金币堆附近的诱导风险障碍。
    private _spawnObstacleNearGoldPile() {
        const riskyIds = [202].filter((id) => this._getCurrentStage().obstaclePool.indexOf(id) !== -1);
        if (riskyIds.length <= 0) return;
        const lane = Math.floor(Math.random() * this.laneCount);
        const id = riskyIds[Math.floor(Math.random() * riskyIds.length)];
        this._spawnEntity(lane, 'obstacle', 20, id);
    }

    // 把跑道索引限制在 0-2。
    private _clampLane(lane: number): number {
        return Math.max(0, Math.min(this.laneCount - 1, lane));
    }

    // 创建一个下落实体并放入 entities 列表。
    private _spawnEntity(lane: number, type: EntityType, offsetY = 0, obstacleId?: number, treasure = false) {
        const node = this._createEntityNode(type);
        node.x = this._getLaneCenterX(lane, this.entityLayer);
        node.y = 700 + offsetY;
        const entity: RunEntity = { node, lane, y: node.y, type, obstacleId, treasure, hit: false };
        this._styleEntity(entity);
        this.entities.push(entity);
    }

    // 实例化实体模板；模板不存在时创建兜底节点。
    private _createEntityNode(type: EntityType): cc.Node {
        const templateName = type === 'gold' ? 'GoldTemplate' : type === 'energy' ? 'EnergyTemplate' : type === 'star' ? '' : 'ObstacleTemplate';
        let template: cc.Node = null;
        if (templateName && this.entityTemplates) template = this.entityTemplates.getChildByName(templateName);
        if (template) {
            const node = cc.instantiate(template);
            node.name = type;
            node.active = true;
            this.entityLayer.addChild(node);
            return node;
        }
        return this._node(type, this.entityLayer, type === 'obstacle' ? 118 : 59, type === 'obstacle' ? 78 : 58);
    }

    // 根据实体类型和当前维度刷新显示文本/颜色。
    private _styleEntity(entity: RunEntity) {
        if (entity.type === 'gold') {
            entity.node.setScale(1);
            if (!this._hasSpriteFrame(entity.node) && !entity.node.getComponent(cc.Graphics)) {
                this._makeLayerColor(entity.node, new cc.Color(245, 190, 46, 255));
                // this._label('GoldText', entity.node, '$', 28, new cc.Color(90, 55, 0, 255));
            }
        } else if (entity.type === 'energy') {
            if (!this._hasSpriteFrame(entity.node) && !entity.node.getComponent(cc.Graphics)) {
                this._makeLayerColor(entity.node, new cc.Color(54, 220, 235, 255));
                // this._label('EnergyText', entity.node, 'E', 26, new cc.Color(5, 55, 70, 255));
            }
        } else if (entity.type === 'star') {
            entity.node.setScale(SPAWNED_STAR_SCALE);
            this._setStarSpriteFrame(entity.node, this.starFullFrame);
        } else {
            const state = this.obstacleMap[entity.obstacleId][this.dimension];
            const hasArt = this._applyObstacleSprite(entity);
            if (!hasArt && !this._hasVisibleSpriteFrame(entity.node)) {
                this._makeLayerColor(entity.node, state.color);
            }
            if (hasArt) {
                this._setChildActive(entity.node, 'Icon', false);
                this._setChildActive(entity.node, 'Name', false);
                this._setChildActive(entity.node, 'Desc', false);
            } else {
                this._setChildActive(entity.node, 'Name', true);
                this._setChildActive(entity.node, 'Desc', true);
                this._setChildLabel(entity.node, 'Name', state.name, 20, cc.Color.WHITE, cc.v2(0, 13));
                this._setChildLabel(entity.node, 'Desc', state.desc, 16, new cc.Color(255, 225, 190, 255), cc.v2(0, -18));
            }
        }
    }

    private _applyObstacleSprite(entity: RunEntity): boolean {
        const art = this.obstacleArtPaths[entity.obstacleId];
        if (!art || !entity.node) return false;

        entity.node.setContentSize(art.width, art.height);
        const cached = this.obstacleSpriteFrames[art.path];
        if (cached) {
            this._setObstacleSpriteFrame(entity.node, art, cached);
            return true;
        }

        if (!this.obstacleSpriteLoading[art.path]) {
            this.obstacleSpriteLoading[art.path] = true;
            cc.loader.loadRes(art.path, cc.SpriteFrame, (err: Error, spriteFrame: cc.SpriteFrame) => {
                this.obstacleSpriteLoading[art.path] = false;
                if (err || !spriteFrame) {
                    cc.warn('[WarriorRun] load obstacle art failed:', art.path, err);
                    return;
                }
                this.obstacleSpriteFrames[art.path] = spriteFrame;
                this.entities.forEach((item) => {
                    const itemArt = this.obstacleArtPaths[item.obstacleId];
                    if (item.type === 'obstacle' && itemArt && itemArt.path === art.path && item.node && cc.isValid(item.node)) {
                        this._setObstacleSpriteFrame(item.node, itemArt, spriteFrame);
                    }
                });
            });
        }
        return false;
    }

    private _preloadObstacleSprites() {
        Object.keys(this.obstacleArtPaths).forEach((id) => {
            const art = this.obstacleArtPaths[Number(id)];
            if (!art || this.obstacleSpriteFrames[art.path] || this.obstacleSpriteLoading[art.path]) return;
            this.obstacleSpriteLoading[art.path] = true;
            cc.loader.loadRes(art.path, cc.SpriteFrame, (err: Error, spriteFrame: cc.SpriteFrame) => {
                this.obstacleSpriteLoading[art.path] = false;
                if (err || !spriteFrame) {
                    cc.warn('[WarriorRun] preload obstacle art failed:', art.path, err);
                    return;
                }
                this.obstacleSpriteFrames[art.path] = spriteFrame;
                this.entities.forEach((item) => {
                    const itemArt = this.obstacleArtPaths[item.obstacleId];
                    if (item.type === 'obstacle' && itemArt && itemArt.path === art.path && item.node && cc.isValid(item.node)) {
                        this._setObstacleSpriteFrame(item.node, itemArt, spriteFrame);
                    }
                });
            });
        });
    }

    private _setObstacleSpriteFrame(node: cc.Node, art: ObstacleArtConfig, spriteFrame: cc.SpriteFrame) {
        if (!node || !cc.isValid(node)) return;
        let sprite = node.getComponent(cc.Sprite);
        if (!sprite) sprite = node.addComponent(cc.Sprite);
        sprite.enabled = true;
        sprite.spriteFrame = spriteFrame;
        sprite.sizeMode = cc.Sprite.SizeMode.CUSTOM;
        node.setContentSize(art.width, art.height);
        node.color = cc.Color.WHITE;

        const graphics = node.getComponent(cc.Graphics);
        if (graphics) {
            graphics.clear();
            graphics.enabled = false;
        }
        this._setChildActive(node, 'Icon', false);
        this._setChildActive(node, 'Name', false);
        this._setChildActive(node, 'Desc', false);
    }

    // 切层后刷新屏幕上已有障碍的维度表现。
    private _refreshObstacleLooks() {
        this.entities.forEach((entity) => {
            if (entity.type !== 'obstacle') return;
            this._styleEntity(entity);
        });
    }

    // 让实体向下移动，并销毁离屏或已拾取/命中的实体。
    private _updateEntities(dt: number) {
        const pixelSpeed = this._getFinalSpeed() * METERS_TO_PIXELS;
        for (let i = this.entities.length - 1; i >= 0; i--) {
            const entity = this.entities[i];
            entity.y -= pixelSpeed * dt;
            entity.node.x = this._getLaneCenterX(entity.lane, this.entityLayer);
            entity.node.y = entity.y;
            if (entity.y < -700 || entity.hit) {
                entity.node.destroy();
                this.entities.splice(i, 1);
            }
        }
    }

    // 碰撞/拾取判定。使用角色视觉所在跑道，避免切道动画未到位就提前判死。
    private _checkCollisions() {
        const collisionLane = this._getVisualPlayerLane();
        this.entities.forEach((entity) => {
            if (entity.hit || entity.lane !== collisionLane || Math.abs(entity.y - this.player.y) > COLLISION_Y_THRESHOLD) return;
            if (entity.type === 'gold') {
                const goldValue = this._getGoldValue();
                this.gold += goldValue;
                this._showEntityFeedback(entity, '+' + goldValue, cc.Color.WHITE);
                entity.hit = true;
                return;
            }
            if (entity.type === 'energy') {
                this.energy = Math.min(this._getEnergyCap(), this.energy + 20);
                this._showEntityFeedback(entity, '+20能量', new cc.Color(80, 235, 245, 255));
                entity.hit = true;
                this._updateHUD();
                return;
            }
            if (entity.type === 'star') {
                this.collectedLevelStars = Math.min(LEVEL_STAR_COUNT, this.collectedLevelStars + 1);
                this._showEntityFeedback(entity, '+1', new cc.Color(255, 222, 64, 255));
                entity.hit = true;
                this._refreshLevelStarsHud(true);
                return;
            }

            if (this.invincibleTimer > 0) {
                this._showEntityFeedback(entity, '穿越', new cc.Color(180, 245, 255, 255));
                entity.hit = true;
                return;
            }

            const obstacle = this.obstacleMap[entity.obstacleId][this.dimension];
            if (obstacle.effect === 'fatal') {
                // this._showEntityFeedback(entity, '致命', new cc.Color(255, 80, 80, 255));
                this._shakeRunLayer(0.16, 10);
                this._gameOver();
            } else if (obstacle.effect === 'slow') {
                this._applySpeedDebuff(NORMAL_SLOW_SECONDS, obstacle.slowMultiplier || NORMAL_SLOW_MULTIPLIER);
                this._showEntityFeedback(entity, '减速', cc.Color.WHITE);
                this._shakeRunLayer(0.12, 6);
                entity.hit = true;
            } else if (obstacle.effect === 'drain') {
                this.energy = Math.max(0, this.energy - 15);
                this._showEntityFeedback(entity, '-15能量', new cc.Color(190, 100, 255, 255));
                this._shakeRunLayer(0.12, 6);
                entity.hit = true;
            }
        });
    }

    // 根据 player.x 找到视觉上最接近的跑道。
    private _getVisualPlayerLane(): number {
        if (!this.player || !this.player.parent) return this.lane;
        let nearestLane = this.lane;
        let nearestDistance = Number.MAX_VALUE;
        for (let i = 0; i < this.laneCount; i++) {
            const x = this._getLaneCenterX(i, this.player.parent);
            const distance = Math.abs(this.player.x - x);
            if (distance < nearestDistance) {
                nearestDistance = distance;
                nearestLane = i;
            }
        }
        return nearestLane;
    }

    // 施加减速效果；stackTime=true 时持续时间累加，雨天打滑会用到。
    private _applySpeedDebuff(seconds: number, multiplier: number, stackTime = false) {
        this.speedDebuffTimer = stackTime
            ? this.speedDebuffTimer + seconds
            : Math.max(this.speedDebuffTimer, seconds);
        this.speedDebuffMultiplier = this.speedDebuffTimer > 0
            ? Math.min(this.speedDebuffMultiplier, multiplier)
            : multiplier;
    }

    // 在实体当前位置显示拾取/碰撞飘字。
    private _showEntityFeedback(entity: RunEntity, text: string, color: cc.Color) {
        if (!this.feedbackFxLayer || !entity || !entity.node) return;
        const worldPos = entity.node.convertToWorldSpaceAR(cc.v2(0, 0));
        const localPos = this.feedbackFxLayer.convertToNodeSpaceAR(worldPos);
        this._showFloatingText(text, localPos, color);
    }

    // 创建一段临时飘字动画，播放后自动销毁。
    private _showFloatingText(text: string, pos: cc.Vec2, color: cc.Color) {
        if (!this.feedbackFxLayer) return;
        const node = new cc.Node('FloatText');
        this.feedbackFxLayer.addChild(node);
        node.setPosition(pos);
        node.zIndex = 20;
        node.color = color;
        node.opacity = 255;
        const label = node.addComponent(cc.Label);
        label.string = text;
        label.fontSize = 36;
        label.lineHeight = 46;
        label.horizontalAlign = cc.Label.HorizontalAlign.CENTER;
        label.verticalAlign = cc.Label.VerticalAlign.CENTER;
        node.runAction(cc.sequence(
            cc.spawn(
                cc.moveBy(0.45, 0, 54).easing(cc.easeCubicActionOut()),
                cc.fadeOut(0.45),
                cc.scaleTo(0.45, 1.18)
            ),
            cc.removeSelf()
        ));
    }

    // 局内短震动，用于受击/致命反馈。
    private _shakeRunLayer(duration: number, strength: number) {
        if (!this.gameLayer) return;
        this.gameLayer.stopActionByTag(9101);
        const origin = cc.v2(this.gameLayer.x, this.gameLayer.y);
        const step = 0.035;
        const actions = [];
        const count = Math.max(2, Math.floor(duration / step));
        for (let i = 0; i < count; i++) {
            const x = (Math.random() * 2 - 1) * strength;
            const y = (Math.random() * 2 - 1) * strength * 0.6;
            actions.push(cc.moveTo(step, origin.x + x, origin.y + y));
        }
        actions.push(cc.moveTo(0.04, origin.x, origin.y));
        const action = cc.sequence(actions);
        action.setTag(9101);
        this.gameLayer.runAction(action);
    }

    // 角色4吸附逻辑：吸附视觉所在跑道及相邻跑道、5米范围内金币/能量。
    private _updateMagnetCollection() {
        const magnetMeters = this._getRole().magnetMeters;
        if (magnetMeters <= 0) return;
        const magnetPixels = magnetMeters * METERS_TO_PIXELS;
        const magnetLane = this._getVisualPlayerLane();
        this.entities.forEach((entity) => {
            if (entity.hit || (entity.type !== 'gold' && entity.type !== 'energy')) return;
            if (Math.abs(entity.lane - magnetLane) > 1) return;
            if (Math.abs(entity.y - this.player.y) > magnetPixels) return;
            if (entity.type === 'gold') {
                const goldValue = this._getGoldValue();
                this.gold += goldValue;
                this._showEntityFeedback(entity, '+' + goldValue, cc.Color.WHITE);
            } else {
                this.energy = Math.min(this._getEnergyCap(), this.energy + 20);
                this._showEntityFeedback(entity, '+20能量', new cc.Color(80, 235, 245, 255));
                this._updateHUD();
            }
            entity.hit = true;
        });
    }

    // 随机切换到当前阶段权重抽到的天气。
    private _switchWeather() {
        const nextWeather = this._pickWeatherByStage();
        this.currentWeather = nextWeather === this.currentWeather
            ? this.weathers[(this.weathers.indexOf(nextWeather) + 1) % this.weathers.length]
            : nextWeather;
        this.stormPushTimer = 5 + Math.random() * 3;
        this.weatherParticles = [];
        this._flashWeather();
    }

    private _getWeatherSwitchSeconds(): number {
        return this.currentLevelConfig ? LEVEL_WEATHER_SWITCH_SECONDS : WEATHER_SWITCH_SECONDS;
    }

    // 按当前阶段 weatherWeights 权重抽取天气。
    private _pickWeatherByStage(): WeatherConfig {
        let weights = this._getCurrentStage().weatherWeights;
        const total = weights.reduce((sum, value) => sum + value, 0);
        let roll = Math.random() * total;
        for (let i = 0; i < weights.length; i++) {
            roll -= weights[i];
            if (roll <= 0) return this.weathers[i];
        }
        return this.weathers[0];
    }

    // 台风天气定时强制把玩家推到相邻跑道。
    private _updateStorm(dt: number) {
        if (this.currentWeather.type !== 'storm') return;
        this.stormPushTimer -= dt;
        if (this.stormPushTimer > 0) return;
        this.stormPushTimer = 5 + Math.random() * 3;
        this._moveLane(Math.random() < 0.5 ? -1 : 1);
    }

    // 处理切层按钮点击：单击后立即尝试切层。
    private _tapDimension() {
        if (this.dimension !== 'qin') {
            if (this.dimensionBtn) {
                this.dimensionBtn.stopAllActions();
                this.dimensionBtn.scale = 1;
            }
            return;
        }
        if (this.dimensionCooldownTimer > 0) {
            this._playDimensionButtonDenied();
            return;
        }
        this._switchDimension();
    }

    // 真正执行切层：只能从 QinMap 消耗能量进入 10 秒藏宝层。
    private _switchDimension() {
        if (this.dimensionCooldownTimer > 0) return;
        if (this.dimension !== 'qin') {
            this._playDimensionButtonDenied();
            return;
        }
        const switchCost = this._getSwitchCost();
        if (this.energy < switchCost) {
            this._playDimensionButtonDenied();
            return;
        }
        this.energy -= switchCost;
        this.oldDimension = this.dimension;
        this.dimension = 'forest';
        this.treasureTimer = TREASURE_SECONDS;
        this.treasureLane = Math.floor(Math.random() * this.laneCount);
        this.invincibleTimer = this._getInvincibleSeconds();
        this.dimensionCooldownTimer = 0;
        this.transitionTimer = 0;
        this._clearNonGoldEntities();
        this._applyDimensionLook();
        this._refreshObstacleLooks();
        this._playDimensionButtonPulse();
        this._updateHUD();
    }

    private _updateTreasureLayerTimer(dt: number) {
        if (this.dimension !== 'forest') return;
        this.treasureTimer = Math.max(0, this.treasureTimer - dt);
        if (this.treasureTimer <= 0) this._exitTreasureLayer();
    }

    private _exitTreasureLayer() {
        if (this.dimension !== 'forest') return;
        this.oldDimension = this.dimension;
        this.dimension = 'qin';
        this.treasureTimer = 0;
        this.dimensionCooldownTimer = 0;
        this.transitionTimer = 0;
        this._clearTreasureGoldEntities();
        this._applyDimensionLook();
        this._refreshObstacleLooks();
        this._updateHUD();
    }

    private _clearNonGoldEntities() {
        for (let i = this.entities.length - 1; i >= 0; i--) {
            const entity = this.entities[i];
            if (entity.type === 'gold') continue;
            if (entity.node && cc.isValid(entity.node)) entity.node.destroy();
            this.entities.splice(i, 1);
        }
    }

    // Remove treasure-only coins before returning to the normal layer.
    private _clearTreasureGoldEntities() {
        for (let i = this.entities.length - 1; i >= 0; i--) {
            const entity = this.entities[i];
            if (!entity.treasure) continue;
            if (entity.node && cc.isValid(entity.node)) entity.node.destroy();
            this.entities.splice(i, 1);
        }
    }

    // 切层失败反馈：能量不足或冷却中。
    private _playDimensionButtonDenied() {
        if (!this.dimensionBtn) return;
        if (this.dimension !== 'qin') {
            this.dimensionBtn.stopAllActions();
            this.dimensionBtn.scale = 1;
            return;
        }
        this.dimensionBtn.stopAllActions();
        const disabledColor = new cc.Color(120, 120, 120, 255);
        this.dimensionBtn.color = disabledColor;
        this.dimensionBtn.runAction(cc.sequence(
            cc.scaleTo(0.06, 0.92),
            cc.scaleTo(0.08, 1),
            cc.callFunc(() => this.dimensionBtn.color = disabledColor)
        ));
    }

    // 切层按钮点击/成功的缩放反馈。
    private _playDimensionButtonPulse() {
        if (!this.dimensionBtn) return;
        if (this.dimension !== 'qin') {
            this.dimensionBtn.stopAllActions();
            this.dimensionBtn.scale = 1;
            return;
        }
        this.dimensionBtn.stopAllActions();
        this.dimensionBtn.runAction(cc.sequence(cc.scaleTo(0.08, 0.9), cc.scaleTo(0.12, 1)));
    }

    // 切层时的上层时空卷起动画。
    private _playDimensionTransitionFx(fromDimension: Dimension) {
        if (!this.feedbackFxLayer) return;
        const bounds = this._getTrackBounds();
        const width = bounds.right - bounds.left;
        const height = bounds.top - bounds.bottom;
        const node = new cc.Node('DimensionRollFx');
        node.setContentSize(width, height);
        node.setAnchorPoint(0.5, 1);
        node.setPosition(bounds.left + width * 0.5, bounds.top);
        node.opacity = 180;
        node.zIndex = 5;
        this.feedbackFxLayer.addChild(node);

        const graphics = node.addComponent(cc.Graphics);
        const color = fromDimension === 'qin'
            ? new cc.Color(150, 58, 24, 185)
            : new cc.Color(24, 120, 74, 185);
        graphics.fillColor = color;
        graphics.rect(-node.width * 0.5, -node.height, node.width, node.height);
        graphics.fill();

        const edge = new cc.Node('RollEdge');
        edge.setContentSize(node.width, 8);
        edge.y = -node.height;
        node.addChild(edge);
        const edgeGraphics = edge.addComponent(cc.Graphics);
        edgeGraphics.fillColor = fromDimension === 'qin'
            ? new cc.Color(255, 190, 80, 220)
            : new cc.Color(80, 255, 170, 220);
        edgeGraphics.rect(-edge.width * 0.5, -edge.height * 0.5, edge.width, edge.height);
        edgeGraphics.fill();

        node.runAction(cc.sequence(
            cc.spawn(
                cc.scaleTo(0.4, 1, 0.02).easing(cc.easeCubicActionIn()),
                cc.fadeOut(0.4)
            ),
            cc.removeSelf()
        ));
    }

    // 应用当前维度外观：背景、跑道皮肤、玩家形态。
    private _applyDimensionLook() {
        const qin = this.dimension === 'qin';
        if (this.qinMapNode || this.forestMapNode) {
            if (this.qinMapNode) this.qinMapNode.active = qin;
            if (this.forestMapNode) this.forestMapNode.active = !qin;
        } else {
            this.gameLayer.color = qin ? new cc.Color(28, 8, 12, 255) : new cc.Color(5, 30, 22, 255);
        }
        this._applyLaneSkin();
        this._drawPlayer();
    }

    // 跑道已经画进背景图，这里保留空方法维持切层流程结构。
    private _applyLaneSkin() {
        return;
    }

    // 切换玩家秦朝/森林形态；没有皮肤节点时画兜底块。
    private _drawPlayer() {
        const qin = this.dimension === 'qin';
        if (this.qinPlayerNode || this.forestPlayerNode) {
            if (this.qinPlayerNode) this.qinPlayerNode.active = qin;
            if (this.forestPlayerNode) this.forestPlayerNode.active = !qin;
            const graphics = this.player.getComponent(cc.Graphics);
            if (graphics) graphics.clear();
            return;
        }
        if (this._hasSpriteFrame(this.player)) {
            const mark = this.player.getChildByName('PlayerMark');
            if (mark) mark.active = false;
            const graphics = this.player.getComponent(cc.Graphics);
            if (graphics) graphics.clear();
            return;
        }
        this.player.removeAllChildren();
        this._makeLayerColor(this.player, qin ? new cc.Color(205, 205, 214, 255) : new cc.Color(82, 220, 118, 255));
        const label = this._label('PlayerMark', this.player, qin ? 'Qin' : 'Forest', 24, new cc.Color(18, 18, 18, 255));
        label.node.y = 2;
    }

    // 每帧同步跑道坐标和玩家无敌闪烁。
    private _updateTrack(dt: number) {
        this._fitTrackToMap();
        this.player.opacity = this.invincibleTimer > 0 ? 150 + Math.sin(this.runTime * 18) * 80 : 255;
    }

    // 每帧绘制当前天气的全屏视觉效果。
    private _updateWeatherEffects(dt: number) {
        if (!this.weatherFxLayer || !this.weatherFxGraphics) return;
        const warning = this.weatherTimer >= this._getWeatherSwitchSeconds() - WEATHER_WARNING_SECONDS;
        const active = this.currentWeather.type !== 'none';
        this.weatherFxLayer.active = active;
        this.weatherFxGraphics.clear();
        if (!active) return;

        const bounds = this._getWeatherBounds();
        const left = bounds.left;
        const right = bounds.right;
        const top = bounds.top;
        const bottom = bounds.bottom;
        const width = right - left;
        const height = top - bottom;
        const graphics = this.weatherFxGraphics;

        if (this.currentWeather.type === 'fog') {
            this._drawFogWeather(dt, left, right, top, bottom);
        } else if (this.currentWeather.type === 'drought') {
            graphics.fillColor = new cc.Color(180, 80, 20, 38);
            graphics.rect(left, bottom, width, height);
            graphics.fill();
            this._drawWeatherParticles(dt, 26, left, right, top, bottom, new cc.Color(255, 175, 86, 115), false);
        } else if (this.currentWeather.type === 'snow') {
            graphics.fillColor = new cc.Color(220, 245, 255, 34);
            graphics.rect(left, bottom, width, height);
            graphics.fill();
            this._drawWeatherParticles(dt, 46, left, right, top, bottom, new cc.Color(235, 250, 255, 180), false);
        } else if (this.currentWeather.type === 'rain') {
            this._drawWeatherParticles(dt, 120, left, right, top, bottom, new cc.Color(130, 195, 255, 230), true);
        } else if (this.currentWeather.type === 'storm') {
            graphics.fillColor = new cc.Color(60, 190, 255, 48);
            graphics.rect(left, bottom, width, height);
            graphics.fill();
            this._drawWeatherParticles(dt, 150, left, right, top, bottom, new cc.Color(150, 235, 255, 235), true);
        }
    }

    // 绘制雨线、雪花、沙尘等天气粒子。
    private _drawFogWeather(dt: number, left: number, right: number, top: number, bottom: number) {
        const graphics = this.weatherFxGraphics;
        const width = right - left;
        const height = top - bottom;

        graphics.fillColor = new cc.Color(205, 212, 216, 145);
        graphics.rect(left, bottom, width, height);
        graphics.fill();

        for (let i = 0; i < 5; i++) {
            const y = bottom + height * (0.16 + i * 0.18) + Math.sin(this.runTime * 0.55 + i * 1.7) * 18;
            const bandHeight = 52 + i * 9;
            graphics.fillColor = new cc.Color(232, 238, 240, 38 + i * 5);
            this._drawFogBand(graphics, left - 36, right + 36, y, bandHeight, i);
        }

        const count = 30;
        while (this.weatherParticles.length < count) {
            this.weatherParticles.push(this._createFogParticle(left, right, top, bottom));
        }
        if (this.weatherParticles.length > count) this.weatherParticles.length = count;

        this.weatherParticles.forEach((particle, index) => {
            particle.x += particle.drift * dt;
            particle.y += Math.sin(this.runTime * 0.7 + index) * 2 * dt;
            if (particle.x > right + particle.size * 1.5) {
                const reset = this._createFogParticle(left, right, top, bottom);
                particle.x = left - reset.size;
                particle.y = reset.y;
                particle.speed = reset.speed;
                particle.drift = reset.drift;
                particle.size = reset.size;
            } else if (particle.x < left - particle.size * 1.5) {
                const reset = this._createFogParticle(left, right, top, bottom);
                particle.x = right + reset.size;
                particle.y = reset.y;
                particle.speed = reset.speed;
                particle.drift = reset.drift;
                particle.size = reset.size;
            }

            const alpha = 48 + (index % 4) * 12;
            graphics.fillColor = new cc.Color(236, 241, 242, alpha);
            this._drawFogBlob(graphics, particle.x, particle.y, particle.size, index);
            graphics.fillColor = new cc.Color(218, 226, 228, Math.max(12, alpha - 10));
            this._drawFogBlob(graphics, particle.x + particle.size * 0.36, particle.y + particle.size * 0.06, particle.size * 0.7, index + 17);
            this._drawFogBlob(graphics, particle.x - particle.size * 0.34, particle.y - particle.size * 0.05, particle.size * 0.6, index + 31);
        });

        graphics.fillColor = new cc.Color(186, 194, 198, 72);
        graphics.rect(left, bottom, width, height);
        graphics.fill();
    }

    private _drawFogBand(graphics: cc.Graphics, left: number, right: number, y: number, height: number, seed: number) {
        const segments = 8;
        const pointsTop: cc.Vec2[] = [];
        const pointsBottom: cc.Vec2[] = [];
        for (let i = 0; i <= segments; i++) {
            const t = i / segments;
            const x = left + (right - left) * t;
            const waveA = Math.sin(t * Math.PI * 3 + this.runTime * 0.6 + seed * 1.9);
            const waveB = Math.sin(t * Math.PI * 5 + this.runTime * 0.35 + seed * 2.4);
            const topOffset = waveA * 12 + waveB * 6;
            const bottomOffset = Math.sin(t * Math.PI * 4 + this.runTime * 0.42 + seed) * 11;
            pointsTop.push(cc.v2(x, y + height * 0.5 + topOffset));
            pointsBottom.push(cc.v2(x, y - height * 0.5 + bottomOffset));
        }

        graphics.moveTo(pointsTop[0].x, pointsTop[0].y);
        for (let i = 1; i < pointsTop.length; i++) graphics.lineTo(pointsTop[i].x, pointsTop[i].y);
        for (let i = pointsBottom.length - 1; i >= 0; i--) graphics.lineTo(pointsBottom[i].x, pointsBottom[i].y);
        graphics.close();
        graphics.fill();
    }

    private _drawFogBlob(graphics: cc.Graphics, x: number, y: number, radius: number, seed: number) {
        const points = 14;
        for (let i = 0; i <= points; i++) {
            const angle = Math.PI * 2 * (i / points);
            const noise = 0.78
                + Math.sin(angle * 2.1 + seed * 0.73 + this.runTime * 0.18) * 0.13
                + Math.sin(angle * 4.3 + seed * 1.37) * 0.09;
            const px = x + Math.cos(angle) * radius * noise * 1.25;
            const py = y + Math.sin(angle) * radius * noise * 0.62;
            if (i === 0) graphics.moveTo(px, py);
            else graphics.lineTo(px, py);
        }
        graphics.close();
        graphics.fill();
    }

    private _drawWeatherParticles(
        dt: number,
        count: number,
        left: number,
        right: number,
        top: number,
        bottom: number,
        color: cc.Color,
        streak: boolean,
    ) {
        while (this.weatherParticles.length < count) {
            this.weatherParticles.push(this._createWeatherParticle(left, right, top, bottom, streak));
        }
        if (this.weatherParticles.length > count) this.weatherParticles.length = count;

        const graphics = this.weatherFxGraphics;
        graphics.strokeColor = color;
        graphics.fillColor = color;
        graphics.lineWidth = streak ? 3 : 1;
        this.weatherParticles.forEach((particle) => {
            particle.x += particle.drift * dt;
            particle.y -= particle.speed * dt;
            if (particle.y < bottom - 30 || particle.x < left - 60 || particle.x > right + 60) {
                const reset = this._createWeatherParticle(left, right, top, bottom, streak);
                particle.x = reset.x;
                particle.y = top + Math.random() * 90;
                particle.speed = reset.speed;
                particle.drift = reset.drift;
                particle.size = reset.size;
            }
            if (streak) {
                graphics.moveTo(particle.x, particle.y);
                graphics.lineTo(particle.x + particle.drift * 0.08, particle.y - particle.size);
                graphics.stroke();
            } else {
                graphics.circle(particle.x, particle.y, particle.size);
                graphics.fill();
            }
        });
    }

    // 创建一个天气粒子。streak=true 表示雨/台风线条，false 表示雪/沙尘点。
    private _createFogParticle(left: number, right: number, top: number, bottom: number): WeatherParticle {
        const width = right - left;
        const height = top - bottom;
        return {
            x: left + Math.random() * width,
            y: bottom + height * (0.12 + Math.random() * 0.76),
            speed: 0,
            drift: 14 + Math.random() * 34,
            size: 46 + Math.random() * 92,
        };
    }

    private _createWeatherParticle(left: number, right: number, top: number, bottom: number, streak: boolean): WeatherParticle {
        return {
            x: left + Math.random() * (right - left),
            y: bottom + Math.random() * (top - bottom),
            speed: streak ? 980 + Math.random() * 520 : 80 + Math.random() * 120,
            drift: streak ? -240 + Math.random() * 90 : -25 + Math.random() * 50,
            size: streak ? 58 + Math.random() * 46 : 2 + Math.random() * 3,
        };
    }

    // 使用背景图内跑道坐标，保留方法作为每帧统一入口。
    private _fitTrackToMap() {
        this.laneXs = LANE_XS.slice();
    }

    // 获取背景图中三条跑道覆盖范围，切层效果用它做适配。
    private _getTrackBounds(): { left: number; right: number; top: number; bottom: number } {
        return { left: TRACK_LEFT, right: TRACK_RIGHT, top: TRACK_TOP, bottom: TRACK_BOTTOM };
    }

    // 天气效果覆盖整张地图，不跟随三条跑道裁切。
    private _getWeatherBounds(): { left: number; right: number; top: number; bottom: number } {
        const map = (this.qinMapNode && this.qinMapNode.active ? this.qinMapNode : null)
            || (this.forestMapNode && this.forestMapNode.active ? this.forestMapNode : null)
            || this.qinMapNode
            || this.forestMapNode
            || this.gameLayer;
        if (!map || !this.weatherFxLayer) {
            return { left: -360, right: 360, top: 640, bottom: -640 };
        }

        const width = map.width || 720;
        const height = map.height || 1280;
        const left = -map.anchorX * width;
        const right = (1 - map.anchorX) * width;
        const bottom = -map.anchorY * height;
        const top = (1 - map.anchorY) * height;
        const bottomLeft = this.weatherFxLayer.convertToNodeSpaceAR(map.convertToWorldSpaceAR(cc.v2(left, bottom)));
        const topRight = this.weatherFxLayer.convertToNodeSpaceAR(map.convertToWorldSpaceAR(cc.v2(right, top)));
        return {
            left: Math.min(bottomLeft.x, topRight.x),
            right: Math.max(bottomLeft.x, topRight.x),
            top: Math.max(bottomLeft.y, topRight.y),
            bottom: Math.min(bottomLeft.y, topRight.y),
        };
    }

    // 切换目标跑道。delta=-1 左移，delta=1 右移。
    private _moveLane(delta: number) {
        this.lane = Math.max(0, Math.min(this.laneCount - 1, this.lane + delta));
        this.targetX = this._getLaneCenterX(this.lane, this.player.parent);
    }

    // 获取某条背景跑道在指定父节点坐标系下的中心 x。
    private _getLaneCenterX(laneIndex: number, parent: cc.Node): number {
        const x = this.laneXs[laneIndex] || 0;
        if (!this.gameLayer || !parent) return x;
        if (this.gameLayer === parent) return x;
        const worldCenter = this.gameLayer.convertToWorldSpaceAR(cc.v2(x, 0));
        return parent.convertToNodeSpaceAR(worldCenter).x;
    }

    // 记录滑动起点。
    private _onTouchStart(event: cc.Event.EventTouch) {
        if (this.state !== 'playing') return;
        const pos = event.touch.getLocation();
        this.touchStartX = pos.x;
        this.touchStartY = pos.y;
    }

    // 根据滑动距离判断是否左右切道；雨天有概率触发打滑减速。
    private _onTouchEnd(event: cc.Event.EventTouch) {
        if (this.state !== 'playing') return;
        const pos = event.touch.getLocation();
        const dx = pos.x - this.touchStartX;
        const dy = pos.y - this.touchStartY;
        if (Math.abs(dx) > Math.max(38, Math.abs(dy) * 1.2)) {
            if (this.currentWeather.type === 'rain' && Math.random() < 0.25) {
                this._applySpeedDebuff(RAIN_SLOW_SECONDS, NORMAL_SLOW_MULTIPLIER, true);
            }
            this._moveLane(dx > 0 ? 1 : -1);
        }
    }

    // 暂停游戏并弹出暂停面板。
    private _pause() {
        if (this.state !== 'playing') return;
        this.state = 'paused';
        this._showPausePopup();
    }

    // 进入死亡流程：优先续命弹窗，用过续命后显示失败结算。
    private _gameOver() {
        if (this.state === 'over') return;
        this.state = 'over';
        if (!this.reviveUsed && this.xuguanPopup) {
            this._showVisualPopup(this.xuguanPopup, this._fillRevivePopup.bind(this));
            return;
        }
        this._finishRunAndShowLose();
    }

    private _completeLevel() {
        if (this.state !== 'playing') return;
        this.state = 'over';
        this.levelCompleted = true;
        const shouldReportPass = this._saveRunResult(false, true);
        if (shouldReportPass) {
            UserDataSyncManager.postPassLevel(this.currentLevelId, this.collectedLevelStars).catch((error) => {
                console.error('[WarriorRun] post pass level failed:', error);
            });
        }
        this._showWinPopup();
    }

    // 通用兜底弹窗主按钮逻辑：暂停时继续，死亡时续命或重开。
    private _onPrimaryPopup() {
        if (this.state === 'paused') {
            this.state = 'playing';
            this.popupLayer.active = false;
            return;
        }
        if (this.state !== 'over') return;
        if (this.levelCompleted) {
            this._startNextLevel();
            return;
        }
        if (!this.reviveUsed) {
            this._continueRunAfterRevive();
            return;
        }
        this._retryLevel();
    }


    // 绑定场景里已有的 Win/Lose/XuGuan 三个美术弹窗按钮。
    private _bindVisualPopups() {
        this.winResultPopup = this.canvas.getChildByName('WinResultPopup');
        this.loseResultPopup = this.canvas.getChildByName('LoseResultPopup');
        this.xuguanPopup = this.canvas.getChildByName('XuGuanPopup');
        this.gameOverPopup = this.canvas.getChildByName('GameOverPopup');

        this._prepareVisualPopup(this.winResultPopup);
        this._prepareVisualPopup(this.loseResultPopup);
        this._prepareVisualPopup(this.xuguanPopup);
        this._prepareVisualPopup(this.gameOverPopup);

        this._bindPopupButton(this._findDeep(this.winResultPopup, 'backBtn'), () => this._returnToStart());
        this._bindPopupButton(this._findDeep(this.winResultPopup, 'nextBtn'), () => this._startNextLevel());
        this._bindPopupButton(this._findDeep(this.loseResultPopup, 'backBtn'), () => this._returnToStart());
        this._bindPopupButton(this._findDeep(this.loseResultPopup, 'retryBtn'), () => this._retryLevel());
        this._bindPopupButton(this._findDeep(this.xuguanPopup, 'backBtn'), () => this._finishRunAndShowLose());
        this._bindPopupButton(this._findDeep(this.xuguanPopup, 'continueBtn'), () => this._continueRunAfterRevive());
        this._bindPopupButton(this._findDeep(this.gameOverPopup, 'backBtn'), () => this._returnToStart());
        this._bindPopupButton(this._findDeep(this.gameOverPopup, 'retryBtn'), () => this._retryInfiniteRun());
    }

    // 初始化美术弹窗状态：隐藏并置顶。
    private _prepareVisualPopup(popup: cc.Node) {
        if (!popup) return;
        popup.active = false;
        popup.zIndex = 1000;
    }

    // 给弹窗按钮绑定 TOUCH_END，节点缺 Button 组件时自动补上。
    private _bindPopupButton(node: cc.Node, cb: () => void) {
        if (!node) return;
        let button = node.getComponent(cc.Button);
        if (!button) button = node.addComponent(cc.Button);
        node.off(cc.Node.EventType.TOUCH_START);
        node.off(cc.Node.EventType.TOUCH_MOVE);
        node.off(cc.Node.EventType.TOUCH_END);
        node.on(cc.Node.EventType.TOUCH_START, this._stopButtonTouch, this);
        node.on(cc.Node.EventType.TOUCH_MOVE, this._stopButtonTouch, this);
        node.on(cc.Node.EventType.TOUCH_END, (event: cc.Event.EventTouch) => {
            this._stopButtonTouch(event);
            this._playButtonClick(event);
            cb();
        }, this);
    }

    // 在节点树里递归按名称查找子节点。
    private _findDeep(root: cc.Node, name: string): cc.Node {
        if (!root) return null;
        if (root.name === name) return root;
        for (const child of root.children) {
            const found = this._findDeep(child, name);
            if (found) return found;
        }
        return null;
    }

    // 隐藏所有弹窗。
    private _hideAllPopups() {
        if (this.popupLayer) this.popupLayer.active = false;
        if (this.winResultPopup) this.winResultPopup.active = false;
        if (this.loseResultPopup) this.loseResultPopup.active = false;
        if (this.xuguanPopup) this.xuguanPopup.active = false;
        if (this.gameOverPopup) this.gameOverPopup.active = false;
    }

    // 显示一个场景美术弹窗，并填充距离/金币数据。
    private _showVisualPopup(popup: cc.Node, filler?: (popup: cc.Node) => void) {
        this._hideAllPopups();
        if (!popup) return;
        if (filler) {
            filler(popup);
        } else {
            this._fillResultPopup(popup);
        }
        popup.active = true;
        popup.opacity = 255;
        popup.stopAllActions();
        const panel = this._findDeep(popup, 'panel') || popup;
        panel.stopAllActions();
        panel.scale = 0.92;
        panel.runAction(cc.scaleTo(0.12, 1));
    }

    // 显示失败结算；如果没有美术弹窗则走通用兜底弹窗。
    private _showLosePopup() {
        if (this._isInfiniteMode() && this.gameOverPopup) {
            this._showVisualPopup(this.gameOverPopup, this._fillGameOverPopup.bind(this));
            return;
        }
        if (this.loseResultPopup) {
            this._showVisualPopup(this.loseResultPopup);
            return;
        }
        this._showPopup('Game Over', '成绩: ' + Math.floor(this.distance) + '米', '钻石：' + this.gold);
    }

    private _showWinPopup() {
        if (this.winResultPopup) {
            this._showVisualPopup(this.winResultPopup, this._fillWinPopup.bind(this));
            return;
        }
        this._showPopup('Level Clear', '第' + this.currentLevelId + '关完成', '钻石：' + this.gold);
    }

    // 最终结束本局：保存结算数据，然后显示失败弹窗。
    private _finishRunAndShowLose() {
        this._saveRunResult(false);
        this._showLosePopup();
    }

    private _startNextLevel() {
        const nextLevel = this.currentLevelId + 1;
        if (nextLevel > getWarriorRunTotalLevels()) {
            this._returnToStart();
            return;
        }
        if (!this._consumeStaminaForLevelEntry()) {
            this._returnToStart();
            return;
        }
        GameState.selectedLevel = nextLevel;
        mGameData.currentLevel = nextLevel;
        this._startRun();
    }

    private _retryLevel() {
        if (!this._consumeStaminaForLevelEntry()) {
            this._returnToStart();
            return;
        }
        GameState.selectedLevel = this.currentLevelId;
        mGameData.currentLevel = this.currentLevelId;
        this._startRun();
    }

    private _retryInfiniteRun() {
        if (!this._consumeStaminaForLevelEntry()) {
            TipsManager.show('体力不足，无法开始游戏。');
            return;
        }
        mGameData.isInfiniteMode = true;
        this._startRun();
    }

    private _consumeStaminaForLevelEntry(): boolean {
        return StateBridge.consumeStamina();
    }

    // Continue once after revive with short invincibility.
    private _continueRunAfterRevive() {
        this.reviveUsed = true;
        this.state = 'playing';
        this._hideAllPopups();
        this.invincibleTimer = 5;
        const clearedStars = this.entities.filter((entity) => entity.type === 'star' && !entity.hit).length;
        this.spawnedLevelStars = Math.max(this.collectedLevelStars, this.spawnedLevelStars - clearedStars);
        this.entities.forEach((entity) => entity.hit = true);
    }

    // 保存本局距离和金币。unlockOnly=true 时只保存距离，不把本局金币加到账户。
    private _saveRunResult(unlockOnly: boolean, levelPassed = false): boolean {
        if (!unlockOnly && this.runResultSaved) return false;
        const p = getProgress();
        const distance = Math.floor(this.distance);
        let shouldReportPass = false;
        p.best_distance = Math.max(Math.floor(Number(p.best_distance) || 0), distance);
        if (mGameData.updateBestDistance) mGameData.updateBestDistance(distance);
        if (levelPassed) {
            const level = Math.max(1, this.currentLevelId || GameState.selectedLevel || 1);
            const previousUnlockedLevel = Math.max(1, Math.floor(Number(p.unlocked_level) || 1));
            p.level_stars = p.level_stars || {};
            const previousStars = Math.max(0, Math.floor(Number(p.level_stars[String(level)]) || 0));
            shouldReportPass = (level >= previousUnlockedLevel && previousStars <= 0)
                || this.collectedLevelStars > previousStars;
            p.level_stars[String(level)] = Math.max(this.collectedLevelStars, previousStars);
            p.unlocked_level = Math.max(
                previousUnlockedLevel,
                Math.min(getWarriorRunTotalLevels(), level + 1)
            );
            GameState.lastStars = this.collectedLevelStars;
            GameState.selectedLevel = level;
            mGameData.currentLevel = level;
            mGameData.unlockedLevel = p.unlocked_level;
        }
        cc.sys.localStorage.setItem(this.lastRunGoldKey, Math.max(0, Math.floor(this.gold)).toString());
        if (!unlockOnly && this.gold > 0) {
            mGameData.currentGold += this.gold;
            mGameData.totalGoldEarned += this.gold;
            if (mGameData.SaveGoldData) mGameData.SaveGoldData();
            cc.director.emit('goldUpdated');
        }
        if (!unlockOnly) this.runResultSaved = true;
        saveProgress();
        StateBridge.syncNewToOld();
        return shouldReportPass;
    }

    // 返回主界面。若本局已结束，会确保结算只保存一次。
    private _returnToStart() {
        if (this.state === 'playing') this._saveRunResult(true);
        if (this.state === 'over') this._saveRunResult(false);
        mGameData.shouldOpenLevelSelect = false;
        StateBridge.syncNewToOld();
        cc.director.loadScene('Start');
    }

    // 显示代码兜底弹窗。
    private _showPopup(title: string, info: string, goldText: string) {
        this.popupTitle.string = title;
        this.popupInfo.string = info;
        this.popupGold.string = goldText;
        this._hideButtonLabel(this.reviveBtn);
        this.popupLayer.active = true;
        this.popupLayer.opacity = 0;
        this.popupLayer.runAction(cc.fadeIn(0.12));
    }

    // 显示暂停弹窗时保留编辑器里配置好的标题、文字、颜色和字号。
    private _showPausePopup() {
        this._hideButtonLabel(this.reviveBtn);
        this.popupLayer.active = true;
        this.popupLayer.opacity = 0;
        this.popupLayer.runAction(cc.fadeIn(0.12));
    }

    // 给结算弹窗里的 Distance/Gold 两个 Label 填数据。
    private _fillResultPopup(popup: cc.Node) {
        const distance = Math.floor(this.distance);
        const gold = Math.max(0, Math.floor(this.gold));
        this._setOptionalLabel(popup, 'DistanceLabel', '成绩：' + distance + '米。');
        this._setOptionalLabel(popup, 'GoldLabel', '获得钻石：' + gold + '。');
    }

    // 给续关弹窗里的 DistanceLabel 填入本次成绩。
    private _fillRevivePopup(popup: cc.Node) {
        const distance = Math.floor(this.distance);
        const gold = Math.max(0, Math.floor(this.gold));
        this._setOptionalLabel(popup, 'DistanceLabel', '成绩：' + distance + '米。');
        this._setOptionalLabel(popup, 'GoldLabel', '获得钻石：' + gold + '。');
    }

    private _fillGameOverPopup(popup: cc.Node) {
        const distance = Math.floor(this.distance);
        const gold = Math.max(0, Math.floor(this.gold));
        this._setOptionalLabel(popup, 'DistanceLabel', '成绩：' + distance + '米。');
        this._setOptionalLabel(popup, 'GoldLabel', '获得钻石：' + gold + '。');
    }

    // 如果弹窗里存在指定 Label 节点，则设置它的文字；不存在就跳过。
    private _setOptionalLabel(root: cc.Node, name: string, text: string) {
        const node = this._findDeep(root, name);
        const label = node && node.getComponent(cc.Label);
        if (label) label.string = text;
    }

    // 隐藏按钮下的 Label；按钮文字已经包含在精灵图时使用。
    private _hideButtonLabel(buttonNode: cc.Node) {
        const labelNode = buttonNode && buttonNode.getChildByName('Label');
        if (labelNode) labelNode.active = false;
    }

    // 清掉代码生成的 Graphics，避免覆盖编辑器里配置好的 Sprite 遮罩。
    private _clearGeneratedGraphics(node: cc.Node) {
        const graphics = node && node.getComponent(cc.Graphics);
        if (!graphics) return;
        graphics.clear();
        graphics.enabled = false;
    }

    // 每帧刷新 HUD：能量条、天气、距离、速度、切层按钮状态。
    private _updateHUD() {
        const isLevelMode = !!this.currentLevelConfig;
        const energyCap = this._getEnergyCap();
        const switchCost = this._getSwitchCost();
        this.energy = Math.min(this.energy, energyCap);
        this.energyLabel.string = '能量 ' + Math.floor(this.energy) + '/' + energyCap;
        if (this.energyCountLabel) {
            const energyUnits = Math.max(0, Math.min(10, Math.floor(this.energy / ENERGY_DISPLAY_UNIT)));
            this.energyCountLabel.string = energyUnits + '/10';
        }
        this._syncEnergySegments();
        if (this.energySegments.length > 0) {
            const visibleCount = this.energy >= 100 ? this.energySegments.length : Math.floor(Math.max(0, this.energy) / 10);
            for (let i = 0; i < this.energySegments.length; i++) {
                this.energySegments[i].active = i < visibleCount;
            }
        } else if (this.energyFill) {
            const energyBg = this.energyFill.parent;
            const fillMaxWidth = energyBg ? Math.max(1, energyBg.width - 10) : 250;
            if (energyBg) {
                this.energyFill.setAnchorPoint(0, 0.5);
                this.energyFill.x = -energyBg.width * 0.5 + 5;
                this.energyFill.y = 0;
            }
            this.energyFill.width = fillMaxWidth * (this.energy / energyCap);
        }
        const weatherCountdown = this._getWeatherSwitchSeconds() - this.weatherTimer;
        this.weatherLabel.string = weatherCountdown <= WEATHER_WARNING_SECONDS
            ? '气象乱流 ' + Math.ceil(weatherCountdown) + 's'
            : '气象: ' + this.currentWeather.name;
        this.weatherLabel.node.color = this.currentWeather.color;
        this.distanceLabel.node.active = !isLevelMode;
        this.distanceLabel.string = Math.floor(this.distance) + '米';
        if (this.timeLeftLabel) {
            this.timeLeftLabel.node.active = !!this.currentLevelConfig;
        }
        if (this.timeLeftLabel && this.currentLevelConfig) {
            const left = Math.max(0, Math.ceil(this.currentLevelConfig.passTime - this.runTime));
            this.timeLeftLabel.string = '第' + this.currentLevelId + '关 ' + this._formatTimeLeft(left);
        }
        this.speedLabel.string = '速度 ' + this._getFinalSpeed().toFixed(1) + '米/秒';
        if (this.treasureCountdownLabel) {
            const inTreasureLayer = this.dimension === 'forest';
            this.treasureCountdownLabel.node.active = inTreasureLayer;
            this.treasureCountdownLabel.string = inTreasureLayer ? '藏宝倒计时 ' + Math.ceil(this.treasureTimer) + '秒' : '';
        }
        if (this.dimensionBtn) {
            this.dimensionBtn.active = !isLevelMode;
            const canSwitch = this.dimension === 'qin' && this.dimensionCooldownTimer <= 0 && this.energy >= switchCost;
            const button = this.dimensionBtn.getComponent(cc.Button);
            if (button) button.interactable = canSwitch;
            this.dimensionBtn.color = canSwitch ? cc.Color.WHITE : new cc.Color(120, 120, 120, 255);
        }
    }

    private _fillWinPopup(popup: cc.Node) {
        this._fillResultPopup(popup);
        for (let i = 0; i < LEVEL_STAR_COUNT; i++) {
            const node = this._findDeep(popup, 'star' + (i + 1)) || this._findDeep(popup, 'Star' + (i + 1));
            this._setStarSpriteFrame(node, i < this.collectedLevelStars ? this.starFullFrame : this.starGrayFrame);
        }
    }

    private _applyModeHudVisibility() {
        const isLevelMode = !!this.currentLevelConfig;
        const energyBg = (this.energyFill && this.energyFill.parent)
            || (this.energySegments.length > 0 && this.energySegments[0].parent);
        if (energyBg) energyBg.active = !isLevelMode;
        if (this.energyLabel) this.energyLabel.node.active = false;
        if (this.energyCountLabel) this.energyCountLabel.node.active = !isLevelMode;
        if (this.dimensionBtn) this.dimensionBtn.active = !isLevelMode;
        if (this.levelStarsHud) this.levelStarsHud.active = isLevelMode;
        if (this.distanceLabel) this.distanceLabel.node.active = !isLevelMode;
        if (this.timeLeftLabel) this.timeLeftLabel.node.active = isLevelMode;
    }

    private _buildLevelStarsHud() {
        this.levelStarsHud = this._findOrCreateNode('LevelStarsHud', this.hudLayer, 228, 64, cc.v2(0, 535));
        this.levelStarsHud.setContentSize(228, 64);
        this.levelStarsHud.zIndex = 5;
        this._enableTopWidget(this.levelStarsHud, 46);
        this.levelStarNodes = [];
        for (let i = 0; i < LEVEL_STAR_COUNT; i++) {
            const node = this._findOrCreateNode('Star' + (i + 1), this.levelStarsHud, 59, 58, cc.v2((i - 1) * 74.4, 0));
            node.setPosition((i - 1) * 74.4, 0);
            node.setScale(HUD_STAR_SCALE);
            this.levelStarNodes.push(node);
        }
    }

    private _enableTopWidget(node: cc.Node, top: number) {
        if (!node) return;
        let widget = node.getComponent(cc.Widget);
        if (!widget) widget = node.addComponent(cc.Widget);
        widget.enabled = true;
        widget.alignMode = cc.Widget.AlignMode.ON_WINDOW_RESIZE;
        widget.isAlignTop = true;
        widget.isAlignBottom = false;
        widget.isAlignVerticalCenter = false;
        widget.top = top;
        widget.updateAlignment();
    }

    private _preloadStarSprites() {
        if (this.starSpritesLoading || (this.starFullFrame && this.starGrayFrame)) return;
        this.starSpritesLoading = true;
        let pending = 2;
        const finish = () => {
            pending--;
            if (pending > 0) return;
            this.starSpritesLoading = false;
            this._refreshLevelStarsHud();
            this.entities.forEach((entity) => {
                if (entity.type === 'star') this._setStarSpriteFrame(entity.node, this.starFullFrame);
            });
        };
        cc.loader.loadRes('2Main/xingxing1', cc.SpriteFrame, (err: Error, frame: cc.SpriteFrame) => {
            if (!err && frame) this.starFullFrame = frame;
            else cc.warn('[WarriorRun] load xingxing1 failed:', err);
            finish();
        });
        cc.loader.loadRes('2Main/xingxing2', cc.SpriteFrame, (err: Error, frame: cc.SpriteFrame) => {
            if (!err && frame) this.starGrayFrame = frame;
            else cc.warn('[WarriorRun] load xingxing2 failed:', err);
            finish();
        });
    }

    private _refreshLevelStarsHud(animate = false) {
        this.levelStarNodes.forEach((node, index) => {
            this._setStarSpriteFrame(node, index < this.collectedLevelStars ? this.starFullFrame : this.starGrayFrame);
            node.setScale(HUD_STAR_SCALE);
            if (animate && index === this.collectedLevelStars - 1) {
                node.stopAllActions();
                node.scale = HUD_STAR_SCALE * 0.65;
                node.runAction(cc.sequence(
                    cc.scaleTo(0.12, HUD_STAR_SCALE * 1.25),
                    cc.scaleTo(0.12, HUD_STAR_SCALE)
                ));
            }
        });
    }

    private _setStarSpriteFrame(node: cc.Node, frame: cc.SpriteFrame) {
        if (!node || !frame) return;
        let sprite = node.getComponent(cc.Sprite);
        if (!sprite) sprite = node.addComponent(cc.Sprite);
        sprite.spriteFrame = frame;
        sprite.sizeMode = cc.Sprite.SizeMode.CUSTOM;
        node.setContentSize(59, 58);
        node.color = cc.Color.WHITE;
        const graphics = node.getComponent(cc.Graphics);
        if (graphics) {
            graphics.clear();
            graphics.enabled = false;
        }
    }

    // 天气切换时让天气文字轻微弹一下。
    private _flashWeather() {
        this.weatherLabel.node.stopAllActions();
        this.weatherLabel.node.runAction(cc.sequence(
            cc.scaleTo(0.08, 1.18),
            cc.scaleTo(0.12, 1),
        ));
    }

    // 创建一个基础节点并设置尺寸。
    private _node(name: string, parent: cc.Node, width: number, height: number): cc.Node {
        const node = new cc.Node(name);
        node.setContentSize(width, height);
        parent.addChild(node);
        return node;
    }

    // 在 parent 下按名称查找节点；找不到则创建。
    private _findOrCreateNode(name: string, parent: cc.Node, width: number, height: number, pos?: cc.Vec2): cc.Node {
        let node = parent.getChildByName(name);
        if (!node) {
            node = this._node(name, parent, width, height);
            if (pos) node.setPosition(pos);
        }
        return node;
    }

    // 判断节点是否已经有 SpriteFrame，有的话不再画 Graphics 兜底图形。
    private _hasSpriteFrame(node: cc.Node): boolean {
        const sprite = node && node.getComponent(cc.Sprite);
        return !!(sprite && sprite.spriteFrame);
    }

    private _hasVisibleSpriteFrame(node: cc.Node): boolean {
        const sprite = node && node.getComponent(cc.Sprite);
        return !!(sprite && sprite.enabled && sprite.spriteFrame);
    }

    // 用 Graphics 给节点画一个纯色矩形兜底。
    private _makeLayerColor(node: cc.Node, color: cc.Color) {
        node.color = color;
        let graphics = node.getComponent(cc.Graphics);
        if (!graphics) graphics = node.addComponent(cc.Graphics);
        graphics.enabled = true;
        graphics.clear();
        graphics.fillColor = color;
        graphics.rect(-node.width * 0.5, -node.height * 0.5, node.width, node.height);
        graphics.fill();
    }

    // 创建一个 Label 节点。
    private _label(name: string, parent: cc.Node, text: string, size: number, color: cc.Color): cc.Label {
        const node = new cc.Node(name);
        parent.addChild(node);
        const label = node.addComponent(cc.Label);
        label.string = text;
        label.fontSize = size;
        label.lineHeight = Math.floor(size * 1.2);
        label.horizontalAlign = cc.Label.HorizontalAlign.CENTER;
        label.verticalAlign = cc.Label.VerticalAlign.CENTER;
        node.color = color;
        return label;
    }

    // 查找或创建 Label，并设置默认文字/字号/颜色/位置。
    private _findOrCreateLabel(name: string, parent: cc.Node, text: string, size: number, color: cc.Color, pos: cc.Vec2): cc.Label {
        let node = parent.getChildByName(name);
        if (!node) {
            node = new cc.Node(name);
            parent.addChild(node);
            node.setPosition(pos);
        }
        node.color = color;
        let label = node.getComponent(cc.Label);
        if (!label) label = node.addComponent(cc.Label);
        if (!label.string) label.string = text;
        label.fontSize = size;
        label.lineHeight = Math.floor(size * 1.2);
        label.horizontalAlign = cc.Label.HorizontalAlign.CENTER;
        label.verticalAlign = cc.Label.VerticalAlign.CENTER;
        return label;
    }

    private _findOrCreateEditableLabel(name: string, parent: cc.Node, text: string, size: number, color: cc.Color, pos: cc.Vec2): cc.Label {
        let node = parent.getChildByName(name);
        if (node) {
            let label = node.getComponent(cc.Label);
            if (!label) label = node.addComponent(cc.Label);
            return label;
        }
        return this._findOrCreateLabel(name, parent, text, size, color, pos);
    }

    private _formatTimeLeft(seconds: number): string {
        const total = Math.max(0, Math.ceil(Number(seconds) || 0));
        const minutes = Math.floor(total / 60);
        const secs = total % 60;
        const minuteText = minutes < 10 ? '0' + minutes : String(minutes);
        const secondText = secs < 10 ? '0' + secs : String(secs);
        return minuteText + '：' + secondText;
    }

    // 弹窗 Label 优先使用编辑器里的配置，只有缺节点时才补默认值。
    private _findOrCreatePopupLabel(name: string, parent: cc.Node, text: string, size: number, color: cc.Color, pos: cc.Vec2): cc.Label {
        let node = parent.getChildByName(name);
        if (node) {
            let label = node.getComponent(cc.Label);
            if (!label) label = node.addComponent(cc.Label);
            return label;
        }

        node = new cc.Node(name);
        parent.addChild(node);
        node.setPosition(pos);
        node.color = color;
        const label = node.addComponent(cc.Label);
        label.string = text;
        label.fontSize = size;
        label.lineHeight = Math.floor(size * 1.2);
        label.horizontalAlign = cc.Label.HorizontalAlign.CENTER;
        label.verticalAlign = cc.Label.VerticalAlign.CENTER;
        return label;
    }

    // 查找或创建子 Label，用于障碍兜底文本。
    private _setChildLabel(parent: cc.Node, name: string, text: string, size: number, color: cc.Color, fallbackPos: cc.Vec2): cc.Label {
        let node = parent.getChildByName(name);
        if (!node) {
            node = new cc.Node(name);
            parent.addChild(node);
            node.setPosition(fallbackPos);
        }
        node.color = color;
        let label = node.getComponent(cc.Label);
        if (!label) label = node.addComponent(cc.Label);
        label.string = text;
        label.fontSize = label.fontSize || size;
        label.lineHeight = label.lineHeight || Math.floor(size * 1.2);
        label.horizontalAlign = cc.Label.HorizontalAlign.CENTER;
        label.verticalAlign = cc.Label.VerticalAlign.CENTER;
        return label;
    }

    private _setChildActive(parent: cc.Node, name: string, active: boolean) {
        const child = parent && parent.getChildByName(name);
        if (child) child.active = active;
    }

    private _stopButtonTouch(event: cc.Event.EventTouch) {
        if (event && event.stopPropagation) event.stopPropagation();
    }

    // 创建一个基础按钮节点。
    private _button(name: string, parent: cc.Node, text: string, width: number, height: number, cb: () => void): cc.Node {
        const buttonNode = this._node(name, parent, width, height);
        this._makeLayerColor(buttonNode, new cc.Color(88, 55, 42, 245));
        const button = buttonNode.addComponent(cc.Button);
        button.transition = cc.Button.Transition.SCALE;
        button.duration = 0.08;
        button.zoomScale = 0.92;
        const label = this._label('Label', buttonNode, text, 24, cc.Color.WHITE);
        label.node.setPosition(0, 0);
        buttonNode.off(cc.Node.EventType.TOUCH_START);
        buttonNode.off(cc.Node.EventType.TOUCH_MOVE);
        buttonNode.off(cc.Node.EventType.TOUCH_END);
        buttonNode.on(cc.Node.EventType.TOUCH_START, this._stopButtonTouch, this);
        buttonNode.on(cc.Node.EventType.TOUCH_MOVE, this._stopButtonTouch, this);
        buttonNode.on(cc.Node.EventType.TOUCH_END, (event: cc.Event.EventTouch) => {
            this._stopButtonTouch(event);
            this._playButtonClick(event);
            cb();
        }, this);
        return buttonNode;
    }

    // 查找或创建按钮；ensureLabel=false 时不自动创建文字 Label。
    private _findOrCreateButton(name: string, parent: cc.Node, text: string, width: number, height: number, pos: cc.Vec2, cb: () => void, ensureLabel = true): cc.Node {
        const buttonNode = this._findOrCreateNode(name, parent, width, height, pos);
        if (!this._hasSpriteFrame(buttonNode) && !buttonNode.getComponent(cc.Graphics)) {
            this._makeLayerColor(buttonNode, new cc.Color(88, 55, 42, 245));
        }
        let button = buttonNode.getComponent(cc.Button);
        if (!button) button = buttonNode.addComponent(cc.Button);
        button.transition = cc.Button.Transition.SCALE;
        button.duration = 0.08;
        button.zoomScale = 0.92;
        if (ensureLabel) {
            this._findOrCreateLabel('Label', buttonNode, text, 24, cc.Color.WHITE, cc.v2(0, 0));
        }
        buttonNode.off(cc.Node.EventType.TOUCH_START);
        buttonNode.off(cc.Node.EventType.TOUCH_MOVE);
        buttonNode.off(cc.Node.EventType.TOUCH_END);
        buttonNode.on(cc.Node.EventType.TOUCH_START, this._stopButtonTouch, this);
        buttonNode.on(cc.Node.EventType.TOUCH_MOVE, this._stopButtonTouch, this);
        buttonNode.on(cc.Node.EventType.TOUCH_END, (event: cc.Event.EventTouch) => {
            this._stopButtonTouch(event);
            this._playButtonClick(event);
            cb();
        }, this);
        return buttonNode;
    }
}
