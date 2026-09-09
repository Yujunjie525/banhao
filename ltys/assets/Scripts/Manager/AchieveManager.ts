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
    private isConfigLoaded = false;
    private loadConfigPromise: Promise<void> | null = null;
    private claimHandler: ((achieveId: number) => void) | null = null;

    private readonly achieveClaimedKey: string = 'Achievesclaimed';
    private readonly achieveClaimedVersionKey: string = 'AchievesclaimedVersion';
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

    private migrateAchieveClaimedData(): void {
        const versionKey = this.getKeyWithUserId(this.achieveClaimedVersionKey);
        const storedVersion = Math.max(0, parseInt(cc.sys.localStorage.getItem(versionKey) || '0', 10) || 0);
        const targetVersion = 1;
        if (storedVersion >= targetVersion) {
            return;
        }

        const type1Ids = new Set(
            this.achieveConfigs
                .filter((config) => config.type === '1')
                .map((config) => config.id)
        );
        const claimedList = this.getAchieveClaimedList();
        const nextClaimedList = claimedList.filter((id) => !type1Ids.has(id));

        if (nextClaimedList.length !== claimedList.length) {
            this.saveAchieveClaimedList(nextClaimedList);
        }

        cc.sys.localStorage.setItem(versionKey, targetVersion.toString());
    }

    protected onLoad(): void {
        if (this.closeButton) {
            this.closeButton.node.on('click', this.onCloseClick, this);
        }

        this.claimHandler = (achieveId: number) => this.onClaimClick(achieveId);

        this.refreshAchievements().catch((error) => {
            console.error('Load achievement config failed:', error);
        });
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
                    desc: this.buildAchievementDesc(`${config.type || ''}`, Number(config.target ?? config.count) || 0, `${config.desc || ''}`),
                    type: `${config.type || ''}`,
                    count: Number(config.target ?? config.count) || 0,
                    rewardGold: Number(config.rewardGold ?? config.rewardDiamond) || 0
                }));
                this.migrateAchieveClaimedData();
                this.isConfigLoaded = true;
                resolve();
            });
        });

        return this.loadConfigPromise;
    }

    private buildAchievementDesc(type: string, count: number, fallback: string): string {
        switch (type) {
            case '1':
                return `通关关卡达到${count}关`;
            default:
                return fallback;
        }
    }

    private initAchieves(): void {
        this.achieves = this.achieveConfigs.map((config) => {
            const isCompleted = this.checkAchieveCompletion(config);
            const currentProgress = this.getAchieveProgress(config);
            return {
                ...config,
                isCompleted,
                isClaimed: this.checkAchieveClaimed(config.id),
                currentProgress
            };
        });
    }

    private async refreshAchievements(): Promise<void> {
        await this.loadAchievementConfig();
        this.initAchieves();
        const scrollOffset = this.scrollView && this.scrollView.getScrollOffset
            ? this.scrollView.getScrollOffset()
            : cc.v2(0, 0);
        this.refreshScrollView(true, scrollOffset);
    }

    private getPassedLevelCount(): number {
        return Math.max(0, Math.floor(Number(mGameData.unlockedLevel) || 1) - 1);
    }

    private getOnlineMinutes(): number {
        return UserDataSyncManager.getStoredNumber(this.dailyOnlineMinutesKey, 0);
    }

    private checkAchieveCompletion(achieve: AchievementConfig): boolean {
        switch (achieve.type) {
            case '1':
                return this.getPassedLevelCount() >= achieve.count;
            case '2':
                return this.getOnlineMinutes() >= achieve.count;
            case '3':
                return mGameData.totalGoldEarned >= achieve.count;
            case '4':
                return UserDataSyncManager.getTotalConsumedStamina() >= achieve.count;
            default:
                return false;
        }
    }

    private getAchieveProgress(achieve: AchievementConfig): number {
        switch (achieve.type) {
            case '1':
                return this.getPassedLevelCount();
            case '2':
                return this.getOnlineMinutes();
            case '3':
                return mGameData.totalGoldEarned;
            case '4':
                return UserDataSyncManager.getTotalConsumedStamina();
            default:
                return 0;
        }
    }

    private checkAchieveClaimed(achieveId: number): boolean {
        const claimedList = this.getAchieveClaimedList();
        return claimedList.includes(achieveId);
    }

    private markAchieveClaimed(achieveId: number): void {
        const claimedList = this.getAchieveClaimedList();
        if (!claimedList.includes(achieveId)) {
            claimedList.push(achieveId);
            this.saveAchieveClaimedList(claimedList);
        }
    }

    private refreshScrollView(keepOffset: boolean = false, scrollOffset?: cc.Vec2): void {
        if (!this.scrollView || !this.achieveItemPrefab || !this.scrollView.content) {
            console.error('ScrollView or achieveItemPrefab not assigned');
            return;
        }

        this.scrollView.content.removeAllChildren();
        this.achieves.sort((a, b) => a.id - b.id);

        for (let i = 0; i < this.achieves.length; i++) {
            const achieveData = this.achieves[i];
            const achieveItem = cc.instantiate(this.achieveItemPrefab);
            this.scrollView.content.addChild(achieveItem);
            this.setAchieveItemData(achieveItem, achieveData);
        }

        this.adjustContainerSize(keepOffset, scrollOffset);
    }

    private setAchieveItemData(achieveItem: cc.Node, achieveData: AchievementItemData): void {
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
                const progressColor = isCompleted ? '#00ff00' : '#ff0000';
                richText.string = `${achieveData.desc}<color=${progressColor}>(${currentProgress}/${targetProgress})</color>。`;
            }
        }

        if (rewardNode) {
            const costLabel = rewardNode.getChildByName('cost')?.getComponent(cc.Label);
            if (costLabel) {
                costLabel.string = `${achieveData.rewardGold}`;
            }
        }

        if (claimButton && this.claimHandler) {
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
                claimButton.node.on(cc.Node.EventType.TOUCH_END, () => this.onClaimClick(achieveData.id), this);
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

    private adjustContainerSize(keepOffset: boolean = false, scrollOffset?: cc.Vec2): void {
        if (!this.scrollView || !this.scrollView.content) {
            console.error('ScrollView or content node not assigned');
            return;
        }

        const container = this.scrollView.content;
        const children = container.children;

        if (children.length === 0) {
            return;
        }

        const view = this.scrollView.node.getChildByName('view');
        if (!view) {
            console.error('view node not found');
            return;
        }
        const viewWidth = view.width;
        const viewHeight = view.height;

        let itemWidth = 0;
        let itemHeight = 0;
        for (const child of children) {
            const bgNode = child.getChildByName('bg');
            const layoutSize = this.getItemLayoutSize(child);
            const widthSource = bgNode ? bgNode.width : layoutSize.width;
            itemWidth = Math.max(itemWidth, widthSource);
            itemHeight = Math.max(itemHeight, layoutSize.height);
        }

        if (itemWidth <= 0 || itemHeight <= 0) {
            const firstItem = children[0];
            itemWidth = firstItem.width;
            itemHeight = firstItem.height;
        }

        const horizontalSpacing = 20;
        const verticalSpacing = 30;
        const topPadding = 0;
        const bottomPadding = 0;
        const maxColumns = Math.max(1, Math.floor((viewWidth + horizontalSpacing) / (itemWidth + horizontalSpacing)));
        const columns = Math.min(children.length, maxColumns);
        const rowCount = Math.ceil(children.length / columns);
        const totalHeight = topPadding
            + rowCount * itemHeight
            + Math.max(0, rowCount - 1) * verticalSpacing
            + bottomPadding;

        container.width = viewWidth;
        container.height = Math.max(viewHeight, totalHeight);

        container.anchorX = 0.5;
        container.anchorY = 1;

        const rowWidth = columns * itemWidth + (columns - 1) * horizontalSpacing;
        const startX = -rowWidth / 2 + itemWidth / 2;

        for (let i = 0; i < children.length; i++) {
            const child = children[i];
            const row = Math.floor(i / columns);
            const column = i % columns;
            child.x = startX + column * (itemWidth + horizontalSpacing);
            child.y = -topPadding - itemHeight / 2 - row * (itemHeight + verticalSpacing);
        }

        if (keepOffset && scrollOffset && this.scrollView.scrollToOffset) {
            this.scrollView.scrollToOffset(scrollOffset, 0);
            return;
        }

        if (this.scrollView.scrollToTop) {
            this.scrollView.scrollToTop(0.1);
        }
    }

    private getItemLayoutSize(item: cc.Node): cc.Size {
        let minX = -item.anchorX * item.width;
        let maxX = minX + item.width;
        let minY = -item.anchorY * item.height;
        let maxY = minY + item.height;

        for (const child of item.children) {
            if (!child.active) continue;
            const box = child.getBoundingBox();
            minX = Math.min(minX, box.x);
            minY = Math.min(minY, box.y);
            maxX = Math.max(maxX, box.x + box.width);
            maxY = Math.max(maxY, box.y + box.height);
        }

        return cc.size(maxX - minX, maxY - minY);
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

        const scrollOffset = this.scrollView && this.scrollView.getScrollOffset
            ? this.scrollView.getScrollOffset()
            : cc.v2(0, 0);
        this.refreshScrollView(true, scrollOffset);
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
        this.node.active = true;
        this.refreshAchievements().catch((error) => {
            console.error('Reload achievement config failed:', error);
        });
    }

    public hide(): void {
        this.node.active = false;
    }
}
