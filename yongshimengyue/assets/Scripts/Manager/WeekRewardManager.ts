const { ccclass } = cc._decorator;

import mGameData from '../Data/GameData';
import LocalStorageKeys from '../Data/LocalStorageKeys';
import TipsManager from './TipsManager';

interface WeekRewardConfig {
    id: number;
    icon: string;
    rewardId: number;
    rewardNum: number;
}

interface WeekRewardState {
    claimed: boolean;
    claimable: boolean;
    expired: boolean;
    daysRemaining: number;
}

interface WeekRewardItemView {
    root: cc.Node;
    iconSprite: cc.Sprite;
    valueLabel: cc.Label;
    nameLabel: cc.Label;
    buttonNode: cc.Node;
    button: cc.Button;
    buttonSprite?: cc.Sprite;
    normalButtonSprite?: cc.SpriteFrame;
    claimedButtonSprite?: cc.SpriteFrame;
}

@ccclass
export default class WeekRewardManager extends cc.Component {
    private readonly dayNames: string[] = ['周一', '周二', '周三', '周四', '周五', '周六', '周日'];
    private readonly iconIdMap: { [key: string]: string } = {
        '1': '1',
        '2': '2',
        '10': 'zuanshi',
    };
    private readonly columnCount: number = 2;
    private readonly horizontalPadding: number = 10;
    private readonly topPadding: number = 12;
    private readonly bottomPadding: number = 12;
    private readonly rowSpacing: number = 18;

    private rewardList: WeekRewardConfig[] = [];
    private claimedMap: { [key: string]: boolean } = {};
    private iconCache: { [key: string]: cc.SpriteFrame } = {};
    private itemViews: { [key: number]: WeekRewardItemView } = {};
    private listRoot: cc.Node = null;
    private scrollView: cc.ScrollView = null;
    private itemTemplate: cc.Node = null;
    private emptyLabel: cc.Label = null;
    private closeBtn: cc.Node = null;

    private isReady: boolean = false;

    private static instance: WeekRewardManager = null;

    onLoad() {
        WeekRewardManager.instance = this;
        this.cacheView();
        this.loadConfig();
        this.loadClaimedData();
        this.isReady = true;
    }

    onEnable() {
        this.refreshView();
    }

    public showPanel() {
        this.refreshView();
        this.node.active = true;
    }

    private cacheView() {
        this.closeBtn = this.node.getChildByName('BtnClose');
        if (this.closeBtn) {
            this.closeBtn.off(cc.Node.EventType.TOUCH_END, this.onCloseClick, this);
            this.closeBtn.on(cc.Node.EventType.TOUCH_END, this.onCloseClick, this);
        }

        const scrollNode = this.node.getChildByName('ScrollView');
        this.scrollView = scrollNode ? scrollNode.getComponent(cc.ScrollView) : null;
        this.listRoot = this.scrollView && this.scrollView.content
            ? this.scrollView.content
            : cc.find('view/content', this.node);

        this.itemTemplate = this.node.getChildByName('item');
        if (this.itemTemplate) {
            this.itemTemplate.active = false;
        }

        const emptyNode = this.getOrCreateNode(this.node, 'empty_label');
        emptyNode.setPosition(0, -64);
        this.emptyLabel = this.ensureLabel(emptyNode, 'label', '暂无周奖励配置', 28, cc.color(255, 255, 255), cc.v2(0, 0));
        this.emptyLabel.enableWrapText = false;
        emptyNode.active = false;
    }

    private loadConfig() {
        cc.loader.loadRes('config/weekReward', cc.JsonAsset, (error: Error, asset: cc.JsonAsset) => {
            if (error) {
                console.error('加载周奖励配置失败:', error);
                if (this.emptyLabel) {
                    this.emptyLabel.string = '周奖励配置加载失败';
                    this.emptyLabel.node.parent.active = true;
                }
                return;
            }

            const rawList = asset && Array.isArray(asset.json) ? asset.json : [];
            this.rewardList = rawList
                .map((item: any) => this.normalizeConfig(item))
                .filter((item: WeekRewardConfig) => item.id > 0)
                .sort((a, b) => a.id - b.id);
            this.refreshView();
        });
    }

    private normalizeConfig(item: any): WeekRewardConfig {
        return {
            id: Number(item.id) || 0,
            icon: `${item.icon || ''}`,
            rewardId: Number(item.rewardId) || 0,
            rewardNum: Number(item.rewardNum) || 0,
        };
    }

    private refreshView() {
        this.loadClaimedData();
        this.unbindAllItemButtons();

        if (!this.listRoot || !this.itemTemplate || !this.emptyLabel) {
            return;
        }

        this.listRoot.destroyAllChildren();
        this.itemViews = {};

        if (!this.rewardList.length) {
            this.updateContentHeight(0, this.itemTemplate.getContentSize().height);
            this.emptyLabel.string = '暂无周奖励配置';
            this.emptyLabel.node.parent.active = true;
            return;
        }

        this.emptyLabel.node.parent.active = false;

        for (let i = 0; i < this.rewardList.length; i++) {
            const config = this.rewardList[i];
            const itemNode = cc.instantiate(this.itemTemplate);
            itemNode.name = `week_reward_item_${config.id}`;
            itemNode.active = true;
            itemNode.parent = this.listRoot;

            const view = this.createItemView(itemNode);
            if (!view) {
                continue;
            }

            this.itemViews[config.id] = view;
            this.updateItemView(view, config);
            itemNode.setPosition(this.getItemPosition(i, itemNode.getContentSize()));
        }

        this.updateContentHeight(this.rewardList.length, this.itemTemplate.getContentSize().height);
        if (this.scrollView && this.scrollView.scrollToTop) {
            this.scrollView.scrollToTop(0);
        }
    }

    private createItemView(itemNode: cc.Node): WeekRewardItemView | null {
        const iconNode = this.findNodeByName(itemNode, 'icon');
        const valueNode = this.findNodeByName(itemNode, 'value');
        const nameNode = this.findNodeByName(itemNode, 'name') || this.findNodeByName(itemNode, 'time');
        const buttonNode = this.findNodeByName(itemNode, 'Button') || this.findNodeByName(itemNode, 'BtnReward');

        if (!iconNode || !valueNode || !nameNode || !buttonNode) {
            console.warn('周奖励 item 模板缺少必要节点');
            return null;
        }

        let iconSprite = iconNode.getComponent(cc.Sprite);
        if (!iconSprite) {
            iconSprite = iconNode.addComponent(cc.Sprite);
        }

        let valueLabel = valueNode.getComponent(cc.Label);
        if (!valueLabel) {
            valueLabel = valueNode.addComponent(cc.Label);
        }

        let nameLabel = nameNode.getComponent(cc.Label);
        if (!nameLabel) {
            nameLabel = nameNode.addComponent(cc.Label);
        }

        let button = buttonNode.getComponent(cc.Button);
        if (!button) {
            button = buttonNode.addComponent(cc.Button);
        }

        const buttonSprite = this.getButtonSprite(buttonNode, button);

        return {
            root: itemNode,
            iconSprite,
            valueLabel,
            nameLabel,
            buttonNode,
            button,
            buttonSprite,
            normalButtonSprite: (button as any).normalSprite as cc.SpriteFrame,
            claimedButtonSprite: (button as any).disabledSprite as cc.SpriteFrame,
        };
    }

    private updateItemView(view: WeekRewardItemView, config: WeekRewardConfig) {
        const state = this.getRewardState(config);
        view.valueLabel.string = this.getRewardDisplayText(config);
        view.nameLabel.string = this.getDayName(config.id);
        this.applyRewardState(view, config, state);
    }

    private updateContentHeight(itemCount: number, itemHeight: number) {
        if (!this.listRoot) {
            return;
        }

        const rows = Math.max(1, Math.ceil(itemCount / this.columnCount));
        const height = this.topPadding + this.bottomPadding + rows * itemHeight + Math.max(0, rows - 1) * this.rowSpacing;
        const minHeight = this.scrollView && this.scrollView.node
            ? this.scrollView.node.getContentSize().height
            : itemHeight;

        this.listRoot.setContentSize(this.listRoot.width, Math.max(minHeight, height));
    }

    private getItemPosition(index: number, itemSize: cc.Size): cc.Vec2 {
        const row = Math.floor(index / this.columnCount);
        const column = index % this.columnCount;
        const contentWidth = this.listRoot.getContentSize().width;
        const usableWidth = contentWidth - this.horizontalPadding * 2;
        const gap = this.columnCount > 1
            ? Math.max(0, (usableWidth - itemSize.width * this.columnCount) / (this.columnCount - 1))
            : 0;
        const startX = -contentWidth / 2 + this.horizontalPadding + itemSize.width / 2;
        const x = startX + column * (itemSize.width + gap);
        const y = -this.topPadding - itemSize.height / 2 - row * (itemSize.height + this.rowSpacing);
        return cc.v2(x, y);
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

    private unbindAllItemButtons() {
        for (const key in this.itemViews) {
            if (!this.itemViews.hasOwnProperty(key)) {
                continue;
            }
            this.itemViews[key].buttonNode.off(cc.Node.EventType.TOUCH_END);
        }
    }

    private applyRewardState(view: WeekRewardItemView, config: WeekRewardConfig, state: WeekRewardState) {
        this.updateButtonSprite(view, state);
        view.button.enableAutoGrayEffect = false;
        view.button.interactable = true;
        this.updateButtonLabel(view.buttonNode, state);

        view.buttonNode.off(cc.Node.EventType.TOUCH_END);
        view.buttonNode.on(cc.Node.EventType.TOUCH_END, () => this.claimReward(config), this);
    }

    private getButtonSprite(buttonNode: cc.Node, button: cc.Button): cc.Sprite {
        const targetNode = (button as any).target as cc.Node;
        if (targetNode) {
            const targetSprite = targetNode.getComponent(cc.Sprite);
            if (targetSprite) {
                return targetSprite;
            }
        }

        const selfSprite = buttonNode.getComponent(cc.Sprite);
        if (selfSprite) {
            return selfSprite;
        }

        return this.findFirstSprite(buttonNode);
    }

    private updateButtonSprite(view: WeekRewardItemView, state: WeekRewardState) {
        this.updateButtonBackgroundState(view.buttonNode, state);

        const sprite = view.buttonSprite || this.getButtonSprite(view.buttonNode, view.button);
        if (!sprite) {
            return;
        }

        const button = view.button as any;
        const normalSprite = view.normalButtonSprite || button.normalSprite as cc.SpriteFrame;
        const claimedSprite = view.claimedButtonSprite || button.disabledSprite as cc.SpriteFrame;
        const displaySprite = state.claimed && claimedSprite ? claimedSprite : normalSprite || sprite.spriteFrame;

        button.normalSprite = displaySprite;
        button.pressedSprite = displaySprite;
        button.hoverSprite = displaySprite;
        button.disabledSprite = displaySprite;

        sprite.spriteFrame = displaySprite;
        sprite.node.color = cc.Color.WHITE;
        sprite.setState(cc.Sprite.State.NORMAL);
    }

    private updateButtonBackgroundState(buttonNode: cc.Node, state: WeekRewardState) {
        const background = this.findNodeByName(buttonNode, 'Background');
        const background1 = this.findNodeByName(buttonNode, 'Background1');
        const background2 = this.findNodeByName(buttonNode, 'Background2');

        const claimed = state.claimed;
        const claimable = state.claimable && !claimed;

        if (background) {
            background.active = claimable;
        }

        if (background1) {
            background1.active = claimed;
        }

        if (background2) {
            background2.active = !claimed && !claimable;
        }
    }

    private updateButtonLabel(buttonNode: cc.Node, state: WeekRewardState) {
        const label = this.findFirstLabel(buttonNode);
        if (!label) {
            return;
        }

        if (state.claimed) {
            label.string = '已领取';
            label.fontSize = 24;
            label.lineHeight = 28;
            label.node.color = cc.color(255, 255, 255);
            return;
        }

        if (state.claimable) {
            label.string = '领取';
            label.fontSize = 24;
            label.lineHeight = 28;
            label.node.color = cc.color(255, 255, 255);
            return;
        }

        label.string = `${state.daysRemaining}天后可领取`;
        label.fontSize = 18;
        label.lineHeight = 22;
        label.node.color = cc.color(255, 255, 255);
    }

    private findFirstLabel(node: cc.Node): cc.Label {
        if (!node) {
            return null;
        }

        const label = node.getComponent(cc.Label);
        if (label) {
            return label;
        }

        for (let i = 0; i < node.childrenCount; i++) {
            const childLabel = this.findFirstLabel(node.children[i]);
            if (childLabel) {
                return childLabel;
            }
        }

        return null;
    }

    private findFirstSprite(node: cc.Node): cc.Sprite {
        if (!node) {
            return null;
        }

        const sprite = node.getComponent(cc.Sprite);
        if (sprite) {
            return sprite;
        }

        for (let i = 0; i < node.childrenCount; i++) {
            const childSprite = this.findFirstSprite(node.children[i]);
            if (childSprite) {
                return childSprite;
            }
        }

        return null;
    }

    private getIconCandidates(config: WeekRewardConfig): string[] {
        const candidates: string[] = [];
        const rawIcon = `${config.icon || ''}`;

        if (rawIcon) {
            candidates.push(`AImg/${rawIcon}`);
            if (this.iconIdMap[rawIcon]) {
                candidates.push(`AImg/${this.iconIdMap[rawIcon]}`);
            }
        }

        const rewardFallback = this.getRewardIconName(config.rewardId);
        if (rewardFallback) {
            candidates.push(`AImg/${rewardFallback}`);
        }

        return candidates.filter((item, index) => !!item && candidates.indexOf(item) === index);
    }

    private tryLoadIcon(sprite: cc.Sprite, candidates: string[], index: number, onFail: () => void) {
        if (!cc.isValid(sprite) || index >= candidates.length) {
            onFail();
            return;
        }

        const path = candidates[index];
        if (this.iconCache[path]) {
            sprite.spriteFrame = this.iconCache[path];
            sprite.node.active = true;
            return;
        }

        cc.loader.loadRes(path, cc.SpriteFrame, (error: Error, spriteFrame: cc.SpriteFrame) => {
            if (!cc.isValid(sprite)) {
                return;
            }

            if (error || !spriteFrame) {
                this.tryLoadIcon(sprite, candidates, index + 1, onFail);
                return;
            }

            this.iconCache[path] = spriteFrame;
            sprite.spriteFrame = spriteFrame;
            sprite.node.active = true;
        });
    }

    private claimReward(config: WeekRewardConfig) {
        const state = this.getRewardState(config);
        if (state.claimed) {
            TipsManager.show('该奖励已领取。');
            return;
        }

        if (state.expired) {
            TipsManager.show('逾期不可领取。');
            return;
        }

        if (!state.claimable) {
            TipsManager.show(`${state.daysRemaining}天后可领取。`);
            return;
        }

        const rewardText = this.grantReward(config);
        this.claimedMap[`${config.id}`] = true;
        this.saveClaimedData();
        TipsManager.show(`获得${rewardText}。`);
        this.refreshView();
    }

    private grantReward(config: WeekRewardConfig): string {
        switch (config.rewardId) {
            case 1:
                mGameData.currentGold += config.rewardNum;
                mGameData.SaveGoldData();
                cc.director.emit('goldUpdated');
                return `${config.rewardNum}钻石`;
            case 2:
                mGameData.currentStamina = Math.min(mGameData.maxStamina, mGameData.currentStamina + config.rewardNum);
                mGameData.SaveStaminaData();
                return `${config.rewardNum}体力`;
            default:
                console.warn(`未处理的周奖励类型 rewardId=${config.rewardId}`);
                return `${config.rewardNum}`;
        }
    }

    private getRewardState(config: WeekRewardConfig): WeekRewardState {
        const currentDay = this.getCurrentWeekday();
        const claimed = !!this.claimedMap[`${config.id}`];
        const expired = !claimed && config.id < currentDay;
        const claimable = !claimed && config.id === currentDay;
        const daysRemaining = claimable || claimed || expired ? 0 : Math.max(0, config.id - currentDay);
        return {
            claimed,
            claimable,
            expired,
            daysRemaining,
        };
    }

    private getCurrentWeekday(): number {
        const currentDay = new Date().getDay();
        return currentDay === 0 ? 7 : currentDay;
    }

    private loadClaimedData() {
        const raw = cc.sys.localStorage.getItem(this.getClaimedStorageKey());
        if (!raw) {
            this.claimedMap = {};
            return;
        }

        try {
            this.claimedMap = JSON.parse(raw) || {};
        } catch (error) {
            console.warn('周奖励领取记录解析失败，已重置:', error);
            this.claimedMap = {};
        }
    }

    private saveClaimedData() {
        cc.sys.localStorage.setItem(this.getClaimedStorageKey(), JSON.stringify(this.claimedMap));
        mGameData.requestSyncUserData();
    }

    private getClaimedStorageKey(): string {
        const userId = cc.sys.localStorage.getItem(LocalStorageKeys.appKey('SLS_USER_ID'));
        const suffix = this.getCurrentWeekKey();
        return LocalStorageKeys.userKey(`WeekRewardClaimed_${suffix}`, userId);
    }

    private getCurrentWeekKey(): string {
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const day = today.getDay();
        const diffToMonday = day === 0 ? -6 : 1 - day;
        today.setDate(today.getDate() + diffToMonday);
        today.setHours(0, 0, 0, 0);

        const year = today.getFullYear();
        const month = `${today.getMonth() + 1}`.padStart(2, '0');
        const date = `${today.getDate()}`.padStart(2, '0');
        return `${year}${month}${date}`;
    }

    private getDayName(id: number): string {
        return this.dayNames[Math.max(1, Math.min(7, id)) - 1] || `周${id}`;
    }

    private getRewardName(rewardId: number): string {
        // switch (rewardId) {
        //     case 1:
        //         return '钻石';
        //     case 2:
        //         return '体力';
        //     default:
        //         return '奖励';
        // }
    }

    private getRewardDisplayText(config: WeekRewardConfig): string {
        return `${config.rewardNum}`;
    }

    private getRewardIconName(rewardId: number): string {
        switch (rewardId) {
            case 1:
                return 'zuanshi';
            case 2:
                return 'tili';
            default:
                return '';
        }
    }

    private getOrCreateNode(parent: cc.Node, name: string): cc.Node {
        let node = parent.getChildByName(name);
        if (!node) {
            node = new cc.Node(name);
            node.parent = parent;
        }
        return node;
    }

    private ensureLabel(parent: cc.Node, name: string, text: string, fontSize: number, color: cc.Color, position: cc.Vec2) {
        let labelNode = parent.getChildByName(name);
        if (!labelNode) {
            labelNode = new cc.Node(name);
            labelNode.parent = parent;
        }
        labelNode.setPosition(position);

        let label = labelNode.getComponent(cc.Label);
        if (!label) {
            label = labelNode.addComponent(cc.Label);
        }

        label.string = text;
        label.fontSize = fontSize;
        label.lineHeight = fontSize + 4;
        label.horizontalAlign = cc.Label.HorizontalAlign.CENTER;
        label.verticalAlign = cc.Label.VerticalAlign.CENTER;
        labelNode.color = color;
        return label;
    }

    private onCloseClick() {
        this.node.active = false;
    }

    onDestroy() {
        this.unbindAllItemButtons();
        if (this.closeBtn) {
            this.closeBtn.off(cc.Node.EventType.TOUCH_END, this.onCloseClick, this);
        }
        if (WeekRewardManager.instance === this) {
            WeekRewardManager.instance = null;
        }
        this.isReady = false;
    }
}
