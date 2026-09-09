import MasterGlobal from "../../common/MasterGlobal";
import UIMng from "../../common/manager/UIMng";
import ResUtils from "../../common/utils/ResUtils";
import UIResultWnd, { ResultWndState } from "../../gameframe/logic/ui/game/UIResultWnd";
import UIFrame from "../../gameframe/logic/ui/prefab/UIFrame";
import mGameData from "../../../Scripts/Data/GameData";
import TipsManager from "../../../Scripts/Manager/TipsManager";
import { gameManager } from "./manager/gamemanager";

const { ccclass } = cc._decorator;

type StoneType = "solid" | "fragile" | "dichi";

interface CharacterConfig {
    char_id: string;
    name: string;
    speed: number;
    jump_impulse_y: number;
    jump_impulse_x: number;
    jumpDistance?: number;
    jumpHeight?: number;
    jumpParameter?: number;
}

interface StoneConfig {
    stone_id: string;
    type: StoneType | string;
    x: number;
    y: number;
    width: number;
    height: number;
    res?: string;
    stageIndex?: number;
}

interface StarConfig {
    x: number;
    y: number;
}

interface LevelConfig {
    level_id: string;
    win_y_threshold: number;
    start_stage?: number;
    speed?: number;
    star_spawns: StarConfig[];
    finish_spawns?: StarConfig[];
    stones: StoneConfig[];
}

interface StageTableConfig {
    id: string | number;
    res: string;
    type?: string;
    width?: number;
    height?: number;
}

interface RuntimeCharacter {
    id: string;
    name: string;
    node: cc.Node;
    config: CharacterConfig;
    vx: number;
    vy: number;
    jumpBaseVx: number;
    jumpConvertTime: number;
    verticalDropLocked: boolean;
    onGround: boolean;
    radius: number;
    lastSafeStone: StoneConfig;
    supportStone: StoneConfig;
}

interface RuntimeStone {
    node: cc.Node;
    config: StoneConfig;
    broken: boolean;
    touchedTime: number;
}

interface ChainPullState {
    follower: RuntimeCharacter;
    stage: StoneConfig;
    start: cc.Vec2;
    target: cc.Vec2;
    elapsed: number;
    duration: number;
    arcHeight: number;
}

@ccclass
export default class YSMYBattle extends cc.Component {
    private static readonly RESULT_ENABLED = true;
    private static readonly WORLD_WIDTH = 720;
    private static readonly WORLD_HEIGHT = 1800;
    private static readonly GRAVITY = -1200;
    private static readonly GROUND_EPS = 18;
    private static readonly STAGE_SIDE_EPS = 1;
    private static readonly STAGE_STEP_DOWN_HEIGHT = 90;
    private static readonly METER_TO_PIXEL = 12;
    private static readonly JUMP_DIR_BUFFER = 0.24;
    private static readonly RECENT_DIR_BUFFER = 0.28;
    private static readonly AIR_CONTROL_BLEND = 12;
    private static readonly HERO_ANIM_MOVE_EPS = 8;
    private static readonly MASK_FOOT_SUBMERGE = 46;
    private static readonly CAMERA_BOTTOM_SAFE_MARGIN = 340;
    private static readonly CAMERA_MAX_DOWN_Y = 320;
    private static readonly CAMERA_STAGE_VISIBLE_PADDING = 28;
    private static readonly SHOW_STAGE_COLLISION_DEBUG = false;
    private static readonly HERO_FOOT_SUPPORT_HALF_WIDTH = 8;
    private static readonly HERO_WALK_SUPPORT_HALF_WIDTH = 30;
    private running: boolean = false;
    private level: number = 1;
    private maxChainDistance: number = 15 * YSMYBattle.METER_TO_PIXEL;
    private winY: number = 1320;

    private world: cc.Node = null;
    private hud: cc.Node = null;
    private worldGraphics: cc.Graphics = null;
    private stageCollisionGraphics: cc.Graphics = null;
    private startStageIndex: number = 1;
    private starLabel: cc.Label = null;
    private hero1PrefabNode: cc.Node = null;
    private hero2PrefabNode: cc.Node = null;
    private endPrefabNode: cc.Node = null;
    private maskNode: cc.Node = null;
    private maskSpeed: number = 0;
    private maskDelay: number = 3;
    private waterFreezeRemaining: number = 0;
    private waterFreezeButton: cc.Node = null;
    private cameraY: number = 0;
    private cameraFocusY: number = 0;

    private princess: RuntimeCharacter = null;
    private guard: RuntimeCharacter = null;
    private controlled: RuntimeCharacter = null;
    private stones: RuntimeStone[] = [];
    private stars: cc.Node[] = [];
    private hudStarNodes: cc.Node[] = [];
    private finishItems: cc.Node[] = [];
    private starCount: number = 0;
    private diamondRewardGranted: boolean = false;
    private totalStarCount: number = 0;
    private reviveUsed: boolean = false;
    private moveDir: number = 0;
    private jumpPressed: boolean = false;
    private jumpHeld: boolean = false;
    private jumpBufferTime: number = 0;
    private jumpWishDir: number = 0;
    private recentInputDir: number = 0;
    private recentInputTime: number = 999;
    private keyLeft: boolean = false;
    private keyRight: boolean = false;
    private keyJump: boolean = false;
    private safeStone: StoneConfig = null;
    private chainPullState: ChainPullState = null;

    public initBattle(level: number): void {
        this.level = Math.max(1, Number(level) || 1);
        cc.macro.ENABLE_MULTI_TOUCH = true;
        this.node.setContentSize(cc.winSize);
        this.node.setPosition(cc.winSize.width / 2, cc.winSize.height / 2);
        this.running = true;
        this.reviveUsed = false;
        this.starCount = 0;
        this.diamondRewardGranted = false;
        this.totalStarCount = 0;
        this.moveDir = 0;
        this.jumpPressed = false;
        this.jumpHeld = false;
        this.jumpBufferTime = 0;
        this.jumpWishDir = 0;
        this.recentInputDir = 0;
        this.recentInputTime = 999;
        this.keyLeft = false;
        this.keyRight = false;
        this.keyJump = false;
        this.safeStone = null;
        this.chainPullState = null;
        this.maskNode = null;
        this.maskSpeed = 0;
        this.maskDelay = 3;
        this.waterFreezeRemaining = 0;
        this.waterFreezeButton = null;
        this.cameraY = 0;
        this.cameraFocusY = 0;
        MasterGlobal.isPause = false;

        const config = this.createLevelConfig(this.level);
        this.maxChainDistance = this.getChainDistance(config.global_physics);
        this.winY = Number(config.level.win_y_threshold) || this.winY;
        this.startStageIndex = Math.max(1, Number(config.level.start_stage) || 1);
        this.maskSpeed = Math.max(0, Number(config.level.speed) || 0);

        this.createWorld();
        this.createStones(config.level.stones);
        this.createMaskBg();
        this.createStars(config.level.star_spawns);
        this.createFinishItems(config.level.finish_spawns || []);
        this.createCharacters(config.character_ctrl);
        this.createHud();
        this.updateCamera(true);
        this.updateChain();
        this.updateSelectionIcon();
        this.updateStarLabel();
    }

    public pauseBattle(): void {
        this.running = false;
    }

    public resumeBattle(): void {
        if (!gameManager.levelResultLocked) {
            this.running = true;
        }
    }

    public restartBattle(): void {
        this.initBattle(this.level);
    }

    public reviveBattle(): void {
        if (this.reviveUsed || !this.princess || !this.guard) {
            return;
        }

        this.reviveUsed = true;
        gameManager.levelResultLocked = false;
        gameManager.gameState = true;
        this.running = true;

        const safe = this.safeStone || this.findStageStone(this.startStageIndex) || this.findLowestSolidStone();
        const spawnPositions = this.getPairSpawnPositions(safe);
        this.setCharacterPosition(this.princess, spawnPositions.princess.x, spawnPositions.princess.y);
        this.setCharacterPosition(this.guard, spawnPositions.guard.x, spawnPositions.guard.y);
        this.setCharacterOnStage(this.princess, safe);
        this.setCharacterOnStage(this.guard, safe);
        this.chainPullState = null;

        this.updateCamera(true);
        this.updateChain();
        this.updateSelectionIcon();
    }

    public failBattle(): void {
        this.handleFail();
    }

    protected update(dt: number): void {
        if (!this.running || !this.princess || !this.guard) {
            return;
        }

        dt = Math.min(dt, 1 / 30);
        this.recentInputTime = Math.min(999, this.recentInputTime + dt);
        this.updateChainPullMovement(dt);
        if (!this.isCharacterPulling(this.princess)) {
            this.updateCharacter(this.princess, dt);
        }
        if (!this.isCharacterPulling(this.guard)) {
            this.updateCharacter(this.guard, dt);
        }
        this.applyChainPull(dt);
        this.updateCharacterAnimation(this.princess);
        this.updateCharacterAnimation(this.guard);
        this.updateCamera(false);
        this.updateMaskBg(dt);
        this.checkMaskHitCharacters();
        this.updateStars();
        this.updateFinishItems();
        this.updateChain();
        this.updateSelectionIcon();
        this.checkResult();
    }

    protected onDestroy(): void {
        this.running = false;
        this.node.off(cc.Node.EventType.TOUCH_END, this.onWorldTouch, this);
        cc.systemEvent.off(cc.SystemEvent.EventType.KEY_DOWN, this.onKeyDown, this);
        cc.systemEvent.off(cc.SystemEvent.EventType.KEY_UP, this.onKeyUp, this);
    }

    private createWorld(): void {
        const stageNode = this.node.getChildByName("StageNode") || this.node.getChildByName("Stage");
        let stageRoot = stageNode;
        if (!stageRoot) {
            stageRoot = new cc.Node("StageNode");
            this.node.addChild(stageRoot);
        }

        this.preservePrefabHeroNodes();
        stageRoot.removeAllChildren();
        this.world = new cc.Node("StageContent");
        this.world.setContentSize(YSMYBattle.WORLD_WIDTH, YSMYBattle.WORLD_HEIGHT);
        this.world.setAnchorPoint(0.5, 0);
        this.world.setPosition(0, 0);
        stageRoot.addChild(this.world);
        this.worldGraphics = this.world.addComponent(cc.Graphics);
        this.worldGraphics.clear();
        this.createStageCollisionDebugLayer();
        this.node.off(cc.Node.EventType.TOUCH_END, this.onWorldTouch, this);
        this.node.on(cc.Node.EventType.TOUCH_END, this.onWorldTouch, this);
        cc.systemEvent.off(cc.SystemEvent.EventType.KEY_DOWN, this.onKeyDown, this);
        cc.systemEvent.off(cc.SystemEvent.EventType.KEY_UP, this.onKeyUp, this);
        cc.systemEvent.on(cc.SystemEvent.EventType.KEY_DOWN, this.onKeyDown, this);
        cc.systemEvent.on(cc.SystemEvent.EventType.KEY_UP, this.onKeyUp, this);
    }

    private createStones(stoneConfigs: StoneConfig[]): void {
        this.stones = [];
        for (let i = 0; i < stoneConfigs.length; i++) {
            const cfg = this.normalizeStone(stoneConfigs[i]);
            const node = this.createStageNode(cfg);
            node.setPosition(cfg.x, cfg.y);
            this.world.addChild(node, cfg.type === "dichi" ? 5 : 1);
            this.stones.push({ node: node, config: cfg, broken: false, touchedTime: 0 });
            if (!this.safeStone && cfg.type === "solid") {
                this.safeStone = cfg;
            }
        }
        this.updateStageCollisionDebug();
    }

    private createStageCollisionDebugLayer(): void {
        this.stageCollisionGraphics = null;
        if (!YSMYBattle.SHOW_STAGE_COLLISION_DEBUG || !this.world) {
            return;
        }

        const debugNode = new cc.Node("StageCollisionDebug");
        debugNode.setContentSize(YSMYBattle.WORLD_WIDTH, YSMYBattle.WORLD_HEIGHT);
        debugNode.setAnchorPoint(0.5, 0);
        debugNode.setPosition(0, 0);
        this.world.addChild(debugNode, 30);
        this.stageCollisionGraphics = debugNode.addComponent(cc.Graphics);
    }

    private updateStageCollisionDebug(): void {
        if (!this.stageCollisionGraphics) {
            return;
        }

        const graphics = this.stageCollisionGraphics;
        graphics.clear();
        graphics.lineWidth = 4;
        graphics.strokeColor = cc.color(255, 0, 0, 255);
        graphics.fillColor = cc.color(255, 0, 0, 35);
        let hasRect = false;
        for (let i = 0; i < this.stones.length; i++) {
            const stone = this.stones[i];
            if (!stone || stone.broken) {
                continue;
            }

            const cfg = stone.config;
            const left = cfg.x - cfg.width / 2;
            const bottom = cfg.y - cfg.height / 2;
            graphics.rect(left, bottom, cfg.width, cfg.height);
            hasRect = true;
        }

        if (hasRect) {
            graphics.fill();
            graphics.stroke();
        }
    }

    private createStageNode(cfg: StoneConfig): cc.Node {
        const resName = cfg.res || "stage_1";
        const prefab = ResUtils.getAsset<cc.Prefab>("subgame:prefab/mapPrefab/stage/" + resName, cc.Prefab);
        let node: cc.Node = null;
        if (prefab) {
            node = cc.instantiate(prefab);
        } else {
            node = this.createStageSpriteNode("stage_" + cfg.stone_id, "subgame:ui_ysmy/stage/" + resName, cfg.width, cfg.height);
        }

        node.name = "stage_" + cfg.stone_id;
        const size = this.getStageNodeSize(node, cfg.width, cfg.height);
        cfg.width = size.width;
        cfg.height = size.height;
        return node;
    }

    private createStageSpriteNode(name: string, spriteUrl: string, fallbackWidth: number, fallbackHeight: number): cc.Node {
        const spriteFrame = ResUtils.getAsset<cc.SpriteFrame>(spriteUrl, cc.SpriteFrame);
        const size = this.getSpriteFrameSize(spriteFrame, fallbackWidth, fallbackHeight);
        const node = new cc.Node(name);
        node.setContentSize(size.width, size.height);
        if (spriteFrame) {
            const sprite = node.addComponent(cc.Sprite);
            sprite.spriteFrame = spriteFrame;
            sprite.sizeMode = cc.Sprite.SizeMode.RAW;
        } else {
            const graphics = node.addComponent(cc.Graphics);
            graphics.fillColor = cc.color(90, 90, 110, 220);
            graphics.fillRect(-size.width / 2, -size.height / 2, size.width, size.height);
        }
        return node;
    }

    private getStageNodeSize(node: cc.Node, fallbackWidth: number, fallbackHeight: number): cc.Size {
        const width = Number(node && node.width) || 0;
        const height = Number(node && node.height) || 0;
        if (width > 0 && height > 0) {
            return cc.size(width, height);
        }

        let minX = 0;
        let maxX = 0;
        let minY = 0;
        let maxY = 0;
        let hasBounds = false;
        if (node) {
            for (let i = 0; i < node.childrenCount; i++) {
                const child = node.children[i];
                const childWidth = Number(child.width) || 0;
                const childHeight = Number(child.height) || 0;
                if (childWidth <= 0 || childHeight <= 0) {
                    continue;
                }

                const left = child.x - childWidth * child.anchorX;
                const right = left + childWidth;
                const bottom = child.y - childHeight * child.anchorY;
                const top = bottom + childHeight;
                minX = hasBounds ? Math.min(minX, left) : left;
                maxX = hasBounds ? Math.max(maxX, right) : right;
                minY = hasBounds ? Math.min(minY, bottom) : bottom;
                maxY = hasBounds ? Math.max(maxY, top) : top;
                hasBounds = true;
            }
        }

        if (hasBounds) {
            return cc.size(Math.max(1, maxX - minX), Math.max(1, maxY - minY));
        }
        return cc.size(Math.max(1, fallbackWidth), Math.max(1, fallbackHeight));
    }

    private getSpriteFrameSize(spriteFrame: cc.SpriteFrame, fallbackWidth: number, fallbackHeight: number): cc.Size {
        if (spriteFrame) {
            const frame: any = spriteFrame as any;
            const originalSize = frame.getOriginalSize ? frame.getOriginalSize() : null;
            if (originalSize && originalSize.width > 0 && originalSize.height > 0) {
                return cc.size(originalSize.width, originalSize.height);
            }

            const rect = frame.getRect ? frame.getRect() : null;
            if (rect && rect.width > 0 && rect.height > 0) {
                return cc.size(rect.width, rect.height);
            }
        }
        return cc.size(Math.max(1, fallbackWidth), Math.max(1, fallbackHeight));
    }

    private getStageOriginalSize(resName: string, fallbackWidth: number, fallbackHeight: number): cc.Size {
        const prefab = ResUtils.getAsset<cc.Prefab>("subgame:prefab/mapPrefab/stage/" + resName, cc.Prefab);
        if (prefab) {
            const node = cc.instantiate(prefab);
            const size = this.getStageNodeSize(node, fallbackWidth, fallbackHeight);
            node.destroy();
            return size;
        }

        const frame = ResUtils.getAsset<cc.SpriteFrame>("subgame:ui_ysmy/stage/" + resName, cc.SpriteFrame);
        return this.getSpriteFrameSize(frame, fallbackWidth, fallbackHeight);
    }

    private createStars(starConfigs: StarConfig[]): void {
        this.stars = [];
        this.totalStarCount = starConfigs.length;
        for (let i = 0; i < starConfigs.length; i++) {
            const star = this.createSpriteNode("star" + (i + 1), "subgame:ui_ysmy/play/wujiaoxing1", 58, 58);
            star.setPosition(starConfigs[i].x, starConfigs[i].y);
            this.world.addChild(star, 6);
            this.stars.push(star);
        }
    }

    private createMaskBg(): void {
        let mask = this.maskNode && this.maskNode.isValid ? this.maskNode : this.findChildByName(this.node, "maskBg");
        if (!mask) {
            mask = new cc.Node("maskBg");
            mask.color = cc.color(0, 0, 0);
            mask.opacity = 190;
            mask.addComponent(cc.Graphics);
        }

        mask.active = true;
        const widget = mask.getComponent(cc.Widget);
        if (widget) {
            widget.enabled = false;
        }
        this.resizeMaskBg(mask);
        if (mask.parent !== this.node) {
            mask.removeFromParent(false);
            this.node.addChild(mask, 5);
        } else {
            mask.zIndex = 5;
        }

        mask.setAnchorPoint(0.5, 0.5);
        mask.setPosition(0, -1134.556);
        this.maskNode = mask;
    }

    private resizeMaskBg(mask: cc.Node): void {
        const width = Math.max(YSMYBattle.WORLD_WIDTH, cc.winSize.width);
        const height = Math.max(96, Number(mask.height) || 0);
        mask.setContentSize(width, height);

        const graphics = mask.getComponent(cc.Graphics);
        if (graphics) {
            graphics.clear();
            graphics.fillColor = cc.color(0, 0, 0, 190);
            graphics.fillRect(-width / 2, -height / 2, width, height);
        }
    }

    private createFinishItems(configs: StarConfig[]): void {
        this.finishItems = [];
        const item = this.getPrefabEndNode();
        if (!item) {
            if (configs.length > 0) {
                cc.error("YSMYBattle missing prefab end node");
            }
            return;
        }

        if (configs.length <= 0) {
            item.active = false;
            return;
        }

        item.active = true;
        item.opacity = 255;
        if (item.parent !== this.world) {
            item.removeFromParent(false);
            this.world.addChild(item, 6);
        } else {
            item.zIndex = 6;
        }

        const pos = configs[0];
        item.setPosition(pos.x, pos.y + item.height / 2);
        this.finishItems.push(item);
    }

    private createCharacters(configs: CharacterConfig[]): void {
        const princessConfig = this.findCharacterConfig(configs, "H_001");
        const guardConfig = this.findCharacterConfig(configs, "G_001");
        const spawn = this.findStageStone(this.startStageIndex) || this.safeStone || this.findLowestSolidStone();
        const spawnPositions = this.getPairSpawnPositions(spawn);
        this.princess = this.createCharacter("H_001", "hero1", princessConfig, spawnPositions.princess.x, spawnPositions.princess.y);
        this.guard = this.createCharacter("G_001", "hero2", guardConfig, spawnPositions.guard.x, spawnPositions.guard.y);
        this.controlled = this.guard;
        this.setCharacterOnStage(this.princess, spawn);
        this.setCharacterOnStage(this.guard, spawn);

        if (this.princess) {
            this.princess.node.on(cc.Node.EventType.TOUCH_END, () => this.switchControl(this.princess), this);
        }
        if (this.guard) {
            this.guard.node.on(cc.Node.EventType.TOUCH_END, () => this.switchControl(this.guard), this);
        }
    }

    private createCharacter(id: string, name: string, cfg: CharacterConfig, x: number, y: number): RuntimeCharacter {
        const node = this.getPrefabHeroNode(name);
        if (!node) {
            cc.error("YSMYBattle missing prefab hero node:", name);
            return null;
        }

        node.off(cc.Node.EventType.TOUCH_END);
        node.opacity = 255;
        node.active = true;
        if (node.parent !== this.world) {
            node.removeFromParent(false);
            this.world.addChild(node, 10);
        } else {
            node.zIndex = 10;
        }
        node.setPosition(x, y);
        this.initCharacterAnimation(node, name);
        const character = {
            id: id,
            name: name,
            node: node,
            config: cfg,
            vx: 0,
            vy: 0,
            jumpBaseVx: 0,
            jumpConvertTime: 0,
            verticalDropLocked: false,
            onGround: false,
            radius: id === "G_001" ? 46 : 40,
            lastSafeStone: this.safeStone,
            supportStone: null,
        };
        this.updateCharacterAnimation(character);
        return character;
    }

    private initCharacterAnimation(node: cc.Node, heroName: string): void {
        if (!node || !node.isValid) {
            return;
        }

        const sprite = node.getComponent(cc.Sprite);
        if (sprite) {
            sprite.enabled = true;
        }

        const idleName = `${heroName}_idle`;
        const animation = node.getComponent(cc.Animation);
        (node as any).__baseScaleX = Math.abs(node.scaleX || 1);
        (node as any).__currentHeroAnim = "";
        if (!animation) {
            cc.warn("YSMYBattle missing hero Animation component:", heroName);
            return;
        }

        this.playCharacterAnimation(node, idleName);
    }

    private updateCharacterAnimation(ch: RuntimeCharacter): void {
        if (!ch || !ch.node || !ch.node.isValid) {
            return;
        }

        const moving = Math.abs(ch.vx) > YSMYBattle.HERO_ANIM_MOVE_EPS;
        const clipName = `${ch.name}_${moving ? "run" : "idle"}`;
        if (moving) {
            const baseScaleX = Math.abs((ch.node as any).__baseScaleX || ch.node.scaleX || 1);
            ch.node.scaleX = ch.vx >= 0 ? baseScaleX : -baseScaleX;
        }

        this.playCharacterAnimation(ch.node, clipName);
    }

    private playCharacterAnimation(node: cc.Node, clipName: string): void {
        if (!node || !node.isValid) {
            return;
        }

        if ((node as any).__currentHeroAnim === clipName) {
            return;
        }

        const animation = node.getComponent(cc.Animation);
        if (!animation) {
            return;
        }

        const hasClip = animation.getClips().some((clip: cc.AnimationClip) => clip && clip.name === clipName);
        if (!hasClip) {
            return;
        }

        animation.play(clipName);
        (node as any).__currentHeroAnim = clipName;
    }

    private preservePrefabHeroNodes(): void {
        this.hero1PrefabNode = this.hero1PrefabNode && this.hero1PrefabNode.isValid
            ? this.hero1PrefabNode
            : this.findChildByName(this.node, "hero1");
        this.hero2PrefabNode = this.hero2PrefabNode && this.hero2PrefabNode.isValid
            ? this.hero2PrefabNode
            : this.findChildByName(this.node, "hero2");
        this.endPrefabNode = this.endPrefabNode && this.endPrefabNode.isValid
            ? this.endPrefabNode
            : this.findChildByName(this.node, "end");
        this.maskNode = this.maskNode && this.maskNode.isValid
            ? this.maskNode
            : this.findChildByName(this.node, "maskBg");

        if (this.hero1PrefabNode && this.hero1PrefabNode.isValid && this.hero1PrefabNode.parent) {
            this.hero1PrefabNode.removeFromParent(false);
        }
        if (this.hero2PrefabNode && this.hero2PrefabNode.isValid && this.hero2PrefabNode.parent) {
            this.hero2PrefabNode.removeFromParent(false);
        }
        if (this.endPrefabNode && this.endPrefabNode.isValid && this.endPrefabNode.parent) {
            this.endPrefabNode.removeFromParent(false);
        }
        if (this.maskNode && this.maskNode.isValid && this.maskNode.parent) {
            this.maskNode.removeFromParent(false);
        }
    }

    private getPrefabHeroNode(name: string): cc.Node {
        if (name === "hero1") {
            return this.hero1PrefabNode && this.hero1PrefabNode.isValid
                ? this.hero1PrefabNode
                : this.findChildByName(this.node, "hero1");
        }
        if (name === "hero2") {
            return this.hero2PrefabNode && this.hero2PrefabNode.isValid
                ? this.hero2PrefabNode
                : this.findChildByName(this.node, "hero2");
        }
        return null;
    }

    private getPrefabEndNode(): cc.Node {
        return this.endPrefabNode && this.endPrefabNode.isValid
            ? this.endPrefabNode
            : this.findChildByName(this.node, "end");
    }

    private getPairSpawnPositions(stage: StoneConfig): { princess: cc.Vec2, guard: cc.Vec2 } {
        const centerX = stage ? stage.x : 0;
        const top = stage ? stage.y + stage.height / 2 : 0;
        const halfWidth = stage ? stage.width / 2 : 120;
        const princessRadius = this.getNodeBottomOffset(this.getPrefabHeroNode("hero1"), 40);
        const guardRadius = this.getNodeBottomOffset(this.getPrefabHeroNode("hero2"), 46);
        const margin = 10;
        const maxOffset = Math.max(18, halfWidth - Math.max(princessRadius, guardRadius) - margin);
        const offset = Math.min(48, maxOffset);
        return {
            princess: cc.v2(centerX - offset, top + princessRadius),
            guard: cc.v2(centerX + offset, top + guardRadius),
        };
    }

    private createHud(): void {
        this.hud = this.node;

        const stopBtn = this.findChildByName(this.node, "StopBtn");
        if (stopBtn) {
            stopBtn.off(cc.Node.EventType.TOUCH_END);
            stopBtn.on(cc.Node.EventType.TOUCH_END, () => {
                this.pauseBattle();
                this.showResult(ResultWndState.Stop);
            }, this);
        } else {
            this.createText("pause", "II", 42, cc.v2(-cc.winSize.width / 2 + 56, cc.winSize.height / 2 - 54), this.hud).on(cc.Node.EventType.TOUCH_END, () => {
                this.pauseBattle();
                this.showResult(ResultWndState.Stop);
            }, this);
        }

        const progress = this.findChildByName(this.node, "progress");
        if (progress) {
            progress.active = true;
            this.starLabel = progress.getComponent(cc.Label);
        }

        const oldChainWarn = this.findChildByName(this.node, "chain_warn");
        if (oldChainWarn && oldChainWarn.isValid) {
            oldChainWarn.destroy();
        }
        this.setupHudStars();

        const leftBtn = this.findChildByName(this.node, "BtnLeft");
        const jumpBtn = this.findChildByName(this.node, "BtnJump");
        const rightBtn = this.findChildByName(this.node, "BtnRight");
        const bottomRoot = this.findChildByName(this.node, "buttom") || this.findChildByName(this.node, "bottom");
        if (bottomRoot) {
            bottomRoot.zIndex = 30;
        }
        if (leftBtn && jumpBtn && rightBtn) {
            leftBtn.zIndex = 1;
            jumpBtn.zIndex = 1;
            rightBtn.zIndex = 1;
            this.bindControlButton(leftBtn, () => this.setTouchMove(-1), () => this.clearTouchMove(-1));
            this.bindControlButton(jumpBtn, () => this.setJumpPressed(true), () => this.setJumpPressed(false));
            this.bindControlButton(rightBtn, () => this.setTouchMove(1), () => this.clearTouchMove(1));
        } else {
            this.createControlButton("left_btn", "<", cc.v2(-220, -cc.winSize.height / 2 + 76), () => this.setTouchMove(-1), () => this.clearTouchMove(-1));
            this.createControlButton("jump_btn", "跳跃", cc.v2(0, -cc.winSize.height / 2 + 76), () => this.setJumpPressed(true), () => this.setJumpPressed(false));
            this.createControlButton("right_btn", ">", cc.v2(220, -cc.winSize.height / 2 + 76), () => this.setTouchMove(1), () => this.clearTouchMove(1));
        }

        this.createWaterFreezeButton();

        this.updateSelectionIcon();
    }

    private createWaterFreezeButton(): void {
        const button = this.findChildByName(this.node, "WaterFreezeBtn");
        if (!button || !button.isValid) {
            cc.warn("YSMYBattle: WaterFreezeBtn prefab node not found.");
            return;
        }
        button.zIndex = 35;
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
        const labelNode = this.findChildByName(this.waterFreezeButton, "WaterFreezeLabel");
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

    private bindControlButton(btn: cc.Node, down: () => void, up: () => void): void {
        btn.off(cc.Node.EventType.TOUCH_START);
        btn.off(cc.Node.EventType.TOUCH_END);
        btn.off(cc.Node.EventType.TOUCH_CANCEL);
        btn.on(cc.Node.EventType.TOUCH_START, (event: cc.Event.EventTouch) => {
            event.stopPropagation();
            down();
        }, this);
        btn.on(cc.Node.EventType.TOUCH_END, (event: cc.Event.EventTouch) => {
            event.stopPropagation();
            up();
        }, this);
        btn.on(cc.Node.EventType.TOUCH_CANCEL, (event: cc.Event.EventTouch) => {
            event.stopPropagation();
            up();
        }, this);
    }

    private createControlButton(name: string, text: string, pos: cc.Vec2, down: () => void, up: () => void): void {
        const btn = this.createSpriteNode(name, "subgame:ui_ysmy/control_button", text === "跳跃" ? 170 : 128, 82);
        btn.setPosition(pos);
        this.hud.addChild(btn, 5);
        this.createText(name + "_label", text, 28, cc.v2(0, 0), btn);
        btn.on(cc.Node.EventType.TOUCH_START, (event: cc.Event.EventTouch) => {
            event.stopPropagation();
            down();
        }, this);
        btn.on(cc.Node.EventType.TOUCH_END, (event: cc.Event.EventTouch) => {
            event.stopPropagation();
            up();
        }, this);
        btn.on(cc.Node.EventType.TOUCH_CANCEL, (event: cc.Event.EventTouch) => {
            event.stopPropagation();
            up();
        }, this);
    }

    private setTouchMove(dir: number): void {
        if (!this.controlled) {
            return;
        }
        this.moveDir = dir;
        this.recordInputDir(dir);
        if (this.jumpPressed || this.jumpHeld) {
            this.jumpWishDir = dir;
        }
    }

    private clearTouchMove(dir: number): void {
        if (this.moveDir === dir) {
            this.moveDir = 0;
        }
    }

    private setJumpPressed(pressed: boolean): void {
        if (pressed) {
            this.jumpHeld = !!this.controlled;
            this.jumpPressed = !!this.controlled;
            this.jumpBufferTime = this.jumpPressed ? YSMYBattle.JUMP_DIR_BUFFER : 0;
            this.jumpWishDir = this.jumpPressed ? this.getBufferedInputDir() : 0;
            return;
        }

        this.jumpHeld = false;
        const keepQueuedJump = this.jumpPressed
            && this.jumpBufferTime > 0
            && !!this.controlled
            && this.controlled.onGround;
        if (keepQueuedJump) {
            return;
        }

        this.jumpPressed = false;
        this.jumpBufferTime = 0;
        this.jumpWishDir = 0;
    }

    private getCurrentInputDir(): number {
        const keyDir = (this.keyLeft ? -1 : 0) + (this.keyRight ? 1 : 0);
        return keyDir !== 0 ? keyDir : this.moveDir;
    }

    private getBufferedInputDir(): number {
        const dir = this.getCurrentInputDir();
        if (dir !== 0) {
            return dir;
        }
        return this.recentInputTime <= YSMYBattle.RECENT_DIR_BUFFER ? this.recentInputDir : 0;
    }

    private recordInputDir(dir: number): void {
        if (dir === 0) {
            return;
        }
        this.recentInputDir = dir;
        this.recentInputTime = 0;
    }

    private updateCharacter(ch: RuntimeCharacter, dt: number): void {
        const isControlled = ch === this.controlled;
        if (isControlled) {
            const inputDir = this.getCurrentInputDir();
            if (this.jumpPressed && this.jumpWishDir === 0) {
                this.jumpWishDir = this.getBufferedInputDir();
            }
            const dir = inputDir !== 0 ? inputDir : this.jumpWishDir;
            if (this.jumpPressed && this.jumpBufferTime > 0 && dir === 0 && ch.onGround) {
                this.jumpBufferTime = Math.max(0, this.jumpBufferTime - dt);
                ch.vx = 0;
            } else if (this.jumpPressed && ch.onGround) {
                const isParabolaJump = dir !== 0;
                ch.vy = this.getJumpSpeed(ch, isParabolaJump);
                ch.vx = isParabolaJump ? dir * this.getJumpHorizontalSpeed(ch) : 0;
                ch.jumpBaseVx = ch.vx;
                ch.jumpConvertTime = isParabolaJump ? 0 : 0.16;
                ch.verticalDropLocked = false;
                ch.onGround = false;
                this.jumpPressed = false;
                this.jumpBufferTime = 0;
                this.jumpWishDir = 0;
            } else if (ch.onGround) {
                ch.vx = dir * this.getMoveSpeed(ch);
                ch.jumpBaseVx = 0;
                ch.jumpConvertTime = 0;
                ch.verticalDropLocked = false;
            } else if (dir !== 0) {
                if (ch.jumpBaseVx === 0 && ch.vy > 0 && (ch.jumpConvertTime > 0 || this.jumpHeld)) {
                    ch.jumpBaseVx = dir * this.getJumpHorizontalSpeed(ch);
                    ch.jumpConvertTime = 0;
                }
                const targetVx = ch.jumpBaseVx + dir * this.getAirControlSpeed(ch);
                const blend = Math.min(1, dt * YSMYBattle.AIR_CONTROL_BLEND);
                ch.vx += (targetVx - ch.vx) * blend;
            }
        } else {
            ch.vx *= 0.92;
        }

        if (ch.verticalDropLocked && !ch.onGround) {
            ch.vx = 0;
            ch.jumpBaseVx = 0;
            ch.jumpConvertTime = 0;
        }

        const groundSupport = ch.onGround ? ch.supportStone : null;
        const horizontalLimit = YSMYBattle.WORLD_WIDTH / 2 + ch.radius;
        const oldX = ch.node.x;
        ch.node.x = Math.max(-horizontalLimit, Math.min(horizontalLimit, ch.node.x + ch.vx * dt));
        this.resolveHorizontalStageHit(ch, oldX);
        const walkSupport = groundSupport ? this.findWalkableSupportStage(ch, groundSupport) : null;
        if (walkSupport) {
            ch.node.y = walkSupport.y + walkSupport.height / 2 + this.getCharacterBottomOffset(ch);
            ch.vy = 0;
            ch.verticalDropLocked = false;
            ch.onGround = true;
            ch.supportStone = walkSupport;
            if (walkSupport.type === "solid") {
                this.safeStone = walkSupport;
                ch.lastSafeStone = walkSupport;
            }
            return;
        }

        ch.onGround = false;
        if (!ch.onGround && ch.jumpConvertTime > 0) {
            ch.jumpConvertTime = Math.max(0, ch.jumpConvertTime - dt);
        }

        ch.vy += YSMYBattle.GRAVITY * dt;
        if (ch.vy < -900) {
            ch.vy = -900;
        }

        const oldY = ch.node.y;
        ch.node.y += ch.vy * dt;
        this.resolveAscendingStageHit(ch, oldY);
        this.resolvePlatform(ch, oldY);
        this.resolveHorizontalStageHit(ch, oldX);
    }

    private isCharacterOnStone(ch: RuntimeCharacter, cfg: StoneConfig): boolean {
        if (!ch || !cfg) {
            return false;
        }

        return this.isCharacterFootOverStageX(ch, cfg);
    }

    private findWalkableSupportStage(ch: RuntimeCharacter, current: StoneConfig): StoneConfig {
        if (!ch || !ch.node || !ch.node.isValid) {
            return null;
        }

        const footY = ch.node.y - this.getCharacterBottomOffset(ch);
        let best: StoneConfig = null;
        let bestTop = -Number.MAX_VALUE;
        for (let i = 0; i < this.stones.length; i++) {
            const stone = this.stones[i];
            if (!stone || stone.broken) {
                continue;
            }

            const cfg = stone.config;
            const inX = cfg === current
                ? this.isCharacterFootOverStageX(ch, cfg)
                : this.isCharacterWalkSupportOverStageX(ch, cfg);
            if (!inX) {
                continue;
            }

            const top = cfg.y + cfg.height / 2;
            const stepDownLimit = cfg === current ? YSMYBattle.GROUND_EPS : YSMYBattle.STAGE_STEP_DOWN_HEIGHT;
            const canStand = top <= footY + YSMYBattle.GROUND_EPS
                && footY - top <= stepDownLimit;
            if (!canStand || top <= bestTop) {
                continue;
            }

            best = cfg;
            bestTop = top;
        }

        return best;
    }

    private isCharacterWalkSupportOverStageX(ch: RuntimeCharacter, cfg: StoneConfig): boolean {
        if (!ch || !cfg) {
            return false;
        }

        const stageLeft = cfg.x - cfg.width / 2;
        const stageRight = cfg.x + cfg.width / 2;
        const halfWidth = YSMYBattle.HERO_WALK_SUPPORT_HALF_WIDTH;
        const footLeft = ch.node.x - halfWidth;
        const footRight = ch.node.x + halfWidth;
        return footRight >= stageLeft && footLeft <= stageRight;
    }

    private getCharacterTopOffset(ch: RuntimeCharacter): number {
        if (!ch || !ch.node || !ch.node.isValid) {
            return ch ? ch.radius : 0;
        }

        return Math.max(ch.radius, this.getNodeTopOffset(ch.node, ch.radius));
    }

    private getCharacterBottomOffset(ch: RuntimeCharacter): number {
        if (!ch || !ch.node || !ch.node.isValid) {
            return ch ? ch.radius : 0;
        }

        return Math.max(ch.radius, this.getNodeBottomOffset(ch.node, ch.radius));
    }

    private getCharacterLeftOffset(ch: RuntimeCharacter): number {
        if (!ch || !ch.node || !ch.node.isValid) {
            return ch ? ch.radius : 0;
        }

        return Math.max(ch.radius * 0.5, Math.abs(ch.node.width * ch.node.scaleX) * ch.node.anchorX);
    }

    private getCharacterRightOffset(ch: RuntimeCharacter): number {
        if (!ch || !ch.node || !ch.node.isValid) {
            return ch ? ch.radius : 0;
        }

        return Math.max(ch.radius * 0.5, Math.abs(ch.node.width * ch.node.scaleX) * (1 - ch.node.anchorX));
    }

    private isCharacterOverStageX(ch: RuntimeCharacter, cfg: StoneConfig): boolean {
        if (!ch || !cfg) {
            return false;
        }

        const stageLeft = cfg.x - cfg.width / 2;
        const stageRight = cfg.x + cfg.width / 2;
        const charLeft = ch.node.x - this.getCharacterLeftOffset(ch);
        const charRight = ch.node.x + this.getCharacterRightOffset(ch);
        return charRight >= stageLeft && charLeft <= stageRight;
    }

    private isCharacterFootOverStageX(ch: RuntimeCharacter, cfg: StoneConfig): boolean {
        if (!ch || !cfg) {
            return false;
        }

        const stageLeft = cfg.x - cfg.width / 2;
        const stageRight = cfg.x + cfg.width / 2;
        const halfWidth = YSMYBattle.HERO_FOOT_SUPPORT_HALF_WIDTH;
        const footLeft = ch.node.x - halfWidth;
        const footRight = ch.node.x + halfWidth;
        return footRight >= stageLeft && footLeft <= stageRight;
    }

    private isCharacterOverlappingStageY(ch: RuntimeCharacter, cfg: StoneConfig): boolean {
        if (!ch || !cfg) {
            return false;
        }

        const stageBottom = cfg.y - cfg.height / 2;
        const stageTop = cfg.y + cfg.height / 2;
        const charBottom = ch.node.y - this.getCharacterBottomOffset(ch);
        const charTop = ch.node.y + this.getCharacterTopOffset(ch);
        return charTop > stageBottom + YSMYBattle.STAGE_SIDE_EPS
            && charBottom < stageTop - YSMYBattle.STAGE_SIDE_EPS;
    }

    private resolveHorizontalStageHit(ch: RuntimeCharacter, oldX: number): void {
        if (!ch || !ch.node || !ch.node.isValid) {
            return;
        }

        const leftOffset = this.getCharacterLeftOffset(ch);
        const rightOffset = this.getCharacterRightOffset(ch);
        const movedX = ch.node.x - oldX;
        if (Math.abs(movedX) <= 0.001) {
            return;
        }

        for (let i = 0; i < this.stones.length; i++) {
            const stone = this.stones[i];
            if (!stone || stone.broken) {
                continue;
            }

            const cfg = stone.config;
            if (cfg === ch.supportStone) {
                continue;
            }

            if (!this.isCharacterOverlappingStageY(ch, cfg)) {
                continue;
            }

            const stageLeft = cfg.x - cfg.width / 2;
            const stageRight = cfg.x + cfg.width / 2;
            const charLeft = ch.node.x - leftOffset;
            const charRight = ch.node.x + rightOffset;
            if (charRight <= stageLeft || charLeft >= stageRight) {
                continue;
            }

            const oldLeft = oldX - leftOffset;
            const oldRight = oldX + rightOffset;
            if (movedX > 0 && oldRight <= stageLeft + YSMYBattle.STAGE_SIDE_EPS) {
                ch.node.x = stageLeft - rightOffset - YSMYBattle.STAGE_SIDE_EPS;
            } else if (movedX < 0 && oldLeft >= stageRight - YSMYBattle.STAGE_SIDE_EPS) {
                ch.node.x = stageRight + leftOffset + YSMYBattle.STAGE_SIDE_EPS;
            } else {
                continue;
            }

            ch.vx = 0;
            ch.jumpBaseVx = 0;
            ch.jumpConvertTime = 0;
            return;
        }
    }

    private getNodeTopOffset(node: cc.Node, fallback: number): number {
        if (!node || !node.isValid) {
            return fallback;
        }

        return Math.abs(node.height * node.scaleY) * (1 - node.anchorY);
    }

    private getNodeBottomOffset(node: cc.Node, fallback: number): number {
        if (!node || !node.isValid) {
            return fallback;
        }

        return Math.abs(node.height * node.scaleY) * node.anchorY;
    }

    private resolveAscendingStageHit(ch: RuntimeCharacter, oldY: number): void {
        if (ch.vy <= 0) {
            return;
        }

        const topOffset = this.getCharacterTopOffset(ch);
        const oldTop = oldY + topOffset;
        const newTop = ch.node.y + topOffset;
        for (let i = 0; i < this.stones.length; i++) {
            const stone = this.stones[i];
            if (stone.broken) {
                continue;
            }

            const cfg = stone.config;
            const bottom = cfg.y - cfg.height / 2;
            const inX = this.isCharacterOverStageX(ch, cfg);
            const hitBeforeApex = oldTop <= bottom + YSMYBattle.GROUND_EPS && newTop >= bottom - YSMYBattle.GROUND_EPS;
            if (!inX || !hitBeforeApex) {
                continue;
            }

            ch.node.y = bottom - topOffset - 1;
            ch.vy = 0;
            ch.vx = 0;
            ch.jumpBaseVx = 0;
            ch.jumpConvertTime = 0;
            ch.verticalDropLocked = true;
            return;
        }
    }

    private resolvePlatform(ch: RuntimeCharacter, oldY: number): void {
        for (let i = 0; i < this.stones.length; i++) {
            const stone = this.stones[i];
            if (stone.broken) {
                continue;
            }

            const cfg = stone.config;
            const top = cfg.y + cfg.height / 2;
            const inX = this.isCharacterFootOverStageX(ch, cfg);
            const bottomOffset = this.getCharacterBottomOffset(ch);
            const fallingOnto = oldY - bottomOffset >= top - YSMYBattle.GROUND_EPS && ch.node.y - bottomOffset <= top + YSMYBattle.GROUND_EPS;
            if (!inX || !fallingOnto || ch.vy > 0) {
                continue;
            }

            if (cfg.type === "dichi" && ch.id === "H_001") {
                this.handleFail();
                return;
            }

            ch.node.y = top + bottomOffset;
            ch.vy = 0;
            ch.jumpBaseVx = 0;
            ch.jumpConvertTime = 0;
            ch.verticalDropLocked = false;
            ch.onGround = true;
            ch.supportStone = cfg;
            this.updateCameraFocusByStage(cfg);

            if (cfg.type === "solid") {
                this.safeStone = cfg;
                ch.lastSafeStone = cfg;
            }

            if (cfg.type === "fragile" && stone.touchedTime <= 0) {
                stone.touchedTime = 5;
                cc.tween(stone.node).delay(5).to(0.18, { opacity: 0 }).call(() => {
                    stone.broken = true;
                    stone.node.active = false;
                    this.updateStageCollisionDebug();
                }).start();
            }
            return;
        }
    }

    private applyChainPull(dt: number): void {
        const dist = this.getDistance(this.princess.node, this.guard.node);
        const limit = this.maxChainDistance;
        if (limit <= 0) {
            return;
        }
        if (dist <= limit) {
            return;
        }
        if (!this.controlled) {
            return;
        }
        if (this.chainPullState) {
            return;
        }

        const follower = this.controlled === this.princess ? this.guard : this.princess;
        const anchor = this.controlled;
        if (this.pullFollowerAlongStage(follower, anchor, dt)) {
            return;
        }
        if (this.pullFollowerToAnchorStage(follower, anchor)) {
            return;
        }

        const dir = cc.v2(anchor.node.x - follower.node.x, anchor.node.y - follower.node.y).normalize();
        const exceed = dist - limit;
        const pull = 800 + exceed * 20;
        follower.vx += dir.x * pull * dt;
        follower.vy += (dir.y * pull + 400) * dt;
        follower.verticalDropLocked = false;
        follower.onGround = false;

        if (dist > limit * 1.5) {
            follower.node.x += dir.x * exceed * 0.05;
            follower.node.y += dir.y * exceed * 0.05;
        }
    }

    private pullFollowerAlongStage(follower: RuntimeCharacter, anchor: RuntimeCharacter, dt: number): boolean {
        const stage = anchor && anchor.onGround ? anchor.supportStone : null;
        if (!stage || !follower || !follower.node || !follower.node.isValid) {
            return false;
        }

        const followerStage = follower.onGround && follower.supportStone ? follower.supportStone : this.findStageAtCharacterFoot(follower);
        if (!followerStage) {
            return false;
        }

        const stageTop = stage.y + stage.height / 2;
        const followerStageTop = followerStage.y + followerStage.height / 2;
        if (Math.abs(followerStageTop - stageTop) > YSMYBattle.GROUND_EPS) {
            return false;
        }

        const targetY = followerStageTop + this.getCharacterBottomOffset(follower);
        if (Math.abs(follower.node.y - targetY) > YSMYBattle.GROUND_EPS) {
            return false;
        }

        const bounds = this.getHorizontalStageBounds(stageTop);
        const followerHalfWidth = Math.max(this.getCharacterLeftOffset(follower), this.getCharacterRightOffset(follower));
        const anchorHalfWidth = Math.max(this.getCharacterLeftOffset(anchor), this.getCharacterRightOffset(anchor));
        const margin = followerHalfWidth;
        const side = follower.node.x <= anchor.node.x ? -1 : 1;
        const desiredGap = followerHalfWidth + anchorHalfWidth + 12;
        const minX = bounds.minX + margin;
        const maxX = bounds.maxX - margin;
        const targetX = Math.max(minX, Math.min(maxX, anchor.node.x + side * desiredGap));
        const dx = targetX - follower.node.x;
        if (Math.abs(dx) <= 2) {
            follower.vx = 0;
            follower.vy = 0;
            follower.node.y = targetY;
            follower.onGround = true;
            follower.supportStone = followerStage;
            return true;
        }

        const dir = dx > 0 ? 1 : -1;
        const pullSpeed = Math.max(this.getMoveSpeed(follower), Math.min(520, Math.abs(dx) / Math.max(dt, 1 / 60)));
        const step = Math.min(Math.abs(dx), pullSpeed * dt);
        follower.vx = dir * pullSpeed;
        follower.vy = 0;
        follower.jumpBaseVx = 0;
        follower.jumpConvertTime = 0;
        follower.verticalDropLocked = false;
        follower.node.x += dir * step;
        follower.node.y = targetY;
        follower.onGround = true;
        follower.supportStone = this.findStageAtCharacterFoot(follower) || followerStage;
        return true;
    }

    private findStageAtCharacterFoot(ch: RuntimeCharacter): StoneConfig {
        if (!ch || !ch.node || !ch.node.isValid) {
            return null;
        }

        const footY = ch.node.y - this.getCharacterBottomOffset(ch);
        for (let i = 0; i < this.stones.length; i++) {
            const stone = this.stones[i];
            if (stone.broken) {
                continue;
            }

            const cfg = stone.config;
            const top = cfg.y + cfg.height / 2;
            if (Math.abs(footY - top) <= YSMYBattle.GROUND_EPS && this.isCharacterFootOverStageX(ch, cfg)) {
                return cfg;
            }
        }
        return null;
    }

    private getHorizontalStageBounds(stageTop: number): { minX: number, maxX: number } {
        let minX = YSMYBattle.WORLD_WIDTH / 2;
        let maxX = -YSMYBattle.WORLD_WIDTH / 2;
        let found = false;
        for (let i = 0; i < this.stones.length; i++) {
            const stone = this.stones[i];
            if (stone.broken) {
                continue;
            }

            const cfg = stone.config;
            const top = cfg.y + cfg.height / 2;
            if (Math.abs(top - stageTop) > YSMYBattle.GROUND_EPS) {
                continue;
            }

            minX = found ? Math.min(minX, cfg.x - cfg.width / 2) : cfg.x - cfg.width / 2;
            maxX = found ? Math.max(maxX, cfg.x + cfg.width / 2) : cfg.x + cfg.width / 2;
            found = true;
        }

        return found
            ? { minX: minX, maxX: maxX }
            : { minX: -YSMYBattle.WORLD_WIDTH / 2, maxX: YSMYBattle.WORLD_WIDTH / 2 };
    }

    private pullFollowerToAnchorStage(follower: RuntimeCharacter, anchor: RuntimeCharacter): boolean {
        const stage = anchor.onGround ? anchor.supportStone : null;
        if (!stage) {
            return false;
        }

        const top = stage.y + stage.height / 2;
        const halfW = stage.width / 2;
        const margin = follower.radius + 8;
        const side = follower.node.x <= anchor.node.x ? -1 : 1;
        const desiredGap = follower.radius + anchor.radius + 12;
        const minX = stage.x - halfW + margin;
        const maxX = stage.x + halfW - margin;
        const targetX = Math.max(minX, Math.min(maxX, anchor.node.x + side * desiredGap));
        const targetY = top + this.getCharacterBottomOffset(follower);

        const distance = cc.v2(targetX - follower.node.x, targetY - follower.node.y).mag();
        follower.vx = 0;
        follower.vy = 0;
        follower.jumpBaseVx = 0;
        follower.jumpConvertTime = 0;
        follower.verticalDropLocked = false;
        follower.onGround = false;
        this.chainPullState = {
            follower: follower,
            stage: stage,
            start: cc.v2(follower.node.x, follower.node.y),
            target: cc.v2(targetX, targetY),
            elapsed: 0,
            duration: Math.max(0.18, Math.min(0.38, distance / 900)),
            arcHeight: Math.max(70, Math.min(180, Math.abs(targetY - follower.node.y) * 0.35 + 80)),
        };
        return true;
    }

    private updateChainPullMovement(dt: number): void {
        const state = this.chainPullState;
        if (!state || !state.follower || !state.follower.node || !state.follower.node.isValid) {
            this.chainPullState = null;
            return;
        }

        state.elapsed += dt;
        const progress = Math.min(1, state.elapsed / Math.max(0.01, state.duration));
        const eased = 1 - Math.pow(1 - progress, 2);
        const x = state.start.x + (state.target.x - state.start.x) * eased;
        const y = state.start.y + (state.target.y - state.start.y) * eased + Math.sin(Math.PI * progress) * state.arcHeight;
        state.follower.node.setPosition(x, y);
        state.follower.vx = 0;
        state.follower.vy = 0;
        state.follower.jumpBaseVx = 0;
        state.follower.jumpConvertTime = 0;
        state.follower.verticalDropLocked = false;
        state.follower.onGround = false;

        if (progress < 1) {
            return;
        }

        state.follower.node.setPosition(state.target.x, state.target.y);
        state.follower.vx = 0;
        state.follower.vy = 0;
        state.follower.jumpBaseVx = 0;
        state.follower.jumpConvertTime = 0;
        state.follower.verticalDropLocked = false;
        state.follower.onGround = true;
        state.follower.supportStone = state.stage;
        this.updateCameraFocusByStage(state.stage);
        if (state.stage.type === "solid") {
            state.follower.lastSafeStone = state.stage;
        }
        this.chainPullState = null;
    }

    private isCharacterPulling(ch: RuntimeCharacter): boolean {
        return !!this.chainPullState && this.chainPullState.follower === ch;
    }

    private updateMaskBg(dt: number): void {
        if (this.waterFreezeRemaining > 0) {
            this.waterFreezeRemaining = Math.max(0, this.waterFreezeRemaining - dt);
            return;
        }
        if (!this.maskNode || !this.maskNode.active || this.maskSpeed <= 0) {
            return;
        }

        if (this.maskDelay > 0) {
            this.maskDelay = Math.max(0, this.maskDelay - dt);
            return;
        }

        this.maskNode.y += this.maskSpeed * dt;
    }

    private checkMaskHitCharacters(): void {
        if (this.isMaskHitCharacter(this.princess) || this.isMaskHitCharacter(this.guard)) {
            this.handleFail();
        }
    }

    private isMaskHitCharacter(ch: RuntimeCharacter): boolean {
        if (!ch || !ch.node || !ch.node.isValid || !this.maskNode || !this.maskNode.isValid || !this.maskNode.active) {
            return false;
        }

        const maskRect = this.maskNode.getBoundingBoxToWorld();
        const heroRect = ch.node.getBoundingBoxToWorld();
        const horizontalOverlap = heroRect.xMax >= maskRect.xMin && heroRect.xMin <= maskRect.xMax;
        const footSubmerge = maskRect.yMax - heroRect.yMin;
        return horizontalOverlap && footSubmerge >= YSMYBattle.MASK_FOOT_SUBMERGE;
    }

    private updateStars(): void {
        for (let i = 0; i < this.stars.length; i++) {
            const star = this.stars[i];
            if (!star.active) {
                continue;
            }
            const hitPrincess = this.getDistance(star, this.princess.node) < 58;
            const hitGuard = this.getDistance(star, this.guard.node) < 62;
            if (hitPrincess || hitGuard) {
                star.active = false;
                const index = this.starCount;
                this.starCount += 1;
                this.flyStarToHud(star, index);
                this.updateStarLabel();
            }
        }
    }

    private setupHudStars(): void {
        this.hudStarNodes = [];
        const root = this.findChildByName(this.node, "StarNode") || this.findChildByName(this.node, "starNode") || this.findChildByName(this.node, "star");
        if (!root) {
            return;
        }

        for (let i = 1; i <= 3; i++) {
            const star = root.getChildByName("star" + i);
            if (!star) {
                continue;
            }

            star.active = true;
            this.setStarMaterial(star, false);
            this.hudStarNodes.push(star);
        }
    }

    private flyStarToHud(source: cc.Node, index: number): void {
        const target = this.hudStarNodes[index];
        if (!target || !target.isValid) {
            return;
        }

        const fly = cc.instantiate(source);
        fly.active = true;
        fly.opacity = 255;
        this.setStarMaterial(fly, true);
        this.node.addChild(fly, 80);

        const startWorld = source.parent.convertToWorldSpaceAR(source.position);
        const endWorld = target.parent.convertToWorldSpaceAR(target.position);
        fly.setPosition(this.node.convertToNodeSpaceAR(startWorld));
        const targetPos = this.node.convertToNodeSpaceAR(endWorld);

        cc.tween(fly)
            .to(0.42, { x: targetPos.x, y: targetPos.y, scale: 0.55 }, { easing: "quadOut" })
            .call(() => {
                fly.destroy();
                this.setStarMaterial(target, true);
                target.scale = 1.2;
                cc.tween(target).to(0.12, { scale: 1 }).start();
            })
            .start();
    }

    private setStarMaterial(star: cc.Node, bright: boolean): void {
        const sprite = star.getComponent(cc.Sprite);
        if (!sprite) {
            return;
        }

        const materialName = bright ? "2d-sprite" : "2d-gray-sprite";
        const material = (cc.Material as any).getBuiltinMaterial
            ? (cc.Material as any).getBuiltinMaterial(materialName)
            : null;
        if (material && (sprite as any).setMaterial) {
            (sprite as any).setMaterial(0, material);
        }
    }

    private updateFinishItems(): void {
        for (let i = 0; i < this.finishItems.length; i++) {
            const item = this.finishItems[i];
            if (!item.active) {
                continue;
            }

            const hitPrincess = this.getDistance(item, this.princess.node) < 64;
            const hitGuard = this.getDistance(item, this.guard.node) < 68;
            if (hitPrincess || hitGuard) {
                item.active = false;
                this.handleWin();
                return;
            }
        }
    }

    private updateCamera(force: boolean): void {
        if (!this.world || !this.princess || !this.guard) {
            return;
        }

        const screenAnchorY = Math.min(260, cc.winSize.height * 0.32);
        const targetFocusY = this.getCameraTargetFocusY(screenAnchorY);
        const bottomSafeY = this.getCameraBottomSafeY();
        const lowestVisibleScreenY = this.getLowestCameraVisibleWorldY() + this.cameraY;
        const shouldCatchUpBottom = lowestVisibleScreenY < bottomSafeY;
        const canFollowDown = shouldCatchUpBottom
            || this.cameraY < -YSMYBattle.GROUND_EPS
            || this.cameraFocusY > screenAnchorY;
        const maxCameraY = canFollowDown ? YSMYBattle.CAMERA_MAX_DOWN_Y : 0;
        const targetY = Math.min(maxCameraY, screenAnchorY - targetFocusY);
        const oldCameraY = this.cameraY;
        const followRate = targetY > this.cameraY ? (shouldCatchUpBottom ? 0.9 : 0.65) : 0.18;
        this.cameraY = force ? targetY : this.cameraY + (targetY - this.cameraY) * followRate;
        const cameraDeltaY = this.cameraY - oldCameraY;
        this.world.setPosition(0, this.cameraY);
        if (this.maskNode && this.maskNode.isValid && cameraDeltaY !== 0) {
            this.maskNode.y += cameraDeltaY;
        }
    }

    private getCameraTargetFocusY(screenAnchorY: number): number {
        let focusY = this.cameraFocusY;
        const descentFocusY = this.getDescentFollowFocusY();
        if (descentFocusY < focusY) {
            focusY = descentFocusY;
        }

        const lowestVisibleY = this.getLowestCameraVisibleWorldY();
        const bottomSafeY = this.getCameraBottomSafeY();
        const fallFocusY = lowestVisibleY + screenAnchorY - bottomSafeY;
        if (fallFocusY < focusY) {
            focusY = fallFocusY;
        }
        return focusY;
    }

    private getCameraBottomSafeY(): number {
        return -cc.winSize.height / 2
            + YSMYBattle.CAMERA_BOTTOM_SAFE_MARGIN
            + YSMYBattle.CAMERA_STAGE_VISIBLE_PADDING;
    }

    private getDescentFollowFocusY(): number {
        let focusY = Number.POSITIVE_INFINITY;
        const characters = [this.princess, this.guard];
        for (let i = 0; i < characters.length; i++) {
            const ch = characters[i];
            if (!ch || !ch.node || !ch.node.isValid) {
                continue;
            }

            focusY = Math.min(focusY, ch.node.y);
            if (ch.onGround && ch.supportStone) {
                focusY = Math.min(focusY, ch.supportStone.y + ch.supportStone.height / 2);
            }
        }

        return focusY === Number.POSITIVE_INFINITY ? this.cameraFocusY : focusY;
    }

    private getLowestHeroY(): number {
        return Math.min(this.princess.node.y, this.guard.node.y);
    }

    private getLowestCameraVisibleWorldY(): number {
        let lowest = Number.POSITIVE_INFINITY;
        const characters = [this.princess, this.guard];
        for (let i = 0; i < characters.length; i++) {
            const ch = characters[i];
            if (!ch || !ch.node || !ch.node.isValid) {
                continue;
            }

            lowest = Math.min(lowest, ch.node.y - this.getCharacterBottomOffset(ch));
            const stage = this.getCameraStageForCharacter(ch);
            if (stage) {
                lowest = Math.min(lowest, stage.y - stage.height / 2);
            }
        }

        return lowest === Number.POSITIVE_INFINITY ? this.getLowestHeroY() : lowest;
    }

    private getCameraStageForCharacter(ch: RuntimeCharacter): StoneConfig {
        if (!ch || !ch.node || !ch.node.isValid) {
            return null;
        }

        if (ch.onGround && ch.supportStone) {
            return ch.supportStone;
        }

        if (ch.vy > 0) {
            return null;
        }

        const footY = ch.node.y - this.getCharacterBottomOffset(ch);
        let nearest: StoneConfig = null;
        let nearestTop = -Number.MAX_VALUE;
        for (let i = 0; i < this.stones.length; i++) {
            const stone = this.stones[i];
            if (!stone || stone.broken) {
                continue;
            }

            const cfg = stone.config;
            if (!this.isCharacterFootOverStageX(ch, cfg)) {
                continue;
            }

            const top = cfg.y + cfg.height / 2;
            if (top <= footY + YSMYBattle.GROUND_EPS && top > nearestTop) {
                nearest = cfg;
                nearestTop = top;
            }
        }

        return nearest;
    }

    private updateCameraFocusByStage(stage: StoneConfig): void {
        if (!stage) {
            return;
        }

        const top = stage.y + stage.height / 2;
        if (top > this.cameraFocusY) {
            this.cameraFocusY = top;
        }
    }

    private updateChain(): void {
        if (!this.worldGraphics || !this.princess || !this.guard) {
            return;
        }

        this.worldGraphics.clear();
        const p = this.princess.node.position;
        const g = this.guard.node.position;
        this.drawChainLine(p, g);
    }

    private drawChainLine(start: cc.Vec3, end: cc.Vec3): void {
        this.drawLine(start, end, 18, cc.color(30, 150, 255, 42));
        this.drawLine(start, end, 12, cc.color(39, 169, 255, 86));
        this.drawLine(start, end, 7, cc.color(58, 185, 255, 210));
        this.drawLine(start, end, 3, cc.color(255, 255, 255, 245));
    }

    private drawLine(start: cc.Vec3, end: cc.Vec3, width: number, color: cc.Color): void {
        this.worldGraphics.strokeColor = color;
        this.worldGraphics.lineWidth = width;
        this.worldGraphics.moveTo(start.x, start.y);
        this.worldGraphics.lineTo(end.x, end.y);
        this.worldGraphics.stroke();
    }

    private updateSelectionIcon(): void {
        this.setHeroSelectionIcon(this.princess, this.controlled === this.princess);
        this.setHeroSelectionIcon(this.guard, this.controlled === this.guard);
    }

    private setHeroSelectionIcon(ch: RuntimeCharacter, active: boolean): void {
        if (!ch || !ch.node || !ch.node.isValid) {
            return;
        }

        const select = ch.node.getChildByName("select");
        if (select) {
            if ((select as any).__baseScaleX == null) {
                (select as any).__baseScaleX = Math.abs(select.scaleX || 1);
            }
            select.active = active;
            select.x = 0;
            select.y = this.getCharacterTopOffset(ch) + select.height * select.anchorY + 8;
            const baseScaleX = (select as any).__baseScaleX || 1;
            select.scaleX = ch.node.scaleX < 0 ? -baseScaleX : baseScaleX;
        }
    }

    private updateStarLabel(): void {
        if (this.starLabel) {
            this.starLabel.string = "进度：" + this.starCount + "/" + this.totalStarCount;
        }
    }

    private checkResult(): void {
        const cameraBottom = -cc.winSize.height / 2 - 140;
        if (this.getCharacterScreenY(this.princess) < cameraBottom || this.getCharacterScreenY(this.guard) < cameraBottom) {
            this.handleFail();
        }
    }

    private getCharacterScreenY(ch: RuntimeCharacter): number {
        return ch.node.y + (this.world ? this.world.y : 0);
    }

    private handleWin(): void {
        if (!gameManager.lockLevelResult()) {
            return;
        }

        this.running = false;
        const star = Math.max(1, Math.min(3, this.starCount + 1));
        gameManager.lastResultStar = star;
        // 保底显示星级不参与钻石计算，奖励只按实际收集到的星星数量发放。
        const diamondReward = 30 + Math.max(0, this.starCount) * 10;
        gameManager.lastResultDiamond = diamondReward;
        if (!this.diamondRewardGranted && mGameData) {
            this.diamondRewardGranted = true;
            mGameData.currentGold = Math.max(0, Number(mGameData.currentGold) || 0) + diamondReward;
            mGameData.SaveGoldData();
            cc.director.emit("goldUpdated");
        }
        MasterGlobal.data["lvWin"] = true;
        MasterGlobal.data["score"] = this.starCount;
        if (mGameData) {
            mGameData.setLevelStars(this.level, star);
            if (mGameData.unlockedLevel <= this.level) {
                const totalLevels = Math.max(1, Number(mGameData.getTotalLevels()) || 1);
                mGameData.unlockedLevel = Math.min(totalLevels, this.level + 1);
            }
            mGameData.currentLevel = Math.max(1, this.level);
            mGameData.SaveLevelData();
            cc.director.emit("levelUpdated");
        }
        this.showResult(ResultWndState.Win);
    }

    private handleFail(): void {
        if (!gameManager.lockLevelResult()) {
            return;
        }

        this.running = false;
        gameManager.levelFailCount = this.reviveUsed ? 2 : 1;
        gameManager.lastResultStar = 0;
        MasterGlobal.data["lvWin"] = false;
        this.showResult(ResultWndState.Lose);
    }

    private showResult(state: ResultWndState): void {
        this.forceHeroesIdle();
        if (!YSMYBattle.RESULT_ENABLED) {
            return;
        }

        const uiFrame = UIMng.getInstance().getUI(UIFrame) as UIFrame;
        if (uiFrame && uiFrame.showResultWnd) {
            uiFrame.showResultWnd(state);
            return;
        }

        const wnd = UIMng.getInstance().getUI(UIResultWnd) as UIResultWnd;
        if (wnd) {
            wnd.state = state;
            wnd.onShow();
        }
    }

    private forceHeroesIdle(): void {
        this.chainPullState = null;
        this.stopCharacterForIdle(this.princess);
        this.stopCharacterForIdle(this.guard);
    }

    private stopCharacterForIdle(ch: RuntimeCharacter): void {
        if (!ch || !ch.node || !ch.node.isValid) {
            return;
        }

        ch.vx = 0;
        ch.vy = 0;
        ch.jumpBaseVx = 0;
        ch.jumpConvertTime = 0;
        ch.verticalDropLocked = false;
        this.playCharacterAnimation(ch.node, `${ch.name}_idle`);
    }

    private switchControl(ch: RuntimeCharacter): void {
        this.controlled = ch;
        this.moveDir = 0;
        this.jumpPressed = false;
        this.jumpHeld = false;
        this.jumpBufferTime = 0;
        this.jumpWishDir = 0;
        this.recentInputDir = 0;
        this.recentInputTime = 999;
        this.keyLeft = false;
        this.keyRight = false;
        this.keyJump = false;
        this.updateSelectionIcon();
    }

    private onWorldTouch(event: cc.Event.EventTouch): void {
        if (this.isHudTouch(event.target as cc.Node)) {
            return;
        }

        const pos = this.world.convertToNodeSpaceAR(event.getLocation());
        const touched = this.getTouchedCharacter(pos);
        if (touched) {
            this.switchControl(touched);
        }
    }

    private isHudTouch(target: cc.Node): boolean {
        let current = target;
        while (current && current.isValid) {
            if (current === this.world) {
                return false;
            }
            if (current.name === "StopBtn" || current.name === "BtnLeft" || current.name === "BtnJump" || current.name === "BtnRight" || current.name === "WaterFreezeBtn") {
                return true;
            }
            current = current.parent;
        }
        return false;
    }

    private getTouchedCharacter(pos: cc.Vec2): RuntimeCharacter {
        const princessDistance = this.princess ? cc.v2(pos.x - this.princess.node.x, pos.y - this.princess.node.y).mag() : Number.MAX_VALUE;
        const guardDistance = this.guard ? cc.v2(pos.x - this.guard.node.x, pos.y - this.guard.node.y).mag() : Number.MAX_VALUE;
        const princessRange = 92;
        const guardRange = 100;
        const hitPrincess = princessDistance <= princessRange;
        const hitGuard = guardDistance <= guardRange;

        if (hitPrincess && hitGuard) {
            return princessDistance / princessRange <= guardDistance / guardRange ? this.princess : this.guard;
        }
        if (hitGuard) {
            return this.guard;
        }
        if (hitPrincess) {
            return this.princess;
        }
        return null;
    }

    private findChildByName(root: cc.Node, name: string): cc.Node {
        if (!root || !cc.isValid(root)) {
            return null;
        }
        if (root.name === name) {
            return root;
        }
        for (let i = 0; i < root.childrenCount; i++) {
            const found = this.findChildByName(root.children[i], name);
            if (found) {
                return found;
            }
        }
        return null;
    }

    private onKeyDown(event: cc.Event.EventKeyboard): void {
        if (!this.controlled) {
            return;
        }
        switch (event.keyCode) {
            case cc.macro.KEY.a:
            case cc.macro.KEY.left:
                this.keyLeft = true;
                this.recordInputDir(-1);
                if (this.jumpPressed) {
                    this.jumpWishDir = -1;
                }
                break;
            case cc.macro.KEY.d:
            case cc.macro.KEY.right:
                this.keyRight = true;
                this.recordInputDir(1);
                if (this.jumpPressed) {
                    this.jumpWishDir = 1;
                }
                break;
            case cc.macro.KEY.w:
            case cc.macro.KEY.up:
            case cc.macro.KEY.space:
            case cc.macro.KEY.tab:
                if (this.keyJump) {
                    break;
                }
                this.keyJump = true;
                this.setJumpPressed(true);
                break;
            default:
                break;
        }
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
            case cc.macro.KEY.tab:
                this.keyJump = false;
                this.setJumpPressed(false);
                break;
            default:
                break;
        }
    }

    private getMoveSpeed(ch: RuntimeCharacter): number {
        return ch.config.speed * 44;
    }

    private getJumpSpeed(ch: RuntimeCharacter, parabola: boolean = false): number {
        const height = this.getJumpHeight(ch, parabola);
        if (height > 0) {
            return Math.sqrt(2 * Math.abs(YSMYBattle.GRAVITY) * height);
        }
        return ch.id === "H_001" ? ch.config.jump_impulse_y * 56 : ch.config.jump_impulse_y * 26;
    }

    private getJumpHorizontalSpeed(ch: RuntimeCharacter): number {
        const distance = Math.max(0, Number(ch.config.jumpDistance) || 0);
        const height = this.getJumpHeight(ch, true);
        if (distance > 0 && height > 0) {
            const jumpSpeed = this.getJumpSpeed(ch, true);
            const flightTime = Math.max(0.1, 2 * jumpSpeed / Math.abs(YSMYBattle.GRAVITY));
            return distance / flightTime;
        }
        return ch.id === "H_001" ? ch.config.jump_impulse_x * 12 : ch.config.jump_impulse_x * 18;
    }

    private getAirControlSpeed(ch: RuntimeCharacter): number {
        const distance = Math.max(0, Number(ch.config.jumpDistance) || 0) * 0.5;
        const height = this.getJumpHeight(ch, true);
        if (distance > 0 && height > 0) {
            const jumpSpeed = this.getJumpSpeed(ch, true);
            const flightTime = Math.max(0.1, 2 * jumpSpeed / Math.abs(YSMYBattle.GRAVITY));
            return distance / flightTime;
        }
        return ch.id === "H_001" ? ch.config.jump_impulse_x * 4 : ch.config.jump_impulse_x * 6;
    }

    private getJumpHeight(ch: RuntimeCharacter, parabola: boolean): number {
        return Math.max(0, Number(ch.config.jumpHeight) || 0);
    }

    private getDistance(a: cc.Node, b: cc.Node): number {
        return cc.v2(a.x - b.x, a.y - b.y).mag();
    }

    private setCharacterPosition(ch: RuntimeCharacter, x: number, y: number): void {
        ch.node.setPosition(x, y);
        ch.verticalDropLocked = false;
    }

    private setCharacterOnStage(ch: RuntimeCharacter, stage: StoneConfig): void {
        if (!ch || !ch.node || !ch.node.isValid || !stage) {
            return;
        }

        ch.node.y = stage.y + stage.height / 2 + this.getCharacterBottomOffset(ch);
        ch.vx = 0;
        ch.vy = 0;
        ch.jumpBaseVx = 0;
        ch.jumpConvertTime = 0;
        ch.verticalDropLocked = false;
        ch.onGround = true;
        ch.supportStone = stage;
        if (stage.type === "solid") {
            ch.lastSafeStone = stage;
        }
    }

    private createSpriteNode(name: string, spriteUrl: string, width: number, height: number): cc.Node {
        const node = new cc.Node(name);
        node.setContentSize(width, height);
        const spriteFrame = ResUtils.getAsset<cc.SpriteFrame>(spriteUrl, cc.SpriteFrame);
        if (spriteFrame) {
            const sprite = node.addComponent(cc.Sprite);
            sprite.spriteFrame = spriteFrame;
            sprite.sizeMode = cc.Sprite.SizeMode.CUSTOM;
        } else {
            const graphics = node.addComponent(cc.Graphics);
            graphics.fillColor = cc.color(90, 90, 110, 220);
            graphics.fillRect(-width / 2, -height / 2, width, height);
        }
        return node;
    }

    private createText(name: string, value: string, size: number, pos: cc.Vec2, parent: cc.Node): cc.Node {
        const node = new cc.Node(name);
        node.setPosition(pos);
        const label = node.addComponent(cc.Label);
        label.string = value;
        label.fontSize = size;
        label.align = cc.Label.HorizontalAlign.CENTER;
        label.verticalAlign = cc.Label.VerticalAlign.CENTER;
        node.color = cc.color(255, 245, 210);
        parent.addChild(node, 10);
        return node;
    }

    private normalizeStone(stone: StoneConfig): StoneConfig {
        const typeText = String(stone.type || "solid").replace(";", "");
        const type = typeText === "fragile" || typeText === "dichi" ? typeText : "solid";
        return {
            stone_id: stone.stone_id,
            type: type,
            x: Number(stone.x) || 0,
            y: Number(stone.y) || 0,
            width: Number(stone.width) || 120,
            height: Number(stone.height) || 40,
            res: stone.res || "stage_1",
            stageIndex: stone.stageIndex || 0,
        };
    }

    private findCharacterConfig(configs: CharacterConfig[], id: string): CharacterConfig {
        for (let i = 0; i < configs.length; i++) {
            if (configs[i].char_id === id) {
                return configs[i];
            }
        }
        return id === "H_001"
            ? { char_id: "H_001", name: "神圣公主", speed: 5.0, jump_impulse_y: 8, jump_impulse_x: 28 }
            : { char_id: "G_001", name: "皇家护卫", speed: 3.5, jump_impulse_y: 25, jump_impulse_x: 6 };
    }

    private findLowestSolidStone(): StoneConfig {
        let result: StoneConfig = null;
        for (let i = 0; i < this.stones.length; i++) {
            const cfg = this.stones[i].config;
            if (cfg.type === "solid" && (!result || cfg.y < result.y)) {
                result = cfg;
            }
        }
        return result;
    }

    private findStageStone(stageIndex: number): StoneConfig {
        for (let i = 0; i < this.stones.length; i++) {
            const cfg = this.stones[i].config;
            if (cfg.stageIndex === stageIndex) {
                return cfg;
            }
        }
        return this.stones.length > 0 ? this.stones[0].config : null;
    }

    private getChainDistance(globalPhysics: any): number {
        const chain = Number(globalPhysics && globalPhysics.chain);
        if (!isNaN(chain) && chain > 0) {
            return chain;
        }

        cc.error("YSMYBattle missing config field: heros.chain");
        return 0;
    }

    private createLevelConfig(level: number): any {
        const mappedConfig = this.createLevelConfigFromTables(level);
        if (mappedConfig) {
            return mappedConfig;
        }

        cc.error("YSMYBattle missing levels/stages config for level", level);
        return {
            global_physics: {
                chain: 180,
            },
            character_ctrl: [
                { char_id: "H_001", name: "神圣公主", speed: 5.0, jump_impulse_y: 8, jump_impulse_x: 28 },
                { char_id: "G_001", name: "皇家护卫", speed: 3.5, jump_impulse_y: 25, jump_impulse_x: 6 },
            ],
            level: {
                level_id: String(level),
                win_y_threshold: 0,
                start_stage: 1,
                speed: 0,
                star_spawns: [],
                finish_spawns: [],
                stones: [],
            },
        };
    }

    private createLevelConfigFromTables(level: number): any {
        const levelsAsset = cc.resources.get("config/levels", cc.JsonAsset) as cc.JsonAsset;
        const stagesAsset = cc.resources.get("config/stages", cc.JsonAsset) as cc.JsonAsset;
        if (!levelsAsset || !levelsAsset.json || !stagesAsset || !stagesAsset.json) {
            return null;
        }

        const levelRows = Array.isArray(levelsAsset.json.levels) ? levelsAsset.json.levels : [];
        const stageRows = Array.isArray(stagesAsset.json.stages) ? stagesAsset.json.stages : [];
        if (levelRows.length <= 0 || stageRows.length <= 0) {
            return null;
        }

        const index = Math.max(0, Math.min(levelRows.length - 1, level - 1));
        const row = levelRows[index];
        const heroRaw = levelsAsset.json.heros || row.heros || row;
        const heroParamConfig = this.createHeroParamConfigs(heroRaw);
        const levelSpeed = this.parseLevelMoveSpeeds(heroRaw && heroRaw.speed, row.speed);
        heroParamConfig[0].speed = levelSpeed[0];
        heroParamConfig[1].speed = levelSpeed[1];
        const startInfo = this.parseStartStages(row.start);
        const stageMap: { [key: string]: StageTableConfig } = {};
        for (let i = 0; i < stageRows.length; i++) {
            stageMap[String(stageRows[i].id)] = stageRows[i];
        }

        const stageIds = Array.isArray(row.stages) ? row.stages : [];
        const positions = this.parseStagePositions(row.pos);
        const stones: StoneConfig[] = [];
        const starSpawns: StarConfig[] = [];
        const finishSpawns: StarConfig[] = [];
        for (let i = 0; i < stageIds.length; i++) {
            const stageToken = this.parseStageToken(stageIds[i]);
            const stageId = stageToken.stageId;
            const stageInfo = stageMap[stageId] || stageRows[0];
            const pos = positions[i] || cc.v2(0, i * 120);
            const resName = stageInfo.res || "stage_1";
            const stageSize = this.getStageOriginalSize(resName, Number(stageInfo.width) || 120, Number(stageInfo.height) || 40);
            const stone: StoneConfig = {
                stone_id: String(row.id || level) + "_" + i,
                type: stageInfo.type || "solid",
                x: pos.x,
                y: pos.y,
                width: stageSize.width,
                height: stageSize.height,
                res: resName,
                stageIndex: i + 1,
            };
            stones.push(stone);
            this.appendStageItem(starSpawns, finishSpawns, stone, stageToken.itemType);
        }

        const maxY = stones.reduce((value, stone) => Math.max(value, stone.y), 0);
        return {
            global_physics: {
                chain: this.parseChainConfig(heroRaw),
            },
            character_ctrl: [
                Object.assign({ char_id: "H_001", name: "神圣公主", speed: 5.0, jump_impulse_y: 8, jump_impulse_x: 28 }, heroParamConfig[0]),
                Object.assign({ char_id: "G_001", name: "皇家护卫", speed: 3.5, jump_impulse_y: 25, jump_impulse_x: 6 }, heroParamConfig[1]),
            ],
            level: {
                level_id: String(row.id || level),
                win_y_threshold: Number(row.win_y_threshold) || maxY + 180,
                start_stage: startInfo.start,
                speed: Number(row.speed) || 0,
                star_spawns: starSpawns,
                finish_spawns: finishSpawns,
                stones: stones,
            },
        };
    }

    private parseStagePositions(value: any): cc.Vec2[] {
        if (Array.isArray(value)) {
            return value.map((item) => {
                if (Array.isArray(item)) {
                    return cc.v2(Number(item[0]) || 0, Number(item[1]) || 0);
                }
                return cc.v2(Number(item.x) || 0, Number(item.y) || 0);
            });
        }

        const text = String(value || "");
        const result: cc.Vec2[] = [];
        const regex = /\((-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)\)/g;
        let match = regex.exec(text);
        while (match) {
            result.push(cc.v2(Number(match[1]) || 0, Number(match[2]) || 0));
            match = regex.exec(text);
        }
        return result;
    }

    private parseStageToken(value: any): { stageId: string, itemType: number } {
        const text = String(value || "").trim();
        const stageMatch = text.match(/^stage[_-]?(\d+)(?:[_-](\d+))?$/i);
        if (stageMatch) {
            return {
                stageId: stageMatch[1],
                itemType: Math.max(0, Number(stageMatch[2]) || 0),
            };
        }

        const parts = text.split(/[_-]/);
        const stageId = (parts[0] || text || "1").trim();
        const itemType = Math.max(0, Number(parts[1]) || 0);
        return { stageId: stageId, itemType: itemType };
    }

    private parseStartStages(value: any): { start: number } {
        if (Array.isArray(value)) {
            const start = Math.max(1, Math.floor(Number(value[0]) || 1));
            return { start: start };
        }

        const text = String(value || "").trim();
        const parts = text.split(/[_|,-]/);
        const start = Math.max(1, Math.floor(Number(parts[0]) || 1));
        return { start: start };
    }

    private createHeroParamConfigs(raw: any): any[] {
        const distance = this.parseHeroPair(raw && raw.distance, 0);
        const high = this.parseHeroPair(raw && raw.high, 0);
        const parameter = this.parseHeroPair(raw && raw.parameter, 1);
        const speed = this.parseHeroPair(raw && raw.speed, 0);
        return [
            {
                speed: speed[0],
                jumpDistance: distance[0],
                jumpHeight: high[0],
                jumpParameter: parameter[0],
            },
            {
                speed: speed[1],
                jumpDistance: distance[1],
                jumpHeight: high[1],
                jumpParameter: parameter[1],
            },
        ];
    }

    private parseLevelMoveSpeeds(heroSpeed: any, levelSpeed: any): number[] {
        const speed = this.parseHeroPair(heroSpeed, 0);
        const fallback = this.parseHeroPair(levelSpeed, 0);
        return [
            speed[0] > 0 ? speed[0] : (fallback[0] > 0 ? fallback[0] : 5.0),
            speed[1] > 0 ? speed[1] : (fallback[1] > 0 ? fallback[1] : 3.5),
        ];
    }

    private parseChainConfig(raw: any): number {
        const value = Number(raw && raw.chain);
        if (!isNaN(value) && value > 0) {
            return value;
        }

        cc.error("YSMYBattle missing config field: heros.chain");
        return 0;
    }

    private parseHeroPair(value: any, fallback: number): number[] {
        if (Array.isArray(value)) {
            const first = Number(value[0]);
            const second = Number(value[1]);
            const a = !isNaN(first) ? first : fallback;
            const b = !isNaN(second) ? second : a;
            return [a, b];
        }

        const text = String(value == null ? "" : value).trim();
        if (!text) {
            return [fallback, fallback];
        }

        const parts = text.split(/[_|,]/);
        const first = Number(parts[0]);
        const second = Number(parts[1]);
        const a = !isNaN(first) ? first : fallback;
        const b = !isNaN(second) ? second : a;
        return [a, b];
    }

    private appendStageItem(stars: StarConfig[], finishItems: StarConfig[], stone: StoneConfig, itemType: number): void {
        if (!stone) {
            return;
        }

        if (itemType === 1) {
            stars.push({ x: stone.x, y: stone.y + stone.height / 2 + 34 });
        } else if (itemType === 2) {
            finishItems.push({ x: stone.x, y: stone.y + stone.height / 2 });
        }
    }

}
