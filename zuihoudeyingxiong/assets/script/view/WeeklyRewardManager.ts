import { _decorator, Button, Component, director, instantiate, JsonAsset, Label, Node, Prefab, ScrollView, Sprite, SpriteFrame, sys, UITransform, Vec2, Vec3, resources } from 'cc';
import { emits } from '../../scripts/data/enmus';
import { loadPool } from '../../scripts/res/loadPool';
import { gameConfig } from '../data/gameConfig';
import { addTotalEarnedGold, load, save } from '../utils/tools';

const { ccclass, property } = _decorator;

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

@ccclass('WeeklyRewardManager')
export default class WeeklyRewardManager extends Component {
    @property(Button)
    closeButton: Button = null;

    @property(ScrollView)
    scrollView: ScrollView = null;

    @property(Prefab)
    weekItemPrefab: Prefab = null;

    private weeklyRewards: WeeklyRewardItem[] = [];
    private weeklyRewardConfigs: WeeklyRewardConfig[] = [];
    private isConfigLoaded = false;
    private loadConfigPromise: Promise<void> | null = null;
    private weekStartDate = '';
    private hasInitializedLayout = false;
    private gotSpriteFrameCache = new Map<string, SpriteFrame>();

    private readonly weeklyRewardWeekStartKey = 'weeklyRewardWeekStart';
    private readonly weeklyRewardClaimedKey = 'weeklyRewardClaimed';
    private readonly claimedButtonSpritePath = 'UI/AImg/yilingqu/spriteFrame';
    private readonly lockedButtonSpritePath = 'UI/AImg/anniu/spriteFrame';

    protected onLoad(): void {
        if (this.closeButton) {
            this.closeButton.node.on(Node.EventType.TOUCH_END, this.onCloseClick, this);
        }

        this.refreshWeeklyRewards().catch((error) => {
            console.error('Load weekly reward config failed:', error);
        });
    }

    protected onEnable(): void {
        this.refreshWeeklyRewards().catch((error) => {
            console.error('Refresh weekly reward data failed:', error);
        });
    }

    private getUserId() {
        return sys.localStorage.getItem('SLS_USER_ID') || 'default';
    }

    private getKeyWithUserId(baseKey: string) {
        return `${baseKey}_${this.getUserId()}`;
    }

    private getClaimedRewards(): number[] {
        const claimedStr = load(this.getKeyWithUserId(this.weeklyRewardClaimedKey), 0);
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

    private saveClaimedRewards(claimedList: number[]) {
        save(this.getKeyWithUserId(this.weeklyRewardClaimedKey), claimedList);
    }

    private loadWeeklyRewardConfig(): Promise<void> {
        if (this.isConfigLoaded) {
            return Promise.resolve();
        }

        if (this.loadConfigPromise) {
            return this.loadConfigPromise;
        }

        this.loadConfigPromise = new Promise((resolve, reject) => {
            resources.load('config/weekReward', JsonAsset, (err, jsonAsset) => {
                if (err) {
                    reject(err);
                    return;
                }

                const source = jsonAsset && Array.isArray(jsonAsset.json) ? jsonAsset.json : [];
                this.weeklyRewardConfigs = source.map((config: any) => ({
                    id: Number(config.id) || 0,
                    name: String(config.name || ''),
                    desc: String(config.desc || ''),
                    icon: Number(config.icon) || 0,
                    rewardId: Number(config.rewardId) || 0,
                    rewardNum: Number(config.rewardNum) || 0,
                }));
                this.isConfigLoaded = true;
                resolve();
            });
        });

        return this.loadConfigPromise;
    }

    private async refreshWeeklyRewards() {
        await this.loadWeeklyRewardConfig();
        this.initWeeklyRewards();
        this.refreshScrollView();
    }

    private initWeeklyRewards() {
        this.weeklyRewards = [];
        this.updateWeekStartDate();
        this.checkNewWeek();

        const today = new Date();
        const dayOfWeek = today.getDay() || 7;

        for (let i = 0; i < this.weeklyRewardConfigs.length; i++) {
            const config = this.weeklyRewardConfigs[i];
            this.weeklyRewards.push({
                id: config.id,
                name: config.name,
                desc: config.desc,
                icon: config.icon,
                rewardId: config.rewardId,
                rewardNum: config.rewardNum,
                isClaimed: this.checkRewardClaimed(config.id),
                isAvailable: config.id === dayOfWeek,
                isMissed: config.id < dayOfWeek && !this.checkRewardClaimed(config.id),
                daysUntilAvailable: Math.max(0, config.id - dayOfWeek),
            });
        }
    }

    private updateWeekStartDate() {
        const today = new Date();
        const dayOfWeek = today.getDay() || 7;
        const weekStart = new Date(today.getTime());
        weekStart.setDate(today.getDate() - (dayOfWeek - 1));
        this.weekStartDate = `${weekStart.getFullYear()}-${this.twoDigits(weekStart.getMonth() + 1)}-${this.twoDigits(weekStart.getDate())}`;
    }

    private twoDigits(value: number) {
        return value < 10 ? `0${value}` : `${value}`;
    }

    private checkNewWeek() {
        const weekStartKey = this.getKeyWithUserId(this.weeklyRewardWeekStartKey);
        const currentWeekStart = load(weekStartKey, 0);
        if (!currentWeekStart || currentWeekStart !== this.weekStartDate) {
            save(weekStartKey, this.weekStartDate);
            this.saveClaimedRewards([]);
        }
    }

    private checkRewardClaimed(rewardId: number) {
        return this.getClaimedRewards().indexOf(rewardId) !== -1;
    }

    private markRewardClaimed(rewardId: number) {
        const claimedList = this.getClaimedRewards();
        if (claimedList.indexOf(rewardId) === -1) {
            claimedList.push(rewardId);
            this.saveClaimedRewards(claimedList);
        }
    }

    private giveReward(reward: WeeklyRewardItem) {
        if (reward.rewardNum <= 0) {
            return;
        }

        gameConfig.jinbiNum += reward.rewardNum;
        save('jinbiNum', gameConfig.jinbiNum);
        addTotalEarnedGold(reward.rewardNum);
    }

    private refreshScrollView() {
        if (!this.scrollView || !this.weekItemPrefab || !this.scrollView.content) {
            console.error('WeeklyRewardManager ScrollView or WeekItem Prefab not set.');
            return;
        }

        const shouldPreserveScroll = this.hasInitializedLayout;
        const scrollOffset = shouldPreserveScroll ? this.getCurrentScrollOffset() : null;
        const container = this.scrollView.content;
        container.removeAllChildren();

        for (let i = 0; i < this.weeklyRewards.length; i++) {
            const weekItem = instantiate(this.weekItemPrefab);
            container.addChild(weekItem);
            this.setWeekItemData(weekItem, this.weeklyRewards[i]);
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

    private setWeekItemData(weekItem: Node, rewardData: WeeklyRewardItem) {
        this.setLabelText(weekItem.getChildByName('Label'), rewardData.name);
        this.setLabelText(weekItem.getChildByName('description'), rewardData.desc);

        const rewardString = `x${rewardData.rewardNum}`;
        const juese1 = weekItem.getChildByName('juese1');
        if (juese1) {
            this.setLabelText(juese1.getChildByName('num'), rewardString);
        }

        const rewardNode = weekItem.getChildByName('reward');
        const gotNode = weekItem.getChildByName('got');
        if (!rewardNode || !gotNode) {
            return;
        }

        const gotLabelNode = gotNode.getChildByName('Label');
        rewardNode.off(Node.EventType.TOUCH_END);

        if (rewardData.isClaimed) {
            rewardNode.active = false;
            gotNode.active = true;
            if (gotLabelNode) {
                gotLabelNode.active = false;
            }
            this.setNodeSpriteFromResources(gotNode, this.claimedButtonSpritePath);
        } else if (rewardData.isMissed) {
            rewardNode.active = true;
            gotNode.active = false;
            this.setLabelText(rewardNode.getChildByName('Label'), '领取');
            // 设置 Grayscale 置灰
            const rewardSprite = rewardNode.getComponent(Sprite);
            if (rewardSprite) {
                rewardSprite.grayscale = true;
            }
            // 不绑定点击事件，使其无法点击
        } else if (rewardData.isAvailable) {
            rewardNode.active = true;
            gotNode.active = false;
            this.setLabelText(rewardNode.getChildByName('Label'), '领取');
            rewardNode.on(Node.EventType.TOUCH_END, () => this.onClaimClick(rewardData.id), this);
        } else {
            rewardNode.active = false;
            gotNode.active = true;
            if (gotLabelNode) {
                gotLabelNode.active = true;
            }
            this.setNodeSpriteFromResources(gotNode, this.lockedButtonSpritePath);
            this.setLabelText(gotLabelNode, `${rewardData.daysUntilAvailable}天后可领取`);
        }

        const iconNode = weekItem.getChildByName('icon');
        if (iconNode) {
            const iconSprite = iconNode.getComponent(Sprite);
            if (iconSprite) {
                resources.load(`zImg2/${rewardData.icon}`, SpriteFrame, (err, spriteFrame) => {
                    if (!err && spriteFrame) {
                        iconSprite.spriteFrame = spriteFrame;
                    }
                });
            }
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

    private setNodeSpriteFromResources(node: Node, resourcePath: string) {
        const sprite = node.getComponent(Sprite);
        if (!sprite) {
            return;
        }

        this.loadSpriteFrame(resourcePath, (spriteFrame) => {
            if (spriteFrame && node.isValid) {
                sprite.spriteFrame = spriteFrame;
            }
        });
    }

    private loadSpriteFrame(resourcePath: string, onLoaded: (spriteFrame: SpriteFrame | null) => void) {
        const cachedSpriteFrame = this.gotSpriteFrameCache.get(resourcePath);
        if (cachedSpriteFrame) {
            onLoaded(cachedSpriteFrame);
            return;
        }

        const candidatePaths = [resourcePath];
        if (resourcePath.endsWith('/spriteFrame')) {
            candidatePaths.push(resourcePath.replace('/spriteFrame', ''));
        } else {
            candidatePaths.push(`${resourcePath}/spriteFrame`);
        }

        const tryLoad = (index: number) => {
            if (index >= candidatePaths.length) {
                console.error(`Load sprite frame failed: ${resourcePath}`);
                onLoaded(null);
                return;
            }

            const currentPath = candidatePaths[index];
            resources.load(currentPath, SpriteFrame, (err, spriteFrame) => {
                if (err || !spriteFrame) {
                    tryLoad(index + 1);
                    return;
                }

                this.gotSpriteFrameCache.set(resourcePath, spriteFrame);
                this.gotSpriteFrameCache.set(currentPath, spriteFrame);
                onLoaded(spriteFrame);
            });
        };

        tryLoad(0);
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

        const itemWidth = itemTransform.width;
        const itemHeight = itemTransform.height;
        const verticalSpacing = 20;
        const yPadding = 10;
        const totalHeight = children.length * itemHeight + (children.length - 1) * verticalSpacing + 2 * yPadding;

        containerTransform.setContentSize(viewTransform.width, totalHeight);

        for (let i = 0; i < children.length; i++) {
            const child = children[i];
            child.setPosition(new Vec3(-10, -yPadding - itemHeight / 2 - i * (itemHeight + verticalSpacing), 0));
        }

    }

    private onClaimClick(rewardId: number) {
        let reward: WeeklyRewardItem = null;
        for (let i = 0; i < this.weeklyRewards.length; i++) {
            if (this.weeklyRewards[i].id === rewardId) {
                reward = this.weeklyRewards[i];
                break;
            }
        }

        if (!reward || !reward.isAvailable || reward.isClaimed) {
            return;
        }

        this.giveReward(reward);
        reward.isClaimed = true;
        this.markRewardClaimed(rewardId);
        this.refreshScrollView();
        this.showToast(`获得${reward.rewardNum}勋章。`);
    }

    private onCloseClick() {
        this.node.active = false;
    }

    private showToast(message: string) {
        loadPool.ins.getPoolNode('tips', this.node);
        director.emit(emits.tipMsg, message);
    }

    public show() {
        this.node.active = true;
        this.refreshWeeklyRewards().catch((error) => {
            console.error('Reload weekly reward config failed:', error);
        });
    }

    public hide() {
        this.node.active = false;
    }
}
