import { _decorator, Component, director, JsonAsset, Node, Prefab } from 'cc';
import { BlackHoleConfig, GridCoord, GridSystem, LevelConfig } from './GridSystem';
import { HUD } from './HUD';
import { VisionMask } from './VisionMask';
import { ClearPanel, ClearResult } from './ClearPanel';
import { gameConfig } from '../../script/data/gameConfig';
import { emits } from '../../script/data/enums';
import { nodePool } from '../../script/utils/nodePool';
import { save } from '../../script/utils/tools';
import { local } from '../data/enmus';
import { HeroUpgradeStore } from '../../script/data/heroUpgradeStore';
import { getHeroStepBonus, getSlotRewardSteps } from '../../script/data/heroSkills';
const { ccclass, property } = _decorator;

export enum LevelState {
    Ready = 'ready',
    Playing = 'playing',
    Win = 'win',
    Fail = 'fail',
}

export const GameEvents = {
    StepsChanged: 'xunguang:steps-changed',
    ProgressChanged: 'xunguang:progress-changed',
    LevelStateChanged: 'xunguang:level-state-changed',
    LevelReset: 'xunguang:level-reset',
};

type RawLevelConfig = {
    level?: number;
    id: string;
    name?: string;
    minSteps?: number;
    firstClearRewards?: Record<string, number>;
    repeatRewards?: Record<string, any>;
    cols?: number;
    rows?: number;
    steps: number;
    obstacles?: GridCoord[];
    slots?: {
        id: string;
        position: GridCoord;
    }[];
    lightBlocks?: {
        id: string;
        start: GridCoord;
    }[];
    blackHoles?: RawBlackHoleConfig[];
    playerStart?: GridCoord;
};

type RawBlackHoleConfig = BlackHoleConfig & {
    patrol?: {
        type: 'horizontalBetweenSlots';
        fromSlotId: string;
        toSlotId: string;
        row?: number;
    };
};

@ccclass('GameManager')
export class GameManager extends Component {
    public static instance: GameManager = null;

    @property(GridSystem)
    gridSystem: GridSystem = null;

    private failDelayTimer: number | null = null;

    @property(HUD)
    hud: HUD = null;

    @property(VisionMask)
    visionMask: VisionMask = null;

    @property(ClearPanel)
    clearPanel: ClearPanel = null;

    @property(Node)
    popupRoot: Node = null;

    @property(Prefab)
    gameOver1Prefab: Prefab = null;

    @property(Prefab)
    gameOver2Prefab: Prefab = null;

    @property
    levelId = 'L001';

    @property
    currentLevel = 1;

    @property
    baseSteps = 12;

    @property
    heroStepBonus = 0;

    @property(JsonAsset)
    levelsJson: JsonAsset = null;

    public state = LevelState.Ready;
    public stepsLeft = 0;
    public totalSteps = 0;
    public currentConfig: LevelConfig = null;
    private rewardedSlots = new Set<string>();

    onLoad() {
        GameManager.instance = this;

        if (!this.gridSystem) {
            this.gridSystem = this.getComponentInChildren(GridSystem);
        }
        if (!this.hud) {
            this.hud = this.getComponentInChildren(HUD);
        }
        if (!this.visionMask) {
            this.visionMask = this.getComponentInChildren(VisionMask);
        }
        if (!this.clearPanel) {
            this.clearPanel = this.findClearPanel();
        }
        if (!this.popupRoot) {
            this.popupRoot = this.node.parent || this.node;
        }

        gameConfig.gameRoot = this.popupRoot;
        gameConfig.gamePause = 0;
        this.registerLegacyPrefabs();
        director.on(emits.gamePause, this.onLegacyPauseChanged, this);
        director.on(emits.fuhuo, this.onContinueFromGameOver, this);
    }

    async start() {
        await HeroUpgradeStore.ensureLoaded();
        const initialLevel = Number(gameConfig.selectedLevel || this.currentLevel || 1);
        // 保存初始关卡号，供重新开始时使用
        this.currentLevel = initialLevel;
        this.loadLevel(this.getLevelConfig(initialLevel, this.levelId));
    }

    onDestroy() {
        if (GameManager.instance === this) {
            GameManager.instance = null;
        }

        director.off(emits.gamePause, this.onLegacyPauseChanged, this);
        director.off(emits.fuhuo, this.onContinueFromGameOver, this);
    }

    public loadLevel(config: LevelConfig) {
        this.currentConfig = config;
        this.currentLevel = config.level || this.currentLevel;
        this.levelId = config.id;
        this.baseSteps = config.steps;
        const qhStepBonus = HeroUpgradeStore.getCurrentStepBonus();
        const heroStepBonus = getHeroStepBonus();
        this.heroStepBonus = qhStepBonus + heroStepBonus;
        this.totalSteps = config.steps + this.heroStepBonus;
        this.stepsLeft = this.totalSteps;
        this.state = LevelState.Playing;
        gameConfig.fuhuoNum = 1;
        gameConfig.gamePause = 0;
        this.rewardedSlots.clear();

        // 触发关卡验证报告
        // director.emit('levelValidation', this.currentLevel);

        this.clearPanel?.hide();
        this.gridSystem?.buildLevel(config);
        this.visionMask?.bindGrid(this.gridSystem);
        this.refreshAllUI();
    }

    public loadLevelByNumber(level: number) {
        this.loadLevel(this.getLevelConfig(level, this.levelId));
    }

    public loadNextLevel() {
        this.loadLevelByNumber(this.currentLevel + 1);
    }

    public resetLevel() {
        if (!this.currentConfig) {
            this.currentConfig = this.getLevelConfig(this.currentLevel, this.levelId);
        }

        this.cancelFailDelay();
        director.emit(GameEvents.LevelReset);
        this.loadLevel(this.cloneLevelConfig(this.currentConfig));
    }

    public canPlay() {
        return this.state === LevelState.Playing && this.stepsLeft > 0 && gameConfig.gamePause !== 1;
    }

    public consumeStep() {
        if (!this.canPlay()) {
            return false;
        }

        this.stepsLeft = Math.max(0, this.stepsLeft - 1);
        director.emit(GameEvents.StepsChanged, this.stepsLeft);

        if (this.stepsLeft <= 0) {
            this.scheduleFailDelay();
        }

        return true;
    }

    private scheduleFailDelay() {
        if (this.failDelayTimer !== null) {
            return;
        }

        this.failDelayTimer = setTimeout(() => {
            this.failDelayTimer = null;
            if (this.state === LevelState.Playing && this.stepsLeft <= 0) {
                if (!this.gridSystem?.areAllSlotsFilled()) {
                    this.failLevel('steps-empty');
                }
            }
        }, 1000) as unknown as number;
    }

    private cancelFailDelay() {
        if (this.failDelayTimer !== null) {
            clearTimeout(this.failDelayTimer);
            this.failDelayTimer = null;
        }
    }

    public addSteps(amount: number) {
        if (amount <= 0 || this.state === LevelState.Win) {
            return;
        }

        this.cancelFailDelay();
        this.stepsLeft += amount;
        this.totalSteps += amount;
        if (this.state === LevelState.Fail) {
            this.state = LevelState.Playing;
            director.emit(GameEvents.LevelStateChanged, this.state, 'continue');
        }
        director.emit(GameEvents.StepsChanged, this.stepsLeft);
    }

    public onBlockMoved() {
        this.visionMask?.refresh();
    }

    public onBlockSlotted() {
        this.updateProgress();
        this.visionMask?.refresh();

        const slotReward = getSlotRewardSteps();
        if (slotReward > 0) {
            const lastFilledSlotId = this.gridSystem?.getLastFilledSlotId();
            if (lastFilledSlotId && !this.rewardedSlots.has(lastFilledSlotId)) {
                this.addSteps(slotReward);
                this.rewardedSlots.add(lastFilledSlotId);
            }
        }

        if (this.gridSystem?.areAllSlotsFilled()) {
            this.winLevel();
        }
    }

    public onBlockCaught() {
        this.consumeStep();
    }

    public updateProgress() {
        const filled = this.gridSystem ? this.gridSystem.getFilledSlotCount() : 0;
        const total = this.gridSystem ? this.gridSystem.getTotalSlotCount() : 0;
        director.emit(GameEvents.ProgressChanged, filled, total);
    }

    public winLevel() {
        if (this.state !== LevelState.Playing) {
            return;
        }

        this.cancelFailDelay();
        this.state = LevelState.Win;
        
        // 先记录是否是首次通关，再调用 unlockNextLevelIfNeeded()
        // 否则 unlockNextLevelIfNeeded() 会修改 gameConfig.nowLevel，导致 isFirstClear 判断错误
        const isFirstClear = this.isFirstClearLevel();
        
        this.unlockNextLevelIfNeeded();
        director.emit(GameEvents.LevelStateChanged, this.state, 'all-slotted');
        this.showClearPanel(isFirstClear);
    }

    public failLevel(reason: string) {
        if (this.state !== LevelState.Playing) {
            return;
        }
        this.cancelFailDelay();
        this.state = LevelState.Fail;
        director.emit(GameEvents.LevelStateChanged, this.state, reason);
        this.showGameOverPanel();
    }

    private onLegacyPauseChanged() {
        this.visionMask?.refresh();
    }

    private onContinueFromGameOver() {
        if (this.state !== LevelState.Fail) {
            return;
        }

        gameConfig.gamePause = 0;
        this.gridSystem?.rollbackBlocksAfterContinue();
        this.addSteps(10);
        this.visionMask?.refresh();
    }

    private showGameOverPanel() {
        gameConfig.gamePause = 1;
        director.emit(emits.gamePause);

        const parent = gameConfig.gameRoot || this.popupRoot || this.node;
        if (gameConfig.fuhuoNum >= 1) {
            nodePool.ins.getPoolNode('gameOver1', parent);
        } else {
            nodePool.ins.getPoolNode('gameOver2', parent);
        }
    }

    private registerLegacyPrefabs() {
        if (this.gameOver1Prefab) {
            nodePool.ins.setPrefab('gameOver1', this.gameOver1Prefab);
        }
        if (this.gameOver2Prefab) {
            nodePool.ins.setPrefab('gameOver2', this.gameOver2Prefab);
        }
    }

    private showClearPanel(isFirstClear: boolean) {
        const result = this.createClearResult(isFirstClear);
        if (!this.clearPanel) {
            this.clearPanel = this.findClearPanel();
        }
        if (!this.clearPanel) {
            const node = new Node('ClearPanel');
            (this.popupRoot || this.node).addChild(node);
            this.clearPanel = node.addComponent(ClearPanel);
        }

        this.clearPanel.show(result);
    }

    private findClearPanel() {
        const searchRoots = [this.node, this.node.parent].filter(Boolean) as Node[];

        for (const root of searchRoots) {
            const panel = this.findComponentInNodeTree(root, ClearPanel);
            if (panel) {
                return panel;
            }
        }

        return null;
    }

    private findComponentInNodeTree<T extends Component>(node: Node, componentType: new () => T): T | null {
        const component = node.getComponent(componentType);
        if (component) {
            return component;
        }

        for (const child of node.children) {
            const found = this.findComponentInNodeTree(child, componentType);
            if (found) {
                return found;
            }
        }

        return null;
    }

    private createClearResult(isFirstClear: boolean): ClearResult {
        const config = this.currentConfig;
        const stepsUsed = Math.max(0, this.totalSteps - this.stepsLeft);
        const star = this.calculateStar(stepsUsed, config?.minSteps || config?.steps || this.totalSteps);
        const rewards = this.calculateRewards(config, star, isFirstClear);

        return {
            config,
            stepsUsed,
            totalSteps: this.totalSteps,
            star,
            isFirstClear,
            rewards,
        };
    }

    private calculateStar(stepsUsed: number, minSteps: number) {
        if (stepsUsed <= minSteps * 1.2) {
            return 3;
        }
        if (stepsUsed <= minSteps * 1.5) {
            return 2;
        }
        return 1;
    }

    private calculateRewards(config: LevelConfig, star: number, isFirstClear: boolean) {
        const baseRewards = isFirstClear
            ? (config?.firstClearRewards || {})
            : (config?.repeatRewards || {});
        const starRatio = star === 3 ? 1.5 : star === 2 ? 1.3 : 1;
        const rewards: Record<string, number> = {};

        for (const key of Object.keys(baseRewards)) {
            const value = baseRewards[key] || 0;
            rewards[key] = key === 'lightCrystal' ? Math.round(value * starRatio) : value;
        }

        return rewards;
    }

    private isFirstClearLevel() {
        return this.currentLevel >= Number(gameConfig.nowLevel || 1);
    }

    private unlockNextLevelIfNeeded() {
        if (!this.isFirstClearLevel()) {
            return;
        }

        gameConfig.nowLevel = this.currentLevel + 1;
        save(local.nowLevel, gameConfig.nowLevel);
    }

    private refreshAllUI() {
        director.emit(GameEvents.StepsChanged, this.stepsLeft);
        this.updateProgress();
        director.emit(GameEvents.LevelStateChanged, this.state, 'load');
        this.visionMask?.refresh();
    }

    private createDefaultLevel(): LevelConfig {
        const cols = 7;
        const rows = 7;
        const slots = [
            { id: 'A', position: { col: 5, row: 6 } },
            { id: 'B', position: { col: 6, row: 6 } },
        ];

        return {
            level: this.currentLevel || 1,
            id: this.levelId || 'L001',
            name: '初醒之间',
            minSteps: 6,
            cols,
            rows,
            steps: this.baseSteps,
            obstacles: [
                { col: 2, row: 1 },
                { col: 3, row: 1 },
                { col: 3, row: 3 },
                { col: 4, row: 3 },
            ],
            slots,
            lightBlocks: [
                { id: 'A', start: { col: 0, row: 0 } },
                { id: 'B', start: { col: 1, row: 0 } },
            ],
            blackHoles: [],
            playerStart: { col: 0, row: 1 },
        };
    }

    private getLevelConfig(level: number, levelId: string) {
        const rawLevel = this.findRawLevel(level, levelId);
        if (!rawLevel) {
            return this.createDefaultLevel();
        }

        return this.normalizeLevelConfig(rawLevel);
    }

    private findRawLevel(level: number, levelId: string) {
        const json = this.levelsJson?.json as any;
        if (!json) {
            return null;
        }

        const levels = Array.isArray(json) ? json : json.levels;
        if (!Array.isArray(levels)) {
            return null;
        }

        return levels.find((item: RawLevelConfig) => item.level === level)
            || levels.find((item: RawLevelConfig) => item.id === levelId)
            || levels[0]
            || null;
    }

    private normalizeLevelConfig(raw: RawLevelConfig): LevelConfig {
        const cols = raw.cols || 7;
        const rows = raw.rows || 9;
        const slots = raw.slots || [];

        return {
            level: raw.level,
            id: raw.id,
            name: raw.name,
            minSteps: raw.minSteps,
            firstClearRewards: raw.firstClearRewards,
            repeatRewards: raw.repeatRewards,
            cols,
            rows,
            steps: raw.steps,
            obstacles: raw.obstacles || [],
            slots,
            lightBlocks: raw.lightBlocks || [],
            blackHoles: (raw.blackHoles || []).map((blackHole) => this.normalizeBlackHoleConfig(blackHole, slots, rows)),
            playerStart: raw.playerStart,
        };
    }

    private normalizeBlackHoleConfig(
        raw: RawBlackHoleConfig,
        slots: RawLevelConfig['slots'],
        rows: number,
    ): BlackHoleConfig {
        if (raw.patrol?.type === 'horizontalBetweenSlots') {
            const fromSlot = slots.find((slot) => slot.id === raw.patrol.fromSlotId);
            const toSlot = slots.find((slot) => slot.id === raw.patrol.toSlotId);
            const row = raw.patrol.row ?? Math.floor(rows / 2);

            if (fromSlot && toSlot) {
                return {
                    ...raw,
                    path: this.createHorizontalPatrolPath(fromSlot.position.col, toSlot.position.col, row),
                };
            }
        }

        return {
            ...raw,
            path: raw.path || [],
        };
    }

    private createHorizontalPatrolPath(fromCol: number, toCol: number, row: number) {
        const start = Math.min(fromCol, toCol);
        const end = Math.max(fromCol, toCol);
        const path = [];

        for (let col = start; col <= end; col++) {
            path.push({ col, row });
        }

        return path;
    }

    private cloneLevelConfig(config: LevelConfig): LevelConfig {
        return JSON.parse(JSON.stringify(config));
    }
}
