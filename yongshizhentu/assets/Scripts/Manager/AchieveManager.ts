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
                    desc: `${config.desc || ''}`.trim(),
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
        this.refreshScrollView();
    }

    private getBestDistance(): number {
        const userId = this.getUserId();
        const scopedKey = userId ? `WarriorRunBestDistance_${userId}` : 'WarriorRunBestDistance';
        const raw = cc.sys.localStorage.getItem(scopedKey) || cc.sys.localStorage.getItem('WarriorRunBestDistance');
        return Math.max(0, Number(raw) || 0);
    }

    private getOnlineMinutes(): number {
        return UserDataSyncManager.getStoredNumber(this.dailyOnlineMinutesKey, 0);
    }

    private checkAchieveCompletion(achieve: AchievementConfig): boolean {
        switch (achieve.type) {
            case '1':
                return this.getBestDistance() >= achieve.count;
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
                return this.getBestDistance();
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

    private refreshScrollView(): void {
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

        this.adjustContainerSize();
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
                cc.loader.loadRes('2main/zuanshi', cc.SpriteFrame, (err: Error, spriteFrame: cc.SpriteFrame) => {
                    if (!err && spriteFrame && iconNode.isValid) {
                        spriteComponent.spriteFrame = spriteFrame;
                    }
                });
            }
        }

        if (nameNode) {
            const label = nameNode.getComponent(cc.Label);
            if (label) {
                label.string = achieveData.name;
                label.fontSize = 28;
                label.lineHeight = 34;
                label.horizontalAlign = cc.Label.HorizontalAlign.CENTER;
                nameNode.color = cc.Color.WHITE;
            }
        }

        if (descriptionNode) {
            const richText = descriptionNode.getComponent(cc.RichText);
            if (richText) {
                this.setDescriptionText(richText, achieveData);
            }
        }

        if (rewardNode) {
            const costNode = rewardNode.getChildByName('cost');
            const costLabel = costNode ? costNode.getComponent(cc.Label) : null;
            if (costLabel) {
                costLabel.string = `${achieveData.rewardGold}`;
                costLabel.fontSize = 28;
                costLabel.lineHeight = 34;
                costNode.color = cc.color(255, 241, 183);
            }
        }

        if (claimButton && this.claimHandler) {
            claimButton.node.off(cc.Node.EventType.TOUCH_END);
            claimButton.node.opacity = 255;
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
                claimButton.node.opacity = 185;
            }
        }
    }

    private setDescriptionText(richText: cc.RichText, achieveData: AchievementItemData): void {
        const currentProgress = achieveData.currentProgress || 0;
        const progressColor = achieveData.isCompleted ? '#00FF33' : '#E60000';
        const progressText = `(${currentProgress}/${achieveData.count})。`;

        richText.fontSize = 20;
        richText.lineHeight = 22;
        richText.maxWidth = 206;
        richText.horizontalAlign = cc.macro.TextAlignment.LEFT;
        richText.string = `${achieveData.desc}<color=${progressColor}>${progressText}</color>`;

        // RichText does not create line segments while its parent panel is inactive.
        const richTextInternals = richText as any;
        if (richText.enabledInHierarchy && typeof richTextInternals._updateRichText === 'function') {
            richTextInternals._updateRichText();
        }
        const labelSegments = (richTextInternals._labelSegments || []) as cc.Node[];
        const lastLine = labelSegments.length > 0
            ? (labelSegments[labelSegments.length - 1] as any)._lineCount
            : 0;
        const lastLineText = labelSegments
            .filter(segment => (segment as any)._lineCount === lastLine)
            .map(segment => {
                const label = segment.getComponent(cc.Label);
                return label ? label.string : '';
            })
            .join('');

        if (lastLineText === '。') {
            richText.string = `${achieveData.desc}\n<color=${progressColor}>${progressText}</color>`;
            if (typeof richTextInternals._updateRichText === 'function') {
                richTextInternals._updateRichText();
            }
        }
    }

    private refreshDescriptionWrapping(): void {
        if (!this.scrollView || !this.scrollView.content) {
            return;
        }

        this.scrollView.content.children.forEach((achieveItem, index) => {
            const achieveData = this.achieves[index];
            const descriptionNode = achieveItem.getChildByName('description');
            const richText = descriptionNode ? descriptionNode.getComponent(cc.RichText) : null;
            if (achieveData && richText) {
                this.setDescriptionText(richText, achieveData);
            }
        });
    }

    private adjustContainerSize(): void {
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
        const itemWidth = item.width || 243;
        const itemHeight = item.height || 278;

        const view = this.scrollView.node.getChildByName('view');
        if (!view) {
            console.error('view node not found');
            return;
        }
        const columns = 2;
        const columnSpacing = 24;
        const rowSpacing = 24;
        const topPadding = 8;
        const bottomPadding = 24;
        const viewWidth = Math.max(view.width, columns * itemWidth + columnSpacing);
        const rows = Math.ceil(children.length / columns);
        const totalHeight = rows * itemHeight + Math.max(0, rows - 1) * rowSpacing + topPadding + bottomPadding;

        container.width = viewWidth;
        container.height = Math.max(view.height, totalHeight);

        container.anchorX = 0.5;
        container.anchorY = 1;

        const startX = -((columns - 1) * (itemWidth + columnSpacing)) / 2;
        for (let i = 0; i < children.length; i++) {
            const child = children[i];
            const col = i % columns;
            const row = Math.floor(i / columns);
            child.x = startX + col * (itemWidth + columnSpacing);
            child.y = -topPadding - itemHeight / 2 - row * (itemHeight + rowSpacing);
        }

        if (this.scrollView.scrollToTop) {
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

        this.refreshScrollView();
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
        if (!this.claimHandler) {
            this.claimHandler = (achieveId: number) => this.onClaimClick(achieveId);
        }
        this.refreshAchievements().then(() => {
            this.node.active = true;
            this.scheduleOnce(() => this.refreshDescriptionWrapping(), 0);
        }).catch((error) => {
            console.error('Reload achievement config failed:', error);
            this.node.active = true;
        });
    }

    public hide(): void {
        this.node.active = false;
    }
}
