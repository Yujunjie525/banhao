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
    private weekStartDate: string = '';
    private rewardItemTemplate: cc.Node = null;
    private rewardItemNodes: cc.Node[] = [];
    private rewardContent: cc.Node = null;
    private rewardScrollView: cc.ScrollView = null;

    private readonly weeklyRewardWeekStartKey: string = 'weeklyRewardWeekStart';
    private readonly weeklyRewardClaimedKey: string = 'weeklyRewardClaimed';

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

        this.refreshWeeklyRewards().catch((error) => {
            console.error('Load weekly reward config failed:', error);
        });
    }

    protected onEnable(): void {
        this.refreshWeeklyRewards().catch((error) => {
            console.error('Refresh weekly reward config failed:', error);
        });
    }

    private async refreshWeeklyRewards(): Promise<void> {
        await this.loadWeeklyRewardConfig();
        this.initWeeklyRewards();
        this.updateWeeklyRewardUI();
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

        if (!this.ensureRewardScrollList()) {
            return;
        }

        this.weeklyRewards.sort((a, b) => a.id - b.id);

        const viewWidth = this.rewardScrollView.node.width;
        const viewHeight = this.rewardScrollView.node.height;
        const columnCount = 3;
        const verticalSpacing = 26;
        const paddingTop = 16;
        const paddingBottom = 28;
        const itemSize = this.getRewardItemSize(this.rewardItemTemplate);
        const itemScale = this.rewardItemTemplate.scale || 1;
        const layoutItemWidth = itemSize.width * itemScale;
        const layoutItemHeight = itemSize.height * itemScale;
        const itemLayoutHeight = layoutItemHeight + 50 * itemScale;
        const horizontalSpacing = Math.min(56, Math.max(0, (viewWidth - layoutItemWidth * columnCount) / Math.max(1, columnCount - 1)));
        const rowCount = Math.ceil(this.weeklyRewards.length / columnCount);
        const totalHeight = rowCount * itemLayoutHeight + Math.max(0, rowCount - 1) * verticalSpacing + paddingTop + paddingBottom;
        const gridWidth = columnCount * layoutItemWidth + (columnCount - 1) * horizontalSpacing;
        const startX = -gridWidth / 2 + layoutItemWidth / 2;
        const activeItemNames: {[key: string]: boolean} = {};

        this.rewardContent.width = viewWidth;
        this.rewardContent.height = Math.max(viewHeight + 1, totalHeight);
        this.rewardContent.anchorX = 0.5;
        this.rewardContent.anchorY = 1;
        this.rewardContent.x = 0;
        this.rewardContent.y = viewHeight / 2;

        for (let i = 0; i < this.weeklyRewards.length; i++) {
            const rewardData = this.weeklyRewards[i];
            const row = Math.floor(i / columnCount);
            const col = i % columnCount;
            let itemNode = this.rewardItemNodes[i];

            if (!itemNode) {
                itemNode = this.rewardContent.getChildByName(`weekRewardItem${rewardData.id}`);
            }

            if (!itemNode) {
                itemNode = cc.instantiate(this.rewardItemTemplate);
                itemNode.name = `weekRewardItem${rewardData.id}`;
                itemNode.parent = this.rewardContent;
                this.rewardItemNodes[i] = itemNode;
            }

            activeItemNames[itemNode.name] = true;
            itemNode.active = true;
            itemNode.parent = this.rewardContent;
            itemNode.width = itemSize.width;
            itemNode.height = itemSize.height;
            itemNode.scale = itemScale;
            itemNode.x = startX + col * (layoutItemWidth + horizontalSpacing);
            itemNode.y = -paddingTop - layoutItemHeight / 2 - row * (itemLayoutHeight + verticalSpacing);

            this.setRewardItemData(itemNode, rewardData);
        }

        for (let i = this.rewardItemNodes.length - 1; i >= this.weeklyRewards.length; i--) {
            if (this.rewardItemNodes[i]) {
                this.rewardItemNodes[i].active = false;
            }
        }

        for (let i = this.rewardContent.children.length - 1; i >= 0; i--) {
            const child = this.rewardContent.children[i];
            if (child.name.indexOf('weekRewardItem') === 0 && !activeItemNames[child.name]) {
                child.removeFromParent();
                child.destroy();
            }
        }

        if (this.rewardScrollView.scrollToTop) {
            this.rewardScrollView.scrollToTop(0);
        }
    }

    private ensureRewardScrollList(): boolean {
        const panel = this.weekPanel || this.node;
        const frameNode = panel.getChildByName('jiemiankuang') || panel;

        if (!this.rewardItemTemplate) {
            this.rewardItemTemplate = this.findRewardItemTemplate(frameNode, panel);
            if (!this.rewardItemTemplate) {
                console.error('Weekly reward item template dayN not found');
                return false;
            }
        }

        let scrollNode = frameNode.getChildByName('WeekRewardScrollView');
        if (!scrollNode) {
            scrollNode = new cc.Node('WeekRewardScrollView');
            scrollNode.parent = frameNode;
            scrollNode.anchorX = 0.5;
            scrollNode.anchorY = 0.5;
        }

        const backgroundNode = frameNode.getChildByName('shendikuang');
        const viewWidth = backgroundNode && backgroundNode.width > 0 ? backgroundNode.width : 455;
        const viewHeight = backgroundNode && backgroundNode.height > 0 ? backgroundNode.height : 430;

        scrollNode.width = viewWidth;
        scrollNode.height = viewHeight;
        scrollNode.x = backgroundNode ? backgroundNode.x : 0;
        scrollNode.y = backgroundNode ? backgroundNode.y : -32;

        this.rewardScrollView = scrollNode.getComponent(cc.ScrollView) || scrollNode.addComponent(cc.ScrollView);
        this.rewardScrollView.horizontal = false;
        this.rewardScrollView.vertical = true;
        this.rewardScrollView.inertia = true;
        this.rewardScrollView.brake = 0.75;
        this.rewardScrollView.elastic = true;
        this.rewardScrollView.bounceDuration = 0.23;
        this.rewardScrollView.cancelInnerEvents = true;

        let viewNode = scrollNode.getChildByName('view');
        if (!viewNode) {
            viewNode = new cc.Node('view');
            viewNode.parent = scrollNode;
            viewNode.addComponent(cc.Mask);
        }
        viewNode.width = viewWidth;
        viewNode.height = viewHeight;
        viewNode.anchorX = 0.5;
        viewNode.anchorY = 0.5;
        viewNode.x = 0;
        viewNode.y = 0;

        this.rewardContent = viewNode.getChildByName('content');
        if (!this.rewardContent) {
            this.rewardContent = new cc.Node('content');
            this.rewardContent.parent = viewNode;
        }
        this.rewardContent.anchorX = 0.5;
        this.rewardContent.anchorY = 1;
        this.rewardContent.x = 0;
        this.rewardContent.y = viewHeight / 2;
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

    private setRewardItemData(dayNode: cc.Node, rewardData: WeeklyRewardItem): void {
        const labelNode = dayNode.getChildByName('Label');
        if (labelNode) {
            const label = labelNode.getComponent(cc.Label);
            if (label) {
                label.string = rewardData.name;
            }
        }

        const rewardString = `x${rewardData.rewardNum}`;
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
        backgroundNode.color = new cc.Color(255, 255, 255);
        backgroundNode.off(cc.Node.EventType.TOUCH_END);

        if (rewardData.isClaimed) {
            rewardNode.active = true;
            gotNode.active = false;

            const spriteComponent = backgroundNode.getComponent(cc.Sprite);
            if (spriteComponent) {
                const iconPath = `zzImg/anniuyilingqu`;
                cc.loader.loadRes(iconPath, cc.SpriteFrame, (err, spriteFrame) => {
                    if (err) {
                        console.error(`Load ${iconPath} failed:`, err);
                    } else {
                        spriteComponent.spriteFrame = spriteFrame;
                    }
                });
            }

            if (rewardLabel) {
                rewardLabel.node.active = false;
            }
        } else if (rewardData.isAvailable) {
            rewardNode.active = true;
            gotNode.active = false;

            if (rewardLabel) {
                rewardLabel.string = '';
                rewardLabel.node.active = false;
            }

            backgroundNode.on(cc.Node.EventType.TOUCH_END, () => this.onClaimClick(rewardData.id), this);
        } else if (rewardData.isMissed) {
            rewardNode.active = true;
            gotNode.active = false;
            backgroundNode.color = new cc.Color(128, 128, 128);

            if (rewardLabel) {
                rewardLabel.string = '';
                rewardLabel.node.active = false;
            }
        } else {
            rewardNode.active = false;
            gotNode.active = true;

            const newLabelNode = gotNode.getChildByName('New Label');
            const label = newLabelNode ? newLabelNode.getComponent(cc.Label) : null;
            if (label) {
                label.string = `${rewardData.daysUntilAvailable}天后可领取`;
            }
        }
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
        this.node.active = true;
        this.refreshWeeklyRewards().catch((error) => {
            console.error('Reload weekly reward config failed:', error);
        });
    }

    public hide(): void {
        this.node.active = false;
    }
}
