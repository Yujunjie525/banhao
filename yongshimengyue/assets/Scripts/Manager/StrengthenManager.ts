const { ccclass } = cc._decorator;

import mGameData from '../Data/GameData';
import LocalStorageKeys from '../Data/LocalStorageKeys';
import TipsManager from './TipsManager';
import StrengthenBossManager from './StrengthenBossManager';
import ResUtils from '../../script/common/utils/ResUtils';

interface LevelUpConfig {
    id: number;
    lv: number;
    speed?: string | number;
    upperLimit?: string | number;
    consume?: string | number;
    lvConsume: string;
    add: number;
}

interface ConsumeInfo {
    goodsId: string;
    amount: number;
}

interface GoodsConfig {
    id: string;
    name: string;
    res: string;
}

interface HeroConfig {
    id: number;
    name: string;
    baseHp: number;
    baseAtk: number;
}

interface BaseUpgradeConfig {
    level: number;
    upgradeCostSoulStone: number;
    baseMaxHp: number;
    startSunflowers: number;
}

interface StrengthenAttrView {
    root: cc.Node;
    oldValue: cc.Label;
    newValue: cc.Label;
    arrow: cc.Node;
    oldLeft: number;
    oldY: number;
    arrowY: number;
    newY: number;
    gapOldToArrow: number;
    gapArrowToNew: number;
}

interface StrengthenItemView {
    id: number;
    root: cc.Node;
    iconSprite: cc.Sprite;
    levelView: StrengthenAttrView;
    attackView: StrengthenAttrView;
    rangeView: StrengthenAttrView;
    buttonNode: cc.Node;
    button: cc.Button;
    background: cc.Node;
    backgroundSprite: cc.Sprite;
    costIcon: cc.Node;
    costLabel: cc.Label;
    costLabelOriginX: number;
    costLabelOriginY: number;
    costLabelOriginWidth: number;
    costLabelOriginAnchorX: number;
    costLabelOriginAlign: cc.Label.HorizontalAlign;
}

@ccclass
export default class StrengthenManager extends cc.Component {
    private static cachedConfigsById: { [key: number]: LevelUpConfig[] } = {};
    private static isLoadingConfig = false;
    private static pendingCallbacks: Array<() => void> = [];
    private static lastDebugSpeedSnapshot: { [key: number]: string } = {};

    private goldLabel: cc.Label = null;
    private coinLabel: cc.Label = null;
    private closeBtn: cc.Node = null;
    private leftBtn: cc.Node = null;
    private rightBtn: cc.Node = null;
    private toggleContainer: cc.Node = null;
    private toggleButtons: cc.Node[] = [];
    private itemViews: StrengthenItemView[] = [];
    private configsById: { [key: number]: LevelUpConfig[] } = {};
    private configLoaded = false;
    private heroesLoaded = false;
    private goodsLoaded = false;
    private baseLoaded = false;
    private heroConfigs: HeroConfig[] = [];
    private goodsConfigs: { [key: string]: GoodsConfig } = {};
    private baseConfigs: BaseUpgradeConfig[] = [];
    private selectedHeroIndex = 0;
    private selectedBaseIndex = 0;
    private iconCache: { [key: string]: cc.SpriteFrame } = {};

    public static ensureLevelConfigLoaded(callback?: () => void) {
        if (Object.keys(this.cachedConfigsById).length > 0) {
            callback && callback();
            return;
        }

        callback && this.pendingCallbacks.push(callback);
        if (this.isLoadingConfig) {
            return;
        }

        this.isLoadingConfig = true;
        this.cachedConfigsById = {};
        this.isLoadingConfig = false;
        const callbacks = this.pendingCallbacks.slice();
        this.pendingCallbacks = [];
        callbacks.forEach((item) => item && item());
    }

    public static getTrainSpeed(trainId: number, fallback: number = 180): number {
        const config = this.getCurrentConfig(trainId);
        const speed = config ? Number(config.speed) : NaN;
        const resolvedSpeed = !isNaN(speed) && speed > 0 ? speed : fallback;
        const savedLevel = config ? config.lv : this.getTrainLevel(trainId);
        const debugSnapshot = `${savedLevel}|${config ? config.speed : 'null'}|${resolvedSpeed}|${fallback}`;
        if (this.lastDebugSpeedSnapshot[trainId] !== debugSnapshot) {
            this.lastDebugSpeedSnapshot[trainId] = debugSnapshot;
        }
        return resolvedSpeed;
    }

    public static getCurrentConfig(trainId: number): LevelUpConfig {
        const configs = this.cachedConfigsById[trainId] || [];
        if (!configs.length) {
            return null;
        }

        const currentLevel = this.getTrainLevel(trainId, configs);
        const found = configs.find((item) => item.lv === currentLevel);
        return found || configs[0];
    }

    private static buildConfigsById(list: any[]): { [key: number]: LevelUpConfig[] } {
        const result: { [key: number]: LevelUpConfig[] } = {};
        for (let i = 0; i < list.length; i++) {
            const item = this.normalizeConfig(list[i]);
            if (!item.id) {
                continue;
            }
            if (!result[item.id]) {
                result[item.id] = [];
            }
            result[item.id].push(item);
        }

        Object.keys(result).forEach((key) => {
            result[Number(key)].sort((a, b) => a.lv - b.lv);
        });

        return result;
    }

    private static normalizeConfig(item: any): LevelUpConfig {
        return {
            id: Number(item.id) || 0,
            lv: Number(item.lv) || 1,
            speed: item.speed,
            upperLimit: item.upperLimit,
            consume: item.consume,
            lvConsume: `${item.lvConsume || ''}`,
            add: Number(item.add) || 0,
        };
    }

    private static getTrainLevel(trainId: number, configs?: LevelUpConfig[]): number {
        const trainConfigs = configs || this.cachedConfigsById[trainId] || [];
        if (!trainConfigs.length) {
            return 1;
        }

        const saved = cc.sys.localStorage.getItem(this.getTrainLevelStorageKey(trainId));
        if (!saved) {
            return trainConfigs[0].lv;
        }

        const level = Number(saved) || trainConfigs[0].lv;
        const found = trainConfigs.find((item) => item.lv === level);
        return found ? level : trainConfigs[0].lv;
    }

    private static getTrainLevelStorageKey(trainId: number): string {
        const userId = cc.sys.localStorage.getItem(LocalStorageKeys.appKey('SLS_USER_ID'));
        return LocalStorageKeys.userKey(`StrengthenLevel_${trainId}`, userId);
    }

    onLoad() {
        this.cacheView();
        this.bindEvents();
        this.loadConfig();
        this.loadHeroesConfig();
        this.loadGoodsConfig();
        this.loadBaseConfig();
        this.updateGoldLabel();
    }

    onEnable() {
        this.refreshView();
    }

    onDestroy() {
        this.unbindEvents();
    }

    private cacheView() {
        this.goldLabel = this.getLabel(this.node, 'zs_num');
        this.coinLabel = this.getLabel(this.node, 'Coin') || this.getLabelByNodeName(this.node, 'Coin');
        this.closeBtn = cc.find('BtnClose', this.node);
        this.leftBtn = cc.find('LeftBtn', this.node);
        this.rightBtn = cc.find('RightBtn', this.node);
        this.toggleContainer = cc.find('ToggleContainer', this.node);
        this.toggleButtons = this.getToggleButtons();
        this.itemViews = this.buildItemViews();
    }

    private bindEvents() {
        this.closeBtn && this.closeBtn.on(cc.Node.EventType.TOUCH_END, this.onCloseClick, this);
        this.leftBtn && this.leftBtn.on(cc.Node.EventType.TOUCH_END, this.onLeftClick, this);
        this.rightBtn && this.rightBtn.on(cc.Node.EventType.TOUCH_END, this.onRightClick, this);
        this.toggleButtons.forEach((item) => item.on('toggle', this.onToggleClick, this));
        this.itemViews.forEach((view) => {
            if (view.buttonNode) {
                view.buttonNode.on(cc.Node.EventType.TOUCH_END, () => this.onUpgradeClick(view.id), this);
            }
        });
        cc.director.on('goldUpdated', this.updateGoldLabel, this);
        cc.director.on('soulStoneUpdated', this.updateGoldLabel, this);
        cc.director.on('goodsInventoryUpdated', this.updateGoldLabel, this);
    }

    private unbindEvents() {
        if (this.closeBtn && cc.isValid(this.closeBtn)) {
            this.closeBtn.off(cc.Node.EventType.TOUCH_END, this.onCloseClick, this);
        }
        if (this.leftBtn && cc.isValid(this.leftBtn)) {
            this.leftBtn.off(cc.Node.EventType.TOUCH_END, this.onLeftClick, this);
        }
        if (this.rightBtn && cc.isValid(this.rightBtn)) {
            this.rightBtn.off(cc.Node.EventType.TOUCH_END, this.onRightClick, this);
        }
        this.toggleButtons.forEach((item) => item && cc.isValid(item) && item.off('toggle', this.onToggleClick, this));
        this.itemViews.forEach((view) => {
            if (view.buttonNode && cc.isValid(view.buttonNode)) {
                view.buttonNode.targetOff(this);
            }
        });
        cc.director.off('goldUpdated', this.updateGoldLabel, this);
        cc.director.off('soulStoneUpdated', this.updateGoldLabel, this);
        cc.director.off('goodsInventoryUpdated', this.updateGoldLabel, this);
    }

    private loadConfig() {
        StrengthenManager.ensureLevelConfigLoaded(() => {
            this.configsById = StrengthenManager.cachedConfigsById;
            this.configLoaded = true;
            this.refreshView();
        });
    }

    private loadHeroesConfig() {
        this.heroConfigs = [];
        this.heroesLoaded = true;
        this.refreshView();
    }

    private loadGoodsConfig() {
        const loadedConfig = cc.resources.get('config/goods', cc.JsonAsset) as cc.JsonAsset;
        if (loadedConfig && loadedConfig.json) {
            this.applyGoodsConfig(loadedConfig.json);
            return;
        }

        cc.resources.load('config/goods', cc.JsonAsset, (error: Error, asset: cc.JsonAsset) => {
            if (error || !asset || !asset.json) {
                console.error('Strengthen goods config load failed:', error);
                this.goodsConfigs = {};
                this.goodsLoaded = true;
                this.refreshView();
                return;
            }
            this.applyGoodsConfig(asset.json);
        });
    }

    private loadBaseConfig() {
        this.baseConfigs = [];
        this.baseLoaded = true;
        this.refreshView();
    }

    private applyHeroesConfig(configJson: any) {
        const list = Array.isArray(configJson && configJson.heroes) ? configJson.heroes : [];
        this.heroConfigs = list
            .map((item: any) => ({
                id: Number(item && item.id) || 0,
                name: String(item && item.name || ''),
                baseHp: Number(item && item.baseHp) || 0,
                baseAtk: Number(item && item.baseAtk) || 0,
            }))
            .filter((item) => item.id > 0);
        this.selectedHeroIndex = Math.max(0, Math.min(this.selectedHeroIndex, this.heroConfigs.length - 1));
        this.heroesLoaded = true;
        this.refreshView();
    }

    private applyGoodsConfig(configJson: any) {
        const list = Array.isArray(configJson && configJson.goods)
            ? configJson.goods
            : (Array.isArray(configJson && configJson.heroes) ? configJson.heroes : []);
        const result: { [key: string]: GoodsConfig } = {};
        list.forEach((item: any) => {
            const id = String(item && item.id || '').trim();
            if (!id) {
                return;
            }
            result[id] = {
                id,
                name: String(item && item.name || id),
                res: String(item && item.res || ''),
            };
        });
        this.goodsConfigs = result;
        this.goodsLoaded = true;
        this.refreshView();
    }

    private applyBaseConfig(configJson: any) {
        const list = Array.isArray(configJson && configJson.baseUpgrade) ? configJson.baseUpgrade : [];
        this.baseConfigs = list.map((item: any) => ({
            level: Math.max(1, Number(item && item.level) || 1),
            upgradeCostSoulStone: Math.max(0, Number(item && item.upgradeCostSoulStone) || 0),
            baseMaxHp: Math.max(1, Number(item && item.baseMaxHp) || 1),
            startSunflowers: Math.max(0, Number(item && item.startSunflowers) || 0),
        })).sort((a, b) => a.level - b.level);
        this.selectedBaseIndex = this.getCurrentBaseIndex();
        this.baseLoaded = true;
        this.refreshView();
    }

    private refreshView() {
        this.updateGoldLabel();
        this.updateSwitchButtons();
        this.updateToggleFontColors();
        if (!this.configLoaded || !this.heroesLoaded || !this.goodsLoaded || !this.baseLoaded) {
            return;
        }

        if (this.isBaseMode()) {
            this.itemViews.forEach((view) => this.refreshBaseItemView(view));
            return;
        }

        const currentHero = this.getCurrentHeroConfig();
        this.itemViews.forEach((view) => {
            view.id = currentHero ? currentHero.id : view.id;
            this.refreshItemView(view);
        });
    }

    private refreshItemView(view: StrengthenItemView) {
        const currentHero = this.getHeroConfigById(view.id);
        const currentConfig = this.getCurrentConfig(view.id);
        if (!currentHero || !currentConfig) {
            view.root.active = false;
            return;
        }

        view.root.active = true;

        const nextConfig = this.getNextConfig(view.id);
        const consumeConfig = this.getUpgradeConsumeConfig(view.id, currentConfig);
        const consumeInfo = this.parseConsumeInfo(consumeConfig.lvConsume);
        const goodsConfig = this.getGoodsConfig(consumeInfo.goodsId);
        const isMax = !nextConfig;
        const currentHp = this.calcHeroLevelAttr(currentHero.baseHp, currentConfig);
        const nextHp = nextConfig ? this.calcHeroLevelAttr(currentHero.baseHp, nextConfig) : currentHp;
        const currentAtk = this.calcHeroLevelAttr(currentHero.baseAtk, currentConfig);
        const nextAtk = nextConfig ? this.calcHeroLevelAttr(currentHero.baseAtk, nextConfig) : currentAtk;

        this.updateItemIcon(view.id, view);
        this.updateCostIcon(view, goodsConfig);
        this.updateCoinLabel(goodsConfig);
        this.setAttrTitle(view.levelView, '等级：');
        this.setAttrTitle(view.attackView, '生命值：');
        this.setAttrTitle(view.rangeView, '攻击力：');
        this.setAttrView(view.levelView, currentConfig.lv, nextConfig ? nextConfig.lv : currentConfig.lv, isMax);
        this.setAttrView(view.attackView, currentHp, nextHp, isMax);
        this.setAttrView(view.rangeView, currentAtk, nextAtk, isMax);

        if (view.costIcon) {
            view.costIcon.active = !isMax;
        }
        if (view.costLabel) {
            view.costLabel.string = isMax ? '已满级' : `${consumeInfo.amount}`;
            this.updateCostLabelLayout(view, isMax);
        }
        if (view.background) {
            view.background.color = isMax ? cc.color(160, 160, 160) : cc.Color.WHITE;
        }
        if (view.backgroundSprite) {
            view.backgroundSprite.setState(isMax ? cc.Sprite.State.GRAY : cc.Sprite.State.NORMAL);
        }
        if (view.button) {
            view.button.interactable = true;
        }
    }

    private setAttrView(view: StrengthenAttrView, currentValue: number, nextValue: number, isMax: boolean) {
        if (!view) {
            return;
        }

        if (view.oldValue) {
            view.oldValue.string = this.formatValue(currentValue);
        }
        if (view.newValue) {
            view.newValue.string = this.formatValue(nextValue);
            view.newValue.node.active = !isMax;
        }
        if (view.arrow) {
            view.arrow.active = !isMax;
        }

        this.updateAttrLayout(view, isMax);
    }

    private updateCostLabelLayout(view: StrengthenItemView, isMax: boolean) {
        if (!view || !view.costLabel || !view.costLabel.node) {
            return;
        }

        const labelNode = view.costLabel.node;
        view.costLabel.horizontalAlign = isMax ? cc.Label.HorizontalAlign.CENTER : view.costLabelOriginAlign;
        if (isMax && view.background && cc.isValid(view.background)) {
            const backgroundAnchorY = typeof (view.background as any).anchorY === 'number' ? (view.background as any).anchorY : 0.5;
            labelNode.anchorX = 0.5;
            labelNode.width = view.background.width;
            labelNode.x = view.background.x + (0.5 - this.getNodeAnchorX(view.background)) * view.background.width;
            labelNode.y = view.background.y + (0.5 - backgroundAnchorY) * view.background.height;
        } else {
            labelNode.anchorX = view.costLabelOriginAnchorX;
            labelNode.width = view.costLabelOriginWidth;
            labelNode.x = view.costLabelOriginX;
            labelNode.y = view.costLabelOriginY;
        }
    }

    private onUpgradeClick(id: number) {
        if (!this.configLoaded) {
            return;
        }

        if (this.isBaseMode()) {
            this.onBaseUpgradeClick();
            return;
        }

        const currentConfig = this.getCurrentConfig(id);
        const nextConfig = this.getNextConfig(id);
        if (!currentConfig || !nextConfig) {
            TipsManager.show('已经升级到最高等级。');
            return;
        }

        const consumeConfig = this.getUpgradeConsumeConfig(id, currentConfig);
        const consumeInfo = this.parseConsumeInfo(consumeConfig.lvConsume);
        const goodsConfig = this.getGoodsConfig(consumeInfo.goodsId);
        if (this.getGoodsAmount(consumeInfo.goodsId) < consumeInfo.amount) {
            TipsManager.show(`${goodsConfig.name}不足`);
            return;
        }

        this.spendGoods(consumeInfo.goodsId, consumeInfo.amount);
        this.saveTrainLevel(id, nextConfig.lv);
        this.emitGoodsUpdated(consumeInfo.goodsId);
        TipsManager.show('升级成功。');
        this.refreshView();
    }

    private onBaseUpgradeClick() {
        if (!this.baseLoaded) {
            return;
        }

        const currentConfig = this.getCurrentBaseConfig();
        const nextConfig = currentConfig ? this.getNextBaseConfig(currentConfig.level) : null;
        if (!currentConfig || !nextConfig) {
            TipsManager.show('已经升级到最高等级。');
            return;
        }

        const cost = Math.max(0, Number(nextConfig.upgradeCostSoulStone) || 0);
        const goodsConfig = this.getGoodsConfig('2');
        if (this.getGoodsAmount('2') < cost) {
            TipsManager.show(`${goodsConfig.name}不足`);
            return;
        }

        this.spendGoods('2', cost);
        StrengthenBossManager.saveBaseLevel(nextConfig.level);
        this.selectedBaseIndex = this.getCurrentBaseIndex();
        mGameData.requestSyncUserData();
        cc.director.emit('baseUpgradeUpdated');
        this.emitGoodsUpdated('2');
        TipsManager.show('升级成功。');
        this.refreshView();
    }

    private updateGoldLabel = () => {
        if (this.goldLabel) {
            this.goldLabel.string = `${mGameData.currentGold || 0}`;
        }
        this.updateCurrentCoinLabel();
    };

    private onLeftClick() {
        if (this.isBaseMode()) {
            return;
        }

        if (this.selectedHeroIndex <= 0) {
            return;
        }
        this.selectedHeroIndex -= 1;
        this.refreshView();
    }

    private onRightClick() {
        if (this.isBaseMode()) {
            return;
        }

        if (this.selectedHeroIndex >= this.heroConfigs.length - 1) {
            return;
        }
        this.selectedHeroIndex += 1;
        this.refreshView();
    }

    private onToggleClick() {
        this.scheduleOnce(() => {
            if (this.isBaseMode()) {
                this.selectedBaseIndex = this.getCurrentBaseIndex();
            }
            this.updateToggleFontColors();
            this.refreshView();
        }, 0);
    }

    private onCloseClick() {
        this.node.active = false;
    }

    private getToggleButtons(): cc.Node[] {
        const root = this.toggleContainer || this.node;
        if (!root) {
            return [];
        }

        return root.children.filter((child) => !!child.getComponent(cc.Toggle));
    }

    private updateToggleFontColors() {
        const selectedColor = cc.Color.WHITE;
        const unselectedColor = new cc.Color().fromHEX('#8E8E8E');
        const toggles = this.toggleButtons && this.toggleButtons.length > 0 ? this.toggleButtons : this.getToggleButtons();
        toggles.forEach((toggleNode) => {
            const toggle = toggleNode.getComponent(cc.Toggle);
            const color = toggle && toggle.isChecked ? selectedColor : unselectedColor;
            const labels = this.findLabelsInNode(toggleNode);
            labels.forEach((label) => {
                label.node.color = color;
            });
        });
    }

    private findLabelsInNode(root: cc.Node): cc.Label[] {
        const result: cc.Label[] = [];
        if (!root) {
            return result;
        }

        const label = root.getComponent(cc.Label);
        if (label) {
            result.push(label);
        }
        for (let i = 0; i < root.childrenCount; i++) {
            result.push(...this.findLabelsInNode(root.children[i]));
        }
        return result;
    }

    private isBaseMode(): boolean {
        const toggle2 = this.toggleButtons.find((item) => item && item.name === 'toggle2');
        const toggle = toggle2 ? toggle2.getComponent(cc.Toggle) : null;
        return !!(toggle && toggle.isChecked);
    }

    private getCurrentHeroConfig(): HeroConfig {
        if (!this.heroConfigs.length) {
            return null;
        }
        return this.heroConfigs[Math.max(0, Math.min(this.selectedHeroIndex, this.heroConfigs.length - 1))] || null;
    }

    private getHeroConfigById(id: number): HeroConfig {
        return this.heroConfigs.find((item) => item.id === id) || null;
    }

    private updateSwitchButtons() {
        if (this.isBaseMode()) {
            const baseCount = this.baseConfigs.length;
            if (this.leftBtn && cc.isValid(this.leftBtn)) {
                this.leftBtn.active = false;
            }
            if (this.rightBtn && cc.isValid(this.rightBtn)) {
                this.rightBtn.active = false;
            }
            return;
        }

        const heroCount = this.heroConfigs.length;
        if (this.leftBtn && cc.isValid(this.leftBtn)) {
            this.leftBtn.active = heroCount > 1 && this.selectedHeroIndex > 0;
        }
        if (this.rightBtn && cc.isValid(this.rightBtn)) {
            this.rightBtn.active = heroCount > 1 && this.selectedHeroIndex < heroCount - 1;
        }
    }

    private getCurrentBaseIndex(): number {
        if (!this.baseConfigs.length) {
            return 0;
        }

        const level = StrengthenBossManager.getBaseLevel();
        const index = this.baseConfigs.findIndex((item) => item.level === level);
        return Math.max(0, index >= 0 ? index : 0);
    }

    private getCurrentBaseConfig(): BaseUpgradeConfig {
        if (!this.baseConfigs.length) {
            return null;
        }

        const index = Math.max(0, Math.min(this.selectedBaseIndex, this.baseConfigs.length - 1));
        return this.baseConfigs[index] || this.baseConfigs[0];
    }

    private getNextBaseConfig(level: number): BaseUpgradeConfig {
        const index = this.baseConfigs.findIndex((item) => item.level === level);
        return index >= 0 && index < this.baseConfigs.length - 1 ? this.baseConfigs[index + 1] : null;
    }

    private getCurrentConfig(id: number): LevelUpConfig {
        return StrengthenManager.getCurrentConfig(id);
    }

    private getNextConfig(id: number): LevelUpConfig {
        const configs = this.configsById[id] || [];
        if (!configs.length) {
            return null;
        }

        const currentConfig = this.getCurrentConfig(id);
        if (!currentConfig) {
            return null;
        }

        const currentIndex = configs.findIndex((item) => item.lv === currentConfig.lv);
        return currentIndex >= 0 && currentIndex < configs.length - 1 ? configs[currentIndex + 1] : null;
    }

    private getConfigByLevel(id: number, level: number): LevelUpConfig {
        const configs = this.configsById[id] || [];
        return configs.find((item) => item.lv === level) || null;
    }

    private getUpgradeConsumeConfig(id: number, currentConfig: LevelUpConfig): LevelUpConfig {
        return this.getConfigByLevel(id, currentConfig.lv) || currentConfig;
    }

    private parseConsumeInfo(value: string): ConsumeInfo {
        const parts = `${value || ''}`.split('_');
        return {
            goodsId: String(parts[0] || '').trim(),
            amount: Math.max(0, Math.floor(Number(parts[1]) || 0)),
        };
    }

    private getGoodsConfig(goodsId: string): GoodsConfig {
        const id = String(goodsId || '').trim();
        return this.goodsConfigs[id] || {
            id,
            name: id,
            res: '',
        };
    }

    private getGoodsAmount(goodsId: string): number {
        const id = String(goodsId || '').trim();
        if (id === '1') {
            return Math.max(0, Number(mGameData.currentGold) || 0);
        }
        if (id === '2') {
            return Math.max(0, Number(mGameData.currentSoulStone) || 0);
        }
        return Math.max(0, Number(mGameData.goodsInventory && mGameData.goodsInventory[id]) || 0);
    }

    private spendGoods(goodsId: string, amount: number) {
        const id = String(goodsId || '').trim();
        const count = Math.max(0, Math.floor(Number(amount) || 0));
        if (!id || count <= 0) {
            return;
        }

        if (id === '1') {
            mGameData.currentGold = Math.max(0, (Number(mGameData.currentGold) || 0) - count);
            mGameData.SaveGoldData();
            return;
        }
        if (id === '2') {
            mGameData.currentSoulStone = Math.max(0, (Number(mGameData.currentSoulStone) || 0) - count);
            mGameData.SaveSoulStoneData();
            return;
        }

        if (!mGameData.goodsInventory) {
            mGameData.goodsInventory = {};
        }
        mGameData.goodsInventory[id] = Math.max(0, (Number(mGameData.goodsInventory[id]) || 0) - count);
        mGameData.SaveGoodsInventoryData();
    }

    private emitGoodsUpdated(goodsId: string) {
        const id = String(goodsId || '').trim();
        if (id === '1') {
            cc.director.emit('goldUpdated');
        } else if (id === '2') {
            cc.director.emit('soulStoneUpdated');
        } else {
            cc.director.emit('goodsInventoryUpdated');
        }
    }

    private refreshBaseItemView(view: StrengthenItemView) {
        this.selectedBaseIndex = this.getCurrentBaseIndex();
        const currentConfig = this.getCurrentBaseConfig();
        if (!currentConfig) {
            view.root.active = false;
            return;
        }

        view.root.active = true;

        const nextConfig = this.getNextBaseConfig(currentConfig.level);
        const isMax = !nextConfig;
        const goodsConfig = this.getGoodsConfig('2');
        const consumeAmount = nextConfig ? nextConfig.upgradeCostSoulStone : 0;

        this.updateBaseIcon(view);
        this.updateCostIcon(view, goodsConfig);
        this.updateCoinLabel(goodsConfig);
        this.setAttrTitle(view.levelView, '等级：');
        this.setAttrTitle(view.attackView, '生命值：');
        this.setAttrTitle(view.rangeView, '初始化太阳花：');
        this.setAttrView(view.levelView, currentConfig.level, nextConfig ? nextConfig.level : currentConfig.level, isMax);
        this.setAttrView(view.attackView, currentConfig.baseMaxHp, nextConfig ? nextConfig.baseMaxHp : currentConfig.baseMaxHp, isMax);
        this.setAttrView(view.rangeView, currentConfig.startSunflowers, nextConfig ? nextConfig.startSunflowers : currentConfig.startSunflowers, isMax);

        if (view.costIcon) {
            view.costIcon.active = !isMax;
        }
        if (view.costLabel) {
            view.costLabel.string = isMax ? '已满级' : `${consumeAmount}`;
            this.updateCostLabelLayout(view, isMax);
        }
        if (view.background) {
            view.background.color = isMax ? cc.color(160, 160, 160) : cc.Color.WHITE;
        }
        if (view.backgroundSprite) {
            view.backgroundSprite.setState(isMax ? cc.Sprite.State.GRAY : cc.Sprite.State.NORMAL);
        }
        if (view.button) {
            view.button.interactable = true;
        }
    }

    private updateCoinLabel(goodsConfig: GoodsConfig) {
        if (!this.coinLabel || !goodsConfig) {
            return;
        }

        this.coinLabel.string = `${goodsConfig.name}：${this.getGoodsAmount(goodsConfig.id)}`;
    }

    private updateCurrentCoinLabel() {
        if (!this.configLoaded || !this.goodsLoaded) {
            return;
        }

        if (this.isBaseMode()) {
            this.updateCoinLabel(this.getGoodsConfig('2'));
            return;
        }

        const currentHero = this.getCurrentHeroConfig();
        const currentConfig = currentHero ? this.getCurrentConfig(currentHero.id) : null;
        if (!currentConfig) {
            return;
        }

        const consumeConfig = this.getUpgradeConsumeConfig(currentHero.id, currentConfig);
        const consumeInfo = this.parseConsumeInfo(consumeConfig.lvConsume);
        this.updateCoinLabel(this.getGoodsConfig(consumeInfo.goodsId));
    }

    private saveTrainLevel(id: number, level: number) {
        cc.sys.localStorage.setItem(StrengthenManager.getTrainLevelStorageKey(id), `${level}`);
        mGameData.requestSyncUserData();
    }

    private calcHeroLevelAttr(baseValue: number, config: LevelUpConfig): number {
        return (config.lv + config.add / 100) * baseValue;
    }

    private setAttrTitle(view: StrengthenAttrView, title: string) {
        if (!view || !view.root) {
            return;
        }

        const label = view.root.getComponent(cc.Label);
        if (label) {
            label.string = title;
        }
    }

    private formatValue(value: number): string {
        return `${Number(value.toFixed(3))}`;
    }

    private updateAttrLayout(view: StrengthenAttrView, isMax: boolean) {
        if (!view || !view.oldValue || !view.oldValue.node) {
            return;
        }

        this.refreshLabelWidth(view.oldValue);
        view.oldValue.node.x = view.oldLeft + this.getNodeAnchorX(view.oldValue.node) * view.oldValue.node.width;
        view.oldValue.node.y = view.oldY;

        if (isMax || !view.arrow || !view.newValue || !view.newValue.node) {
            return;
        }

        this.refreshLabelWidth(view.newValue);

        const oldRight = this.getNodeRight(view.oldValue.node);
        const arrowLeft = oldRight + view.gapOldToArrow;
        view.arrow.x = arrowLeft + (1 - this.getNodeAnchorX(view.arrow)) * view.arrow.width;
        view.arrow.y = view.arrowY;

        const newLeft = this.getNodeRight(view.arrow) + view.gapArrowToNew;
        view.newValue.node.x = newLeft + this.getNodeAnchorX(view.newValue.node) * view.newValue.node.width;
        view.newValue.node.y = view.newY;
    }

    private updateItemIcon(id: number, view: StrengthenItemView) {
        if (!view.iconSprite) {
            return;
        }

        const iconPath = `subgame:ui_wgyzt/juese/role_${id}`;
        if (this.iconCache[iconPath]) {
            view.iconSprite.spriteFrame = this.iconCache[iconPath];
            return;
        }

        ResUtils.loadAsset<cc.SpriteFrame>(iconPath, cc.SpriteFrame, (error: Error, asset: cc.SpriteFrame) => {
            if (error || !asset) {
                console.error('强化图标加载失败:', id, iconPath, error);
                return;
            }

            this.iconCache[iconPath] = asset;
            if (view.iconSprite && cc.isValid(view.iconSprite.node)) {
                view.iconSprite.spriteFrame = asset;
            }
        });
    }

    private updateBaseIcon(view: StrengthenItemView) {
        if (!view || !view.iconSprite) {
            return;
        }

        view.iconSprite.spriteFrame = null;
    }

    private updateCostIcon(view: StrengthenItemView, goodsConfig: GoodsConfig) {
        if (!view || !view.costIcon) {
            return;
        }

        const sprite = view.costIcon.getComponent(cc.Sprite);
        if (!sprite) {
            return;
        }

        if (!goodsConfig || !goodsConfig.res) {
            return;
        }

        const iconPath = `subgame:ui_wgyzt/main/${goodsConfig.res}`;
        if (this.iconCache[iconPath]) {
            sprite.spriteFrame = this.iconCache[iconPath];
            return;
        }

        ResUtils.loadAsset<cc.SpriteFrame>(iconPath, cc.SpriteFrame, (error: Error, asset: cc.SpriteFrame) => {
            if (error || !asset) {
                console.error('强化消耗图标加载失败:', iconPath, error);
                return;
            }

            this.iconCache[iconPath] = asset;
            if (sprite && cc.isValid(sprite.node)) {
                sprite.spriteFrame = asset;
            }
        });
    }

    private buildItemViews(): StrengthenItemView[] {
        const itemNode = cc.find('item', this.node);
        const itemNodes: cc.Node[] = itemNode ? [itemNode] : [];

        return itemNodes.map((root, index) => {
            const buttonNode = cc.find('Button', this.node) || this.findNodeByName(this.node, 'Button');
            const background = buttonNode ? cc.find('Background', buttonNode) || this.findNodeByName(buttonNode, 'Background') : null;
            const costIcon = buttonNode ? cc.find('New Sprite', buttonNode) || this.findNodeByName(buttonNode, 'New Sprite') : null;
            const costLabel = buttonNode ? this.getLabel(buttonNode, 'New Label') || this.getLabelByNodeName(buttonNode, 'New Label') : null;
            if (!buttonNode || !background || !costIcon || !costLabel) {
                console.warn(
                    'Strengthen button node missing:',
                    this.getNodePath(root),
                    'button=', !!buttonNode,
                    'background=', !!background,
                    'costIcon=', !!costIcon,
                    'costLabel=', !!costLabel,
                    'children=', buttonNode ? buttonNode.children.map((child) => child.name).join(',') : this.node.children.map((child) => child.name).join(',')
                );
            }
            return {
                id: index + 1,
                root,
                iconSprite: this.getSprite(root, 'icon'),
                levelView: this.getAttrViewByNode(this.findActiveChildByName(root, 'value')),
                attackView: this.getAttrViewByNode(this.findActiveChildByName(root, 'value1')),
                rangeView: this.getAttrViewByNode(this.findActiveChildByName(root, 'value2')),
                buttonNode,
                button: buttonNode ? buttonNode.getComponent(cc.Button) : null,
                background,
                backgroundSprite: background ? background.getComponent(cc.Sprite) : null,
                costIcon,
                costLabel,
                costLabelOriginX: costLabel && costLabel.node ? costLabel.node.x : 0,
                costLabelOriginY: costLabel && costLabel.node ? costLabel.node.y : 0,
                costLabelOriginWidth: costLabel && costLabel.node ? costLabel.node.width : 0,
                costLabelOriginAnchorX: costLabel && costLabel.node ? this.getNodeAnchorX(costLabel.node) : 0.5,
                costLabelOriginAlign: costLabel ? costLabel.horizontalAlign : cc.Label.HorizontalAlign.CENTER,
            };
        });
    }

    private getAttrViewByNode(attrRoot: cc.Node): StrengthenAttrView {
        if (!attrRoot) {
            return null;
        }

        const oldNode = cc.find('old', attrRoot);
        const newNode = cc.find('new', attrRoot);
        const arrowNode = cc.find('arrow', attrRoot);
        const oldLeft = oldNode ? this.getNodeLeft(oldNode) : 0;
        const oldRight = oldNode ? this.getNodeRight(oldNode) : 0;
        const arrowLeft = arrowNode ? this.getNodeLeft(arrowNode) : oldRight;
        const arrowRight = arrowNode ? this.getNodeRight(arrowNode) : arrowLeft;
        const newLeft = newNode ? this.getNodeLeft(newNode) : arrowRight;

        return {
            root: attrRoot,
            oldValue: oldNode ? oldNode.getComponent(cc.Label) : null,
            newValue: newNode ? newNode.getComponent(cc.Label) : null,
            arrow: arrowNode,
            oldLeft,
            oldY: oldNode ? oldNode.y : 0,
            arrowY: arrowNode ? arrowNode.y : 0,
            newY: newNode ? newNode.y : 0,
            gapOldToArrow: arrowLeft - oldRight,
            gapArrowToNew: newLeft - arrowRight,
        };
    }

    private findActiveChildByName(root: cc.Node, name: string): cc.Node {
        if (!root) {
            return null;
        }

        const matched = root.children.filter((child) => child && child.name === name);
        if (!matched.length) {
            return null;
        }

        const activeNode = matched.find((child) => child.active);
        return activeNode || matched[matched.length - 1];
    }

    private getLabel(root: cc.Node, path: string): cc.Label {
        const node = cc.find(path, root);
        return node ? node.getComponent(cc.Label) : null;
    }

    private getLabelByNodeName(root: cc.Node, name: string): cc.Label {
        const node = this.findNodeByName(root, name);
        return node ? node.getComponent(cc.Label) : null;
    }

    private getSprite(root: cc.Node, path: string): cc.Sprite {
        const node = cc.find(path, root);
        return node ? node.getComponent(cc.Sprite) : null;
    }

    private findNodeByName(root: cc.Node, name: string): cc.Node {
        if (!root) {
            return null;
        }
        if (root.name === name) {
            return root;
        }
        for (let i = 0; i < root.childrenCount; i++) {
            const found = this.findNodeByName(root.children[i], name);
            if (found) {
                return found;
            }
        }
        return null;
    }

    private getNodePath(node: cc.Node): string {
        const names: string[] = [];
        let current = node;
        while (current) {
            names.unshift(current.name);
            current = current.parent;
        }
        return names.join('/');
    }

    private refreshLabelWidth(label: cc.Label) {
        if (!label) {
            return;
        }

        const anyLabel = label as any;
        if (typeof anyLabel._forceUpdateRenderData === 'function') {
            anyLabel._forceUpdateRenderData(true);
        }
    }

    private getNodeAnchorX(node: cc.Node): number {
        return typeof (node as any).anchorX === 'number' ? (node as any).anchorX : 0.5;
    }

    private getNodeLeft(node: cc.Node): number {
        return node.x - node.width * this.getNodeAnchorX(node);
    }

    private getNodeRight(node: cc.Node): number {
        return this.getNodeLeft(node) + node.width;
    }
}
