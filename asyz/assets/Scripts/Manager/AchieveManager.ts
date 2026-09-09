const {ccclass, property} = cc._decorator;
import mGameData from '../Load/GameData';
import TipsManager from '../Load/TipsManager';
import UserDataSyncManager from './UserDataSyncManager';

interface AchievementConfig {
    id: number;
    icon: string;
    name: string;
    desc: string;
    type: string;
    count: number;
    rewardGold: number;
}

interface AchievementItemData extends AchievementConfig {
    isCompleted: boolean;
    isClaimed: boolean;
    currentProgress?: number;
}

@ccclass
export default class AchieveManager extends cc.Component {
    @property(cc.Button)
    closeButton: cc.Button = null;

    @property(cc.ScrollView)
    scrollView: cc.ScrollView = null;

    @property(cc.Prefab)
    achieveItemPrefab: cc.Prefab = null;

    private achieves: AchievementItemData[] = [];
    private achieveConfigs: AchievementConfig[] = [];
    private claimedAchievementIds: number[] = [];
    private itemNodesById: {[id: number]: cc.Node} = {};
    private isConfigLoaded = false;
    private loadConfigPromise: Promise<void> | null = null;
    private claimHandler: ((achieveId: number) => void) | null = null;

    private readonly achieveClaimedKey: string = 'Achievesclaimed';
    private readonly totalOnlineMinutesKey: string = 'totalOnlineMinutes';
    private readonly dailyOnlineMinutesKey: string = 'dailyOnlineMinutes';

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

    private getAchieveClaimedList(): number[] {
        const storageKey = this.getKeyWithUserId(this.achieveClaimedKey);
        const claimedStr = cc.sys.localStorage.getItem(storageKey);
        if (!claimedStr) {
            return [];
        }

        try {
            const parsed = JSON.parse(claimedStr);
            return Array.isArray(parsed) ? parsed : [];
        } catch (error) {
            console.error('Parse achieve claimed data failed:', error);
            return [];
        }
    }

    private saveAchieveClaimedList(claimedList: number[]): void {
        const storageKey = this.getKeyWithUserId(this.achieveClaimedKey);
        cc.sys.localStorage.setItem(storageKey, JSON.stringify(claimedList));
        UserDataSyncManager.requestUpload();
    }

    protected onLoad(): void {
        if (this.closeButton) {
            this.closeButton.node.on('click', this.onCloseClick, this);
        }

        this.claimHandler = (achieveId: number) => this.onClaimClick(achieveId);
    }

    protected onEnable(): void {
        this.refreshAchievements().catch((error) => {
            console.error('Refresh achievement data failed:', error);
        });
    }

    private loadAchievementConfig(): Promise<void> {
        if (this.isConfigLoaded) {
            return Promise.resolve();
        }

        if (this.loadConfigPromise) {
            return this.loadConfigPromise;
        }

        this.loadConfigPromise = new Promise((resolve, reject) => {
            cc.loader.loadRes('config/achievement', cc.JsonAsset, (err: Error, jsonAsset: cc.JsonAsset) => {
                if (err) {
                    reject(err);
                    return;
                }

                const rawConfigs = jsonAsset && Array.isArray(jsonAsset.json) ? jsonAsset.json : [];
                this.achieveConfigs = rawConfigs.map((config: any) => ({
                    id: Number(config.id) || 0,
                    icon: `${config.icon || ''}`,
                    name: `${config.name || ''}`,
                    desc: `${config.desc || ''}`,
                    type: `${config.type || ''}`,
                    count: Number(config.target ?? config.count) || 0,
                    rewardGold: Number(config.rewardDiamond ?? config.rewardGold) || 0
                }));
                this.isConfigLoaded = true;
                resolve();
            });
        });

        return this.loadConfigPromise;
    }

    private initAchieves(): void {
        this.claimedAchievementIds = this.getAchieveClaimedList();
        const progressByType: {[type: string]: number} = {};

        this.achieves = this.achieveConfigs.map((config) => {
            if (progressByType[config.type] === undefined) {
                progressByType[config.type] = this.getAchieveProgress(config);
            }

            const currentProgress = progressByType[config.type];
            return {
                ...config,
                isCompleted: currentProgress >= config.count,
                isClaimed: this.claimedAchievementIds.indexOf(config.id) !== -1,
                currentProgress
            };
        });
    }

    private async refreshAchievements(): Promise<void> {
        await this.loadAchievementConfig();
        this.initAchieves();
        this.refreshScrollView();
    }

    private getHighestUnlockedLevel(): number {
        const highestUnlockedLevel = Math.max(1, Math.floor(mGameData.unlockedLevel || 1));
        const totalLevels = mGameData.getTotalLevels ? mGameData.getTotalLevels() : highestUnlockedLevel;
        return totalLevels > 0
            ? Math.min(highestUnlockedLevel, totalLevels)
            : highestUnlockedLevel;
    }

    private getTotalOnlineMinutes(): number {
        // 成就统计所有日期的在线时长，在线奖励仍然使用 dailyOnlineMinutes。
        const totalMinutes = UserDataSyncManager.getStoredNumber(this.totalOnlineMinutesKey, -1);
        return totalMinutes >= 0
            ? totalMinutes
            : UserDataSyncManager.getStoredNumber(this.dailyOnlineMinutesKey, 0);
    }

    private getAchieveProgress(achieve: AchievementConfig): number {
        switch (achieve.type) {
            case '1':
                return this.getHighestUnlockedLevel();
            case '2':
                return this.getTotalOnlineMinutes();
            case '3':
                return mGameData.totalGoldEarned;
            case '4':
                return UserDataSyncManager.getTotalConsumedStamina();
            default:
                return 0;
        }
    }

    private markAchieveClaimed(achieveId: number): void {
        if (this.claimedAchievementIds.indexOf(achieveId) === -1) {
            this.claimedAchievementIds.push(achieveId);
            this.saveAchieveClaimedList(this.claimedAchievementIds);
        }
    }

    private refreshScrollView(preserveScrollPosition: boolean = false): void {
        if (!this.scrollView || !this.achieveItemPrefab || !this.scrollView.content) {
            console.error('ScrollView or achieveItemPrefab not assigned');
            return;
        }

        const previousOffset = preserveScrollPosition
            ? this.scrollView.getScrollOffset().clone()
            : null;

        // The scene keeps one zero-sized editor placeholder under content.
        // Remove only nodes that are not managed achievement instances so the
        // cached items can still be reused on later refreshes.
        const contentChildren = this.scrollView.content.children;
        for (let i = contentChildren.length - 1; i >= 0; i--) {
            if (!(contentChildren[i] as any).__achievementItemManaged) {
                contentChildren[i].removeFromParent();
            }
        }

        this.achieves.sort((a, b) => a.id - b.id);

        for (let i = 0; i < this.achieves.length; i++) {
            const achieveData = this.achieves[i];
            let achieveItem = this.itemNodesById[achieveData.id];
            if (!achieveItem || !achieveItem.isValid) {
                achieveItem = cc.instantiate(this.achieveItemPrefab);
                (achieveItem as any).__achievementItemManaged = true;
                this.scrollView.content.addChild(achieveItem);
                this.itemNodesById[achieveData.id] = achieveItem;
                this.bindClaimButton(achieveItem);
            }
            this.setAchieveItemData(achieveItem, achieveData);
        }

        this.adjustContainerSize(!preserveScrollPosition);

        if (previousOffset) {
            this.scrollView.stopAutoScroll();
            this.scrollView.scrollToOffset(previousOffset, 0);
        }
    }

    private setAchieveItemData(achieveItem: cc.Node, achieveData: AchievementItemData): void {
        (achieveItem as any).__achievementId = achieveData.id;
        const iconNode = achieveItem.getChildByName('icon');
        const nameNode = achieveItem.getChildByName('name');
        const descriptionNode = achieveItem.getChildByName('description');
        const rewardNode = achieveItem.getChildByName('reward');
        const claimButton = achieveItem.getChildByName('claimButton')?.getComponent(cc.Button);
        const claimedNode = achieveItem.getChildByName('claimed');

        if (iconNode) {
            const spriteComponent = iconNode.getComponent(cc.Sprite);
            if (spriteComponent) {
            }
        }

        if (nameNode) {
            nameNode.getComponent(cc.Label).string = achieveData.name;
        }

        if (descriptionNode) {
            const currentProgress = achieveData.currentProgress || 0;
            const targetProgress = achieveData.count;
            const isCompleted = achieveData.isCompleted;

            const richText = descriptionNode.getComponent(cc.RichText);
            if (richText) {
                // if (achieveData.id === 6) {
                //     richText.maxWidth = 0;
                // }
                const progressColor = isCompleted ? '#00ff00' : '#ff0000';
                const progressText = `(${currentProgress}/${targetProgress})`;
                richText.string = this.buildAchievementText(
                    achieveData.desc,
                    progressText,
                    progressColor,
                    achieveData.id === 1
                );
            }
        }

        if (rewardNode) {
            rewardNode.getChildByName('cost').getComponent(cc.Label).string = `${achieveData.rewardGold}`;
        }

        if (claimButton) {
            if (achieveData.isClaimed) {
                claimButton.node.active = false;
                if (claimedNode) {
                    claimedNode.active = true;
                }
            } else if (achieveData.isCompleted) {
                claimButton.node.active = true;
                if (claimedNode) {
                    claimedNode.active = false;
                }
                claimButton.interactable = true;
                const buttonSprite = claimButton.node.getComponent(cc.Sprite);
                if (buttonSprite) {
                    buttonSprite.node.color = cc.Color.WHITE;
                }
            } else {
                claimButton.node.active = true;
                if (claimedNode) {
                    claimedNode.active = false;
                }
                claimButton.interactable = false;
                const buttonSprite = claimButton.node.getComponent(cc.Sprite);
                if (buttonSprite) {
                    buttonSprite.node.color = cc.Color.GRAY;
                }
            }
        }
    }

    private bindClaimButton(achieveItem: cc.Node): void {
        const claimButton = achieveItem.getChildByName('claimButton')?.getComponent(cc.Button);
        if (!claimButton || (claimButton.node as any).__achievementClaimBound) {
            return;
        }

        (claimButton.node as any).__achievementClaimBound = true;
        claimButton.node.on(cc.Node.EventType.TOUCH_END, () => {
            const achieveId = (achieveItem as any).__achievementId;
            if (typeof achieveId === 'number') {
                this.onClaimClick(achieveId);
            }
        }, this);
    }

    private buildAchievementText(desc: string, progress: string, color: string, progressOnNextLine: boolean = false): string {
        const separator = progressOnNextLine ? '<br/>' : '';
        return `${desc}${separator}<color=${color}>${progress}。</color>`;
    }

    private adjustContainerSize(resetToTop: boolean = true): void {
        if (!this.scrollView || !this.scrollView.content) {
            console.error('ScrollView or content node not assigned');
            return;
        }

        const container = this.scrollView.content;
        const children = container.children;

        if (children.length === 0) {
            return;
        }

        const item = children[0];
        const itemWidth = item.width;
        const itemHeight = item.height;
        const itemScaleX = Math.abs(item.scaleX || 1);
        const itemScaleY = Math.abs(item.scaleY || 1);

        const view = this.scrollView.node.getChildByName('view');
        if (!view) {
            console.error('view node not found');
            return;
        }
        const viewWidth = view.width;

        const columnCount = 3;
        const verticalSpacing = 15;
        const xPadding = 0;
        const yPadding = 0;
        const layoutItemWidth = itemWidth * itemScaleX;
        const layoutItemHeight = itemHeight * itemScaleY;
        const horizontalSpacing = Math.max(0, (viewWidth - xPadding * 2 - layoutItemWidth * columnCount) / Math.max(1, columnCount - 1));
        const rowCount = Math.ceil(children.length / columnCount);
        const totalHeight = rowCount * layoutItemHeight + Math.max(0, rowCount - 1) * verticalSpacing + 2 * yPadding;

        container.width = viewWidth;
        container.height = totalHeight;

        container.anchorX = 0.5;
        container.anchorY = 1;

        const gridWidth = columnCount * layoutItemWidth + (columnCount - 1) * horizontalSpacing;
        const startX = -gridWidth / 2 + layoutItemWidth / 2;

        for (let i = 0; i < children.length; i++) {
            const child = children[i];
            const row = Math.floor(i / columnCount);
            const col = i % columnCount;
            child.y = -yPadding - layoutItemHeight / 2 - row * (layoutItemHeight + verticalSpacing);
            child.x = startX + col * (layoutItemWidth + horizontalSpacing);
        }

        if (resetToTop && this.scrollView.scrollToTop) {
            this.scrollView.scrollToTop(0.1);
        }
    }

    private onClaimClick(achieveId: number): void {
        const achieve = this.achieves.find(a => a.id === achieveId);
        if (!achieve) {
            return;
        }

        if (!achieve.isCompleted) {
            console.log('Achievement not completed');
            return;
        }

        if (achieve.isClaimed) {
            console.log('Achievement already claimed');
            return;
        }

        this.giveReward(achieve);

        achieve.isClaimed = true;
        this.markAchieveClaimed(achieveId);

        const achieveItem = this.itemNodesById[achieveId];
        if (achieveItem && achieveItem.isValid) {
            this.setAchieveItemData(achieveItem, achieve);
        }
        this.showToast(`获得${achieve.rewardGold}钻石。`);
    }

    private giveReward(achieve: AchievementItemData): void {
        if (achieve.rewardGold <= 0) {
            return;
        }

        mGameData.addGold(achieve.rewardGold);
    }

    private onCloseClick(): void {
        this.node.active = false;
    }

    private showToast(message: string): void {
        TipsManager.show(message);
    }

    public show(): void {
        const wasActive = this.node.active;
        this.node.active = true;
        if (wasActive) {
            this.refreshAchievements().catch((error) => {
                console.error('Reload achievement config failed:', error);
            });
        }
    }

    public hide(): void {
        this.node.active = false;
    }
}
