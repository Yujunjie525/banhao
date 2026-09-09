import { _decorator, Button, Component, director, instantiate, JsonAsset, Label, Node, Prefab, ScrollView, Sprite, SpriteFrame, sys, UITransform, Vec2, Vec3, resources } from 'cc';
import { emits } from '../../scripts/data/enmus';
import { loadPool } from '../../scripts/res/loadPool';
import { gameConfig } from '../data/gameConfig';
import { addTotalEarnedGold, load, save } from '../utils/tools';
import OnlineTimeManager from './OnlineTimeManager';

const { ccclass, property } = _decorator;

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

@ccclass('DailyRewardManager')
export default class DailyRewardManager extends Component {
    @property(Button)
    closeButton: Button = null;

    @property(ScrollView)
    scrollView: ScrollView = null;

    @property(Prefab)
    dailyItemPrefab: Prefab = null;

    private dailyRewards: OnlineRewardItem[] = [];
    private onlineRewardConfigs: OnlineRewardConfig[] = [];
    private isConfigLoaded = false;
    private loadConfigPromise: Promise<void> | null = null;
    private todayDate = '';
    private hasInitializedLayout = false;
    private lastRenderedOnlineMinutes = -1;
    private gotSpriteFrameCache = new Map<string, SpriteFrame>();

    private readonly dailyRewardDateKey = 'dailyRewardDate';
    private readonly dailyRewardClaimedKey = 'dailyRewardClaimed';
    private readonly dailyOnlineMinutesKey = 'dailyOnlineMinutes';
    private readonly claimedButtonSpritePath = 'UI/ZImg/anniuyilingqu/spriteFrame';
    private readonly lockedButtonSpritePath = 'UI/ZImg/anniuyuanshi/spriteFrame';

    protected onLoad(): void {
        if (this.closeButton) {
            this.closeButton.node.on(Node.EventType.TOUCH_END, this.onCloseClick, this);
        }

        this.loadOnlineRewardConfig().then(() => {
            this.initDailyRewards();
            this.refreshScrollView();
            this.schedule(this.updateDailyRewardsStatus, 1);
        }).catch((error) => {
            console.error('Load online reward config failed:', error);
        });
    }

    protected onEnable(): void {
        this.loadOnlineRewardConfig().then(() => {
            this.initDailyRewards();
            this.refreshScrollView();
        }).catch((error) => {
            console.error('Refresh daily reward data failed:', error);
        });
    }

    protected onDestroy(): void {
        this.unscheduleAllCallbacks();
    }

    private getUserId(): string {
        return sys.localStorage.getItem('SLS_USER_ID') || 'default';
    }

    private getKeyWithUserId(baseKey: string) {
        return `${baseKey}_${this.getUserId()}`;
    }

    private getClaimedRewards(): number[] {
        const claimedKey = this.getKeyWithUserId(this.dailyRewardClaimedKey);
        const claimedStr = load(claimedKey, 0);
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

    private saveClaimedRewards(claimedList: number[]) {
        save(this.getKeyWithUserId(this.dailyRewardClaimedKey), claimedList);
    }

    private loadOnlineRewardConfig(): Promise<void> {
        if (this.isConfigLoaded) {
            return Promise.resolve();
        }

        if (this.loadConfigPromise) {
            return this.loadConfigPromise;
        }

        this.loadConfigPromise = new Promise((resolve, reject) => {
            resources.load('config/onlineReward', JsonAsset, (err, jsonAsset) => {
                if (err) {
                    reject(err);
                    return;
                }

                const source = jsonAsset && Array.isArray(jsonAsset.json) ? jsonAsset.json : [];
                this.onlineRewardConfigs = source.map((config: any) => ({
                    id: Number(config.id) || 0,
                    time: Number(config.time) || 0,
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

    private initDailyRewards() {
        this.dailyRewards = [];
        this.updateTodayDate();
        this.checkNewDay();
        const onlineMinutes = this.getOnlineMinutes();
        this.lastRenderedOnlineMinutes = onlineMinutes;

        for (let i = 0; i < this.onlineRewardConfigs.length; i++) {
            const config = this.onlineRewardConfigs[i];
            const isClaimed = this.checkRewardClaimed(config.id);
            this.dailyRewards.push({
                id: config.id,
                time: config.time,
                name: config.name,
                desc: config.desc,
                icon: config.icon,
                rewardId: config.rewardId,
                rewardNum: config.rewardNum,
                isClaimed,
                isAvailable: !isClaimed && onlineMinutes >= config.time,
                requiredMinutes: config.time,
            });
        }
    }

    private updateTodayDate() {
        const today = new Date();
        this.todayDate = `${today.getFullYear()}-${this.twoDigits(today.getMonth() + 1)}-${this.twoDigits(today.getDate())}`;
    }

    private twoDigits(value: number) {
        return value < 10 ? `0${value}` : `${value}`;
    }

    private checkNewDay() {
        const rewardDateKey = this.getKeyWithUserId(this.dailyRewardDateKey);
        const todayDate = load(rewardDateKey, 0);
        if (!todayDate || todayDate !== this.todayDate) {
            save(rewardDateKey, this.todayDate);
            this.saveClaimedRewards([]);
            save(this.getKeyWithUserId(this.dailyOnlineMinutesKey), 0);
        }
    }

    private getOnlineMinutes() {
        return OnlineTimeManager.getTodayOnlineMinutes();
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

    private giveReward(reward: OnlineRewardItem) {
        if (reward.rewardNum <= 0) {
            return;
        }

        gameConfig.jinbiNum += reward.rewardNum;
        save('jinbiNum', gameConfig.jinbiNum);
        addTotalEarnedGold(reward.rewardNum);
    }

    private updateDailyRewardsStatus = () => {
        if (!this.node.activeInHierarchy) {
            return;
        }

        const onlineMinutes = this.getOnlineMinutes();
        let changed = onlineMinutes !== this.lastRenderedOnlineMinutes;
        for (let i = 0; i < this.dailyRewards.length; i++) {
            const reward = this.dailyRewards[i];
            const nextAvailable = !reward.isClaimed && onlineMinutes >= reward.requiredMinutes;
            if (reward.isAvailable !== nextAvailable) {
                reward.isAvailable = nextAvailable;
                changed = true;
            }
        }

        if (changed) {
            this.lastRenderedOnlineMinutes = onlineMinutes;
            this.refreshScrollView();
        }
    };

    private refreshScrollView() {
        if (!this.scrollView || !this.dailyItemPrefab || !this.scrollView.content) {
            console.error('DailyRewardManager ScrollView or DailyItem Prefab not set.');
            return;
        }

        const shouldPreserveScroll = this.hasInitializedLayout;
        const scrollOffset = shouldPreserveScroll ? this.getCurrentScrollOffset() : null;
        const container = this.scrollView.content;
        container.removeAllChildren();

        for (let i = 0; i < this.dailyRewards.length; i++) {
            const dailyItem = instantiate(this.dailyItemPrefab);
            container.addChild(dailyItem);
            this.setDailyItemData(dailyItem, this.dailyRewards[i]);
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

    private setDailyItemData(dailyItem: Node, rewardData: OnlineRewardItem) {
        this.setLabelText(dailyItem.getChildByName('Label'), rewardData.name);
        this.setLabelText(dailyItem.getChildByName('description'), rewardData.desc);

        const rewardString = `x${rewardData.rewardNum}`;
        const juese1 = dailyItem.getChildByName('juese1');
        if (juese1) {
            this.setLabelText(juese1.getChildByName('num'), rewardString);
        }

        const rewardNode = dailyItem.getChildByName('reward');
        const gotNode = dailyItem.getChildByName('got');
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
            const onlineMinutes = this.getOnlineMinutes();
            const remainingMinutes = Math.max(0, rewardData.requiredMinutes - onlineMinutes);
            this.setNodeSpriteFromResources(gotNode, this.lockedButtonSpritePath);
            this.setLabelText(gotLabelNode, `${remainingMinutes}分钟可领取`);
        }

        const iconNode = dailyItem.getChildByName('icon');
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
        const transform = node.getComponent(UITransform);
        if (!sprite || !transform) {
            return;
        }

        // 保存原始大小，防止加载不同 SpriteFrame 后尺寸变化
        const originalWidth = transform.width;
        const originalHeight = transform.height;

        this.loadSpriteFrame(resourcePath, (spriteFrame) => {
            if (spriteFrame && node.isValid) {
                sprite.spriteFrame = spriteFrame;
                // 强制恢复原始大小
                transform.setContentSize(originalWidth, originalHeight);
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

        const itemHeight = itemTransform.height;
        const verticalSpacing = 20;
        const yPadding = 10;
        const totalHeight = children.length * itemHeight + (children.length - 1) * verticalSpacing + 2 * yPadding;

        containerTransform.setContentSize(viewTransform.width, totalHeight);

        for (let i = 0; i < children.length; i++) {
            const child = children[i];
            child.setPosition(new Vec3(0, -yPadding - itemHeight / 2 - i * (itemHeight + verticalSpacing), 0));
        }
    }

    private onClaimClick(rewardId: number) {
        let reward: OnlineRewardItem = null;
        for (let i = 0; i < this.dailyRewards.length; i++) {
            if (this.dailyRewards[i].id === rewardId) {
                reward = this.dailyRewards[i];
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
        this.showToast(`获得${reward.rewardNum}金币。`);
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
        this.loadOnlineRewardConfig().then(() => {
            this.initDailyRewards();
            this.refreshScrollView();
        }).catch((error) => {
            console.error('Reload online reward config failed:', error);
        });
    }

    public hide() {
        this.node.active = false;
    }

    public getCurrentOnlineMinutes() {
        return this.getOnlineMinutes();
    }
}
