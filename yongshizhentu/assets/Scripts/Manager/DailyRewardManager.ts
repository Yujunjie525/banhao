const {ccclass, property} = cc._decorator;
import TipsManager from '../Load/TipsManager';
import OnlineTimeManager from './OnlineTimeManager';
import mGameData from '../Load/GameData';
import UserDataSyncManager from './UserDataSyncManager';

interface OnlineRewardConfig {
    id: number;
    time: number;
    name: string;
    desc: string;
    icon: number;
    rewardId: number;
    rewardNum: number;
}

interface OnlineRewardItem extends OnlineRewardConfig {
    isClaimed: boolean;
    isAvailable: boolean;
    requiredMinutes: number;
}

@ccclass
export default class DailyRewardManager extends cc.Component {
    @property(cc.Button)
    closeButton: cc.Button = null;

    @property(cc.Node)
    dailyPanel: cc.Node = null;

    private dailyRewards: OnlineRewardItem[] = [];
    private onlineRewardConfigs: OnlineRewardConfig[] = [];
    private isConfigLoaded = false;
    private loadConfigPromise: Promise<void> | null = null;
    private rewardScrollView: cc.ScrollView = null;
    private rewardItemTemplate: cc.Node = null;
    private readonly rewardListColumns: number = 2;
    private readonly rewardListTopPadding: number = 0;
    private readonly rewardListRowGap: number = 20;
    private readonly rewardListColumnGap: number = 18;
    private readonly rewardListBottomPadding: number = 24;
    private lastRenderedOnlineMinutes: number = -1;
    private isStatusTimerScheduled: boolean = false;

    private todayDate: string = '';

    private readonly dailyRewardDateKey: string = "dailyRewardDate";
    private readonly dailyRewardClaimedKey: string = "dailyRewardClaimed";
    private readonly dailyOnlineMinutesKey: string = "dailyOnlineMinutes";

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
        const claimedKey = this.getKeyWithUserId(this.dailyRewardClaimedKey);
        const claimedStr = cc.sys.localStorage.getItem(claimedKey);
        if (!claimedStr) {
            return [];
        }
        try {
            const parsed = JSON.parse(claimedStr);
            return Array.isArray(parsed) ? parsed : [];
        } catch (error) {
            console.error('Parse daily claimed data failed:', error);
            return [];
        }
    }

    private saveClaimedRewards(claimedList: number[]): void {
        const claimedKey = this.getKeyWithUserId(this.dailyRewardClaimedKey);
        cc.sys.localStorage.setItem(claimedKey, JSON.stringify(claimedList));
        UserDataSyncManager.requestUpload();
    }

    protected onLoad(): void {
        if (this.closeButton) {
            this.closeButton.node.on('click', this.onCloseClick, this);
        }
    }

    protected onDestroy(): void {
    }

    private loadOnlineRewardConfig(): Promise<void> {
        if (this.isConfigLoaded) {
            return Promise.resolve();
        }

        if (this.loadConfigPromise) {
            return this.loadConfigPromise;
        }

        this.loadConfigPromise = new Promise((resolve, reject) => {
            cc.loader.loadRes('config/onlineReward', cc.JsonAsset, (err: Error, jsonAsset: cc.JsonAsset) => {
                if (err) {
                    reject(err);
                    return;
                }

                const rawConfigs = jsonAsset && Array.isArray(jsonAsset.json) ? jsonAsset.json : [];
                this.onlineRewardConfigs = rawConfigs.map((config: any) => ({
                    id: Number(config.id) || 0,
                    time: Number(config.time) || 0,
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

    private initDailyRewards(): void {
        this.updateTodayDate();
        this.checkNewDay();

        this.dailyRewards = this.onlineRewardConfigs.map(config => {
            const isClaimed = this.checkRewardClaimed(config.id);
            const isAvailable = !isClaimed && this.getOnlineMinutes() >= config.time;

            return {
                ...config,
                isClaimed,
                isAvailable,
                requiredMinutes: config.time
            };
        });
    }

    private updateTodayDate(): void {
        const today = new Date();
        this.todayDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    }

    private checkNewDay(): void {
        const rewardDateKey = this.getKeyWithUserId(this.dailyRewardDateKey);
        const todayDate = cc.sys.localStorage.getItem(rewardDateKey);
        if (!todayDate || todayDate !== this.todayDate) {
            cc.sys.localStorage.setItem(rewardDateKey, this.todayDate);
            this.saveClaimedRewards([]);
            const onlineMinutesKey = this.getKeyWithUserId(this.dailyOnlineMinutesKey);
            cc.sys.localStorage.setItem(onlineMinutesKey, "0");
            UserDataSyncManager.requestUpload();
        }
    }

    private getOnlineMinutes(): number {
        if (OnlineTimeManager.Instance) {
            return OnlineTimeManager.Instance.getOnlineMinutes();
        }
        return 0;
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

    private giveReward(reward: OnlineRewardItem): void {
        if (reward.rewardNum <= 0) {
            return;
        }

        mGameData.addGold(reward.rewardNum);
    }

    private updateDailyRewardsStatus(): void {
        const onlineMinutes = this.getOnlineMinutes();
        let changed = false;
        this.dailyRewards.forEach(reward => {
            const nextAvailable = !reward.isClaimed && onlineMinutes >= reward.requiredMinutes;
            if (reward.isAvailable !== nextAvailable) {
                changed = true;
            }
            reward.isAvailable = nextAvailable;
        });

        if (changed || onlineMinutes !== this.lastRenderedOnlineMinutes) {
            this.lastRenderedOnlineMinutes = onlineMinutes;
            this.refreshRewardListState();
        }
    }

    private updateDailyRewardUI(): void {
        if (!this.dailyPanel) {
            console.error('Daily panel not assigned');
            return;
        }

        this.ensureRewardLayout('在线奖励');
        this.rebuildRewardList();
    }

    private ensureRewardLayout(title: string): void {
        const mask = this.dailyPanel.getChildByName('遮罩');
        if (mask) {
            mask.opacity = 190;
        }

        const frame = this.dailyPanel.getChildByName('jiemiankuang');
        if (frame) {
            this.setSpriteFrame(frame, '1Load/tanchuang3');
            frame.children.forEach(child => child.active = false);
        }

        const closeNode = this.closeButton ? this.closeButton.node : this.dailyPanel.getChildByName('btnclose');
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
        const rows = Math.ceil(this.dailyRewards.length / columns);
        const itemHeight = this.rewardItemTemplate.height || this.rewardItemTemplate.getContentSize().height;
        const viewHeight = this.rewardScrollView.node.height || (this.rewardScrollView.content && this.rewardScrollView.content.parent ? this.rewardScrollView.content.parent.height : 0);
        content.height = Math.max(
            viewHeight,
            this.rewardListTopPadding + rows * itemHeight + Math.max(0, rows - 1) * this.rewardListRowGap + this.rewardListBottomPadding
        );

        for (let i = 0; i < this.dailyRewards.length; i++) {
            const item = cc.instantiate(this.rewardItemTemplate);
            item.name = `RewardItem${i + 1}`;
            item.active = true;
            item.parent = content;
            const position = this.getRewardItemPosition(i);
            item.x = position.x;
            item.y = position.y;
            try {
                this.applyRewardItem(item, this.dailyRewards[i]);
            } catch (error) {
                console.error('Apply online reward item failed:', error);
            }
        }

        if (this.rewardScrollView.scrollToTop) {
            this.rewardScrollView.scrollToTop(0.1);
        }
    }

    private refreshRewardListState(): void {
        if (!this.rewardScrollView || !this.rewardScrollView.content) {
            this.updateDailyRewardUI();
            return;
        }

        for (let i = 0; i < this.dailyRewards.length; i++) {
            const item = this.rewardScrollView.content.getChildByName(`RewardItem${i + 1}`);
            if (!item) {
                this.updateDailyRewardUI();
                return;
            }
            this.applyRewardItem(item, this.dailyRewards[i]);
        }
    }

    private applyRewardItem(item: cc.Node, rewardData: OnlineRewardItem): void {
        this.setSpriteFrame(item.getChildByName('ClaimedButton'), '2main/anniuyilingqu');

        const titleNode = item.getChildByName('Title');
        const titleLabel = titleNode ? titleNode.getComponent(cc.Label) : null;
        if (titleLabel) {
            titleLabel.string = rewardData.name;
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
                button.interactable = true;
            }
            if (rewardData.isAvailable) {
                this.setSpriteFrame(buttonNode, '2main/anniulingqu');
                this.setClaimButtonStateText(buttonNode, '');
                buttonNode.on(cc.Node.EventType.TOUCH_END, () => this.onClaimClick(rewardData.id), this);
            } else {
                this.setSpriteFrame(buttonNode, '2main/anniukong');
                const remainingMinutes = Math.max(1, rewardData.requiredMinutes - this.getOnlineMinutes());
                this.setClaimButtonStateText(buttonNode, `${remainingMinutes}分钟后可领取`);
            }
        }
    }

    private setClaimButtonStateText(buttonNode: cc.Node, text: string): void {
        let labelNode = buttonNode.getChildByName('StateLabel');
        if (!labelNode) {
            labelNode = new cc.Node('StateLabel');
            labelNode.parent = buttonNode;
            labelNode.addComponent(cc.Label);
            labelNode.setContentSize(buttonNode.width, buttonNode.height);
            labelNode.setPosition(0, 0);
            labelNode.color = cc.color(64, 74, 96);

            const fallbackLabel = labelNode.getComponent(cc.Label);
            fallbackLabel.fontSize = 22;
            fallbackLabel.lineHeight = 28;
            fallbackLabel.horizontalAlign = cc.Label.HorizontalAlign.CENTER;
            fallbackLabel.verticalAlign = cc.Label.VerticalAlign.CENTER;
        }

        labelNode.active = text.length > 0;
        labelNode.zIndex = 10;

        const label = labelNode.getComponent(cc.Label);
        label.string = text;
    }

    private getOrCreateScrollView(): cc.ScrollView {
        let scrollNode = this.dailyPanel.getChildByName('RewardScrollView');
        if (!scrollNode) {
            scrollNode = new cc.Node('RewardScrollView');
            scrollNode.parent = this.dailyPanel;
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
            template = this.dailyPanel.getChildByName('RewardItemTemplate');
            if (template && content) {
                template.parent = content;
            }
        }
        if (template) {
            template.active = false;
            return template;
        }

        template = new cc.Node('RewardItemTemplate');
        template.parent = content || this.dailyPanel;
        template.setContentSize(250, 260);
        template.setPosition(0, 0);
        template.active = false;
        const card = this.createSpriteNode('Card', 175, 232, 0, 8, '2main/dikuang7');
        card.parent = template;

        const title = this.getOrCreateLabelNode(template, 'Title', '周一', 40, cc.color(37, 128, 12), 0, 80, 100, 54);
        let titleOutline = title.getComponent(cc.LabelOutline);
        if (!titleOutline) {
            titleOutline = title.addComponent(cc.LabelOutline);
        }
        titleOutline.enabled = true;
        titleOutline.color = cc.color(255, 255, 255);
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
        const titleNode = this.dailyPanel.getChildByName('RewardTitle');
        if (!titleNode) {
            return this.getOrCreateLabelNode(this.dailyPanel, 'RewardTitle', title, 42, cc.color(255, 255, 255), 0, 352, 260, 56);
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
        if ((node as any).__dailyRewardSpritePath === spritePath) {
            return;
        }
        (node as any).__dailyRewardSpritePath = spritePath;

        cc.loader.loadRes(spritePath, cc.SpriteFrame, (err: Error, spriteFrame: cc.SpriteFrame) => {
            if (!err && spriteFrame && node.isValid) {
                sprite.spriteFrame = spriteFrame;
                sprite.sizeMode = cc.Sprite.SizeMode.CUSTOM;
            }
        });
    }

    private onClaimClick(rewardId: number): void {
        const reward = this.dailyRewards.find(r => r.id === rewardId);
        if (!reward) return;
        if (!reward.isAvailable) return;
        if (reward.isClaimed) return;

        this.giveReward(reward);
        reward.isClaimed = true;
        this.markRewardClaimed(rewardId);
        this.refreshRewardListState();
        this.showToast(`获得${reward.rewardNum}钻石。`);
    }

    private onCloseClick(): void {
        this.node.active = false;
    }

    private showToast(message: string): void {
        TipsManager.show(message);
    }

    public show(): void {
        this.loadOnlineRewardConfig().then(() => {
            this.initDailyRewards();
            this.updateDailyRewardUI();
            this.node.active = true;
            if (!this.isStatusTimerScheduled) {
                this.isStatusTimerScheduled = true;
                this.schedule(() => {
                    this.updateDailyRewardsStatus();
                }, 1);
            }
        }).catch((error) => {
            console.error('Reload online reward config failed:', error);
            this.node.active = true;
        });
    }

    public hide(): void {
        this.node.active = false;
    }

    public getCurrentOnlineMinutes(): number {
        return this.getOnlineMinutes();
    }
}
