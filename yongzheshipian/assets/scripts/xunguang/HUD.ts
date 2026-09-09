import { _decorator, Button, Component, director, Label, Node, Prefab, ProgressBar, Sprite, SpriteFrame } from 'cc';
import { GameEvents, GameManager, LevelState } from './GameManager';
import { emits } from '../../script/data/enums';
import { gameConfig } from '../../script/data/gameConfig';
import { nodePool } from '../../script/utils/nodePool';
const { ccclass, property } = _decorator;

@ccclass('HUD')
export class HUD extends Component {
    @property(Label)
    stepsLabel: Label = null;

    @property(Label)
    progressLabel: Label = null;

    @property(Label)
    stateLabel: Label = null;

    @property(Label)
    levelNameLabel: Label = null;

    @property(ProgressBar)
    progressBar: ProgressBar = null;

    @property(Button)
    resetButton: Button = null;

    @property(Button)
    continueButton: Button = null;

    @property(Node)
    pauseButton: Node = null;

    @property(Prefab)
    settingsPrefab: Prefab = null;

    @property(Sprite)
    star1: Sprite = null;

    @property(Sprite)
    star2: Sprite = null;

    @property(Sprite)
    star3: Sprite = null;

    @property(SpriteFrame)
    fullStarSpriteFrame: SpriteFrame = null;  // wujiaoxing 满星

    @property(SpriteFrame)
    emptyStarSpriteFrame: SpriteFrame = null;  // wujiaoxing2 空星

    @property
    continueSteps = 10;

    onEnable() {
        director.on(GameEvents.StepsChanged, this.onStepsChanged, this);
        director.on(GameEvents.ProgressChanged, this.onProgressChanged, this);
        director.on(GameEvents.LevelStateChanged, this.onStateChanged, this);

        this.resetButton?.node.on(Node.EventType.TOUCH_END, this.onResetClick, this);
        this.continueButton?.node.on(Node.EventType.TOUCH_END, this.onContinueClick, this);
        this.pauseButton?.on(Node.EventType.TOUCH_END, this.suspendBtn, this);

        if (this.settingsPrefab) {
            nodePool.ins.setPrefab('settings', this.settingsPrefab);
        }
    }

    start() {
        this.refreshFromManager();
        this.updateStarDisplay(3); // 默认显示3颗星
    }

    onDisable() {
        director.off(GameEvents.StepsChanged, this.onStepsChanged, this);
        director.off(GameEvents.ProgressChanged, this.onProgressChanged, this);
        director.off(GameEvents.LevelStateChanged, this.onStateChanged, this);

        this.resetButton?.node.off(Node.EventType.TOUCH_END, this.onResetClick, this);
        this.continueButton?.node.off(Node.EventType.TOUCH_END, this.onContinueClick, this);
        this.pauseButton?.off(Node.EventType.TOUCH_END, this.suspendBtn, this);
    }

    public refreshFromManager() {
        const manager = GameManager.instance;
        if (!manager) {
            return;
        }

        this.onStepsChanged(manager.stepsLeft);
        this.onLevelNameChanged();
        manager.updateProgress();
        this.onStateChanged(manager.state, 'refresh');
    }

    private onStepsChanged(stepsLeft: number) {
        if (this.stepsLabel) {
            const totalSteps = GameManager.instance?.totalSteps || 0;
            const stepsUsed = totalSteps - stepsLeft;
            this.stepsLabel.string = `步数: ${stepsUsed}/${totalSteps}`;
        }
        this.updateCurrentStar(); // 实时更新星级显示
    }

    private onProgressChanged(filled: number, total: number) {
        if (this.progressLabel) {
            this.progressLabel.string = `进度: ${filled}/${total}`;
        }

        if (this.progressBar) {
            this.progressBar.progress = total > 0 ? filled / total : 0;
        }
    }

    private updateCurrentStar() {
        const manager = GameManager.instance;
        if (!manager) return;

        const config = manager.currentConfig;
        const totalSteps = manager.totalSteps;
        const stepsLeft = manager.stepsLeft;
        const stepsUsed = totalSteps - stepsLeft;

        const minSteps = config?.minSteps || config?.steps || totalSteps;
        
        let star = 3;
        if (stepsUsed > minSteps * 1.5) {
            star = 1;
        } else if (stepsUsed > minSteps * 1.2) {
            star = 2;
        }

        this.updateStarDisplay(star);
    }

    private updateStarDisplay(star: number) {
        const stars = [this.star1, this.star2, this.star3];
        for (let i = 0; i < stars.length; i++) {
            const starSprite = stars[i];
            if (starSprite) {
                starSprite.spriteFrame = (i + 1) <= star 
                    ? (this.fullStarSpriteFrame || starSprite.spriteFrame)
                    : (this.emptyStarSpriteFrame || starSprite.spriteFrame);
            }
        }
    }

    private onStateChanged(state: LevelState, reason: string) {
        this.onLevelNameChanged();

        if (this.stateLabel) {
            this.stateLabel.string = this.getStateText(state, reason);
        }

        if (this.continueButton?.node) {
            this.continueButton.node.active = state === LevelState.Fail;
        }
    }

    private onResetClick() {
        GameManager.instance?.resetLevel();
        this.updateStarDisplay(3); // 重置关卡时恢复3星显示
    }

    private onContinueClick() {
        GameManager.instance?.addSteps(this.continueSteps);
    }

    public suspendBtn() {
        gameConfig.gamePause = 1;
        director.emit(emits.gamePause);

        const parent = gameConfig.gameRoot || this.node.parent || this.node;
        nodePool.ins.getPoolNode('settings', parent);
        director.emit(emits.backIsShow, 1);
    }

    private onLevelNameChanged() {
        const config = GameManager.instance?.currentConfig;
        if (!this.levelNameLabel || !config) {
            return;
        }

        const levelText = config.level ? `第${config.level}关` : config.id;
        this.levelNameLabel.string = levelText;
    }

    private getStateText(state: LevelState, reason: string) {
        switch (state) {
            case LevelState.Playing:
                return 'Playing';
            case LevelState.Win:
                return 'Clear';
            case LevelState.Fail:
                return reason === 'black-hole' ? 'Caught' : 'No Steps';
            default:
                return 'Ready';
        }
    }
}
