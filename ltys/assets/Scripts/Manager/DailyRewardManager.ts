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

    @property(cc.ScrollView)
    rewardScrollView: cc.ScrollView = null;

    @property(cc.Node)
    rewardItemTemplate: cc.Node = null;

    @property
    listColumns: number = 1;

    @property
    listHorizontalSpacing: number = 14;

    @property
    listVerticalSpacing: number = 21;

    @property
    listTopPadding: number = 4;

    private dailyRewards: OnlineRewardItem[] = [];
    private onlineRewardConfigs: OnlineRewardConfig[] = [];
    private isConfigLoaded = false;
    private loadConfigPromise: Promise<void> | null = null;
    private contentNode: cc.Node = null;
    private spriteFrames: {[key: string]: cc.SpriteFrame} = {};

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

        this.setupPanelUI();

        this.loadOnlineRewardConfig().then(() => {
            this.initDailyRewards();
            this.updateDailyRewardUI();
            this.schedule(() => {
                this.updateDailyRewardsStatus();
            }, 1);
        }).catch((error) => {
            console.error('Load online reward config failed:', error);
        });
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
        let hasStatusChanged = false;

        this.dailyRewards.forEach(reward => {
            const isAvailable = !reward.isClaimed && onlineMinutes >= reward.requiredMinutes;
            if (reward.isAvailable !== isAvailable) {
                reward.isAvailable = isAvailable;
                hasStatusChanged = true;
            }
        });

        if (hasStatusChanged) {
            this.updateDailyRewardUI();
        } else {
            this.updateRewardCountdownLabels();
        }
    }

    private setupPanelUI(): void {
        if (!this.dailyPanel) {
            return;
        }

        const panelBg = this.dailyPanel.getChildByName('jiemiankuang');
        if (!panelBg) {
            return;
        }

        if (!this.rewardScrollView) {
            const scrollNode = panelBg.getChildByName('DailyRewardScrollView');
            this.rewardScrollView = scrollNode && scrollNode.getComponent(cc.ScrollView);
        }

        if (this.rewardScrollView) {
            this.contentNode = this.rewardScrollView.content;
            if (!this.rewardItemTemplate && this.contentNode) {
                this.rewardItemTemplate = this.contentNode.getChildByName('DailyRewardItemTemplate');
            }

            if (this.rewardItemTemplate) {
                this.rewardItemTemplate.active = false;
            }
        }
    }

    private updateDailyRewardUI(keepOffset: boolean = false, scrollOffset?: cc.Vec2): void {
        if (!this.dailyPanel) {
            console.error('Daily panel not assigned');
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

        this.dailyRewards.sort((a, b) => a.id - b.id);

        for (let i = 0; i < this.dailyRewards.length; i++) {
            const rewardItem = this.createRewardItem(this.dailyRewards[i]);
            this.contentNode.addChild(rewardItem);
        }

        this.adjustRewardListLayout(keepOffset, scrollOffset);
    }

    private createRewardItem(rewardData: OnlineRewardItem): cc.Node {
        const item = cc.instantiate(this.rewardItemTemplate);
        item.name = `dailyReward${rewardData.id}`;
        item.active = true;

        const titleLabel = item.getChildByName('dayLabel')?.getComponent(cc.Label);
        if (titleLabel) {
            titleLabel.string = rewardData.name;
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

        const claimText = buttonNode.getChildByName('claimText')?.getComponent(cc.Label);
        const onlineMinutes = this.getOnlineMinutes();
        const remainingMinutes = Math.max(0, rewardData.requiredMinutes - onlineMinutes);

        buttonNode.off(cc.Node.EventType.TOUCH_END);
        buttonNode.color = cc.Color.WHITE;

        if (rewardData.isClaimed) {
            button.interactable = false;
            this.setNodeSprite(buttonNode, 'anniuyilingqu');
            if (claimText) {
                claimText.string = '';
            }
        } else {
            button.interactable = rewardData.isAvailable;
            if (rewardData.isAvailable) {
                this.setNodeSprite(buttonNode, 'anniulingqu');
                if (claimText) {
                    claimText.string = '';
                }
                buttonNode.on(cc.Node.EventType.TOUCH_END, () => this.onClaimClick(rewardData.id), this);
            } else {
                this.setNodeSprite(buttonNode, 'anniukong');
                if (claimText) {
                    claimText.string = `${remainingMinutes}分钟后领取`;
                }
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

        const rowWidth = columns * itemWidth + Math.max(0, columns - 1) * horizontalSpacing;
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
        }

    }

    private updateRewardCountdownLabels(): void {
        if (!this.contentNode) {
            return;
        }

        const onlineMinutes = this.getOnlineMinutes();
        for (let i = 0; i < this.dailyRewards.length; i++) {
            const rewardData = this.dailyRewards[i];
            if (rewardData.isClaimed || rewardData.isAvailable) {
                continue;
            }

            const item = this.contentNode.getChildByName(`dailyReward${rewardData.id}`);
            const claimText = item?.getChildByName('claimButton')?.getChildByName('claimText')?.getComponent(cc.Label);
            if (claimText) {
                const remainingMinutes = Math.max(0, rewardData.requiredMinutes - onlineMinutes);
                claimText.string = `${remainingMinutes}分钟后领取`;
            }
        }
    }

    private setNodeSprite(node: cc.Node, resourceName: string): void {
        const sprite = node.getComponent(cc.Sprite) || node.addComponent(cc.Sprite);
        const width = node.width;
        const height = node.height;
        sprite.sizeMode = cc.Sprite.SizeMode.CUSTOM;

        const cachedSpriteFrame = this.spriteFrames[resourceName];
        if (cachedSpriteFrame) {
            sprite.spriteFrame = cachedSpriteFrame;
            node.setContentSize(width, height);
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
                sprite.sizeMode = cc.Sprite.SizeMode.CUSTOM;
                node.setContentSize(width, height);
            }
        });
    }

    private onClaimClick(rewardId: number): void {
        const reward = this.dailyRewards.find(r => r.id === rewardId);
        if (!reward) return;
        if (!reward.isAvailable) return;
        if (reward.isClaimed) return;

        const scrollOffset = this.rewardScrollView && this.rewardScrollView.getScrollOffset
            ? this.rewardScrollView.getScrollOffset()
            : cc.v2(0, 0);

        this.giveReward(reward);
        reward.isClaimed = true;
        this.markRewardClaimed(rewardId);
        this.updateDailyRewardUI(true, scrollOffset);
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
        this.loadOnlineRewardConfig().then(() => {
            this.initDailyRewards();
            this.updateDailyRewardUI();
        }).catch((error) => {
            console.error('Reload online reward config failed:', error);
        });
    }

    public hide(): void {
        this.node.active = false;
    }

    public getCurrentOnlineMinutes(): number {
        return this.getOnlineMinutes();
    }
}
