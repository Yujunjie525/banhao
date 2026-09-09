const {ccclass, property} = cc._decorator;
import TipsManager from '../Load/TipsManager';
import mGameData from '../Load/GameData';
import UserDataSyncManager from './UserDataSyncManager';

interface WeeklyRewardConfig {
    id: number;
    name: string;
    desc: string;
    icon: number;
    rewardId: number;
    rewardNum: number;
}

interface WeeklyRewardItem extends WeeklyRewardConfig {
    isClaimed: boolean;
    isAvailable: boolean;
    isMissed: boolean;
    daysUntilAvailable: number;
}

@ccclass
export default class WeeklyRewardManager extends cc.Component {
    @property(cc.Button)
    closeButton: cc.Button = null;

    @property(cc.Node)
    weekPanel: cc.Node = null;

    private weeklyRewards: WeeklyRewardItem[] = [];
    private weeklyRewardConfigs: WeeklyRewardConfig[] = [];
    private isConfigLoaded = false;
    private loadConfigPromise: Promise<void> | null = null;
    private rewardScrollView: cc.ScrollView = null;
    private rewardItemTemplate: cc.Node = null;
    private readonly rewardListColumns: number = 2;
    private readonly rewardListTopPadding: number = 0;
    private readonly rewardListRowGap: number = 20;
    private readonly rewardListColumnGap: number = 18;
    private readonly rewardListBottomPadding: number = 24;

    private weekStartDate: string = '';

    private readonly weeklyRewardWeekStartKey: string = "weeklyRewardWeekStart";
    private readonly weeklyRewardClaimedKey: string = "weeklyRewardClaimed";

    private getUserId(): string | null {
        return cc.sys.localStorage.getItem('SLS_USER_ID');
    }

    private getKeyWithUserId(baseKey: string): string {
        const userId = this.getUserId();
        if (userId) {
            return `${baseKey}_${userId}`;
        }
        return baseKey;
    }

    private getClaimedRewards(): number[] {
        const claimedKey = this.getKeyWithUserId(this.weeklyRewardClaimedKey);
        const claimedStr = cc.sys.localStorage.getItem(claimedKey);
        if (!claimedStr) {
            return [];
        }
        try {
            const parsed = JSON.parse(claimedStr);
            return Array.isArray(parsed) ? parsed : [];
        } catch (error) {
            console.error('Parse weekly claimed data failed:', error);
            return [];
        }
    }

    private saveClaimedRewards(claimedList: number[]): void {
        const claimedKey = this.getKeyWithUserId(this.weeklyRewardClaimedKey);
        cc.sys.localStorage.setItem(claimedKey, JSON.stringify(claimedList));
        UserDataSyncManager.requestUpload();
    }

    protected onLoad(): void {
        if (this.closeButton) {
            this.closeButton.node.on('click', this.onCloseClick, this);
        }
    }

    private loadWeeklyRewardConfig(): Promise<void> {
        if (this.isConfigLoaded) {
            return Promise.resolve();
        }

        if (this.loadConfigPromise) {
            return this.loadConfigPromise;
        }

        this.loadConfigPromise = new Promise((resolve, reject) => {
            cc.loader.loadRes('config/weekReward', cc.JsonAsset, (err: Error, jsonAsset: cc.JsonAsset) => {
                if (err) {
                    reject(err);
                    return;
                }

                const rawConfigs = jsonAsset && Array.isArray(jsonAsset.json) ? jsonAsset.json : [];
                this.weeklyRewardConfigs = rawConfigs.map((config: any) => ({
                    id: Number(config.id) || 0,
                    name: `${config.name || ''}`,
                    desc: `${config.desc || ''}`,
                    icon: Number(config.icon) || 0,
                    rewardId: Number(config.rewardId) || 0,
                    rewardNum: Number(config.rewardNum) || 0
                }));
                this.isConfigLoaded = true;
                resolve();
            });
        });

        return this.loadConfigPromise;
    }

    private initWeeklyRewards(): void {
        this.updateWeekStartDate();
        this.checkNewWeek();

        const today = new Date();
        const dayOfWeek = today.getDay() || 7;

        this.weeklyRewards = this.weeklyRewardConfigs.map(config => {
            const isClaimed = this.checkRewardClaimed(config.id);
            const isAvailable = config.id === dayOfWeek;
            const isMissed = !isClaimed && config.id < dayOfWeek;
            const daysUntilAvailable = Math.max(0, config.id - dayOfWeek);

            return {
                ...config,
                isClaimed,
                isAvailable,
                isMissed,
                daysUntilAvailable
            };
        });
    }

    private updateWeekStartDate(): void {
        const today = new Date();
        const dayOfWeek = today.getDay() || 7;
        const weekStart = new Date(today);
        weekStart.setDate(today.getDate() - (dayOfWeek - 1));
        this.weekStartDate = `${weekStart.getFullYear()}-${String(weekStart.getMonth() + 1).padStart(2, '0')}-${String(weekStart.getDate()).padStart(2, '0')}`;
    }

    private checkNewWeek(): void {
        const weekStartKey = this.getKeyWithUserId(this.weeklyRewardWeekStartKey);
        const currentWeekStart = cc.sys.localStorage.getItem(weekStartKey);
        if (!currentWeekStart || currentWeekStart !== this.weekStartDate) {
            cc.sys.localStorage.setItem(weekStartKey, this.weekStartDate);
            this.saveClaimedRewards([]);
            UserDataSyncManager.requestUpload();
        }
    }

    private checkRewardClaimed(rewardId: number): boolean {
        const claimedList = this.getClaimedRewards();
        return claimedList.includes(rewardId);
    }

    private markRewardClaimed(rewardId: number): void {
        const claimedList = this.getClaimedRewards();
        if (!claimedList.includes(rewardId)) {
            claimedList.push(rewardId);
            this.saveClaimedRewards(claimedList);
        }
    }

    private giveReward(reward: WeeklyRewardItem): void {
        if (reward.rewardNum <= 0) {
            return;
        }

        mGameData.addGold(reward.rewardNum);
    }

    private updateWeeklyRewardUI(): void {
        if (!this.weekPanel) {
            console.error('Week panel not assigned');
            return;
        }

        this.ensureRewardLayout('每周奖励');
        this.rebuildRewardList();
    }

    private ensureRewardLayout(title: string): void {
        const mask = this.weekPanel.getChildByName('遮罩');
        if (mask) {
            mask.opacity = 190;
        }

        const frame = this.weekPanel.getChildByName('jiemiankuang');
        if (frame) {
            this.setSpriteFrame(frame, '1Load/tanchuang3');
            frame.children.forEach(child => child.active = false);
        }

        const closeNode = this.closeButton ? this.closeButton.node : this.weekPanel.getChildByName('btnclose');
        if (closeNode) {
            this.setSpriteFrame(closeNode, '1Load/guanbi');
        }

        const titleNode = this.getOrCreatePanelTitle(title);
        titleNode.zIndex = 5;

        this.rewardScrollView = this.getOrCreateScrollView();
        this.rewardItemTemplate = this.getOrCreateRewardItemTemplate();
    }

    private rebuildRewardList(): void {
        if (!this.rewardScrollView || !this.rewardScrollView.content || !this.rewardItemTemplate) {
            return;
        }

        const content = this.rewardScrollView.content;
        content.children.slice().forEach(child => {
            if (child !== this.rewardItemTemplate) {
                child.removeFromParent(false);
                child.destroy();
            }
        });
        this.rewardItemTemplate.active = false;

        const columns = Math.max(1, this.rewardListColumns || 1);
        const rows = Math.ceil(this.weeklyRewards.length / columns);
        const itemHeight = this.rewardItemTemplate.height || this.rewardItemTemplate.getContentSize().height;
        const viewHeight = this.rewardScrollView.node.height || (this.rewardScrollView.content && this.rewardScrollView.content.parent ? this.rewardScrollView.content.parent.height : 0);
        content.height = Math.max(
            viewHeight,
            this.rewardListTopPadding + rows * itemHeight + Math.max(0, rows - 1) * this.rewardListRowGap + this.rewardListBottomPadding
        );

        for (let i = 0; i < this.weeklyRewards.length; i++) {
            const item = cc.instantiate(this.rewardItemTemplate);
            item.name = `RewardItem${i + 1}`;
            item.active = true;
            item.parent = content;
            const position = this.getRewardItemPosition(i);
            item.x = position.x;
            item.y = position.y;
            try {
                this.applyRewardItem(item, this.weeklyRewards[i]);
            } catch (error) {
                console.error('Apply weekly reward item failed:', error);
            }
        }

        if (this.rewardScrollView.scrollToTop) {
            this.rewardScrollView.scrollToTop(0.1);
        }
    }

    private applyRewardItem(item: cc.Node, rewardData: WeeklyRewardItem): void {
        this.setSpriteFrame(item.getChildByName('ClaimButton'), '2main/anniulingqu');
        this.setSpriteFrame(item.getChildByName('ClaimedButton'), '2main/anniuyilingqu');

        const titleNode = item.getChildByName('Title');
        const titleLabel = titleNode ? titleNode.getComponent(cc.Label) : null;
        if (titleLabel) {
            titleLabel.string = this.getWeekDayName(rewardData.id);
        }

        const amountNode = item.getChildByName('Amount');
        const amountLabel = amountNode ? amountNode.getComponent(cc.Label) : null;
        if (amountLabel) {
            amountLabel.string = `${rewardData.rewardNum}`;
        }

        const buttonNode = item.getChildByName('ClaimButton');
        const claimedNode = item.getChildByName('ClaimedButton');
        if (!buttonNode || !claimedNode) {
            return;
        }

        buttonNode.off(cc.Node.EventType.TOUCH_END);
        buttonNode.opacity = 255;
        claimedNode.opacity = 255;

        const button = buttonNode.getComponent(cc.Button);
        if (button) {
            button.enableAutoGrayEffect = true;
            button.disabledColor = cc.color(160, 160, 160, 255);
        }

        if (rewardData.isClaimed) {
            buttonNode.active = false;
            claimedNode.active = true;
        } else {
            buttonNode.active = true;
            claimedNode.active = false;
            if (button) {
                button.interactable = rewardData.isAvailable;
            }
            if (rewardData.isAvailable) {
                buttonNode.on(cc.Node.EventType.TOUCH_END, () => this.onClaimClick(rewardData.id), this);
            }
        }
    }

    private getWeekDayName(id: number): string {
        const names = ['周一', '周二', '周三', '周四', '周五', '周六', '周日'];
        return names[Math.max(0, Math.min(names.length - 1, id - 1))] || '周一';
    }

    private getOrCreateScrollView(): cc.ScrollView {
        let scrollNode = this.weekPanel.getChildByName('RewardScrollView');
        if (!scrollNode) {
            scrollNode = new cc.Node('RewardScrollView');
            scrollNode.parent = this.weekPanel;
        }
        scrollNode.zIndex = 4;

        let view = scrollNode.getChildByName('view');
        if (!view) {
            view = new cc.Node('view');
            view.parent = scrollNode;
            view.addComponent(cc.Mask);
        }

        let content = view.getChildByName('content');
        if (!content) {
            content = new cc.Node('content');
            content.parent = view;
            content.setContentSize(view.width, view.height);
            content.setPosition(0, 0);
            content.anchorX = 0.5;
            content.anchorY = 1;
        }

        let scrollView = scrollNode.getComponent(cc.ScrollView);
        if (!scrollView) {
            scrollView = scrollNode.addComponent(cc.ScrollView);
        }
        scrollView.content = content;
        scrollView.horizontal = false;
        scrollView.vertical = true;
        scrollView.inertia = true;
        scrollView.brake = 0.75;
        return scrollView;
    }

    private getOrCreateRewardItemTemplate(): cc.Node {
        const content = this.rewardScrollView && this.rewardScrollView.content;
        let template = content ? content.getChildByName('RewardItemTemplate') : null;
        if (!template) {
            template = this.weekPanel.getChildByName('RewardItemTemplate');
            if (template && content) {
                template.parent = content;
            }
        }
        if (template) {
            template.active = false;
            return template;
        }

        template = new cc.Node('RewardItemTemplate');
        template.parent = content || this.weekPanel;
        template.setContentSize(250, 260);
        template.setPosition(0, 0);
        template.active = false;
        const card = this.createSpriteNode('Card', 175, 232, 0, 8, '2main/dikuang6');
        card.parent = template;

        const title = this.getOrCreateLabelNode(template, 'Title', '周一', 40, cc.color(255, 255, 255), 0, 80, 100, 54);
        let titleOutline = title.getComponent(cc.LabelOutline);
        if (!titleOutline) {
            titleOutline = title.addComponent(cc.LabelOutline);
        }
        titleOutline.enabled = true;
        titleOutline.color = cc.color(31, 120, 185);
        titleOutline.width = 3;

        const coin = this.createSpriteNode('Coin', 56, 56, -35, 12, '2main/zuanshi');
        coin.parent = template;

        const amount = this.getOrCreateLabelNode(template, 'Amount', '100', 28, cc.color(45, 35, 126), 32, 14, 72, 38);
        const amountOutline = amount.getComponent(cc.LabelOutline);
        if (amountOutline) {
            amountOutline.enabled = false;
        }

        const claim = this.createSpriteNode('ClaimButton', 240, 88, 0, -82, '2main/anniulingqu');
        claim.parent = template;
        claim.addComponent(cc.Button);

        const claimed = this.createSpriteNode('ClaimedButton', 240, 88, 0, -82, '2main/anniuyilingqu');
        claimed.parent = template;

        return template;
    }

    private getOrCreatePanelTitle(title: string): cc.Node {
        const titleNode = this.weekPanel.getChildByName('RewardTitle');
        if (!titleNode) {
            return this.getOrCreateLabelNode(this.weekPanel, 'RewardTitle', title, 42, cc.color(255, 255, 255), 0, 352, 260, 56);
        }

        const label = titleNode.getComponent(cc.Label);
        if (label) {
            label.string = title;
            label.fontSize = 42;
            label.horizontalAlign = cc.Label.HorizontalAlign.CENTER;
            label.verticalAlign = cc.Label.VerticalAlign.CENTER;
        }
        titleNode.color = cc.color(255, 255, 255);
        return titleNode;
    }

    private getRewardItemPosition(index: number): cc.Vec2 {
        const columns = Math.max(1, this.rewardListColumns || 1);
        const col = index % columns;
        const row = Math.floor(index / columns);
        const itemWidth = this.rewardItemTemplate.width || this.rewardItemTemplate.getContentSize().width;
        const itemHeight = this.rewardItemTemplate.height || this.rewardItemTemplate.getContentSize().height;
        const totalWidth = columns * itemWidth + Math.max(0, columns - 1) * this.rewardListColumnGap;
        const startX = -totalWidth / 2 + itemWidth / 2;
        const x = startX + col * (itemWidth + this.rewardListColumnGap);
        const y = -this.rewardListTopPadding - itemHeight / 2 - row * (itemHeight + this.rewardListRowGap);
        return cc.v2(x, y);
    }

    private createSpriteNode(name: string, width: number, height: number, x: number, y: number, spritePath: string): cc.Node {
        const node = new cc.Node(name);
        node.setContentSize(width, height);
        node.setPosition(x, y);
        const sprite = node.addComponent(cc.Sprite);
        sprite.sizeMode = cc.Sprite.SizeMode.CUSTOM;
        this.setSpriteFrame(node, spritePath);
        return node;
    }

    private getOrCreateLabelNode(parent: cc.Node, name: string, text: string, fontSize: number, color: cc.Color, x: number, y: number, width: number, height: number): cc.Node {
        let node = parent.getChildByName(name);
        if (!node) {
            node = new cc.Node(name);
            node.parent = parent;
            node.addComponent(cc.Label);
        }
        node.setContentSize(width, height);
        node.setPosition(x, y);
        node.color = color;

        const label = node.getComponent(cc.Label);
        label.string = text;
        label.fontSize = fontSize;
        label.lineHeight = height;
        label.horizontalAlign = cc.Label.HorizontalAlign.CENTER;
        label.verticalAlign = cc.Label.VerticalAlign.CENTER;
        return node;
    }

    private setSpriteFrame(node: cc.Node, spritePath: string): void {
        if (!node) {
            return;
        }
        const sprite = node.getComponent(cc.Sprite);
        if (!sprite) {
            return;
        }
        cc.loader.loadRes(spritePath, cc.SpriteFrame, (err: Error, spriteFrame: cc.SpriteFrame) => {
            if (!err && spriteFrame && node.isValid) {
                sprite.spriteFrame = spriteFrame;
                sprite.sizeMode = cc.Sprite.SizeMode.CUSTOM;
            }
        });
    }

    private onClaimClick(rewardId: number): void {
        const reward = this.weeklyRewards.find(r => r.id === rewardId);
        if (!reward) return;
        if (!reward.isAvailable) return;
        if (reward.isClaimed) return;

        this.giveReward(reward);
        reward.isClaimed = true;
        this.markRewardClaimed(rewardId);
        this.updateWeeklyRewardUI();
        this.showToast(`获得${reward.rewardNum}钻石。`);
    }

    private onCloseClick(): void {
        this.node.active = false;
    }

    private showToast(message: string): void {
        TipsManager.show(message);
    }

    public show(): void {
        this.loadWeeklyRewardConfig().then(() => {
            this.initWeeklyRewards();
            this.updateWeeklyRewardUI();
            this.node.active = true;
        }).catch((error) => {
            console.error('Reload weekly reward config failed:', error);
            this.node.active = true;
        });
    }

    public hide(): void {
        this.node.active = false;
    }
}
