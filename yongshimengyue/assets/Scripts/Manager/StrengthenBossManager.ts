const { ccclass } = cc._decorator;

import mGameData from '../Data/GameData';
import LocalStorageKeys from '../Data/LocalStorageKeys';
import TipsManager from './TipsManager';

interface BaseUpgradeConfig {
    level: number;
    upgradeCostSoulStone: number;
    baseMaxHp: number;
    startSunflowers: number;
}

interface AttrView {
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

@ccclass
export default class StrengthenBossManager extends cc.Component {
    private static readonly STORAGE_KEY = 'BaseUpgradeLevel';

    private configs: BaseUpgradeConfig[] = [];
    private configLoaded = false;
    private closeBtn: cc.Node = null;
    private itemNode: cc.Node = null;
    private levelView: AttrView = null;
    private soulStoneLabel: cc.Label = null;
    private hpView: AttrView = null;
    private sunflowerView: AttrView = null;
    private buttonNode: cc.Node = null;
    private button: cc.Button = null;
    private costLabel: cc.Label = null;

    public static getStorageKey(): string {
        const userId = cc.sys.localStorage.getItem(LocalStorageKeys.appKey('SLS_USER_ID'));
        return LocalStorageKeys.userKey(this.STORAGE_KEY, userId);
    }

    public static getBaseLevel(): number {
        return Math.max(1, Number(cc.sys.localStorage.getItem(this.getStorageKey())) || 1);
    }

    public static saveBaseLevel(level: number): void {
        cc.sys.localStorage.setItem(this.getStorageKey(), `${Math.max(1, Math.floor(Number(level) || 1))}`);
    }

    onLoad(): void {
        this.cacheView();
        this.bindEvents();
        this.loadConfig();
    }

    onEnable(): void {
        mGameData.GetSoulStoneData();
        this.refreshView();
    }

    onDestroy(): void {
        if (this.closeBtn && cc.isValid(this.closeBtn)) {
            this.closeBtn.off(cc.Node.EventType.TOUCH_END, this.onCloseClick, this);
        }
        if (this.buttonNode && cc.isValid(this.buttonNode)) {
            this.buttonNode.off(cc.Node.EventType.TOUCH_END, this.onUpgradeClick, this);
        }
        cc.director.off('goldUpdated', this.refreshView, this);
        cc.director.off('soulStoneUpdated', this.refreshView, this);
        cc.director.off('baseUpgradeUpdated', this.refreshView, this);
    }

    private cacheView(): void {
        this.closeBtn = cc.find('BtnClose', this.node);
        this.itemNode = cc.find('item1', this.node) || cc.find('item', this.node);
        this.hideUnusedItems();

        this.levelView = this.getAttrView(this.findActiveChildByName(this.itemNode, 'value'));
        const soulStoneNode = this.node.getChildByName('value');
        this.soulStoneLabel = soulStoneNode ? soulStoneNode.getComponent(cc.Label) : null;
        this.hpView = this.getAttrView(this.findActiveChildByName(this.itemNode, 'value1'));
        this.sunflowerView = this.getAttrView(this.findActiveChildByName(this.itemNode, 'value2'));
        this.buttonNode = this.itemNode ? cc.find('Button', this.itemNode) : null;
        this.button = this.buttonNode ? this.buttonNode.getComponent(cc.Button) : null;
        this.costLabel = this.itemNode ? this.getLabel(this.itemNode, 'Button/New Label') : null;
    }

    private hideUnusedItems(): void {
        for (let i = 2; i <= 4; i++) {
            const node = cc.find(`item${i}`, this.node);
            if (node) {
                node.active = false;
            }
        }
    }

    private bindEvents(): void {
        if (this.closeBtn) {
            this.closeBtn.on(cc.Node.EventType.TOUCH_END, this.onCloseClick, this);
        }
        if (this.buttonNode) {
            this.buttonNode.on(cc.Node.EventType.TOUCH_END, this.onUpgradeClick, this);
        }
        cc.director.on('goldUpdated', this.refreshView, this);
        cc.director.on('soulStoneUpdated', this.refreshView, this);
        cc.director.on('baseUpgradeUpdated', this.refreshView, this);
    }

    private loadConfig(): void {
        this.configs = [];
        this.configLoaded = true;
        this.refreshView();
    }

    private normalizeConfigs(rawList: any[]): BaseUpgradeConfig[] {
        const list = Array.isArray(rawList) ? rawList : [];
        return list.map((item) => ({
            level: Math.max(1, Number(item.level) || 1),
            upgradeCostSoulStone: Math.max(0, Number(item.upgradeCostSoulStone) || 0),
            baseMaxHp: Math.max(1, Number(item.baseMaxHp) || 1),
            startSunflowers: Math.max(0, Number(item.startSunflowers) || 0),
        })).sort((a, b) => a.level - b.level);
    }

    private refreshView = (): void => {
        if (!this.configLoaded || !this.itemNode) {
            return;
        }

        const currentConfig = this.getCurrentConfig();
        if (!currentConfig) {
            this.itemNode.active = false;
            return;
        }

        this.itemNode.active = true;
        const nextConfig = this.getNextConfig(currentConfig.level);
        const isMax = !nextConfig;

        if (this.soulStoneLabel) {
            this.soulStoneLabel.string = `${mGameData.currentSoulStone}`;
        }
        this.setAttrView(this.levelView, currentConfig.level, nextConfig ? nextConfig.level : currentConfig.level, isMax);
        this.setAttrView(this.hpView, currentConfig.baseMaxHp, nextConfig ? nextConfig.baseMaxHp : currentConfig.baseMaxHp, isMax);
        this.setAttrView(this.sunflowerView, currentConfig.startSunflowers, nextConfig ? nextConfig.startSunflowers : currentConfig.startSunflowers, isMax);

        if (this.costLabel) {
            this.costLabel.string = isMax ? '\u5df2\u6ee1\u7ea7' : `${nextConfig.upgradeCostSoulStone}`;
        }
        if (this.button) {
            this.button.interactable = !isMax;
        }
    };

    private onUpgradeClick = (): void => {
        if (!this.configLoaded) {
            return;
        }

        const currentConfig = this.getCurrentConfig();
        const nextConfig = currentConfig ? this.getNextConfig(currentConfig.level) : null;
        if (!currentConfig || !nextConfig) {
            TipsManager.show('\u5df2\u7ecf\u5347\u7ea7\u5230\u6700\u9ad8\u7b49\u7ea7\u3002');
            return;
        }

        const cost = Math.max(0, Number(nextConfig.upgradeCostSoulStone) || 0);
        if (!mGameData.spendSoulStone(cost)) {
            TipsManager.show('\u82f1\u9b42\u77f3\u4e0d\u8db3\u3002');
            return;
        }

        StrengthenBossManager.saveBaseLevel(nextConfig.level);
        mGameData.requestSyncUserData();
        cc.director.emit('baseUpgradeUpdated');
        TipsManager.show('\u5347\u7ea7\u6210\u529f\u3002');
        this.refreshView();
    };

    private onCloseClick(): void {
        this.node.active = false;
    }

    private getCurrentConfig(): BaseUpgradeConfig {
        if (!this.configs.length) {
            return null;
        }

        const savedLevel = Math.min(this.configs[this.configs.length - 1].level, StrengthenBossManager.getBaseLevel());
        const found = this.configs.find((item) => item.level === savedLevel);
        return found || this.configs[0];
    }

    private getNextConfig(level: number): BaseUpgradeConfig {
        const index = this.configs.findIndex((item) => item.level === level);
        return index >= 0 && index < this.configs.length - 1 ? this.configs[index + 1] : null;
    }

    private setAttrView(view: AttrView, currentValue: number, nextValue: number, isMax: boolean): void {
        if (!view) {
            return;
        }
        if (view.root) {
            view.root.active = true;
        }
        if (view.oldValue) {
            view.oldValue.string = `${currentValue}`;
        }
        if (view.newValue) {
            view.newValue.string = `${nextValue}`;
            view.newValue.node.active = !isMax;
        }
        if (view.arrow) {
            view.arrow.active = !isMax;
        }

        this.updateAttrLayout(view, isMax);
    }

    private getAttrView(root: cc.Node): AttrView {
        if (!root) {
            return null;
        }

        const oldNode = cc.find('old', root);
        const newNode = cc.find('new', root);
        const arrowNode = cc.find('arrow', root);
        const valueNode = oldNode || root;
        const oldLeft = valueNode ? this.getNodeLeft(valueNode) : 0;
        const oldRight = valueNode ? this.getNodeRight(valueNode) : 0;
        const arrowLeft = arrowNode ? this.getNodeLeft(arrowNode) : oldRight;
        const arrowRight = arrowNode ? this.getNodeRight(arrowNode) : arrowLeft;
        const newLeft = newNode ? this.getNodeLeft(newNode) : arrowRight;

        return {
            root,
            oldValue: oldNode ? oldNode.getComponent(cc.Label) : root.getComponent(cc.Label),
            newValue: newNode ? newNode.getComponent(cc.Label) : null,
            arrow: arrowNode,
            oldLeft,
            oldY: valueNode ? valueNode.y : 0,
            arrowY: arrowNode ? arrowNode.y : 0,
            newY: newNode ? newNode.y : 0,
            gapOldToArrow: arrowLeft - oldRight,
            gapArrowToNew: newLeft - arrowRight,
        };
    }

    private updateAttrLayout(view: AttrView, isMax: boolean): void {
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

    private refreshLabelWidth(label: cc.Label): void {
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
}
