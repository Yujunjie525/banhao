const { ccclass, property } = cc._decorator;

import mGameData from '../Data/GameData';
import LocalStorageKeys from '../Data/LocalStorageKeys';
import TipsManager from './TipsManager';
import { GameBackendApi, GameBackendResponse } from '../../script/Api/GameBackendApi';
import ResUtils from '../../script/common/utils/ResUtils';

interface ShopConfig {
    id: number;
    icon: string;
    name: string;
    type: number;
    skill: string;
    useBuy: number;
}

@ccclass
export default class ShopManager extends cc.Component {
    @property(cc.Node)
    closeBtn: cc.Node = null;

    @property(cc.Label)
    zs_num: cc.Label = null;

    @property(cc.Node)
    buyButton: cc.Node = null;

    @property
    buyDiamondAmount: number = 60;

    @property(cc.Node)
    item: cc.Node = null;

    @property(cc.Node)
    staminaItemNode: cc.Node = null;

    @property(cc.Node)
    tipsPanel: cc.Node = null;

    @property(cc.Label)
    tipsLabel: cc.Label = null;

    @property(cc.Node)
    confirmBtn: cc.Node = null;

    @property(cc.Node)
    cancelBtn: cc.Node = null;

    @property(cc.SpriteFrame)
    btn1Normal: cc.SpriteFrame = null;

    @property(cc.SpriteFrame)
    btn1Disabled: cc.SpriteFrame = null;

    private shopConfigs: ShopConfig[] = [];
    private scrollView: cc.ScrollView = null;
    private contentNode: cc.Node = null;
    private templateNode: cc.Node = null;
    private iconCache: { [key: string]: cc.SpriteFrame } = {};
    private isPurchasingDiamond: boolean = false;

    onLoad() {
        this.cacheNodes();
        this.bindEvents();
        this.loadConfig();
        cc.director.on('goldUpdated', this.updateGoldLabel, this);
    }

    onEnable() {
        this.updateUI();
    }

    onDestroy() {
        cc.director.off('goldUpdated', this.updateGoldLabel, this);

        if (this.closeBtn) {
            this.closeBtn.off(cc.Node.EventType.TOUCH_END, this.onBackClick, this);
        }

        if (this.buyButton) {
            this.buyButton.off(cc.Node.EventType.TOUCH_END, this.onBuyButtonClick, this);
        }
    }

    private cacheNodes() {
        if (!this.closeBtn || !cc.isValid(this.closeBtn)) {
            this.closeBtn = this.node.getChildByName('BtnClose');
        }

        if (!this.buyButton || !cc.isValid(this.buyButton)) {
            this.buyButton = this.node.getChildByName('BuyButton');
        }

        const scrollNode = cc.find('ScrollView', this.node);
        this.scrollView = scrollNode ? scrollNode.getComponent(cc.ScrollView) : null;
        this.contentNode = cc.find('ScrollView/view/content', this.node);
        if (!this.item || !cc.isValid(this.item)) {
            this.item = this.node.getChildByName('item');
        }

        this.templateNode = this.item && cc.isValid(this.item) ? this.item : null;
        if (this.templateNode) {
            this.templateNode.active = false;
        } else if (this.contentNode && this.contentNode.childrenCount > 0) {
            this.templateNode = cc.instantiate(this.contentNode.children[0]);
            this.templateNode.name = 'shop_item_template';
            this.templateNode.active = true;
        } else {
            cc.warn('ShopManager: item template node not found.');
        }
    }

    private bindEvents() {
        if (this.closeBtn) {
            this.closeBtn.off(cc.Node.EventType.TOUCH_END, this.onBackClick, this);
            this.closeBtn.on(cc.Node.EventType.TOUCH_END, this.onBackClick, this);
        }

        if (this.buyButton) {
            this.buyButton.off(cc.Node.EventType.TOUCH_END, this.onBuyButtonClick, this);
            this.buyButton.on(cc.Node.EventType.TOUCH_END, this.onBuyButtonClick, this);
        }
    }

    private loadConfig() {
        cc.loader.loadRes('config/shop', cc.JsonAsset, (error: Error, asset: cc.JsonAsset) => {
            if (error) {
                console.error('Shop config load failed:', error);
                TipsManager.show('商店配置加载失败。');
                return;
            }

            const rawList = asset && Array.isArray(asset.json) ? asset.json : [];
            this.shopConfigs = rawList
                .map((item: any) => this.normalizeConfig(item))
                .filter((item) => item.id > 0);
            this.refreshShopList();
        });
    }

    private normalizeConfig(raw: any): ShopConfig {
        return {
            id: Number(raw.id) || 0,
            icon: `${raw.icon || ''}`,
            name: `${raw.name || ''}`,
            type: Number(raw.type) || 0,
            skill: `${raw.skill || ''}`,
            useBuy: Math.max(0, Number(raw.useBuy) || 0),
        };
    }

    onBackClick() {
        this.node.active = false;
        cc.director.emit('goldUpdated');
    }

    async onBuyButtonClick() {
        // if (this.isPurchasingDiamond) {
        //     return;
        // }

        const username = cc.sys.localStorage.getItem(LocalStorageKeys.appKey('SLS_USERNAME'));
        if (!username) {
            TipsManager.show('请先登录。');
            return;
        }

        const diamondAmount = Math.max(0, Number(this.buyDiamondAmount) || 0);
        if (diamondAmount <= 0) {
            TipsManager.show('购买配置异常。');
            return;
        }

        this.isPurchasingDiamond = true;
        // this.setBuyButtonInteractable(false);

        const gainedGold = 500;
        mGameData.currentGold += gainedGold;
        mGameData.SaveGoldData();
        cc.director.emit('goldUpdated');
        TipsManager.show(`获得${gainedGold}钻石。`);
        // try {
        //     const result = await GameBackendApi.payDiamond(username, diamondAmount);
        //     console.log('Shop buy result:', result);

        //     if (result && result.code === 0) {
        //         const serverGold = this.getGoldValueFromPayResult(result);
        //         if (serverGold != null) {
        //             mGameData.currentGold = serverGold;
        //         } else {
        //             mGameData.currentGold += diamondAmount;
        //         }

        //         mGameData.SaveGoldData();
        //         this.updateUI();
        //         cc.director.emit('goldUpdated');
        //         TipsManager.show(result.msg || `购买成功，获得${diamondAmount}金币`);
        //     } else {
        //         TipsManager.show((result && result.msg) || '购买失败');
        //     }
        // } catch (error) {
        //     console.error('Shop buy failed:', error);
        //     const message = error instanceof Error ? error.message : '购买失败';
        //     TipsManager.show(message || '购买失败');
        // } finally {
        //     this.isPurchasingDiamond = false;
        //     this.setBuyButtonInteractable(true);
        // }
    }

    private updateUI() {
        this.updateGoldLabel();
        this.setBuyButtonInteractable(!this.isPurchasingDiamond);

        if (this.shopConfigs.length > 0) {
            this.refreshShopList();
        }
    }

    private updateGoldLabel() {
        if (this.zs_num) {
            this.zs_num.string = `${mGameData.currentGold || 0}`;
        }
    }

    private refreshShopList() {
        if (!this.contentNode || !cc.isValid(this.contentNode) || !this.templateNode) {
            return;
        }

        this.contentNode.destroyAllChildren();
        const itemNodes: cc.Node[] = [];

        for (let i = 0; i < this.shopConfigs.length; i++) {
            const itemNode = this.createItemNode(this.shopConfigs[i], i);
            itemNode.parent = this.contentNode;
            itemNodes.push(itemNode);
        }

        const layout = this.contentNode.getComponent(cc.Layout);
        if (layout) {
            layout.paddingBottom = this.getLayoutBottomPadding(itemNodes);
            layout.updateLayout();
        }

        this.scheduleOnce(() => {
            const currentLayout = this.contentNode && cc.isValid(this.contentNode)
                ? this.contentNode.getComponent(cc.Layout)
                : null;
            if (currentLayout) {
                currentLayout.updateLayout();
            }

            if (this.scrollView && cc.isValid(this.scrollView.node)) {
                this.scrollView.scrollToTop(0);
            }
        }, 0);
    }

    private getLayoutBottomPadding(itemNodes: cc.Node[]): number {
        let bottomPadding = 0;
        for (let i = 0; i < itemNodes.length; i++) {
            bottomPadding = Math.max(bottomPadding, this.getNodeBottomOverflow(itemNodes[i]));
        }

        return Math.ceil(bottomPadding);
    }

    private getNodeBottomOverflow(node: cc.Node): number {
        if (!node || !cc.isValid(node)) {
            return 0;
        }

        let minY = -node.height * node.anchorY;
        this.collectNodeVerticalBounds(node, node, (childMinY) => {
            minY = Math.min(minY, childMinY);
        });

        const nodeBottom = -node.height * node.anchorY;
        return Math.max(0, nodeBottom - minY);
    }

    private collectNodeVerticalBounds(root: cc.Node, current: cc.Node, onBounds: (minY: number, maxY: number) => void) {
        if (!current || !cc.isValid(current) || !this.isNodeActiveInHierarchy(current)) {
            return;
        }

        const worldRect = current.getBoundingBoxToWorld();
        const bottomLeft = root.convertToNodeSpaceAR(cc.v2(worldRect.xMin, worldRect.yMin));
        const topRight = root.convertToNodeSpaceAR(cc.v2(worldRect.xMax, worldRect.yMax));
        onBounds(bottomLeft.y, topRight.y);

        for (let i = 0; i < current.childrenCount; i++) {
            this.collectNodeVerticalBounds(root, current.children[i], onBounds);
        }
    }

    private isNodeActiveInHierarchy(node: cc.Node): boolean {
        if (!node || !cc.isValid(node)) {
            return false;
        }

        if (node === cc.director.getScene() || node instanceof cc.Scene) {
            return true;
        }

        return node.activeInHierarchy;
    }

    private createItemNode(config: ShopConfig, index: number): cc.Node {
        const itemNode = cc.instantiate(this.templateNode);
        itemNode.name = `shop_item_${config.id || index}`;
        itemNode.active = true;

        this.updateItemIcon(itemNode, config.icon);
        this.setLabelText(itemNode, 'name', config.name);
        this.setLabelText(itemNode, 'skill', config.skill);
        this.setLabelText(itemNode, 'New Label', config.type === 1 ? '火车' : '体力');
        this.setLabelText(this.findChildByName(itemNode, 'off'), 'value', `${config.useBuy}`);

        if (config.type === 1) {
            this.refreshTrainItemState(itemNode, config);
        } else if (config.type === 2) {
            this.refreshStaminaItemState(itemNode, config);
        }

        return itemNode;
    }

    private refreshTrainItemState(itemNode: cc.Node, config: ShopConfig) {
        const offNode = this.findChildByName(itemNode, 'off');
        const onNode = this.findChildByName(itemNode, 'on');
        const useNode = onNode ? this.findChildByName(onNode, 'use') : null;
        const useingNode = onNode ? this.findChildByName(onNode, 'useing') : null;

        const isUnlocked = typeof (mGameData as any).isTrainUnlocked === 'function'
            ? (mGameData as any).isTrainUnlocked(config.id)
            : config.id === 1;
        const currentTrainId = typeof (mGameData as any).getCurrentTrainId === 'function'
            ? (mGameData as any).getCurrentTrainId()
            : 1;
        const isUsing = currentTrainId === config.id;

        if (offNode) {
            offNode.active = !isUnlocked;
            offNode.off(cc.Node.EventType.TOUCH_END);
            if (!isUnlocked) {
                offNode.on(cc.Node.EventType.TOUCH_END, () => this.onClickBuyTrain(config), this);
            }
        }

        if (onNode) {
            onNode.active = isUnlocked;
            onNode.off(cc.Node.EventType.TOUCH_END);
            onNode.on(cc.Node.EventType.TOUCH_END, () => this.onClickUseTrain(config), this);
        }

        if (useNode) {
            useNode.active = isUnlocked && !isUsing;
        }

        if (useingNode) {
            useingNode.active = isUnlocked && isUsing;
        }
    }

    private refreshStaminaItemState(itemNode: cc.Node, config: ShopConfig) {
        const offNode = this.findChildByName(itemNode, 'off');
        const onNode = this.findChildByName(itemNode, 'on');

        if (offNode) {
            offNode.active = true;
            offNode.off(cc.Node.EventType.TOUCH_END);
            offNode.on(cc.Node.EventType.TOUCH_END, () => this.onClickBuyStamina(config), this);
        }

        if (onNode) {
            onNode.active = false;
            onNode.off(cc.Node.EventType.TOUCH_END);
        }
    }

    private onClickBuyTrain(config: ShopConfig) {
        if (typeof (mGameData as any).isTrainUnlocked === 'function' && (mGameData as any).isTrainUnlocked(config.id)) {
            this.refreshShopList();
            return;
        }

        if (mGameData.currentGold < config.useBuy) {
            TipsManager.show('钻石不足。');
            return;
        }

        mGameData.currentGold -= config.useBuy;
        mGameData.SaveGoldData();
        if (typeof (mGameData as any).unlockTrain === 'function') {
            (mGameData as any).unlockTrain(config.id);
        }
        if (Array.isArray((mGameData as any).unlockedRoles)) {
            const roleIndex = config.id - 1;
            if (roleIndex >= 0) {
                (mGameData as any).unlockedRoles[roleIndex] = true;
                if (typeof (mGameData as any).SaveUnlockedRolesData === 'function') {
                    (mGameData as any).SaveUnlockedRolesData();
                }
            }
        }
        this.saveOwnedHeroId(config.id);

        cc.director.emit('trainUnlocked', config.id);
        cc.director.emit('goldUpdated');
        this.refreshShopList();
        TipsManager.show('购买成功。');
    }

    private saveOwnedHeroId(heroId: number) {
        const id = Math.max(1, Number(heroId) || 1);
        const userId = cc.sys.localStorage.getItem(LocalStorageKeys.appKey('SLS_USER_ID'));
        const keys = [
            LocalStorageKeys.userKey('LevelSelectOwnedHeroIds', userId),
            LocalStorageKeys.appKey('LevelSelectOwnedHeroIds'),
        ];

        for (let i = 0; i < keys.length; i++) {
            const key = keys[i];
            const raw = cc.sys.localStorage.getItem(key);
            let ids: number[] = [];
            if (raw) {
                try {
                    ids = JSON.parse(raw) || [];
                } catch (error) {
                    ids = [];
                }
            }

            ids = ids
                .map((item: any) => Number(item) || 0)
                .filter((item: number, index: number, array: number[]) => item > 0 && array.indexOf(item) === index);
            if (ids.indexOf(1) < 0) {
                ids.unshift(1);
            }
            if (ids.indexOf(id) < 0) {
                ids.push(id);
            }
            ids.sort((a: number, b: number) => a - b);
            cc.sys.localStorage.setItem(key, JSON.stringify(ids));
        }
    }

    private onClickUseTrain(config: ShopConfig) {
        if (typeof (mGameData as any).isTrainUnlocked === 'function' && !(mGameData as any).isTrainUnlocked(config.id)) {
            return;
        }

        if (typeof (mGameData as any).setCurrentTrainId === 'function') {
            (mGameData as any).setCurrentTrainId(config.id);
        }
        if (typeof (mGameData as any).setCurrentKingId === 'function') {
            (mGameData as any).setCurrentKingId(config.id);
        }

        this.refreshShopList();
    }

    private onClickBuyStamina(config: ShopConfig) {
        if (mGameData.currentStamina >= mGameData.maxStamina) {
            TipsManager.show('体力已满。');
            return;
        }

        if (mGameData.currentGold < config.useBuy) {
            TipsManager.show('钻石不足。');
            return;
        }

        mGameData.currentGold -= config.useBuy;
        mGameData.currentStamina = Math.min(mGameData.maxStamina, mGameData.currentStamina + 10);
        mGameData.SaveGoldData();
        mGameData.SaveStaminaData();
        cc.director.emit('goldUpdated');
        this.refreshShopList();
        TipsManager.show('购买成功，获得10点体力。');
    }

    private updateItemIcon(itemNode: cc.Node, configPath: string) {
        const assetPath = this.normalizeAssetPath(configPath);
        if (!assetPath) {
            return;
        }

        const iconNode = this.findChildByName(itemNode, 'icon');
        const blueNode = this.findChildByName(itemNode, 'icon_blue');
        const redNode = this.findChildByName(itemNode, 'icon_red');

        const targetNode = iconNode && cc.isValid(iconNode) ? iconNode : blueNode;
        this.resetIconPosition(iconNode);
        this.resetIconPosition(blueNode);
        this.resetIconPosition(redNode);

        if (iconNode && cc.isValid(iconNode)) {
            iconNode.active = targetNode === iconNode;
        }
        if (blueNode && cc.isValid(blueNode)) {
            blueNode.active = targetNode === blueNode;
        }
        if (redNode && cc.isValid(redNode)) {
            redNode.active = false;
        }

        // this.setNodePosition(targetNode, 0, 0);
        this.updateSpriteNode(targetNode, assetPath);
    }

    private updateSpriteNode(targetNode: cc.Node, assetPath: string) {
        if (!targetNode || !cc.isValid(targetNode) || !assetPath) {
            return;
        }

        const sprite = targetNode.getComponent(cc.Sprite);
        if (!sprite) {
            return;
        }

        if (this.iconCache[assetPath]) {
            sprite.spriteFrame = this.iconCache[assetPath];
            return;
        }

        ResUtils.loadAsset<cc.SpriteFrame>(assetPath, cc.SpriteFrame, (error: Error, asset: cc.SpriteFrame) => {
            if (error || !asset) {
                console.error('Shop icon load failed:', assetPath, error);
                return;
            }

            this.iconCache[assetPath] = asset;
            if (cc.isValid(sprite)) {
                sprite.spriteFrame = asset;
            }
        });
    }

    private setNodePosition(targetNode: cc.Node, x: number, y: number) {
        if (!targetNode || !cc.isValid(targetNode)) {
            return;
        }
        if (typeof targetNode['__defaultX'] !== 'number') {
            targetNode['__defaultX'] = targetNode.x;
        }
        if (typeof targetNode['__defaultY'] !== 'number') {
            targetNode['__defaultY'] = targetNode.y;
        }
        targetNode.x = x;
        targetNode.y = y;
    }

    private resetIconPosition(targetNode: cc.Node) {
        if (!targetNode || !cc.isValid(targetNode)) {
            return;
        }
        if (typeof targetNode['__defaultX'] !== 'number') {
            targetNode['__defaultX'] = targetNode.x;
        }
        if (typeof targetNode['__defaultY'] !== 'number') {
            targetNode['__defaultY'] = targetNode.y;
        }
        targetNode.x = targetNode['__defaultX'];
        targetNode.y = targetNode['__defaultY'];
    }

    private normalizeAssetPath(configPath: string): string {
        if (!configPath) {
            return '';
        }

        if (configPath.indexOf(':') >= 0) {
            return configPath;
        }

        if (configPath.startsWith('subgame/')) {
            return `subgame:${configPath.substring('subgame/'.length)}`;
        }

        if (configPath.startsWith('resources/')) {
            return `resources:${configPath.substring('resources/'.length)}`;
        }

        return `resources:${configPath}`;
    }

    private setBuyButtonInteractable(enabled: boolean) {
        return;
        if (!this.buyButton) {
            return;
        }

        const button = this.buyButton.getComponent(cc.Button);
        if (button) {
            button.enableAutoGrayEffect = true;
            button.interactable = enabled;
        }
    }

    private setLabelText(root: cc.Node, nodeName: string, text: string) {
        const node = this.findChildByName(root, nodeName);
        if (node && cc.isValid(node)) {
            node.active = true;
        }
        const label = node && cc.isValid(node) ? node.getComponent(cc.Label) : null;
        if (label) {
            label.string = text;
            label.enabled = true;
            if (nodeName === 'skill') {
                node.width = Math.max(node.width, 160);
            }
        }
    }

    private findLabelByName(root: cc.Node, nodeName: string): cc.Label | null {
        const node = this.findChildByName(root, nodeName);
        if (!node || !cc.isValid(node)) {
            return null;
        }

        return node.getComponent(cc.Label);
    }

    private findChildByName(root: cc.Node, nodeName: string): cc.Node | null {
        if (!root || !cc.isValid(root)) {
            return null;
        }

        if (root.name === nodeName) {
            return root;
        }

        for (let i = 0; i < root.childrenCount; i++) {
            const result = this.findChildByName(root.children[i], nodeName);
            if (result) {
                return result;
            }
        }

        return null;
    }

    private getGoldValueFromPayResult(result: GameBackendResponse<any>): number | null {
        if (!result || !result.data) {
            return null;
        }

        const data: any = result.data;
        const candidates = [data.diamond, data.gold, data.currentGold, data.current_gold];
        for (let i = 0; i < candidates.length; i++) {
            const value = Number(candidates[i]);
            if (!isNaN(value) && value >= 0) {
                return value;
            }
        }

        return null;
    }
}
