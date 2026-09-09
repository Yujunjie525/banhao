const {ccclass, property} = cc._decorator;
import UserData from '../Game/UserData';
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

    private dailyRewards: OnlineRewardItem[] = [];
    private onlineRewardConfigs: OnlineRewardConfig[] = [];
    private isConfigLoaded = false;
    private loadConfigPromise: Promise<void> | null = null;

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
        if (!UserData.Instance) {
            console.error('UserData Instance is null');
            return;
        }

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

    private updateDailyRewardUI(): void {
        if (!this.dailyPanel) {
            console.error('Daily panel not assigned');
            return;
        }

        const jiemiankuangNode = this.dailyPanel.getChildByName('jiemiankuang');

        for (let i = 0; i < this.dailyRewards.length; i++) {
            const rewardData = this.dailyRewards[i];
            const dayId = i + 1;

            let dayNode = null;
            if (jiemiankuangNode) {
                dayNode = jiemiankuangNode.getChildByName(`day${dayId}`);
            }

            if (!dayNode) {
                dayNode = this.dailyPanel.getChildByName(`day${dayId}`);
            }

            if (!dayNode) {
                continue;
            }

            const labelNode = dayNode.getChildByName('Label');
            if (labelNode) {
                const label = labelNode.getComponent(cc.Label);
                if (label) {
                    label.string = rewardData.name//`${rewardData.time}分钟`;
                }
            }

            const rewardString = `x${rewardData.rewardNum}`;
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
            if (juese1) {
                juese1.getChildByName('num').getComponent(cc.Label).string = rewardString;
            }

            const rewardNode = dayNode.getChildByName('reward');
            const gotNode = dayNode.getChildByName('got');

            if (!rewardNode || !gotNode) {
                continue;
            }

            if (rewardData.isClaimed || rewardData.isAvailable) {
                rewardNode.active = true;
                gotNode.active = false;

                const backgroundNode = rewardNode.getChildByName('Background');
                if (!backgroundNode) {
                    continue;
                }

                const rewardLabel = backgroundNode.getChildByName('Label')?.getComponent(cc.Label);
                if (rewardData.isClaimed) {
                    const spriteComponent = backgroundNode.getComponent(cc.Sprite);
                    if (spriteComponent) {
                        const iconPath = `zImg2/yilingquanniu`;
                        cc.loader.loadRes(iconPath, cc.SpriteFrame, (err, spriteFrame) => {
                            if (err) {
                                console.error(`加载${iconPath}失败:`, err);
                            } else {
                                spriteComponent.spriteFrame = spriteFrame;
                            }
                        });
                    }

                    if (rewardLabel) {
                        rewardLabel.node.active = false;
                    }
                } else if (rewardData.isAvailable) {
                    if (rewardLabel) {
                        rewardLabel.string = `领取`;
                        rewardLabel.node.active = false;
                    }

                    backgroundNode.off(cc.Node.EventType.TOUCH_END);
                    backgroundNode.on(cc.Node.EventType.TOUCH_END, () => this.onClaimClick(rewardData.id), this);
                }
            } else {
                rewardNode.active = false;
                gotNode.active = true;

                const newLabelNode = gotNode.getChildByName('New Label');
                if (newLabelNode) {
                    const label = newLabelNode.getComponent(cc.Label);
                    if (label) {
                        const onlineMinutes = this.getOnlineMinutes();
                        const remainingMinutes = rewardData.requiredMinutes - onlineMinutes;
                        label.string = `${remainingMinutes}分钟后领取`;
                    }
                }
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
        this.updateDailyRewardUI();
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
