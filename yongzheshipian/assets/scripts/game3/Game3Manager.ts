import {
    _decorator,
    Color,
    Component,
    director,
    EventTouch,
    Graphics,
    instantiate,
    JsonAsset,
    Label,
    LabelOutline,
    LabelShadow,
    Node,
    Prefab,
    ProgressBar,
    resources,
    Sprite,
    SpriteFrame,
    sys,
    tween,
    Tween,
    UITransform,
    UIOpacity,
    Vec2,
    Vec3,
    view,
} from 'cc';
import { gameConfig } from '../../script/data/gameConfig';
import { emits, localData } from '../../script/data/enums';
import { loadPool } from '../res/loadPool';
import { bgmName, emits as uiEmits } from '../data/enmus';
import { nodePool } from '../../script/utils/nodePool';
import { audioTool } from '../../script/utils/audioTool';
import { getUserScopedKey, load, save } from '../../script/utils/tools';
import { mGameData } from '../untils/GameData';
import {
    GAME3_DIFFICULTY_STORAGE_KEY,
    Game3DifficultyMode,
    getGame3DifficultyMode,
    getGame3WaveNumber,
} from './Game3Difficulty';

const { ccclass, property } = _decorator;

type WeatherType = 'sunny' | 'rainy' | 'cloudy';

type Game3EnemyConfig = {
    id: string;
    char: string;
    position: { x: number; y: number }; 
    isTarget?: boolean;
};

type Game3StageConfig = {
    level: number;
    poem: string;
    correctChars: string[];
    energy: number;
    wrongCost: number;
    roomScore: number;
    throwCost: number;
    weatherInterval?: number;
    weatherSequence?: WeatherType[];
    enemies: Game3EnemyConfig[];
};

enum PlayState {
    Ready = 'ready',
    Aiming = 'aiming',
    Flying = 'flying',
    Win = 'win',
    Fail = 'fail',
    Pause = 'pause',
}

type WordEnemy = {
    config: Game3EnemyConfig;
    node: Node;
    hpBar: ProgressBar;
    isAlive: boolean;
    isTarget: boolean;
    bodySprite?: Sprite | null;
    idleFrames?: SpriteFrame[];
    idleFrameIndex?: number;
    idleFrameTimer?: number;
};

type StageScoreRecord = {
    level: number;
    score: number;
};

@ccclass('Game3Manager')
export class Game3Manager extends Component {
    private readonly STORAGE_KEY_HAS_SEEN_GUIDE = 'hasSeenGame3Guide';

    // 关卡配置 JSON（诗句、目标字、敌人位置等）
    @property(JsonAsset)
    levelsJson: JsonAsset = null;

    // 编辑器可拖拽：背景根节点
    @property(Node)
    backgroundRootRef: Node = null;

    // 编辑器可拖拽：纸面/主玩法区域背景
    @property(Node)
    paperRootRef: Node = null;

    // 编辑器可拖拽：顶部 HUD 根节点
    @property(Node)
    hudRootRef: Node = null;

    // 编辑器可拖拽：战斗区域根节点
    @property(Node)
    battleLayerRef: Node = null;

    // 编辑器可拖拽：怪物所在层
    @property(Node)
    enemyLayerRef: Node = null;

    // 编辑器可拖拽：画线轨迹层
    @property(Node)
    trailLayerRef: Node = null;

    // 编辑器可拖拽：真正负责画 Graphics 线条的节点
    @property(Node)
    drawingNodeRef: Node = null;

    // 编辑器可拖拽：可触摸画线区域
    @property(Node)
    aimZoneRef: Node = null;

    // 编辑器可拖拽：英雄显示节点
    @property(Node)
    heroNodeRef: Node = null;

    // 编辑器可拖拽：剑/投射物节点，拖拽时跟手，松手后沿轨迹飞
    @property(Node)
    projectileNodeRef: Node = null;

    // 编辑器可拖拽：新手引导根节点
    @property(Node)
    tutorialGuideRootRef: Node = null;

    // 编辑器可拖拽：新手引导手指节点
    @property(Node)
    tutorialGuideFingerRef: Node = null;

    // 编辑器可拖拽：新手引导气泡节点
    @property(Node)
    tutorialGuideBubbleRef: Node = null;

    // 编辑器可拖拽：新手引导里展示的武器节点，放在 GuideNode 下并摆到不被遮罩挡住的位置
    @property(Node)
    tutorialGuideWeaponRef: Node = null;

    // 编辑器可拖拽：新手引导文本
    @property(Label)
    tutorialGuideTextRef: Label = null;

    // 编辑器可拖拽：诗句定位锚点，PoemDisplay 会挂在它的父节点下并参考它的位置
    @property(Label)
    poemLabelRef: Label = null;

    // 编辑器可拖拽：关卡文本
    @property(Label)
    stageLabelRef: Label = null;

    // 编辑器可拖拽：评分文本
    @property(Label)
    scoreLabelRef: Label = null;

    // 编辑器可拖拽：灵力文本（未使用进度条时的兜底显示）
    @property(Label)
    energyLabelRef: Label = null;

    // 编辑器可拖拽：灵力进度条里的数值文本
    @property(Label)
    energyValueLabelRef: Label = null;

    // 编辑器可拖拽：灵力 ProgressBar，美术版优先走这个
    @property(ProgressBar)
    energyBarRef: ProgressBar = null;

    @property(Label)
    weatherLabelRef: Label = null;

    @property(Label)
    weatherTimerLabelRef: Label = null;

    // 编辑器可拖拽：顶部提示文本
    @property(Label)
    tipLabelRef: Label = null;

    // 编辑器可拖拽：暂停按钮
    @property(Node)
    pauseButtonRef: Node = null;

    @property(Node)
    pauseOverlayRef: Node = null;

    @property(Node)
    pauseResumeButtonRef: Node = null;

    @property(Node)
    pauseQuitButtonRef: Node = null;

    // 编辑器可拖拽：结算层
    @property(Node)
    resultOverlayRef: Node = null;

    // 编辑器可拖拽：怪物预制体（body / CharLabel / 血条）
    @property(Prefab)
    enemyItemPrefab: Prefab = null;

    // 编辑器可拖拽：结算面板预制体
    @property(Prefab)
    resultPanelPrefab: Prefab = null;

    // 编辑器可拖拽：设置面板预制体
    @property(Prefab)
    settingsPrefab: Prefab = null;

    // 编辑器可拖拽：诗句单字/下划线槽位预制体
    @property(Prefab)
    poemTokenPrefab: Prefab = null;

    // 默认起始关卡
    @property
    defaultLevel = 1;

    // 投射物基础碰撞半径（天气会在此基础上修正）
    @property
    projectileBaseRadius = 16;

    // 投射物沿轨迹飞行速度
    @property
    projectileSpeed = 1000;

    // 天气切换默认持续时间
    @property
    weatherDuration = 30;

    // 每过一关固定奖励的金币，先写死，后续可再调配置
    private clearStageCoinReward = 50;
    // 整体横向中心，想再往左一点就改成负数，比如 -20
    private enemyFormationCenterX = 0;
    // 横向分散程度，越大越散
    private enemyFormationSpreadX = 1.18;
    // 纵向分散程度，越大越散
    private enemyFormationSpreadY = 1.1;
    // 纵向偏移量，越大越偏下
    private enemyFormationOffsetY = -120;
    // 刷怪区左边界，确保怪物集中在策划框选区域内
    private enemyAreaMinX = -270;
    // 刷怪区右边界
    private enemyAreaMaxX = 270;
    // 刷怪区下边界，给左下角主角留安全空间
    private enemyAreaMinY = -220;
    // 刷怪区上边界
    private enemyAreaMaxY = 400;
    // 主角整体显示缩放
    private heroVisualScale = 0.7;
    // 飞剑/投射物显示缩放
    private projectileVisualScale = 0.7;
    // 投射物美术默认朝右上45度，运行时按路径方向旋转到当前飞行角度
    private projectileForwardAngleOffset = -45;
    // 主线外再绘制一条低透明粗线，形成柔和羽化边缘
    private aimLineWidth = 8;
    private aimFeatherWidth = 32;
    // 飞行速度倍率，数值越小越慢，所有投掷都会生效
    private projectileSpeedScale = 0.55;
    // 短路径也至少飞这么久，避免玩家看不清飞字反馈
    private minProjectileFlightSeconds = 1.15;
    // 直线画线时允许的触摸抖动范围，越大越容易识别成直线
    private projectilePathStraightTolerance = 18;
    // 朝向取前方一小段路径的方向，避免逐采样点抖动
    private projectileRotationLookAheadDistance = 70;
    private projectileMaxRotationDegreesPerSecond = 540;
    // 怪物整体显示缩放
    private enemyVisualScale = 0.7;

    // 当前玩法状态（待机/画线/飞行/胜利/失败/暂停）
    private state = PlayState.Ready;
    // 当前关配置
    private stageConfig: Game3StageConfig | null = null;
    // 运行时实际使用的各层节点引用
    private battleLayer: Node | null = null;
    private trailLayer: Node | null = null;
    private enemyLayer: Node | null = null;
    private enemyDebugAreaNode: Node | null = null;
    private enemyDebugAreaGraphics: Graphics | null = null;
    private tutorialGuideRoot: Node | null = null;
    private tutorialGuideFingerNode: Node | null = null;
    private tutorialGuideBubbleNode: Node | null = null;
    private tutorialGuideWeaponNode: Node | null = null;
    private tutorialGuideWeaponSprite: Sprite | null = null;
    private tutorialGuideTextLabel: Label | null = null;
    private aimZone: Node | null = null;
    private drawingGraphics: Graphics | null = null;
    private heroNode: Node | null = null;
    private heroVisualNode: Node | null = null;
    private heroSprite: Sprite | null = null;
    private projectileNode: Node | null = null;
    private projectileSprite: Sprite | null = null;
    private projectileOpacity: UIOpacity | null = null;
    private poemLabel: Label | null = null;
    // 运行时生成的诗句容器和每个目标字槽位
    private poemDisplayRoot: Node | null = null;
    private poemTargetSlotNodes: Node[] = [];
    private poemTargetSlotLabels: Label[] = [];
    private stageLabel: Label | null = null;
    private scoreLabel: Label | null = null;
    private energyLabel: Label | null = null;
    private energyValueLabel: Label | null = null;
    private energyBar: ProgressBar | null = null;
    private weatherLabel: Label | null = null;
    private weatherTimerLabel: Label | null = null;
    private tipLabel: Label | null = null;
    private pauseButton: Node | null = null;
    private pauseOverlay: Node | null = null;
    private resultOverlay: Node | null = null;
    // 记录编辑器里配置的初始位置，运行时不再做适配修正
    private initialHeroPos = new Vec3();
    private initialProjectilePos = new Vec3();
    // 当前这一笔是否允许继续画、已记录的轨迹点、场上敌人列表
    private aimStartValid = false;
    private aimPoints: Vec3[] = [];
    private enemies: WordEnemy[] = [];
    // 本次飞行已碰到的敌人，避免重复判定
    private hitEnemyIds = new Set<string>();
    // 已完成目标字、已收集目标字、已显示在诗句上的目标字
    private completedTargetChars = new Set<string>();
    private collectedTargetChars: string[] = [];
    private displayedTargetChars: string[] = [];
    // 分数、误连次数、额外起笔次数、投掷次数、当前灵力
    private score = 0;
    private wrongHits = 0;
    private extraThrows = 0;
    private throwCount = 0;
    private energy = 100;
    private throwCost = 20;
    // 天气相关状态
    private weatherType: WeatherType = 'sunny';
    private weatherTimer = 30;
    private weatherIndex = 0;
    // 投射物飞行时的路径数据
    private projectileRadius = 16;
    private projectileFlying = false;
    private projectileHitJudgementEnabled = false;
    private projectilePathPoints: Vec3[] = [];
    private projectilePathIndex = 0;
    private projectileTravelPosition = new Vec3();
    private currentProjectileSpeed = 1000;
    private projectileTargetAngle = 0;
    // 跑关/整局结算数据
    private currentLevel = 1;
    private currentDifficultyMode: Game3DifficultyMode = getGame3DifficultyMode('easy');
    private pendingWinAfterFlight = false;
    private sessionStartLevel = 1;
    private sessionInitialEnergy = 100;
    private clearedLevelCount = 0;
    private totalSessionScore = 0;
    private totalWrongHits = 0;
    private totalExtraThrows = 0;
    private stageScoreRecords: StageScoreRecord[] = [];
    private pauseResumeButton: Node | null = null;
    private pauseQuitButton: Node | null = null;
    private stateBeforePause: PlayState = PlayState.Ready;
    // 等诗句飞字动画播完后再触发过关
    private activeCollectAnimations = 0;
    // 怪物待机帧动画资源
    private readonly enemyIdleAnimationDirs = [
        'UI/Anim/guaiwu1',
        'UI/Anim/guaiwu2',
        'UI/Anim/guaiwu3',
        'UI/Anim/guaiwu4',
        'UI/Anim/guaiwu5',
        'UI/Anim/guaiwu6',
        'UI/Anim/guaiwu7',
        'UI/Anim/guaiwu8',
        'UI/Anim/guaiwu9',
        'UI/Anim/guaiwu10',
    ];
    private readonly enemyIdleFrameSeconds = 0.08;
    private enemyIdleFrameCache = new Map<string, SpriteFrame[]>();
    private stageEnemyIdleAnimationDirs: string[] = [];
    private stageEnemyIdleAnimationIndex = 0;
    private backgroundSpriteCache = new Map<string, SpriteFrame>();
    private currentBackgroundPath = '';
    private backgroundTransitionToken = 0;
    private projectileSpriteCache = new Map<string, SpriteFrame>();
    private currentProjectileSpritePath = '';
    private readonly heroIdleFrameSeconds = 0.08;
    private heroIdleFrameCache = new Map<string, SpriteFrame[]>();
    private heroIdleFrames: SpriteFrame[] = [];
    private heroIdleFrameIndex = 0;
    private heroIdleFrameTimer = 0;
    private currentHeroIdleDir = '';
    private heroIdleWeaponMode: 'weapon' | 'noweapon' = 'weapon';

    onLoad() {
        audioTool.ins.playMusic(bgmName.game_bg);
        this.ensureRuntimeView();
        if (this.settingsPrefab) {
            nodePool.ins.setPrefab('settings', this.settingsPrefab);
        }
        director.on(emits.gamePause, this.onPauseStateSynced, this);
        this.bindInput();
    }

    start() {
        this.currentDifficultyMode = getGame3DifficultyMode(gameConfig.game3SelectedDifficulty);
        this.currentLevel = this.currentDifficultyMode.startLevel;
        this.sessionStartLevel = this.currentLevel;
        this.sessionInitialEnergy = 100;
        this.energy = this.sessionInitialEnergy;
        this.clearedLevelCount = 0;
        this.totalSessionScore = 0;
        this.totalWrongHits = 0;
        this.totalExtraThrows = 0;
        this.stageScoreRecords = [];
        this.cacheEditorNodePositions();
        this.loadStage(this.currentLevel);
    }

    onDestroy() {
        audioTool.ins.stopMusic();
        director.off(emits.gamePause, this.onPauseStateSynced, this);
        this.unbindInput();
    }

    update(deltaTime: number) {
        if (this.state === PlayState.Pause || gameConfig.gamePause === 1) {
            return;
        }
        if (this.projectileFlying) {
            this.updateProjectile(deltaTime);
        }
        this.updateEnemyIdleAnimations(deltaTime);
        this.updateHeroIdleAnimation(deltaTime);
    }

    private ensureRuntimeView() {
        const transform = this.node.getComponent(UITransform) || this.node.addComponent(UITransform);
        transform.setContentSize(720, 1280);
        this.node.layer = 33554432;

        this.bindEditorReferences();
        this.createBackground();
        this.createBattleRoot();
        this.createHud();
        this.createHero();
        this.createProjectile();
        this.createPauseOverlay();
        this.createResultOverlay();
    }

    private bindEditorReferences() {
        this.battleLayer = this.battleLayerRef || this.battleLayer;
        this.enemyLayer = this.enemyLayerRef || this.enemyLayer;
        this.trailLayer = this.trailLayerRef || this.trailLayer;
        this.aimZone = this.aimZoneRef || this.aimZone;
        this.heroNode = this.heroNodeRef || this.heroNode;
        this.heroVisualNode = this.heroNode?.parent?.getChildByName('HeroNode2') || this.heroVisualNode;
        this.projectileNode = this.projectileNodeRef || this.projectileNode;
        this.tutorialGuideRoot = this.tutorialGuideRootRef || this.tutorialGuideRoot;
        this.tutorialGuideFingerNode = this.tutorialGuideFingerRef || this.tutorialGuideFingerNode;
        this.tutorialGuideBubbleNode = this.tutorialGuideBubbleRef || this.tutorialGuideBubbleNode;
        this.tutorialGuideWeaponNode = this.tutorialGuideWeaponRef || this.tutorialGuideWeaponNode;
        this.tutorialGuideTextLabel = this.tutorialGuideTextRef || this.tutorialGuideTextLabel;
        this.poemLabel = this.poemLabelRef || this.poemLabel;
        this.stageLabel = this.stageLabelRef || this.stageLabel;
        this.scoreLabel = this.scoreLabelRef || this.scoreLabel;
        this.energyLabel = this.energyLabelRef || this.energyLabel;
        this.energyValueLabel = this.energyValueLabelRef || this.energyValueLabel;
        this.energyBar = this.energyBarRef || this.energyBar;
        this.weatherLabel = this.weatherLabelRef || this.weatherLabel;
        this.weatherTimerLabel = this.weatherTimerLabelRef || this.weatherTimerLabel;
        this.tipLabel = this.tipLabelRef || this.tipLabel;
        this.pauseButton = this.pauseButtonRef || this.pauseButton;
        this.pauseOverlay = this.pauseOverlayRef || this.pauseOverlay;
        this.resultOverlay = this.resultOverlayRef || this.resultOverlay;
        this.pauseResumeButton = this.pauseResumeButtonRef || this.pauseResumeButton;
        this.pauseQuitButton = this.pauseQuitButtonRef || this.pauseQuitButton;

        if (this.drawingNodeRef) {
            this.drawingGraphics = this.drawingNodeRef.getComponent(Graphics) || this.drawingNodeRef.addComponent(Graphics);
        }
    }

    private createBackground() {
        const bg = this.backgroundRootRef;
        if (bg) {
            bg.layer = this.node.layer;
            this.updateBackgroundForLevel(this.currentLevel);
            return;
        }

        const runtimeBg = new Node('Background');
        runtimeBg.layer = this.node.layer;
        runtimeBg.parent = this.node;
        runtimeBg.addComponent(UITransform).setContentSize(720, 1280);
        const graphics = runtimeBg.addComponent(Graphics);
        graphics.fillColor = new Color(242, 234, 210, 255);
        graphics.rect(-360, -640, 720, 1280);
        graphics.fill();

        const runtimePaper = new Node('Paper');
        runtimePaper.layer = this.node.layer;
        runtimePaper.parent = runtimeBg;
        runtimePaper.setPosition(0, -20, 0);
        runtimePaper.addComponent(UITransform).setContentSize(660, 920);
        const paperGraphics = runtimePaper.addComponent(Graphics);
        paperGraphics.fillColor = new Color(249, 245, 232, 255);
        paperGraphics.strokeColor = new Color(144, 113, 72, 255);
        paperGraphics.lineWidth = 6;
        paperGraphics.roundRect(-330, -460, 660, 920, 26);
        paperGraphics.fill();
        paperGraphics.stroke();
    }

    private createBattleRoot() {
        if (this.battleLayer && this.enemyLayer && this.trailLayer && this.aimZone) {
            this.battleLayer.layer = this.node.layer;
            this.enemyLayer.layer = this.node.layer;
            this.trailLayer.layer = this.node.layer;
            this.aimZone.layer = this.node.layer;

            if (!this.drawingGraphics) {
                const drawingNode = this.drawingNodeRef || this.trailLayer.getChildByName('Drawing');
                if (drawingNode) {
                    this.drawingGraphics = drawingNode.getComponent(Graphics) || drawingNode.addComponent(Graphics);
                }
            }

            if (this.drawingGraphics) {
                this.applyAimLineStyle(this.aimLineWidth, new Color(53, 127, 226, 255));
            }

            this.ensureEnemyDebugAreaOverlay();
            this.refreshEnemyDebugAreaOverlay();
            return;
        }

        this.battleLayer = new Node('BattleLayer');
        this.battleLayer.layer = this.node.layer;
        this.battleLayer.parent = this.node;
        this.battleLayer.setPosition(0, -30, 0);
        this.battleLayer.addComponent(UITransform).setContentSize(660, 920);

        this.enemyLayer = new Node('EnemyLayer');
        this.enemyLayer.layer = this.node.layer;
        this.enemyLayer.parent = this.battleLayer;
        this.enemyLayer.addComponent(UITransform).setContentSize(660, 920);

        this.trailLayer = new Node('TrailLayer');
        this.trailLayer.layer = this.node.layer;
        this.trailLayer.parent = this.battleLayer;
        this.trailLayer.addComponent(UITransform).setContentSize(660, 920);

        const drawingNode = new Node('Drawing');
        drawingNode.layer = this.node.layer;
        drawingNode.parent = this.trailLayer;
        drawingNode.addComponent(UITransform).setContentSize(660, 920);
        this.drawingGraphics = drawingNode.addComponent(Graphics);
        this.applyAimLineStyle(this.aimLineWidth, new Color(53, 127, 226, 255));

        this.aimZone = new Node('AimZone');
        this.aimZone.layer = this.node.layer;
        this.aimZone.parent = this.battleLayer;
        this.aimZone.addComponent(UITransform).setContentSize(660, 920);

        this.ensureEnemyDebugAreaOverlay();
        this.refreshEnemyDebugAreaOverlay();
    }

    private createHud() {
        if (this.hudRootRef) {
            this.setupPoemDisplay(this.poemLabel?.node.parent || this.hudRootRef);
            if (this.tipLabel?.node) {
                this.tipLabel.node.active = false;
            }
            return;
        }

        const topPanel = new Node('TopPanel');
        topPanel.layer = this.node.layer;
        topPanel.parent = this.node;
        topPanel.setPosition(0, 520, 0);
        topPanel.addComponent(UITransform).setContentSize(660, 200);

        const panelGraphics = topPanel.addComponent(Graphics);
        panelGraphics.fillColor = new Color(255, 250, 238, 210);
        panelGraphics.strokeColor = new Color(146, 117, 66, 255);
        panelGraphics.lineWidth = 4;
        panelGraphics.roundRect(-330, -100, 660, 200, 24);
        panelGraphics.fill();
        panelGraphics.stroke();

        this.energyLabel = this.createLabel(topPanel, '灵力:100', new Vec3(-250, 52, 0), 28, new Color(63, 50, 34, 255), 220);
        this.stageLabel = this.createLabel(topPanel, '关卡:1', new Vec3(-248, 10, 0), 24, new Color(63, 50, 34, 255), 220);
        this.scoreLabel = this.createLabel(topPanel, '评分:0', new Vec3(-40, 10, 0), 24, new Color(63, 50, 34, 255), 220);
        // this.weatherLabel = this.createLabel(topPanel, '朗日', new Vec3(-250, -36, 0), 24, new Color(172, 95, 24, 255), 220);
        // this.weatherTimerLabel = this.createLabel(topPanel, '30s', new Vec3(-138, -36, 0), 22, new Color(132, 88, 42, 255), 120);
        this.poemLabel = this.createLabel(topPanel, '', new Vec3(120, -4, 0), 32, new Color(34, 42, 53, 255), 460);
        this.poemLabel.overflow = Label.Overflow.SHRINK;
        this.setupPoemDisplay(topPanel);

        this.pauseButton = new Node('PauseButton');
        this.pauseButton.layer = this.node.layer;
        this.pauseButton.parent = topPanel;
        this.pauseButton.setPosition(266, 52, 0);
        this.pauseButton.addComponent(UITransform).setContentSize(96, 56);
        const pauseGraphics = this.pauseButton.addComponent(Graphics);
        pauseGraphics.fillColor = new Color(42, 45, 51, 240);
        pauseGraphics.roundRect(-48, -28, 96, 56, 16);
        pauseGraphics.fill();
        this.createLabel(this.pauseButton, '暂停', Vec3.ZERO, 24, new Color(255, 255, 255, 255), 90);

        this.tipLabel = this.createLabel(this.node, '', new Vec3(0, 240, 0), 30, new Color(156, 47, 47, 255), 560);
        this.tipLabel.node.active = false;
    }

    private createHero() {
        if (this.heroNode) {
            this.heroNode.layer = this.node.layer;
            this.heroVisualNode = this.heroNode.parent?.getChildByName('HeroNode2') || this.heroVisualNode || this.heroNode;
            this.heroVisualNode.layer = this.node.layer;
            this.setupHeroIdleAnimation();
            return;
        }

        this.heroNode = new Node('Hero');
        this.heroNode.layer = this.node.layer;
        this.heroNode.parent = this.battleLayer;
        this.heroNode.setScale(this.heroVisualScale, this.heroVisualScale, 1);
        this.heroNode.setPosition(this.initialHeroPos);
        this.heroNode.addComponent(UITransform).setContentSize(110, 110);
        this.heroVisualNode = new Node('HeroNode2');
        this.heroVisualNode.layer = this.node.layer;
        this.heroVisualNode.parent = this.battleLayer;
        this.heroVisualNode.setScale(this.heroVisualScale, this.heroVisualScale, 1);
        this.heroVisualNode.setPosition(this.initialHeroPos);
        this.heroVisualNode.addComponent(UITransform).setContentSize(170, 220);
        this.heroSprite = this.heroVisualNode.addComponent(Sprite);
        this.heroSprite.sizeMode = Sprite.SizeMode.CUSTOM;
        const startPoint = new Node('StartPoint');
        startPoint.layer = this.node.layer;
        startPoint.parent = this.heroNode;
        startPoint.setPosition(0, -74, 0);
        startPoint.addComponent(UITransform).setContentSize(160, 40);
        this.createLabel(startPoint, '起笔点', Vec3.ZERO, 20, new Color(106, 79, 40, 255), 120);
        this.setupHeroIdleAnimation();
    }

    private createProjectile() {
        if (this.projectileNode) {
            this.projectileNode.layer = this.node.layer;
            this.projectileSprite = this.projectileNode.getComponent(Sprite) || this.projectileNode.addComponent(Sprite);
            this.projectileSprite.sizeMode = Sprite.SizeMode.TRIMMED;
            this.projectileOpacity = this.projectileNode.getComponent(UIOpacity) || this.projectileNode.addComponent(UIOpacity);
            this.setupProjectileWeaponSprite();
            this.setProjectileGhostState(false);
            this.setProjectileVisible(false);
            return;
        }

        this.projectileNode = new Node('Projectile');
        this.projectileNode.layer = this.node.layer;
        this.projectileNode.parent = this.battleLayer;
        this.projectileNode.setScale(this.projectileVisualScale, this.projectileVisualScale, 1);
        this.projectileNode.setPosition(this.initialProjectilePos);
        this.projectileNode.addComponent(UITransform).setContentSize(64, 64);
        this.projectileOpacity = this.projectileNode.addComponent(UIOpacity);
        this.projectileSprite = this.projectileNode.addComponent(Sprite);
        this.projectileSprite.sizeMode = Sprite.SizeMode.TRIMMED;
        this.setupProjectileWeaponSprite();
        this.setProjectileGhostState(false);
        this.setProjectileVisible(false);
    }

    private setupProjectileWeaponSprite() {
        if (!this.projectileNode) {
            return;
        }

        this.projectileSprite = this.projectileSprite || this.projectileNode.getComponent(Sprite) || this.projectileNode.addComponent(Sprite);
        this.projectileSprite.sizeMode = Sprite.SizeMode.TRIMMED;
        const spritePath = this.getSelectedProjectileSpritePath();
        if (this.currentProjectileSpritePath === spritePath && this.projectileSprite.spriteFrame) {
            return;
        }

        this.currentProjectileSpritePath = spritePath;
        const cachedFrame = this.projectileSpriteCache.get(spritePath);
        if (cachedFrame) {
            this.projectileSprite.spriteFrame = cachedFrame;
            return;
        }

        resources.load(spritePath, SpriteFrame, (error, spriteFrame) => {
            if (error || !spriteFrame || !this.projectileSprite?.node?.isValid) {
                if (error) {
                    console.error(`Load projectile weapon failed: ${spritePath}`, error);
                }
                return;
            }

            this.projectileSpriteCache.set(spritePath, spriteFrame);
            if (this.currentProjectileSpritePath === spritePath) {
                this.projectileSprite.spriteFrame = spriteFrame;
            }
            if (this.tutorialGuideWeaponSprite?.node?.isValid) {
                this.tutorialGuideWeaponSprite.spriteFrame = spriteFrame;
            }
        });
    }

    private getSelectedProjectileSpritePath() {
        const roleType = Math.max(1, Math.min(5, Number(gameConfig.slectType) || 1));
        return `UI/ZZImg/wuqi${roleType}/spriteFrame`;
    }

    private setupHeroIdleAnimation() {
        const visualNode = this.getHeroVisualNode();
        if (!visualNode) {
            return;
        }

        visualNode.layer = this.node.layer;
        if (this.heroSprite && this.heroSprite.node !== visualNode) {
            this.heroSprite = null;
        }
        this.heroSprite = this.heroSprite || visualNode.getComponent(Sprite) || visualNode.getComponentInChildren(Sprite);
        if (!this.heroSprite) {
            this.heroSprite = visualNode.addComponent(Sprite);
        }
        this.heroSprite.sizeMode = Sprite.SizeMode.CUSTOM;

        const heroDir = this.getSelectedHeroIdleDir();
        const fallbackHeroDir = this.getSelectedHeroBaseDir();
        if (this.currentHeroIdleDir === heroDir && this.heroIdleFrames.length > 0) {
            return;
        }

        this.currentHeroIdleDir = heroDir;
        this.heroIdleFrames = [];
        this.heroIdleFrameIndex = 0;
        this.heroIdleFrameTimer = 0;

        const cachedFrames = this.heroIdleFrameCache.get(heroDir);
        if (cachedFrames && cachedFrames.length > 0) {
            this.setHeroIdleFrames(cachedFrames);
            return;
        }

        this.loadHeroIdleFrames(heroDir, fallbackHeroDir);
    }

    private loadHeroIdleFrames(heroDir: string, fallbackHeroDir = '') {
        const cachedFrames = this.heroIdleFrameCache.get(heroDir);
        if (cachedFrames && cachedFrames.length > 0) {
            this.setHeroIdleFrames(cachedFrames);
            return;
        }

        const visualNode = this.getHeroVisualNode();
        resources.loadDir(heroDir, SpriteFrame, (error, frames) => {
            if (error || !visualNode.isValid || !this.heroSprite?.node?.isValid) {
                if (error) {
                    console.error(`Load hero idle animation failed: ${heroDir}`, error);
                }
                this.loadFallbackHeroIdleFrames(heroDir, fallbackHeroDir);
                return;
            }

            if (this.currentHeroIdleDir !== heroDir) {
                return;
            }

            const sortedFrames = this.sortIdleFrames(frames || []);
            if (sortedFrames.length <= 0) {
                this.loadFallbackHeroIdleFrames(heroDir, fallbackHeroDir);
                return;
            }

            this.heroIdleFrameCache.set(heroDir, sortedFrames);
            this.setHeroIdleFrames(sortedFrames);
        });
    }

    private loadFallbackHeroIdleFrames(heroDir: string, fallbackHeroDir: string) {
        if (!fallbackHeroDir || fallbackHeroDir === heroDir || this.currentHeroIdleDir !== heroDir) {
            return;
        }

        const cachedFrames = this.heroIdleFrameCache.get(fallbackHeroDir);
        if (cachedFrames && cachedFrames.length > 0) {
            this.setHeroIdleFrames(cachedFrames);
            return;
        }

        const visualNode = this.getHeroVisualNode();
        resources.loadDir(fallbackHeroDir, SpriteFrame, (error, frames) => {
            if (error || !visualNode.isValid || !this.heroSprite?.node?.isValid || this.currentHeroIdleDir !== heroDir) {
                if (error) {
                    console.error(`Load hero idle animation fallback failed: ${fallbackHeroDir}`, error);
                }
                return;
            }

            const sortedFrames = this.sortIdleFrames(frames || []);
            if (sortedFrames.length <= 0) {
                return;
            }

            this.heroIdleFrameCache.set(fallbackHeroDir, sortedFrames);
            this.setHeroIdleFrames(sortedFrames);
        });
    }

    private getSelectedHeroIdleDir() {
        return `${this.getSelectedHeroBaseDir()}/${this.heroIdleWeaponMode}`;
    }

    private getSelectedHeroBaseDir() {
        const roleType = Math.max(1, Math.min(5, Number(gameConfig.slectType) || 1));
        return `UI/Anim/role${roleType}`;
    }

    private setHeroIdleWeaponMode(mode: 'weapon' | 'noweapon') {
        if (this.heroIdleWeaponMode === mode && this.heroIdleFrames.length > 0) {
            return;
        }

        this.heroIdleWeaponMode = mode;
        this.setupHeroIdleAnimation();
    }

    private getHeroVisualNode() {
        if (this.heroVisualNode?.isValid) {
            return this.heroVisualNode;
        }

        this.heroVisualNode = this.heroNode?.parent?.getChildByName('HeroNode2') || this.heroNode;
        return this.heroVisualNode;
    }

    private setHeroIdleFrames(frames: SpriteFrame[]) {
        if (!this.heroSprite || !this.heroSprite.node?.isValid || frames.length <= 0) {
            return;
        }

        this.heroIdleFrames = frames;
        this.heroIdleFrameIndex = 0;
        this.heroIdleFrameTimer = 0;
        this.heroSprite.sizeMode = Sprite.SizeMode.CUSTOM;
        this.heroSprite.spriteFrame = frames[0];
    }

    private updateHeroIdleAnimation(deltaTime: number) {
        if (deltaTime <= 0 || !this.heroSprite || this.heroIdleFrames.length <= 1) {
            return;
        }

        const frameSeconds = this.getHeroIdleFrameSeconds();
        this.heroIdleFrameTimer += deltaTime;
        while (this.heroIdleFrameTimer >= frameSeconds) {
            this.heroIdleFrameTimer -= frameSeconds;
            this.heroIdleFrameIndex = (this.heroIdleFrameIndex + 1) % this.heroIdleFrames.length;
            this.heroSprite.spriteFrame = this.heroIdleFrames[this.heroIdleFrameIndex];
        }
    }

    private getHeroIdleFrameSeconds() {
        const roleType = Math.max(1, Math.min(5, Number(gameConfig.slectType) || 1));
        if (this.heroIdleWeaponMode !== 'noweapon' || roleType < 3 || this.heroIdleFrames.length <= 0) {
            return this.heroIdleFrameSeconds;
        }

        const targetFrameCount = 16;
        return this.heroIdleFrameSeconds * targetFrameCount / this.heroIdleFrames.length;
    }

    private createPauseOverlay() {
        if (this.pauseOverlay) {
            this.pauseOverlay.layer = this.node.layer;
            this.pauseOverlay.active = false;
            this.pauseResumeButton = this.pauseResumeButtonRef || this.pauseResumeButton || this.pauseOverlay.getChildByName('PausePanel')?.getChildByName('ResumeButton');
            this.pauseQuitButton = this.pauseQuitButtonRef || this.pauseQuitButton || this.pauseOverlay.getChildByName('PausePanel')?.getChildByName('QuitButton');
            return;
        }

        this.pauseOverlay = new Node('PauseOverlay');
        this.pauseOverlay.layer = this.node.layer;
        this.pauseOverlay.parent = this.node;
        this.pauseOverlay.addComponent(UITransform).setContentSize(720, 1280);
        this.pauseOverlay.active = false;
        const bg = this.pauseOverlay.addComponent(Graphics);
        bg.fillColor = new Color(15, 18, 24, 180);
        bg.rect(-360, -640, 720, 1280);
        bg.fill();

        const panel = new Node('PausePanel');
        panel.layer = this.node.layer;
        panel.parent = this.pauseOverlay;
        panel.addComponent(UITransform).setContentSize(420, 320);
        const panelGraphics = panel.addComponent(Graphics);
        panelGraphics.fillColor = new Color(254, 248, 233, 255);
        panelGraphics.strokeColor = new Color(133, 101, 53, 255);
        panelGraphics.lineWidth = 5;
        panelGraphics.roundRect(-210, -160, 420, 320, 18);
        panelGraphics.fill();
        panelGraphics.stroke();
        this.createLabel(panel, '暂停', new Vec3(0, 100, 0), 38, new Color(44, 40, 37, 255), 200);

        const resumeButton = this.createTextButton(panel, 'ResumeButton', '继续游戏', new Vec3(0, 20, 0), new Color(67, 136, 90, 255));
        const quitButton = this.createTextButton(panel, 'QuitButton', '退出结算', new Vec3(0, -74, 0), new Color(147, 87, 54, 255));
        resumeButton.on(Node.EventType.TOUCH_END, () => this.resumeGame(), this);
        quitButton.on(Node.EventType.TOUCH_END, () => this.failGame('quit'), this);
    }

    private createResultOverlay() {
        if (this.resultOverlay) {
            this.resultOverlay.layer = this.node.layer;
            this.resultOverlay.active = false;
            return;
        }

        this.resultOverlay = new Node('ResultOverlay');
        this.resultOverlay.layer = this.node.layer;
        this.resultOverlay.parent = this.node;
        this.resultOverlay.addComponent(UITransform).setContentSize(720, 1280);
        this.resultOverlay.active = false;
    }

    private bindInput() {
        this.aimZone?.on(Node.EventType.TOUCH_START, this.onTouchStart, this);
        this.aimZone?.on(Node.EventType.TOUCH_MOVE, this.onTouchMove, this);
        this.aimZone?.on(Node.EventType.TOUCH_END, this.onTouchEnd, this);
        this.aimZone?.on(Node.EventType.TOUCH_CANCEL, this.onTouchCancel, this);
        this.tutorialGuideRoot?.on(Node.EventType.TOUCH_START, this.onTouchStart, this);
        this.tutorialGuideRoot?.on(Node.EventType.TOUCH_MOVE, this.onTouchMove, this);
        this.tutorialGuideRoot?.on(Node.EventType.TOUCH_END, this.onTouchEnd, this);
        this.tutorialGuideRoot?.on(Node.EventType.TOUCH_CANCEL, this.onTouchCancel, this);
        this.projectileNode?.on(Node.EventType.TOUCH_START, this.onTouchStart, this);
        this.projectileNode?.on(Node.EventType.TOUCH_MOVE, this.onTouchMove, this);
        this.projectileNode?.on(Node.EventType.TOUCH_END, this.onTouchEnd, this);
        this.projectileNode?.on(Node.EventType.TOUCH_CANCEL, this.onTouchCancel, this);
        this.pauseButton?.on(Node.EventType.TOUCH_END, this.pauseGame, this);
        this.pauseResumeButton?.on(Node.EventType.TOUCH_END, this.resumeGame, this);
        this.pauseQuitButton?.on(Node.EventType.TOUCH_END, this.onPauseQuitClick, this);
    }

    private unbindInput() {
        if (this.aimZone && this.aimZone.isValid) {
            this.aimZone.off(Node.EventType.TOUCH_START, this.onTouchStart, this);
            this.aimZone.off(Node.EventType.TOUCH_MOVE, this.onTouchMove, this);
            this.aimZone.off(Node.EventType.TOUCH_END, this.onTouchEnd, this);
            this.aimZone.off(Node.EventType.TOUCH_CANCEL, this.onTouchCancel, this);
        }

        if (this.tutorialGuideRoot && this.tutorialGuideRoot.isValid) {
            this.tutorialGuideRoot.off(Node.EventType.TOUCH_START, this.onTouchStart, this);
            this.tutorialGuideRoot.off(Node.EventType.TOUCH_MOVE, this.onTouchMove, this);
            this.tutorialGuideRoot.off(Node.EventType.TOUCH_END, this.onTouchEnd, this);
            this.tutorialGuideRoot.off(Node.EventType.TOUCH_CANCEL, this.onTouchCancel, this);
        }

        if (this.projectileNode && this.projectileNode.isValid) {
            this.projectileNode.off(Node.EventType.TOUCH_START, this.onTouchStart, this);
            this.projectileNode.off(Node.EventType.TOUCH_MOVE, this.onTouchMove, this);
            this.projectileNode.off(Node.EventType.TOUCH_END, this.onTouchEnd, this);
            this.projectileNode.off(Node.EventType.TOUCH_CANCEL, this.onTouchCancel, this);
        }

        if (this.pauseButton && this.pauseButton.isValid) {
            this.pauseButton.off(Node.EventType.TOUCH_END, this.pauseGame, this);
        }

        if (this.pauseResumeButton && this.pauseResumeButton.isValid) {
            this.pauseResumeButton.off(Node.EventType.TOUCH_END, this.resumeGame, this);
        }

        if (this.pauseQuitButton && this.pauseQuitButton.isValid) {
            this.pauseQuitButton.off(Node.EventType.TOUCH_END, this.onPauseQuitClick, this);
        }
    }

    private loadStage(level: number) {
        const config = this.getStageConfig(level);
        this.stageConfig = config;
        this.currentLevel = level;
        this.state = PlayState.Ready;
        this.throwCount = 0;
        this.extraThrows = 0;
        this.wrongHits = 0;
        this.score = 0;
        this.hitEnemyIds.clear();
        this.completedTargetChars.clear();
        this.collectedTargetChars = [];
        this.displayedTargetChars = [];
        this.throwCost = config.throwCost;
        this.weatherIndex = 0;
        this.weatherType = (config.weatherSequence && config.weatherSequence[0]) || 'sunny';
        this.weatherTimer = config.weatherInterval || this.weatherDuration;
        this.projectileFlying = false;
        this.projectileHitJudgementEnabled = false;
        this.pendingWinAfterFlight = false;
        this.stateBeforePause = PlayState.Ready;
        this.updateBackgroundForLevel(level);
        this.resetProjectile();
        this.clearAimPath();
        this.buildEnemies(config);
        this.refreshEnemyDebugAreaOverlay();
        this.refreshPoemDisplay();
        this.refreshHud();
        this.refreshTutorialGuide();
        this.hideTip();
        this.hideResult();
        this.resumeFromPauseState(false);
        this.setupHeroIdleAnimation();
    }

    private updateBackgroundForLevel(level: number) {
        const bg = this.backgroundRootRef;
        const sprite = bg?.getComponent(Sprite);
        if (!bg || !sprite) {
            return;
        }
        this.applyBackgroundFit(sprite);

        const backgroundIndex = Math.min(5, Math.max(1, Math.floor((Math.max(1, level) - 1) / 20) + 1));
        const resourcePath = `UI/ZZImg/bg${backgroundIndex}/spriteFrame`;
        if (this.currentBackgroundPath === resourcePath && sprite.spriteFrame) {
            return;
        }

        const opacity = bg.getComponent(UIOpacity) || bg.addComponent(UIOpacity);
        const cachedSpriteFrame = this.backgroundSpriteCache.get(resourcePath);
        if (cachedSpriteFrame) {
            this.playBackgroundTransition(sprite, opacity, cachedSpriteFrame, resourcePath);
            return;
        }

        const token = ++this.backgroundTransitionToken;
        resources.load(resourcePath, SpriteFrame, (error, spriteFrame) => {
            if (error || !spriteFrame || !sprite.node?.isValid) {
                if (error) {
                    console.error(`Load Game3 background failed: ${resourcePath}`, error);
                }
                return;
            }
            this.backgroundSpriteCache.set(resourcePath, spriteFrame);
            if (token !== this.backgroundTransitionToken) {
                return;
            }
            this.playBackgroundTransition(sprite, opacity, spriteFrame, resourcePath);
        });
    }

    private playBackgroundTransition(sprite: Sprite, opacity: UIOpacity, spriteFrame: SpriteFrame, resourcePath: string) {
        const hasCurrentBackground = !!sprite.spriteFrame;
        this.currentBackgroundPath = resourcePath;
        this.backgroundTransitionToken += 1;
        Tween.stopAllByTarget(opacity);

        if (!hasCurrentBackground) {
            sprite.spriteFrame = spriteFrame;
            this.applyBackgroundFit(sprite);
            opacity.opacity = 255;
            return;
        }

        tween(opacity)
            .to(0.18, { opacity: 110 })
            .call(() => {
                if (!sprite.node?.isValid) {
                    return;
                }
                sprite.spriteFrame = spriteFrame;
                this.applyBackgroundFit(sprite);
            })
            .to(0.22, { opacity: 255 })
            .start();
    }

    private applyBackgroundFit(sprite: Sprite) {
        sprite.sizeMode = Sprite.SizeMode.CUSTOM;
    }

    private getStageConfig(level: number): Game3StageConfig {
        const json = this.levelsJson?.json as any;
        const stages = Array.isArray(json) ? json : json?.stages;
        if (Array.isArray(stages)) {
            const found = stages.find((item: Game3StageConfig) => item.level === level) || stages[0];
            return JSON.parse(JSON.stringify(found));
        }

        return {
            level,
            poem: '风急天高猿啸哀',
            correctChars: ['天', '猿'],
            energy: 100,
            wrongCost: 20,
            roomScore: 100,
            throwCost: 20,
            weatherInterval: 18,
            weatherSequence: ['sunny', 'rainy', 'cloudy'],
            enemies: [
                { id: 'M001', char: '天', position: { x: 20, y: 300 }, isTarget: true },
                { id: 'M002', char: '木', position: { x: -140, y: 180 } },
                { id: 'M003', char: '猿', position: { x: 110, y: -10 }, isTarget: true },
                { id: 'M004', char: '人', position: { x: 230, y: 340 } },
                { id: 'M005', char: '山', position: { x: 200, y: 120 } }
            ]
        };
    }

    private createEnemyNode(enemyConfig: Game3EnemyConfig) {
        if (this.enemyItemPrefab) {
            const node = instantiate(this.enemyItemPrefab);
            node.name = enemyConfig.id;
            return node;
        }

        const enemyNode = new Node(enemyConfig.id);
        enemyNode.addComponent(UITransform).setContentSize(96, 120);
        const bodyNode = new Node('body');
        bodyNode.layer = this.node.layer;
        bodyNode.parent = enemyNode;
        bodyNode.setPosition(0, 4, 0);
        bodyNode.addComponent(UITransform).setContentSize(120, 120);
        const bodySprite = bodyNode.addComponent(Sprite);
        bodySprite.sizeMode = Sprite.SizeMode.CUSTOM;
        return enemyNode;
    }

    private setupEnemyVisual(enemyNode: Node, enemyConfig: Game3EnemyConfig) {
        const hpBarFromPrefab = enemyNode.getComponentInChildren(ProgressBar);
        const charLabelNode = enemyNode.getChildByName('CharLabel');
        const charLabel = charLabelNode?.getComponent(Label) || enemyNode.getComponentInChildren(Label);
        const bodyNode = enemyNode.getChildByName('body');
        const bodySprite = bodyNode?.getComponent(Sprite) || enemyNode.getComponentInChildren(Sprite);

        if (this.enemyItemPrefab) {
            const transform = enemyNode.getComponent(UITransform) || enemyNode.addComponent(UITransform);
            if (transform.width <= 0 || transform.height <= 0) {
                transform.setContentSize(96, 120);
            }

            if (charLabel) {
                charLabel.string = enemyConfig.char;
            }

            if (hpBarFromPrefab) {
                hpBarFromPrefab.progress = 1;
                return hpBarFromPrefab;
            }
        }

        if (charLabel) {
            charLabel.string = enemyConfig.char;
        } else {
            this.createLabel(enemyNode, enemyConfig.char, new Vec3(0, 48, 0), 42, new Color(255, 252, 248, 255), 80);
        }

        const hpBg = new Node('HPBg');
        hpBg.layer = this.node.layer;
        hpBg.parent = enemyNode;
        hpBg.setPosition(0, -60, 0);
        hpBg.addComponent(UITransform).setContentSize(86, 12);
        const hpBgGraphics = hpBg.addComponent(Graphics);
        hpBgGraphics.fillColor = new Color(72, 58, 47, 255);
        hpBgGraphics.roundRect(-43, -6, 86, 12, 6);
        hpBgGraphics.fill();

        const hpBarNode = new Node('HPBar');
        hpBarNode.layer = this.node.layer;
        hpBarNode.parent = hpBg;
        hpBarNode.addComponent(UITransform).setContentSize(80, 8);
        const hpBar = hpBarNode.addComponent(ProgressBar);
        const hpSprite = hpBarNode.addComponent(Sprite);
        hpSprite.color = new Color(218, 83, 63, 255);
        hpBar.totalLength = 80;
        hpBar.mode = ProgressBar.Mode.HORIZONTAL;
        hpBar.barSprite = hpSprite;
        hpBar.progress = 1;
        return hpBar;
    }

    private buildEnemies(config: Game3StageConfig) {
        this.enemyLayer?.removeAllChildren();
        this.enemies = [];
        this.resetStageEnemyIdleAnimationOrder();
        const formationCenter = this.getEnemyFormationCenter(config.enemies);

        config.enemies.forEach((enemyConfig) => {
            const enemyNode = this.createEnemyNode(enemyConfig);
            enemyNode.name = enemyConfig.id;
            enemyNode.layer = this.node.layer;
            enemyNode.parent = this.enemyLayer;
            enemyNode.setScale(this.enemyVisualScale, this.enemyVisualScale, 1);
            const adjustedPosition = this.getAdjustedEnemyPosition(enemyConfig.position, formationCenter);
            enemyNode.setPosition(adjustedPosition);

            const hpBar = this.setupEnemyVisual(enemyNode, enemyConfig);
            const bodySprite = this.getEnemyBodySprite(enemyNode);
            const enemy: WordEnemy = {
                config: enemyConfig,
                node: enemyNode,
                hpBar,
                isAlive: true,
                isTarget: !!enemyConfig.isTarget,
                bodySprite,
                idleFrames: [],
                idleFrameIndex: 0,
                idleFrameTimer: Math.random() * this.enemyIdleFrameSeconds,
            };

            this.enemies.push(enemy);
            if (bodySprite) {
                this.applyEnemyIdleAnimation(enemy);
            }
        });
    }

    private getEnemyBodySprite(enemyNode: Node) {
        const bodyNode = enemyNode.getChildByName('body');
        return bodyNode?.getComponent(Sprite) || enemyNode.getComponentInChildren(Sprite);
    }

    private applyEnemyIdleAnimation(enemy: WordEnemy) {
        const bodySprite = enemy.bodySprite;
        if (!bodySprite || this.enemyIdleAnimationDirs.length <= 0) {
            return;
        }

        const resourceDir = this.getNextStageEnemyIdleAnimationDir();
        const cachedFrames = this.enemyIdleFrameCache.get(resourceDir);
        if (cachedFrames && cachedFrames.length > 0) {
            this.setEnemyIdleFrames(enemy, cachedFrames);
            return;
        }

        resources.loadDir(resourceDir, SpriteFrame, (error, frames) => {
            if (error || !bodySprite.node?.isValid || !enemy.node?.isValid) {
                if (error) {
                    console.error(`Load enemy idle animation failed: ${resourceDir}`, error);
                }
                return;
            }

            const sortedFrames = this.sortIdleFrames(frames || []);
            if (sortedFrames.length <= 0) {
                return;
            }

            this.enemyIdleFrameCache.set(resourceDir, sortedFrames);
            this.setEnemyIdleFrames(enemy, sortedFrames);
        });
    }

    private setEnemyIdleFrames(enemy: WordEnemy, frames: SpriteFrame[]) {
        if (!enemy.bodySprite || !enemy.bodySprite.node?.isValid || frames.length <= 0) {
            return;
        }

        enemy.idleFrames = frames;
        enemy.idleFrameIndex = Math.floor(Math.random() * frames.length);
        enemy.idleFrameTimer = Math.random() * this.enemyIdleFrameSeconds;
        enemy.bodySprite.sizeMode = Sprite.SizeMode.CUSTOM;
        enemy.bodySprite.spriteFrame = frames[enemy.idleFrameIndex];
    }

    private sortIdleFrames(frames: SpriteFrame[]) {
        return frames
            .filter((frame) => !!frame)
            .sort((a, b) => this.getIdleFrameOrder(a) - this.getIdleFrameOrder(b));
    }

    private getIdleFrameOrder(frame: SpriteFrame) {
        const name = frame.name || '';
        const match = name.match(/(\d+)$/);
        return match ? Number(match[1]) : 0;
    }

    private getNextStageEnemyIdleAnimationDir() {
        if (this.stageEnemyIdleAnimationDirs.length <= 0) {
            this.resetStageEnemyIdleAnimationOrder();
        }

        const resourceDir = this.stageEnemyIdleAnimationDirs[this.stageEnemyIdleAnimationIndex % this.stageEnemyIdleAnimationDirs.length];
        this.stageEnemyIdleAnimationIndex += 1;
        return resourceDir;
    }

    private resetStageEnemyIdleAnimationOrder() {
        this.stageEnemyIdleAnimationDirs = [...this.enemyIdleAnimationDirs];
        for (let i = this.stageEnemyIdleAnimationDirs.length - 1; i > 0; i--) {
            const randomIndex = Math.floor(Math.random() * (i + 1));
            const temp = this.stageEnemyIdleAnimationDirs[i];
            this.stageEnemyIdleAnimationDirs[i] = this.stageEnemyIdleAnimationDirs[randomIndex];
            this.stageEnemyIdleAnimationDirs[randomIndex] = temp;
        }
        this.stageEnemyIdleAnimationIndex = 0;
    }

    private updateEnemyIdleAnimations(deltaTime: number) {
        if (deltaTime <= 0) {
            return;
        }

        for (const enemy of this.enemies) {
            if (!enemy.isAlive || !enemy.bodySprite || !enemy.idleFrames || enemy.idleFrames.length <= 1) {
                continue;
            }

            enemy.idleFrameTimer = (enemy.idleFrameTimer || 0) + deltaTime;
            while (enemy.idleFrameTimer >= this.enemyIdleFrameSeconds) {
                enemy.idleFrameTimer -= this.enemyIdleFrameSeconds;
                enemy.idleFrameIndex = ((enemy.idleFrameIndex || 0) + 1) % enemy.idleFrames.length;
                enemy.bodySprite.spriteFrame = enemy.idleFrames[enemy.idleFrameIndex];
            }
        }
    }

    private getEnemyFormationCenter(enemies: Game3EnemyConfig[]) {
        if (enemies.length === 0) {
            return { x: 0, y: 0 };
        }

        let minX = enemies[0].position.x;
        let maxX = enemies[0].position.x;
        let minY = enemies[0].position.y;
        let maxY = enemies[0].position.y;

        for (let i = 1; i < enemies.length; i++) {
            const { x, y } = enemies[i].position;
            minX = Math.min(minX, x);
            maxX = Math.max(maxX, x);
            minY = Math.min(minY, y);
            maxY = Math.max(maxY, y);
        }

        return {
            x: (minX + maxX) * 0.5,
            y: (minY + maxY) * 0.5,
        };
    }

    private getAdjustedEnemyPosition(position: { x: number; y: number }, formationCenter: { x: number; y: number }) {
        const offsetX = position.x - formationCenter.x;
        const offsetY = position.y - formationCenter.y;
        const adjustedX = this.enemyFormationCenterX + offsetX * this.enemyFormationSpreadX;
        const adjustedY = formationCenter.y + offsetY * this.enemyFormationSpreadY + this.enemyFormationOffsetY;
        const clampedX = Math.max(this.enemyAreaMinX, Math.min(this.enemyAreaMaxX, adjustedX));
        const clampedY = Math.max(this.enemyAreaMinY, Math.min(this.enemyAreaMaxY, adjustedY));
        return new Vec3(clampedX, clampedY, 0);
    }

    private ensureEnemyDebugAreaOverlay() {
        if (!this.battleLayer) {
            return;
        }
        
        if (!this.enemyDebugAreaNode || !this.enemyDebugAreaNode.isValid) {
            this.enemyDebugAreaNode = new Node('EnemyDebugArea');
            this.enemyDebugAreaNode.layer = this.node.layer;
            this.enemyDebugAreaNode.parent = this.battleLayer;
            this.enemyDebugAreaNode.addComponent(UITransform).setContentSize(720, 580);
            this.enemyDebugAreaGraphics = this.enemyDebugAreaNode.addComponent(Graphics);
        }

        this.enemyDebugAreaNode.setSiblingIndex(Math.max(0, this.battleLayer.children.length - 1));
        this.enemyDebugAreaGraphics = this.enemyDebugAreaGraphics
            || this.enemyDebugAreaNode.getComponent(Graphics)
            || this.enemyDebugAreaNode.addComponent(Graphics);
        this.enemyDebugAreaNode.active = false;
    }

    private refreshEnemyDebugAreaOverlay() {
        this.ensureEnemyDebugAreaOverlay();
        if (!this.enemyDebugAreaGraphics) {
            return;
        }

        const width = this.enemyAreaMaxX - this.enemyAreaMinX;
        const height = this.enemyAreaMaxY - this.enemyAreaMinY;

        this.enemyDebugAreaGraphics.clear();
        this.enemyDebugAreaGraphics.lineWidth = 4;
        this.enemyDebugAreaGraphics.strokeColor = new Color(255, 48, 48, 255);
        this.enemyDebugAreaGraphics.fillColor = new Color(255, 48, 48, 24);
        this.enemyDebugAreaGraphics.rect(this.enemyAreaMinX, this.enemyAreaMinY, width, height);
        this.enemyDebugAreaGraphics.fill();
        this.enemyDebugAreaGraphics.stroke();
    }

    private refreshTutorialGuide() {
        if (!this.shouldShowTutorialGuide()) {
            this.dismissTutorialGuide(false);
            return;
        }

        this.ensureTutorialGuideOverlay();
        this.layoutTutorialGuideOverlay();
        this.startTutorialFingerPulse();
    }

    private shouldShowTutorialGuide() {
        return this.currentLevel === 1 && !this.hasSeenTutorialGuide();
    }

    private hasSeenTutorialGuide() {
        return sys.localStorage.getItem(this.getTutorialGuideStorageKey()) === '1';
    }

    private getTutorialGuideStorageKey() {
        return getUserScopedKey(this.STORAGE_KEY_HAS_SEEN_GUIDE);
    }

    private markTutorialGuideSeen() {
        sys.localStorage.setItem(this.getTutorialGuideStorageKey(), '1');
    }

    private ensureTutorialGuideOverlay() {
        if (!this.tutorialGuideRoot || !this.tutorialGuideRoot.isValid) {
            this.tutorialGuideRoot = new Node('TutorialGuide');
            this.tutorialGuideRoot.layer = this.node.layer;
            this.tutorialGuideRoot.parent = this.node;
            this.tutorialGuideRoot.addComponent(UITransform).setContentSize(720, 1280);
        }

        this.tutorialGuideRoot.active = true;
        this.tutorialGuideRoot.setSiblingIndex(this.node.children.length - 1);
        const guideMask = this.tutorialGuideRoot.getComponent(Sprite);
        if (guideMask) {
            guideMask.enabled = true;
        }

        if (!this.tutorialGuideFingerNode || !this.tutorialGuideFingerNode.isValid) {
            this.tutorialGuideFingerNode = this.createTutorialFingerNode();
            this.tutorialGuideFingerNode.parent = this.tutorialGuideRoot;
        }
        this.tutorialGuideFingerNode.active = true;

        if (!this.tutorialGuideBubbleNode || !this.tutorialGuideBubbleNode.isValid) {
            this.tutorialGuideBubbleNode = this.createTutorialBubbleNode();
            this.tutorialGuideBubbleNode.parent = this.tutorialGuideRoot;
        }
        this.tutorialGuideBubbleNode.active = true;

        this.setupTutorialGuideWeaponNode();

        if (!this.tutorialGuideTextLabel || !this.tutorialGuideTextLabel.isValid) {
            this.tutorialGuideTextLabel = this.tutorialGuideTextRef
                || this.tutorialGuideBubbleNode.getComponent(Label)
                || this.tutorialGuideBubbleNode.getComponentInChildren(Label);
        }

        if (this.tutorialGuideTextLabel) {
            this.tutorialGuideTextLabel.node.active = true;
            this.tutorialGuideTextLabel.string = '滑动武器击败魔物获取被封印的文字。';
        }
    }

    private setupTutorialGuideWeaponNode() {
        this.tutorialGuideWeaponNode = this.tutorialGuideWeaponRef || this.tutorialGuideWeaponNode;
        if (!this.tutorialGuideWeaponNode || !this.tutorialGuideWeaponNode.isValid) {
            return;
        }

        this.tutorialGuideWeaponNode.active = true;
        this.tutorialGuideWeaponNode.layer = this.node.layer;
        this.tutorialGuideWeaponSprite = this.tutorialGuideWeaponNode.getComponent(Sprite) || this.tutorialGuideWeaponNode.addComponent(Sprite);
        this.tutorialGuideWeaponSprite.sizeMode = Sprite.SizeMode.TRIMMED;
        const spritePath = this.getSelectedProjectileSpritePath();
        const cachedFrame = this.projectileSpriteCache.get(spritePath);
        if (cachedFrame) {
            this.tutorialGuideWeaponSprite.spriteFrame = cachedFrame;
        } else {
            resources.load(spritePath, SpriteFrame, (error, spriteFrame) => {
                if (error || !spriteFrame || !this.tutorialGuideWeaponSprite?.node?.isValid) {
                    if (error) {
                        console.error(`Load tutorial weapon failed: ${spritePath}`, error);
                    }
                    return;
                }

                this.projectileSpriteCache.set(spritePath, spriteFrame);
                this.tutorialGuideWeaponSprite.spriteFrame = spriteFrame;
            });
        }
    }

    private layoutTutorialGuideOverlay() {
        if (!this.tutorialGuideFingerNode || !this.tutorialGuideBubbleNode || !this.projectileNode) {
            return;
        }

        if (this.tutorialGuideRootRef && this.tutorialGuideFingerRef && this.tutorialGuideBubbleRef) {
            return;
        }

        const rootTransform = this.node.getComponent(UITransform);
        const projectileWorldPos = this.projectileNode.getWorldPosition(new Vec3());
        const projectileLocalPos = rootTransform
            ? rootTransform.convertToNodeSpaceAR(projectileWorldPos)
            : new Vec3();

        this.tutorialGuideFingerNode.setPosition(projectileLocalPos.x + 46, projectileLocalPos.y + 28, 0);
        this.tutorialGuideBubbleNode.setPosition(projectileLocalPos.x + 118, projectileLocalPos.y + 138, 0);
    }

    private createTutorialFingerNode() {
        const fingerNode = new Node('GuideFinger');
        fingerNode.layer = this.node.layer;
        fingerNode.addComponent(UITransform).setContentSize(92, 122);

        const shadowNode = new Node('Shadow');
        shadowNode.layer = this.node.layer;
        shadowNode.parent = fingerNode;
        shadowNode.setPosition(8, -8, 0);
        shadowNode.addComponent(UITransform).setContentSize(72, 96);
        const shadowGraphics = shadowNode.addComponent(Graphics);
        shadowGraphics.fillColor = new Color(0, 0, 0, 40);
        shadowGraphics.roundRect(-22, -28, 44, 58, 18);
        shadowGraphics.fill();
        shadowGraphics.roundRect(0, -8, 20, 64, 10);
        shadowGraphics.fill();
        shadowGraphics.circle(10, 56, 10);
        shadowGraphics.fill();

        const fingerGraphics = fingerNode.addComponent(Graphics);
        fingerGraphics.fillColor = new Color(255, 243, 220, 255);
        fingerGraphics.strokeColor = new Color(193, 126, 92, 255);
        fingerGraphics.lineWidth = 3;
        fingerGraphics.roundRect(-22, -28, 44, 58, 18);
        fingerGraphics.fill();
        fingerGraphics.stroke();
        fingerGraphics.roundRect(0, -8, 20, 64, 10);
        fingerGraphics.fill();
        fingerGraphics.stroke();
        fingerGraphics.circle(10, 56, 10);
        fingerGraphics.fill();
        fingerGraphics.stroke();

        return fingerNode;
    }

    private createTutorialBubbleNode() {
        const bubbleNode = new Node('GuideBubble');
        bubbleNode.layer = this.node.layer;
        bubbleNode.addComponent(UITransform).setContentSize(308, 152);

        const bubbleGraphics = bubbleNode.addComponent(Graphics);
        bubbleGraphics.fillColor = new Color(255, 251, 244, 238);
        bubbleGraphics.strokeColor = new Color(198, 92, 71, 255);
        bubbleGraphics.lineWidth = 4;
        bubbleGraphics.roundRect(-154, -76, 308, 118, 24);
        bubbleGraphics.fill();
        bubbleGraphics.stroke();
        bubbleGraphics.moveTo(-56, -10);
        bubbleGraphics.lineTo(-100, -74);
        bubbleGraphics.lineTo(-16, -26);
        bubbleGraphics.close();
        bubbleGraphics.fill();
        bubbleGraphics.stroke();

        const labelNode = new Node('GuideText');
        labelNode.layer = this.node.layer;
        labelNode.parent = bubbleNode;
        labelNode.setPosition(0, -8, 0);
        labelNode.addComponent(UITransform).setContentSize(250, 92);

        const guideLabel = labelNode.addComponent(Label);
        guideLabel.string = '滑动武器击败魔物\n获取被封印的文字';
        guideLabel.fontSize = 26;
        guideLabel.lineHeight = 34;
        guideLabel.color = new Color(92, 58, 43, 255);
        guideLabel.horizontalAlign = Label.HorizontalAlign.CENTER;
        guideLabel.verticalAlign = Label.VerticalAlign.CENTER;
        guideLabel.overflow = Label.Overflow.SHRINK;

        return bubbleNode;
    }

    private startTutorialFingerPulse() {
        if (!this.tutorialGuideFingerNode) {
            return;
        }

        Tween.stopAllByTarget(this.tutorialGuideFingerNode);
        this.tutorialGuideFingerNode.setScale(new Vec3(1, 1, 1));
        tween(this.tutorialGuideFingerNode)
            .repeatForever(
                tween()
                    .to(0.55, { scale: new Vec3(1.12, 1.12, 1) }, { easing: 'sineInOut' })
                    .to(0.55, { scale: new Vec3(0.94, 0.94, 1) }, { easing: 'sineInOut' }),
            )
            .start();
    }

    private dismissTutorialGuide(markSeen: boolean) {
        if (markSeen) {
            this.markTutorialGuideSeen();
        }

        if (this.tutorialGuideFingerNode?.isValid) {
            Tween.stopAllByTarget(this.tutorialGuideFingerNode);
            this.tutorialGuideFingerNode.setScale(new Vec3(1, 1, 1));
        }

        if (this.tutorialGuideRoot?.isValid) {
            this.tutorialGuideRoot.active = false;
        }
    }

    private hideTutorialGuideVisualsForCurrentTouch(markSeen: boolean) {
        if (markSeen) {
            this.markTutorialGuideSeen();
        }

        if (this.tutorialGuideFingerNode?.isValid) {
            Tween.stopAllByTarget(this.tutorialGuideFingerNode);
            this.tutorialGuideFingerNode.setScale(new Vec3(1, 1, 1));
            this.tutorialGuideFingerNode.active = false;
        }

        if (this.tutorialGuideBubbleNode?.isValid) {
            this.tutorialGuideBubbleNode.active = false;
        }

        if (this.tutorialGuideWeaponNode?.isValid) {
            this.tutorialGuideWeaponNode.active = false;
        }

        if (this.tutorialGuideTextLabel?.node?.isValid) {
            this.tutorialGuideTextLabel.node.active = false;
        }

        const guideMask = this.tutorialGuideRoot?.getComponent(Sprite);
        if (guideMask) {
            guideMask.enabled = false;
        }
    }

    private onTouchStart(event: EventTouch) {
        if (!this.canStartAiming()) {
            return;
        }
        const projectileHomePos = this.getProjectileHomeBattlePos();
        const local = this.uiToBattleLocal(event.getUILocation());
        if (!this.isWithinProjectileStartArea(local, projectileHomePos)) {
            this.aimStartValid = false;
            return;
        }
        this.hideTutorialGuideVisualsForCurrentTouch(true);
        this.aimStartValid = true;
        this.state = PlayState.Aiming;
        this.aimPoints = [projectileHomePos.clone()];
        this.projectileNode?.setPosition(projectileHomePos);
        this.resetProjectileRotation();
        this.setProjectileGhostState(false);
        this.drawAimPath();
    }

    private isWithinProjectileStartArea(local: Vec3, projectileHomePos: Vec3) {
        return Vec3.distance(local, projectileHomePos) <= this.getProjectileStartRadius();
    }

    private getProjectileStartRadius() {
        const projectileTransform = this.projectileNode?.getComponent(UITransform);
        if (!projectileTransform || !this.projectileNode) {
            return 90;
        }

        const projectileScale = this.getNodeScaleAbs(this.projectileNode);
        const halfDiagonal = Math.sqrt(
            Math.pow(projectileTransform.width * projectileScale.x / 2, 2)
            + Math.pow(projectileTransform.height * projectileScale.y / 2, 2),
        );
        return Math.max(90, halfDiagonal + 30);
    }

    private onTouchMove(event: EventTouch) {
        if (!this.aimStartValid || this.state !== PlayState.Aiming) {
            return;
        }
        const point = this.clampBattlePoint(this.uiToBattleLocal(event.getUILocation()));
        const last = this.aimPoints[this.aimPoints.length - 1];
        if (last && Vec3.distance(last, point) < 12) {
            return;
        }
        this.aimPoints.push(point);
        this.drawAimPath();
    }

    private onTouchEnd() {
        this.finishAimInput();
    }

    private onTouchCancel() {
        this.finishAimInput();
    }

    private finishAimInput() {
        if (!this.aimStartValid || this.state !== PlayState.Aiming) {
            this.resetAim();
            this.dismissTutorialGuide(false);
            return;
        }
        if (this.aimPoints.length < 2) {
            this.showTip('请从左下角主角处起笔。');
            this.resetAim();
            this.dismissTutorialGuide(false);
            return;
        }
        this.dismissTutorialGuide(false);
        this.launchProjectile();
    }

    private canStartAiming() {
        return this.state === PlayState.Ready && !this.projectileFlying && gameConfig.gamePause !== 1;
    }

    private getCurrentProjectileSpeed() {
        return Math.max(1, this.currentProjectileSpeed);
    }

    private launchProjectile() {
        if (!this.stageConfig) {
            return;
        }
        const throwCost = Math.max(10, this.throwCost);
        const isFirstThrow = this.throwCount === 0;
        this.throwCount += 1;
        if (!isFirstThrow) {
            this.extraThrows += 1;
            this.energy = Math.max(0, this.energy - throwCost);
        }
        this.refreshHud();
        if (this.energy <= 0) {
            this.failGame('energy-empty');
            return;
        }
        this.state = PlayState.Flying;
        this.projectileFlying = true;
        this.projectileHitJudgementEnabled = true;
        this.pendingWinAfterFlight = false;
        this.hitEnemyIds.clear();
        this.projectilePathPoints = this.simplifyProjectilePath(this.aimPoints);
        this.projectilePathIndex = 0;
        this.projectileTravelPosition = this.projectilePathPoints[0].clone();
        this.currentProjectileSpeed = this.calculateProjectileSpeed(this.projectilePathPoints);
        this.setupProjectileWeaponSprite();
        this.setProjectileVisible(true);
        this.setHeroIdleWeaponMode('noweapon');
        this.setProjectileGhostState(false);
        this.projectileNode?.setPosition(this.projectileTravelPosition);
        this.rotateProjectileToNextPathPoint();
        this.drawAimPath(true);
        this.aimStartValid = false;
    }

    private updateProjectile(deltaTime: number) {
        if (!this.projectileFlying || this.projectilePathPoints.length < 2) {
            this.finishProjectileFlight();
            return;
        }
        let distanceToMove = this.getCurrentProjectileSpeed() * deltaTime;
        while (distanceToMove > 0 && this.projectilePathIndex < this.projectilePathPoints.length - 1) {
            const from = this.projectileTravelPosition;
            const to = this.projectilePathPoints[this.projectilePathIndex + 1];
            const segment = to.clone().subtract(from);
            const length = segment.length();
            if (length <= 0.001) {
                this.projectilePathIndex += 1;
                continue;
            }
            if (distanceToMove >= length) {
                this.projectileTravelPosition = to.clone();
                this.projectilePathIndex += 1;
                distanceToMove -= length;
            } else {
                segment.normalize();
                this.projectileTravelPosition = from.clone().add(segment.multiplyScalar(distanceToMove));
                distanceToMove = 0;
            }
        }
        this.projectileNode?.setPosition(this.projectileTravelPosition);
        this.rotateProjectileToPathDirection(deltaTime);
        this.checkProjectileCollisions();
        if (!this.projectileFlying) {
            return;
        }
        if (this.projectilePathIndex >= this.projectilePathPoints.length - 1) {
            this.finishProjectileFlight();
        }
    }

    private checkProjectileCollisions() {
        if (!this.projectileHitJudgementEnabled) {
            return;
        }

        for (const enemy of this.enemies) {
            if (!enemy.isAlive || this.hitEnemyIds.has(enemy.config.id)) {
                continue;
            }
            if (this.isProjectileInsideEnemyBounds(enemy.node, this.projectileTravelPosition)) {
                this.hitEnemyIds.add(enemy.config.id);
                this.resolveProjectileHit(enemy);
                if (!this.projectileFlying || this.state === PlayState.Fail || this.state === PlayState.Win) {
                    return;
                }
            }
        }
    }

    private resolveProjectileHit(enemy: WordEnemy) {
        if (!this.stageConfig || !enemy.isAlive) {
            return;
        }

        const nextExpectedIndex = this.collectedTargetChars.length;
        const expectedChar = this.stageConfig.correctChars[nextExpectedIndex];
        const isCorrectTarget = enemy.isTarget && !!expectedChar && enemy.config.char === expectedChar;

        if (isCorrectTarget) {
            const sourceWorldPos = enemy.node.getWorldPosition(new Vec3());
            const sourceLabel = enemy.node.getChildByName('CharLabel')?.getComponent(Label) || enemy.node.getComponentInChildren(Label);

            enemy.isAlive = false;
            enemy.node.active = false;
            enemy.hpBar.progress = 0;
            this.collectedTargetChars.push(enemy.config.char);
            this.completedTargetChars.add(enemy.config.char);
            this.playCollectedCharFlight(enemy.config.char, sourceWorldPos, nextExpectedIndex, sourceLabel);
            this.showTip(`收录“${enemy.config.char}”。`);

            if (this.collectedTargetChars.length >= this.stageConfig.correctChars.length) {
                this.pendingWinAfterFlight = true;
            }
            return;
        }

        const wrongCost = this.stageConfig.wrongCost || 20;
        this.wrongHits += 1;
        this.energy = Math.max(0, this.energy - wrongCost);
        this.refreshHud();

        if (expectedChar) {
            this.showTip(`需先收录“${expectedChar}”，误击“${enemy.config.char}”，灵力-${wrongCost}。`);
        } else {
            this.showTip(`误击“${enemy.config.char}”，灵力-${wrongCost}。`);
        }

        if (this.energy <= 0) {
            this.failGame('wrong-hit');
        }
    }

    private isProjectileInsideEnemyBounds(enemyNode: Node, point: Vec3) {
        const transform = enemyNode.getComponent(UITransform);
        const nodeScale = this.getNodeScaleAbs(enemyNode);
        const width = (transform?.width || 180) * nodeScale.x;
        const height = (transform?.height || 140) * nodeScale.y;
        const enemyPos = enemyNode.position;
        const deltaX = Math.abs(point.x - enemyPos.x);
        const deltaY = Math.abs(point.y - enemyPos.y);
        return deltaX <= width / 2 && deltaY <= height / 2;
    }

    private getNodeScaleAbs(node: Node | null) {
        if (!node) {
            return { x: 1, y: 1 };
        }

        const scale = node.scale;
        return {
            x: Math.max(0.01, Math.abs(scale.x)),
            y: Math.max(0.01, Math.abs(scale.y)),
        };
    }

    private finishProjectileFlight() {
        this.projectileFlying = false;
        this.projectileHitJudgementEnabled = false;
        this.resetProjectile();
        this.resetAim();
        if (this.tryCompletePendingWin()) {
            this.winGame();
            return;
        }
        if (this.state === PlayState.Flying && !this.pendingWinAfterFlight) {
            this.state = PlayState.Ready;
        }
    }

    private resetProjectile() {
        this.projectileNode?.setPosition(this.initialProjectilePos);
        this.resetProjectileRotation();
        this.setProjectileGhostState(false);
        this.setProjectileVisible(false);
        this.setHeroIdleWeaponMode('weapon');
        this.projectilePathPoints = [];
        this.projectilePathIndex = 0;
        this.projectileTravelPosition = this.initialProjectilePos.clone();
    }

    private calculateProjectileSpeed(pathPoints: Vec3[]) {
        const scaledSpeed = Math.max(1, this.projectileSpeed * this.projectileSpeedScale);
        const pathLength = this.calculatePathLength(pathPoints);
        if (pathLength <= 0 || this.minProjectileFlightSeconds <= 0) {
            return scaledSpeed;
        }

        const maxSpeedForMinDuration = pathLength / this.minProjectileFlightSeconds;
        return Math.min(scaledSpeed, Math.max(1, maxSpeedForMinDuration));
    }

    private calculatePathLength(pathPoints: Vec3[]) {
        let totalLength = 0;
        for (let i = 1; i < pathPoints.length; i++) {
            totalLength += Vec3.distance(pathPoints[i - 1], pathPoints[i]);
        }
        return totalLength;
    }

    private resetAim() {
        this.clearAimPath();
        this.projectileNode?.setPosition(this.initialProjectilePos);
        this.resetProjectileRotation();
        this.setProjectileGhostState(false);
        this.setProjectileVisible(false);
        this.setHeroIdleWeaponMode('weapon');
        if (this.state === PlayState.Aiming) {
            this.state = PlayState.Ready;
        }
    }

    private clearAimPath() {
        this.aimStartValid = false;
        this.aimPoints = [];
        this.drawingGraphics?.clear();
    }

    private setProjectileGhostState(isGhost: boolean) {
        if (!this.projectileNode) {
            return;
        }
        this.projectileOpacity = this.projectileOpacity || this.projectileNode.getComponent(UIOpacity) || this.projectileNode.addComponent(UIOpacity);
        if (this.projectileOpacity) {
            this.projectileOpacity.opacity = isGhost ? 128 : 255;
        }
    }

    private setProjectileVisible(visible: boolean) {
        if (this.projectileNode && this.projectileNode.isValid) {
            this.projectileNode.active = true;
        }

        if (this.projectileSprite && this.projectileSprite.isValid) {
            this.projectileSprite.enabled = visible;
        }
    }

    private drawAimPath(committed = false) {
        if (!this.drawingGraphics) {
            return;
        }
        this.drawingGraphics.clear();
        if (this.aimPoints.length < 2) {
            return;
        }
        const baseColor = committed
            ? { r: 18, g: 176, b: 74 }
            : { r: 53, g: 127, b: 226 };
        const highlightColor = committed
            ? new Color(188, 255, 205, 230)
            : new Color(215, 238, 255, 190);
        const coreColor = new Color(baseColor.r, baseColor.g, baseColor.b, 255);
        const coreWidth = committed ? this.aimLineWidth + 2 : this.aimLineWidth;
        const featherWidth = committed ? this.aimFeatherWidth + 8 : this.aimFeatherWidth;
        const featherPasses = [
            { width: featherWidth, alpha: committed ? 30 : 20 },
            { width: featherWidth * 0.72, alpha: committed ? 48 : 34 },
            { width: featherWidth * 0.48, alpha: committed ? 78 : 56 },
            { width: coreWidth + 8, alpha: committed ? 125 : 92 },
        ];

        for (const pass of featherPasses) {
            this.strokeAimPath(pass.width, new Color(baseColor.r, baseColor.g, baseColor.b, pass.alpha));
        }
        this.strokeAimPath(coreWidth, coreColor);
        this.strokeAimPath(Math.max(2, coreWidth * 0.34), highlightColor);
    }

    private strokeAimPath(lineWidth: number, strokeColor: Color) {
        if (!this.drawingGraphics) {
            return;
        }

        this.applyAimLineStyle(lineWidth, strokeColor);
        this.drawingGraphics.moveTo(this.aimPoints[0].x, this.aimPoints[0].y);

        if (this.aimPoints.length === 2) {
            const point = this.aimPoints[1];
            this.drawingGraphics.lineTo(point.x, point.y);
        } else {
            for (let i = 1; i < this.aimPoints.length - 1; i++) {
                const current = this.aimPoints[i];
                const next = this.aimPoints[i + 1];
                const midX = (current.x + next.x) / 2;
                const midY = (current.y + next.y) / 2;
                this.drawingGraphics.quadraticCurveTo(current.x, current.y, midX, midY);
            }

            const last = this.aimPoints[this.aimPoints.length - 1];
            this.drawingGraphics.lineTo(last.x, last.y);
        }

        this.drawingGraphics.stroke();
    }

    private applyAimLineStyle(lineWidth: number, strokeColor: Color) {
        if (!this.drawingGraphics) {
            return;
        }

        this.drawingGraphics.lineWidth = lineWidth;
        this.drawingGraphics.strokeColor = strokeColor;
        this.drawingGraphics.lineCap = Graphics.LineCap.ROUND;
        this.drawingGraphics.lineJoin = Graphics.LineJoin.ROUND;
    }

    private rotateProjectileToNextPathPoint() {
        if (!this.projectileNode || this.projectilePathPoints.length < 2) {
            return;
        }

        this.projectileTargetAngle = this.getProjectilePathAngle();
        this.projectileNode.angle = this.projectileTargetAngle;
    }

    private rotateProjectileToPathDirection(deltaTime: number) {
        if (!this.projectileNode || this.projectilePathPoints.length < 2) {
            return;
        }

        this.projectileTargetAngle = this.getProjectilePathAngle();
        const currentAngle = this.projectileNode.angle;
        const deltaAngle = this.getShortestAngleDelta(currentAngle, this.projectileTargetAngle);
        const maxStep = this.projectileMaxRotationDegreesPerSecond * Math.max(0, deltaTime);
        const appliedDelta = Math.max(-maxStep, Math.min(maxStep, deltaAngle));
        this.projectileNode.angle = currentAngle + appliedDelta;
    }

    private rotateProjectileToDirection(direction: Vec3) {
        if (!this.projectileNode || direction.length() <= 0.001) {
            return;
        }

        const angle = Math.atan2(direction.y, direction.x) * 180 / Math.PI;
        this.projectileNode.angle = angle + this.getProjectileForwardAngleOffset();
    }

    private getProjectilePathAngle() {
        const lookAheadPoint = this.getPointAheadOnProjectilePath(this.projectileRotationLookAheadDistance);
        const direction = lookAheadPoint.clone().subtract(this.projectileTravelPosition);
        if (direction.length() <= 0.001) {
            return this.projectileNode?.angle || 0;
        }

        return Math.atan2(direction.y, direction.x) * 180 / Math.PI + this.getProjectileForwardAngleOffset();
    }

    private getProjectileForwardAngleOffset() {
        const roleType = Math.max(1, Math.min(5, Number(gameConfig.slectType) || 1));
        return roleType === 3 ? 0 : this.projectileForwardAngleOffset;
    }

    private getPointAheadOnProjectilePath(distance: number) {
        let remainingDistance = Math.max(0, distance);
        let from = this.projectileTravelPosition.clone();

        for (let i = this.projectilePathIndex + 1; i < this.projectilePathPoints.length; i++) {
            const to = this.projectilePathPoints[i];
            const segmentLength = Vec3.distance(from, to);
            if (segmentLength <= 0.001) {
                from = to.clone();
                continue;
            }

            if (remainingDistance <= segmentLength) {
                const t = remainingDistance / segmentLength;
                return new Vec3(
                    from.x + (to.x - from.x) * t,
                    from.y + (to.y - from.y) * t,
                    0,
                );
            }

            remainingDistance -= segmentLength;
            from = to.clone();
        }

        return this.projectilePathPoints[this.projectilePathPoints.length - 1].clone();
    }

    private getShortestAngleDelta(fromAngle: number, toAngle: number) {
        let delta = (toAngle - fromAngle) % 360;
        if (delta > 180) {
            delta -= 360;
        } else if (delta < -180) {
            delta += 360;
        }
        return delta;
    }

    private resetProjectileRotation() {
        if (this.projectileNode) {
            this.projectileNode.angle = 0;
        }
    }

    private refreshPoemDisplay() {
        if (!this.stageConfig) {
            return;
        }
        this.setupPoemDisplay(this.poemLabel?.node.parent || this.hudRootRef || this.node);
        if (!this.poemDisplayRoot) {
            return;
        }
        const poemChars = Array.from(this.stageConfig.poem);
        const targetSlotIndices = this.getPoemTargetSlotIndices();
        const tokens: { text: string; width: number; targetOrder: number }[] = [];
        let targetOrder = 0;

        poemChars.forEach((char, index) => {
            if (targetOrder < targetSlotIndices.length && targetSlotIndices[targetOrder] === index) {
                const shownChar = this.displayedTargetChars[targetOrder];
                tokens.push({
                    text: shownChar || '__',
                    width: this.poemTokenPrefab ? 60 : 56,
                    targetOrder,
                });
                targetOrder += 1;
                return;
            }
            tokens.push({
                text: char,
                width: this.poemTokenPrefab ? 42 : 38,
                targetOrder: -1,
            });
        });

        const spacing = this.poemTokenPrefab ? 10 : 6;
        const totalWidth = tokens.reduce((sum, token) => sum + token.width, 0) + Math.max(0, tokens.length - 1) * spacing;
        let cursor = -totalWidth / 2;
        this.poemDisplayRoot.removeAllChildren();
        this.poemTargetSlotNodes = [];
        this.poemTargetSlotLabels = [];

        tokens.forEach((token, index) => {
            const labelNode = this.createPoemTokenNode(index, token.text, token.width, token.targetOrder);
            labelNode.parent = this.poemDisplayRoot;
            labelNode.setPosition(cursor + token.width / 2, 0, 0);

            const label = labelNode.getComponent(Label) || labelNode.getComponentInChildren(Label);

            if (token.targetOrder >= 0) {
                this.poemTargetSlotNodes[token.targetOrder] = labelNode;
                this.poemTargetSlotLabels[token.targetOrder] = label;
            }
            cursor += token.width + spacing;
        });
    }

    private createPoemTokenNode(index: number, text: string, width: number, targetOrder: number) {
        const usePrefabStyle = !!this.poemTokenPrefab;
        const tokenNode = usePrefabStyle ? instantiate(this.poemTokenPrefab) : new Node(`PoemToken_${index}`);
        tokenNode.name = `PoemToken_${index}`;
        tokenNode.layer = this.node.layer;

        const transform = tokenNode.getComponent(UITransform) || tokenNode.addComponent(UITransform);
        transform.setContentSize(width, 48);

        const label = tokenNode.getComponent(Label) || tokenNode.getComponentInChildren(Label) || tokenNode.addComponent(Label);
        label.string = text;
        if (!usePrefabStyle) {
            label.fontSize = label.fontSize > 0 ? label.fontSize : 32;
            label.lineHeight = label.lineHeight > 0 ? label.lineHeight : label.fontSize + 8;
            label.color = targetOrder >= 0 && this.displayedTargetChars[targetOrder]
                ? new Color(214, 94, 52, 255)
                : new Color(34, 42, 53, 255);
        }
        label.horizontalAlign = Label.HorizontalAlign.CENTER;
        label.verticalAlign = Label.VerticalAlign.CENTER;

        return tokenNode;
    }

    private getPoemTargetSlotIndices() {
        if (!this.stageConfig) {
            return [];
        }
        const poemChars = Array.from(this.stageConfig.poem);
        const targetChars = this.stageConfig.correctChars;
        const slotIndices: number[] = [];
        let matchOrder = 0;

        for (let i = 0; i < poemChars.length && matchOrder < targetChars.length; i++) {
            if (poemChars[i] === targetChars[matchOrder]) {
                slotIndices.push(i);
                matchOrder += 1;
            }
        }

        return slotIndices;
    }

    private getPoemTargetLocalPosition(targetOrder: number) {
        const targetNode = this.poemTargetSlotNodes[targetOrder];
        if (!targetNode) {
            return null;
        }
        return targetNode.position.clone();
    }

    private playCollectedCharFlight(char: string, sourceWorldPos: Vec3, targetOrder: number, sourceLabel: Label | null = null) {
        const rootTransform = this.node.getComponent(UITransform);
        const poemTransform = this.poemDisplayRoot?.getComponent(UITransform);
        const targetLocalInPoem = this.getPoemTargetLocalPosition(targetOrder);
        if (!rootTransform || !poemTransform || !targetLocalInPoem) {
            this.displayedTargetChars[targetOrder] = char;
            this.refreshPoemDisplay();
            return;
        }

        const sourceLocal = rootTransform.convertToNodeSpaceAR(sourceWorldPos.clone());
        const targetWorld = poemTransform.convertToWorldSpaceAR(targetLocalInPoem.clone());
        const targetLocal = rootTransform.convertToNodeSpaceAR(targetWorld);

        const flyNode = new Node(`CollectChar_${char}`);
        flyNode.layer = this.node.layer;
        flyNode.parent = this.node;
        flyNode.setPosition(sourceLocal);
        flyNode.setScale(new Vec3(1.1, 1.1, 1));
        flyNode.addComponent(UITransform).setContentSize(72, 72);

        const flyLabel = flyNode.addComponent(Label);
        flyLabel.string = char;
        if (sourceLabel) {
            flyLabel.font = sourceLabel.font;
            flyLabel.fontSize = sourceLabel.fontSize;
            flyLabel.lineHeight = sourceLabel.lineHeight;
            flyLabel.color = sourceLabel.color.clone();
            flyLabel.isBold = sourceLabel.isBold;
            flyLabel.isItalic = sourceLabel.isItalic;
            flyLabel.isUnderline = sourceLabel.isUnderline;
            flyLabel.useSystemFont = sourceLabel.useSystemFont;
            flyLabel.fontFamily = sourceLabel.fontFamily;
            flyLabel.cacheMode = sourceLabel.cacheMode;
            flyLabel.overflow = sourceLabel.overflow;
            flyLabel.enableWrapText = sourceLabel.enableWrapText;
            flyLabel.spacingX = sourceLabel.spacingX;

            const sourceOutline = sourceLabel.getComponent(LabelOutline);
            if (sourceOutline) {
                const outline = flyNode.addComponent(LabelOutline);
                outline.color = sourceOutline.color.clone();
                outline.width = sourceOutline.width;
            }

            const sourceShadow = sourceLabel.getComponent(LabelShadow);
            if (sourceShadow) {
                const shadow = flyNode.addComponent(LabelShadow);
                shadow.color = sourceShadow.color.clone();
                shadow.offset = sourceShadow.offset.clone();
                shadow.blur = sourceShadow.blur;
            }
        } else {
            flyLabel.fontSize = 42;
            flyLabel.lineHeight = 50;
            flyLabel.color = new Color(214, 94, 52, 255);
        }
        flyLabel.horizontalAlign = Label.HorizontalAlign.CENTER;
        flyLabel.verticalAlign = Label.VerticalAlign.CENTER;

        const flyOpacity = flyNode.addComponent(UIOpacity);
        flyOpacity.opacity = 255;

        this.activeCollectAnimations += 1;

        tween(flyNode)
            .to(0.42, {
                position: targetLocal,
                scale: new Vec3(0.92, 0.92, 1),
            }, {
                easing: 'quadInOut',
            })
            .call(() => {
                this.displayedTargetChars[targetOrder] = char;
                this.refreshPoemDisplay();
                if (flyNode.isValid) {
                    flyNode.destroy();
                }
                this.activeCollectAnimations = Math.max(0, this.activeCollectAnimations - 1);
                if (this.tryCompletePendingWin()) {
                    this.winGame();
                }
            })
            .start();
    }

    private tryCompletePendingWin() {
        if (!this.pendingWinAfterFlight || this.projectileFlying || this.activeCollectAnimations > 0) {
            return false;
        }
        this.pendingWinAfterFlight = false;
        return true;
    }

    private async syncRunScore(finalScore: number) {
        const score = Math.max(0, Math.floor(finalScore));
        const currentBestScore = Math.max(0, Number(gameConfig.maxJuli || load(localData.maxJuli) || 0));
        const saveBestScore = (candidateScore: number) => {
            const bestScore = Math.max(currentBestScore, Math.max(0, Math.floor(candidateScore)));
            gameConfig.maxJuli = bestScore;
            save(localData.maxJuli, gameConfig.maxJuli);
        };
        const username = sys.localStorage.getItem('SLS_USERNAME');
        if (!username) {
            saveBestScore(score);
            return score;
        }

        try {
            const result = await this.postRunScore(gameConfig.APP_ID, username, score);
            const serverScore = Number(result?.data?.rank ?? result?.data?.totalLoginNum);
            const resolvedScore = Number.isFinite(serverScore) ? serverScore : score;
            console.log('[Game3] 评分上报成功:', {
                username,
                score,
                resolvedScore,
                code: result?.code,
            });
            saveBestScore(resolvedScore);
            return resolvedScore;
        } catch (error) {
            console.error('[Game3] 上报评分失败:', {
                username,
                score,
                error,
            });
            saveBestScore(score);
            return score;
        }
    }

    private async postRunScore(appid: string, username: string, score: number): Promise<any> {
        const url = 'https://pay.szvi-bo.com/v1/testapp/PassLevel';
        return new Promise((resolve, reject) => {
            const xhr = new XMLHttpRequest();
            xhr.open('POST', url, true);
            xhr.setRequestHeader('Content-Type', 'application/json');

            xhr.onload = () => {
                if (xhr.status >= 200 && xhr.status < 300) {
                    try {
                        resolve(JSON.parse(xhr.responseText));
                    } catch (e) {
                        reject(new Error(`JSON parse error: ${e instanceof Error ? e.message : e}`));
                    }
                } else {
                    reject(new Error(`HTTP error: ${xhr.status}`));
                }
            };

            xhr.onerror = () => reject(new Error('Network request failed'));
            xhr.ontimeout = () => reject(new Error('Network request timeout'));
            xhr.send(JSON.stringify({ appid, username, rank: score, star: 3 }));
        });
    }

    private cacheEditorNodePositions() {
        if (this.heroNode) {
            this.initialHeroPos = this.heroNode.position.clone();
        }
        if (this.projectileNode) {
            this.initialProjectilePos = this.projectileNode.position.clone();
        }
    }

    private setupPoemDisplay(parent: Node | null) {
        if (!parent) {
            return;
        }

        const basePosition = this.poemLabel?.node.position.clone() || new Vec3(120, -4, 0);
        if (!this.poemDisplayRoot || !this.poemDisplayRoot.isValid) {
            this.poemDisplayRoot = new Node('PoemDisplay');
            this.poemDisplayRoot.layer = this.node.layer;
            this.poemDisplayRoot.addComponent(UITransform).setContentSize(460, 48);
        }

        this.poemDisplayRoot.parent = parent;
        this.poemDisplayRoot.setPosition(basePosition);
        this.poemLabel && (this.poemLabel.node.active = false);
    }

    private refreshHud() {
        if (!this.stageConfig) {
            return;
        }
        if (this.energyValueLabel) {
            this.energyValueLabel.string = String(this.energy);
            if (this.energyValueLabel.node) {
                this.energyValueLabel.node.active = true;
            }
        }
        if (this.energyBar) {
            const maxEnergy = Math.max(1, this.stageConfig.energy || 100);
            this.energyBar.progress = Math.max(0, Math.min(1, this.energy / maxEnergy));
            if (this.energyLabel) {
                this.energyLabel.string = String(this.energy);
                if (this.energyLabel.node) {
                    this.energyLabel.node.active = !this.energyValueLabel;
                }
            }
        } else {
            this.energyLabel && (this.energyLabel.string = `灵力:${this.energy}`);
            if (this.energyLabel?.node) {
                this.energyLabel.node.active = true;
            }
        }
        this.stageLabel && (this.stageLabel.string = this.getDifficultyWaveText());
        this.scoreLabel && (this.scoreLabel.string = `评分:${this.score}`);
        if (this.scoreLabel) {
            this.scoreLabel.string = this.scoreLabel.string.replace(/\d+$/, String(this.calculateLiveSessionScore()));
        }
        this.refreshWeatherText();
    }

    private refreshWeatherText() {
        this.weatherLabel && (this.weatherLabel.string = '');
        this.weatherTimerLabel && (this.weatherTimerLabel.string = '');
    }

    private pauseGame() {
        if (this.state === PlayState.Win || this.state === PlayState.Fail) {
            return;
        }
        this.stateBeforePause = this.state;
        gameConfig.gamePause = 1;
        director.emit(emits.gamePause);
        this.state = PlayState.Pause;

        if (this.settingsPrefab) {
            const parent = gameConfig.gameRoot || this.node.parent || this.node;
            nodePool.ins.setPrefab('settings', this.settingsPrefab);
            nodePool.ins.getPoolNode('settings', parent);
            director.emit(emits.backIsShow, 1);
            return;
        }

        this.pauseOverlay && (this.pauseOverlay.active = true);
    }

    private resumeGame() {
        this.resumeFromPauseState(true);
    }

    private onPauseQuitClick() {
        this.failGame('quit');
    }

    private onPauseStateSynced() {
        if (gameConfig.gamePause === 0 && this.state === PlayState.Pause) {
            this.resumeFromPauseState(false);
            return;
        }

        if (gameConfig.gamePause === 1 && this.state === PlayState.Ready) {
            this.state = PlayState.Pause;
        }
    }

    private resumeFromPauseState(emitLegacy: boolean) {
        gameConfig.gamePause = 0;
        if (emitLegacy) {
            director.emit(emits.gamePause);
        }
        this.pauseOverlay && (this.pauseOverlay.active = false);
        if (this.state === PlayState.Pause) {
            this.state = this.stateBeforePause === PlayState.Pause ? PlayState.Ready : this.stateBeforePause;
        }
    }

    private winGame() {
        if (this.state === PlayState.Win) {
            return;
        }
        this.state = PlayState.Win;
        this.projectileFlying = false;
        this.projectileHitJudgementEnabled = false;
        this.resetProjectile();
        this.recordStageClear();
        this.unlockNextLevelIfNeeded();
        this.loadNextStage();
    }

    private failGame(reason: string) {
        if (this.state === PlayState.Fail || this.state === PlayState.Win) {
            return;
        }
        this.state = PlayState.Fail;
        this.projectileFlying = false;
        this.projectileHitJudgementEnabled = false;
        this.pendingWinAfterFlight = false;
        this.resetProjectile();
        this.clearAimPath();
        if (reason !== 'quit') {
            gameConfig.gamePause = 1;
            director.emit(emits.gamePause);
        }
        this.showSessionResultClean(false, reason);
    }

    private recordStageClear() {
        if (!this.stageConfig) {
            return;
        }

        this.score = this.calculateStageScore();
        gameConfig.jinbiNum += this.clearStageCoinReward;
        save(localData.jinbiNum, gameConfig.jinbiNum);
        this.clearedLevelCount += 1;
        this.totalSessionScore += this.score;
        this.totalWrongHits += this.wrongHits;
        this.totalExtraThrows += this.extraThrows;
        this.stageScoreRecords.push({
            level: this.stageConfig.level,
            score: this.score,
        });
    }

    private loadNextStage() {
        const nextLevel = this.currentLevel + 1;
        const nextConfig = this.getStageConfig(nextLevel);

        if (nextLevel > this.currentDifficultyMode.endLevel || !nextConfig || nextConfig.level !== nextLevel) {
            this.state = PlayState.Win;
            this.projectileFlying = false;
            this.projectileHitJudgementEnabled = false;
            this.pendingWinAfterFlight = false;
            this.unlockNextDifficultyIfNeeded();
            gameConfig.gamePause = 1;
            director.emit(emits.gamePause);
            this.showSessionResultClean(true, 'all-cleared');
            return;
        }

        this.currentLevel = nextLevel;
        this.loadStage(this.currentLevel);
        this.showTip(`已通过${this.currentDifficultyMode.displayName}模式第${getGame3WaveNumber(nextLevel - 1, this.currentDifficultyMode)}波。`);
    }

    private unlockNextLevelIfNeeded() {
        if (this.currentLevel < Number(gameConfig.nowLevel || 1)) {
            return;
        }
        gameConfig.nowLevel = this.currentLevel + 1;
        save('nowLevel', gameConfig.nowLevel.toString());
    }

    private unlockNextDifficultyIfNeeded() {
        const nextUnlockLevel = this.currentDifficultyMode.nextUnlockLevel;
        if (!nextUnlockLevel || Number(gameConfig.game3UnlockedDifficulty || 1) >= nextUnlockLevel) {
            return;
        }

        gameConfig.game3UnlockedDifficulty = nextUnlockLevel;
        save(GAME3_DIFFICULTY_STORAGE_KEY, nextUnlockLevel);
    }

    private getDifficultyWaveText() {
        const wave = getGame3WaveNumber(this.currentLevel, this.currentDifficultyMode);
        return `${this.currentDifficultyMode.displayName}:${wave}/${this.currentDifficultyMode.totalWaves}`;
    }

    private showResult(isWin: boolean, reason = '') {
        if (!this.resultOverlay || !this.stageConfig) {
            return;
        }
        this.resultOverlay.removeAllChildren();
        this.resultOverlay.active = true;
        const bg = this.resultOverlay.getComponent(Graphics) || this.resultOverlay.addComponent(Graphics);
        bg.clear();
        bg.fillColor = new Color(18, 19, 24, 185);
        bg.rect(-360, -640, 720, 1280);
        bg.fill();

        const panel = new Node('Panel');
        panel.layer = this.node.layer;
        panel.parent = this.resultOverlay;
        panel.addComponent(UITransform).setContentSize(500, 460);
        const panelGraphics = panel.addComponent(Graphics);
        panelGraphics.fillColor = new Color(253, 247, 234, 255);
        panelGraphics.strokeColor = new Color(144, 110, 62, 255);
        panelGraphics.lineWidth = 5;
        panelGraphics.roundRect(-250, -230, 500, 460, 24);
        panelGraphics.fill();
        panelGraphics.stroke();

        this.createLabel(panel, isWin ? '通关结算' : '本局失败', new Vec3(0, 168, 0), 40, new Color(45, 40, 36, 255), 260);
        const coins = Math.floor(this.score / 100);
        if (isWin) {
            gameConfig.jinbiNum += coins;
            save(localData.jinbiNum, gameConfig.jinbiNum);
        }

        const lines = [
            `关卡: ${this.stageConfig.level}`,
            `正确填词: ${this.completedTargetChars.size}/${this.stageConfig.correctChars.length}`,
            `错杀惩罚: ${this.wrongHits} 次`,
            `额外起笔: ${this.extraThrows} 次`,
            `总评分: ${this.score}`,
            isWin ? `获得铜币: ${coins}` : `失败原因: ${this.getFailReasonText(reason)}`,
        ];

        lines.forEach((line, index) => {
            this.createLabel(panel, line, new Vec3(0, 82 - index * 52, 0), 28, new Color(60, 52, 43, 255), 380);
        });

        const nextButton = this.createTextButton(panel, 'NextButton', isWin ? '下一关' : '再来一局', new Vec3(-110, -166, 0), new Color(81, 136, 90, 255));
        const homeButton = this.createTextButton(panel, 'HomeButton', '返回大厅', new Vec3(110, -166, 0), new Color(151, 94, 54, 255));
        nextButton.on(Node.EventType.TOUCH_END, () => {
            this.hideResult();
            if (isWin) {
                this.currentLevel += 1;
            }
            this.loadStage(this.currentLevel);
        }, this);
        homeButton.on(Node.EventType.TOUCH_END, () => {
            director.loadScene('home2');
        }, this);
    }

    private hideResult() {
        if (!this.resultOverlay) {
            return;
        }
        this.resultOverlay.active = false;
        this.resultOverlay.getComponent(Graphics)?.clear();
        this.resultOverlay.removeAllChildren();
    }

    private calculateStageScore() {
        return 100 - this.wrongHits * 10 - this.extraThrows * 10;
    }

    private calculateLiveSessionScore() {
        return this.totalSessionScore - (this.wrongHits * 10 + this.extraThrows * 10);
    }

    private async showSessionResultClean(isWin: boolean, reason = '') {
        if (!this.resultOverlay) {
            return;
        }

        this.resultOverlay.removeAllChildren();
        this.resultOverlay.active = true;

        const bg = this.resultOverlay.getComponent(Graphics) || this.resultOverlay.addComponent(Graphics);
        bg.clear();
        bg.fillColor = new Color(18, 19, 24, 185);
        bg.rect(-360, -640, 720, 1280);
        bg.fill();

        const panel = new Node('SessionPanelClean');
        panel.layer = this.node.layer;
        panel.parent = this.resultOverlay;
        panel.addComponent(UITransform).setContentSize(580, 600);

        const panelGraphics = panel.addComponent(Graphics);
        panelGraphics.fillColor = new Color(253, 247, 234, 255);
        panelGraphics.strokeColor = new Color(144, 110, 62, 255);
        panelGraphics.lineWidth = 5;
        panelGraphics.roundRect(-290, -300, 580, 600, 24);
        panelGraphics.fill();
        panelGraphics.stroke();

        this.createLabel(panel, isWin ? `${this.currentDifficultyMode.displayName}模式通关` : '本局结算', new Vec3(0, 228, 0), 40, new Color(45, 40, 36, 255), 320);

        const finalScore = Math.max(0, this.calculateLiveSessionScore());
        const resolvedScore = await this.syncRunScore(finalScore);
        const coins = Math.floor(resolvedScore / 100);
        gameConfig.jinbiNum += coins;
        save(localData.jinbiNum, gameConfig.jinbiNum);

        if (this.resultPanelPrefab) {
            panel.destroy();

            const prefabPanel = instantiate(this.resultPanelPrefab);
            prefabPanel.layer = this.node.layer;
            prefabPanel.parent = this.resultOverlay;

            const resultLabel = prefabPanel.getChildByName('PanelBg')?.getChildByName('Label')?.getComponent(Label);
            const titleLabel = prefabPanel.getChildByName('TitleLabel')?.getComponent(Label);
            const clearedLabel = prefabPanel.getChildByName('ClearedLabel')?.getComponent(Label);
            const scoreLabel = prefabPanel.getChildByName('ScoreLabel')?.getComponent(Label);
            const coinsLabel = prefabPanel.getChildByName('CoinsLabel')?.getComponent(Label);
            const retryButton = prefabPanel.getChildByName('RetryButton');
            const homeButton = prefabPanel.getChildByName('HomeButton');

            if (resultLabel) {
                resultLabel.string = isWin ? '游戏成功' : '游戏失败';
            }
            if (titleLabel) {
                titleLabel.string = isWin ? `${this.currentDifficultyMode.displayName}模式通关` : '本局结算';
            }
            if (clearedLabel) {
                clearedLabel.string = `通关关卡: ${this.clearedLevelCount}`;
            }
            if (scoreLabel) {
                scoreLabel.string = `总评分: ${resolvedScore}`;
            }
            if (coinsLabel) {
                coinsLabel.string = `获得铜币: ${coins}`;
            }

            retryButton?.on(Node.EventType.TOUCH_END, () => {
                if (!mGameData.ConsumeStamina(1)) {
                    this.showTip('体力不足，请稍后再试。');
                    return;
                }

                this.hideResult();
                this.restartSession();
            }, this);

            homeButton?.on(Node.EventType.TOUCH_END, () => {
                director.loadScene('home2');
            }, this);
            return;
        }

        const lines = [
            `通关关卡: ${this.clearedLevelCount}`,
            `总评分: ${resolvedScore}`,
            `获得铜币: ${coins}`,
        ];

        lines.forEach((line, index) => {
            this.createLabel(panel, line, new Vec3(0, 96 - index * 72, 0), 30, new Color(60, 52, 43, 255), 440);
        });

        const retryButton = this.createTextButton(panel, 'RetryButtonClean', '再来一局', new Vec3(-110, -246, 0), new Color(81, 136, 90, 255));
        const homeButton = this.createTextButton(panel, 'HomeButtonClean', '返回大厅', new Vec3(110, -246, 0), new Color(151, 94, 54, 255));

        retryButton.on(Node.EventType.TOUCH_END, () => {
            if (!mGameData.ConsumeStamina(1)) {
                this.showTip('体力不足，请稍后再试。');
                return;
            }

            this.hideResult();
            this.restartSession();
        }, this);

        homeButton.on(Node.EventType.TOUCH_END, () => {
            director.loadScene('home2');
        }, this);
    }

    private showSessionResult(isWin: boolean, reason = '') {
        this.showSessionResultClean(isWin, reason);
    }

    private restartSession() {
        this.currentLevel = this.sessionStartLevel;
        this.currentDifficultyMode = getGame3DifficultyMode(gameConfig.game3SelectedDifficulty);
        this.sessionInitialEnergy = 100;
        this.energy = this.sessionInitialEnergy;
        this.clearedLevelCount = 0;
        this.totalSessionScore = 0;
        this.totalWrongHits = 0;
        this.totalExtraThrows = 0;
        this.stageScoreRecords = [];
        this.loadStage(this.currentLevel);
    }

    private getStageScoreSummary() {
        if (this.stageScoreRecords.length <= 0) {
            return '关卡评分: 本局尚未通关';
        }

        const summary = this.stageScoreRecords
            .map((record) => `${record.level}关:${record.score}`)
            .join('  ');

        return `关卡评分: ${summary}`;
    }

    private showTip(message: string) {
        const tipNode = loadPool.ins.getPoolNode('tips', this.node);
        if (tipNode) {
            director.emit(uiEmits.tipMsg, message);
            return;
        }

        if (!this.tipLabel) {
            return;
        }
        this.tipLabel.string = message;
        this.tipLabel.node.active = true;
        this.unschedule(this.hideTip);
        this.scheduleOnce(this.hideTip, 1.2);
    }

    private hideTip = () => {
        if (this.tipLabel) {
            this.tipLabel.node.active = false;
        }
    };

    private uiToBattleLocal(uiPos: Vec2) {
        const battleTransform = this.battleLayer?.getComponent(UITransform);
        if (battleTransform) {
            return battleTransform.convertToNodeSpaceAR(new Vec3(uiPos.x, uiPos.y, 0));
        }

        const visible = view.getVisibleSize();
        const x = uiPos.x - visible.width / 2;
        const y = uiPos.y - visible.height / 2 + 30;
        return new Vec3(x, y, 0);
    }

    private getProjectileHomeBattlePos() {
        const battleTransform = this.battleLayer?.getComponent(UITransform);
        if (battleTransform && this.projectileNode?.isValid) {
            return battleTransform.convertToNodeSpaceAR(this.projectileNode.getWorldPosition(new Vec3()));
        }

        return this.initialProjectilePos.clone();
    }

    private clampBattlePoint(point: Vec3) {
        const battleTransform = this.battleLayer?.getComponent(UITransform);
        if (battleTransform) {
            const halfWidth = battleTransform.width / 2;
            const halfHeight = battleTransform.height / 2;
            return new Vec3(
                Math.max(-halfWidth, Math.min(halfWidth, point.x)),
                Math.max(-halfHeight, Math.min(halfHeight, point.y)),
                0,
            );
        }

        return new Vec3(
            Math.max(-300, Math.min(300, point.x)),
            Math.max(-420, Math.min(420, point.y)),
            0,
        );
    }

    private simplifyPath(points: Vec3[]) {
        if (points.length <= 2) {
            return points.map((point) => point.clone());
        }
        const simplified = [points[0].clone()];
        for (let i = 1; i < points.length; i++) {
            const prev = simplified[simplified.length - 1];
            const point = points[i];
            if (Vec3.distance(prev, point) >= 10) {
                simplified.push(point.clone());
            }
        }
        return simplified;
    }

    private simplifyProjectilePath(points: Vec3[]) {
        const sampledPath = this.simplifyPath(points);
        if (sampledPath.length <= 2) {
            return sampledPath;
        }

        const first = sampledPath[0];
        const last = sampledPath[sampledPath.length - 1];
        let maxDistanceToMainLine = 0;
        for (let i = 1; i < sampledPath.length - 1; i++) {
            maxDistanceToMainLine = Math.max(
                maxDistanceToMainLine,
                this.getDistanceToLine(sampledPath[i], first, last),
            );
        }

        if (maxDistanceToMainLine <= this.projectilePathStraightTolerance) {
            return [first.clone(), last.clone()];
        }

        return this.simplifyPathByTolerance(sampledPath, this.projectilePathStraightTolerance);
    }

    private simplifyPathByTolerance(points: Vec3[], tolerance: number) {
        if (points.length <= 2) {
            return points.map((point) => point.clone());
        }

        let maxDistance = 0;
        let splitIndex = 0;
        const start = points[0];
        const end = points[points.length - 1];
        for (let i = 1; i < points.length - 1; i++) {
            const distance = this.getDistanceToLine(points[i], start, end);
            if (distance > maxDistance) {
                maxDistance = distance;
                splitIndex = i;
            }
        }

        if (maxDistance <= tolerance) {
            return [start.clone(), end.clone()];
        }

        const left = this.simplifyPathByTolerance(points.slice(0, splitIndex + 1), tolerance);
        const right = this.simplifyPathByTolerance(points.slice(splitIndex), tolerance);
        return left.slice(0, -1).concat(right);
    }

    private getDistanceToLine(point: Vec3, start: Vec3, end: Vec3) {
        const dx = end.x - start.x;
        const dy = end.y - start.y;
        const lengthSquared = dx * dx + dy * dy;
        if (lengthSquared <= 0.001) {
            return Vec3.distance(point, start);
        }

        const cross = Math.abs(dy * point.x - dx * point.y + end.x * start.y - end.y * start.x);
        return cross / Math.sqrt(lengthSquared);
    }

    private getFailReasonText(reason: string) {
        switch (reason) {
            case 'quit':
                return '主动退出';
            case 'wrong-hit':
                return '误击过多';
            case 'energy-empty':
                return '灵力耗尽';
            default:
                return '挑战失败';
        }
    }

    private createLabel(parent: Node, text: string, position: Vec3, fontSize: number, color: Color, width: number) {
        const node = new Node(`${text}_Label`);
        node.layer = this.node.layer;
        node.parent = parent;
        node.setPosition(position);
        node.addComponent(UITransform).setContentSize(width, fontSize + 16);
        const label = node.addComponent(Label);
        label.string = text;
        label.fontSize = fontSize;
        label.lineHeight = fontSize + 8;
        label.color = color;
        label.horizontalAlign = Label.HorizontalAlign.CENTER;
        label.verticalAlign = Label.VerticalAlign.CENTER;
        return label;
    }

    private createTextButton(parent: Node, name: string, text: string, position: Vec3, fillColor: Color) {
        const node = new Node(name);
        node.layer = this.node.layer;
        node.parent = parent;
        node.setPosition(position);
        node.addComponent(UITransform).setContentSize(180, 64);
        const graphics = node.addComponent(Graphics);
        graphics.fillColor = fillColor;
        graphics.roundRect(-90, -32, 180, 64, 14);
        graphics.fill();
        this.createLabel(node, text, Vec3.ZERO, 26, new Color(255, 255, 255, 255), 160);
        return node;
    }
}
