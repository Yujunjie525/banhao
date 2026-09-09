import {
    _decorator,
    Component,
    director,
    JsonAsset,
    Label,
    Node,
    resources,
} from 'cc';
import { gameConfig } from '../data/gameConfig';
import { localData } from '../data/enums';
import { save } from '../utils/tools';
import { loadPool } from '../../scripts/res/loadPool';
import { emits as tipEmits } from '../../scripts/data/enmus';
import { HeroUpgradeConfig, HeroUpgradeStore } from '../data/heroUpgradeStore';

const { ccclass, property } = _decorator;

@ccclass('QhPanelManager')
export class QhPanelManager extends Component {

    @property(Node)
    closeBtn: Node = null;

    @property(Node)
    QhBtn: Node = null;

    @property(Label)
    l_level: Label = null;
    @property(Label)
    l_level2: Label = null;
    @property(Label)
    l_step: Label = null;
    @property(Label)
    l_step2: Label = null;
    @property(Label)
    l_brightness: Label = null;
    @property(Label)
    l_brightness2: Label = null;
    @property(Label)
    l_light: Label = null;

    private heroUpgradeConfig: HeroUpgradeConfig[] = [];
    private currentLevel = 1;
    private maxLevel = 10;

    onLoad() {
        if (this.closeBtn) {
            this.closeBtn.on(Node.EventType.TOUCH_END, this.onBackClick, this);
        }

        if (this.QhBtn) {
            this.QhBtn.on(Node.EventType.TOUCH_END, this.onQhClick, this);
        }

        this.loadConfig();
    }

    loadConfig() {
        resources.load<JsonAsset>('config/heroUpgrade', (err, asset) => {
            if (!err && asset) {
                this.heroUpgradeConfig = asset.json as HeroUpgradeConfig[];
                HeroUpgradeStore.setConfigs(this.heroUpgradeConfig);
                this.maxLevel = this.heroUpgradeConfig.length;
                this.loadCurrentLevel();
                this.refreshUI();
            }
        });
    }

    loadCurrentLevel() {
        this.currentLevel = HeroUpgradeStore.getCurrentLevel();
        director.emit('staminaUpdate');
    }

    saveCurrentLevel() {
        HeroUpgradeStore.setCurrentLevel(this.currentLevel);
    }

    onEnable() {
        if (this.heroUpgradeConfig.length > 0) {
            this.refreshUI();
        }
    }

    onDisable() {

    }

    isConfigLoaded(): boolean {
        return HeroUpgradeStore.getConfigs().length > 0;
    }

    getCurrentConfig(): HeroUpgradeConfig | null {
        return HeroUpgradeStore.getCurrentConfig();
    }

    getNextConfig(): HeroUpgradeConfig | null {
        return HeroUpgradeStore.getNextConfig();
    }

    refreshUI() {
        const currentConfig = this.getCurrentConfig();
        const nextConfig = this.getNextConfig();

        if (!currentConfig) {
            this.l_level.string = '加载中...';
            if (this.l_level2) this.l_level2.string = '加载中...';
            this.l_step.string = '加载中...';
            if (this.l_step2) this.l_step2.string = '加载中...';
            if (this.l_brightness) this.l_brightness.string = '加载中...';
            if (this.l_brightness2) this.l_brightness2.string = '加载中...';
            this.l_light.string = '加载中...';
            return;
        }

        if (nextConfig) {
            const goldEnough = gameConfig.jinbiNum >= nextConfig.goldCost;

            this.l_level.string = `等级: ${currentConfig.level}`;
            if (this.l_level2) this.l_level2.string = `${nextConfig.level}`;
            this.l_step.string = `步数加成: ${currentConfig.stepBonus}`;
            if (this.l_step2) this.l_step2.string = `${nextConfig.stepBonus}`;
            if (this.l_brightness) this.l_brightness.string = `初始亮度:${currentConfig.initialBrightness}%`;
            if (this.l_brightness2) this.l_brightness2.string = `${nextConfig.initialBrightness}%`;
            this.l_light.string = `${nextConfig.goldCost}${goldEnough ? '' : ''}`;
        } else {
            this.l_level.string = `等级: ${currentConfig.level}`;
            if (this.l_level2) this.l_level2.string = '(已满级)';
            this.l_step.string = `步数加成: +${currentConfig.stepBonus}`;
            if (this.l_step2) this.l_step2.string = '';
            if (this.l_brightness) this.l_brightness.string = `初始亮度: ${currentConfig.initialBrightness}%`;
            if (this.l_brightness2) this.l_brightness2.string = '';
            this.l_light.string = '已满级';
        }
    }

    onBackClick() {
        this.node.active = false;
    }

    onQhClick() {
        const nextConfig = this.getNextConfig();
        if (!nextConfig) {
            this.showToast('已经是满级了。');
            return;
        }

        if (gameConfig.jinbiNum < nextConfig.goldCost) {
            this.showToast('金币不足。');
            return;
        }

        gameConfig.jinbiNum -= nextConfig.goldCost;
        save(localData.jinbiNum, gameConfig.jinbiNum);

        this.currentLevel++;
        this.saveCurrentLevel();

        this.showToast(`强化成功! 当前等级: ${this.currentLevel}。`);
        this.refreshUI();

        this.updateHomeDisplay();
    }

    updateHomeDisplay() {
        director.emit('jinbiNum');
        director.emit('staminaUpdate');
    }

    private showToast(message: string) {
        loadPool.ins.getPoolNode('tips', this.node);
        director.emit(tipEmits.tipMsg, message);
    }

    static getCurrentStepBonus(): number {
        return HeroUpgradeStore.getCurrentStepBonus();
    }

    static getCurrentInitialBrightness(): number {
        return HeroUpgradeStore.getCurrentInitialBrightness();
    }
}
