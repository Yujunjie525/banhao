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
    rewardContent: cc.Node = null;

    @property(cc.Node)
    rewardItemTemplate: cc.Node = null;

    private dailyRewards: OnlineRewardItem[] = [];
    private onlineRewardConfigs: OnlineRewardConfig[] = [];
    private isConfigLoaded = false;
    private loadConfigPromise: Promise<void> | null = null;

    private todayDate: string = '';
    private rewardItemNodes: cc.Node[] = [];

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
        this.dailyRewards.forEach(reward => {
            reward.isAvailable = !reward.isClaimed && onlineMinutes >= reward.requiredMinutes;
        });

        this.updateDailyRewardUI();
    }

    private updateDailyRewardUI(preserveScrollPosition: boolean = false): void {
        if (!this.dailyPanel) {
            console.error('Daily panel not assigned');
            return;
        }

        const previousOffset = preserveScrollPosition && this.rewardScrollView
            ? this.rewardScrollView.getScrollOffset().clone()
            : null;

        if (!this.ensureRewardScrollList()) {
            return;
        }

        this.dailyRewards.sort((a, b) => a.id - b.id);

        const viewWidth = this.rewardScrollView.node.width;
        const viewHeight = this.rewardScrollView.node.height;
        const columnCount = 3;
        const verticalSpacing = 20;
        const paddingTop = 0;
        const paddingBottom = 20;
        const itemSize = this.getRewardItemSize(this.rewardItemTemplate);
        const itemScale = this.rewardItemTemplate.scale || 1;
        const layoutItemWidth = itemSize.width * itemScale;
        const layoutItemHeight = itemSize.height * itemScale;
        const itemLayoutHeight = Math.max(layoutItemHeight, 234 * itemScale);
        const horizontalSpacing = Math.max(0, (viewWidth - layoutItemWidth * columnCount) / Math.max(1, columnCount - 1));
        const rowCount = Math.ceil(this.dailyRewards.length / columnCount);
        const totalHeight = rowCount * itemLayoutHeight + Math.max(0, rowCount - 1) * verticalSpacing + paddingTop + paddingBottom;
        const gridWidth = columnCount * layoutItemWidth + (columnCount - 1) * horizontalSpacing;
        const startX = -gridWidth / 2 + layoutItemWidth / 2;
        const shouldScrollToTop = this.rewardContent.children.length === 0;
        const activeItemNames: {[key: string]: boolean} = {};

        this.rewardContent.width = viewWidth;
        this.rewardContent.height = Math.max(viewHeight + 1, totalHeight);
        this.rewardContent.anchorX = 0.5;
        this.rewardContent.anchorY = 1;
        this.rewardContent.x = 0;

        for (let i = 0; i < this.dailyRewards.length; i++) {
            const rewardData = this.dailyRewards[i];
            const row = Math.floor(i / columnCount);
            const col = i % columnCount;
            const itemName = `dailyRewardItem${rewardData.id}`;
            let itemNode = this.rewardItemNodes[i];

            if (!itemNode) {
                itemNode = this.rewardContent.getChildByName(itemName);
            }

            if (!itemNode) {
                itemNode = cc.instantiate(this.rewardItemTemplate);
                itemNode.name = itemName;
                itemNode.parent = this.rewardContent;
                this.rewardItemNodes[i] = itemNode;
            }

            activeItemNames[itemName] = true;
            itemNode.active = true;
            itemNode.width = itemSize.width;
            itemNode.height = itemSize.height;
            itemNode.scale = itemScale;
            itemNode.x = startX + col * (layoutItemWidth + horizontalSpacing);
            itemNode.y = -paddingTop - layoutItemHeight / 2 - row * (itemLayoutHeight + verticalSpacing);

            this.setRewardItemData(itemNode, rewardData);
        }

        for (let i = this.rewardItemNodes.length - 1; i >= this.dailyRewards.length; i--) {
            if (this.rewardItemNodes[i]) {
                this.rewardItemNodes[i].active = false;
            }
        }

        for (let i = this.rewardContent.children.length - 1; i >= 0; i--) {
            const child = this.rewardContent.children[i];
            if (child.name.indexOf('dailyRewardItem') === 0 && !activeItemNames[child.name]) {
                child.removeFromParent();
                child.destroy();
            }
        }

        if (previousOffset) {
            this.rewardScrollView.stopAutoScroll();
            this.rewardScrollView.scrollToOffset(previousOffset, 0);
        } else if (shouldScrollToTop && this.rewardScrollView.scrollToTop) {
            this.rewardContent.y = viewHeight / 2;
            this.rewardScrollView.scrollToTop(0);
        } else {
            const minY = viewHeight / 2;
            const maxY = Math.max(minY, this.rewardContent.height - viewHeight / 2);
            this.rewardContent.y = Math.min(Math.max(this.rewardContent.y, minY), maxY);
        }
    }

    private ensureRewardScrollList(): boolean {
        const panel = this.dailyPanel || this.node;
        const frameNode = panel.getChildByName('jiemiankuang') || panel;

        if (!this.rewardScrollView || !this.rewardContent || !this.rewardItemTemplate) {
            console.error('Daily reward ScrollView, content or item template not assigned');
            return false;
        }

        const scrollNode = this.rewardScrollView.node;
        const viewNode = this.rewardContent.parent;
        if (!scrollNode || !viewNode) {
            console.error('Daily reward ScrollView hierarchy is incomplete');
            return false;
        }

        const backgroundNode = frameNode.getChildByName('shendikuang');
        const viewWidth = backgroundNode && backgroundNode.width > 0 ? backgroundNode.width : 774;
        const viewHeight = backgroundNode && backgroundNode.height > 0 ? backgroundNode.height : 430;

        scrollNode.width = viewWidth;
        scrollNode.height = viewHeight;
        scrollNode.x = backgroundNode ? backgroundNode.x : 0;
        scrollNode.y = backgroundNode ? backgroundNode.y : -32;

        this.rewardScrollView.horizontal = false;
        this.rewardScrollView.vertical = true;
        this.rewardScrollView.inertia = true;
        this.rewardScrollView.brake = 0.75;
        this.rewardScrollView.elastic = true;
        this.rewardScrollView.bounceDuration = 0.23;
        this.rewardScrollView.cancelInnerEvents = true;

        viewNode.width = viewWidth;
        viewNode.height = viewHeight;
        viewNode.anchorX = 0.5;
        viewNode.anchorY = 0.5;
        viewNode.x = 0;
        viewNode.y = 0;

        this.rewardContent.anchorX = 0.5;
        this.rewardContent.anchorY = 1;
        this.rewardContent.x = 0;
        if (this.rewardContent.children.length === 0) {
            this.rewardContent.y = viewHeight / 2;
        }
        this.rewardScrollView.content = this.rewardContent;
        this.rewardItemNodes = this.collectRewardItemNodes(frameNode, panel);
        if (this.rewardItemNodes.length === 0 && this.rewardItemTemplate) {
            this.rewardItemNodes = [this.rewardItemTemplate];
        }
        for (const itemNode of this.rewardItemNodes) {
            itemNode.parent = this.rewardContent;
        }
        this.rewardItemNodes.sort((a, b) => this.getRewardItemIndex(a) - this.getRewardItemIndex(b));

        return true;
    }

    private collectRewardItemNodes(frameNode: cc.Node, panel: cc.Node): cc.Node[] {
        const result: cc.Node[] = [];
        const seen: {[key: string]: boolean} = {};
        const collectFrom = (parent: cc.Node) => {
            if (!parent) return;
            for (let i = 1; i <= 31; i++) {
                const dayNode = parent.getChildByName(`day${i}`);
                const key = dayNode ? ((dayNode as any).uuid || `${dayNode.name}_${result.length}`) : '';
                if (dayNode && !seen[key]) {
                    seen[key] = true;
                    result.push(dayNode);
                }
            }
        };

        collectFrom(this.rewardContent);
        collectFrom(frameNode);
        if (frameNode !== panel) collectFrom(panel);
        return result;
    }

    private findRewardItemTemplate(frameNode: cc.Node, panel: cc.Node): cc.Node {
        const sources = frameNode === panel ? [frameNode] : [frameNode, panel];
        for (const source of sources) {
            for (let i = 1; i <= 31; i++) {
                const dayNode = source.getChildByName(`day${i}`);
                if (dayNode) return dayNode;
            }
        }
        return null;
    }

    private getRewardItemIndex(itemNode: cc.Node): number {
        const match = itemNode && itemNode.name ? itemNode.name.match(/^day(\d+)$/) : null;
        return match ? Number(match[1]) : 999;
    }

    private getRewardItemSize(itemNode: cc.Node): cc.Size {
        return cc.size(
            Math.max(itemNode.width, 120),
            Math.max(itemNode.height, 160)
        );
    }

    private setRewardItemData(dayNode: cc.Node, rewardData: OnlineRewardItem): void {
        const labelNode = dayNode.getChildByName('Label');
        if (labelNode) {
            const label = labelNode.getComponent(cc.Label);
            if (label) {
                label.string = `${rewardData.requiredMinutes}分钟`;
            }
        }

        const rewardString = `${rewardData.rewardNum}`;
        const reward1Node = dayNode.getChildByName('reward1');
        if (reward1Node) {
            const rewardLabel = reward1Node.getChildByName('Label');
            if (rewardLabel) {
                const label = rewardLabel.getComponent(cc.Label);
                if (label) {
                    label.string = rewardString;
                }
            }
        }

        const juese1 = dayNode.getChildByName('juese1');
        const numLabel = juese1 && juese1.getChildByName('num')
            ? juese1.getChildByName('num').getComponent(cc.Label)
            : null;
        if (numLabel) {
            numLabel.string = rewardString;
        }

        const rewardNode = dayNode.getChildByName('reward');
        const gotNode = dayNode.getChildByName('got');
        if (!rewardNode || !gotNode) {
            return;
        }

        const backgroundNode = rewardNode.getChildByName('Background');
        if (!backgroundNode) {
            return;
        }


        const labelChild = backgroundNode.getChildByName('Label');
        const rewardLabel = labelChild ? labelChild.getComponent(cc.Label) : null;
        const spriteComponent = backgroundNode.getComponent(cc.Sprite);
        const backgroundCache = backgroundNode as any;
        if (spriteComponent && !backgroundCache.dailyRewardNormalSpriteCaptured) {
            backgroundCache.dailyRewardNormalSpriteFrame = spriteComponent.spriteFrame;
            backgroundCache.dailyRewardNormalSpriteCaptured = true;
        }
        backgroundNode.color = new cc.Color(255, 255, 255);
        backgroundNode.off(cc.Node.EventType.TOUCH_END);

        if (rewardData.isClaimed) {
            rewardNode.active = true;
            gotNode.active = false;

            if (spriteComponent && !backgroundCache.dailyRewardClaimedSpriteLoaded && !backgroundCache.dailyRewardClaimedSpriteLoading) {
                backgroundCache.dailyRewardClaimedSpriteLoading = true;
                const iconPath = `2main/anniuyilingqu`;
                cc.loader.loadRes(iconPath, cc.SpriteFrame, (err, spriteFrame) => {
                    backgroundCache.dailyRewardClaimedSpriteLoading = false;
                    if (err) {
                        console.error(`Load ${iconPath} failed:`, err);
                    } else {
                        spriteComponent.spriteFrame = spriteFrame;
                        backgroundCache.dailyRewardClaimedSpriteLoaded = true;
                    }
                });
            }

            if (rewardLabel) {
                rewardLabel.node.active = false;
            }
        } else if (rewardData.isAvailable) {
            rewardNode.active = true;
            gotNode.active = false;
            backgroundCache.dailyRewardClaimedSpriteLoaded = false;
            backgroundCache.dailyRewardClaimedSpriteLoading = false;

            if (spriteComponent && backgroundCache.dailyRewardNormalSpriteCaptured) {
                spriteComponent.spriteFrame = backgroundCache.dailyRewardNormalSpriteFrame;
            }

            if (rewardLabel) {
                rewardLabel.string = '';
                rewardLabel.node.active = false;
            }

            backgroundNode.on(cc.Node.EventType.TOUCH_END, () => this.onClaimClick(rewardData.id), this);
        } else {
            rewardNode.active = false;
            gotNode.active = true;
            backgroundCache.dailyRewardClaimedSpriteLoaded = false;
            backgroundCache.dailyRewardClaimedSpriteLoading = false;

            if (spriteComponent && backgroundCache.dailyRewardNormalSpriteCaptured) {
                spriteComponent.spriteFrame = backgroundCache.dailyRewardNormalSpriteFrame;
            }

            const newLabelNode = gotNode.getChildByName('New Label');
            const label = newLabelNode ? newLabelNode.getComponent(cc.Label) : null;
            if (label) {
                const onlineMinutes = this.getOnlineMinutes();
                const remainingMinutes = Math.max(0, rewardData.requiredMinutes - onlineMinutes);
                label.string = `${remainingMinutes}分钟后可领取`;
            }
        }
    }

    private onClaimClick(rewardId: number): void {
        const reward = this.dailyRewards.find(r => r.id === rewardId);
        if (!reward) return;
        if (!reward.isAvailable) return;
        if (reward.isClaimed) return;

        this.giveReward(reward);
        reward.isClaimed = true;
        this.markRewardClaimed(rewardId);
        this.updateDailyRewardUI(true);
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
