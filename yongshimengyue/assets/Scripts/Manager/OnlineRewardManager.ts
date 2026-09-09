const { ccclass } = cc._decorator;

import mGameData from '../Data/GameData';
import LocalStorageKeys from '../Data/LocalStorageKeys';
import TipsManager from './TipsManager';

interface OnlineRewardConfig {
    id: number;
    time: number;
    icon: string;
    rewardId: number;
    rewardNum: number;
}

interface OnlineRewardState {
    claimed: boolean;
    claimable: boolean;
    remainingSeconds: number;
}

interface OnlineRewardStorage {
    onlineSeconds: number;
    claimedMap: { [key: string]: boolean };
}

interface OnlineRewardItemView {
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
export default class OnlineRewardManager extends cc.Component {
    private static instance: OnlineRewardManager = null;

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

    private rewardList: OnlineRewardConfig[] = [];
    private claimedMap: { [key: string]: boolean } = {};
    private iconCache: { [key: string]: cc.SpriteFrame } = {};
    private itemViews: { [key: number]: OnlineRewardItemView } = {};
    private closeBtn: cc.Node = null;
    private scrollView: cc.ScrollView = null;
    private listRoot: cc.Node = null;
    private itemTemplate: cc.Node = null;
    private emptyLabel: cc.Label = null;
    private panelVisible: boolean = false;
    private onlineSeconds: number = 0;
    private currentDateKey: string = '';
    private sessionStartTimestamp: number = 0;
    private isTracking: boolean = false;
    private isReady: boolean = false;

    public static ensureTracker(hostNode?: cc.Node): OnlineRewardManager {
        if (OnlineRewardManager.instance && cc.isValid(OnlineRewardManager.instance.node)) {
            return OnlineRewardManager.instance;
        }

        const scene = cc.director.getScene();
        let panelNode = OnlineRewardManager.findPanelNode(hostNode) || OnlineRewardManager.findPanelNode(scene);

        if (!panelNode) {
            panelNode = new cc.Node('onlineRewardPanel');
            if (hostNode && cc.isValid(hostNode)) {
                panelNode.parent = hostNode;
            } else if (scene) {
                panelNode.parent = scene;
            }
        }

        let manager = panelNode.getComponent(OnlineRewardManager);
        if (!manager) {
            manager = panelNode.addComponent(OnlineRewardManager);
        }

        OnlineRewardManager.instance = manager;
        return manager;
    }

    private static findPanelNode(root: cc.Node): cc.Node {
        if (!root || !cc.isValid(root)) {
            return null;
        }
        if (root.name === 'onlineRewardPanel') {
            return root;
        }
        for (let i = 0; i < root.childrenCount; i++) {
            const found = this.findPanelNode(root.children[i]);
            if (found) {
                return found;
            }
        }
        return null;
    }

    onLoad() {
        OnlineRewardManager.instance = this;
        this.cacheView();
        this.loadConfig();
        this.loadTodayStorage();
        this.startTracking();
        this.schedule(this.onTick, 1);
        cc.game.on(cc.game.EVENT_HIDE, this.onGameHide, this);
        cc.game.on(cc.game.EVENT_SHOW, this.onGameShow, this);
        this.isReady = true;
    }

    onDestroy() {
        this.pauseTracking();
        this.unschedule(this.onTick);
        cc.game.off(cc.game.EVENT_HIDE, this.onGameHide, this);
        cc.game.off(cc.game.EVENT_SHOW, this.onGameShow, this);
        this.unbindAllItemButtons();
        this.closeBtn && this.closeBtn.off(cc.Node.EventType.TOUCH_END, this.onCloseClick, this);

        if (OnlineRewardManager.instance === this) {
            OnlineRewardManager.instance = null;
        }
        this.isReady = false;
    }

    public showPanel() {
        this.syncOnlineProgress();
        this.refreshView();
        this.setPanelVisible(true);
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
        this.emptyLabel = this.ensureLabel(emptyNode, 'label', '暂无在线奖励配置', 28, cc.color(255, 255, 255), cc.v2(0, 0));
        this.emptyLabel.enableWrapText = false;
        emptyNode.active = false;
    }

    private setPanelVisible(visible: boolean) {
        this.panelVisible = visible;
        this.node.active = visible;
    }

    private loadConfig() {
        cc.loader.loadRes('config/onlineReward', cc.JsonAsset, (error: Error, asset: cc.JsonAsset) => {
            if (error) {
                console.error('load online reward config failed:', error);
                if (this.emptyLabel) {
                    this.emptyLabel.string = '在线奖励配置加载失败';
                    this.emptyLabel.node.parent.active = true;
                }
                return;
            }

            const rawList = asset && Array.isArray(asset.json) ? asset.json : [];
            this.rewardList = rawList
                .map((item: any) => this.normalizeConfig(item))
                .filter((item) => item.id > 0)
                .sort((a, b) => a.id - b.id);

            this.refreshView();
        });
    }

    private normalizeConfig(item: any): OnlineRewardConfig {
        return {
            id: Number(item.id) || 0,
            time: Number(item.time) || 0,
            icon: `${item.icon || ''}`,
            rewardId: Number(item.rewardId) || 0,
            rewardNum: Number(item.rewardNum) || 0,
        };
    }

    private refreshView() {
        if (!this.listRoot || !this.itemTemplate || !this.emptyLabel) {
            return;
        }

        if (!this.rewardList.length) {
            this.unbindAllItemButtons();
            this.listRoot.destroyAllChildren();
            this.itemViews = {};
            this.updateContentHeight(0, this.itemTemplate.getContentSize().height);
            this.emptyLabel.string = '暂无在线奖励配置';
            this.emptyLabel.node.parent.active = true;
            return;
        }

        this.emptyLabel.node.parent.active = false;
        this.ensureItemListBuilt();
        this.refreshItemStates();
    }

    private ensureItemListBuilt() {
        if (!this.listRoot || !this.itemTemplate) {
            return;
        }

        let needsRebuild = Object.keys(this.itemViews).length !== this.rewardList.length;
        if (!needsRebuild) {
            for (let i = 0; i < this.rewardList.length; i++) {
                if (!this.itemViews[this.rewardList[i].id]) {
                    needsRebuild = true;
                    break;
                }
            }
        }

        if (!needsRebuild) {
            return;
        }

        this.unbindAllItemButtons();
        this.listRoot.destroyAllChildren();
        this.itemViews = {};

        for (let i = 0; i < this.rewardList.length; i++) {
            const config = this.rewardList[i];
            const itemNode = cc.instantiate(this.itemTemplate);
            itemNode.name = `online_reward_item_${config.id}`;
            itemNode.active = true;
            itemNode.parent = this.listRoot;

            const view = this.createItemView(itemNode);
            if (!view) {
                continue;
            }

            this.itemViews[config.id] = view;
            itemNode.setPosition(this.getItemPosition(i, itemNode.getContentSize()));
        }

        this.updateContentHeight(this.rewardList.length, this.itemTemplate.getContentSize().height);
    }

    private refreshItemStates() {
        if (!this.rewardList.length) {
            return;
        }

        const countdownRewardId = this.getCurrentCountdownRewardId();

        for (let i = 0; i < this.rewardList.length; i++) {
            const config = this.rewardList[i];
            const view = this.itemViews[config.id];
            if (!view) {
                continue;
            }

            this.updateItemView(view, config, countdownRewardId);
        }
    }

    private createItemView(itemNode: cc.Node): OnlineRewardItemView | null {
        const iconNode = this.findNodeByName(itemNode, 'icon');
        const valueNode = this.findNodeByName(itemNode, 'value');
        const nameNode = this.findNodeByName(itemNode, 'name') || this.findNodeByName(itemNode, 'time');
        const buttonNode = this.findNodeByName(itemNode, 'Button') || this.findNodeByName(itemNode, 'BtnReward');

        if (!iconNode || !valueNode || !nameNode || !buttonNode) {
            console.warn('online reward item template missing required nodes');
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

    private updateItemView(view: OnlineRewardItemView, config: OnlineRewardConfig, countdownRewardId: number) {
        const state = this.getRewardState(config);
        view.valueLabel.string = this.getRewardDisplayText(config);
        view.nameLabel.string = this.getDisplayTimeText(config, state, countdownRewardId);
        // this.updateRewardIcon(view.iconSprite, config);
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

    private applyRewardState(itemView: OnlineRewardItemView, config: OnlineRewardConfig, state: OnlineRewardState) {
        this.updateButtonSprite(itemView, state);
        itemView.button.enableAutoGrayEffect = false;
        itemView.button.interactable = true;
        this.updateButtonLabel(itemView.buttonNode, state);

        itemView.buttonNode.off(cc.Node.EventType.TOUCH_END);
        itemView.buttonNode.on(cc.Node.EventType.TOUCH_END, () => this.claimReward(config), this);
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

    private updateButtonSprite(view: OnlineRewardItemView, state: OnlineRewardState) {
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

    private updateButtonBackgroundState(buttonNode: cc.Node, state: OnlineRewardState) {
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

    private updateButtonLabel(buttonNode: cc.Node, state: OnlineRewardState) {
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

        label.string = '领取';
        label.fontSize = 24;
        label.lineHeight = 28;
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

    private updateRewardIcon(sprite: cc.Sprite, config: OnlineRewardConfig) {
        const candidates = this.getIconCandidates(config);
        this.tryLoadIcon(sprite, candidates, 0, () => {
            if (cc.isValid(sprite)) {
                sprite.spriteFrame = null;
            }
        });
    }

    private getIconCandidates(config: OnlineRewardConfig): string[] {
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

    private claimReward(config: OnlineRewardConfig) {
        const state = this.getRewardState(config);
        if (state.claimed) {
            TipsManager.show('该奖励已领取。');
            return;
        }

        if (!state.claimable) {
            TipsManager.show(`${this.getDisplayTimeText(config, state, this.getCurrentCountdownRewardId())}后可领取。`);
            return;
        }

        const rewardText = this.grantReward(config);
        this.claimedMap[`${config.id}`] = true;
        this.saveTodayStorage();
        TipsManager.show(`获得${rewardText}。`);
        this.refreshView();
    }

    private grantReward(config: OnlineRewardConfig): string {
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
                return `${config.rewardNum}${this.getRewardName(config.rewardId)}`;
        }
    }

    private getRewardState(config: OnlineRewardConfig): OnlineRewardState {
        const claimed = !!this.claimedMap[`${config.id}`];
        const requiredSeconds = Math.max(0, config.time) * 60;
        const claimable = !claimed && this.onlineSeconds >= requiredSeconds;
        return {
            claimed,
            claimable,
            remainingSeconds: claimable || claimed ? 0 : Math.max(0, requiredSeconds - this.onlineSeconds),
        };
    }

    private startTracking() {
        this.loadTodayStorage();
        this.isTracking = true;
        this.sessionStartTimestamp = Date.now();
        this.saveTodayStorage();
    }

    private pauseTracking() {
        if (!this.isTracking) {
            return;
        }
        this.syncOnlineProgress();
        this.isTracking = false;
        this.sessionStartTimestamp = 0;
        this.saveTodayStorage();
    }

    private syncOnlineProgress() {
        this.loadTodayStorage();
        if (!this.isTracking || this.sessionStartTimestamp <= 0) {
            return;
        }

        const now = Date.now();
        const deltaSeconds = Math.floor((now - this.sessionStartTimestamp) / 1000);
        if (deltaSeconds <= 0) {
            return;
        }

        this.onlineSeconds += deltaSeconds;
        mGameData.addTotalOnlineSeconds(deltaSeconds);
        this.sessionStartTimestamp += deltaSeconds * 1000;
        this.saveTodayStorage();
    }

    private loadTodayStorage() {
        const todayKey = this.getCurrentDateKey();
        if (this.currentDateKey === todayKey) {
            return;
        }

        this.currentDateKey = todayKey;
        const raw = cc.sys.localStorage.getItem(this.getStorageKey(todayKey));
        if (!raw) {
            this.onlineSeconds = 0;
            this.claimedMap = {};
            if (this.isTracking) {
                this.sessionStartTimestamp = Date.now();
            }
            return;
        }

        try {
            const data: OnlineRewardStorage = JSON.parse(raw) || { onlineSeconds: 0, claimedMap: {} };
            this.onlineSeconds = Number(data.onlineSeconds) || 0;
            this.claimedMap = data.claimedMap || {};
        } catch (error) {
            this.onlineSeconds = 0;
            this.claimedMap = {};
        }

        if (this.isTracking) {
            this.sessionStartTimestamp = Date.now();
        }
    }

    private saveTodayStorage() {
        if (!this.currentDateKey) {
            this.currentDateKey = this.getCurrentDateKey();
        }

        const data: OnlineRewardStorage = {
            onlineSeconds: this.onlineSeconds,
            claimedMap: this.claimedMap,
        };

        cc.sys.localStorage.setItem(this.getStorageKey(this.currentDateKey), JSON.stringify(data));
        mGameData.requestSyncUserData();
    }

    private getStorageKey(dateKey: string): string {
        const userId = cc.sys.localStorage.getItem(LocalStorageKeys.appKey('SLS_USER_ID'));
        return LocalStorageKeys.userKey(`OnlineReward_${dateKey}`, userId);
    }

    private getCurrentDateKey(): string {
        const now = new Date();
        const year = now.getFullYear();
        const month = `${now.getMonth() + 1}`.padStart(2, '0');
        const date = `${now.getDate()}`.padStart(2, '0');
        return `${year}${month}${date}`;
    }

    private getRewardName(rewardId: number): string {
        switch (rewardId) {
            case 1:
                return '钻石';
            case 2:
                return '体力';
            default:
                return '奖励';
        }
    }

    private getRewardDisplayText(config: OnlineRewardConfig): string {
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

    private getCurrentCountdownRewardId(): number {
        for (let i = 0; i < this.rewardList.length; i++) {
            const config = this.rewardList[i];
            const state = this.getRewardState(config);
            if (!state.claimed && !state.claimable) {
                return config.id;
            }
        }
        return 0;
    }

    private formatCountdownText(totalSeconds: number): string {
        const safeSeconds = Math.max(0, Math.floor(totalSeconds));
        const minutes = Math.floor(safeSeconds / 60);
        const seconds = safeSeconds % 60;
        return `${minutes}:${`${seconds}`.padStart(2, '0')}`;
    }

    private getDisplayTimeText(config: OnlineRewardConfig, state: OnlineRewardState, countdownRewardId: number): string {
        return config.id === countdownRewardId
            ? this.formatCountdownText(state.remainingSeconds)
            : `${config.time}分`;
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

    private onTick = () => {
        this.syncOnlineProgress();
        if (this.panelVisible) {
            this.refreshView();
        }
    };

    private onGameHide = () => {
        this.pauseTracking();
    };

    private onGameShow = () => {
        this.loadTodayStorage();
        this.startTracking();
        if (this.panelVisible) {
            this.refreshView();
        }
    };

    private onCloseClick = () => {
        this.setPanelVisible(false);
    };
}
