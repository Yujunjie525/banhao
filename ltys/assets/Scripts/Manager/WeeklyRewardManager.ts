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

    @property(cc.ScrollView)
    rewardScrollView: cc.ScrollView = null;

    @property(cc.Node)
    rewardItemTemplate: cc.Node = null;

    @property
    listColumns: number = 1;

    @property
    listHorizontalSpacing: number = 0;

    @property
    listVerticalSpacing: number = 21;

    @property
    listTopPadding: number = 4;

    private weeklyRewards: WeeklyRewardItem[] = [];
    private weeklyRewardConfigs: WeeklyRewardConfig[] = [];
    private isConfigLoaded = false;
    private loadConfigPromise: Promise<void> | null = null;
    private contentNode: cc.Node = null;
    private spriteFrames: {[key: string]: cc.SpriteFrame} = {};

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

        this.setupPanelUI();

        this.loadWeeklyRewardConfig().then(() => {
            this.initWeeklyRewards();
            this.updateWeeklyRewardUI();
        }).catch((error) => {
            console.error('Load weekly reward config failed:', error);
        });
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

    private setupPanelUI(): void {
        if (!this.weekPanel) {
            return;
        }

        const panelBg = this.weekPanel.getChildByName('jiemiankuang');
        if (!panelBg) {
            return;
        }

        if (!this.rewardScrollView) {
            const scrollNode = panelBg.getChildByName('WeekRewardScrollView');
            this.rewardScrollView = scrollNode && scrollNode.getComponent(cc.ScrollView);
        }

        if (this.rewardScrollView) {
            this.contentNode = this.rewardScrollView.content;
            if (!this.rewardItemTemplate && this.contentNode) {
                this.rewardItemTemplate = this.contentNode.getChildByName('WeekRewardItemTemplate');
            }

            if (this.rewardItemTemplate) {
                this.rewardItemTemplate.active = false;
            }
        }

    }

    private updateWeeklyRewardUI(keepOffset: boolean = false, scrollOffset?: cc.Vec2): void {
        if (!this.weekPanel) {
            console.error('Week panel not assigned');
            return;
        }

        if (!this.contentNode) {
            this.setupPanelUI();
        }

        if (!this.contentNode || !this.rewardItemTemplate) {
            return;
        }

        this.contentNode.children.slice().forEach((child) => {
            if (child !== this.rewardItemTemplate) {
                child.removeFromParent(false);
                child.destroy();
            }
        });
        this.weeklyRewards.sort((a, b) => a.id - b.id);

        for (let i = 0; i < this.weeklyRewards.length; i++) {
            const rewardItem = this.createRewardItem(this.weeklyRewards[i]);
            this.contentNode.addChild(rewardItem);
        }

        this.adjustRewardListLayout(keepOffset, scrollOffset);
    }

    private createRewardItem(rewardData: WeeklyRewardItem): cc.Node {
        const item = cc.instantiate(this.rewardItemTemplate);
        item.name = `weekReward${rewardData.id}`;
        item.active = true;

        const dayLabel = item.getChildByName('dayLabel')?.getComponent(cc.Label);
        if (dayLabel) {
            dayLabel.string = this.getDayText(rewardData.id);
        }

        const rewardLabel = item.getChildByName('rewardBg')?.getChildByName('rewardLabel')?.getComponent(cc.Label);
        if (rewardLabel) {
            rewardLabel.string = `${rewardData.rewardNum}`;
        }

        const buttonNode = item.getChildByName('claimButton');
        const button = buttonNode && buttonNode.getComponent(cc.Button);
        if (!buttonNode || !button) {
            return item;
        }

        buttonNode.off(cc.Node.EventType.TOUCH_END);
        buttonNode.color = cc.Color.WHITE;

        if (rewardData.isClaimed) {
            button.interactable = false;
            this.setNodeSprite(buttonNode, 'anniuyilingqu');
        } else {
            this.setNodeSprite(buttonNode, 'anniulingqu');
            button.interactable = rewardData.isAvailable;
            if (rewardData.isAvailable) {
                buttonNode.on(cc.Node.EventType.TOUCH_END, () => this.onClaimClick(rewardData.id), this);
            } else {
                buttonNode.color = new cc.Color(120, 120, 120);
            }
        }

        return item;
    }

    private adjustRewardListLayout(keepOffset: boolean = false, scrollOffset?: cc.Vec2): void {
        if (!this.rewardScrollView || !this.contentNode || !this.rewardItemTemplate) {
            return;
        }

        const children = this.contentNode.children.filter((child) => child !== this.rewardItemTemplate);
        const columns = Math.max(1, this.listColumns);
        const itemWidth = this.rewardItemTemplate.width;
        const itemHeight = this.rewardItemTemplate.height;
        const horizontalSpacing = this.listHorizontalSpacing;
        const verticalSpacing = this.listVerticalSpacing;
        const yPadding = this.listTopPadding;
        const viewHeight = this.rewardScrollView.node.height;
        const rowCount = Math.ceil(children.length / columns);
        const totalHeight = rowCount * itemHeight + Math.max(0, rowCount - 1) * verticalSpacing + 2 * yPadding;

        this.contentNode.width = this.rewardScrollView.node.width;
        this.contentNode.height = Math.max(viewHeight, totalHeight);

        const rowWidth = columns * itemWidth + (columns - 1) * horizontalSpacing;
        const startX = -rowWidth / 2 + itemWidth / 2;

        for (let i = 0; i < children.length; i++) {
            const child = children[i];
            const row = Math.floor(i / columns);
            const column = i % columns;
            child.x = startX + column * (itemWidth + horizontalSpacing);
            child.y = -yPadding - itemHeight / 2 - row * (itemHeight + verticalSpacing);
        }

        if (keepOffset && scrollOffset && this.rewardScrollView.scrollToOffset) {
            this.rewardScrollView.scrollToOffset(scrollOffset, 0);
            return;
        }

        this.rewardScrollView.scrollToTop(0.1);
    }

    private getDayText(dayId: number): string {
        const dayTexts = [
            '周一',
            '周二',
            '周三',
            '周四',
            '周五',
            '周六',
            '周日'
        ];
        return dayTexts[dayId - 1] || `Day ${dayId}`;
    }

    private setNodeSprite(node: cc.Node, resourceName: string): void {
        const sprite = node.getComponent(cc.Sprite) || node.addComponent(cc.Sprite);
        const cachedSpriteFrame = this.spriteFrames[resourceName];
        if (cachedSpriteFrame) {
            sprite.spriteFrame = cachedSpriteFrame;
            return;
        }

        cc.loader.loadRes(`2Main1/${resourceName}`, cc.SpriteFrame, (err: Error, spriteFrame: cc.SpriteFrame) => {
            if (err) {
                console.error(`Load 2Main1/${resourceName} failed:`, err);
                return;
            }

            this.spriteFrames[resourceName] = spriteFrame;
            if (node && node.isValid) {
                sprite.spriteFrame = spriteFrame;
            }
        });
    }

    private onClaimClick(rewardId: number): void {
        const reward = this.weeklyRewards.find(r => r.id === rewardId);
        if (!reward) return;
        if (!reward.isAvailable) return;
        if (reward.isClaimed) return;

        const scrollOffset = this.rewardScrollView && this.rewardScrollView.getScrollOffset
            ? this.rewardScrollView.getScrollOffset()
            : cc.v2(0, 0);

        this.giveReward(reward);
        reward.isClaimed = true;
        this.markRewardClaimed(rewardId);
        this.updateWeeklyRewardUI(true, scrollOffset);
        this.showToast(`获得${reward.rewardNum}钻石。`);
    }

    private onCloseClick(): void {
        this.node.active = false;
    }

    private showToast(message: string): void {
        TipsManager.show(message);
    }

    public show(): void {
        this.node.active = true;
        this.loadWeeklyRewardConfig().then(() => {
            this.initWeeklyRewards();
            this.updateWeeklyRewardUI();
        }).catch((error) => {
            console.error('Reload weekly reward config failed:', error);
        });
    }

    public hide(): void {
        this.node.active = false;
    }
}
