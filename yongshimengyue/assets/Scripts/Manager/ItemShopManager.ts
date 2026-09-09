const { ccclass, property } = cc._decorator;

import mGameData from '../Data/GameData';
import TipsManager from './TipsManager';

interface ItemShopConfig {
    id: string;
    name: string;
    type: string;
    price: number;
    amount: number;
    duration?: number;
}

// Cocos Creator 2.4 项目脚本使用文件名作为组件标识，避免显式类名导致编辑器重复注册。
@ccclass
export default class ItemShopManager extends cc.Component {
    @property(cc.Node)
    closeBtn: cc.Node = null;

    @property(cc.Label)
    goldLabel: cc.Label = null;

    @property(cc.Node)
    content: cc.Node = null;

    private configs: ItemShopConfig[] = [];
    private bound: boolean = false;

    onLoad(): void {
        this.cacheNodes();
        this.bindEvents();
        this.loadConfig();
        cc.director.on('goldUpdated', this.refreshView, this);
        cc.director.on('staminaUpdated', this.refreshView, this);
    }

    onEnable(): void {
        this.refreshView();
    }

    onDestroy(): void {
        cc.director.off('goldUpdated', this.refreshView, this);
        cc.director.off('staminaUpdated', this.refreshView, this);
        if (this.closeBtn && cc.isValid(this.closeBtn)) {
            this.closeBtn.off(cc.Node.EventType.TOUCH_END, this.close, this);
        }
    }

    private loadConfig(): void {
        cc.loader.loadRes('config/goods', cc.JsonAsset, (error: Error, asset: cc.JsonAsset) => {
            if (error || !asset || !asset.json) {
                cc.error('ItemShopManager: goods config load failed.', error);
                TipsManager.show('商店配置加载失败。');
                return;
            }

            const raw = Array.isArray(asset.json.shopItems) ? asset.json.shopItems : [];
            this.configs = raw.map((item: any) => ({
                id: String(item && item.id || '').trim(),
                name: String(item && item.name || '商品'),
                type: String(item && item.type || '').trim(),
                price: Math.max(0, Math.floor(Number(item && item.price) || 0)),
                amount: Math.max(1, Math.floor(Number(item && item.amount) || 1)),
                duration: Math.max(0, Number(item && item.duration) || 0),
            })).filter((item: ItemShopConfig) => !!item.id && item.price >= 0);
            this.refreshView();
        });
    }

    private cacheNodes(): void {
        if (!this.closeBtn || !cc.isValid(this.closeBtn)) {
            this.closeBtn = cc.find('BtnClose', this.node);
        }
        if (!this.goldLabel || !cc.isValid(this.goldLabel.node)) {
            const goldNode = cc.find('Gold', this.node);
            this.goldLabel = goldNode ? goldNode.getComponent(cc.Label) : null;
        }
        if (!this.content || !cc.isValid(this.content)) {
            this.content = cc.find('ScrollView/view/content', this.node);
        }
    }

    private bindEvents(): void {
        if (!this.closeBtn || this.bound) {
            return;
        }
        this.closeBtn.on(cc.Node.EventType.TOUCH_END, this.close, this);
        this.bound = true;
    }

    private close(): void {
        this.node.active = false;
    }

    private refreshView(): void {
        if (this.goldLabel && cc.isValid(this.goldLabel.node)) {
            this.goldLabel.string = `${Math.max(0, Number(mGameData.currentGold) || 0)}`;
        }
        if (!this.content || !cc.isValid(this.content)) {
            return;
        }

        for (let i = 0; i < this.content.childrenCount; i++) {
            const child = this.content.children[i];
            if (child.name.indexOf('ShopItem_') === 0) {
                child.active = false;
            }
        }

        for (let i = 0; i < this.configs.length; i++) {
            this.updateCard(this.configs[i]);
        }
    }

    private updateCard(config: ItemShopConfig): void {
        const row = this.content.getChildByName(`ShopItem_${config.id}`);
        if (!row || !cc.isValid(row)) {
            cc.warn(`ItemShopManager: static shop card not found for ${config.id}.`);
            return;
        }

        row.active = true;
        this.setCardLabel(row, 'Name', config.name);
        this.setCardLabel(row, 'Info', this.getItemInfo(config));
        this.setCardLabel(row, 'Stock', `库存 ${this.getStock(config)}`);

        const buy = row.getChildByName('BuyButton');
        if (!buy) {
            cc.warn(`ItemShopManager: BuyButton not found for ${config.id}.`);
            return;
        }

        const labelNode = buy.getChildByName('Label');
        const buyLabel = labelNode ? labelNode.getComponent(cc.Label) : null;
        if (buyLabel) {
            buyLabel.string = `${config.price}`;
        }

        buy.off(cc.Node.EventType.TOUCH_END);
        buy.on(cc.Node.EventType.TOUCH_END, () => this.buy(config), this);
    }

    private setCardLabel(row: cc.Node, name: string, text: string): void {
        const node = row.getChildByName(name);
        const label = node ? node.getComponent(cc.Label) : null;
        if (label) {
            label.string = text;
        }
    }

    private buy(config: ItemShopConfig): void {
        if (config.type === 'stamina' && mGameData.currentStamina >= mGameData.maxStamina) {
            TipsManager.show('体力已满。');
            return;
        }
        if ((Number(mGameData.currentGold) || 0) < config.price) {
            TipsManager.show('钻石不足。');
            return;
        }

        mGameData.currentGold -= config.price;
        mGameData.SaveGoldData();
        cc.director.emit('goldUpdated');

        if (config.type === 'stamina') {
            mGameData.addStamina(config.amount);
        } else if (config.type === 'water_freeze') {
            mGameData.addGoodsInventory(config.id, config.amount);
        }

        TipsManager.show('购买成功。');
        this.refreshView();
    }

    private getStock(config: ItemShopConfig): number {
        return config.type === 'water_freeze' ? mGameData.getGoodsInventoryAmount(config.id) : mGameData.currentStamina;
    }

    private getItemInfo(config: ItemShopConfig): string {
        if (config.type === 'stamina') {
            return `增加${config.amount}点体力`;
        }
        if (config.type === 'water_freeze') {
            return `黑水停止${config.duration || 5}秒`;
        }
        return '商品';
    }

}
