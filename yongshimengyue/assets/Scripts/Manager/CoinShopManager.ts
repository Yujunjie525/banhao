const { ccclass, property } = cc._decorator;

import mGameData from '../Data/GameData';
import LocalStorageKeys from '../Data/LocalStorageKeys';
import { GameBackendApi, GameBackendResponse } from '../../script/Api/GameBackendApi';
import TipsManager from './TipsManager';
import TipsWndManager from './TipsWnd';

interface DiamondChargeOption {
    id: number;
    price: number;
    diamonds: number;
}

@ccclass
export default class CoinShopManager extends cc.Component {
    @property(cc.Node)
    closeBtn: cc.Node = null;

    @property(cc.Label)
    zs_num: cc.Label = null;

    @property(cc.Node)
    item: cc.Node = null;

    @property({ type: cc.Node, tooltip: '充值确认弹窗根节点' })
    purchaseConfirmPanel: cc.Node = null;

    @property({ type: cc.Label, tooltip: '充值确认弹窗的提示文本' })
    purchaseConfirmLabel: cc.Label = null;

    @property({ type: cc.Node, tooltip: '充值确认弹窗的确定按钮' })
    purchaseConfirmBtn: cc.Node = null;

    @property({ type: cc.Node, tooltip: '充值确认弹窗的取消按钮' })
    purchaseCancelBtn: cc.Node = null;

    @property(cc.SpriteFrame)
    btn6Frame: cc.SpriteFrame = null;

    @property(cc.SpriteFrame)
    btn30Frame: cc.SpriteFrame = null;

    @property(cc.SpriteFrame)
    btn68Frame: cc.SpriteFrame = null;

    @property(cc.SpriteFrame)
    btn198Frame: cc.SpriteFrame = null;

    @property(cc.SpriteFrame)
    btn328Frame: cc.SpriteFrame = null;

    @property(cc.SpriteFrame)
    btn648Frame: cc.SpriteFrame = null;

    private scrollView: cc.ScrollView = null;
    private contentNode: cc.Node = null;
    private templateNode: cc.Node = null;
    private readonly configs: DiamondChargeOption[] = [
        { id: 6, price: 6, diamonds: 60 },
        { id: 30, price: 30, diamonds: 300 },
        { id: 68, price: 68, diamonds: 680 },
        { id: 198, price: 198, diamonds: 1980 },
        { id: 328, price: 328, diamonds: 3280 },
        { id: 648, price: 648, diamonds: 6480 },
    ];
    private purchaseButtons: cc.Node[] = [];
    private purchasing: boolean = false;
    private pendingPurchase: DiamondChargeOption = null;

    onLoad() {
        this.cacheNodes();
        this.bindEvents();
        this.closePurchaseConfirm();
        cc.director.on('goldUpdated', this.updateGoldLabel, this);
    }

    onEnable() {
        this.closePurchaseConfirm();
        this.updateGoldLabel();
        this.refreshList();
    }

    onDestroy() {
        cc.director.off('goldUpdated', this.updateGoldLabel, this);

        if (this.closeBtn) {
            this.closeBtn.off(cc.Node.EventType.TOUCH_END, this.onCloseClick, this);
        }
        if (this.purchaseConfirmBtn) {
            this.purchaseConfirmBtn.off(cc.Node.EventType.TOUCH_END, this.onConfirmPurchase, this);
        }
        if (this.purchaseCancelBtn) {
            this.purchaseCancelBtn.off(cc.Node.EventType.TOUCH_END, this.onCancelPurchase, this);
        }
        for (let i = 0; i < this.purchaseButtons.length; i++) {
            if (this.purchaseButtons[i] && cc.isValid(this.purchaseButtons[i])) {
                this.purchaseButtons[i].targetOff(this);
            }
        }
    }

    private cacheNodes() {
        if (!this.closeBtn || !cc.isValid(this.closeBtn)) {
            this.closeBtn = this.node.getChildByName('BtnClose');
        }

        if (!this.zs_num || !cc.isValid(this.zs_num.node)) {
            const zsNode = this.findChildByName(this.node, 'zs_num');
            this.zs_num = zsNode ? zsNode.getComponent(cc.Label) : null;
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
        }
    }

    private bindEvents() {
        if (this.closeBtn) {
            this.closeBtn.off(cc.Node.EventType.TOUCH_END, this.onCloseClick, this);
            this.closeBtn.on(cc.Node.EventType.TOUCH_END, this.onCloseClick, this);
        }
        if (this.purchaseConfirmBtn) {
            this.purchaseConfirmBtn.off(cc.Node.EventType.TOUCH_END, this.onConfirmPurchase, this);
            this.purchaseConfirmBtn.on(cc.Node.EventType.TOUCH_END, this.onConfirmPurchase, this);
        }
        if (this.purchaseCancelBtn) {
            this.purchaseCancelBtn.off(cc.Node.EventType.TOUCH_END, this.onCancelPurchase, this);
            this.purchaseCancelBtn.on(cc.Node.EventType.TOUCH_END, this.onCancelPurchase, this);
        }
    }

    private refreshList() {
        if (!this.contentNode || !cc.isValid(this.contentNode) || !this.templateNode || !this.configs.length) {
            return;
        }

        this.contentNode.destroyAllChildren();
        this.purchaseButtons = [];
        this.configureVerticalLayout();
        for (let i = 0; i < this.configs.length; i++) {
            const node = this.createItemNode(this.configs[i], i);
            node.parent = this.contentNode;
        }

        this.updateLayout();
    }

    private createItemNode(config: DiamondChargeOption, index: number): cc.Node {
        const itemNode = cc.instantiate(this.templateNode);
        itemNode.name = `diamond_charge_item_${config.id || index}`;
        itemNode.setContentSize(475, 98);
        itemNode.active = true;

        const buttonNode = this.findChildByName(itemNode, 'Btn');
        if (buttonNode) {
            const valueNode = this.findChildByName(buttonNode, 'value');
            if (valueNode) {
                valueNode.active = false;
            }
            const buttonSprite = buttonNode.getComponent(cc.Sprite);
            const buttonFrame = this.getButtonFrame(index);
            if (buttonSprite && buttonFrame) {
                buttonSprite.spriteFrame = buttonFrame;
                buttonSprite.sizeMode = cc.Sprite.SizeMode.RAW;
                buttonNode.setContentSize(254, 68);
            }
            buttonNode.on(cc.Node.EventType.TOUCH_END, () => this.openPurchaseConfirm(config), this);
            if (!buttonNode.getComponent(cc.Button)) {
                buttonNode.addComponent(cc.Button);
            }
            this.purchaseButtons.push(buttonNode);
        }
        this.setLabelText(itemNode, 'name', `${config.diamonds}`);

        return itemNode;
    }

    private configureVerticalLayout(): void {
        const layout = this.contentNode ? this.contentNode.getComponent(cc.Layout) : null;
        if (!layout) {
            return;
        }
        layout.type = cc.Layout.Type.VERTICAL;
        layout.resizeMode = cc.Layout.ResizeMode.CONTAINER;
        layout.paddingTop = 8;
        layout.paddingBottom = 8;
        layout.paddingLeft = 0;
        layout.paddingRight = 0;
        layout.spacingY = 12;
        layout.verticalDirection = cc.Layout.VerticalDirection.TOP_TO_BOTTOM;
    }

    private getButtonFrame(index: number): cc.SpriteFrame {
        const frames = [
            this.btn6Frame,
            this.btn30Frame,
            this.btn68Frame,
            this.btn198Frame,
            this.btn328Frame,
            this.btn648Frame,
        ];
        return frames[index] || null;
    }

    private openPurchaseConfirm(config: DiamondChargeOption): void {
        if (this.purchasing || !config) {
            return;
        }
        if (!this.purchaseConfirmPanel || !this.purchaseConfirmLabel
            || !this.purchaseConfirmBtn || !this.purchaseCancelBtn) {
            TipsWndManager.show('充值确认弹窗尚未配置。');
            return;
        }

        this.pendingPurchase = config;
        this.purchaseConfirmLabel.string = `是否确认支付${config.price}元兑换${config.diamonds}个钻石？`;
        this.setButtonsInteractable(false);
        this.purchaseConfirmPanel.active = true;
        this.purchaseConfirmPanel.zIndex = 1000;
    }

    private closePurchaseConfirm(): void {
        this.pendingPurchase = null;
        if (this.purchaseConfirmPanel && cc.isValid(this.purchaseConfirmPanel)) {
            this.purchaseConfirmPanel.active = false;
        }
    }

    private onCancelPurchase(event?: cc.Event.EventTouch): void {
        event && event.stopPropagation();
        if (this.purchasing) {
            return;
        }
        this.closePurchaseConfirm();
        this.setButtonsInteractable(true);
    }

    private onConfirmPurchase(event?: cc.Event.EventTouch): void {
        event && event.stopPropagation();
        if (this.purchasing || !this.pendingPurchase) {
            return;
        }
        const config = this.pendingPurchase;
        this.pendingPurchase = null;
        this.purchaseConfirmPanel.active = false;
        this.executePurchase(config);
    }

    private async executePurchase(config: DiamondChargeOption): Promise<void> {
        if (this.purchasing) {
            return;
        }

        const username = cc.sys.localStorage.getItem(LocalStorageKeys.appKey('SLS_USERNAME'));
        if (!username) {
            TipsWndManager.show('请先登录。');
            this.setButtonsInteractable(true);
            return;
        }

        this.purchasing = true;
        this.setButtonsInteractable(false);
        try {
            const result = await GameBackendApi.payDiamond(username, config.diamonds);
            if (!result || Number(result.code) !== 0) {
                TipsWndManager.show((result && result.msg) || '操作失败。');
                return;
            }

            const serverBalance = this.getServerBalance(result);
            mGameData.currentGold = serverBalance == null
                ? Math.max(0, Number(mGameData.currentGold) || 0) + config.diamonds
                : serverBalance;
            mGameData.SaveGoldData();
            cc.director.emit('goldUpdated');
            TipsManager.show(result.msg || `兑换成功，获得${config.diamonds}个钻石。`);
        } catch (error) {
            console.error('Diamond charge request failed:', error);
            const message = error instanceof Error ? error.message : '网络请求失败。';
            TipsWndManager.show(message || '网络请求失败。');
        } finally {
            this.purchasing = false;
            this.setButtonsInteractable(true);
        }
    }

    private updateLayout() {
        if (!this.contentNode || !cc.isValid(this.contentNode)) {
            return;
        }

        const layout = this.contentNode.getComponent(cc.Layout);
        if (layout) {
            layout.updateLayout();
        }

        this.scheduleOnce(() => {
            if (this.contentNode && cc.isValid(this.contentNode)) {
                const currentLayout = this.contentNode.getComponent(cc.Layout);
                if (currentLayout) {
                    currentLayout.updateLayout();
                }
            }
            if (this.scrollView && cc.isValid(this.scrollView.node)) {
                this.scrollView.scrollToTop(0);
            }
        }, 0);
    }

    private updateGoldLabel() {
        if (this.zs_num) {
            this.zs_num.string = `${Math.max(0, Number(mGameData.currentGold) || 0)}`;
        }
    }

    private getServerBalance(result: GameBackendResponse<unknown>): number | null {
        if (!result || result.data == null) {
            return null;
        }
        if (typeof result.data === 'number' || typeof result.data === 'string') {
            const direct = Number(result.data);
            return !isNaN(direct) && direct >= 0 ? Math.floor(direct) : null;
        }
        if (typeof result.data !== 'object') {
            return null;
        }
        const data = result.data as { [key: string]: unknown };
        const candidates = [data.diamond, data.gold, data.currentGold, data.current_gold];
        for (let i = 0; i < candidates.length; i++) {
            if (candidates[i] == null || candidates[i] === '') {
                continue;
            }
            const value = Number(candidates[i]);
            if (!isNaN(value) && value >= 0) {
                return Math.floor(value);
            }
        }
        return null;
    }

    private setButtonsInteractable(interactable: boolean): void {
        for (let i = 0; i < this.purchaseButtons.length; i++) {
            const button = this.purchaseButtons[i].getComponent(cc.Button);
            if (button) {
                button.interactable = interactable;
                button.enableAutoGrayEffect = true;
            }
        }
    }

    private onCloseClick() {
        this.closePurchaseConfirm();
        this.node.active = false;
    }

    private setLabelText(root: cc.Node, nodeName: string, text: string) {
        const node = this.findChildByName(root, nodeName);
        const label = node && cc.isValid(node) ? node.getComponent(cc.Label) : null;
        if (label) {
            label.string = text;
        }
    }

    private findChildByName(root: cc.Node, nodeName: string): cc.Node {
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
}
