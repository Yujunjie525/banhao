import { _decorator, Button, Color, Component, director, instantiate, JsonAsset, Label, Node, Prefab, RichText, ScrollView, Sprite, sys, UITransform, Vec2, Vec3, resources } from 'cc';
import { emits as tipEmits } from '../../scripts/data/enmus';
import { loadPool } from '../../scripts/res/loadPool';
import { localData } from '../data/enums';
import { gameConfig } from '../data/gameConfig';
import { addTotalEarnedGold, load, save } from '../utils/tools';
import OnlineTimeManager from './OnlineTimeManager';

const { ccclass, property } = _decorator;

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
}

@ccclass('AchieveManager')
export default class AchieveManager extends Component {
    @property(Button)
    closeButton: Button = null;

    @property(ScrollView)
    scrollView: ScrollView = null;

    @property(Prefab)
    achieveItemPrefab: Prefab = null;

    private achieves: AchievementItemData[] = [];
    private achieveConfigs: AchievementConfig[] = [];
    private isConfigLoaded = false;
    private loadConfigPromise: Promise<void> | null = null;
    private hasInitializedLayout = false;

    private readonly achieveClaimedKey = 'Achievesclaimed';
    private readonly totalOnlineMinutesKey = 'totalOnlineMinutes';
    private readonly totalConsumedStaminaKey = 'totalConsumedStamina';
    private readonly totalEarnedGoldKey = 'totalEarnedGold';

    protected onLoad(): void {
        if (this.closeButton) {
            this.closeButton.node.on(Node.EventType.TOUCH_END, this.onCloseClick, this);
        }

        this.refreshAchievements().catch((error) => {
            console.error('Load achievement config failed:', error);
        });
    }

    protected onEnable(): void {
        this.refreshAchievements().catch((error) => {
            console.error('Refresh achievement data failed:', error);
        });
    }

    private getUserId() {
        return sys.localStorage.getItem('SLS_USER_ID') || 'default';
    }

    private getKeyWithUserId(baseKey: string) {
        return `${baseKey}_${this.getUserId()}`;
    }

    private getAchieveClaimedList(): number[] {
        const claimedStr = load(this.getKeyWithUserId(this.achieveClaimedKey), 0);
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

    private saveAchieveClaimedList(claimedList: number[]) {
        save(this.getKeyWithUserId(this.achieveClaimedKey), claimedList);
    }

    private loadAchievementConfig(): Promise<void> {
        if (this.isConfigLoaded) {
            return Promise.resolve();
        }

        if (this.loadConfigPromise) {
            return this.loadConfigPromise;
        }

        this.loadConfigPromise = new Promise((resolve, reject) => {
            resources.load('config/achievement', JsonAsset, (err, jsonAsset) => {
                if (err) {
                    reject(err);
                    return;
                }

                const source = jsonAsset && Array.isArray(jsonAsset.json) ? jsonAsset.json : [];
                this.achieveConfigs = source.map((config: any) => ({
                    id: Number(config.id) || 0,
                    icon: String(config.icon || ''),
                    name: String(config.name || ''),
                    desc: String(config.desc || ''),
                    type: String(config.type || ''),
                    count: Number(config.target || config.count) || 0,
                    rewardGold: Number(config.rewardDiamond || config.rewardGold) || 0,
                }));
                this.isConfigLoaded = true;
                resolve();
            });
        });

        return this.loadConfigPromise;
    }

    private initAchieves() {
        this.achieves = [];
        for (let i = 0; i < this.achieveConfigs.length; i++) {
            const config = this.achieveConfigs[i];
            this.achieves.push({
                id: config.id,
                icon: config.icon,
                name: config.name,
                desc: config.desc,
                type: config.type,
                count: config.count,
                rewardGold: config.rewardGold,
                isCompleted: this.checkAchieveCompletion(config),
                isClaimed: this.checkAchieveClaimed(config.id),
            });
        }
    }

    private async refreshAchievements() {
        await this.loadAchievementConfig();
        this.initAchieves();
        this.refreshScrollView();
    }

    private getHighestPassedLevel() {
        return Number(gameConfig.maxJuli || 0);
    }

    private getOnlineMinutes() {
        const totalOnlineMinutes = OnlineTimeManager.getTotalOnlineMinutes();
        if (totalOnlineMinutes > 0) {
            return totalOnlineMinutes;
        }

        const savedTotalOnlineMinutes = load(this.getKeyWithUserId(this.totalOnlineMinutesKey), 1);
        if (savedTotalOnlineMinutes !== null) {
            return Number(savedTotalOnlineMinutes) || 0;
        }

        return Number(load(this.getKeyWithUserId('dailyOnlineMinutes'), 1) || 0);
    }

    private getTotalConsumedStamina() {
        return Number(load(this.getKeyWithUserId(this.totalConsumedStaminaKey), 1) || 0);
    }

    private getTotalEarnedGold() {
        const totalEarnedGold = load(this.getKeyWithUserId(this.totalEarnedGoldKey), 1);
        if (totalEarnedGold !== null) {
            return Number(totalEarnedGold) || 0;
        }

        return Number(gameConfig.jinbiNum || 0);
    }

    private checkAchieveCompletion(achieve: AchievementConfig) {
        switch (achieve.type) {
            case '1':
                return this.getHighestPassedLevel() >= achieve.count;
            case '2':
                return this.getOnlineMinutes() >= achieve.count;
            case '3':
                return this.getTotalEarnedGold() >= achieve.count;
            case '4':
                return this.getTotalConsumedStamina() >= achieve.count;
            default:
                return false;
        }
    }

    private getAchieveProgress(achieve: AchievementConfig) {
        switch (achieve.type) {
            case '1':
                return this.getHighestPassedLevel();
            case '2':
                return this.getOnlineMinutes();
            case '3':
                return this.getTotalEarnedGold();
            case '4':
                return this.getTotalConsumedStamina();
            default:
                return 0;
        }
    }

    private checkAchieveClaimed(achieveId: number) {
        return this.getAchieveClaimedList().indexOf(achieveId) !== -1;
    }

    private markAchieveClaimed(achieveId: number) {
        const claimedList = this.getAchieveClaimedList();
        if (claimedList.indexOf(achieveId) === -1) {
            claimedList.push(achieveId);
            this.saveAchieveClaimedList(claimedList);
        }
    }

    private refreshScrollView() {
        if (!this.scrollView || !this.achieveItemPrefab || !this.scrollView.content) {
            return;
        }

        const shouldPreserveScroll = this.hasInitializedLayout;
        const scrollOffset = shouldPreserveScroll ? this.getCurrentScrollOffset() : null;
        this.scrollView.content.removeAllChildren();
        this.achieves.sort((a, b) => a.id - b.id);

        for (let i = 0; i < this.achieves.length; i++) {
            const achieveItem = instantiate(this.achieveItemPrefab);
            this.scrollView.content.addChild(achieveItem);
            this.setAchieveItemData(achieveItem, this.achieves[i]);
        }

        this.adjustContainerSize();
        this.restoreScrollPosition(scrollOffset, !this.hasInitializedLayout);
        this.hasInitializedLayout = true;
    }

    private getCurrentScrollOffset() {
        if (!this.scrollView) {
            return null;
        }

        const offset = this.scrollView.getScrollOffset();
        return new Vec2(offset.x, offset.y);
    }

    private restoreScrollPosition(offset: Vec2 | null, scrollToTop: boolean) {
        if (!this.scrollView) {
            return;
        }

        if (offset) {
            this.scrollView.scrollToOffset(offset, 0);
            return;
        }

        if (scrollToTop) {
            this.scrollView.scrollToTop(0.1);
        }
    }

    private setAchieveItemData(achieveItem: Node, achieveData: AchievementItemData) {
        const nameNode = achieveItem.getChildByName('name');
        const descriptionNode = achieveItem.getChildByName('description');
        const rewardNode = achieveItem.getChildByName('reward');
        const claimButtonNode = achieveItem.getChildByName('claimButton');
        const claimedNode = achieveItem.getChildByName('claimed');
        const claimButton = claimButtonNode ? claimButtonNode.getComponent(Button) : null;

        this.setLabelText(nameNode, achieveData.name);

        if (descriptionNode) {
            const currentProgress = this.getAchieveProgress(achieveData);
            const targetProgress = achieveData.count;
            const isCompleted = this.checkAchieveCompletion(achieveData);
            const richText = descriptionNode.getComponent(RichText);
            if (richText) {
                const progressColor = isCompleted ? '#00ff00' : '#ff0000';
                richText.string = `${achieveData.desc}\n<color=${progressColor}>(${currentProgress}/${targetProgress})</color>。`;
            } else {
                this.setLabelText(descriptionNode, `${achieveData.desc}\n(${currentProgress}/${targetProgress})`);
            }
        }

        if (rewardNode) {
            this.setLabelText(rewardNode.getChildByName('cost'), `x${achieveData.rewardGold}`);
        }

        if (!claimButton || !claimButtonNode) {
            return;
        }

        claimButtonNode.off(Node.EventType.TOUCH_END);

        if (achieveData.isClaimed) {
            claimButtonNode.active = false;
            if (claimedNode) {
                claimedNode.active = true;
            }
            return;
        }

        claimButtonNode.active = true;
        if (claimedNode) {
            claimedNode.active = false;
        }

        claimButton.interactable = achieveData.isCompleted;
        this.setClaimButtonState(claimButtonNode, achieveData.isCompleted);
        if (achieveData.isCompleted) {
            claimButtonNode.on(Node.EventType.TOUCH_END, () => this.onClaimClick(achieveData.id), this);
        }
    }

    private setClaimButtonState(node: Node, enabled: boolean) {
        const buttonSprite = node.getComponent(Sprite);
        if (buttonSprite) {
            buttonSprite.color = enabled ? Color.WHITE : new Color(100, 100, 100, 255);
        }

        const labelNode = node.getChildByName('Label');
        const label = labelNode?.getComponent(Label);
        if (label) {
            label.color = enabled ? Color.WHITE : new Color(140, 140, 140, 255);
        }
    }

    private setLabelText(node: Node, text: string) {
        if (!node) {
            return;
        }
        const label = node.getComponent(Label);
        if (label) {
            label.string = text;
        }
    }

    private adjustContainerSize() {
        if (!this.scrollView || !this.scrollView.content) {
            return;
        }

        const container = this.scrollView.content;
        const children = container.children;
        if (children.length === 0) {
            return;
        }

        const itemTransform = children[0].getComponent(UITransform);
        const view = this.scrollView.node.getChildByName('view');
        const viewTransform = view ? view.getComponent(UITransform) : null;
        const containerTransform = container.getComponent(UITransform);
        if (!itemTransform || !viewTransform || !containerTransform) {
            return;
        }

        const itemWidth = itemTransform.width; // 从编辑器获取实际的列表项宽度
        const itemHeight = itemTransform.height;
        const horizontalSpacing = 60; // 两个列表项之间的间隔（可调整）
        const verticalSpacing = 0;
        const yPadding = 0;
        
        // 确保两个列表项加间隔的总宽度不超过滚动列表宽度
        const maxRowWidth = viewTransform.width;
        const calculatedSpacing = maxRowWidth - (itemWidth * 2);
        const actualHorizontalSpacing = Math.min(horizontalSpacing, calculatedSpacing); // 使用设置的间距，但不超过计算的最大间距
        
        const itemsPerRow = 2;
        const rowCount = Math.ceil(children.length / itemsPerRow);
        const totalHeight = rowCount * itemHeight + (rowCount - 1) * verticalSpacing + 2 * yPadding;

        containerTransform.setContentSize(viewTransform.width, totalHeight);

        // 考虑容器锚点为(0.5, 1)的情况，调整坐标计算
        for (let i = 0; i < children.length; i++) {
            const child = children[i];
            const row = Math.floor(i / itemsPerRow);
            const col = i % itemsPerRow;
            
            // 计算相对于容器中心的坐标，使用实际的水平间距
            const x = (col * (itemWidth + actualHorizontalSpacing)) - (viewTransform.width / 2) + itemWidth / 2 + 30;
            const y = - (row * (itemHeight + verticalSpacing)) - yPadding - itemHeight / 2;
            
            child.setPosition(new Vec3(x, y, 0));
            const childTransform = child.getComponent(UITransform);
            if (childTransform) {
                childTransform.anchorX = 0.5;
                childTransform.anchorY = 0.5;
            }
        }

    }

    private onClaimClick(achieveId: number) {
        let achieve: AchievementItemData = null;
        for (let i = 0; i < this.achieves.length; i++) {
            if (this.achieves[i].id === achieveId) {
                achieve = this.achieves[i];
                break;
            }
        }

        if (!achieve || !achieve.isCompleted || achieve.isClaimed) {
            return;
        }

        this.giveReward(achieve);
        achieve.isClaimed = true;
        this.markAchieveClaimed(achieveId);
        this.refreshScrollView();
        this.showToast(`获得${achieve.rewardGold}勋章。`);
    }

    private giveReward(achieve: AchievementItemData) {
        if (achieve.rewardGold <= 0) {
            return;
        }

        gameConfig.jinbiNum += achieve.rewardGold;
        save(localData.jinbiNum, gameConfig.jinbiNum);
        addTotalEarnedGold(achieve.rewardGold);
    }

    private onCloseClick() {
        this.node.active = false;
    }

    private showToast(message: string) {
        loadPool.ins.getPoolNode('tips', this.node);
        director.emit(tipEmits.tipMsg, message);
    }

    public show() {
        this.node.active = true;
        this.refreshAchievements().catch((error) => {
            console.error('Reload achievement config failed:', error);
        });
    }

    public hide() {
        this.node.active = false;
    }
}
