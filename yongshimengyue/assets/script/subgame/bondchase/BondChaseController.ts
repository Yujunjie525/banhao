import BondChaseActor from "./BondChaseActor";
import BondChaseGenerator from "./BondChaseGenerator";
import BondChaseTemplate, {
    BondChasePlatformRect,
    BondChaseTemplateRuntime,
} from "./BondChaseTemplate";
import {
    createDefaultBondChaseConfig,
    normalizeBondChaseConfig,
} from "./BondChaseConfig";
import {
    BondChaseConfig,
    BondChaseRouteAction,
    BondChaseRouteStep,
    BondChaseTemplateConfig,
} from "./BondChaseTypes";
import ResUtils from "../../common/utils/ResUtils";
import mGameData from "../../../Scripts/Data/GameData";
import TipsManager from "../../../Scripts/Manager/TipsManager";
import { gameManager } from "../prefab/manager/gamemanager";

const { ccclass, property } = cc._decorator;

interface RuntimeActor {
    node: cc.Node;
    roleId: string;
    width: number;
    height: number;
    vx: number;
    vy: number;
    onGround: boolean;
}

interface RuntimeRouteStep {
    action: BondChaseRouteAction;
    startX: number;
    startY: number;
    targetX: number;
    targetY: number;
    duration: number;
    arcHeight: number;
    resumeDistance: number;
}

@ccclass("BondChaseController")
export default class BondChaseController extends cc.Component {
    @property({ tooltip: "进入场景后自动加载灰盒配置并开始" })
    public autoStart: boolean = true;

    @property({ tooltip: "resources 目录下 JSON 的路径，不含 .json" })
    public configPath: string = "config/bond_chase_shared";

    @property(cc.Node)
    public worldRoot: cc.Node = null;

    @property(cc.Node)
    public hudRoot: cc.Node = null;

    @property(cc.Prefab)
    public princessVisualPrefab: cc.Prefab = null;

    @property(cc.Prefab)
    public guardVisualPrefab: cc.Prefab = null;

    @property(cc.SpriteFrame)
    public platformSpriteFrame: cc.SpriteFrame = null;

    @property(cc.SpriteFrame)
    public backgroundSpriteFrame: cc.SpriteFrame = null;

    @property(cc.SpriteFrame)
    public waterSpriteFrame: cc.SpriteFrame = null;

    @property(cc.SpriteFrame)
    public leftButtonSpriteFrame: cc.SpriteFrame = null;

    @property(cc.SpriteFrame)
    public jumpButtonSpriteFrame: cc.SpriteFrame = null;

    @property(cc.SpriteFrame)
    public rightButtonSpriteFrame: cc.SpriteFrame = null;

    @property(cc.SpriteFrame)
    public failPanelSpriteFrame: cc.SpriteFrame = null;

    @property(cc.SpriteFrame)
    public failIllustrationSpriteFrame: cc.SpriteFrame = null;

    @property(cc.SpriteFrame)
    public retryButtonSpriteFrame: cc.SpriteFrame = null;

    @property(cc.SpriteFrame)
    public backButtonSpriteFrame: cc.SpriteFrame = null;

    @property(cc.SpriteFrame)
    public pauseButtonSpriteFrame: cc.SpriteFrame = null;

    @property(cc.Node)
    public waterFreezeButton: cc.Node = null;

    @property({ tooltip: "黑水图片顶部透明区的补偿距离，使可见水面与失败判定线对齐" })
    public waterSurfaceOffset: number = 32;

    @property({ tooltip: "失败弹窗中返回按钮要加载的主界面场景名" })
    public mainMenuScene: string = "main";

    @property({ tooltip: "高度计换算比例：多少世界像素记为 1 米" })
    public heightPixelsPerMeter: number = 30;

    @property
    public showDebugRoute: boolean = true;

    private config: BondChaseConfig = null;
    private generator: BondChaseGenerator = null;
    private running: boolean = false;
    private failed: boolean = false;
    private failReason: string = "";

    private templates: BondChaseTemplateRuntime[] = [];
    private nextTemplateY: number = 0;
    private nextTemplateCursor: number = 0;
    private nextChunkIndex: number = 0;
    private route: RuntimeRouteStep[] = [];
    private routeIndex: number = 0;
    private routeElapsed: number = 0;
    private routeCursorX: number = 0;
    private routeCursorY: number = 0;

    private princess: RuntimeActor = null;
    private guard: RuntimeActor = null;
    private backgroundNode: cc.Node = null;
    private chainGraphics: cc.Graphics = null;
    private waterNode: cc.Node = null;
    private waterSprite: cc.Sprite = null;
    private waterGraphics: cc.Graphics = null;
    private statusLabel: cc.Label = null;
    private distanceLabel: cc.Label = null;
    private heightLabel: cc.Label = null;
    private failPanel: cc.Node = null;
    private endlessFrameRoot: cc.Node = null;
    private endlessResultPanel: cc.Node = null;
    private endlessRewardGranted: boolean = false;
    /** 防止 cc.Button 的 click/触摸链路在同一帧重复开启新局。 */
    private retryInProgress: boolean = false;
    private cameraY: number = 0;
    private cameraAnchorY: number = 0;
    private worldBaseY: number = 0;
    private waterY: number = 0;
    private waterCurrentSpeed: number = 0;
    private waterFreezeRemaining: number = 0;
    private princessWaterReferenceY: number = 0;
    private guardWaterReferenceY: number = 0;
    private chainOverTime: number = 0;
    private runStartGuardY: number = 0;
    private currentHeight: number = 0;
    private maxHeight: number = 0;
    private elapsedRunTime: number = 0;
    private princessPaceRatio: number = 0.74;
    private princessPaceNoise: number = 0;
    private princessPaceNoiseTarget: number = 0;
    private princessPaceNoiseTimer: number = 0;
    private princessDistancePaceScale: number = 1;
    private paceRandomState: number = 1;
    private currentRunSeed: number = 0;
    private runSeedCounter: number = 0;

    private inputX: number = 0;
    private jumpRequested: boolean = false;
    private keyLeft: boolean = false;
    private keyRight: boolean = false;
    private keyJump: boolean = false;

    public start(): void {
        if (this.autoStart) {
            this.startMode();
        }
    }

    public startMode(): void {
        this.loadConfig((config: BondChaseConfig) => {
            const seed = config.generator.randomize_seed_each_run
                ? this.createRunSeed()
                : config.generator.seed;
            this.beginMode(config, seed);
        });
    }

    public restartMode(randomizeSeed: boolean = true): void {
        // 任何从失败状态发起的重开都必须收费；按钮回调会先设置
        // retryInProgress，避免这里与按钮入口重复扣除。
        if (this.failed && !this.retryInProgress) {
            if (!this.consumeRetryStamina()) {
                return;
            }
            this.retryInProgress = true;
        }

        // 失败弹窗按钮是在触摸事件回调中调用重启的，先清理旧监听，下一帧再重新注册，避免事件重入导致键盘监听失效。
        this.removeInputListeners();
        if (this.config) {
            const seed = randomizeSeed && this.config.generator.randomize_seed_each_run
                ? this.createRunSeed()
                : this.currentRunSeed || this.config.generator.seed;
            this.beginMode(this.config, seed);
        } else {
            this.startMode();
        }
        this.scheduleOnce(() => {
            if (this.isValid) {
                this.installInputListeners();
            }
        }, 0);
    }

    public stopMode(): void {
        this.running = false;
        this.removeInputListeners();
    }

    public isFailed(): boolean {
        return this.failed;
    }

    public getFailReason(): string {
        return this.failReason;
    }

    public getCurrentRunSeed(): number {
        return this.currentRunSeed;
    }

    protected update(dt: number): void {
        if (!this.running || !this.config || !this.guard || !this.princess) {
            return;
        }
        dt = Math.min(Math.max(dt, 0), 1 / 30);
        this.ensureTemplateStreaming();
        this.updateGuard(dt);
        this.updatePrincessPace(dt);
        this.updatePrincess(dt);
        this.updateWater(dt);
        this.updateChain(dt);
        this.updateCamera(dt);
        this.updateHud();
    }

    protected onDestroy(): void {
        this.removeInputListeners();
        this.destroyEndlessResultFrame();
    }

    private loadConfig(done: (config: BondChaseConfig) => void): void {
        const cached = cc.resources.get(this.configPath, cc.JsonAsset) as cc.JsonAsset;
        if (cached && cached.json) {
            done(normalizeBondChaseConfig(cached.json));
            return;
        }
        cc.resources.load(this.configPath, cc.JsonAsset, (error: Error, asset: cc.JsonAsset) => {
            if (error || !asset || !asset.json) {
                cc.warn("BondChase config load failed, using fallback graybox", error);
                done(createDefaultBondChaseConfig());
                return;
            }
            done(normalizeBondChaseConfig(asset.json));
        });
    }

    private beginMode(config: BondChaseConfig, runSeed?: number): void {
        this.config = normalizeBondChaseConfig(config);
        this.currentRunSeed = (Math.floor(Number(runSeed) || this.config.generator.seed) >>> 0) || 1;
        this.config.generator.seed = this.currentRunSeed;
        cc.log("BondChase run seed:", this.currentRunSeed);
        this.running = false;
        this.failed = false;
        this.destroyEndlessResultFrame();
        this.endlessRewardGranted = false;
        this.failReason = "";
        this.templates = [];
        this.route = [];
        this.routeIndex = 0;
        this.routeElapsed = 0;
        this.nextTemplateY = 0;
        this.nextTemplateCursor = 0;
        this.nextChunkIndex = 0;
        this.chainOverTime = 0;
        this.currentHeight = 0;
        this.maxHeight = 0;
        this.elapsedRunTime = 0;
        this.princessPaceRatio = this.config.princess_pace_start_ratio;
        this.princessPaceNoise = 0;
        this.princessPaceNoiseTarget = 0;
        this.princessDistancePaceScale = 1;
        this.paceRandomState = (this.config.generator.seed ^ 0x6d2b79f5) >>> 0;
        if (this.paceRandomState === 0) {
            this.paceRandomState = 1;
        }
        this.princessPaceNoiseTimer = 8 + this.nextPaceRandom() * 4;
        this.inputX = 0;
        this.jumpRequested = false;
        this.keyLeft = false;
        this.keyRight = false;
        this.keyJump = false;
        this.waterY = this.config.water_start;
        this.waterCurrentSpeed = this.config.water_speed;
        this.waterFreezeRemaining = 0;
        this.generator = this.config.generator.enabled ? new BondChaseGenerator(this.config) : null;

        this.prepareRoots();
        this.createInitialTemplates();
        this.createActors();
        this.waterCurrentSpeed = this.getAdaptiveWaterSpeed();
        this.createHud();
        this.installInputListeners();
        this.running = true;
        this.updateChain(0);
        this.updateHud();
    }

    private prepareRoots(): void {
        this.node.setContentSize(cc.winSize);
        this.prepareBackground();
        if (!this.worldRoot) {
            this.worldRoot = new cc.Node("BondChaseWorld");
            this.node.addChild(this.worldRoot, 0);
        }
        this.worldRoot.removeAllChildren();
        this.worldRoot.setContentSize(this.config.world_width, 2000);
        this.worldRoot.setAnchorPoint(0.5, 0);
        this.worldBaseY = -cc.winSize.height / 2 + 150;
        this.worldRoot.setPosition(0, this.worldBaseY);

        const chainNode = new cc.Node("BondChaseChain");
        this.worldRoot.addChild(chainNode, 20);
        this.chainGraphics = chainNode.addComponent(cc.Graphics);
        this.waterNode = new cc.Node("BondChaseWater");
        this.worldRoot.addChild(this.waterNode, 19);
        this.prepareWaterVisual();
    }

    private prepareBackground(): void {
        if (!this.backgroundSpriteFrame) {
            if (this.backgroundNode && this.backgroundNode.isValid) {
                this.backgroundNode.active = false;
            }
            return;
        }

        if (!this.backgroundNode || !this.backgroundNode.isValid) {
            this.backgroundNode = new cc.Node("BondChaseBackground");
            this.node.addChild(this.backgroundNode, -100);
        }
        this.backgroundNode.active = true;
        this.backgroundNode.setPosition(0, 0);
        this.backgroundNode.setAnchorPoint(0.5, 0.5);
        this.backgroundNode.zIndex = -100;

        let sprite = this.backgroundNode.getComponent(cc.Sprite);
        if (!sprite) {
            sprite = this.backgroundNode.addComponent(cc.Sprite);
        }
        sprite.spriteFrame = this.backgroundSpriteFrame;
        sprite.type = cc.Sprite.Type.SIMPLE;
        sprite.sizeMode = cc.Sprite.SizeMode.CUSTOM;

        const sourceSize = this.backgroundSpriteFrame.getOriginalSize();
        const sourceWidth = Math.max(1, sourceSize.width);
        const sourceHeight = Math.max(1, sourceSize.height);
        this.backgroundNode.setContentSize(sourceWidth, sourceHeight);
        const coverScale = Math.max(cc.winSize.width / sourceWidth, cc.winSize.height / sourceHeight);
        this.backgroundNode.setScale(coverScale);
    }

    private prepareWaterVisual(): void {
        this.waterSprite = null;
        this.waterGraphics = null;
        if (!this.waterSpriteFrame) {
            this.waterGraphics = this.waterNode.addComponent(cc.Graphics);
            return;
        }

        this.waterSprite = this.waterNode.addComponent(cc.Sprite);
        this.waterSprite.spriteFrame = this.waterSpriteFrame;
        this.waterSprite.type = cc.Sprite.Type.SIMPLE;
        this.waterSprite.sizeMode = cc.Sprite.SizeMode.CUSTOM;

        const sourceSize = this.waterSpriteFrame.getOriginalSize();
        const sourceWidth = Math.max(1, sourceSize.width);
        const sourceHeight = Math.max(1, sourceSize.height);
        const visualScale = this.config.world_width / sourceWidth;
        this.waterNode.setContentSize(this.config.world_width + 100, sourceHeight * visualScale);
        this.waterNode.setAnchorPoint(0.5, 0.5);
    }

    private createInitialTemplates(): void {
        for (let i = 0; i < 4; i++) {
            this.createNextTemplate();
        }
    }

    private createNextTemplate(): void {
        const templateConfig = this.generator
            ? this.generator.generateChunk(this.nextChunkIndex++, this.nextTemplateY)
            : this.pickTemplateConfig();
        const runtime = BondChaseTemplate.create(
            this.worldRoot,
            templateConfig,
            this.nextTemplateY,
            this.platformSpriteFrame,
            this.showDebugRoute
        );
        this.templates.push(runtime);
        this.appendRoute(templateConfig, this.nextTemplateY);
        this.nextTemplateY += templateConfig.height;
    }

    private pickTemplateConfig(): BondChaseTemplateConfig {
        const pool = this.config.template_pool.length > 0 ? this.config.template_pool : [this.config.templates[0].id];
        const wantedId = pool[this.nextTemplateCursor % pool.length];
        this.nextTemplateCursor += 1;
        for (let i = 0; i < this.config.templates.length; i++) {
            if (this.config.templates[i].id === wantedId) {
                return this.config.templates[i];
            }
        }
        return this.config.templates[0];
    }

    private appendRoute(template: BondChaseTemplateConfig, worldY: number): void {
        const steps = Array.isArray(template.princess_route) ? template.princess_route : [];
        for (let i = 0; i < steps.length; i++) {
            const raw: BondChaseRouteStep = steps[i];
            const action = raw.action === "run" || raw.action === "jump" || raw.action === "wait_guard"
                ? raw.action
                : "wait";
            const hasTarget = action === "run" || action === "jump";
            const targetX = hasTarget ? Number(raw.x) || 0 : this.routeCursorX;
            const targetY = hasTarget ? worldY + (Number(raw.y) || 0) : this.routeCursorY;
            const runtime: RuntimeRouteStep = {
                action: action,
                startX: this.routeCursorX,
                startY: this.routeCursorY,
                targetX: targetX,
                targetY: targetY,
                duration: Math.max(0.01, Number(raw.duration) || (action === "wait" ? 0.5 : 1)),
                arcHeight: Math.max(0, Number(raw.arc_height) || 0),
                resumeDistance: Math.max(80, Number(raw.resume_distance) || 180),
            };
            this.route.push(runtime);
            if (hasTarget) {
                this.routeCursorX = targetX;
                this.routeCursorY = targetY;
            }
        }
    }

    private createActors(): void {
        const first = this.templates[0];
        const princessSpawn = first.config.spawn && first.config.spawn.princess
            ? first.config.spawn.princess
            : { x: -80, y: 100 };
        const guardSpawn = first.config.spawn && first.config.spawn.guard
            ? first.config.spawn.guard
            : { x: -10, y: 100 };
        const princessY = first.worldY + princessSpawn.y;
        const guardY = first.worldY + guardSpawn.y;
        this.princess = this.createActor(
            "H_001",
            "公主",
            this.config.princess.width,
            this.config.princess.height,
            cc.color(224, 238, 255, 255),
            princessSpawn.x,
            princessY,
            this.princessVisualPrefab,
            "hero2_idle",
            "hero2_run"
        );
        this.guard = this.createActor(
            "G_001",
            "护卫",
            this.config.guard.width,
            this.config.guard.height,
            cc.color(232, 177, 64, 255),
            guardSpawn.x,
            guardY,
            this.guardVisualPrefab,
            "hero1_idle",
            "hero1_run"
        );
        this.routeCursorX = princessSpawn.x;
        this.routeCursorY = princessY;
        this.route = [];
        this.routeIndex = 0;
        this.routeElapsed = 0;
        for (let i = 0; i < this.templates.length; i++) {
            this.appendRoute(this.templates[i].config, this.templates[i].worldY);
        }
        this.cameraY = guardY;
        this.cameraAnchorY = guardY;
        this.princessWaterReferenceY = princessY;
        this.guardWaterReferenceY = guardY;
        this.runStartGuardY = guardY;
        this.currentHeight = 0;
        this.maxHeight = 0;
    }

    private createActor(
        roleId: string,
        name: string,
        width: number,
        height: number,
        color: cc.Color,
        x: number,
        y: number,
        visualPrefab: cc.Prefab,
        idleClipName: string,
        runClipName: string
    ): RuntimeActor {
        const node = new cc.Node(roleId);
        node.setPosition(x, y);
        this.worldRoot.addChild(node, 10);
        const actor = node.addComponent(BondChaseActor);
        actor.setup(roleId, name, width, height, color, visualPrefab, idleClipName, runClipName);
        return { node: node, roleId: roleId, width: width, height: height, vx: 0, vy: 0, onGround: false };
    }

    private createHud(): void {
        if (!this.hudRoot) {
            this.hudRoot = new cc.Node("BondChaseHUD");
            this.node.addChild(this.hudRoot, 50);
        }
        this.hudRoot.zIndex = 50;
        const staticWaterFreezeButton = this.waterFreezeButton && this.waterFreezeButton.isValid
            ? this.waterFreezeButton
            : this.hudRoot.getChildByName("WaterFreezeBtn");
        this.hudRoot.removeAllChildren();
        this.hudRoot.setContentSize(cc.winSize);
        this.hudRoot.setPosition(0, 0);
        if (staticWaterFreezeButton && staticWaterFreezeButton.isValid) {
            this.hudRoot.addChild(staticWaterFreezeButton, 8);
            this.waterFreezeButton = staticWaterFreezeButton;
        }

        const statusNode = new cc.Node("BondChaseStatus");
        statusNode.setPosition(0, cc.winSize.height / 2 - 116);
        this.hudRoot.addChild(statusNode);
        this.statusLabel = statusNode.addComponent(cc.Label);
        this.statusLabel.fontSize = 22;
        this.statusLabel.lineHeight = 28;
        this.statusLabel.horizontalAlign = cc.Label.HorizontalAlign.CENTER;
        statusNode.color = cc.color(255, 244, 205, 255);

        const distanceNode = new cc.Node("BondChaseDistance");
        distanceNode.setPosition(0, cc.winSize.height / 2 - 74);
        this.hudRoot.addChild(distanceNode);
        this.distanceLabel = distanceNode.addComponent(cc.Label);
        this.distanceLabel.fontSize = 26;
        this.distanceLabel.lineHeight = 32;
        this.distanceLabel.horizontalAlign = cc.Label.HorizontalAlign.CENTER;
        distanceNode.color = cc.color(220, 235, 255, 255);

        const heightNode = new cc.Node("BondChaseHeight");
        // 右侧对齐屏幕边缘，避免窄屏上高度文本被裁切。
        heightNode.setAnchorPoint(1, 0.5);
        heightNode.setPosition(cc.winSize.width / 2 - 24, cc.winSize.height / 2 - 74);
        this.hudRoot.addChild(heightNode);
        this.heightLabel = heightNode.addComponent(cc.Label);
        this.heightLabel.fontSize = 24;
        this.heightLabel.lineHeight = 30;
        this.heightLabel.horizontalAlign = cc.Label.HorizontalAlign.CENTER;
        heightNode.color = cc.color(255, 244, 205, 255);

        this.createEndlessPauseButton();
        // 与关卡模式一致：左移、右移、跳跃从左到右排列。
        this.createControlButton("MoveLeft", this.leftButtonSpriteFrame, false);
        this.createControlButton("MoveRight", this.rightButtonSpriteFrame, false);
        this.createControlButton("Jump", this.jumpButtonSpriteFrame, true);
        this.createWaterFreezeButton();
        this.createFailPanel();
    }

    /** 无尽模式进行中显示暂停入口，暂停页内再提供继续和返回主界面。 */
    private createEndlessPauseButton(): void {
        const button = new cc.Node("EndlessPauseButton");
        // 与关卡模式 GeneraItem.prefab 中 StopBtn 保持同尺寸和左上角边距。
        button.setContentSize(100, 85);
        button.setPosition(-cc.winSize.width / 2 + 78.512, cc.winSize.height / 2 - 95.287);
        this.hudRoot.addChild(button, 10);

        const visual = new cc.Node("Background");
        visual.setContentSize(85, 79);
        button.addChild(visual);
        const sprite = visual.addComponent(cc.Sprite);
        sprite.spriteFrame = this.pauseButtonSpriteFrame
            || ResUtils.getAsset<cc.SpriteFrame>("subgame:ui_wgyzt/play/anniu2", cc.SpriteFrame);
        sprite.sizeMode = cc.Sprite.SizeMode.CUSTOM;

        button.addComponent(cc.Button);
        button.on(cc.Node.EventType.TOUCH_END, (event: cc.Event.EventTouch) => {
            event.stopPropagation();
            this.running = false;
            this.inputX = 0;
            this.jumpRequested = false;
            this.removeInputListeners();
            if (!this.showEndlessStopFrame()) {
                this.running = true;
                this.installInputListeners();
            }
        }, this);
    }

    private createWaterFreezeButton(): void {
        const button = this.waterFreezeButton || (this.hudRoot && this.hudRoot.getChildByName("WaterFreezeBtn"));
        if (!button || !button.isValid) {
            cc.warn("BondChaseController: WaterFreezeBtn scene node not found.");
            return;
        }
        button.off(cc.Node.EventType.TOUCH_END);
        button.on(cc.Node.EventType.TOUCH_END, (event: cc.Event.EventTouch) => {
            event.stopPropagation();
            this.useWaterFreeze();
        }, this);
        this.waterFreezeButton = button;
        this.updateWaterFreezeButton();
    }

    private updateWaterFreezeButton(): void {
        if (!this.waterFreezeButton || !this.waterFreezeButton.isValid) {
            return;
        }
        const labelNode = this.waterFreezeButton.getChildByName("WaterFreezeLabel");
        const label = labelNode ? labelNode.getComponent(cc.Label) : null;
        if (label) {
            label.string = `${mGameData.getGoodsInventoryAmount("ysmy_water_freeze")}`;
        }
    }

    private useWaterFreeze(): void {
        if (!this.running) {
            return;
        }
        if (!mGameData.consumeGoodsInventory("ysmy_water_freeze", 1)) {
            TipsManager.show("黑水凝结不足。");
            this.updateWaterFreezeButton();
            return;
        }
        this.waterFreezeRemaining = 5;
        this.updateWaterFreezeButton();
    }

    private createControlButton(name: string, spriteFrame: cc.SpriteFrame, isJump: boolean): void {
        const button = new cc.Node(name);
        const buttonWidth = 154;
        const buttonHeight = 114;
        button.setContentSize(buttonWidth, buttonHeight);
        // 与关卡模式底部 buttom 容器的垂直位置保持一致。
        const bottomY = -cc.winSize.height / 2 + 153.045;
        const layoutX = name === "MoveLeft"
            ? -214.604
            : name === "MoveRight"
                ? -32.207
                : 216.142;
        button.setPosition(layoutX, bottomY);
        this.hudRoot.addChild(button, 5);
        const visual = new cc.Node("Background");
        visual.setContentSize(buttonWidth, buttonHeight);
        button.addChild(visual);
        const sprite = visual.addComponent(cc.Sprite);
        sprite.spriteFrame = spriteFrame;
        sprite.sizeMode = cc.Sprite.SizeMode.CUSTOM;
        button.addComponent(cc.Button);
        button.on(cc.Node.EventType.TOUCH_START, (event: cc.Event.EventTouch) => {
            event.stopPropagation();
            if (isJump) {
                this.jumpRequested = true;
            } else {
                this.inputX = name === "MoveLeft" ? -1 : 1;
            }
        }, this);
        button.on(cc.Node.EventType.TOUCH_END, (event: cc.Event.EventTouch) => {
            event.stopPropagation();
            if (!isJump) {
                this.inputX = 0;
            }
        }, this);
        button.on(cc.Node.EventType.TOUCH_CANCEL, (event: cc.Event.EventTouch) => {
            event.stopPropagation();
            if (!isJump) {
                this.inputX = 0;
            }
        }, this);
    }

    private createFailPanel(): void {
        this.failPanel = new cc.Node("BondChaseFailPanel");
        this.failPanel.setContentSize(cc.winSize);
        this.failPanel.setPosition(0, 0);
        this.failPanel.zIndex = 1000;
        this.hudRoot.addChild(this.failPanel, 40);

        const mask = new cc.Node("Mask");
        mask.setContentSize(cc.winSize);
        this.failPanel.addChild(mask);
        const maskGraphics = mask.addComponent(cc.Graphics);
        maskGraphics.fillColor = cc.color(0, 0, 0, 150);
        maskGraphics.fillRect(-cc.winSize.width / 2, -cc.winSize.height / 2, cc.winSize.width, cc.winSize.height);
        mask.addComponent(cc.BlockInputEvents);

        const panel = new cc.Node("Panel");
        panel.setContentSize(558, 222);
        panel.setPosition(0, 30);
        this.failPanel.addChild(panel, 1);
        const panelSprite = panel.addComponent(cc.Sprite);
        panelSprite.spriteFrame = this.failPanelSpriteFrame;
        panelSprite.sizeMode = cc.Sprite.SizeMode.CUSTOM;

        const illustration = new cc.Node("FailureIllustration");
        illustration.setContentSize(390, 229);
        illustration.setPosition(0, 40);
        this.failPanel.addChild(illustration, 2);
        const illustrationSprite = illustration.addComponent(cc.Sprite);
        illustrationSprite.spriteFrame = this.failIllustrationSpriteFrame;
        illustrationSprite.sizeMode = cc.Sprite.SizeMode.CUSTOM;

        const title = new cc.Node("Title");
        title.setPosition(0, 188);
        this.failPanel.addChild(title, 3);
        const titleLabel = title.addComponent(cc.Label);
        titleLabel.string = "盟约破碎";
        titleLabel.fontSize = 38;
        titleLabel.lineHeight = 44;
        titleLabel.horizontalAlign = cc.Label.HorizontalAlign.CENTER;
        title.color = cc.color(255, 227, 168, 255);

        const reason = new cc.Node("Reason");
        reason.setPosition(0, 100);
        this.failPanel.addChild(reason, 3);
        const reasonLabel = reason.addComponent(cc.Label);
        reasonLabel.fontSize = 20;
        reasonLabel.lineHeight = 26;
        reasonLabel.horizontalAlign = cc.Label.HorizontalAlign.CENTER;
        reason.color = cc.color(236, 242, 224, 255);

        this.createFailButton("Retry", this.retryButtonSpriteFrame, -132, -112, () => {
            this.retryAfterFailure();
        });
        this.createFailButton("BackToMenu", this.backButtonSpriteFrame, 132, -112, () => {
            const sceneName = String(this.mainMenuScene || "main").trim();
            if (sceneName) {
                cc.director.loadScene(sceneName);
            }
        });

        this.failPanel.active = false;
    }

    private createFailButton(name: string, spriteFrame: cc.SpriteFrame, x: number, y: number, callback: () => void): void {
        const button = new cc.Node(name);
        button.setContentSize(250, 62);
        button.setPosition(x, y);
        this.failPanel.addChild(button, 3);
        const sprite = button.addComponent(cc.Sprite);
        sprite.spriteFrame = spriteFrame;
        sprite.sizeMode = cc.Sprite.SizeMode.CUSTOM;
        button.addComponent(cc.Button);
        this.bindButtonCallback(button, callback);
    }

    private updateGuard(dt: number): void {
        const actor = this.guard;
        const previousY = actor.node.y;
        const previousBottom = previousY - actor.height / 2;
        actor.vx = this.inputX * this.config.guard.speed;
        actor.vy += this.config.guard.gravity * dt;
        if (this.jumpRequested && actor.onGround) {
            actor.vy = this.config.guard.jump_impulse;
            actor.onGround = false;
        }
        this.jumpRequested = false;
        actor.node.x += actor.vx * dt;
        actor.node.x = Math.max(-this.config.world_width / 2 + actor.width / 2, Math.min(this.config.world_width / 2 - actor.width / 2, actor.node.x));
        const nextY = actor.node.y + actor.vy * dt;
        actor.onGround = false;
        if (actor.vy <= 0) {
            const landing = this.findLandingPlatform(actor, previousBottom, nextY - actor.height / 2);
            if (landing) {
                actor.node.y = landing.y + landing.height / 2 + actor.height / 2;
                actor.vy = 0;
                actor.onGround = true;
            } else {
                actor.node.y = nextY;
            }
        } else {
            actor.node.y = nextY;
        }
        this.setActorMotion(actor, Math.abs(actor.vx) > 1, actor.vx);
    }

    private findLandingPlatform(actor: RuntimeActor, previousBottom: number, nextBottom: number): BondChasePlatformRect {
        const platforms = this.getActivePlatforms();
        for (let i = 0; i < platforms.length; i++) {
            const platform = platforms[i];
            const horizontalOverlap = actor.node.x + actor.width / 2 > platform.x - platform.width / 2
                && actor.node.x - actor.width / 2 < platform.x + platform.width / 2;
            const crossedTop = previousBottom >= platform.y + platform.height / 2 - 8
                && nextBottom <= platform.y + platform.height / 2;
            if (horizontalOverlap && crossedTop) {
                return platform;
            }
        }
        return null;
    }

    private updatePrincess(dt: number): void {
        if (this.routeIndex >= this.route.length) {
            this.setActorMotion(this.princess, false, 0);
            return;
        }
        const step = this.route[this.routeIndex];
        if (step.action === "wait_guard") {
            this.setActorMotion(this.princess, false, 0);
            this.princessWaterReferenceY = this.princess.node.y;
            const distance = this.getActorDistance();
            if (distance <= step.resumeDistance) {
                this.routeIndex += 1;
                this.routeElapsed = 0;
            }
            return;
        }
        this.routeElapsed += dt * this.princessPaceRatio * this.princessDistancePaceScale;
        const progress = Math.min(1, this.routeElapsed / step.duration);
        if (step.action === "run" || step.action === "jump") {
            this.setActorMotion(this.princess, true, step.targetX - step.startX);
            this.princess.node.x = step.startX + (step.targetX - step.startX) * progress;
            const baseY = step.startY + (step.targetY - step.startY) * progress;
            this.princessWaterReferenceY = baseY;
            const arc = step.action === "jump"
                ? 4 * progress * (1 - progress) * step.arcHeight
                : 0;
            this.princess.node.y = baseY + arc;
        } else {
            this.setActorMotion(this.princess, false, 0);
            this.princessWaterReferenceY = this.princess.node.y;
        }
        if (progress >= 1) {
            this.routeIndex += 1;
            this.routeElapsed = 0;
        }
    }

    private updatePrincessPace(dt: number): void {
        this.elapsedRunTime += dt;
        this.princessPaceNoiseTimer -= dt;
        if (this.princessPaceNoiseTimer <= 0) {
            this.princessPaceNoiseTarget = (this.nextPaceRandom() * 2 - 1) * this.config.princess_pace_variation;
            this.princessPaceNoiseTimer = 8 + this.nextPaceRandom() * 4;
        }

        this.princessPaceNoise += (this.princessPaceNoiseTarget - this.princessPaceNoise) * Math.min(1, dt * 0.5);
        const rampProgress = Math.min(1, this.elapsedRunTime / this.config.princess_pace_ramp_seconds);
        const smoothProgress = rampProgress * rampProgress * (3 - 2 * rampProgress);
        const basePace = this.config.princess_pace_start_ratio
            + (this.config.princess_pace_end_ratio - this.config.princess_pace_start_ratio) * smoothProgress;
        this.princessPaceRatio = Math.max(0.65, Math.min(0.92, basePace + this.princessPaceNoise));

        const distanceRatio = this.getActorDistance() / this.config.max_chain_distance;
        const targetDistanceScale = distanceRatio > 1
            ? 0.25
            : distanceRatio > 0.9
                ? 0.5
                : distanceRatio > 0.7
                    ? 0.8
                    : 1;
        this.princessDistancePaceScale += (targetDistanceScale - this.princessDistancePaceScale) * Math.min(1, dt * 4);
    }

    private nextPaceRandom(): number {
        this.paceRandomState = (this.paceRandomState * 1664525 + 1013904223) >>> 0;
        return this.paceRandomState / 4294967296;
    }

    private createRunSeed(): number {
        this.runSeedCounter = (this.runSeedCounter + 1) >>> 0;
        const timePart = Date.now() >>> 0;
        const randomPart = Math.floor(Math.random() * 4294967296) >>> 0;
        const counterPart = (this.runSeedCounter * 2654435761) >>> 0;
        return (timePart ^ randomPart ^ counterPart) >>> 0 || 1;
    }

    private setActorMotion(actor: RuntimeActor, moving: boolean, direction: number): void {
        if (!actor || !actor.node || !actor.node.isValid) {
            return;
        }
        const actorView = actor.node.getComponent(BondChaseActor);
        if (actorView) {
            actorView.setMotion(moving, direction);
        }
    }

    private updateWater(dt: number): void {
        if (this.guard.onGround) {
            this.guardWaterReferenceY = this.guard.node.y;
        }
        const isFrozen = this.waterFreezeRemaining > 0;
        if (isFrozen) {
            this.waterFreezeRemaining = Math.max(0, this.waterFreezeRemaining - dt);
        } else {
            const targetSpeed = this.getAdaptiveWaterSpeed();
            this.waterCurrentSpeed += (targetSpeed - this.waterCurrentSpeed)
                * Math.min(1, dt * this.config.water_speed_response);
            this.waterY += this.waterCurrentSpeed * dt;
        }
        if (this.waterSprite) {
            this.waterNode.setPosition(
                0,
                this.waterY + this.waterSurfaceOffset - this.waterNode.height / 2
            );
        } else if (this.waterGraphics) {
            this.waterGraphics.clear();
            this.waterGraphics.fillColor = cc.color(25, 22, 52, 235);
            this.waterGraphics.fillRect(-this.config.world_width / 2, this.waterY - 350, this.config.world_width, 350);
            this.waterGraphics.strokeColor = cc.color(110, 94, 190, 255);
            this.waterGraphics.lineWidth = 4;
            this.waterGraphics.moveTo(-this.config.world_width / 2, this.waterY);
            this.waterGraphics.lineTo(this.config.world_width / 2, this.waterY);
            this.waterGraphics.stroke();
        }
        if (this.guard.node.y - this.guard.height / 2 <= this.waterY || this.princess.node.y - this.princess.height / 2 <= this.waterY) {
            this.fail("坠入黑水");
        }
    }

    private getAdaptiveWaterSpeed(): number {
        const baseSpeed = this.config.water_speed;
        if (baseSpeed <= 0 || !this.princess || !this.princess.node || !this.princess.node.isValid) {
            return 0;
        }

        const princessBottom = this.princessWaterReferenceY - this.princess.height / 2;
        const guardBottom = this.guardWaterReferenceY - this.guard.height / 2;
        const targetGap = Math.max(80, this.config.water_target_gap);
        const desiredByPrincess = princessBottom - targetGap;
        const desiredByGuard = guardBottom - this.config.water_guard_clearance;
        const desiredWaterY = Math.min(desiredByPrincess, desiredByGuard);
        const normalizedError = (desiredWaterY - this.waterY) / targetGap;
        const rawScale = 1 + normalizedError * this.config.water_distance_gain;
        const scale = Math.max(
            this.config.water_min_speed_scale,
            Math.min(this.config.water_max_speed_scale, rawScale)
        );
        return baseSpeed * scale;
    }

    private updateChain(dt: number): void {
        const distance = this.getActorDistance();
        const ratio = distance / this.config.max_chain_distance;
        if (ratio > 1) {
            this.chainOverTime += dt;
            if (this.chainOverTime >= this.config.chain_fail_delay) {
                this.fail("超出盟约距离");
            }
        } else {
            this.chainOverTime = 0;
        }
        this.chainGraphics.clear();
        this.chainGraphics.lineWidth = ratio > 1 ? 9 : ratio > 0.7 ? 7 : 5;
        this.chainGraphics.strokeColor = ratio > 1 ? cc.color(255, 76, 70, 255)
            : ratio > 0.7 ? cc.color(255, 205, 88, 255)
                : cc.color(82, 220, 126, 255);
        this.chainGraphics.moveTo(this.princess.node.x, this.princess.node.y);
        this.chainGraphics.lineTo(this.guard.node.x, this.guard.node.y);
        this.chainGraphics.stroke();
        this.updateActorWarning(ratio > 0.7);
    }

    private updateActorWarning(active: boolean): void {
        const princessActor = this.princess.node.getComponent(BondChaseActor);
        const guardActor = this.guard.node.getComponent(BondChaseActor);
        if (princessActor) {
            princessActor.setWarning(active);
        }
        if (guardActor) {
            guardActor.setWarning(active);
        }
    }

    private updateCamera(dt: number): void {
        this.cameraY += (this.guard.node.y - this.cameraY) * Math.min(1, this.config.camera_smooth * dt);
        this.worldRoot.y = this.worldBaseY - Math.max(0, this.cameraY - this.cameraAnchorY);
    }

    private updateHud(): void {
        const distance = this.getActorDistance();
        const ratio = distance / this.config.max_chain_distance;
        this.updateHeightStats();

        const safeColor = cc.color(82, 220, 126, 255);
        const warningColor = cc.color(255, 205, 88, 255);
        const dangerColor = cc.color(255, 76, 70, 255);
        const distanceColor = ratio > 1 ? dangerColor : ratio > 0.7 ? warningColor : safeColor;
        if (this.distanceLabel) {
            this.distanceLabel.string = "盟约距离 " + Math.round(distance) + " / " + Math.round(this.config.max_chain_distance);
            this.distanceLabel.node.color = distanceColor;
        }
        if (this.heightLabel) {
            this.heightLabel.string = "高度 " + Math.floor(this.currentHeight) + "米";
        }
        this.updateWaterFreezeButton();
        if (this.statusLabel) {
            if (this.failed) {
                this.statusLabel.string = "盟约破碎：" + this.failReason;
                this.statusLabel.node.color = dangerColor;
            } else if (ratio > 1) {
                const remaining = Math.max(0, this.config.chain_fail_delay - this.chainOverTime);
                this.statusLabel.string = "距离过远 · 盟约将在 " + remaining.toFixed(1) + " 秒后断裂";
                this.statusLabel.node.color = dangerColor;
            } else if (ratio > 0.7) {
                this.statusLabel.string = "距离警告 · 请靠近公主";
                this.statusLabel.node.color = warningColor;
            } else {
                this.statusLabel.string = "距离安全";
                this.statusLabel.node.color = safeColor;
            }
        }
    }

    private updateHeightStats(): void {
        if (!this.guard || !this.guard.node || !this.guard.node.isValid) {
            return;
        }
        const pixelsPerMeter = Math.max(1, this.heightPixelsPerMeter);
        this.currentHeight = Math.max(0, (this.guard.node.y - this.runStartGuardY) / pixelsPerMeter);
        this.maxHeight = Math.max(this.maxHeight, this.currentHeight);
    }

    private ensureTemplateStreaming(): void {
        const requiredTop = this.guard.node.y + cc.winSize.height * 1.8;
        while (this.nextTemplateY < requiredTop) {
            this.createNextTemplate();
        }
        const removeBelow = this.guard.node.y - cc.winSize.height * 1.2;
        while (this.templates.length > 4 && this.templates[0].worldY + this.templates[0].config.height < removeBelow) {
            const old = this.templates.shift();
            if (old && old.node && old.node.isValid) {
                old.node.removeFromParent();
            }
        }
    }

    private getActivePlatforms(): BondChasePlatformRect[] {
        const result: BondChasePlatformRect[] = [];
        for (let i = 0; i < this.templates.length; i++) {
            const template = this.templates[i];
            for (let j = 0; j < template.platforms.length; j++) {
                const platform = template.platforms[j];
                result.push({
                    id: platform.id,
                    type: platform.type,
                    x: platform.x,
                    y: template.worldY + platform.y,
                    width: platform.width,
                    height: platform.height,
                });
            }
        }
        return result;
    }

    private getActorDistance(): number {
        if (!this.guard || !this.princess) {
            return 0;
        }
        return cc.v2(this.guard.node.x - this.princess.node.x, this.guard.node.y - this.princess.node.y).mag();
    }

    private fail(reason: string): void {
        if (this.failed) {
            return;
        }
        this.updateHeightStats();
        this.failed = true;
        // 新的一次失败重新开放失败页操作；上一次重试的锁只用于
        // 防止同一结算页被重复点击。
        this.retryInProgress = false;
        this.failReason = reason;
        this.running = false;
        this.inputX = 0;
        this.jumpRequested = false;
        this.setActorMotion(this.princess, false, 0);
        this.setActorMotion(this.guard, false, 0);
        const diamondReward = Math.min(100, Math.floor(Math.max(0, this.maxHeight) / 10));
        gameManager.lastEndlessHeight = Math.max(0, this.maxHeight);
        gameManager.lastResultDiamond = diamondReward;
        if (!this.endlessRewardGranted && mGameData) {
            this.endlessRewardGranted = true;
            mGameData.currentGold = Math.max(0, Number(mGameData.currentGold) || 0) + diamondReward;
            mGameData.SaveGoldData();
            cc.director.emit("goldUpdated");
        }
        if (this.showEndlessResultFrame(diamondReward)) {
            return;
        }
        if (this.failPanel && this.failPanel.isValid) {
            const reason = this.failPanel.getChildByName("Reason");
            const label = reason ? reason.getComponent(cc.Label) : null;
            if (label) {
                label.string = this.failReason + "\n最高高度 " + Math.floor(this.maxHeight) + "米";
            }
            this.failPanel.active = true;
        }
    }

    /** 显示无尽模式专用暂停页，沿用 Frame.prefab 的暂停视觉和按钮布局。 */
    private showEndlessStopFrame(): boolean {
        const prefab = ResUtils.getAsset<cc.Prefab>("subgame:prefab/Frame", cc.Prefab);
        if (!prefab) {
            return false;
        }
        this.destroyEndlessResultFrame();
        const frame = cc.instantiate(prefab);
        const resultWnd = frame && this.findChildByNormalizedName(frame, "ResultWnd");
        const panel = resultWnd && resultWnd.getChildByName("bg_stop");
        if (!resultWnd || !panel) {
            if (frame) {
                frame.destroy();
            }
            return false;
        }

        const container = new cc.Node("BondChaseStopFrame");
        container.setContentSize(cc.winSize);
        const mask = resultWnd.getChildByName("mask") || resultWnd.getChildByName("Mask");
        if (mask) {
            mask.removeFromParent(false);
            container.addChild(mask, 0);
        }
        panel.removeFromParent(false);
        container.addChild(panel, 1);
        this.node.addChild(container, 200);
        this.endlessFrameRoot = container;
        this.endlessResultPanel = panel;
        frame.destroy();

        panel.active = true;
        this.bindEndlessButton(panel, ["BtnGoing", "继续游戏"], () => {
            this.destroyEndlessResultFrame();
            this.running = true;
            this.installInputListeners();
        });
        this.bindEndlessButton(panel, ["BtnBack", "返回主界面"], () => {
            this.destroyEndlessResultFrame();
            const sceneName = String(this.mainMenuScene || "main").trim();
            if (sceneName) {
                cc.director.loadScene(sceneName);
            }
        });
        return true;
    }

    /** 优先显示 Frame.prefab 中由策划/美术编辑的无限模式结算页。 */
    private showEndlessResultFrame(diamondReward: number): boolean {
        const prefab = ResUtils.getAsset<cc.Prefab>("subgame:prefab/Frame", cc.Prefab);
        if (!prefab) {
            return false;
        }
        this.destroyEndlessResultFrame();
        const frame = cc.instantiate(prefab);
        if (!frame || !cc.isValid(frame)) {
            return false;
        }
        const resultWnd = this.findChildByNormalizedName(frame, "ResultWnd");
        const panel = resultWnd && (resultWnd.getChildByName("bg_bond_chase_lose")
            || resultWnd.getChildByName("bg_bondchase_lose")
            || resultWnd.getChildByName("bg_endless_lose"));
        if (!resultWnd || !panel) {
            frame.destroy();
            return false;
        }

        // 只取出预制体中的遮罩和无限结算页，避免在副玩法中启动完整 UIFrame 生命周期。
        const container = new cc.Node("BondChaseResultFrame");
        container.setContentSize(cc.winSize);
        container.setPosition(0, 0);
        const mask = resultWnd.getChildByName("mask") || resultWnd.getChildByName("Mask");
        if (mask) {
            mask.removeFromParent(false);
            container.addChild(mask, 0);
        }
        panel.removeFromParent(false);
        container.addChild(panel, 1);
        this.node.addChild(container, 200);
        this.endlessFrameRoot = container;
        frame.destroy();

        panel.active = true;
        this.endlessResultPanel = panel;

        this.setFirstLabel(panel, "盟约破碎", ["Title", "title"]);
        this.setFirstLabel(
            panel,
            this.failReason + "，最高高度" + Math.floor(this.maxHeight) + "米",
            ["High Number", "HighNumber"]
        );
        this.setFirstLabel(panel, this.failReason, ["Reason", "reason"]);
        this.setFirstLabel(panel, "最高高度 " + Math.floor(this.maxHeight) + "米", ["Height", "height"]);
        this.setRewardLabel(panel, String(diamondReward));

        this.bindEndlessButton(panel, ["Retry", "BtnGoing", "Restart", "重新挑战"], () => {
            this.retryAfterFailure();
        });
        this.bindEndlessButton(panel, ["BackToMenu", "BtnBack", "Back", "返回主界面"], () => {
            this.destroyEndlessResultFrame();
            const sceneName = String(this.mainMenuScene || "main").trim();
            if (sceneName) {
                cc.director.loadScene(sceneName);
            }
        });
        if (this.failPanel) {
            this.failPanel.active = false;
        }
        return true;
    }

    /**
     * 重新挑战按新局处理，必须先校验并扣除 1 点体力。
     * 返回 false 时调用方应保留失败结算页，避免无体力无限重开。
     */
    private consumeRetryStamina(): boolean {
        if (!mGameData || !mGameData.HasEnoughStamina()) {
            TipsManager.show("体力不足，无法重新挑战。");
            return false;
        }

        if (!mGameData.ConsumeStamina()) {
            TipsManager.show("体力不足，无法重新挑战。");
            return false;
        }

        return true;
    }

    /**
     * 失败页唯一的重新挑战入口。
     * 先扣除体力，再销毁结算页并开始新的一局；体力不足时保留失败页。
     */
    private retryAfterFailure(): void {
        if (this.retryInProgress) {
            return;
        }

        if (!this.consumeRetryStamina()) {
            return;
        }

        this.retryInProgress = true;
        if (this.failPanel && this.failPanel.isValid) {
            this.failPanel.active = false;
        }
        this.destroyEndlessResultFrame();
        this.restartMode();
    }

    private destroyEndlessResultFrame(): void {
        if (this.endlessFrameRoot && cc.isValid(this.endlessFrameRoot)) {
            this.endlessFrameRoot.destroy();
        }
        this.endlessFrameRoot = null;
        this.endlessResultPanel = null;
    }

    private findChildByNormalizedName(root: cc.Node, name: string): cc.Node {
        if (!root) {
            return null;
        }
        const normalize = (value: string) => String(value || "").replace(/\s/g, "").toLowerCase();
        if (normalize(root.name) === normalize(name)) {
            return root;
        }
        for (let i = 0; i < root.childrenCount; i++) {
            const found = this.findChildByNormalizedName(root.children[i], name);
            if (found) {
                return found;
            }
        }
        return null;
    }

    private setFirstLabel(root: cc.Node, value: string, names: string[]): void {
        for (let i = 0; i < names.length; i++) {
            const node = this.findChildByNormalizedName(root, names[i]);
            const label = node && node.getComponent(cc.Label);
            if (label) {
                label.string = value;
                return;
            }
        }
    }

    private setRewardLabel(root: cc.Node, value: string): void {
        const reward = this.findChildByNormalizedName(root, "showReward") || this.findChildByNormalizedName(root, "reward");
        if (!reward) {
            return;
        }
        const numberNode = this.findChildByNormalizedName(reward, "Number") || this.findChildByNormalizedName(reward, "number");
        const label = numberNode && numberNode.getComponent(cc.Label);
        if (label) {
            label.string = value;
        }
    }

    private bindEndlessButton(root: cc.Node, names: string[], callback: () => void): void {
        for (let i = 0; i < names.length; i++) {
            const node = this.findChildByNormalizedName(root, names[i]);
            if (!node) {
                continue;
            }
            this.bindButtonCallback(node, callback);
            return;
        }
    }

    /**
     * 绑定动态结算按钮。
     *
     * Frame.prefab 的按钮已经由 cc.Button 注册了 TOUCH_END 监听，不能用
     * `node.off(TOUCH_END)` 清空整类事件，否则会破坏 Button 自己的 click
     * 触发链路。优先监听 Button 的 click，非 Button 节点才回退到触摸事件。
     */
    private bindButtonCallback(node: cc.Node, callback: () => void): void {
        if (!node || !cc.isValid(node)) {
            return;
        }

        // 只移除本控制器之前绑定的监听，保留 cc.Button 的内部监听。
        node.targetOff(this);
        const button = node.getComponent(cc.Button);
        if (button) {
            button.enabled = true;
            button.interactable = true;
            node.on("click", callback, this);
            return;
        }

        node.on(cc.Node.EventType.TOUCH_END, callback, this);
    }

    private installInputListeners(): void {
        this.removeInputListeners();
        cc.systemEvent.on(cc.SystemEvent.EventType.KEY_DOWN, this.onKeyDown, this);
        cc.systemEvent.on(cc.SystemEvent.EventType.KEY_UP, this.onKeyUp, this);
    }

    private removeInputListeners(): void {
        cc.systemEvent.off(cc.SystemEvent.EventType.KEY_DOWN, this.onKeyDown, this);
        cc.systemEvent.off(cc.SystemEvent.EventType.KEY_UP, this.onKeyUp, this);
    }

    private onKeyDown(event: cc.Event.EventKeyboard): void {
        if (event.keyCode === cc.macro.KEY.r) {
            // 运行中的 R 仍保留调试重开；失败状态下等同于“重新挑战”，
            // 必须走统一的体力扣除入口，避免键盘绕过付费规则。
            if (this.failed) {
                this.retryAfterFailure();
            } else {
                this.restartMode(false);
            }
            return;
        }
        switch (event.keyCode) {
            case cc.macro.KEY.a:
            case cc.macro.KEY.left:
                this.keyLeft = true;
                break;
            case cc.macro.KEY.d:
            case cc.macro.KEY.right:
                this.keyRight = true;
                break;
            case cc.macro.KEY.w:
            case cc.macro.KEY.up:
            case cc.macro.KEY.space:
                if (!this.keyJump) {
                    this.jumpRequested = true;
                }
                this.keyJump = true;
                break;
            default:
                break;
        }
        this.inputX = this.keyLeft === this.keyRight ? 0 : this.keyLeft ? -1 : 1;
    }

    private onKeyUp(event: cc.Event.EventKeyboard): void {
        switch (event.keyCode) {
            case cc.macro.KEY.a:
            case cc.macro.KEY.left:
                this.keyLeft = false;
                break;
            case cc.macro.KEY.d:
            case cc.macro.KEY.right:
                this.keyRight = false;
                break;
            case cc.macro.KEY.w:
            case cc.macro.KEY.up:
            case cc.macro.KEY.space:
                this.keyJump = false;
                break;
            default:
                break;
        }
        this.inputX = this.keyLeft === this.keyRight ? 0 : this.keyLeft ? -1 : 1;
    }
}
